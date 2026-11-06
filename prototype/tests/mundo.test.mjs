// Mundo da rota: portão da escadaria, lajes com escada, pegar e arremessar objetos e a entrega no topo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { ROUTE, INTERACT } from '../src/config.js';
import { constrain, applyLevels, inside } from '../src/mundo.js';

const newGame = (extra = {}) => {
  const g = new Game({ ...defaultSettings(), elenco: false, ...extra }, { seed: 4 });
  g.enemies.length = 0;
  return g;
};

test('a escadaria do morro fica fechada até o nível da meta e abre sozinha', () => {
  const g = newGame();
  const w = g.world;
  const probe = { x: (w.gate.x0 + w.gate.x1) / 2, y: w.orlaTop - 3, r: 0.3 };
  constrain(w, probe);
  assert.ok(probe.y >= w.orlaTop - 0.01, 'passou pelo portão fechado');
  g.player.level = ROUTE.orla.unlockLevel;
  g.updateRoute();
  assert.equal(w.gateOpen, true);
  const p2 = { x: probe.x, y: w.orlaTop - 3, r: 0.3 };
  constrain(w, p2);
  assert.ok(p2.y < w.orlaTop - 2, 'não deixou passar com o portão aberto');
});

test('quem está no chão não atravessa a laje; pela escada, sobe', () => {
  const g = newGame();
  const P = g.world.platforms.find((q) => q.kind === 'terraco');
  const e = { x: (P.x0 + P.x1) / 2, y: (P.y0 + P.y1) / 2, r: 0.3, plat: null, lvl: 0, z: 0 };
  applyLevels(g.world, e);
  assert.ok(!inside(P, e.x, e.y) || e.plat, 'ficou dentro da laje estando no chão');
  // pelo pé da escada, andando para cima, chega ao tampo
  const S = P.stair;
  const c = { x: (S.x0 + S.x1) / 2, y: S.y1 - 0.1, r: 0.3, plat: null, lvl: 0, z: 0 };
  for (let i = 0; i < 200; i++) {
    c.y -= 0.05;
    applyLevels(g.world, c);
  }
  assert.equal(c.plat, P);
  assert.equal(c.lvl, 1);
  assert.ok(c.z > P.h * 0.85);
});

test('o Juninho pega a cadeira do boteco sozinho e arremessa no inimigo mais perto', () => {
  const g = newGame();
  const slot = g.world.slots.find((s) => s.kind === 'cadeira' && !s.plat);
  g.player.x = slot.x + 0.3;
  g.player.y = slot.y;
  g.updateInteract(1 / 30);
  assert.equal(g.player.carry && g.player.carry.kind, 'cadeira');
  g.spawnEnemy('telespectador', g.player.x + 4, g.player.y);
  g.hash.clear();
  for (const e of g.enemies) g.hash.insert(e);
  g.updateInteract(INTERACT.holdS + 0.05);
  assert.equal(g.player.carry, null);
  assert.ok(g.projectiles.some((p) => p.kind === 'thrown' && p.obj === 'cadeira'));
});

test('no topo do morro, a entrega só vale no nível da meta', () => {
  const g = newGame({ trecho: 'morro' });
  const top = g.world.top;
  g.updateRoute();
  g.player.x = (top.x0 + top.x1) / 2;
  g.player.y = top.y0 + 1;
  g.player.y = g.world.orlaTop - 5; // passa pelo portão primeiro
  g.updateRoute();
  assert.equal(g.segment, 'morro');
  g.player.y = top.y0 + 1;
  g.updateRoute();
  assert.equal(g.delivered, false);
  g.player.level = ROUTE.morro.unlockLevel;
  g.updateRoute();
  assert.equal(g.delivered, true);
  assert.equal(g.over, 'victory');
});
