// Figurantes (D55): garotas, PM, tropa e picolezeiros de ambiente. Andam um pouco, reagem à horda e não lutam.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { FIGURANTES } from '../src/config.js';

const DT = 1 / 30;
function jogo() {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 7 });
  g.enemies.length = 0;
  g.spawnAcc = -1e9;
  g.player.hp = 1e9;
  return g;
}

test('cada tipo tem seu lugar: garotas e PM na Orla, tropa no Morro, picolezeiro na areia', () => {
  const g = jogo();
  const w = g.world;
  const de = (t) => w.figurantes.filter((f) => f.tipo === t);
  for (const t of ['garota', 'pm', 'tropa', 'picole']) assert.ok(de(t).length > 0, `sem ${t}`);
  for (const f of de('garota').concat(de('pm'))) assert.ok(f.y > w.orlaTop - 1, `${f.tipo} fora da Orla`);
  for (const f of de('tropa')) assert.ok(f.y < w.orlaTop, 'tropa fora do Morro');
  for (const f of de('picole')) assert.ok(f.x > g.map.sandX && f.yb - f.ya >= FIGURANTES.picoleMinM, 'picolezeiro fora da areia');
  assert.equal(w.props.filter((p) => p.kind === 'garota' || p.kind === 'policial').length, 0, 'sobrou figura parada antiga');
});

test('andam perto do lugar deles; o picolezeiro vai e volta no trecho dele', () => {
  const g = jogo();
  const w = g.world;
  for (let i = 0; i < 30 * 40; i++) {
    g.player.y = 0; // perto dos do começo
    g.update(DT, { x: 0, y: 0 });
  }
  for (const f of w.figurantes) {
    if (Math.abs(f.y - g.player.y) > FIGURANTES.vistaM) continue;
    if (f.tipo === 'picole') assert.ok(f.y >= f.ya - 0.01 && f.y <= f.yb + 0.01, 'picolezeiro saiu do trecho');
    else assert.ok(Math.hypot(f.x - f.ax, f.y - f.ay) <= FIGURANTES.raioM[f.tipo] + 0.01, `${f.tipo} foi longe`);
  }
});

test('se defendem: o policial atira, a garota dá bolsada colada, o picolezeiro congela', () => {
  const g = jogo();
  const w = g.world;
  const parado = (e) => {
    e.hp = e.maxHp = 1e6;
    e.speed = 0;
    return e;
  };
  const roda = (n) => {
    for (let i = 0; i < n; i++) g.update(DT, { x: 0, y: 0 });
  };
  const pm = w.figurantes.find((f) => f.tipo === 'pm');
  g.player.x = pm.x;
  g.player.y = pm.y + 9; // longe o bastante para não entrar no grupo
  const e1 = parado(g.spawnEnemy('telespectador', pm.x + 5, pm.y - 2));
  roda(40);
  assert.ok(e1.hp < 1e6, 'o policial não atirou');
  assert.ok(pm.dirX > 0, 'não virou para a horda');
  const ga = w.figurantes.find((f) => f.tipo === 'garota');
  g.player.x = ga.x;
  g.player.y = ga.y + 9;
  const e2 = parado(g.spawnEnemy('telespectador', ga.x + 3, ga.y));
  roda(10);
  assert.equal(e2.hp, 1e6, 'a garota bateu de longe');
  e2.x = ga.x + 1;
  e2.y = ga.y;
  roda(30);
  assert.ok(e2.hp < 1e6, 'a garota não deu bolsada');
  const pi = w.figurantes.find((f) => f.tipo === 'picole');
  g.player.x = pi.x;
  g.player.y = pi.y + 9;
  const e3 = parado(g.spawnEnemy('telespectador', pi.x + 3, pi.y));
  roda(80);
  assert.ok(e3.hp < 1e6, 'o picolezeiro não jogou picolé');
});

