// Desenho provisório (em código) do mundo da rota: lajes com escada, objetos de cena, boteco,
// tapume da escadaria, setas da rota, mira do traficante e balas. Sai quando a arte do guia chegar.
import { ROUTE, OBJ_ALTURA, OBJ_ESCALA } from './config.js';
import { inside, deliveryPoint } from './mundo.js';
import { images } from './sprites.js';
import { ART, ART_S, artKey } from './arte_cenario.js';

const a = { x: 0, y: 0 };
const b = { x: 0, y: 0 };
const c = { x: 0, y: 0 };
const d = { x: 0, y: 0 };

/** Profundidade de desenho: quem está em cima de uma laje vai depois da laje. */
export function entityDepth(cam, e) {
  if (e.plat && e.lvl === 1) return cam.depth(e.x, e.plat.y1) + 0.003 + (e.y - e.plat.y0) * 1e-4;
  return cam.depth(e.x, e.y);
}

function quad(ctx, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.lineTo(d.x, d.y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

const PLAT_COLORS = {
  terraco: { top: '#8a8177', front: '#9c6c55', win: true },
  salva_vidas: { top: '#c9b27a', front: '#c8402f', win: false },
  laje_casa: { top: '#8e877e', front: '#a98a6a', win: true },
};

/** Laje, terraço ou torre: tampo na altura h e a fachada da frente. */
export function drawPlatform(ctx, P, cam, ppu) {
  const hp = P.h * ppu;
  const col = PLAT_COLORS[P.kind] || PLAT_COLORS.laje_casa;
  // fachada da frente (do chão até o tampo)
  cam.toScreen(P.x0, P.y1, a);
  cam.toScreen(P.x1, P.y1, b);
  c.x = b.x; c.y = b.y - hp;
  d.x = a.x; d.y = a.y - hp;
  quad(ctx, col.front, 'rgba(0,0,0,0.55)');
  if (col.win) {
    // janelas com a luz azul da TV
    ctx.fillStyle = 'rgba(120,170,255,0.6)';
    const n = Math.max(1, Math.floor((P.x1 - P.x0) / 1.6));
    for (let i = 0; i < n; i++) {
      const wx = a.x + ((b.x - a.x) * (i + 0.3)) / n;
      ctx.fillRect(wx, a.y - hp * 0.75, ((b.x - a.x) / n) * 0.4, hp * 0.28);
    }
  } else {
    // torre do salva-vidas: pernas e faixa
    ctx.fillStyle = 'rgba(255,230,120,0.8)';
    ctx.fillRect(a.x, a.y - hp * 0.55, b.x - a.x, hp * 0.12);
  }
  // tampo
  cam.toScreen(P.x0, P.y0, a);
  cam.toScreen(P.x1, P.y0, b);
  cam.toScreen(P.x1, P.y1, c);
  cam.toScreen(P.x0, P.y1, d);
  a.y -= hp; b.y -= hp; c.y -= hp; d.y -= hp;
  quad(ctx, col.top, 'rgba(0,0,0,0.45)');
  // mureta
  ctx.strokeStyle = 'rgba(40,30,25,0.6)';
  ctx.lineWidth = Math.max(2, ppu * 0.12);
  ctx.strokeRect(a.x, a.y, b.x - a.x, d.y - a.y);
}

/** Escada: rampa com degraus do chão até o tampo da laje. */
export function drawStair(ctx, P, cam, ppu) {
  const S = P.stair;
  const hp = P.h * ppu;
  const z = (x, y, k, out) => {
    cam.toScreen(x, y, out);
    out.y -= hp * k;
  };
  if (S.dir === 'n' || S.dir === 's') {
    const yb = S.dir === 'n' ? S.y1 : S.y0;
    const yt = S.dir === 'n' ? S.y0 : S.y1;
    z(S.x0, yb, 0, a); z(S.x1, yb, 0, b); z(S.x1, yt, 1, c); z(S.x0, yt, 1, d);
    quad(ctx, '#7b746c', 'rgba(0,0,0,0.5)');
    ctx.strokeStyle = 'rgba(30,24,20,0.6)';
    ctx.lineWidth = Math.max(1, ppu * 0.05);
    const n = Math.max(4, Math.round(Math.abs(yt - yb) / 0.4));
    for (let i = 1; i < n; i++) {
      const k = i / n;
      const yy = yb + (yt - yb) * k;
      z(S.x0, yy, k, a);
      z(S.x1, yy, k, b);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    // corrimão
    z(S.x1, yb, 0.35, a);
    z(S.x1, yt, 1.35, b);
    ctx.strokeStyle = 'rgba(200,200,205,0.8)';
    ctx.lineWidth = Math.max(1.5, ppu * 0.07);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  } else {
    const xb = S.dir === 'e' ? S.x0 : S.x1;
    const xt = S.dir === 'e' ? S.x1 : S.x0;
    z(xb, S.y0, 0, a); z(xt, S.y0, 1, b); z(xt, S.y1, 1, c); z(xb, S.y1, 0, d);
    quad(ctx, '#7b746c', 'rgba(0,0,0,0.5)');
  }
}

/** Objeto de cena: s = tamanho de referência em px (altura do Juninho). */
// giro dos objetos: direção pedida -> vista guardada (e se é espelhada)
const VISTA = { s: ['s', false], se: ['se', false], e: ['se', false], ne: ['ne', false], n: ['n', false], nw: ['ne', true], w: ['se', true], sw: ['se', true] };
export const GIRO = ['s', 'se', 'ne', 'n', 'nw', 'sw'];

export function drawObject(ctx, kind, x, y, s, rot = 0, dir = 's') {
  // arte gerada: base do objeto no chão em (x, y); s = 0,42 da altura do Juninho na tela
  const [vd, flip] = VISTA[dir] || VISTA.s;
  const im = images[`obj_${kind}_${vd}`] || images[`obj_${kind}`];
  if (im && OBJ_ALTURA[kind]) {
    // vistas do giro: mesma escala da diagonal da frente (220 px de altura)
    const ref = images[`obj_${kind}_se`] ? 220 : im.height;
    const h = ((((s / 0.42) * OBJ_ALTURA[kind]) / 1.75) * OBJ_ESCALA * im.height) / ref;
    const w = (im.width / im.height) * h;
    ctx.save();
    ctx.translate(x, y - h / 2);
    if (rot) ctx.rotate(rot);
    if (flip && images[`obj_${kind}_${vd}`]) ctx.scale(-1, 1);
    ctx.drawImage(im, -w / 2, -h / 2, w, h);
    ctx.restore();
    return;
  }
  ctx.save();
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  const u = s / 5; // cadeira ≈ 40% da altura do Juninho
  ctx.lineWidth = Math.max(1, u * 0.3);
  ctx.strokeStyle = 'rgba(20,16,14,0.8)';
  switch (kind) {
    case 'cadeira':
      ctx.fillStyle = '#ecebe6';
      ctx.fillRect(-u * 1.4, -u * 2.2, u * 2.8, u * 0.7); // assento
      ctx.strokeRect(-u * 1.4, -u * 2.2, u * 2.8, u * 0.7);
      ctx.fillRect(-u * 1.3, -u * 4.4, u * 2.6, u * 2.2); // encosto
      ctx.strokeRect(-u * 1.3, -u * 4.4, u * 2.6, u * 2.2);
      ctx.fillRect(-u * 1.3, -u * 1.5, u * 0.4, u * 1.5);
      ctx.fillRect(u * 0.9, -u * 1.5, u * 0.4, u * 1.5);
      break;
    case 'mesa':
      ctx.fillStyle = '#e9e7e0';
      ctx.beginPath();
      ctx.ellipse(0, -u * 2.8, u * 2.6, u * 1.0, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillRect(-u * 2.0, -u * 2.6, u * 0.4, u * 2.6);
      ctx.fillRect(u * 1.6, -u * 2.6, u * 0.4, u * 2.6);
      break;
    case 'cadeira_praia':
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 ? '#f2e6c8' : '#2f7fb8';
        ctx.fillRect(-u * 1.6 + i * u * 0.8, -u * 3.6, u * 0.8, u * 2.4);
      }
      ctx.strokeRect(-u * 1.6, -u * 3.6, u * 3.2, u * 2.4);
      ctx.strokeStyle = '#c8c8cc';
      ctx.beginPath();
      ctx.moveTo(-u * 1.6, 0);
      ctx.lineTo(u * 1.6, -u * 3.6);
      ctx.moveTo(u * 1.6, 0);
      ctx.lineTo(-u * 1.6, -u * 3.6);
      ctx.stroke();
      break;
    case 'engradado':
      ctx.fillStyle = '#d8a52a';
      ctx.fillRect(-u * 1.8, -u * 2.6, u * 3.6, u * 2.6);
      ctx.strokeRect(-u * 1.8, -u * 2.6, u * 3.6, u * 2.6);
      ctx.fillStyle = '#5a3d10';
      for (let i = 0; i < 3; i++) ctx.fillRect(-u * 1.4 + i * u * 1.1, -u * 2.2, u * 0.7, u * 0.7);
      break;
    case 'botijao':
      ctx.fillStyle = '#b43a2f';
      ctx.beginPath();
      ctx.ellipse(0, -u * 2.2, u * 1.5, u * 2.0, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#c9c9cc';
      ctx.fillRect(-u * 0.6, -u * 4.8, u * 1.2, u * 0.8);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(-u * 1.0, -u * 3.2, u * 0.4, u * 1.8);
      break;
    case 'banquinho':
      ctx.fillStyle = '#d8402a';
      ctx.fillRect(-u * 1.3, -u * 2.4, u * 2.6, u * 0.6);
      ctx.strokeRect(-u * 1.3, -u * 2.4, u * 2.6, u * 0.6);
      ctx.fillRect(-u * 1.1, -u * 1.8, u * 0.4, u * 1.8);
      ctx.fillRect(u * 0.7, -u * 1.8, u * 0.4, u * 1.8);
      break;
    case 'pneu':
      ctx.fillStyle = '#1a1a1c';
      ctx.beginPath();
      ctx.ellipse(0, -u * 2, u * 2, u * 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4a4a4e';
      ctx.beginPath();
      ctx.ellipse(0, -u * 2, u * 0.9, u * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    default:
      ctx.fillStyle = '#999';
      ctx.fillRect(-u, -u * 2, u * 2, u * 2);
  }
  ctx.restore();
}

// toldo e balcão de cada tipo de lugar
const PLACE_LOOK = {
  boteco: { toldo: ['#c8342b', '#f1ece0'], balcao: '#6e4a2c', tampo: '#9a6d43', letra: '#ffd21f' },
  acai: { toldo: ['#5a1f7a', '#8a3fb0'], balcao: '#3a1450', tampo: '#6a2a8a', letra: '#f2e6ff' },
  pastelaria: { toldo: ['#e8b020', '#c8342b'], balcao: '#8a5a22', tampo: '#d9a040', letra: '#fff6d0' },
};

/** Boteco, açaí ou pastelaria: balcão, toldo listrado, letreiro e o que fica em cima do balcão. */
export function drawPlace(ctx, pl, cam, ppu) {
  const look = PLACE_LOOK[pl.kind];
  if (!look || !pl.counter) return;
  const k = pl.counter;
  // barraca solta no meio do calçadão com arte pintada: a imagem e o nome na placa do toldo
  const art = pl.side === 'meio' ? ART[`barraca_${pl.kind}`] : null;
  const im = art && images[artKey(`barraca_${pl.kind}`, art.files[0])];
  if (im) {
    cam.toScreen(k.x0, k.y1, a);
    const s = ((k.x1 - k.x0) / art.w) * (ppu / ART_S);
    ctx.drawImage(im, a.x - art.padX * ART_S * s, a.y - art.top * ART_S * s, im.width * s, im.height * s);
    const label = pl.sign || pl.kind.toUpperCase();
    const [px, py, pw] = art.placa;
    const fs = Math.max(8, ppu * 0.3);
    ctx.font = `900 ${fs}px "Barlow Semi Condensed", "Arial Narrow", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = look.letra;
    const ox = a.x - art.padX * ART_S * s;
    const oy = a.y - art.top * ART_S * s;
    ctx.fillText(label, ox + px * s, oy + py * s, pw * s * 0.9);
    ctx.textBaseline = 'alphabetic';
    return;
  }
  const hp = 1.1 * ppu;
  cam.toScreen(k.x0, k.y1, a);
  cam.toScreen(k.x1, k.y1, b);
  c.x = b.x; c.y = b.y - hp; d.x = a.x; d.y = a.y - hp;
  quad(ctx, look.balcao, 'rgba(0,0,0,0.6)');
  cam.toScreen(k.x0, k.y0, a); cam.toScreen(k.x1, k.y0, b); cam.toScreen(k.x1, k.y1, c); cam.toScreen(k.x0, k.y1, d);
  a.y -= hp; b.y -= hp; c.y -= hp; d.y -= hp;
  quad(ctx, look.tampo, 'rgba(0,0,0,0.5)');
  // toldo provisório: uma faixa lisa na cor do lugar, com o nome em cima
  const th = 2.6 * ppu;
  const meio = pl.side === 'meio';
  cam.toScreen(k.x0 - (meio ? 0.4 : 0), k.y0 - 0.4, a);
  cam.toScreen(k.x1 + (meio ? 0.4 : 1.2), k.y1 + 0.4, c);
  const wd = c.x - a.x;
  ctx.fillStyle = look.toldo[0];
  ctx.fillRect(a.x, a.y - th, wd, (c.y - a.y) * 0.5);
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(a.x, a.y - th, wd, (c.y - a.y) * 0.5);
  const label = pl.sign || pl.kind.toUpperCase();
  const fs = Math.max(9, ppu * 0.42);
  ctx.font = `900 ${fs}px "Barlow Semi Condensed", "Arial Narrow", sans-serif`;
  ctx.textAlign = 'center';
  const lw = Math.min(wd + ppu, ctx.measureText(label).width + fs);
  ctx.fillStyle = 'rgba(20,16,14,0.85)';
  ctx.fillRect(a.x + wd / 2 - lw / 2, a.y - th - fs * 1.25, lw, fs * 1.2);
  ctx.fillStyle = look.letra;
  ctx.fillText(label, a.x + wd / 2, a.y - th - fs * 0.32, wd + ppu);
}

/** Tapume que fecha a escadaria do pé do morro até o nível da meta. */
export function drawGate(ctx, w, cam, ppu, level) {
  const g = w.gate;
  const hp = 2.2 * ppu;
  cam.toScreen(g.x0 - 0.3, w.orlaTop + 0.3, a);
  cam.toScreen(g.x1 + 0.3, w.orlaTop + 0.3, b);
  const n = 7;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = i % 2 ? '#f0efe8' : '#e06a1b';
    ctx.fillRect(a.x + ((b.x - a.x) * i) / n, a.y - hp, (b.x - a.x) / n + 0.5, hp);
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 2;
  ctx.strokeRect(a.x, a.y - hp, b.x - a.x, hp);
  ctx.fillStyle = '#141117';
  ctx.fillRect(a.x, a.y - hp * 0.62, b.x - a.x, hp * 0.3);
  ctx.fillStyle = '#ffd21f';
  ctx.font = `900 ${Math.max(10, ppu * 0.55)}px "Barlow Semi Condensed", "Arial Narrow", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`FECHADO · NÍVEL ${ROUTE.orla.unlockLevel}`, (a.x + b.x) / 2, a.y - hp * 0.4);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(`VOCÊ: ${level}`, (a.x + b.x) / 2, a.y - hp - 4);
}

/** Próximo ponto da rota para onde a seta aponta, ou null. */
export function routeGoal(game, out) {
  const w = game.world;
  if (!w) return null;
  const p = game.player;
  if (game.segment === 'orla') {
    if (!w.gateOpen) return null;
    out.x = (w.gate.x0 + w.gate.x1) / 2;
    out.y = w.orlaTop - 1;
    out.label = 'MORRO';
    return out;
  }
  // no morro: a próxima junta acima; perto do topo, o fundo da laje do topo
  let ri = p.ri >= 0 ? p.ri : 2;
  // em cima da passagem: já aponta a próxima, para a seta não sumir
  if (ri < w.joints.length && Math.hypot(w.joints[ri].x - p.x, w.joints[ri].y - p.y) < 2.5) ri++;
  if (ri >= w.path.length - 1) {
    deliveryPoint(w, out);
  } else {
    out.x = w.joints[ri].x;
    out.y = w.joints[ri].y;
  }
  out.label = w.exitOpen ? 'ENTREGA' : 'SUBIDA';
  return out;
}

/** Setas pintadas no chão do Juninho até o próximo ponto da rota. */
export function drawGroundArrows(ctx, game, cam, ppu, t) {
  const goal = routeGoal(game, {});
  if (!goal) return;
  const p = game.player;
  const dx = goal.x - p.x;
  const dy = goal.y - p.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 1.5) return;
  const ux = dx / dist;
  const uy = dy / dist;
  const pulse = 0.55 + 0.45 * Math.sin(t * 6);
  const L = ppu * 0.7;
  for (let i = 0; i < 6; i++) {
    const s = 1.8 + i * 2.2 + ((t * 2.2) % 2.2);
    if (s > dist) break;
    const x = p.x + ux * s;
    const y = p.y + uy * s;
    cam.toScreen(x, y, a);
    cam.toScreen(x + ux * 0.9, y + uy * 0.9, b);
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(Math.atan2(b.y - a.y, b.x - a.x));
    ctx.globalAlpha = pulse * (1 - i / 7);
    ctx.fillStyle = '#ffd21f';
    ctx.strokeStyle = 'rgba(20,16,14,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(L, 0);
    ctx.lineTo(-L * 0.6, -L * 0.7 * cam.k);
    ctx.lineTo(-L * 0.2, 0);
    ctx.lineTo(-L * 0.6, L * 0.7 * cam.k);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

/** Seta na borda da tela quando o próximo ponto da rota está fora dela. */
export function drawEdgeArrow(ctx, game, cam, dpr, t) {
  const goal = routeGoal(game, {});
  if (!goal) return;
  cam.toScreen(goal.x, goal.y, a);
  const top = cam.playTop + 125; // abaixo do plantão da TV, que cobre o alto da tela
  const bot = cam.playBottom - 30;
  if (a.x > 20 && a.x < cam.viewW - 20 && a.y > top && a.y < bot) return;
  const cx = cam.viewW / 2;
  const cy = (top + bot) / 2;
  let dx = a.x - cx;
  let dy = a.y - cy;
  const sx = (cam.viewW / 2 - 34) / Math.abs(dx || 1e-6);
  const sy = ((bot - top) / 2) / Math.abs(dy || 1e-6);
  const s = Math.min(sx, sy);
  const x = cx + dx * s;
  const y = cy + dy * s;
  const ang = Math.atan2(dy, dx);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const L = 22 + Math.sin(t * 7) * 3;
  ctx.fillStyle = '#ffd21f';
  ctx.strokeStyle = '#141117';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(L, 0);
  ctx.lineTo(-L * 0.6, -L * 0.75);
  ctx.lineTo(-L * 0.25, 0);
  ctx.lineTo(-L * 0.6, L * 0.75);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#ffd21f';
  ctx.strokeStyle = '#141117';
  ctx.lineWidth = 3;
  ctx.font = '900 13px "Barlow Semi Condensed", "Arial Narrow", sans-serif';
  ctx.textAlign = 'center';
  const lx = Math.max(40, Math.min(cam.viewW - 40, x - Math.cos(ang) * 34));
  const ly = y - Math.sin(ang) * 34 + 4;
  ctx.strokeText(goal.label, lx, ly);
  ctx.fillText(goal.label, lx, ly);
}

/**
 * Destino do trecho bem marcado: anel pulsando no chão e coluna de luz ('chao', antes dos personagens)
 * e a placa com a caixa de pizza ('placa', por cima de tudo). Orla: a escadaria; Morro: a entrega.
 */
export function drawGoalBeacon(ctx, game, cam, ppu, t, layer) {
  const w = game.world;
  if (!w || game.delivered) return;
  let label;
  if (game.segment === 'orla') {
    if (!w.gateOpen) return;
    c.x = (w.gate.x0 + w.gate.x1) / 2;
    c.y = w.orlaTop + 0.6;
    label = 'SUBIDA DO MORRO';
  } else {
    deliveryPoint(w, c);
    label = w.exitOpen ? 'ENTREGA AQUI' : `ENTREGA · NÍVEL ${ROUTE.morro.unlockLevel}`;
  }
  cam.toScreen(c.x, c.y, a);
  if (a.x < -300 || a.x > cam.viewW + 300 || a.y < -200 || a.y > cam.viewH + 900) return;
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);
  const H = 7 * ppu;
  if (layer === 'chao') {
    ctx.fillStyle = 'rgba(255,210,31,0.16)';
    ctx.beginPath();
    ctx.ellipse(a.x, a.y, 1.6 * ppu, 1.6 * ppu * cam.k, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(255,210,31,${0.55 + 0.4 * pulse})`;
    ctx.lineWidth = 3;
    for (const rr of [1.6, 1.6 + pulse * 1.2]) {
      ctx.beginPath();
      ctx.ellipse(a.x, a.y, rr * ppu, rr * ppu * cam.k, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    const gr = ctx.createLinearGradient(0, a.y - H, 0, a.y);
    gr.addColorStop(0, 'rgba(255,210,31,0)');
    gr.addColorStop(1, `rgba(255,210,31,${0.25 + 0.15 * pulse})`);
    ctx.fillStyle = gr;
    ctx.fillRect(a.x - ppu * 0.9, a.y - H, ppu * 1.8, H);
    return;
  }
  // placa flutuando no alto da coluna: caixa de pizza e o texto
  const y = a.y - H * 0.8 - Math.sin(t * 3) * 4;
  const fs = Math.max(11, ppu * 0.42);
  ctx.font = `900 ${fs}px "Barlow Semi Condensed", "Arial Narrow", sans-serif`;
  const tw = ctx.measureText(label).width;
  const bw = tw + fs * 2.6;
  const bh = fs * 1.7;
  ctx.fillStyle = 'rgba(20,16,14,0.9)';
  ctx.fillRect(a.x - bw / 2, y - bh, bw, bh);
  ctx.strokeStyle = '#ffd21f';
  ctx.lineWidth = 2;
  ctx.strokeRect(a.x - bw / 2, y - bh, bw, bh);
  // caixa de pizza
  const px = a.x - bw / 2 + fs * 0.5;
  const py = y - bh / 2;
  ctx.fillStyle = '#e9e1cf';
  ctx.fillRect(px, py - fs * 0.45, fs * 1.3, fs * 0.9);
  ctx.fillStyle = '#c8342b';
  ctx.fillRect(px + fs * 0.2, py - fs * 0.25, fs * 0.9, fs * 0.5);
  ctx.fillStyle = '#ffd21f';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, px + fs * 1.6, py + 1);
  ctx.textBaseline = 'alphabetic';
  // pino até o chão
  ctx.beginPath();
  ctx.moveTo(a.x - 7, y);
  ctx.lineTo(a.x + 7, y);
  ctx.lineTo(a.x, y + 12);
  ctx.closePath();
  ctx.fill();
}

/** Linha vermelha de mira do traficante (aviso antes do tiro) e o alvo no chão. */
export function drawAim(ctx, e, cam, pt, h, ppu, t) {
  cam.toScreen(e.ax, e.ay, a);
  const al = 0.45 + 0.45 * Math.sin(t * 30);
  ctx.strokeStyle = `rgba(255,40,40,${al})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pt.x, pt.y - h * 0.62);
  ctx.lineTo(a.x, a.y - ppu * 0.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(a.x, a.y, ppu * 0.5, ppu * 0.5 * cam.k, 0, 0, Math.PI * 2);
  ctx.stroke();
}

/** Bala: risco amarelo no sentido do tiro, na altura do peito. */
export function drawBullet(ctx, s, pt, ppu, playerPx) {
  const l = Math.hypot(s.vx, s.vy) || 1;
  const ux = s.vx / l;
  const uy = s.vy / l;
  const y = pt.y - playerPx * 0.5;
  ctx.strokeStyle = '#ffe27a';
  ctx.lineWidth = Math.max(2, ppu * 0.08);
  ctx.beginPath();
  ctx.moveTo(pt.x - ux * ppu * 0.9, y - uy * ppu * 0.9 * 0.6);
  ctx.lineTo(pt.x, y);
  ctx.stroke();
}

/** Coco gelado e marmita (curas dos lugares). */
export function drawHeal(ctx, kind, x, y, s) {
  const u = s / 10;
  ctx.save();
  ctx.translate(x, y);
  ctx.lineWidth = Math.max(1, u * 0.3);
  ctx.strokeStyle = 'rgba(20,16,14,0.8)';
  if (kind === 'coco') {
    ctx.fillStyle = '#5f9e3a';
    ctx.beginPath();
    ctx.arc(0, -u * 2, u * 1.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#f04a8a';
    ctx.lineWidth = Math.max(1.5, u * 0.4);
    ctx.beginPath();
    ctx.moveTo(u * 0.3, -u * 3.4);
    ctx.lineTo(u * 1.4, -u * 5.2);
    ctx.stroke();
  } else if (kind === 'acai') {
    // copo de açaí com granola e banana
    ctx.fillStyle = '#4a1a5e';
    ctx.beginPath();
    ctx.moveTo(-u * 1.6, -u * 4.2);
    ctx.lineTo(u * 1.6, -u * 4.2);
    ctx.lineTo(u * 1.1, 0);
    ctx.lineTo(-u * 1.1, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#7a2fa0';
    ctx.beginPath();
    ctx.ellipse(0, -u * 4.3, u * 1.7, u * 0.8, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#e8c890';
    ctx.fillRect(-u * 1.0, -u * 4.9, u * 0.5, u * 0.4);
    ctx.fillRect(u * 0.3, -u * 5.0, u * 0.6, u * 0.4);
    ctx.fillStyle = '#f2e27a';
    ctx.beginPath();
    ctx.arc(-u * 0.1, -u * 5.0, u * 0.45, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'pastel') {
    ctx.fillStyle = '#e8b04a';
    ctx.beginPath();
    ctx.arc(0, -u * 0.8, u * 2.4, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(140,80,20,0.7)';
    ctx.beginPath();
    for (let i = -2; i <= 2; i++) {
      ctx.moveTo(i * u * 0.9, -u * 0.8);
      ctx.lineTo(i * u * 0.9, -u * 1.3);
    }
    ctx.stroke();
  } else if (kind === 'milho') {
    ctx.fillStyle = '#f2c94c';
    ctx.beginPath();
    ctx.ellipse(0, -u * 2.6, u * 0.9, u * 2.4, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#7aa83a';
    ctx.beginPath();
    ctx.moveTo(-u * 0.6, -u * 0.6);
    ctx.lineTo(-u * 1.8, -u * 3.4);
    ctx.lineTo(-u * 0.2, -u * 1.4);
    ctx.fill();
  } else {
    ctx.fillStyle = '#c9cbd0';
    ctx.fillRect(-u * 2, -u * 2.6, u * 4, u * 2.2);
    ctx.strokeRect(-u * 2, -u * 2.6, u * 4, u * 2.2);
    ctx.fillStyle = '#e8e9ec';
    ctx.fillRect(-u * 2.2, -u * 3.0, u * 4.4, u * 0.6);
  }
  ctx.restore();
}

/** Algum ponto da tela está dentro de uma laje visível? (para não desenhar setas por baixo) */
export const onPlatform = (w, x, y) => w.platforms.some((P) => inside(P, x, y));
