// Cenário vivo da rota (sem DOM, roda no Node): carros parados nas ruas, botecos, açaí e pastelaria no
// meio do calçadão, carrinhos, bancos, lixeiras, orelhões, postes, placas e a sujeira do chão; no morro,
// motos, entulho, gatos de luz, caixas d'água, sinuca e varal nas lajes. Tudo determinístico por posição.
// Os sólidos nunca fecham a rota: ficam longe das passagens, das escadas e do começo da partida.
import { CENARIO, PLACES, ROUTE, CADEIRA_DIST, PREDIOS } from './config.js';
import { hash2 } from './math.js';

const H = hash2;

// textos das placas (nomes fictícios)
export const PLACAS = {
  rua: ['R. DO JEITINHO', 'R. DA PROPINA', 'TRAV. DO BOLETO', 'R. SEM SAÍDA', 'AV. DO DESESPERO', 'R. DA PROMESSA', 'TRAV. DO GATO', 'R. DO IMPOSTO', 'R. DA FILA', 'R. DO ATRASO'],
  aviso: ['PROIBIDO ESTACIONAR', 'CUIDADO: ARRASTÃO', 'ÁREA DE RISCO', 'DEVAGAR', 'PROIBIDO JOGAR LIXO', 'VENDE-SE', 'ALUGA-SE', 'CUIDADO: BURACO', 'NÃO ALIMENTE O ZUMBI', 'OBRA PARADA DESDE 1998'],
  parede: ['GELADINHO R$2', 'DISK GÁS', 'SALÃO DA KELLY', 'VENDE-SE LAJE', 'PROIBIDO JOGAR LIXO', 'AÇAÍ', 'CONSERTO DE CELULAR', 'MOTO-TÁXI', 'LAVA-JATO', 'JESUS VOLTA'],
};
// candidatos fictícios dos cartazes e santinhos (números de piada, sem partido)
export const CANDIDATOS = [
  { nome: 'TONHO DO ASFALTO', num: '171', frase: 'AGORA VAI', cor: '#1f5fb0' },
  { nome: 'DONA PROMESSA', num: '0800', frase: 'DE GRAÇA PRA VOCÊ', cor: '#c8342b' },
  { nome: 'CORONEL BOLETO', num: '7777', frase: 'ORDEM E PARCELA', cor: '#2f8f4e' },
  { nome: 'TIO DO PIX', num: '1000', frase: 'CAIU NA CONTA', cor: '#7a3fa0' },
  { nome: 'PASTOR GRANA', num: '1010', frase: 'DÍZIMO É INVESTIMENTO', cor: '#d98a1a' },
  { nome: 'DR. CARGO', num: '4040', frase: 'EXPERIÊNCIA EM SUMIR', cor: '#1f8a8a' },
];
// pichação (letras de pixo e frases de muro)
export const PIXOS = ['VIDA LOKA', 'FÉ', 'XIS', 'OS CRIA', 'SAUDADE', 'FORA TUDO', 'PAZ', 'TMJ', 'RIP', 'ZN', 'NÓS', 'BONDE', '100%', 'BRASIL'];
export const LETREIROS = {
  boteco: ['BOTECO', 'BAR DO ZÉ', 'BAR DA ESQUINA', 'BAR DO PEZÃO', 'BOTECO DA TIA'],
  acai: ['AÇAÍ', 'AÇAÍ DO GRAU', 'AÇAÍ NA TIGELA'],
  pastelaria: ['PASTEL', 'PASTELARIA', 'PASTEL E CALDO DE CANA'],
};

const rectDist2 = (k, x, y) => {
  const dx = Math.max(k.x0 - x, 0, x - k.x1);
  const dy = Math.max(k.y0 - y, 0, y - k.y1);
  return dx * dx + dy * dy;
};
const overlap = (a, b, m = 0) => a.x0 < b.x1 + m && a.x1 > b.x0 - m && a.y0 < b.y1 + m && a.y1 > b.y0 - m;

