// Casas da favela em volta do caminho do Morro (peças de docs/arte/PEDIDO_FAVELA.md, FAVELA em config.js).
// Cada casa é uma caixa no mundo com a arte desenhada no ângulo do jogo. Sem DOM: roda nos testes.
//
// Ordem de desenho: nesta câmera, quem está a leste ou ao sul de uma caixa fica na frente dela. A caixa a
// oeste do caminho ('fundo') fica atrás de tudo que anda no caminho e é desenhada antes; a caixa a leste
// ('frente') entra na ordem por profundidade pela frente dela, como os objetos.
import { FAVELA } from './config.js';
import { hash2 } from './math.js';

/** Monta w.casas a partir dos pedaços do Morro (o 0 é a Orla). */
export function montarFavela(w) {
  const casas = [];
  const P = FAVELA.pecas;
  const path = w.path;
  const canto = path.map(() => ({ esq: null, dir: null })); // onde começa cada lado do pedaço (y)
  const add = (peca, x0, y1, lado, d = P[peca].d) => {
    const A = P[peca];
    const c = { peca, x0, x1: x0 + A.w, y0: y1 - d, y1, h: A.h, lado, d, corte: d < A.d - 1e-6 };
    casas.push(c);
    return c;
  };
  const sorteio = (i, j) => {
    if (i >= FAVELA.barracoDesde && hash2(i, j, 913) < FAVELA.barracoChance) return hash2(i, j, 914) < 0.5 ? 'barraco_a' : 'barraco_b';
    return FAVELA.fundo[Math.floor(hash2(i, j, 915) * FAVELA.fundo.length)];
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
          const c = add(sorteio(i, 50 + j), x, k.y0, 'frente');
          if (j === 0) canto[i + 1].dir = c.y0;
          x = c.x1;
        }
      }
    }
    // os dois lados do pedaço, em módulos de 6 m do pé para o alto (o último, mais curto, é cortado). Os
    // pedaços se sobrepõem 1 m: o lado começa no alto do pedaço de baixo e, se o de cima for mais largo
    // por cima do módulo, termina no pé dele, para a casa não entrar no chão de ninguém.
    const prev = path[i - 1];
    for (const lado of ['esq', 'dir']) {
      const peca = lado === 'esq' ? 'parede_viela_esq' : 'telhado_viela_dir';
      const D = P[peca].d;
      const x0 = lado === 'esq' ? k.x0 - P[peca].w : k.x1;
      const x1 = x0 + P[peca].w;
      const fim = up && up.x0 < x1 && up.x1 > x0 ? up.y1 : k.y0;
      let y = canto[i][lado] ?? Math.min(k.y1, prev.y0);
      while (y - fim >= FAVELA.vaoMinM) {
        const d = Math.min(D, y - fim);
        add(peca, x0, y, lado === 'esq' ? 'fundo' : 'frente', d);
        y -= d;
      }
    }
  }
  casas.sort((a, b) => a.y1 - b.y1 || a.x0 - b.x0);
  w.casas = casas;
  return casas;
}
