// Comportamento das armas automáticas e dos projéteis. Tudo em metros/segundos.
import { explosaoPerto, raioPerto, golpeNoCarro } from './reacoes.js';
import { weaponStats } from './upgrades.js';
import { INTERACT, WEAPON_FX, RELIQUIAS, ACHADOS, WEAPONS } from './config.js';
import { achadoParaFarejar } from './achados.js';

const tmp = [];

function nearestEnemies(game, x, y, maxR, n, exclude) {
  game.hash.query(x, y, maxR, tmp);
  const list = [];
  const r2 = maxR * maxR;
  for (const e of tmp) {
    if (e.dead) continue;
    if (exclude && exclude.has(e.id)) continue;
    const dx = e.x - x;
    const dy = e.y - y;
    const d2 = dx * dx + dy * dy;
    if (d2 <= r2) list.push({ e, d2 });
  }
  list.sort((a, b) => a.d2 - b.d2);
  return list.slice(0, n).map((o) => o.e);
}

/**
 * Os mais perto, com o chefão na frente da fila quando ele está no alcance: as armas de um alvo só miram
 * nele primeiro (a horda continua apanhando das armas de área). Sem isso, a horda e a assessoria que ele
 * chama ficam sempre mais perto e o chefão não leva dano.
 */
function alvosComChefe(game, x, y, maxR, n, exclude) {
  const list = nearestEnemies(game, x, y, maxR, n, exclude);
  let chefe = null;
  let cd = maxR * maxR;
  for (const e of tmp) {
    if (!e.boss || e.dead || (exclude && exclude.has(e.id))) continue;
    const d2 = (e.x - x) ** 2 + (e.y - y) ** 2;
    if (d2 <= cd) {
      cd = d2;
      chefe = e;
    }
  }
  if (!chefe || list[0] === chefe) return list;
  const i = list.indexOf(chefe);
  if (i > 0) list.splice(i, 1);
  else if (list.length >= n) list.pop();
  list.unshift(chefe);
  return list;
}

function randomEnemyWithin(game, x, y, r) {
  const list = nearestEnemies(game, x, y, r, 12);
  if (!list.length) return null;
  return list[Math.floor(game.rng() * list.length)];
}

