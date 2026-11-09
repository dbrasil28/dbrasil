// Desenho das mecânicas do elenco v2 (D76): a roda da palestra do Coach no chão e a marca do Agiota (a linha da
// cobrança até o Juninho e o "%" em cima da cabeça dele).
import { ENEMIES } from './config.js';

const a = { x: 0, y: 0 };
const b = { x: 0, y: 0 };

/** A roda da palestra: um anel amarelo pulsando no chão em volta do Coach (quem está dentro fica lento). */
export function drawPalestras(ctx, game, cam, ppu, t) {
  const C = ENEMIES.coach;
  for (const e of game.enemies) {
    if (e.dead || e.type !== 'coach' || !(e.palestraT > 0)) continue;
    cam.toScreen(e.x, e.y, a);
    a.y -= (e.z || 0) * ppu;
    const r = C.raioM * ppu;
    const pulso = 0.75 + 0.25 * Math.sin(t * 9);
    ctx.save();
    ctx.fillStyle = `rgba(255,210,31,${(0.1 * pulso).toFixed(3)})`;
    ctx.beginPath();
    ctx.ellipse(a.x, a.y, r, r * cam.k, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(255,214,60,${(0.7 * pulso).toFixed(3)})`;
    ctx.lineWidth = Math.max(2, ppu * 0.08);
    ctx.setLineDash([ppu * 0.35, ppu * 0.2]);
    ctx.lineDashOffset = -t * ppu * 1.5; // a roda gira
    ctx.stroke();
    ctx.restore();
  }
}

/** A marca do Agiota: linha vermelha tracejada dele até o Juninho e o "%" em cima da cabeça do Juninho. */
export function drawMarcaAgiota(ctx, game, cam, ppu, playerPx, t) {
  const p = game.player;
  let marcado = false;
  for (const e of game.enemies) {
    if (e.dead || e.type !== 'agiota' || !e.marcou) continue;
    marcado = true;
    cam.toScreen(e.x, e.y, a);
    a.y -= ((e.z || 0) * ppu + playerPx * 0.6);
    cam.toScreen(p.x, p.y, b);
    b.y -= ((p.z || 0) * ppu + playerPx * 0.6);
    ctx.save();
    ctx.strokeStyle = 'rgba(230,40,40,0.55)';
    ctx.lineWidth = Math.max(1.5, ppu * 0.05);
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = -t * 30; // a cobrança correndo dele para o Juninho
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.restore();
  }
  if (!marcado) return;
  cam.toScreen(p.x, p.y, b);
  const y = b.y - (p.z || 0) * ppu - playerPx * 1.22 - Math.abs(Math.sin(t * 5)) * 3;
  const r = Math.max(9, playerPx * 0.11);
  ctx.save();
  ctx.fillStyle = '#d42626';
  ctx.strokeStyle = 'rgba(0,0,0,0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(b.x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = `900 ${Math.round(r * 1.3)}px "Barlow Semi Condensed", "Arial Narrow", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('%', b.x, y + 1);
  ctx.restore();
}