/** O retângulo pode virar sólido sem fechar passagem nem cobrir objeto, cura, escada ou lugar? */
function livre(w, r, piece, juntaM = CENARIO.livreJuntaM) {
  if (piece && (r.x0 < piece.x0 || r.x1 > piece.x1 || r.y0 < piece.y0 || r.y1 > piece.y1)) return false;
  if (rectDist2(r, ROUTE.orla.startX, 0) < CENARIO.livreInicioM ** 2) return false;
  for (const j of w.joints) if (rectDist2(r, j.x, j.y) < juntaM ** 2) return false;
  for (const P of w.platforms) if (overlap(r, { x0: P.bx0, y0: P.by0, x1: P.bx1, y1: P.by1 }, 0.4)) return false;
  for (const k of w.solids) if (overlap(r, k, 0.75)) return false;
  for (const pl of w.places) if (pl.x0 !== undefined && overlap(r, pl, 0.3)) return false;
  for (const s of w.slots) if (rectDist2(r, s.x, s.y) < 0.9 * 0.9) return false;
  for (const h of w.heals) if (rectDist2(r, h.x, h.y) < 0.9 * 0.9) return false;
  return true;
}

/** Coloca um objeto de cenário; sólido só se couber sem atrapalhar a rota. Devolve o objeto ou null. */
function prop(w, kind, x0, y0, x1, y1, h, v, opts = {}) {
  const p = { kind, x0, y0, x1, y1, h, v, x: (x0 + x1) / 2, y: y1, solid: opts.solid !== false, ...opts.extra };
  if (p.solid && !livre(w, p, opts.piece, opts.juntaM)) return null;
  // figuras paradas (garotas na esquina, policiais): não ficam em cima de banco, lixeira, carro
  if (FIGURAS.has(kind) && w.solids.some((q) => overlap(p, q, 0.45))) return null;
  w.props.push(p);
  if (p.solid) w.solids.push(p);
  return p;
}

export const FIGURAS = new Set(['garota', 'policial']);
const litter = (w, kind, x, y, v) => w.litter.push({ kind, x, y, v });

function slot(w, kind, x, y, dir = 's') {
  w.slots.push({ kind, x, y, plat: null, place: null, dir, obj: { kind, x, y, plat: null, dir }, emptyT: 0 });
}

/**
 * Loja com balcão: 'esq' encostada no lado do morro (balcão na parede), 'meio' barraca solta no
 * calçadão (balcão de frente, mesas na frente). Boteco tem mesas e cadeiras; açaí e pastelaria têm a cura.
 */
function loja(w, kind, side, x, yb, seed) {
  let counter;
  let area;
  let mesas;
  let heal;
  if (side === 'esq') {
    counter = { x0: x, y0: yb, x1: x + 1.4, y1: yb + 3.6, kind: 'balcao' };
    area = { x0: x, y0: yb - 1.2, x1: x + 6.5, y1: yb + 5.4 };
    mesas = [[x + 3.6, yb + 0.9], [x + 4.4, yb + 3.6]];
    heal = [x + 2.0, yb + 1.8];
  } else {
    counter = { x0: x - 1.7, y0: yb, x1: x + 1.7, y1: yb + 1.3, kind: 'balcao' };
    area = { x0: x - 3.6, y0: yb - 0.8, x1: x + 3.6, y1: yb + 5.0 };
    mesas = [[x - 2.0, yb + 3.4], [x + 2.1, yb + 3.7]];
    heal = [x + 0.2, yb + 2.0];
  }
  if (!livre(w, area)) return false;
  w.solids.push(counter);
  const nomes = LETREIROS[kind];
  w.places.push({ kind, side, ...area, counter, sign: nomes[Math.floor(seed * nomes.length)] });
  const assento = kind === 'boteco' ? 'cadeira' : 'banquinho';
  mesas.forEach(([mx, my], i) => {
    if (kind !== 'boteco' && i === 1) {
      // açaí e pastelaria: só banquinhos na segunda fila
      slot(w, 'banquinho', mx - 0.6, my);
      slot(w, 'banquinho', mx + 0.6, my);
      return;
    }
    slot(w, 'mesa', mx, my);
    slot(w, assento, mx - CADEIRA_DIST, my, 'se');
    slot(w, assento, mx + CADEIRA_DIST, my, 'sw');
  });
  if (kind === 'boteco') slot(w, 'engradado', side === 'esq' ? x + 1.9 : x + 2.6, side === 'esq' ? yb + 4.9 : yb + 0.4);
  else w.heals.push({ kind: kind === 'acai' ? 'acai' : 'pastel', x: heal[0], y: heal[1], plat: null });
  // sujeira de boteco: guardanapos, tampinhas e latinhas em volta
  for (let i = 0; i < 6; i++) {
    litter(w, i % 2 ? 'latinha' : 'papel', area.x0 + H(i, Math.round(yb), 71) * (area.x1 - area.x0), area.y0 + H(i, Math.round(yb), 72) * (area.y1 - area.y0), H(i, 0, 73));
  }
  return true;
}

