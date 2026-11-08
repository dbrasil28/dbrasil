// Juninho derrubado (D64): atropelado ou perto de carro explodindo, voa, cai de costas, rola e levanta.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { DERRUBADO, REACOES } from '../src/config.js';

const DT = 1 / 30;
function jogo() {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 9 });
  g.enemies.length = 0;
  g.spawnAcc = -1e9;
  g.traffic = [];
  g.player.hp = g.stats.maxHp = 1e6;
  g.world.figurantes = [];
  return g;
}
const total = DERRUBADO.quadrosS.reduce((a, b) => a + b, 0);

test('derrubado: voa no sentido do golpe, sem controle e sem dano, e levanta no fim', () => {
  const g = jogo();
  const p = g.player;
  // num lugar livre, para o voo não bater em nada (batendo num sólido, ele para nele)
  p.x = 0;
  p.y = -60;
  const x0 = p.x;
  const y0 = p.y;
  assert.ok(g.derrubar(0, -1));
  assert.equal(p.derrubado.k, 4, 'para cima na tela é a direção 180°');
  assert.ok(!g.derrubar(1, 0), 'derrubou de novo no chão');
  const hp = p.hp;
  let maxZ = 0;
  let quadros = new Set();
  for (let t = 0; t < total - 0.1; t += DT) {
    g.updatePlayer(DT, { x: 1, y: 0 }); // o joystick não manda nele
    g.hurtPlayer(50, 'teste');
    if (p.derrubado) {
      maxZ = Math.max(maxZ, p.derrubado.z);
      quadros.add(p.derrubado.quadro);
    }
  }
  assert.equal(p.hp, hp, 'levou dano no chão');
  assert.ok(Math.abs(p.x - x0) < 0.3, 'o joystick mexeu nele');
  assert.ok(y0 - p.y > DERRUBADO.vooM * 0.8, `voou só ${(y0 - p.y).toFixed(2)} m`);
  assert.ok(maxZ > 0.3, 'não subiu no voo');
  assert.equal(quadros.size, DERRUBADO.quadrosS.length, 'pulou quadro');
  for (let i = 0; i < 10; i++) g.updatePlayer(DT, { x: 0, y: 0 });
  assert.equal(p.derrubado, null, 'não levantou');
  g.updatePlayer(0.5, { x: 1, y: 0 });
  assert.ok(p.x > x0 + 0.5, 'depois de levantar, o joystick não voltou a mandar');
});

test('carro explodindo perto derruba o Juninho para longe dele', async () => {
  const { golpeNoCarro } = await import('../src/reacoes.js');
  const g = jogo();
  const c = g.world.props.find((q) => q.kind === 'carro' && q.y < -20 && q.y > g.world.orlaTop + 6);
  const cx = (c.x0 + c.x1) / 2;
  const cy = (c.y0 + c.y1) / 2;
  const p = g.player;
  p.x = cx;
  p.y = c.y1 + 0.6; // colado na frente do carro
  p.plat = null;
  golpeNoCarro(g, cx, cy, 0.3, 1e6); // pega fogo
  let caiu = false;
  for (let i = 0; i < 30 * (REACOES.carro.fogoS + 0.5) && !caiu; i++) {
    p.x = cx;
    p.y = c.y1 + 0.6;
    g.update(DT, { x: 0, y: 0 });
    caiu = !!p.derrubado;
  }
  assert.ok(caiu, 'a explosão não derrubou o Juninho');
  assert.ok(p.derrubado.uy > 0.5, 'não voou para longe do carro');
});

test('Monstrão derrubado: o corpo fica no chão uns segundos (uma das 3 quedas) e some', async () => {
  const { ENEMIES } = await import('../src/config.js');
  const g = jogo();
  const e = g.spawnEnemy('monstrao', g.player.x, g.player.y - 4);
  g.killEnemy(e, 'teste');
  assert.equal((g.corpos || []).length, 1, 'não ficou o corpo');
  const c = g.corpos[0];
  assert.ok(c.v >= 0 && c.v <= 2 && c.j >= 0 && c.j <= 3);
  assert.equal(c.j, 0, 'o Juninho está na frente dele (para baixo na tela): a queda é a de frente');
  const C = ENEMIES.monstrao.corpo;
  for (let t = 0; t < 12 * C.quadroS + C.noChaoS - 0.2; t += DT) g.update(DT, { x: 0, y: 0 });
  assert.equal(g.corpos.length, 1, 'sumiu cedo demais');
  for (let t = 0; t < C.someS + 0.5; t += DT) g.update(DT, { x: 0, y: 0 });
  assert.equal(g.corpos.length, 0, 'o corpo não sumiu');
});
