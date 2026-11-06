// Comportamento das armas automáticas e dos projéteis. Tudo em metros/segundos.
import { weaponStats } from './upgrades.js';
import { INTERACT } from './config.js';

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

  switch (w.id) {
    case 'capacete':
    case 'entrega': {
      const targets = nearestEnemies(game, p.x, p.y, 9, st.count);
      if (!targets.length) break;
      // animação: arma o braço na direção do primeiro alvo
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
          bounces: st.bounces || 0, spin: 0, evolved: w.id === 'entrega', src: w.id,
        });
      }
      fired = true;
      break;
    }
    case 'chinelo': {
      const targets = nearestEnemies(game, p.x, p.y, 9, st.count);
      for (const t of targets) {
        const dx = t.x - p.x;
        const dy = t.y - p.y;
        const l = Math.hypot(dx, dy) || 1;
        game.projectiles.push({
          kind: 'slipper', x: p.x, y: p.y, vx: (dx / l) * st.speed, vy: (dy / l) * st.speed,
          life: 1.1, pierce: st.pierce, dmg: st.dmg * dmgMul, r: 0.28, hit: new Set(), spin: 0, src: w.id,
        });
      }
      fired = targets.length > 0;
      break;
    }
    case 'boleto': {
      for (let i = 0; i < st.count; i++) {
        const t = randomEnemyWithin(game, p.x, p.y, 6.5);
        if (!t) break;
        game.zones.push({
          kind: 'boleto', x: t.x, y: t.y, r: st.radius * area, t: 0, dur: st.duration,
          tick: st.tick, tickT: 0, dmg: st.dmg * dmgMul, src: w.id,
        });
        fired = true;
      }
      break;
    }
    case 'carimbo': {
      for (let i = 0; i < st.count; i++) {
        const t = randomEnemyWithin(game, p.x, p.y, 6);
        if (!t) break;
        game.zones.push({
          kind: 'stamp', x: t.x, y: t.y, half: st.half * area, t: 0, delay: 0.22, done: false,
          life: 0.75, dmg: st.dmg * dmgMul, slow: st.slow, slowT: st.slowT, src: w.id,
        });
        fired = true;
      }
      break;
    }
    case 'maleta': {
      for (let i = 0; i < st.count; i++) {
        const t = randomEnemyWithin(game, p.x, p.y, st.range);
        if (!t) break;
        game.projectiles.push({
          kind: 'lob', sx: p.x, sy: p.y, x: p.x, y: p.y, tx: t.x, ty: t.y, t: 0, dur: 0.65,
          dmg: st.dmg * dmgMul, radius: st.radius * area, h: 0, src: w.id,
        });
        fired = true;
      }
      break;
    }
    case 'picole': {
      // Isopor de Picolé (só na Orla): onda gelada que machuca pouco e deixa a horda lenta
      const r = st.radius * area;
      game.hash.query(p.x, p.y, r + 0.6, tmp);
      for (const e of tmp) {
        if (e.dead) continue;
        if (Math.hypot(e.x - p.x, e.y - p.y) > r + e.r) continue;
        game.damageEnemy(e, st.dmg * dmgMul, w.id, 0, 0);
        e.slowT = Math.max(e.slowT, st.slowT);
        e.slowF = st.slow;
      }
      game.fx.rings.push({ x: p.x, y: p.y, r0: 0.3, r1: r, t: 0, dur: 0.5, color: 'gelo' });
      game.burst(p.x, p.y, 12, 'gelo');
      fired = true;
      break;
    }
    case 'mototaxi': {
      // Mototáxi Amigo (só no Morro): sobe a viela por baixo do Juninho, atropelando todos na linha
      for (let i = 0; i < st.count; i++) {
        const off = st.count > 1 ? (i - (st.count - 1) / 2) * 1.4 : 0;
        game.projectiles.push({
          kind: 'moto', x: p.x + off, y: p.y + st.startM, vx: 0, vy: -st.speed, life: st.lenM / st.speed,
          dmg: st.dmg * dmgMul, width: st.width * area, hit: new Set(), src: w.id,
        });
      }
      fired = true;
      break;
    }
    case 'microfone': {
      const r = st.radius * area;
      game.hash.query(p.x, p.y, r + 0.6, tmp);
      for (const e of tmp) {
        if (e.dead) continue;
        const dx = e.x - p.x;
        const dy = e.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d > r + e.r) continue;
        const l = d || 1;
        game.damageEnemy(e, st.dmg * dmgMul, w.id, (dx / l) * st.knock, (dy / l) * st.knock);
      }
      game.fx.rings.push({ x: p.x, y: p.y, r0: 0.4, r1: r, t: 0, dur: 0.35, color: 'mic' });
      fired = true;
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
      pr.spin += dt * 22;
      pr.life -= dt;
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
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
      pr.h = Math.sin(k * Math.PI) * 2.2;
      if (k >= 1) {
        game.explode(pr.x, pr.y, pr.radius, pr.dmg, pr.src);
        remove = true;
      }
    } else if (pr.kind === 'moto') {
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      pr.life -= dt;
      game.hash.query(pr.x, pr.y, pr.width + 1.2, tmp);
      for (const e of tmp) {
        if (e.dead || pr.hit.has(e.id)) continue;
        const dx = e.x - pr.x;
        if (Math.abs(dx) > pr.width + e.r || Math.abs(e.y - pr.y) > 1.1) continue;
        pr.hit.add(e.id);
        game.damageEnemy(e, pr.dmg, pr.src, (dx >= 0 ? 1 : -1) * 7, -3);
      }
      if (pr.life <= 0) remove = true;
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

export function updateZones(game, dt) {
  const list = game.zones;
  for (let i = list.length - 1; i >= 0; i--) {
    const z = list[i];
    z.t += dt;
    let remove = false;
    if (z.kind === 'boleto') {
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