/** Rua transversal: carros e às vezes um ônibus nas duas faixas, buraco com cones, bueiro e óleo. */
function rua(w, map, s) {
  const C = CENARIO.carros;
  const E = C.escala;
  const ys = -map.blockLen * s + (map.blockLen - map.streetLen);
  const ye = ys + map.streetLen;
  for (let L = 0; L < 2; L++) {
    const used = [false, false, false, false];
    if (H(s, L, 501) < C.onibusChance) {
      const i = 0; // o ônibus ocupa as duas vagas da faixa
      const yy0 = L === 0 ? ys + 0.35 : ye - 0.35 - C.onibusLarg * E;
      const x0 = C.vagaX[i];
      if (prop(w, 'onibus', x0, yy0, x0 + C.onibusLen * E, yy0 + C.onibusLarg * E, C.onibusH * E, H(s, L, 503), { piece: w.orla })) {
        used[i] = used[i + 1] = true;
      }
    }
    const want = C.vagaX.map((_, i) => !used[i] && H(s, L * 7 + i, 504) < C.chance);
    if (want.every((x, i) => x || used[i])) {
      // sempre sobra uma vaga livre na faixa
      const cheias = want.map((x, i) => (x ? i : -1)).filter((i) => i >= 0);
      want[cheias[Math.floor(H(s, L, 505) * cheias.length)]] = false;
    }
    want.forEach((ok, i) => {
      if (!ok) return;
      const x0 = C.vagaX[i] + (H(s, L * 7 + i, 506) - 0.5) * 0.3;
      const yy0 = L === 0 ? ys + 0.35 : ye - 0.35 - C.larg * E;
      prop(w, 'carro', x0, yy0, x0 + C.len * E, yy0 + C.larg * E, C.h * E, H(s, L * 7 + i, 507), { piece: w.orla });
    });
  }
  // buraco no meio da rua, cercado de cones
  if (H(s, 0, 508) < CENARIO.buracoChance) {
    const x = -11 + H(s, 0, 509) * 7;
    const y = ys + map.streetLen / 2 + (H(s, 0, 510) - 0.5);
    if (y < w.orla.y1 - 1.5) {
      litter(w, 'buraco', x, y, H(s, 0, 511));
      for (const [dx, dy] of [[-1.3, -0.4], [1.3, 0.3], [0.1, 1.1]]) prop(w, 'cone', x + dx - 0.22, y + dy - 0.22, x + dx + 0.22, y + dy + 0.22, 0.7, 0, { piece: w.orla });
    }
  }
  // bandeirinhas verde-amarelas atravessando a rua (desde a última Copa)
  if (H(s, 3, 516) < CENARIO.bandeirinhasChance) prop(w, 'bandeirinhas', w.orla.x0, ys + 3.8, CENARIO.bandeirinhasAteX, ys + 4.0, 4.4, H(s, 3, 517), { solid: false });
  for (let i = 0; i < CENARIO.santinhos; i++) litter(w, 'santinho', -13 + H(s, i, 518) * 13, ys + 0.5 + H(s, i, 519) * 7, H(s, i, 520));
  litter(w, 'bueiro', -11 + H(s, 1, 512) * 3, ys + 1.0, 0);
  litter(w, 'bueiro', -6 + H(s, 2, 512) * 3, ye - 1.0, 0);
  for (let i = 0; i < 4; i++) litter(w, 'oleo', -13 + H(s, i, 513) * 13, ys + 1 + H(s, i, 514) * 6, H(s, i, 515));
}

