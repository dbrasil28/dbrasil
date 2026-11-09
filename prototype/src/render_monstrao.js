// Desenho do Monstrão (monstrao.js): os avisos no chão antes de cada golpe (faixa da investida e da anilha,
// círculo do soco no chão e de onde o carro vai cair), o anel de choque, a anilha rolando e o carro no ar.
// O chão é um plano: os avisos são feitos em metros e deitados na tela pela conta da câmera.
import { images } from './sprites.js';
import { ENEMIES } from './config.js';

const p0 = { x: 0, y: 0 };
const p1 = { x: 0, y: 0 };
const p2 = { x: 0, y: 0 };

/** Daqui em diante, (x, y) em metros a partir de (ox, oy), deitados no chão. */
function noChao(ctx, cam, ox, oy) {
  cam.toScreen(ox, oy, p0);
  cam.toScreen(ox + 1, oy, p1);
  cam.toScreen(ox, oy + 1, p2);
  ctx.transform(p1.x - p0.x, p1.y - p0.y, p2.x - p0.x, p2.y - p0.y, p0.x, p0.y);
}

/** Avisos dos golpes e o anel de choque, no chão, antes de todo mundo. */
export function drawAvisosChao(ctx, game, cam, t) {
  const A = game.avisosChao;
  const O = game.monstraoObjs;
  if ((!A || !A.length) && (!O || !O.length)) return;
  const pisca = 0.75 + 0.25 * Math.sin(t * 18);
  for (const a of A || []) {
    ctx.save();
    noChao(ctx, cam, a.x, a.y);
    ctx.beginPath();
    if (a.tipo === 'faixa') {
      ctx.rotate(Math.atan2(a.dy, a.dx));
      ctx.rect(0, -a.larg / 2, a.len, a.larg);
      ctx.fillStyle = `rgba(214,38,24,${(0.16 * pisca).toFixed(3)})`;
      ctx.fill();
      // enche da ponta dele até o fim: quando encher, ele vai
      ctx.beginPath();
      ctx.rect(0, -a.larg / 2, a.len * Math.max(0, Math.min(1, a.k)), a.larg);
      ctx.fillStyle = 'rgba(255,70,40,0.22)';
      ctx.fill();
      ctx.beginPath();
      ctx.rect(0, -a.larg / 2, a.len, a.larg);
    } else {
      ctx.arc(0, 0, a.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(214,38,24,${(0.14 * pisca).toFixed(3)})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, a.r * Math.max(0, Math.min(1, a.k)), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,70,40,0.22)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, a.r, 0, Math.PI * 2);
    }
    ctx.restore();
    ctx.strokeStyle = `rgba(255,86,56,${(0.8 * pisca).toFixed(3)})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  // anel de choque (fase 3): poeira abrindo pela areia, com a brecha
  const N = ENEMIES.monstrao.agacha.anel;
  for (const o of O || []) {
    if (o.tipo !== 'anel') continue;
    const fade = 1 - Math.max(0, (o.r - N.alcanceM * 0.7) / (N.alcanceM * 0.3));
    ctx.save();
    noChao(ctx, cam, o.x, o.y);
    const a0 = o.brecha + N.brecha / 2;
    const a1 = o.brecha - N.brecha / 2 + Math.PI * 2;
    ctx.beginPath();
    ctx.arc(0, 0, o.r + N.largM / 2, a0, a1);
    ctx.arc(0, 0, Math.max(0.1, o.r - N.largM / 2), a1, a0, true);
    ctx.closePath();
    ctx.fillStyle = `rgba(238,222,190,${(0.6 * fade).toFixed(3)})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, o.r + N.largM / 2, a0, a1);
    ctx.restore();
    ctx.strokeStyle = `rgba(120,90,60,${(0.55 * fade).toFixed(3)})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

/** Objetos do Monstrão que entram na ordem de desenho (anilha rolando, carro no ar). */
export function monstraoNaLista(game, cam, list) {
  for (const o of game.monstraoObjs || []) {
    if (o.tipo === 'anilha') list.push({ d: cam.depth(o.x, o.y) + 0.2, k: 'mobj', o });
    else if (o.tipo === 'carro') list.push({ d: cam.depth(o.x, o.y) + 4, k: 'mobj', o });
  }
}

export function drawMonstraoObj(ctx, o, pt, ppu, k) {
  if (o.tipo === 'anilha') {
    // do tamanho da que ele segura (D85); caindo das mãos, a sombra no chão cresce e ela desce até rolar
    const N = ENEMIES.monstrao.anilha;
    const im = images.monstrao_anilha;
    const r = N.arteRaioM * ppu;
    const q = o.queda > 0 ? o.queda / N.quedaS : 0;
    const z = N.alturaM * q * q * ppu;
    ctx.fillStyle = `rgba(20,12,8,${(0.35 * (1 - 0.5 * q)).toFixed(3)})`;
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y, r * 0.9 * (1 - 0.4 * q), r * 0.3 * k * (1 - 0.4 * q), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(pt.x, pt.y - r - z);
    ctx.rotate(o.giro);
    if (im) ctx.drawImage(im, -r, -r * (im.height / im.width), r * 2, r * 2 * (im.height / im.width));
    else {
      ctx.fillStyle = '#3a3a3e';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }
  if (o.tipo === 'carro') {
    // sombra no chão onde ele vai cair cresce; o carro gira no ar
    cam_sombra(ctx, pt, ppu, k, o);
    const im = images[o.arte];
    const w = ppu * 3.8;
    ctx.save();
    ctx.translate(pt.x, pt.y - o.h * ppu - w * 0.2);
    ctx.rotate(o.t * 5);
    if (im) ctx.drawImage(im, -w / 2, -w * 0.5 * (im.height / im.width), w, w * (im.height / im.width));
    ctx.restore();
  }
}

function cam_sombra(ctx, pt, ppu, k, o) {
  const s = 0.4 + 0.6 * Math.min(1, o.t / o.dur);
  ctx.fillStyle = `rgba(20,12,8,${(0.3 * s).toFixed(3)})`;
  ctx.beginPath();
  ctx.ellipse(pt.x, pt.y, ppu * 1.9 * s, ppu * 0.9 * s * k, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** O carro erguido acima da cabeça (pose de levantar), antes de ser arremessado. */
export function drawCarroErguido(ctx, o, pt, h, ppu) {
  const im = images[o.carroArte];
  if (!im) return;
  const w = ppu * 3.8;
  const hh = w * (im.height / im.width);
  ctx.drawImage(im, pt.x - w / 2, pt.y - h * 1.05 - hh * 0.75, w, hh);
}
