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
  frenteDasParedes(casas, add); // a parede da viela sem ninguém na frente ganha um barraco na frente
  tapaBuracos(path, casas, add, topI, reservas, w.corridors || []); // o que sobrou sem casa perto da rota e dos becos
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

/**
 * Tapa-buracos (pedido do autor: "partes do mapa faltando"): os becos (D92) andam para os lados além das fileiras
 * de trás, e sobrava chão sem casa (aparecia o fundo chapado). Numa grade de FAVELA.buracos.passoM, todo ponto a
 * até raioM de um pedaço (da rota ou de beco) que não é chão de andar, quintal, passagem nem casa ganha uma casa
 * que caiba ali (ou cortada, até minD), sem entrar em nada. Nesta câmera, casa ao sul ou a leste de um chão de
 * andar esconde quem anda atrás dela: logo ao sul (sombraM) não entra casa; mais ao sul (até sombraAltaM) e a leste
 * (até lesteM), só casa baixa (até FAVELA.alturaBaixaM), e a de leste entra pela frente, como as do lado da viela.
 */
function tapaBuracos(path, casas, add, topI, reservas, corridors) {
  const B = FAVELA.buracos;
  const P = FAVELA.pecas;
  const pecas = path.filter((k, i) => i >= 1 && (i <= topI || k.principal === false));
  if (!pecas.length) return;
  const passo = B.passoM;
  const gx0 = Math.min(...pecas.map((k) => k.x0)) - B.raioM;
  const gx1 = Math.max(...pecas.map((k) => k.x1)) + B.raioM;
  const gy0 = Math.min(...pecas.map((k) => k.y0)) - 1;
  const gy1 = path[1].y1; // a Orla fica de fora
  const nx = Math.ceil((gx1 - gx0) / passo);
  const ny = Math.ceil((gy1 - gy0) / passo);
  // 0 livre longe da rota, 1 livre perto (ganha casa), 2 casa, 3 proibido (sombra de quem anda), 4 chão de andar,
  // quintal ou passagem
  const grade = new Uint8Array(nx * ny);
  // bit 1: só casa baixa (ao sul de quem anda); bit 2: a leste de quem anda (só baixa, entra pela frente); bit 4:
  // colada no lado oeste de quem anda (fica no fundo, mesmo que também esteja a leste de outra viela)
  const baixa = new Uint8Array(nx * ny);
  const marca = (r, v, so = -1) => {
    const i0 = Math.max(0, Math.floor((r.x0 - gx0) / passo));
    const i1 = Math.min(nx - 1, Math.ceil((r.x1 - gx0) / passo) - 1);
    const j0 = Math.max(0, Math.floor((r.y0 - gy0) / passo));
    const j1 = Math.min(ny - 1, Math.ceil((r.y1 - gy0) / passo) - 1);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (so < 0 || grade[j * nx + i] === so) grade[j * nx + i] = v;
  };
  for (const k of pecas) marca({ x0: k.x0 - B.raioM, x1: k.x1 + B.raioM, y0: k.y0 - B.raioM, y1: k.y1 + B.raioM }, 1, 0);
  for (const k of pecas) marca({ x0: k.x0, x1: k.x1, y0: k.y1, y1: k.y1 + B.sombraM }, 3);
  const zona = (r, v) => {
    const i0 = Math.max(0, Math.floor((r.x0 - gx0) / passo));
    const i1 = Math.min(nx - 1, Math.ceil((r.x1 - gx0) / passo) - 1);
    const j0 = Math.max(0, Math.floor((r.y0 - gy0) / passo));
    const j1 = Math.min(ny - 1, Math.ceil((r.y1 - gy0) / passo) - 1);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) baixa[j * nx + i] |= v;
  };
  for (const k of pecas) {
    zona({ x0: k.x0 - 1, x1: k.x1 + 1, y0: k.y1, y1: k.y1 + B.sombraAltaM }, 1);
    zona({ x0: k.x1, x1: k.x1 + B.lesteM, y0: k.y0 - B.lesteM, y1: k.y1 }, 2);
    zona({ x0: k.x0 - 0.6, x1: k.x0, y0: k.y0, y1: k.y1 }, 4);
  }
  for (const r of casas) marca(r, 2);
  for (const r of [...path.slice(1), ...reservas, ...corridors]) marca(r, 4);
  // a casa cabe? Na primeira passada, só em chão livre; na segunda (as frestas mais estreitas que qualquer casa),
  // pode encostar nas casas vizinhas, desde que cubra parte da fresta (livreMin) e não entre em chão, quintal ou sombra
  // devolve 0 (não cabe), 1 (cabe, no fundo) ou 2 (cabe, pela frente: a leste de quem anda e não colada a oeste)
  const cabe = (x0, y0, x1, y1, encosta, alta) => {
    const i0 = Math.floor((x0 - gx0) / passo + 1e-6);
    const i1 = Math.ceil((x1 - gx0) / passo - 1e-6) - 1;
    const j0 = Math.floor((y0 - gy0) / passo + 1e-6);
    const j1 = Math.ceil((y1 - gy0) / passo - 1e-6) - 1;
    if (i0 < 0 || j0 < 0 || i1 >= nx || j1 >= ny) return 0;
    let livres = 0;
    let z = 0;
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const v = grade[j * nx + i];
        if (v >= 3 || (v === 2 && !encosta)) return 0;
        if (v === 1) livres++;
        z |= baixa[j * nx + i];
      }
    }
    if ((z & 3) && alta) return 0;
    if (encosta && livres < B.livreMin * (i1 - i0 + 1) * (j1 - j0 + 1)) return 0;
    return z & 2 && !(z & 4) ? 2 : 1;
  };
  // do pé do morro para o alto (a casa da frente primeiro), da esquerda para a direita
  for (const encosta of [false, true]) {
    for (let j = ny - 1; j >= 0; j--) {
      for (let i = 0; i < nx; i++) {
        if (grade[j * nx + i] !== 1) continue;
        const x = gx0 + i * passo;
        const y1 = gy0 + (j + 1) * passo;
        let feita = false;
        for (let t = 0; t < B.pecas.length && !feita; t++) {
          const peca = B.pecas[Math.floor(hash2(i, j, 917 + t) * B.pecas.length)];
          const A = P[peca];
          // a casa começa no ponto, termina nele, ou (encostando) fica centrada na fresta
          for (const x0 of encosta ? [x, x + passo - A.w, x + passo / 2 - A.w / 2] : [x, x + passo - A.w]) {
            for (let d = A.d; d >= B.minD - 1e-6 && !feita; d -= passo) {
              const lugar = cabe(x0, y1 - d, x0 + A.w, y1, encosta, A.h > FAVELA.alturaBaixaM);
              if (!lugar) continue;
              const c = add(peca, x0, y1, lugar === 2 ? 'frente' : 'fundo', d);
              marca(c, 2, 1);
              marca(c, 2, 0);
              feita = true;
            }
            if (feita) break;
          }
        }
      }
    }
  }
}

