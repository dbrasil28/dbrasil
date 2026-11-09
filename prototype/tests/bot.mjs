// Bot simples para simulações headless: foge do centro de massa dos inimigos próximos
// e circula; escolhe melhorias com uma política fixa.
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { routeTarget, deliveryPoint } from '../src/mundo.js';

const rtBot = { x: 0, y: 0 };

// Opções do bot (o relatório de balanceamento desliga o desvio para comparar).
export const BOT = { dodge: true, revive: false, goalPull: 2.4, superPerto: 6 };

export function botInput(game) {
  const p = game.player;
  let cx = 0;
  let cy = 0;
  let n = 0;
  let perto = 0; // quantos estão a menos de 5 m (para a super da relíquia, D67)
  let chefe = false;
  for (const e of game.enemies) {
    if (e.dmg <= 0) continue;
    const d2 = (e.x - p.x) ** 2 + (e.y - p.y) ** 2;
    if (d2 < 25) {
      perto++;
      if (e.boss) chefe = true;
    }
    if (d2 < 36) {
      const w = 1 / Math.max(0.5, d2);
      cx += (e.x - p.x) * w;
      cy += (e.y - p.y) * w;
      n += w;
    }
  }
  // super cheia: usa no aperto (muita gente perto, ou o chefão do lado)
  const apertado = perto >= BOT.superPerto || chefe || (perto >= 3 && p.hp < game.stats.maxHp * 0.4);
  if (apertado && game.superPronta && game.superPronta()) game.pedirSuper();
  // desviar das papeladas do Burocrata (perpendicular à trajetória)
  for (const s of BOT.dodge ? game.enemyShots : []) {
    const dx = p.x - s.x;
    const dy = p.y - s.y;
    const d2 = dx * dx + dy * dy;
    if (d2 > 9) continue;
    const sp = Math.hypot(s.vx, s.vy) || 1;
    if ((dx * s.vx + dy * s.vy) / sp < 0) continue; // já passou
    const side = dx * -s.vy + dy * s.vx >= 0 ? 1 : -1;
    const w = 3 / Math.max(0.3, d2);
    cx -= (-s.vy / sp) * side * w * 2;
    cy -= (s.vx / sp) * side * w * 2;
    n += w;
  }
  // sair da linha vermelha de mira (traficantes e o Chefe travam o alvo antes de atirar), como uma pessoa faz
  for (const e of BOT.dodge ? game.enemies : []) {
    if (e.dead || !(e.aimT > 0 || e.burst > 0) || e.ax === undefined) continue;
    const lx = e.ax - e.x;
    const ly = e.ay - e.y;
    const ll = Math.hypot(lx, ly) || 1;
    const qx = p.x - e.x;
    const qy = p.y - e.y;
    if ((qx * lx + qy * ly) / ll < 0 || qx * qx + qy * qy > 16 * 16) continue; // atrás de quem atira, ou longe
    const lado = (qx * -ly + qy * lx) / ll; // distância até a linha, com sinal
    if (Math.abs(lado) > 1.6) continue;
    const sgn = lado >= 0 ? 1 : -1;
    cx -= (-ly / ll) * sgn * 6;
    cy -= (lx / ll) * sgn * 6;
    n += 2;
  }
  // golpes do Monstrão: sai da faixa e do círculo do aviso; no anel de choque, procura a brecha
  for (const a of BOT.dodge ? game.avisosChao || [] : []) {
    if (a.tipo === 'faixa') {
      const qx = p.x - a.x;
      const qy = p.y - a.y;
      const along = qx * a.dx + qy * a.dy;
      const lado = qx * -a.dy + qy * a.dx;
      if (along < -1 || along > a.len + 1 || Math.abs(lado) > a.larg / 2 + 1.2) continue;
      const sgn = lado >= 0 ? 1 : -1;
      cx -= -a.dy * sgn * 8;
      cy -= a.dx * sgn * 8;
      n += 3;
    } else if (a.tipo === 'leque') {
      // a varredura do Chefe do Tráfico (D91): sai do leque pelo lado mais perto
      const qx = p.x - a.x;
      const qy = p.y - a.y;
      const d = Math.hypot(qx, qy) || 1;
      let da = Math.atan2(qy, qx) - a.ang;
      da = Math.atan2(Math.sin(da), Math.cos(da));
      if (d > a.r + 1 || Math.abs(da) > a.ab / 2 + 0.15) continue;
      const sgn = da >= 0 ? 1 : -1;
      cx -= -Math.sin(a.ang) * sgn * 8;
      cy -= Math.cos(a.ang) * sgn * 8;
      n += 3;
    } else {
      const qx = p.x - a.x;
      const qy = p.y - a.y;
      const d = Math.hypot(qx, qy) || 1;
      if (d > a.r + 1.2) continue;
      cx -= (qx / d) * 8;
      cy -= (qy / d) * 8;
      n += 3;
    }
  }
  const aneis = BOT.dodge ? [...(game.monstraoObjs || []).filter((o) => o.tipo === 'anel'), ...(game.djAneis || [])] : [];
  for (const o of aneis) {
    const qx = p.x - o.x;
    const qy = p.y - o.y;
    const d = Math.hypot(qx, qy) || 1;
    if (d < o.r || d - o.r > 4) continue;
    const bx = o.x + Math.cos(o.brecha) * d - p.x;
    const by = o.y + Math.sin(o.brecha) * d - p.y;
    const bl = Math.hypot(bx, by) || 1;
    cx -= (bx / bl) * 6;
    cy -= (by / bl) * 6;
    n += 2;
  }
  // no cerco da chegada do Monstrão (D82): longe da torcida, que machuca e empurra
  const K = game.cerco;
  if (K && K.fase !== 'dispersa') {
    const qx = p.x - K.x;
    const qy = p.y - K.y;
    const d = Math.hypot(qx, qy) || 1;
    const folga = K.r - d;
    if (folga < 3) {
      const wgt = 5 * (3 - Math.max(0, folga));
      cx += (qx / d) * wgt;
      cy += (qy / d) * wgt;
      n += 2;
    }
  }
  // fugir dos lotes vendidos
  for (const lot of game.lots) {
    if (Math.abs(p.x - lot.x) < lot.half + 0.8 && Math.abs(p.y - lot.y) < lot.half + 0.8) {
      cx += (lot.x - p.x) * 2;
      cy += (lot.y - p.y) * 2;
      n += 2;
    }
  }
  // não se encurralar: foge também dos obstáculos (carros, barracas, balcões) que estão perto
  const w = game.world;
  if (w && w.solidGrid) {
    const near = w.solidGrid.get(Math.floor(p.y / 6)) || [];
    for (const k of near) {
      const qx = Math.max(k.x0, Math.min(p.x, k.x1));
      const qy = Math.max(k.y0, Math.min(p.y, k.y1));
      const d2 = (qx - p.x) ** 2 + (qy - p.y) ** 2;
      if (d2 > 2.5 * 2.5) continue;
      const wgt = 0.6 / Math.max(0.2, d2);
      cx += (qx - p.x) * wgt;
      cy += (qy - p.y) * wgt;
      n += wgt;
    }
  }
  // carros na avenida: sai da frente de quem vem na faixa
  let carX = 0;
  for (const c of game.traffic || []) {
    const ahead = (p.y - c.y) * c.sentido; // > 0: o Juninho está na frente do carro
    if (ahead < -c.len || ahead > 16 || Math.abs(c.x - p.x) > c.wid / 2 + 1.6) continue;
    carX += (p.x <= c.x ? -1 : 1) * 4;
  }
  const a = game.t * 0.35;
  let wx = Math.cos(a) * 0.3 + carX;
  let wy = Math.sin(a) * 0.3;
  // buscar a gema mais próxima (jogadores reais vivem disso)
  let best = null;
  let bd = 100;
  for (const g of game.gems) {
    const d2 = (g.x - p.x) ** 2 + (g.y - p.y) ** 2;
    if (d2 < bd) {
      bd = d2;
      best = g;
    }
  }
  if (best && !botGoal(game)) {
    const d = Math.sqrt(bd) || 1;
    wx += ((best.x - p.x) / d) * 0.8;
    wy += ((best.y - p.y) / d) * 0.8;
  }
  // carreira (D39): o bot não é uma pessoa e sabe onde ficam o covil e a passagem; vai até eles
  const goal = botGoal(game);
  if (goal) {
    routeTarget(game.world, p, goal.x, goal.y, goal.ri, rtBot);
    if (p.plat) {
      // em cima da casa com laje ou na escada: desce pela escada antes de seguir para o objetivo
      const S = p.plat.stair;
      const sx = (S.x0 + S.x1) / 2;
      const naEscada = p.x >= S.x0 && p.x <= S.x1 && p.y >= S.y0 && p.y <= S.y1;
      rtBot.x = sx;
      rtBot.y = p.lvl === 1 && !naEscada ? S.y0 + 0.4 : S.y1 + 0.8;
    }
    const gd = Math.hypot(rtBot.x - p.x, rtBot.y - p.y);
    if (gd > 1.5) {
      let ux = (rtBot.x - p.x) / gd;
      let uy = (rtBot.y - p.y) / gd;
      // preso numa quina (não chegou mais perto do objetivo em 2 s): contorna de lado por um tempo; se continua
      // preso, alterna o lado e vai cada vez mais longe (o mesmo desvio curto sempre podia travar)
      // preso = não chegou mais perto do objetivo (andar de um lado para o outro debaixo de um ônibus não conta)
      const dObj = Math.hypot(goal.x - p.x, goal.y - p.y);
      const st = game._bot || (game._bot = { x: p.x, y: p.y, t: game.t, desvioT: 0, lado: 1, volta: 0, falhas: 0, dObj });
      if (game.segment === 'orla' && game.t - st.t > 2) {
        if (st.dObj - dObj < 1.2) {
          const meio = p.x < -6 ? 1 : -1;
          const k = st.falhas;
          st.desvioT = 1.6 + 0.8 * Math.min(4, st.falhas++); // cada tentativa seguida vai mais longe (um ônibus tem 11 m)
          st.lado = k % 2 === 0 ? meio : -meio; // um lado, depois o outro
          st.volta = 0;
          st.alvoX = null;
          // o que está na frente (carro, ônibus, banca): vai até a ponta livre mais perto dele
          const m = game.map;
          const frente = goal.y < p.y ? -1 : 1;
          for (const k2 of game.world.solids || []) {
            if (p.x < k2.x0 - 1 || p.x > k2.x1 + 1) continue;
            const dy = frente < 0 ? p.y - k2.y1 : k2.y0 - p.y;
            if (dy < -0.2 || dy > 2.5) continue;
            const esq = k2.x0 - p.r - 0.6;
            const dir = k2.x1 + p.r + 0.6;
            const esqOk = esq > m.minX + p.r + 0.2;
            const dirOk = dir < m.maxX - p.r - 0.2;
            st.alvoX = esqOk && (!dirOk || p.x - esq < dir - p.x) ? esq : dir;
            st.desvioT = 6;
            break;
          }
        } else st.falhas = 0;
        st.x = p.x;
        st.y = p.y;
        st.dObj = dObj;
        st.t = game.t;
      }
      if (st.desvioT > 0) {
        st.desvioT -= 1 / 30;
        if (st.alvoX != null) {
          // contornando o obstáculo: de lado até passar da ponta dele
          const dx = st.alvoX - p.x;
          if (Math.abs(dx) < 0.3) st.desvioT = 0;
          ux = Math.sign(dx);
          uy = 0;
        } else {
          ux = st.lado;
          uy = -uy * st.volta;
        }
      }
      wx += ux * BOT.goalPull;
      wy += uy * BOT.goalPull;
    }
  }
  if (n > 0) {
    const l = Math.hypot(cx, cy) / n || 1;
    const danger = Math.min(3, n * 1.5);
    wx -= (cx / n / l) * danger;
    wy -= (cy / n / l) * danger;
  }
  // mundo -> tela (com o giro do mapa, a profundidade também anda para o lado)
  const l = Math.hypot(wx, wy) || 1;
  const d = game.camera.worldDirToScreen(wx / l, wy / l, {});
  return { x: d.x, y: d.y };
}

