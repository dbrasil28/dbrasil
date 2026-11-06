// Desenho provisório (em código) do cenário vivo: carros, ônibus, barracas, bancos, lixeiras, orelhões,
// postes com cartaz de candidato, placas, muros e tapumes pichados, bandeiras, garotas paradas na esquina,
// motos, caixas d'água, sinuca, varal, gatos de luz e bandeirinhas; e a sujeira do chão (camada estática).
// Cada objeto vira um bitmap guardado (o desenho não muda com a posição); sai quando a arte chegar.
import { CANDIDATOS, PIXOS, FIGURAS, lowerBound } from './cenario.js';
import { images } from './sprites.js';
import { ART, ART_S, artKey, artFile } from './arte_cenario.js';
import { hash2 } from './math.js';

const FONT = '"Barlow Semi Condensed", "Arial Narrow", sans-serif';
const INK = 'rgba(20,16,14,0.85)';
const pt = { x: 0, y: 0 };
const pt2 = { x: 0, y: 0 };

// ---------- bitmaps guardados ----------
const cache = new Map();
let cacheKey = '';
const DIRECT = new Set(['fios', 'bandeirinhas']); // compridos e finos: desenha direto, sem bitmap
const VARIANTS = { carro: 16, onibus: 4, garota: 12, muro: 9, tapume: 9, poste: 6, moto: 6, lixeira: 4, banco: 3 };
// folga do bitmap em volta do retângulo do chão (m): lados, em cima, embaixo
const PAD = { policial: [0.8, 0.3], camburao: [0.6, 0.6], placa_parede: [1.4, 0.6], placa: [0.9, 0.4], garota: [0.6, 0.3], varal: [0.4, 0.5], bandeira: [1.4, 0.4], orelhao: [0.5, 0.3], poste: [1.0, 0.3] };

function sprite(p, ppu, k, dpr) {
  const key = `${ppu.toFixed(3)}|${k.toFixed(4)}|${dpr}|${images.poste ? 1 : 0}|${images.cone ? 1 : 0}`;
  if (key !== cacheKey) {
    cache.clear();
    cacheKey = key;
  }
  const nv = VARIANTS[p.kind] || 8;
  const vi = Math.floor(p.v * nv);
  const W = (p.x1 - p.x0) * ppu;
  const D = (p.y1 - p.y0) * ppu * k;
  const id = `${p.kind}|${vi}|${Math.round(W)}|${Math.round(D)}|${p.h}|${p.text || ''}|${p.left ? 1 : 0}`;
  let c = cache.get(id);
  if (c) return c;
  if (typeof document === 'undefined') return null;
  if (cache.size > 400) cache.clear();
  const [padM, topM] = PAD[p.kind] || [0.6, 0.4];
  const padX = padM * ppu;
  const padTop = (topM + 0.3) * ppu;
  const padBot = 0.35 * ppu;
  const scale = Math.min(dpr, 2);
  const cw = W + padX * 2;
  const ch = p.h * ppu + D + padTop + padBot;
  c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(cw * scale));
  c.height = Math.max(1, Math.ceil(ch * scale));
  c.ox = padX;
  c.oy = padTop + p.h * ppu + D;
  c.cw = cw;
  c.ch = ch;
  const g = c.getContext('2d');
  g.scale(scale, scale);
  g.translate(c.ox, c.oy);
  g.lineJoin = 'round';
  const v = (vi + 0.5) / nv;
  const fn = DRAW[p.kind];
  if (fn) fn(g, { ...p, v }, W, D, ppu, ppu * k);
  cache.set(id, c);
  return c;
}

/** Desenha um objeto do cenário; (sx, sy) = tela do canto da frente à esquerda, no chão. */
export function drawCenario(ctx, p, cam, ppu, dpr, t, alpha = 1, playerPx = 0) {
  cam.toScreen(p.x0, p.y1, pt);
  if (DIRECT.has(p.kind)) return drawOverhead(ctx, p, cam, ppu, t);
  // arte pintada (PNG do ateliê), quando existe: mesma origem (canto da frente, à esquerda, no chão)
  const A = ART[p.kind];
  if (A) {
    const im = images[artKey(p.kind, artFile(p.kind, p.v))];
    if (im) {
      const k = ((p.x1 - p.x0) / A.w) * (ppu / ART_S);
      if (alpha < 1) ctx.globalAlpha = alpha;
      ctx.drawImage(im, pt.x - A.padX * ART_S * k, pt.y - A.top * ART_S * k, im.width * k, im.height * k);
      if (alpha < 1) ctx.globalAlpha = 1;
      return;
    }
  }
  let q = p;
  if (FIGURAS.has(p.kind) && playerPx) {
    // figuras no tamanho dos personagens (que seguem a altura do Juninho na tela, não o metro)
    const hh = Math.round((playerPx / ppu) * (p.kind === 'policial' ? 1.0 : 0.94) * 20) / 20;
    if (!p.fig || p.fig.h !== hh) p.fig = { ...p, h: hh, fig: null };
    q = p.fig;
  }
  const c = sprite(q, ppu, cam.k, dpr);
  if (!c) return;
  if (alpha < 1) ctx.globalAlpha = alpha;
  ctx.drawImage(c, pt.x - c.ox, pt.y - c.oy, c.cw, c.ch);
  if (alpha < 1) ctx.globalAlpha = 1;
}

/** Objetos visíveis (lista ordenada por y) entre y0 e y1. */
export function cenarioInRange(w, y0, y1, out) {
  out.length = 0;
  const list = w.props;
  for (let i = lowerBound(list, y0); i < list.length && list[i].y <= y1; i++) out.push(list[i]);
  return out;
}

