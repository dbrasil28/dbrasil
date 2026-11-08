// Sons (sons.js): todo som pedido pelo jogo existe, tem receita provisória e soa; a fila não cresce sem fim.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { SONS, SOM, SOM_ARMA, SOM_GOLPE, THROWABLES } from '../src/config.js';
import { RECEITAS, sintetizar } from '../src/sons.js';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';

test('todo som da tabela tem receita provisória, e soa sem estourar', () => {
  for (const id of Object.keys(SONS)) {
    assert.ok(RECEITAS[id], `sem receita: ${id}`);
    const a = sintetizar(id);
    let pico = 0;
    for (const v of a) {
      assert.ok(Number.isFinite(v), `${id}: amostra inválida`);
      pico = Math.max(pico, Math.abs(v));
    }
    assert.ok(pico > 0.5 && pico <= 0.91, `${id}: pico ${pico}`);
  }
  for (const id of Object.keys(RECEITAS)) assert.ok(SONS[id], `receita sem som na tabela: ${id}`);
});

test('todo som que o jogo pede existe na tabela', () => {
  const pedidos = new Set([...Object.values(SOM_ARMA), ...Object.values(SOM_GOLPE), ...Object.values(SOM.amb), 'golpe', 'gemido', 'toque', 'carta', 'chefe', 'fase', 'crise', 'apagao', 'reliquia', 'cofre', 'passagem']);
  for (const T of Object.values(THROWABLES)) pedidos.add(T.som);
  const dir = new URL('../src/', import.meta.url);
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.js'))) {
    const src = readFileSync(new URL(f, dir), 'utf8');
    for (const m of src.matchAll(/(?:game|this)\.som\('([a-z_]+)'/g)) pedidos.add(m[1]);
    for (const m of src.matchAll(/sons\.tocar\('([a-z_]+)'/g)) pedidos.add(m[1]);
  }
  pedidos.delete(null);
  for (const id of pedidos) assert.ok(SONS[id], `o jogo pede '${id}', que não está em SONS`);
});

test('uma partida pede sons, e a fila tem teto (nos testes, ninguém esvazia)', () => {
  const g = new Game({ ...defaultSettings(), elenco: true, aberta: false }, { seed: 4 });
  g.player.hp = 1e9;
  for (let i = 0; i < 30 * 40; i++) {
    g.modal = null;
    g.update(1 / 30, { x: Math.sin(i / 40), y: -0.6 });
    g.player.hp = 1e9;
  }
  assert.ok(g.sons.length > 0, 'a partida não pediu nenhum som');
  assert.ok(g.sons.length <= 64);
  for (const s of g.sons) assert.ok(SONS[s.id] && Number.isFinite(s.x) && Number.isFinite(s.y), JSON.stringify(s));
});
