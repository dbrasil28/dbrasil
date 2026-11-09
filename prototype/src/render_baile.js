// Desenho do baile da esplanada (D91, baile.js e dj.js): as TVs no fundo (clipe, depois o Plantão com O Acordão
// em silhueta), o palco, a barricada do portão, as luzes de néon girando no chão, os anéis do grave do DJ e,
// por cima de tudo, a noite que cai só ali, com os buracos de luz. E a TV grande na tela durante o Plantão.
import { BAILE } from './config.js';
import { images, ARTE_BAILE } from './sprites.js';
import { palcoDoBaile } from './cenario.js';

const a = { x: 0, y: 0 };
const b = { x: 0, y: 0 };
const pos = { x: 0, y: 0, w: 0, h: 0, s: 1 };
let escuro = null;

const clamp01 = (v) => Math.max(0, Math.min(1, v));
/** O pulso do batidão (0 a 1, forte na batida). */
const pulso = (t) => Math.pow(1 - ((t * BAILE.pulsoBpm) / 60) % 1, 3);

/**
 * Onde a arte de uma peça cai na tela: o pé dela (art.base) no ponto (x, y) do chão, com mPorPx metros por pixel da
 * arte, a mesma escala nos dois eixos (a arte vem de frente, no ângulo do jogo: nada se espreme nem se gira).
 */
function arteNoChao(cam, im, art, x, y, mPorPx, ppu, out) {
  cam.toScreen(x, y, out);
  const s = mPorPx * ppu;
  out.s = s;
  out.x -= art.base[0] * s;
  out.y -= art.base[1] * s;
  out.w = im.width * s;
  out.h = im.height * s;
  return out;
}

/** As TVs do fundo da esplanada: (x, y) no chão do fundo; o desenho sobe BAILE.tv.altura. */
export function tvsDoBaile(w) {
  const k = w.baile;
  const pc = palcoDoBaile(w);
  const pt = w.path[w.portaoI];
  const xs = [k.x0 + 2.2, pc.x, pt ? (pt.x1 + k.x1) / 2 : k.x1 - 2.2];
  return xs.map((x) => ({ x, y: k.y0 + 0.15 }));
}

/** Onde estão as luzes de néon agora (giram pela pista). */
function luzes(w, t, out) {
  const k = w.baile;
  const L = BAILE.luzes;
  const cx = (k.x0 + k.x1) / 2;
  const cy = (k.y0 + k.y1) / 2 + 1;
  out.length = 0;
  for (let i = 0; i < L.n; i++) {
    const ang = (t * Math.PI * 2) / L.giroS * (i % 2 ? 1 : -1) + (i * Math.PI * 2) / L.n;
    out.push({ x: cx + Math.cos(ang) * (k.x1 - k.x0) * 0.32, y: cy + Math.sin(ang) * (k.y1 - k.y0) * 0.3, cor: L.cores[i % L.cores.length] });
  }
  return out;
}
const luzTmp = [];

/** O que passa na tela de cada TV: clipe colorido, o Plantão com as duas cabeças, ou chiado. */
function telaDaTv(ctx, x, y, wd, ht, game, t) {
  const S = game.baile;
  const fase = S ? S.fase : 'festa';
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, wd, ht);
  ctx.clip();
  if (fase === 'festa' || !S) {
    // clipe: faixas de cor andando no batidão
    const n = 5;
    for (let i = 0; i < n; i++) {
      const cor = BAILE.luzes.cores[(i + Math.floor(t * 2)) % BAILE.luzes.cores.length];
      ctx.fillStyle = `rgba(${cor},${0.55 + 0.4 * pulso(t + i * 0.1)})`;
      ctx.fillRect(x + (i / n) * wd, y, wd / n + 1, ht);
    }
  } else if (fase === 'fim') {
    ctx.fillStyle = '#1a1a22';
    ctx.fillRect(x, y, wd, ht);
    chiado(ctx, x, y, wd, ht, t, 0.35);
  } else {
    plantao(ctx, x, y, wd, ht, t, fase !== 'plantao');
  }
  ctx.restore();
}

