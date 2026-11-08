// Evoluções (D66): toda arma tem uma (arma no nível 5 + uma passiva) e, com a build completa, o nível vira
// bônus na hora, sem tela de cartas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WEAPONS, PASSIVES, EVOLUTIONS, SLOTS, NIVEL_MAXIMO } from '../src/config.js';
import { rollOptions, applyOption, weaponStats, weaponMaxLevel } from '../src/upgrades.js';
import { fireWeapon } from '../src/weapons.js';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';

const DT = 1 / 30;
const jogo = () => {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 4 });
  g.player.hp = g.stats.maxHp = 1e6;
  g.player.weapons.length = 0;
  return g;
};

test('toda arma tem uma evolução, e cada passiva serve para no máximo duas', () => {
  const bases = Object.keys(WEAPONS).filter((id) => !WEAPONS[id].evolution);
  for (const id of bases) assert.equal(EVOLUTIONS.filter((e) => e.from === id).length, 1, `${id} sem evolução`);
  for (const p of Object.keys(PASSIVES)) assert.ok(EVOLUTIONS.filter((e) => e.requires === p).length <= 2, `${p} em mais de duas`);
  for (const e of EVOLUTIONS) {
    assert.ok(WEAPONS[e.to] && WEAPONS[e.to].evolution, `${e.to} não é evolução`);
    assert.ok(PASSIVES[e.requires], `${e.requires} não é passiva`);
    if (WEAPONS[e.to].base) assert.equal(WEAPONS[e.to].base, e.from);
  }
  // a evolução é pelo menos tão forte quanto a base no nível 5
  for (const e of EVOLUTIONS.filter((x) => WEAPONS[x.to].base)) {
    assert.ok(weaponStats(e.to, 1).dmg >= weaponStats(e.from, weaponMaxLevel(e.from)).dmg, `${e.to} mais fraca que ${e.from}`);
  }
});

test('arma no nível 5 com a passiva certa: a carta dourada vem primeiro e troca a arma', () => {
  const p = { weapons: [{ id: 'chinelo', level: weaponMaxLevel('chinelo'), cd: 0 }], passives: [{ id: 'raiva', level: 1 }] };
  const opts = rollOptions(p, () => 0.5, 3, 'orla');
  assert.equal(opts[0].kind, 'evolution');
  assert.equal(opts[0].id, 'contaTres');
  applyOption(p, opts[0]);
  assert.equal(p.weapons[0].id, 'contaTres');
});

test('cada evolução dispara do jeito dela', () => {
  for (const e of EVOLUTIONS) {
    const g = jogo();
    const p = g.player;
    for (let k = 0; k < 6; k++) {
      const q = g.spawnEnemy('telespectador', p.x + 2 + k * 0.6, p.y - 1);
      q.hp = q.maxHp = 1e6;
      q.speed = 0;
    }
    g.update(DT, { x: 0, y: 0 }); // o mapa de quem está onde se refaz a cada quadro
    const w = { id: e.to, level: 1, cd: 0 };
    const antes = g.projectiles.length + g.zones.length + g.dogs.length + g.fx.bolts.length;
    const r = fireWeapon(g, w, g.stats);
    assert.ok(r.fired, `${e.to} não disparou`);
    assert.ok(g.projectiles.length + g.zones.length + g.dogs.length + g.fx.bolts.length > antes || p.auraR > 0, `${e.to} não fez nada`);
    for (let i = 0; i < 60; i++) g.update(DT, { x: 0, y: 0 }); // e roda sem erro
  }
  // os extras
  const g = jogo();
  fireWeapon(g, { id: 'contaTres', level: 1, cd: 0 }, g.stats);
  assert.equal(g.projectiles.filter((q) => q.kind === 'slipper').length, WEAPONS.contaTres.levels[0].dirs * WEAPONS.contaTres.levels[0].count, 'não saiu para todos os lados');
  fireWeapon(g, { id: 'decreto', level: 1, cd: 0 }, g.stats);
  assert.ok(g.zones.some((z) => z.kind === 'stamp' && z.half >= 7), 'sem o carimbo gigante');
});

test('build completa: o nível vira bônus na hora, sem tela de cartas, e rende gorjeta', () => {
  const g = jogo();
  const p = g.player;
  const evolucoes = ['entrega', 'contaTres', 'juros', 'decreto'];
  for (const id of evolucoes.slice(0, SLOTS.weapons)) p.weapons.push({ id, level: 1, cd: 0 });
  for (const id of Object.keys(PASSIVES).slice(0, SLOTS.passives)) p.passives.push({ id, level: PASSIVES[id].max });
  g.modal = null;
  g.pendingLevels = 1;
  const dano0 = p.bonusDmg || 0;
  g.openModalIfNeeded();
  assert.equal(g.modal, null, 'abriu a tela de cartas');
  assert.equal(g.pendingLevels, 0);
  assert.ok(Math.abs((p.bonusDmg || 0) - dano0 - NIVEL_MAXIMO.danoMais) < 1e-9, 'sem o bônus de dano');
  // com a vida baixa, cura
  p.hp = g.stats.maxHp * 0.2;
  const hp = p.hp;
  g.pendingLevels = 1;
  g.openModalIfNeeded();
  assert.equal(p.hp, hp + NIVEL_MAXIMO.cura, 'não curou');
  const t = g.tips();
  assert.ok(t.parts.some(([nome, n]) => nome.startsWith('Hora extra') && n === 2 * NIVEL_MAXIMO.gorjetas), 'sem a gorjeta dos níveis extras');
});
