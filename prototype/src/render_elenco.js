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

/** A cura do Pastor (D77): um anel dourado que se abre no chão a cada cura. */
export function drawCurasPastor(ctx, game, cam, ppu) {
  if (!game.curasFx || !game.curasFx.length) return;
  for (const c of game.curasFx) {
    const k = (game.t - c.t0) / 0.8;
    if (k < 0 || k > 1) continue;
    cam.toScreen(c.x, c.y, a);
    a.y -= c.z * ppu;
    const r = c.r * ppu * (0.35 + 0.65 * k);
    ctx.save();
    ctx.strokeStyle = `rgba(255,226,122,${(0.85 * (1 - k)).toFixed(3)})`;
    ctx.lineWidth = Math.max(2, ppu * 0.12 * (1 - k * 0.6));
    ctx.beginPath();
    ctx.ellipse(a.x, a.y, r, r * cam.k, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = `rgba(120,230,140,${(0.12 * (1 - k)).toFixed(3)})`;
    ctx.fill();
    ctx.restore();
  }
}

/** A cruzinha verde em cima de quem o Pastor acabou de curar. */
export function drawCurados(ctx, game, cam, ppu, playerPx) {
  let abriu = false;
  for (const e of game.enemies) {
    if (e.dead || !(e.curadoAte > game.t)) continue;
    if (!abriu) {
      ctx.save();
      ctx.lineCap = 'round';
      abriu = true;
    }
    const k = 1 - (e.curadoAte - game.t) / 0.7; // 0 → 1: sobe e some
    cam.toScreen(e.x, e.y, a);
    const y = a.y - (e.z || 0) * ppu - playerPx * 0.9 * (ENEMIES[e.type]?.size || 1) * 1.05 - k * 10;
    const s = Math.max(4, playerPx * 0.06);
    ctx.globalAlpha = 1 - k * k;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = s * 0.9;
    ctx.beginPath();
    ctx.moveTo(a.x - s, y);
    ctx.lineTo(a.x + s, y);
    ctx.moveTo(a.x, y - s);
    ctx.lineTo(a.x, y + s);
    ctx.stroke();
    ctx.strokeStyle = '#5fe07a';
    ctx.lineWidth = s * 0.5;
    ctx.stroke();
  }
  if (abriu) ctx.restore();
}

/** Um bilhete do bicho: cartão em pé, de papel creme com borda verde, o bicho e o grupo. */
function cartao(ctx, x, y, w, nome, grupo, alfa) {
  const h = w * 0.62;
  ctx.globalAlpha = alfa;
  ctx.fillStyle = '#f3ead0';
  ctx.strokeStyle = '#1f7a3a';
  ctx.lineWidth = Math.max(1.5, w * 0.05);
  ctx.beginPath();
  ctx.rect(x - w / 2, y - h / 2, w, h);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#1f7a3a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${Math.round(w * 0.2)}px "Barlow Semi Condensed", "Arial Narrow", sans-serif`;
  ctx.fillText(nome, x, y - h * 0.13);
  ctx.fillStyle = '#7a5a12';
  ctx.font = `700 ${Math.round(w * 0.15)}px "Barlow Semi Condensed", "Arial Narrow", sans-serif`;
  ctx.fillText(`GRUPO ${String(grupo).padStart(2, '0')}`, x, y + h * 0.24);
  ctx.globalAlpha = 1;
}

/** A banca do Bicheiro (D80): os bilhetes no chão (pulsando para chamar o Juninho) e os apontadores indo neles. */
export function drawBilhetes(ctx, game, cam, ppu, t) {
  if (!game.bancas || !game.bancas.length) return;
  const B = ENEMIES.bicheiro;
  ctx.save();
  for (const banca of game.bancas) {
    const fim = Math.max(0, Math.min(1, (B.bilheteS - (game.t - banca.t0)) / 3)); // some nos últimos 3 s
    // os apontadores: linha pontilhada até o bilhete que vão recolher
    ctx.strokeStyle = 'rgba(255,210,31,0.45)';
    ctx.lineWidth = Math.max(1, ppu * 0.035);
    ctx.setLineDash([3, 5]);
    for (const e of game.enemies) {
      if (e.dead || e.banca !== banca || !e.bilhete || !e.bilhete.vivo) continue;
      cam.toScreen(e.x, e.y, a);
      cam.toScreen(e.bilhete.x, e.bilhete.y, b);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    for (const bl of banca.bilhetes) {
      if (!bl.vivo) continue;
      cam.toScreen(bl.x, bl.y, a);
      const pulso = 0.5 + 0.5 * Math.sin(t * 6 + bl.grupo);
      const r = ppu * (0.55 + 0.12 * pulso);
      ctx.fillStyle = `rgba(255,210,31,${(0.18 * fim).toFixed(3)})`;
      ctx.strokeStyle = `rgba(255,214,60,${((0.5 + 0.4 * pulso) * fim).toFixed(3)})`;
      ctx.lineWidth = Math.max(1.5, ppu * 0.05);
      ctx.beginPath();
      ctx.ellipse(a.x, a.y, r, r * cam.k, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      cartao(ctx, a.x, a.y - ppu * (0.75 + 0.08 * Math.sin(t * 3 + bl.grupo)), Math.max(40, ppu * 1.3), bl.bicho, bl.grupo, fim);
    }
  }
  ctx.restore();
}

/** A aposta feita: o bilhete pequeno em cima da cabeça do Juninho até o Bicheiro cair. */
export function drawAposta(ctx, game, cam, ppu, playerPx) {
  if (!game.bancas) return;
  const banca = game.bancas.find((x) => x.aposta);
  if (!banca) return;
  const p = game.player;
  cam.toScreen(p.x, p.y, b);
  ctx.save();
  cartao(ctx, b.x, b.y - (p.z || 0) * ppu - playerPx * 1.3, Math.max(38, playerPx * 0.42), banca.aposta.bicho, banca.aposta.grupo, 0.95);
  ctx.restore();
}
