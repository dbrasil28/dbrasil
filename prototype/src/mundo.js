// Mundo da rota (sem DOM, roda no Node): trechos ligados sem corte (Orla → portão da escadaria →
// Subida do Morro), as áreas onde dá para andar, as lajes com escada, os lugares (boteco, quiosque,
// prédio, posto de salva-vidas) e as vagas dos objetos que o Juninho pega e arremessa.
// Plano: docs/design/CARREIRA_E_ROTA.md e docs/design/MAPAS_CARACTERIZACAO.md.
import { ROUTE, PLACES, CADEIRA_DIST, CARREIRA, LAJE } from './config.js';
import { clamp } from './math.js';
import { placeCenario, SOLID_CELL } from './cenario.js';

const rect = (x0, y0, x1, y1, extra = {}) => ({ x0, y0, x1, y1, ...extra });
const JOINT_M = 1.0;
export const inside = (k, x, y) => x >= k.x0 && x <= k.x1 && y >= k.y0 && y <= k.y1;

/** Monta o mundo do mapa da orla. Coordenadas em metros; subir na tela = y menor. */
export function buildWorld(map) {
  const R = ROUTE;
  const bl = map.blockLen;
  const orlaTop = -R.orla.blocks * bl - map.streetLen; // topo da última rua transversal
  const orla = rect(map.minX, orlaTop, map.maxX, R.orla.startY, { kind: 'orla' });
  // portão: a escadaria do pé do morro, fechada por tapume até o nível da meta
  const g = R.orla.gate;
  const gate = rect(g.x0, orlaTop - g.len, g.x1, orlaTop + 0.5, { kind: 'escadaria', slow: R.morro.stairSlow, gate: true });
  const path = [orla, gate];
  // Subida do Morro: pedaços em sequência, cada um encostado no anterior
  let y = gate.y0 + 0.5;
  for (const p of R.morro.pieces) {
    const k = rect(p.x0, y - p.len, p.x1, y + 0.5, { kind: p.kind, slow: p.kind === 'escadaria' ? R.morro.stairSlow : 1, principal: true });
    if (p.baile) k.baile = true;
    if (p.portao) k.portao = true;
    path.push(k);
    y = k.y0 + 0.5;
  }
  const topI = path.length - 1; // a laje do topo: o último pedaço da rota principal (os becos vêm depois)
  const top = path[topI];
  // a rota principal: cada pedaço ligado ao de baixo; os becos (D92) entram depois, com as ligações deles
  const ligacoes = [];
  for (let i = 0; i < path.length - 1; i++) ligacoes.push([i, i + 1]);
  montarBecos(path, R, ligacoes);
  // D91: a esplanada do baile e o portão do fundo dela (o pedaço de cima, fechado até o DJ Plantão cair)
  const baileI = path.findIndex((k) => k.baile);
  const portaoI = path.findIndex((k) => k.portao);
  const w = {
    path,
    orla,
    gate,
    gateOpen: false,
    baileI,
    baile: baileI >= 0 ? path[baileI] : null,
    portaoI,
    portaoAberto: portaoI < 0,
    orlaTop,
    morroTop: Math.min(...path.slice(2).map((k) => k.y0)),
    top,
    topI,
    exitOpen: false,
    joints: [],
    platforms: [],
    solids: [],
    slots: [],
    heals: [],
    places: [],
    visto: new Set([0, 1]), // pedaços da rota em que o Juninho já pisou (o mapa da favela só mostra esses)
  };
  w.corridors = [];
  w.links = [];
  w.adj = path.map(() => []);
  for (const [ia, ib] of ligacoes) {
    const em = emenda(path[ia], path[ib]);
    if (!em) throw new Error(`os pedaços ${ia} e ${ib} da rota não se encostam`);
    // passagem entre dois pedaços (largura comum, 1 m para dentro de cada um): sem ela, quem tem raio
    // maior que metade da emenda ficava preso na fresta entre os dois retângulos
    em.cor.gate = ia <= 1 && ib <= 2;
    em.cor.portao = portaoI >= 0 && (ia === portaoI || ib === portaoI);
    const l = { a: ia, b: ib, j: em.j, cor: em.cor };
    w.links.push(l);
    w.joints.push(em.j);
    w.corridors.push(em.cor);
    w.adj[ia].push({ to: ib, l });
    w.adj[ib].push({ to: ia, l });
  }
  w.prox = proximoPasso(path, w.adj);
  placeOrla(w, map);
  placeObra(w, map); // covil do Especulador: fechado por tapume até o Caos chamar o chefão (D39)
  placeMorro(w);
  placeCenario(w, map); // carros, barracas, bancos, postes, placas e lixo
  return w;
}

