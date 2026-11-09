// Os módulos do jogo não podem se importar em círculo: o arquivo único da página de teste
// (tools/build-single.mjs) roda um módulo de cada vez, e no círculo um deles roda antes do outro existir.
// Foi o que deixou a página preta no D91 (figurantes → baile → cenario → figurantes).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src');

test('nenhum módulo do jogo se importa em círculo (a página de teste ficaria preta)', () => {
  const deps = {};
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.js'))) {
    const s = readFileSync(path.join(dir, f), 'utf8');
    deps[f] = [...s.matchAll(/^import[^'"]*['"]\.\/([^'"]+)['"]/gm)].map((m) => m[1]);
  }
  const ciclos = [];
  const estado = {};
  const pilha = [];
  const dfs = (u) => {
    estado[u] = 1;
    pilha.push(u);
    for (const v of deps[u] || []) {
      if (estado[v] === 1) ciclos.push([...pilha.slice(pilha.indexOf(v)), v].join(' → '));
      else if (!estado[v]) dfs(v);
    }
    pilha.pop();
    estado[u] = 2;
  };
  for (const f of Object.keys(deps)) if (!estado[f]) dfs(f);
  assert.deepEqual(ciclos, [], `módulos em círculo:\n${ciclos.join('\n')}`);
});
