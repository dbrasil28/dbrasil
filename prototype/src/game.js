// Simulação do jogo. Não toca no DOM: roda igual no navegador e nos testes (Node).
import { Camera } from './camera.js';
import { SpatialHash } from './spatial.js';
import { makeRng, hash2, weightedPick, clamp } from './math.js';
import {
  SESSION, PLAYER, ENEMIES, DIRECTOR, EVENTS, TV, ADS, WAKE, MAPS, xpToNext, caosBand,
} from './config.js';
import { fireWeapon, updateProjectiles, updateZones } from './weapons.js';
import { rollOptions, applyOption, playerStats } from './upgrades.js';

const CHUNK = 10; // metros por chunk de cenário
const tmp = [];
const pt = { x: 0, y: 0 };
const vb = {};

export class Game {
  constructor(settings, { seed = Date.now() % 1e9, viewW = 390, viewH = 844, playTop = 96, playBottom = 760 } = {}) {
    this.settings = settings;
    this.seed = seed;
    this.map = MAPS[settings.map] || MAPS.orla;
    this.camera = new Camera();
    this.view = { viewW, viewH, playTop, playBottom };
    this.hash = new SpatialHash(1.5);
    this.reset();
  }

  reset() {
    this.rng = makeRng(this.seed);
    this.t = 0;
    this.over = null; // 'victory' | 'defeat'
    this.endTimer = 0;
    this.finished = false;
    this.timeScale = 1;
    this.modal = null;
    this.pendingLevels = 0;
    this.pendingChests = 0;
    this.nextId = 1;

    this.player = {
      x: 0, y: 0, r: PLAYER.radius, hp: PLAYER.hp, level: 1, xp: 0, xpNext: xpToNext(1),
      weapons: [{ id: 'capacete', level: 1, cd: 0.4 }], passives: [],
      faceX: 1, faceY: 0, moving: false, slowT: 0, hurtT: 0, invulnT: 0, bonusDmg: 0, vx: 0, vy: 0,
      // animação do arremesso (atlas de teste): tempo desde o disparo / desde a pegada, capacetes em voo e mira
      throwT: 9, catchT: 9, helmetsOut: 0, aimX: 1, aimY: 0,
    };
    this.reviveUsed = false;
    this.rerollsLeft = this.settings.ads ? ADS.rerollsPerRun : 0;
    this.mods = { dmgMul: 1, armor: 0, enemyHpMul: 1, bossHpMul: 1, eliteDmgMul: 1, speedMul: 1 };
    this.stats = playerStats(this.player, this.mods);

    this.enemies = [];
    this.projectiles = [];
    this.enemyShots = [];
    this.zones = [];
    this.lots = [];
    this.gems = [];
    this.pickups = [];
    this.fx = { particles: [], rings: [], numbers: [], decals: [], woken: [] };
    this.outbox = [];

    this.caos = 0;
    this.caosBonus = 0;
    this.corruption = 0;
    this.audience = 0.8;
    this.kills = 0;
    this.recentKills = [];
    this.spawnAcc = 0;
    this.nextWaveAt = SESSION.firstWaveAt;
    this.pendingWave = null;
    this.nextEliteAt = SESSION.firstEliteAt;
    this.eventIndex = 0;
    this.rivalAt = -1;
    this.boss = null;
    this.bossWarned = false;
    this.tvCooldown = {};
    this.chunks = new Map();

    this.metrics = {
      seed: this.seed,
      firstLevelUpAt: null,
      levelUpTimes: [],
      killsByType: {},
      damageBySource: {},
      decisions: [],
      peakEnemies: 0,
      causeOfDeath: null,
      lastDamageSource: null,
      ads: { ofertas: { reviver: 0, trocar_cartas: 0 }, aceitos: { reviver: 0, trocar_cartas: 0 } },
    };

    this.applyView();
    this.emit('tv', { text: this.pickLine('start') });
  }

  // ---------- utilidades ----------
  emit(type, data = {}) {
    this.outbox.push({ type, ...data });
  }

  pickLine(key, arg) {
    const src = TV[key];
    const lines = typeof src === 'function' ? src(arg) : src;
    return lines[Math.floor(this.rng() * lines.length)];
  }

  tv(key, cooldown = 0, arg) {
    if (cooldown && this.tvCooldown[key] > this.t) return;
    if (cooldown) this.tvCooldown[key] = this.t + cooldown;
    this.emit('tv', { text: this.pickLine(key, arg) });
  }

  shake(amount) {
    this.emit('shake', { amount });
  }

  applyView(v) {
    if (v) Object.assign(this.view, v);
    const s = this.settings;
    const { viewW, viewH, playTop, playBottom } = this.view;
    this.camera.setAngles(s.elevation, this.map.bounded ? 0 : Number(s.yaw)); // o calçadão só funciona com ruas retas
    this.camera.setView(viewW, viewH, playTop, playBottom, s.playerPct, PLAYER.heightM);
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
  }

