// Desenho das casas e das peças compridas da favela (pacote v2, FAVELA em config.js): a arte entra inteira,
// só na escala, com a origem no canto da frente da caixa. Um módulo mais curto que a arte (fim de viela) é
// cortado no fundo pela silhueta da caixa: o corte segue o ângulo do jogo, a imagem não muda.
import { FAVELA } from './config.js';
import { images } from './sprites.js';

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
  ctx.drawImage(im, pt.x - A.origem[0] * s, pt.y - A.origem[1] * s, im.width * s, im.height * s);
  if (corte) ctx.restore();
  return true;
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
    if (c.lado !== 'fundo' || c.y1 < b.minY - 2 || c.y1 > b.maxY + 14) continue;
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
