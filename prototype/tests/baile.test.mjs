// O baile da esplanada (D91): o mapa maior, o portão do meio, a festa que vira horda, a polícia de fora,
// o DJ Plantão (anéis, drop, hora de bater) e o fim (o portão abre, a pista acorda, a noite vai embora).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { BAILE, ENEMIES, TV } from '../src/config.js';
import { novoFigurante } from '../src/figurantes.js';

const DT = 1 / 30;
const parado = { x: 0, y: 0 };
const rodar = (g, s) => { for (let i = 0; i < Math.round(s / DT); i++) g.update(DT, parado); };

function noMorro(seed = 5) {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed, meta: { trecho: 'morro' } });
  g.update(DT, parado);
  g.enemies.length = 0;
  g.eventIndex = 99;
  const p = g.player;
  p.hp = 1e9;
  g.stats.maxHp = 1e9;
  p.xpNext = 1e12;
  p.weapons.length = 0; // sem armas: só o que o baile faz
  g.world.figurantes = []; // sem o grupo (a polícia tem o teste dela)
  return g;
}

/** Leva o Juninho até a beira de baixo da esplanada. */
function chegar(g) {
  const w = g.world;
  const baixo = w.path[w.baileI - 1];
  const p = g.player;
  p.x = (baixo.x0 + baixo.x1) / 2;
  p.y = w.baile.y1 + 1;
  p.ri = w.baileI - 1;
}

const tv = (g, k) => g.outbox.some((o) => o.type === 'tv' && TV[k].includes(o.text));

test('Morro maior (D91): a esplanada do baile e, depois dela, o portão fechado até o DJ cair', () => {
  const g = noMorro();
  const w = g.world;
  assert.ok(w.baile && w.portaoI === w.baileI + 1, 'sem esplanada ou portão');
  assert.ok(w.path.length - 1 - w.portaoI >= 5, 'o morro não continua depois do portão');
  const comprimento = w.path.slice(2).reduce((s, k) => s + (k.y1 - k.y0), 0);
  assert.ok(comprimento > 320, `o morro não cresceu: ${Math.round(comprimento)} m`);
  const p = g.player;
  const pt = w.path[w.portaoI];
  p.x = (pt.x0 + pt.x1) / 2;
  p.y = pt.y1 - 2;
  g.update(DT, parado);
  assert.ok(p.y >= w.baile.y0 - 0.01, 'passou pelo portão fechado');
  w.portaoAberto = true;
  p.y = pt.y1 - 4;
  g.update(DT, parado);
  assert.ok(p.y < w.baile.y0 - 2, 'não passou pelo portão aberto');
});

test('o baile: festa, Plantão com O Acordão, o sinal pega na pista toda e o DJ Plantão sobe no palco', () => {
  const g = noMorro();
  const w = g.world;
  const vem = g.spawnEnemy('telespectador', w.baile.x0 + 6, w.baile.y1 + 4);
  vem.hp = vem.maxHp = 1e6;
  chegar(g);
  g.outbox.length = 0;
  g.update(DT, parado);
  const S = g.baile;
  assert.ok(S && S.fase === 'festa', 'o baile não começou na chegada');
  const povo = Object.values(BAILE.povo).reduce((a, b) => a + b, 0);
  assert.ok(S.pessoas.length >= povo * 0.8, `pouca gente: ${S.pessoas.length}`);
  for (const tipo of Object.keys(BAILE.povo)) assert.ok(S.pessoas.some((c) => c.tipo === tipo), `sem ${tipo} na festa`);
  assert.ok(vem.dancaT > 0, 'a horda que vinha atrás não entrou na dança');
  assert.ok(tv(g, 'baileComeca'));
  rodar(g, BAILE.plantaoS * 0.8);
  assert.equal(g.enemies.filter((e) => !e.dead).length, 1, 'a horda nasceu na festa');
  assert.ok(g.noiteBaile > 0.9, `a noite não caiu: ${g.noiteBaile}`);
  rodar(g, BAILE.plantaoS * 0.2 + 0.6);
  assert.equal(S.fase, 'plantao');
  assert.ok(tv(g, 'baileAcordao'), 'a TV não entrou com O Acordão');
  assert.ok(g.silencio > 0.9, 'o som não cortou no Plantão');
  rodar(g, BAILE.sinalS);
  assert.equal(S.fase, 'sinal');
  assert.equal(vem.dancaT, 0, 'a horda dançando não acordou');
  rodar(g, BAILE.transfS + BAILE.viraS + BAILE.chefeS + 0.3);
  assert.ok(S.pessoas.every((c) => c.virou), 'sobrou gente sem virar');
  assert.ok(g.enemies.filter((e) => !e.dead && !e.boss).length >= S.pessoas.length, 'a pista não virou horda');
  assert.ok(g.enemies.some((e) => !e.dead && e.type === 'traficante') && g.enemies.some((e) => !e.dead && e.type === 'funkeiro'), 'a firma da festa não virou inimigo');
  assert.ok(g.enemies.some((e) => !e.dead && e.type === 'telespectador' && e.tint === 200), 'as mulheres da festa não viraram a horda delas');
  assert.equal(S.fase, 'luta');
  assert.ok(g.boss && g.boss.type === 'dj_plantao' && g.bossName === ENEMIES.dj_plantao.name, 'o DJ não subiu no palco');
});