/** A tela do Plantão: fundo azul de estúdio, faixa vermelha e O Acordão em silhueta (duas cabeças, um terno). */
function plantao(ctx, x, y, wd, ht, t, comChiado) {
  const g = ctx.createLinearGradient(x, y, x, y + ht);
  g.addColorStop(0, '#2a5fa8');
  g.addColorStop(1, '#0e2a55');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, wd, ht);
  silhueta(ctx, x + wd / 2, y + ht * 0.98, ht * 0.78, t);
  ctx.fillStyle = '#d91a24';
  ctx.fillRect(x, y + ht * 0.78, wd, ht * 0.22);
  ctx.fillStyle = '#fff';
  ctx.font = `700 ${Math.max(6, ht * 0.15)}px "Anton", Impact, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('PLANTÃO', x + wd * 0.04, y + ht * 0.89, wd * 0.5);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffd21f';
  ctx.fillText('AO VIVO · BRASÍLIA', x + wd * 0.97, y + ht * 0.89, wd * 0.48);
  if (comChiado) chiado(ctx, x, y, wd, ht, t, 0.18);
}

/** O Acordão em silhueta: ombros largos de terno e duas cabeças, mexendo um pouco cada uma. */
export function silhueta(ctx, cx, base, alt, t) {
  const u = alt / 10;
  ctx.fillStyle = '#05060a';
  ctx.beginPath();
  // terno: ombros largos, um corpo só
  ctx.moveTo(cx - u * 4.6, base);
  ctx.quadraticCurveTo(cx - u * 4.6, base - u * 3.6, cx - u * 2.8, base - u * 4.3);
  ctx.lineTo(cx + u * 2.8, base - u * 4.3);
  ctx.quadraticCurveTo(cx + u * 4.6, base - u * 3.6, cx + u * 4.6, base);
  ctx.closePath();
  ctx.fill();
  // as duas cabeças, cada uma no seu pescoço, mexendo fora de compasso
  for (const [dx, f] of [[-1.55, 0], [1.55, 1.7]]) {
    const hx = cx + dx * u + Math.sin(t * 2.2 + f) * u * 0.18;
    const hy = base - u * 6.4 + Math.cos(t * 1.9 + f) * u * 0.12;
    ctx.fillRect(hx - u * 0.45, base - u * 5.0, u * 0.9, u * 1.0);
    ctx.beginPath();
    ctx.ellipse(hx, hy, u * 1.25, u * 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // a gravata (o único detalhe que aparece)
  ctx.fillStyle = '#3b0a10';
  ctx.beginPath();
  ctx.moveTo(cx - u * 0.35, base - u * 4.3);
  ctx.lineTo(cx + u * 0.35, base - u * 4.3);
  ctx.lineTo(cx + u * 0.5, base - u * 1.2);
  ctx.lineTo(cx, base - u * 0.6);
  ctx.lineTo(cx - u * 0.5, base - u * 1.2);
  ctx.closePath();
  ctx.fill();
}

function chiado(ctx, x, y, wd, ht, t, forca) {
  const n = 40;
  for (let i = 0; i < n; i++) {
    const s = ((i * 0.6180339 + Math.floor(t * 24) * 0.3247) % 1);
    const r = ((i * 0.7548777 + Math.floor(t * 24) * 0.5698) % 1);
    ctx.fillStyle = `rgba(255,255,255,${(forca * (0.4 + 0.6 * r)).toFixed(3)})`;
    ctx.fillRect(x + s * wd, y + r * ht, wd * 0.08, Math.max(1, ht * 0.03));
  }
}

/** No chão, antes dos personagens: luzes de néon, TVs no fundo, a barricada do portão e os anéis do DJ. */
export function drawBaileChao(ctx, game, cam, ppu, t, bounds) {
  const w = game.world;
  if (!w || !w.baile) return;
  const k = w.baile;
  if (k.y1 < bounds.minY - 4 || k.y0 > bounds.maxY + 4) {
    drawAneis(ctx, game, cam, ppu, t);
    return;
  }
  const noite = game.noiteBaile || 0;
  // as luzes de néon girando na pista (só de noite)
  if (noite > 0.02) {
    const L = BAILE.luzes;
    const pu = 0.65 + 0.35 * pulso(t);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const l of luzes(w, t, luzTmp)) {
      cam.toScreen(l.x, l.y, a);
      const R = L.raioM * ppu;
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.scale(1, cam.k);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
      g.addColorStop(0, `rgba(${l.cor},${(0.42 * noite * pu).toFixed(3)})`);
      g.addColorStop(0.6, `rgba(${l.cor},${(0.16 * noite * pu).toFixed(3)})`);
      g.addColorStop(1, `rgba(${l.cor},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(-R, -R, R * 2, R * 2);
      ctx.restore();
    }
    ctx.restore();
  }
  drawAneis(ctx, game, cam, ppu, t);
}

/** Uma TV no muro do fundo (entra na ordem de profundidade, na frente das casas do fundo). */
export function drawTvBaile(ctx, game, cam, ppu, t, tv) {
  const T = BAILE.tv;
  const im = images.baile_tv;
  if (im) {
    // a TV do Figma no pé de ferro; o que passa nela vai no retângulo da tela da arte
    const A = ARTE_BAILE.tv;
    const [x0, y0, x1, y1] = A.tela;
    const r = arteNoChao(cam, im, A, tv.x, tv.y, T.larg / (x1 - x0), ppu, pos);
    ctx.drawImage(im, r.x, r.y, r.w, r.h);
    telaDaTv(ctx, r.x + x0 * r.s, r.y + y0 * r.s, (x1 - x0) * r.s, (y1 - y0) * r.s, game, t);
    return;
  }
  cam.toScreen(tv.x - T.larg / 2, tv.y, a);
  cam.toScreen(tv.x + T.larg / 2, tv.y, b);
  const wd = b.x - a.x;
  const ht = T.alt * ppu;
  const x = a.x;
  const y = a.y - T.altura * ppu - ht;
  ctx.fillStyle = '#111014';
  ctx.fillRect(x - wd * 0.05, y - ht * 0.08, wd * 1.1, ht * 1.16);
  telaDaTv(ctx, x, y, wd, ht, game, t);
  // o pé de ferro até o chão
  ctx.fillStyle = '#2b2830';
  ctx.fillRect(x + wd * 0.46, y + ht * 1.08, wd * 0.08, T.altura * ppu - ht * 0.08);
}

/** A barricada que fecha o portão do fundo até o DJ cair; abrindo, ela some descendo. */
export function drawBarricadaBaile(ctx, game, cam, ppu) {
  const w = game.world;
  const k = w.baile;
  const pt = w.path[w.portaoI];
  const im = images.cen_barricada_a;
  const abriu = w.portaoAberto ? clamp01((game.t - (w.portaoT ?? -9)) / 0.9) : 0;
  if (!pt || !im || abriu >= 1) return;
  cam.toScreen(pt.x0 - 0.2, k.y0 + 0.3, a);
  cam.toScreen(pt.x1 + 0.2, k.y0 + 0.3, b);
  const wd = b.x - a.x;
  const ht = wd * (im.height / im.width);
  ctx.save();
  ctx.globalAlpha = 1 - abriu;
  ctx.drawImage(im, a.x, a.y - ht + abriu * ht * 0.6, wd, ht);
  ctx.restore();
}

