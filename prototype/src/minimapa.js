// Mapa da favela: a Subida do Morro vista de cima, sempre no canto da tela enquanto o Juninho está no
// morro. Mostra o caminho inteiro (vielas, escadarias e lajes), onde ele está, o caminho até a entrega,
// os traficantes e os camburões. Tocando, abre grande (o jogo pausa). Desenho em código, sem DOM.
import { ROUTE } from './config.js';
import { deliveryPoint, routeRemaining } from './mundo.js';

const COLORS = { viela: '#a39a8e', escadaria: '#c9c0b2', laje: '#d2b98c', orla: '#7a6f63' };
const tmp = { x: 0, y: 0 };

/** Retângulo do mapa na tela: pequeno no canto direito, ou grande no meio. */
export function minimapRect(cam, open) {
  const top = cam.playTop + 132; // abaixo do plantão da TV
  if (open) {
    const w = Math.min(cam.viewW - 32, 360);
    const h = Math.max(240, cam.playBottom - cam.playTop - 40);
    return { x: (cam.viewW - w) / 2, y: cam.playTop + 20, w, h };
  }
  const h = Math.max(150, Math.min(290, cam.playBottom - top - 150));
  return { x: cam.viewW - 76 - 8, y: top, w: 76, h };
}

/** Limites do morro no mundo (com um pedaço do fim da Orla embaixo). */
function bounds(w) {
  if (w.mapBounds) return w.mapBounds;
  let x0 = Infinity;
  let x1 = -Infinity;
  for (let i = 1; i < w.path.length; i++) {
    x0 = Math.min(x0, w.path[i].x0);
    x1 = Math.max(x1, w.path[i].x1);
  }
  w.mapBounds = { x0: x0 - 3, x1: x1 + 3, y0: w.morroTop - 3, y1: w.orlaTop + 10 };
  return w.mapBounds;
}

