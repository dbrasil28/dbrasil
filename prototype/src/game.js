// Simulação do jogo. Não toca no DOM: roda igual no navegador e nos testes (Node).
import { Camera } from './camera.js';
import { SpatialHash } from './spatial.js';
import { makeRng, hash2, weightedPick, clamp } from './math.js';
import {
  ENEMY_POSE,
  SESSION, PLAYER, ENEMIES, DIRECTOR, EVENTS, TV, ADS, WAKE, MAPS, xpToNext, caosBand,
  ROUTE, INTERACT, THROWABLES, HEALS, HEAL_RESPAWN_S, ACAI_BUFF, GORJETAS, MELHORIAS, GORE, AVENIDA, CENARIO, CARREIRA, ABERTURA, HORDA, WEAPON_FX,
} from './config.js';
import { sortearAchados, updateAchados, fecharCofre } from './achados.js';
import { updateCrises, criseLentidao } from './crises.js';
import { emHorda, iniciarHorda, updateHorda, durezaHorda } from './horda.js';
import { iniciarAbertura, updateAbertura, pularAbertura, emAbertura, comecoLento } from './abertura.js';
import { covilDe, caosDoTrecho, pressaoDoTrecho, tempoNoTrecho, updateCovil, checkFase, chefaoCaiu, recomecar } from './carreira.js';
import { buildWorld, constrain, routeTarget, slowAt, applyLevels, collideSolids, stairFoot, inside, routeRemaining } from './mundo.js';
import { fireWeapon, updateProjectiles, updateZones, updateDogs } from './weapons.js';
import { rollOptions, rollNewWeapons, applyOption, playerStats } from './upgrades.js';

const CHUNK = 10; // metros por chunk de cenário
const tmp = [];
const pt = { x: 0, y: 0 };
const vb = {};
const rt = { x: 0, y: 0 };

/** Topo da escada de uma laje (onde se chega lá em cima). */
function stairTopOf(P, out) {
  const S = P.stair;
  const cx = (S.x0 + S.x1) / 2;
  const cy = (S.y0 + S.y1) / 2;
  if (S.dir === 'n') { out.x = cx; out.y = S.y0 + 0.3; }
  else if (S.dir === 's') { out.x = cx; out.y = S.y1 - 0.3; }
  else if (S.dir === 'e') { out.x = S.x1 - 0.3; out.y = cy; }
  else { out.x = S.x0 + 0.3; out.y = cy; }
  return out;
}

export class Game {
  constructor(settings, { seed = Date.now() % 1e9, viewW = 390, viewH = 844, playTop = 96, playBottom = 760, meta = null } = {}) {
    this.settings = settings;
    // carreira: melhorias permanentes compradas com gorjetas e o nível de entrada do trecho
    this.meta = meta || { melhorias: {} };
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
      x: this.map.bounded ? ROUTE.orla.startX : 0, y: 0, r: PLAYER.radius, hp: PLAYER.hp, level: 1, xp: 0, xpNext: xpToNext(1),
      weapons: [{ id: 'capacete', level: 1, cd: 0.4 }], passives: [],
      faceX: 1, faceY: 0, moving: false, slowT: 0, paperT: 0, acaiT: 0, hurtT: 0, invulnT: 0, bonusDmg: 0, vx: 0, vy: 0,
      // animação do arremesso (atlas de teste): tempo desde o disparo / desde a pegada, capacetes em voo e mira
      throwT: 9, catchT: 9, helmetsOut: 0, aimX: 1, aimY: 0, walkPhase: 0,
      // mundo da rota: laje em que está (e nível 0/1 e altura z em m), pedaço da rota e objeto carregado
      plat: null, lvl: 0, z: 0, ri: 0, carry: null,
    };
    this.reviveUsed = false;
    this.rerollsLeft = this.settings.ads ? ADS.rerollsPerRun : 0;
    this.trocasGratis = this.meta.melhorias && this.meta.melhorias.troca ? 1 : 0; // melhoria de opção
    this.pendingInicial = false;
    this.mods = { dmgMul: 1, armor: 0, enemyHpMul: 1, bossHpMul: 1, eliteDmgMul: 1, speedMul: 1 };
    const mel = this.meta.melhorias || {};
    const lv = (id) => Math.min(mel[id] || 0, MELHORIAS[id].custo.length);
    this.mods.maxHpAdd = lv('vida') * MELHORIAS.vida.step;
    this.mods.dmgMul *= 1 + lv('dano') * MELHORIAS.dano.step;
    this.mods.speedMul *= 1 + lv('velocidade') * MELHORIAS.velocidade.step;
    this.mods.cdMul = 1 - lv('recarga') * MELHORIAS.recarga.step;
    this.mods.magnetMul = 1 + lv('ima') * MELHORIAS.ima.step;
    this.stats = playerStats(this.player, this.mods);
    this.player.hp = this.stats.maxHp;
    this.bossKilled = false;

    this.enemies = [];
    this.projectiles = [];
    this.enemyShots = [];
    this.bribes = []; // maletas do Político em voo
    this.lures = []; // maletas abertas que atraem a horda por um instante
    this.zones = [];
    this.lots = [];
    this.gems = [];
    this.pickups = [];
    this.fx = { particles: [], rings: [], numbers: [], decals: [], woken: [], gibs: [], bolts: [], words: [] };
    this.dogs = []; // Cachorro Caramelo
    this.fxRng = makeRng((this.seed ^ 0x9e3779b9) >>> 0); // sorteio só dos efeitos: não mexe no da partida
    this.outbox = [];

    this.caos = 0;
    this.caosBonus = 0;
    // carreira (D39): o Caos é de cada trecho (tempo desde a entrada + abates + propostas)
    this.trechoT0 = 0;
    this.caosAbates = 0;
    this.caosParado = false;
    this.corruption = 0;
    this.audience = 0.8;
    this.kills = 0;
    this.recentKills = [];
    this.spawnAcc = 0;
    this.nextWaveAt = SESSION.firstWaveAt;
    this.pendingWave = null;
    this.nextEliteAt = this.settings.elenco ? DIRECTOR.castTestFirstElite : SESSION.firstEliteAt;
    this.eventIndex = 0;
    this.rivalAt = -1;
    this.boss = null;
    this.chefe = null; // Chefe do Tráfico (laje do topo)
    this.chefeKilled = false;
    this.bossName = '';
    this.bossWarned = false;
    this.tvCooldown = {};
    this.chunks = new Map();