/**
 * A parede da viela (o módulo da esquerda) não tem frente: ela foi feita para ficar em fila, com outra na frente.
 * Onde ninguém fica na frente dela (a boca de um beco, o pé de uma viela), aparecia o oco escuro debaixo do
 * telhado. Ali, um barraco (que tem frente) ocupa os primeiros metros e a parede recua para trás dele.
 */
function frenteDasParedes(casas, add) {
  const P = FAVELA.pecas;
  const B = P.barraco_a;
  for (const c of [...casas]) {
    if (c.peca !== 'parede_viela_esq') continue;
    const naFrente = casas.some((o) => o !== c && Math.abs(o.y0 - c.y1) < 0.35 && Math.min(o.x1, c.x1) - Math.max(o.x0, c.x0) > 1);
    if (naFrente) continue;
    const y1 = c.y1;
    const peca = hash2(Math.round(c.x0 * 10), Math.round(y1 * 10), 923) < 0.5 ? 'barraco_a' : 'barraco_b';
    const d = Math.min(B.d, c.d);
    if (c.d - d < FAVELA.vaoMinM) {
      // a parede inteira vira o barraco
      Object.assign(c, { peca, x1: c.x0 + P[peca].w, y0: y1 - d, d, h: P[peca].h, corte: d < P[peca].d - 1e-6 });
      c.arte = variante(peca, c.x0, y1);
      continue;
    }
    c.y1 = y1 - d;
    c.d -= d;
    c.corte = true;
    add(peca, c.x0, y1, c.lado, d);
  }
}

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
