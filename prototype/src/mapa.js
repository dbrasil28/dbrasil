// Mapa 1 — Orla do Desespero (Rio de Janeiro). Desenho do chão e da decoração das bordas.
// Provisório em código até a arte do guia chegar; usa os PNGs que já existem (chão, poste, cone).
import { hash2 } from './math.js';
import { images } from './sprites.js';
import { Camera } from './camera.js';
import { drawLitter, drawFachada, pixo, cartaz, bandeira } from './render_cenario.js';

const pt = { x: 0, y: 0 };
const pt2 = { x: 0, y: 0 };
const SEG = 6; // metros por segmento de decoração nas bordas

// cores de reboco gasto (menos saturadas, para não brigar com os personagens)
const HOUSE_COLORS = ['#a8634c', '#b8955a', '#6f8a96', '#c4b597', '#86677f', '#7d8f62', '#b9806a', '#9d978c', '#c2a08e'];

// textura de grão/sujeira usada em tudo que é desenhado em código
let grainCanvas = null;
const grainByCtx = new WeakMap();
function grainPattern(ctx) {
  const cached = grainByCtx.get(ctx);
  if (cached) return cached;
  if (typeof document === 'undefined') return null;
  if (grainCanvas) {
    const pat = ctx.createPattern(grainCanvas, 'repeat');
    grainByCtx.set(ctx, pat);
    return pat;
  }
  const c = document.createElement('canvas');
  c.width = 96;
  c.height = 96;
  const g = c.getContext('2d');
  const d = g.createImageData(96, 96);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = 90 + Math.floor(Math.random() * 120);
    d.data[i] = v;
    d.data[i + 1] = v * 0.95;
    d.data[i + 2] = v * 0.88;
    d.data[i + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  // manchas maiores
  for (let i = 0; i < 14; i++) {
    g.fillStyle = `rgba(40,30,20,${0.08 + Math.random() * 0.12})`;
    g.beginPath();
    g.arc(Math.random() * 96, Math.random() * 96, 4 + Math.random() * 10, 0, Math.PI * 2);
    g.fill();
  }
  grainCanvas = c;
  const pat = ctx.createPattern(c, 'repeat');
  grainByCtx.set(ctx, pat);
  return pat;
}

/** Aplica grão (multiply) num retângulo de tela. */
function dirt(ctx, x, y, w, h, alpha = 0.32) {
  const pat = grainPattern(ctx);
  if (!pat) return;
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = alpha;
  ctx.fillStyle = pat;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/**
 * Chão do mapa no mundo da rota: a Orla entre o começo (startY) e o topo (orlaTop); acima, a Subida
 * do Morro; abaixo do começo, a área fechada. Sem mundo (arena aberta), só a Orla.
 */
export function drawOrlaGround(r, ctx, game, b) {
  const w = game.world;
  if (!w) return drawOrlaOnly(r, ctx, game, b);
  const cam = game.camera;
  const yTop = w.orlaTop;
  const yBot = w.orla.y1;
  const clipY = (y0, y1, fn) => {
    if (y1 <= y0) return;
    cam.toScreen(b.minX - 6, y0, pt);
    cam.toScreen(b.maxX + 6, y1, pt2);
    ctx.save();
    ctx.beginPath();
    ctx.rect(pt.x, pt.y, pt2.x - pt.x, pt2.y - pt.y);
    ctx.clip();
    fn({ minX: b.minX, maxX: b.maxX, minY: y0, maxY: y1 });
    ctx.restore();
  };
  clipY(Math.max(b.minY, yTop), Math.min(b.maxY, yBot), (bb) => drawOrlaOnly(r, ctx, game, bb));
  clipY(b.minY, Math.min(b.maxY, yTop), (bb) => drawMorroGround(ctx, cam, w, bb));
  clipY(Math.max(b.minY, yBot), b.maxY, (bb) => {
    // começo da orla: obra fechando o calçadão
    cam.toScreen(bb.minX - 6, bb.minY, pt);
    cam.toScreen(bb.maxX + 6, bb.maxY, pt2);
    ctx.fillStyle = '#2d2620';
    ctx.fillRect(pt.x, pt.y, pt2.x - pt.x, pt2.y - pt.y);
    dirt(ctx, pt.x, pt.y, pt2.x - pt.x, pt2.y - pt.y, 0.5);
  });
}

/** Subida do Morro: paredes de casas com janelas acesas pela TV e, por cima, as vielas, escadarias e lajes. */
function drawMorroGround(ctx, cam, w, b) {
  const ppu = cam.ppu;
  const k = cam.k;
  cam.toScreen(b.minX - 6, b.minY, pt);
  cam.toScreen(b.maxX + 6, b.maxY, pt2);
  ctx.fillStyle = '#3a2f29';
  ctx.fillRect(pt.x, pt.y, pt2.x - pt.x, pt2.y - pt.y);
  // casas vistas de cima: lajes e telhados de cores gastas, com janelas azuladas de TV
  const C = 3.2;
  for (let gy = Math.floor(b.minY / C); gy <= Math.ceil(b.maxY / C); gy++) {
    for (let gx = Math.floor((b.minX - 6) / C); gx <= Math.ceil((b.maxX + 6) / C); gx++) {
      const h = hash2(gx, gy, 71);
      cam.toScreen(gx * C + 0.15, gy * C + 0.15, pt);
      cam.toScreen(gx * C + C - 0.15, gy * C + C - 0.15, pt2);
      ctx.fillStyle = shade(HOUSE_COLORS[Math.floor(h * HOUSE_COLORS.length)], 0.38 + hash2(gx, gy, 72) * 0.14); // fundo escuro: quem aparece é a horda
      ctx.fillRect(pt.x, pt.y, pt2.x - pt.x, pt2.y - pt.y);
      if (h > 0.55) {
        // caixa d'água azul na laje
        ctx.fillStyle = '#2f6f9a';
        ctx.beginPath();
        ctx.ellipse((pt.x + pt2.x) / 2, (pt.y + pt2.y) / 2, ppu * 0.45, ppu * 0.45 * k, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (h < 0.3) {
        ctx.fillStyle = 'rgba(120,170,255,0.55)'; // janela com luz de TV
        ctx.fillRect(pt.x + (pt2.x - pt.x) * 0.2, pt.y + (pt2.y - pt.y) * 0.62, (pt2.x - pt.x) * 0.25, (pt2.y - pt.y) * 0.22);
      }
    }
  }
  // caminhos: viela (cimento), escadaria (degraus) e laje (concreto claro)
  for (const r of w.path) {
    if (r.kind === 'orla' || r.y1 < b.minY - 1 || r.y0 > b.maxY + 1) continue;
    cam.toScreen(r.x0, r.y0, pt);
    cam.toScreen(r.x1, r.y1, pt2);
    const x = pt.x;
    const y = pt.y;
    const wd = pt2.x - pt.x;
    const ht = pt2.y - pt.y;
    // sombra das paredes em volta
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(x - ppu * 0.25, y, wd + ppu * 0.5, ht);
    ctx.fillStyle = r.kind === 'laje' ? '#8b857c' : r.kind === 'escadaria' ? '#7a736b' : '#6f6a63';
    ctx.fillRect(x, y, wd, ht);
    dirt(ctx, x, y, wd, ht, 0.55);
    if (r.kind === 'escadaria') {
      ctx.strokeStyle = 'rgba(30,24,20,0.55)';
      ctx.lineWidth = Math.max(1, ppu * 0.05);
      for (let yy = r.y0 + 0.45; yy < r.y1; yy += 0.45) {
        cam.toScreen(r.x0, yy, pt);
        ctx.beginPath();
        ctx.moveTo(x, pt.y);
        ctx.lineTo(x + wd, pt.y);
        ctx.stroke();
      }
      // corrimão de cano
      ctx.strokeStyle = 'rgba(190,190,195,0.7)';
      ctx.lineWidth = Math.max(1.5, ppu * 0.07);
      ctx.beginPath();
      ctx.moveTo(x + ppu * 0.15, y);
      ctx.lineTo(x + ppu * 0.15, y + ht);
      ctx.stroke();
    } else if (r.kind === 'viela') {
      // rachaduras e o rego de água no meio
      ctx.strokeStyle = 'rgba(30,25,22,0.4)';
      ctx.lineWidth = Math.max(1, ppu * 0.04);
      cam.toScreen((r.x0 + r.x1) / 2, r.y0, pt);
      ctx.beginPath();
      ctx.moveTo(pt.x, y);
      ctx.lineTo(pt.x, y + ht);
      ctx.stroke();
    } else if (r.kind === 'laje') {
      ctx.strokeStyle = 'rgba(40,34,30,0.35)';
      ctx.lineWidth = Math.max(1, ppu * 0.03);
      ctx.strokeRect(x + 1, y + 1, wd - 2, ht - 2);
    }
  }
  if (!w.gateOpen) {
    // escadaria fechada: o tapume é desenhado na cena; aqui só escurece o vão
    cam.toScreen(w.gate.x0, w.gate.y0, pt);
    cam.toScreen(w.gate.x1, w.gate.y1, pt2);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(pt.x, pt.y, pt2.x - pt.x, pt2.y - pt.y);
  }
}

/** Desenha o chão do mapa da orla (pedra portuguesa, ciclovia, areia, mar, calçada do morro, ruas). */
function drawOrlaOnly(r, ctx, game, b) {
  const cam = game.camera;
  const m = game.map;
  const k = cam.k;
  const ppu = cam.ppu;
  const band = (x0, x1, fill, grainA = 0) => {
    cam.toScreen(x0, b.minY, pt);
    cam.toScreen(x1, b.maxY, pt2);
    ctx.fillStyle = fill;
    ctx.fillRect(pt.x, pt.y, pt2.x - pt.x, pt2.y - pt.y);
    if (grainA) dirt(ctx, pt.x, pt.y, pt2.x - pt.x, pt2.y - pt.y, grainA);
  };

  // morro (fundo escuro de terra/concreto atrás das casas)
  band(b.minX - 5, m.minX - 2.5, '#4d4036', 0.5);
  // calçada estreita do lado do morro
  band(m.minX - 2.5, m.minX, '#7a7169', 0.45);

  // calçadão: textura de pedra portuguesa em ondas (vista de cima, com a perspectiva da câmera)
  const tex = images.chao;
  const calcX1 = m.avenidaX0 ?? m.sandX; // o calçadão vai até a avenida
  cam.toScreen(m.minX, b.minY, pt);
  cam.toScreen(calcX1, b.maxY, pt2);
  if (tex) {
    const tile = m.groundTileM;
    const groundPattern = ctx.createPattern(tex, 'repeat');
    ctx.save();
    ctx.beginPath();
    ctx.rect(pt.x, pt.y, pt2.x - pt.x, pt2.y - pt.y);
    ctx.clip();
    // mundo -> tela: x' = ax + (x - camX)·ppu ; y' = ay + (y - camY)·ppu·k (rotação 0)
    const sx = (ppu * tile) / tex.width;
    const sy = (ppu * k * tile) / tex.height;
    const ox = cam.anchorX - cam.x * ppu;
    const oy = cam.anchorY - cam.y * ppu * k;
    const base = ctx.getTransform();
    ctx.transform(sx, 0, 0, sy, ox, oy);
    ctx.fillStyle = groundPattern;
    const inv = { x0: (pt.x - ox) / sx, y0: (pt.y - oy) / sy, x1: (pt2.x - ox) / sx, y1: (pt2.y - oy) / sy };
    ctx.fillRect(inv.x0, inv.y0, inv.x1 - inv.x0, inv.y1 - inv.y0);
    ctx.setTransform(base);
    // fim de tarde: leve tom quente e escurecido para o chão não competir com os personagens
    ctx.fillStyle = 'rgba(40,22,10,0.22)';
    ctx.fillRect(pt.x, pt.y, pt2.x - pt.x, pt2.y - pt.y);
    ctx.restore();
  } else {
    band(m.minX, m.sandX, '#7b6f63');
  }

  // avenida da praia: quatro faixas, dois sentidos, meio-fio dos dois lados e faixa dupla no meio
  if (m.avenidaX0 !== undefined) {
    band(m.avenidaX0, m.avenidaX1, '#36363b', 0.5);
    const linha = (x, cor, w, dash) => {
      cam.toScreen(x, b.minY, pt);
      cam.toScreen(x, b.maxY, pt2);
      ctx.strokeStyle = cor;
      ctx.lineWidth = Math.max(1, ppu * w);
      ctx.setLineDash(dash || []);
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.lineTo(pt2.x, pt2.y);
      ctx.stroke();
      ctx.setLineDash([]);
    };
    band(m.avenidaX0 - 0.15, m.avenidaX0 + 0.15, '#b9b3a8');
    band(m.avenidaX1 - 0.15, m.avenidaX1 + 0.15, '#b9b3a8');
    const cx = (m.avenidaX0 + m.avenidaX1) / 2;
    linha(cx - 0.12, 'rgba(235,190,40,0.85)', 0.08);
    linha(cx + 0.12, 'rgba(235,190,40,0.85)', 0.08);
    linha((m.avenidaX0 + cx) / 2, 'rgba(240,236,228,0.6)', 0.08, [ppu * 2, ppu * 2]);
    linha((cx + m.avenidaX1) / 2, 'rgba(240,236,228,0.6)', 0.08, [ppu * 2, ppu * 2]);
  }

  // ciclovia vermelha na beira da areia
  band(m.sandX - 1.6, m.sandX, '#7a3f38', 0.45);
  cam.toScreen(m.sandX - 0.8, b.minY, pt);
  ctx.strokeStyle = 'rgba(240,230,215,0.45)';
  ctx.lineWidth = Math.max(1, ppu * 0.05);
  ctx.setLineDash([ppu * 0.8, ppu * 0.8]);
  ctx.beginPath();
  ctx.moveTo(pt.x, pt.y);
  cam.toScreen(m.sandX - 0.8, b.maxY, pt);
  ctx.lineTo(pt.x, pt.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // areia (com marcas de pisadas) e mar
  band(m.sandX, m.seaX, '#bfa47c', 0.42);
  const sy0 = Math.floor(b.minY / 2);
  const sy1 = Math.ceil(b.maxY / 2);
  ctx.fillStyle = 'rgba(120,95,60,0.18)';
  for (let j = sy0; j <= sy1; j++) {
    for (let i = 0; i < 5; i++) {
      const x = m.sandX + 0.5 + hash2(i, j, 7) * (m.seaX - m.sandX - 1);
      const y = j * 2 + hash2(i, j, 8) * 2;
      cam.toScreen(x, y, pt);
      ctx.beginPath();
      ctx.ellipse(pt.x, pt.y, ppu * 0.12, ppu * 0.07 * k, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  band(m.seaX, b.maxX + 5, '#2c5f70', 0.25);
  band(m.seaX - 0.6, m.seaX + 0.3, 'rgba(235,245,240,0.55)'); // espuma
  // linha de chegada da areia molhada
  band(m.seaX - 2, m.seaX - 0.6, 'rgba(150,120,80,0.35)');

  // ruas transversais de asfalto com faixa de pedestre
  const y0 = Math.floor(b.minY / m.blockLen) - 1;
  const y1 = Math.ceil(b.maxY / m.blockLen) + 1;
  for (let j = y0; j <= y1; j++) {
    const ys = j * m.blockLen + (m.blockLen - m.streetLen);
    const ye = ys + m.streetLen;
    const rx1 = m.avenidaX0 ?? m.sandX; // a rua transversal termina na avenida
    cam.toScreen(m.minX - 2.5, ys, pt);
    cam.toScreen(rx1, ye, pt2);
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(pt.x, pt.y, pt2.x - pt.x, pt2.y - pt.y);
    dirt(ctx, pt.x, pt.y, pt2.x - pt.x, pt2.y - pt.y, 0.5);
    // meio-fio
    ctx.fillStyle = '#a9a39a';
    ctx.fillRect(pt.x, pt.y, pt2.x - pt.x, Math.max(2, ppu * 0.18 * k));
    ctx.fillRect(pt.x, pt2.y - Math.max(2, ppu * 0.18 * k), pt2.x - pt.x, Math.max(2, ppu * 0.18 * k));
    // faixa central amarela
    cam.toScreen(m.minX - 2.5, ys + m.streetLen / 2, pt);
    cam.toScreen(rx1, ys + m.streetLen / 2, pt2);
    ctx.strokeStyle = 'rgba(230,190,40,0.7)';
    ctx.lineWidth = Math.max(1.5, ppu * 0.1);
    ctx.setLineDash([ppu * 1.6, ppu * 1.2]);
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    ctx.lineTo(pt2.x, pt2.y);
    ctx.stroke();
    ctx.setLineDash([]);
    // faixa de pedestre na esquina da avenida, e outra atravessando a avenida
    ctx.fillStyle = 'rgba(235,232,225,0.75)';
    for (let x = rx1 - 3.4; x < rx1 - 0.3; x += 0.9) {
      cam.toScreen(x, ys + 1, pt);
      cam.toScreen(x + 0.5, ye - 1, pt2);
      ctx.fillRect(pt.x, pt.y, pt2.x - pt.x, pt2.y - pt.y);
    }
    if (m.avenidaX0 !== undefined) {
      for (let y = ys + 1.2; y < ys + 4.6; y += 0.9) {
        cam.toScreen(m.avenidaX0 + 0.3, y, pt);
        cam.toScreen(m.avenidaX1 - 0.3, y + 0.5, pt2);
        ctx.fillRect(pt.x, pt.y, pt2.x - pt.x, pt2.y - pt.y);
      }
    }
  }
}

/**
 * Camada estática do mapa (chão + decoração das bordas) desenhada uma vez em blocos de 12 m
 * e só copiada na tela a cada quadro. Nada disso se mexe, então não há por que redesenhar.
 */
const TILE_M = 12;
export class OrlaLayer {
  constructor() {
    this.tiles = new Map();
    this.key = '';
  }

  clear() {
    this.tiles.clear();
    this.key = '';
  }

  draw(ctx, game, vb, dpr) {
    const cam = game.camera;
    const m = game.map;
    const key = `${cam.ppu.toFixed(3)}|${cam.k.toFixed(4)}|${dpr}|${images.chao ? 1 : 0}|${images.poste ? 1 : 0}|${images.cen_coqueiro_a ? 1 : 0}|${game.world && game.world.gateOpen ? 1 : 0}`;
    if (key !== this.key) {
      this.tiles.clear();
      this.key = key;
    }
    const x0 = m.minX - 10;
    const x1 = m.seaX + 6;
    const j0 = Math.floor(vb.minY / TILE_M);
    const j1 = Math.floor(vb.maxY / TILE_M);
    for (let j = j0; j <= j1; j++) {
      let t = this.tiles.get(j);
      if (!t) {
        t = this.build(game, j, x0, x1, dpr);
        this.tiles.set(j, t);
      }
      cam.toScreen(x0, j * TILE_M, pt);
      ctx.drawImage(t, pt.x, pt.y, t.cssW, t.cssH + 0.75);
    }
    // descarta blocos longe da tela
    if (this.tiles.size > (j1 - j0 + 1) + 6) {
      for (const k of this.tiles.keys()) if (k < j0 - 3 || k > j1 + 3) this.tiles.delete(k);
    }
  }

  build(game, j, x0, x1, dpr) {
    const cam = game.camera;
    const scale = Math.min(dpr, 1.5);
    const wCss = (x1 - x0) * cam.ppu;
    const hCss = TILE_M * cam.ppu * cam.k;
    const c = document.createElement('canvas');
    c.width = Math.ceil(wCss * scale);
    c.height = Math.ceil(hCss * scale);
    c.cssW = wCss;
    c.cssH = hCss;
    const g = c.getContext('2d');
    g.scale(scale, scale);
    // câmera local: o canto (x0, j·12) do mundo vira o (0, 0) do bloco
    const tc = new Camera();
    tc.setAngles(cam.elevation, 0);
    tc.ppu = cam.ppu;
    tc.anchorX = 0;
    tc.anchorY = 0;
    tc.x = x0;
    tc.y = j * TILE_M;
    const fake = { camera: tc, map: game.map, world: game.world, isStreet: (y) => game.isStreet(y) };
    const b = { minX: x0, maxX: x1, minY: j * TILE_M - 0.5, maxY: (j + 1) * TILE_M + 0.5 };
    drawOrlaGround(null, g, fake, b);
    if (game.world) drawLitter(g, game.world, tc, b); // sujeira do chão
    // decoração com base neste bloco e nos 12 m abaixo (objetos altos invadem o bloco de cima)
    const list = orlaDecor(fake, { minX: x0, maxX: x1, minY: j * TILE_M - 1, maxY: (j + 1) * TILE_M + 12 }, []);
    list.sort((a, b2) => a.y - b2.y);
    for (const d of list) {
      tc.toScreen(d.x, d.y, pt2);
      drawDecor(g, d, { x: pt2.x, y: pt2.y }, tc.ppu, tc.k);
    }
    return c;
  }
}

/** Decoração das bordas (desenhada na camada estática). */
export function orlaDecor(game, b, out) {
  const m = game.map;
  const w = game.world;
  // fachadas viradas para a câmera no alto de cada pedaço da rota (pichação, cartazes, bandeira)
  if (w && w.fachadas) for (const f of w.fachadas) if (f.y >= b.minY && f.y <= b.maxY) out.push({ kind: 'fachada', x: f.x0, y: f.y, f });
  const j0 = Math.floor(b.minY / SEG) - 1;
  const j1 = Math.ceil(b.maxY / SEG) + 1;
  for (let j = j0; j <= j1; j++) {
    const y = j * SEG;
    if (w && (y < w.orlaTop || y > w.orla.y1)) continue; // decoração da orla só no trecho da orla
    const street = game.isStreet(y + SEG / 2) || game.isStreet(y);
    // lado do morro: casas da favela em 2 fileiras
    for (let row = 0; row < 3; row++) {
      const x = m.minX - 3.6 - row * 3.2 - hash2(j, row, 2) * 0.6;
      if (x < b.minX - 4) continue;
      if (street && row === 0) continue;
      out.push({ kind: 'casa', x, y: y + SEG * 0.85 + row * 0.9, seed: hash2(j, row, 3), row });
    }
    // calçada do morro: barraca de pastel, ponto de ônibus ou poste com cartaz
    if (!street && m.minX - 1.2 > b.minX - 3) {
      const h = hash2(j, 0, 5);
      if (h < 0.22) out.push({ kind: 'banca_pastel', x: m.minX - 1.3, y: y + SEG * 0.6, seed: h });
      else if (h < 0.34) out.push({ kind: 'ponto_onibus', x: m.minX - 1.2, y: y + SEG * 0.6, seed: h });
      else if (h < 0.58) out.push({ kind: 'poste', x: m.minX - 0.8, y: y + SEG * 0.4, seed: h });
    }
    // areia: coqueiros, quiosques e posto de salva-vidas depois do limite
    if (m.maxX + 1 < b.maxX + 6) {
      const h = hash2(j, 1, 9);
      if (h < 0.45) out.push({ kind: 'coqueiro', x: m.maxX + 1.2 + hash2(j, 2, 9) * 3, y: y + SEG * 0.5, seed: h });
      else if (h < 0.62) out.push({ kind: 'quiosque', x: m.maxX + 2.4, y: y + SEG * 0.5, seed: h });
      else if (h < 0.68) out.push({ kind: 'salva_vidas', x: m.maxX + 3.2, y: y + SEG * 0.5, seed: h });
    }
  }
  return out;
}

export function drawDecor(ctx, d, p, ppu, k) {
  switch (d.kind) {
    case 'casa': return drawCasa(ctx, d, p, ppu, k);
    case 'fachada': return drawFachada(ctx, d.f, p, ppu);
    case 'banca_pastel': return drawBancaPastel(ctx, p, ppu, k);
    case 'ponto_onibus': return drawPonto(ctx, p, ppu, k);
    case 'poste': return drawImageProp(ctx, d.seed > 0.4 && images.poste_b ? images.poste_b : images.poste, p, ppu * 6.4);
    case 'coqueiro': {
      const im = images.cen_coqueiro_a; // coqueiro gerado (Figma), além da areia
      if (!im) return drawCoqueiro(ctx, d, p, ppu, k);
      const h = (6.2 + d.seed * 2) * ppu;
      const w = (im.width / im.height) * h;
      ctx.save();
      ctx.translate(p.x, p.y);
      if (d.seed > 0.5) ctx.scale(-1, 1);
      ctx.drawImage(im, -w / 2, -h * (1 - 0.3 / 8.3), w, h);
      ctx.restore();
      return undefined;
    }
    case 'quiosque': return drawQuiosque(ctx, d, p, ppu, k);
    case 'salva_vidas': return drawSalvaVidas(ctx, p, ppu, k);
    default: return undefined;
  }
}

export function drawImageProp(ctx, im, p, hPx) {
  if (!im) return;
  const w = (im.width / im.height) * hPx;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, w * 0.35, w * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.drawImage(im, p.x - w / 2, p.y - hPx, w, hPx);
}

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

// Casa de favela vista de cima em 3/4: laje (topo), fachada de frente, janelas, caixa d'água azul.
function drawCasa(ctx, d, p, ppu, k) {
  const s = d.seed;
  const w = (2.6 + s * 0.9) * ppu;
  const depth = 2.8 * ppu * k;
  const floors = 1 + Math.floor(s * 3);
  const hWall = (1.15 + floors * 1.2) * ppu * 0.75;
  const color = HOUSE_COLORS[Math.floor(s * 97) % HOUSE_COLORS.length];
  const tijolo = s > 0.55;
  const x = p.x - w / 2;
  // fachada
  ctx.fillStyle = tijolo ? '#a5583a' : color;
  ctx.fillRect(x, p.y - hWall, w, hWall);
  if (tijolo) {
    ctx.strokeStyle = 'rgba(70,30,20,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let yy = p.y - hWall + 4; yy < p.y; yy += 5) {
      ctx.moveTo(x, yy);
      ctx.lineTo(x + w, yy);
    }
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(x, p.y - hWall, w * 0.12, hWall);
  // janelas e porta
  for (let f = 0; f < floors; f++) {
    const fy = p.y - (f + 1) * (hWall / (floors + 0.3));
    for (let i = 0; i < 2; i++) {
      const wx = x + w * (0.2 + i * 0.42);
      ctx.fillStyle = (Math.floor(s * 31 + f + i) % 3) ? '#2a2a30' : '#e8c86a';
      ctx.fillRect(wx, fy + 3, w * 0.2, Math.max(4, hWall * 0.14));
    }
  }
  ctx.fillStyle = '#3a2c24';
  ctx.fillRect(x + w * 0.42, p.y - hWall * 0.32, w * 0.16, hWall * 0.32);
  // laje (topo)
  ctx.fillStyle = shade(tijolo ? '#8f867e' : color, 0.78);
  ctx.fillRect(x, p.y - hWall - depth, w, depth);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(x, p.y - hWall - depth, w, depth * 0.18);
  // sujeira, sombra de fim de tarde e contorno
  dirt(ctx, x, p.y - hWall - depth, w, hWall + depth, 0.55);
  const sg = ctx.createLinearGradient(x, 0, x + w, 0);
  sg.addColorStop(0, 'rgba(255,190,120,0.10)');
  sg.addColorStop(1, 'rgba(20,10,30,0.30)');
  ctx.fillStyle = sg;
  ctx.fillRect(x, p.y - hWall, w, hWall);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(x, p.y - 2, w, 3);
  ctx.strokeStyle = 'rgba(15,10,12,0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, p.y - hWall - depth + 0.5, w - 1, hWall + depth - 1);
  // pichação na fachada, cartaz de candidato e bandeira do Brasil pendurada na janela
  pixo(ctx, ['VIDA LOKA', 'FÉ', 'OS CRIA', 'XIS', 'PAZ', 'NÓS'][Math.floor(s * 61) % 6], x + w * 0.08, p.y - hWall * 0.1, ppu * 0.36, s * 17 % 1 > 0.7 ? '#c8342b' : '#141012', 0, 1.5);
  if (s * 19 % 1 > 0.55) cartaz(ctx, x + w * 0.66, p.y - hWall * 0.62, ppu * 0.5, ppu * 0.68, Math.floor(s * 29));
  if (floors > 1 && s * 23 % 1 > 0.6) bandeira(ctx, x + w * 0.18, p.y - hWall * 0.92, ppu * 1.0, ppu * 0.68);
  // caixa d'água azul
  if (s * 7 % 1 > 0.25) {
    const cx = x + w * (0.25 + (s * 13 % 1) * 0.5);
    const cy = p.y - hWall - depth * 0.55;
    const r = ppu * 0.42;
    ctx.fillStyle = '#2f6db5';
    ctx.fillRect(cx - r, cy - r * 0.9, r * 2, r * 0.9);
    ctx.fillStyle = '#4c8fd6';
    ctx.beginPath();
    ctx.ellipse(cx, cy - r * 0.9, r, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // varal
  if (s * 11 % 1 > 0.6) {
    const vy = p.y - hWall - depth * 0.3;
    ctx.strokeStyle = 'rgba(30,30,30,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.1, vy);
    ctx.lineTo(x + w * 0.9, vy);
    ctx.stroke();
    const cols = ['#e5252f', '#ffd21f', '#3d8bff', '#f2efe8'];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = cols[i];
      ctx.fillRect(x + w * (0.15 + i * 0.18), vy, w * 0.1, ppu * 0.35);
    }
  }
}

function drawBancaPastel(ctx, p, ppu, k) {
  const w = 3.0 * ppu;
  const h = 2.4 * ppu * 0.75;
  const x = p.x - w / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(x - 3, p.y - 4, w + 6, 8);
  // balcão
  ctx.fillStyle = '#6b4a2e';
  ctx.fillRect(x, p.y - h * 0.55, w, h * 0.55);
  ctx.fillStyle = '#8a6440';
  ctx.fillRect(x, p.y - h * 0.62, w, h * 0.1);
  // toldo listrado vermelho e branco
  const ah = h * 0.36;
  const ay = p.y - h - ah * 0.2;
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 ? '#f2efe8' : '#c4232b';
    ctx.fillRect(x - w * 0.06 + (i * w * 1.12) / 8, ay, (w * 1.12) / 8 + 0.5, ah);
  }
  ctx.fillStyle = '#9e1a22';
  ctx.fillRect(x - w * 0.06, ay + ah, w * 1.12, ah * 0.22);
  // placa
  ctx.fillStyle = '#c4232b';
  ctx.fillRect(x + w * 0.05, ay - ah * 0.75, w * 0.9, ah * 0.7);
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${Math.max(8, ah * 0.42)}px "Barlow Semi Condensed", "Arial Narrow", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PASTEL • CALDO DE CANA', p.x, ay - ah * 0.4);
  ctx.textBaseline = 'alphabetic';
  dirt(ctx, x - w * 0.06, ay - ah * 0.75, w * 1.12, p.y - (ay - ah * 0.75), 0.4);
  // cadeiras amarelas
  ctx.fillStyle = '#f2c21b';
  for (let i = 0; i < 2; i++) {
    const cx = x + w * (0.15 + i * 0.6);
    ctx.fillRect(cx, p.y + ppu * 0.25, ppu * 0.45, ppu * 0.4);
    ctx.fillRect(cx, p.y - ppu * 0.15, ppu * 0.45, ppu * 0.12);
  }
}

function drawPonto(ctx, p, ppu) {
  const w = 2.6 * ppu;
  const h = 2.5 * ppu * 0.8;
  const x = p.x - w / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x, p.y - 3, w, 6);
  ctx.fillStyle = '#5d6b70';
  ctx.fillRect(x, p.y - h, ppu * 0.12, h);
  ctx.fillRect(x + w - ppu * 0.12, p.y - h, ppu * 0.12, h);
  ctx.fillStyle = 'rgba(170,205,220,0.35)';
  ctx.fillRect(x + ppu * 0.12, p.y - h * 0.9, w - ppu * 0.24, h * 0.75);
  ctx.fillStyle = '#2f3b40';
  ctx.fillRect(x - ppu * 0.15, p.y - h - ppu * 0.25, w + ppu * 0.3, ppu * 0.3);
  ctx.fillStyle = '#ffd21f';
  ctx.fillRect(x + w * 0.62, p.y - h * 0.85, w * 0.3, h * 0.5); // cartaz
}

function drawCoqueiro(ctx, d, p, ppu) {
  const h = (5.5 + d.seed * 2) * ppu * 0.75;
  const lean = (d.seed - 0.5) * ppu * 1.2;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(p.x + lean * 0.6, p.y, ppu * 1.4, ppu * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7b5a3a';
  ctx.lineWidth = Math.max(3, ppu * 0.28);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.quadraticCurveTo(p.x + lean * 0.2, p.y - h * 0.5, p.x + lean, p.y - h);
  ctx.stroke();
  ctx.lineCap = 'butt';
  const tx = p.x + lean;
  const ty = p.y - h;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + d.seed * 3;
    const len = ppu * (1.6 + (i % 2) * 0.4);
    ctx.strokeStyle = i % 2 ? '#3f7a35' : '#2f6128';
    ctx.lineWidth = Math.max(2, ppu * 0.22);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx + Math.cos(a) * len * 0.6, ty + Math.sin(a) * len * 0.3 - ppu * 0.4, tx + Math.cos(a) * len, ty + Math.sin(a) * len * 0.45 + ppu * 0.3);
    ctx.stroke();
  }
  ctx.fillStyle = '#6b8a2e';
  ctx.beginPath();
  ctx.arc(tx, ty + ppu * 0.15, ppu * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawQuiosque(ctx, d, p, ppu) {
  const w = 3.2 * ppu;
  const h = 2.6 * ppu * 0.75;
  const x = p.x - w / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, w * 0.6, ppu * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f0ebe0';
  ctx.fillRect(x + w * 0.1, p.y - h * 0.6, w * 0.8, h * 0.6);
  ctx.fillStyle = '#2f8f8a';
  ctx.fillRect(x + w * 0.1, p.y - h * 0.68, w * 0.8, h * 0.1);
  // teto curvo
  ctx.fillStyle = '#e2e8ea';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - h * 0.95, w * 0.62, h * 0.28, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#c9d3d6';
  ctx.fillRect(x - w * 0.12, p.y - h * 0.97, w * 1.24, h * 0.08);
  ctx.fillStyle = '#7bb32e'; // cocos no balcão
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x + w * (0.3 + i * 0.2), p.y - h * 0.62, ppu * 0.17, 0, Math.PI * 2);
    ctx.fill();
  }
  dirt(ctx, x - w * 0.12, p.y - h * 1.25, w * 1.24, h * 1.25, 0.4);
  ctx.fillStyle = d.seed > 0.5 ? '#b8323a' : '#c9a227'; // guarda-sol ao lado
  ctx.beginPath();
  ctx.ellipse(x + w * 1.05, p.y - h * 0.7, ppu * 0.9, ppu * 0.35, 0, Math.PI, 0);
  ctx.fill();
}

function drawSalvaVidas(ctx, p, ppu) {
  const w = 2.4 * ppu;
  const h = 4.2 * ppu * 0.75;
  const x = p.x - w / 2;
  ctx.fillStyle = '#d9d4c8';
  ctx.fillRect(x + w * 0.1, p.y - h * 0.5, ppu * 0.15, h * 0.5);
  ctx.fillRect(x + w * 0.85, p.y - h * 0.5, ppu * 0.15, h * 0.5);
  ctx.fillStyle = '#f2efe8';
  ctx.fillRect(x, p.y - h, w, h * 0.5);
  ctx.fillStyle = '#e5252f';
  ctx.fillRect(x, p.y - h, w, h * 0.12);
  ctx.fillStyle = '#2a2a30';
  ctx.fillRect(x + w * 0.15, p.y - h * 0.82, w * 0.7, h * 0.15);
  ctx.strokeStyle = '#4a4a4a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.9, p.y - h);
  ctx.lineTo(x + w * 0.9, p.y - h - ppu * 1.4);
  ctx.stroke();
  ctx.fillStyle = '#c4232b'; // bandeira de mar perigoso
  ctx.fillRect(x + w * 0.9, p.y - h - ppu * 1.4, ppu * 0.8, ppu * 0.5);
  dirt(ctx, x, p.y - h, w, h, 0.4);
}