    // avenida da praia: carros andando nas faixas
    this.traffic = [];
    this.trafficT = AVENIDA.faixas.map(() => 1 + this.rng() * 4);
    // mundo da rota (só no mapa da orla): trechos ligados, lajes com escada, lugares e objetos
    this.world = this.map.bounded ? buildWorld(this.map) : null;
    this.startTrecho = this.meta.trecho || this.settings.trecho || 'orla'; // o Mapa da Rota escolhe o trecho
    this.segment = 'orla';
    this.delivered = false;
    this.exitWarnT = 0;
    if (this.world) {
      for (const h of this.world.heals) {
        h.emptyT = 0;
        this.pickups.push({ kind: h.kind, x: h.x, y: h.y, t: 0, plat: h.plat, src: h });
      }
      if (this.settings.aberta) this.world.gateOpen = true; // versão aberta: a escadaria já começa aberta
      if (this.startTrecho === 'morro') {
        // começa no pé do morro, com a escadaria já aberta (ponto de controle); o trecho recomeça do nível 1
        const g = this.world.gate;
        this.world.gateOpen = true;
        this.player.x = (g.x0 + g.x1) / 2;
        this.player.y = g.y0 - 1;
      }
    }
    this.covil = covilDe(this, 'orla'); // a obra do Especulador; no Morro, a laje do topo
    this.achados = this.world ? sortearAchados(this) : []; // isopores, cofres e a relíquia (D40)
    this.abertura = null;
    // modo: 'carreira' (a viagem), 'horda' (um mapa, sobreviver) ou 'desafio' (a Horda da semana)
    this.modo = this.meta.modo || 'carreira';
    this.desafio = this.meta.desafio || null;
    this.spawnExtra = 1;
    this.horda = null;
    if (emHorda(this) && this.world) iniciarHorda(this);
    if (this.meta.abertura && this.world && this.startTrecho === 'orla') iniciarAbertura(this); // o dia em que o sinal pegou
    if (this.meta.melhorias && this.meta.melhorias.armaInicial) this.pendingInicial = true;