function calcadao(w, map, b) {
  const y0 = -map.blockLen * b; // calçadão deste quarteirão: y0 .. y0 + 40
  const seed = (i) => H(b, i, 601);
  // lojas: a segunda do lado do morro, a barraca do meio, e um boteco a mais onde não havia nada
  if (PLACES.orla[b % PLACES.orla.length] === 'nada') loja(w, 'boteco', 'esq', map.minX, y0 + 13, seed(1));
  loja(w, CENARIO.esquerda2[b % CENARIO.esquerda2.length], 'esq', map.minX, y0 + 28, seed(2));
  const meio = CENARIO.meio[b % CENARIO.meio.length];
  if (!loja(w, meio, 'meio', -3.4 + (seed(3) - 0.5), y0 + 15, seed(4))) loja(w, meio, 'meio', -3.4, y0 + 24, seed(4));
  // carrinho de milho, banca de jornal ou carrinho de picolé, perto de uma das ruas
  const car = CENARIO.carrinho[b % CENARIO.carrinho.length];
  for (const [cx, cy] of [[-4.5 + seed(5) * 2.5, y0 + 5], [-4 + seed(6) * 2.5, y0 + 34.5]]) {
    const dim = car === 'banca' ? [2.4, 1.6, 2.3] : car === 'milho' ? [1.4, 0.8, 1.1] : [1.2, 0.8, 1.0];
    const p = prop(w, car, cx - dim[0] / 2, cy - dim[1], cx + dim[0] / 2, cy, dim[2], seed(7));
    if (p) {
      if (car === 'milho') w.heals.push({ kind: 'milho', x: cx + 0.2, y: cy + 0.9, plat: null });
      break;
    }
  }
  // bancos de frente para o mar e no lado do morro, com lixeira do lado
  // na beira da avenida, de frente para o mar, e no meio do calçadão
  for (const [bx, yy, i] of [[-1.5, 5, 1], [-1.5, 12.5, 2], [-1.5, 31, 3], [-1.5, 37, 4], [-6.2, 8, 5], [-6.2, 22, 6]]) {
    if (H(b, i, 602) > 0.62) continue;
    const bn = prop(w, 'banco', bx, y0 + yy, bx + 1.9, y0 + yy + 0.55, 0.9, H(b, i, 603));
    if (bn && H(b, i, 604) < 0.6) {
      const lx = bx + (bx > -3 ? -1.35 : 2.75);
      if (prop(w, 'lixeira', lx, y0 + yy, lx + 0.5, y0 + yy + 0.5, 1.0, H(b, i, 605))) {
        for (let k = 0; k < 4; k++) litter(w, k ? 'papel' : 'saco', lx + 0.25 + (H(b, i * 9 + k, 606) - 0.5) * 2.2, y0 + yy + 0.6 + H(b, i * 9 + k, 607) * 1.2, H(b, k, 608));
      }
    }
  }
  // sem muro nem tapume no calçadão (pedido do autor, 07/11/2026): muro no meio da calçada não faz sentido
  // garotas de programa paradas na esquina, perto do poste (figuras de ambiente: não bloqueiam nem lutam)
  // na esquina da avenida e na do lado das lojas
  for (const [gx, gy, i] of [[-0.5, 38.2, 1], [0.3, 38.6, 2], [-8.0, 1.4, 3], [-0.6, 2.2, 4]]) {
    if (H(b, i, 630) < 0.5) prop(w, 'garota', gx - 0.25, y0 + gy - 0.2, gx + 0.25, y0 + gy, 1.68, H(b, i, 631), { solid: false });
  }
  // orelhão (um a cada dois quarteirões)
  if (b % 2 === 1) prop(w, 'orelhao', -6.2, y0 + 30.6, -5.6, y0 + 31.1, 2.1, seed(8));
  // postes nas duas fileiras e placas nas esquinas
  const step = CENARIO.posteCadaM;
  for (let row = 0; row < 2; row++) {
    const px = row === 0 ? -7.4 : map.avenidaX0 - 0.45; // a segunda fileira ilumina a avenida
    for (let yy = 2 + row * (step / 2); yy < 39; yy += step) {
      prop(w, 'poste', px - 0.18, y0 + yy - 0.36, px + 0.18, y0 + yy, CENARIO.posteAlturaM, H(b, Math.round(yy), 609 + row));
    }
  }
  // cada rua tem um nome só, nas duas esquinas: a de baixo do quarteirão b é a rua b, a de cima é a b + 1
  const nomeRua = (r) => PLACAS.rua[r % PLACAS.rua.length];
  prop(w, 'placa', -6.9, y0 + 38.4, -6.6, y0 + 38.7, 2.6, 0, { extra: { text: nomeRua(b), tipo: 'rua' } });
  prop(w, 'placa', -0.1, y0 + 1.0, 0.2, y0 + 1.3, 2.6, 0, { extra: { text: nomeRua(b + 1), tipo: 'rua' } });
  const aviso = PLACAS.aviso[Math.floor(H(b, 2, 611) * PLACAS.aviso.length)];
  prop(w, 'placa', -3.4 + H(b, 3, 611) * 2, y0 + 26.5, -3.1 + H(b, 3, 611) * 2, y0 + 26.8, 2.4, 0, { extra: { text: aviso, tipo: 'aviso' } });
  // santinhos de candidato espalhados perto das ruas (depois da eleição ninguém varre)
  for (let i = 0; i < CENARIO.santinhos; i++) {
    const top = i % 2 === 0;
    litter(w, 'santinho', map.minX + 1 + H(b, i, 640) * (map.avenidaX0 - map.minX - 1.5), y0 + (top ? H(b, i, 641) * 5 : 35 + H(b, i, 641) * 5), H(b, i, 642));
  }
  // sujeira espalhada (só desenho)
  const n = CENARIO.lixoPorQuarteirao;
  const kinds = ['mancha', 'mancha', 'latinha', 'papel', 'bituca', 'saco', 'poca', 'papelao', 'garrafa', 'mancha', 'papel', 'chiclete'];
  for (let i = 0; i < n; i++) {
    const x = map.minX + 0.5 + H(b, i, 620) * (map.avenidaX0 - map.minX - 1);
    const y = y0 + H(b, i, 621) * 40;
    litter(w, kinds[Math.floor(H(b, i, 622) * kinds.length)], x, y, H(b, i, 623));
  }
  // avenida: óleo nas faixas e bueiros no meio-fio
  for (let i = 0; i < 6; i++) litter(w, 'oleo', map.avenidaX0 + 0.8 + H(b, i, 650) * (map.avenidaX1 - map.avenidaX0 - 1.6), y0 + H(b, i, 651) * 40, H(b, i, 652));
  litter(w, 'bueiro', map.avenidaX0 + 0.6, y0 + 12 + H(b, 1, 653) * 16, 0);
  litter(w, 'bueiro', map.avenidaX1 - 0.6, y0 + 8 + H(b, 2, 653) * 20, 0);
}