/**
 * A emenda de dois pedaços que se encostam: o ponto do meio (junta) e a passagem, 1 m para dentro de cada um
 * (esticada em y quando um está em cima do outro e em x quando estão lado a lado). null se não se encostam.
 */
function emenda(a, b) {
  const x0 = Math.max(a.x0, b.x0);
  const x1 = Math.min(a.x1, b.x1);
  const y0 = Math.max(a.y0, b.y0);
  const y1 = Math.min(a.y1, b.y1);
  if (x1 - x0 <= 0.01 || y1 - y0 <= 0.01) return null;
  const j = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
  const cor = x1 - x0 >= y1 - y0 ? rect(x0, y0 - JOINT_M, x1, y1 + JOINT_M) : rect(x0 - JOINT_M, y0, x1 + JOINT_M, y1);
  return { j, cor };
}

/**
 * Os becos do Morro (D92, config ROUTE.morro.ramos): cada um sai do lado de um pedaço da rota principal e anda por
 * trechos (vielas deitadas para os lados e vielas que sobem), até a pracinha do fundo, com um achado, ou até
 * outro pedaço principal (atalho). Os pedaços dos becos entram no fim de path; as ligações, em ligacoes.
 */
function montarBecos(path, R, ligacoes) {
  const principal = (i) => path[i + 2];
  for (const [n, rm] of (R.morro.ramos || []).entries()) {
    const L = rm.larg;
    const pai = principal(rm.de);
    let ant = rm.de + 2; // de onde o trecho sai (índice em path)
    let cur = null; // o último trecho: { k, vai }
    const novo = (k, extra) => {
      Object.assign(k, { ramo: n, nome: rm.nome, principal: false, slow: 1 }, extra);
      path.push(k);
      ligacoes.push([ant, path.length - 1]);
      ant = path.length - 1;
      return k;
    };
    for (const [ti, t] of rm.trechos.entries()) {
      let k;
      if (t.vai === 'sobe') {
        // sobe da ponta de fora do trecho deitado de baixo
        const c = cur.k;
        const x0 = cur.vai === 'esq' ? c.x0 : c.x1 - L;
        const y1 = c.y1;
        const y0 = t.ate !== undefined ? (principal(t.ate).y0 + principal(t.ate).y1) / 2 - L / 2 : c.y0 - t.comp;
        k = novo(rect(x0, y0, x0 + L, y1, { kind: 'viela' }));
      } else {
        // deitado: o primeiro sai do lado do pedaço principal; os outros, do alto do trecho que subiu
        let yc;
        let xi;
        if (!cur) {
          yc = pai.y1 - rm.em * (pai.y1 - pai.y0);
          xi = t.vai === 'esq' ? pai.x0 + 0.5 : pai.x1 - 0.5;
        } else {
          yc = cur.k.y0 + L / 2;
          xi = t.vai === 'esq' ? cur.k.x1 : cur.k.x0;
        }
        let xf;
        if (t.ate !== undefined) xf = t.vai === 'esq' ? principal(t.ate).x1 - 0.5 : principal(t.ate).x0 + 0.5;
        else xf = t.vai === 'esq' ? xi - t.comp : xi + t.comp;
        k = novo(rect(Math.min(xi, xf), yc - L / 2, Math.max(xi, xf), yc + L / 2, { kind: 'viela', deitada: true }), ti === 0 ? { entrada: true } : {});
      }
      cur = { k, vai: t.vai };
    }
    const F = rm.fim || {};
    if (F.liga !== undefined) {
      ligacoes.push([ant, F.liga + 2]); // o atalho volta para a rota principal
      path[ant].atalho = true;
    } else if (F.pracinha) {
      // a pracinha do fundo, encostada na ponta do último trecho
      const [pw, pd] = F.pracinha;
      const c = cur.k;
      let r;
      if (cur.vai === 'sobe') {
        const cx = (c.x0 + c.x1) / 2;
        r = rect(cx - pw / 2, c.y0 + 0.5 - pd, cx + pw / 2, c.y0 + 0.5);
      } else {
        const cy = (c.y0 + c.y1) / 2;
        r = cur.vai === 'esq' ? rect(c.x0 + 0.5 - pw, cy - pd / 2, c.x0 + 0.5, cy + pd / 2) : rect(c.x1 - 0.5, cy - pd / 2, c.x1 - 0.5 + pw, cy + pd / 2);
      }
      novo(r, { kind: 'laje', pracinha: true, fundo: true, achado: F.achado || null });
    }
  }
}

