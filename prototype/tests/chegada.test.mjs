// Chegada do Monstrão (D82): silêncio, cerco da horda, entrada pela avenida, a roda que fecha e o fim.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { CHEGADA } from '../src/config.js';
import { silencioDoCovil, centroDaArena, prepararTesteDoChefe } from '../src/chegada.js';

const DT = 1 / 30;
const parado = { x: 0, y: 0 };

function fimDaOrla() {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 7 });
  for (let i = 0; i < 5; i++) g.update(DT, parado);
  if (g.abertura) g.pularAbertura();
  g.enemies.length = 0;
  g.nextWaveAt = 1e9;
  g.nextEliteAt = 1e9;
  g.world.figurantes = [];
  const p = g.player;
  p.hp = 1e9;
  g.stats.maxHp = 1e9;
  p.weapons.length = 0;
  const C = g.covil;
  C.aberto = true;
  C.abertoT = g.t;
  C.demora = true;
  return g;
}

test('chegada do Monstrão: a Orla silencia conforme o Juninho chega perto do covil aberto', () => {
  const g = fimDaOrla();
  const a = centroDaArena(g);
  const p = g.player;
  p.x = a.x;
  p.y = a.y + CHEGADA.silencioDeM + 5;
  assert.equal(silencioDoCovil(g), 0, 'longe: sem silêncio');
  p.y = a.y + (CHEGADA.silencioDeM + CHEGADA.silencioAteM) / 2;
  const meio = silencioDoCovil(g);
  assert.ok(meio > 0.2 && meio < 0.8, `no meio do caminho: ${meio}`);
  p.y = a.y + CHEGADA.silencioAteM - 1;
  assert.equal(silencioDoCovil(g), 1, 'perto: silêncio');
});

test('chegada do Monstrão: a horda vira o cerco, ele entra pela avenida, a roda fecha e empurra, e no fim se espalha', () => {
  const g = fimDaOrla();
  const C = g.covil;
  const p = g.player;
  const w = g.world;
  const a = centroDaArena(g);
  p.x = a.x + 3;
  p.y = a.y + 4;
  const coisas = w.props.filter((k) => Math.hypot(k.x - a.x, k.y - a.y) < CHEGADA.cerco.raioM - 1).length;
  for (let i = 0; i < 60; i++) g.spawnEnemy('telespectador', p.x + Math.cos(i) * (6 + (i % 9)), p.y + Math.sin(i) * (6 + (i % 9)));
  g.spawnAcc = 0;
  g.update(DT, parado);
  const K = g.cerco;
  assert.ok(K, 'o cerco não se formou');
  const boss = g.boss;
  assert.ok(boss && boss.type === 'monstrao' && boss.entrando, 'o Monstrão não está entrando');
  assert.ok(Math.abs(boss.y - (w.orlaTop + CHEGADA.entradaDy)) < 1.5 && Math.abs(boss.x - CHEGADA.entradaX) < 1.5, 'não veio pela avenida');
  assert.equal(g.enemies.filter((e) => !e.dead && !e.boss).length, 0, 'a horda não virou torcida');
  assert.ok(K.membros.length > 80, `torcida pequena: ${K.membros.length}`);
  assert.ok(Math.hypot(K.x - a.x, K.y - a.y) < 0.01, 'a arena não ficou na frente da obra');
  assert.ok(Math.hypot(K.x - w.gate.x1, K.y - w.gate.y1) < CHEGADA.cerco.raioM + 4, 'a arena ficou longe da entrada da favela');
  const sobrou = w.props.filter((k) => Math.hypot(k.x - a.x, k.y - a.y) < CHEGADA.cerco.raioM - 1).length;
  assert.equal(sobrou, 0, `a arena não ficou vazia (${coisas} → ${sobrou})`);
  assert.ok(!w.solids.some((k) => Math.hypot(Math.max(k.x0, Math.min(a.x, k.x1)) - a.x, Math.max(k.y0, Math.min(a.y, k.y1)) - a.y) < CHEGADA.cerco.raioM - 0.5), 'sobrou coisa sólida na arena');
  boss.reforcoT = 1e9; // sem a assessoria, para contar só a horda
  assert.ok(Math.hypot(p.x - K.x, p.y - K.y) < K.r, 'o Juninho ficou fora da roda');
  // ele anda até a arena, urra e a luta começa
  let s = 0;
  while (boss.entrando && s++ < 30 * 15) g.update(DT, parado);
  assert.ok(!boss.entrando, 'não chegou na arena');
  assert.equal(K.fase, 'luta');
  assert.ok(Math.hypot(boss.x - K.x, boss.y - K.y) < K.r, 'parou fora da roda');
  // a roda fecha um passo de cada vez, e a horda não nasce
  const r0 = K.r;
  for (let i = 0; i < 30 * (CHEGADA.cerco.fechaS * 3 + 0.5); i++) {
    g.update(DT, parado);
    g.boss.golpe = null; // sem golpes: só o tempo passando
    g.boss.pausaT = 1;
  }
  assert.ok(K.r < r0 - CHEGADA.cerco.passoM * 2.5, `não fechou: ${r0} → ${K.r}`);
  assert.equal(g.enemies.filter((e) => !e.dead && !e.boss).length, 0, 'nasceu horda durante o cerco');
  // encostou na torcida: apanha e volta para dentro
  const hp = p.hp;
  p.x = K.x + K.r + 0.5;
  p.y = K.y;
  p.invulnT = 0;
  g.update(DT, parado);
  assert.ok(p.hp < hp, 'encostou na torcida e não apanhou');
  assert.ok(Math.hypot(p.x - K.x, p.y - K.y) < K.r, 'ficou fora da roda');
  // o Monstrão cai: a torcida se espalha e depois some; a horda volta a nascer
  g.boss.hp = 1;
  g.damageEnemy(g.boss, 10, 'teste');
  assert.equal(K.fase, 'dispersa');
  for (let i = 0; i < 30 * (CHEGADA.cerco.dispersaS + 0.2); i++) g.update(DT, parado);
  assert.equal(g.cerco, null, 'a torcida não foi embora');
  assert.ok(w.gateOpen, 'a passagem para o Morro não abriu');
});

test('atalho "Testar o Monstrão": fim da Orla com build, covil aberto e o Juninho a caminho da arena', () => {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 3, meta: { trecho: 'orla', teste: true } });
  prepararTesteDoChefe(g);
  const p = g.player;
  assert.ok(p.level >= 20, `build fraca: nível ${p.level}`);
  assert.equal(p.reliquia, CHEGADA.teste.reliquia);
  assert.equal(p.superCarga, 1);
  g.update(DT, parado);
  assert.ok(g.covil.aberto, 'o covil não abriu');
  assert.ok(!g.boss, 'o chefão saiu antes de o Juninho chegar');
  const a = centroDaArena(g);
  assert.ok(Math.abs(Math.hypot(p.x - a.x, p.y - a.y) - Math.hypot(4, CHEGADA.teste.distM)) < 1, 'não ficou a caminho da arena');
  // anda até a arena: o Monstrão chega
  p.x = a.x;
  p.y = a.y + 2;
  g.update(DT, parado);
  assert.ok(g.cerco && g.boss && g.boss.type === 'monstrao', 'o Monstrão não chegou');
});