/** Prédios do quarteirão na borda esquerda, da rua de baixo para a de cima, encostados um no outro. */
function predios(w, map, b) {
  const y0 = -map.blockLen * b;
  const P = PREDIOS;
  const nomes = Object.keys(P.modelos);
  let y = y0 + 40;
  for (let i = 0; i < 6 && y > y0 + 4; i++) {
    const nome = nomes[Math.floor(H(b, i, 1201) * nomes.length)];
    const M = P.modelos[nome];
    const mpp = P.frenteM / (M.perto[0] - M.esq); // metros por pixel da imagem
    const len = ((M.perto[1] - M.longe[1]) * mpp) / P.k; // comprimento da fachada ao longo do calçadão
    if (y - len < y0 - 1) break;
    w.predios.push({ x0: P.x1 - P.frenteM, x1: P.x1, y0: y - len, y1: y, img: nome, mpp });
    y -= len;
  }
}

/** Areia: coqueiros, guarda-sóis com toalha e isopor, carrinho de mate e, às vezes, a rede de futevôlei. */
function praia(w, map, b) {
  const y0 = -map.blockLen * b;
  const sd = (i) => H(b, i, 1101);
  const x0 = map.sandX + 0.3;
  const x1 = map.maxX - 0.3;
  // flat: estendido no chão (desenho sem colisão, conta como chão para a ordem de desenho)
  const chao = (kind, ax, ay, bx, by, v) => {
    const p = prop(w, kind, ax, ay, bx, by, 0.05, v, { solid: false });
    p.y = p.y0 - 0.3;
    return p;
  };
  for (const [cx, yy, i] of [[x1 - 0.6, 4, 1], [x1 - 0.4, 33, 2], [x0 + 1.4, 14, 3]]) {
    if (sd(i) < 0.75) prop(w, 'coqueiro', cx - 0.25, y0 + yy - 0.5, cx + 0.25, y0 + yy, 7.5, sd(10 + i));
  }
  for (const [cx, yy, i] of [[x0 + 2.0, 8, 1], [x0 + 3.6, 27.5, 2], [x0 + 1.4, 36, 3], [x0 + 4.2, 18, 4]]) {
    if (sd(20 + i) > 0.8) continue;
    const gs = prop(w, 'guarda_sol', cx - 0.1, y0 + yy - 0.2, cx + 0.1, y0 + yy, 2.6, sd(30 + i));
    if (!gs) continue;
    if (cx + 1.6 < x1) chao('toalha', cx + 0.35, y0 + yy - 1.2, cx + 1.35, y0 + yy + 0.6, sd(40 + i));
    if (sd(50 + i) < 0.7) prop(w, 'isopor', cx - 1.7, y0 + yy - 0.1, cx - 0.95, y0 + yy + 0.4, 0.5, sd(60 + i));
  }
  if (b % 2 === 0) prop(w, 'mate', x1 - 2.0, y0 + 11.4, x1 - 0.6, y0 + 12.2, 1.2, sd(70));
  // quadra de futevôlei (a cada 3 quarteirões): linhas no chão, rede com os postes sólidos
  if (b % 3 === 1) {
    const ry = y0 + 31;
    for (const px of [x0, x1 - 0.3]) prop(w, 'poste_rede', px, ry - 0.25, px + 0.3, ry, 2.2, 0, { extra: { invisivel: true } });
    const r = prop(w, 'rede', x0, ry - 0.2, x1, ry, 2.2, sd(80), { solid: false });
    if (r) litter(w, 'quadra', (x0 + x1) / 2, ry, (x1 - x0) / 2);
  }
}