/** Para cada par (de, para), o pedaço vizinho de 'de' no caminho mais curto até 'para' (-1: sem caminho). */
function proximoPasso(path, adj) {
  const n = path.length;
  const INF = 1e9;
  const d = Array.from({ length: n }, () => new Float64Array(n).fill(INF));
  const nx = Array.from({ length: n }, () => new Int16Array(n).fill(-1));
  const cx = (k) => (k.x0 + k.x1) / 2;
  const cy = (k) => (k.y0 + k.y1) / 2;
  for (let i = 0; i < n; i++) {
    d[i][i] = 0;
    nx[i][i] = i;
    for (const { to } of adj[i]) {
      const c = Math.hypot(cx(path[i]) - cx(path[to]), cy(path[i]) - cy(path[to]));
      if (c < d[i][to]) {
        d[i][to] = c;
        nx[i][to] = to;
      }
    }
  }
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      if (d[i][k] >= INF) continue;
      for (let j = 0; j < n; j++) {
        const v = d[i][k] + d[k][j];
        if (v < d[i][j]) {
          d[i][j] = v;
          nx[i][j] = nx[i][k];
        }
      }
    }
  }
  return nx;
}

/** A ligação entre dois pedaços vizinhos (ou undefined). */
export const ligacaoEntre = (w, a, b) => w.adj[a]?.find((v) => v.to === b)?.l;

function addPlatform(w, x0, y0, x1, y1, h, stair, kind) {
  const P = rect(x0, y0, x1, y1, { h, kind, stair });
  P.bx0 = Math.min(x0, stair.x0) - 1;
  P.by0 = Math.min(y0, stair.y0) - 1;
  P.bx1 = Math.max(x1, stair.x1) + 1;
  P.by1 = Math.max(y1, stair.y1) + 1;
  w.platforms.push(P);
  return P;
}

function addSlot(w, kind, x, y, plat = null, place = null, dir = 's') {
  // dir: para onde o objeto está virado (cadeira de frente para a mesa); 's' = de frente para a câmera
  w.slots.push({ kind, x, y, plat, place, dir, obj: { kind, x, y, plat, dir }, emptyT: 0 });
}

/** Orla: boteco e, do lado da praia, quiosque ou posto de salva-vidas, por quarteirão. */
function placeOrla(w, map) {
  const bl = map.blockLen;
  for (let b = 0; b <= ROUTE.orla.blocks; b++) {
    const y0 = -bl * b; // começo do calçadão deste quarteirão (desce até y0 + 40)
    const kind = PLACES.orla[b % PLACES.orla.length];
    if (kind === 'boteco') {
      const x = map.minX;
      const yb = y0 + 14;
      const counter = rect(x, yb, x + 1.4, yb + 4.2, { kind: 'balcao' }); // no térreo do prédio: não é sólido
      w.places.push({ kind: 'boteco', side: 'esq', sign: 'BOTECO', x0: x, y0: yb - 1.2, x1: x + 6.5, y1: yb + 5.4, counter });
      for (const [mx, my] of [[x + 3.6, yb + 0.9], [x + 4.4, yb + 3.6]]) {
        addSlot(w, 'mesa', mx, my);
        addSlot(w, 'cadeira', mx - CADEIRA_DIST, my, null, null, 'se');
        addSlot(w, 'cadeira', mx + CADEIRA_DIST, my, null, null, 'sw');
      }
      addSlot(w, 'engradado', x + 1.9, yb + 4.9);
    }
    // lado da praia: quiosque com cadeiras de praia e coco, ou o posto de salva-vidas para subir
    const side = PLACES.praia[b % PLACES.praia.length];
    if (side === 'quiosque') {
      const yq = y0 + 22;
      // na areia, depois da ciclovia (a avenida vem antes)
      w.places.push({ kind: 'quiosque', x0: map.sandX + 0.4, y0: yq - 2, x1: map.sandX + 3.9, y1: yq + 4 });
      for (let i = 0; i < 3; i++) addSlot(w, 'cadeira_praia', map.sandX + 1.0 + i * 1.1, yq + (i % 2) * 1.2);
      w.heals.push({ kind: 'coco', x: map.sandX + 3.4, y: yq + 2.6 });
    } else if (side === 'salva_vidas') {
      const yp = y0 + 16;
      const x = map.sandX + 1.6;
      // deque e escada nas medidas do desenho (PLACES.salvaVidasArte): 3,2 × 1,8 m, escada de 1,8 m na frente
      const st = rect(x + 1.0, yp + 3, x + 2.2, yp + 4.8, { dir: 'n' });
      const P = addPlatform(w, x, yp + 1.2, x + 3.2, yp + 3, PLACES.salvaVidasH, st, 'salva_vidas');
      w.places.push({ kind: 'salva_vidas', plat: P });
    }
  }
}

