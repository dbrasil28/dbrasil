// Elenco v2, inimigos (D73): Laranja (apanha no lugar do Político) e Rato de Academia (investida que empurra).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { ENEMIES, DIRECTOR, HORDA_ORLA } from '../src/config.js';

const DT = 1 / 30;
const parado = { x: 0, y: 0 };
function jogo() {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 21 });
  g.enemies.length = 0;
  g.spawnAcc = -1e9;
  g.nextWaveAt = 1e9;
  g.nextEliteAt = 1e9;
  g.player.hp = 1e9;
  g.player.xpNext = 1e9;
  g.player.weapons = [];
  g.world.figurantes = [];
  const p = g.player;
  p.x = 0;
  p.y = -60;
  return g;
}

test('o Político chega com os Laranjas, que ficam na frente dele e apanham no lugar dele', () => {
  const g = jogo();
  const trecho = ENEMIES.laranja.trecho;
  ENEMIES.laranja.trecho = g.segment; // os Laranjas são de Brasília (D78): aqui, como se fosse lá
  try {
    g.spawnElite('politico');
  } finally {
    ENEMIES.laranja.trecho = trecho;
  }
  const pol = g.enemies.find((e) => e.type === 'politico');
  const lj = g.enemies.filter((e) => e.type === 'laranja');
  assert.equal(lj.length, ENEMIES.politico.laranjas);
  assert.ok(lj.every((l) => l.dono === pol));
  // anda um pouco: os Laranjas ficam entre o Político e o Juninho
  pol.x = 0;
  pol.y = -70;
  for (const l of lj) {
    l.x = pol.x + l.lado * 1.2; // nascem ao lado dele
    l.y = pol.y;
  }
  pol.speed = 0;
  for (let i = 0; i < 90; i++) g.update(DT, parado);
  const p = g.player;
  for (const l of lj) assert.ok(Math.hypot(l.x - p.x, l.y - p.y) < Math.hypot(pol.x - p.x, pol.y - p.y), 'o Laranja ficou atrás do Político');
  // golpe no Político: a maior parte vai para o Laranja mais perto
  const hpPol = pol.hp;
  const hpLj = lj.map((l) => l.hp);
  g.damageEnemy(pol, 50, 'teste');
  const tirouPol = hpPol - pol.hp;
  const tirouLj = lj.reduce((s, l, i) => s + (hpLj[i] - l.hp), 0);
  assert.ok(tirouPol < 50 * 0.4, `o Político levou ${tirouPol}`);
  assert.ok(tirouLj > 0, 'nenhum Laranja apanhou');
  // sem Laranjas, o Político leva tudo
  for (const l of lj) g.damageEnemy(l, 1e9, 'teste');
  assert.ok(g.pickups.filter((k) => k.kind === 'propina').length >= lj.length, 'o Laranja não espalhou o dinheiro');
  const antes = pol.hp;
  g.damageEnemy(pol, 30, 'teste');
  assert.ok(Math.abs(antes - pol.hp - 30) < 1e-6, 'o Político continuou protegido sem Laranja');
});

test('Rato de Academia: prepara, corre reto e empurra o Juninho se pega ele na corrida', () => {
  const g = jogo();
  const p = g.player;
  const r = g.spawnEnemy('rato', p.x + 4, p.y);
  r.fireT = 0;
  let correu = false;
  for (let i = 0; i < 60; i++) {
    g.update(DT, parado);
    if (r.dashT > 0) correu = true;
    if (p.kx) break;
  }
  assert.ok(correu, 'o Rato não correu');
  assert.ok(p.kx < -1, `não empurrou o Juninho para longe dele (kx ${p.kx})`);
  const x0 = p.x;
  for (let i = 0; i < 10; i++) g.update(DT, parado);
  assert.ok(p.x < x0 - 0.3, 'o empurrão não moveu o Juninho');
});

test('a turma de reforço do Monstrão traz Ratos de Academia', async () => {
  const g = jogo();
  const { updateMonstrao } = await import('../src/monstrao.js');
  const m = g.spawnEnemy('monstrao', g.player.x, g.player.y - 8, { fase: 1, pausaT: 99 });
  m.reforcoT = 0.001;
  updateMonstrao(g, m, DT, 0, 1);
  const ratos = g.enemies.filter((e) => e.type === 'rato').length;
  assert.equal(ratos, ENEMIES.monstrao.reforco.ratos[1]);
});

test('luta com o Monstrão: a horda abre espaço na chegada dele e fica no máximo de chefaoHorda', async () => {
  const { CARREIRA } = await import('../src/config.js');
  const { soltarChefao } = await import('../src/carreira.js');
  const g = jogo();
  const p = g.player;
  for (let i = 0; i < 250; i++) {
    const a = (i / 250) * Math.PI * 2;
    g.spawnEnemy('telespectador', p.x + Math.cos(a) * (25 + (i % 10)), p.y + Math.sin(a) * (25 + (i % 10)));
  }
  g.spawnAcc = 0;
  g.nextWaveAt = 1e9;
  soltarChefao(g, g.covil);
  const vivos = () => g.enemies.filter((e) => !e.dead && !e.elite && !e.boss).length;
  assert.ok(vivos() <= CARREIRA.chefaoHorda.max, `ficaram ${vivos()} na chegada do chefão`);
  g.caosBonus = 100;
  for (let i = 0; i < 300; i++) g.update(DT, parado);
  assert.ok(vivos() <= CARREIRA.chefaoHorda.max + CARREIRA.chefaoHorda.faseHorda + 20, `a horda voltou a ${vivos()} na luta`);
});

