// Desenho provisório (em código) do mundo da rota: lajes com escada, objetos de cena, boteco,
// mira do traficante e balas. Sai quando a arte do guia chegar (o tapume e o holofote estão em render_carreira.js).
import { OBJ_ALTURA, OBJ_ESCALA, PLACES, ENEMIES } from './config.js';
import { drawPecaFavela } from './render_favela.js';
import { inside } from './mundo.js';
import { images } from './sprites.js';
import { ART, ART_S, artKey, artFile } from './arte_cenario.js';

const a = { x: 0, y: 0 };
const b = { x: 0, y: 0 };
const c = { x: 0, y: 0 };
const d = { x: 0, y: 0 };

/** Profundidade de desenho: quem está em cima de uma laje vai depois da laje. */
export function entityDepth(cam, e) {
  if (e.plat && e.lvl === 1) return cam.depth(e.x, e.plat.y1) + 0.003 + (e.y - e.plat.y0) * 1e-4;
  // na escada da casa com laje: a escada faz parte do desenho da casa, então quem sobe fica na frente dele
  if (e.plat) return Math.max(cam.depth(e.x, e.y), cam.depth(e.x, e.plat.y1) + 0.002 + (e.y - e.plat.y0) * 1e-4);
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

/** Torre do salva-vidas desenhada (deque, cabine, bandeiras e a escada): o canto da frente, à esquerda, no chão. */
function drawSalvaVidasArte(ctx, P, cam, ppu, im) {
  const A = PLACES.salvaVidasArte;
  const s = ppu / A.pxPorM;
  cam.toScreen(P.x0, P.y1, a);
  ctx.drawImage(im, a.x - A.canto[0] * s, a.y - A.canto[1] * s, im.width * s, im.height * s);
}

/** Laje, terraço ou torre: tampo na altura h e a fachada da frente. */
const casaLajePeca = (P) => (P.stair.x1 <= P.x0 + 0.01 ? 'casa_laje_esq' : 'casa_laje_dir');

export function drawPlatform(ctx, P, cam, ppu) {
  if (P.kind === 'salva_vidas' && images.salva_vidas) return drawSalvaVidasArte(ctx, P, cam, ppu, images.salva_vidas);
  // casa com laje da favela: a arte já traz a escada, do lado em que ela fica
  if (P.kind === 'laje_casa' && drawPecaFavela(ctx, casaLajePeca(P), P.x0, P.y1, cam, ppu)) return;
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
  if (P.kind === 'salva_vidas' && images.salva_vidas) return; // a escada já está no desenho da torre
  if (P.kind === 'laje_casa' && images[`fav_${casaLajePeca(P)}`]) return; // a escada já está na arte da casa
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

export function drawObject(ctx, kind, x, y, s, rot = 0, dir = 's', v = 0) {
  // arte gerada: base do objeto no chão em (x, y); s = 0,42 da altura do Juninho na tela
  const [vd, flip] = VISTA[dir] || VISTA.s;
  // arrancado do cenário com mais de uma arte (guarda-sol): a mesma variação que estava no chão
  const varia = ART[kind] && ART[kind].files.length > 1 ? images[`obj_${kind}_${artFile(kind, v)}`] : null;
  const im = images[`obj_${kind}_${vd}`] || varia || images[`obj_${kind}`];
  const A = !im && ART[kind];
  const ima = A && images[artKey(kind, artFile(kind, v) || 'a')];
  if (ima) {
    // arrancado do cenário (lixeira, guarda-sol, isopor): a arte do cenário, do tamanho que tinha no chão
    // (o Juninho tem uns 1,6 m de cenário na tela), sem a sombra que fica abaixo da linha do chão
    const k = s / 0.42 / 1.6 / ART_S;
    const sh = Math.min(ima.height, A.top * ART_S);
    const cx = (A.padX + A.w / 2) * ART_S;
    ctx.save();
    ctx.translate(x, y - (sh * k) / 2);
    if (rot) ctx.rotate(rot);
    ctx.drawImage(ima, 0, 0, ima.width, sh, -cx * k, (-sh * k) / 2, ima.width * k, sh * k);
    ctx.restore();
    return;
  }
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
    const [px, py, pw, inc = 0] = art.placa;
    const fs = Math.max(8, ppu * 0.3);
    const ox = a.x - art.padX * ART_S * s;
    const oy = a.y - art.top * ART_S * s;
    // o texto segue a inclinação da placa no desenho: as letras ficam em pé e a linha desce junto com a placa
    ctx.save();
    ctx.transform(1, inc, 0, 1, ox + px * s, oy + py * s);
    ctx.font = `900 ${fs}px "Barlow Semi Condensed", "Arial Narrow", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = look.letra;
    ctx.fillText(label, 0, 0, pw * s * 0.9);
    ctx.restore();
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

/** As duas linhas de mira do Chefe do Tráfico gigante (D91): uma de cada arma, fechando no ponto travado. */
export function drawAimDupla(ctx, e, cam, pt, h, ppu, t) {
  const C = ENEMIES.chefe_trafico.canoM;
  const dx = e.ax - e.x;
  const dy = e.ay - e.y;
  const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l;
  const uy = dy / l;
  cam.toScreen(e.ax, e.ay, a);
  const al = 0.45 + 0.45 * Math.sin(t * 30);
  ctx.strokeStyle = `rgba(255,40,40,${al})`;
  ctx.lineWidth = 2;
  for (const lado of [-1, 1]) {
    cam.toScreen(e.x - uy * C * lado, e.y + ux * C * lado, b2);
    ctx.beginPath();
    ctx.moveTo(b2.x, b2.y - h * 0.5);
    ctx.lineTo(a.x, a.y - ppu * 0.9);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(a.x, a.y, ppu * 0.6, ppu * 0.6 * cam.k, 0, 0, Math.PI * 2);
  ctx.stroke();
}
const b2 = { x: 0, y: 0 };

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
