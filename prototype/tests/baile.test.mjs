// O baile da esplanada (D91): o mapa maior, o portão do meio, a festa que vira horda, a polícia de fora,
// o DJ Plantão (anéis, drop, hora de bater) e o fim (o portão abre, a pista acorda, a noite vai embora).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { BAILE, ENEMIES, TV } from '../src/config.js';
import { novoFigurante } from '../src/figurantes.js';
import { distEsplanada } from '../src/baile.js';

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
  assert.ok(w.topI - w.portaoI >= 5, 'o morro não continua depois do portão');
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

/** O Juninho a uns d metros da beira de baixo da esplanada, na rota (devolve a distância de verdade). */
function aDistancia(g, d) {
  const w = g.world;
  const k = w.baile;
  const y = k.y1 + d;
  const i = w.path.findIndex((q, n) => n > 1 && n < w.baileI && q.y0 <= y && q.y1 >= y);
  const q = w.path[i];
  const p = g.player;
  p.x = (q.x0 + q.x1) / 2;
  p.y = y;
  p.ri = i;
  return distEsplanada(w, p.x, p.y);
}

/** Leva o baile até a pancadaria: chegada, festa, Plantão e todo mundo virado. */
function ateABriga(g) {
  chegar(g);
  g.update(DT, parado);
  rodar(g, BAILE.plantaoS + BAILE.olhosS + BAILE.encaraS + 0.2);
  rodar(g, BAILE.transfS + BAILE.viraS + 0.3);
}

test('a chegada no baile (D94): os corredores esvaziam, a música do Morro dá lugar à do baile e a noite cai', () => {
  const g = noMorro();
  const longe = aDistancia(g, 30);
  g.update(DT, parado);
  const somLonge = g.somDoBaile;
  const noiteLonge = g.chegadaBaile;
  assert.ok(longe > BAILE.entraM * 4 && longe < BAILE.chegaM, `longe demais ou perto demais: ${longe}`);
  assert.ok(somLonge > 0 && somLonge < 0.5, `a música do baile já devia aparecer, baixinha: ${somLonge}`);
  // a horda de fora da tela vai embora e a nova quase não nasce
  const perto = aDistancia(g, 4);
  rodar(g, 2); // a câmera chega junto
  for (let i = 0; i < 30; i++) g.spawnEnemy('telespectador', g.player.x + (i % 2 ? 30 : -30), g.player.y + 30 + i);
  rodar(g, 3);
  const vivos = g.enemies.filter((e) => !e.dead).length;
  assert.ok(perto < BAILE.entraM * 3, `não chegou perto: ${perto}`);
  assert.ok(vivos <= BAILE.hordaMax + 3, `o corredor não esvaziou: ${vivos} vivos`);
  assert.ok(g.chegadaBaile > noiteLonge && g.somDoBaile > somLonge, 'a chegada não avançou');
  assert.ok(g.noiteBaile > 0.8, `a noite não caiu na chegada: ${g.noiteBaile}`);
  assert.equal(g.baile, null, 'a festa começou antes da entrada');
});

