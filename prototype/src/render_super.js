// Desenho da super da relíquia (D67): a cena de achar (o tempo parado, a tela escurece, raios de luz atrás do
// Juninho no ar, a relíquia sobe do esconderijo e mergulha nele, o clarão, a onda e a faixa com o nome), a bola
// gigante do Golaço, o paredão que cai do céu no Batidão com o grave no chão, a horda dançando e o facho de luz
// que mostra onde a relíquia está. Luz e anéis em código; a arte é a da relíquia (a bola e o paredão), só na escala.
import { RELIQUIAS, SUPER, FACHO_RELIQUIA } from './config.js';
import { images } from './sprites.js';
import { drawParedao } from './render_carreira.js';
import { alturaNaCena } from './super.js';

const a = { x: 0, y: 0 };
const b = { x: 0, y: 0 };
const LED = ['255,60,200', '60,220,255', '255,210,40'];
const ease = (k) => 1 - (1 - k) ** 3;
const easeIO = (k) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** A bola sem a sombra no chão (no ar, na cena), com os gomos girando. */
function bolaNoAr(ctx, x, y, r, spin) {
  ctx.fillStyle = '#f4f2ea';
  ctx.strokeStyle = 'rgba(20,16,14,0.85)';
  ctx.lineWidth = Math.max(1, r * 0.1);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#1d1b1f';
  for (let k = 0; k < 3; k++) {
    const ang = spin + (k * Math.PI * 2) / 3;
    ctx.beginPath();
    ctx.arc(x + Math.cos(ang) * r * 0.5, y + Math.sin(ang) * r * 0.5, r * 0.24, 0, Math.PI * 2);
    ctx.fill();
  }
  // brilho de cima à esquerda (o sol do jogo)
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, 0, x - r * 0.35, y - r * 0.4, r * 0.9);
  g.addColorStop(0, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function luz(ctx, x, y, r, cor, alfa) {
  if (alfa <= 0 || r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${cor},${alfa})`);
  g.addColorStop(1, `rgba(${cor},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/** A relíquia desenhada solta (voando na cena), com tamanho s (px de altura). */
function reliquiaSolta(ctx, id, x, y, s, t) {
  if (id === 'altinha') {
    bolaNoAr(ctx, x, y, s * 0.5, t * 9);
    return;
  }
  const im = images.paredao;
  if (im) {
    const w = (im.width / im.height) * s;
    ctx.drawImage(im, x - w / 2, y - s / 2, w, s);
  } else {
    ctx.fillStyle = '#1d1b1f';
    ctx.fillRect(x - s * 0.3, y - s / 2, s * 0.6, s);
  }
}

// ---------- a cena de achar a relíquia ----------

/** Ponto do peito do Juninho na tela (no ar, na cena). */
function peito(game, cam, ppu, playerPx, out) {
  const p = game.player;
  cam.toScreen(p.x, p.y, out);
  out.y -= ((p.z || 0) + alturaNaCena(game)) * ppu + playerPx * 0.55;
  return out;
}

/** Atrás do Juninho: a tela escurece (só com o tempo parado) e os raios de luz giram. */
export function drawCenaFundo(ctx, game, cam, ppu, playerPx) {
  const C = game.cena;
  const S = SUPER.cena;
  const t = C.t;
  const escuro = t < S.chegaS ? clamp01(t / 0.3) : clamp01(1 - (t - S.chegaS) / 0.35);
  if (escuro > 0) {
    ctx.fillStyle = `rgba(12,8,24,${0.6 * escuro})`;
    ctx.fillRect(-20, -20, cam.viewW + 40, cam.viewH + 40);
  }
  const k = t < S.chegaS ? clamp01(t / 0.4) : 0.85 * clamp01(1 - (t - S.chegaS) / (S.durS - S.chegaS));
  if (k <= 0) return;
  peito(game, cam, ppu, playerPx, a);
  const L = Math.max(cam.viewW, cam.viewH) * 0.85;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.translate(a.x, a.y);
  ctx.rotate(t * 0.55);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, L);
  g.addColorStop(0, `rgba(255,236,160,${0.6 * k})`);
  g.addColorStop(0.35, `rgba(255,200,60,${0.24 * k})`);
  g.addColorStop(1, 'rgba(255,190,40,0)');
  ctx.fillStyle = g;
  const n = 14;
  for (let i = 0; i < n; i++) {
    const ang = (i * Math.PI * 2) / n;
    const w = (i % 2 ? 0.05 : 0.09) * (1 + 0.25 * Math.sin(t * 3 + i));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, L, ang - w, ang + w);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  luz(ctx, a.x, a.y, playerPx * 1.3, '255,244,200', 0.7 * k);
  ctx.restore();
}

/** Na frente: a relíquia voando até ele, o clarão, a onda no chão, a aura e a faixa com o nome. */
export function drawCenaFrente(ctx, game, cam, ppu, playerPx, poucoClarao = false) {
  const C = game.cena;
  const S = SUPER.cena;
  const t = C.t;
  const p = game.player;
  peito(game, cam, ppu, playerPx, a);
  // a relíquia sobe do esconderijo, gira em volta dele e mergulha no peito
  if (t >= S.voaS && t < S.chegaS) {
    const k = (t - S.voaS) / (S.chegaS - S.voaS);
    cam.toScreen(C.x0, C.y0, b);
    b.y -= (C.z0 + 0.4) * ppu;
    const pos = (kk) => {
      // sobe (seno), gira em volta (espiral que fecha) e chega no peito
      const ee = easeIO(kk);
      const s2 = Math.sin(kk * Math.PI);
      const ang = kk * Math.PI * 3.2;
      return {
        x: b.x + (a.x - b.x) * ee + Math.cos(ang) * s2 * 1.5 * ppu,
        y: b.y + (a.y - b.y) * ee - s2 * 3.2 * ppu + Math.sin(ang) * s2 * 1.5 * ppu * 0.4,
      };
    };
    const { x, y } = pos(k);
    const tam = playerPx * 0.42 * (1 + 0.9 * Math.sin(k * Math.PI)) * (k > 0.88 ? 1 - (k - 0.88) / 0.12 * 0.7 : 1);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let j = 9; j >= 1; j--) {
      const kk = k - j * 0.022;
      if (kk <= 0) continue;
      const q = pos(kk);
      luz(ctx, q.x, q.y, tam * (0.55 - j * 0.04), '255,214,90', 0.5 * (1 - j / 10));
    }
    luz(ctx, x, y, tam * 1.6, '255,226,120', 0.75);
    ctx.restore();
    reliquiaSolta(ctx, C.id, x, y, tam, t);
  }
  if (t < S.chegaS) return;
  const d = t - S.chegaS;
  // a onda dourada no chão, saindo dos pés dele
  cam.toScreen(p.x, p.y, b);
  b.y -= (p.z || 0) * ppu;
  if (d < 0.6) {
    const k = d / 0.6;
    const r = ease(k) * S.raioM * ppu;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = Math.max(2, 14 * (1 - k));
    ctx.strokeStyle = `rgba(255,210,60,${0.9 * (1 - k)})`;
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, r, r * cam.k, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = Math.max(1, 5 * (1 - k));
    ctx.strokeStyle = `rgba(255,255,240,${0.8 * (1 - k)})`;
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, r * 0.82, r * 0.82 * cam.k, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  // a aura em volta dele enquanto desce
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  luz(ctx, a.x, a.y, playerPx * (0.9 + 0.1 * Math.sin(t * 14)), '255,214,80', 0.55 * clamp01(1 - d / (S.durS - S.chegaS)));
  ctx.restore();
  // o clarão
  if (d < 0.4) {
    ctx.fillStyle = `rgba(255,250,232,${(poucoClarao ? 0.3 : 0.9) * (1 - d / 0.4)})`; // menos clarão se pedido nas opções
    ctx.fillRect(-20, -20, cam.viewW + 40, cam.viewH + 40);
  }
  // a faixa com o nome da relíquia e da super
  const R = RELIQUIAS[C.id];
  const fim = S.durS - S.chegaS;
  const alfa = clamp01(d / 0.12) * clamp01((fim - d) / 0.35);
  if (alfa <= 0) return;
  const pop = 1 + 0.35 * (1 - clamp01(d / 0.22));
  const cx = cam.viewW / 2;
  const cy = (cam.playTop || 0) + ((cam.playBottom || cam.viewH) - (cam.playTop || 0)) * 0.2;
  ctx.save();
  ctx.globalAlpha = alfa;
  ctx.translate(cx, cy);
  ctx.scale(pop, pop);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const f1 = Math.round(Math.min(40, cam.viewW * 0.085));
  ctx.font = `${f1}px Anton, "Barlow Semi Condensed", "Arial Narrow", sans-serif`;
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(4, f1 * 0.16);
  ctx.strokeStyle = 'rgba(20,10,4,0.9)';
  ctx.strokeText(R.nome.toUpperCase(), 0, 0);
  ctx.fillStyle = '#ffd21f';
  ctx.fillText(R.nome.toUpperCase(), 0, 0);
  const f2 = Math.round(f1 * 0.5);
  ctx.font = `800 ${f2}px "Barlow Semi Condensed", "Arial Narrow", sans-serif`;
  ctx.lineWidth = Math.max(3, f2 * 0.2);
  const sub = `SUPER: ${R.superNome.toUpperCase()}`;
  ctx.strokeText(sub, 0, f1 * 0.85);
  ctx.fillStyle = '#fff6dc';
  ctx.fillText(sub, 0, f1 * 0.85);
  ctx.restore();
}

// ---------- Golaço ----------

/** A bola gigante: sombra no chão, rastro dourado e a bola quicando. */
export function drawGolaco(ctx, o, pt, ppu, cam) {
  const G = RELIQUIAS.altinha.super;
  const r = G.raioM * ppu;
  const alt = o.alt * ppu;
  const fade = clamp01(o.life / 0.4);
  ctx.globalAlpha = fade;
  const sh = 1 - o.alt / (G.altM * 2.2);
  ctx.fillStyle = `rgba(0,0,0,${0.32 * sh})`;
  ctx.beginPath();
  ctx.ellipse(pt.x, pt.y, r * 0.95 * sh, r * 0.95 * sh * cam.k, 0, 0, Math.PI * 2);
  ctx.fill();
  // rastro: a bola fantasma para trás, no sentido contrário ao que ela corre
  const v = Math.hypot(o.vx, o.vy) || 1;
  cam.toScreen(o.x - (o.vx / v) * 1.2, o.y - (o.vy / v) * 1.2, a);
  const tx = a.x - pt.x;
  const ty = a.y - pt.y;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let j = 3; j >= 1; j--) luz(ctx, pt.x + tx * j * 0.55, pt.y - alt - r + ty * j * 0.55, r * (1.1 - j * 0.15), '255,214,90', 0.22 * fade);
  luz(ctx, pt.x, pt.y - alt - r, r * 1.7, '255,226,120', 0.4 * fade);
  ctx.restore();
  bolaNoAr(ctx, pt.x, pt.y - alt - r, r, o.spin);
  ctx.globalAlpha = 1;
}

// ---------- Solta o Batidão ----------

/** O paredão grande do lado do Juninho: cai do céu, bate o grave e solta as luzes de baile. */
export function drawBatidao(ctx, o, pt, ppu, playerPx, t) {
  const B = RELIQUIAS.paredao.super;
  const k = clamp01(o.t / B.caiS);
  const queda = (1 - k) ** 2 * 9 * ppu;
  const some = clamp01(o.life / 0.4);
  ctx.globalAlpha = some;
  if (o.caiu) {
    // luzes de baile: três fachos coloridos varrendo para o alto
    const h = playerPx * 1.2;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const ang = -Math.PI / 2 + Math.sin(t * 1.7 + i * 2.1) * 0.75;
      const L = h * 3.2;
      const w = 0.12;
      const x0 = pt.x;
      const y0 = pt.y - h * 0.85;
      const g = ctx.createLinearGradient(x0, y0, x0 + Math.cos(ang) * L, y0 + Math.sin(ang) * L);
      g.addColorStop(0, `rgba(${LED[i]},${0.42 * some * (0.6 + 0.4 * o.pulso)})`);
      g.addColorStop(1, `rgba(${LED[i]},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + Math.cos(ang - w) * L, y0 + Math.sin(ang - w) * L);
      ctx.lineTo(x0 + Math.cos(ang + w) * L, y0 + Math.sin(ang + w) * L);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  drawParedao(ctx, pt.x, pt.y - queda, playerPx * 1.7, o.pulso, o.lado, t);
  ctx.globalAlpha = 1;
}

/** O grave no chão: a onda grande que empurra e o anel de cada batida. */
export function drawOndasBatidao(ctx, game, cam, ppu) {
  const B = RELIQUIAS.paredao.super;
  for (const o of game.projectiles) {
    if (o.kind !== 'batidao' || !o.caiu) continue;
    cam.toScreen(o.x, o.y, a);
    a.y -= (o.z || 0) * ppu;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    if (o.onda >= 0) {
      const k = Math.min(1, o.onda / B.raioM);
      const r = Math.min(o.onda, B.raioM) * ppu;
      const f = (1 - k) ** 0.7;
      ctx.lineWidth = Math.max(3, ppu * 0.45 * (1 - k * 0.5));
      for (let i = 0; i < 3; i++) {
        const rr = r * (1 - i * 0.14);
        if (rr < 4) continue;
        ctx.strokeStyle = `rgba(${LED[i]},${0.6 * f})`;
        ctx.beginPath();
        ctx.ellipse(a.x, a.y, rr, rr * cam.k, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    if (o.batidaT < 0.45) {
      const k = o.batidaT / 0.45;
      const r = (1 + k * 7) * ppu;
      ctx.lineWidth = Math.max(2, ppu * 0.2 * (1 - k));
      ctx.strokeStyle = `rgba(${LED[Math.floor(o.t / B.batidaS) % 3]},${0.5 * (1 - k)})`;
      ctx.beginPath();
      ctx.ellipse(a.x, a.y, r, r * cam.k, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/** Notinha de música em cima de quem dança (um em cada três, para não poluir). */
export function drawNotaDanca(ctx, o, pt, h, t) {
  if (o.id % 3) return;
  const k = (t * 0.9 + o.id * 0.37) % 1;
  ctx.globalAlpha = Math.sin(k * Math.PI);
  ctx.fillStyle = `rgb(${LED[(o.id >> 2) % 3]})`;
  ctx.font = `900 ${Math.max(12, h * 0.26)}px "Barlow Semi Condensed", "Arial Narrow", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(o.id & 4 ? '♪' : '♫', pt.x + Math.sin(k * 6 + o.id) * h * 0.12, pt.y - h * (1.12 + k * 0.3));
  ctx.globalAlpha = 1;
}

// ---------- o facho de luz da relíquia ----------

/**
 * Pista da relíquia (D67): um facho de luz dourado subindo do esconderijo, visto de longe. Quando o facho não
 * aparece (a relíquia está à frente, além do alto da tela), uma claridade dourada na beira, do lado dela.
 */
export function drawFachoReliquia(ctx, game, cam, ppu, t) {
  if (game.cena || !game.achados) return;
  const F = FACHO_RELIQUIA;
  const p = game.player;
  const top = (cam.playTop || 0) + 110; // abaixo do plantão da TV
  const bot = (cam.playBottom || cam.viewH) - 30;
  for (const r of game.achados) {
    if (r.kind !== 'reliquia' || r.aberto) continue;
    const dist = Math.hypot(r.x - p.x, r.y - p.y);
    if (dist > F.fachoM) continue;
    const forca = clamp01((F.fachoM - dist) / 10) * (0.82 + 0.18 * Math.sin(t * 2.3 + r.x));
    cam.toScreen(r.x, r.y, a);
    a.y -= (r.plat ? r.plat.h : 0) * ppu;
    const H = F.alturaM * ppu;
    const W = F.larguraM * ppu;
    // o facho aparece com o pé dele na tela; debaixo do plantão da TV ou fora da tela, a claridade na beira
    const naTela = a.x > -W * 2 && a.x < cam.viewW + W * 2 && a.y > (cam.playTop || 0) && a.y - H < bot;
    ctx.save();
    if (naTela) {
      // o facho por cima (dourado forte, aparece até na areia clara); o miolo e as faíscas somam luz
      const g = ctx.createLinearGradient(0, a.y, 0, a.y - H);
      g.addColorStop(0, `rgba(255,190,30,${0.5 * forca})`);
      g.addColorStop(0.45, `rgba(255,200,50,${0.24 * forca})`);
      g.addColorStop(1, 'rgba(255,214,80,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(a.x - W * 0.5, a.y);
      ctx.lineTo(a.x + W * 0.5, a.y);
      ctx.lineTo(a.x + W * 0.9, a.y - H);
      ctx.lineTo(a.x - W * 0.9, a.y - H);
      ctx.closePath();
      ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      // o miolo, mais forte e fino
      const g2 = ctx.createLinearGradient(0, a.y, 0, a.y - H * 0.8);
      g2.addColorStop(0, `rgba(255,248,215,${0.55 * forca})`);
      g2.addColorStop(1, 'rgba(255,248,215,0)');
      ctx.fillStyle = g2;
      ctx.fillRect(a.x - W * 0.12, a.y - H * 0.8, W * 0.24, H * 0.8);
      // faíscas subindo pelo facho
      for (let i = 0; i < 7; i++) {
        const k = (t * 0.35 + i / 7) % 1;
        luz(ctx, a.x + Math.sin(t * 2 + i * 1.7) * W * 0.3, a.y - k * H * 0.85, W * 0.22, '255,236,160', 0.7 * forca * (1 - k));
      }
      luz(ctx, a.x, a.y, W * 2.2, '255,214,80', 0.45 * forca);
    }
    if (!naTela || a.y < top) {
      // a claridade dourada entra pela beira, do lado da relíquia (abaixo do plantão da TV)
      ctx.globalCompositeOperation = 'source-over';
      const cx = cam.viewW / 2;
      const cy = (top + bot) / 2;
      const dx = a.x - cx;
      const dy = a.y - cy;
      const s = Math.min(cam.viewW / 2 / Math.abs(dx || 1e-6), (bot - top) / 2 / Math.abs(dy || 1e-6));
      const ex = cx + dx * s;
      const ey = cy + dy * s;
      luz(ctx, ex, ey, 120, '255,186,30', 0.5 * forca);
      ctx.globalCompositeOperation = 'lighter';
      luz(ctx, ex, ey, 46, '255,240,190', 0.55 * forca);
    }
    ctx.restore();
  }
}