/**
 * Terreno do covil no último quarteirão, encostado nos prédios, do outro lado da rua da escadaria (era a obra do
 * Especulador, D39; sem tapume desde o D84): o cenário não ocupa o terreno (entra em `places`).
 */
function placeObra(w, map) {
  const O = CARREIRA.obra;
  const y0 = -ROUTE.orla.blocks * map.blockLen + O.dy0; // começo do calçadão do último quarteirão
  const obra = rect(O.x0, y0, O.x1, y0 + O.fundoM, { kind: 'obra' });
  w.places.push(obra);
  w.obra = obra;
  // D84 (pedido do autor): a obra saiu do mapa (chão de terra, tapumes e entulho) para a arena do Monstrão ficar
  // livre; o terreno fica só como o lugar do covil (pistas, helicóptero, arena) e o cenário não ocupa ele
  // boca da escadaria: nenhum carro ou barraca parado na frente dela
  const g = w.gate;
  w.bocaEscadaria = rect(g.x0 - 1.4, w.orlaTop, g.x1 + 1.4, obra.y0);
}

/** Põe um sólido no mundo depois de montado (na grade também). */
export function addSolid(w, k) {
  w.solids.push(k);
  if (!w.solidGrid) return;
  for (let c = Math.floor((k.y0 - 1.6) / SOLID_CELL); c <= Math.floor((k.y1 + 1.6) / SOLID_CELL); c++) {
    let arr = w.solidGrid.get(c);
    if (!arr) w.solidGrid.set(c, (arr = []));
    arr.push(k);
  }
}

/** Tira um sólido do mundo (o tapume da obra que cai). */
export function removeSolid(w, k) {
  const i = w.solids.indexOf(k);
  if (i >= 0) w.solids.splice(i, 1);
  if (w.solidGrid) {
    for (const arr of w.solidGrid.values()) {
      const j = arr.indexOf(k);
      if (j >= 0) arr.splice(j, 1);
    }
  }
}

