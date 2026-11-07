// Bot simples para simulações headless: foge do centro de massa dos inimigos próximos
// e circula; escolhe melhorias com uma política fixa.
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';

// Opções do bot (o relatório de balanceamento desliga o desvio para comparar).
export const BOT = { dodge: true, revive: false };

export function botInput(game) {
  const p = game.player;
  let cx = 0;
  let cy = 0;
  let n = 0;
  for (const e of game.enemies) {
    if (e.dmg <= 0) continue;
    const d2 = (e.x - p.x) ** 2 + (e.y - p.y) ** 2;
    if (d2 < 36) {
      const w = 1 / Math.max(0.5, d2);
      cx += (e.x - p.x) * w;
      cy += (e.y - p.y) * w;
      n += w;
    }
  }
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
  if (best) {
    const d = Math.sqrt(bd) || 1;
    wx += ((best.x - p.x) / d) * 0.8;
    wy += ((best.y - p.y) / d) * 0.8;
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
