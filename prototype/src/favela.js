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
  const topI = w.topI ?? path.length - 1;
  const becos = path.filter((k) => k.principal === false); // os becos (D92) entram depois, com as casas deles
  // o que fica sem casa por causa dos becos: o chão deles e, ao sul da viela deitada e da pracinha, o quintal
  const reservas = quintais(becos);
  w.quintais = reservas; // o chão deles é desenhado como quintal (mapa.js)
  const obstaculos = [...becos, ...reservas];
  // a casa entra no chão de um beco ou no quintal dele (D92)?
  const naReserva = (peca, x0, y1, d = P[peca].d) =>
    obstaculos.some((b) => x0 < b.x1 - 0.05 && x0 + P[peca].w > b.x0 + 0.05 && y1 - d < b.y1 - 0.05 && y1 > b.y0 + 0.05);
  for (let i = 1; i <= topI; i++) {
    const k = path[i];
    const up = i < topI ? path[i + 1] : null;
    // casas de frente no alto do pedaço, menos a passagem para o de cima
    if (!up) {
      for (let x = k.x0, j = 0; x < k.x1 - 0.3; j++) {
        const peca = sorteio(i, j);
        x = naReserva(peca, x, k.y0) ? x + 0.5 : add(peca, x, k.y0, 'fundo').x1;
      }
    } else {
      if (up.x0 - k.x0 >= FAVELA.vaoMinM) {
        // à esquerda da passagem: da passagem para fora; a primeira é a ponta do lado esquerdo do pedaço de cima
        let x = up.x0;
        for (let j = 0; x > k.x0 + 0.3; j++) {
          const peca = sorteio(i, j);
          if (naReserva(peca, x - P[peca].w, k.y0)) {
            x -= 0.5;
            continue;
          }
          const c = add(peca, x - P[peca].w, k.y0, 'fundo');
          if (j === 0) canto[i + 1].esq = c.y0;
          x = c.x0;
        }
      }
      if (k.x1 - up.x1 >= FAVELA.vaoMinM) {
        let x = up.x1;
        for (let j = 0; x < k.x1 - 0.3; j++) {
          const peca = sorteio(i, 50 + j, true);
          if (naReserva(peca, x, k.y0)) {
            x += 0.5;
            continue;
          }
          const c = add(peca, x, k.y0, 'frente');
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
        let d = Math.min(A.d, y - fim);
        // a boca de um beco desse lado (D92): a casa para antes dela e o lado continua depois
        // (logo abaixo da boca fica o quintal: casa ali esconderia a entrada do beco, nesta câmera)
        const boca = obstaculos.filter((b) => b.x0 < x0 + A.w && b.x1 > x0 && b.y1 > y - d && b.y0 < y).sort((a, b) => b.y1 - a.y1)[0];
        if (boca) {
          if (y - boca.y1 >= FAVELA.vaoMinM) add(peca, x0, y, lado === 'esq' ? 'fundo' : 'frente', y - boca.y1);
          y = Math.min(y - 0.5, boca.y0);
          antes = null;
          continue;
        }
        add(peca, x0, y, lado === 'esq' ? 'fundo' : 'frente', d);
        y -= d;
        antes = peca;
      }
    }
  }
  casasDosBecos(path, casas, add, becos, sorteio, reservas); // antes das fileiras de trás: o beco fica fechado de casa
  fileirasDeTras(path, casas, add, topI, reservas);
  casas.sort((a, b) => a.y1 - b.y1 || a.x0 - b.x0);
  w.casas = casas;
  return casas;
}

/**
 * Fileiras de trás dos dois lados de cada pedaço (FAVELA.fileirasTras), para a favela encher a tela: a
 * mesma subida do pé para o alto, de FAVELA.passoFileiraM em FAVELA.passoFileiraM metros para fora. Casa que
 * entraria no chão de algum pedaço ou em outra casa fica de fora (vira um beco entre as casas).
 */
/** A caixa (x0, y0, x1, y1) entra no chão de algum pedaço da rota, num quintal de beco ou em outra casa? */
const ocupaEm = (path, casas, reservas = []) => (x0, y0, x1, y1) =>
  path.some((r, i) => i > 0 && x0 < r.x1 - 0.05 && x1 > r.x0 + 0.05 && y0 < r.y1 - 0.05 && y1 > r.y0 + 0.05) ||
  reservas.some((r) => x0 < r.x1 - 0.05 && x1 > r.x0 + 0.05 && y0 < r.y1 - 0.05 && y1 > r.y0 + 0.05) ||
  casas.some((c) => x0 < c.x1 - 0.05 && x1 > c.x0 + 0.05 && y0 < c.y1 - 0.05 && y1 > c.y0 + 0.05);