/** Subida do Morro: botecos nas lajes, botijões nas vielas e casas com laje para subir. */
function placeMorro(w) {
  const path = w.path;
  path.forEach((k, i) => {
    if (k.kind === 'laje') {
      const cx = (k.x0 + k.x1) / 2;
      const cy = (k.y0 + k.y1) / 2;
      // casa com laje encostada no fundo da pracinha, do lado oposto à passagem para o pedaço de cima
      // (antes ficava sempre à direita e, em duas lajes, fechava a passagem)
      if (k.baile) return; // a esplanada do baile fica livre para a pista (baile.js)
      if (!k.principal) return; // a pracinha do fundo do beco (D92) tem o achado e o cenário dela (cenario.js)
      let side = 0; // -1: casa à esquerda, 1: à direita, 0: sem casa
      if (k.x1 - k.x0 >= 13 && k !== w.top) side = houseSide(k, path[i + 1]);
      const m = side === -1 ? -1 : 1; // o boteco fica espelhado do lado livre
      for (const [dx, dy] of [[-3, -1.5], [2.5, 1.5]]) {
        addSlot(w, 'mesa', cx + dx * m, cy + dy);
        addSlot(w, 'cadeira', cx + dx * m - CADEIRA_DIST, cy + dy, null, null, 'se');
        addSlot(w, 'cadeira', cx + dx * m + CADEIRA_DIST, cy + dy, null, null, 'sw');
      }
      addSlot(w, 'botijao', m === 1 ? k.x0 + 0.9 : k.x1 - 0.9, k.y0 + 1.2);
      addSlot(w, 'engradado', m === 1 ? k.x1 - 1.0 : k.x0 + 1.0, k.y1 - 1.4);
      if (side) {
        // afastada do fundo e do lado da pracinha (LAJE.vaoM), para a horda cercar; sem a escada entrar na
        // frente da passagem para o pedaço de cima
        const up = path[i + 1];
        const y = k.y0 + LAJE.vaoM;
        let x = side === 1 ? k.x1 - 5 - LAJE.vaoM : k.x0 + LAJE.vaoM;
        if (up && side === 1) x = Math.min(k.x1 - 5.5, Math.max(x, up.x1 + 1.8));
        if (up && side === -1) x = Math.max(k.x0 + 0.5, Math.min(x, up.x0 - 6.8));
        const st = side === 1 ? rect(x - 1.3, y, x, y + 5, { dir: 'n' }) : rect(x + 5, y, x + 6.3, y + 5, { dir: 'n' });
        const P = addPlatform(w, x, y, x + 5, y + 5, PLACES.lajeH, st, 'laje_casa');
        addSlot(w, 'botijao', x + 2.5, y + 1.0, P);
      }
    } else if (k.kind === 'viela') {
      addSlot(w, 'botijao', k.x0 + 0.6, (k.y0 + k.y1) / 2);
    }
  });
}

/**
 * De que lado da laje a casa (5 m + escada de 1,3 m, no fundo) deixa a passagem para cima mais livre.
 * Devolve -1 (esquerda), 1 (direita) ou 0 se nenhum lado deixa pelo menos 2,5 m livres.
 */
function houseSide(k, up) {
  if (!up) return 1;
  const o0 = Math.max(k.x0, up.x0);
  const o1 = Math.min(k.x1, up.x1);
  const free = (a0, a1) => Math.max(0, o1 - o0 - Math.max(0, Math.min(o1, a1) - Math.max(o0, a0)));
  const right = free(k.x1 - 6.8 - 0.4, k.x1);
  const left = free(k.x0, k.x0 + 6.8 + 0.4);
  const best = right >= left ? 1 : -1;
  return Math.max(right, left) >= 2.5 ? best : 0;
}

/** Pedaço da rota fechado agora: a escadaria do pé do morro (tapume) ou o portão do fundo do baile (D91). */
export const bloqueado = (w, i) => (i === 1 && !w.gateOpen) || (i === w.portaoI && !w.portaoAberto);
const corFechado = (w, k) => (k.gate && !w.gateOpen) || (k.portao && !w.portaoAberto);

/** Retângulo da rota que contém o ponto (ou -1). Usa o índice guardado na entidade, se ainda vale. */
export function pathIndex(w, x, y, hint = -1) {
  const path = w.path;
  if (hint >= 0 && hint < path.length && !bloqueado(w, hint) && inside(path[hint], x, y)) return hint;
  for (let i = 0; i < path.length; i++) {
    if (bloqueado(w, i)) continue;
    if (inside(path[i], x, y)) return i;
  }
  return -1;
}

/** Mantém a entidade dentro das áreas de andar da rota e das passagens entre elas (o portão só conta aberto). */
export function constrain(w, e) {
  const r = e.r || 0.3;
  const path = w.path;
  let bx = e.x;
  let by = e.y;
  let bd = Infinity;
  let bi = e.ri;
  const n = path.length;
  const cor = w.corridors || [];
  for (let i = 0; i < n + cor.length; i++) {
    const isCor = i >= n;
    const k = isCor ? cor[i - n] : path[i];
    if (isCor ? corFechado(w, k) : bloqueado(w, i)) continue;
    const cx = clamp(e.x, k.x0 + r, k.x1 - r);
    const cy = clamp(e.y, k.y0 + r, k.y1 - r);
    const d = (cx - e.x) ** 2 + (cy - e.y) ** 2;
    if (d === 0) {
      if (!isCor) e.ri = i;
      return;
    }
    if (d < bd) {
      bd = d;
      bx = cx;
      by = cy;
      if (!isCor) bi = i;
    }
  }
  e.ri = bi;
  e.x = bx;
  e.y = by;
}

