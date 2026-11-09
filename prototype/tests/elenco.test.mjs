// Elenco v2, inimigos (D73): Laranja (apanha no lugar do Político) e Rato de Academia (investida que empurra).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { ENEMIES } from '../src/config.js';

const DT = 1 / 30;
const parado = { x: 0, y: 0 };
function jogo() {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 21 });
  g.enemies.length = 0;
  g.spawnAcc = -1e9;
  g.nextWaveAt = 1e9;
  g.nextEliteAt = 1e9;
  g.player.hp = 1e9;
  g.player.xpNext = 1e9;
  g.player.weapons = [];
  g.world.figurantes = [];
  const p = g.player;
  p.x = 0;
  p.y = -60;
  return g;
}

test('o Político chega com os Laranjas, que ficam na frente dele e apanham no lugar dele', () => {
  const g = jogo();
  g.spawnElite('politico');
  const pol = g.enemies.find((e) => e.type === 'politico');
  const lj = g.enemies.filter((e) => e.type === 'laranja');
  assert.equal(lj.length, ENEMIES.politico.laranjas);
  assert.ok(lj.every((l) => l.dono === pol));
  // anda um pouco: os Laranjas ficam entre o Político e o Juninho
  pol.x = 0;
  pol.y = -70;
  for (const l of lj) {
    l.x = pol.x + l.lado * 1.2; // nascem ao lado dele
    l.y = pol.y;
  }
  pol.speed = 0;
  for (let i = 0; i < 90; i++) g.update(DT, parado);
  const p = g.player;
  for (const l of lj) assert.ok(Math.hypot(l.x - p.x, l.y - p.y) < Math.hypot(pol.x - p.x, pol.y - p.y), 'o Laranja ficou atrás do Político');
  // golpe no Político: a maior parte vai para o Laranja mais perto
  const hpPol = pol.hp;
  const hpLj = lj.map((l) => l.hp);
  g.damageEnemy(pol, 50, 'teste');
  const tirouPol = hpPol - pol.hp;
  const tirouLj = lj.reduce((s, l, i) => s + (hpLj[i] - l.hp), 0);
  assert.ok(tirouPol < 50 * 0.4, `o Político levou ${tirouPol}`);
  assert.ok(tirouLj > 0, 'nenhum Laranja apanhou');
  // sem Laranjas, o Político leva tudo
  for (const l of lj) g.damageEnemy(l, 1e9, 'teste');
  assert.ok(g.pickups.filter((k) => k.kind === 'propina').length >= lj.length, 'o Laranja não espalhou o dinheiro');
  const antes = pol.hp;
  g.damageEnemy(pol, 30, 'teste');
  assert.ok(Math.abs(antes - pol.hp - 30) < 1e-6, 'o Político continuou protegido sem Laranja');
});

test('Rato de Academia: prepara, corre reto e empurra o Juninho se pega ele na corrida', () => {
  const g = jogo();
  const p = g.player;
  const r = g.spawnEnemy('rato', p.x + 4, p.y);
  r.fireT = 0;
  let correu = false;
  for (let i = 0; i < 60; i++) {
    g.update(DT, parado);
    if (r.dashT > 0) correu = true;
    if (p.kx) break;
  }
  assert.ok(correu, 'o Rato não correu');
  assert.ok(p.kx < -1, `não empurrou o Juninho para longe dele (kx ${p.kx})`);
  const x0 = p.x;
  for (let i = 0; i < 10; i++) g.update(DT, parado);
  assert.ok(p.x < x0 - 0.3, 'o empurrão não moveu o Juninho');
});

test('a turma de reforço do Monstrão traz Ratos de Academia', async () => {
  const g = jogo();
  const { updateMonstrao } = await import('../src/monstrao.js');
  const m = g.spawnEnemy('monstrao', g.player.x, g.player.y - 8, { fase: 1, pausaT: 99 });
  m.reforcoT = 0.001;
  updateMonstrao(g, m, DT, 0, 1);
  const ratos = g.enemies.filter((e) => e.type === 'rato').length;
  assert.equal(ratos, ENEMIES.monstrao.reforco.ratos[1]);
});
