// Reações do cenário (REACOES em config.js): carro perto de uma explosão pega fogo e explode, e pode
// disparar outro; carro que leva porrada (capacete, chinelo, carimbo, objeto) perde vida, solta fumaça e,
// sem vida, pega fogo e explode depois de um tempo, com o círculo da explosão no chão (dá tempo de fugir);
// poste (ou fio do gatonet) perto de onde o Gato de Luz acerta descarrega um raio enorme na horda.
// Sem DOM e sem o sorteio da partida: o atraso de cada carro sai do lugar dele.
import { REACOES, DERRUBADO } from './config.js';
import { FX } from './efeitos_arte.js';
import { ferirFigurantes } from './figurantes.js';
import { lowerBound } from './cenario.js';

const R = REACOES;
const fra = (x, y) => (((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1) + 1) % 1;
const distRet = (x, y, x0, y0, x1, y1) => Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(y0 - y, 0, y - y1));

function estado(game) {
  if (!game.reacoes) game.reacoes = { pendentes: [], queimados: [] };
  return game.reacoes;
}

const centro = (c) => (c.transito ? [c.x, c.y] : [(c.x0 + c.x1) / 2, (c.y0 + c.y1) / 2]);
const caixa = (c) => (c.transito ? [c.x - c.wid / 2, c.y - c.len / 2, c.x + c.wid / 2, c.y + c.len / 2] : [c.x0, c.y0, c.x1, c.y1]);
export const vidaDoCarro = (c) => R.carro.vida * (R.carro.tipos[c.kind] || 1);

/** Os veículos (parados e na avenida) cuja caixa chega a `alc` de (x, y). */
function veiculosPerto(game, x, y, alc, out) {
  out.length = 0;
  const w = game.world;
  if (!w) return out;
  // parados no cenário (lista ordenada pela frente, y1)
  const list = w.props;
  for (let i = lowerBound(list, y - alc - 1); i < list.length && list[i].y <= y + alc + 12; i++) {
    const c = list[i];
    if (!R.carro.tipos[c.kind] || c.queimado) continue;
    if (distRet(x, y, c.x0, c.y0, c.x1, c.y1) <= alc) out.push(c);
  }
  // passando na avenida
  for (const c of game.traffic || []) {
    if (!R.carro.tipos[c.kind] && !c.wid) continue;
    c.transito = true;
    if (distRet(x, y, c.x - c.wid / 2, c.y - c.len / 2, c.x + c.wid / 2, c.y + c.len / 2) <= alc) out.push(c);
  }
  return out;
}
const perto = [];

/** O veículo pega fogo: explode daqui a `s` segundos (o desenho e o círculo no chão avisam). */
function incendiar(game, c, s) {
  if (c.queimado || c.explodeEm != null) return;
  c.fogoDe = game.t;
  c.explodeEm = game.t + s;
  c.fogoT = 0;
  estado(game).pendentes.push(c);
  const [cx, cy] = centro(c);
  game.som('pega_fogo', cx, cy);
  game.word(cx, cy - 1.8, 'VAI EXPLODIR!', '#ff7a3d');
  // as chamas em cima do carro até ele explodir (o da avenida leva o fogo junto)
  const C = R.carro;
  const tam = C.chamasM * (C.tipos[c.kind] || 1);
  const F = FX.chamas;
  // (com alvo, a altura z conta uma vez só; o parado ganha um ponto fixo no meio dele)
  game.efeito('chamas', cx, cy, { dur: s + 0.15, tam, z: (c.h || 1.4) * 0.55 + tam * (F.base - 0.5), alvo: c.transito ? c : { x: cx, y: cy } });
}

/** Uma explosão em (x, y) de raio `raio`: os veículos perto pegam fogo e explodem logo depois. */
export function explosaoPerto(game, x, y, raio) {
  const C = R.carro;
  for (const c of veiculosPerto(game, x, y, raio + C.gatilhoM, perto)) {
    const [cx, cy] = centro(c);
    incendiar(game, c, C.fogoCadeiaS[0] + fra(cx, cy) * (C.fogoCadeiaS[1] - C.fogoCadeiaS[0]));
  }
}

/**
 * Porrada nos veículos que um golpe pega em (x, y), de raio `raio`: tira `dano` da vida de cada um (um só
 * golpe por veículo quando vem `ja`, o conjunto dos que esse golpe já acertou). Devolve quantos acertou.
 */