/** Para onde andar para chegar a (tx, ty) pela rota: direto se estão no mesmo pedaço, senão pela junta. */
export function routeTarget(w, e, tx, ty, ti, out) {
  let ei = pathIndex(w, e.x, e.y, e.ri);
  // já na emenda (dentro do pedaço seguinte também): mira a próxima junta, senão fica parado na junta
  if (ei >= 0 && ti >= 0) {
    for (let k = 0; k < 4 && ei !== ti; k++) {
      const nh = w.prox[ei][ti];
      if (nh < 0 || bloqueado(w, nh) || !inside(w.path[nh], e.x, e.y)) break;
      ei = nh;
    }
  }
  if (ei >= 0) e.ri = ei;
  const nh = ei >= 0 && ti >= 0 ? w.prox[ei][ti] : -1;
  if (ei < 0 || ti < 0 || ei === ti || nh < 0) {
    out.x = tx;
    out.y = ty;
    return out;
  }
  // pela rede de vielas (D92): a junta com o próximo pedaço do caminho mais curto
  const j = ligacaoEntre(w, ei, nh).j;
  out.x = j.x;
  out.y = j.y;
  return out;
}

/** Ponto da entrega: metade de cima da laje do topo (a entrega vale ali). */
export function deliveryPoint(w, out = {}) {
  out.x = (w.top.x0 + w.top.x1) / 2;
  out.y = w.top.y0 + (w.top.y1 - w.top.y0) * 0.3;
  return out;
}

/** Metros que faltam pela rota (junta por junta) até a entrega. */
export function routeRemaining(w, x, y, ri = -1) {
  let i = pathIndex(w, x, y, ri);
  if (i < 0) i = ri >= 0 ? ri : 0;
  const goal = deliveryPoint(w);
  let d = 0;
  let px = x;
  let py = y;
  for (let k = 0; k < w.path.length && i !== w.topI; k++) {
    const nh = w.prox[i][w.topI];
    if (nh < 0) break;
    const j = ligacaoEntre(w, i, nh).j;
    d += Math.hypot(j.x - px, j.y - py);
    px = j.x;
    py = j.y;
    i = nh;
  }
  return d + Math.hypot(goal.x - px, goal.y - py);
}

/** Multiplicador de velocidade do lugar (escadaria mais lenta). */
export function slowAt(w, x, y, ri) {
  const i = pathIndex(w, x, y, ri);
  return i >= 0 ? w.path[i].slow || 1 : 1;
}

// ---------- lajes e escadas ----------

export function stairProgress(S, x, y) {
  switch (S.dir) {
    case 'n': return (S.y1 - y) / (S.y1 - S.y0);
    case 's': return (y - S.y0) / (S.y1 - S.y0);
    case 'e': return (x - S.x0) / (S.x1 - S.x0);
    default: return (S.x1 - x) / (S.x1 - S.x0);
  }
}

/** Fora da escada, logo depois do pé: aonde vai quem desce (o pé fica dentro da escada, e quem parasse nele não sairia). */
export function stairOut(P, out) {
  const S = P.stair;
  const cx = (S.x0 + S.x1) / 2;
  const cy = (S.y0 + S.y1) / 2;
  if (S.dir === 'n') { out.x = cx; out.y = S.y1 + 0.9; }
  else if (S.dir === 's') { out.x = cx; out.y = S.y0 - 0.9; }
  else if (S.dir === 'e') { out.x = S.x0 - 0.9; out.y = cy; }
  else { out.x = S.x1 + 0.9; out.y = cy; }
  return out;
}

/** Pé da escada (onde se começa a subir), um pouco para fora. */
export function stairFoot(P, out) {
  const S = P.stair;
  const cx = (S.x0 + S.x1) / 2;
  const cy = (S.y0 + S.y1) / 2;
  if (S.dir === 'n') { out.x = cx; out.y = S.y1 - 0.4; }
  else if (S.dir === 's') { out.x = cx; out.y = S.y0 + 0.4; }
  else if (S.dir === 'e') { out.x = S.x0 + 0.4; out.y = cy; }
  else { out.x = S.x1 - 0.4; out.y = cy; }
  return out;
}

