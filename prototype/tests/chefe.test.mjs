// Chefe do Tráfico (laje do topo): rajada de 3 tiros depois do aviso e reforço de traficantes pelo rádio.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { ENEMIES } from '../src/config.js';

test('o Chefe do Tráfico mira, solta a rajada de 3 tiros e chama reforço no rádio', () => {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 4 });
  g.enemies.length = 0;
  g.spawnAcc = -1e9;
  const p = g.player;
  p.hp = 1e6;
  const D = ENEMIES.chefe_trafico;
  const c = g.spawnEnemy('chefe_trafico', p.x, p.y - 8);
  c.fireT = 0;
  c.callCd = 99;
  const still = { x: 0, y: 0 };
  let aimed = false;
  let shots = 0;
  for (let i = 0; i < 90 && shots < D.rajada.tiros; i++) {
    const before = g.enemyShots.length;
    g.update(1 / 30, still);
    if (c.aimT > 0) aimed = true;
    shots += Math.max(0, g.enemyShots.length - before);
  }
  assert.ok(aimed, 'atirou sem a mira de aviso');
  assert.equal(shots, D.rajada.tiros, 'a rajada não saiu com 3 tiros');
  // reforço: para, grita no rádio e chegam traficantes
  c.callCd = 0;
  c.aimT = 0;
  c.burst = 0;
  const antes = g.enemies.filter((e) => e.type === 'traficante').length;
  let gritou = false;
  for (let i = 0; i < 60; i++) {
    g.update(1 / 30, still);
    if (c.callT > 0) gritou = true;
  }
  assert.ok(gritou, 'não fez a pose de raiva no rádio');
  assert.ok(g.enemies.filter((e) => e.type === 'traficante').length >= antes + D.reforco.traficantes, 'o reforço não chegou');
});
