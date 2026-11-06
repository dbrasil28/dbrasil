// Câmera 2.5D: mundo é um plano (x, y) em metros; a tela é uma projeção oblíqua
// com rotação (yaw) e inclinação (elevação). Personagens são "billboards" de pé.
//
//   elevação 90° = visão de cima (sem profundidade)
//   elevação 55° = 3/4 clássico de beat 'em up (padrão do protótipo)
//   yaw 0°  = ruas alinhadas com a tela (como nos mockups)
//   yaw 45° = isometria "diamante" clássica
import { DEG } from './math.js';

export class Camera {
  constructor() {
    this.x = 0; // centro da câmera no mundo
    this.y = 0;
    this.ppu = 40; // pixels por metro
    this.anchorX = 0; // ponto da tela onde fica o centro da câmera
    this.anchorY = 0;
    this.viewW = 390;
    this.viewH = 844;
    this.setAngles(55, 0);
  }

  setAngles(elevationDeg, yawDeg) {
    this.elevation = elevationDeg;
    this.yaw = yawDeg;
    this.k = Math.sin(elevationDeg * DEG); // achatamento do chão no eixo vertical da tela
    this.c = Math.cos(yawDeg * DEG);
    this.s = Math.sin(yawDeg * DEG);
  }

  /**
   * Define a área de jogo visível e a escala a partir da hipótese do GDD:
   * altura do protagonista = playerPct% da altura jogável.
   */
  setView(viewW, viewH, playTop, playBottom, playerPct, playerHeightM) {
    this.viewW = viewW;
    this.viewH = viewH;
    const playH = Math.max(100, playBottom - playTop);
    this.playTop = playTop;
    this.playBottom = playBottom;
    this.ppu = (playH * playerPct) / 100 / playerHeightM;
    this.anchorX = viewW / 2;
    // centro útil: um pouco abaixo do meio da área jogável, para ver mais à frente (topo)
    this.anchorY = playTop + playH * 0.54;
  }

  toScreen(wx, wy, out) {
    const dx = wx - this.x;
    const dy = wy - this.y;
    const rx = dx * this.c - dy * this.s;
    const ry = dx * this.s + dy * this.c;
    out.x = this.anchorX + rx * this.ppu;
    out.y = this.anchorY + ry * this.ppu * this.k;
    return out;
  }

  toWorld(sx, sy, out) {
    const rx = (sx - this.anchorX) / this.ppu;
    const ry = (sy - this.anchorY) / (this.ppu * this.k);
    out.x = this.x + rx * this.c + ry * this.s;
    out.y = this.y - rx * this.s + ry * this.c;
    return out;
  }

  /**
   * Converte uma direção da tela (joystick) numa direção no mundo, de modo que
   * "para cima no joystick" seja "para cima na tela" em qualquer yaw/elevação.
   */
  screenDirToWorld(dx, dy, out) {
    const ry = dy / this.k;
    let wx = dx * this.c + ry * this.s;
    let wy = -dx * this.s + ry * this.c;
    const l = Math.hypot(wx, wy);
    if (l > 1e-6) {
      wx /= l;
      wy /= l;
    }
    out.x = wx;
    out.y = wy;
    return out;
  }

  /** Profundidade de desenho (ordem de pintura): maior = mais perto da câmera. */
  depth(wx, wy) {
    return (wx - this.x) * this.s + (wy - this.y) * this.c;
  }

  /** Caixa (no mundo) que contém a área visível, com margem em metros. */
  visibleWorldBounds(marginM, out) {
    const p = { x: 0, y: 0 };
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const corners = [
      [0, 0],
      [this.viewW, 0],
      [0, this.viewH],
      [this.viewW, this.viewH],
    ];
    for (const [sx, sy] of corners) {
      this.toWorld(sx, sy, p);
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    out.minX = minX - marginM;
    out.minY = minY - marginM;
    out.maxX = maxX + marginM;
    out.maxY = maxY + marginM;
    return out;
  }

  /** Metros visíveis na horizontal e na vertical (no chão), para a análise de leitura. */
  visibleMeters() {
    return {
      width: this.viewW / this.ppu,
      depth: (this.playBottom - this.playTop) / (this.ppu * this.k),
    };
  }
}
