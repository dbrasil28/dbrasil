// Regra da carreira (D39, docs/design/CARREIRA_E_ROTA.md): o Caos de cada trecho chama o chefão, que
// mora num covil do mapa e guarda a saída; pistas que crescem em vez de setas; recomeço a cada trecho.
// Sem DOM: roda igual no navegador e nos testes.
import { CARREIRA, ENEMIES, SESSION, HORDA, xpToNext } from './config.js';
import { clamp } from './math.js';
import { removeSolid, addSolid, deliveryPoint, inside } from './mundo.js';
import { playerStats } from './upgrades.js';
import { cofreDoChefao } from './achados.js';
import { limparMonstrao } from './monstrao.js';

/** Covil do trecho: onde o chefão mora, de onde sai, e o estado das pistas. */
export function covilDe(game, trecho) {
  const w = game.world;
  if (!w) return null;
  const base = { trecho, sinal: false, aberto: false, abertoT: 0, saiu: false, barulhoT: 0, demora: false };
  if (trecho === 'orla') {
    const o = w.obra;
    return { ...base, boss: 'monstrao', x: (o.x0 + o.x1) / 2, y: (o.y0 + o.y1) / 2 };
  }
  const c = deliveryPoint(w, {});
  return { ...base, boss: 'chefe_trafico', x: c.x, y: c.y };
}

/** Segundos desde que o Juninho entrou no trecho atual. */
export const tempoNoTrecho = (game) => Math.max(0, game.t - (game.trechoT0 || 0));

/** Caos do trecho: o tempo desde a entrada, os abates e as propostas aceitas. Zera quando o chefão cai. */
export function caosDoTrecho(game) {
  if (game.caosParado) return 0;
  const C = CARREIRA;
  const tempo = 100 * Math.pow(Math.min(1, tempoNoTrecho(game) / C.caosTempoS), C.caosExp);
  const abates = C.caosAbateMax * (1 - Math.exp(-game.caosAbates / C.caosAbateK));
  return clamp(tempo + abates + game.caosBonus, 0, 100);
}

/**
 * O quanto a horda aperta: só o tempo e as propostas, na escala de antes (os abates trazem o chefão
 * mais cedo, mas não aumentam a horda; senão mais abates traziam mais horda, que dava mais abates).
 */
export function pressaoDoTrecho(game) {
  if (game.caosParado) return 0;
  const C = CARREIRA;
  const tempo = 100 * Math.pow(Math.min(1, tempoNoTrecho(game) / C.caosTempoS), C.caosExp);
  return clamp(tempo + game.caosBonus, 0, 100) * C.pressaoMul;
}

/** Sinal, chamado e saída do chefão. */
export function updateCovil(game, dt) {
  const C = game.covil;
  if (!C || game.over || C.saiu) return;
  const R = CARREIRA;
  const p = game.player;
  const d = Math.hypot(p.x - C.x, p.y - C.y);
  if (!C.sinal && game.caos >= R.sinal) {
    C.sinal = true;
    game.tv(`covilSinal_${C.trecho}`);
  }
  if (C.sinal) {
    // barulho do covil: só quem está perto ouve (e sente o chão tremer)
    C.barulhoT -= dt;
    if (C.barulhoT <= 0) {
      C.barulhoT = R.barulhoS;
      if (d < R.sinalPertoM) {
        game.word(C.x + (game.fxRng() - 0.5) * 4, C.y - 1, C.trecho === 'orla' ? 'TUM!' : 'PÁ PÁ!', '#d8d0c2');
        game.burst(C.x + (game.fxRng() - 0.5) * 4, C.y, 5, 'poeira');
        if (d < R.sinalPertoM * 0.55) game.shake(0.08);
      }
    }
  }
  if (!C.aberto && game.caos >= 100) {
    C.aberto = true;
    C.abertoT = game.t;
    game.metrics[`covil${C.trecho === 'orla' ? 'Orla' : 'Morro'}S`] = Math.round(game.t);
    game.tv(`covilAberto_${C.trecho}`);
    game.emit('covil', { trecho: C.trecho });
  }
  if (!C.aberto) return;
  if (!C.demora && game.t - C.abertoT > R.pistaHordaS) {
    C.demora = true; // a pista cresce: a horda começa a andar para o covil
    game.tv('covilDemora');
  }
  const noTopo = C.trecho === 'morro' && inside(game.world.top, p.x, p.y);
  if (d < R.covilPertoM || noTopo) soltarChefao(game, C);
}

/** O chefão sai do covil: na Orla, o tapume da frente da obra cai; no Morro, aparece no fundo da laje do topo. */
export function soltarChefao(game, C) {
  C.saiu = true;
  game.metrics[`chefaoSaiu${C.trecho === 'orla' ? 'Orla' : 'Morro'}S`] = Math.round(game.t);
  const w = game.world;
  game.shake(0.5);
  game.emit('boss', {});
  if (C.trecho === 'orla') {
    removeSolid(w, w.obraSolid);
    if (!w.solids.includes(w.obraFundoSolid) && !w.gateOpen) addSolid(w, w.obraFundoSolid); // a frente cai; o fundo fica até o chefão cair
    w.obraAbertaT = game.t;
    for (let i = 0; i < 4; i++) game.burst(w.obra.x0 + ((i + 0.5) / 4) * (w.obra.x1 - w.obra.x0), w.obra.y1, 8, 'poeira');
    const e = game.spawnEnemy('monstrao', C.x, w.obra.y1 - 1.6, { fase: 0, pausaT: 1.5 });
    game.boss = e;
    game.bossSpawned = true;
    game.bossName = ENEMIES.monstrao.name;
    game.tv('boss');
    return;
  }
  const top = w.top;
  const e = game.spawnEnemy('chefe_trafico', (top.x0 + top.x1) / 2, top.y0 + (top.y1 - top.y0) * 0.4, { fase: 0 });
  e.ri = w.path.length - 1;
  e.fireT = 1.5;
  game.chefe = e;
  game.boss = e;
  game.bossName = ENEMIES.chefe_trafico.name;
  game.tv('chefe');
}