export function golpeNoCarro(game, x, y, raio, dano, ja = null) {
  const C = R.carro;
  let n = 0;
  estado(game); // a fumaça dos amassados roda em updateReacoes
  for (const c of veiculosPerto(game, x, y, raio, perto)) {
    if (c.explodeEm != null || (ja && ja.has(c))) continue;
    if (ja) ja.add(c);
    n++;
    if (c.vida == null) c.vida = vidaDoCarro(c);
    c.vida -= dano;
    c.batidaT = game.t; // pisca no desenho
    const [cx, cy] = centro(c);
    game.som('lataria', cx, cy);
    game.burst(x, y, 4, 'debris');
    if (c.vida <= 0) incendiar(game, c, C.fogoS);
  }
  return n;
}

function explodirCarro(game, c) {
  const C = R.carro;
  const parado = !c.transito;
  const cx = parado ? (c.x0 + c.x1) / 2 : c.x;
  const cy = parado ? (c.y0 + c.y1) / 2 : c.y;
  const raio = C.raioM * (C.tipos[c.kind] || 1);
  game.hash.query(cx, cy, raio + 0.6, game.reacoesTmp || (game.reacoesTmp = []));
  for (const e of game.reacoesTmp) {
    if (e.dead) continue;
    const dx = e.x - cx;
    const dy = e.y - cy;
    const d = Math.hypot(dx, dy);
    if (d > raio + e.r) continue;
    const l = d || 1;
    game.damageEnemy(e, C.dano, 'carro_explode', (dx / l) * 9, (dy / l) * 9);
    if (!e.dead && !e.boss) e.vz = C.voo * (e.elite ? 0.5 : 1) * (0.8 + 0.4 * (1 - d / (raio + e.r)));
  }
  const p = game.player;
  if (!game.over && (p.x - cx) ** 2 + (p.y - cy) ** 2 < (raio * 0.8) ** 2 && !(p.z > 1) && !(p.invulnT > 0)) {
    game.hurtPlayer(C.danoJuninho, 'carro_explode');
    game.derrubar(p.x - cx || 0.01, p.y - cy, DERRUBADO.carroExplodeM); // voa para longe do carro (D64)
  }
  ferirFigurantes(game, cx, cy, raio * 0.8, C.danoJuninho * 2); // quem estiver perto do carro também
  // fogo de verdade, como a maleta
  game.efeito('explosao', cx, cy, { tam: raio * 2.6, z: raio * 0.38 });
  game.efeito('explosao_fumaca', cx, cy, { tam: raio * 2.5, z: raio * 0.42, delay: 0.55, de: 3, entra: 0.4, sobe: 0.45 });
  game.efeito('chamuscado', cx, cy, { tam: raio * 2.2, rot: fra(cx, cy) * Math.PI * 2 });
  game.efeito('luz', cx, cy, { dur: 0.6, tam: raio * 3.2, cor: '255,150,60' });
  game.burst(cx, cy, 16, 'debris');
  game.word(cx, cy - 0.5, 'BUM!', '#ffd21f');
  game.shake(0.45);
  game.metrics.carrosExplodidos = (game.metrics.carrosExplodidos || 0) + 1;
  if (parado) {
    c.queimado = true;
    c.fumacaAte = game.t + C.fumacaS;
    c.fumacaT = 0;
    estado(game).queimados.push(c);
  } else {
    const i = game.traffic.indexOf(c);
    if (i >= 0) game.traffic.splice(i, 1); // o carro da avenida voa longe
  }
  explosaoPerto(game, cx, cy, raio); // reação em cadeia
}

