// Desenho das casas e das peças compridas da favela (pacote v2, FAVELA em config.js): a arte entra inteira,
// só na escala, com a origem no canto da frente da caixa. Um módulo mais curto que a arte (fim de viela) é
// cortado no fundo pela silhueta da caixa: o corte segue o ângulo do jogo, a imagem não muda.
import { FAVELA } from './config.js';
import { images, ARTE } from './sprites.js';

const pt = { x: 0, y: 0 };
const q = { x: 0, y: 0 };
const hull = [];

/** Desenha a peça com o canto (ax, ay) no chão; d < fundo da arte corta o que passa do fundo. */
export function drawPecaFavela(ctx, peca, ax, ay, cam, ppu, d = null, arte = peca) {
  const im = images[`fav_${arte}`] || images[`fav_${peca}`]; // variação que ainda não carregou: a principal
  if (!im) return false;
  const A = FAVELA.pecas[peca];
  const s = ppu / FAVELA.pxPorM;
  cam.toScreen(ax, ay, pt);
  const corte = d != null && d < A.d - 1e-6;
  if (corte) {
    // silhueta da caixa encurtada, com folga nos lados que não são o corte; no corte, a borda é a do
    // telhado (o que fica em cima dele perto do corte, como a caixa d'água, é cortado junto)
    const m = 0.6;
    const xs = A.oeste ? [-A.w - m, m] : [-m, A.w + m];
    hull.length = 0;
    for (const x of xs) for (const n of [-m, d]) for (const z of [-m, A.h + 0.05]) {
      cam.toScreen(ax + x, ay - n, q);
      hull.push([q.x, q.y - z * ppu]);
    }
    const poly = convexHull(hull);
    ctx.save();
    ctx.beginPath();
    poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.clip();
  }
  ctx.drawImage(reduzida(ctx, im, s), pt.x - A.origem[0] * s, pt.y - A.origem[1] * s, im.width * s, im.height * s);
  if (corte) ctx.restore();
  return true;
}

// a arte das casas (1300 a 2500 px) reduzida uma vez ao tamanho da tela: com a favela cheia são dezenas de
// casas na tela, e desenhar a imagem grande encolhida a cada quadro pesa no celular
const reduzidas = new Map();
let reduzChave = '';
function reduzida(ctx, im, s) {
  if (typeof document === 'undefined') return im;
  const t = ctx.getTransform();
  const esc = Math.hypot(t.a, t.b) || 1;
  const chave = `${(s * esc).toFixed(4)}|${ARTE.geracao}`;
  if (chave !== reduzChave) {
    reduzidas.clear();
    reduzChave = chave;
  }
  let c = reduzidas.get(im);
  if (c) return c;
  c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(im.width * s * esc));
  c.height = Math.max(1, Math.round(im.height * s * esc));
  const g = c.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.drawImage(im, 0, 0, c.width, c.height);
  reduzidas.set(im, c);
  return c;
}

/** Casa da lista w.casas (favela.js). */
export function drawCasaFavela(ctx, c, cam, ppu) {
  const A = FAVELA.pecas[c.peca];
  return drawPecaFavela(ctx, c.peca, A.oeste ? c.x1 : c.x0, c.y1, cam, ppu, c.corte ? c.d : null, c.arte);
}

/** Casas a oeste do caminho: atrás de tudo que anda nele, do fundo para a frente. */
export function drawCasasFundo(ctx, w, cam, ppu, b) {
  if (!w.casas) return;
  for (const c of w.casas) {
    if (c.lado !== 'fundo' || c.y1 < b.minY - 2 || c.y1 > b.maxY + 14 || c.x1 < b.minX - 6 || c.x0 > b.maxX + 6) continue;
    drawCasaFavela(ctx, c, cam, ppu);
  }
}