test('o baile (D94): lotado, o DJ tocando no palco, os olhos acendem com O Acordão, a pancadaria e o DJ entra pelo Caos', () => {
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
  assert.ok(povo >= 50 && S.pessoas.length >= povo * 0.8, `pouca gente: ${S.pessoas.length}`);
  for (const tipo of Object.keys(BAILE.povo)) assert.ok(S.pessoas.some((c) => c.tipo === tipo), `sem ${tipo} na festa`);
  assert.ok(S.noPalco && S.noPalco.dj && S.noPalco.y < w.baile.y0 + 1.5, 'o DJ não está tocando no palco');
  assert.equal(g.boss, null, 'o DJ já entrou na luta');
  assert.ok(vem.dancaT > 0, 'a horda que vinha atrás não entrou na dança');
  assert.ok(tv(g, 'baileComeca'));
  assert.ok(g.somDoBaile > 0.95, 'a música do baile não está no alto');
  rodar(g, BAILE.plantaoS * 0.8);
  assert.equal(g.enemies.filter((e) => !e.dead).length, 1, 'a horda nasceu na festa');
  rodar(g, BAILE.plantaoS * 0.2 + 0.2);
  assert.equal(S.fase, 'plantao');
  assert.ok(tv(g, 'baileAcordao'), 'a TV não entrou com O Acordão');
  rodar(g, 0.6);
  assert.ok(g.somDoBaile < 0.5, 'o som não baixou para a TV falar');
  rodar(g, BAILE.olhosS);
  assert.ok(S.pessoas.every((c) => c.olho > 0), 'sobrou olho apagado no Plantão');
  assert.ok(S.pessoas.every((c) => !c.virou), 'virou antes da hora');
  rodar(g, BAILE.encaraS);
  assert.equal(S.fase, 'briga');
  assert.equal(vem.dancaT, 0, 'a horda dançando não acordou');
  assert.ok(S.caosDJ > g.caos, 'a marca do DJ não ficou acima do Caos');
  assert.ok(g.caosMarca && g.caosMarca.v === S.caosDJ, 'sem a marca do DJ na barra');
  rodar(g, BAILE.transfS + BAILE.viraS + 0.3);
  assert.ok(S.pessoas.every((c) => c.virou), 'sobrou gente sem virar');
  const festa = g.enemies.filter((e) => !e.dead && e.doBaile);
  assert.ok(festa.length >= S.pessoas.length, 'a pista não virou horda');
  assert.ok(festa.some((e) => e.type === 'traficante') && festa.some((e) => e.type === 'funkeiro'), 'a firma da festa não virou inimigo');
  assert.ok(festa.some((e) => e.type === 'telespectador' && e.tint === 200), 'as mulheres da festa não viraram a horda delas');
  assert.equal(S.fase, 'briga');
  assert.ok(S.noPalco && !g.boss, 'o DJ devia seguir só olhando');
  // cada um da festa que cai sobe o Caos; na marca, o DJ entra
  const bonus = g.caosBonus;
  for (const e of festa.slice(0, 10)) g.damageEnemy(e, 1e9, 'teste');
  g.update(DT, parado);
  assert.ok(g.caosBonus >= bonus + 10 * BAILE.caos.porAbate - 1e-9, 'os abates da pancadaria não subiram o Caos');
  g.caosBonus += S.caosDJ; // o resto até a marca
  g.update(DT, parado);
  assert.equal(S.fase, 'luta');
  assert.ok(g.boss && g.boss.type === 'dj_plantao' && g.bossName === ENEMIES.dj_plantao.name, 'o DJ não entrou na luta');
  assert.equal(S.noPalco, null);
});

test('DJ Plantão: o anel do grave derruba quem está na linha, o drop dá a hora de bater e a horda corre; caído, o portão abre', () => {
  const g = noMorro();
  const w = g.world;
  ateABriga(g);
  g.caosBonus += 100;
  g.update(DT, parado);
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
  assert.ok(g.somDoBaile < 0.05, 'a música do baile não parou');
});

test('a polícia no baile (D94): na festa, fica de guarda na entrada; na pancadaria, entra para ajudar', () => {
  const g = noMorro();
  const w = g.world;
  chegar(g);
  const pm = novoFigurante('pm', g.player.x, g.player.y + 1, 0.3);
  pm.grupo = true;
  pm.hp = pm.maxHp = 1e6;
  w.figurantes = [pm];
  g.player.y = w.baile.y1 - 6; // já dentro da esplanada
  rodar(g, 4);
  assert.ok(pm.y > w.baile.y1, `o policial entrou na festa (y ${pm.y.toFixed(1)}, beira ${w.baile.y1})`);
  assert.ok(tv(g, 'policiaBaile'), 'a TV não zoou a polícia');
  g.outbox.length = 0;
  rodar(g, BAILE.plantaoS + BAILE.olhosS + BAILE.encaraS);
  assert.equal(g.baile.fase, 'briga');
  assert.ok(tv(g, 'policiaEntra'), 'a TV não deu a entrada da polícia');
  rodar(g, 4);
  assert.ok(pm.y < w.baile.y1 - 1, `o policial não entrou na pancadaria (y ${pm.y.toFixed(1)})`);
});

test('Modo Horda no Morro: sem baile e com o portão aberto', () => {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 5, meta: { modo: 'horda', trecho: 'morro' } });
  assert.ok(g.world.portaoAberto, 'o portão ficou fechado na Horda');
  chegar(g);
  g.update(DT, parado);
  assert.equal(g.baile, null, 'o baile começou na Horda');
});
