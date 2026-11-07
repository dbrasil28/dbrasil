// Reações do cenário: carro perto de explosão explode (em cadeia); poste perto do raio descarrega.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { REACOES } from '../src/config.js';
import { explosaoPerto, raioPerto } from '../src/reacoes.js';

const DT = 1 / 30;
const parado = { x: 0, y: 0 };

function jogo() {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 12 });
  g.enemies.length = 0;
  g.spawnAcc = -1e9;
  g.eventIndex = 99;
  g.player.hp = 1e6;
  g.stats.maxHp = 1e6;
  g.player.xpNext = 1e9;
  g.player.weapons.length = 0;
  return g;
}

test('carro: explosão perto faz o carro explodir depois de um instante, machuca a horda e queima', () => {
  const g = jogo();
  const c = g.world.props.find((q) => q.kind === 'carro');
  assert.ok(c, 'sem carro parado');
  const cx = (c.x0 + c.x1) / 2;
  const cy = (c.y0 + c.y1) / 2;
  g.player.x = cx + 6; // perto, para a horda não ser trazida de volta para o lado dele
  g.player.y = cy + 6;
  const e = g.spawnEnemy('telespectador', cx + 1.2, cy + 1.2);
  e.hp = e.maxHp = 1000;
  e.speed = 0;
  explosaoPerto(g, c.x1 + 1.5, cy, 1.2);
  assert.ok(c.explodeEm > g.t, 'o carro não ficou para explodir');
  assert.equal(e.hp, 1000, 'explodiu na hora');
  for (let i = 0; i < 30; i++) g.update(DT, parado);
  assert.ok(c.queimado, 'o carro não explodiu');
  assert.ok(e.hp <= 1000 - REACOES.carro.dano + 1, 'a explosão do carro não machucou a horda');
  assert.ok(g.fx.anims.some((a) => a.nome === 'explosao_fumaca'), 'sem fumaça');
  // queimado não explode de novo
  c.explodeEm = null;
  explosaoPerto(g, cx, cy, 2);
  assert.equal(c.explodeEm, null, 'o carro queimado ficou para explodir de novo');
});

test('carro: reação em cadeia de um carro para o vizinho', () => {
  const g = jogo();
  const carros = g.world.props.filter((q) => q.kind === 'carro');
  const borda = (q, x, y) => Math.hypot(Math.max(q.x0 - x, 0, x - q.x1), Math.max(q.y0 - y, 0, y - q.y1));
  let par = null;
  for (const a of carros) {
    const b = carros.find((q) => q !== a && borda(q, (a.x0 + a.x1) / 2, (a.y0 + a.y1) / 2) < REACOES.carro.raioM + REACOES.carro.gatilhoM);
    if (b) {
      par = [a, b];
      break;
    }
  }
  assert.ok(par, 'sem dois carros perto');
  g.player.x = (par[0].x0 + par[0].x1) / 2 + 7;
  g.player.y = (par[0].y0 + par[0].y1) / 2 + 7;
  explosaoPerto(g, (par[0].x0 + par[0].x1) / 2, (par[0].y0 + par[0].y1) / 2, 0.5);
  for (let i = 0; i < 60; i++) g.update(DT, parado);
  assert.ok(par[0].queimado && par[1].queimado, 'a explosão não passou para o vizinho');
});

test('poste: o raio perto de um poste faz ele descarregar na horda, e depois ele recarrega', () => {
  const g = jogo();
  const po = g.world.props.find((q) => q.kind === 'poste');
  assert.ok(po, 'sem poste');
  const px = (po.x0 + po.x1) / 2;
  const py = (po.y0 + po.y1) / 2;
  g.player.x = px - 6;
  g.player.y = py + 6;
  const alvos = [];
  for (let i = 0; i < 4; i++) {
    const e = g.spawnEnemy('telespectador', px + 2 + i, py + 1);
    e.hp = e.maxHp = 1000;
    e.speed = 0;
    alvos.push(e);
  }
  g.update(DT, parado); // índice espacial com os inimigos
  const antes = g.fx.bolts.length;
  assert.ok(raioPerto(g, px + 1, py, null), 'o poste não descarregou');
  assert.ok(g.fx.bolts.length - antes >= 3, 'poucos raios do poste');
  assert.ok(alvos.filter((e) => e.hp < 1000).length >= 3, 'a descarga não acertou a horda');
  assert.ok(g.fx.bolts[g.fx.bolts.length - 1].pts[0].z > 4, 'o raio não sai do alto do poste');
  assert.equal(raioPerto(g, px + 1, py, null), false, 'descarregou de novo sem recarregar');
});
