// Ateliê do cenário da Orla: pinta cada objeto em canvas, na perspectiva da câmera do jogo (55°),
// com luz de fim de tarde vinda da esquerda, sombra no chão, contorno, sujeira e detalhes.
// Roda no navegador (tools/arte/gerar-cenario.cjs abre esta página com o Playwright e salva os PNG).
import { ART, ART_S as S, ART_K as K } from '../../prototype/src/arte_cenario.js';
import { CANDIDATOS, PIXOS } from '../../prototype/src/cenario.js';

const INK = 'rgba(26,19,15,0.95)';
const FONT = '"Inter Display", Inter, "Liberation Sans", sans-serif';
const LW = 3; // contorno em px (a 128 px/m)

// ---------- base ----------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const X = (x) => x * S;
const Y = (y, z) => -z * S - y * S * K;
const hex = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
};
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const tone = (h, f, a = 1) => rgb(hex(h).map((v) => Math.max(0, Math.min(255, v * f))), a);
const mix = (h1, h2, t, a = 1) => {
  const c1 = hex(h1);
  const c2 = hex(h2);
  return rgb(c1.map((v, i) => v + (c2[i] - v) * t), a);
};

let noiseCanvas = null;
function noise() {
  if (noiseCanvas) return noiseCanvas;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const d = g.createImageData(256, 256);
  const r = rng(77);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = 170 + r() * 85;
    d.data[i] = v;
    d.data[i + 1] = v * 0.97;
    d.data[i + 2] = v * 0.92;
    d.data[i + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(70,50,35,${0.05 + r() * 0.12})`;
    g.beginPath();
    g.ellipse(r() * 256, r() * 256, 4 + r() * 22, 3 + r() * 14, r() * 3, 0, Math.PI * 2);
    g.fill();
  }
  noiseCanvas = c;
  return c;
}

/** Preenche o caminho (pathFn) com cor ou gradiente, sujeira opcional e contorno. */
function shape(g, pathFn, o = {}) {
  g.save();
  g.beginPath();
  pathFn();
  g.fillStyle = o.fill;
  g.fill();
  if (o.tex) {
    g.clip();
    g.globalCompositeOperation = 'multiply';
    g.globalAlpha = o.tex;
    g.fillStyle = g.createPattern(noise(), 'repeat');
    g.fillRect(-3000, -3000, 6000, 6000);
  }
  g.restore();
  if (o.stroke !== false) {
    g.save();
    g.beginPath();
    pathFn();
    g.strokeStyle = o.stroke || INK;
    g.lineWidth = o.lw || LW;
    g.lineJoin = 'round';
    g.stroke();
    g.restore();
  }
}
const pts = (g, list) => list.forEach(([x, y, z], i) => (i ? g.lineTo(X(x), Y(y, z)) : g.moveTo(X(x), Y(y, z))));
const frontRect = (g, x0, x1, z0, z1, y = 0) => () => pts(g, [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]]);
const topRect = (g, x0, x1, y0, y1, z) => () => pts(g, [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]]);
/** Retângulo de cantos arredondados no plano de altura z (visto de cima, achatado pela câmera). */
function roundTop(g, x0, x1, y0, y1, z, rad) {
  const n = 6;
  const corner = (cx, cy, a0) => {
    for (let i = 0; i <= n; i++) {
      const a = a0 + (i / n) * (Math.PI / 2);
      const x = cx + Math.cos(a) * rad;
      const y = cy + Math.sin(a) * rad;
      g.lineTo(X(x), Y(y, z));
    }
  };
  g.moveTo(X(x0 + rad), Y(y0, z));
  corner(x1 - rad, y0 + rad, -Math.PI / 2);
  corner(x1 - rad, y1 - rad, 0);
  corner(x0 + rad, y1 - rad, Math.PI / 2);
  corner(x0 + rad, y0 + rad, Math.PI);
  g.closePath();
}
/** Gradiente vertical de uma face da frente: luz quente em cima, sombra embaixo. */
const vgrad = (g, z0, z1, top, bottom, y = 0) => {
  const gr = g.createLinearGradient(0, Y(y, z1), 0, Y(y, z0));
  gr.addColorStop(0, top);
  gr.addColorStop(1, bottom);
  return gr;
};
/** Gradiente horizontal: lado esquerdo mais claro (sol de fim de tarde). */
const hgrad = (g, x0, x1, left, right) => {
  const gr = g.createLinearGradient(X(x0), 0, X(x1), 0);
  gr.addColorStop(0, left);
  gr.addColorStop(1, right);
  return gr;
};
/** Sombra no chão, puxada para a direita (sol baixo à esquerda). */
function groundShadow(g, x0, x1, y0, y1, len = 0.5, a = 0.45) {
  g.save();
  g.filter = `blur(${Math.round(S * 0.07)}px)`;
  g.fillStyle = `rgba(10,6,4,${a})`;
  g.beginPath();
  pts(g, [[x0 - 0.05, y0 - 0.12, 0], [x1 + 0.05 + len, y0 - 0.12, 0], [x1 + 0.1 + len, y1 + 0.05, 0], [x0 + len * 0.4, y1 + 0.05, 0]]);
  g.fill();
  g.restore();
}
/** Escurecido de contato com o chão na base de uma face da frente. */
function contact(g, x0, x1, h = 0.12) {
  const gr = g.createLinearGradient(0, Y(0, h), 0, Y(0, 0));
  gr.addColorStop(0, 'rgba(0,0,0,0)');
  gr.addColorStop(1, 'rgba(0,0,0,0.35)');
  g.fillStyle = gr;
  g.fillRect(X(x0), Y(0, h), X(x1 - x0), h * S);
}
/** Brilho quente na aresta de cima de uma face. */
function rim(g, x0, x1, z, y = 0, a = 0.55) {
  g.strokeStyle = `rgba(255,214,160,${a})`;
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(X(x0) + 2, Y(y, z) + 2);
  g.lineTo(X(x1) - 2, Y(y, z) + 2);
  g.stroke();
}
function text(g, s, x, y, size, color, o = {}) {
  g.save();
  g.translate(x, y);
  if (o.rot) g.rotate(o.rot);
  g.scale(o.sx ?? 0.82, o.sy ?? 1);
  g.font = `${o.weight || 900} ${size}px ${FONT}`;
  g.textAlign = o.align || 'center';
  g.textBaseline = 'middle';
  if (o.stroke) {
    g.strokeStyle = o.stroke;
    g.lineWidth = o.slw || size * 0.18;
    g.lineJoin = 'round';
    g.strokeText(s, 0, 0);
  }
  g.fillStyle = color;
  g.fillText(s, 0, 0, o.max ? o.max / (o.sx ?? 0.82) : undefined);
  g.restore();
}
/** Pichação em letra de pixo: letras altas, finas e retas, com escorrido. */
function pixo(g, s, x, y, h, color, r) {
  g.save();
  g.strokeStyle = color;
  g.lineWidth = Math.max(2.5, h * 0.09);
  g.lineCap = 'square';
  let cx = x;
  for (const ch of s) {
    if (ch === ' ') {
      cx += h * 0.35;
      continue;
    }
    const w = h * (0.32 + r() * 0.12);
    const sk = (r() - 0.5) * h * 0.12;
    g.beginPath();
    // letra de pixo: hastes verticais longas com cortes em ângulo
    g.moveTo(cx + sk, y);
    g.lineTo(cx, y - h);
    g.lineTo(cx + w * (0.5 + r() * 0.5), y - h * (0.85 + r() * 0.2));
    if (r() < 0.6) {
      g.moveTo(cx + w, y - h * 0.9);
      g.lineTo(cx + w + sk, y);
    }
    if (r() < 0.5) {
      g.moveTo(cx, y - h * 0.5);
      g.lineTo(cx + w, y - h * (0.45 + r() * 0.15));
    }
    g.stroke();
    if (r() < 0.25) {
      g.lineWidth = Math.max(1.5, h * 0.04);
      g.beginPath();
      g.moveTo(cx + w * 0.3, y);
      g.lineTo(cx + w * 0.3, y + h * (0.15 + r() * 0.25)); // tinta escorrendo
      g.stroke();
      g.lineWidth = Math.max(2.5, h * 0.09);
    }
    cx += w + h * 0.12;
  }
  g.restore();
  return cx;
}
/** Grafite colorido de letras gordas ("bomb"). */
function bomb(g, s, x, y, size, fill, line) {
  g.save();
  g.font = `900 ${size}px ${FONT}`;
  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  g.lineJoin = 'round';
  g.translate(x, y);
  g.rotate(-0.06);
  g.strokeStyle = '#111';
  g.lineWidth = size * 0.28;
  g.strokeText(s, 0, 0);
  g.strokeStyle = line;
  g.lineWidth = size * 0.14;
  g.strokeText(s, 0, 0);
  const gr = g.createLinearGradient(0, -size, 0, 0);
  gr.addColorStop(0, '#fff6c0');
  gr.addColorStop(0.5, fill);
  gr.addColorStop(1, tone(fill, 0.6));
  g.fillStyle = gr;
  g.fillText(s, 0, 0);
  g.restore();
}
/** Cartaz de candidato fictício (lambe-lambe), canto de cima à esquerda em (x, y) px. */
function cartaz(g, x, y, w, h, i, torn = 0) {
  const c = CANDIDATOS[i % CANDIDATOS.length];
  g.save();
  g.translate(x, y);
  g.fillStyle = '#f3efe2';
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(w, 0);
  g.lineTo(w, h * (1 - torn * 0.5));
  g.lineTo(w * 0.7, h * (1 - torn));
  g.lineTo(w * 0.35, h);
  g.lineTo(0, h);
  g.closePath();
  g.fill();
  g.clip();
  g.fillStyle = c.cor;
  g.fillRect(0, 0, w, h * 0.2);
  text(g, 'VOTE', w / 2, h * 0.1, h * 0.13, '#fff');
  // rosto sorridente de candidato
  g.fillStyle = mix(c.cor, '#ffffff', 0.75);
  g.fillRect(w * 0.12, h * 0.22, w * 0.76, h * 0.4);
  g.fillStyle = '#c79a74';
  g.beginPath();
  g.ellipse(w / 2, h * 0.43, w * 0.17, h * 0.13, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#2b211c';
  g.beginPath();
  g.ellipse(w / 2, h * 0.33, w * 0.18, h * 0.05, 0, Math.PI, 0);
  g.fill();
  g.fillStyle = c.cor;
  g.beginPath();
  g.moveTo(w * 0.22, h * 0.62);
  g.quadraticCurveTo(w / 2, h * 0.5, w * 0.78, h * 0.62);
  g.fill();
  g.strokeStyle = '#3a2620';
  g.lineWidth = Math.max(1, w * 0.02);
  g.beginPath();
  g.arc(w / 2, h * 0.44, w * 0.07, 0.25, Math.PI - 0.25);
  g.stroke();
  text(g, c.num, w / 2, h * 0.74, h * 0.18, c.cor, { max: w * 0.9 });
  text(g, c.nome, w / 2, h * 0.88, h * 0.075, '#1d1a18', { max: w * 0.92, weight: 800 });
  // desbotado e sujo
  g.globalCompositeOperation = 'multiply';
  g.globalAlpha = 0.35;
  g.fillStyle = g.createPattern(noise(), 'repeat');
  g.fillRect(0, 0, w, h);
  g.restore();
  g.strokeStyle = 'rgba(0,0,0,0.35)';
  g.lineWidth = 1;
  g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}
function bandeira(g, x, y, w, h) {
  g.save();
  g.translate(x, y);
  g.fillStyle = '#1e8a3c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffd21f';
  g.beginPath();
  g.moveTo(w * 0.08, h / 2);
  g.lineTo(w / 2, h * 0.1);
  g.lineTo(w * 0.92, h / 2);
  g.lineTo(w / 2, h * 0.9);
  g.closePath();
  g.fill();
  g.fillStyle = '#1d3f8f';
  g.beginPath();
  g.arc(w / 2, h / 2, h * 0.26, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#f2efe8';
  g.lineWidth = Math.max(1, h * 0.05);
  g.beginPath();
  g.arc(w / 2 + h * 0.05, h * 0.95, h * 0.5, -Math.PI * 0.72, -Math.PI * 0.36);
  g.stroke();
  g.fillStyle = '#fff';
  for (let i = 0; i < 6; i++) g.fillRect(w / 2 - h * 0.12 + i * h * 0.05, h * 0.55 + (i % 2) * h * 0.06, 1.5, 1.5);
  g.restore();
}
/** Roda vista de lado: pneu, aro e calota. */
function roda(g, x, z, r, rim = '#8e9196') {
  const cx = X(x);
  const cy = Y(0, z);
  const R = r * S;
  g.fillStyle = '#0f0f10';
  g.beginPath();
  g.arc(cx, cy, R, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.08)';
  g.lineWidth = R * 0.12;
  g.beginPath();
  g.arc(cx, cy, R * 0.85, Math.PI * 1.1, Math.PI * 1.6);
  g.stroke();
  const gr = g.createRadialGradient(cx - R * 0.2, cy - R * 0.2, R * 0.05, cx, cy, R * 0.6);
  gr.addColorStop(0, '#d8dadf');
  gr.addColorStop(1, rim);
  g.fillStyle = gr;
  g.beginPath();
  g.arc(cx, cy, R * 0.55, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = 'rgba(30,30,32,0.7)';
  g.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * R * 0.15, cy + Math.sin(a) * R * 0.15);
    g.lineTo(cx + Math.cos(a) * R * 0.5, cy + Math.sin(a) * R * 0.5);
    g.stroke();
  }
  g.fillStyle = '#5a5c60';
  g.beginPath();
  g.arc(cx, cy, R * 0.14, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = INK;
  g.lineWidth = LW;
  g.beginPath();
  g.arc(cx, cy, R, 0, Math.PI * 2);
  g.stroke();
}
/** Guarda-sol de gomos, visto de cima e de frente. cx em m, z da ponta em m. */
function guardaSol(g, cx, cy, z, r, c1, c2) {
  const x = X(cx);
  const y0 = Y(cy, z);
  g.strokeStyle = '#7c7f86';
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(x, y0);
  g.lineTo(x, Y(cy, 0.9));
  g.stroke();
  const R = r * S;
  const ry = R * K * 0.95;
  const top = y0 - R * 0.12;
  // aba (de baixo) em sombra
  g.fillStyle = tone(c1, 0.55);
  g.beginPath();
  g.ellipse(x, top + ry * 0.35, R, ry, 0, 0, Math.PI);
  g.fill();
  const n = 8;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    const light = 0.75 + 0.35 * Math.cos((a0 + a1) / 2 + 2.4);
    g.fillStyle = tone(i % 2 ? c1 : c2, light);
    g.beginPath();
    g.moveTo(x, top - ry * 0.25);
    g.lineTo(x + Math.cos(a0) * R, top + Math.sin(a0) * ry);
    g.lineTo(x + Math.cos(a1) * R, top + Math.sin(a1) * ry);
    g.closePath();
    g.fill();
  }
  g.strokeStyle = INK;
  g.lineWidth = LW;
  g.beginPath();
  g.ellipse(x, top, R, ry, 0, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = '#5a5c60';
  g.beginPath();
  g.arc(x, top - ry * 0.25, 4, 0, Math.PI * 2);
  g.fill();
}

// ---------- objetos ----------
const CARROS = {
  branco: { cor: '#e8e6df' },
  prata: { cor: '#a7abb1' },
  vermelho: { cor: '#b3261e', vende: true },
  preto: { cor: '#1f2024', furado: true },
  taxi: { cor: '#f0bf1c', taxi: true },
  azul: { cor: '#2d4f86', amassado: true },
};

function carro(g, file) {
  const A = ART.carro;
  const o = CARROS[file];
  const c = o.cor;
  const r = rng(file.length * 31 + 7);
  const W = A.w;
  const D = A.d;
  groundShadow(g, 0.05, W - 0.05, 0, D, 0.6, 0.5);
  // vista de cima: um tampo só, arredondado, do porta-malas ao capô; depois os vidros inclinados e o teto
  const zb = 0.86;
  const zt = 1.42;
  const deck = () => roundTop(g, 0.06, W - 0.04, 0.05, D - 0.05, zb, 0.42);
  const deckG = g.createLinearGradient(0, Y(0, zb), 0, Y(D, zb));
  deckG.addColorStop(0, tone(c, 1.22));
  deckG.addColorStop(0.25, tone(c, 1.04));
  deckG.addColorStop(1, tone(c, 0.72));
  shape(g, deck, { fill: deckG, tex: 0.22, lw: 2.5 });
  // vincos do capô e da tampa do porta-malas, e o brilho do sol no capô
  g.strokeStyle = 'rgba(0,0,0,0.22)';
  g.lineWidth = 2;
  for (const yy of [0.55, 1.25]) {
    g.beginPath();
    g.moveTo(X(3.2), Y(yy, zb));
    g.lineTo(X(3.85), Y(yy, zb));
    g.stroke();
  }
  g.beginPath();
  g.moveTo(X(1.0), Y(0.12, zb));
  g.lineTo(X(1.0), Y(D - 0.12, zb));
  g.moveTo(X(3.12), Y(0.12, zb));
  g.lineTo(X(3.12), Y(D - 0.12, zb));
  g.stroke();
  g.fillStyle = 'rgba(255,246,225,0.28)';
  g.beginPath();
  pts(g, [[3.25, 0.25, zb], [3.8, 0.3, zb], [3.7, 0.7, zb], [3.2, 0.62, zb]]);
  g.fill();
  // vidros: para-brisa, vigia e a faixa da janela do outro lado, todos puxando para o teto
  const glass = (list) => {
    const gr = g.createLinearGradient(0, Y(D, zt), 0, Y(0, zb));
    gr.addColorStop(0, '#0f171f');
    gr.addColorStop(1, '#33475a');
    shape(g, () => pts(g, list), { fill: gr, lw: 2 });
  };
  glass([[2.6, 0.22, zt], [3.18, 0.1, zb + 0.02], [3.18, D - 0.1, zb + 0.02], [2.6, D - 0.22, zt]]);
  glass([[1.38, 0.22, zt], [0.95, 0.1, zb], [0.95, D - 0.1, zb], [1.38, D - 0.22, zt]]);
  glass([[1.38, D - 0.22, zt], [2.6, D - 0.22, zt], [3.18, D - 0.1, zb + 0.02], [0.95, D - 0.1, zb]]);
  g.strokeStyle = 'rgba(225,238,248,0.4)';
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(X(2.75), Y(0.45, 1.34));
  g.lineTo(X(3.05), Y(0.35, 0.98));
  g.moveTo(X(2.85), Y(0.95, 1.3));
  g.lineTo(X(3.1), Y(0.9, 1.0));
  g.stroke();
  // teto arredondado com brilho
  const rg = g.createLinearGradient(0, Y(0.22, zt), 0, Y(D - 0.22, zt));
  rg.addColorStop(0, tone(c, 1.25));
  rg.addColorStop(1, tone(c, 0.82));
  shape(g, () => roundTop(g, 1.38, 2.6, 0.22, D - 0.22, zt, 0.18), { fill: rg, tex: 0.2, lw: 2.5 });
  g.fillStyle = 'rgba(255,246,225,0.3)';
  g.beginPath();
  pts(g, [[1.5, 0.35, zt], [2.45, 0.35, zt], [2.45, 0.5, zt], [1.5, 0.5, zt]]);
  g.fill();
  if (o.taxi) {
    // luminoso de táxi no teto
    const lx0 = 1.7;
    const lx1 = 2.3;
    shape(g, () => pts(g, [[lx0, 0.75, zt + 0.2], [lx1, 0.75, zt + 0.2], [lx1, 1.05, zt + 0.2], [lx0, 1.05, zt + 0.2]]), { fill: '#fbf7ea' });
    shape(g, frontRect(g, lx0, lx1, zt, zt + 0.2, 0.75), { fill: vgrad(g, zt, zt + 0.2, '#ffffff', '#d8d4c6', 0.75) });
    text(g, 'TÁXI', X((lx0 + lx1) / 2), Y(0.75, zt + 0.1), S * 0.14, '#1b1b1b');
  }
  // lateral (perto da câmera): carroceria com caixas de roda
  const side = () => {
    g.moveTo(X(0.02), Y(0, 0.32));
    g.lineTo(X(0.0), Y(0, 0.62));
    g.quadraticCurveTo(X(0.0), Y(0, 0.84), X(0.18), Y(0, 0.88));
    g.lineTo(X(3.75), Y(0, 0.84));
    g.quadraticCurveTo(X(4.0), Y(0, 0.8), X(4.0), Y(0, 0.6));
    g.lineTo(X(3.98), Y(0, 0.3));
    g.lineTo(X(3.6), Y(0, 0.28));
    g.arc(X(3.15), Y(0, 0.3), 0.42 * S, 0, Math.PI, true);
    g.lineTo(X(1.3), Y(0, 0.28));
    g.arc(X(0.85), Y(0, 0.3), 0.42 * S, 0, Math.PI, true);
    g.closePath();
  };
  const sg = g.createLinearGradient(0, Y(0, 0.88), 0, Y(0, 0.28));
  sg.addColorStop(0, tone(c, 1.12));
  sg.addColorStop(0.35, tone(c, 0.98));
  sg.addColorStop(0.42, tone(c, 1.2));
  sg.addColorStop(0.5, tone(c, 0.92));
  sg.addColorStop(1, tone(c, 0.62));
  shape(g, side, { fill: sg, tex: 0.3 });
  // cabine: janelas laterais
  const cab = () => pts(g, [[0.98, 0.04, 0.88], [1.36, 0.1, 1.4], [2.62, 0.1, 1.4], [3.12, 0.04, 0.86]]);
  shape(g, cab, { fill: tone(c, 0.96) });
  const win = (x0, x1, x0t, x1t) => () => pts(g, [[x0, 0.04, 0.92], [x0t, 0.1, 1.34], [x1t, 0.1, 1.34], [x1, 0.04, 0.92]]);
  const wg = g.createLinearGradient(0, Y(0.1, 1.34), 0, Y(0, 0.92));
  wg.addColorStop(0, '#3b4c5b');
  wg.addColorStop(1, '#141c24');
  shape(g, win(1.08, 1.95, 1.4, 1.95), { fill: wg, lw: 2 });
  shape(g, win(2.05, 3.0, 2.05, 2.58), { fill: wg, lw: 2 });
  g.strokeStyle = 'rgba(210,225,235,0.32)';
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(X(1.5), Y(0.1, 1.3));
  g.lineTo(X(1.3), Y(0.05, 0.98));
  g.moveTo(X(2.4), Y(0.1, 1.3));
  g.lineTo(X(2.2), Y(0.05, 0.98));
  g.stroke();
  // encosto de banco por trás do vidro
  g.fillStyle = 'rgba(10,10,12,0.55)';
  g.fillRect(X(1.62), Y(0.05, 1.18), 0.22 * S, 0.22 * S);
  g.fillRect(X(2.5), Y(0.05, 1.18), 0.22 * S, 0.22 * S);
  if (o.vende) {
    g.fillStyle = '#f7f3e6';
    g.fillRect(X(1.18), Y(0.05, 1.18), 0.42 * S, 0.24 * S);
    text(g, 'VENDE-SE', X(1.39), Y(0.05, 1.07), S * 0.07, '#c8241c');
    text(g, '9 9999-', X(1.39), Y(0.05, 1.0), S * 0.05, '#1d1a18', { weight: 700 });
  }
  // portas, maçanetas, friso, retrovisor
  g.strokeStyle = 'rgba(0,0,0,0.5)';
  g.lineWidth = 2;
  for (const x of [2.0, 3.02]) {
    g.beginPath();
    g.moveTo(X(x), Y(0, 0.88));
    g.lineTo(X(x - 0.04), Y(0, 0.34));
    g.stroke();
  }
  g.beginPath();
  g.moveTo(X(1.1), Y(0, 0.86));
  g.lineTo(X(1.12), Y(0, 0.36));
  g.stroke();
  g.fillStyle = '#2a2a2e';
  g.fillRect(X(1.55), Y(0, 0.74), 0.16 * S, 0.035 * S);
  g.fillRect(X(2.55), Y(0, 0.74), 0.16 * S, 0.035 * S);
  g.fillStyle = 'rgba(20,20,22,0.85)';
  g.fillRect(X(0.05), Y(0, 0.52), 3.9 * S, 0.06 * S);
  if (o.taxi) {
    g.fillStyle = '#2350a8';
    g.fillRect(X(0.04), Y(0, 0.6), 3.92 * S, 0.07 * S);
  }
  shape(g, () => pts(g, [[3.0, 0, 0.92], [3.14, -0.12, 0.97], [3.18, -0.12, 1.06], [3.04, 0, 1.05]]), { fill: tone(c, 0.8), lw: 2 });
  // faróis, lanternas e para-choques
  shape(g, frontRect(g, 3.86, 4.0, 0.62, 0.76), { fill: '#fff2b8', lw: 2 });
  shape(g, frontRect(g, 0.0, 0.1, 0.62, 0.78), { fill: '#d0281f', lw: 2 });
  shape(g, frontRect(g, 3.75, 4.02, 0.3, 0.44), { fill: '#2b2b2f', lw: 2 });
  shape(g, frontRect(g, -0.02, 0.28, 0.3, 0.44), { fill: '#2b2b2f', lw: 2 });
  // sujeira embaixo, ferrugem e amassado
  const dg = g.createLinearGradient(0, Y(0, 0.5), 0, Y(0, 0.28));
  dg.addColorStop(0, 'rgba(90,65,40,0)');
  dg.addColorStop(1, 'rgba(90,65,40,0.45)');
  g.save();
  g.beginPath();
  side();
  g.clip();
  g.fillStyle = dg;
  g.fillRect(X(0), Y(0, 0.5), 4 * S, 0.24 * S);
  for (let i = 0; i < 5; i++) {
    g.fillStyle = `rgba(120,60,25,${0.25 + r() * 0.3})`;
    g.beginPath();
    g.ellipse(X(0.3 + r() * 3.4), Y(0, 0.34 + r() * 0.12), 0.05 * S + r() * 6, 0.03 * S + r() * 3, 0, 0, Math.PI * 2);
    g.fill();
  }
  if (o.amassado) {
    const ag = g.createRadialGradient(X(0.55), Y(0, 0.62), 2, X(0.55), Y(0, 0.62), 0.32 * S);
    ag.addColorStop(0, 'rgba(0,0,0,0.35)');
    ag.addColorStop(0.6, 'rgba(255,255,255,0.12)');
    ag.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = ag;
    g.fillRect(X(0.15), Y(0, 0.95), 0.8 * S, 0.7 * S);
  }
  g.restore();
  rim(g, 0.2, 3.7, 0.88);
  // rodas
  g.fillStyle = '#0b0b0c';
  g.beginPath();
  g.arc(X(0.85), Y(0, 0.3), 0.4 * S, Math.PI, 0);
  g.arc(X(3.15), Y(0, 0.3), 0.4 * S, Math.PI, 0);
  g.fill();
  roda(g, 0.85, 0.32 - (o.furado ? 0.07 : 0), 0.32);
  roda(g, 3.15, 0.32, 0.32);
  if (o.furado) {
    g.fillStyle = '#0f0f10';
    g.beginPath();
    g.ellipse(X(0.85), Y(0, 0.04), 0.36 * S, 0.06 * S, 0, 0, Math.PI * 2);
    g.fill();
  }
}

function onibus(g, file) {
  const A = ART.onibus;
  const W = A.w;
  const D = A.d;
  const H = A.h;
  const faixa = file === 'azul' ? '#1f5fb0' : '#2a8a4a';
  const r = rng(file.length * 13);
  groundShadow(g, 0.05, W - 0.05, 0, D, 1.0, 0.5);
  // teto com o ar-condicionado e a escotilha
  shape(g, topRect(g, 0.08, W - 0.08, 0.05, D - 0.05, H), { fill: hgrad(g, 0, W, '#d9dade', '#aeb1b7'), tex: 0.3 });
  shape(g, () => pts(g, [[3.0, 0.6, H + 0.28], [5.6, 0.6, H + 0.28], [5.6, 1.9, H + 0.28], [3.0, 1.9, H + 0.28]]), { fill: '#c6c8cc', tex: 0.2 });
  shape(g, frontRect(g, 3.0, 5.6, H, H + 0.28, 0.6), { fill: vgrad(g, H, H + 0.28, '#b8bbc0', '#8d9096', 0.6) });
  for (let i = 0; i < 6; i++) {
    g.strokeStyle = 'rgba(0,0,0,0.25)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(X(3.2 + i * 0.4), Y(0.75, H + 0.28));
    g.lineTo(X(3.2 + i * 0.4), Y(1.75, H + 0.28));
    g.stroke();
  }
  shape(g, topRect(g, 1.2, 1.9, 0.8, 1.6, H + 0.04), { fill: '#9a9da3', lw: 2 });
  // lateral
  const body = () => {
    g.moveTo(X(0.05), Y(0, 0.4));
    g.lineTo(X(0.05), Y(0, H - 0.2));
    g.quadraticCurveTo(X(0.05), Y(0, H), X(0.3), Y(0, H));
    g.lineTo(X(W - 0.35), Y(0, H));
    g.quadraticCurveTo(X(W - 0.05), Y(0, H), X(W - 0.05), Y(0, H - 0.25));
    g.lineTo(X(W - 0.05), Y(0, 0.4));
    g.lineTo(X(7.25), Y(0, 0.4));
    g.arc(X(6.7), Y(0, 0.42), 0.6 * S, 0, Math.PI, true);
    g.lineTo(X(2.55), Y(0, 0.4));
    g.arc(X(2.0), Y(0, 0.42), 0.6 * S, 0, Math.PI, true);
    g.closePath();
  };
  shape(g, body, { fill: vgrad(g, 0.4, H, '#f4f1e8', '#cfcbc0'), tex: 0.35 });
  g.save();
  g.beginPath();
  body();
  g.clip();
  g.fillStyle = faixa;
  g.fillRect(X(0), Y(0, 1.25), W * S, 0.28 * S);
  g.beginPath();
  g.moveTo(X(4.8), Y(0, 0.4));
  g.lineTo(X(6.4), Y(0, 1.25));
  g.lineTo(X(6.9), Y(0, 1.25));
  g.lineTo(X(5.4), Y(0, 0.4));
  g.fill();
  g.fillStyle = tone(faixa, 0.6);
  g.fillRect(X(0), Y(0, 0.75), W * S, 0.35 * S);
  g.fillStyle = 'rgba(80,60,40,0.35)';
  g.fillRect(X(0), Y(0, 0.75), W * S, 0.35 * S);
  // escorridos de sujeira embaixo das janelas
  for (let i = 0; i < 18; i++) {
    const x = 0.3 + r() * (W - 0.6);
    const gr = g.createLinearGradient(0, Y(0, 1.5), 0, Y(0, 1.0));
    gr.addColorStop(0, 'rgba(60,45,30,0.35)');
    gr.addColorStop(1, 'rgba(60,45,30,0)');
    g.fillStyle = gr;
    g.fillRect(X(x), Y(0, 1.5), 0.04 * S + r() * 4, 0.5 * S);
  }
  g.restore();
  // janelas com colunas e reflexo
  for (let x = 0.35; x < 6.6; x += 1.1) {
    const x1 = Math.min(x + 0.95, 6.6);
    const wg = g.createLinearGradient(0, Y(0, 2.6), 0, Y(0, 1.6));
    wg.addColorStop(0, '#41525f');
    wg.addColorStop(1, '#151d25');
    shape(g, frontRect(g, x, x1, 1.6, 2.6), { fill: wg, lw: 2 });
    g.strokeStyle = 'rgba(220,235,245,0.28)';
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(X(x + 0.25), Y(0, 2.55));
    g.lineTo(X(x + 0.05), Y(0, 1.7));
    g.stroke();
    g.fillStyle = 'rgba(10,10,12,0.5)';
    g.fillRect(X(x + 0.3), Y(0, 1.95), 0.3 * S, 0.3 * S);
  }
  // porta da frente e letreiro lateral
  shape(g, frontRect(g, 7.35, 8.3, 0.45, 2.6), { fill: '#2c3843', lw: 2 });
  for (const [a, b] of [[7.42, 7.8], [7.86, 8.24]]) shape(g, frontRect(g, a, b, 0.55, 2.5), { fill: vgrad(g, 0.55, 2.5, '#4b5c69', '#1a232b'), lw: 2 });
  shape(g, frontRect(g, 6.7, 8.6, 2.66, 2.92), { fill: '#111113', lw: 2 });
  text(g, 'ORLA ⇄ MORRO', X(7.65), Y(0, 2.79), S * 0.17, '#ffb21a', { max: 1.8 * S });
  // para-choque, faróis, pichação
  shape(g, frontRect(g, 8.6, 8.75, 0.5, 0.75), { fill: '#fff2b8', lw: 2 });
  shape(g, frontRect(g, 0.05, 0.18, 0.55, 0.85), { fill: '#d0281f', lw: 2 });
  const pr = rng(91 + file.length);
  pixo(g, PIXOS[2], X(0.4), Y(0, 0.62), 0.42 * S, '#121014', pr);
  pixo(g, 'RIP', X(3.2), Y(0, 0.95), 0.18 * S, '#121014', pr);
  rim(g, 0.3, W - 0.4, H);
  // rodas
  g.fillStyle = '#0b0b0c';
  for (const x of [2.0, 6.7]) {
    g.beginPath();
    g.arc(X(x), Y(0, 0.42), 0.57 * S, Math.PI, 0);
    g.fill();
    roda(g, x, 0.46, 0.46, '#6f7277');
  }
}

function banca(g) {
  const A = ART.banca;
  const W = A.w;
  const D = A.d;
  const H = A.h;
  const verde = '#2f6b3a';
  const r = rng(5);
  groundShadow(g, 0, W, 0, D, 0.7, 0.45);
  // teto com aba
  shape(g, topRect(g, -0.18, W + 0.18, -0.2, D + 0.12, H + 0.14), { fill: hgrad(g, -0.2, W, '#3f8a4c', '#2b5f34'), tex: 0.35 });
  shape(g, frontRect(g, -0.18, W + 0.18, H, H + 0.14, -0.2), { fill: vgrad(g, H, H + 0.14, '#2d6237', '#1d4224', -0.2) });
  // corpo com chapas e frisos
  shape(g, frontRect(g, 0, W, 0, H), { fill: vgrad(g, 0, H, '#3a7a46', '#204a28'), tex: 0.4 });
  g.strokeStyle = 'rgba(0,0,0,0.25)';
  g.lineWidth = 2;
  for (let x = 0.2; x < W; x += 0.2) {
    g.beginPath();
    g.moveTo(X(x), Y(0, 0.05));
    g.lineTo(X(x), Y(0, 0.82));
    g.stroke();
  }
  // vitrine aberta com revistas penduradas
  shape(g, frontRect(g, 0.12, W - 0.12, 0.88, 2.0), { fill: '#1b1d1f' });
  const capas = ['#e5252f', '#ffd21f', '#3d8bff', '#f2efe8', '#ff7a1a', '#c04ad0', '#24b36a', '#111'];
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 6; i++) {
      const x0 = 0.18 + i * 0.35;
      const z1 = 1.95 - row * 0.36;
      const cc = capas[Math.floor(r() * capas.length)];
      shape(g, frontRect(g, x0, x0 + 0.3, z1 - 0.32, z1), { fill: vgrad(g, z1 - 0.32, z1, tone(cc, 1.1), tone(cc, 0.8)), lw: 1.5 });
      // título e foto da capa
      g.fillStyle = cc === '#f2efe8' || cc === '#ffd21f' ? '#1b1b1b' : '#fff';
      g.fillRect(X(x0 + 0.03), Y(0, z1 - 0.05), 0.24 * S, 0.04 * S);
      g.fillStyle = 'rgba(255,255,255,0.35)';
      g.fillRect(X(x0 + 0.06), Y(0, z1 - 0.11), 0.18 * S, 0.14 * S);
      g.fillStyle = 'rgba(0,0,0,0.3)';
      g.fillRect(X(x0 + 0.04), Y(0, z1 - 0.28), 0.2 * S, 0.025 * S);
    }
  }
  // balcão com jornais empilhados
  shape(g, topRect(g, 0.05, W - 0.05, -0.25, 0.05, 0.88), { fill: '#3f8a4c', lw: 2 });
  for (let i = 0; i < 4; i++) {
    const x0 = 0.2 + i * 0.52;
    shape(g, () => pts(g, [[x0, -0.2, 0.93], [x0 + 0.42, -0.2, 0.93], [x0 + 0.42, 0.0, 0.93], [x0, 0.0, 0.93]]), { fill: '#e9e6dc', lw: 1.5 });
    shape(g, frontRect(g, x0, x0 + 0.42, 0.88, 0.93, -0.2), { fill: '#cfcbc0', lw: 1.5 });
    g.fillStyle = 'rgba(30,30,30,0.6)';
    for (let k = 0; k < 3; k++) g.fillRect(X(x0 + 0.04), Y(-0.15 + k * 0.05, 0.93), 0.3 * S, 2);
  }
  // letreiro e cartazes colados na lateral de baixo
  shape(g, frontRect(g, 0.1, W - 0.1, 2.04, 2.28), { fill: '#141414', lw: 2 });
  text(g, 'BANCA', X(W / 2), Y(0, 2.16), S * 0.2, '#ffd21f', { sx: 1 });
  cartaz(g, X(0.12), Y(0, 0.8), 0.5 * S, 0.66 * S, 1, 0.3);
  cartaz(g, X(0.7), Y(0, 0.78), 0.5 * S, 0.66 * S, 1, 0.1);
  pixo(g, 'VIDA LOKA', X(1.3), Y(0, 0.25), 0.3 * S, '#0d0c0e', rng(9));
  contact(g, 0, W);
  rim(g, -0.18, W + 0.18, H + 0.14, -0.2);
}

function carrinho(g, kind) {
  const A = ART[kind];
  const W = A.w;
  const D = A.d;
  const milho = kind === 'milho';
  groundShadow(g, 0, W, 0, D, 0.5, 0.42);
  // guarda-chuva por último (fica por cima); primeiro o carrinho
  const z0 = 0.32;
  const z1 = milho ? 0.95 : 0.98;
  shape(g, topRect(g, 0, W, 0, D, z1), { fill: milho ? hgrad(g, 0, W, '#e7e9ec', '#a9adb3') : '#f4f7fa', tex: 0.2 });
  if (milho) {
    // panela grande com espigas e vapor
    const px0 = 0.32;
    const px1 = 1.08;
    shape(g, frontRect(g, px0, px1, z1, z1 + 0.38, 0.4), { fill: hgrad(g, px0, px1, '#c9ccd1', '#7d8187') });
    g.fillStyle = '#3a3c40';
    g.beginPath();
    g.ellipse(X(0.7), Y(0.4, z1 + 0.38), 0.38 * S, 0.12 * S, 0, 0, Math.PI * 2);
    g.fill();
    for (let i = 0; i < 4; i++) {
      g.save();
      g.translate(X(0.45 + i * 0.16), Y(0.4, z1 + 0.42));
      g.rotate(-0.3 + i * 0.2);
      g.fillStyle = '#f2c94c';
      g.beginPath();
      g.ellipse(0, -0.12 * S, 0.05 * S, 0.14 * S, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(180,130,30,0.5)';
      for (let k = 0; k < 5; k++) g.fillRect(-0.03 * S, -0.22 * S + k * 0.04 * S, 0.06 * S, 1.5);
      g.restore();
    }
    g.strokeStyle = 'rgba(255,255,255,0.45)';
    g.lineWidth = 5;
    g.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      g.beginPath();
      g.moveTo(X(0.5 + i * 0.2), Y(0.4, z1 + 0.5));
      g.bezierCurveTo(X(0.35 + i * 0.2), Y(0.4, z1 + 0.75), X(0.65 + i * 0.2), Y(0.4, z1 + 0.9), X(0.5 + i * 0.2), Y(0.4, z1 + 1.1));
      g.stroke();
    }
  } else {
    shape(g, topRect(g, 0.15, W - 0.15, 0.12, D - 0.12, z1 + 0.04), { fill: '#e2e8ee', lw: 2 });
  }
  // caixa do carrinho
  const fg = milho ? vgrad(g, z0, z1, '#f1f2f4', '#8f9399') : vgrad(g, z0, z1, '#ffffff', '#cfd6dd');
  shape(g, frontRect(g, 0, W, z0, z1), { fill: fg, tex: 0.25 });
  if (milho) {
    shape(g, frontRect(g, 0.12, W - 0.12, z0 + 0.12, z1 - 0.1), { fill: '#1f8a3c', lw: 2 });
    text(g, 'MILHO VERDE', X(W / 2), Y(0, (z0 + z1) / 2 + 0.03), S * 0.13, '#ffd21f', { max: (W - 0.3) * S });
    text(g, 'R$ 7', X(W / 2), Y(0, z0 + 0.18), S * 0.1, '#fff');
  } else {
    g.fillStyle = '#2a6fd0';
    g.fillRect(X(0), Y(0, z0 + 0.42), W * S, 0.18 * S);
    text(g, 'PICOLÉ', X(W / 2), Y(0, z0 + 0.33), S * 0.13, '#fff');
    g.fillStyle = '#e5252f';
    g.fillRect(X(0), Y(0, z0 + 0.14), W * S, 0.05 * S);
  }
  contact(g, 0.1, W - 0.1, 0.06);
  // alça e rodas
  g.strokeStyle = '#6f7277';
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(X(0), Y(0, z1 - 0.05));
  g.lineTo(X(-0.35), Y(0, z1 + 0.05));
  g.stroke();
  roda(g, 0.25, 0.2, 0.2);
  roda(g, W - 0.25, 0.2, 0.2);
  rim(g, 0.05, W - 0.05, z1);
  if (milho) guardaSol(g, W / 2, D / 2, 2.35, 0.95, '#1f9a44', '#ffd21f');
  else guardaSol(g, W / 2, D / 2, 2.2, 0.85, '#e5252f', '#f2efe8');
}

function banco(g, file) {
  const A = ART.banco;
  const W = A.w;
  const D = A.d;
  const wood = file === 'a' ? '#9a6a3e' : '#7a5232';
  groundShadow(g, 0, W, 0, D, 0.3, 0.38);
  // pés de concreto
  for (const x of [0.15, W - 0.4]) {
    shape(g, topRect(g, x, x + 0.25, 0.05, D - 0.05, 0.42), { fill: '#a8a49c', lw: 2 });
    shape(g, frontRect(g, x, x + 0.25, 0, 0.42, 0.05), { fill: vgrad(g, 0, 0.42, '#9a968e', '#6e6a63', 0.05), tex: 0.4, lw: 2 });
  }
  // encosto (atrás)
  for (let i = 0; i < 2; i++) {
    const z = 0.62 + i * 0.16;
    shape(g, frontRect(g, 0, W, z, z + 0.12, D - 0.06), { fill: vgrad(g, z, z + 0.12, tone(wood, 1.15), tone(wood, 0.8), D - 0.06), tex: 0.35, lw: 2 });
  }
  // assento (três ripas)
  for (let i = 0; i < 3; i++) {
    const y0 = 0.04 + i * 0.16;
    shape(g, topRect(g, 0, W, y0, y0 + 0.13, 0.45), { fill: hgrad(g, 0, W, tone(wood, 1.2), tone(wood, 0.95)), tex: 0.35, lw: 2 });
  }
  shape(g, frontRect(g, 0, W, 0.4, 0.45, 0.04), { fill: tone(wood, 0.7), lw: 2 });
  if (file === 'b') pixo(g, 'XIS', X(0.5), Y(D - 0.06, 0.66), 0.13 * S, '#111', rng(3));
  // chiclete grudado
  g.fillStyle = 'rgba(40,30,30,0.6)';
  for (let i = 0; i < 4; i++) g.fillRect(X(0.3 + i * 0.35), Y(0.1 + (i % 2) * 0.15, 0.45) - 2, 4, 3);
}

function lixeira(g, file) {
  const A = ART.lixeira;
  const W = A.w;
  const D = A.d;
  const r = rng(file === 'a' ? 4 : 8);
  groundShadow(g, 0.1, W - 0.1, 0.1, D - 0.1, 0.25, 0.4);
  shape(g, frontRect(g, W / 2 - 0.04, W / 2 + 0.04, 0, 0.45, D / 2), { fill: '#6a6c70', lw: 2 });
  const body = () => {
    g.moveTo(X(0.02), Y(0, 0.38));
    g.lineTo(X(W - 0.02), Y(0, 0.38));
    g.lineTo(X(W + 0.04), Y(0, 1.0));
    g.lineTo(X(-0.04), Y(0, 1.0));
    g.closePath();
  };
  shape(g, body, { fill: hgrad(g, -0.04, W + 0.04, '#ff9a3c', '#c75a12'), tex: 0.3 });
  g.fillStyle = 'rgba(0,0,0,0.25)';
  g.fillRect(X(0.06), Y(0, 0.92), (W - 0.12) * S, 0.03 * S);
  // boca com lixo transbordando
  g.fillStyle = '#20140c';
  g.beginPath();
  g.ellipse(X(W / 2), Y(D / 2, 1.0), (W / 2 + 0.04) * S, (D / 2) * S * K, 0, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = INK;
  g.lineWidth = LW;
  g.stroke();
  const cores = ['#f2efe8', '#c9b07a', '#3d8bff', '#202024', '#e5252f', '#9ad04a'];
  for (let i = 0; i < 9; i++) {
    g.fillStyle = cores[Math.floor(r() * cores.length)];
    g.beginPath();
    g.ellipse(X(0.06 + r() * (W - 0.12)), Y(0.1 + r() * 0.3, 1.02 + r() * 0.1), 0.05 * S + r() * 5, 0.04 * S + r() * 4, r() * 3, 0, Math.PI * 2);
    g.fill();
  }
  // garrafa PET saindo
  g.save();
  g.translate(X(W * 0.7), Y(0.25, 1.05));
  g.rotate(0.5);
  g.fillStyle = 'rgba(120,200,160,0.85)';
  g.fillRect(-0.03 * S, -0.22 * S, 0.06 * S, 0.22 * S);
  g.restore();
  // adesivo de disk-gás
  g.fillStyle = '#f2efe8';
  g.fillRect(X(0.08), Y(0, 0.75), 0.18 * S, 0.12 * S);
  text(g, 'GÁS', X(0.17), Y(0, 0.69), S * 0.06, '#c8241c');
  if (file === 'b') pixo(g, 'TMJ', X(0.15), Y(0, 0.55), 0.12 * S, '#111', rng(2));
  rim(g, 0, W, 1.0);
}

function orelhao(g, file) {
  const A = ART.orelhao;
  const W = A.w;
  const D = A.d;
  const cor = file === 'laranja' ? '#e8661a' : '#2268c8';
  groundShadow(g, 0.05, W - 0.05, 0.05, D - 0.05, 0.4, 0.38);
  shape(g, frontRect(g, W / 2 - 0.06, W / 2 + 0.06, 0, 1.3, D / 2), { fill: hgrad(g, 0, W, '#8d9096', '#55585d'), lw: 2 });
  const cx = X(W / 2);
  const cy = Y(D / 2, 1.72);
  const rx = 0.45 * S;
  const ry = 0.52 * S;
  // concha: parte de dentro escura, depois a casca com brilho
  g.fillStyle = '#16171a';
  g.beginPath();
  g.ellipse(cx, cy + 0.05 * S, rx * 0.86, ry * 0.85, 0, 0, Math.PI * 2);
  g.fill();
  const shell = () => {
    g.ellipse(cx, cy, rx, ry, 0, Math.PI * 0.92, Math.PI * 2.08);
    g.quadraticCurveTo(cx + rx * 0.9, cy + ry * 0.55, cx + rx * 0.62, cy + ry * 0.7);
    g.lineTo(cx - rx * 0.62, cy + ry * 0.7);
    g.quadraticCurveTo(cx - rx * 0.9, cy + ry * 0.55, cx - rx, cy + ry * 0.2);
    g.closePath();
  };
  g.save();
  g.beginPath();
  shell();
  g.beginPath();
  g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  g.ellipse(cx, cy + 0.12 * S, rx * 0.72, ry * 0.62, 0, 0, Math.PI * 2, true);
  const sg = g.createRadialGradient(cx - rx * 0.4, cy - ry * 0.5, 4, cx, cy, rx * 1.2);
  sg.addColorStop(0, tone(cor, 1.35));
  sg.addColorStop(0.6, cor);
  sg.addColorStop(1, tone(cor, 0.6));
  g.fillStyle = sg;
  g.fill('evenodd');
  g.strokeStyle = INK;
  g.lineWidth = LW;
  g.stroke();
  g.restore();
  // aparelho
  shape(g, frontRect(g, W / 2 - 0.13, W / 2 + 0.13, 1.42, 1.78, D / 2 - 0.1), { fill: vgrad(g, 1.42, 1.78, '#9a9ca2', '#5d6066', D / 2 - 0.1), lw: 2 });
  g.fillStyle = '#16171a';
  g.fillRect(X(W / 2 - 0.09), Y(D / 2 - 0.1, 1.76), 0.06 * S, 0.3 * S);
  g.fillStyle = '#d8dadf';
  for (let i = 0; i < 9; i++) g.fillRect(X(W / 2 + 0.0 + (i % 3) * 0.035), Y(D / 2 - 0.1, 1.72 - Math.floor(i / 3) * 0.05), 3, 3);
  pixo(g, 'FÉ', cx - rx * 0.6, cy - ry * 0.4, 0.16 * S, '#101012', rng(5));
  g.fillStyle = '#f2efe8';
  g.fillRect(cx + rx * 0.2, cy - ry * 0.6, 0.14 * S, 0.1 * S);
}

function muro(g, file) {
  const A = ART.muro;
  const W = A.w;
  const D = A.d;
  const H = A.h;
  const r = rng(file.charCodeAt(0) * 17);
  const base = file === 'a' ? '#d3cbbc' : file === 'b' ? '#c9c0ae' : '#bcb6aa';
  groundShadow(g, 0, W, 0, D, 0.9, 0.42);
  // topo com caco de vidro
  shape(g, topRect(g, 0, W, 0, D, H), { fill: '#9e978b', tex: 0.4, lw: 2 });
  for (let x = 0.08; x < W - 0.05; x += 0.14 + r() * 0.08) {
    const y = 0.08 + r() * (D - 0.16);
    g.fillStyle = r() < 0.5 ? 'rgba(110,190,150,0.95)' : 'rgba(220,240,230,0.95)';
    g.beginPath();
    g.moveTo(X(x), Y(y, H));
    g.lineTo(X(x + 0.04), Y(y, H + 0.12 + r() * 0.08));
    g.lineTo(X(x + 0.09), Y(y, H));
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(20,40,30,0.6)';
    g.lineWidth = 1;
    g.stroke();
  }
  // face do muro: reboco com manchas, tijolo aparente e mofo
  shape(g, frontRect(g, 0, W, 0, H), { fill: vgrad(g, 0, H, tone(base, 1.08), tone(base, 0.8)), tex: 0.55 });
  g.save();
  g.beginPath();
  frontRect(g, 0, W, 0, H)();
  g.clip();
  // tijolo aparente onde o reboco caiu
  const bx = 2.6 + r() * 0.8;
  const bz = 0.9 + r() * 0.5;
  g.fillStyle = '#8f4a30';
  g.beginPath();
  g.ellipse(X(bx), Y(0, bz), 0.5 * S, 0.32 * S, 0.2, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = 'rgba(60,25,15,0.6)';
  g.lineWidth = 2;
  for (let z = bz - 0.3; z < bz + 0.3; z += 0.1) {
    g.beginPath();
    g.moveTo(X(bx - 0.5), Y(0, z));
    g.lineTo(X(bx + 0.5), Y(0, z));
    g.stroke();
    for (let x = bx - 0.5 + ((z * 10) % 2) * 0.11; x < bx + 0.5; x += 0.22) {
      g.beginPath();
      g.moveTo(X(x), Y(0, z));
      g.lineTo(X(x), Y(0, z + 0.1));
      g.stroke();
    }
  }
  const mofo = g.createLinearGradient(0, Y(0, 0.6), 0, Y(0, 0));
  mofo.addColorStop(0, 'rgba(50,60,35,0)');
  mofo.addColorStop(1, 'rgba(50,60,35,0.45)');
  g.fillStyle = mofo;
  g.fillRect(X(0), Y(0, 0.6), W * S, 0.6 * S);
  // escorridos de chuva
  for (let i = 0; i < 14; i++) {
    const x = r() * W;
    const gr = g.createLinearGradient(0, Y(0, H), 0, Y(0, H - 0.8 - r() * 0.6));
    gr.addColorStop(0, 'rgba(70,55,40,0.3)');
    gr.addColorStop(1, 'rgba(70,55,40,0)');
    g.fillStyle = gr;
    g.fillRect(X(x), Y(0, H), 0.03 * S + r() * 4, 1.4 * S);
  }
  // rachadura
  g.strokeStyle = 'rgba(40,30,25,0.6)';
  g.lineWidth = 2;
  g.beginPath();
  let cx = 0.7;
  let cz = H;
  g.moveTo(X(cx), Y(0, cz));
  for (let i = 0; i < 6; i++) {
    cx += (r() - 0.4) * 0.25;
    cz -= 0.2 + r() * 0.15;
    g.lineTo(X(cx), Y(0, cz));
  }
  g.stroke();
  // cartazes e pichação
  cartaz(g, X(0.2), Y(0, 1.95), 0.6 * S, 0.82 * S, file.charCodeAt(0), 0.25);
  if (file === 'b') bandeira(g, X(1.4), Y(0, 2.1), 1.3 * S, 0.9 * S);
  if (file === 'c') bomb(g, 'NÓS', X(1.15), Y(0, 0.95), 0.62 * S, '#ff4fa0', '#ffd21f');
  const words = [PIXOS[Math.floor(r() * PIXOS.length)], PIXOS[Math.floor(r() * PIXOS.length)], PIXOS[Math.floor(r() * PIXOS.length)]];
  pixo(g, words[0], X(0.95), Y(0, 0.55), 0.5 * S, '#121014', r);
  pixo(g, words[1], X(2.7), Y(0, 1.95), 0.42 * S, '#121014', r);
  if (file !== 'b') pixo(g, words[2], X(1.6), Y(0, 2.15), 0.34 * S, '#b8221a', r);
  g.restore();
  contact(g, 0, W);
  rim(g, 0, W, H);
}

function tapume(g, file) {
  const A = ART.tapume;
  const W = A.w;
  const D = A.d;
  const H = A.h;
  const r = rng(file.charCodeAt(0) * 29);
  const madeira = file === 'a';
  groundShadow(g, 0, W, 0, D, 0.8, 0.4);
  shape(g, topRect(g, 0, W, 0, D, H), { fill: madeira ? '#a88a5c' : '#2c5f4e', lw: 2 });
  shape(g, frontRect(g, 0, W, 0, H), { fill: madeira ? vgrad(g, 0, H, '#c7a774', '#8f7146') : vgrad(g, 0, H, '#3a7a64', '#22493b'), tex: 0.5 });
  g.save();
  g.beginPath();
  frontRect(g, 0, W, 0, H)();
  g.clip();
  // emendas das chapas e veio da madeira
  g.strokeStyle = 'rgba(0,0,0,0.35)';
  g.lineWidth = 2;
  for (let x = 1.15; x < W; x += 1.15) {
    g.beginPath();
    g.moveTo(X(x), Y(0, H));
    g.lineTo(X(x), Y(0, 0));
    g.stroke();
  }
  if (madeira) {
    g.strokeStyle = 'rgba(90,60,30,0.25)';
    g.lineWidth = 1.5;
    for (let i = 0; i < 26; i++) {
      const z = r() * H;
      g.beginPath();
      g.moveTo(X(0), Y(0, z));
      g.bezierCurveTo(X(W * 0.3), Y(0, z + 0.05), X(W * 0.6), Y(0, z - 0.05), X(W), Y(0, z + 0.02));
      g.stroke();
    }
  }
  // propaganda em massa: o mesmo candidato colado em fila, outros por cima, rasgados
  const c = Math.floor(r() * CANDIDATOS.length);
  for (let i = 0; i < 6; i++) cartaz(g, X(0.12 + i * 0.74), Y(0, 2.05), 0.66 * S, 0.88 * S, i < 4 ? c : c + i, r() * 0.5);
  for (let i = 0; i < 3; i++) cartaz(g, X(0.5 + i * 1.4), Y(0, 1.12), 0.62 * S, 0.82 * S, c + 2, 0.4 + r() * 0.4);
  // placa de obra parada
  shape(g, frontRect(g, 2.9, 4.4, 0.18, 0.62), { fill: '#f4f1e8', lw: 2 });
  text(g, 'OBRA PARADA', X(3.65), Y(0, 0.5), S * 0.15, '#c8241c', { max: 1.4 * S });
  text(g, 'PREVISÃO: 1998', X(3.65), Y(0, 0.3), S * 0.09, '#1d1a18', { weight: 700 });
  pixo(g, PIXOS[Math.floor(r() * PIXOS.length)], X(0.3), Y(0, 0.38), 0.46 * S, '#101012', r);
  pixo(g, PIXOS[Math.floor(r() * PIXOS.length)], X(1.9), Y(0, 1.4), 0.38 * S, '#b8221a', r);
  g.restore();
  contact(g, 0, W);
  rim(g, 0, W, H);
}

const BARRACAS = {
  barraca_acai: { toldo: ['#5a1f7a', '#9a4ac8'], balcao: '#3a1450', tampo: '#7a3a9a' },
  barraca_pastelaria: { toldo: ['#e8b020', '#c8342b'], balcao: '#8a5a22', tampo: '#d9a040' },
  barraca_boteco: { toldo: ['#c8342b', '#f1ece0'], balcao: '#6e4a2c', tampo: '#9a6d43' },
};

function barraca(g, kind) {
  const A = ART[kind];
  const W = A.w;
  const D = A.d;
  const L = BARRACAS[kind];
  const r = rng(kind.length * 3);
  const tz = 2.55; // altura do toldo
  groundShadow(g, -0.4, W + 0.4, -0.3, D + 0.4, 0.8, 0.42);
  // estacas de trás
  for (const x of [-0.35, W + 0.35]) shape(g, frontRect(g, x - 0.03, x + 0.03, 0, tz, D + 0.3), { fill: '#7c7f86', lw: 1.5 });
  // fundo da barraca (lona) atrás do balcão
  shape(g, frontRect(g, -0.35, W + 0.35, 1.1, tz, D + 0.3), { fill: vgrad(g, 1.1, tz, tone(L.toldo[0], 0.55), tone(L.toldo[0], 0.35), D + 0.3), tex: 0.4, lw: 2 });
  // em cima do balcão: o produto de cada barraca
  shape(g, topRect(g, 0, W, 0, D, 1.1), { fill: hgrad(g, 0, W, tone(L.tampo, 1.15), tone(L.tampo, 0.9)), tex: 0.3 });
  if (kind === 'barraca_acai') {
    for (let i = 0; i < 4; i++) {
      const x0 = 0.3 + i * 0.75;
      shape(g, frontRect(g, x0, x0 + 0.45, 1.1, 1.32, 0.6), { fill: '#4a1a5e', lw: 2 });
      g.fillStyle = '#6a2a86';
      g.beginPath();
      g.ellipse(X(x0 + 0.225), Y(0.6, 1.32), 0.225 * S, 0.08 * S, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = i % 2 ? '#e8c890' : '#f2e27a';
      for (let k = 0; k < 6; k++) g.fillRect(X(x0 + 0.06 + r() * 0.32), Y(0.6, 1.33) - r() * 6, 5, 4);
    }
    // copos e granola
    for (let i = 0; i < 3; i++) shape(g, frontRect(g, 0.2 + i * 0.18, 0.34 + i * 0.18, 1.1, 1.34, 0.15), { fill: '#f2efe8', lw: 1.5 });
  } else if (kind === 'barraca_pastelaria') {
    // vitrine de vidro com pastéis e o moedor de cana
    shape(g, frontRect(g, 0.2, 2.1, 1.1, 1.52, 0.35), { fill: 'rgba(200,225,235,0.45)', lw: 2 });
    for (let i = 0; i < 6; i++) {
      g.fillStyle = '#e8a83a';
      g.beginPath();
      g.arc(X(0.4 + i * 0.3), Y(0.35, 1.18), 0.12 * S, Math.PI, 0);
      g.fill();
      g.strokeStyle = 'rgba(130,70,20,0.7)';
      g.lineWidth = 2;
      g.stroke();
    }
    shape(g, topRect(g, 0.2, 2.1, 0.35, 0.85, 1.52), { fill: 'rgba(220,240,245,0.35)', lw: 1.5 });
    shape(g, frontRect(g, 2.45, 3.2, 1.1, 1.75, 0.5), { fill: vgrad(g, 1.1, 1.75, '#c9ccd1', '#7d8187', 0.5), lw: 2 });
    roda(g, 2.82, 1.45, 0.18, '#a0a3a8');
    for (let i = 0; i < 4; i++) {
      g.strokeStyle = '#7aa83a';
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(X(2.55 + i * 0.12), Y(0.7, 1.75));
      g.lineTo(X(2.4 + i * 0.14), Y(0.9, 2.35));
      g.stroke();
    }
  } else {
    // garrafas sem rótulo, copos americanos e o tira-gosto
    for (let i = 0; i < 9; i++) {
      const x = 0.2 + i * 0.12;
      const cc = i % 3 === 0 ? '#7a4a1a' : i % 3 === 1 ? '#3f7a3a' : '#c9c9cc';
      shape(g, frontRect(g, x, x + 0.08, 1.1, 1.42, 0.7), { fill: vgrad(g, 1.1, 1.42, tone(cc, 1.3), tone(cc, 0.7), 0.7), lw: 1.5 });
      shape(g, frontRect(g, x + 0.025, x + 0.055, 1.42, 1.52, 0.7), { fill: cc, lw: 1 });
    }
    for (let i = 0; i < 5; i++) shape(g, frontRect(g, 1.7 + i * 0.16, 1.8 + i * 0.16, 1.1, 1.24, 0.2), { fill: 'rgba(240,220,150,0.8)', lw: 1.5 });
    g.fillStyle = '#c96a2a';
    g.beginPath();
    g.ellipse(X(2.75), Y(0.5, 1.14), 0.3 * S, 0.1 * S, 0, 0, Math.PI * 2);
    g.fill();
    for (let i = 0; i < 6; i++) {
      g.fillStyle = '#e8b04a';
      g.beginPath();
      g.arc(X(2.55 + r() * 0.4), Y(0.5, 1.17), 0.04 * S, 0, Math.PI * 2);
      g.fill();
    }
  }
  // frente do balcão
  shape(g, frontRect(g, 0, W, 0, 1.1), { fill: vgrad(g, 0, 1.1, tone(L.balcao, 1.2), tone(L.balcao, 0.7)), tex: 0.45 });
  g.save();
  g.beginPath();
  frontRect(g, 0, W, 0, 1.1)();
  g.clip();
  if (kind === 'barraca_acai') {
    g.fillStyle = '#7a2fa0';
    g.fillRect(X(0.1), Y(0, 0.85), (W - 0.2) * S, 0.5 * S);
    for (let i = 0; i < 3; i++) {
      g.fillStyle = '#4a1a5e';
      g.beginPath();
      g.ellipse(X(0.6 + i * 1.1), Y(0, 0.6), 0.32 * S, 0.12 * S, 0, 0, Math.PI);
      g.fill();
      g.fillStyle = '#f2e27a';
      g.beginPath();
      g.arc(X(0.5 + i * 1.1), Y(0, 0.64), 0.07 * S, 0, Math.PI * 2);
      g.fill();
    }
    text(g, '300 ML · 500 ML · 1 L', X(W / 2), Y(0, 0.22), S * 0.12, '#f2e6ff', { max: (W - 0.3) * S });
  } else if (kind === 'barraca_pastelaria') {
    shape(g, frontRect(g, 0.15, 1.9, 0.25, 0.95), { fill: '#1b1d1f', lw: 2 });
    const itens = ['CARNE ........ 9', 'QUEIJO ....... 9', 'PIZZA ....... 10', 'CALDO DE CANA  6'];
    itens.forEach((s, i) => text(g, s, X(1.03), Y(0, 0.86 - i * 0.16), S * 0.085, '#f2efe8', { weight: 700, max: 1.6 * S }));
    cartaz(g, X(2.2), Y(0, 0.98), 0.55 * S, 0.74 * S, 4, 0.2);
  } else {
    for (let i = 0; i < 4; i++) {
      shape(g, frontRect(g, 0.3 + i * 0.75, 0.75 + i * 0.75, 0.15, 0.6), { fill: '#e8b020', lw: 2 });
      g.fillStyle = '#5a3d10';
      for (let k = 0; k < 3; k++) g.fillRect(X(0.36 + i * 0.75 + k * 0.13), Y(0, 0.5), 0.08 * S, 0.08 * S);
    }
    pixo(g, 'BAR', X(0.3), Y(0, 0.98), 0.24 * S, '#121014', r);
  }
  g.restore();
  contact(g, 0, W);
  rim(g, 0, W, 1.1);
  // estacas da frente
  for (const x of [-0.35, W + 0.35]) shape(g, frontRect(g, x - 0.035, x + 0.035, 0, tz, -0.3), { fill: hgrad(g, x - 0.04, x + 0.04, '#a3a6ad', '#5f6268'), lw: 1.5 });
  // toldo listrado: tampo inclinado e a franja de babado na frente
  const tw = W + 0.9;
  const n = 9;
  for (let i = 0; i < n; i++) {
    const x0 = -0.45 + (tw * i) / n;
    const x1 = -0.45 + (tw * (i + 1)) / n;
    const c = L.toldo[i % 2];
    shape(g, () => pts(g, [[x0, -0.35, tz], [x1, -0.35, tz], [x1, D + 0.35, tz + 0.35], [x0, D + 0.35, tz + 0.35]]), {
      fill: vgrad(g, tz, tz + 0.35 + (D + 0.7) * K, tone(c, 1.15), tone(c, 0.9), -0.35), stroke: false,
    });
  }
  shape(g, () => pts(g, [[-0.45, -0.35, tz], [W + 0.45, -0.35, tz], [W + 0.45, D + 0.35, tz + 0.35], [-0.45, D + 0.35, tz + 0.35]]), { fill: 'rgba(0,0,0,0)', tex: 0 });
  // babado
  for (let i = 0; i < n; i++) {
    const x0 = -0.45 + (tw * i) / n;
    const x1 = -0.45 + (tw * (i + 1)) / n;
    const c = L.toldo[i % 2];
    g.fillStyle = tone(c, 0.85);
    g.beginPath();
    g.moveTo(X(x0), Y(-0.35, tz));
    g.lineTo(X(x1), Y(-0.35, tz));
    g.lineTo(X(x1), Y(-0.35, tz - 0.2));
    g.quadraticCurveTo(X((x0 + x1) / 2), Y(-0.35, tz - 0.36), X(x0), Y(-0.35, tz - 0.2));
    g.closePath();
    g.fill();
    g.strokeStyle = INK;
    g.lineWidth = 2;
    g.stroke();
  }
  // placa do letreiro em branco (o jogo escreve o nome)
  shape(g, frontRect(g, W / 2 - 1.0, W / 2 + 1.0, tz + 0.02, tz + 0.42, -0.36), { fill: '#141113', lw: 2 });
}

const PAINT = {
  carro, onibus, banca, banco, lixeira, orelhao, muro, tapume,
  milho: (g) => carrinho(g, 'milho'),
  picole: (g) => carrinho(g, 'picole'),
  barraca_acai: (g) => barraca(g, 'barraca_acai'),
  barraca_pastelaria: (g) => barraca(g, 'barraca_pastelaria'),
  barraca_boteco: (g) => barraca(g, 'barraca_boteco'),
};

/** Pinta um objeto e devolve o canvas (fundo transparente, origem conforme ART). */
export function paint(kind, file) {
  const A = ART[kind];
  const c = document.createElement('canvas');
  c.width = Math.round((A.w + A.padX * 2) * S);
  c.height = Math.round((A.top + A.bot) * S);
  const g = c.getContext('2d');
  g.translate(A.padX * S, A.top * S);
  g.lineJoin = 'round';
  PAINT[kind](g, file);
  return c;
}

/** Todos os objetos: [{ kind, file, canvas }]. */
export function paintAll() {
  const out = [];
  for (const kind of Object.keys(ART)) for (const file of ART[kind].files) out.push({ kind, file, canvas: paint(kind, file) });
  return out;
}
