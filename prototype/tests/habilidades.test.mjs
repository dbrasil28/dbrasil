// Cada habilidade tem um padrão próprio (docs/design/HABILIDADES.md). Estes testes conferem o padrão, não o dano exato.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { WEAPONS, WEAPON_FX } from '../src/config.js';
import { weaponStats } from '../src/upgrades.js';

const DT = 1 / 30;
const parado = { x: 0, y: 0 };

/** Partida vazia com uma única habilidade, Juninho imortal e sem horda chegando sozinha. */
function arena(id, level = 1, trecho = 'orla') {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false, trecho }, { seed: 7 });
  g.enemies.length = 0;
  g.spawnAcc = -1e9;
  g.updateRoute(); // no Morro, a passagem já recomeça o trecho (só o Capacete): arma a habilidade depois
  const p = g.player;
  p.hp = 1e6;
  p.xpNext = 1e9;
  p.weapons.length = 0;
  p.weapons.push({ id, level, cd: 0 });
  return g;
}

function inimigo(g, dx, dy, hp = 500) {
  const e = g.spawnEnemy('telespectador', g.player.x + dx, g.player.y + dy);
  e.hp = e.maxHp = hp;
  e.speed = 0;
  return e;
}

function rodar(g, s, input = parado, cada) {
  for (let i = 0; i < Math.round(s / DT); i++) {
    g.update(DT, input);
    if (cada) cada(i);
  }
}

test('Capacete: vai na direção da horda e volta para a mão', () => {
  const g = arena('capacete');
  const e = inimigo(g, 3, 0);
  g.update(DT, parado);
  const pr = g.projectiles.find((o) => o.kind === 'boomerang');
  assert.ok(pr, 'não jogou o capacete');
  assert.ok(pr.vx > 0 && Math.abs(pr.vy) < pr.vx * 0.2, 'não mirou na horda');
  let voltou = false;
  rodar(g, 1.2, parado, () => { if (!g.projectiles.includes(pr)) voltou = true; });
  assert.ok(voltou, 'o capacete não voltou');
  assert.ok(e.hp < 500, 'não acertou ninguém');
});

test('Chinelo: rajada em fila na direção da horda, mesmo quando o Juninho foge para o outro lado', () => {
  const g = arena('chinelo', 2);
  const st = weaponStats('chinelo', 2);
  const p = g.player;
  const e = inimigo(g, -4, 0); // a horda vem atrás
  rodar(g, 0.12, { x: 1, y: 0 }); // fugindo para a frente
  const cs = g.projectiles.filter((o) => o.kind === 'slipper');
  assert.equal(cs.length, st.count, 'quantidade da rajada');
  const voando = cs.filter((o) => !(o.delay > 0));
  const naHorda = (o) => ((e.x - p.x) * o.vx + (e.y - p.y) * o.vy) / (Math.hypot(e.x - p.x, e.y - p.y) * Math.hypot(o.vx, o.vy));
  assert.ok(voando.length >= 1 && voando.every((o) => naHorda(o) > 0.9), 'a rajada não foi na direção da horda');
  assert.ok(cs.some((o) => o.delay > 0), 'saíram todos juntos');
  rodar(g, 0.4, { x: 1, y: 0 });
  assert.ok(e.hp < 500, 'a rajada não acertou a horda');
});

test('Chinelo nível 5: a chinelada de mãe abre uma 2ª rajada no outro lado da horda', () => {
  const g = arena('chinelo', 5);
  const a = inimigo(g, 4, 0);
  const b = inimigo(g, 0, 5);
  rodar(g, 0.5);
  assert.ok(a.hp < 500 && b.hp < 500, 'só um lado da horda levou chinelada');
});

test('Boleto: boletos giram em volta do Juninho e acompanham quando ele anda', () => {
  const g = arena('boleto', 2);
  const st = weaponStats('boleto', 2);
  g.update(DT, parado);
  const z = g.zones.find((o) => o.kind === 'orbita');
  assert.ok(z, 'sem órbita');
  rodar(g, 0.6, { x: 0, y: 1 });
  const p = g.player;
  assert.equal(z.pts.length, st.count);
  for (const q of z.pts) assert.ok(Math.abs(Math.hypot(q.x - p.x, q.y - p.y) - z.r) < 0.05, 'boleto fora do raio');
  const a0 = z.ang;
  rodar(g, 0.3);
  assert.ok(z.ang > a0, 'não está girando');
  const e = inimigo(g, z.r, 0);
  rodar(g, 1.5);
  assert.ok(e.hp < 500, 'o boleto não cobrou quem encostou');
});

