// Achados (D40): isopor, cofre, relíquia e o faro do Caramelo. A super da relíquia (D67): super.test.mjs.
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

test('cada partida tem isopores, dois cofres e uma relíquia por trecho, sempre no mesmo lugar; no Morro, o fundo dos becos', () => {
  const g = jogo();
  const orla = g.achados.filter((a) => a.onde !== 'beco');
  const n = (k) => orla.filter((a) => a.kind === k).length;
  assert.equal(n('isopor'), ACHADOS.isopores);
  assert.equal(n('cofre'), 2);
  assert.equal(n('reliquia'), 1);
  const r = g.achados.find((a) => a.reliquia === 'altinha');
  assert.equal(r.onde, 'torre');
  // D92: a relíquia do Morro no fundo do beco mais escondido, e cada beco sem saída com o achado dele
  const m = g.achados.find((a) => a.reliquia === 'paredao');
  assert.equal(m.onde, 'beco');
  const fundos = g.world.path.filter((k) => k.pracinha);
  assert.ok(fundos.length >= 3, 'poucos becos sem saída');
  for (const k of fundos) {
    assert.ok(g.achados.some((a) => a.x > k.x0 && a.x < k.x1 && a.y > k.y0 && a.y < k.y1), `o fundo do ${k.nome} está vazio`);
  }
  assert.ok(m.y < g.world.orlaTop, 'o paredão não está no morro');
  const g2 = jogo();
  for (const id of ['altinha', 'paredao']) {
    const a = g.achados.find((x) => x.reliquia === id);
    const b = g2.achados.find((x) => x.reliquia === id);
    assert.deepEqual([a.x, a.y], [b.x, b.y], `a relíquia ${id} mudou de lugar`);
  }
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

test('atalho Testar a Favela: rende gorjeta, mas não libera o Morro no Mapa da Rota', async () => {
  const { loadProgress, applyRun } = await import('../src/progresso.js');
  const prog = loadProgress();
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 4, meta: { trecho: 'morro', teste: true } });
  g.t = 200;
  g.metrics.morroAt = 1;
  const antes = prog.gorjetas;
  applyRun(prog, g);
  assert.ok(prog.gorjetas > antes, 'sem gorjeta');
  assert.equal(prog.trechos.morro.liberado, false, 'o teste liberou o Morro');
});
