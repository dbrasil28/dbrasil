// Super da relíquia (D67): a cena de achar, o Golaço, o Solta o Batidão, a carga e a relíquia que segue na rota.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { RELIQUIAS, SUPER } from '../src/config.js';
import { alturaNaCena } from '../src/super.js';
import { recomecar } from '../src/carreira.js';

const DT = 1 / 30;
const parado = { x: 0, y: 0 };
const passos = (s) => Math.round(s / DT);

function jogo() {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 12 });
  g.enemies.length = 0;
  g.spawnAcc = -1e9;
  g.nextWaveAt = 1e9;
  g.player.hp = 1e6;
  g.player.xpNext = 1e9;
  g.world.figurantes = [];
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
const naRua = (g) => {
  const p = g.player;
  p.plat = null;
  p.lvl = 0;
  p.z = 0;
  p.x = 0;
  p.y = -40;
};
const comSuper = (g, id) => {
  naRua(g);
  g.player.reliquia = id;
  g.player.superCarga = 1;
};
const boneco = (g, x, y, speed = 0) => {
  const e = g.spawnEnemy('telespectador', x, y);
  e.hp = e.maxHp = 1e5;
  e.speed = speed;
  return e;
};

test('achar a relíquia: o tempo para, o Juninho sobe, ela entra nele e a carta vem cheia', () => {
  const g = jogo();
  const a = g.achados.find((x) => x.reliquia === 'altinha');
  chegar(g, a);
  const e = boneco(g, a.x + 3, a.y, 2);
  e.plat = a.plat;
  e.lvl = 1;
  e.z = a.plat.h;
  g.update(DT, parado);
  assert.ok(a.aberto && g.cena, 'a cena não começou');
  const t0 = g.t;
  const ex = e.x;
  for (let i = 0; i < passos(SUPER.cena.chegaS * 0.9); i++) g.update(DT, parado);
  assert.equal(g.t, t0, 'o tempo andou com a relíquia voando');
  assert.equal(e.x, ex, 'a horda andou com o tempo parado');
  assert.ok(alturaNaCena(g) > SUPER.cena.alturaM * 0.8, 'o Juninho não subiu');
  assert.equal(g.player.reliquia, undefined, 'a carta chegou antes da relíquia entrar nele');
  for (let i = 0; i < passos(0.3); i++) g.update(DT, parado);
  assert.equal(g.player.reliquia, 'altinha');
  assert.equal(g.player.superCarga, 1);
  assert.ok(e.hp < 1e5, 'o estouro não bateu em quem estava perto');
  assert.ok(g.t > t0, 'o jogo não voltou depois do estouro');
  assert.ok(g.sons.some((s) => s.id === 'reliquia_sobe') && g.sons.some((s) => s.id === 'reliquia_estouro'), 'sem o som da cena');
  assert.ok(g.outbox.some((o) => o.type === 'reliquia'));
  assert.ok(g.metrics.reliquia_orla, 'sem a estrela do trecho');
  for (let i = 0; i < passos(SUPER.cena.durS); i++) g.update(DT, parado);
  assert.equal(g.cena, null);
  assert.equal(alturaNaCena(g), 0, 'ficou no ar');
  assert.ok(g.superPronta(), 'a carta não ficou pronta');
});

test('Golaço: a bola gigante atravessa a horda várias vezes, bate em quase todos e some no fim', () => {
  const g = jogo();
  comSuper(g, 'altinha');
  const fila = [];
  for (let i = 0; i < 12; i++) fila.push(boneco(g, -3 + (i % 6) * 1.2, -44 - Math.floor(i / 6) * 1.5));
  g.update(DT, parado);
  assert.ok(g.superPronta());
  assert.ok(g.pedirSuper(), 'não usou');
  assert.equal(g.player.superCarga, 0);
  assert.equal(g.pedirSuper(), false, 'usou duas vezes');
  const bola = g.projectiles.find((o) => o.kind === 'golaco');
  assert.ok(bola, 'sem a bola');
  for (let i = 0; i < passos(RELIQUIAS.altinha.super.durS + 0.5); i++) g.update(DT, parado);
  const pegos = fila.filter((e) => e.hp < 1e5).length;
  assert.ok(pegos >= 9, `a bola só pegou ${pegos} de 12`);
  assert.ok(!g.projectiles.includes(bola), 'a bola não sumiu');
  assert.equal(g.metrics.super_altinha, 1);
});

