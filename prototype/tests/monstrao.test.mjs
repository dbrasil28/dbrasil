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
  // os golpes sozinhos: sem o cerco da chegada (D82, tem teste próprio) e ele já na frente da obra
  g.cerco = null;
  g.boss.entrando = false;
  g.boss.x = C.x;
  g.boss.y = g.world.obra.y1 - 1.6;
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

test('Monstrão: a investida que corre a distância inteira sem bater termina na pose, com a hora de bater', () => {
  const g = luta();
  const b = g.boss;
  const w = g.world;
  w.solids.length = 0; // chão livre: nada no caminho
  const p = g.player;
  p.x = b.x + 30; // longe, de lado: a investida não pega o Juninho
  Object.assign(b, { golpe: 'preparo', golpeT: 0.05, dirX: 0, dirY: 1, poseX: 0, poseY: 1, corridas: 1, quiques: 0 });
  let vistos = new Set();
  for (let i = 0; i < 150 && b.golpe !== 'pose'; i++) {
    g.update(1 / 30, { x: 0, y: 0 });
    vistos.add(b.golpe);
  }
  assert.equal(b.golpe, 'pose', `esperava a pose, passou por ${[...vistos]}`);
  assert.ok(b.janelaT > 0, 'pose sem a hora de bater');
});

test('Monstrão: a anilha sai das mãos, cai na frente dele e só machuca depois de cair; então rola', async () => {
  const { ENEMIES } = await import('../src/config.js');
  const N = ENEMIES.monstrao.anilha;
  const g = luta();
  const b = g.boss;
  const p = g.player;
  g.world.solids.length = 0;
  p.x = b.x;
  p.y = b.y + 6; // na linha do arremesso, longe o bastante para a anilha cair antes de chegar nele
  p.vx = p.vy = 0;
  Object.assign(b, { golpe: 'arremesso', golpeT: 0.02, pausaT: 1e9 });
  g.update(1 / 30, { x: 0, y: 0 });
  g.update(1 / 30, { x: 0, y: 0 });
  const an = () => (g.monstraoObjs || []).find((o) => o.tipo === 'anilha');
  const a = an();
  assert.ok(a, 'não soltou a anilha');
  assert.ok(a.queda > 0, 'a anilha não caiu das mãos (já começou rolando)');
  const hp = p.hp;
  let caiu = false;
  let rolou = 0;
  for (let i = 0; i < 60 && an(); i++) {
    g.update(1 / 30, { x: 0, y: 0 });
    if (an() && an().queda <= 0) caiu = true;
    if (an()) rolou = an().dist;
  }
  assert.ok(caiu, 'a anilha não chegou no chão');
  assert.ok(rolou > 2 || p.hp < hp, `a anilha não rolou (${rolou.toFixed(1)} m) nem acertou`);
  assert.ok(N.arteRaioM >= 0.9, 'a anilha rolando ficou menor que a das mãos');
});