  // ---------- cenário (props determinísticos por chunk) ----------
  chunk(cx, cy) {
    const key = cx * 100003 + cy;
    let arr = this.chunks.get(key);
    if (arr) return arr;
    if (this.chunks.size > 900) this.chunks.clear();
    arr = [];
    const m = this.map;
    if (m.bounded) {
      // 1 obstáculo raro por pedaço, só no meio do calçadão e fora das transversais
      if (hash2(cx, cy, 1) < m.propChance) {
        const x = cx * CHUNK + hash2(cx, cy, 10) * CHUNK;
        const y = cy * CHUNK + hash2(cx, cy, 20) * CHUNK;
        const inSide = x > m.minX + 3 && x < m.sandX - 3;
        if (inSide && !this.isStreet(y) && x * x + y * y > 36) {
          const type = hash2(cx, cy, 30) < 0.6 ? 'poste' : 'cone';
          arr.push({ type, x, y, r: type === 'poste' ? 0.22 : 0.24, seed: hash2(cx, cy, 40) });
        }
      }
      this.chunks.set(key, arr);
      return arr;
    }
    const n = Math.floor(hash2(cx, cy, 1) * 3);
    for (let i = 0; i < n; i++) {
      const x = cx * CHUNK + hash2(cx, cy, 10 + i) * CHUNK;
      const y = cy * CHUNK + hash2(cx, cy, 20 + i) * CHUNK;
      if (x * x + y * y < 25) continue;
      const k = hash2(cx, cy, 30 + i);
      const type = k < 0.35 ? 'banca' : k < 0.75 ? 'poste' : 'cone';
      const r = type === 'banca' ? 0.9 : type === 'poste' ? 0.2 : 0.24;
      arr.push({ type, x, y, r, seed: hash2(cx, cy, 40 + i) });
    }
    this.chunks.set(key, arr);
    return arr;
  }

  /** Rua transversal (asfalto) do mapa da orla? */
  isStreet(y) {
    const m = this.map;
    if (!m.bounded) return false;
    const r = ((y % m.blockLen) + m.blockLen) % m.blockLen;
    return r >= m.blockLen - m.streetLen;
  }

  /** Mantém uma entidade dentro da área jogável do mapa. */
  clampToMap(e) {
    const m = this.map;
    if (!m.bounded) return;
    if (e.x < m.minX + e.r) e.x = m.minX + e.r;
    else if (e.x > m.maxX - e.r) e.x = m.maxX - e.r;
  }

  /** Ajusta um ponto de nascimento: dentro do mapa e nunca visível na tela. */
  fitSpawn(p, marginM = 1.5) {
    const m = this.map;
    if (!m.bounded) return p;
    p.x = clamp(p.x, m.minX + 0.6, m.maxX - 0.6);
    const cam = this.camera;
    cam.toScreen(p.x, p.y, pt);
    if (pt.x > -24 && pt.x < cam.viewW + 24 && pt.y > cam.playTop - 40 && pt.y < cam.viewH + 40) {
      cam.visibleWorldBounds(marginM, vb);
      p.y = p.y < this.player.y ? vb.minY : vb.maxY;
    }
    return p;
  }

