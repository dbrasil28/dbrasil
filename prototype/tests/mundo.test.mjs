// Mundo da rota: portão da escadaria, lajes com escada, pegar e arremessar objetos e a entrega no topo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { ROUTE, INTERACT } from '../src/config.js';
import { constrain, applyLevels, inside } from '../src/mundo.js';

const newGame = (extra = {}) => {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false, ...extra }, { seed: 4 });
  g.enemies.length = 0;
  return g;
};

test('a escadaria do morro fica fechada até o nível da meta e abre sozinha', () => {
  const g = newGame();
  const w = g.world;
  const probe = { x: (w.gate.x0 + w.gate.x1) / 2, y: w.orlaTop - 3, r: 0.3 };
  constrain(w, probe);
  assert.ok(probe.y >= w.orlaTop - 0.01, 'passou pelo portão fechado');
  g.player.level = ROUTE.orla.unlockLevel;
  g.updateRoute();
  assert.equal(w.gateOpen, true);
  const p2 = { x: probe.x, y: w.orlaTop - 3, r: 0.3 };
  constrain(w, p2);
  assert.ok(p2.y < w.orlaTop - 2, 'não deixou passar com o portão aberto');
});

test('quem está no chão não atravessa a laje; pela escada, sobe', () => {
  const g = newGame();
  const P = g.world.platforms.find((q) => q.kind === 'terraco');
  const e = { x: (P.x0 + P.x1) / 2, y: (P.y0 + P.y1) / 2, r: 0.3, plat: null, lvl: 0, z: 0 };
  applyLevels(g.world, e);
  assert.ok(!inside(P, e.x, e.y) || e.plat, 'ficou dentro da laje estando no chão');
  // pelo pé da escada, andando para cima, chega ao tampo
  const S = P.stair;
  const c = { x: (S.x0 + S.x1) / 2, y: S.y1 - 0.1, r: 0.3, plat: null, lvl: 0, z: 0 };
  for (let i = 0; i < 200; i++) {
    c.y -= 0.05;
    applyLevels(g.world, c);
  }
  assert.equal(c.plat, P);
  assert.equal(c.lvl, 1);
  assert.ok(c.z > P.h * 0.85);
});

test('o Juninho pega a cadeira do boteco sozinho e arremessa no inimigo mais perto', () => {
  const g = newGame();
  const slot = g.world.slots.find((s) => s.kind === 'cadeira' && !s.plat);
  g.player.x = slot.x + 0.3;
  g.player.y = slot.y;
  g.updateInteract(1 / 30);
  assert.equal(g.player.carry && g.player.carry.kind, 'cadeira');
  g.spawnEnemy('telespectador', g.player.x + 4, g.player.y);
  g.hash.clear();
  for (const e of g.enemies) g.hash.insert(e);
  g.updateInteract(INTERACT.holdS + 0.05);
  assert.equal(g.player.carry, null);
  assert.ok(g.projectiles.some((p) => p.kind === 'thrown' && p.obj === 'cadeira'));
});

test('no topo do morro, a entrega só vale no nível da meta', () => {
  const g = newGame({ trecho: 'morro' });
  const top = g.world.top;
  g.updateRoute();
  g.player.x = (top.x0 + top.x1) / 2;
  g.player.y = top.y0 + 1;
  g.player.y = g.world.orlaTop - 5; // passa pelo portão primeiro
  g.updateRoute();
  assert.equal(g.segment, 'morro');
  g.player.y = top.y0 + 1;
  g.updateRoute();
  assert.equal(g.delivered, false);
  g.player.level = ROUTE.morro.unlockLevel;
  g.updateRoute();
  assert.equal(g.delivered, true);
  assert.equal(g.over, 'victory');
});

test('habilidade exclusiva: o Picolé só aparece na Orla e o Mototáxi só no Morro', async () => {
  const { rollOptions } = await import('../src/upgrades.js');
  const { makeRng } = await import('../src/math.js');
  const rng = makeRng(9);
  const player = { weapons: [{ id: 'capacete', level: 1 }], passives: [] };
  const seen = { orla: new Set(), morro: new Set() };
  for (let i = 0; i < 300; i++) {
    for (const seg of ['orla', 'morro']) for (const o of rollOptions(player, rng, 3, seg)) seen[seg].add(o.id);
  }
  assert.ok(seen.orla.has('picole') && !seen.orla.has('mototaxi'));
  assert.ok(seen.morro.has('mototaxi') && !seen.morro.has('picole'));
});