    this.metrics = {
      seed: this.seed,
      firstLevelUpAt: null,
      levelUpTimes: [],
      killsByType: {},
      damageBySource: {},
      damageByWeapon: {}, // dano causado por cada habilidade (para o balanceamento)
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
    // mapa da rota: ruas retas, com um giro pequeno do eixo da profundidade (ajuste 'giro')
    this.camera.setAngles(s.elevation, this.map.bounded ? 0 : Number(s.yaw), this.map.bounded ? Number(s.giroMapa ?? 18) : 0);
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
      // com o mundo da rota, o cenário (postes, cones, carros) vem de cenario.js
      // sem ele: 1 obstáculo raro por pedaço, só no meio do calçadão e fora das transversais
      if (!this.world && hash2(cx, cy, 1) < m.propChance) {
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
    if (this.world) {
      constrain(this.world, e);
      return;
    }
    if (e.x < m.minX + e.r) e.x = m.minX + e.r;
    else if (e.x > m.maxX - e.r) e.x = m.maxX - e.r;
  }

  /** Ajusta um ponto de nascimento: dentro do mapa e nunca visível na tela. */
  fitSpawn(p, marginM = 1.5) {
    const m = this.map;
    if (!m.bounded) return p;
    if (this.world) return this.fitSpawnWorld(p, marginM);
    p.x = clamp(p.x, m.minX + 0.6, m.maxX - 0.6);
    const cam = this.camera;
    cam.toScreen(p.x, p.y, pt);
    if (pt.x > -24 && pt.x < cam.viewW + 24 && pt.y > cam.playTop - 40 && pt.y < cam.viewH + 40) {
      cam.visibleWorldBounds(marginM, vb);
      p.y = p.y < this.player.y ? vb.minY : vb.maxY;
    }
    return p;
  }

  onScreen(x, y) {
    const cam = this.camera;
    cam.toScreen(x, y, pt);
    return pt.x > -24 && pt.x < cam.viewW + 24 && pt.y > cam.playTop - 40 && pt.y < cam.viewH + 40;
  }

  /** Nascimento no mundo da rota: dentro das áreas de andar e fora da tela (nas vielas, pelas juntas). */
  fitSpawnWorld(p, marginM) {
    const w = this.world;
    const probe = { x: p.x, y: p.y, r: 0.4, ri: -1 };
    constrain(w, probe);
    if (!this.onScreen(probe.x, probe.y)) {
      p.x = probe.x;
      p.y = probe.y;
      return p;
    }
    this.camera.visibleWorldBounds(marginM, vb);
    const pl = this.player;
    const ahead = p.y < pl.y;
    for (const top of [ahead, !ahead]) {
      probe.x = p.x;
      probe.y = top ? vb.minY - 0.5 : vb.maxY + 0.5;
      constrain(w, probe);
      if (!this.onScreen(probe.x, probe.y)) {
        p.x = probe.x;
        p.y = probe.y;
        return p;
      }
    }
    // viela em zigue-zague: usa uma junta da rota perto, fora da tela
    let best = null;
    let bd = Infinity;
    for (const j of w.joints) {
      const d = Math.abs(j.y - pl.y);
      if (d < 8 || this.onScreen(j.x, j.y)) continue;
      if (d < bd) {
        bd = d;
        best = j;
      }
    }
    if (best) {
      p.x = best.x;
      p.y = best.y;
    } else {
      p.x = probe.x;
      p.y = probe.y;
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
    if (this.world) collideSolids(this.world, ent, ent === this.player ? 0 : 0.05); // inimigo contorna o carro
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
    // a horda fica mais resistente com o tempo dentro do trecho; cada trecho começa mais duro (D39)
    const tt = this.world ? tempoNoTrecho(this) : this.t;
    const base = this.world ? CARREIRA.trechoHpMul[this.segment] || 1 : 1;
    const hpScale = DIRECTOR.hpScale(tt) * base * durezaHorda(this) * (def.boss ? this.mods.bossHpMul : this.mods.enemyHpMul);
    const hp = def.hp * (type === 'isca' ? 1 : hpScale);
    const e = {
      id: this.nextId++, type, x, y, r: def.radius, hp, maxHp: hp, speed: def.speed * (0.9 + this.rng() * 0.2),
      dmg: def.dmg, behavior: def.behavior, elite: !!def.elite, boss: !!def.boss,
      kx: 0, ky: 0, flash: 0, slowT: 0, slowF: 1, phase: this.rng() * 6.28, fireT: 1 + this.rng() * 2, windup: 0,
      split: false, ttl: def.ttl || 0, dead: false, tint: Math.floor(this.rng() * 8), walk: this.rng() * 10,
      plat: null, lvl: 0, z: 0, ri: -1,
      ...extra,
    };
    if (this.world) {
      constrain(this.world, e);
      applyLevels(this.world, e);
    }
    this.enemies.push(e);
    return e;
  }

  spawnCommon() {
    const comp = this.segment === 'morro' ? DIRECTOR.morroComposition
      : this.settings.elenco ? DIRECTOR.castTestComposition : DIRECTOR.composition(this.pressao);
    let pick = comecoLento(this) ? 'telespectador' : weightedPick(this.rng, comp).type;
    if (pick === 'burocrata' && this.countType('burocrata') >= DIRECTOR.maxBurocratas) pick = 'telespectador';
    const ang = this.rng() * Math.PI * 2;
    const p = this.fitSpawn(this.edgePoint(ang, 30 + this.rng() * 60));
    const e = this.spawnEnemy(pick, p.x, p.y);
    if (comecoLento(this)) e.speed *= ABERTURA.lentoMul;
    // pista que cresce (D39): o Juninho demora a ir ao covil aberto e parte da horda anda para lá
    const C = this.covil;
    if (C && C.demora && !C.saiu && this.rng() < CARREIRA.hordaChamadaFrac) e.chamado = true;
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
    const n = Math.round((18 + this.pressao * 0.32) * this.settings.spawnMul);
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
    this.bossName = ENEMIES.especulador.name;
    this.caosBonus += 10;
    this.tv('boss');
    this.emit('boss', {});
    this.shake(0.5);
  }

  // ---------- dano ----------
  damageEnemy(e, amount, source, kx = 0, ky = 0, quiet = false) {
    if (e.dead || ENEMIES[e.type].invencivel) return; // o Rabecão não morre
    let dmg = amount;
    if (e.elite) dmg *= this.stats.eliteDmgMul;
    const dw = this.metrics.damageByWeapon;
    dw[source] = (dw[source] || 0) + Math.min(dmg, Math.max(0, e.hp));
    e.hp -= dmg;
    e.flash = 0.09;
    if (e.boss && e.hp > 0 && this.world) checkFase(this, e);
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
    if (!this.caosParado) this.caosAbates++;
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
    if (def.wakes && !this.settings.gore) this.wake(e); // sem sangue: a horda acorda (MECH-001)
    else this.gib(e, source);

    if (e.boss) this.bossDefeated(e);
  }

  /** Jogo de zumbi: sangue, poça no chão e pedaços que voam, quicam e param (com o gore ligado). */
  gib(e, source) {
    const G = GORE;
    const r = this.fxRng;
    if (!this.settings.gore) {
      this.burst(e.x, e.y, e.elite ? 12 : 5, 'blood');
      return;
    }
    const heavy = source === 'objeto' || source === 'mototaxi' || source === 'maleta' || source === 'botijao';
    this.burst(e.x, e.y, e.elite ? G.blood.elite : G.blood.comum, 'blood');
    this.splat(e.x, e.y, (e.elite ? 0.9 : 0.5) * (0.7 + r() * 0.6), 'poca');
    const parts = ['cabeca', 'braco', 'perna', 'tronco', 'braco', 'perna', 'tripa', 'tronco', 'cabeca'];
    const n = (e.elite ? G.gibs.elite : G.gibs.comum) + (heavy ? G.gibs.pesado : 0);
    const gibs = this.fx.gibs;
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const s = (heavy ? 4 : 2.2) + r() * 3.5;
      gibs.push({
        kind: parts[i % parts.length], x: e.x, y: e.y, z: 0.7 + r() * 0.7, vx: Math.cos(a) * s + e.kx * 0.3, vy: Math.sin(a) * s + e.ky * 0.3,
        vz: (3 + r() * 4.5) * (source === 'maleta' ? 1.7 : 1), rot: r() * 6.28, vr: (r() - 0.5) * 20, t: 0, trail: 0, type: e.type, tint: e.tint, landed: false, size: e.elite ? 1.4 : 1,
      });
    }
    if (gibs.length > G.maxGibs) gibs.splice(0, gibs.length - G.maxGibs);
  }

  splat(x, y, rr, kind = 'mancha') {
    const d = this.fx.decals;
    d.push({ x, y, r: rr, t: 0, rot: this.fxRng() * 6.28, kind });
    if (d.length > GORE.decalMax) d.shift();
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

  bossDefeated(e) {
    if (e && e.type === 'chefe_trafico' && !this.world) {
      // chefe do morro: cai, os traficantes debandam e a entrega fica livre (a partida segue até a entrega)
      this.chefe = null;
      this.chefeKilled = true;
      this.boss = null;
      this.bossKilled = true;
      for (const o of this.enemies) if (!o.dead && o.type === 'traficante') { o.dead = true; this.burst(o.x, o.y, 4, 'blood'); }
      this.tv('chefeVencido');
      this.shake(0.8);
      this.emit('flash', {});
      return;
    }
    if (this.world) {
      chefaoCaiu(this, e); // carreira: a porta abre e a partida segue
      return;
    }
    this.boss = null;
    this.bossKilled = true;
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
    const tt = this.world ? tempoNoTrecho(this) : this.t; // propostas pelo tempo no trecho (a abertura não conta)
    if (this.eventIndex < SESSION.eventTimes.length && tt >= SESSION.eventTimes[this.eventIndex]) {
      const ev = EVENTS[this.eventIndex];
      this.eventIndex++;
      this.modal = { kind: 'event', event: ev, corruption: this.corruption };
      this.emit('modal', {});
      return;
    }
    if (this.pendingInicial && !emAbertura(this)) {
      // melhoria "Bolsa de ferramentas": uma arma a mais no começo do trecho
      this.pendingInicial = false;
      const options = rollNewWeapons(this.player, this.rng, 3, this.segment);
      if (options.length) {
        this.modal = { kind: 'inicial', options };
        this.emit('modal', {});
        return;
      }
    }
    if (this.pendingChests > 0) {
      this.modal = { kind: 'chest', options: rollOptions(this.player, this.rng, 3, this.segment) };
      if (this.rerollsLeft > 0) this.metrics.ads.ofertas.trocar_cartas++;
      this.emit('modal', {});
      return;
    }
    if (this.pendingLevels > 0) {
      this.modal = { kind: 'levelup', level: this.player.level - this.pendingLevels + 1, options: rollOptions(this.player, this.rng, 3, this.segment) };
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
    else if (m.kind !== 'inicial') this.pendingLevels--;
    this.modal = null;
    this.stats = playerStats(this.player, this.mods);
    this.player.hp = Math.min(this.player.hp, this.stats.maxHp);
    if (opt.kind === 'evolution') this.emit('tv', { text: 'EVOLUÇÃO! ENTREGA EXPRESSA GARANTIDA OU SEU DINHEIRO DE VOLTA (NÃO)' });
  }

  /** Pula a abertura (da segunda vez em diante). */
  pularAbertura() {
    pularAbertura(this);
  }

  /** O jogador viu a abertura do cofre. */
  fecharCofre() {
    fecharCofre(this);
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
    this.bribes.length = 0;
    this.lures.length = 0;
    this.fx.rings.push({ x: p.x, y: p.y, r0: 0.3, r1: r, t: 0, dur: 0.45, color: 'mic' });
    this.metrics.causeOfDeath = null;
    this.tv('revive');
    this.shake(0.4);
  }

  /** Palavra curta flutuando sobre o ponto (PÁ!, BI-BI!, NHAC!, AU AU!). */
  word(x, y, txt, color) {
    if (this.fx.words.length > 12) this.fx.words.shift();
    this.fx.words.push({ x, y, txt, color, t: 0, dur: 0.6 });
  }

  /** Um capacete voltou para a mão (animação de pegar). */
  helmetBack() {
    const p = this.player;
    p.helmetsOut = Math.max(0, p.helmetsOut - 1);
    p.catchT = 0;
  }

  /** Troca as 3 cartas da escolha atual (anúncio recompensado). */
  rerollOptions(gratis = false) {
    const m = this.modal;
    if (!m || !m.options) return false;
    if (gratis) {
      // melhoria "Contato no app": troca sem anúncio
      if (this.trocasGratis <= 0) return false;
      this.trocasGratis--;
    } else {
      if (this.rerollsLeft <= 0) return false;
      this.rerollsLeft--;
      this.metrics.ads.aceitos.trocar_cartas++;
    }
    m.options = rollOptions(this.player, this.rng, 3, this.segment);
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

    this.caos = this.world ? caosDoTrecho(this) : clamp(DIRECTOR.caosFromTime(this.t) + this.caosBonus, 0, 100);

    // Montar a grade espacial com as posições do início do quadro.
    this.hash.clear();
    for (const e of this.enemies) if (!e.dead) this.hash.insert(e);

    if (!this.over) {
      this.updatePlayer(dt, input);
      this.updateInteract(dt);
      updateAchados(this, dt);
      this.updateRoute(dt);
      updateAbertura(this, dt);
      if (!emAbertura(this)) {
        if (this.horda) updateHorda(this, dt);
        else updateCovil(this, dt);
        updateCrises(this, dt);
        this.updateDirector(dt);
        this.updateWeapons(dt);
      }
    }
    this.updateEnemies(dt);
    this.updateTraffic(dt);
    updateProjectiles(this, dt);
    updateZones(this, dt);
    updateDogs(this, dt);
    this.updateEnemyShots(dt);
    this.updateBribes(dt);
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
    if (p.moving) p.walkPhase += dt * 8; // um ciclo de 6 quadros (2 passos) a cada ~0,8 s
    if (p.slowT > 0) p.slowT -= dt;
    if (p.paperT > 0) p.paperT -= dt;
    const stairs = this.world ? slowAt(this.world, p.x, p.y, p.ri) : 1; // escadaria do morro
    if (p.acaiT > 0) p.acaiT -= dt;
    const acai = p.acaiT > 0 ? ACAI_BUFF.speedMul : 1; // açaí: corre mais por uns segundos
    const speed = PLAYER.speed * st.speedMul * (p.slowT > 0 ? PLAYER.slowMul : 1) * stairs * acai * criseLentidao(this, p.x);
    p.vx = mx * speed;
    p.vy = my * speed;
    const onSand = this.map.bounded && p.x > this.map.sandX;
    p.x += p.vx * dt * (onSand ? this.map.sandSpeedMul : 1);
    p.y += p.vy * dt * (onSand ? this.map.sandSpeedMul : 1);
    this.collideProps(p);
    this.clampToMap(p);
    if (this.world) applyLevels(this.world, p);
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
      if (Math.abs((e.z || 0) - p.z) > 1) continue; // um em cima da laje, outro no chão: não encosta
      const rr = p.r + e.r + 0.05;
      if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 > rr * rr) continue;
      const d = e.dmg * dt;
      e.atkT = ENEMY_POSE.ataqueS; // encostou: pose de ataque virada para o Juninho
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
    const pz = this.pressao;
    const target = Math.min(cap, DIRECTOR.targetAlive(pz) * s.spawnMul * this.spawnExtra);
    this.spawnAcc += DIRECTOR.spawnPerSec(pz) * s.spawnMul * this.spawnExtra * dt;
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

    const covilAberto = this.world ? this.covil && this.covil.aberto : this.t >= SESSION.bossAt;
    if (this.t >= this.nextEliteAt && !covilAberto && this.segment === 'orla') { // elites da Orla
      this.nextEliteAt += this.settings.elenco ? DIRECTOR.castTestEliteEvery : DIRECTOR.eliteEvery(this.pressao);
      this.spawnElite('politico');
    }
    if (this.rivalAt > 0 && this.t >= this.rivalAt && this.segment === 'orla') {
      this.rivalAt = -1;
      this.spawnElite('rival');
    }
    if (this.world) return; // carreira: o chefão mora no covil e sai quando o Caos chama (carreira.js)
    if (!this.bossWarned && this.t >= SESSION.bossWarnAt) {
      this.bossWarned = true;
      this.tv('bossWarn');
    }
    if (!this.boss && this.t >= SESSION.bossAt && !this.bossSpawned && this.segment === 'orla') {
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
      // alvo: o Juninho; no mundo da rota, pela escada (lajes) e pelas juntas das vielas
      let tx = p.x;
      let ty = p.y;
      const C = this.covil;
      if (e.chamado && C && !C.saiu && (p.x - e.x) ** 2 + (p.y - e.y) ** 2 > CARREIRA.hordaChamadaPertoM ** 2) {
        // chamado pelo covil: anda para lá, junta por junta
        routeTarget(this.world, e, C.x, C.y + 1, C.trecho === 'orla' ? 0 : this.world.path.length - 1, rt);
        tx = rt.x;
        ty = rt.y;
      } else if (this.world) {
        if (e.plat !== p.plat) {
          if (e.plat) stairFoot(e.plat, rt); // descer da laje pela escada
          else stairFoot(p.plat, rt); // ir até o pé da escada da laje do Juninho
          if (e.plat && e.lvl === 1 && !inside(e.plat.stair, e.x, e.y)) stairTopOf(e.plat, rt);
          tx = rt.x;
          ty = rt.y;
        } else if (e.plat && e.lvl === 0 && p.lvl === 1) {
          stairTopOf(e.plat, rt); // está na escada: termina de subir
          tx = rt.x;
          ty = rt.y;
        }
        routeTarget(this.world, e, tx, ty, p.ri, rt);
        tx = rt.x;
        ty = rt.y;
      }
      const dpx = p.x - e.x;
      const dpy = p.y - e.y;
      const d = Math.hypot(dpx, dpy) || 1;
      const dtx = tx - e.x;
      const dty = ty - e.y;
      const dl = Math.hypot(dtx, dty) || 1;
      const ux = dtx / dl;
      const uy = dty / dl;
      if (e.atkT > 0) e.atkT -= dt;
      if (e.frozenT > 0) e.frozenT -= dt;
      const corre = e.boss && this.world && d > CARREIRA.chefaoAlcanceM ? CARREIRA.chefaoCorreMul : 1;
      const spd = e.speed * corre * (e.slowT > 0 ? e.slowF : 1) * (this.over ? 0.2 : 1);
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
        if (e.throwT > 0) e.throwT -= dt;
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
            const sh = def.shot;
            this.enemyShots.push({ x: e.x, y: e.y, vx: ux * sh.speed, vy: uy * sh.speed, life: sh.life, r: sh.radius, spin: 0 });
            e.throwT = def.throwPoseS;
            this.tv('burocrata', 40);
          }
        } else if (d < def.range + 2 && !this.over) {
          e.fireT -= dt;
          if (e.fireT <= 0) {
            e.fireT = def.fireEvery;
            e.windup = def.windupS;
          }
        }
      } else if (e.behavior === 'shooter') {
        // Traficante: fica a uma distância, mira com aviso (a mira trava no ponto) e atira
        const def = ENEMIES.traficante;
        if (e.throwT > 0) e.throwT -= dt; // pose de mira logo depois do tiro
        if (!e.saw && d < def.fogosM && !this.over) {
          e.saw = true;
          e.raivaT = def.raivaS; // grita e solta os fogos (pose de raiva), parado
          this.fogos(e);
        }
        if (e.raivaT > 0) e.raivaT -= dt;
        if (d < def.keepM) {
          mx = -ux * 0.7;
          my = -uy * 0.7;
        } else if (d < def.range) {
          const side = e.id & 1 ? 1 : -1;
          mx = -uy * 0.35 * side;
          my = ux * 0.35 * side;
        }
        if (e.aimT > 0) {
          e.aimT -= dt;
          mx *= 0.1;
          my *= 0.1;
          if (e.aimT <= 0) {
            const b = def.bullet;
            const ax = e.ax - e.x;
            const ay = e.ay - e.y;
            const al = Math.hypot(ax, ay) || 1;
            this.enemyShots.push({ kind: 'bala', x: e.x, y: e.y, vx: (ax / al) * b.speed, vy: (ay / al) * b.speed, life: b.life, r: b.radius, dmg: b.dmg, spin: 0 });
            e.throwT = 0.2;
          }
        } else if (d < def.range && !this.over) {
          e.fireT -= dt;
          if (e.fireT <= 0) {
            e.fireT = def.fireEvery;
            e.aimT = def.aimS;
            e.ax = p.x;
            e.ay = p.y;
          }
        }
      } else if (e.behavior === 'chefe') {
        // Chefe do Tráfico: distância, rajada com mira travada e aviso; reforço pelo rádio
        const def = ENEMIES.chefe_trafico;
        const R = def.reforco;
        if (e.throwT > 0) e.throwT -= dt;
        if (d < def.keepM) {
          mx = -ux * 0.6;
          my = -uy * 0.6;
        } else if (d < def.range) {
          mx = -uy * 0.3;
          my = ux * 0.3;
        }
        if (e.callT > 0) {
          e.callT -= dt;
          mx = 0;
          my = 0;
          if (e.callT <= 0 && !this.over) {
            for (let i = 0; i < R.traficantes; i++) {
              const sp = this.fitSpawn({ x: e.x + (i ? 2.5 : -2.5), y: e.y - 1.5 });
              const t = this.spawnEnemy('traficante', sp.x, sp.y);
              t.saw = true;
            }
            this.fogos(e);
          }
        } else if (e.burst > 0) {
          // rajada: um tiro a cada intervalo, abrindo um pouco em volta do ponto travado
          e.burstT -= dt;
          mx = 0;
          my = 0;
          if (e.burstT <= 0) {
            const b = def.bullet;
            const tiros = def.rajada.tiros + (e.fase || 0) * def.fases.tirosMais;
            const k = tiros - e.burst;
            const a = Math.atan2(e.ay - e.y, e.ax - e.x) + (k - (tiros - 1) / 2) * def.rajada.abertura;
            this.enemyShots.push({ kind: 'bala', x: e.x, y: e.y, vx: Math.cos(a) * b.speed, vy: Math.sin(a) * b.speed, life: b.life, r: b.radius, dmg: b.dmg, spin: 0 });
            e.burst--;
            e.burstT = def.rajada.intervaloS;
            e.throwT = 0.3;
          }
        } else if (e.aimT > 0) {
          e.aimT -= dt;
          mx *= 0.1;
          my *= 0.1;
          if (e.aimT <= 0) {
            e.burst = def.rajada.tiros + (e.fase || 0) * def.fases.tirosMais;
            e.burstT = 0;
          }
        } else if (!this.over) {
          e.callCd = (e.callCd ?? R.cadaS * 0.6) - dt;
          e.fireT -= dt;
          const ritmo = def.fases.cadenciaMul ** (e.fase || 0); // cada fase, mais rápido
          if (e.callCd <= 0) {
            e.callCd = R.cadaS * ritmo;
            e.callT = R.gritoS;
            this.tv('chefeRadio', 30);
          } else if (d < def.range && e.fireT <= 0) {
            e.fireT = def.fireEvery * ritmo;
            e.aimT = def.aimS;
            e.ax = p.x;
            e.ay = p.y;
          }
        }
        if (e.raivaT > 0) {
          mx = 0;
          my = 0;
        }
      } else if (e.behavior === 'investida') {
        // Funkeiro: abre os braços (fúria) com a direção travada e parte reto; depois volta a andar
        const I = ENEMIES.funkeiro.investida;
        if (e.dashT > 0) {
          e.dashT -= dt;
          mx = e.dashX * I.dashMul;
          my = e.dashY * I.dashMul;
        } else if (e.windup > 0) {
          e.windup -= dt;
          mx = 0;
          my = 0;
          if (e.windup <= 0) e.dashT = I.dashS;
        } else if (d < I.rangeM && !this.over) {
          e.fireT -= dt;
          if (e.fireT <= 0) {
            e.fireT = I.every;
            e.windup = I.windupS;
            e.dashX = dpx / d;
            e.dashY = dpy / d;
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
      const td = e.elite ? ENEMIES[e.type].throw : null;
      if (td && !this.over) {
        // Político: para, prepara (windup) e arremessa a maleta; fica parado um instante depois
        if (e.throwT > 0) e.throwT -= dt;
        if (e.windup > 0) {
          e.windup -= dt;
          if (e.windup <= 0) this.throwBriefcase(e, td);
        } else if (d < td.range) {
          e.fireT -= dt;
          if (e.fireT <= 0) {
            e.fireT = td.every;
            e.windup = td.windupS;
          }
        }
        if (e.windup > 0 || e.throwT > 0) {
          mx *= 0.1;
          my *= 0.1;
        }
      }

      if (this.lures.length && !e.elite) {
        // maleta aberta por perto: corre atrás do dinheiro em vez do Juninho
        const L = ENEMIES.politico.lure;
        let best = null;
        let bd = Infinity;
        for (const q of this.lures) {
          const qd = (q.x - e.x) ** 2 + (q.y - e.y) ** 2;
          const r = q.r || L.radiusM; // a da habilidade Maleta tem o alcance dela
          if (qd < r * r && qd < bd) {
            bd = qd;
            best = q;
          }
        }
        if (best) {
          const ql = Math.sqrt(bd) || 1;
          const k = ql > L.reachM ? (best.speedMul || L.speedMul) / ql : 0;
          mx = (best.x - e.x) * k;
          my = (best.y - e.y) * k;
        }
      }
      e.mx = mx; // direção em que anda (o desenho vira o corpo para ela)
      e.my = my;
      const sandMul = (this.map.bounded && e.x > this.map.sandX ? this.map.enemySandMul : 1)
        * (this.world ? slowAt(this.world, e.x, e.y, e.ri) * criseLentidao(this, e.x) : 1);
      if (e.vz !== undefined || e.alt > 0) {
        // lançado para o alto pela explosão da maleta: no ar, não anda (só o empurrão leva)
        e.alt = (e.alt || 0) + e.vz * dt;
        e.vz -= WEAPON_FX.vooGravidade * dt;
        mx = 0;
        my = 0;
        if (e.alt <= 0) {
          e.alt = 0;
          e.vz = undefined;
          this.burst(e.x, e.y, 3, 'poeira');
        }
      }
      if (e.dancaT > 0) {
        // baile na laje: dançando, não anda
        e.dancaT -= dt;
        mx = 0;
        my = 0;
      }
      e.x += (mx * spd * sandMul + e.kx) * dt;
      e.y += (my * spd * sandMul + e.ky) * dt;
      this.clampToMap(e);
      if (this.world) applyLevels(this.world, e);
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
        if (o === e || o.dead || o.id < e.id || o.plat !== e.plat) continue;
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
    // Especulador: fase 1 loteia o chão; fase 2, dois lotes de cada vez; fase 3, cerca uma fileira de lotes
    // entre ele e o Juninho. O despejo (a horda cercando) fica mais frequente a cada fase.
    if (this.over) return;
    const def = ENEMIES.especulador;
    const f = Math.min(2, e.fase || 0);
    const p = this.player;
    e.lotT -= dt;
    if (e.lotT <= 0) {
      e.lotT = def.lotes.cadaS[f];
      const lead = 0.9;
      for (let k = 0; k < def.lotes.porVez[f]; k++) {
        this.lots.push({
          x: p.x + p.vx * lead + (this.rng() - 0.5) * (k ? 6 : 2.5),
          y: p.y + p.vy * lead + (this.rng() - 0.5) * (k ? 6 : 2.5),
          half: 1.7 + this.rng() * 1.0, state: 'warn', t: 0, warnT: 1.6,
        });
      }
      const nf = def.lotes.fileira[f];
      if (nf) {
        // condomínio fechado: uma fileira de lotes cortando o caminho entre o Especulador e o Juninho
        const dx = p.x - e.x;
        const dy = p.y - e.y;
        const l = Math.hypot(dx, dy) || 1;
        const mx = (e.x + p.x) / 2;
        const my = (e.y + p.y) / 2;
        for (let k = 0; k < nf; k++) {
          const o = (k - (nf - 1) / 2) * 3.2;
          this.lots.push({ x: mx - (dy / l) * o, y: my + (dx / l) * o, half: 1.5, state: 'warn', t: 0, warnT: 1.9 });
        }
      }
      let sold = this.lots.filter((l) => l.state === 'sold');
      while (sold.length > 8) {
        this.lots.splice(this.lots.indexOf(sold[0]), 1);
        sold = sold.slice(1);
      }
    }
    e.despejoT -= dt;
    if (e.despejoT <= 0) {
      e.despejoT = def.despejoS[f];
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

  throwBriefcase(e, td) {
    const p = this.player;
    this.bribes.push({ x0: e.x, y0: e.y, x1: p.x, y1: p.y, x: e.x, y: e.y, h: 0, s: 0, t: 0, trail: 0, seed: (e.id * 2654435761) >>> 0 });
    e.throwT = td.releaseS;
    this.tv('maleta', 35);
  }

  /** Maletas em voo: arco até onde o Juninho estava; acerto em cheio machuca; onde cai vira Propina. */
  updateBribes(dt) {
    const td = ENEMIES.politico.throw;
    const p = this.player;
    const list = this.bribes;
    for (let i = list.length - 1; i >= 0; i--) {
      const b = list[i];
      b.t += dt;
      b.s = Math.min(1, b.t / td.flightS);
      b.x = b.x0 + (b.x1 - b.x0) * b.s;
      b.y = b.y0 + (b.y1 - b.y0) * b.s;
      b.h = 4 * td.arcM * b.s * (1 - b.s);
      if (b.s >= ENEMIES.politico.opening.openAt) {
        // aberta no ar: vai soltando notas
        b.trail -= dt;
        if (b.trail <= 0) {
          b.trail = ENEMIES.politico.opening.trailEveryS;
          this.moneyBits(b, b.x, b.y, b.h + 0.9, 1, 0.8);
        }
      }
      let land = b.s >= 1;
      const rr = td.hitR + p.r;
      if (!land && !this.over && b.s > 0.25 && b.h < PLAYER.heightM && (b.x - p.x) ** 2 + (b.y - p.y) ** 2 < rr * rr) {
        this.hurtPlayer(td.dmg, 'politico');
        land = true;
      }
      if (!land) continue;
      // abre longe dos pés do Juninho: pegar a Propina tem que ser escolha, não acidente
      let dx = b.x1 - b.x0;
      let dy = b.y1 - b.y0;
      const l = Math.hypot(dx, dy) || 1;
      dx /= l;
      dy /= l;
      let x = b.x;
      let y = b.y;
      const gap = Math.hypot(x - p.x, y - p.y);
      if (gap < td.dropGapM) {
        const along = (x - p.x) * dx + (y - p.y) * dy;
        const push = Math.sqrt(Math.max(0, td.dropGapM ** 2 - (gap ** 2 - along ** 2))) - along;
        x += dx * push;
        y += dy * push;
      }
      const thrown = this.pickups.filter((k) => k.thrown);
      if (thrown.length >= td.maxOnGround) thrown[0].dead = true;
      this.pickups.push({ kind: 'propina', x, y, t: 0, thrown: true });
      this.lures.push({ x, y, t: 0 });
      this.moneyBits(b, x, y, 0.4, ENEMIES.politico.opening.burst, 2.4);
      this.tv('lure', 30);
      list[i] = list[list.length - 1];
      list.pop();
    }
    const L = ENEMIES.politico.lure;
    for (const q of this.lures) q.t += dt;
    if (this.lures.some((q) => q.t >= (q.dur || L.durS))) this.lures = this.lures.filter((q) => q.t < (q.dur || L.durS));
  }

  /** Maleta de Dinheiro do Juninho abrindo no chão: notas voando (só efeito, sorteio dos efeitos). */
  moneyBurst(x, y, n) {
    this.moneyBits({ seed: (this.fxRng() * 4294967296) >>> 0 }, x, y, 0.4, n, 3);
  }

  /** Notas de dinheiro (só efeito): sorteio próprio da maleta, para não mexer no sorteio da partida. */
  moneyBits(b, x, y, z, n, speed) {
    const parts = this.fx.particles;
    for (let i = 0; i < n && parts.length < 260; i++) {
      b.seed = (Math.imul(b.seed, 1664525) + 1013904223) >>> 0;
      const r1 = b.seed / 4294967296;
      b.seed = (Math.imul(b.seed, 1664525) + 1013904223) >>> 0;
      const r2 = b.seed / 4294967296;
      const a = r1 * Math.PI * 2;
      const s = speed * (0.4 + r2 * 0.6);
      parts.push({ x, y, z, vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: 1 + r2 * 2, t: 0, life: 0.9 + r1 * 0.5, kind: 'money', rot: r2 * 6 });
    }
  }

  // ---------- objetos de cena e rota ----------
  /** Pega sozinho o objeto solto mais perto e arremessa no inimigo mais próximo; repõe as vagas. */
  updateInteract(dt) {
    const w = this.world;
    if (!w) return;
    const p = this.player;
    const I = INTERACT;
    for (const s of w.slots) {
      if (s.obj) continue;
      s.emptyT += dt;
      if (s.emptyT >= I.respawnS && (s.x - p.x) ** 2 + (s.y - p.y) ** 2 > I.respawnMinDistM ** 2 && !this.onScreen(s.x, s.y)) {
        s.obj = { kind: s.kind, x: s.x, y: s.y, plat: s.plat, dir: s.dir };
        s.emptyT = 0;
      }
    }
    // curas dos lugares (açaí, pastel, milho, coco, marmita) voltam fora da tela
    for (const h of w.heals) {
      if (!(h.emptyT > 0)) continue;
      h.emptyT -= dt;
      if (h.emptyT <= 0) {
        if ((h.x - p.x) ** 2 + (h.y - p.y) ** 2 > I.respawnMinDistM ** 2 && !this.onScreen(h.x, h.y)) {
          this.pickups.push({ kind: h.kind, x: h.x, y: h.y, t: 0, plat: h.plat, src: h });
        } else h.emptyT = 2;
      }
    }
    const myPlat = p.plat && p.lvl === 1 ? p.plat : null;
    if (!p.carry) {
      if (p.plat && p.lvl === 0 && p.z > 0.5) return; // no meio da escada
      let best = null;
      let bd = I.pickR * I.pickR;
      for (const s of w.slots) {
        const o = s.obj;
        if (!o || o.plat !== myPlat) continue;
        const d2 = (o.x - p.x) ** 2 + (o.y - p.y) ** 2;
        if (d2 < bd) {
          bd = d2;
          best = s;
        }
      }
      if (best) {
        p.carry = { kind: best.obj.kind, t: 0 };
        best.obj = null;
        best.emptyT = 0;
        this.emit('pick', { kind: p.carry.kind });
      }
      return;
    }
    p.carry.t += dt;
    if (p.carry.t < I.holdS) return;
    this.hash.query(p.x, p.y, I.throwRange, tmp);
    let target = null;
    let td = I.throwRange * I.throwRange;
    for (const e of tmp) {
      if (e.dead || e.type === 'isca') continue;
      const d2 = (e.x - p.x) ** 2 + (e.y - p.y) ** 2;
      if (d2 < td) {
        td = d2;
        target = e;
      }
    }
    if (!target) return;
    const T = THROWABLES[p.carry.kind];
    this.projectiles.push({
      kind: 'thrown', obj: p.carry.kind, sx: p.x, sy: p.y, x: p.x, y: p.y, tx: target.x, ty: target.y,
      t: 0, dur: I.flightS, h: 0, dmg: T.dmg * this.stats.dmgMul, radius: T.radius, src: 'objeto',
    });
    const l = Math.sqrt(td) || 1;
    p.aimX = (target.x - p.x) / l;
    p.aimY = (target.y - p.y) / l;
    p.throwT = 0;
    p.carry = null;
    this.metrics.objetos = (this.metrics.objetos || 0) + 1;
    this.tv('objeto', 45);
  }

  /** Objeto arremessado caiu: acerta todos em volta e quebra; o botijão explode e machuca quem estiver perto. */
  objectLands(pr) {
    const T = THROWABLES[pr.obj];
    this.explode(pr.x, pr.y, pr.radius, pr.dmg, 'objeto');
    this.burst(pr.x, pr.y, 10, 'debris');
    if (T.explosive) {
      this.burst(pr.x, pr.y, 22, 'fogo');
      this.shake(0.5);
      this.emit('flash', {});
      this.tv('botijao', 25);
      const p = this.player;
      if ((p.x - pr.x) ** 2 + (p.y - pr.y) ** 2 < T.radius * T.radius) this.hurtPlayer(T.selfDmg, 'botijao');
    }
  }

  /** Avenida da praia: carros nascem longe, andam na faixa, atropelam quem estiver na frente e somem. */
  updateTraffic(dt) {
    const w = this.world;
    const m = this.map;
    if (!w || m.avenidaX0 === undefined) return;
    const A = AVENIDA;
    const E = A.escala;
    const p = this.player;
    const len = 4.0 * E;
    const wid = 1.8 * E;
    const y0 = w.orlaTop;
    const y1 = w.orla.y1;
    const perto = p.y > y0 - A.raioM && this.segment === 'orla';
    A.faixas.forEach((f, i) => {
      this.trafficT[i] -= dt;
      if (this.trafficT[i] > 0 || !perto) return;
      this.trafficT[i] = A.intervaloS[0] + this.rng() * (A.intervaloS[1] - A.intervaloS[0]);
      const y = p.y - f.sentido * A.raioM;
      if (y < y0 + len || y > y1 - len) return;
      if (this.traffic.some((c) => c.faixa === i && Math.abs(c.y - y) < A.espacoM)) return;
      const v = A.velocidade[0] + this.rng() * (A.velocidade[1] - A.velocidade[0]);
      this.traffic.push({ x: f.x, y, faixa: i, sentido: f.sentido, v, len, wid, modelo: A.modelos[Math.floor(this.rng() * A.modelos.length)], warned: false });
    });
    const list = this.traffic;
    // fila na faixa: quem vem atrás de um carro mais lento freia e mantém distância (não passa por dentro)
    for (const c of list) {
      let ahead = null;
      for (const o of list) {
        if (o === c || o.faixa !== c.faixa) continue;
        const d = (o.y - c.y) * c.sentido; // > 0: o outro está na frente
        if (d > 0 && (!ahead || d < (ahead.y - c.y) * c.sentido)) ahead = o;
      }
      c.vAtual = c.v;
      if (ahead) {
        const gap = (ahead.y - c.y) * c.sentido - (c.len + ahead.len) / 2;
        if (gap < A.distanciaM) c.vAtual = Math.min(c.v, ahead.v * Math.max(0, gap / A.distanciaM));
      }
    }
    for (let i = list.length - 1; i >= 0; i--) {
      const c = list[i];
      c.y += c.sentido * c.vAtual * dt;
      c.giro = (c.giro || 0) + c.vAtual * dt; // metros andados: as rodas giram com isso
      if (Math.abs(c.y - p.y) > A.raioM + 6 || c.y < y0 || c.y > y1) {
        list[i] = list[list.length - 1];
        list.pop();
        continue;
      }
      const hx = c.wid / 2;
      const hy = c.len / 2;
      // aviso: carro vindo por trás do Juninho, na faixa dele
      if (!c.warned && c.sentido < 0 && Math.abs(c.x - p.x) < hx + 0.8 && c.y > p.y && c.y - p.y < A.avisoM) {
        c.warned = true;
        this.emit('warn', { angle: Math.PI / 2, dur: 1.2, label: 'CARRO' });
      }
      // atropelou o Juninho
      if (!this.over && !p.plat && Math.abs(p.x - c.x) < hx + p.r && Math.abs(p.y - c.y) < hy + p.r && !(p.invulnT > 0)) {
        this.hurtPlayer(A.dano, 'carro');
        p.x += (p.x < c.x ? -1 : 1) * A.empurraoM;
        p.invulnT = A.invulnS;
        this.shake(0.4);
        this.tv('atropelado', 30);
        this.clampToMap(p);
      }
      // atropelou a horda
      this.hash.query(c.x, c.y, hy + 1, tmp);
      for (const e of tmp) {
        if (e.dead || e.plat || e.carroT > this.t) continue;
        if (Math.abs(e.x - c.x) < hx + e.r && Math.abs(e.y - c.y) < hy + e.r) {
          e.carroT = this.t + A.hordaInvulnS; // um atropelamento por vez (o chefe quase não é empurrado)
          this.damageEnemy(e, A.danoHorda, 'carro', (e.x < c.x ? -1 : 1) * 6, c.sentido * 4);
        }
      }
    }
  }

  /** Rota: a escadaria abre quando o Especulador cai (carreira.js); a passagem recomeça o trecho no Morro. */
  updateRoute() {
    const w = this.world;
    if (!w) return;
    const p = this.player;
    if (this.segment === 'orla' && p.y < w.orlaTop - 1) {
      this.segment = 'morro';
      this.metrics.morroAt = Math.round(this.t);
      this.emit('segment', { name: 'SUBIDA DO MORRO' });
      this.tv('morro');
      recomecar(this, 'morro'); // "atualização obrigatória do aplicativo"
    }
    if (this.segment !== 'morro') return;
    if (p.ri >= 0) w.visto.add(p.ri);
    if (this.horda) return; // Modo Horda: não há entrega, é sobreviver
    w.exitOpen = !!this.settings.aberta || this.chefeKilled;
    const top = w.top;
    if (w.exitOpen && inside(top, p.x, p.y) && p.y < (top.y0 + top.y1) / 2 && !this.chefe) this.deliver();
  }

  /** Objetivo para o HUD: na carreira não há placa nem seta (D39); o chefão já tem a barra de vida no alto. */
  objective() {
    return null;
  }

  deliver() {
    this.delivered = true;
    this.metrics.entregaAt = Math.round(this.t);
    this.tv('entrega');
    this.shake(0.6);
    this.emit('flash', {});
    for (const o of this.enemies) {
      if (o.dead) continue;
      o.dead = true;
      if (ENEMIES[o.type].wakes) this.wake(o);
    }
    this.finish('victory');
  }

  /** Traficante viu o Juninho: fogos no céu e moradores hipnotizados chegando. */
  fogos(e) {
    const def = ENEMIES.traficante;
    this.emit('fogos', { x: e.x, y: e.y });
    this.tv('fogos', 20);
    const parts = this.fx.particles;
    for (let i = 0; i < 18 && parts.length < 260; i++) {
      const a = (i / 18) * Math.PI * 2;
      parts.push({ x: e.x, y: e.y, z: 7, vx: Math.cos(a) * 2.2, vy: Math.sin(a) * 2.2, vz: 1.5, t: 0, life: 1.1, kind: 'fogo' });
    }
    for (let i = 0; i < def.fogosPack; i++) {
      const sp = this.fitSpawn(this.edgePoint(this.rng() * Math.PI * 2, 40));
      this.spawnEnemy('telespectador', sp.x, sp.y);
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
      if (!remove && !this.over && s.kind === 'bala' && (s.x - p.x) ** 2 + (s.y - p.y) ** 2 < rr * rr) {
        this.hurtPlayer(s.dmg, 'traficante');
        remove = true;
      } else if (!remove && !this.over && (s.x - p.x) ** 2 + (s.y - p.y) ** 2 < rr * rr) {
        const sh = ENEMIES.burocrata.shot;
        if (!(p.paperT > 0)) this.emit('paper', {});
        this.hurtPlayer(sh.dmg, 'burocrata');
        p.slowT = Math.max(p.slowT, sh.slowS);
        p.paperT = sh.slowS;
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
      if (k.plat && (p.plat !== k.plat || p.lvl !== 1)) continue; // marmita do terraço: só lá em cima
      k.dead = true;
      if (k.src) k.src.emptyT = HEAL_RESPAWN_S; // cura de lugar: o dono repõe depois
      if (HEALS[k.kind]) {
        p.hp = Math.min(this.stats.maxHp, p.hp + HEALS[k.kind]);
        if (k.kind === 'acai') {
          p.acaiT = ACAI_BUFF.s;
          this.tv('acai', 40);
        }
        this.emit('pickup', { kind: k.kind });
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
      q.vz -= (q.kind === 'money' ? 4 : q.kind === 'fogo' ? 3 : 12) * dt; // nota de dinheiro e faísca de fogos caem devagar
      q.z = Math.max(0, q.z + q.vz * dt);
      if (q.z === 0) {
        q.vx *= 0.8;
        q.vy *= 0.8;
      }
    }
    for (const r of fx.rings) r.t += dt;
    for (const b of fx.bolts) b.t += dt;
    for (const w of fx.words) w.t += dt;
    for (const n of fx.numbers) n.t += dt;
    for (const d of fx.decals) d.t += dt;
    // pedaços: voam, deixam rastro de sangue, quicam no chão e param com uma mancha
    for (const g of fx.gibs) {
      g.t += dt;
      if (g.landed) continue;
      g.vz -= 18 * dt;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      g.z += g.vz * dt;
      g.rot += g.vr * dt;
      g.trail -= dt;
      if (g.trail <= 0 && fx.particles.length < 240) {
        g.trail = 0.06;
        fx.particles.push({ x: g.x, y: g.y, z: g.z, vx: 0, vy: 0, vz: 0, t: 0, life: 0.35, kind: 'blood' });
      }
      if (g.z <= 0) {
        g.z = 0;
        if (Math.abs(g.vz) > 3) {
          g.vz = -g.vz * 0.32;
          g.vx *= 0.55;
          g.vy *= 0.55;
          g.vr *= 0.5;
          this.splat(g.x, g.y, 0.18 + this.fxRng() * 0.14);
        } else {
          g.landed = true;
          this.splat(g.x, g.y, 0.22 + this.fxRng() * 0.16);
        }
      }
    }
    if (fx.gibs.length && fx.gibs[0].t > GORE.gibLife) fx.gibs = fx.gibs.filter((g) => g.t <= GORE.gibLife);
    fx.particles = fx.particles.filter((q) => q.t < q.life);
    fx.rings = fx.rings.filter((r) => r.t < r.dur);
    if (fx.bolts.length) fx.bolts = fx.bolts.filter((b) => b.t < b.dur);
    if (fx.words.length) fx.words = fx.words.filter((w) => w.t < w.dur);
    fx.numbers = fx.numbers.filter((n) => n.t < 0.7);
    fx.decals = fx.decals.filter((d) => d.t < GORE.decalLife);
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
  /** Sobe n níveis na hora, com cartas sorteadas (ponto de controle do trecho). */
  autoLevels(n) {
    for (let i = 0; i < n; i++) {
      const opts = rollOptions(this.player, this.rng, 3, this.segment);
      applyOption(this.player, opts[Math.floor(this.rng() * opts.length)]);
      this.player.level++;
    }
    this.player.xpNext = xpToNext(this.player.level);
    this.stats = playerStats(this.player, this.mods);
    this.player.hp = this.stats.maxHp;
  }

  /** Gorjetas da partida (vêm até na derrota), com o motivo de cada parte. */
  tips() {
    const G = GORJETAS;
    const parts = [
      ['Tempo de turno', Math.round((this.t / 60) * G.porMinuto)],
      ['Nível alcançado', this.player.level * G.porNivel],
      ['Gente derrubada', Math.round((this.kills / 1000) * G.porMilAbates)],
    ];
    if (this.metrics.portaoAberto != null) parts.push(['Subida do Morro liberada', G.liberarTrecho]);
    if (this.bossKilled) parts.push(['Chefe vencido', G.chefe]);
    if (this.delivered) parts.push(['Entrega feita', G.entrega]);
    if (this.metrics.achadosGorjeta) parts.push(['Achados pelo caminho', this.metrics.achadosGorjeta]);
    if (emHorda(this)) for (const p of parts) p[1] = Math.round(p[1] * HORDA.gorjetaMul); // a Carreira rende mais
    return { total: parts.reduce((a, p) => a + p[1], 0), parts };
  }

  fastForward(target) {
    if (target <= 0) return;
    const levels = Math.floor(target / 20);
    for (let i = 0; i < levels; i++) {
      const opts = rollOptions(this.player, this.rng, 3, this.segment);
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

  /** O quanto a horda aperta (na carreira, carreira.js: pressaoDoTrecho). */
  get pressao() {
    return this.world ? pressaoDoTrecho(this) : this.caos;
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
