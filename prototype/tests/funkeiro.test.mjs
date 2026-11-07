// Funkeiro Raivoso: perto do Juninho, para de braços abertos (fúria) com a direção travada e parte reto.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { ENEMIES } from '../src/config.js';

test('o Funkeiro abre os braços, trava a direção e faz a investida', () => {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 4 });
  g.enemies.length = 0;
  g.spawnAcc = -1e9;
  const p = g.player;
  p.hp = 1e6;
  const I = ENEMIES.funkeiro.investida;
  const e = g.spawnEnemy('funkeiro', p.x, p.y - 4);
  e.fireT = 0;
  const still = { x: 0, y: 0 };
  let sawWindup = false;
  let lock = null;
  let dashFrom = null;
  let dashed = 0;
  for (let i = 0; i < 120 && !dashed; i++) {
    g.update(1 / 30, still);
    if (e.windup > 0 && !sawWindup) {
      sawWindup = true;
      lock = { x: e.dashX, y: e.dashY, ex: e.x, ey: e.y };
      p.x += 3; // o Juninho sai da frente: a investida não segue ele
    }
    if (sawWindup && e.windup > 0) assert.ok(Math.hypot(e.x - lock.ex, e.y - lock.ey) < 0.3, 'andou durante a fúria');
    if (e.dashT > 0 && !dashFrom) dashFrom = { x: e.x, y: e.y, t: g.t };
    if (dashFrom && !(e.dashT > 0)) dashed = Math.hypot(e.x - dashFrom.x, e.y - dashFrom.y) / Math.max(1e-3, g.t - dashFrom.t);
  }
  assert.ok(sawWindup, 'não abriu os braços perto do Juninho');
  assert.ok(Math.abs(lock.y) > 0.9, 'a direção travada não aponta para o Juninho');
  assert.ok(dashed > ENEMIES.funkeiro.speed * I.dashMul * 0.5, `investida lenta demais: ${dashed.toFixed(2)} m/s`);
});
