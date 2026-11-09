// Desenho da regra da carreira (D39): o tapume da escadaria (arte de tapume
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

// com a melhoria "Rádio da polícia", o helicóptero já aparece no sinal do covil (85%)
const heliOn = (game) => {
  const C = game.covil;
  if (!C || C.saiu || game.over) return false;
  return C.aberto || (C.sinal && !!(game.meta.melhorias && game.meta.melhorias.pista));
};
const spot = { x: 0, y: 0 };

/** Mancha de luz do holofote no chão (antes dos personagens, para eles ficarem iluminados por cima). */
export function drawHolofoteChao(ctx, game, cam, ppu, t) {
  if (!heliOn(game)) return;
  holofote(game, spot);
  cam.toScreen(spot.x, spot.y, a);
  if (a.x < -200 || a.x > cam.viewW + 200 || a.y < -200 || a.y > cam.viewH + 200) return;
  // mais fraca e menor que antes (D71): mostra onde é sem atrapalhar a luta em volta
  const H = CARREIRA.heli;
  const R = H.manchaM * ppu;
  const g = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, R);
  g.addColorStop(0, `rgba(255,248,214,${H.manchaAlfa})`);
  g.addColorStop(0.7, `rgba(255,240,190,${H.manchaAlfa * 0.4})`);
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
 * O helicóptero da TV na beira da tela (D71). Com o covil na tela, nada no céu: a mancha do holofote no chão já
 * mostra onde é. Fora da tela, um helicóptero pequeno na beira, do lado do covil, com a hélice girando e um facho
 * curto embaixo, sobre uma claridade fraca. Sem cone atravessando a tela, sem seta e sem texto.
 */
