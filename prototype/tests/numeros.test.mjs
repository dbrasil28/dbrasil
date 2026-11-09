// Números à vista: a tela de melhorias mostra o efeito (agora → depois), a TV diz o que vale na partida e a
// pausa mostra os números do Juninho e de onde vem cada um.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { efeitoAgoraEDepois, resumoMelhorias, numerosDoJuninho } from '../src/upgrades.js';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { PLAYER, MELHORIAS } from '../src/config.js';

test('tela de melhorias: o efeito somado agora e depois da próxima compra', () => {
  const V = MELHORIAS.vida;
  assert.equal(efeitoAgoraEDepois('vida', 3), `Vida máxima: ${PLAYER.hp + 3 * V.step} → ${PLAYER.hp + 4 * V.step}`);
  assert.equal(efeitoAgoraEDepois('vida', V.custo.length), `Vida máxima: ${PLAYER.hp + V.custo.length * V.step} (máximo)`);
  assert.equal(efeitoAgoraEDepois('dano', 2), 'Dano: +3% → +4,5%');
  assert.equal(efeitoAgoraEDepois('recarga', 1), 'Recarga das armas: −1% → −2%');
  assert.equal(efeitoAgoraEDepois('armadura', 2), 'Dano recebido: −3% → −4,5%');
  assert.equal(efeitoAgoraEDepois('gorjeta', 0), 'Gorjeta no fim: 0% → +4%');
  assert.equal(efeitoAgoraEDepois('troca', 0), 'Ainda não comprada');
});

test('a partida começa dizendo na TV quais melhorias valem; sem melhoria, não diz nada', () => {
  const com = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 3, meta: { melhorias: { vida: 3, dano: 2 } } });
  assert.equal(com.stats.maxHp, PLAYER.hp + 3 * MELHORIAS.vida.step);
  const tv = com.outbox.filter((e) => e.type === 'tv').map((e) => e.text);
  assert.ok(tv.includes(`MELHORIAS ATIVAS: +${3 * MELHORIAS.vida.step} DE VIDA, +3% DE DANO`), tv.join(' | '));
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
  const mv = 3 * MELHORIAS.vida.step;
  assert.equal(vida.valor, String(PLAYER.hp + mv + 20));
  assert.deepEqual(vida.partes, [`base ${PLAYER.hp}`, `melhorias +${mv}`, 'cartas +20']);
  const dano = n.find((l) => l.nome === 'Dano');
  assert.deepEqual(dano.partes, ['melhorias +3%', 'propostas +20%']);
  assert.equal(dano.valor, '+23,6%');
});

test('melhorias bem mais lentas (pedido do autor): muitos níveis, preço subindo a cada um, e o colete e a avaliação valem', () => {
  const basicas = Object.values(MELHORIAS).filter((m) => !m.opcao);
  const niveis = Object.values(MELHORIAS).reduce((s, m) => s + m.custo.length, 0);
  const total = Object.values(MELHORIAS).reduce((s, m) => s + m.custo.reduce((a, b) => a + b, 0), 0);
  assert.ok(niveis >= 50, `poucas barrinhas: ${niveis}`);
  assert.ok(total >= 20000, `completar tudo ficou barato: ${total} gorjetas`);
  for (const m of basicas) {
    assert.ok(m.custo[0] <= 100, `${m.name}: o primeiro nível devia sair na primeira partida (${m.custo[0]})`);
    for (let i = 1; i < m.custo.length; i++) assert.ok(m.custo[i] > m.custo[i - 1], `${m.name}: o preço não sobe no nível ${i + 1}`);
  }
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 3, meta: { melhorias: { armadura: 2, gorjeta: 5 } } });
  assert.ok(Math.abs(g.stats.armor - 2 * MELHORIAS.armadura.step) < 1e-9, 'o colete não protege');
  g.t = 600;
  const t = g.tips();
  const extra = t.parts.find((p) => p[0].startsWith('Avaliação 5 estrelas'));
  const semExtra = t.total - (extra ? extra[1] : 0);
  assert.ok(extra && Math.abs(extra[1] - semExtra * 5 * MELHORIAS.gorjeta.step) <= 1, 'a avaliação não deu gorjeta a mais');
});