test('Carimbo: a sombra aparece antes e o INDEFERIDO só bate quando cai', () => {
  const g = arena('carimbo');
  const e = inimigo(g, 4, 1);
  g.update(DT, parado);
  const z = g.zones.find((o) => o.kind === 'stamp');
  assert.ok(z, 'não carimbou');
  assert.ok(Math.hypot(z.x - e.x, z.y - e.y) < 0.01, 'não mirou no inimigo');
  rodar(g, WEAPON_FX.raioDur);
  assert.equal(e.hp, 500, 'bateu antes de cair');
  rodar(g, weaponStats('carimbo', 1).fallS);
  assert.ok(e.hp < 500 && e.slowT > 0, 'a queda não machucou nem deixou lento');
});

test('Maleta: cai aberta perto da horda, atrai por uns segundos e explode lançando todo mundo para o alto', () => {
  const g = arena('maleta');
  const st = weaponStats('maleta', 1);
  const longe = inimigo(g, 9, 0); // dentro do alcance da isca, longe da explosão
  longe.speed = 2;
  g.update(DT, parado);
  const pr = g.projectiles.find((o) => o.kind === 'lob');
  assert.ok(pr, 'não jogou a maleta');
  assert.ok(pr.tx > g.player.x + 2, 'não jogou na direção da horda');
  rodar(g, st.flightS + 0.1);
  const z = g.zones.find((o) => o.kind === 'maleta');
  assert.ok(z, 'a maleta não caiu aberta');
  assert.ok(g.lures.length > 0, 'não virou isca');
  const d0 = Math.hypot(longe.x - z.x, longe.y - z.y);
  rodar(g, st.iscaS * 0.7);
  const d1 = Math.hypot(longe.x - z.x, longe.y - z.y);
  assert.ok(d1 < d0 - 1, `a horda não correu atrás do dinheiro: ${d0.toFixed(1)} → ${d1.toFixed(1)}`);
  assert.equal(longe.hp, 500, 'machucou antes de explodir');
  let voou = false;
  rodar(g, st.iscaS * 0.5, parado, () => { if (longe.alt > 0.3) voou = true; });
  assert.ok(longe.hp < 500, 'a explosão não machucou');
  assert.ok(voou, 'a explosão não lançou para o alto');
  assert.ok(!g.zones.some((o) => o.kind === 'maleta'), 'a maleta não sumiu depois de explodir');
});

test('Picolé: deixa poças pelo caminho e quem pisa fica lento', () => {
  const g = arena('picole', 1, 'orla');
  rodar(g, 1.5, { x: 1, y: 0 });
  const pocas = g.zones.filter((o) => o.kind === 'poca');
  assert.ok(pocas.length >= 3, `poucas poças: ${pocas.length}`);
  const xs = pocas.map((o) => o.x);
  assert.ok(Math.max(...xs) - Math.min(...xs) > 2, 'as poças não formam um rastro');
  assert.ok(pocas.every((o) => o.x <= g.player.x + 0.01), 'poça na frente do Juninho');
  const z = pocas[0];
  const e = g.spawnEnemy('telespectador', z.x, z.y);
  e.hp = e.maxHp = 500;
  e.speed = 0;
  rodar(g, 0.6);
  assert.ok(e.slowT > 0, 'quem pisou não ficou lento');
});

test('Mototáxi: avisa com a faixa, espera e só então a moto passa', () => {
  const g = arena('mototaxi', 1, 'morro');
  const st = weaponStats('mototaxi', 1);
  g.update(DT, parado);
  const m = g.projectiles.find((o) => o.kind === 'moto');
  assert.ok(m, 'sem moto');
  assert.ok(g.fx.words.some((w) => w.txt === 'BI-BI!'), 'sem buzina');
  const y0 = m.y;
  rodar(g, st.warnS * 0.8);
  assert.equal(m.y, y0, 'a moto andou durante o aviso');
  rodar(g, st.warnS * 0.4);
  assert.ok(m.y < y0, 'a moto não saiu depois do aviso');
});