/**
 * Polícia na favela (figuras de ambiente, não lutam): camburão parado no pé do morro com policiais
 * armados de guarda; no morro, camburão na primeira laje, policiais nas entradas das vielas e uma
 * barricada de pneus e tambores que fecha meia viela.
 */
function policia(w, map) {
  const P = CENARIO.policia;
  // pé do morro: rua do fim da Orla, ao lado da escadaria
  const ys = w.orlaTop + 0.35;
  const E = CENARIO.carros.escala;
  const len = P.len * E;
  const larg = P.larg * E;
  prop(w, 'camburao', P.peX0, ys, P.peX0 + len, ys + larg, P.h * E, 0.3, { piece: w.orla });
  for (const [x, y, v] of [[P.peX0 - 0.9, ys + larg + 0.9, 0.1], [P.peX0 + len + 0.6, ys + larg + 0.5, 0.8], [P.peX0 + 1.5, ys + larg + 1.3, 0.45]]) {
    prop(w, 'policial', x - 0.25, y - 0.2, x + 0.25, y, 1.8, v, { solid: false });
  }
  let lajes = 0;
  w.path.forEach((k, idx) => {
    if (idx < 2) return;
    const len = k.y1 - k.y0;
    const sd = (i) => H(idx, i, 901);
    if (k.kind === 'laje' && lajes < P.lajesComCamburao) {
      const x0 = k.x0 + 0.3;
      const E = CENARIO.carros.escala;
      const len = P.len * E;
      const larg = P.larg * E;
      if (prop(w, 'camburao', x0, k.y1 - 0.4 - larg, x0 + len, k.y1 - 0.4, P.h * E, 0.7, { piece: k, juntaM: 2.4 })) {
        lajes++;
        prop(w, 'policial', x0 + len + 0.5, k.y1 - 1.0, x0 + len + 1.0, k.y1 - 0.8, 1.8, 0.2, { solid: false });
        prop(w, 'policial', x0 + 1.2, k.y1 - larg - 1.2, x0 + 1.7, k.y1 - larg - 1.0, 1.8, 0.65, { solid: false });
      }
    }
    if (k.kind === 'viela' && P.vielas.includes(idx)) {
      // dois policiais na entrada da viela, de costas para a parede
      for (const left of [true, false]) {
        const x = left ? k.x0 + 0.45 : k.x1 - 0.45;
        const y = k.y1 - 1.5 - sd(left ? 1 : 2) * 2;
        prop(w, 'policial', x - 0.25, y - 0.2, x + 0.25, y, 1.8, left ? 0.15 : 0.85, { solid: false });
      }
    }
    if (k.kind === 'viela' && idx === P.barricadaViela) {
      // barricada fechando meia viela (sobra passagem)
      const left = sd(3) < 0.5;
      const wd = (k.x1 - k.x0) * 0.48;
      const y = k.y0 + len * 0.5;
      const x0 = left ? k.x0 + 0.05 : k.x1 - 0.05 - wd;
      prop(w, 'barricada', x0, y - 0.9, x0 + wd, y, 1.0, sd(4), { piece: k });
      prop(w, 'tambor', left ? x0 + wd + 0.9 : x0 - 1.5, y - 2.4, left ? x0 + wd + 1.5 : x0 - 0.9, y - 1.8, 0.9, sd(5), { piece: k });
    }
  });
}

