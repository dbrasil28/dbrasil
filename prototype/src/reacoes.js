// Reações do cenário (REACOES em config.js): carro perto de uma explosão explode também, e pode disparar
// outro; poste (ou fio do gatonet) perto de onde o Gato de Luz acerta descarrega um raio enorme na horda.
// Sem DOM e sem o sorteio da partida: o atraso de cada carro sai do lugar dele.
import { REACOES } from './config.js';
import { lowerBound } from './cenario.js';

const R = REACOES;
const fra = (x, y) => (((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1) + 1) % 1;
const distRet = (x, y, x0, y0, x1, y1) => Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(y0 - y, 0, y - y1));

function estado(game) {
  if (!game.reacoes) game.reacoes = { pendentes: [], queimados: [] };
  return game.reacoes;
}

/** Uma explosão em (x, y) de raio `raio`: marca os veículos perto para explodir logo depois. */
export function explosaoPerto(game, x, y, raio) {
  const w = game.world;
  if (!w) return;
  const st = estado(game);
  const alc = raio + R.carro.gatilhoM;
  // parados no cenário (lista ordenada pela frente, y1)
  const list = w.props;
  for (let i = lowerBound(list, y - alc - 1); i < list.length && list[i].y <= y + alc + 12; i++) {
    const c = list[i];
    if (!R.carro.tipos[c.kind] || c.queimado || c.explodeEm != null) continue;
    if (distRet(x, y, c.x0, c.y0, c.x1, c.y1) > alc) continue;
    c.explodeEm = game.t + R.carro.atrasoS[0] + fra(c.x0, c.y0) * (R.carro.atrasoS[1] - R.carro.atrasoS[0]);
    st.pendentes.push(c);
  }
  // passando na avenida
  for (const c of game.traffic || []) {
    if (c.explodeEm != null) continue;
    if (distRet(x, y, c.x - c.wid / 2, c.y - c.len / 2, c.x + c.wid / 2, c.y + c.len / 2) > alc) continue;
    c.explodeEm = game.t + R.carro.atrasoS[0] + fra(c.x, c.y) * (R.carro.atrasoS[1] - R.carro.atrasoS[0]);
    c.transito = true;
    st.pendentes.push(c);
  }
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
  if (!game.over && (p.x - cx) ** 2 + (p.y - cy) ** 2 < (raio * 0.8) ** 2 && !(p.z > 1)) game.hurtPlayer(C.danoJuninho, 'carro_explode');
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

/** A cada quadro: carros que estão para explodir e a fumaça dos queimados. */
export function updateReacoes(game) {
  const st = game.reacoes;
  if (!st) return;
  if (st.pendentes.length) {
    const agora = st.pendentes.filter((c) => game.t >= c.explodeEm);
    if (agora.length) {
      st.pendentes = st.pendentes.filter((c) => game.t < c.explodeEm);
      for (const c of agora) explodirCarro(game, c);
    }
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