export function fireWeapon(game, w, ps) {
  const st = weaponStats(w.id, w.level);
  const p = game.player;
  const dmgMul = ps.dmgMul;
  const area = ps.areaMul;
  let fired = false;

  // evolução (D66): o padrão da arma de base, com os números e os extras dela
  switch (WEAPONS[w.id].base || w.id) {
    case 'capacete': {
      // vai e volta mirando a horda (é a arma inicial: quem foge precisa acertar o que vem atrás);
      // sem ninguém perto, vai para onde ele anda. Vários capacetes abrem em leque
      const t0 = alvosComChefe(game, p.x, p.y, 9, 1)[0];
      const base = t0 ? Math.atan2(t0.y - p.y, t0.x - p.x) : Math.atan2(p.faceY, p.faceX);
      p.aimX = Math.cos(base);
      p.aimY = Math.sin(base);
      p.throwT = 0;
      p.helmetsOut += st.count;
      for (let i = 0; i < st.count; i++) {
        const ang = base + (i - (st.count - 1) / 2) * st.spread;
        game.projectiles.push({
          kind: 'boomerang', x: p.x, y: p.y,
          vx: Math.cos(ang) * st.speed, vy: Math.sin(ang) * st.speed,
          speed: st.speed, t: 0, outT: st.outT, ret: false,
          dmg: st.dmg * dmgMul, r: 0.38 * area, hit: new Set(), bounces: 0, spin: 0, evolved: false, src: w.id,
        });
      }
      fired = true;
      break;
    }
    case 'entrega': {
      // evolução: capacetes dourados que ricocheteiam entre os inimigos mais próximos
      const targets = alvosComChefe(game, p.x, p.y, 9, st.count);
      if (!targets.length) break;
      const adx = targets[0].x - p.x;
      const ady = targets[0].y - p.y;
      const al = Math.hypot(adx, ady) || 1;
      p.aimX = adx / al;
      p.aimY = ady / al;
      p.throwT = 0;
      p.helmetsOut += st.count;
      for (let i = 0; i < st.count; i++) {
        const t = targets[i % targets.length];
        let ang = Math.atan2(t.y - p.y, t.x - p.x);
        if (i >= targets.length) ang += (i - targets.length + 1) * 0.6;
        game.projectiles.push({
          kind: 'boomerang', x: p.x, y: p.y,
          vx: Math.cos(ang) * st.speed, vy: Math.sin(ang) * st.speed,
          speed: st.speed, t: 0, outT: st.outT, ret: false,
          dmg: st.dmg * dmgMul, r: 0.38 * area, hit: new Set(),
          bounces: st.bounces || 0, spin: 0, evolved: true, src: w.id,
        });
      }
      fired = true;
      break;
    }
    case 'chinelo': {
      // rajada em linha reta na direção da horda (o mais perto), um chinelo atrás do outro;
      // sem ninguém perto, vai para onde ele anda. Nível 5: segunda rajada no outro lado da horda
      const perto = alvosComChefe(game, p.x, p.y, st.range, 10);
      const linhas = [];
      if (perto.length) {
        const l = Math.hypot(perto[0].x - p.x, perto[0].y - p.y) || 1;
        linhas.push({ x: (perto[0].x - p.x) / l, y: (perto[0].y - p.y) / l });
      } else linhas.push({ x: p.faceX, y: p.faceY });
      if (st.back > 0) {
        const a = linhas[0];
        const outro = perto.find((e) => {
          const l = Math.hypot(e.x - p.x, e.y - p.y) || 1;
          return ((e.x - p.x) * a.x + (e.y - p.y) * a.y) / l < st.cone;
        });
        if (outro) {
          const l = Math.hypot(outro.x - p.x, outro.y - p.y) || 1;
          linhas.push({ x: (outro.x - p.x) / l, y: (outro.y - p.y) / l });
        } else linhas.push({ x: -a.x, y: -a.y });
      }
      if (st.dirs) {
        // Vou Contar Até Três: a chinelada sai para todos os lados, a partir da direção da horda
        const a0 = Math.atan2(linhas[0].y, linhas[0].x);
        linhas.length = 0;
        for (let k = 0; k < st.dirs; k++) linhas.push({ x: Math.cos(a0 + (k / st.dirs) * Math.PI * 2), y: Math.sin(a0 + (k / st.dirs) * Math.PI * 2) });
      }
      p.aimX = linhas[0].x;
      p.aimY = linhas[0].y;
      p.throwT = 0;
      for (let i = 0; i < st.count; i++) {
        for (const { x: ax, y: ay } of linhas) {
          // o primeiro de cada linha já sai voando; os outros esperam a vez na fila
          const delay = i * st.gap + (st.espera || 0);
          game.projectiles.push({
            kind: 'slipper', x: p.x, y: p.y, delay, speed: st.speed, ax, ay,
            vx: delay > 0 ? 0 : ax * st.speed, vy: delay > 0 ? 0 : ay * st.speed,
            life: 0.75, pierce: st.pierce, dmg: st.dmg * dmgMul, r: 0.28, hit: new Set(), spin: 0, src: w.id,
          });
        }
      }
      game.word(p.x, p.y, st.dirs ? '1… 2… 3!' : 'PÁ!', '#ffd21f');
      fired = true;
      break;
    }
    case 'boleto': {
      // boletos girando em volta do Juninho (seguem ele), cobrando de quem encosta
      game.zones.push({
        kind: 'orbita', x: p.x, y: p.y, t: 0, dur: st.duration, n: st.count, r: st.radius * area, spin: st.spin,
        ang: game.rng() * Math.PI * 2, dmg: st.dmg * dmgMul, every: st.hitEvery, hits: new Map(), pts: [], src: w.id, juros: st.juros || 0,
      });
      fired = true;
      break;
    }
    case 'carimbo': {
      // cai do céu: sombra no chão e o carimbão descendo em cima de inimigos da tela
      if (st.tela) {
        // Decreto: um carimbo gigante em cima do Juninho pega a tela inteira
        game.zones.push({
          kind: 'stamp', x: p.x, y: p.y, half: st.half * area, t: 0, delay: st.fallS, done: false,
          life: st.fallS + 0.55, dmg: st.dmg * dmgMul, slow: st.slow, slowT: st.slowT, src: w.id, decreto: true,
        });
        game.word(p.x, p.y - 2, 'INDEFERIDO!', '#ff6b6b');
        fired = true;
        break;
      }
      for (let i = 0; i < st.count; i++) {
        const t = randomEnemyWithin(game, p.x, p.y, 7);
        if (!t) break;
        game.zones.push({
          kind: 'stamp', x: t.x, y: t.y, half: st.half * area, t: 0, delay: st.fallS, done: false,
          life: st.fallS + 0.55, dmg: st.dmg * dmgMul, slow: st.slow, slowT: st.slowT, src: w.id,
        });
        fired = true;
      }
      break;
    }
    case 'maleta': {
      // joga a maleta aberta na direção da horda: ela cai, a horda corre atrás do dinheiro e ela explode
      const alvos = nearestEnemies(game, p.x, p.y, 12, 8);
      const base = alvos.length ? Math.atan2(alvos[0].y - p.y, alvos[0].x - p.x) : Math.atan2(p.faceY, p.faceX);
      for (let i = 0; i < st.count; i++) {
        const ang = base + i * (Math.PI * 2 / 3); // a 2ª maleta cai do outro lado
        const tx = p.x + Math.cos(ang) * st.distM;
        const ty = p.y + Math.sin(ang) * st.distM;
        game.projectiles.push({
          kind: 'lob', sx: p.x, sy: p.y, x: p.x, y: p.y, tx, ty, t: 0, dur: st.flightS, arcH: st.arcM, h: 0, src: w.id,
          isca: { dmg: st.dmg * dmgMul, radius: st.radius * area, r: st.iscaR * area, s: st.iscaS, voo: st.voo, caixa2: st.caixa2 || 0 },
        });
      }
      p.throwT = 0;
      fired = true;
      break;
    }
    case 'picole': {
      // Isopor de Picolé (só na Orla): poça gelada no caminho, um pouco atrás do Juninho
      const zs = game.zones;
      let n = 0;
      for (const z of zs) if (z.kind === 'poca') n++;
      if (n >= WEAPON_FX.pocasMax) {
        const i = zs.findIndex((z) => z.kind === 'poca');
        if (i >= 0) zs.splice(i, 1);
      }
      zs.push({
        kind: 'poca', x: p.x - p.faceX * 0.35, y: p.y - p.faceY * 0.35, r: st.radius * area, t: 0, dur: st.duration,
        tick: st.tick, tickT: 0, dmg: st.dmg * dmgMul, slow: st.slow, freeze: st.freeze, rot: game.rng() * 3, src: w.id,
      });
      fired = true;
      break;
    }
    case 'mototaxi': {
      // Mototáxi Amigo (só no Morro): faixa vermelha e buzina primeiro, depois a moto rasga a linha
      for (let i = 0; i < st.count; i++) {
        const off = st.count > 1 ? (i - (st.count - 1) / 2) * 1.6 : 0;
        game.projectiles.push({
          kind: 'moto', x: p.x + off, y: p.y + st.startM, y0: p.y + st.startM, lenM: st.lenM, vx: 0, vy: -st.speed,
          delay: st.warnS, life: st.lenM / st.speed, dmg: st.dmg * dmgMul, width: st.width * area, hit: new Set(), src: w.id,
        });
      }
      game.word(p.x, p.y + 2.5, 'BI-BI!', '#ffd21f');
      fired = true;
      break;
    }
    case 'microfone': {
      // aura sempre ligada: a cada pulso, machuca de leve e empurra quem está dentro do círculo
      const r = st.radius * area;
      p.auraR = r;
      p.auraPulse = game.t;
      game.efeito('aura_pulso', p.x, p.y, { segue: true, tam: r * 2 });
      game.hash.query(p.x, p.y, r + 0.6, tmp);
      for (const e of tmp) {
        if (e.dead) continue;
        const dx = e.x - p.x;
        const dy = e.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d > r + e.r) continue;
        const l = d || 1;
        game.damageEnemy(e, st.dmg * dmgMul, w.id, (dx / l) * st.knock, (dy / l) * st.knock, true);
      }
      if (st.cura) p.hp = Math.min(game.stats.maxHp, p.hp + st.cura); // Cadeia Nacional: cada pulso cura um pouco
      fired = true;
      break;
    }
    case 'gato': {
      // Gato de Luz: o choque acerta o mais perto e pula para os vizinhos (a Mochila Térmica aumenta o alcance e o pulo)
      const seen = new Set();
      const tocou = [];
      for (let c = 0; c < st.count; c++) {
        let cur = alvosComChefe(game, p.x, p.y, st.range * area, 1, seen)[0];
        if (!cur) break;
        const pts = [{ x: p.x, y: p.y }];
        for (let k = 0; k < st.chain && cur; k++) {
          pts.push({ x: cur.x, y: cur.y });
          seen.add(cur.id);
          game.damageEnemy(cur, st.dmg * dmgMul, w.id, 0, 0);
          cur.choqueAte = game.t + st.stunS + 0.15; // arcos elétricos no corpo enquanto trava
          tocou.push(cur); // perto de um poste ou do gatonet, o poste descarrega (depois do raio principal)
          game.efeito('chamuscado_raio', cur.x, cur.y, { rot: giroFixo(cur.x, cur.y) });
          game.efeito('luz', cur.x, cur.y, { dur: 0.3, tam: 4.5, cor: '170,210,255' });
          cur.slowT = Math.max(cur.slowT, st.stunS);
          cur.slowF = Math.min(cur.slowF || 1, st.paraF ?? 0.2); // Apagão Geral: parado
          const nx = nearestEnemies(game, cur.x, cur.y, st.jumpM * area, 1, seen)[0];
          cur = nx || null;
        }
        game.fx.bolts.push({ pts, t: 0, dur: WEAPON_FX.raioDur, seed: game.fxRng() * 1000 });
        for (const e of tocou) raioPerto(game, e.x, e.y, e);
        tocou.length = 0;
        if (c === 0) game.efeito('raio_origem', p.x, p.y, { alvo: p }); // o fio do gato estourando na mão
        fired = true;
      }
      break;
    }
    case 'caramelo': {
      // Cachorro Caramelo: o vira-lata que está ao lado do Juninho corre até o inimigo mais perto
      const dogs = game.dogs;
      while (dogs.length < st.count) dogs.push({ x: p.x - 0.8, y: p.y + 0.3, st: 'segue', tgt: null, fx: 1, fy: 0, t: 0, wag: 0, at: 0, walk: 0 });
      const taken = new Set(dogs.filter((d) => d.tgt).map((d) => d.tgt.id));
      for (const d of dogs) {
        if (d.st !== 'segue') continue;
        const t = nearestEnemies(game, p.x, p.y, st.range, 1, taken)[0];
        if (!t) break;
        taken.add(t.id);
        d.tgt = t;
        d.st = 'corre';
        d.dmg = st.dmg * dmgMul;
        d.speed = st.speed;
        d.bark = st.bark * area;
        d.combo = st.combo; // mordidas por corrida antes de voltar
        d.comboM = st.comboM;
        d.bites = 0;
        fired = true;
      }
      break;
    }
    default:
      break;
  }
  return { fired, cd: st.cd * ps.cdMul };
}

