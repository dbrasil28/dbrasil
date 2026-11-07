// Casas da favela em volta do caminho do Morro (peças de docs/arte/PEDIDO_FAVELA.md, FAVELA em config.js).
// Cada casa é uma caixa no mundo com a arte desenhada no ângulo do jogo. Sem DOM: roda nos testes.
//
// Ordem de desenho: nesta câmera, quem está a leste ou ao sul de uma caixa fica na frente dela. A caixa a
// oeste do caminho ('fundo') fica atrás de tudo que anda no caminho e é desenhada antes; a caixa a leste
// ('frente') entra na ordem por profundidade pela frente dela, como os objetos.
import { FAVELA } from './config.js';
import { hash2 } from './math.js';

/** Sorteia a peça de um lado do pedaço i pelo peso, sem repetir a anterior; barraco só no alto do morro. */
function sortear(pesos, i, j, lado, antes) {
  const lista = Object.entries(pesos).filter(([p]) => p !== antes && (!p.startsWith('barraco') || i >= FAVELA.barracoDesde));
  const total = lista.reduce((s, [, w]) => s + w, 0);
  let r = hash2(i * 31 + (lado === 'esq' ? 0 : 17), j, 921) * total;
  for (const [p, w] of lista) {
    r -= w;
    if (r <= 0) return p;
  }
  return lista[lista.length - 1][0];
}

/** Qual desenho da peça: a arte principal ou uma das variações (mesma caixa). */
function variante(peca, x, y) {
  const v = FAVELA.variantes[peca] || [];
  const n = Math.floor(hash2(Math.round(x * 10), Math.round(y * 10), 922) * (v.length + 1));
  return n === 0 ? peca : `${peca}_${v[n - 1]}`;
}

/** Monta w.casas a partir dos pedaços do Morro (o 0 é a Orla). */
export function montarFavela(w) {
  const casas = [];
  const P = FAVELA.pecas;
  const path = w.path;
  const canto = path.map(() => ({ esq: null, dir: null })); // onde começa cada lado do pedaço (y)
  const add = (peca, x0, y1, lado, d = P[peca].d) => {
    const A = P[peca];
    const c = { peca, x0, x1: x0 + A.w, y0: y1 - d, y1, h: A.h, lado, d, corte: d < A.d - 1e-6 };
    c.arte = variante(peca, x0, y1);
    casas.push(c);
    return c;
  };
  const sorteio = (i, j, baixa = false) => {
    if (i >= FAVELA.barracoDesde && hash2(i, j, 913) < FAVELA.barracoChance) return hash2(i, j, 914) < 0.5 ? 'barraco_a' : 'barraco_b';
    const lista = baixa ? FAVELA.fundoBaixo : FAVELA.fundo;
    return lista[Math.floor(hash2(i, j, 915) * lista.length)];
  };
  for (let i = 1; i < path.length; i++) {
    const k = path[i];
    const up = path[i + 1];
    // casas de frente no alto do pedaço, menos a passagem para o de cima
    if (!up) {
      for (let x = k.x0, j = 0; x < k.x1 - 0.3; j++) x = add(sorteio(i, j), x, k.y0, 'fundo').x1;
    } else {
      if (up.x0 - k.x0 >= FAVELA.vaoMinM) {
        // à esquerda da passagem: da passagem para fora; a primeira é a ponta do lado esquerdo do pedaço de cima
        let x = up.x0;
        for (let j = 0; x > k.x0 + 0.3; j++) {
          const c = add(sorteio(i, j), x - P[sorteio(i, j)].w, k.y0, 'fundo');
          if (j === 0) canto[i + 1].esq = c.y0;
          x = c.x0;
        }
      }
      if (k.x1 - up.x1 >= FAVELA.vaoMinM) {
        let x = up.x1;
        for (let j = 0; x < k.x1 - 0.3; j++) {
          const c = add(sorteio(i, 50 + j, true), x, k.y0, 'frente');
          if (j === 0) canto[i + 1].dir = c.y0;
          x = c.x1;
        }
      }
    }
    // os dois lados do pedaço, do pé para o alto: módulos de parede (à esquerda) ou de telhado (à direita)
    // misturados com fachadas e barracos, sem repetir a mesma peça seguida; o último, se passar do alto,
    // é cortado. Os pedaços se sobrepõem 1 m: o lado começa no alto do pedaço de baixo e, se o de cima for
    // mais largo por cima da casa, termina no pé dele, para a casa não entrar no chão de ninguém.
    const prev = path[i - 1];
    for (const lado of ['esq', 'dir']) {
      const pesos = lado === 'esq' ? FAVELA.ladoEsq : FAVELA.ladoDir;
      let y = canto[i][lado] ?? Math.min(k.y1, prev.y0);
      let antes = null;
      for (let j = 0; ; j++) {
        const peca = sortear(pesos, i, j, lado, antes);
        const A = P[peca];
        const x0 = lado === 'esq' ? k.x0 - A.w : k.x1;
        const fim = up && up.x0 < x0 + A.w && up.x1 > x0 ? up.y1 : k.y0;
        if (y - fim < FAVELA.vaoMinM) break;
        const d = Math.min(A.d, y - fim);
        add(peca, x0, y, lado === 'esq' ? 'fundo' : 'frente', d);
        y -= d;
        antes = peca;
      }
    }
  }
  casas.sort((a, b) => a.y1 - b.y1 || a.x0 - b.x0);
  w.casas = casas;
  return casas;
}