export function drawMinimap(ctx, game, cam, t, open) {
  const w = game.world;
  if (!w) return;
  const R = minimapRect(cam, open);
  const B = bounds(w);
  const pad = open ? 14 : 6;
  const headH = open ? 30 : 14;
  const footH = open ? 26 : 0;
  const ix = R.x + pad;
  const iy = R.y + headH;
  const iw = R.w - pad * 2;
  const ih = R.h - headH - footH - pad;
  // escala separada em x e y: o morro é comprido e estreito, o mapa alarga para o zigue-zague aparecer
  const sx = iw / (B.x1 - B.x0);
  const sy = ih / (B.y1 - B.y0);
  const X = (x) => ix + (x - B.x0) * sx;
  const Y = (y) => iy + (y - B.y0) * sy;

  ctx.save();
  if (open) {
    ctx.fillStyle = 'rgba(8,6,10,0.6)';
    ctx.fillRect(0, 0, cam.viewW, cam.viewH);
  }
  // fundo: o morro cheio de casas
  ctx.fillStyle = 'rgba(20,16,20,0.88)';
  ctx.fillRect(R.x, R.y, R.w, R.h);
  ctx.strokeStyle = open ? '#ffd21f' : 'rgba(255,210,31,0.75)';
  ctx.lineWidth = 2;
  ctx.strokeRect(R.x + 1, R.y + 1, R.w - 2, R.h - 2);
  ctx.fillStyle = '#3b2f2a';
  ctx.fillRect(ix, iy, iw, ih);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  const cell = open ? 10 : 6;
  for (let yy = iy; yy < iy + ih; yy += cell) {
    for (let xx = ix + ((yy / cell) % 2) * (cell / 2); xx < ix + iw; xx += cell) ctx.fillRect(xx, yy, cell * 0.45, cell * 0.45);
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(ix, iy, iw, ih);
  ctx.clip();
  // caminho: fim da Orla, escadaria do pé do morro e os pedaços em sequência
  w.path.forEach((k, i) => {
    const x0 = Math.max(B.x0, k.x0);
    const x1 = Math.min(B.x1, k.x1);
    const y0 = Math.max(B.y0, k.y0);
    const y1 = Math.min(B.y1, k.y1);
    if (x1 <= x0 || y1 <= y0) return;
    ctx.fillStyle = i === 1 && !w.gateOpen ? '#e06a1b' : COLORS[k.kind] || COLORS.viela;
    ctx.fillRect(X(x0), Y(y0), (x1 - x0) * sx, (y1 - y0) * sy + 0.5);
    if (k.kind === 'escadaria') {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      for (let yy = y0; yy < y1; yy += 1.2) ctx.fillRect(X(x0), Y(yy), (x1 - x0) * sx, 1);
    }
  });
  // casas com laje (dá para subir)
  ctx.fillStyle = 'rgba(80,60,50,0.9)';
  for (const P of w.platforms) {
    if (P.y1 > w.orlaTop) continue;
    ctx.fillRect(X(P.x0), Y(P.y0), (P.x1 - P.x0) * sx, (P.y1 - P.y0) * sy);
  }
  // camburões
  for (const p of w.props) {
    if (p.kind !== 'camburao') continue;
    ctx.fillStyle = '#f2efe8';
    ctx.fillRect(X(p.x0), Y(p.y0), Math.max(3, (p.x1 - p.x0) * sx), Math.max(2, (p.y1 - p.y0) * sy));
    ctx.fillStyle = t % 0.6 < 0.3 ? '#e5252f' : '#2a6fd0';
    ctx.fillRect(X(p.x0), Y(p.y0) - 1, 3, 2);
  }
  // caminho até a entrega: linha tracejada passando pelas passagens
  const p = game.player;
  const dp = deliveryPoint(w, tmp);
  const ri = Math.max(0, p.ri);
  ctx.strokeStyle = '#ffd21f';
  ctx.lineWidth = open ? 3 : 2;
  ctx.setLineDash(open ? [7, 5] : [4, 3]);
  ctx.lineDashOffset = -t * (open ? 22 : 12);
  ctx.beginPath();
  ctx.moveTo(X(p.x), Y(p.y));
  for (let j = ri; j < w.joints.length; j++) ctx.lineTo(X(w.joints[j].x), Y(w.joints[j].y));
  ctx.lineTo(X(dp.x), Y(dp.y));
  ctx.stroke();
  ctx.setLineDash([]);
  // traficantes
  for (const e of game.enemies) {
    if (e.type !== 'traficante' || e.dead || e.y > B.y1) continue;
    ctx.fillStyle = '#ff7a1a';
    ctx.fillRect(X(e.x) - 1.5, Y(e.y) - 1.5, 3, 3);
  }
  // entrega
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  ctx.fillStyle = `rgba(255,210,31,${0.3 + 0.3 * pulse})`;
  ctx.beginPath();
  ctx.arc(X(dp.x), Y(dp.y), (open ? 11 : 6) + pulse * 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e9e1cf';
  const ps = open ? 12 : 7;
  ctx.fillRect(X(dp.x) - ps / 2, Y(dp.y) - ps / 2, ps, ps);
  ctx.fillStyle = '#c8342b';
  ctx.fillRect(X(dp.x) - ps / 3, Y(dp.y) - ps / 4, (ps * 2) / 3, ps / 2);
  // o Juninho
  ctx.fillStyle = '#ff2d3d';
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(X(p.x), Y(p.y), open ? 6 : 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // títulos
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd21f';
  const d = Math.round(routeRemaining(w, p.x, p.y, p.ri));
  if (open) {
    ctx.font = '900 18px "Barlow Semi Condensed", "Arial Narrow", sans-serif';
    ctx.fillText('MAPA DA FAVELA · SUBIDA DO MORRO', R.x + R.w / 2, R.y + 21);
    // nomes dos pedaços e rótulos
    ctx.font = '800 11px "Barlow Semi Condensed", "Arial Narrow", sans-serif';
    ctx.textAlign = 'left';
    w.path.forEach((k, i) => {
      if (i === 0 || k.y1 < B.y0) return;
      const name = i === 1 ? 'ESCADARIA DO PÉ DO MORRO' : k === w.top ? 'LAJE DO TOPO' : k.kind.toUpperCase();
      const ly = Y((k.y0 + k.y1) / 2) + 4;
      const lx = X(k.x1) + 4;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      const tw = ctx.measureText(name).width;
      const fx = lx + tw > R.x + R.w - 4 ? X(k.x0) - tw - 4 : lx;
      ctx.fillRect(fx - 2, ly - 10, tw + 4, 13);
      ctx.fillStyle = '#f2efe8';
      ctx.fillText(name, fx, ly);
    });
    ctx.textAlign = 'center';
    ctx.font = '900 13px "Barlow Semi Condensed", "Arial Narrow", sans-serif';
    ctx.fillStyle = '#ffd21f';
    const lvl = w.exitOpen ? '' : ` · ENTREGA NO NÍVEL ${ROUTE.morro.unlockLevel}`;
    ctx.fillText(`VOCÊ (VERMELHO) → ENTREGA (AMARELO): ${d} M${lvl}`, R.x + R.w / 2, R.y + R.h - 26);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '700 12px "Barlow Semi Condensed", "Arial Narrow", sans-serif';
    ctx.fillText('LARANJA: TRAFICANTE · BRANCO: CAMBURÃO · TOQUE PARA FECHAR', R.x + R.w / 2, R.y + R.h - 10);
  } else {
    ctx.font = '900 10px "Barlow Semi Condensed", "Arial Narrow", sans-serif';
    ctx.fillText('FAVELA', R.x + R.w / 2, R.y + 11);
    ctx.fillStyle = 'rgba(20,16,20,0.88)';
    ctx.fillRect(R.x, R.y + R.h, R.w, 15);
    ctx.fillStyle = '#ffd21f';
    ctx.fillText(`${d} M · TOQUE`, R.x + R.w / 2, R.y + R.h + 11);
  }
  ctx.restore();
}
