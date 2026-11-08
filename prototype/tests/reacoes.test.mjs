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
  for (let i = 0; i < 30 * (REACOES.carro.fogoCadeiaS[1] + 0.2); i++) g.update(DT, parado);
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
  for (let i = 0; i < 30 * (2 * REACOES.carro.fogoCadeiaS[1] + 0.3); i++) g.update(DT, parado);
  assert.ok(par[0].queimado && par[1].queimado, 'a explosão não passou para o vizinho');
});

test('carro na porrada: perde vida, solta fumaça, pega fogo com o aviso no chão e só explode depois', async () => {
  const { golpeNoCarro, vidaDoCarro } = await import('../src/reacoes.js');
  const g = jogo();
  const c = g.world.props.find((q) => q.kind === 'carro');
  const cx = (c.x0 + c.x1) / 2;
  const cy = (c.y0 + c.y1) / 2;
  g.player.x = cx + 8;
  g.player.y = cy + 8;
  const C = REACOES.carro;
  const vida = vidaDoCarro(c);
  // um golpe só por vez do mesmo capacete
  const ja = new Set();
  assert.equal(golpeNoCarro(g, cx, cy, 0.3, 10, ja), 1, 'o golpe não pegou o carro');
  assert.equal(golpeNoCarro(g, cx, cy, 0.3, 10, ja), 0, 'o mesmo golpe acertou duas vezes');
  assert.equal(c.vida, vida - 10);
  // abaixo da metade: fumaça do capô
  golpeNoCarro(g, cx, cy, 0.3, vida * (1 - C.fumacaVida));
  g.fx.anims.length = 0;
  for (let i = 0; i < 30 * 2; i++) g.update(DT, parado);
  assert.ok(g.fx.anims.some((a) => a.nome === 'explosao_fumaca'), 'amassado sem fumaça');
  assert.equal(c.explodeEm, undefined, 'pegou fogo antes de acabar a vida');
  // acabou a vida: pega fogo, o círculo da explosão aparece no chão e enche
  golpeNoCarro(g, cx, cy, 0.3, vida);
  assert.ok(Math.abs(c.explodeEm - (g.t + C.fogoS)) < 1e-6, 'não pegou fogo com o tempo para fugir');
  g.update(DT, parado);
  const aviso = (g.avisosChao || []).find((a) => a.tipo === 'circulo' && Math.hypot(a.x - cx, a.y - cy) < 0.01);
  assert.ok(aviso && aviso.r >= C.raioM - 1e-6, 'sem o círculo da explosão no chão');
  for (let i = 0; i < 30 * (C.fogoS - 0.3); i++) g.update(DT, parado);
  assert.ok(!c.queimado, 'explodiu antes do tempo de fugir');
  for (let i = 0; i < 30 * 0.6; i++) g.update(DT, parado);
  assert.ok(c.queimado, 'não explodiu depois do fogo');
});

test('objeto que não explode dá porrada no carro; o botijão põe fogo na hora', () => {
  const g = jogo();
  const carros = g.world.props.filter((q) => q.kind === 'carro');
  const [a, b] = [carros[0], carros[carros.length - 1]];
  g.player.x = (a.x0 + a.x1) / 2 + 8;
  g.player.y = (a.y0 + a.y1) / 2 + 8;
  g.objectLands({ obj: 'cadeira', x: (a.x0 + a.x1) / 2, y: (a.y0 + a.y1) / 2, radius: 1.3, dmg: 28 });
  assert.ok(a.vida < REACOES.carro.vida && a.explodeEm == null, 'a cadeira não amassou ou pôs fogo');
  g.objectLands({ obj: 'botijao', x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2, radius: 2.8, dmg: 90 });
  assert.ok(b.explodeEm != null, 'o botijão não pôs fogo no carro');
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