test('cenário vivo: carros, barracas e lixo sem fechar a rota (dá para ir do começo à entrega)', () => {
  const g = newGame({ aberta: true });
  const w = g.world;
  const kinds = new Set(w.props.map((p) => p.kind));
  for (const k of ['carro', 'onibus', 'banco', 'lixeira', 'poste', 'placa', 'moto', 'caixa_dagua']) assert.ok(kinds.has(k), `faltou ${k}`);
  for (const k of ['acai', 'pastelaria', 'boteco']) assert.ok(w.places.filter((p) => p.kind === k).length >= 3, `poucos ${k}`);
  assert.ok(w.litter.length > 300, 'pouca sujeira no chão');
  // grade de 0,25 m: anda quem está numa área da rota e a mais de r de sólidos, lajes e escadas
  const r = 0.3;
  const cell = 0.25;
  const x0 = -26;
  const x1 = 22;
  const y0 = w.morroTop - 1;
  const y1 = w.orla.y1 + 1;
  const nx = Math.ceil((x1 - x0) / cell);
  const ny = Math.ceil((y1 - y0) / cell);
  const blocks = [...w.solids, ...w.platforms.flatMap((P) => [P, P.stair])];
  const ok = new Uint8Array(nx * ny);
  for (let j = 0; j < ny; j++) {
    const y = y0 + (j + 0.5) * cell;
    const near = blocks.filter((k) => y > k.y0 - r && y < k.y1 + r);
    for (let i = 0; i < nx; i++) {
      const x = x0 + (i + 0.5) * cell;
      if (!w.path.some((k) => inside(k, x, y))) continue;
      if (near.some((k) => x > k.x0 - r && x < k.x1 + r)) continue;
      ok[j * nx + i] = 1;
    }
  }
  const seen = new Uint8Array(nx * ny);
  const at = (x, y) => Math.floor((y - y0) / cell) * nx + Math.floor((x - x0) / cell);
  const start = at(0, 0);
  assert.equal(ok[start], 1, 'começo bloqueado');
  const q = [start];
  seen[start] = 1;
  while (q.length) {
    const c = q.pop();
    const i = c % nx;
    for (const n of [c - 1, c + 1, c - nx, c + nx]) {
      if (n < 0 || n >= ok.length || seen[n] || !ok[n]) continue;
      if ((n === c - 1 && i === 0) || (n === c + 1 && i === nx - 1)) continue;
      seen[n] = 1;
      q.push(n);
    }
  }
  const reach = (x, y, rad = 0.7) => {
    for (let dy = -rad; dy <= rad; dy += cell) for (let dx = -rad; dx <= rad; dx += cell) if (seen[at(x + dx, y + dy)]) return true;
    return false;
  };
  assert.ok(reach((w.top.x0 + w.top.x1) / 2, w.top.y0 + 2), 'não chega à laje da entrega');
  for (const s of w.slots) if (!s.plat) assert.ok(reach(s.x, s.y, 1.0), `objeto ${s.kind} fora de alcance em (${s.x.toFixed(1)}, ${s.y.toFixed(1)})`);
  for (const h of w.heals) if (!h.plat) assert.ok(reach(h.x, h.y, 0.6), `cura ${h.kind} fora de alcance em (${h.x.toFixed(1)}, ${h.y.toFixed(1)})`);
  for (const P of w.platforms) {
    const S = P.stair;
    assert.ok(reach((S.x0 + S.x1) / 2, S.dir === 'n' ? S.y1 + 0.4 : S.y0 - 0.4, 0.8), `pé da escada de ${P.kind} bloqueado`);
  }
});

test('açaí cura, deixa o Juninho mais rápido e volta depois, fora da tela', async () => {
  const { HEALS, ACAI_BUFF, HEAL_RESPAWN_S } = await import('../src/config.js');
  const g = newGame();
  const h = g.world.heals.find((k) => k.kind === 'acai');
  const pk = g.pickups.find((k) => k.src === h);
  assert.ok(pk);
  g.player.hp = 50;
  g.player.x = h.x;
  g.player.y = h.y;
  g.updatePickups(1 / 60);
  assert.equal(g.player.hp, 50 + HEALS.acai);
  assert.ok(g.player.acaiT > ACAI_BUFF.s - 0.1);
  assert.ok(h.emptyT > 0);
  g.pickups = g.pickups.filter((k) => !k.dead);
  g.player.x = 0;
  g.player.y = h.y > -100 ? -250 : 0; // longe e fora da tela
  g.camera.x = g.player.x;
  g.camera.y = g.player.y;
  g.updateInteract(HEAL_RESPAWN_S + 1);
  assert.ok(g.pickups.some((k) => k.src === h && !k.dead), 'o açaí não voltou');
});