export function updateProjectiles(game, dt) {
  const p = game.player;
  const list = game.projectiles;
  for (let i = list.length - 1; i >= 0; i--) {
    const pr = list[i];
    let remove = false;

    if (pr.kind === 'boomerang') {
      pr.spin += dt * 18;
      if (!pr.ret) {
        pr.t += dt;
        if (pr.t >= pr.outT) {
          pr.ret = true;
          pr.hit.clear();
          if (pr.carros) pr.carros.clear(); // na volta, acerta de novo
        }
      }
      if (pr.ret) {
        const dx = p.x - pr.x;
        const dy = p.y - pr.y;
        const d = Math.hypot(dx, dy);
        if (d < 0.5) {
          remove = true;
          game.helmetBack();
        }
        else {
          const sp = pr.speed * 1.15;
          pr.vx = (dx / d) * sp;
          pr.vy = (dy / d) * sp;
        }
      }
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      golpeNoCarro(game, pr.x, pr.y, pr.r, pr.dmg, (pr.carros ||= new Set())); // porrada no carro do caminho
      game.hash.query(pr.x, pr.y, pr.r + 0.6, tmp);
      for (const e of tmp) {
        if (e.dead || pr.hit.has(e.id)) continue;
        const rr = pr.r + e.r;
        if ((e.x - pr.x) ** 2 + (e.y - pr.y) ** 2 > rr * rr) continue;
        pr.hit.add(e.id);
        game.damageEnemy(e, pr.dmg, pr.src, pr.vx * 0.12, pr.vy * 0.12);
        if (!pr.ret && pr.bounces > 0) {
          const next = nearestEnemies(game, pr.x, pr.y, 6, 1, pr.hit)[0];
          if (next) {
            pr.bounces--;
            const ddx = next.x - pr.x;
            const ddy = next.y - pr.y;
            const l = Math.hypot(ddx, ddy) || 1;
            pr.vx = (ddx / l) * pr.speed;
            pr.vy = (ddy / l) * pr.speed;
            pr.t = Math.max(0, pr.outT - 0.35);
          }
        }
      }
      // segurança: nunca deixar um capacete perdido para sempre
      if (Math.hypot(p.x - pr.x, p.y - pr.y) > 30) {
        remove = true;
        game.helmetBack();
      }
    } else if (pr.kind === 'slipper') {
      if (pr.delay > 0) {
        // na fila da rajada: sai do pé do Juninho, na mesma linha do primeiro
        pr.delay -= dt;
        pr.x = p.x;
        pr.y = p.y;
        if (pr.delay > 0) continue;
        pr.vx = pr.ax * pr.speed;
        pr.vy = pr.ay * pr.speed;
      }
      pr.spin += dt * 22;
      pr.life -= dt;
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      golpeNoCarro(game, pr.x, pr.y, pr.r, pr.dmg, (pr.carros ||= new Set()));
      game.hash.query(pr.x, pr.y, pr.r + 0.6, tmp);
      for (const e of tmp) {
        if (e.dead || pr.hit.has(e.id)) continue;
        const rr = pr.r + e.r;
        if ((e.x - pr.x) ** 2 + (e.y - pr.y) ** 2 > rr * rr) continue;
        pr.hit.add(e.id);
        game.damageEnemy(e, pr.dmg, pr.src, pr.vx * 0.08, pr.vy * 0.08);
        pr.pierce--;
        if (pr.pierce < 0) {
          remove = true;
          break;
        }
      }
      if (pr.life <= 0) remove = true;
    } else if (pr.kind === 'lob') {
      pr.t += dt;
      const k = Math.min(1, pr.t / pr.dur);
      pr.x = pr.sx + (pr.tx - pr.sx) * k;
      pr.y = pr.sy + (pr.ty - pr.sy) * k;
      pr.h = Math.sin(k * Math.PI) * (pr.arcH || 2.2);
      if (k >= 1) {
        if (pr.isca) {
          // a maleta da habilidade cai aberta: vira isca de dinheiro e depois explode (updateZones)
          const I = pr.isca;
          game.zones.push({ kind: 'maleta', x: pr.x, y: pr.y, t: 0, dur: I.s, dmg: I.dmg, radius: I.radius, voo: I.voo, iscaR: I.r, src: pr.src, caixa2: I.caixa2 || 0 });
          game.lures.push({ x: pr.x, y: pr.y, t: 0, dur: I.s, r: I.r, speedMul: 1.6 });
          game.moneyBurst(pr.x, pr.y, 10);
          game.word(pr.x, pr.y - 0.5, 'DINHEIRO!', '#7fe08a');
        } else {
          game.explode(pr.x, pr.y, pr.radius, pr.dmg, pr.src);
        }
        remove = true;
      }
    } else if (pr.kind === 'moto') {
      if (pr.delay > 0) {
        pr.delay -= dt; // faixa de aviso piscando no chão
        continue;
      }
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      pr.life -= dt;
      pr.poeiraT = (pr.poeiraT || 0) - dt;
      if (pr.poeiraT <= 0) {
        pr.poeiraT = 0.07; // poeira de terra e fumaça de escapamento atrás da moto
        game.efeito('poeira_moto', pr.x, pr.y + 0.6);
      }
      if (pr.life <= 0) game.efeito('pneu_queimado', pr.x, pr.y0 - pr.lenM / 2, { comp: pr.lenM, larg: Math.max(1, pr.width * 1.4) });
      game.hash.query(pr.x, pr.y, pr.width + 1.2, tmp);
      for (const e of tmp) {
        if (e.dead || pr.hit.has(e.id)) continue;
        const dx = e.x - pr.x;
        if (Math.abs(dx) > pr.width + e.r || Math.abs(e.y - pr.y) > 1.1) continue;
        pr.hit.add(e.id);
        game.damageEnemy(e, pr.dmg, pr.src, (dx >= 0 ? 1 : -1) * 7, -3);
      }
      if (pr.life <= 0) remove = true;
    } else if (pr.kind === 'paredao') {
      // Paredão de Som (relíquia do Morro): vai no carrinho atrás do Juninho (espera embaixo quando ele sobe
      // na laje); a cada tanto o grave solta uma onda que corre em volta, bate e empurra a horda para fora
      const R = RELIQUIAS.paredao;
      if (!p.plat) {
        const dx = p.x - pr.x;
        const dy = p.y - pr.y;
        const l = Math.hypot(dx, dy);
        if (l > R.segueM) {
          const k = Math.min(l - R.segueM, Math.max(4, l * 4) * dt) / l;
          pr.x += dx * k;
          pr.y += dy * k;
        }
        if (Math.abs(dx) > 0.2) pr.lado = dx > 0 ? 1 : -1; // o puxador fica do lado do Juninho
      }
      if (pr.pulso > 0) pr.pulso = Math.max(0, pr.pulso - dt * 3);
      pr.cd -= dt;
      if (pr.cd <= 0 && pr.onda < 0) {
        pr.cd = R.cadaS;
        pr.onda = 0;
        pr.pulso = 1;
        pr.bateu.clear();
        game.som('paredao', pr.x, pr.y);
        game.shake(0.06);
      }
      if (pr.onda >= 0) {
        pr.onda += R.velM * dt;
        const r = Math.min(pr.onda, R.raioM);
        game.hash.query(pr.x, pr.y, r + 1.2, tmp);
        for (const e of tmp) {
          if (e.dead || pr.bateu.has(e.id)) continue;
          const dx = e.x - pr.x;
          const dy = e.y - pr.y;
          const d = Math.hypot(dx, dy) || 0.01;
          if (d > r + (e.r || 0.3)) continue;
          pr.bateu.add(e.id);
          const emp = e.boss ? 0 : R.empurra;
          game.damageEnemy(e, pr.dmg * (game.stats.dmgMul || 1), 'paredao', (dx / d) * emp, (dy / d) * emp);
        }
        if (pr.onda >= R.raioM) pr.onda = -1;
      }
      continue; // o paredão não some
    } else if (pr.kind === 'altinha') {
      // Bola da Altinha (relíquia): quica de inimigo em inimigo, sem parar; sem ninguém perto, volta ao pé
      const R = RELIQUIAS.altinha;
      pr.fase += dt * 9;
      pr.alt = Math.abs(Math.sin(pr.fase)) * 0.9; // quicando (não é 'z': esse sobe o desenho inteiro)
      if (pr.hitT > 0) pr.hitT -= dt;
      if (!pr.tgt || pr.tgt.dead) {
        pr.tgt = null;
        const perto = Math.hypot(p.x - pr.x, p.y - pr.y) < R.voltaM;
        const from = perto ? p : pr;
        const t = nearestEnemies(game, from.x, from.y, perto ? R.alcanceM : R.pulaM, 2).find((e) => e !== pr.last);
        if (t) {
          pr.tgt = t;
          if (perto) {
            game.word(p.x, p.y, 'TOC!', '#f2efe8'); // o Juninho chuta
            game.som('bola', pr.x, pr.y);
          }
        }
      }
      const g = pr.tgt || p;
      const dx = g.x - pr.x;
      const dy = g.y - pr.y;
      const l = Math.hypot(dx, dy) || 1;
      if (pr.tgt || l > R.voltaM * 0.6) {
        const sp = R.speed * (pr.tgt ? 1 : 0.9) * dt;
        pr.x += (dx / l) * Math.min(sp, l);
        pr.y += (dy / l) * Math.min(sp, l);
      }
      if (pr.tgt && l < (pr.tgt.r || 0.3) + 0.3) {
        game.damageEnemy(pr.tgt, pr.dmg * (game.stats.dmgMul || 1), 'altinha', (dx / l) * 2.5, (dy / l) * 2.5);
        pr.last = pr.tgt;
        pr.tgt = null;
        pr.hitT = 0.12;
        // quica no próximo, perto da bola; se não tem ninguém, volta para o Juninho
        const nx = nearestEnemies(game, pr.x, pr.y, R.pulaM, 2).find((e) => e !== pr.last);
        if (nx) pr.tgt = nx;
      }
      continue; // a bola não some
    } else if (pr.kind === 'thrown') {
      // objeto de cena arremessado (mesa, cadeira, botijão...): arco e impacto em área
      pr.t += dt;
      const k = Math.min(1, pr.t / pr.dur);
      pr.x = pr.sx + (pr.tx - pr.sx) * k;
      pr.y = pr.sy + (pr.ty - pr.sy) * k;
      pr.h = Math.sin(k * Math.PI) * INTERACT.arcM;
      if (k >= 1) {
        game.objectLands(pr);
        remove = true;
      }
    }

    if (remove) {
      list[i] = list[list.length - 1];
      list.pop();
    }
  }
}