/** Empurra para fora do retângulo pelo lado mais perto. Devolve 0 (não encostou), 1 (lado em x) ou 2 (lado em y). */
function pushOut(k, e, r) {
  const x0 = k.x0 - r;
  const x1 = k.x1 + r;
  const y0 = k.y0 - r;
  const y1 = k.y1 + r;
  if (e.x <= x0 || e.x >= x1 || e.y <= y0 || e.y >= y1) return 0;
  const dl = e.x - x0;
  const dr = x1 - e.x;
  const dt = e.y - y0;
  const db = y1 - e.y;
  const m = Math.min(dl, dr, dt, db);
  if (m === dl) e.x = x0;
  else if (m === dr) e.x = x1;
  else if (m === dt) e.y = y0;
  else e.y = y1;
  return m === dl || m === dr ? 1 : 2;
}

function clampInto(k, e, r) {
  e.x = clamp(e.x, k.x0 + Math.min(r, (k.x1 - k.x0) / 2), k.x1 - Math.min(r, (k.x1 - k.x0) / 2));
  e.y = clamp(e.y, k.y0 + Math.min(r, (k.y1 - k.y0) / 2), k.y1 - Math.min(r, (k.y1 - k.y0) / 2));
}

/**
 * Lajes com escada: quem está no chão não atravessa a laje nem o meio da escada (só sobe pelo pé);
 * quem está em cima não sai pela borda, só desce pela escada. Define e.plat, e.lvl (0 ou 1) e e.z (m).
 */
/**
 * Níveis: chão, escada e laje. podeSubir: true (o Juninho) ou a única laje em que esta entidade pode entrar pela
 * escada (null: nenhuma; para os outros a escada é parede). slide > 0 (inimigos): batendo na casa ou na escada,
 * escorrega para a quina e contorna, em vez de ficar empurrando a parede.
 */
export function applyLevels(w, e, podeSubir = true, slide = 0) {
  const r = (e.r || 0.3) * 0.8;
  if (e.plat) {
    const P = e.plat;
    const S = P.stair;
    if (inside(S, e.x, e.y)) {
      const pr = stairProgress(S, e.x, e.y);
      e.z = P.h * clamp(pr, 0, 1);
      if (pr > 0.88) e.lvl = 1;
      else if (pr < 0.12) e.lvl = 0;
      return;
    }
    if (inside(P, e.x, e.y) && e.lvl === 1) {
      e.z = P.h;
      return;
    }
    if (!inside(P, e.x, e.y) && e.z < P.h * 0.25) {
      // desceu pelo pé da escada
      e.plat = null;
      e.lvl = 0;
      e.z = 0;
      return;
    }
    // tentou sair pela borda da laje, ou entrar na laje pelo meio da escada: volta
    if (e.lvl === 1) {
      const sx = clamp(e.x, S.x0, S.x1);
      const sy = clamp(e.y, S.y0, S.y1);
      const px = clamp(e.x, P.x0 + r, P.x1 - r);
      const py = clamp(e.y, P.y0 + r, P.y1 - r);
      if ((sx - e.x) ** 2 + (sy - e.y) ** 2 < (px - e.x) ** 2 + (py - e.y) ** 2) {
        e.x = sx;
        e.y = sy;
      } else {
        e.x = px;
        e.y = py;
        e.z = P.h;
      }
    } else {
      clampInto(S, e, r);
      e.z = P.h * clamp(stairProgress(S, e.x, e.y), 0, 1);
    }
    return;
  }
  for (const P of w.platforms) {
    if (e.x < P.bx0 || e.x > P.bx1 || e.y < P.by0 || e.y > P.by1) continue;
    const S = P.stair;
    if (podeSubir !== true && podeSubir !== P) {
      // não vai subir: a casa e a escada são um bloco só, contornado de uma vez (duas caixas encostadas
      // fariam o inimigo ir de uma para a outra na junção)
      if (!P.bloco) P.bloco = { x0: Math.min(P.x0, S.x0), y0: Math.min(P.y0, S.y0), x1: Math.max(P.x1, S.x1), y1: Math.max(P.y1, S.y1) };
      desliza(w, P.bloco, e, r, slide);
      continue;
    }
    if (inside(S, e.x, e.y)) {
      const pr = stairProgress(S, e.x, e.y);
      if (pr <= 0.3) {
        e.plat = P;
        e.lvl = 0;
        e.z = P.h * Math.max(0, pr);
        return;
      }
      desliza(w, S, e, r, slide);
    }
    desliza(w, P, e, r, slide);
  }
}