/** Subida do Morro: motos encostadas, entulho, gatos de luz, placas nas paredes; lajes com caixa d'água, sinuca, churrasqueira e varal. */
function morro(w) {
  const M = CENARIO.morro;
  w.path.forEach((k, idx) => {
    if (idx === 0) return; // a orla tem o seu cenário
    const len = k.y1 - k.y0;
    const wd = k.x1 - k.x0;
    const sd = (i) => H(idx, i, 701);
    if (k.kind === 'viela') {
      for (let i = 0; i < M.motosPorViela; i++) {
        const left = (i + idx) % 2 === 0;
        const y = k.y0 + ((i + 1) * len) / (M.motosPorViela + 1) + (sd(i) - 0.5) * 3;
        const x0 = left ? k.x0 + 0.1 : k.x1 - 2.0;
        prop(w, 'moto', x0, y - 0.7, x0 + 1.9, y, 1.1, sd(10 + i), { piece: k });
      }
      if (sd(20) < 0.6) {
        const left = sd(21) < 0.5;
        const y = k.y0 + 2 + sd(22) * (len - 4);
        const x0 = left ? k.x0 + 0.1 : k.x1 - 1.4;
        prop(w, 'entulho', x0, y - 1.0, x0 + 1.3, y, 0.7, sd(23), { piece: k });
      }
      if (sd(25) < 0.75) {
        const y = k.y0 + 2 + sd(26) * (len - 4);
        const x0 = sd(27) < 0.5 ? k.x0 + 0.15 : k.x1 - 1.0;
        const sx = x0 + 0.4;
        const sy = y + 0.9;
        if (sy < k.y1 - 0.3 && !w.solids.some((q) => rectDist2(q, sx, sy) < 0.5 * 0.5) && prop(w, 'pneus', x0, y - 0.8, x0 + 0.85, y, 0.6, sd(28), { piece: k })) slot(w, 'pneu', sx, sy);
      }
      // gato de luz cruzando a viela e placas pintadas nas paredes
      prop(w, 'fios', k.x0, k.y0 + len * (0.3 + sd(30) * 0.4) - 0.2, k.x1, k.y0 + len * (0.3 + sd(30) * 0.4), 5.2, sd(31), { solid: false });
      if (sd(32) < 0.7) prop(w, 'bandeirinhas', k.x0, k.y0 + len * 0.8 - 0.2, k.x1, k.y0 + len * 0.8, 4.0, sd(33), { solid: false });
      for (let i = 0; i < 2; i++) {
        const left = i === 0;
        const y = k.y0 + 3 + sd(40 + i) * (len - 6);
        const text = PLACAS.parede[Math.floor(sd(42 + i) * PLACAS.parede.length)];
        const x = left ? k.x0 : k.x1;
        prop(w, 'placa_parede', x - 0.05, y - 0.1, x + 0.05, y, 1.7, sd(44 + i), { solid: false, extra: { text, left } });
      }
    } else if (k.kind === 'laje') {
      const cx = (k.x0 + k.x1) / 2;
      const cy = (k.y0 + k.y1) / 2;
      prop(w, 'caixa_dagua', k.x0 + 0.4, k.y1 - 3.8, k.x0 + 1.9, k.y1 - 2.3, 1.3, sd(1), { piece: k });
      prop(w, 'caixa_dagua', k.x1 - 2.0, cy + 1.2, k.x1 - 0.5, cy + 2.7, 1.3, sd(2), { piece: k });
      prop(w, 'sinuca', cx - 4.6, k.y0 + 1.6, cx - 2.2, k.y0 + 2.9, 0.85, sd(3), { piece: k });
      prop(w, 'churrasqueira', cx + 4.2, cy + 3.2, cx + 5.0, cy + 4.0, 0.95, sd(4), { piece: k });
      prop(w, 'varal', cx + 0.5, cy + 4.6, cx + 4.5, cy + 4.8, 1.9, sd(5), { solid: false });
      prop(w, 'bandeira', k.x0 + 0.5, k.y0 + 0.5, k.x0 + 0.7, k.y0 + 0.7, 3.4, sd(6), { piece: k });
    } else if (k.kind === 'escadaria' && idx > 1) {
      const text = PLACAS.parede[Math.floor(sd(50) * PLACAS.parede.length)];
      prop(w, 'placa_parede', k.x0 - 0.05, k.y0 + len * 0.5 - 0.1, k.x0 + 0.05, k.y0 + len * 0.5, 1.7, sd(51), { solid: false, extra: { text, left: true } });
    }
    // lixo: sacos encostados na parede, latinhas, manchas
    const kinds = ['saco', 'saco', 'mancha', 'latinha', 'papel', 'poca', 'garrafa', 'papelao', 'bituca'];
    for (let i = 0; i < M.lixoPorPedaco; i++) {
      const kind = kinds[Math.floor(sd(60 + i) * kinds.length)];
      const edge = kind === 'saco' || kind === 'papelao';
      const x = edge ? (sd(80 + i) < 0.5 ? k.x0 + 0.35 : k.x1 - 0.35) : k.x0 + 0.4 + sd(80 + i) * (wd - 0.8);
      litter(w, kind, x, k.y0 + sd(100 + i) * len, sd(120 + i));
    }
  });
}

