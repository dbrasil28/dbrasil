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
const PAD = { policial: [0.8, 0.3], camburao: [0.6, 0.6], poste: [2.2, 0.3], placa_parede: [1.4, 0.6], placa: [0.9, 0.4], garota: [0.6, 0.3], varal: [0.4, 0.5], bandeira: [1.4, 0.4], orelhao: [0.5, 0.3] };

function sprite(p, ppu, k, dpr) {
  const key = `${ppu.toFixed(3)}|${k.toFixed(4)}|${dpr}|${images.poste ? 1 : 0}|${images.poste_b ? 1 : 0}|${images.cone ? 1 : 0}`;
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
  (DRAW[p.kind] || bloco)(g, { ...p, v }, W, D, ppu, ppu * k);
  cache.set(id, c);
  return c;
}

/** Desenha um objeto do cenário; (sx, sy) = tela do canto da frente à esquerda, no chão. */
export function drawCenario(ctx, p, cam, ppu, dpr, t, alpha = 1, playerPx = 0) {
  if (p.invisivel) return; // poste da rede: só colisão (o desenho vem na imagem da rede)
  cam.toScreen(p.x0, p.y1, pt);
  if (DIRECT.has(p.kind)) return drawOverhead(ctx, p, cam, ppu, t);
  // arte pintada (PNG do ateliê), quando existe: mesma origem (canto da frente, à esquerda, no chão)
  const A = ART[p.kind];
  if (A) {
    const f = artFile(p.kind, p.v);
    const im = f && images[artKey(p.kind, f)];
    if (im) {
      const k = ((p.x1 - p.x0) / A.w) * (ppu / ART_S);
      const flip = A.espelha && Math.floor(p.v * 97) % 2 === 1;
      ctx.save();
      if (alpha < 1) ctx.globalAlpha = alpha;
      if (flip) {
        // espelhado em torno do meio do objeto (a moldura tem a mesma folga dos dois lados)
        ctx.translate(2 * pt.x + (p.x1 - p.x0) * ppu, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(im, pt.x - A.padX * ART_S * k, pt.y - A.top * ART_S * k, im.width * k, im.height * k);
      ctx.restore();
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

// Provisório em blocos (pedido do autor, 07/11/2026): os desenhos em código ficaram amadores; cada
// objeto vira um bloco simples que só marca onde está e o tamanho, até a arte gerada entrar.
const BLOCO = {
  veiculo: ['carro', 'onibus', 'camburao', 'moto'],
  barraca: ['banca', 'milho', 'picole'],
  muro: ['muro', 'tapume'],
};
const BLOCO_COR = { veiculo: '#7f8896', barraca: '#9c7b58', muro: '#b2a993', outro: '#8e8c86' };
const blocoCor = (kind) => BLOCO_COR[Object.keys(BLOCO).find((k) => BLOCO[k].includes(kind)) || 'outro'];

/** Bloco: frente e tampo numa cor só por categoria, contorno fino e sombra no chão. */
function bloco(g, p, W, D, m) {
  const H = p.h * m;
  const c = blocoCor(p.kind);
  g.fillStyle = 'rgba(0,0,0,0.25)';
  g.fillRect(-2, -D, W + 4 + 0.2 * m, D + 3);
  rect(g, 0, -H - D, W, D, shade(c, 1.12), 'rgba(0,0,0,0.45)');
  rect(g, 0, -H, W, H, c, 'rgba(0,0,0,0.55)');
}

const DRAW = {
  poste(g, p, W, D, m) {
    // poste de luz com o gato de fios (imagem centrada na base); sem imagem, um poste simples
    const H = p.h * m;
    const im = p.v < 0.5 ? images.poste : images.poste_b || images.poste;
    if (im) {
      const w = (im.width / im.height) * H;
      g.fillStyle = 'rgba(0,0,0,0.3)';
      g.beginPath();
      g.ellipse(W / 2 + 0.25 * m, 0, 0.45 * m, 0.14 * m, 0, 0, Math.PI * 2);
      g.fill();
      g.drawImage(im, W / 2 - w / 2, -H, w, H);
    } else {
      rect(g, W / 2 - 0.07 * m, -H, 0.14 * m, H, '#6f7076');
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
  placa(g, p, W, D, m) {
    const H = p.h * m;
    rect(g, W / 2 - 0.04 * m, -H, 0.08 * m, H, '#8a8b90');
    rect(g, W / 2 - 0.7 * m, -H - 0.15 * m, 1.4 * m, 0.4 * m, '#ece9e0', 'rgba(0,0,0,0.6)');
    text(g, p.text, W / 2, -H + 0.05 * m, 0.16 * m, '#1d1a18', 800, null, 1.3 * m);
  },
  placa_parede(g, p, W, D, m) {
    const w = 1.15 * m;
    const x = p.left ? W / 2 : W / 2 - w;
    rect(g, x, -p.h * m, w, 0.4 * m, '#ece9e0', 'rgba(0,0,0,0.6)');
    text(g, p.text, x + w / 2, -p.h * m + 0.2 * m, 0.16 * m, '#1d1a18', 800, null, w * 0.92);
  },
  bandeira(g, p, W, D, m) {
    const H = p.h * m;
    rect(g, W / 2 - 0.04 * m, -H, 0.08 * m, H, '#9a9ba0');
    bandeira(g, W / 2 + 0.04 * m, -H, 1.1 * m, 0.76 * m);
  },
  varal(g, p, W, D, m) {
    const H = p.h * m;
    g.strokeStyle = 'rgba(30,30,30,0.7)';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(0, -H * 0.9);
    g.lineTo(W, -H * 0.9);
    g.stroke();
  },
};

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
      case 'quadra': {
        // linhas da quadra de futevôlei na areia (v = metade da largura em m)
        const hw = v;
        const hl = 6;
        cam.toScreen(d.x - hw, d.y - hl, pt2);
        const w2 = hw * 2 * ppu;
        const h2 = hl * 2 * ppu * k;
        g.strokeStyle = 'rgba(40,120,200,0.75)';
        g.lineWidth = Math.max(2, ppu * 0.08);
        g.strokeRect(pt2.x, pt2.y, w2, h2);
        g.beginPath();
        g.moveTo(pt2.x, pt2.y + h2 / 2);
        g.lineTo(pt2.x + w2, pt2.y + h2 / 2);
        g.stroke();
        break;
      }
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