test('Solta o Batidão: quem está na tela para para dançar, sem andar nem bater, e o grave empurra', () => {
  const g = jogo();
  comSuper(g, 'paredao');
  const p = g.player;
  const roda = [];
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    roda.push(boneco(g, p.x + Math.cos(ang) * 3, p.y + Math.sin(ang) * 3, 2.2));
  }
  g.update(DT, parado);
  assert.ok(g.pedirSuper());
  const pax = g.projectiles.find((o) => o.kind === 'batidao');
  const B = RELIQUIAS.paredao.super;
  for (let i = 0; i < passos(B.caiS - DT); i++) g.update(DT, parado);
  const antes = roda.map((e) => Math.hypot(e.x - pax.x, e.y - pax.y));
  for (let i = 0; i < passos(0.6); i++) g.update(DT, parado);
  for (const e of roda) {
    assert.ok(e.bailaT > 0, 'alguém não está dançando');
    assert.ok(e.hp < 1e5, 'o grave não bateu');
  }
  const longe = roda.filter((e, i) => Math.hypot(e.x - pax.x, e.y - pax.y) > antes[i] + 1.5).length;
  assert.ok(longe >= 6, `só ${longe} de 8 foram empurrados`);
  const d0 = roda.map((e) => Math.hypot(e.x - p.x, e.y - p.y));
  const hp0 = p.hp;
  for (let i = 0; i < passos(1.5); i++) g.update(DT, parado);
  roda.forEach((e, i) => assert.ok(Math.hypot(e.x - p.x, e.y - p.y) > d0[i] - 0.3, 'andou dançando'));
  assert.equal(p.hp, hp0, 'bateram no Juninho dançando');
  // a música acaba: voltam a andar
  for (let i = 0; i < passos(B.dancaS); i++) g.update(DT, parado);
  assert.ok(roda.every((e) => !(e.bailaT > 0)), 'a dança não acabou');
  const d1 = roda.map((e) => Math.hypot(e.x - p.x, e.y - p.y));
  for (let i = 0; i < passos(1); i++) g.update(DT, parado);
  assert.ok(roda.filter((e, i) => Math.hypot(e.x - p.x, e.y - p.y) < d1[i] - 0.5).length >= 6, 'não voltaram a andar');
});

test('carga: cheia em cargaS só com o tempo, derrubar adianta, e não carrega com a super no ar', () => {
  const g = jogo();
  naRua(g);
  g.player.reliquia = 'altinha';
  g.player.superCarga = 0;
  for (let i = 0; i < passos(30); i++) g.update(DT, parado);
  const c30 = g.player.superCarga;
  assert.ok(Math.abs(c30 - 30 / SUPER.cargaS) < 0.02, `carga ${c30.toFixed(3)} em 30 s`);
  for (let i = 0; i < 50; i++) g.damageEnemy(g.spawnEnemy('telespectador', 3, -40), 1e9, 'teste');
  const ganho = g.player.superCarga - c30;
  assert.ok(Math.abs(ganho - (50 * SUPER.abateS) / SUPER.cargaS) < 0.003, `50 derrubados deram ${ganho.toFixed(4)}`);
  g.outbox.length = 0;
  for (let i = 0; i < passos(SUPER.cargaS); i++) g.update(DT, parado);
  assert.equal(g.player.superCarga, 1);
  assert.equal(g.outbox.filter((o) => o.type === 'super_pronta').length, 1, 'o aviso de pronta não veio uma vez');
  // usando: não carrega enquanto a bola está no ar
  assert.ok(g.pedirSuper());
  for (let i = 0; i < passos(RELIQUIAS.altinha.super.durS - 0.5); i++) g.update(DT, parado);
  assert.equal(g.player.superCarga, 0, 'carregou com a super ativa');
});

test('sem relíquia, sem super; a relíquia da Orla segue para o Morro e achar a do Morro troca a carta', () => {
  const g = jogo();
  naRua(g);
  g.update(DT, parado);
  assert.equal(g.superPronta(), false);
  assert.equal(g.pedirSuper(), false);
  g.player.reliquia = 'altinha';
  g.player.superCarga = 0.4;
  recomecar(g, 'morro');
  assert.equal(g.player.reliquia, 'altinha', 'a relíquia ficou na Orla');
  assert.equal(g.player.superCarga, 0.4, 'a carga mudou na porta');
  g.segment = 'morro';
  g.world.gateOpen = true;
  const a = g.achados.find((x) => x.reliquia === 'paredao');
  chegar(g, a);
  g.update(DT, parado);
  for (let i = 0; i < passos(SUPER.cena.durS + 0.2); i++) g.update(DT, parado);
  assert.equal(g.player.reliquia, 'paredao');
  assert.equal(g.player.superCarga, 1);
  assert.ok(g.metrics.reliquia_morro);
});
