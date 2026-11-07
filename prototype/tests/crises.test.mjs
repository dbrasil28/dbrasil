// Crises da cidade (D39): a TV avisa antes; Ressaca, Apagão, Baile e Gato de luz em curto.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { CRISES, CARREIRA } from '../src/config.js';

const DT = 1 / 30;
const parado = { x: 0, y: 0 };

function jogo() {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 21 });
  g.enemies.length = 0;
  g.spawnAcc = -1e9;
  g.player.hp = 1e6;
  g.player.xpNext = 1e9;
  g.eventIndex = 99; // sem propostas de Corrupção no meio do teste
  return g;
}
const rodar = (g, s) => { for (let i = 0; i < Math.round(s / DT); i++) g.update(DT, parado); };
const forcar = (g, id) => { g.crise = { id, def: CRISES.porTrecho[g.segment].find((d) => d.id === id), fase: 'aviso', t: CRISES.avisoS - DT }; };

test('em 30% do Caos a TV avisa a Ressaca e ela começa 20 s depois', () => {
  const g = jogo();
  g.trechoT0 = g.t - CARREIRA.caosTempoS * 0.36; // ~30% só pelo tempo
  g.update(DT, parado);
  assert.ok(g.caos >= 30, `Caos ${g.caos}`);
  assert.equal(g.crise && g.crise.id, 'ressaca');
  assert.equal(g.crise.fase, 'aviso');
  rodar(g, CRISES.avisoS * 0.9);
  assert.equal(g.crise.fase, 'aviso', 'começou antes do aviso acabar');
  rodar(g, CRISES.avisoS * 0.15);
  assert.equal(g.crise.fase, 'ativa');
});

test('Ressaca: a areia molhada deixa lento, a onda derruba a horda e o mar deixa um cofre ao recuar', () => {
  const g = jogo();
  forcar(g, 'ressaca');
  rodar(g, CRISES.ressaca.avancaS + 0.5);
  const c = g.crise;
  assert.ok(c.agua < g.map.seaX - 5, 'o mar não avançou');
  const e = g.spawnEnemy('telespectador', c.agua + 2, g.player.y - 3);
  e.hp = e.maxHp = 1e4;
  e.speed = 0;
  const x0 = e.x;
  rodar(g, CRISES.ressaca.ondaS + CRISES.ressaca.ondaCorreS + 0.5);
  assert.ok(e.hp < 1e4 && e.x < x0 - 0.5, 'a onda não derrubou');
  const cofres = g.achados.filter((a) => a.onde === 'ressaca').length;
  rodar(g, c.def.duracaoS);
  assert.equal(g.crise, null);
  assert.equal(g.achados.filter((a) => a.onde === 'ressaca').length, cofres + 1, 'o mar não deixou o cofre');
});

test('Apagão: aparece um cofre que só brilha no escuro', () => {
  const g = jogo();
  forcar(g, 'apagao');
  rodar(g, 0.2);
  assert.ok(g.achados.some((a) => a.soNoEscuro), 'sem o cofre do escuro');
});

test('Morro: no Baile a horda em volta para para dançar e chegam Funkeiros; no curto, a faísca dá choque', () => {
  const g = jogo();
  g.world.gateOpen = true;
  g.player.x = (g.world.gate.x0 + g.world.gate.x1) / 2;
  g.player.y = g.world.orlaTop - 2;
  g.updateRoute();
  g.player.hp = 1e6;
  g.stats.maxHp = 1e6;
  assert.equal(g.segment, 'morro');
  const e = g.spawnEnemy('telespectador', g.player.x + 3, g.player.y);
  forcar(g, 'baile');
  rodar(g, 0.2);
  assert.ok(e.dancaT > 0, 'não parou para dançar');
  const x0 = e.x;
  rodar(g, 1);
  assert.ok(Math.abs(e.x - x0) < 0.3, 'andou dançando');
  assert.ok(g.enemies.some((o) => !o.dead && o.type === 'funkeiro'), 'sem Funkeiros');
  g.crise = null;
  forcar(g, 'curto');
  rodar(g, 0.2);
  const hp = g.player.hp;
  const f = { x: g.player.x, y: g.player.y, t: 0 };
  g.crise.faiscas.push(f);
  rodar(g, CRISES.curto.avisoS + 0.1);
  assert.ok(g.player.hp < hp, 'a faísca não deu choque');
});
