// Chefe do Tráfico (laje do topo): gigante com duas metralhadoras (D91), golpes com aviso, recarga e rádio.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { ENEMIES } from '../src/config.js';

test('Chefe do Tráfico gigante (D91): rajada dupla das duas armas, leque e faixa com aviso, recarga e rádio', () => {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 4 });
  g.enemies.length = 0;
  g.spawnAcc = -1e9;
  const p = g.player;
  p.hp = 1e6;
  g.stats.maxHp = 1e6;
  const D = ENEMIES.chefe_trafico;
  const c = g.spawnEnemy('chefe_trafico', p.x, p.y - 8);
  c.callCd = 99;
  c.pausaT = 0;
  const still = { x: 0, y: 0 };
  const vistos = new Set();
  const lados = new Set();
  let mirou = false;
  let tiros = 0;
  let recarga = false;
  for (let i = 0; i < 30 * 30 && !(vistos.size === 3 && recarga); i++) {
    const antes = g.enemyShots.length;
    g.update(1 / 30, still);
    if (c.golpe && c.golpe !== 'recarga') vistos.add(c.golpe);
    if (c.golpe === 'recarga' && c.janelaT > 0) recarga = true;
    if (c.aimT > 0) mirou = true;
    for (const t of g.enemyShots.slice(antes)) {
      tiros++;
      // de que lado do corpo dele saiu o tiro (as duas armas)
      const ux = t.vx;
      const uy = t.vy;
      const l = Math.hypot(ux, uy) || 1;
      const lado = ((t.x - c.x) * -uy + (t.y - c.y) * ux) / l;
      if (Math.abs(lado) > D.canoM * 0.5) lados.add(Math.sign(lado));
    }
    for (const a of g.avisosChao || []) vistos.add(`aviso_${a.tipo}`);
  }
  assert.ok(mirou, 'a rajada saiu sem a mira de aviso');
  assert.ok(vistos.has('dupla') && vistos.has('leque') && vistos.has('juntas'), `faltou golpe: ${[...vistos]}`);
  assert.ok(vistos.has('aviso_leque') && vistos.has('aviso_faixa'), 'a varredura ou o jato saíram sem aviso no chão');
  assert.equal(lados.size, 2, 'os tiros não saíram das duas armas');
  assert.ok(tiros > 20, `atirou pouco: ${tiros}`);
  assert.ok(recarga, 'não parou para recarregar');
  // reforço: para, grita no rádio e chegam traficantes
  c.golpe = null;
  c.callCd = 0;
  const antesT = g.enemies.filter((e) => e.type === 'traficante').length;
  let gritou = false;
  for (let i = 0; i < 60; i++) {
    g.update(1 / 30, still);
    if (c.callT > 0) gritou = true;
  }
  assert.ok(gritou, 'não fez a pose de raiva no rádio');
  assert.ok(g.enemies.filter((e) => e.type === 'traficante').length >= antesT + D.reforco.traficantes, 'o reforço não chegou');
});