/**
 * Fachadas viradas para a câmera no alto de cada pedaço da rota (o muro do fim da Orla, os fundos
 * das lajes e vielas do morro), menos a passagem para o pedaço de cima. Desenho estático, com pichação,
 * cartazes de candidato e bandeira pendurada.
 */
function fachadas(w) {
  w.fachadas = [];
  for (let i = 0; i < w.path.length; i++) {
    const k = w.path[i];
    const up = w.path[i + 1];
    const cuts = up ? [[k.x0, Math.max(k.x0, up.x0)], [Math.min(k.x1, up.x1), k.x1]] : [[k.x0, k.x1]];
    for (const [a, b] of cuts) {
      if (b - a < 0.8) continue;
      w.fachadas.push({ x0: a, x1: b, y: k.y0, h: i === 0 ? 3.2 : 2.8, seed: H(i, Math.round(a * 10), 801), orla: i === 0 });
    }
  }
}

export const SOLID_CELL = 6;

/** Monta o cenário de todo o mundo e os índices por faixa de y (desenho e colisão). */
export function placeCenario(w, map) {
  w.props = [];
  w.litter = [];
  // lojas primeiro (ocupam espaço com mesas), depois ruas, calçadão e morro
  w.predios = [];
  for (let b = 0; b <= ROUTE.orla.blocks; b++) {
    predios(w, map, b);
    calcadao(w, map, b);
    praia(w, map, b);
  }
  policia(w, map); // antes dos carros: o camburão tem vaga garantida no pé do morro
  for (let s = 0; s <= ROUTE.orla.blocks + 1; s++) rua(w, map, s);
  morro(w);
  fachadas(w);
  w.props.sort((p, q) => p.y - q.y);
  w.litter.sort((p, q) => p.y - q.y);
  w.solidGrid = new Map();
  for (const k of w.solids) {
    for (let c = Math.floor((k.y0 - 1.6) / SOLID_CELL); c <= Math.floor((k.y1 + 1.6) / SOLID_CELL); c++) {
      let arr = w.solidGrid.get(c);
      if (!arr) w.solidGrid.set(c, (arr = []));
      arr.push(k);
    }
  }
}

/** Primeiro índice da lista (ordenada por y) com y >= y0. */
export function lowerBound(list, y0) {
  let lo = 0;
  let hi = list.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (list[mid].y < y0) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