  propsInBounds(b, out) {
    out.length = 0;
    if (!this.settings.obstacles) return out;
    const x0 = Math.floor(b.minX / CHUNK);
    const x1 = Math.floor(b.maxX / CHUNK);
    const y0 = Math.floor(b.minY / CHUNK);
    const y1 = Math.floor(b.maxY / CHUNK);
    for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) for (const p of this.chunk(cx, cy)) out.push(p);
    return out;
  }

  collideProps(ent) {
    if (!this.settings.obstacles) return;
    const cx0 = Math.floor((ent.x - 1.5) / CHUNK);
    const cx1 = Math.floor((ent.x + 1.5) / CHUNK);
    const cy0 = Math.floor((ent.y - 1.5) / CHUNK);
    const cy1 = Math.floor((ent.y + 1.5) / CHUNK);
    for (let cx = cx0; cx <= cx1; cx++) {
      for (let cy = cy0; cy <= cy1; cy++) {
        for (const p of this.chunk(cx, cy)) {
          const dx = ent.x - p.x;
          const dy = ent.y - p.y;
          const rr = ent.r + p.r;
          const d2 = dx * dx + dy * dy;
          if (d2 < rr * rr && d2 > 1e-8) {
            const d = Math.sqrt(d2);
            const push = rr - d;
            ent.x += (dx / d) * push;
            ent.y += (dy / d) * push;
          }
        }
      }
    }
  }

  // ---------- spawn ----------
  /** Ponto logo fora da tela, numa direção da tela (ângulo em radianos; 0 = direita, -π/2 = topo). */
  edgePoint(screenAngle, marginPx = 40) {
    const cam = this.camera;
    cam.toScreen(this.player.x, this.player.y, pt);
    const ox = pt.x;
    const oy = pt.y;
    const dx = Math.cos(screenAngle);
    const dy = Math.sin(screenAngle);
    const left = -marginPx;
    const right = cam.viewW + marginPx;
    const top = cam.playTop - marginPx;
    const bottom = cam.viewH + marginPx;
    let tx = Infinity;
    let ty = Infinity;
    if (dx > 1e-6) tx = (right - ox) / dx;
    else if (dx < -1e-6) tx = (left - ox) / dx;
    if (dy > 1e-6) ty = (bottom - oy) / dy;
    else if (dy < -1e-6) ty = (top - oy) / dy;
    const tt = Math.min(tx, ty);
    cam.toWorld(ox + dx * tt, oy + dy * tt, pt);
    return { x: pt.x, y: pt.y };
  }

  spawnEnemy(type, x, y, extra = {}) {
    const def = ENEMIES[type];
    const hpScale = def.boss ? DIRECTOR.hpScale(this.t) * this.mods.bossHpMul : DIRECTOR.hpScale(this.t) * this.mods.enemyHpMul;
    const hp = def.hp * (type === 'isca' ? 1 : hpScale);
    const e = {
      id: this.nextId++, type, x, y, r: def.radius, hp, maxHp: hp, speed: def.speed * (0.9 + this.rng() * 0.2),
      dmg: def.dmg, behavior: def.behavior, elite: !!def.elite, boss: !!def.boss,
      kx: 0, ky: 0, flash: 0, slowT: 0, slowF: 1, phase: this.rng() * 6.28, fireT: 1 + this.rng() * 2, windup: 0,
      split: false, ttl: def.ttl || 0, dead: false, tint: Math.floor(this.rng() * 8), walk: this.rng() * 10,
      ...extra,
    };
    this.enemies.push(e);
    return e;
  }

  spawnCommon() {
    const comp = DIRECTOR.composition(this.caos);
    let pick = weightedPick(this.rng, comp).type;
    if (pick === 'burocrata' && this.countType('burocrata') >= DIRECTOR.maxBurocratas) pick = 'telespectador';
    const ang = this.rng() * Math.PI * 2;
    const p = this.fitSpawn(this.edgePoint(ang, 30 + this.rng() * 60));
    this.spawnEnemy(pick, p.x, p.y);
  }

  countType(type) {
    let n = 0;
    for (const e of this.enemies) if (e.type === type && !e.dead) n++;
    return n;
  }

  startWave() {
    const dirs = [
      { name: 'NORTE', a: -Math.PI / 2 },
      { name: 'SUL', a: Math.PI / 2 },
      { name: 'LESTE', a: 0 },
      { name: 'OESTE', a: Math.PI },
    ];
    // no calçadão, as ondas vêm de cima ou de baixo (onde a tela mostra mais)
    const pool = this.map.bounded ? dirs.slice(0, 2) : dirs;
    const d = pool[Math.floor(this.rng() * pool.length)];
    this.pendingWave = { at: this.t + 3, dir: d };
    this.tv('wave', 0, d.name);
    this.emit('warn', { angle: d.a, dur: 3 });
  }

  releaseWave() {
    const { dir } = this.pendingWave;
    this.pendingWave = null;
    const n = Math.round((18 + this.caos * 0.32) * this.settings.spawnMul);
    const base = this.fitSpawn(this.edgePoint(dir.a, 60 + 3.5 * this.camera.ppu), 4.8);
    for (let i = 0; i < n; i++) {
      if (this.enemies.length >= this.settings.maxEnemies + 60) break;
      const a = this.rng() * Math.PI * 2;
      const r = Math.sqrt(this.rng()) * 3.2;
      const e = this.spawnEnemy('telespectador', base.x + Math.cos(a) * r, base.y + Math.sin(a) * r);
      e.speed *= 1.15;
    }
  }

  spawnElite(type = 'politico') {
    const p = this.fitSpawn(this.edgePoint(this.rng() * Math.PI * 2, 50));
    this.spawnEnemy(type, p.x, p.y);
    this.tv(type === 'rival' ? 'rival' : 'elite', type === 'rival' ? 0 : 25);
    this.emit('elite', { type });
  }

  spawnBoss() {
    const p = this.fitSpawn(this.edgePoint(-Math.PI / 2, 80));
    this.boss = this.spawnEnemy('especulador', p.x, p.y, { lotT: 3.5, despejoT: 9 });
    this.caosBonus += 10;
    this.tv('boss');
    this.emit('boss', {});
    this.shake(0.5);
  }

  // ---------- dano ----------
  damageEnemy(e, amount, source, kx = 0, ky = 0, quiet = false) {
    if (e.dead) return;
    let dmg = amount;
    if (e.elite) dmg *= this.stats.eliteDmgMul;
    e.hp -= dmg;
    e.flash = 0.09;
    const mass = e.boss ? 0.08 : e.elite ? 0.35 : 1;
    e.kx += kx * mass;
    e.ky += ky * mass;
    if (this.settings.damageNumbers && !quiet && this.fx.numbers.length < (this.enemies.length > 220 ? 8 : 30)) {
      this.fx.numbers.push({ x: e.x, y: e.y, v: Math.round(dmg), t: 0, big: dmg >= 40 });
    }
    if (e.type === 'golpista' && !e.split && e.hp > 0) {
      e.split = true;
      for (let i = 0; i < 2; i++) {
        const a = this.rng() * Math.PI * 2;
        this.spawnEnemy('isca', e.x + Math.cos(a) * 0.9, e.y + Math.sin(a) * 0.9, { tint: e.tint });
      }
    }
    if (e.hp <= 0) this.killEnemy(e, source);
  }

  explode(x, y, radius, dmg, source) {
    this.hash.query(x, y, radius + 0.6, tmp);
    for (const e of tmp) {
      if (e.dead) continue;
      const dx = e.x - x;
      const dy = e.y - y;
      const d = Math.hypot(dx, dy);
      if (d > radius + e.r) continue;
      const l = d || 1;
      this.damageEnemy(e, dmg, source, (dx / l) * 4, (dy / l) * 4);
    }
    this.fx.rings.push({ x, y, r0: 0.2, r1: radius, t: 0, dur: 0.3, color: 'blast' });
    this.shake(0.18);
  }

  killEnemy(e, source) {
    e.dead = true;
    if (e.type === 'isca') {
      this.burst(e.x, e.y, 5, 'glitch');
      return;
    }
    this.kills++;
    this.metrics.killsByType[e.type] = (this.metrics.killsByType[e.type] || 0) + 1;
    this.recentKills.push(this.t);
    const def = ENEMIES[e.type];
    // a TV ganha audiência com espetáculo (elites) e perde cada telespectador que acorda
    if (def.wakes) this.audience = Math.max(WAKE.audienceFloor, this.audience - WAKE.audienceLoss);
    else this.audience += e.elite ? 0.05 : 0.0012;
    if (this.kills === 1) this.tv('firstKill');

    if (def.xp) this.dropGem(e.x, e.y, def.xp);
    if (e.type === 'telespectador' && this.rng() < 0.012 && this.pickups.filter((p) => p.kind === 'pastel').length < 3) {
      this.pickups.push({ kind: 'pastel', x: e.x, y: e.y, t: 0 });
    }
    if (e.elite && !e.boss) {
      this.pickups.push({ kind: 'propina', x: e.x + 0.6, y: e.y, t: 0 });
      this.pickups.push({ kind: 'maleta', x: e.x - 0.6, y: e.y, t: 0, magnet: true });
    }
    if (def.wakes) this.wake(e);
    else {
      this.burst(e.x, e.y, e.elite ? 26 : 9, 'blood');
      if (this.settings.gore && this.fx.decals.length < 140) {
        this.fx.decals.push({ x: e.x, y: e.y, r: (e.elite ? 0.8 : 0.4) * (0.7 + this.rng() * 0.6), t: 0, rot: this.rng() * 6 });
      }
    }

    if (e.boss) this.bossDefeated();
  }

  /** MECH-001: o telespectador acorda, para de lutar e vai embora (efeito visual, sem colisão). */
  wake(e) {
    this.burst(e.x, e.y, 6, 'static');
    if (this.fx.woken.length >= WAKE.maxFx) this.fx.woken.shift();
    const p = this.player;
    const dx = e.x - p.x;
    const dy = e.y - p.y;
    const l = Math.hypot(dx, dy) || 1;
    this.fx.woken.push({ x: e.x, y: e.y, vx: (dx / l) * WAKE.walkSpeed, vy: (dy / l) * WAKE.walkSpeed, t: 0, tint: e.tint, walk: e.walk, id: e.id, flipFix: e.flipFix });
  }

  bossDefeated() {
    this.boss = null;
    this.lots.length = 0;
    // "despejo" final: a horda visível vai embora junto
    for (const o of this.enemies) {
      if (!o.dead) {
        o.dead = true;
        if (ENEMIES[o.type].wakes) this.wake(o);
        else this.burst(o.x, o.y, 4, 'blood');
      }
    }
    this.tv('victory');
    this.shake(0.8);
    this.emit('flash', {});
    this.finish('victory');
  }

  finish(kind) {
    if (this.over) return;
    this.over = kind;
    this.endTimer = kind === 'victory' ? 1.6 : 1.0;
    this.timeScale = 0.3;
    this.modal = null;
  }

  burst(x, y, n, kind) {
    if (kind === 'blood' && !this.settings.gore) n = Math.ceil(n / 3);
    const parts = this.fx.particles;
    const cap = this.enemies.length > 220 ? 120 : 260;
    for (let i = 0; i < n && parts.length < cap; i++) {
      const a = this.rng() * Math.PI * 2;
      const s = 1 + this.rng() * 3.5;
      parts.push({ x, y, z: 0.7 + this.rng() * 0.5, vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: 1 + this.rng() * 3, t: 0, life: 0.45 + this.rng() * 0.4, kind });
    }
  }

  dropGem(x, y, v) {
    if (this.gems.length >= 400) {
      // Limite atingido: recicla a gema mais distante do jogador (XP esquecida para trás)
      // e soma o valor dela à gema nova, que nasce perto da ação.
      const p = this.player;
      let far = 0;
      let fd = -1;
      for (let i = 0; i < this.gems.length; i++) {
        const g = this.gems[i];
        if (g.pull) continue;
        const d = (g.x - p.x) ** 2 + (g.y - p.y) ** 2;
        if (d > fd) {
          fd = d;
          far = i;
        }
      }
      const old = this.gems[far];
      old.x = x;
      old.y = y;
      old.v += v;
      old.pull = false;
      return;
    }
    this.gems.push({ x, y, v, pull: false });
  }

  hurtPlayer(amount, source) {
    const p = this.player;
    if (p.invulnT > 0) return;
    const dmg = amount * (1 - this.stats.armor);
    p.hp -= dmg;
    p.hurtT = 0.12;
    this.metrics.damageBySource[source] = (this.metrics.damageBySource[source] || 0) + dmg;
    this.metrics.lastDamageSource = source;
  }

  // ---------- escolhas ----------
  openModalIfNeeded() {
    if (this.modal || this.over) return;
    if (this.eventIndex < SESSION.eventTimes.length && this.t >= SESSION.eventTimes[this.eventIndex]) {
      const ev = EVENTS[this.eventIndex];
      this.eventIndex++;
      this.modal = { kind: 'event', event: ev, corruption: this.corruption };
      this.emit('modal', {});
      return;
    }
    if (this.pendingChests > 0) {
      this.modal = { kind: 'chest', options: rollOptions(this.player, this.rng, 3) };
      if (this.rerollsLeft > 0) this.metrics.ads.ofertas.trocar_cartas++;
      this.emit('modal', {});
      return;
    }
    if (this.pendingLevels > 0) {
      this.modal = { kind: 'levelup', level: this.player.level - this.pendingLevels + 1, options: rollOptions(this.player, this.rng, 3) };
      if (this.rerollsLeft > 0) this.metrics.ads.ofertas.trocar_cartas++;
      this.emit('modal', {});
    }
  }

  chooseOption(index) {
    const m = this.modal;
    if (!m || !m.options) return;
    const opt = m.options[index];
    if (!opt) return;
    applyOption(this.player, opt);
    if (m.kind === 'chest') this.pendingChests--;
    else this.pendingLevels--;
    this.modal = null;
    this.stats = playerStats(this.player, this.mods);
    this.player.hp = Math.min(this.player.hp, this.stats.maxHp);
    if (opt.kind === 'evolution') this.emit('tv', { text: 'EVOLUÇÃO! ENTREGA EXPRESSA GARANTIDA OU SEU DINHEIRO DE VOLTA (NÃO)' });
  }

  die() {
    this.tv('death');
    this.finish('defeat');
  }

  /** Resposta à oferta de segunda chance. `watched` = assistiu o anúncio até o fim. */
  chooseRevive(watched) {
    if (!this.modal || this.modal.kind !== 'revive') return;
    this.modal = null;
    this.reviveUsed = true;
    if (!watched) {
      this.die();
      return;
    }
    this.metrics.ads.aceitos.reviver++;
    const p = this.player;
    p.hp = this.stats.maxHp * ADS.reviveHpFrac;
    p.invulnT = ADS.reviveInvuln;
    const r = ADS.reviveClearRadius;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const d = Math.hypot(dx, dy);
      if (d > r + 1) continue;
      if (!e.elite) this.killEnemy(e, 'reviver');
      else {
        const l = d || 1;
        e.kx += (dx / l) * 8;
        e.ky += (dy / l) * 8;
      }
    }
    this.enemyShots.length = 0;
    this.fx.rings.push({ x: p.x, y: p.y, r0: 0.3, r1: r, t: 0, dur: 0.45, color: 'mic' });
    this.metrics.causeOfDeath = null;
    this.tv('revive');
    this.shake(0.4);
  }

  /** Um capacete voltou para a mão (animação de pegar). */
  helmetBack() {
    const p = this.player;
    p.helmetsOut = Math.max(0, p.helmetsOut - 1);
    p.catchT = 0;
  }

  /** Troca as 3 cartas da escolha atual (anúncio recompensado). */
  rerollOptions() {
    const m = this.modal;
    if (!m || !m.options || this.rerollsLeft <= 0) return false;
    this.rerollsLeft--;
    this.metrics.ads.aceitos.trocar_cartas++;
    m.options = rollOptions(this.player, this.rng, 3);
    return true;
  }

  chooseEvent(accept) {
    const m = this.modal;
    if (!m || m.kind !== 'event') return;
    const id = m.event.id;
    this.metrics.decisions.push({ event: id, accept, t: Math.round(this.t) });
    if (id === 'patrocinio') {
      if (accept) {
        this.mods.dmgMul *= 1.4;
        this.corruption += 30;
        this.caosBonus += 10;
      } else {
        this.mods.armor = Math.min(0.6, this.mods.armor + 0.2);
        this.rivalAt = this.t + 12;
      }
    } else if (id === 'emenda') {
      if (accept) {
        this.pendingLevels += 2;
        this.mods.enemyHpMul *= 1.25;
        this.corruption += 25;
      } else {
        this.player.hp = this.stats.maxHp;
      }
    } else if (id === 'acordao') {
      if (accept) {
        this.mods.bossHpMul *= 0.6;
        this.corruption += 30;
        this.caosBonus += 15;
      } else {
        this.mods.eliteDmgMul *= 1.2;
      }
    }
    this.corruption = clamp(this.corruption, 0, 100);
    this.tv(accept ? 'accept' : 'refuse');
    this.modal = null;
    this.stats = playerStats(this.player, this.mods);
    this.player.hp = Math.min(this.player.hp, this.stats.maxHp);
  }

  // ---------- loop ----------
  update(rawDt, input) {
    if (this.finished) return;
    if (this.over) {
      this.endTimer -= rawDt;
      if (this.endTimer <= 0) this.finished = true;
    }
    if (this.modal) return;
    const dt = rawDt * this.timeScale;
    this.t += dt;

    this.caos = clamp(DIRECTOR.caosFromTime(this.t) + this.caosBonus, 0, 100);

    // Montar a grade espacial com as posições do início do quadro.
    this.hash.clear();
    for (const e of this.enemies) if (!e.dead) this.hash.insert(e);

    if (!this.over) {
      this.updatePlayer(dt, input);
      this.updateDirector(dt);
      this.updateWeapons(dt);
    }
    this.updateEnemies(dt);
    updateProjectiles(this, dt);
    updateZones(this, dt);
    this.updateEnemyShots(dt);
    this.updateLots(dt);
    this.updatePickups(dt);
    this.updateFx(dt);
    this.compact();

    this.camera.x = this.player.x;
    this.camera.y = this.player.y;

    if (this.enemies.length > this.metrics.peakEnemies) this.metrics.peakEnemies = this.enemies.length;

    // multi-kill para a TV
    while (this.recentKills.length && this.recentKills[0] < this.t - 2) this.recentKills.shift();
    if (this.recentKills.length >= 18) this.tv('multikill', 25);

    if (!this.over && this.player.hp <= 0) {
      this.player.hp = 0;
      this.metrics.causeOfDeath = this.metrics.lastDamageSource;
      if (this.settings.ads && !this.reviveUsed) {
        // Segunda chance por anúncio recompensado (1 por partida)
        this.modal = { kind: 'revive' };
        this.metrics.ads.ofertas.reviver++;
        this.emit('modal', {});
        return;
      }
      this.die();
    }
    if (!this.over && this.player.hp < this.stats.maxHp * 0.25) this.tv('lowHp', 30);

    this.openModalIfNeeded();
  }

  updatePlayer(dt, input) {
    const p = this.player;
    const st = this.stats;
    let mx = 0;
    let my = 0;
    const mag = Math.min(1, Math.hypot(input.x, input.y));
    if (mag > 0.05) {
      this.camera.screenDirToWorld(input.x, input.y, pt);
      mx = pt.x * mag;
      my = pt.y * mag;
      p.faceX = pt.x;
      p.faceY = pt.y;
    }
    p.moving = mag > 0.05;
    if (p.slowT > 0) p.slowT -= dt;
    const speed = PLAYER.speed * st.speedMul * (p.slowT > 0 ? 0.6 : 1);
    p.vx = mx * speed;
    p.vy = my * speed;
    const onSand = this.map.bounded && p.x > this.map.sandX;
    p.x += p.vx * dt * (onSand ? this.map.sandSpeedMul : 1);
    p.y += p.vy * dt * (onSand ? this.map.sandSpeedMul : 1);
    this.collideProps(p);
    this.clampToMap(p);
    if (p.hurtT > 0) p.hurtT -= dt;
    if (p.invulnT > 0) p.invulnT -= dt;
    p.throwT += dt;
    p.catchT += dt;

    // dano por contato
    this.hash.query(p.x, p.y, p.r + 1.2, tmp);
    let worst = null;
    let worstDmg = 0;
    for (const e of tmp) {
      if (e.dead || e.dmg <= 0) continue;
      const rr = p.r + e.r + 0.05;
      if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 > rr * rr) continue;
      const d = e.dmg * dt;
      if (d > worstDmg) {
        worstDmg = d;
        worst = e.type;
      }
      this.hurtPlayer(d, e.type);
      if (e.type === 'fiscal' && !(e.fineCd > 0)) {
        e.fineCd = 2.5;
        const fine = Math.min(p.xp, ENEMIES.fiscal.fine + p.level);
        p.xp -= fine;
        p.slowT = Math.max(p.slowT, 0.8);
        this.emit('fine', { amount: fine });
        this.tv('fiscal', 30);
      }
    }
    if (worst) this.metrics.lastDamageSource = worst;

    // lotes vendidos machucam
    for (const lot of this.lots) {
      if (lot.state === 'sold' && Math.abs(p.x - lot.x) < lot.half && Math.abs(p.y - lot.y) < lot.half) {
        this.hurtPlayer(22 * dt, 'lote');
      }
    }

    // coleta
    const magnet = PLAYER.magnet * st.magnetMul;
    for (const g of this.gems) {
      const d2 = (g.x - p.x) ** 2 + (g.y - p.y) ** 2;
      if (!g.pull && d2 < magnet * magnet) g.pull = true;
      if (g.pull) {
        const d = Math.sqrt(d2) || 1;
        const sp = 7 + (magnet / d) * 3;
        g.x += ((p.x - g.x) / d) * sp * dt;
        g.y += ((p.y - g.y) / d) * sp * dt;
        if (d < 0.4) {
          g.dead = true;
          this.gainXp(g.v);
        }
      }
    }
  }

  gainXp(v) {
    const p = this.player;
    p.xp += v;
    while (p.xp >= p.xpNext) {
      p.xp -= p.xpNext;
      p.level++;
      p.xpNext = xpToNext(p.level);
      this.pendingLevels++;
      if (this.metrics.firstLevelUpAt === null) this.metrics.firstLevelUpAt = Math.round(this.t * 10) / 10;
      this.metrics.levelUpTimes.push(Math.round(this.t));
      if (p.level % 5 === 0) this.tv('levelUp', 20);
    }
  }

  updateDirector(dt) {
    const s = this.settings;
    const cap = s.maxEnemies;
    const target = Math.min(cap, DIRECTOR.targetAlive(this.caos) * s.spawnMul);
    this.spawnAcc += DIRECTOR.spawnPerSec(this.caos) * s.spawnMul * dt;
    let alive = 0;
    for (const e of this.enemies) if (!e.dead && !e.elite) alive++;
    while (this.spawnAcc >= 1) {
      this.spawnAcc -= 1;
      if (alive < target) {
        this.spawnCommon();
        alive++;
      }
    }
    if (this.spawnAcc > 5) this.spawnAcc = 5;

    if (this.t >= this.nextWaveAt && !this.boss) {
      this.nextWaveAt += SESSION.waveEvery;
      this.startWave();
    }
    if (this.pendingWave && this.t >= this.pendingWave.at) this.releaseWave();

    if (this.t >= this.nextEliteAt && this.t < SESSION.bossAt) {
      this.nextEliteAt += DIRECTOR.eliteEvery(this.caos);
      this.spawnElite('politico');
    }
    if (this.rivalAt > 0 && this.t >= this.rivalAt) {
      this.rivalAt = -1;
      this.spawnElite('rival');
    }
    if (!this.bossWarned && this.t >= SESSION.bossWarnAt) {
      this.bossWarned = true;
      this.tv('bossWarn');
    }
    if (!this.boss && this.t >= SESSION.bossAt && !this.bossSpawned) {
      this.bossSpawned = true;
      this.spawnBoss();
    }
  }

  updateWeapons(dt) {
    for (const w of this.player.weapons) {
      w.cd -= dt;
      if (w.cd <= 0) {
        const res = fireWeapon(this, w, this.stats);
        w.cd = res.fired ? res.cd : 0.25;
      }
    }
  }

  updateEnemies(dt) {
    const p = this.player;
    const recycle2 = (Math.max(this.camera.viewW, this.camera.viewH) / this.camera.ppu) ** 2 * 1.4;
    for (const e of this.enemies) {
      if (e.dead) continue;
      if (e.flash > 0) e.flash -= dt;
      if (e.slowT > 0) e.slowT -= dt;
      if (e.ttl) {
        e.ttl -= dt;
        if (e.ttl <= 0) {
          this.killEnemy(e, 'tempo');
          continue;
        }
      }
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      const ux = dx / d;
      const uy = dy / d;
      const spd = e.speed * (e.slowT > 0 ? e.slowF : 1) * (this.over ? 0.2 : 1);
      let mx = ux;
      let my = uy;

      if (e.behavior === 'zigzag') {
        const a = Math.sin(this.t * 3.2 + e.phase) * 0.85;
        const c = Math.cos(a);
        const s = Math.sin(a);
        mx = ux * c - uy * s;
        my = ux * s + uy * c;
      } else if (e.behavior === 'ranged') {
        const def = ENEMIES.burocrata;
        if (d < def.range * 0.65) {
          mx = -ux * 0.6;
          my = -uy * 0.6;
        } else if (d < def.range) {
          mx = -uy * 0.45;
          my = ux * 0.45;
        }
        if (e.windup > 0) {
          e.windup -= dt;
          mx *= 0.1;
          my *= 0.1;
          if (e.windup <= 0) {
            this.enemyShots.push({ x: e.x, y: e.y, vx: ux * 6, vy: uy * 6, life: 2.6, r: 0.25, spin: 0 });
            this.tv('burocrata', 40);
          }
        } else if (d < def.range + 2 && !this.over) {
          e.fireT -= dt;
          if (e.fireT <= 0) {
            e.fireT = def.fireEvery;
            e.windup = 0.45;
          }
        }
      } else if (e.behavior === 'intercept') {
        // mira no ponto onde o jogador estará daqui a ~1 s
        const lead = Math.min(1.2, d / 4);
        const tx = p.x + p.vx * lead - e.x;
        const ty = p.y + p.vy * lead - e.y;
        const tl = Math.hypot(tx, ty) || 1;
        mx = tx / tl;
        my = ty / tl;
        if (e.fineCd > 0) e.fineCd -= dt;
      } else if (e.behavior === 'boss') {
        this.updateBoss(e, dt);
      }

      const sandMul = this.map.bounded && e.x > this.map.sandX ? this.map.enemySandMul : 1;
      e.x += (mx * spd * sandMul + e.kx) * dt;
      e.y += (my * spd * sandMul + e.ky) * dt;
      this.clampToMap(e);
      const decay = Math.exp(-9 * dt);
      e.kx *= decay;
      e.ky *= decay;
      e.walk += dt * spd * 3;

      if (!e.elite && d * d > recycle2) {
        // reposiciona quem ficou muito para trás (padrão do gênero)
        const np = this.fitSpawn(this.edgePoint(this.rng() * Math.PI * 2, 40));
        e.x = np.x;
        e.y = np.y;
      }
    }

    // separação entre inimigos (empurra metade para cada lado)
    for (const e of this.enemies) {
      if (e.dead) continue;
      this.hash.query(e.x, e.y, e.r * 2 + 0.2, tmp);
      for (const o of tmp) {
        if (o === e || o.dead || o.id < e.id) continue;
        const dx = o.x - e.x;
        const dy = o.y - e.y;
        const rr = (e.r + o.r) * 0.9;
        const d2 = dx * dx + dy * dy;
        if (d2 >= rr * rr || d2 < 1e-8) continue;
        const d = Math.sqrt(d2);
        const push = (rr - d) * 0.5;
        const me = e.boss ? 0.1 : e.elite ? 0.4 : 1;
        const mo = o.boss ? 0.1 : o.elite ? 0.4 : 1;
        const sum = me + mo;
        e.x -= (dx / d) * push * (me / sum) * 2;
        e.y -= (dy / d) * push * (me / sum) * 2;
        o.x += (dx / d) * push * (mo / sum) * 2;
        o.y += (dy / d) * push * (mo / sum) * 2;
      }
      if (e.elite || (e.id & 1) === (this.frameParity ? 1 : 0)) this.collideProps(e);
    }
    this.frameParity = !this.frameParity;
  }

  updateBoss(e, dt) {
    if (this.over) return;
    e.lotT -= dt;
    if (e.lotT <= 0) {
      e.lotT = 5.5;
      const p = this.player;
      const half = 1.7 + this.rng() * 1.0;
      const lead = 0.9;
      this.lots.push({
        x: p.x + p.vx * lead + (this.rng() - 0.5) * 2.5,
        y: p.y + p.vy * lead + (this.rng() - 0.5) * 2.5,
        half, state: 'warn', t: 0, warnT: 1.6,
      });
      const sold = this.lots.filter((l) => l.state === 'sold');
      if (sold.length > 6) this.lots.splice(this.lots.indexOf(sold[0]), 1);
    }
    e.despejoT -= dt;
    if (e.despejoT <= 0) {
      e.despejoT = 12;
      const p = this.player;
      const n = 10;
      const off = this.rng() * Math.PI * 2;
      for (let i = 0; i < n; i++) {
        const a = off + (i / n) * Math.PI * 2;
        const sp = this.fitSpawn({ x: p.x + Math.cos(a) * 9.5, y: p.y + Math.sin(a) * 9.5 });
        this.spawnEnemy('telespectador', sp.x, sp.y);
      }
    }
  }

  updateLots(dt) {
    for (const lot of this.lots) {
      lot.t += dt;
      if (lot.state === 'warn' && lot.t >= lot.warnT) {
        lot.state = 'sold';
        this.tv('lot', 14);
        this.shake(0.15);
      }
    }
  }

  updateEnemyShots(dt) {
    const p = this.player;
    const list = this.enemyShots;
    for (let i = list.length - 1; i >= 0; i--) {
      const s = list[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      s.spin += dt * 8;
      const rr = s.r + p.r;
      let remove = s.life <= 0;
      if (!remove && !this.over && (s.x - p.x) ** 2 + (s.y - p.y) ** 2 < rr * rr) {
        this.hurtPlayer(6, 'burocrata');
        p.slowT = 1.5;
        remove = true;
      }
      if (remove) {
        list[i] = list[list.length - 1];
        list.pop();
      }
    }
  }

  updatePickups(dt) {
    const p = this.player;
    for (const k of this.pickups) {
      k.t += dt;
      const d2 = (k.x - p.x) ** 2 + (k.y - p.y) ** 2;
      if (k.magnet) {
        const d = Math.sqrt(d2) || 1;
        if (d < PLAYER.magnet * this.stats.magnetMul * 1.5) {
          k.x += ((p.x - k.x) / d) * 6 * dt;
          k.y += ((p.y - k.y) / d) * 6 * dt;
        }
      }
      if (this.over || d2 > 0.6 * 0.6) continue;
      k.dead = true;
      if (k.kind === 'pastel') {
        p.hp = Math.min(this.stats.maxHp, p.hp + 30);
        this.emit('pickup', { kind: 'pastel' });
      } else if (k.kind === 'propina') {
        // não é puxada pelo ímã: pegar é uma escolha do jogador
        p.hp = Math.min(this.stats.maxHp, p.hp + 15);
        this.corruption = clamp(this.corruption + 5, 0, 100);
        this.tv('propina', 20);
        this.emit('pickup', { kind: 'propina' });
      } else if (k.kind === 'maleta') {
        this.pendingChests++;
        this.emit('pickup', { kind: 'maleta' });
      }
    }
  }

  updateFx(dt) {
    const fx = this.fx;
    for (const w of fx.woken) {
      w.t += dt;
      w.x += w.vx * dt;
      w.y += w.vy * dt;
      w.walk += dt * 5;
    }
    if (fx.woken.length && fx.woken[0].t >= WAKE.fadeS) fx.woken = fx.woken.filter((w) => w.t < WAKE.fadeS);
    for (const q of fx.particles) {
      q.t += dt;
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.vz -= 12 * dt;
      q.z = Math.max(0, q.z + q.vz * dt);
      if (q.z === 0) {
        q.vx *= 0.8;
        q.vy *= 0.8;
      }
    }
    for (const r of fx.rings) r.t += dt;
    for (const n of fx.numbers) n.t += dt;
    for (const d of fx.decals) d.t += dt;
    fx.particles = fx.particles.filter((q) => q.t < q.life);
    fx.rings = fx.rings.filter((r) => r.t < r.dur);
    fx.numbers = fx.numbers.filter((n) => n.t < 0.7);
    fx.decals = fx.decals.filter((d) => d.t < 10);
  }

  compact() {
    if (this.enemies.some((e) => e.dead)) this.enemies = this.enemies.filter((e) => !e.dead);
    if (this.gems.some((g) => g.dead)) this.gems = this.gems.filter((g) => !g.dead);
    if (this.pickups.some((k) => k.dead)) this.pickups = this.pickups.filter((k) => !k.dead);
  }

  /**
   * Atalho de teste: começa a partida em `target` segundos com uma build plausível
   * (1 melhoria a cada ~20 s, escolhida ao acaso). Propostas anteriores são puladas.
   */
  fastForward(target) {
    if (target <= 0) return;
    const levels = Math.floor(target / 20);
    for (let i = 0; i < levels; i++) {
      const opts = rollOptions(this.player, this.rng, 3);
      applyOption(this.player, opts[Math.floor(this.rng() * opts.length)]);
      this.player.level++;
    }
    this.player.xpNext = xpToNext(this.player.level);
    this.t = target;
    while (this.eventIndex < SESSION.eventTimes.length && SESSION.eventTimes[this.eventIndex] <= target) this.eventIndex++;
    this.nextWaveAt = target + 15;
    this.nextEliteAt = target + 20;
    this.bossWarned = target >= SESSION.bossWarnAt;
    this.stats = playerStats(this.player, this.mods);
    this.player.hp = this.stats.maxHp;
    this.metrics.fastForwardFrom = target;
  }

  // ---------- leitura para HUD / métricas ----------
  get band() {
    return caosBand(this.caos);
  }

  summary() {
    const m = this.metrics;
    return {
      resultado: this.over === 'victory' ? 'vitória' : this.over === 'defeat' ? 'derrota' : 'em andamento',
      tempo_s: Math.round(this.t),
      nivel: this.player.level,
      abates: this.kills,
      abates_por_tipo: m.killsByType,
      caos_final: Math.round(this.caos),
      corrupcao_final: this.corruption,
      decisoes: m.decisions,
      primeira_melhoria_s: m.firstLevelUpAt,
      melhorias_em_s: m.levelUpTimes,
      dano_recebido_por_fonte: Object.fromEntries(Object.entries(m.damageBySource).map(([k, v]) => [k, Math.round(v)])),
      causa_da_derrota: m.causeOfDeath,
      pico_inimigos: m.peakEnemies,
      armas: this.player.weapons.map((w) => `${w.id}:${w.level}`),
      passivas: this.player.passives.map((p) => `${p.id}:${p.level}`),
      anuncios_na_partida: m.ads,
      seed: this.seed,
    };
  }
}
