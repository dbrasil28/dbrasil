// Achados (D40): isopor, cofre, relíquia e o faro do Caramelo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { ACHADOS } from '../src/config.js';

const DT = 1 / 30;
const parado = { x: 0, y: 0 };

function jogo() {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 12 });
  g.enemies.length = 0;
  g.spawnAcc = -1e9;
  g.player.hp = 1e6;
  g.player.xpNext = 1e9;
  return g;
}

const chegar = (g, a) => {
  g.player.x = a.x;
  g.player.y = a.y;
  if (a.plat) {
    g.player.plat = a.plat;
    g.player.lvl = 1;
    g.player.z = a.plat.h;
  }
};

test('cada partida da Orla tem isopores, dois cofres e a relíquia, sempre a Bola da Altinha na torre', () => {
  const g = jogo();
  const n = (k) => g.achados.filter((a) => a.kind === k).length;
  assert.equal(n('isopor'), ACHADOS.isopores);
  assert.equal(n('cofre'), 2);
  assert.equal(n('reliquia'), 1);
  const r = g.achados.find((a) => a.kind === 'reliquia');
  assert.equal(r.onde, 'torre');
  const r2 = jogo().achados.find((a) => a.kind === 'reliquia');
  assert.deepEqual([r.x, r.y], [r2.x, r2.y], 'a relíquia mudou de lugar');
});

test('isopor: encostar dá gorjeta e um pouco de vida', () => {
  const g = jogo();
  const a = g.achados.find((x) => x.kind === 'isopor' && !x.cavar && !x.plat);
  g.player.hp = 50;
  chegar(g, a);
  g.update(DT, parado);
  assert.ok(a.aberto);
  assert.equal(g.metrics.achadosGorjeta, ACHADOS.isoporGorjeta);
  assert.ok(g.player.hp > 50);
  assert.ok(g.tips().parts.some(([nome]) => nome === 'Achados pelo caminho'));
});

test('enterrado: só abre parando em cima o tempo de cavar', () => {
  const g = jogo();
  const a = g.achados.find((x) => x.cavar);
  chegar(g, a);
  for (let i = 0; i < Math.round((ACHADOS.cavarS * 0.5) / DT); i++) g.update(DT, parado);
  assert.equal(a.aberto, false, 'abriu antes de cavar');
  for (let i = 0; i < Math.round((ACHADOS.cavarS * 0.6) / DT); i++) g.update(DT, parado);
  assert.ok(a.aberto, 'não abriu depois de cavar');
});

test('cofre: pausa o jogo e dá 1, 3 ou 5 cartas de uma vez', () => {
  const g = jogo();
  const a = g.achados.find((x) => x.kind === 'cofre' && !x.cavar);
  const armas0 = g.player.weapons.length + g.player.passives.length;
  chegar(g, a);
  g.update(DT, parado);
  assert.equal(g.modal && g.modal.kind, 'cofre');
  assert.ok([1, 3, 5].includes(g.modal.n));
  assert.equal(g.modal.cards.length, g.modal.n);
  const t0 = g.t;
  g.update(DT, parado);
  assert.equal(g.t, t0, 'o jogo andou durante a abertura');
  g.fecharCofre();
  assert.equal(g.modal, null);
  const ganho = g.player.weapons.reduce((s, w) => s + w.level, 0) + g.player.passives.reduce((s, p) => s + p.level, 0);
  assert.ok(ganho >= armas0 + g.metrics.cofres - 1, 'as cartas não entraram');
});

test('relíquia: a Bola da Altinha quica de inimigo em inimigo e não some', () => {
  const g = jogo();
  const a = g.achados.find((x) => x.kind === 'reliquia');
  chegar(g, a);
  g.update(DT, parado);
  assert.equal(g.player.reliquia, 'altinha');
  const bola = g.projectiles.find((o) => o.kind === 'altinha');
  assert.ok(bola, 'sem bola');
  // desce da torre e encontra a horda
  g.player.plat = null;
  g.player.lvl = 0;
  g.player.z = 0;
  g.player.x = 0;
  g.player.y = -40;
  bola.x = 0;
  bola.y = -40;
  const fila = [];
  for (let i = 0; i < 4; i++) {
    const e = g.spawnEnemy('telespectador', 2 + i * 1.5, -40);
    e.hp = e.maxHp = 1e5;
    e.speed = 0;
    fila.push(e);
  }
  for (let i = 0; i < 90; i++) g.update(DT, parado);
  assert.ok(fila.filter((e) => e.hp < 1e5).length >= 3, 'a bola não quicou entre eles');
  assert.ok(g.projectiles.includes(bola), 'a bola sumiu');
});

test('faro: o Caramelo para e late na direção de um achado fechado por perto', () => {
  const g = jogo();
  const a = g.achados.find((x) => x.kind === 'isopor' && !x.plat);
  g.player.weapons.push({ id: 'caramelo', level: 1, cd: 99 });
  g.player.x = a.x - 5;
  g.player.y = a.y;
  g.dogs.push({ x: a.x - 5.5, y: a.y + 0.3, st: 'segue', tgt: null, fx: 1, fy: 0, t: 0, wag: 0, at: 0, walk: 0, faroCd: 0 });
  let farejou = null;
  for (let i = 0; i < 30 && !farejou; i++) {
    g.update(DT, parado);
    if (g.dogs[0].st === 'fareja') farejou = { fx: g.dogs[0].fx };
  }
  assert.ok(farejou, 'o cachorro não farejou');
  assert.ok(farejou.fx > 0, 'não virou para o achado');
});

test('melhorias de opção: arma a mais no começo do trecho e troca de cartas sem anúncio', async () => {
  const { MELHORIAS } = await import('../src/config.js');
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 3, meta: { melhorias: { armaInicial: 1, troca: 1 } } });
  g.enemies.length = 0;
  g.spawnAcc = -1e9;
  g.update(DT, parado);
  assert.equal(g.modal && g.modal.kind, 'inicial', 'sem a escolha da arma inicial');
  assert.ok(g.modal.options.every((o) => o.kind === 'weapon' && o.level === 1));
  assert.equal(g.trocasGratis, 1);
  const antes = g.modal.options.map((o) => o.id).join();
  assert.ok(g.rerollOptions(true));
  assert.equal(g.trocasGratis, 0);
  assert.equal(g.metrics.ads.aceitos.trocar_cartas, 0, 'a troca grátis contou como anúncio');
  g.chooseOption(0);
  assert.equal(g.player.weapons.length, 2);
  assert.ok(antes.length > 0);
  // as melhorias de força ficaram pequenas
  const max = (id) => MELHORIAS[id].step * MELHORIAS[id].custo.length;
  assert.ok(max('vida') <= 20 && max('velocidade') <= 0.061 && max('dano') <= 0.101 && max('recarga') <= 0.061);
});

test('abertura: o Juninho não pega cadeira nem mesa antes de a horda atacar', async () => {
  const { emAbertura } = await import('../src/abertura.js');
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 12, meta: { abertura: true } });
  assert.ok(emAbertura(g), 'a partida não começou na abertura');
  const s = g.world.slots.find((x) => x.obj && !x.obj.plat);
  assert.ok(s, 'sem objeto no chão');
  g.player.x = s.obj.x;
  g.player.y = s.obj.y + 0.2;
  g.player.plat = null;
  for (let i = 0; i < 10; i++) g.update(DT, parado);
  assert.equal(g.player.carry, null, 'pegou o objeto na abertura');
  assert.ok(s.obj, 'o objeto sumiu do chão');
});
