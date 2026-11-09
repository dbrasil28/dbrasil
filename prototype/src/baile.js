// O baile da esplanada (D91, pedido do autor): o chefe do meio do Morro. A última esplanada antes do alto do
// morro vira um baile: a noite cai ali, néon e TVs, o povo dançando. As TVs entram no Plantão com O Acordão
// (as duas cabeças de Brasília, em silhueta: D21), o sinal pega e a festa vira horda, um por um, como na
// abertura. Aí o DJ Plantão sobe no palco (dj.js). Com ele no chão, o som cai, a pista acorda e o portão do
// fundo da esplanada abre o resto do morro. A polícia não entra no baile. Números em config.js (BAILE).
// Sem DOM: roda igual no navegador e nos testes.
import { BAILE, ENEMIES } from './config.js';
import { makeRng } from './math.js';
import { palcoDoBaile } from './cenario.js';

const clamp01 = (v) => Math.max(0, Math.min(1, v));
// a arte de cada um do povo (WALK_ATLAS; o cidadão usa a da horda da Orla, com a transformação) e o tamanho
const ARTE_DO_POVO = { cidadao: null, garota: 'gp', funkeiro: 'fk', traficante: 'tf' };
const TAM_DO_POVO = { cidadao: null, garota: 1.0, funkeiro: ENEMIES.funkeiro.size, traficante: ENEMIES.traficante.size };

/** Distância de (x, y) até a esplanada (0 dentro dela). */
export function distEsplanada(w, x, y) {
  const k = w.baile;
  const dx = Math.max(k.x0 - x, 0, x - k.x1);
  const dy = Math.max(k.y0 - y, 0, y - k.y1);
  return Math.hypot(dx, dy);
}

/** O baile pode acontecer nesta partida (carreira, no Morro, com a esplanada e o portão ainda fechado). */
const temBaile = (game) => !!(game.world && game.world.baile && !game.horda && game.segment === 'morro');

/** Avança o baile: começa na chegada, plantão, sinal, o DJ, e o fim. Também a noite (game.noiteBaile). */
export function updateBaile(game, dt) {
  if (!temBaile(game)) {
    game.noiteBaile = 0;
    return;
  }
  const B = BAILE;
  const w = game.world;
  const p = game.player;
  let S = game.baile;
  const d = distEsplanada(w, p.x, p.y);
  if (!S && !w.portaoAberto && !game.over && d <= B.entraM) S = iniciar(game);
  // a noite: cai conforme o Juninho chega perto da esplanada e vai embora depois do DJ
  const perto = 1 - clamp01((d - B.noiteAteM) / (B.noiteDeM - B.noiteAteM));
  const alvo = (S && S.fase === 'fim') || (!S && w.portaoAberto) ? 0 : perto;
  const passo = dt / (S && S.fase === 'fim' ? B.fimS : B.noiteS);
  const n = game.noiteBaile || 0;
  game.noiteBaile = alvo > n ? Math.min(alvo, n + passo) : Math.max(alvo, n - passo);
  if (!S) return;
  S.t += dt;
  S.faseT += dt;
  for (const c of S.pessoas) atualizarPessoa(game, S, c, dt);
  switch (S.fase) {
    case 'festa':
      if (S.faseT >= B.plantaoS) mudar(game, S, 'plantao');
      break;
    case 'plantao':
      if (S.faseT >= B.sinalS) pegarSinal(game, S);
      break;
    case 'sinal':
      if (S.pessoas.every((c) => c.virou) && S.faseT >= B.chefeS) soltarDJ(game, S);
      break;
    default:
      break;
  }
}

function mudar(game, S, fase) {
  S.fase = fase;
  S.faseT = 0;
  if (fase === 'plantao') {
    // as TVs entram no Plantão com O Acordão e o som corta
    game.tv('baileAcordao');
    game.emit('plantao', {});
  }
}

/** A chegada: o povo na pista, a horda que vinha atrás para para dançar e a de fora não nasce. */
function iniciar(game) {
  const B = BAILE;
  const w = game.world;
  const k = w.baile;
  const pc = palcoDoBaile(w);
  const rng = makeRng((game.seed ^ 0xba11e) >>> 0);
  const pessoas = [];
  const fila = Object.entries(B.povo).flatMap(([tipo, n]) => Array(n).fill(tipo));
  for (let i = fila.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [fila[i], fila[j]] = [fila[j], fila[i]];
  }
  let tent = 0;
  while (pessoas.length < fila.length && tent++ < fila.length * 20) {
    const x = k.x0 + B.beiraM + rng() * (k.x1 - k.x0 - 2 * B.beiraM);
    const y = k.y0 + B.beiraM + rng() * (k.y1 - k.y0 - 2 * B.beiraM);
    if (Math.hypot(x - pc.x, y - pc.y) < B.palcoM) continue; // o palco fica livre para o DJ
    const s = game.fitSpawn({ x, y });
    if (Math.hypot(s.x - x, s.y - y) > 0.6) continue;
    const tipo = fila[pessoas.length];
    pessoas.push({
      x: s.x, y: s.y, vx: 0, vy: 0, tipo, arte: ARTE_DO_POVO[tipo], tam: TAM_DO_POVO[tipo], tint: Math.floor(rng() * 3),
      walk: rng() * 10, ritmo: rng(), danca: true, viraT: -1, virou: false, id: 950000 + pessoas.length,
    });
  }
  const S = (game.baile = { fase: 'festa', t: 0, faseT: 0, pessoas, dj: null });
  // a horda que vinha atrás do Juninho: a de longe vai embora (fora da tela) e a de perto entra na dança,
  // os traficantes também (até o sinal pegar)
  game.aliviarHorda(B.hordaMax);
  const p = game.player;
  for (const e of game.enemies) {
    if (e.dead || e.boss) continue;
    if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 < 18 * 18) e.dancaT = 1e9;
  }
  game.metrics.baileS = Math.round(game.t);
  game.tv('baileComeca');
  game.emit('baile', {});
  return S;
}