export function drawHolofoteCeu(ctx, game, cam, ppu, t) {
  if (!heliOn(game)) return;
  holofote(game, spot);
  cam.toScreen(spot.x, spot.y, a);
  const top = cam.playTop + 125; // abaixo do plantão da TV, que cobre o alto da tela
  const bot = cam.playBottom - 30;
  if (a.x > 0 && a.x < cam.viewW && a.y > top && a.y < bot) return;
  const m = 30; // da beira até o helicóptero
  const cx = cam.viewW / 2;
  const cy = (top + bot) / 2;
  const dx = a.x - cx;
  const dy = a.y - cy;
  const s = Math.min((cam.viewW / 2 - m) / Math.abs(dx || 1e-6), ((bot - top) / 2 - m * 0.5) / Math.abs(dy || 1e-6));
  const x = cx + dx * s;
  const y = cy + dy * s + Math.sin(t * 2.1) * 2; // balança no ar
  const pulso = 0.8 + 0.2 * Math.sin(t * 2.6);
  ctx.save();
  // claridade fraca atrás (contraste no meio da bagunça) e o facho curto descendo
  ctx.globalCompositeOperation = 'lighter';
  let g = ctx.createRadialGradient(x, y + 6, 0, x, y + 6, 46);
  g.addColorStop(0, `rgba(255,246,210,${0.32 * pulso})`);
  g.addColorStop(1, 'rgba(255,246,210,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - 46, y - 40, 92, 92);
  g = ctx.createLinearGradient(x, y + 4, x, y + 38);
  g.addColorStop(0, `rgba(255,248,220,${0.4 * pulso})`);
  g.addColorStop(1, 'rgba(255,248,220,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - 2, y + 4);
  ctx.lineTo(x + 2, y + 4);
  ctx.lineTo(x + 9, y + 38);
  ctx.lineTo(x - 9, y + 38);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // o helicóptero: cabine, cauda para o lado de fora da tela, hélice girando
  const lado = dx > 0 ? 1 : -1;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#1e1c22';
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(lado * 6, -1);
  ctx.lineTo(lado * 20, -3);
  ctx.lineTo(lado * 20, 0);
  ctx.lineTo(lado * 6, 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(150,200,230,0.9)'; // vidro da cabine
  ctx.beginPath();
  ctx.ellipse(-lado * 4, -1, 3.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d23a2e'; // a faixa da emissora
  ctx.fillRect(-4, 2, 8, 1.6);
  ctx.strokeStyle = 'rgba(30,28,34,0.9)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-6, 7);
  ctx.lineTo(6, 7); // o esqui
  ctx.stroke();
  ctx.strokeStyle = 'rgba(230,230,235,0.85)';
  const giro = Math.abs(Math.cos(t * 28)); // a hélice girando
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-17 * giro, -8);
  ctx.lineTo(17 * giro, -8);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(lado * 20, -2, 3 * giro + 0.5, 0, Math.PI * 2); // a hélice da cauda
  ctx.stroke();
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
  if (a.kind === 'reliquia' && a.reliquia === 'paredao') {
    // ligado na laje, batendo sozinho: o grave dá a pista de onde ele está
    const bate = Math.max(0, Math.sin(t * 5.2)) ** 6;
    drawParedao(ctx, pt.x, pt.y, playerPx, bate, -1, t);
    if (!longe) brilho(ctx, pt.x + 0.35 * playerPx, pt.y - 0.8 * playerPx, 0.45 * ppu, t, seed);
    return;
  }
  if (a.kind === 'reliquia') {
    // a Bola da Altinha flutua acima do deque, girando devagar (D70)
    const r = 0.4 * ppu;
    const alto = (0.28 + 0.06 * Math.sin(t * 2.2)) * ppu;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y, r * 0.8, r * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!drawBolaArte(ctx, pt.x, pt.y - alto - r, r, Math.floor(t * 7) % 12, -1)) drawBola(ctx, pt.x, pt.y, 0.3 * ppu, t * 0.6, 0.15 * ppu);
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

/**
 * A Bola da Altinha com a arte (D70, folha 12 x 9 de tools/render-bola.py). dir -1: a relíquia girando (linha 0);
 * dir 0 a 7: acordada (o Golaço) rolando para a direção da tela (0 direita, 2 baixo, 4 esquerda, 6 cima), linhas 1 a 8.
 * quadro: 12 por volta. (x, cy) é o centro da bola na tela e r o raio em px. Sem a arte, devolve false.
 */
export function drawBolaArte(ctx, x, cy, r, quadro, dir) {
  const im = images.bola_altinha;
  if (!im || !im.width) return false;
  const cel = im.width / 12;
  const q = ((quadro % 12) + 12) % 12;
  const linha = dir < 0 ? 0 : 1 + (dir % 8);
  const s = 2.4 * r; // a bola tem 80 px de raio na célula de 192: a célula mede 2,4 raios, qualquer que seja a resolução da folha
  ctx.drawImage(im, q * cel, linha * cel, cel, cel, x - s / 2, cy - s / 2, s, s);
  return true;
}

/** A bola desenhada em código (sem a arte): branca com gomos escuros, sombra no chão. */
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

const LEDS = ['255,60,200', '60,220,255', '255,210,40'];

/**
 * Paredão de Som (relíquia do Morro) no carrinho: a arte inteira, só na escala (1,2 m: 0,7 do Juninho),
 * espelhada para o puxador ficar do lado do Juninho; o grave (pulso, 0 a 1) incha a caixa e acende os LEDs.
 */
export function drawParedao(ctx, x, y, playerPx, pulso, lado, t) {
  const im = images.paredao;
  const h = playerPx * 0.7 * (1 + 0.05 * pulso);
  ctx.fillStyle = 'rgba(0,0,0,0.34)';
  ctx.beginPath();
  ctx.ellipse(x, y, h * 0.4, h * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  // a luz dos LEDs no chão, somada, mais forte no grave
  const cor = LEDS[Math.floor(t * 2) % LEDS.length];
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y - h * 0.1, 0, x, y - h * 0.1, h * 1.1);
  g.addColorStop(0, `rgba(${cor},${0.18 + 0.32 * pulso})`);
  g.addColorStop(1, `rgba(${cor},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - h * 1.1, y - h * 1.2, h * 2.2, h * 2.2);
  ctx.restore();
  ctx.save();
  ctx.translate(x, y);
  if (lado < 0) ctx.scale(-1, 1);
  if (im) {
    const w = (im.width / im.height) * h;
    ctx.drawImage(im, -w / 2, -h, w, h);
  } else {
    // sem a arte: a caixa preta com dois falantes
    ctx.fillStyle = '#1d1b1f';
    ctx.fillRect(-h * 0.32, -h, h * 0.64, h * 0.92);
    ctx.fillStyle = '#3a3640';
    for (const yy of [-0.7, -0.32]) {
      ctx.beginPath();
      ctx.arc(0, h * yy, h * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