// giro de uma marca no chão pelo lugar (não usa sorteio: efeito não pode mudar a partida)
const giroFixo = (x, y) => (((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1) + 1) * Math.PI;

export function updateZones(game, dt) {
  const list = game.zones;
  const p = game.player;
  for (let i = list.length - 1; i >= 0; i--) {
    const z = list[i];
    z.t += dt;
    let remove = false;
    if (z.kind === 'maleta') {
      // maleta aberta no chão: a horda corre atrás do dinheiro; no fim, explode e lança todo mundo para o alto
      if (z.t >= z.dur) {
        game.hash.query(z.x, z.y, z.radius + 0.6, tmp);
        for (const e of tmp) {
          if (e.dead) continue;
          const dx = e.x - z.x;
          const dy = e.y - z.y;
          const d = Math.hypot(dx, dy);
          if (d > z.radius + e.r) continue;
          const l = d || 1;
          game.damageEnemy(e, z.dmg, z.src, (dx / l) * 9, (dy / l) * 9);
          if (!e.dead && !e.boss) e.vz = z.voo * (e.elite ? 0.5 : 1) * (0.8 + 0.4 * (1 - d / (z.radius + e.r)));
        }
        game.fx.rings.push({ x: z.x, y: z.y, r0: 0.3, r1: z.radius * 1.15, t: 0, dur: 0.35, color: 'blast' });
        // fogo de verdade: a explosão, a fumaça com notas queimando e a marca preta no chão
        explosaoPerto(game, z.x, z.y, z.radius); // carro perto explode também
        game.efeito('explosao', z.x, z.y, { tam: z.radius * 2.6, z: z.radius * 0.38 });
        // a fumaça continua a da explosão: mesmo ponto, só os quadros de fumaça, entrando aos poucos e subindo devagar
        game.efeito('explosao_fumaca', z.x, z.y, { tam: z.radius * 2.5, z: z.radius * 0.42, delay: 0.55, de: 3, entra: 0.4, sobe: 0.45 });
        game.efeito('chamuscado', z.x, z.y, { tam: z.radius * 2.3, rot: giroFixo(z.x, z.y) });
        game.efeito('luz', z.x, z.y, { dur: 0.5, tam: z.radius * 3, cor: '255,150,60' });
        game.moneyBurst(z.x, z.y, 22);
        game.burst(z.x, z.y, 14, 'debris');
        game.word(z.x, z.y - 0.5, 'BUM!', '#ffd21f');
        game.som('explosao', z.x, z.y);
        game.shake(0.3);
        remove = true;
        if (z.caixa2 > 0) {
          // Caixa Dois: as notas que sobraram atraem a horda de novo e explodem outra vez
          const d2 = z.dur * 0.6;
          game.zones.push({ ...z, t: 0, dur: d2, caixa2: z.caixa2 - 1 });
          game.lures.push({ x: z.x, y: z.y, t: 0, dur: d2, r: z.iscaR, speedMul: 1.6 });
          game.word(z.x, z.y - 1.2, 'CAIXA DOIS!', '#7fe08a');
        }
      }
    } else if (z.kind === 'orbita') {
      // boletos girando em volta do Juninho; cada inimigo leva no máximo uma cobrança a cada `every`
      z.x = p.x;
      z.y = p.y;
      z.ang += z.spin * dt;
      z.pts.length = 0;
      const hr = WEAPON_FX.orbitaHitR;
      for (let k = 0; k < z.n; k++) {
        const a = z.ang + (k / z.n) * Math.PI * 2;
        const bx = p.x + Math.cos(a) * z.r;
        const by = p.y + Math.sin(a) * z.r;
        z.pts.push({ x: bx, y: by, a });
        game.hash.query(bx, by, hr + 0.6, tmp);
        for (const e of tmp) {
          if (e.dead) continue;
          if ((e.x - bx) ** 2 + (e.y - by) ** 2 > (hr + e.r) ** 2) continue;
          if (game.t - (z.hits.get(e.id) ?? -9) < z.every) continue;
          z.hits.set(e.id, game.t);
          const dx = e.x - p.x;
          const dy = e.y - p.y;
          const l = Math.hypot(dx, dy) || 1;
          game.damageEnemy(e, z.dmg, z.src, (dx / l) * 1.5, (dy / l) * 1.5);
          if (z.juros && z.n < z.juros) z.n++; // Juros Compostos: cada cobrança gera outro boleto
        }
      }
      if (z.t >= z.dur) remove = true;
    } else if (z.kind === 'poca') {
      // poça de picolé: quem pisa fica lento, leva um pouco de dano e às vezes congela
      z.tickT -= dt;
      if (z.tickT <= 0) {
        z.tickT += z.tick;
        game.hash.query(z.x, z.y, z.r + 0.6, tmp);
        for (const e of tmp) {
          if (e.dead) continue;
          if ((e.x - z.x) ** 2 + ((e.y - z.y) / 1) ** 2 > (z.r + e.r * 0.5) ** 2) continue;
          game.damageEnemy(e, z.dmg, z.src, 0, 0, true);
          if (z.freeze > 0 && game.rng() < z.freeze) {
            e.slowT = Math.max(e.slowT, WEAPON_FX.congelaS);
            e.slowF = 0.05;
            e.frozenT = WEAPON_FX.congelaS;
          } else {
            e.slowT = Math.max(e.slowT, z.tick + 0.15);
            e.slowF = Math.min(e.slowT > 0 && e.slowF < z.slow ? e.slowF : 1, z.slow);
          }
        }
      }
      if (z.t >= z.dur) remove = true;
    } else if (z.kind === 'boleto') {
      z.tickT -= dt;
      if (z.tickT <= 0) {
        z.tickT += z.tick;
        game.hash.query(z.x, z.y, z.r + 0.6, tmp);
        for (const e of tmp) {
          if (e.dead) continue;
          const rr = z.r + e.r * 0.5;
          if ((e.x - z.x) ** 2 + (e.y - z.y) ** 2 <= rr * rr) game.damageEnemy(e, z.dmg, z.src, 0, 0, true);
        }
      }
      if (z.t >= z.dur) remove = true;
    } else if (z.kind === 'stamp') {
      if (!z.done && z.t >= z.delay) {
        z.done = true;
        const h = z.half;
        game.efeito('carimbo_baque', z.x, z.y, { tam: h * 2 * 1.6 }); // poeira e papelada
        game.som('carimbo', z.x, z.y);
        // a tinta apaga com a lentidão; a do Decreto (a tela inteira) some logo, para não cobrir o chão
        game.efeito('carimbo_marca', z.x, z.y, z.decreto ? { tam: h * 2 * 1.1, rot: -0.18, dur: WEAPON_FX.decretoMarcaS, alpha: 0.55 } : { tam: h * 2 * 1.35, rot: -0.18, dur: z.slowT + 0.6 });
        golpeNoCarro(game, z.x, z.y, h, z.dmg);
        game.hash.query(z.x, z.y, h * 1.5 + 0.6, tmp);
        for (const e of tmp) {
          if (e.dead) continue;
          if (Math.abs(e.x - z.x) <= h + e.r && Math.abs(e.y - z.y) <= h + e.r) {
            game.damageEnemy(e, z.dmg, z.src, 0, 0);
            e.slowT = Math.max(e.slowT, z.slowT);
            e.slowF = z.slow;
          }
        }
        game.shake(0.12);
      }
      if (z.t >= z.life) remove = true;
    }
    if (remove) {
      list[i] = list[list.length - 1];
      list.pop();
    }
  }
}

/** Cachorro Caramelo: segue o Juninho, corre até o alvo, morde (AU AU! empurra a horda) e volta. */
export function updateDogs(game, dt) {
  const p = game.player;
  const F = WEAPON_FX;
  for (const d of game.dogs) {
    d.t += dt;
    d.wag += dt;
    const x0 = d.x;
    const y0 = d.y;
    if (d.st === 'segue') {
      // faro (D40): perto de um achado fechado, para, vira para ele e late; é a pista sem seta
      d.faroCd = (d.faroCd ?? 2) - dt;
      if (d.faroCd <= 0 && game.achados) {
        const a = achadoParaFarejar(game, d.x, d.y);
        d.faroCd = a ? ACHADOS.faroCadaS : 1;
        if (a) {
          d.st = 'fareja';
          d.at = 0;
          d.fx = a.x - d.x;
          d.fy = a.y - d.y;
          game.word(d.x, d.y - 0.2, 'AU!', '#f2efe8');
          game.som('latido', d.x, d.y);
          continue;
        }
      }
    }
    if (d.st === 'fareja') {
      d.at += dt;
      if (d.at >= F.latidoS) d.st = 'segue';
      continue;
    }
    if (d.st === 'segue') {
      const tx = p.x - p.faceX * F.caoSegueM + 0.35;
      const ty = p.y - p.faceY * F.caoSegueM + 0.25;
      const k = Math.min(1, dt * 5);
      d.x += (tx - d.x) * k;
      d.y += (ty - d.y) * k;
    } else if (d.st === 'morde' || d.st === 'late') {
      // parado no bote: a arte da mordida e do latido tem 6 quadros; o golpe sai no quadro do contato
      d.at += dt;
      const g = d.tgt && !d.tgt.dead ? d.tgt : null;
      if (g) {
        d.fx = g.x - d.x;
        d.fy = g.y - d.y;
      }
      if (d.st === 'morde' && !d.hitDone && d.at >= F.mordidaS * F.mordidaContato) {
        d.hitDone = true;
        if (g && Math.hypot(g.x - d.x, g.y - d.y) < F.caochegaM + (g.r || 0.3) + 0.6) {
          const l = Math.hypot(d.fx, d.fy) || 1;
          game.damageEnemy(g, d.dmg || 20, 'caramelo', (d.fx / l) * 2, (d.fy / l) * 2);
          game.word(g.x, g.y, 'NHAC!', '#e0a14a');
          game.som('mordida', g.x, g.y);
        }
      }
      if (d.st === 'late' && !d.hitDone && d.at >= F.latidoS * F.latidoPico) {
        d.hitDone = true;
        game.efeito('latido_onda', d.x, d.y, { rot: Math.atan2(d.fy, d.fx), tam: Math.max(3, d.bark * 2.2) });
        game.word(d.x, d.y - 0.2, 'AU AU!', '#f2efe8');
        game.som('latido', d.x, d.y);
        game.hash.query(d.x, d.y, d.bark + 0.6, tmp);
        for (const e of tmp) {
          if (e.dead || e.boss) continue;
          const ex = e.x - d.x;
          const ey = e.y - d.y;
          const el = Math.hypot(ex, ey);
          if (el > d.bark) continue;
          e.kx += (ex / (el || 1)) * 5;
          e.ky += (ey / (el || 1)) * 5;
        }
      }
      if (d.st === 'morde' && d.at >= F.mordidaS) proximaMordida(game, d);
      else if (d.st === 'late' && d.at >= F.latidoS) {
        d.st = 'volta';
        d.tgt = null;
      }
    } else {
      const goal = d.st === 'corre' ? d.tgt : p;
      if (d.st === 'corre' && (!d.tgt || d.tgt.dead)) {
        d.st = 'volta';
        d.tgt = null;
      } else {
        const dx = goal.x - d.x;
        const dy = goal.y - d.y;
        const l = Math.hypot(dx, dy) || 1;
        const sp = (d.speed || 7) * dt;
        d.x += (dx / l) * Math.min(sp, l);
        d.y += (dy / l) * Math.min(sp, l);
        if (d.st === 'corre' && l < F.caochegaM + (goal.r || 0.3)) {
          d.st = 'morde';
          d.at = 0;
          d.hitDone = false;
        } else if (d.st === 'volta' && l < F.caoSegueM + 0.2) {
          d.st = 'segue';
        }
      }
    }
    // arrancada e freada: poeira das patas
    if (d.stFx !== d.st) {
      if (d.st === 'corre' || (d.st === 'segue' && d.stFx === 'volta')) game.efeito('poeira_patas', d.x, d.y);
      d.stFx = d.st;
    }
    // para onde olha e quanto andou (a caminhada troca de quadro pela distância)
    const mx = d.x - x0;
    const my = d.y - y0;
    const m = Math.hypot(mx, my);
    d.vel = m / Math.max(dt, 1e-6);
    if (m > 1e-4 && d.st !== 'morde' && d.st !== 'late') {
      d.fx = mx;
      d.fy = my;
    } else if (d.st === 'segue' && d.vel < 0.3) {
      d.fx = p.faceX; // parado ao lado do Juninho, olha para onde ele olha
      d.fy = p.faceY;
    }
    d.walk = (d.walk || 0) + m;
  }
}

/** Depois da mordida: ainda tem fôlego, pula no vizinho mais perto; senão late para a horda (nível 4) e volta. */
function proximaMordida(game, d) {
  d.bites = (d.bites || 0) + 1;
  const viz = d.bites < (d.combo || 1) ? nearestEnemies(game, d.x, d.y, d.comboM || 2, 2).find((e) => e !== d.tgt && !e.boss) : null;
  d.at = 0;
  d.hitDone = false;
  if (viz) {
    d.tgt = viz;
    d.st = 'corre';
  } else if (d.bark > 0) {
    d.st = 'late';
  } else {
    d.st = 'volta';
    d.tgt = null;
  }
}
