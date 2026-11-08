// Figurantes (D55): garotas, PM, tropa e picolezeiros de ambiente. Andam um pouco, reagem à horda e não lutam.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { FIGURANTES } from '../src/config.js';

const DT = 1 / 30;
function jogo() {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 7 });
  g.enemies.length = 0;
  g.spawnAcc = -1e9;
  g.player.hp = 1e9;
  return g;
}

test('cada tipo tem seu lugar: garotas e PM na Orla, tropa no Morro, picolezeiro na areia', () => {
  const g = jogo();
  const w = g.world;
  const de = (t) => w.figurantes.filter((f) => f.tipo === t);
  for (const t of ['garota', 'pm', 'tropa', 'picole']) assert.ok(de(t).length > 0, `sem ${t}`);
  for (const f of de('garota').concat(de('pm'))) assert.ok(f.y > w.orlaTop - 1, `${f.tipo} fora da Orla`);
  for (const f of de('tropa')) assert.ok(f.y < w.orlaTop, 'tropa fora do Morro');
  for (const f of de('picole')) assert.ok(f.x > g.map.sandX && f.yb - f.ya >= FIGURANTES.picoleMinM, 'picolezeiro fora da areia');
  assert.equal(w.props.filter((p) => p.kind === 'garota' || p.kind === 'policial').length, 0, 'sobrou figura parada antiga');
});

test('andam perto do lugar deles; o picolezeiro vai e volta no trecho dele', () => {
  const g = jogo();
  const w = g.world;
  for (let i = 0; i < 30 * 40; i++) {
    g.player.y = 0; // perto dos do começo
    g.update(DT, { x: 0, y: 0 });
  }
  for (const f of w.figurantes) {
    if (Math.abs(f.y - g.player.y) > FIGURANTES.vistaM) continue;
    if (f.tipo === 'picole') assert.ok(f.y >= f.ya - 0.01 && f.y <= f.yb + 0.01, 'picolezeiro saiu do trecho');
    else assert.ok(Math.hypot(f.x - f.ax, f.y - f.ay) <= FIGURANTES.raioM[f.tipo] + 0.01, `${f.tipo} foi longe`);
  }
});

test('reagem à horda sem lutar: o policial mira, a garota fica com raiva e, colada, ataca', () => {
  const g = jogo();
  const w = g.world;
  const pm = w.figurantes.find((f) => f.tipo === 'pm');
  const ga = w.figurantes.find((f) => f.tipo === 'garota');
  g.player.x = pm.x;
  g.player.y = pm.y + 6;
  const parado = (e) => {
    e.hp = e.maxHp = 1e6;
    e.speed = 0;
    return e;
  };
  const e1 = parado(g.spawnEnemy('telespectador', pm.x + 5, pm.y - 2));
  g.update(DT, { x: 0, y: 0 });
  assert.equal(pm.pose, 'ataque', 'o policial não mirou');
  assert.ok(pm.dirX > 0, 'não virou para a horda');
  assert.equal(e1.hp, 1e6, 'figurante não luta');
  // longe do Juninho a horda some: a da garota nasce depois que ele chega perto dela
  g.player.x = ga.x;
  g.player.y = ga.y + 6;
  const e2 = parado(g.spawnEnemy('telespectador', ga.x + 2.5, ga.y));
  g.update(DT, { x: 0, y: 0 });
  assert.equal(ga.pose, 'raiva');
  e2.x = ga.x + 0.8;
  g.update(DT, { x: 0, y: 0 });
  assert.equal(ga.pose, 'ataque');
  assert.equal(e2.hp, 1e6, 'figurante não luta');
});
