// Monstrão, o chefão da Orla (D47): a hora de bater e a investida que para no carro.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { soltarChefao } from '../src/carreira.js';

function luta() {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 4 });
  for (let i = 0; i < 5; i++) g.update(1 / 30, { x: 0, y: 0 });
  if (g.abertura) g.pularAbertura();
  g.enemies.length = 0;
  g.spawnAcc = -1e9;
  const p = g.player;
  p.hp = 1e6;
  p.weapons.length = 0;
  const C = g.covil;
  p.x = C.x;
  p.y = g.world.obra.y1 + 12;
  C.aberto = true;
  soltarChefao(g, C);
  g.boss.reforcoT = 1e9;
  return g;
}

test('Monstrão: fazendo pose ou tonto leva o dobro de dano', () => {
  const g = luta();
  const b = g.boss;
  b.hp = b.maxHp = 1e6;
  g.damageEnemy(b, 10, 'teste');
  const normal = 1e6 - b.hp;
  b.janelaT = 1;
  const antes = b.hp;
  g.damageEnemy(b, 10, 'teste');
  assert.equal(antes - b.hp, normal * 2);
});

test('Monstrão: a investida que bate num carro deixa ele tonto, com a hora de bater', () => {
  const g = luta();
  const b = g.boss;
  const w = g.world;
  // um carro parado no caminho, entre ele e o Juninho
  const y = b.y + 5;
  const carro = { kind: 'carro', x0: b.x - 1, x1: b.x + 1, y0: y, y1: y + 1.8, x: b.x, y: y + 1.8, h: 1.4, solid: true };
  w.solids.push(carro);
  Object.assign(b, { golpe: 'preparo', golpeT: 0.05, dirX: 0, dirY: 1, poseX: 0, poseY: 1, corridas: 1 });
  let tonto = false;
  for (let i = 0; i < 90 && !tonto; i++) {
    g.update(1 / 30, { x: 0, y: 0 });
    tonto = b.golpe === 'tonto';
  }
  assert.ok(tonto, `esperava tonto, ficou ${b.golpe}`);
  assert.ok(b.janelaT > 0, 'tonto sem a hora de bater');
  assert.ok(b.y < y, 'atravessou o carro');
});
