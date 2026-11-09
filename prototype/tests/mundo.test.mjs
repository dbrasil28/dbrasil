// Mundo da rota: portão da escadaria, lajes com escada, pegar e arremessar objetos e a entrega no topo.
import { centroDaArena } from '../src/chegada.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { INTERACT, CARREIRA, LAJE, ENEMIES } from '../src/config.js';
import { constrain, applyLevels, inside } from '../src/mundo.js';

const newGame = (extra = {}) => {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false, ...extra }, { seed: 4 });
  g.enemies.length = 0;
  g.eventIndex = 99; // sem propostas de Corrupção no meio do teste
  return g;
};

const parado = { x: 0, y: 0 };

test('a escadaria do morro fica fechada até o Monstrão cair; ele mora na obra e sai quando o Caos chama', () => {
  const g = newGame();
  const w = g.world;
  const probe = { x: (w.gate.x0 + w.gate.x1) / 2, y: w.orlaTop - 3, r: 0.3 };
  constrain(w, probe);
  assert.ok(probe.y >= w.orlaTop - 0.01, 'passou pelo portão fechado');
  g.player.level = 30; // nível não abre mais nada (D39)
  g.update(1 / 30, parado);
  assert.equal(w.gateOpen, false);
  assert.ok(!w.solids.some((k) => k.kind === 'obra'), 'a obra saiu do mapa (D84): nada de tapume no terreno do covil');
  // o Caos chega a 100%: o covil abre, mas o chefão só sai com o Juninho perto
  g.trechoT0 = g.t - CARREIRA.caosTempoS;
  g.update(1 / 30, parado);
  assert.equal(g.caos, 100);
  assert.ok(g.covil.aberto, 'o covil não abriu em 100%');
  assert.equal(g.boss, null, 'o chefão saiu sem o Juninho por perto');
  // com o Juninho na arena da frente da obra, o Monstrão chega pela avenida (D82)
  const arena = centroDaArena(g);
  g.player.x = arena.x + 2;
  g.player.y = arena.y + 3;
  g.update(1 / 30, parado);
  assert.ok(g.boss && g.boss.type === 'monstrao', 'o Monstrão não chegou com o Juninho na arena');
  // fases: com 60% da vida, muda de fase e chama a assessoria
  const antes = g.enemies.filter((e) => !e.dead).length;
  g.damageEnemy(g.boss, g.boss.maxHp * 0.4, 'teste');
  assert.equal(g.boss.fase, 1);
  const assessoria = CARREIRA.chefaoHorda.faseHorda + ENEMIES.monstrao.fases.reforco[1].length; // com o Monstrão, menos horda e Ratos (D75)
  assert.ok(g.enemies.filter((e) => !e.dead).length >= antes + assessoria, 'a assessoria não chegou');
  assert.ok(g.enemies.filter((e) => !e.dead && e.type === 'rato').length >= ENEMIES.monstrao.fases.reforco[1].length, 'os Ratos não vieram');
  g.damageEnemy(g.boss, 1e9, 'teste');
  assert.equal(g.boss, null);
  assert.equal(g.over, null, 'derrubar o chefão não acaba a partida: falta atravessar');
  assert.equal(w.gateOpen, true, 'a escadaria não abriu');
  g.update(1 / 30, parado);
  assert.equal(g.caos, 0, 'o Caos não zerou');
  const p2 = { x: probe.x, y: w.orlaTop - 3, r: 0.3 };
  constrain(w, p2);
  assert.ok(p2.y < w.orlaTop - 2, 'não deixou passar com o portão aberto');
});

test('ao passar pela escadaria, o Juninho recomeça do nível 1 só com o Capacete', () => {
  const g = newGame();
  const w = g.world;
  w.gateOpen = true;
  g.player.level = 12;
  g.player.weapons.push({ id: 'chinelo', level: 3, cd: 0 });
  g.player.passives.push({ id: 'tenis', level: 2 });
  g.caosAbates = 500;
  g.player.x = (w.gate.x0 + w.gate.x1) / 2;
  g.player.y = w.orlaTop - 2;
  g.updateRoute();
  assert.equal(g.segment, 'morro');
  assert.equal(g.player.level, 1);
  assert.deepEqual(g.player.weapons.map((x) => x.id), ['capacete']);
  assert.equal(g.player.passives.length, 0);
  g.update(1 / 30, parado);
  assert.ok(g.caos < 1, `o Caos do Morro não recomeçou: ${g.caos}`);
  assert.equal(g.covil.trecho, 'morro');
});