test('Agiota: marca o Juninho, cobra juros que crescem e, derrubado, devolve a dívida como XP', () => {
  const g = jogo();
  const p = g.player;
  p.xp = 50;
  p.xpNext = 1e9;
  const a = g.spawnEnemy('agiota', p.x + 5, p.y);
  a.speed = 0;
  a.hp = a.maxHp = 1e9;
  for (let i = 0; i < 30; i++) g.update(DT, parado);
  assert.ok(a.marcou, 'não marcou');
  const xp1 = p.xp;
  assert.ok(xp1 < 50, 'não cobrou');
  for (let i = 0; i < 150; i++) g.update(DT, parado);
  const xp2 = p.xp;
  const taxaInicio = 50 - xp1; // no primeiro segundo
  const taxaFim = xp1 - xp2 - (150 / 30 - 1) * taxaInicio; // o que passou da taxa do começo nos 5 s seguintes
  assert.ok(taxaFim > 0, 'os juros não cresceram');
  const divida = a.divida;
  assert.ok(Math.abs(divida - (50 - xp2)) < 1e-6, 'a dívida não bate com o XP tirado');
  const gemas = g.gems.length;
  a.hp = 1;
  g.damageEnemy(a, 10, 'teste');
  assert.ok(g.gems.length > gemas, 'a dívida não voltou ao chão');
  const xp3 = p.xp;
  for (let i = 0; i < 30; i++) g.update(DT, parado);
  assert.ok(p.xp >= xp3, 'continuou cobrando depois de cair');
});

test('Coach Picareta: prepara com aviso no chão e a palestra deixa lento quem está na roda', () => {
  const g = jogo();
  const p = g.player;
  const C = ENEMIES.coach;
  const c = g.spawnEnemy('coach', p.x + 3, p.y);
  c.hp = c.maxHp = 1e9;
  c.cdT = 0;
  let aviso = false;
  let palestra = false;
  for (let i = 0; i < 90 && !palestra; i++) {
    g.update(DT, parado);
    if (g.avisosChao && g.avisosChao.some((q) => q.tipo === 'circulo' && Math.abs(q.r - C.raioM) < 1e-6)) aviso = true;
    if (c.palestraT > 0) palestra = true;
  }
  assert.ok(aviso, 'sem o aviso no chão antes da palestra');
  assert.ok(palestra, 'não deu a palestra');
  g.update(DT, parado);
  assert.ok(p.slowT > 0, 'na roda e não ficou lento');
  // longe da roda: não fica lento
  p.slowT = 0;
  p.x = c.x + C.raioM + 3;
  g.update(DT, parado);
  assert.ok(!(p.slowT > 0.3), 'fora da roda e ficou lento');
});

test('Pastor Picareta: cura quem está em volta (não ele, não o chefão, não quem está longe) e chama fiéis', () => {
  const g = jogo();
  const p = g.player;
  const P = ENEMIES.pastor;
  const pa = g.spawnEnemy('pastor', p.x + P.distM, p.y);
  pa.speed = 0;
  pa.curaT = 0.05;
  pa.chamaT = 1e9;
  const perto = g.spawnEnemy('telespectador', pa.x + 1, pa.y);
  const longe = g.spawnEnemy('telespectador', pa.x + P.raioM + 4, pa.y);
  for (const e of [perto, longe]) {
    e.speed = 0;
    e.hp = e.maxHp * 0.3;
  }
  pa.hp = pa.maxHp * 0.5;
  for (let i = 0; i < 6; i++) g.update(DT, parado);
  assert.ok(perto.hp > perto.maxHp * 0.3 + 1e-9, 'não curou quem estava perto');
  assert.ok(Math.abs(longe.hp - longe.maxHp * 0.3) < 1e-9, 'curou quem estava longe');
  assert.ok(pa.hp <= pa.maxHp * 0.5 + 1e-9, 'curou a si mesmo');
  assert.ok(g.curasFx && g.curasFx.length, 'sem o anel da cura');
  const antes = g.enemies.length;
  pa.chamaT = 0;
  g.update(DT, parado);
  assert.equal(g.enemies.filter((e) => !e.dead).length, antes + P.chama, 'não chamou os fiéis');
});

