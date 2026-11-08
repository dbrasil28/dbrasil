// Arrancar do cenário (arrancar.js): lixeira, guarda-sol e isopor viram arremessáveis e voltam depois.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { INTERACT, THROWABLES } from '../src/config.js';

const DT = 1 / 30;
function jogo() {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 5 });
  g.enemies.length = 0;
  g.spawnAcc = -1e9;
  g.player.hp = 1e9;
  g.world.figurantes = [];
  return g;
}
const encosta = (g, k) => {
  const p = g.player;
  p.x = k.x1 + p.r + 0.05;
  p.y = (k.y0 + k.y1) / 2;
  p.plat = null;
  p.lvl = 0;
  p.z = 0;
};

test('lixeira, guarda-sol e isopor existem no cenário e são arremessáveis', () => {
  const g = jogo();
  for (const kind of ['lixeira', 'guarda_sol', 'isopor']) {
    assert.ok(THROWABLES[kind] && THROWABLES[kind].arranca, `${kind} não é arremessável`);
    assert.ok(g.world.props.some((k) => k.kind === kind), `sem ${kind} no cenário`);
  }
});

test('o Juninho encosta, arranca, joga na horda, e outro volta no lugar depois', () => {
  for (const kind of ['lixeira', 'guarda_sol', 'isopor']) {
    const g = jogo();
    const w = g.world;
    const k = w.props.find((q) => q.kind === kind && q.y < -30 && q.y > w.orlaTop + 6); // dentro da área de andar (há cenário além das pontas)
    const n0 = w.props.length;
    encosta(g, k);
    g.update(DT, { x: 0, y: 0 });
    assert.equal(g.player.carry && g.player.carry.kind, kind, `não arrancou ${kind}`);
    assert.ok(!w.props.includes(k), `${kind} continua no lugar`);
    if (k.solid) assert.ok(!w.solids.includes(k), `${kind} continua sólido`);
    // um da horda por perto: o Juninho joga
    const e = g.spawnEnemy('telespectador', g.player.x + 3, g.player.y);
    e.hp = e.maxHp = 1e6;
    e.speed = 0;
    let jogou = false;
    for (let i = 0; i < 30 && !jogou; i++) {
      g.update(DT, { x: 0, y: 0 });
      jogou = g.projectiles.some((pr) => pr.kind === 'thrown' && pr.obj === kind);
    }
    assert.ok(jogou, `não jogou ${kind}`);
    for (let i = 0; i < 30; i++) g.update(DT, { x: 0, y: 0 });
    assert.ok(e.hp < 1e6, `${kind} não acertou`);
    // longe e fora da tela, depois do tempo: volta
    g.enemies.length = 0;
    for (let i = 0; i < 30 * (INTERACT.respawnS + 2); i++) {
      g.player.x = k.x;
      g.player.y = k.y - 60;
      g.update(DT, { x: 0, y: 0 });
    }
    assert.ok(w.props.includes(k), `${kind} não voltou`);
    assert.equal(w.props.length, n0);
    for (let i = 1; i < w.props.length; i++) assert.ok(w.props[i - 1].y <= w.props[i].y, 'a lista do cenário saiu de ordem');
    if (k.solid) assert.ok(w.solids.includes(k), `${kind} voltou sem ser sólido`);
  }
});

test('na abertura não arranca nada', async () => {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 12, meta: { abertura: true } });
  const k = g.world.props.find((q) => q.kind === 'lixeira');
  encosta(g, k);
  for (let i = 0; i < 5; i++) g.update(DT, { x: 0, y: 0 });
  assert.equal(g.player.carry, null);
  assert.ok(g.world.props.includes(k));
});