/** Para onde o bot vai: o covil aberto, a passagem depois do chefão, e a subida do morro. */
export function botGoal(game) {
  const w = game.world;
  const C = game.covil;
  if (!w || !C) return null;
  const b = game.boss;
  if (b) {
    // luta: chega perto o bastante para todas as armas alcançarem (o Chefe do Tráfico recua), sem encostar;
    // do Monstrão, que vem para cima, guarda distância (o soco no chão pega quem cola nele)
    const d = Math.hypot(b.x - game.player.x, b.y - game.player.y);
    if (b.type === 'monstrao' && d < 5) {
      const p = game.player;
      return { x: p.x + (p.x - b.x) * 2, y: p.y + (p.y - b.y) * 2, ri: p.ri ?? 0 };
    }
    return d > 6.5 ? { x: b.x, y: b.y, ri: b.ri ?? 0 } : null;
  }
  if (game.segment === 'orla') {
    if (w.gateOpen) return { x: (w.gate.x0 + w.gate.x1) / 2, y: w.orlaTop - 3, ri: 1 };
    if (C.aberto) return { x: C.x, y: w.obra.y1 + 2, ri: 0 };
    return null;
  }
  const d = deliveryPoint(w, {});
  return { x: d.x, y: d.y, ri: w.topI };
}

