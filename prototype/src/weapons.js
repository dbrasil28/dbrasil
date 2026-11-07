// Comportamento das armas automáticas e dos projéteis. Tudo em metros/segundos.
import { weaponStats } from './upgrades.js';
import { INTERACT, WEAPON_FX } from './config.js';

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
    case 'capacete': {
      // vai e volta mirando a horda (é a arma inicial: quem foge precisa acertar o que vem atrás);
      // sem ninguém perto, vai para onde ele anda. Vários capacetes abrem em leque
      const t0 = nearestEnemies(game, p.x, p.y, 9, 1)[0];
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
      const targets = nearestEnemies(game, p.x, p.y, 9, st.count);
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
      const perto = nearestEnemies(game, p.x, p.y, st.range, 10);
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
      p.aimX = linhas[0].x;
      p.aimY = linhas[0].y;
      p.throwT = 0;
      for (let i = 0; i < st.count; i++) {
        for (const { x: ax, y: ay } of linhas) {
          // o primeiro de cada linha já sai voando; os outros esperam a vez na fila
          const delay = i * st.gap;
          game.projectiles.push({
            kind: 'slipper', x: p.x, y: p.y, delay, speed: st.speed, ax, ay,
            vx: delay > 0 ? 0 : ax * st.speed, vy: delay > 0 ? 0 : ay * st.speed,
            life: 0.75, pierce: st.pierce, dmg: st.dmg * dmgMul, r: 0.28, hit: new Set(), spin: 0, src: w.id,
          });
        }
      }
      game.word(p.x, p.y, 'PÁ!', '#ffd21f');
      fired = true;
      break;
    }
    case 'boleto': {
      // boletos girando em volta do Juninho (seguem ele), cobrando de quem encosta
      game.zones.push({
        kind: 'orbita', x: p.x, y: p.y, t: 0, dur: st.duration, n: st.count, r: st.radius * area, spin: st.spin,
        ang: game.rng() * Math.PI * 2, dmg: st.dmg * dmgMul, every: st.hitEvery, hits: new Map(), pts: [], src: w.id,
      });
      fired = true;
      break;
    }
    case 'carimbo': {
      // cai do céu: sombra no chão e o carimbão descendo em cima de inimigos da tela
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
      // joga para cima: a maleta faz um arco para um lado (alterna esquerda e direita) e cai abrindo
      for (let i = 0; i < st.count; i++) {
        w.side = st.count > 1 ? (i === 0 ? 1 : -1) : -(w.side || -1);
        const tx = p.x + w.side * st.sideM;
        const ty = p.y + (game.rng() - 0.5) * 1.6;
        game.projectiles.push({
          kind: 'lob', sx: p.x, sy: p.y, x: p.x, y: p.y, tx, ty, t: 0, dur: st.flightS, arcH: st.arcM,
          dmg: st.dmg * dmgMul, radius: st.radius * area, h: 0, hit: new Set(), src: w.id,
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
      fired = true;
      break;
    }
    case 'gato': {
      // Gato de Luz: o choque acerta o mais perto e pula para os vizinhos
      const seen = new Set();
      for (let c = 0; c < st.count; c++) {
        let cur = nearestEnemies(game, p.x, p.y, st.range, 1, seen)[0];
        if (!cur) break;
        const pts = [{ x: p.x, y: p.y }];
        for (let k = 0; k < st.chain && cur; k++) {
          pts.push({ x: cur.x, y: cur.y });
          seen.add(cur.id);
          game.damageEnemy(cur, st.dmg * dmgMul, w.id, 0, 0);
          cur.slowT = Math.max(cur.slowT, st.stunS);
          cur.slowF = Math.min(cur.slowF || 1, 0.2);
          const nx = nearestEnemies(game, cur.x, cur.y, st.jumpM, 1, seen)[0];
          cur = nx || null;
        }
        game.fx.bolts.push({ pts, t: 0, dur: WEAPON_FX.raioDur, seed: game.fxRng() * 1000 });
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
      if (pr.hit && k > 0.55) {
        // na descida atravessa quem estiver embaixo
        game.hash.query(pr.x, pr.y, 1.2, tmp);
        for (const e of tmp) {
          if (e.dead || pr.hit.has(e.id)) continue;
          if ((e.x - pr.x) ** 2 + (e.y - pr.y) ** 2 > (0.55 + e.r) ** 2) continue;
          pr.hit.add(e.id);
          game.damageEnemy(e, pr.dmg * WEAPON_FX.maletaPierce, pr.src, 0, 0);
        }
      }
      if (k >= 1) {
        game.explode(pr.x, pr.y, pr.radius, pr.dmg, pr.src);
        if (pr.hit) game.moneyBurst(pr.x, pr.y, 14);
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
  const p = game.player;
  for (let i = list.length - 1; i >= 0; i--) {
    const z = list[i];
    z.t += dt;
    let remove = false;
    if (z.kind === 'orbita') {
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
        }
      }
      if (d.st === 'late' && !d.hitDone && d.at >= F.latidoS * F.latidoPico) {
        d.hitDone = true;
        game.word(d.x, d.y - 0.2, 'AU AU!', '#f2efe8');
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