test('quem está no chão não atravessa a laje; pela escada, sobe', () => {
  const g = newGame();
  const P = g.world.platforms.find((q) => q.kind === 'laje_casa');
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

test('no topo do morro: o Chefe do Tráfico sai quando o Caos chama, e a entrega só vale com ele no chão', () => {
  const g = newGame({ trecho: 'morro' });
  const top = g.world.top;
  g.update(1 / 30, parado); // passa pela escadaria: começa o trecho do Morro
  assert.equal(g.segment, 'morro');
  g.player.x = (top.x0 + top.x1) / 2;
  g.player.y = top.y0 + 1;
  g.update(1 / 30, parado);
  assert.equal(g.chefe, null, 'o chefe saiu antes do Caos chamar');
  assert.equal(g.delivered, false);
  g.trechoT0 = g.t - CARREIRA.caosTempoS;
  g.update(1 / 30, parado);
  assert.ok(g.chefe && g.chefe.type === 'chefe_trafico', 'o chefe não apareceu no topo');
  g.update(1 / 30, parado);
  assert.equal(g.delivered, false, 'entregou com o chefe de pé');
  g.damageEnemy(g.chefe, 1e9, 'teste');
  assert.equal(g.chefe, null);
  assert.equal(g.over, null, 'derrubar o chefe não acaba a partida: falta entregar');
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
  // grade de 0,2 m com o corpo de verdade do Juninho: só anda onde o jogo deixa ficar (área da rota ou
  // passagem entre pedaços, encolhida pelo raio) e longe de sólidos, casas com laje e escadas
  const r = 0.35 + 0.1;
  const cell = 0.2;
  const x0 = -26;
  const x1 = 22;
  const y0 = w.morroTop - 1;
  const y1 = w.orla.y1 + 1;
  const nx = Math.ceil((x1 - x0) / cell);
  const ny = Math.ceil((y1 - y0) / cell);
  const blocks = [...w.solids, ...w.platforms.flatMap((P) => [P, P.stair])];
  const areas = [...w.path, ...w.corridors];
  const ok = new Uint8Array(nx * ny);
  for (let j = 0; j < ny; j++) {
    const y = y0 + (j + 0.5) * cell;
    const near = blocks.filter((k) => y > k.y0 - r && y < k.y1 + r);
    const rows = areas.filter((k) => y >= k.y0 + 0.35 && y <= k.y1 - 0.35);
    for (let i = 0; i < nx; i++) {
      const x = x0 + (i + 0.5) * cell;
      if (!rows.some((k) => x >= k.x0 + 0.35 && x <= k.x1 - 0.35)) continue;
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

test('andando de verdade (passos curtos), o Juninho atravessa todas as emendas da rota até a entrega', async () => {
  const { routeTarget } = await import('../src/mundo.js');
  const { PLAYER } = await import('../src/config.js');
  const g = newGame({ aberta: true });
  const w = g.world;
  const e = { x: (w.gate.x0 + w.gate.x1) / 2, y: w.orlaTop + 8, r: PLAYER.radius, ri: 0, plat: null, lvl: 0, z: 0 };
  const goal = { x: (w.top.x0 + w.top.x1) / 2, y: w.top.y0 + 2 };
  const out = {};
  const step = (PLAYER.speed * 0.75) / 60; // escadaria, 60 quadros por segundo
  let i = 0;
  for (; i < 40000; i++) {
    routeTarget(w, e, goal.x, goal.y, w.path.length - 1, out);
    const dx = out.x - e.x;
    const dy = out.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    e.x += (dx / d) * step;
    e.y += (dy / d) * step;
    constrain(w, e);
    if (Math.hypot(goal.x - e.x, goal.y - e.y) < 0.5) break;
  }
  assert.ok(Math.hypot(goal.x - e.x, goal.y - e.y) < 0.5, `ficou preso em (${e.x.toFixed(2)}, ${e.y.toFixed(2)}), pedaço ${e.ri}`);
  // subindo reto pelo meio da escadaria, como no joystick
  const s2 = { x: (w.gate.x0 + w.gate.x1) / 2, y: w.orlaTop + 3, r: PLAYER.radius, ri: 0 };
  for (let k = 0; k < 900; k++) {
    s2.y -= step;
    constrain(w, s2);
  }
  assert.ok(s2.y < w.orlaTop - 6, `subindo reto travou em y ${s2.y.toFixed(2)}`);
  // e com a escadaria fechada não passa do fim da Orla
  const g2 = newGame();
  const f = { x: (g2.world.gate.x0 + g2.world.gate.x1) / 2, y: g2.world.orlaTop + 3, r: PLAYER.radius, ri: 0 };
  for (let k = 0; k < 600; k++) {
    f.y -= step;
    constrain(g2.world, f);
  }
  assert.ok(f.y > g2.world.orlaTop, 'passou pelo tapume fechado');
});

test('favela: casas dos dois lados de cada pedaço do Morro, sem entrar no chão do caminho', () => {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 3 });
  const w = g.world;
  assert.ok(w.casas && w.casas.length > 40, 'poucas casas');
  for (const c of w.casas) {
    for (let a = 0.1; a < 1; a += 0.2) {
      for (let b = 0.1; b < 1; b += 0.2) {
        const x = c.x0 + (c.x1 - c.x0) * a;
        const y = c.y0 + (c.y1 - c.y0) * b;
        const dentro = w.path.some((r) => r.kind !== 'orla' && x > r.x0 + 0.1 && x < r.x1 - 0.1 && y > r.y0 + 0.1 && y < r.y1 - 0.1);
        assert.ok(!dentro, `${c.peca} em (${x.toFixed(1)}, ${y.toFixed(1)}) entra no caminho`);
      }
    }
  }
  w.path.slice(1).forEach((k, i) => {
    const esq = w.casas.filter((c) => Math.abs(c.x1 - k.x0) < 0.01 && c.y1 > k.y0 && c.y0 < k.y1);
    const dir = w.casas.filter((c) => Math.abs(c.x0 - k.x1) < 0.01 && c.y1 > k.y0 && c.y0 < k.y1);
    assert.ok(esq.length, `pedaço ${i + 1} sem casa à esquerda`);
    assert.ok(dir.length, `pedaço ${i + 1} sem casa à direita`);
    // a oeste do caminho a casa fica atrás de quem anda; a leste entra na ordem pela frente e é baixa,
    // para não esconder a viela atrás dela
    assert.ok(esq.every((c) => c.lado === 'fundo'));
    assert.ok(dir.every((c) => c.lado === 'frente' && c.h <= 3.5), `casa alta à direita no pedaço ${i + 1}`);
  });
  // lados variados: a mesma peça não aparece duas vezes seguidas no mesmo lado
  const pecas = new Set(w.casas.map((c) => c.peca));
  assert.ok(pecas.size >= 7, 'pouca variedade de casas');
});

test('laje: com o Juninho lá em cima, a horda cerca a casa e só uns poucos sobem pela escada', () => {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 5, meta: { trecho: 'morro' } });
  const P = g.world.platforms.find((q) => q.kind === 'laje_casa');
  const p = g.player;
  p.x = (P.x0 + P.x1) / 2;
  p.y = (P.y0 + P.y1) / 2;
  p.plat = P;
  p.lvl = 1;
  p.z = P.h;
  g.enemies.length = 0;
  g.spawnAcc = -1e9;
  g.eventIndex = 99;
  p.xpNext = 1e9;
  p.weapons.length = 0;
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    g.spawnEnemy('telespectador', p.x + Math.cos(a) * 7, p.y + Math.sin(a) * 7);
  }
  let maxEmCima = 0;
  for (let i = 0; i < 30 * 15; i++) {
    g.update(1 / 30, { x: 0, y: 0 });
    p.hp = Math.max(p.hp, 50);
    maxEmCima = Math.max(maxEmCima, g.enemies.filter((e) => !e.dead && e.plat === P).length);
  }
  const S = P.stair;
  const bx0 = Math.min(P.x0, S.x0);
  const bx1 = Math.max(P.x1, S.x1);
  const by0 = Math.min(P.y0, S.y0);
  const by1 = Math.max(P.y1, S.y1);
  const vivos = g.enemies.filter((e) => !e.dead && !e.plat);
  const colados = vivos.filter((e) => Math.hypot(Math.max(bx0 - e.x, 0, e.x - bx1), Math.max(by0 - e.y, 0, e.y - by1)) < 1.5);
  assert.ok(colados.length >= vivos.length * 0.8, `só ${colados.length} de ${vivos.length} cercando a casa`);
  assert.ok(maxEmCima <= LAJE.maxSubindo + 1, `${maxEmCima} subiram ao mesmo tempo`);
  assert.ok(vivos.every((e) => !(e.x > P.x0 + 0.1 && e.x < P.x1 - 0.1 && e.y > P.y0 + 0.1 && e.y < P.y1 - 0.1)), 'inimigo do chão dentro da casa');
});

test('laje: com o Juninho no chão, quem está na escada desce e sai dela, sem ficar tremendo', () => {
  // ao lado e atrás da casa: antes, o alvo era o pé da escada (dentro dela) e quem ia para trás da casa
  // entrava na escada, era mandado descer e entrava de novo
  // (dx, dy) a partir do pé da escada (S.y1): abaixo e à esquerda, à esquerda da casa, e atrás dela
  for (const [dx, dy] of [[-5, 4], [-7, -1], [0, -11.2]]) {
    const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 5, meta: { trecho: 'morro' } });
    const P = g.world.platforms.find((q) => q.kind === 'laje_casa');
    const S = P.stair;
    const p = g.player;
    g.update(1 / 30, { x: 0, y: 0 });
    g.enemies.length = 0;
    g.spawnAcc = -1e9;
    g.eventIndex = 99;
    p.xpNext = 1e9;
    p.weapons.length = 0; // ninguém morre: o teste é de andar
    p.x = (S.x0 + S.x1) / 2 + dx;
    p.y = S.y1 + dy;
    p.plat = null;
    p.lvl = 0;
    p.z = 0;
    g.clampToMap(p);
    assert.ok(!inside(P, p.x, p.y) && !inside(S, p.x, p.y), 'o Juninho ficou dentro da casa');
    const naEscada = [];
    for (let i = 0; i < 3; i++) {
      const e = g.spawnEnemy('telespectador', (S.x0 + S.x1) / 2, S.y0 + (S.y1 - S.y0) * (0.35 + i * 0.15));
      e.plat = P;
      e.lvl = 0;
      e.z = P.h * 0.5;
      naEscada.push(e);
    }
    const ult = naEscada.map((e) => ({ x: e.x, y: e.y, vx: 0, vy: 0, volta: 0 }));
    for (let i = 0; i < 30 * 6; i++) {
      g.update(1 / 30, { x: 0, y: 0 });
      p.hp = Math.max(p.hp, 50);
      naEscada.forEach((e, k) => {
        const u = ult[k];
        const vx = e.x - u.x;
        const vy = e.y - u.y;
        // colado no Juninho, empurrando para atacar, é normal ir e voltar: conta só longe dele
        const longe = Math.hypot(e.x - p.x, e.y - p.y) > 1.5;
        if (longe && Math.hypot(vx, vy) > 0.002 && vx * u.vx + vy * u.vy < 0) u.volta++;
        Object.assign(u, { x: e.x, y: e.y, vx, vy });
      });
    }
    const presos = naEscada.filter((e) => e.plat || inside(S, e.x, e.y));
    assert.equal(presos.length, 0, `Juninho em (${dx}, ${dy}): ${presos.length} continuaram na escada`);
    assert.ok(ult.every((u) => u.volta < 20), `Juninho em (${dx}, ${dy}): vai e volta ${ult.map((u) => u.volta)}`);
  }
});
