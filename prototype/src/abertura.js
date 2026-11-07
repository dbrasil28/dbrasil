// Abertura do jogo (D39, docs/design/CARREIRA_E_ROTA.md seção 8): a Orla começa normal, com gente
// passeando e o Juninho entregando. As TVs dos bares passam o Plantão; uns 20 s depois o sinal "pega":
// as pessoas travam, os olhos acendem e viram horda uma a uma. A barra de Caos aparece em 0%.
// Nos primeiros 30 s depois disso, só telespectadores lentos (tutorial sem texto).
// Sem DOM: roda igual no navegador e nos testes.
import { ABERTURA, SESSION } from './config.js';
import { makeRng } from './math.js';

/** Começa a abertura: gente normal passeando em volta do Juninho. */
export function iniciarAbertura(game) {
  const A = ABERTURA;
  const rng = makeRng((game.seed ^ 0xab3) >>> 0);
  const p = game.player;
  const civis = [];
  for (let i = 0; i < A.pessoas; i++) {
    const a = rng() * Math.PI * 2;
    const r = A.pertoM * (0.35 + rng() * 0.65);
    const s = game.fitSpawn({ x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r * 1.4 });
    civis.push({ x: s.x, y: s.y, vx: 0, vy: 0, tint: Math.floor(rng() * 8), walk: rng() * 10, troca: rng() * 2, id: 900000 + i, viraT: -1 });
  }
  game.abertura = { fase: 'normal', t: 0, civis };
}

/** Passeio, o plantão, o sinal pegando (um por um) e o fim. */
export function updateAbertura(game, dt) {
  const ab = game.abertura;
  if (!ab || ab.fase === 'feito') return;
  const A = ABERTURA;
  ab.t += dt;
  game.trechoT0 = game.t; // o Caos só começa quando o sinal pega
  for (const c of ab.civis) {
    if (c.virou) continue;
    if (c.viraT >= 0) {
      // travou: olho acendendo
      c.viraT -= dt;
      c.vx = 0;
      c.vy = 0;
      if (c.viraT <= 0) virar(game, c);
      continue;
    }
    c.troca -= dt;
    if (c.troca <= 0) {
      c.troca = 1.5 + game.fxRng() * 2.5;
      const a = game.fxRng() * Math.PI * 2;
      const v = game.fxRng() < 0.3 ? 0 : A.passeioMs;
      c.vx = Math.cos(a) * v;
      c.vy = Math.sin(a) * v;
    }
    c.x += c.vx * dt;
    c.y += c.vy * dt;
    if (c.vx || c.vy) c.walk += dt * 5;
  }
  if (ab.fase === 'normal' && ab.t >= A.plantaoS && !ab.plantao) {
    ab.plantao = true;
    game.tv('aberturaPlantao');
  }
  if (ab.fase === 'normal' && ab.t >= A.sinalS) pegarSinal(game);
  if (ab.fase === 'sinal' && ab.civis.every((c) => c.virou)) {
    acabar(game);
  }
}

function acabar(game) {
  const ab = game.abertura;
  ab.fase = 'feito';
  ab.lentoAte = game.t + ABERTURA.lentosS;
  game.trechoT0 = game.t;
  game.nextWaveAt = game.t + SESSION.firstWaveAt; // a horda e os elites contam a partir do sinal
  game.nextEliteAt = game.t + SESSION.firstEliteAt;
  game.emit('aberturaFim', {});
}

/** O sinal pega: cada pessoa trava numa hora, a mais perto do Juninho por último (ele vê acontecer). */
function pegarSinal(game) {
  const ab = game.abertura;
  ab.fase = 'sinal';
  game.tv('aberturaSinal');
  game.emit('flash', {});
  game.shake(0.2);
  const p = game.player;
  const ord = [...ab.civis].sort((a, b) => Math.hypot(b.x - p.x, b.y - p.y) - Math.hypot(a.x - p.x, a.y - p.y));
  ord.forEach((c, i) => { c.viraT = ABERTURA.travaS + (i / ord.length) * ABERTURA.viraS; });
}

function virar(game, c) {
  c.virou = true;
  const e = game.spawnEnemy('telespectador', c.x, c.y, { tint: c.tint, walk: c.walk });
  e.speed *= ABERTURA.lentoMul;
  game.burst(c.x, c.y, 6, 'static');
}

/** Pular a abertura (da segunda vez em diante): todo mundo vira na hora. */
export function pularAbertura(game) {
  const ab = game.abertura;
  if (!ab || ab.fase === 'feito') return;
  for (const c of ab.civis) if (!c.virou) virar(game, c);
  acabar(game);
}

/** Ainda na abertura: ninguém ataca e o Juninho só entrega. */
export const emAbertura = (game) => !!(game.abertura && game.abertura.fase !== 'feito');
/** Logo depois do sinal: só telespectadores, e lentos. */
export const comecoLento = (game) => !!(game.abertura && game.abertura.fase === 'feito' && game.t < game.abertura.lentoAte);