test('grupo: o Juninho passa perto e eles vêm atrás (até o máximo), lutando junto', () => {
  const g = jogo();
  const w = g.world;
  // quatro garotas na mesma esquina, perto do Juninho: só cabem grupoMax
  const garotas = w.figurantes.filter((f) => f.tipo === 'garota').slice(0, FIGURANTES.grupoMax + 1);
  garotas.forEach((ga, k) => {
    ga.x = ga.ax = -4 + k * 0.4;
    ga.y = ga.ay = -20;
  });
  g.player.x = -3.4;
  g.player.y = -19.4;
  g.update(DT, { x: 0, y: 0 });
  const grupo = w.figurantes.filter((f) => f.grupo);
  assert.equal(grupo.length, FIGURANTES.grupoMax, 'o grupo passou do máximo');
  // o Juninho anda; o grupo vai atrás
  for (let i = 0; i < 30 * 6; i++) g.update(DT, { x: 0, y: -1 });
  for (const f of grupo) assert.ok(Math.hypot(f.x - g.player.x, f.y - g.player.y) < FIGURANTES.segueM + 2.5, `${f.tipo} ficou para trás`);
});

test('a horda mata um do grupo: ele vira telespectador, e depois outro aparece no lugar dele', () => {
  const g = jogo();
  const w = g.world;
  const ga = w.figurantes.find((f) => f.tipo === 'garota');
  const lugar = [ga.ax, ga.ay];
  const n0 = w.figurantes.length;
  // quase sem vida, com um da horda colado nela
  g.player.x = ga.x;
  g.player.y = ga.y + 9;
  ga.hp = 0.2;
  const e = g.spawnEnemy('telespectador', ga.x + 0.3, ga.y);
  e.hp = e.maxHp = 1e6;
  e.speed = 0;
  const tele0 = g.enemies.filter((q) => q.type === 'telespectador').length;
  for (let i = 0; i < 30 && w.figurantes.includes(ga); i++) g.update(DT, { x: 0, y: 0 });
  assert.ok(!w.figurantes.includes(ga), 'a garota não caiu');
  assert.equal(g.enemies.filter((e) => e.type === 'telespectador').length, tele0 + 1, 'não virou telespectador');
  // o Juninho vai embora; depois de um tempo, outra garota no mesmo lugar
  g.enemies.length = 0;
  g.player.y = ga.ay - 60;
  for (let i = 0; i < 30 * (FIGURANTES.voltaS + 2); i++) {
    g.player.y = ga.ay - 60;
    g.update(DT, { x: 0, y: 0 });
  }
  const volta = w.figurantes.find((f) => f.tipo === 'garota' && f.ax === lugar[0] && f.ay === lugar[1]);
  assert.ok(volta, 'ninguém voltou para o lugar dela');
  assert.equal(w.figurantes.length, n0);
});

test('abertura: ninguém entra no grupo antes de a horda atacar; depois, entra', async () => {
  const { emAbertura } = await import('../src/abertura.js');
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 12, meta: { abertura: true } });
  g.player.hp = 1e9;
  assert.ok(emAbertura(g), 'a partida não começou na abertura');
  const w = g.world;
  const ga = w.figurantes.find((f) => f.tipo === 'garota');
  const cola = () => {
    g.player.x = ga.x + 0.6;
    g.player.y = ga.y;
    g.player.plat = null;
    g.player.lvl = 0;
  };
  for (let i = 0; i < 30 * 3; i++) {
    cola();
    g.update(DT, { x: 0, y: 0 });
  }
  assert.ok(emAbertura(g), 'a abertura acabou cedo demais para o teste');
  assert.equal(w.figurantes.filter((f) => f.grupo).length, 0, 'entrou no grupo na abertura');
  g.pularAbertura();
  assert.ok(!emAbertura(g));
  cola();
  g.update(DT, { x: 0, y: 0 });
  assert.ok(ga.grupo, 'depois da abertura, não entrou no grupo');
});
