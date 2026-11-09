// Desenho das crises da cidade (crises.js): o Apagão (escuro, só a luz dos postes e do Juninho, os olhos da
// horda brilhando), o Temporal (chuva e a água descendo as escadarias) e o Gato de luz em curto (faísca
// estalando antes do choque). A água da Ressaca vem com o mar (render_mar.js).
import { CRISES } from './config.js';
import { fxImg } from './render_fx.js';
import { forcaDoTemporal } from './crises.js';

const a = { x: 0, y: 0 };
const b = { x: 0, y: 0 };

const ativa = (game, id) => game.crise && game.crise.fase === 'ativa' && game.crise.id === id;

/** No chão, antes dos personagens: luzes do Baile, faíscas do curto. */
export function drawCriseChao(ctx, game, cam, ppu, t, bounds) {
  const c = game.crise;
  if (!c || c.fase !== 'ativa') return;
  // a água da Ressaca é desenhada com o mar (render_mar.js), por baixo dos coqueiros e da gente
  if (c.id === 'temporal') {
    // a água descendo as escadarias: faixas claras correndo morro abaixo
    const k = forcaDoTemporal(c);
    const w = game.world;
    if (!w || k <= 0) return;
    ctx.save();
    for (let i = 2; i < w.path.length; i++) {
      const s = w.path[i];
      if (s.kind !== 'escadaria' || s.y1 < bounds.minY - 2 || s.y0 > bounds.maxY + 2) continue;
      cam.toScreen(s.x0, s.y0, a);
      cam.toScreen(s.x1, s.y1, b);
      ctx.fillStyle = `rgba(120,170,210,${(0.22 * k).toFixed(3)})`;
      ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
      ctx.strokeStyle = `rgba(220,240,255,${(0.45 * k).toFixed(3)})`;
      ctx.lineWidth = Math.max(1, ppu * 0.05);
      const n = Math.max(3, Math.round((s.x1 - s.x0) * 1.6));
      for (let j = 0; j < n; j++) {
        const x = s.x0 + ((j + 0.5) / n) * (s.x1 - s.x0);
        const fase = ((t * 1.8 + j * 0.37) % 1) * (s.y1 - s.y0);
        cam.toScreen(x, s.y0 + fase, a);
        cam.toScreen(x, Math.min(s.y1, s.y0 + fase + 1.4), b);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
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
  if (c && c.id === 'temporal') {
    drawChuva(ctx, cam, t, forcaDoTemporal(c));
    return;
  }
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
  // a luz (D87): o degradê já no formato da poça de luz no chão (achatado como o chão na câmera), cheio no
  // miolo e sumindo aos poucos até a beira, sem linha nenhuma
  const M = A.miolo;
  const luz = (x, y, r) => {
    cam.toScreen(x, y, a);
    const R = r * ppu;
    g.save();
    g.translate(a.x, a.y);
    g.scale(1, 0.8);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, R);
    gr.addColorStop(0, 'rgba(0,0,0,1)');
    gr.addColorStop(M, 'rgba(0,0,0,0.95)');
    gr.addColorStop(M + (1 - M) * 0.35, 'rgba(0,0,0,0.6)');
    gr.addColorStop(M + (1 - M) * 0.7, 'rgba(0,0,0,0.22)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(-R, -R, R * 2, R * 2);
    g.restore();
  };
  const postes = (propsVisiveis || []).filter((pr) => pr.kind === 'poste');
  for (const pr of postes) luz(pr.x, pr.y, A.luzPosteM);
  const p = game.player;
  luz(p.x, p.y, A.luzJuninhoM);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(escuroCanvas, 0, 0);
  ctx.restore();
  // o brilho quente da lâmpada do poste no chão (luz de verdade, não só um buraco no escuro)
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const pr of postes) {
    cam.toScreen(pr.x, pr.y, a);
    const R = A.luzPosteM * ppu * 0.8;
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.scale(1, 0.8);
    const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
    gr.addColorStop(0, `rgba(255,196,110,${(A.brilhoPoste * k).toFixed(3)})`);
    gr.addColorStop(0.5, `rgba(255,170,80,${(A.brilhoPoste * 0.45 * k).toFixed(3)})`);
    gr.addColorStop(1, 'rgba(255,160,70,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(-R, -R, R * 2, R * 2);
    ctx.restore();
  }
  ctx.restore();
  // os olhos da horda brilhando no escuro
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgba(160,230,255,${0.85 * k})`;
  const s = Math.max(1.5, playerPx * 0.025);
  for (const e of game.enemies) {
    if (e.dead) continue;
    olhoNoEscuro(ctx, cam, playerPx, e.x, e.y, e.mx ?? p.x - e.x, e.my ?? p.y - e.y, e.boss ? 2.6 : 1, s);
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

/**
 * O olho que brilha no escuro (Apagão; no baile, D94, o brilho do sinal) numa figura em (x, y) olhando para (fx, fy):
 * só o olho que aparece (de frente, os dois; de perfil, um; de costas, nenhum). alto: a altura da figura (1 = a da
 * horda); s: o tamanho do olho na tela. A cor e o 'lighter' ficam com quem chama.
 */
export function olhoNoEscuro(ctx, cam, playerPx, x, y, fx, fy, alto, s) {
  cam.toScreen(x, y, a);
  if (a.x < -20 || a.x > cam.viewW + 20 || a.y < -20 || a.y > cam.viewH + 40) return;
  cam.toScreen(x + fx, y + fy, b);
  const ang = Math.atan2(b.x - a.x, b.y - a.y); // 0: vem para a câmera; ±π: de costas
  const fr = Math.abs(ang);
  if (fr > OLHO_LADO) return; // de costas: sem olho
  const hy = a.y - playerPx * 0.84 * alto;
  const lado = Math.sin(ang) * s * 2.2; // o rosto vira para o lado em que ele olha
  if (fr <= OLHO_FRENTE) {
    ctx.fillRect(a.x + lado - s * 2.2, hy, s * 1.6, s);
    ctx.fillRect(a.x + lado + s * 0.6, hy, s * 1.6, s);
  } else {
    ctx.fillRect(a.x + lado * 1.3 - s * 0.8, hy, s * 1.6, s); // de perfil: um olho só
  }
}

/** O cofre que só aparece no escuro não se desenha de dia. */
export const escondidoDeDia = (game, q) => q.soNoEscuro && !ativa(game, 'apagao');

/** Temporal: o céu escurece um pouco e a chuva cai inclinada pela tela inteira (riscos claros). */
function drawChuva(ctx, cam, t, k) {
  if (k <= 0) return;
  const W = cam.viewW;
  const H = cam.viewH;
  ctx.save();
  ctx.fillStyle = `rgba(20,30,48,${(0.28 * k).toFixed(3)})`;
  ctx.fillRect(-20, -20, W + 40, H + 40);
  ctx.strokeStyle = `rgba(200,220,245,${(0.42 * k).toFixed(3)})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  const n = Math.round(90 * k);
  for (let i = 0; i < n; i++) {
    // posição fixa por gota, caindo com o tempo (sem sorteio a cada quadro)
    const sx = ((i * 0.6180339) % 1) * (W + 120) - 60;
    const vy = 900 + ((i * 0.7548777) % 1) * 500;
    const y = ((t * vy + i * 53.9) % (H + 80)) - 40;
    const x = sx + y * 0.18;
    ctx.moveTo(x, y);
    ctx.lineTo(x - 5, y - 22);
  }
  ctx.stroke();
  ctx.restore();
}
