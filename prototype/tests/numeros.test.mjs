// Números à vista: a tela de melhorias mostra o efeito (agora → depois), a TV diz o que vale na partida e a
// pausa mostra os números do Juninho e de onde vem cada um.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { efeitoAgoraEDepois, resumoMelhorias, numerosDoJuninho } from '../src/upgrades.js';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { PLAYER, MELHORIAS } from '../src/config.js';

test('tela de melhorias: o efeito somado agora e depois da próxima compra', () => {
  assert.equal(efeitoAgoraEDepois('vida', 3), `Vida máxima: ${PLAYER.hp + 15} → ${PLAYER.hp + 20}`);
  assert.equal(efeitoAgoraEDepois('vida', 4), `Vida máxima: ${PLAYER.hp + 20} (máximo)`);
  assert.equal(efeitoAgoraEDepois('dano', 2), 'Dano: +5% → +7,5%');
  assert.equal(efeitoAgoraEDepois('recarga', 1), 'Recarga das armas: −2% → −4%');
  assert.equal(efeitoAgoraEDepois('troca', 0), 'Ainda não comprada');
});

test('a partida começa dizendo na TV quais melhorias valem; sem melhoria, não diz nada', () => {
  const com = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 3, meta: { melhorias: { vida: 3, dano: 2 } } });
  assert.equal(com.stats.maxHp, PLAYER.hp + 3 * MELHORIAS.vida.step);
  const tv = com.outbox.filter((e) => e.type === 'tv').map((e) => e.text);
  assert.ok(tv.includes('MELHORIAS ATIVAS: +15 DE VIDA, +5% DE DANO'), tv.join(' | '));
  const sem = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 3, meta: { melhorias: {} } });
  assert.ok(!sem.outbox.some((e) => e.type === 'tv' && e.text.startsWith('MELHORIAS')));
  assert.deepEqual(resumoMelhorias({}), []);
});

test('pausa: os números do Juninho separam melhorias, cartas e propostas', () => {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 3, meta: { melhorias: { vida: 3, dano: 2 } } });
  g.player.passives.push({ id: 'marmita', level: 1 });
  g.mods.dmgMul *= 1.2; // uma proposta aceita
  const n = numerosDoJuninho(g.player, g.mods, g.meta.melhorias);
  const vida = n.find((l) => l.nome === 'Vida máxima');
  assert.equal(vida.valor, String(PLAYER.hp + 15 + 20));
  assert.deepEqual(vida.partes, [`base ${PLAYER.hp}`, 'melhorias +15', 'cartas +20']);
  const dano = n.find((l) => l.nome === 'Dano');
  assert.deepEqual(dano.partes, ['melhorias +5%', 'propostas +20%']);
  assert.equal(dano.valor, '+26%');
});