/** A pessoa dançando no lugar; quando o sinal pega nela, trava, transforma e vira horda. */
function atualizarPessoa(game, S, c, dt) {
  if (c.virou) return;
  c.walk += dt * 9; // o passo no batidão (o desenho também pula no pulso)
  if (c.viraT < 0) return;
  c.viraT -= dt;
  c.danca = c.viraT > BAILE.transfS; // a transformação começa: para de dançar
  if (c.viraT <= 0) {
    c.virou = true;
    if (c.tipo === 'funkeiro' || c.tipo === 'traficante') {
      const e = game.spawnEnemy(c.tipo, c.x, c.y, { walk: c.walk });
      if (c.tipo === 'traficante') e.saw = true; // já está na festa: sem soltar os fogos
    } else {
      // a mulher de roupa curta vira a Mulher de Biquíni da horda (a primeira roupa nova da Orla, tint 200)
      game.spawnEnemy('telespectador', c.x, c.y, { tint: c.tipo === 'garota' ? 200 : c.tint, walk: c.walk });
    }
    game.burst(c.x, c.y, 6, 'static');
  }
}

/** O sinal pega no baile: cada um trava numa hora, o mais perto do Juninho por último; a horda dançando acorda. */
function pegarSinal(game, S) {
  const B = BAILE;
  S.fase = 'sinal';
  S.faseT = 0;
  game.tv('baileSinal');
  game.emit('flash', {});
  game.shake(0.25);
  const p = game.player;
  const ord = [...S.pessoas].sort((a, b) => Math.hypot(b.x - p.x, b.y - p.y) - Math.hypot(a.x - p.x, a.y - p.y));
  ord.forEach((c, i) => { c.viraT = B.transfS + (i / Math.max(1, ord.length)) * B.viraS; });
  for (const e of game.enemies) if (e.dancaT > 0) e.dancaT = 0;
}

/** O DJ Plantão sobe no palco. */
function soltarDJ(game, S) {
  const w = game.world;
  const pc = palcoDoBaile(w);
  const e = game.spawnEnemy('dj_plantao', pc.x, pc.y, { fase: 0 });
  e.ri = w.baileI;
  S.dj = e;
  S.fase = 'luta';
  S.faseT = 0;
  game.boss = e;
  game.bossName = ENEMIES.dj_plantao.name;
  game.emit('boss', {});
  game.shake(0.45);
  game.tv('djPlantao');
  game.metrics.djSaiuS = Math.round(game.t);
}

/** O DJ caiu: o som cai, a pista acorda, o portão do fundo abre e a noite vai embora. */
export function djCaiu(game, e) {
  const B = BAILE;
  const S = game.baile;
  const w = game.world;
  if (S) {
    S.fase = 'fim';
    S.faseT = 0;
    S.dj = null;
  }
  if (game.boss === e) game.boss = null;
  w.portaoAberto = true;
  w.portaoT = game.t;
  game.metrics.djCaiuS = Math.round(game.t);
  for (const o of game.enemies) {
    if (o.dead || o.boss || o === e) continue;
    if ((o.x - e.x) ** 2 + (o.y - e.y) ** 2 > B.acordaM * B.acordaM) continue;
    o.dead = true;
    if (ENEMIES[o.type].wakes) game.wake(o);
    else game.burst(o.x, o.y, 5, 'blood');
  }
  game.pickups.push({ kind: 'propina', x: e.x + 0.6, y: e.y, t: 0 });
  game.pickups.push({ kind: 'maleta', x: e.x - 0.6, y: e.y, t: 0, magnet: true });
  game.shake(0.6);
  game.emit('flash', {});
  game.emit('unlock', {}); // "UMA PASSAGEM SE ABRIU" e o som da passagem
  game.tv('djCaiu');
}

/** A horda nasce? Do começo do baile até o DJ cair, só a festa (e quem o DJ chama). */
export const baileSegura = (game) => !!(game.baile && game.baile.fase !== 'fim');

/** O som corta no Plantão e enquanto o sinal pega (para a música e o ambiente, como o silêncio da Orla). */
export function silencioDoBaile(game) {
  const S = game.baile;
  if (!S) return 0;
  if (S.fase === 'plantao') return clamp01(S.faseT / 0.4);
  if (S.fase === 'sinal') return 1 - clamp01((S.faseT - 1.5) / 1.5);
  return 0;
}
