// Desenho da regra da carreira (D39): a obra do Especulador, o tapume da escadaria (arte de tapume
// inteira, só na escala) e o holofote do helicóptero da TV sobre o covil aberto, que é a pista no lugar
// da seta. Quando o covil está fora da tela, só a claridade do holofote aparece na beira, sem seta nem texto.
import { CARREIRA } from './config.js';
import { images } from './sprites.js';

const a = { x: 0, y: 0 };
const b = { x: 0, y: 0 };
const TAPUME_H = 2.2; // m

/** Fila de painéis de tapume em pé, de frente para a câmera, ao longo de y fixo (de x0 a x1). */
function tapumes(ctx, cam, ppu, x0, x1, y, alpha = 1, drop = 0) {
  const im = images.cen_tapume_a;
  const h = TAPUME_H * ppu;
  cam.toScreen(x0, y, a);
  cam.toScreen(x1, y, b);
  if (!im) {
    ctx.fillStyle = `rgba(46,94,58,${alpha})`;
    ctx.fillRect(a.x, a.y - h + drop, b.x - a.x, h);
    return;
  }
  const w = (im.width / im.height) * h;
  const n = Math.max(1, Math.round((b.x - a.x) / w));
  const tot = n * w;
  const sx = (a.x + b.x) / 2 - tot / 2;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(sx, a.y - 2 + drop, tot, 4);
  for (let i = 0; i < n; i++) ctx.drawImage(im, sx + i * w, a.y - h + drop, w, h);
  ctx.globalAlpha = 1;
}