/** Os quintais dos becos (D92): ao sul de cada viela deitada e pracinha, FAVELA.becoQuintalM sem casa. */
function quintais(becos) {
  return becos.filter((k) => k.deitada || k.pracinha).map((k) => ({ x0: k.x0, y0: k.y1, x1: k.x1, y1: k.y1 + FAVELA.becoQuintalM }));
}

function fileirasDeTras(path, casas, add, topI, reservas) {
  const P = FAVELA.pecas;
  const ocupa = ocupaEm(path, casas, reservas);
  for (let i = 1; i <= topI; i++) {
    const k = path[i];
    const prev = path[i - 1];
    for (const lado of ['esq', 'dir']) {
      const pesos = lado === 'esq' ? FAVELA.trasEsq : FAVELA.trasDir;
      for (let f = 1; f <= FAVELA.fileirasTras; f++) {
        // a borda de dentro da fileira f: f passos para fora da beira do pedaço
        const borda = lado === 'esq' ? k.x0 - f * FAVELA.passoFileiraM : k.x1 + f * FAVELA.passoFileiraM;
        let y = Math.min(k.y1, prev.y0);
        let antes = null;
        for (let j = 0; y - k.y0 >= FAVELA.vaoMinM; j++) {
          const peca = sortear(pesos, i * 7 + f, j, lado, antes);
          const A = P[peca];
          const x0 = lado === 'esq' ? borda - A.w : borda;
          const d = Math.min(A.d, y - k.y0);
          if (!ocupa(x0, y - d, x0 + A.w, y)) add(peca, x0, y, lado === 'esq' ? 'fundo' : 'frente', d);
          y -= d;
          antes = peca;
        }
      }
    }
  }
}

/**
 * As casas dos becos (D92). Na viela que sobe, dos dois lados (como na rota principal). Na viela deitada e na
 * pracinha do fundo, as fachadas do lado de cima (atrás de quem anda) e, do lado de baixo, nada até
 * FAVELA.becoQuintalM: nesta câmera, casa ao sul de uma viela deitada esconderia a viela inteira (lá fica a
 * mureta e o quintal, cenario.js); depois disso, só casa baixa. A pracinha fecha também pelos lados.
 */
function casasDosBecos(path, casas, add, becos, sorteio, reservas) {
  const P = FAVELA.pecas;
  const ocupa = ocupaEm(path, casas, reservas);
  const tenta = (peca, x0, y1, lado, d = P[peca].d) => {
    if (ocupa(x0, y1 - d, x0 + P[peca].w, y1)) return false;
    add(peca, x0, y1, lado, d);
    return true;
  };
  becos.forEach((k, n) => {
    const i = path.indexOf(k);
    const deitada = k.deitada || k.pracinha;
    if (deitada) {
      // fachadas no alto, de ponta a ponta (onde não sai outra viela para cima)
      // (quem esbarra em outra viela ou casa anda meio metro e tenta de novo: a casa encosta no obstáculo)
      for (let x = k.x0, j = 0; x < k.x1 - 0.3; j++) {
        const peca = sorteio(i, j);
        x += tenta(peca, x, k.y0, 'fundo') ? P[peca].w : 0.5;
      }
      // embaixo, depois do quintal: casas baixas
      const pesos = FAVELA.ladoDir;
      for (let x = k.x0, j = 0, antes = null; x < k.x1 - 0.3; j++) {
        const peca = sortear(pesos, i, 70 + j, 'dir', antes);
        const ok = tenta(peca, x, k.y1 + FAVELA.becoQuintalM + P[peca].d, 'frente');
        x += ok ? P[peca].w : 0.5;
        if (ok) antes = peca;
      }
    }
    if (!k.deitada) {
      // a viela que sobe e a pracinha: os dois lados, do pé para o alto (a pracinha só até o meio de baixo)
      for (const lado of ['esq', 'dir']) {
        const pesos = lado === 'esq' ? FAVELA.ladoEsq : FAVELA.ladoDir;
        let y = k.y1;
        for (let j = 0, antes = null; y - k.y0 >= FAVELA.vaoMinM; j++) {
          const peca = sortear(pesos, i, 40 + j, lado, antes);
          const A = P[peca];
          const d = Math.min(A.d, y - k.y0);
          if (tenta(peca, lado === 'esq' ? k.x0 - A.w : k.x1, y, lado === 'esq' ? 'fundo' : 'frente', d)) {
            y -= d;
            antes = peca;
          } else y -= 0.5;
        }
      }
    }
  });
}