/** Os anéis do grave do DJ correndo pelo chão (magenta e ciano; o forte do drop, mais grosso e branco). */
function drawAneis(ctx, game, cam, ppu, t) {
  const L = game.djAneis;
  if (!L || !L.length) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const r of L) {
    cam.toScreen(r.x, r.y, a);
    const fade = 1 - clamp01((r.r - r.max * 0.7) / (r.max * 0.3));
    const R = r.r * ppu;
    for (const [cor, larg, al] of [[r.forte ? '255,255,255' : '255,60,200', r.larg, 0.75], ['60,220,255', r.larg * 0.45, 0.6]]) {
      ctx.strokeStyle = `rgba(${cor},${(al * fade).toFixed(3)})`;
      ctx.lineWidth = Math.max(2, larg * ppu * 0.55);
      // o anel com a brecha (o arco que falta é por onde se passa); o ângulo é no chão, achatado como ele
      const b0 = Math.atan2(Math.sin(r.brecha) * cam.k, Math.cos(r.brecha));
      const meia = Math.atan2(Math.sin(r.brechaRad / 2) * cam.k, Math.cos(r.brechaRad / 2));
      ctx.beginPath();
      ctx.ellipse(a.x, a.y, R, R * cam.k, 0, b0 + meia, b0 - meia + Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** Por cima de tudo: a noite que cai só na esplanada, com os buracos de luz (Juninho, TVs, néon) e o brilho. */
export function drawBaileCeu(ctx, game, cam, ppu, t) {
  const w = game.world;
  const noite = game.noiteBaile || 0;
  if (!w || !w.baile || game.segment !== 'morro') return;
  if (noite <= 0.01) {
    canhoes(ctx, game, cam, ppu, t); // de longe, os canhões de luz já aparecem
    return;
  }
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  if (!escuro || escuro.width !== W || escuro.height !== H) {
    escuro = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
  }
  const g = escuro.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, W, H);
  g.setTransform(ctx.getTransform());
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = `rgba(10,4,24,${(BAILE.noite * noite).toFixed(3)})`;
  g.fillRect(-50, -50, cam.viewW + 100, cam.viewH + 100);
  g.globalCompositeOperation = 'destination-out';
  const buraco = (x, y, r, forca = 1, alto = 0) => {
    cam.toScreen(x, y, a);
    const R = r * ppu;
    g.save();
    g.translate(a.x, a.y - alto * ppu);
    g.scale(1, 0.8);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, R);
    gr.addColorStop(0, `rgba(0,0,0,${forca})`);
    gr.addColorStop(0.4, `rgba(0,0,0,${0.75 * forca})`);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(-R, -R, R * 2, R * 2);
    g.restore();
  };
  const p = game.player;
  const k = w.baile;
  // a luz geral da pista: o povo aparece, mais escuro na beira
  buraco((k.x0 + k.x1) / 2, (k.y0 + k.y1) / 2, Math.max(k.x1 - k.x0, k.y1 - k.y0) * 0.55, BAILE.pistaLuz);
  buraco(p.x, p.y, 4.2, 0.85);
  for (const l of luzes(w, t, luzTmp)) buraco(l.x, l.y, BAILE.luzes.raioM, 0.7);
  for (const tv of tvsDoBaile(w)) buraco(tv.x, tv.y, 2.6, 0.95, BAILE.tv.altura);
  for (const d of w.baileDeco || []) if (d.tipo === 'globo') buraco(d.x, d.y, 1.3, 0.6, d.h);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(escuro, 0, 0);
  ctx.restore();
  // o brilho colorido: néon no ar e a luz das TVs (azul do Plantão, ou o clipe)
  const S = game.baile;
  const plant = S && (S.fase === 'plantao' || S.fase === 'sinal' || S.fase === 'luta');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const pu = 0.6 + 0.4 * pulso(t);
  for (const tv of tvsDoBaile(w)) {
    cam.toScreen(tv.x, tv.y, a);
    const R = 3 * ppu;
    const gr = ctx.createRadialGradient(a.x, a.y - BAILE.tv.altura * ppu, 0, a.x, a.y - BAILE.tv.altura * ppu, R);
    const cor = plant ? '90,150,255' : BAILE.luzes.cores[Math.floor(t * 2) % BAILE.luzes.cores.length];
    gr.addColorStop(0, `rgba(${cor},${(0.35 * noite).toFixed(3)})`);
    gr.addColorStop(1, `rgba(${cor},0)`);
    ctx.fillStyle = gr;
    ctx.fillRect(a.x - R, a.y - BAILE.tv.altura * ppu - R, R * 2, R * 2);
  }
  reflexosDoGlobo(ctx, game, cam, ppu, t, noite);
  refletoresAcesos(ctx, game, cam, ppu, t, noite);
  canhoes(ctx, game, cam, ppu, t);
  if (!plant || (S && S.fase === 'luta')) {
    for (const l of luzes(w, t, luzTmp)) {
      cam.toScreen(l.x, l.y, a);
      const R = BAILE.luzes.raioM * ppu * 0.9;
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.scale(1, 0.8);
      const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
      gr.addColorStop(0, `rgba(${l.cor},${(BAILE.luzes.brilho * noite * pu).toFixed(3)})`);
      gr.addColorStop(1, `rgba(${l.cor},0)`);
      ctx.fillStyle = gr;
      ctx.fillRect(-R, -R, R * 2, R * 2);
      ctx.restore();
    }
  }
  ctx.restore();
}

/** Na tela (fora do zoom): a TV grande do Plantão com O Acordão, enquanto o Plantão está no ar. */
export function drawPlantaoTela(ctx, game, cam, t) {
  const S = game.baile;
  if (!S || (S.fase !== 'plantao' && !(S.fase === 'sinal' && S.faseT < 1.2))) return;
  const entra = S.fase === 'plantao' ? clamp01(S.faseT / 0.25) : 1 - clamp01((S.faseT - 0.8) / 0.4);
  if (entra <= 0) return;
  const wd = Math.min(cam.viewW - 48, 300);
  const ht = wd * 0.6;
  const x = (cam.viewW - wd) / 2;
  const y = (cam.playTop || 0) + 112 - (1 - entra) * 30;
  ctx.save();
  ctx.globalAlpha = entra;
  ctx.fillStyle = '#0b0a0e';
  ctx.fillRect(x - 8, y - 8, wd + 16, ht + 16);
  ctx.strokeStyle = '#3a3242';
  ctx.lineWidth = 3;
  ctx.strokeRect(x - 8, y - 8, wd + 16, ht + 16);
  plantao(ctx, x, y, wd, ht, t, S.fase === 'sinal');
  ctx.fillStyle = '#fff';
  ctx.font = `700 ${Math.round(ht * 0.075)}px "Barlow Semi Condensed", "Arial Narrow", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('O RESPONSÁVEL POR TUDO', x + wd / 2, y + ht * 0.04, wd * 0.9);
  ctx.restore();
}

// ---------- o cenário da festa: treliça, globo e canhões com a arte do Figma (D93); o resto em código ----------

const c0 = { x: 0, y: 0 };
const c1 = { x: 0, y: 0 };
const c2 = { x: 0, y: 0 };
const c3 = { x: 0, y: 0 };

/** Uma peça do cenário da festa (entra na ordem de profundidade): mesa do DJ, néon, treliça, canhão ou globo. */
export function drawDecoBaile(ctx, game, cam, ppu, t, o) {
  const noite = game.noiteBaile || 0;
  if (o.tipo === 'mesaDj') mesaDj(ctx, cam, ppu, t, o, noite);
  else if (o.tipo === 'neon') neon(ctx, cam, ppu, t, o, noite);
  else if (o.tipo === 'trelica') trelica(ctx, cam, ppu, t, o, noite);
  else if (o.tipo === 'torre') torre(ctx, cam, ppu, o);
  else if (o.tipo === 'viga') viga(ctx, cam, ppu, t, o, noite);
  else if (o.tipo === 'canhao') canhao(ctx, cam, ppu, o);
  else if (o.tipo === 'globo') globo(ctx, cam, ppu, t, o, noite);
}

/** A treliça na tela (arte do Figma): a arte inteira ocupa de x0 a x1, com o pé no meio de o.y. */
function trelicaNaTela(cam, ppu, o, out) {
  const im = images.baile_trelica;
  return im ? arteNoChao(cam, im, ARTE_BAILE.trelica, o.x, o.y, (o.x1 - o.x0) / im.width, ppu, out) : null;
}

/** O canhão de luz na tela (arte do Figma, altura o.h do pé ao topo). */
function canhaoNaTela(cam, ppu, o, out) {
  const im = images.baile_canhao;
  const A = ARTE_BAILE.canhao;
  return im ? arteNoChao(cam, im, A, o.x, o.y, o.h / (A.base[1] - A.topo), ppu, out) : null;
}

/** Onde sai o facho do canhão (a lente, na tela). */
function lenteDoCanhao(cam, ppu, o, out) {
  const r = canhaoNaTela(cam, ppu, o, pos);
  if (r) {
    out.x = r.x + ARTE_BAILE.canhao.lente[0] * r.s;
    out.y = r.y + ARTE_BAILE.canhao.lente[1] * r.s;
  } else {
    cam.toScreen(o.x, o.y, out);
    out.y -= o.h * ppu * 0.92;
  }
  return out;
}

/** O canhão de luz no chão, com a lente para o céu (o facho vem em canhoes, por cima da noite). */
function canhao(ctx, cam, ppu, o) {
  const r = canhaoNaTela(cam, ppu, o, pos);
  if (r) {
    ctx.drawImage(images.baile_canhao, r.x, r.y, r.w, r.h);
    return;
  }
  // sem a arte: o tambor preto e a lente
  cam.toScreen(o.x, o.y, c0);
  const L = ppu * 0.3;
  const H = o.h * ppu;
  ctx.fillStyle = '#17151a';
  ctx.fillRect(c0.x - L, c0.y - H * 0.45, L * 2, H * 0.45);
  ctx.fillRect(c0.x - L * 0.8, c0.y - H, L * 1.6, H * 0.5);
  ctx.fillStyle = '#d9dde6';
  ctx.beginPath();
  ctx.ellipse(c0.x, c0.y - H * 0.92, L * 0.7, L * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** A mesa do DJ: o case preto, os dois toca-discos girando e a luz do notebook. */
function mesaDj(ctx, cam, ppu, t, o, noite) {
  const H = o.h * ppu;
  cam.toScreen(o.x0, o.y1, c0);
  cam.toScreen(o.x1, o.y1, c1);
  cam.toScreen(o.x1, o.y0, c2);
  cam.toScreen(o.x0, o.y0, c3);
  // tampo
  ctx.fillStyle = '#26232b';
  ctx.beginPath();
  ctx.moveTo(c0.x, c0.y - H);
  ctx.lineTo(c1.x, c1.y - H);
  ctx.lineTo(c2.x, c2.y - H);
  ctx.lineTo(c3.x, c3.y - H);
  ctx.closePath();
  ctx.fill();
  // frente do case, com o nome
  ctx.fillStyle = '#121016';
  ctx.fillRect(c0.x, c0.y - H, c1.x - c0.x, H);
  ctx.strokeStyle = '#5d5866';
  ctx.lineWidth = Math.max(1, ppu * 0.04);
  ctx.strokeRect(c0.x, c0.y - H, c1.x - c0.x, H);
  ctx.fillStyle = `rgba(255,80,210,${(0.55 + 0.45 * noite).toFixed(3)})`;
  ctx.font = `700 ${Math.max(7, H * 0.34)}px "Anton", Impact, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DJ PLANTÃO', (c0.x + c1.x) / 2, c0.y - H * 0.5, (c1.x - c0.x) * 0.9);
  // os toca-discos e o notebook em cima
  const my = (c0.y + c3.y) / 2 - H;
  for (const f of [0.22, 0.78]) {
    const x = c0.x + (c1.x - c0.x) * f;
    ctx.fillStyle = '#0a090c';
    ctx.beginPath();
    ctx.ellipse(x, my, ppu * 0.34, ppu * 0.34 * cam.k, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(200,200,210,0.6)';
    ctx.beginPath();
    ctx.ellipse(x, my, ppu * 0.3, ppu * 0.3 * cam.k, t * 4, 0, Math.PI * 1.2);
    ctx.stroke();
  }
  ctx.fillStyle = `rgba(140,200,255,${(0.5 + 0.4 * noite).toFixed(3)})`;
  ctx.fillRect((c0.x + c1.x) / 2 - ppu * 0.22, my - ppu * 0.32, ppu * 0.44, ppu * 0.28);
}

/** O néon do palco no muro do fundo: o nome do baile piscando no batidão. */
function neon(ctx, cam, ppu, t, o, noite) {
  cam.toScreen(o.x, o.y, c0);
  const y = c0.y - o.h * ppu;
  const fs = Math.max(10, ppu * 0.75);
  ctx.save();
  ctx.font = `400 ${fs}px "Anton", Impact, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const liga = 0.55 + 0.45 * noite * (0.75 + 0.25 * pulso(t));
  ctx.shadowColor = `rgba(255,70,210,${liga.toFixed(3)})`;
  ctx.shadowBlur = fs * 0.8 * (0.4 + noite);
  ctx.lineWidth = Math.max(1.5, fs * 0.09);
  ctx.strokeStyle = `rgba(255,120,225,${liga.toFixed(3)})`;
  ctx.strokeText(o.texto, c0.x, y);
  ctx.fillStyle = `rgba(255,235,250,${(liga * 0.85).toFixed(3)})`;
  ctx.fillText(o.texto, c0.x, y);
  ctx.restore();
}

/** Treliça de iluminação (arte do Figma): duas torres e a viga, com os refletores; o brilho deles vem de noite. */
function trelica(ctx, cam, ppu, t, o, noite) {
  const r = trelicaNaTela(cam, ppu, o, pos);
  if (r) ctx.drawImage(images.baile_trelica, r.x, r.y, r.w, r.h);
  else trelicaDeCodigo(ctx, cam, ppu, t, o, noite);
}

// ---------- a treliça de lado (junto do muro, correndo para o fundo) ----------

/** Quais refletores da arte vão em cada treliça de lado (a do muro da esquerda e a da direita). */
const LUZES_DE_LADO = [[0, 1, 2], [2, 3, 4]];

/** Metros por pixel da arte na treliça de lado (a torre tem a altura do config). */
const mPorPxLado = () => BAILE.cenario.trelicaLado.altM / (ARTE_BAILE.trelica.base[1] - ARTE_BAILE.trelica.topoTorre);

/** Um ponto no ar (x, y no chão, z de altura) na tela. */
function noAr(cam, ppu, x, y, z, out) {
  cam.toScreen(x, y, out);
  out.y -= z * ppu;
  return out;
}

/** Uma torre da treliça de lado: a torre da arte recortada sozinha, em pé no lugar dela (escala da arte). */
function torre(ctx, cam, ppu, o) {
  const im = images.baile_trelica;
  cam.toScreen(o.x, o.y, c0);
  if (!im) {
    torreDeCodigo(ctx, ppu, c0.x, c0.y, o.h * ppu, Math.max(1, ppu * 0.05), Math.max(3, Math.round(o.h * 2)));
    return;
  }
  const T = ARTE_BAILE.trelica.torres[o.lado < 0 ? 0 : 1];
  const s = mPorPxLado() * ppu;
  const ox = c0.x - T.pe[0] * s;
  const oy = c0.y - T.pe[1] * s;
  for (const [x0, y0, x1, y1] of [T.cima, T.baixo]) ctx.drawImage(im, x0, y0, x1 - x0, y1 - y0, ox + x0 * s, oy + y0 * s, (x1 - x0) * s, (y1 - y0) * s);
}

/** Onde cada refletor da viga de lado fica na tela: chama fn(recorte, x, y, escala, cor, lente x, lente y, chão y). */
function luzesDaViga(cam, ppu, o, fn) {
  const L = BAILE.cenario.trelicaLado;
  const A = ARTE_BAILE.trelica;
  const m = mPorPxLado();
  const sp = m * ppu;
  const baixo = o.h - (A.viga[1] - A.topoTorre) * m;
  const quais = LUZES_DE_LADO[o.lado < 0 ? 0 : 1];
  for (let i = 0; i < L.luzes; i++) {
    const y = o.y1 - (L.compM * (i + 1)) / (L.luzes + 1);
    const j = quais[i % quais.length];
    const r = A.luzes[j];
    noAr(cam, ppu, o.x, y, baixo, c1);
    const x = c1.x - ((r[2] - r[0]) / 2) * sp;
    const top = c1.y;
    cam.toScreen(o.x, y, c2);
    fn(r, x, top, sp, A.cores[j], x + (A.lentes[j][0] - r[0]) * sp, top + (A.lentes[j][1] - r[1]) * sp, c2.y);
  }
}

/**
 * A viga da treliça de lado: corre junto do muro, do topo da torre de perto ao da torre de longe. Desenhada em
 * código, na projeção do jogo (a arte é de frente e não se gira); os refletores pendurados são recortes da arte.
 */
function viga(ctx, cam, ppu, t, o, noite) {
  const A = ARTE_BAILE.trelica;
  const m = mPorPxLado();
  const topo = o.h - (A.viga[0] - A.topoTorre) * m;
  const baixo = o.h - (A.viga[1] - A.topoTorre) * m;
  const hw = 0.16;
  const comp = o.y1 - o.y0;
  const n = Math.max(2, Math.round(comp / 0.36));
  const lw = Math.max(1, ppu * 0.045);
  ctx.save();
  ctx.lineCap = 'round';
  // as duas faces (a de trás mais escura) com as barras, um contorno escuro para não sumir no chão, e o
  // zigue-zague; por cima, as travessas do topo
  for (const [dx, cor] of [[-hw, '#86848c'], [hw, '#d2d0d6']]) {
    ctx.beginPath();
    for (const z of [topo, baixo]) {
      noAr(cam, ppu, o.x + dx, o.y1, z, c0);
      noAr(cam, ppu, o.x + dx, o.y0, z, c1);
      ctx.moveTo(c0.x, c0.y);
      ctx.lineTo(c1.x, c1.y);
    }
    ctx.strokeStyle = 'rgba(20,18,24,0.75)';
    ctx.lineWidth = lw * 3;
    ctx.stroke();
    ctx.strokeStyle = cor;
    ctx.lineWidth = lw * 1.8;
    ctx.stroke();
    ctx.lineWidth = lw * 1.1;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const ya = o.y1 - (comp * i) / n;
      const yb = o.y1 - (comp * (i + 1)) / n;
      noAr(cam, ppu, o.x + dx, ya, i % 2 ? topo : baixo, c0);
      noAr(cam, ppu, o.x + dx, yb, i % 2 ? baixo : topo, c1);
      ctx.moveTo(c0.x, c0.y);
      ctx.lineTo(c1.x, c1.y);
    }
    ctx.stroke();
  }
  ctx.strokeStyle = '#a3a1a8';
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const y = o.y1 - (comp * i) / n;
    noAr(cam, ppu, o.x - hw, y, topo, c0);
    noAr(cam, ppu, o.x + hw, y, topo, c1);
    ctx.moveTo(c0.x, c0.y);
    ctx.lineTo(c1.x, c1.y);
  }
  ctx.stroke();
  ctx.restore();
  // os refletores pendurados (recortes da arte; sem ela, uma caixinha com a lente colorida)
  const im = images.baile_trelica;
  luzesDaViga(cam, ppu, o, (r, x, y, sp, cor, lx, ly) => {
    if (im) ctx.drawImage(im, r[0], r[1], r[2] - r[0], r[3] - r[1], x, y, (r[2] - r[0]) * sp, (r[3] - r[1]) * sp);
    else {
      ctx.fillStyle = '#18161b';
      ctx.fillRect(lx - ppu * 0.15, ly - ppu * 0.15, ppu * 0.3, ppu * 0.3);
      ctx.fillStyle = `rgba(${cor},${(0.45 + 0.55 * noite).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(lx, ly, ppu * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/** Uma torre de ferro em código (sem a arte): duas barras e o X entre elas. */
function torreDeCodigo(ctx, ppu, x, y, H, lw, n) {
  const L = ppu * 0.22;
  ctx.strokeStyle = '#8d8a92';
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(x - L, y);
  ctx.lineTo(x - L, y - H);
  ctx.moveTo(x + L, y);
  ctx.lineTo(x + L, y - H);
  for (let i = 0; i < n; i++) {
    const y0 = y - (H * i) / n;
    const y1 = y - (H * (i + 1)) / n;
    ctx.moveTo(x - L, y0);
    ctx.lineTo(x + L, y1);
    ctx.moveTo(x + L, y0);
    ctx.lineTo(x - L, y1);
  }
  ctx.stroke();
}

/** Sem a arte: duas torres de ferro e a viga por cima, com os refletores coloridos. */
function trelicaDeCodigo(ctx, cam, ppu, t, o, noite) {
  const H = o.h * ppu;
  cam.toScreen(o.x0, o.y, c0);
  cam.toScreen(o.x1, o.y, c1);
  const lw = Math.max(1, ppu * 0.05);
  const nx = Math.max(3, Math.round(o.h * 2));
  torreDeCodigo(ctx, ppu, c0.x, c0.y, H, lw, nx);
  torreDeCodigo(ctx, ppu, c1.x, c1.y, H, lw, nx);
  // a viga
  ctx.strokeStyle = '#a6a3ab';
  ctx.lineWidth = lw * 1.4;
  ctx.beginPath();
  ctx.moveTo(c0.x, c0.y - H);
  ctx.lineTo(c1.x, c1.y - H);
  ctx.moveTo(c0.x, c0.y - H + ppu * 0.3);
  ctx.lineTo(c1.x, c1.y - H + ppu * 0.3);
  ctx.stroke();
  // os refletores pendurados na viga
  const n = BAILE.cenario.refletores;
  for (let i = 0; i < n; i++) {
    const f = (i + 0.5) / n;
    const x = c0.x + (c1.x - c0.x) * f;
    const y = c0.y + (c1.y - c0.y) * f - H + ppu * 0.45;
    const cor = BAILE.luzes.cores[i % BAILE.luzes.cores.length];
    ctx.fillStyle = '#18161b';
    ctx.fillRect(x - ppu * 0.15, y - ppu * 0.12, ppu * 0.3, ppu * 0.28);
    ctx.fillStyle = `rgba(${cor},${(0.45 + 0.55 * noite * (0.6 + 0.4 * pulso(t + i * 0.13))).toFixed(3)})`;
    ctx.beginPath();
    ctx.ellipse(x, y + ppu * 0.17, ppu * 0.12, ppu * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** O globo espelhado pendurado no meio da pista (arte do Figma); os brilhos girando e os reflexos vêm de noite. */
function globo(ctx, cam, ppu, t, o, noite) {
  cam.toScreen(o.x, o.y, c0);
  const R = BAILE.cenario.globoRaioM * ppu;
  const y = c0.y - o.h * ppu;
  const im = images.baile_globo;
  if (im) {
    // a bola da arte com o centro em o.h e o raio do config; o cabo sobe da ponta da corrente
    const A = ARTE_BAILE.globo;
    const s = R / A.bola[2];
    const x0 = c0.x - A.bola[0] * s;
    const y0 = y - A.bola[1] * s;
    ctx.strokeStyle = 'rgba(40,38,44,0.9)';
    ctx.lineWidth = Math.max(1, ppu * 0.03);
    ctx.beginPath();
    ctx.moveTo(x0 + A.corrente[0] * s, y0 + A.corrente[1] * s);
    ctx.lineTo(x0 + A.corrente[0] * s, y0 + A.corrente[1] * s - ppu * 2.6);
    ctx.stroke();
    ctx.drawImage(im, x0, y0, im.width * s, im.height * s);
    return;
  }
  ctx.strokeStyle = 'rgba(40,38,44,0.9)';
  ctx.lineWidth = Math.max(1, ppu * 0.03);
  ctx.beginPath();
  ctx.moveTo(c0.x, y - R);
  ctx.lineTo(c0.x, y - R - ppu * 3);
  ctx.stroke();
  ctx.save();
  ctx.beginPath();
  ctx.arc(c0.x, y, R, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#7d8590';
  ctx.fillRect(c0.x - R, y - R, R * 2, R * 2);
  // as plaquinhas de espelho: faixas que andam com o giro, cada uma com um brilho
  const n = 8;
  const cel = (R * 2) / n;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const s = Math.sin(i * 1.7 + j * 2.3 + t * 3);
      ctx.fillStyle = `rgba(${s > 0.6 ? '255,255,255' : '180,195,215'},${(0.35 + 0.5 * Math.abs(s)).toFixed(3)})`;
      const off = ((t * 0.9 * cel) % cel);
      ctx.fillRect(c0.x - R + i * cel - off, y - R + j * cel, cel - 1, cel - 1);
    }
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(20,20,24,0.7)';
  ctx.beginPath();
  ctx.arc(c0.x, y, R, 0, Math.PI * 2);
  ctx.stroke();
}

/** De noite, os refletores das treliças acesos: o brilho na lente, na cor dela, e o cone fraco até o chão. */
function refletoresAcesos(ctx, game, cam, ppu, t, noite) {
  const A = ARTE_BAILE.trelica;
  if (!images.baile_trelica) return;
  for (const o of game.world.baileDeco || []) {
    if (o.tipo === 'viga') {
      let i = 0;
      luzesDaViga(cam, ppu, o, (r, x, y, sp, cor, lx, ly, chao) => luzAcesa(ctx, ppu, t, noite, lx, ly, A.raioLente * sp, cor, chao, i++ + (o.lado > 0 ? 3 : 0)));
      continue;
    }
    if (o.tipo !== 'trelica') continue;
    const r = trelicaNaTela(cam, ppu, o, pos);
    const chao = r.y + A.base[1] * r.s;
    A.lentes.forEach(([lx, ly], i) => luzAcesa(ctx, ppu, t, noite, r.x + lx * r.s, r.y + ly * r.s, A.raioLente * r.s, A.cores[i], chao, i));
  }
}

/** Um refletor aceso: o brilho na lente (raio rl, na tela) e o cone até o chão (chao: y da tela). */
function luzAcesa(ctx, ppu, t, noite, x, y, rl, cor, chao, i) {
  const al = noite * (0.5 + 0.4 * pulso(t + i * 0.13));
  const R = rl * 3.4;
  const g = ctx.createRadialGradient(x, y, 0, x, y, R);
  g.addColorStop(0, `rgba(255,255,255,${(al * 0.9).toFixed(3)})`);
  g.addColorStop(0.28, `rgba(${cor},${(al * 0.75).toFixed(3)})`);
  g.addColorStop(1, `rgba(${cor},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - R, y - R, R * 2, R * 2);
  // o cone de luz descendo (balança um pouco, cada um no seu tempo)
  const lado = Math.sin(t * 1.1 + i * 1.7) * ppu * 0.6;
  const L1 = ppu * 0.9;
  const c = ctx.createLinearGradient(x, y, x, chao);
  c.addColorStop(0, `rgba(${cor},${(al * 0.22).toFixed(3)})`);
  c.addColorStop(1, `rgba(${cor},0)`);
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(x - rl, y);
  ctx.lineTo(x + rl, y);
  ctx.lineTo(x + lado + L1, chao);
  ctx.lineTo(x + lado - L1, chao);
  ctx.closePath();
  ctx.fill();
}

/** Os reflexos do globo correndo pelo chão da pista e os brilhos na bola girando (de noite). */
function reflexosDoGlobo(ctx, game, cam, ppu, t, noite) {
  const w = game.world;
  const g = (w.baileDeco || []).find((d) => d.tipo === 'globo');
  if (!g || noite <= 0.05) return;
  const k = w.baile;
  const C = BAILE.cenario;
  // os brilhos: estrelinhas que passam pela frente da bola, como se ela girasse
  cam.toScreen(g.x, g.y, c1);
  const R = C.globoRaioM * ppu;
  const gy = c1.y - g.h * ppu;
  ctx.fillStyle = '#fff';
  for (let i = 0; i < C.brilhosGlobo; i++) {
    const fase = i * 2.39 + t * 1.2;
    const frente = Math.cos(fase);
    if (frente < 0.25) continue;
    const bx = c1.x + Math.sin(fase) * R * 0.85;
    const by = gy + (((i * 0.618) % 1) - 0.5) * R * 1.5;
    const al = noite * frente * (0.55 + 0.45 * pulso(t + i * 0.21));
    const L = R * 0.42 * frente;
    const e = Math.max(1, ppu * 0.035);
    ctx.globalAlpha = al;
    ctx.fillRect(bx - L, by - e / 2, L * 2, e);
    ctx.fillRect(bx - e / 2, by - L, e, L * 2);
  }
  ctx.globalAlpha = 1;
  const n = C.reflexos;
  ctx.fillStyle = `rgba(255,255,255,${(0.55 * noite).toFixed(3)})`;
  for (let i = 0; i < n; i++) {
    const r = 2 + ((i * 0.6180339) % 1) * Math.min(k.x1 - k.x0, k.y1 - k.y0) * 0.5;
    const ang = (i * 2.399963) + t * 0.6;
    cam.toScreen(g.x + Math.cos(ang) * r, g.y + Math.sin(ang) * r * 0.9, c0);
    const s = Math.max(1.5, ppu * 0.07);
    ctx.fillRect(c0.x - s, c0.y - s * 0.5, s * 2, s);
  }
}

/** Os fachos dos canhões de luz para o céu, saindo da lente e varrendo; acima da tela, a claridade na beira. */
function canhoes(ctx, game, cam, ppu, t) {
  const w = game.world;
  const S = game.baile;
  if (!w.baileDeco || (S && S.fase === 'fim' && S.faseT > BAILE.fimS) || w.portaoAberto) return;
  const K = BAILE.canhoes;
  const k = w.baile;
  const p = game.player;
  const longe = Math.max(0, p.y - k.y1);
  if (longe > K.pertoM) return;
  const perto = 1 - longe / K.pertoM;
  const forca = K.forca * (0.45 + 0.55 * Math.max(perto, game.noiteBaile || 0)) * (S && S.fase === 'fim' ? 1 - clamp01(S.faseT / BAILE.fimS) : 1);
  const bases = w.baileDeco.filter((d) => d.tipo === 'canhao');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  let algumNaTela = false;
  bases.forEach((d, i) => {
    lenteDoCanhao(cam, ppu, d, c0);
    if (c0.y > -40) algumNaTela = true;
    const ang = -Math.PI / 2 + Math.sin(t * ((Math.PI * 2) / K.giroS) + i * 1.3) * K.varreRad + (i % 2 ? 0.12 : -0.12);
    const L = cam.viewH * 1.6;
    const larg0 = ppu * 0.3;
    const larg1 = ppu * 4.5;
    const ux = Math.cos(ang);
    const uy = Math.sin(ang);
    const px = -uy;
    const py = ux;
    const cor = K.cores[i % K.cores.length];
    const g = ctx.createLinearGradient(c0.x, c0.y, c0.x + ux * L, c0.y + uy * L);
    g.addColorStop(0, `rgba(${cor},${(forca * 1.4).toFixed(3)})`);
    g.addColorStop(0.4, `rgba(${cor},${(forca * 0.5).toFixed(3)})`);
    g.addColorStop(1, `rgba(${cor},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(c0.x + px * larg0, c0.y + py * larg0);
    ctx.lineTo(c0.x + ux * L + px * larg1, c0.y + uy * L + py * larg1);
    ctx.lineTo(c0.x + ux * L - px * larg1, c0.y + uy * L - py * larg1);
    ctx.lineTo(c0.x - px * larg0, c0.y - py * larg0);
    ctx.closePath();
    ctx.fill();
    // a lente acesa
    const R = ppu * 0.45;
    const gl = ctx.createRadialGradient(c0.x, c0.y, 0, c0.x, c0.y, R);
    gl.addColorStop(0, `rgba(255,255,255,${Math.min(1, forca * 2.6).toFixed(3)})`);
    gl.addColorStop(0.35, `rgba(${cor},${Math.min(1, forca * 1.6).toFixed(3)})`);
    gl.addColorStop(1, `rgba(${cor},0)`);
    ctx.fillStyle = gl;
    ctx.fillRect(c0.x - R, c0.y - R, R * 2, R * 2);
  });
  if (!algumNaTela) {
    // o baile está acima da tela: a claridade colorida na beira de cima mostra onde é
    // (as faixas mais fortes andam de um lado para o outro, como os pés dos canhões varrendo)
    const top = cam.playTop || 0;
    const alt = cam.viewH * 0.3;
    bases.forEach((d, i) => {
      cam.toScreen(d.x, game.player.y, c1);
      const bx = c1.x + Math.sin(t * ((Math.PI * 2) / K.giroS) + i * 1.3) * cam.viewW * 0.18;
      const cor = K.cores[i % K.cores.length];
      const g = ctx.createRadialGradient(bx, top, 0, bx, top, alt);
      g.addColorStop(0, `rgba(${cor},${(forca * 1.8).toFixed(3)})`);
      g.addColorStop(1, `rgba(${cor},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(bx - alt, top, alt * 2, alt);
    });
  }
  ctx.restore();
}
