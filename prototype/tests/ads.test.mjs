import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { interstitialAllowed } from '../src/ads.js';
import { ADS } from '../src/config.js';

const killPlayer = (game) => {
  game.player.hp = -1;
  game.update(1 / 60, { x: 0, y: 0 });
};

test('morte oferece segunda chance uma vez; assistir revive com 50% e invulnerável', () => {
  const game = new Game({ ...defaultSettings() }, { seed: 2 });
  for (let i = 0; i < 5; i++) game.spawnEnemy('cidadao', game.player.x + 1, game.player.y);
  killPlayer(game);
  assert.equal(game.modal?.kind, 'revive');
  assert.equal(game.over, null);
  game.chooseRevive(true);
  assert.equal(game.modal, null);
  assert.equal(game.over, null);
  assert.ok(Math.abs(game.player.hp - game.stats.maxHp * ADS.reviveHpFrac) < 1e-6);
  assert.ok(game.player.invulnT > 0);
  assert.equal(game.enemies.filter((e) => !e.dead && !e.elite).length, 0, 'inimigos em volta deveriam cair');
  const hp = game.player.hp;
  game.hurtPlayer(50, 'cidadao');
  assert.equal(game.player.hp, hp, 'tomou dano invulnerável');
  // segunda morte: sem nova oferta
  game.player.invulnT = 0;
  killPlayer(game);
  assert.equal(game.over, 'defeat');
  assert.equal(game.metrics.ads.ofertas.reviver, 1);
  assert.equal(game.metrics.ads.aceitos.reviver, 1);
});

test('recusar ou abandonar o anúncio encerra o turno', () => {
  const game = new Game({ ...defaultSettings() }, { seed: 2 });
  killPlayer(game);
  game.chooseRevive(false);
  assert.equal(game.over, 'defeat');
  assert.ok(game.metrics.causeOfDeath !== undefined);
});

test('sem anúncios ligados não há oferta de segunda chance nem troca de cartas', () => {
  const game = new Game({ ...defaultSettings(), ads: false }, { seed: 2 });
  assert.equal(game.rerollsLeft, 0);
  killPlayer(game);
  assert.equal(game.over, 'defeat');
});

test('trocar cartas gasta uma troca e mantém 3 opções', () => {
  const game = new Game({ ...defaultSettings() }, { seed: 4 });
  game.pendingLevels = 1;
  game.openModalIfNeeded();
  assert.equal(game.modal.kind, 'levelup');
  const before = game.rerollsLeft;
  assert.ok(game.rerollOptions());
  assert.equal(game.rerollsLeft, before - 1);
  assert.equal(game.modal.options.length, 3);
  while (game.rerollsLeft > 0) game.rerollOptions();
  assert.equal(game.rerollOptions(), false);
});

test('regras do intersticial: carência, intervalo e respeito a quem viu anúncio', () => {
  const base = { enabled: true, noAds: false, runsEnded: 2, lastInterstitialAt: -Infinity, lastRewardedAt: -Infinity };
  assert.equal(interstitialAllowed(base, 1000), true);
  assert.equal(interstitialAllowed({ ...base, runsEnded: 1 }, 1000), false, '1ª partida da sessão');
  assert.equal(interstitialAllowed({ ...base, lastInterstitialAt: 900 }, 1000), false, 'menos de 3 min');
  assert.equal(interstitialAllowed({ ...base, lastInterstitialAt: 800 }, 1000), true);
  assert.equal(interstitialAllowed({ ...base, lastRewardedAt: 950 }, 1000), false, 'acabou de ver recompensado');
  assert.equal(interstitialAllowed({ ...base, noAds: true }, 1000), false, 'comprou Sem anúncios');
  assert.equal(interstitialAllowed({ ...base, enabled: false }, 1000), false);
});