/** A cada quadro: carros pegando fogo (o círculo no chão enche até explodir), a fumaça dos amassados e dos queimados. */
export function updateReacoes(game) {
  const st = game.reacoes;
  if (!st) return;
  const C = R.carro;
  if (st.pendentes.length) {
    const agora = st.pendentes.filter((c) => game.t >= c.explodeEm);
    if (agora.length) {
      st.pendentes = st.pendentes.filter((c) => game.t < c.explodeEm);
      for (const c of agora) explodirCarro(game, c);
    }
    for (const c of st.pendentes) {
      const [cx, cy] = centro(c);
      const dur = c.explodeEm - c.fogoDe || 1;
      const raio = C.raioM * (C.tipos[c.kind] || 1);
      (game.avisosChao || (game.avisosChao = [])).push({ tipo: 'circulo', x: cx, y: cy, r: raio, k: (game.t - c.fogoDe) / dur });
      if (game.t >= (c.fogoT || 0)) {
        c.fogoT = game.t + C.fogoCadaS;
        const h = c.h || 1.4;
        const [x0, , x1] = caixa(c);
        // chamas saindo do capô e de baixo do carro, e a fumaça preta subindo
        game.burst(x0 + fra(cx + game.t, cy) * (x1 - x0), cy, 2, 'fogo'); // faíscas voando
        game.efeito('luz', cx, cy, { dur: 0.25, tam: raio * (1.4 + 0.6 * fra(game.t, cx)), cor: '255,120,40' });
        if (fra(game.t * 3, cy) < 0.45) game.efeito('explosao_fumaca', cx, cy, { tam: 2.2, z: h * 1.3, de: 3, entra: 0.25, sobe: 0.8, dur: 1.4, alvo: c.transito ? c : { x: cx, y: cy } });
      }
    }
  }
  // amassado (menos da metade da vida): fumaça fina saindo do capô
  for (const c of veiculosPerto(game, game.player.x, game.player.y, 30, perto)) {
    if (c.vida == null || c.explodeEm != null || c.vida > vidaDoCarro(c) * C.fumacaVida) continue;
    if (game.t < (c.fumacaT || 0)) continue;
    c.fumacaT = game.t + C.fumacaCadaS * 1.4;
    const [cx, cy] = centro(c);
    game.efeito('explosao_fumaca', cx, cy, { tam: 1.4, z: (c.h || 1.4) * 0.9, de: 3, entra: 0.3, sobe: 0.7, dur: 1.4, alvo: c.transito ? c : { x: cx, y: cy } });
  }
  for (const c of st.queimados) {
    if (game.t > c.fumacaAte) continue;
    if (game.t >= c.fumacaT) {
      c.fumacaT = game.t + R.carro.fumacaCadaS;
      const cx = (c.x0 + c.x1) / 2;
      const cy = (c.y0 + c.y1) / 2;
      game.efeito('explosao_fumaca', cx, cy, { tam: 2.6, z: c.h * 0.9, de: 3, entra: 0.3, sobe: 0.7, dur: 1.6 });
    }
  }
  if (st.queimados.length > 40) st.queimados = st.queimados.filter((c) => game.t <= c.fumacaAte);
}

/**
 * O Gato de Luz acertou em (x, y): o poste (ou o fio do gatonet) mais perto, se carregado, descarrega do
 * alto um raio enorme em até `alvos` inimigos em volta. Devolve se descarregou.
 */
export function raioPerto(game, x, y, ignorar) {
  const w = game.world;
  if (!w) return false;
  const P = R.poste;
  const list = w.props;
  let fonte = null;
  let fd = P.gatilhoM;
  for (let i = lowerBound(list, y - P.gatilhoM - 6); i < list.length && list[i].y <= y + P.gatilhoM + 1; i++) {
    const c = list[i];
    if (P.tipos[c.kind] == null || game.t < (c.cargaAte || 0)) continue;
    const d = distRet(x, y, c.x0, c.y0, c.x1, c.y1);
    if (d < fd) {
      fd = d;
      fonte = c;
    }
  }
  if (!fonte) return false;
  fonte.cargaAte = game.t + P.recargaS;
  // do alto do poste (no fio, do ponto mais perto de quem levou o choque)
  const fx = fonte.kind === 'fios' ? Math.max(fonte.x0, Math.min(fonte.x1, x)) : (fonte.x0 + fonte.x1) / 2;
  const fy = (fonte.y0 + fonte.y1) / 2;
  const fz = P.tipos[fonte.kind];
  game.hash.query(fx, fy, P.raioM, game.reacoesTmp || (game.reacoesTmp = []));
  const alvos = game.reacoesTmp
    .filter((e) => !e.dead && e !== ignorar && (e.x - fx) ** 2 + (e.y - fy) ** 2 <= P.raioM * P.raioM)
    .sort((a, b) => (a.x - fx) ** 2 + (a.y - fy) ** 2 - ((b.x - fx) ** 2 + (b.y - fy) ** 2))
    .slice(0, P.alvos);
  for (const e of alvos) {
    game.damageEnemy(e, P.dano, 'poste', 0, 0);
    e.choqueAte = game.t + P.travaS + 0.15;
    e.slowT = Math.max(e.slowT, P.travaS);
    e.slowF = Math.min(e.slowF || 1, 0.2);
    // um raio enorme para cada um, saindo do alto do poste
    game.fx.bolts.push({ pts: [{ x: fx, y: fy, z: fz }, { x: e.x, y: e.y }], t: 0, dur: 0.42, seed: (e.id * 37) % 1000, grosso: 2.2 });
    game.efeito('chamuscado_raio', e.x, e.y, { rot: fra(e.x, e.y) * Math.PI * 2 });
  }
  game.efeito('raio_origem', fx, fy, { z: fz, tam: 1.6 });
  game.efeito('luz', fx, fy, { dur: 0.5, tam: 9, cor: '170,210,255' });
  game.word(fx, fy - 0.5, 'ZZZT!', '#bfe0ff');
  game.shake(0.35);
  game.metrics.postesDescarregados = (game.metrics.postesDescarregados || 0) + 1;
  return true;
}