/**
 * Empurra para fora da caixa; com slide, escorrega ao longo da parede para contornar. O lado é a quina que dá o
 * caminho mais curto até o alvo dele (e.tgx, e.tgy) e fica escolhido enquanto ele estiver na mesma parede: sem
 * isso, quem tem o alvo bem atrás da casa escorrega para o meio da parede e fica empurrando ali.
 */
function desliza(w, k, e, r, slide) {
  const side = pushOut(k, e, r);
  if (!side || !slide) return;
  const tx = e.tgx ?? e.x + (e.mx || 0) * 5;
  const ty = e.tgy ?? e.y + (e.my || 0) * 5;
  if (e.ladoK !== k || e.ladoS !== side) {
    let a;
    let b;
    if (side === 2) {
      a = Math.abs(e.x - (k.x0 - r)) + Math.hypot(tx - (k.x0 - r), ty - e.y);
      b = Math.abs(k.x1 + r - e.x) + Math.hypot(tx - (k.x1 + r), ty - e.y);
    } else {
      a = Math.abs(e.y - (k.y0 - r)) + Math.hypot(tx - e.x, ty - (k.y0 - r));
      b = Math.abs(k.y1 + r - e.y) + Math.hypot(tx - e.x, ty - (k.y1 + r));
    }
    let dir = a <= b ? -1 : 1;
    const fora = side === 2 ? (dir < 0 ? k.x0 - 2 * r : k.x1 + 2 * r) : dir < 0 ? k.y0 - 2 * r : k.y1 + 2 * r;
    if (!(side === 2 ? cabe(w, fora, e.y, e.ri) : cabe(w, e.x, fora, e.ri))) dir = -dir;
    e.ladoK = k;
    e.ladoS = side;
    e.lado = dir;
  }
  if (side === 2) e.x += e.lado * slide;
  else e.y += e.lado * slide;
}

const CORNER_M = 0.45; // perto da ponta do sólido: o jogador escorrega pela quina
const CORNER_SLIDE = 0.035;

/**
 * Empurra para fora dos sólidos do chão (balcões, carros, barracas, postes). Só vale para quem está no
 * chão. slide > 0 (inimigos): ao bater de frente, escorrega para a ponta mais perto e contorna.
 */
const cabe = (w, x, y, hint) => pathIndex(w, x, y, hint ?? -1) >= 0;

export function collideSolids(w, e, slide = 0) {
  if (e.lvl === 1 || e.plat) return;
  const r = e.r || 0.3;
  const list = w.solidGrid ? w.solidGrid.get(Math.floor(e.y / SOLID_CELL)) : w.solids;
  if (!list) return;
  for (const k of list) {
    const side = pushOut(k, e, r);
    if (!side) continue;
    if (slide) {
      // contorna pelo lado mais perto, a não ser que ali não caiba (sólido encostado na borda da rota)
      if (side === 2) {
        let dir = e.x < (k.x0 + k.x1) / 2 ? -1 : 1;
        if (!cabe(w, dir < 0 ? k.x0 - 2 * r : k.x1 + 2 * r, e.y, e.ri)) dir = -dir;
        e.x += dir * slide;
      } else {
        let dir = e.y < (k.y0 + k.y1) / 2 ? -1 : 1;
        if (!cabe(w, e.x, dir < 0 ? k.y0 - 2 * r : k.y1 + 2 * r, e.ri)) dir = -dir;
        e.y += dir * slide;
      }
    } else if (side === 2) {
      // quina: encostou perto da ponta, escorrega para fora (não enrosca no canto do carro)
      if (e.x < k.x0 + CORNER_M) e.x -= CORNER_SLIDE;
      else if (e.x > k.x1 - CORNER_M) e.x += CORNER_SLIDE;
    } else if (e.y < k.y0 + CORNER_M) e.y -= CORNER_SLIDE;
    else if (e.y > k.y1 - CORNER_M) e.y += CORNER_SLIDE;
  }
}

/** Onde a entidade está, para a ordem de desenho: na laje, conta como em cima da frente dela. */
export const onTop = (e) => (e.plat && e.lvl === 1 ? e.plat : null);
