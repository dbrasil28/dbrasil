// MECH-001 Telespectador Hipnotizado: critérios de aceite verificáveis por agente (AC-1 a AC-6).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { WAKE, ENEMIES } from '../src/config.js';

// D27: com o gore ligado o jogo é de zumbi (todo mundo explode); a MECH-001 vale com o gore desligado.
const newGame = (extra = {}) => new Game({ ...defaultSettings(), gore: false, ...extra }, { seed: 8 });

test('AC-1 telespectador derrotado não deixa mancha nem sangue', () => {
  const g = newGame();
  const e = g.spawnEnemy('telespectador', 3, 0);
  g.damageEnemy(e, 999, 'teste');
  assert.equal(g.fx.decals.length, 0);
  assert.equal(g.fx.particles.filter((q) => q.kind === 'blood').length, 0);
  assert.ok(g.fx.particles.some((q) => q.kind === 'static'));
});

test('AC-2 ele acorda, se afasta do jogador e some depois de WAKE.fadeS', () => {
  const g = newGame();
  const e = g.spawnEnemy('telespectador', 3, 0);
  g.damageEnemy(e, 999, 'teste');
  assert.equal(g.fx.woken.length, 1);
  const w = g.fx.woken[0];
  const d0 = Math.hypot(w.x - g.player.x, w.y - g.player.y);
  g.updateFx(0.5);
  assert.ok(Math.hypot(w.x - g.player.x, w.y - g.player.y) > d0, 'não se afastou');
  g.updateFx(WAKE.fadeS);
  assert.equal(g.fx.woken.length, 0);
});

test('AC-3 continua soltando XP e contando como derrubado', () => {
  const g = newGame();
  const e = g.spawnEnemy('telespectador', 3, 0);
  g.damageEnemy(e, 999, 'teste');
  assert.equal(g.gems.length, 1);
  assert.equal(g.gems[0].v, ENEMIES.telespectador.xp);
  assert.equal(g.kills, 1);
});

test('AC-4 quem acordou não é inimigo: não colide nem causa dano', () => {
  const g = newGame();
  const e = g.spawnEnemy('telespectador', 0.3, 0);
  g.damageEnemy(e, 999, 'teste');
  g.update(1 / 60, { x: 0, y: 0 });
  assert.equal(g.enemies.length, 0);
  assert.equal(g.player.hp, g.stats.maxHp);
});

test('D27 com gore ligado o telespectador explode em sangue e pedaços e não acorda', () => {
  const g = newGame({ gore: true });
  g.damageEnemy(g.spawnEnemy('telespectador', 3, 0), 999, 'teste');
  assert.equal(g.fx.woken.length, 0);
  assert.ok(g.fx.gibs.length >= 4, 'sem pedaços');
  assert.ok(g.fx.decals.length >= 1, 'sem poça de sangue');
  // os pedaços caem e param no chão, deixando manchas
  for (let i = 0; i < 120; i++) g.updateFx(1 / 30);
  assert.ok(g.fx.gibs.every((p) => p.landed));
  assert.ok(g.fx.decals.length > 3);
});

test('AC-5 inimigos do sistema continuam com gore (quando ligado) e sem gore quando desligado', () => {
  const g = newGame({ gore: true });
  g.damageEnemy(g.spawnEnemy('burocrata', 3, 0), 999, 'teste');
  assert.ok(g.fx.decals.length >= 1);
  const h = newGame({ gore: false });
  h.damageEnemy(h.spawnEnemy('burocrata', 3, 0), 999, 'teste');
  assert.equal(h.fx.decals.length, 0);
});

test('AC-6 limite de acordados na tela e audiência com piso', () => {
  const g = newGame();
  for (let i = 0; i < WAKE.maxFx + 25; i++) g.damageEnemy(g.spawnEnemy('telespectador', 3 + i * 0.01, 0), 999, 'teste');
  assert.equal(g.fx.woken.length, WAKE.maxFx);
  g.audience = WAKE.audienceFloor;
  g.damageEnemy(g.spawnEnemy('telespectador', 3, 0), 999, 'teste');
  assert.equal(g.audience, WAKE.audienceFloor);
});