export function resolveModal(game, eventPolicy = (i) => i % 2 === 0) {
  const m = game.modal;
  if (!m) return;
  if (m.kind === 'event') {
    game.chooseEvent(eventPolicy(game.metrics.decisions.length));
    return;
  }
  if (m.kind === 'revive') {
    game.chooseRevive(BOT.revive);
    return;
  }
  if (m.kind === 'cofre') {
    game.fecharCofre();
    return;
  }
  const order = ['evolution', 'weapon', 'passive', 'heal', 'bonus'];
  let best = 0;
  m.options.forEach((o, i) => {
    if (order.indexOf(o.kind) < order.indexOf(m.options[best].kind)) best = i;
  });
  game.chooseOption(best);
}

export function simulate({ seed = 7, seconds = 600, dt = 1 / 30, settings = {}, eventPolicy, meta = null } = {}) {
  const s = { ...defaultSettings(), elenco: false, aberta: false, ...settings }; // balanceamento mede o jogo normal
  const game = new Game(s, { seed, meta }); // meta: melhorias permanentes da carreira
  let guard = 0;
  while (!game.finished && game.t < seconds && guard++ < seconds * 200) {
    if (game.modal) {
      resolveModal(game, eventPolicy);
      continue;
    }
    game.update(dt, botInput(game));
    game.outbox.length = 0;
  }
  return game;
}
