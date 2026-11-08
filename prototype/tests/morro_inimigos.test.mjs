// Cracudo e Trombadinha (D48): o XP do chão e o XP do Juninho.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';

const DT = 1 / 30;
function morro() {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false, trecho: 'morro' }, { seed: 11 });
  g.updateRoute();
  g.enemies.length = 0;
  g.spawnAcc = -1e9;
  const p = g.player;
  p.hp = 1e6;
  p.xpNext = 1e9;
  p.weapons.length = 0;
  return g;
}

test('a horda do Morro veste os moradores (roupas 100 em diante)', () => {
  const g = morro();
  const e = g.spawnEnemy('telespectador', g.player.x, g.player.y - 6);
  assert.ok(e.tint >= 100, `roupa ${e.tint}`);
});

test('Cracudo cata o XP do chão e devolve quando cai', () => {
  const g = morro();
  const p = g.player;
  const c = g.spawnEnemy('cracudo', p.x, p.y - 7);
  g.gems.length = 0;
  g.dropGem(p.x, p.y - 4.5, 7); // no meio da viela, entre ele e o Juninho
  for (let i = 0; i < 150 && !c.guardou; i++) g.update(DT, { x: 0, y: 0 });
  assert.equal(c.guardou, 7, 'não catou');
  assert.ok(!g.gems.some((q) => q.v === 7), 'o XP continuou no chão');
  g.damageEnemy(c, 1e6, 'teste');
  assert.ok(g.gems.some((q) => q.v === 7), 'não devolveu o que catou');
});

test('Trombadinha encosta, rouba XP e foge; derrubado, devolve', () => {
  const g = morro();
  const p = g.player;
  p.xp = 40;
  const t = g.spawnEnemy('trombadinha', p.x, p.y - 1.5);
  for (let i = 0; i < 60 && t.roubou === undefined; i++) g.update(DT, { x: 0, y: 0 });
  assert.ok(t.roubou > 0, 'não roubou');
  assert.equal(p.xp, 40 - t.roubou);
  assert.ok(t.fugaT > 0, 'não fugiu');
  const d0 = Math.hypot(t.x - p.x, t.y - p.y);
  for (let i = 0; i < 20; i++) g.update(DT, { x: 0, y: 0 });
  assert.ok(Math.hypot(t.x - p.x, t.y - p.y) > d0, 'não se afastou');
  const roubou = t.roubou;
  g.gems.length = 0;
  g.damageEnemy(t, 1e6, 'teste');
  assert.ok(g.gems.some((q) => q.v === roubou), 'não devolveu o XP');
});

test('Cracudo desiste do XP que caiu atrás da parede', () => {
  const g = morro();
  const p = g.player;
  const c = g.spawnEnemy('cracudo', p.x + 2, p.y - 6);
  g.gems.length = 0;
  g.dropGem(c.x + 1.2, c.y, 5); // fora da viela
  for (let i = 0; i < 120; i++) g.update(DT, { x: 0, y: 0 });
  assert.ok(c.ignora, 'continuou preso na parede');
});
