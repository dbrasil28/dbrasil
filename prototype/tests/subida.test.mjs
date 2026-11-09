// Subida do Morro (D90): o aviso antes da escadaria e a atualização do app em cena (o tempo para, os itens
// expiram um por um, o nível cai, a relíquia fica) e a TV e a Bolsa de ferramentas só depois.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { ATUALIZACAO, TV } from '../src/config.js';
import { carimbados, nivelNaCena } from '../src/atualizacao.js';

const DT = 1 / 30;
const parado = { x: 0, y: 0 };

function jogo(meta = {}) {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 21, meta });
  g.enemies.length = 0;
  g.spawnAcc = -1e9;
  g.nextWaveAt = 1e9;
  g.nextEliteAt = 1e9;
  g.world.figurantes = [];
  return g;
}

test('subida do Morro: com a escadaria aberta, a faixa avisa perto dela, e só perto', () => {
  const g = jogo();
  const w = g.world;
  const p = g.player;
  p.x = (w.gate.x0 + w.gate.x1) / 2;
  p.y = w.gate.y1 + ATUALIZACAO.avisoM - 1;
  g.update(DT, parado);
  assert.equal(g.avisoPorta, false, 'avisou com a escadaria fechada');
  w.gateOpen = true;
  g.update(DT, parado);
  assert.equal(g.avisoPorta, true, 'não avisou perto da escadaria aberta');
  p.y = w.gate.y1 + ATUALIZACAO.avisoM + 4;
  g.update(DT, parado);
  assert.equal(g.avisoPorta, false, 'avisou longe da escadaria');
  assert.ok(TV.avisoItens.length > 0);
});

test('subida do Morro: a atualização para o tempo, carimba cada item, derruba o nível, guarda a relíquia e só então a TV fala', () => {
  const g = jogo({ melhorias: { armaInicial: 1 } });
  g.pendingInicial = false; // a do começo da Orla já foi
  const w = g.world;
  const p = g.player;
  w.gateOpen = true;
  p.level = 14;
  p.weapons.push({ id: 'chinelo', level: 3, cd: 0 }, { id: 'boleto', level: 2, cd: 0 });
  p.passives.push({ id: 'tenis', level: 2 });
  p.reliquia = 'altinha';
  p.superCarga = 0.4;
  p.x = (w.gate.x0 + w.gate.x1) / 2;
  p.y = w.orlaTop - 2;
  g.outbox.length = 0;
  g.sons.length = 0;
  g.updateRoute();
  const U = g.atualizacao;
  assert.ok(U, 'a cena não começou');
  assert.equal(g.segment, 'morro');
  // o jogo já recomeçou por baixo; a cena guarda o que ele tinha
  assert.deepEqual(p.weapons.map((x) => x.id), ['capacete']);
  assert.equal(p.level, 1);
  assert.deepEqual(U.itens.map((x) => x.id), ['capacete', 'chinelo', 'boleto', 'tenis']);
  assert.equal(U.nivel, 14);
  assert.equal(U.reliquia, 'altinha');
  assert.equal(p.reliquia, 'altinha', 'a relíquia não ficou');
  assert.ok(U.bolsa, 'a cena não sabe da Bolsa de ferramentas');
  assert.ok(!g.outbox.some((o) => o.type === 'recomeco' || o.type === 'segment'), 'o aviso rápido saiu junto com a cena');
  const t0 = g.t;
  const e = g.spawnEnemy('telespectador', p.x + 2, p.y);
  const ex = e.x;
  let viuMeioNivel = false;
  while (g.atualizacao && g.atualizacao.t < U.durS - 0.1) {
    g.update(DT, parado);
    const n = nivelNaCena(U);
    if (n > 1 && n < 14) viuMeioNivel = true;
    assert.equal(g.modal, null, 'a Bolsa de ferramentas abriu no meio da cena');
  }
  assert.equal(g.t, t0, 'o tempo andou na cena');
  assert.equal(e.x, ex, 'a horda andou na cena');
  assert.equal(carimbados(U), 4, 'nem todo item levou o carimbo');
  assert.equal(g.sons.filter((s) => s.id === 'baque').length, 4, 'um carimbo por item');
  assert.ok(viuMeioNivel, 'o nível não caiu aos poucos');
  assert.equal(nivelNaCena(U), 1);
  const tv = (k) => g.outbox.some((o) => o.type === 'tv' && TV[k].includes(o.text));
  assert.ok(!tv('recomeco'), 'a TV falou antes do fim da cena');
  for (let i = 0; i < 10 && g.atualizacao; i++) g.update(DT, parado);
  assert.equal(g.atualizacao, null, 'a cena não acabou');
  assert.ok(tv('recomeco') && tv('reliquia_leva') && tv('morro'), 'a TV não falou no fim');
  assert.ok(p.invulnT > 0, 'voltou ao jogo sem proteção');
  g.update(DT, parado);
  assert.ok(g.t > t0, 'o tempo não voltou');
  assert.equal(g.modal && g.modal.kind, 'inicial', 'a Bolsa de ferramentas não abriu depois da cena');
});
