// Bot simples para simulações headless: foge do centro de massa dos inimigos próximos
// e circula; escolhe melhorias com uma política fixa.
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';

// Opções do bot (o relatório de balanceamento desliga o desvio para comparar).
export const BOT = { dodge: true };

export function botInput(game) {
  const p = game.player;
  let cx = 0;
  let cy = 0;
  let n = 0;
  for (const e of game.enemies) {
    if (e.dmg <= 0) continue;
    const d2 = (e.x - p.x) ** 2 + (e.y - p.y) ** 2;
    if (d2 < 36) {
      const w = 1 / Math.max(0.5, d2);
      cx += (e.x - p.x) * w;
      cy += (e.y - p.y) * w;
      n += w;
    }
  }
  // desviar das papeladas do Burocrata (perpendicular à trajetória)
  for (const s of BOT.dodge ? game.enemyShots : []) {
    const dx = p.x - s.x;
    const dy = p.y - s.y;
    const d2 = dx * dx + dy * dy;
    if (d2 > 9) continue;
    const sp = Math.hypot(s.vx, s.vy) || 1;
    if ((dx * s.vx + dy * s.vy) / sp < 0) continue; // já passou
    const side = dx * -s.vy + dy * s.vx >= 0 ? 1 : -1;
    const w = 3 / Math.max(0.3, d2);
    cx -= (-s.vy / sp) * side * w * 2;
    cy -= (s.vx / sp) * side * w * 2;
    n += w;
  }
  // fugir dos lotes vendidos
  for (const lot of game.lots) {
    if (Math.abs(p.x - lot.x) < lot.half + 0.8 && Math.abs(p.y - lot.y) < lot.half + 0.8) {
      cx += (lot.x - p.x) * 2;
      cy += (lot.y - p.y) * 2;
      n += 2;
    }
  }
  const a = game.t * 0.35;
  let wx = Math.cos(a) * 0.3;
  let wy = Math.sin(a) * 0.3;
  // buscar a gema mais próxima (jogadores reais vivem disso)
  let best = null;
  let bd = 100;
  for (const g of game.gems) {
    const d2 = (g.x - p.x) ** 2 + (g.y - p.y) ** 2;
    if (d2 < bd) {
      bd = d2;
      best = g;
    }
  }
  if (best) {
    const d = Math.sqrt(bd) || 1;
    wx += ((best.x - p.x) / d) * 0.8;
    wy += ((best.y - p.y) / d) * 0.8;
  }
  if (n > 0) {
    const l = Math.hypot(cx, cy) / n || 1;
    const danger = Math.min(3, n * 1.5);
    wx -= (cx / n / l) * danger;
    wy -= (cy / n / l) * danger;
  }
  // mundo -> tela (a câmera do teste usa yaw 0, então só achata o eixo y)
  const l = Math.hypot(wx, wy) || 1;
  return { x: wx / l, y: (wy / l) * game.camera.k };
}

export function resolveModal(game, eventPolicy = (i) => i % 2 === 0) {
  const m = game.modal;
  if (!m) return;
  if (m.kind === 'event') {
    game.chooseEvent(eventPolicy(game.metrics.decisions.length));
    return;
  }
  const order = ['evolution', 'weapon', 'passive', 'heal', 'bonus'];
  let best = 0;
  m.options.forEach((o, i) => {
    if (order.indexOf(o.kind) < order.indexOf(m.options[best].kind)) best = i;
  });
  game.chooseOption(best);
}

export function simulate({ seed = 7, seconds = 600, dt = 1 / 30, settings = {}, eventPolicy } = {}) {
  const s = { ...defaultSettings(), ...settings };
  const game = new Game(s, { seed });
  let guard = 0;
  while (!game.finished && game.t < seconds && guard++ < seconds * 200) {
    if (game.modal) {
      resolveModal(game, eventPolicy);
      continue;
    }
    game.update(dt, botInput(game));
    game.outbox.length = 0;
  }
  return game;
}