/** Fios do gatonet e bandeirinhas atravessando a viela no alto (de lado a lado, de frente para a câmera). */
export function drawFiosFavela(ctx, p, cam, ppu) {
  const im = images[p.kind === 'fios' ? 'fav_fios' : 'fav_bandeirinhas'];
  if (!im) return false;
  // a arte tem 5 m de um lado ao outro (a caixa da imagem, sem a folga); viela mais larga leva mais de uma
  const caixa = p.kind === 'fios' ? FIOS_CAIXA : BAND_CAIXA;
  const W = p.x1 - p.x0;
  const n = Math.max(1, Math.round(W / 5));
  const seg = W / n;
  for (let i = 0; i < n; i++) {
    cam.toScreen(p.x0 + i * seg, p.y1, pt);
    const s = (seg * ppu) / (caixa[2] - caixa[0]);
    ctx.drawImage(im, pt.x - caixa[0] * s, pt.y - p.h * ppu - caixa[1] * s, im.width * s, im.height * s);
  }
  return true;
}
// caixa do desenho na imagem (px): x0, y0 (onde o fio prende), x1
const FIOS_CAIXA = [45, 119, 855];
const BAND_CAIXA = [74, 10, 826];

function convexHull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [];
  for (const v of p) {
    while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], v) <= 0) lo.pop();
    lo.push(v);
  }
  const up = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const v = p[i];
    while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], v) <= 0) up.pop();
    up.push(v);
  }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

const m0 = { x: 0, y: 0 };
const m1 = { x: 0, y: 0 };

/**
 * A mureta dos becos (D92): parede baixa de bloco, de reboco gasto, na beira de baixo da viela deitada e da
 * pracinha. Mostra que ali não se passa (o quintal fica atrás). Desenho de código, como os outros remendos.
 */
export function drawMureta(ctx, m, cam, ppu) {
  const H = FAVELA.mureta.altM * ppu;
  cam.toScreen(m.x0, m.y, m0);
  cam.toScreen(m.x1, m.y, m1);
  const wd = m1.x - m0.x;
  const dy = m1.y - m0.y;
  // a frente
  ctx.fillStyle = '#857b6e';
  ctx.beginPath();
  ctx.moveTo(m0.x, m0.y);
  ctx.lineTo(m1.x, m1.y);
  ctx.lineTo(m1.x, m1.y - H);
  ctx.lineTo(m0.x, m0.y - H);
  ctx.closePath();
  ctx.fill();
  // os blocos
  ctx.strokeStyle = 'rgba(40,32,26,0.35)';
  ctx.lineWidth = Math.max(1, ppu * 0.025);
  ctx.beginPath();
  for (let f = 1; f < 3; f++) {
    ctx.moveTo(m0.x, m0.y - (H * f) / 3);
    ctx.lineTo(m1.x, m1.y - (H * f) / 3);
  }
  const passo = ppu * 0.4;
  for (let i = 0, x = 0; x < wd; i++, x += passo) {
    for (let f = 0; f < 3; f++) {
      const xx = x + (f % 2 ? passo / 2 : 0);
      if (xx >= wd) continue;
      const yb = m0.y + (dy * xx) / (wd || 1) - (H * f) / 3;
      ctx.moveTo(m0.x + xx, yb);
      ctx.lineTo(m0.x + xx, yb - H / 3);
    }
  }
  ctx.stroke();
  // manchas de umidade, a partir da semente
  ctx.fillStyle = 'rgba(52,44,36,0.25)';
  for (let i = 0; i < 3; i++) {
    const f = ((m.seed * (i + 1) * 9.13) % 1 + 1) % 1;
    ctx.fillRect(m0.x + f * wd * 0.85, m0.y + dy * f - H * 0.95, wd * 0.12, H * 0.6);
  }
  // o topo (a borda de cimento)
  ctx.fillStyle = '#a49a8c';
  ctx.beginPath();
  ctx.moveTo(m0.x, m0.y - H);
  ctx.lineTo(m1.x, m1.y - H);
  ctx.lineTo(m1.x, m1.y - H - ppu * 0.12);
  ctx.lineTo(m0.x, m0.y - H - ppu * 0.12);
  ctx.closePath();
  ctx.fill();
}
