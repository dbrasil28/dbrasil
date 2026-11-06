import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Camera } from '../src/camera.js';
import { SpatialHash } from '../src/spatial.js';
import { makeRng } from '../src/math.js';
import { rollOptions, applyOption, weaponStats, eligibleEvolutions } from '../src/upgrades.js';
import { xpToNext, DIRECTOR, SLOTS } from '../src/config.js';

const close = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;

test('câmera: mundo -> tela -> mundo volta ao mesmo ponto em qualquer ângulo', () => {
  const cam = new Camera();
  for (const [elev, yaw] of [[55, 0], [40, 45], [80, 30]]) {
    cam.setAngles(elev, yaw);
    cam.setView(390, 844, 96, 760, 10, 1.8);
    cam.x = 12.5;
    cam.y = -3;
    const s = { x: 0, y: 0 };
    const w = { x: 0, y: 0 };
    cam.toScreen(20, 7, s);
    cam.toWorld(s.x, s.y, w);
    assert.ok(close(w.x, 20) && close(w.y, 7), `falhou em ${elev}/${yaw}`);
  }
});

test('câmera: "para cima" no joystick move para cima na tela, mesmo com yaw 45°', () => {
  const cam = new Camera();
  cam.setAngles(55, 45);
  cam.setView(390, 844, 96, 760, 10, 1.8);
  const d = { x: 0, y: 0 };
  cam.screenDirToWorld(0, -1, d);
  const a = { x: 0, y: 0 };
  const b = { x: 0, y: 0 };
  cam.toScreen(0, 0, a);
  cam.toScreen(d.x, d.y, b);
  assert.ok(close(b.x, a.x, 1e-4), 'andou de lado');
  assert.ok(b.y < a.y, 'não subiu na tela');
});

test('câmera: protagonista ocupa a % pedida da área jogável', () => {
  const cam = new Camera();
  cam.setView(390, 844, 100, 740, 10, 1.8);
  assert.ok(close(cam.ppu * 1.8, 64)); // 10% de 640 px
});

test('grade espacial encontra vizinhos e não perde ninguém', () => {
  const h = new SpatialHash(1.5);
  const rng = makeRng(1);
  const pts = Array.from({ length: 500 }, (_, i) => ({ id: i, x: rng.range(-50, 50), y: rng.range(-50, 50) }));
  for (const p of pts) h.insert(p);
  const out = [];
  h.query(0, 0, 10, out);
  const expected = pts.filter((p) => p.x * p.x + p.y * p.y <= 100).map((p) => p.id);
  const got = new Set(out.map((p) => p.id));
  for (const id of expected) assert.ok(got.has(id), `faltou ${id}`);
  h.clear();
  h.query(0, 0, 10, out);
  assert.equal(out.length, 0);
});

test('curva de XP é crescente', () => {
  for (let l = 1; l < 60; l++) assert.ok(xpToNext(l + 1) > xpToNext(l));
});

test('diretor: alvo de inimigos e vida crescem com o Caos/tempo', () => {
  assert.ok(DIRECTOR.targetAlive(80) > DIRECTOR.targetAlive(20));
  assert.ok(DIRECTOR.hpScale(500) > DIRECTOR.hpScale(100));
  assert.ok(DIRECTOR.caosFromTime(600) < 100);
});

test('cartas respeitam os espaços de arma e passiva', () => {
  const rng = makeRng(42);
  const player = { weapons: [{ id: 'capacete', level: 1, cd: 0 }], passives: [], hp: 100 };
  for (let i = 0; i < 80; i++) {
    const opts = rollOptions(player, rng, 3);
    assert.ok(opts.length >= 1 && opts.length <= 3);
    assert.equal(new Set(opts.map((o) => `${o.kind}:${o.id}`)).size, opts.length, 'carta repetida');
    applyOption(player, opts[0]);
    assert.ok(player.weapons.length <= SLOTS.weapons);
    assert.ok(player.passives.length <= SLOTS.passives);
  }
});

test('evolução aparece com Capacete no máximo + Tênis e substitui a arma', () => {
  const player = { weapons: [{ id: 'capacete', level: 5, cd: 0 }], passives: [{ id: 'tenis', level: 1 }], hp: 100 };
  assert.equal(eligibleEvolutions(player).length, 1);
  const opts = rollOptions(player, makeRng(3), 3);
  assert.equal(opts[0].kind, 'evolution');
  applyOption(player, opts[0]);
  assert.equal(player.weapons[0].id, 'entrega');
  assert.equal(weaponStats('entrega', 1).count, 3);
  // depois de evoluir, o Capacete comum não volta a ser oferecido
  for (let i = 0; i < 30; i++) {
    for (const o of rollOptions(player, makeRng(i), 3)) assert.notEqual(o.id, 'capacete');
  }
});

test('atributos da arma somam os níveis', () => {
  const s1 = weaponStats('chinelo', 1);
  const s5 = weaponStats('chinelo', 5);
  assert.equal(s1.count, 1);
  assert.equal(s5.count, 3);
  assert.equal(s5.pierce, 2);
  assert.ok(close(s5.cd, 0.75));
});