test('Encostado: manca com o Juninho olhando, corre com ele de costas e congela quando é pego correndo', () => {
  const g = jogo();
  const p = g.player;
  const E = ENEMIES.encostado;
  const e = g.spawnEnemy('encostado', p.x + 9, p.y);
  e.hp = e.maxHp = 1e9;
  p.faceX = 1; // olhando para ele
  p.faceY = 0;
  let x0 = e.x;
  for (let i = 0; i < 30; i++) g.update(DT, parado);
  const lento = x0 - e.x;
  p.faceX = -1; // de costas
  x0 = e.x;
  for (let i = 0; i < 30; i++) g.update(DT, parado);
  const rapido = x0 - e.x;
  assert.ok(lento > 0, 'parou em vez de mancar');
  assert.ok(rapido > lento * 5, `não correu de costas (${lento.toFixed(2)} m → ${rapido.toFixed(2)} m)`);
  assert.ok(e.correndo, 'não ficou marcado como correndo');
  p.faceX = 1; // vira: pego no flagra
  g.update(DT, parado);
  assert.ok(e.flagradoT > 0, 'não congelou ao ser pego correndo');
  x0 = e.x;
  for (let i = 0; i < Math.floor((E.flagradoS * 0.8) / DT); i++) g.update(DT, parado);
  assert.ok(Math.abs(x0 - e.x) < 0.05, 'andou enquanto disfarçava');
});

test('cada trecho com o seu elenco (D78): a Orla não sorteia nem traz inimigo de São Paulo ou de Brasília', () => {
  const daOrla = (type) => !ENEMIES[type].trecho || ENEMIES[type].trecho === 'orla';
  for (let caos = 0; caos <= 100; caos += 5) {
    for (const { type } of DIRECTOR.composition(caos)) assert.ok(daOrla(type), `${type} na Orla com Caos ${caos}`);
  }
  for (const { type } of DIRECTOR.castTestComposition) assert.ok(daOrla(type), `${type} no elenco completo da Orla`);
  for (const { type } of DIRECTOR.morroComposition) assert.ok(!ENEMIES[type].trecho || ENEMIES[type].trecho === 'morro', `${type} no Morro`);
  const g = jogo();
  g.spawnElite('politico');
  assert.equal(g.enemies.filter((e) => e.type === 'laranja').length, 0, 'Laranja na Orla');
  assert.equal(HORDA_ORLA.roupasNovas, 4, 'a horda da Orla com roupa de outro trecho');
});

test('Bicheiro: abre a banca, os apontadores recolhem, o Juninho aposta e, se acertar o bicho, ganha o cofre', () => {
  const g = jogo();
  const p = g.player;
  const B = ENEMIES.bicheiro;
  g.spawnElite('bicheiro');
  const bi = g.enemies.find((e) => e.type === 'bicheiro');
  assert.ok(bi && bi.elite, 'o Bicheiro não veio como elite');
  const banca = g.bancas && g.bancas[0];
  assert.ok(banca && banca.bilhetes.length === B.bilhetes, 'sem os bilhetes no chão');
  assert.equal(new Set(banca.bilhetes.map((b) => b.bicho)).size, B.bilhetes, 'bicho repetido');
  const aps = g.enemies.filter((e) => e.behavior === 'apontador');
  assert.equal(aps.length, B.apontadores, 'sem os apontadores');
  // um apontador chega no bilhete dele e recolhe
  const ap = aps[0];
  const alvo = ap.bilhete;
  ap.x = alvo.x + 0.3;
  ap.y = alvo.y;
  g.update(DT, parado);
  assert.ok(!alvo.vivo, 'o apontador não recolheu');
  // o Juninho pega outro bilhete: é a aposta, e os outros somem
  const meu = banca.bilhetes.find((b) => b.vivo);
  p.x = meu.x;
  p.y = meu.y;
  g.update(DT, parado);
  assert.equal(banca.aposta, meu, 'não apostou');
  assert.ok(banca.bilhetes.every((b) => !b.vivo), 'os outros bilhetes ficaram');
  // derrubado: sai o bicho; com o sorteio caindo no bilhete dele, ganha o cofre
  const idx = banca.bilhetes.indexOf(meu);
  g.rng = () => (idx + 0.5) / banca.bilhetes.length;
  bi.hp = 1;
  g.damageEnemy(bi, 10, 'teste');
  assert.ok(g.modal && g.modal.kind === 'cofre', 'acertou e não ganhou o cofre');
  assert.equal(g.bancas.length, 0, 'a banca não fechou');
});

test('Bicheiro: aposta errada não ganha nada; e as elites da Orla revezam Político e Bicheiro', () => {
  const g = jogo();
  const p = g.player;
  g.spawnElite('bicheiro');
  const bi = g.enemies.find((e) => e.type === 'bicheiro');
  const banca = g.bancas[0];
  const meu = banca.bilhetes[0];
  p.x = meu.x;
  p.y = meu.y;
  g.update(DT, parado);
  g.rng = () => 0.99; // o último bilhete
  bi.hp = 1;
  g.damageEnemy(bi, 10, 'teste');
  assert.ok(!g.modal, 'errou e ganhou');
  const h = jogo();
  const tipos = [];
  for (let i = 0; i < 4; i++) {
    h.nextEliteAt = h.t;
    const antes = h.enemies.length;
    h.updateDirector(DT);
    tipos.push(...h.enemies.slice(antes).filter((e) => e.elite).map((e) => e.type));
  }
  assert.deepEqual(tipos, ['politico', 'bicheiro', 'politico', 'bicheiro']);
});
