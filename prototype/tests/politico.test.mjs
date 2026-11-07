// Político Corrupto: arremesso da maleta, Propina onde ela cai e a horda correndo atrás do dinheiro.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { ENEMIES } from '../src/config.js';

const TD = ENEMIES.politico.throw;
const LURE = ENEMIES.politico.lure;
const newGame = () => {
  const g = new Game({ ...defaultSettings(), elenco: false }, { seed: 3 });
  g.enemies.length = 0;
  g.player.weapons.length = 0; // ninguém atira: o teste olha só o Político
  g.player.x = 0; // o teste mede do centro do calçadão
  return g;
};
const step = (g, s) => { for (let t = 0; t < s; t += 1 / 30) g.updateEnemies(1 / 30), g.updateBribes(1 / 30); };

test('o Político arremessa a maleta quando o Juninho está no alcance', () => {
  const g = newGame();
  const e = g.spawnEnemy('politico', 5, 0);
  e.fireT = 0.01;
  step(g, TD.windupS + 0.1);
  assert.equal(g.bribes.length, 1, 'nenhuma maleta no ar');
});

test('onde a maleta cai vira Propina longe dos pés do Juninho e atrai a horda', () => {
  const g = newGame();
  const e = g.spawnEnemy('politico', 5, 0);
  e.speed = 0;
  e.fireT = 0.01;
  g.player.x = 0;
  g.player.y = 0;
  g.player.r = 0.01; // a maleta passa por ele e cai no chão
  step(g, TD.windupS + TD.flightS + 0.2);
  const k = g.pickups.find((q) => q.kind === 'propina' && q.thrown);
  assert.ok(k, 'não virou Propina');
  assert.ok(Math.hypot(k.x - g.player.x, k.y - g.player.y) >= TD.dropGapM - 0.01, 'caiu nos pés do Juninho');
  assert.equal(g.lures.length, 1);
  // um telespectador perto da maleta corre para ela, não para o Juninho
  const t = g.spawnEnemy('telespectador', k.x + 3, k.y + 0.5);
  const d0 = Math.hypot(t.x - k.x, t.y - k.y);
  g.updateEnemies(0.2);
  assert.ok(Math.hypot(t.x - k.x, t.y - k.y) < d0, 'não foi atrás do dinheiro');
  // depois de LURE.durS a maleta para de atrair
  step(g, LURE.durS + 0.1);
  assert.equal(g.lures.length, 0);
});

test('acerto em cheio machuca o Juninho', () => {
  const g = newGame();
  const e = g.spawnEnemy('politico', 4, 0);
  e.speed = 0;
  e.fireT = 0.01;
  const hp0 = g.player.hp;
  step(g, TD.windupS + TD.flightS + 0.2);
  assert.ok(g.player.hp < hp0, 'não machucou');
});