// ---------- ajudas (origem = canto da frente, à esquerda, no chão; y para cima é negativo) ----------
function rect(g, x, y, w, h, fill, stroke) {
  g.fillStyle = fill;
  g.fillRect(x, y, w, h);
  if (stroke) {
    g.strokeStyle = stroke;
    g.lineWidth = 1;
    g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }
}
function shadow(g, W, D, m, grow = 0.2) {
  g.fillStyle = 'rgba(0,0,0,0.32)';
  g.beginPath();
  g.ellipse(W / 2, -D / 2 + 2, W / 2 + grow * m, D / 2 + grow * m * 0.5 + 2, 0, 0, Math.PI * 2);
  g.fill();
}
function text(g, s, x, y, size, fill, weight = 900, stroke = null, maxW = 0) {
  g.font = `${weight} ${Math.max(6, size)}px ${FONT}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  if (stroke) {
    g.strokeStyle = stroke;
    g.lineWidth = Math.max(2, size * 0.22);
    g.strokeText(s, x, y, maxW || undefined);
  }
  g.fillStyle = fill;
  g.fillText(s, x, y, maxW || undefined);
}
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
}
function wheel(g, x, y, r) {
  g.fillStyle = '#141414';
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#8d8d92';
  g.beginPath();
  g.arc(x, y, r * 0.45, 0, Math.PI * 2);
  g.fill();
}
/** Cartaz de candidato fictício (lambe-lambe): foto, nome, número. Canto de cima à esquerda em (x, y). */
export function cartaz(g, x, y, w, h, i) {
  const c = CANDIDATOS[i % CANDIDATOS.length];
  rect(g, x, y, w, h, '#f4f1e8', 'rgba(0,0,0,0.5)');
  rect(g, x, y, w, h * 0.22, c.cor);
  text(g, 'VOTE', x + w / 2, y + h * 0.11, h * 0.15, '#fff');
  // rosto sorridente
  g.fillStyle = '#c99a72';
  g.beginPath();
  g.arc(x + w / 2, y + h * 0.42, Math.min(w, h) * 0.17, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#2a201c';
  g.fillRect(x + w / 2 - Math.min(w, h) * 0.17, y + h * 0.27, Math.min(w, h) * 0.34, h * 0.06);
  g.strokeStyle = '#2a201c';
  g.lineWidth = 1;
  g.beginPath();
  g.arc(x + w / 2, y + h * 0.43, Math.min(w, h) * 0.08, 0.2, Math.PI - 0.2);
  g.stroke();
  rect(g, x + w * 0.2, y + h * 0.58, w * 0.6, h * 0.08, c.cor);
  text(g, c.num, x + w / 2, y + h * 0.75, h * 0.2, c.cor, 900, null, w * 0.95);
  text(g, c.nome, x + w / 2, y + h * 0.9, h * 0.1, '#1d1a18', 800, null, w * 0.95);
}
/** Pichação: letras de pixo esticadas, preto ou cor de spray. */
export function pixo(g, s, x, y, size, color, rot = 0, stretch = 1.7) {
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.scale(0.75, stretch);
  g.font = `900 ${Math.max(6, size)}px ${FONT}`;
  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  g.fillStyle = color;
  g.fillText(s, 0, 0);
  g.restore();
}
/** Bandeira do Brasil (retângulo x, y, w, h). */
export function bandeira(g, x, y, w, h) {
  rect(g, x, y, w, h, '#1f8a3c');
  g.fillStyle = '#ffd21f';
  g.beginPath();
  g.moveTo(x + w * 0.08, y + h / 2);
  g.lineTo(x + w / 2, y + h * 0.1);
  g.lineTo(x + w * 0.92, y + h / 2);
  g.lineTo(x + w / 2, y + h * 0.9);
  g.closePath();
  g.fill();
  g.fillStyle = '#1d3f8f';
  g.beginPath();
  g.arc(x + w / 2, y + h / 2, h * 0.26, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#f2efe8';
  g.lineWidth = Math.max(1, h * 0.06);
  g.beginPath();
  g.arc(x + w / 2 + h * 0.05, y + h * 0.95, h * 0.5, -Math.PI * 0.72, -Math.PI * 0.36);
  g.stroke();
}

// ---------- cada tipo ----------
const CAR_COLORS = ['#d8d8d4', '#9aa0a6', '#a8322a', '#2b3f66', '#1d1d22', '#e8c22a', '#5a6b3a', '#b5652a'];
const SKIN = ['#6b4430', '#8d5a3c', '#b07850', '#c99a72', '#e2bc98', '#5a3828'];
const HAIR = ['#141012', '#3a2418', '#c9a050', '#8a2a1c', '#e8d090', '#2a1a14'];
const OUTFIT = ['#e0218a', '#d81e2a', '#141417', '#f2efe8', '#7a2fd0', '#18a0c8', '#ffd21f', '#2fbf6a'];

const DRAW = {
  carro(g, p, W, D, m, kd) {
    const col = CAR_COLORS[Math.floor(p.v * 31) % CAR_COLORS.length];
    const taxi = col === '#e8c22a';
    shadow(g, W, D, m);
    const z0 = 0.28 * m;
    const z1 = 0.82 * m;
    const z2 = 1.42 * m;
    // tampo do capô e do porta-malas
    rect(g, 0, -z1 - D, W, D, shade(col, 0.88), 'rgba(0,0,0,0.4)');
    // lateral
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(0, -z0);
    g.lineTo(0, -z1 + 0.1 * m);
    g.quadraticCurveTo(0, -z1, 0.15 * m, -z1);
    g.lineTo(W - 0.15 * m, -z1);
    g.quadraticCurveTo(W, -z1, W, -z1 + 0.1 * m);
    g.lineTo(W, -z0);
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.5)';
    g.lineWidth = 1;
    g.stroke();
    if (taxi) rect(g, 0, -z1 * 0.72, W, 0.1 * m, '#2456a8');
    // cabine: vidro lateral, para-brisa e vigia vistos de cima, teto recuado
    const c0 = W * 0.24;
    const c1 = W * 0.8;
    const r0 = c0 + 0.35 * m;
    const r1 = c1 - 0.3 * m;
    const glass = '#26323e';
    const poly = (pts, fill) => {
      g.fillStyle = fill;
      g.beginPath();
      g.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
      g.closePath();
      g.fill();
    };
    // para-brisa (frente, à direita) e vigia (atrás, à esquerda) no tampo
    poly([r1, -z2 - D * 0.85, c1 + 0.25 * m, -z1 - D * 0.92, c1 + 0.25 * m, -z1 - D * 0.08, r1, -z2 - D * 0.15], glass);
    poly([r0, -z2 - D * 0.85, c0 - 0.2 * m, -z1 - D * 0.92, c0 - 0.2 * m, -z1 - D * 0.08, r0, -z2 - D * 0.15], glass);
    // lateral da cabine com as janelas
    poly([c0 - 0.2 * m, -z1, r0, -z2 + 0.02 * m, r1, -z2 + 0.02 * m, c1 + 0.25 * m, -z1], shade(col, 0.95));
    poly([c0, -z1 - 0.05 * m, r0 + 0.05 * m, -z2 + 0.1 * m, r1 - 0.05 * m, -z2 + 0.1 * m, c1 + 0.08 * m, -z1 - 0.05 * m], glass);
    rect(g, (r0 + r1) / 2 - 0.04 * m, -z2 + 0.05 * m, 0.08 * m, z2 - z1 - 0.05 * m, shade(col, 0.7));
    // teto (recuado nas duas pontas e nas laterais)
    rect(g, r0, -z2 - D * 0.85, r1 - r0, D * 0.7, shade(col, 1.06), 'rgba(0,0,0,0.35)');
    g.fillStyle = 'rgba(255,255,255,0.16)';
    g.fillRect(r0 + 2, -z2 - D * 0.82, (r1 - r0) * 0.5, D * 0.12);
    if (taxi) {
      rect(g, (c0 + c1) / 2 - 0.3 * m, -z2 - D * 0.55 - 0.22 * m, 0.6 * m, 0.22 * m, '#f2efe8', 'rgba(0,0,0,0.5)');
      text(g, 'TÁXI', (c0 + c1) / 2, -z2 - D * 0.55 - 0.11 * m, 0.17 * m, '#1d1a18');
    }
    // "VENDE-SE" no vidro, amassado, pneu furado
    if ((p.v * 7) % 1 > 0.62) {
      rect(g, c1 - 0.75 * m, -z2 + 0.14 * m, 0.5 * m, 0.3 * m, '#f7f4ea');
      text(g, 'VENDE-SE', c1 - 0.5 * m, -z2 + 0.29 * m, 0.11 * m, '#c8342b');
    }
    if ((p.v * 13) % 1 > 0.6) {
      g.fillStyle = 'rgba(0,0,0,0.25)';
      g.beginPath();
      g.ellipse(W * 0.12, -z1 * 0.6, 0.3 * m, 0.14 * m, 0.3, 0, Math.PI * 2);
      g.fill();
    }
    rect(g, W - 0.12 * m, -z1 + 0.08 * m, 0.1 * m, 0.12 * m, '#ffe9a0');
    rect(g, 0.02 * m, -z1 + 0.08 * m, 0.1 * m, 0.12 * m, '#c8342b');
    const flat = (p.v * 17) % 1 > 0.8;
    wheel(g, W * 0.2, -0.3 * m + (flat ? 0.08 * m : 0), 0.3 * m);
    wheel(g, W * 0.8, -0.3 * m, 0.3 * m);
  },
  onibus(g, p, W, D, m) {
    const stripe = ['#2a6fd0', '#d8402a', '#2f9a4a', '#e0a020'][Math.floor(p.v * 4)];
    shadow(g, W, D, m, 0.3);
    const H = p.h * m;
    rect(g, 0, -H - D, W, D, '#c9cbd0', 'rgba(0,0,0,0.4)');
    rect(g, W * 0.35, -H - D * 0.75, 1.2 * m, D * 0.5, '#9a9da4', 'rgba(0,0,0,0.4)'); // ar-condicionado que não funciona
    rect(g, 0, -H, W, H - 0.3 * m, '#ece9e2', 'rgba(0,0,0,0.5)');
    rect(g, 0, -H * 0.42, W, 0.32 * m, stripe);
    for (let x = 0.4 * m; x < W - 1.0 * m; x += 1.15 * m) rect(g, x, -H * 0.86, 0.95 * m, H * 0.36, '#2b3844');
    rect(g, W - 1.0 * m, -H * 0.86, 0.75 * m, H * 0.78, '#3a4652', 'rgba(0,0,0,0.5)'); // porta
    text(g, 'ORLA ⇄ MORRO', W * 0.4, -H * 0.3 + 0.05 * m, 0.26 * m, '#1d1a18', 900, null, W * 0.5);
    pixo(g, PIXOS[Math.floor(p.v * PIXOS.length)], 0.5 * m, -0.45 * m, 0.32 * m, '#1d1a18');
    wheel(g, W * 0.15, -0.36 * m, 0.42 * m);
    wheel(g, W * 0.78, -0.36 * m, 0.42 * m);
  },
  banca(g, p, W, D, m) {
    shadow(g, W, D, m);
    const H = p.h * m;
    rect(g, -0.15 * m, -H - D - 0.1 * m, W + 0.3 * m, D + 0.25 * m, '#24502c', 'rgba(0,0,0,0.5)');
    rect(g, 0, -H, W, H, '#2f6b3a', 'rgba(0,0,0,0.5)');
    // revistas e jornais pendurados
    const cols = ['#e5252f', '#ffd21f', '#3d8bff', '#f2efe8', '#ff7a1a', '#c04ad0'];
    for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) {
      rect(g, 0.12 * m + i * (W - 0.24 * m) / 5, -H * 0.86 + r * H * 0.22, (W - 0.24 * m) / 5 - 2, H * 0.18, cols[(i * 3 + r * 2 + Math.floor(p.v * 6)) % cols.length]);
    }
    rect(g, 0, -H - 0.32 * m, W, 0.3 * m, '#1d1a18');
    text(g, 'BANCA', W / 2, -H - 0.17 * m, 0.24 * m, '#ffd21f');
    cartaz(g, W - 0.55 * m, -H * 0.3, 0.45 * m, 0.6 * m, Math.floor(p.v * 6));
  },
  milho(g, p, W, D, m) {
    shadow(g, W, D, m);
    rect(g, 0, -0.9 * m - D, W, D, '#b9bcc2', 'rgba(0,0,0,0.4)');
    rect(g, 0, -0.9 * m, W, 0.6 * m, '#d4d6da', 'rgba(0,0,0,0.5)');
    text(g, 'MILHO', W / 2, -0.6 * m, 0.22 * m, '#c8342b');
    // panela com espigas e vapor
    rect(g, W * 0.25, -1.2 * m - D * 0.5, W * 0.5, 0.35 * m, '#8a8d93', 'rgba(0,0,0,0.5)');
    for (let i = 0; i < 3; i++) rect(g, W * (0.3 + i * 0.14), -1.35 * m - D * 0.5, 0.08 * m, 0.22 * m, '#f2c94c');
    g.strokeStyle = 'rgba(255,255,255,0.35)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(W * 0.4, -1.4 * m - D * 0.5);
    g.quadraticCurveTo(W * 0.3, -1.7 * m, W * 0.45, -1.95 * m);
    g.stroke();
    wheel(g, W * 0.2, -0.2 * m, 0.2 * m);
    wheel(g, W * 0.8, -0.2 * m, 0.2 * m);
    guardaSol(g, W / 2, -2.2 * m, 1.0 * m, '#ffd21f', '#1f8a3c');
  },
  picole(g, p, W, D, m) {
    shadow(g, W, D, m);
    rect(g, 0, -0.95 * m - D, W, D, '#dfe6ec', 'rgba(0,0,0,0.4)');
    rect(g, 0, -0.95 * m, W, 0.7 * m, '#f4f7fa', 'rgba(0,0,0,0.5)');
    rect(g, 0, -0.7 * m, W, 0.18 * m, '#2a6fd0');
    text(g, 'PICOLÉ', W / 2, -0.61 * m, 0.15 * m, '#fff');
    wheel(g, W * 0.25, -0.18 * m, 0.18 * m);
    wheel(g, W * 0.75, -0.18 * m, 0.18 * m);
    guardaSol(g, W / 2, -2.1 * m, 0.9 * m, '#e5252f', '#f2efe8');
  },
  banco(g, p, W, D, m) {
    shadow(g, W, D, m, 0.1);
    const wood = ['#8a5a32', '#6e4a2c', '#9a6d43'][Math.floor(p.v * 3)];
    // encosto (atrás), assento e pés
    rect(g, 0, -D - 0.92 * m, W, 0.4 * m, wood, 'rgba(0,0,0,0.5)');
    for (const x of [0.15, W / m - 0.3]) rect(g, x * m, -D - 0.52 * m, 0.15 * m, 0.52 * m, '#7d7a74');
    rect(g, 0, -0.45 * m - D * 0.8, W, D * 0.8, shade(wood, 1.15), 'rgba(0,0,0,0.45)');
    rect(g, 0, -0.45 * m, W, 0.08 * m, shade(wood, 0.8));
    for (const x of [0.12, W / m - 0.32]) rect(g, x * m, -0.37 * m, 0.2 * m, 0.37 * m, '#8d8a84', 'rgba(0,0,0,0.4)');
    if (p.v > 0.6) pixo(g, PIXOS[Math.floor(p.v * 37) % PIXOS.length], 0.3 * m, -D - 0.6 * m, 0.22 * m, '#141012');
  },
  lixeira(g, p, W, D, m) {
    shadow(g, W, D, m, 0.1);
    rect(g, W / 2 - 0.05 * m, -0.5 * m, 0.1 * m, 0.5 * m, '#5a5a5e');
    g.fillStyle = '#e8731a';
    g.beginPath();
    g.moveTo(0, -0.35 * m);
    g.lineTo(W, -0.35 * m);
    g.lineTo(W + 0.05 * m, -1.0 * m);
    g.lineTo(-0.05 * m, -1.0 * m);
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.5)';
    g.stroke();
    g.fillStyle = '#2a1c14';
    g.beginPath();
    g.ellipse(W / 2, -1.0 * m, W / 2 + 0.05 * m, D * 0.45 + 1, 0, 0, Math.PI * 2);
    g.fill();
    // lixo transbordando
    for (let i = 0; i < 4; i++) {
      g.fillStyle = ['#f2efe8', '#c9b07a', '#3d8bff', '#202024'][i];
      g.beginPath();
      g.arc(W * (0.2 + i * 0.2), -1.0 * m - 0.06 * m - (i % 2) * 0.06 * m, 0.09 * m, 0, Math.PI * 2);
      g.fill();
    }
  },
  poste(g, p, W, D, m) {
    const H = p.h * m;
    if (images.poste) {
      const im = images.poste;
      const w = (im.width / im.height) * H;
      g.fillStyle = 'rgba(0,0,0,0.3)';
      g.beginPath();
      g.ellipse(W / 2, 0, w * 0.3, w * 0.1, 0, 0, Math.PI * 2);
      g.fill();
      g.drawImage(im, W / 2 - w / 2, -H, w, H);
    } else {
      rect(g, W / 2 - 0.07 * m, -H, 0.14 * m, H, '#6f7076');
      rect(g, W / 2 - 0.07 * m, -H, 0.8 * m, 0.1 * m, '#6f7076');
      rect(g, W / 2 + 0.5 * m, -H + 0.1 * m, 0.4 * m, 0.12 * m, '#ffe9a0');
    }
    // cartaz de candidato amarrado no poste (e às vezes uma bandeira)
    // (o desenho do poste já vem com cartaz de político; no provisório, cartaz de candidato)
    if (!images.poste && p.v < 0.6) cartaz(g, W / 2 - 0.32 * m, -2.5 * m, 0.64 * m, 0.85 * m, Math.floor(p.v * 10));
    else if (p.v > 0.7) bandeira(g, W / 2 + 0.05 * m, -3.3 * m, 0.8 * m, 0.55 * m);
  },
  placa(g, p, W, D, m) {
    const H = p.h * m;
    rect(g, W / 2 - 0.05 * m, -H, 0.1 * m, H, '#8a8b90');
    if (p.tipo === 'rua') {
      rect(g, W / 2 - 0.8 * m, -H - 0.1 * m, 1.6 * m, 0.38 * m, '#1f4f9a', 'rgba(255,255,255,0.8)');
      text(g, p.text, W / 2, -H + 0.09 * m, 0.2 * m, '#fff', 800, null, 1.5 * m);
    } else {
      const proib = /PROIBIDO|NÃO/.test(p.text);
      const cuidado = /CUIDADO|RISCO|DEVAGAR/.test(p.text);
      const bg = cuidado ? '#ffd21f' : '#f4f1e8';
      rect(g, W / 2 - 0.7 * m, -H - 0.2 * m, 1.4 * m, 0.55 * m, bg, proib ? '#c8342b' : 'rgba(0,0,0,0.7)');
      text(g, p.text, W / 2, -H + 0.08 * m, 0.17 * m, proib ? '#c8342b' : '#1d1a18', 900, null, 1.3 * m);
    }
  },
  cone(g, p, W, D, m) {
    if (images.cone) {
      const im = images.cone;
      const h = 0.75 * m;
      const w = (im.width / im.height) * h;
      g.drawImage(im, W / 2 - w / 2, -h - D / 2, w, h);
      return;
    }
    g.fillStyle = '#ff7a1a';
    g.beginPath();
    g.moveTo(W / 2, -0.7 * m);
    g.lineTo(W, 0);
    g.lineTo(0, 0);
    g.fill();
  },
  orelhao(g, p, W, D, m) {
    shadow(g, W, D, m, 0.15);
    rect(g, W / 2 - 0.05 * m, -1.3 * m, 0.1 * m, 1.3 * m, '#6f7076');
    const col = p.v < 0.5 ? '#e86a1a' : '#2a6fd0';
    g.fillStyle = col;
    g.beginPath();
    g.ellipse(W / 2, -1.75 * m, 0.42 * m, 0.5 * m, 0, Math.PI * 0.95, Math.PI * 2.05);
    g.lineTo(W / 2 + 0.42 * m, -1.35 * m);
    g.lineTo(W / 2 - 0.42 * m, -1.35 * m);
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.5)';
    g.stroke();
    g.fillStyle = '#1a1a1e';
    g.beginPath();
    g.ellipse(W / 2, -1.5 * m, 0.28 * m, 0.22 * m, 0, Math.PI, Math.PI * 2);
    g.fill();
    rect(g, W / 2 - 0.08 * m, -1.62 * m, 0.16 * m, 0.24 * m, '#5a5a5e');
    pixo(g, PIXOS[Math.floor(p.v * 53) % PIXOS.length], W / 2 - 0.3 * m, -1.9 * m, 0.16 * m, '#141012');
  },
  muro(g, p, W, D, m) {
    const H = p.h * m;
    const base = ['#cfc8bc', '#d9d2c4', '#bfb6a6'][Math.floor(p.v * 3)];
    rect(g, 0, -H - D, W, D, '#9d968c', 'rgba(0,0,0,0.4)');
    // caco de vidro no alto do muro
    for (let x = 0.1 * m; x < W; x += 0.22 * m) {
      g.fillStyle = (x / m) % 0.6 > 0.3 ? 'rgba(120,200,170,0.9)' : 'rgba(220,240,230,0.9)';
      g.beginPath();
      g.moveTo(x, -H - D * 0.4);
      g.lineTo(x + 0.06 * m, -H - D * 0.4 - 0.16 * m);
      g.lineTo(x + 0.12 * m, -H - D * 0.4);
      g.fill();
    }
    rect(g, 0, -H, W, H, base, 'rgba(0,0,0,0.5)');
    // reboco caído e mofo
    g.fillStyle = 'rgba(120,90,60,0.35)';
    g.fillRect(W * 0.6, -H * 0.4, W * 0.18, H * 0.25);
    g.fillStyle = 'rgba(40,50,30,0.22)';
    g.fillRect(0, -0.35 * m, W, 0.35 * m);
    // pichação em várias alturas e cores, mural da bandeira em alguns
    const seed = p.v * 100;
    if (p.v > 0.66) bandeira(g, W * 0.55, -H * 0.85, W * 0.38, H * 0.5);
    for (let i = 0; i < 4; i++) {
      const word = PIXOS[Math.floor(hash2(i, Math.floor(seed), 9) * PIXOS.length)];
      const col = i === 0 ? '#141012' : ['#141012', '#c8342b', '#2a6fd0', '#141012'][i];
      pixo(g, word, 0.15 * m + hash2(i, Math.floor(seed), 10) * W * 0.55, -H * (0.2 + hash2(i, Math.floor(seed), 11) * 0.55), 0.38 * m, col, (hash2(i, 1, Math.floor(seed)) - 0.5) * 0.2);
    }
    cartaz(g, W * 0.08, -H * 0.62, 0.55 * m, 0.75 * m, Math.floor(p.v * 6) + 1);
  },
  tapume(g, p, W, D, m) {
    const H = p.h * m;
    const col = p.v < 0.5 ? '#2f6a55' : '#b89a6a';
    rect(g, 0, -H - D, W, D, shade(col, 0.75), 'rgba(0,0,0,0.4)');
    rect(g, 0, -H, W, H, col, 'rgba(0,0,0,0.5)');
    g.strokeStyle = 'rgba(0,0,0,0.25)';
    g.lineWidth = 1;
    for (let x = 1.1 * m; x < W; x += 1.1 * m) {
      g.beginPath();
      g.moveTo(x, -H);
      g.lineTo(x, 0);
      g.stroke();
    }
    // cartazes do mesmo candidato colados em fila (propaganda em massa), pichação por cima
    const c = Math.floor(p.v * 6);
    for (let i = 0; i < 5; i++) cartaz(g, 0.2 * m + i * 0.88 * m, -H * 0.88, 0.7 * m, 0.95 * m, i < 3 ? c : c + i);
    rect(g, W * 0.55, -H * 0.36, 1.7 * m, 0.42 * m, '#f4f1e8', 'rgba(0,0,0,0.6)');
    text(g, 'OBRA PARADA', W * 0.55 + 0.85 * m, -H * 0.36 + 0.21 * m, 0.22 * m, '#c8342b', 900, null, 1.6 * m);
    pixo(g, PIXOS[Math.floor(p.v * 71) % PIXOS.length], 0.3 * m, -0.3 * m, 0.42 * m, '#141012', -0.05);
    pixo(g, PIXOS[Math.floor(p.v * 29) % PIXOS.length], W * 0.4, -H * 0.5, 0.34 * m, '#c8342b', 0.08);
  },
  garota(g, p, W, D, m) {
    // figura de ambiente parada na esquina (provisória em código; arte no guia)
    const v = p.v;
    const skin = SKIN[Math.floor(v * 37) % SKIN.length];
    const hair = HAIR[Math.floor(v * 23) % HAIR.length];
    const top = OUTFIT[Math.floor(v * 11) % OUTFIT.length];
    const bottom = OUTFIT[(Math.floor(v * 11) + 3) % OUTFIT.length];
    const H = p.h * m;
    const cx = W / 2;
    g.fillStyle = 'rgba(0,0,0,0.3)';
    g.beginPath();
    g.ellipse(cx, -D / 2, 0.3 * m, 0.1 * m, 0, 0, Math.PI * 2);
    g.fill();
    // botas e pernas
    rect(g, cx - 0.12 * m, -H * 0.3, 0.09 * m, H * 0.3, '#141012');
    rect(g, cx + 0.03 * m, -H * 0.3, 0.09 * m, H * 0.3, '#141012');
    rect(g, cx - 0.11 * m, -H * 0.5, 0.08 * m, H * 0.2, skin);
    rect(g, cx + 0.03 * m, -H * 0.5, 0.08 * m, H * 0.2, skin);
    // saia e blusa
    g.fillStyle = bottom;
    g.beginPath();
    g.moveTo(cx - 0.15 * m, -H * 0.62);
    g.lineTo(cx + 0.15 * m, -H * 0.62);
    g.lineTo(cx + 0.18 * m, -H * 0.49);
    g.lineTo(cx - 0.18 * m, -H * 0.49);
    g.closePath();
    g.fill();
    rect(g, cx - 0.14 * m, -H * 0.8, 0.28 * m, H * 0.18, top);
    // braços: um na cintura, outro com a bolsa
    g.strokeStyle = skin;
    g.lineWidth = 0.07 * m;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(cx - 0.15 * m, -H * 0.78);
    g.lineTo(cx - 0.27 * m, -H * 0.68);
    g.lineTo(cx - 0.15 * m, -H * 0.6);
    g.moveTo(cx + 0.15 * m, -H * 0.78);
    g.lineTo(cx + 0.2 * m, -H * 0.58);
    g.stroke();
    rect(g, cx + 0.15 * m, -H * 0.6, 0.16 * m, 0.13 * m, '#141012');
    // cabeça e cabelo comprido
    g.fillStyle = hair;
    g.beginPath();
    g.ellipse(cx, -H * 0.86, 0.13 * m, 0.2 * m, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = skin;
    g.beginPath();
    g.arc(cx, -H * 0.9, 0.095 * m, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = hair;
    g.fillRect(cx - 0.1 * m, -H * 0.97, 0.2 * m, 0.06 * m);
    g.fillStyle = '#c8243a';
    g.fillRect(cx - 0.03 * m, -H * 0.875, 0.06 * m, 0.015 * m);
  },
  moto(g, p, W, D, m) {
    shadow(g, W, D, m, 0.05);
    const col = ['#c8342b', '#1d1d22', '#2a6fd0', '#e8c22a', '#f2efe8', '#2f8f4e'][Math.floor(p.v * 6)];
    wheel(g, W * 0.18, -0.3 * m, 0.3 * m);
    wheel(g, W * 0.82, -0.3 * m, 0.3 * m);
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(W * 0.25, -0.5 * m);
    g.lineTo(W * 0.75, -0.55 * m);
    g.lineTo(W * 0.85, -0.85 * m);
    g.lineTo(W * 0.6, -0.8 * m);
    g.closePath();
    g.fill();
    rect(g, W * 0.3, -0.82 * m, W * 0.32, 0.12 * m, '#141012'); // banco
    rect(g, W * 0.12, -0.6 * m, W * 0.25, 0.06 * m, '#8d8d92'); // escapamento
    g.strokeStyle = '#3a3a3e';
    g.lineWidth = 0.05 * m;
    g.beginPath();
    g.moveTo(W * 0.82, -0.3 * m);
    g.lineTo(W * 0.78, -1.0 * m);
    g.lineTo(W * 0.66, -1.05 * m);
    g.stroke();
    rect(g, W * 0.8, -0.95 * m, 0.12 * m, 0.1 * m, '#ffe9a0');
    if (p.v > 0.5) {
      // baú de entrega na garupa
      rect(g, W * 0.05, -1.25 * m, 0.55 * m, 0.45 * m, '#c8342b', 'rgba(0,0,0,0.5)');
    }
  },
  entulho(g, p, W, D, m) {
    g.fillStyle = '#8a7a66';
    g.beginPath();
    g.moveTo(0, 0);
    g.quadraticCurveTo(W * 0.3, -0.9 * m, W * 0.55, -0.75 * m);
    g.quadraticCurveTo(W * 0.85, -0.6 * m, W, 0);
    g.closePath();
    g.fill();
    for (let i = 0; i < 6; i++) rect(g, W * (0.1 + (i % 3) * 0.28), -0.18 * m - Math.floor(i / 3) * 0.25 * m, 0.25 * m, 0.12 * m, '#a5583a', 'rgba(0,0,0,0.4)');
    rect(g, W * 0.6, -0.5 * m, 0.5 * m, 0.08 * m, '#c9c2b4');
  },
  pneus(g, p, W, D, m) {
    for (let i = 0; i < 3; i++) {
      const y = -0.12 * m - i * 0.18 * m;
      g.fillStyle = '#1a1a1c';
      g.beginPath();
      g.ellipse(W / 2, y, W / 2, D / 2 + 0.06 * m, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#3a3a3e';
      g.beginPath();
      g.ellipse(W / 2, y - 0.03 * m, W * 0.22, D * 0.22 + 1, 0, 0, Math.PI * 2);
      g.fill();
    }
  },
  caixa_dagua(g, p, W, D, m) {
    shadow(g, W, D, m, 0.1);
    const H = 1.0 * m;
    rect(g, 0, -H, W, H, '#2f6db5', 'rgba(0,0,0,0.5)');
    g.strokeStyle = 'rgba(0,0,0,0.18)';
    for (let y = -H + 0.25 * m; y < 0; y += 0.25 * m) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(W, y);
      g.stroke();
    }
    g.fillStyle = '#4c8fd6';
    g.beginPath();
    g.ellipse(W / 2, -H - D / 2, W / 2, D / 2 + 1, 0, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    if (p.v > 0.5) pixo(g, PIXOS[Math.floor(p.v * 41) % PIXOS.length], 0.1 * m, -0.3 * m, 0.24 * m, '#f2efe8');
  },
  sinuca(g, p, W, D, m) {
    shadow(g, W, D, m, 0.1);
    for (const x of [0.15, W / m - 0.3]) rect(g, x * m, -0.7 * m, 0.15 * m, 0.7 * m, '#4a2c18');
    rect(g, 0, -0.85 * m - D, W, D, '#5a3418');
    rect(g, 0.1 * m, -0.85 * m - D + 0.08 * m, W - 0.2 * m, D - 0.16 * m, '#1f7a3a');
    rect(g, 0, -0.85 * m, W, 0.18 * m, '#6e4a2c', 'rgba(0,0,0,0.5)');
    const cols = ['#f2efe8', '#e5252f', '#ffd21f', '#2a6fd0', '#141012'];
    cols.forEach((c, i) => {
      g.fillStyle = c;
      g.beginPath();
      g.arc(W * (0.25 + i * 0.12), -0.85 * m - D * (0.35 + (i % 2) * 0.25), 0.05 * m, 0, Math.PI * 2);
      g.fill();
    });
    g.strokeStyle = '#c9a06a';
    g.lineWidth = 0.04 * m;
    g.beginPath();
    g.moveTo(W * 0.1, -0.85 * m - D * 0.2);
    g.lineTo(W * 0.7, -0.85 * m - D * 0.75);
    g.stroke();
  },
  churrasqueira(g, p, W, D, m) {
    shadow(g, W, D, m, 0.1);
    rect(g, 0, -0.9 * m, W, 0.9 * m, '#5a5a60', 'rgba(0,0,0,0.5)');
    rect(g, 0, -0.9 * m - D, W, D, '#2a1c14');
    for (let i = 0; i < 4; i++) rect(g, W * (0.1 + i * 0.22), -0.9 * m - D * 0.7, W * 0.12, D * 0.4, '#e8501a');
    g.fillStyle = 'rgba(200,200,200,0.35)';
    for (let i = 0; i < 3; i++) {
      g.beginPath();
      g.arc(W * (0.4 + i * 0.12), -1.3 * m - i * 0.35 * m, 0.18 * m + i * 0.06 * m, 0, Math.PI * 2);
      g.fill();
    }
  },
  varal(g, p, W, D, m) {
    const H = p.h * m;
    rect(g, 0, -H, 0.06 * m, H, '#8a8b90');
    rect(g, W - 0.06 * m, -H, 0.06 * m, H, '#8a8b90');
    g.strokeStyle = 'rgba(30,30,30,0.7)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(0, -H * 0.92);
    g.quadraticCurveTo(W / 2, -H * 0.8, W, -H * 0.92);
    g.stroke();
    // roupas: camisa amarela da seleção, bermuda, toalha
    const roupas = [['#ffd21f', 'camisa'], ['#2a6fd0', 'bermuda'], ['#f2efe8', 'camisa'], ['#e5252f', 'toalha'], ['#1f8a3c', 'camisa']];
    roupas.forEach(([c, k], i) => {
      const x = W * (0.1 + i * 0.18);
      const y = -H * 0.9 + Math.sin((i / 4) * Math.PI) * H * 0.08;
      g.fillStyle = c;
      if (k === 'camisa') {
        g.fillRect(x, y, 0.32 * m, 0.4 * m);
        g.fillRect(x - 0.08 * m, y, 0.48 * m, 0.12 * m);
      } else if (k === 'bermuda') {
        g.fillRect(x, y, 0.3 * m, 0.14 * m);
        g.fillRect(x, y, 0.13 * m, 0.32 * m);
        g.fillRect(x + 0.17 * m, y, 0.13 * m, 0.32 * m);
      } else g.fillRect(x, y, 0.35 * m, 0.5 * m);
    });
  },
  bandeira(g, p, W, D, m) {
    const H = p.h * m;
    rect(g, W / 2 - 0.04 * m, -H, 0.08 * m, H, '#9a9ba0');
    bandeira(g, W / 2 + 0.04 * m, -H, 1.15 * m, 0.8 * m);
  },
  camburao(g, p, W, D, m) {
    // camburão da polícia (genérico, sem brasão real): furgão branco com faixa, giroflex e grade atrás
    shadow(g, W, D, m, 0.25);
    const H = p.h * m;
    rect(g, 0, -H - D, W, D, '#d9dade', 'rgba(0,0,0,0.4)');
    rect(g, W * 0.38, -H - D * 0.7 - 0.18 * m, W * 0.3, 0.2 * m, '#1d1d22');
    rect(g, W * 0.38, -H - D * 0.7 - 0.18 * m, W * 0.15, 0.16 * m, '#e5252f');
    rect(g, W * 0.53, -H - D * 0.7 - 0.18 * m, W * 0.15, 0.16 * m, '#2a6fd0');
    rect(g, 0, -H, W, H - 0.3 * m, '#eceef0', 'rgba(0,0,0,0.5)');
    rect(g, 0, -H * 0.5, W, 0.28 * m, '#1f3f8f');
    rect(g, 0, -H * 0.5 + 0.28 * m, W, 0.08 * m, '#e5252f');
    text(g, 'POLÍCIA', W * 0.55, -H * 0.5 + 0.14 * m, 0.24 * m, '#fff', 900, null, W * 0.5);
    rect(g, W * 0.72, -H * 0.9, W * 0.24, H * 0.3, '#26323e'); // vidro da cabine
    rect(g, W * 0.06, -H * 0.88, W * 0.3, H * 0.28, '#2b2b30'); // grade do xadrez
    g.strokeStyle = '#9a9ba0';
    g.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      g.beginPath();
      g.moveTo(W * 0.06 + (W * 0.3 * i) / 5, -H * 0.88);
      g.lineTo(W * 0.06 + (W * 0.3 * i) / 5, -H * 0.6);
      g.stroke();
    }
    // marcas de tiro na lataria
    g.fillStyle = '#2a2a2e';
    for (let i = 0; i < 5; i++) {
      g.beginPath();
      g.arc(W * (0.4 + hash2(i, 3, 77) * 0.3), -H * (0.6 + hash2(i, 4, 77) * 0.25), 0.04 * m, 0, Math.PI * 2);
      g.fill();
    }
    wheel(g, W * 0.18, -0.34 * m, 0.34 * m);
    wheel(g, W * 0.82, -0.34 * m, 0.34 * m);
  },
  policial(g, p, W, D, m) {
    // policial armado de guarda (figura de ambiente; uniforme genérico, sem brasão real)
    const H = p.h * m;
    const cx = W / 2;
    const flip = p.v > 0.5 ? -1 : 1;
    const skin = SKIN[Math.floor(p.v * 29) % SKIN.length];
    g.fillStyle = 'rgba(0,0,0,0.3)';
    g.beginPath();
    g.ellipse(cx, -D / 2, 0.32 * m, 0.11 * m, 0, 0, Math.PI * 2);
    g.fill();
    rect(g, cx - 0.14 * m, -H * 0.06, 0.12 * m, H * 0.06, '#141012');
    rect(g, cx + 0.02 * m, -H * 0.06, 0.12 * m, H * 0.06, '#141012');
    rect(g, cx - 0.13 * m, -H * 0.48, 0.11 * m, H * 0.42, '#2a3346');
    rect(g, cx + 0.02 * m, -H * 0.48, 0.11 * m, H * 0.42, '#2a3346');
    rect(g, cx - 0.17 * m, -H * 0.8, 0.34 * m, H * 0.34, '#2f3a50');
    rect(g, cx - 0.16 * m, -H * 0.78, 0.32 * m, H * 0.26, '#15171c'); // colete
    text(g, 'POLÍCIA', cx, -H * 0.66, 0.07 * m, '#e8e8e8', 900, null, 0.3 * m);
    // fuzil atravessado no peito
    g.save();
    g.translate(cx, -H * 0.66);
    g.scale(flip, 1);
    g.rotate(-0.55);
    rect(g, -0.42 * m, -0.04 * m, 0.95 * m, 0.08 * m, '#1a1a1c');
    rect(g, -0.05 * m, 0.02 * m, 0.08 * m, 0.16 * m, '#1a1a1c');
    rect(g, -0.42 * m, -0.05 * m, 0.22 * m, 0.12 * m, '#3a2a1c');
    g.restore();
    g.strokeStyle = '#2f3a50';
    g.lineWidth = 0.08 * m;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(cx - 0.15 * m * flip, -H * 0.78);
    g.lineTo(cx - 0.05 * m * flip, -H * 0.62);
    g.moveTo(cx + 0.15 * m * flip, -H * 0.78);
    g.lineTo(cx + 0.22 * m * flip, -H * 0.68);
    g.stroke();
    // cabeça com boina/capacete
    g.fillStyle = skin;
    g.beginPath();
    g.arc(cx, -H * 0.88, 0.1 * m, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#15171c';
    g.beginPath();
    g.ellipse(cx, -H * 0.93, 0.13 * m, 0.08 * m, 0, Math.PI, Math.PI * 2);
    g.fill();
    g.fillRect(cx - 0.13 * m, -H * 0.935, 0.26 * m, 0.03 * m);
  },
  barricada(g, p, W, D, m) {
    // barricada de pneus, tambores e trilhos
    shadow(g, W, D, m, 0.1);
    for (let i = 0; i < Math.floor(W / (0.55 * m)); i++) {
      const x = 0.3 * m + i * 0.55 * m;
      g.fillStyle = '#1a1a1c';
      g.beginPath();
      g.ellipse(x, -0.25 * m - D * 0.3, 0.28 * m, 0.25 * m, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#3a3a3e';
      g.beginPath();
      g.ellipse(x, -0.25 * m - D * 0.3, 0.1 * m, 0.09 * m, 0, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = '#6a4a3a';
    g.lineWidth = 0.1 * m;
    g.beginPath();
    g.moveTo(0, -0.1 * m);
    g.lineTo(W * 0.6, -1.0 * m);
    g.moveTo(W, -0.15 * m);
    g.lineTo(W * 0.35, -0.95 * m);
    g.stroke();
    rect(g, W * 0.4, -0.85 * m, 0.5 * m, 0.7 * m, '#8a3a1c', 'rgba(0,0,0,0.5)');
    pixo(g, 'PARE', W * 0.42, -0.4 * m, 0.22 * m, '#f2efe8');
  },
  tambor(g, p, W, D, m) {
    shadow(g, W, D, m, 0.05);
    rect(g, 0, -0.9 * m, W, 0.9 * m, '#7a3a1c', 'rgba(0,0,0,0.5)');
    rect(g, 0, -0.62 * m, W, 0.05 * m, 'rgba(0,0,0,0.35)');
    rect(g, 0, -0.32 * m, W, 0.05 * m, 'rgba(0,0,0,0.35)');
    g.fillStyle = '#5a2a14';
    g.beginPath();
    g.ellipse(W / 2, -0.9 * m, W / 2, D / 2 + 1, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(255,140,40,0.85)'; // fogo no tambor
    g.beginPath();
    g.moveTo(W * 0.2, -0.95 * m);
    g.quadraticCurveTo(W * 0.4, -1.5 * m, W * 0.5, -1.25 * m);
    g.quadraticCurveTo(W * 0.65, -1.6 * m, W * 0.8, -0.95 * m);
    g.fill();
  },
  placa_parede(g, p, W, D, m) {
    // placa pintada à mão, saindo da parede da viela
    const w = 1.15 * m;
    const x = p.left ? W / 2 : W / 2 - w;
    const y = -p.h * m;
    rect(g, p.left ? W / 2 : W / 2 - 0.08 * m, y - 0.05 * m, 0.08 * m, 0.5 * m, '#6f7076');
    rect(g, x, y, w, 0.42 * m, ['#f4f1e8', '#ffd21f', '#e5252f', '#2a6fd0'][Math.floor(p.v * 4)], 'rgba(0,0,0,0.6)');
    text(g, p.text, x + w / 2, y + 0.21 * m, 0.17 * m, p.v > 0.5 && p.v < 0.75 ? '#fff' : '#1d1a18', 900, null, w * 0.92);
  },
};

function guardaSol(g, x, y, r, c1, c2) {
  g.strokeStyle = '#6f7076';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x, y + r * 1.6);
  g.stroke();
  for (let i = 0; i < 6; i++) {
    g.fillStyle = i % 2 ? c1 : c2;
    g.beginPath();
    g.moveTo(x, y);
    g.ellipse(x, y + r * 0.25, r, r * 0.45, 0, Math.PI + (i * Math.PI) / 6, Math.PI + ((i + 1) * Math.PI) / 6);
    g.closePath();
    g.fill();
  }
}

/** Gato de luz e bandeirinhas: fios cruzando a rua ou a viela no alto (desenho direto, com balanço). */
function drawOverhead(ctx, p, cam, ppu, t) {
  const H = p.h * ppu;
  cam.toScreen(p.x1, p.y1, pt2);
  const x0 = pt.x;
  const x1 = pt2.x;
  const y = pt.y - H;
  const sag = (x1 - x0) * 0.05 + Math.sin(t * 1.3 + p.v * 9) * 2;
  if (p.kind === 'fios') {
    ctx.strokeStyle = 'rgba(15,12,12,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      ctx.moveTo(x0, y + i * 3);
      ctx.quadraticCurveTo((x0 + x1) / 2, y + sag * (1 + i * 0.2) + i * 3, x1, y - 4 + i * 2);
    }
    ctx.stroke();
    // bola de gato e uma pipa presa no fio
    const bx = x0 + (x1 - x0) * (0.25 + p.v * 0.4);
    ctx.fillStyle = 'rgba(15,12,12,0.9)';
    ctx.beginPath();
    ctx.arc(bx, y + sag * 0.7, ppu * 0.18, 0, Math.PI * 2);
    ctx.fill();
    const kx = x0 + (x1 - x0) * (0.7 - p.v * 0.2);
    const ky = y + sag * 0.8;
    ctx.fillStyle = p.v > 0.5 ? '#e5252f' : '#ffd21f';
    ctx.beginPath();
    ctx.moveTo(kx, ky - ppu * 0.3);
    ctx.lineTo(kx + ppu * 0.22, ky);
    ctx.lineTo(kx, ky + ppu * 0.3);
    ctx.lineTo(kx - ppu * 0.22, ky);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(240,240,240,0.7)';
    ctx.beginPath();
    ctx.moveTo(kx, ky + ppu * 0.3);
    ctx.lineTo(kx + Math.sin(t * 3) * 4, ky + ppu * 0.9);
    ctx.stroke();
    return;
  }
  // bandeirinhas verde-amarelas
  ctx.strokeStyle = 'rgba(30,30,30,0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.quadraticCurveTo((x0 + x1) / 2, y + sag * 2, x1, y);
  ctx.stroke();
  const step = ppu * 0.55;
  const n = Math.max(2, Math.floor((x1 - x0) / step));
  const s = ppu * 0.28;
  for (let pass = 0; pass < 2; pass++) {
    ctx.fillStyle = pass ? '#ffd21f' : '#1f9a44';
    ctx.beginPath();
    for (let i = pass; i < n; i += 2) {
      const u = i / n;
      const x = x0 + (x1 - x0) * u;
      const yy = y + 4 * sag * 2 * u * (1 - u) * 0.5;
      ctx.moveTo(x - s / 2, yy);
      ctx.lineTo(x + s / 2, yy);
      ctx.lineTo(x, yy + s * 1.1);
      ctx.closePath();
    }
    ctx.fill();
  }
}

/**
 * Pedaço da camada estática: sujeira do chão (manchas, latinhas, papel, sacos, poças, santinhos, buracos,
 * bueiros, óleo) dentro de b. cam é a câmera local do bloco.
 */
export function drawLitter(g, w, cam, b) {
  const list = w.litter;
  if (!list) return;
  const ppu = cam.ppu;
  const k = cam.k;
  for (let i = lowerBound(list, b.minY - 1); i < list.length && list[i].y <= b.maxY + 1; i++) {
    const d = list[i];
    cam.toScreen(d.x, d.y, pt);
    const x = pt.x;
    const y = pt.y;
    const v = d.v;
    switch (d.kind) {
      case 'mancha':
        g.fillStyle = `rgba(30,20,12,${0.12 + v * 0.14})`;
        g.beginPath();
        g.ellipse(x, y, ppu * (0.3 + v * 0.6), ppu * (0.2 + v * 0.4) * k, v * 3, 0, Math.PI * 2);
        g.fill();
        break;
      case 'poca':
        g.fillStyle = 'rgba(60,70,80,0.45)';
        g.beginPath();
        g.ellipse(x, y, ppu * (0.5 + v * 0.5), ppu * (0.3 + v * 0.3) * k, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = 'rgba(200,220,235,0.18)';
        g.beginPath();
        g.ellipse(x - ppu * 0.1, y - 1, ppu * 0.25, ppu * 0.08 * k, 0, 0, Math.PI * 2);
        g.fill();
        break;
      case 'oleo':
        g.fillStyle = 'rgba(10,10,14,0.35)';
        g.beginPath();
        g.ellipse(x, y, ppu * (0.4 + v * 0.5), ppu * 0.3 * k, v, 0, Math.PI * 2);
        g.fill();
        break;
      case 'latinha':
        g.fillStyle = ['#c8342b', '#c9c9cc', '#2a6fd0', '#ffd21f'][Math.floor(v * 4)];
        g.save();
        g.translate(x, y);
        g.rotate(v * 6);
        g.fillRect(-ppu * 0.07, -ppu * 0.04, ppu * 0.14, ppu * 0.08);
        g.restore();
        break;
      case 'garrafa':
        g.fillStyle = v > 0.5 ? 'rgba(60,120,60,0.85)' : 'rgba(120,70,30,0.85)';
        g.save();
        g.translate(x, y);
        g.rotate(v * 6);
        g.fillRect(-ppu * 0.14, -ppu * 0.04, ppu * 0.28, ppu * 0.08);
        g.restore();
        break;
      case 'papel':
      case 'santinho': {
        g.save();
        g.translate(x, y);
        g.rotate(v * 6);
        const sw = d.kind === 'santinho' ? 0.16 : 0.2;
        g.fillStyle = d.kind === 'santinho' ? CANDIDATOS[Math.floor(v * 60) % CANDIDATOS.length].cor : '#ece9e0';
        g.fillRect(-ppu * sw / 2, -ppu * sw * 0.35 * k, ppu * sw, ppu * sw * 0.7 * k);
        if (d.kind === 'santinho') {
          g.fillStyle = '#f4f1e8';
          g.fillRect(-ppu * sw * 0.3, -ppu * sw * 0.2 * k, ppu * sw * 0.6, ppu * sw * 0.3 * k);
        }
        g.restore();
        break;
      }
      case 'bituca':
      case 'chiclete':
        g.fillStyle = d.kind === 'bituca' ? '#e8d6b0' : 'rgba(40,30,30,0.5)';
        g.fillRect(x, y, ppu * 0.06, ppu * 0.03);
        g.fillRect(x + ppu * 0.3, y + ppu * 0.1, ppu * 0.05, ppu * 0.03);
        break;
      case 'papelao':
        g.fillStyle = '#a07a4a';
        g.save();
        g.translate(x, y);
        g.rotate(v - 0.5);
        g.fillRect(-ppu * 0.4, -ppu * 0.3 * k, ppu * 0.8, ppu * 0.6 * k);
        g.strokeStyle = 'rgba(0,0,0,0.3)';
        g.strokeRect(-ppu * 0.4, -ppu * 0.3 * k, ppu * 0.8, ppu * 0.6 * k);
        g.restore();
        break;
      case 'saco': {
        // sacos de lixo pretos amontoados
        const n = 1 + Math.floor(v * 3);
        for (let j = 0; j < n; j++) {
          const sx = x + (j - n / 2) * ppu * 0.3;
          const sy = y - (j % 2) * ppu * 0.1;
          g.fillStyle = 'rgba(0,0,0,0.3)';
          g.beginPath();
          g.ellipse(sx, sy + 2, ppu * 0.25, ppu * 0.1, 0, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = '#1c1c20';
          g.beginPath();
          g.ellipse(sx, sy - ppu * 0.18, ppu * 0.22, ppu * 0.24, 0, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = 'rgba(255,255,255,0.15)';
          g.fillRect(sx - ppu * 0.1, sy - ppu * 0.32, ppu * 0.05, ppu * 0.12);
        }
        break;
      }
      case 'buraco':
        g.fillStyle = '#1e1c1c';
        g.beginPath();
        g.ellipse(x, y, ppu * (0.7 + v * 0.4), ppu * 0.5 * k, 0.2, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = 'rgba(120,110,100,0.6)';
        g.lineWidth = 2;
        g.stroke();
        break;
      case 'bueiro':
        g.fillStyle = '#2a2a2e';
        g.beginPath();
        g.ellipse(x, y, ppu * 0.45, ppu * 0.45 * k, 0, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = 'rgba(160,160,165,0.5)';
        g.lineWidth = 1;
        for (let j = -2; j <= 2; j++) {
          g.beginPath();
          g.moveTo(x - ppu * 0.3, y + j * ppu * 0.08 * k);
          g.lineTo(x + ppu * 0.3, y + j * ppu * 0.08 * k);
          g.stroke();
        }
        break;
      default:
        break;
    }
  }
}

/** Fachada virada para a câmera (muro do fim da Orla, fundos de casa do morro): pichação, cartazes e bandeira. */
export function drawFachada(g, f, p, ppu) {
  const W = (f.x1 - f.x0) * ppu;
  const H = f.h * ppu;
  const x = p.x;
  const y = p.y;
  const cols = f.orla ? ['#bdb5a8'] : ['#a8634c', '#b8955a', '#6f8a96', '#c4b597', '#86677f', '#9d978c'];
  // trechos de casas de cores diferentes, com janelas gradeadas
  let cx = 0;
  let i = 0;
  while (cx < W) {
    const seg = Math.min(W - cx, (2.4 + hash2(i, Math.round(f.seed * 100), 3) * 2.2) * ppu);
    const col = cols[Math.floor(hash2(i, Math.round(f.seed * 100), 4) * cols.length)];
    g.fillStyle = col;
    g.fillRect(x + cx, y - H, seg, H);
    g.fillStyle = 'rgba(0,0,0,0.12)';
    g.fillRect(x + cx, y - H, 2, H);
    if (!f.orla && seg > ppu * 1.4) {
      g.fillStyle = '#26262c';
      g.fillRect(x + cx + seg * 0.3, y - H * 0.75, seg * 0.35, H * 0.28);
      g.strokeStyle = 'rgba(200,200,200,0.5)';
      g.lineWidth = 1;
      for (let gx = 1; gx < 4; gx++) {
        g.beginPath();
        g.moveTo(x + cx + seg * 0.3 + (seg * 0.35 * gx) / 4, y - H * 0.75);
        g.lineTo(x + cx + seg * 0.3 + (seg * 0.35 * gx) / 4, y - H * 0.47);
        g.stroke();
      }
    }
    cx += seg;
    i++;
  }
  g.fillStyle = 'rgba(40,50,30,0.25)';
  g.fillRect(x, y - 0.4 * ppu, W, 0.4 * ppu);
  g.strokeStyle = 'rgba(15,10,12,0.55)';
  g.lineWidth = 1;
  g.strokeRect(x + 0.5, y - H + 0.5, W - 1, H - 1);
  // pichação ao longo do muro, cartazes e bandeira pendurada
  const n = Math.max(1, Math.floor(W / (ppu * 2.2)));
  const s = Math.round(f.seed * 1000);
  for (let j = 0; j < n; j++) {
    const word = PIXOS[Math.floor(hash2(j, s, 5) * PIXOS.length)];
    const col = hash2(j, s, 6) < 0.7 ? '#141012' : ['#c8342b', '#2a6fd0', '#f2efe8'][Math.floor(hash2(j, s, 7) * 3)];
    pixo(g, word, x + j * ppu * 2.2 + hash2(j, s, 8) * ppu * 0.6, y - H * (0.18 + hash2(j, s, 9) * 0.4), ppu * 0.42, col, (hash2(j, s, 10) - 0.5) * 0.25);
    if (hash2(j, s, 11) < 0.35) cartaz(g, x + j * ppu * 2.2 + ppu * 1.2, y - H * 0.85, ppu * 0.55, ppu * 0.75, Math.floor(hash2(j, s, 12) * 6));
    if (hash2(j, s, 13) < 0.18) bandeira(g, x + j * ppu * 2.2 + ppu * 0.2, y - H * 0.98, ppu * 1.1, ppu * 0.75);
  }
  if (f.orla && W > ppu * 8) {
    pixo(g, 'FIM DA ORLA', x + W * 0.45, y - H * 0.55, ppu * 0.6, '#c8342b', -0.03, 1.4);
  }
}

