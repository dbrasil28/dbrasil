// Modo Horda, Desafio da Semana e ranking (D43, D44).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { HORDA, CARREIRA, DESAFIO } from '../src/config.js';
import { desafioDaSemana, semanaAtual } from '../src/horda.js';
import { registrarPartida, loadRanking } from '../src/ranking.js';

const DT = 1 / 30;
const parado = { x: 0, y: 0 };

function horda(extra = {}) {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 8, meta: { modo: 'horda', trecho: 'orla', melhorias: {}, ...extra } });
  g.enemies.length = 0;
  g.spawnAcc = -1e9;
  g.player.hp = 1e6;
  g.stats.maxHp = 1e6;
  g.player.xpNext = 1e9;
  g.eventIndex = 99;
  return g;
}

test('Horda: em 100% o chefão sai sozinho; derrubado, a porta não abre e ele volta mais forte', () => {
  const g = horda();
  g.trechoT0 = g.t - CARREIRA.caosTempoS;
  g.update(DT, parado);
  assert.ok(g.boss && g.boss.type === 'especulador', 'o chefão não saiu sozinho');
  const hp1 = g.boss.maxHp;
  g.damageEnemy(g.boss, 1e12, 'teste');
  assert.equal(g.boss, null);
  assert.equal(g.world.gateOpen, false, 'a escadaria abriu na Horda');
  assert.equal(g.over, null);
  g.update(DT, parado);
  assert.ok(g.caos >= 99, 'o Caos zerou na Horda');
  g.t += HORDA.chefaoVoltaS;
  g.update(DT, parado);
  assert.ok(g.boss, 'o chefão não voltou');
  assert.ok(g.boss.maxHp > hp1 * 1.2, 'voltou sem ficar mais forte');
});

test('Horda: passados os 100% a horda endurece; aos 30 minutos chega o Rabecão, que não morre', () => {
  const g = horda();
  g.trechoT0 = g.t - CARREIRA.caosTempoS;
  g.update(DT, parado);
  g.boss.dead = true;
  g.boss = null;
  const a = g.spawnEnemy('telespectador', g.player.x + 9, g.player.y).maxHp;
  g.t += 300;
  const b = g.spawnEnemy('telespectador', g.player.x + 9, g.player.y).maxHp;
  assert.ok(b > a * 1.5, `não endureceu: ${a} → ${b}`);
  g.trechoT0 = g.t - HORDA.rabecaoS;
  g.update(DT, parado);
  const r = g.enemies.find((e) => e.type === 'rabecao');
  assert.ok(r, 'sem Rabecão');
  g.damageEnemy(r, 1e12, 'teste');
  assert.ok(!r.dead, 'o Rabecão morreu');
});

test('Horda: a gorjeta é menor que a da Carreira', () => {
  const g = horda();
  g.t = 300;
  const c = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 8 });
  c.t = 300;
  assert.ok(g.tips().total < c.tips().total);
});

test('Desafio da Semana: mesma regra e mesmo sorteio para a mesma semana; a regra muda o jogo', () => {
  const a = desafioDaSemana('2026-45');
  const b = desafioDaSemana('2026-45');
  assert.deepEqual(a, b);
  assert.ok(DESAFIO.regras.some((r) => r.id === a.regra));
  assert.match(semanaAtual(new Date(2026, 10, 7)), /^2026-\d\d$/);
  const d = { ...a, regra: 'chinelada' };
  const g = horda({ modo: 'desafio', desafio: d });
  assert.ok(g.player.weapons.some((w) => w.id === 'chinelo' && w.level === 3));
});

test('ranking: entra a partida da Horda; partida com segunda chance não entra', () => {
  const r = loadRanking();
  const g = horda();
  g.t = 400;
  const res = registrarPartida(r, g);
  assert.equal(r.horda.orla.length, 1);
  assert.match(res.linhas[0], /1º lugar/);
  const g2 = horda();
  g2.t = 900;
  g2.metrics.ads.aceitos.reviver = 1;
  const res2 = registrarPartida(r, g2);
  assert.ok(res2.fora);
  assert.equal(r.horda.orla.length, 1);
});