test('Megafone: círculo sempre ligado que empurra a horda para fora', () => {
  const g = arena('microfone');
  const p = g.player;
  const e = inimigo(g, 1.0, 0);
  const d0 = Math.hypot(e.x - p.x, e.y - p.y);
  rodar(g, 0.6);
  assert.ok(p.auraR > 1.5, 'sem círculo');
  assert.ok(Math.hypot(e.x - p.x, e.y - p.y) > d0 + 0.3, 'não empurrou');
  assert.ok(e.hp < 500, 'não machucou');
});

test('Gato de Luz: o choque pula de um inimigo para o vizinho', () => {
  const g = arena('gato');
  if (g.world) g.world.props = g.world.props.filter((q) => q.kind !== 'poste' && q.kind !== 'fios'); // a descarga do poste tem teste próprio
  const st = weaponStats('gato', 1);
  const fila = [inimigo(g, 2, 0), inimigo(g, 4, 0), inimigo(g, 6, 0), inimigo(g, 8, 0)];
  g.update(DT, parado);
  const b = g.fx.bolts[0];
  assert.ok(b, 'sem raio');
  assert.equal(b.pts.length, 1 + st.chain, 'a corrente não pulou o número certo de vezes');
  assert.ok(fila.slice(0, st.chain).every((e) => e.hp < 500), 'algum da corrente não levou choque');
  assert.equal(fila[st.chain].hp, 500, 'pulou além do limite');
});

test('Cachorro Caramelo: corre até o inimigo, morde e volta para o lado do Juninho', () => {
  const g = arena('caramelo');
  const p = g.player;
  const e = inimigo(g, 4, 0);
  let correu = false;
  let mordeu = false;
  rodar(g, 3, parado, () => {
    const d = g.dogs[0];
    if (d && d.st === 'corre') correu = true;
    if (e.hp < 500) mordeu = true;
  });
  assert.equal(g.dogs.length, 1);
  assert.ok(correu && mordeu, 'o cachorro não correu ou não mordeu');
  e.dead = true;
  rodar(g, 2);
  const d = g.dogs[0];
  assert.ok(Math.hypot(d.x - p.x, d.y - p.y) < 2, 'o cachorro não voltou');
});

test('todas as habilidades têm 5 níveis com descrição (menos a evolução)', () => {
  for (const [id, w] of Object.entries(WEAPONS)) {
    if (w.evolution) continue;
    assert.equal(w.levels.length, 5, id);
    for (const lv of w.levels.slice(1)) assert.ok(lv.desc, `${id} sem descrição de nível`);
  }
});

test('Chefão na mira: o Capacete vai nele mesmo com a horda mais perto (D46)', () => {
  const g = arena('capacete', 1, 'morro');
  inimigo(g, -2, 0, 1e6); // horda bem do lado do Juninho
  inimigo(g, 0, -2.5, 1e6);
  const chefe = g.spawnEnemy('chefe_trafico', g.player.x + 6, g.player.y);
  chefe.speed = 0;
  chefe.fireT = 1e9; // não atira nem chama reforço durante o teste
  chefe.callCd = 1e9;
  const hp0 = chefe.hp;
  rodar(g, 1.2);
  assert.ok(chefe.hp < hp0, 'o capacete acertou o chefe');
});

test('Hora de bater: o Chefe parado mirando leva o dobro de dano (D46)', () => {
  const g = arena('capacete', 1, 'morro');
  const chefe = g.spawnEnemy('chefe_trafico', g.player.x + 6, g.player.y);
  chefe.hp = chefe.maxHp = 1e6;
  g.damageEnemy(chefe, 10, 'teste');
  const andando = 1e6 - chefe.hp;
  chefe.aimT = 0.5;
  const antes = chefe.hp;
  g.damageEnemy(chefe, 10, 'teste');
  assert.equal(antes - chefe.hp, andando * 2);
});