/** Chão da obra (terra batida) e o entulho: antes dos personagens. */
export function drawObraChao(ctx, w, cam, ppu) {
  const o = w.obra;
  if (!o) return;
  ctx.beginPath();
  for (const [x, y] of [[o.x0, o.y0], [o.x1, o.y0], [o.x1, o.y1], [o.x0, o.y1]]) {
    cam.toScreen(x, y, a);
    if (x === o.x0 && y === o.y0) ctx.moveTo(a.x, a.y);
    else ctx.lineTo(a.x, a.y);
  }
  ctx.closePath();
  ctx.fillStyle = '#6a5a47';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

/** Tapume do fundo (cai com o chefão) e entulho dentro da obra (atrás de quem estiver dentro). */
export function drawObraFundo(ctx, w, cam, ppu, t) {
  const o = w.obra;
  let alpha = 1;
  let drop = 0;
  if (w.obraFundoT !== undefined) {
    const k = (t - w.obraFundoT) / CARREIRA.portaCaiS;
    alpha = Math.max(0, 1 - k);
    drop = Math.min(1, k) ** 2 * 0.9 * ppu;
  }
  if (alpha > 0) tapumes(ctx, cam, ppu, o.x0, o.x1, o.y0 + 0.2, alpha, drop);
  const im = images.cen_entulho_a;
  if (!im) return;
  for (const [fx, fy, s] of [[0.22, 0.35, 1.5], [0.7, 0.5, 1.9], [0.45, 0.78, 1.2]]) {
    cam.toScreen(o.x0 + (o.x1 - o.x0) * fx, o.y0 + (o.y1 - o.y0) * fy, a);
    const h = s * ppu;
    ctx.drawImage(im, a.x - h / 2, a.y - h * 0.8, h, h);
  }
}

/** Tapume da frente da obra; cai (desce e some na poeira) quando o chefão sai. */
export function drawObraFrente(ctx, w, cam, ppu, t) {
  const o = w.obra;
  let alpha = 1;
  let drop = 0;
  if (w.obraAbertaT !== undefined) {
    const k = (t - w.obraAbertaT) / CARREIRA.portaCaiS;
    if (k >= 1) return;
    alpha = 1 - k;
    drop = k * k * 0.9 * ppu;
  }
  tapumes(ctx, cam, ppu, o.x0, o.x1, o.y1, alpha, drop);
}

/** Tapume que fecha a escadaria do pé do morro: sem texto (o jogador não sabe o que tem atrás). */
export function drawPortaEscadaria(ctx, w, cam, ppu, t) {
  const g = w.gate;
  let alpha = 1;
  let drop = 0;
  if (w.gateOpen) {
    if (w.portaT === undefined) return;
    const k = (t - w.portaT) / CARREIRA.portaCaiS;
    if (k >= 1) return;
    alpha = 1 - k;
    drop = k * k * 0.9 * ppu;
  }
  tapumes(ctx, cam, ppu, g.x0 - 0.3, g.x1 + 0.3, w.orlaTop + 0.3, alpha, drop);
}

/** Onde está o holofote agora: circulando o covil aberto. */
function holofote(game, out) {
  const C = game.covil;
  const H = CARREIRA.heli;
  const ang = (game.t / H.voltaS) * Math.PI * 2;
  out.x = C.x + Math.cos(ang) * H.raioM;
  out.y = C.y + Math.sin(ang) * H.raioM * 0.6;
  return out;
}

const heliOn = (game) => game.covil && game.covil.aberto && !game.covil.saiu && !game.over;
const spot = { x: 0, y: 0 };

/** Mancha de luz do holofote no chão (antes dos personagens, para eles ficarem iluminados por cima). */
export function drawHolofoteChao(ctx, game, cam, ppu, t) {
  if (!heliOn(game)) return;
  holofote(game, spot);
  cam.toScreen(spot.x, spot.y, a);
  if (a.x < -200 || a.x > cam.viewW + 200 || a.y < -200 || a.y > cam.viewH + 200) return;
  const R = 2.6 * ppu;
  const g = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, R);
  g.addColorStop(0, 'rgba(255,248,214,0.55)');
  g.addColorStop(0.7, 'rgba(255,240,190,0.22)');
  g.addColorStop(1, 'rgba(255,240,190,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(a.x, a.y, R, R * cam.k, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Facho de luz descendo do helicóptero (acima da tela) até a mancha; com o covil fora da tela,
 * só a claridade na beira, do lado dele, pulsando devagar.
 */
export function drawHolofoteCeu(ctx, game, cam, ppu, t) {
  if (!heliOn(game)) return;
  holofote(game, spot);
  cam.toScreen(spot.x, spot.y, a);
  const top = cam.playTop + 125; // abaixo do plantão da TV, que cobre o alto da tela
  const bot = cam.playBottom - 30;
  const visivel = a.x > -40 && a.x < cam.viewW + 40 && a.y > top && a.y < bot + 60;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  if (visivel) {
    const hx = a.x + (cam.viewW / 2 - a.x) * 0.25;
    const hy = top - 20;
    const R = 2.4 * ppu;
    const g = ctx.createLinearGradient(hx, hy, a.x, a.y);
    g.addColorStop(0, 'rgba(255,250,225,0.32)');
    g.addColorStop(1, 'rgba(255,250,225,0.06)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(hx - 6, hy);
    ctx.lineTo(hx + 6, hy);
    ctx.lineTo(a.x + R, a.y);
    ctx.lineTo(a.x - R, a.y);
    ctx.closePath();
    ctx.fill();
  } else {
    // covil fora da tela: o facho do helicóptero entra pela beira, do lado dele, varrendo devagar
    const cx = cam.viewW / 2;
    const cy = (top + bot) / 2;
    const dx = a.x - cx;
    const dy = a.y - cy;
    const s = Math.min((cam.viewW / 2) / Math.abs(dx || 1e-6), ((bot - top) / 2) / Math.abs(dy || 1e-6));
    const ex = cx + dx * s;
    const ey = cy + dy * s;
    const base = Math.atan2(-dy, -dx); // para dentro da tela
    const ang = base + Math.sin(t * 0.9) * 0.38;
    const L = Math.min(cam.viewW, bot - top) * 0.62;
    const W = L * 0.2;
    const tx = ex + Math.cos(ang) * L;
    const ty = ey + Math.sin(ang) * L;
    const g = ctx.createLinearGradient(ex, ey, tx, ty);
    g.addColorStop(0, 'rgba(255,248,220,0.42)');
    g.addColorStop(0.6, 'rgba(255,244,205,0.14)');
    g.addColorStop(1, 'rgba(255,244,205,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(ex - Math.sin(ang) * 6, ey + Math.cos(ang) * 6);
    ctx.lineTo(ex + Math.sin(ang) * 6, ey - Math.cos(ang) * 6);
    ctx.lineTo(tx + Math.sin(ang) * W, ty - Math.cos(ang) * W);
    ctx.lineTo(tx - Math.sin(ang) * W, ty + Math.cos(ang) * W);
    ctx.closePath();
    ctx.fill();
    // e a claridade na beira, de onde ele vem
    const R = 120;
    const rg = ctx.createRadialGradient(ex, ey, 0, ex, ey, R);
    rg.addColorStop(0, 'rgba(255,246,210,0.45)');
    rg.addColorStop(1, 'rgba(255,246,210,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(ex - R, ey - R, R * 2, R * 2);
  }
  ctx.restore();
}
