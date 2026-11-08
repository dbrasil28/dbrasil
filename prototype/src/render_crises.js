// Desenho das crises da cidade (crises.js): o Apagão (escuro, só a luz dos postes e do Juninho, os olhos da
// horda brilhando), o Baile (luzes coloridas no chão) e o Gato de luz em curto (faísca estalando antes do
// choque). A água da Ressaca vem com o mar (render_mar.js).
import { CRISES } from './config.js';
import { fxImg } from './render_fx.js';

const a = { x: 0, y: 0 };
const b = { x: 0, y: 0 };

const ativa = (game, id) => game.crise && game.crise.fase === 'ativa' && game.crise.id === id;

/** No chão, antes dos personagens: luzes do Baile, faíscas do curto. */
export function drawCriseChao(ctx, game, cam, ppu, t, bounds) {
  const c = game.crise;
  if (!c || c.fase !== 'ativa') return;
  // a água da Ressaca é desenhada com o mar (render_mar.js), por baixo dos coqueiros e da gente
  if (c.id === 'baile') {
    // luzes de festa girando em volta do Juninho
    const p = game.player;
    const cores = ['255,60,200', '60,220,255', '255,210,31'];
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    cores.forEach((cor, i) => {
      const ang = t * (1.3 + i * 0.4) + i * 2.1;
      cam.toScreen(p.x + Math.cos(ang) * 4.5, p.y + Math.sin(ang) * 3, a);
      const R = 2.4 * ppu;
      const g = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, R);
      g.addColorStop(0, `rgba(${cor},0.38)`);
      g.addColorStop(1, `rgba(${cor},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(a.x, a.y, R, R * cam.k, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  } else if (c.id === 'curto') {
    const K = CRISES.curto;
    for (const f of c.faiscas) {
      cam.toScreen(f.x, f.y, a);
      const R = K.raioM * ppu;
      if (!f.choque) {
        // aviso: o chão marcado e o fio estalando
        const k = f.t / K.avisoS;
        ctx.fillStyle = `rgba(255,220,60,${0.12 + 0.18 * k})`;
        ctx.strokeStyle = `rgba(255,220,60,${0.5 + 0.5 * k})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.ellipse(a.x, a.y, R, R * cam.k, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
        if (!fxImg('faisca_gato')) estalo(ctx, a.x, a.y - 1.6 * ppu, 0.9 * ppu, t * 30 + f.x); // sem a arte da faísca
      } else {
        const k = 1 - (f.t - K.avisoS) / K.choqueS;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, R * 1.3);
        g.addColorStop(0, `rgba(200,240,255,${0.9 * k})`);
        g.addColorStop(1, 'rgba(120,200,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(a.x, a.y, R * 1.3, R * 1.3 * cam.k, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        if (!fxImg('faisca_gato')) estalo(ctx, a.x, a.y - 1.6 * ppu, 1.6 * ppu, t * 50 + f.y);
      }
    }
  }
}

/** Faísca em zigue-zague. */
function estalo(ctx, x, y, s, seed) {
  ctx.strokeStyle = '#fff6b0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  let px = x;
  let py = y;
  for (let i = 1; i <= 4; i++) {
    px = x + Math.sin(seed * 1.7 + i * 2.3) * s * 0.5;
    py = y + (i / 4) * s * 1.4;
    ctx.lineTo(px, py);
  }
  ctx.stroke();
}

let escuroCanvas = null;

// Olhos no Apagão: de frente (até 60° da câmera) os dois; de perfil (até 100°) um; de costas, nenhum.
const OLHO_FRENTE = (60 * Math.PI) / 180;
const OLHO_LADO = (100 * Math.PI) / 180;

/** Por cima de tudo: o escuro do Apagão (com a luz dos postes e do Juninho) e os olhos da horda. */
export function drawCriseCeu(ctx, game, cam, ppu, t, playerPx, propsVisiveis) {
  const c = game.crise;
  if (!c || c.fase !== 'ativa' || c.id !== 'apagao') return;
  const A = CRISES.apagao;
  const k = Math.min(1, c.t / A.rampaS, (c.def.duracaoS - c.t) / A.rampaS);
  if (k <= 0) return;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  if (!escuroCanvas || escuroCanvas.width !== W || escuroCanvas.height !== H) {
    escuroCanvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
  }
  const g = escuroCanvas.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, W, H);
  g.setTransform(ctx.getTransform());
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = `rgba(6,7,16,${A.escuro * k})`;
  g.fillRect(-50, -50, cam.viewW + 100, cam.viewH + 100);
  g.globalCompositeOperation = 'destination-out';
  const luz = (x, y, r) => {
    cam.toScreen(x, y, a);
    const R = r * ppu;
    const gr = g.createRadialGradient(a.x, a.y, 0, a.x, a.y, R);
    gr.addColorStop(0, 'rgba(0,0,0,1)');
    gr.addColorStop(0.55, 'rgba(0,0,0,0.75)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.beginPath();
    g.ellipse(a.x, a.y, R, R * 0.8, 0, 0, Math.PI * 2);
    g.fill();
  };
  for (const pr of propsVisiveis || []) if (pr.kind === 'poste') luz(pr.x, pr.y, A.luzPosteM);
  const p = game.player;
  luz(p.x, p.y, A.luzJuninhoM);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(escuroCanvas, 0, 0);
  ctx.restore();
  // os olhos da horda brilhando no escuro
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgba(160,230,255,${0.85 * k})`;
  const s = Math.max(1.5, playerPx * 0.025);
  for (const e of game.enemies) {
    if (e.dead) continue;
    cam.toScreen(e.x, e.y, a);
    if (a.x < -20 || a.x > cam.viewW + 20 || a.y < -20 || a.y > cam.viewH + 40) continue;
    // só brilha o olho que aparece: para onde ele anda (como a figura dele), de frente para a câmera = 0°
    cam.toScreen(e.x + (e.mx ?? p.x - e.x), e.y + (e.my ?? p.y - e.y), b);
    const ang = Math.atan2(b.x - a.x, b.y - a.y); // 0: vem para a câmera; ±π: de costas
    const fr = Math.abs(ang);
    if (fr > OLHO_LADO) continue; // de costas: sem olho
    const hy = a.y - playerPx * 0.84 * (e.boss ? 2.6 : 1);
    const lado = Math.sin(ang) * s * 2.2; // o rosto vira para o lado em que ele anda
    if (fr <= OLHO_FRENTE) {
      ctx.fillRect(a.x + lado - s * 2.2, hy, s * 1.6, s);
      ctx.fillRect(a.x + lado + s * 0.6, hy, s * 1.6, s);
    } else {
      ctx.fillRect(a.x + lado * 1.3 - s * 0.8, hy, s * 1.6, s); // de perfil: um olho só
    }
  }
  // o que de dia ninguém nota: no escuro, brilha
  for (const q of game.achados) {
    if (q.aberto || !q.soNoEscuro) continue;
    cam.toScreen(q.x, q.y, a);
    const R = 1.4 * ppu * (0.85 + 0.15 * Math.sin(t * 3));
    const gr = ctx.createRadialGradient(a.x, a.y - 0.3 * ppu, 0, a.x, a.y - 0.3 * ppu, R);
    gr.addColorStop(0, `rgba(255,224,90,${0.9 * k})`);
    gr.addColorStop(1, 'rgba(255,224,90,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(a.x - R, a.y - 0.3 * ppu - R, R * 2, R * 2);
  }
  ctx.restore();
}

/** O cofre que só aparece no escuro não se desenha de dia. */
export const escondidoDeDia = (game, q) => q.soNoEscuro && !ativa(game, 'apagao');