test('DJ Plantão: o anel do grave derruba quem está na linha, o drop dá a hora de bater e a horda corre; caído, o portão abre', () => {
  const g = noMorro();
  const w = g.world;
  chegar(g);
  g.update(DT, parado);
  rodar(g, BAILE.plantaoS + BAILE.sinalS + BAILE.transfS + BAILE.viraS + BAILE.chefeS + 0.5);
  const dj = g.boss;
  assert.ok(dj && dj.type === 'dj_plantao');
  dj.hp = dj.maxHp = 1e7;
  const p = g.player;
  // o grave: o Juninho parado a 4 m, o anel passa por ele
  p.x = dj.x + 4;
  p.y = dj.y + 0.5;
  dj.graveCd = 0;
  dj.dropCd = 99;
  dj.chamaCd = 99;
  const hp = p.hp;
  let derrubou = false;
  for (let i = 0; i < 30 * 3; i++) {
    g.update(DT, parado);
    if (p.derrubado) derrubou = true;
  }
  assert.ok(p.hp < hp, 'o anel não machucou');
  assert.ok(derrubou, 'o anel não derrubou');
  // o drop: subindo no som leva o dobro; depois a horda em volta corre
  p.invulnT = 0;
  dj.dropCd = 0;
  dj.graveCd = 99;
  g.update(DT, parado);
  assert.ok(dj.dropT > 0, 'o drop não começou');
  const antes = dj.hp;
  g.damageEnemy(dj, 10, 'teste');
  const naJanela = antes - dj.hp;
  dj.janelaT = 0;
  const e = g.enemies.find((o) => !o.dead && o.type === 'telespectador');
  assert.ok(naJanela >= 19, `o drop não deu a hora de bater (${naJanela})`);
  rodar(g, ENEMIES.dj_plantao.drop.subirS + 0.2);
  assert.ok(!e || e.dead || e.frenesiT > 0, 'a horda não entrou no frenesi do drop');
  // caiu: o portão abre, a pista acorda e a noite vai embora
  assert.equal(w.portaoAberto, false);
  g.outbox.length = 0;
  g.damageEnemy(dj, 1e9, 'teste');
  assert.equal(g.baile.fase, 'fim');
  assert.equal(w.portaoAberto, true, 'o portão não abriu');
  assert.equal(g.boss, null);
  assert.ok(tv(g, 'djCaiu') && g.outbox.some((o) => o.type === 'unlock'), 'sem o aviso da passagem');
  assert.equal(g.enemies.filter((o) => !o.dead && Math.hypot(o.x - dj.x, o.y - dj.y) < BAILE.acordaM).length, 0, 'a pista não acordou');
  rodar(g, BAILE.fimS + 0.3);
  assert.ok(g.noiteBaile < 0.05, 'a noite não foi embora');
});

test('a polícia não entra no baile (D91): o policial do grupo fica de guarda embaixo da esplanada', () => {
  const g = noMorro();
  const w = g.world;
  chegar(g);
  const pm = novoFigurante('pm', g.player.x, g.player.y + 1, 0.3);
  pm.grupo = true;
  w.figurantes = [pm];
  g.player.y = w.baile.y1 - 6; // já dentro da esplanada
  rodar(g, 4);
  assert.ok(pm.y > w.baile.y1, `o policial entrou no baile (y ${pm.y.toFixed(1)}, beira ${w.baile.y1})`);
  assert.ok(tv(g, 'policiaBaile'), 'a TV não zoou a polícia');
});

test('Modo Horda no Morro: sem baile e com o portão aberto', () => {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 5, meta: { modo: 'horda', trecho: 'morro' } });
  assert.ok(g.world.portaoAberto, 'o portão ficou fechado na Horda');
  chegar(g);
  g.update(DT, parado);
  assert.equal(g.baile, null, 'o baile começou na Horda');
});