/** Fases do chefão (100%, 66%, 33% da vida): golpe novo e a assessoria chega. */
export function checkFase(game, e) {
  const f = e.fase || 0;
  if (f >= CARREIRA.fases.length || e.hp / e.maxHp > CARREIRA.fases[f]) return;
  e.fase = f + 1;
  const trecho = e.type === 'chefe_trafico' ? 'morro' : 'orla';
  game.tv(`fase_${trecho}`);
  game.shake(0.45);
  game.emit('flash', {});
  game.emit('fase', { fase: e.fase });
  // assessoria: um anel de horda em volta do chefão e os inimigos do trecho
  const n = CARREIRA.reforcoHorda;
  const off = game.rng() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    const a = off + (i / n) * Math.PI * 2;
    const sp = game.fitSpawn({ x: e.x + Math.cos(a) * 7.5, y: e.y + Math.sin(a) * 7.5 });
    game.spawnEnemy('telespectador', sp.x, sp.y);
  }
  const def = ENEMIES[e.type];
  const extra = def.fases.reforco[e.fase] || [];
  extra.forEach((type, i) => {
    const sp = game.fitSpawn({ x: e.x + (i % 2 ? 3 : -3), y: e.y + 2 });
    const o = game.spawnEnemy(type, sp.x, sp.y);
    if (type === 'traficante') o.saw = true;
  });
}

/**
 * O chefão caiu: o sinal da TV cai junto (a horda em volta desaba), o Caos zera e a porta abre.
 * A partida não acaba: falta atravessar.
 */
export function chefaoCaiu(game, e) {
  const R = CARREIRA;
  const w = game.world;
  game.boss = null;
  game.bossKilled = true;
  game.caosParado = true;
  game.lots.length = 0;
  limparMonstrao(game); // anilhas rolando e carros no ar somem junto
  for (const o of game.enemies) {
    if (o.dead || o === e || Math.hypot(o.x - e.x, o.y - e.y) > R.quedaRaioM) continue;
    o.dead = true;
    if (ENEMIES[o.type].wakes) game.wake(o);
    else game.burst(o.x, o.y, 4, 'blood');
  }
  game.shake(0.8);
  game.emit('flash', {});
  cofreDoChefao(game, e); // o chefão sempre solta um cofre
  if (game.horda) {
    // Modo Horda: sem porta e sem zerar o Caos; ele volta mais forte (horda.js)
    game.caosParado = false;
    game.chefe = null;
    if (e.type === 'chefe_trafico') game.chefeKilled = true;
    game.metrics[e.type === 'chefe_trafico' ? 'chefaoMorroS' : 'chefaoOrlaS'] ??= Math.round(game.t);
    game.horda.chefoes++;
    game.horda.proxChefao = game.t + HORDA.chefaoVoltaS;
    game.tv(e.type === 'chefe_trafico' ? 'chefeVencido' : 'chefaoCaiu');
    return;
  }
  if (e.type !== 'chefe_trafico') {
    game.metrics.chefaoOrlaS = Math.round(game.t);
    game.tv('chefaoCaiu');
    w.gateOpen = true;
    w.portaT = game.t; // o tapume da escadaria cai
    removeSolid(w, w.obraFundoSolid); // e o do fundo da obra: atrás dela, a escadaria
    w.obraFundoT = game.t;
    game.metrics.portaoAberto = Math.round(game.t);
    game.emit('unlock', {});
    game.tv('unlock');
  } else {
    game.metrics.chefaoMorroS = Math.round(game.t);
    game.chefe = null;
    game.chefeKilled = true;
    w.exitOpen = true;
    for (const o of game.enemies) if (!o.dead && o.type === 'traficante') { o.dead = true; game.burst(o.x, o.y, 4, 'blood'); }
    game.tv('chefeVencido');
  }
}

/** Passou pela porta: o aplicativo "atualiza" e o Juninho recomeça do nível 1, só com o Capacete. */
export function recomecar(game, trecho) {
  const p = game.player;
  p.level = 1;
  p.xp = 0;
  p.xpNext = xpToNext(1);
  p.weapons = [{ id: 'capacete', level: 1, cd: 0.4 }];
  p.passives = [];
  p.bonusDmg = 0;
  p.auraR = 0;
  p.helmetsOut = 0;
  p.reliquia = null; // a relíquia vale só no trecho dela
  game.dogs.length = 0;
  game.projectiles = game.projectiles.filter((o) => o.kind === 'thrown');
  game.zones.length = 0;
  game.pendingLevels = 0;
  game.pendingChests = 0;
  game.stats = playerStats(p, game.mods);
  p.hp = game.stats.maxHp;
  game.trechoT0 = game.t;
  game.caosAbates = 0;
  game.caosBonus = 0;
  game.caosParado = false;
  game.nextWaveAt = game.t + SESSION.firstWaveAt;
  game.covil = covilDe(game, trecho);
  game.crise = null;
  game.crisesFeitas = new Set();
  if (game.meta.melhorias && game.meta.melhorias.armaInicial) game.pendingInicial = true; // "Bolsa de ferramentas"
  game.tv('recomeco');
  game.emit('recomeco', { text: CARREIRA.recomeco });
}
