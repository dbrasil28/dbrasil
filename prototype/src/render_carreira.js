// Desenho da regra da carreira (D39): a obra do Especulador, o tapume da escadaria (arte de tapume
// inteira, só na escala) e o holofote do helicóptero da TV sobre o covil aberto, que é a pista no lugar
// da seta. Quando o covil está fora da tela, só a claridade do holofote aparece na beira, sem seta nem texto.
import { CARREIRA, ACHADOS } from './config.js';
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

// ---------- achados (D40) ----------

/** Brilho de achado escondido: uma estrelinha de quatro pontas piscando devagar. */
function brilho(ctx, x, y, s, t, seed) {
  const k = 0.5 + 0.5 * Math.sin(t * 3.1 + seed);
  if (k < 0.25) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = k;
  ctx.fillStyle = '#fff6c8';
  ctx.beginPath();
  const r = s * (0.6 + 0.4 * k);
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r * 0.35, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r * 0.35, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
  ctx.restore();
}

/**
 * Achado no mapa: isopor (a arte do isopor), cofre (a mala do político com brilho dourado, até chegar a
 * arte do cofre) e a relíquia (a bola, no alto da torre). Enterrado: só o montinho de areia e o brilho.
 */
export function drawAchado(ctx, game, a, pt, ppu, t, playerPx) {
  if (a.aberto) return;
  const p = game.player;
  const longe = Math.hypot(p.x - a.x, p.y - a.y) > ACHADOS.brilhoM;
  const seed = a.x * 3.7 + a.y;
  if (a.cavar) {
    // montinho de areia mexida
    ctx.fillStyle = 'rgba(120,96,60,0.45)';
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y, 0.55 * ppu, 0.55 * ppu * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(230,206,160,0.7)';
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y - 0.05 * ppu, 0.35 * ppu, 0.18 * ppu, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!longe) brilho(ctx, pt.x, pt.y - 0.25 * ppu, 0.35 * ppu, t, seed);
    if (a.prog > 0) {
      // cavando: anel enchendo
      ctx.strokeStyle = '#ffd21f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y - playerPx * 1.2, 0.4 * ppu, -Math.PI / 2, -Math.PI / 2 + (a.prog / ACHADOS.cavarS) * Math.PI * 2);
      ctx.stroke();
    }
    return;
  }
  if (a.kind === 'reliquia') {
    drawBola(ctx, pt.x, pt.y, 0.3 * ppu, t * 0.6, 0.15 * ppu);
    if (!longe) brilho(ctx, pt.x + 0.2 * ppu, pt.y - 0.75 * ppu, 0.45 * ppu, t, seed);
    return;
  }
  const im = a.kind === 'isopor' ? images.cen_isopor_a : images.w_maleta;
  const h = (a.kind === 'isopor' ? 0.8 : 0.7) * ppu;
  // brilho dourado no chão: diferencia o achado dos isopores de enfeite da praia
  const pulse = 0.75 + 0.25 * Math.sin(t * 2.4 + seed);
  const g = ctx.createRadialGradient(pt.x, pt.y - h * 0.3, 0, pt.x, pt.y - h * 0.3, h * 1.3);
  g.addColorStop(0, `rgba(255,214,60,${(a.kind === 'cofre' ? 0.55 : 0.35) * pulse})`);
  g.addColorStop(1, 'rgba(255,214,60,0)');
  ctx.fillStyle = g;
  ctx.fillRect(pt.x - h * 1.3, pt.y - h * 1.6, h * 2.6, h * 2.6);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(pt.x, pt.y, h * 0.55, h * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  if (im) {
    const w = (im.width / im.height) * h;
    ctx.drawImage(im, pt.x - w / 2, pt.y - h, w, h);
  }
  if (!longe) brilho(ctx, pt.x + h * 0.3, pt.y - h * 1.1, 0.35 * ppu, t, seed);
}

/** A bola (relíquia e em jogo): branca com gomos escuros, sombra no chão. */
export function drawBola(ctx, x, y, r, spin, z = 0) {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.9, r * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  const cy = y - r - z;
  ctx.fillStyle = '#f4f2ea';
  ctx.strokeStyle = 'rgba(20,16,14,0.85)';
  ctx.lineWidth = Math.max(1, r * 0.12);
  ctx.beginPath();
  ctx.arc(x, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#1d1b1f';
  for (let k = 0; k < 3; k++) {
    const a = spin + (k * Math.PI * 2) / 3;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * r * 0.5, cy + Math.sin(a) * r * 0.5, r * 0.24, 0, Math.PI * 2);
    ctx.fill();
  }
}
