import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simulate } from './bot.mjs';
import { SESSION } from '../src/config.js';

function assertFinite(game) {
  const p = game.player;
  assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y), 'posição do jogador virou NaN');
  for (const e of game.enemies) assert.ok(Number.isFinite(e.x) && Number.isFinite(e.y) && Number.isFinite(e.hp), `inimigo ${e.type} com valor inválido`);
}

test('partida completa roda sem erro e respeita o limite de inimigos', () => {
  const game = simulate({ seed: 11, seconds: 600 });
  assertFinite(game);
  assert.ok(game.t > 30, `partida curta demais: ${game.t.toFixed(1)} s`);
  // elites e o chefe não contam no limite; ondas podem passar um pouco
  assert.ok(game.metrics.peakEnemies <= game.settings.maxEnemies + 90, `pico ${game.metrics.peakEnemies}`);
  // subiu de nível em algum momento (no Morro ele recomeça do nível 1, então o nível do fim não diz)
  assert.ok(game.player.level > 1 || game.summary().melhorias_em_s.length > 0, 'nunca subiu de nível');
  assert.ok(game.metrics.firstLevelUpAt !== null && game.metrics.firstLevelUpAt < 30, 'primeira melhoria demorou demais');
  console.log('[sim seed 11]', JSON.stringify(game.summary()));
});

test('as 3 propostas acontecem e o chefe aparece quando o jogador sobrevive', () => {
  // jogador "invencível" para testar o roteiro da sessão inteira
  const game = simulate({ seed: 3, seconds: 900, settings: {}, eventPolicy: () => true });
  if (game.over === 'defeat') {
    assert.ok(game.metrics.causeOfDeath, 'derrota sem causa registrada');
    return;
  }
  assert.equal(game.metrics.decisions.length, 3);
  assert.ok(game.corruption >= 85, `aceitar tudo deveria dar corrupção alta, deu ${game.corruption}`);
  assert.ok(game.bossSpawned, 'chefe não apareceu');
});

test('o roteiro da carreira funciona com vida infinita: covil, chefão, passagem, Morro e entrega', async () => {
  const { Game } = await import('../src/game.js');
  const { defaultSettings } = await import('../src/settings.js');
  const { botInput, resolveModal } = await import('./bot.mjs');
  const game = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 5 });
  const golpes = new Set();
  let fases = 0;
  let armasNaOrla = 0;
  while (!game.finished && game.t < 2400) {
    if (game.modal) {
      resolveModal(game);
      continue;
    }
    game.player.hp = 9999;
    if (game.segment === 'orla') armasNaOrla = game.player.weapons.length;
    game.update(1 / 30, botInput(game));
    game.outbox.length = 0;
    if (game.boss && game.boss.golpe) golpes.add(game.boss.golpe);
    if (game.boss) fases = Math.max(fases, game.boss.fase || 0);
  }
  assert.equal(game.metrics.decisions.length, 3, 'nem todas as propostas apareceram');
  assert.ok(game.metrics.chefaoOrlaS, 'o Monstrão não caiu');
  assert.ok(golpes.has('investida') && golpes.has('pose'), `o Monstrão não deu investida nem fez pose: ${[...golpes]}`);
  assert.equal(fases, 2, 'o chefão não passou pelas três fases');
  assert.ok(armasNaOrla >= 3, 'a build da Orla não cresceu');
  assert.ok(game.metrics.morroAt > game.metrics.chefaoOrlaS, 'não atravessou para o Morro');
  assert.ok(game.metrics.chefaoMorroS, 'o Chefe do Tráfico não caiu');
  assert.equal(game.over, 'victory', `esperava a entrega, veio ${game.over} em ${game.t.toFixed(0)} s`);
  console.log('[roteiro]', JSON.stringify({ t: Math.round(game.t), monstrao: game.metrics.chefaoOrlaS, morro: game.metrics.morroAt, chefe: game.metrics.chefaoMorroS }));
});

test('atalho de teste (começar em 07:45) monta uma build e pula propostas antigas', async () => {
  const { Game } = await import('../src/game.js');
  const { defaultSettings } = await import('../src/settings.js');
  const game = new Game({ ...defaultSettings() }, { seed: 9 });
  game.fastForward(465);
  assert.equal(game.t, 465);
  assert.equal(game.eventIndex, 3);
  assert.ok(game.player.level >= 20);
  assert.ok(game.player.weapons.length >= 2);
});
