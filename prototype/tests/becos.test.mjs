// Becos do Morro (D92): a favela com bifurcações, becos sem saída com tesouro e atalhos, sem pular o portão do
// baile; a horda e o bot acham o caminho pela rede de vielas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { routeTarget, constrain, bloqueado } from '../src/mundo.js';
import { PLAYER, ROUTE, PREDIOS } from '../src/config.js';

const jogo = () => new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 3 });

test('becos (D92): cada pedaço que encosta em outro tem ligação, e os becos saem da rota principal', () => {
  const w = jogo().world;
  const P = w.path;
  for (let a = 1; a < P.length; a++) {
    for (let b = a + 1; b < P.length; b++) {
      const A = P[a];
      const B = P[b];
      const ox = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0);
      const oy = Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0);
      if (ox > 0.01 && oy > 0.01) assert.ok(w.adj[a].some((v) => v.to === b), `os pedaços ${a} e ${b} se encostam sem ligação`);
    }
  }
  const becos = P.filter((k) => k.principal === false);
  assert.equal(new Set(becos.map((k) => k.ramo)).size, ROUTE.morro.ramos.length);
  assert.ok(becos.some((k) => k.deitada), 'sem viela deitada (o morro não abriu para os lados)');
  assert.ok(P.some((k) => k.atalho), 'sem atalho');
  const xs = becos.flatMap((k) => [k.x0, k.x1]);
  const xsPrincipal = P.slice(2, w.topI + 1).flatMap((k) => [k.x0, k.x1]);
  assert.ok(Math.max(...xs) - Math.min(...xs) > Math.max(...xsPrincipal) - Math.min(...xsPrincipal) + 10, 'o morro não ficou mais largo');
});

test('becos (D92): nenhum atalho pula o portão do baile', () => {
  const w = jogo().world;
  // com o portão fechado, do pé do morro não se chega ao topo por nenhum beco
  const visto = new Set([2]);
  const fila = [2];
  while (fila.length) {
    const i = fila.shift();
    for (const { to } of w.adj[i]) {
      if (visto.has(to) || bloqueado(w, to)) continue;
      visto.add(to);
      fila.push(to);
    }
  }
  assert.ok(!visto.has(w.topI), 'dá para chegar ao topo sem passar pelo portão');
  assert.ok(visto.has(w.baileI), 'não se chega ao baile');
});

test('becos (D92): de dentro do beco sem saída, quem anda pela rota volta para a rota principal e sobe até o topo', () => {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: true }, { seed: 3 });
  const w = g.world;
  const fundo = w.path.find((k) => k.pracinha);
  const e = { x: (fundo.x0 + fundo.x1) / 2, y: (fundo.y0 + fundo.y1) / 2, r: PLAYER.radius, ri: w.path.indexOf(fundo), plat: null, lvl: 0, z: 0 };
  const goal = { x: (w.top.x0 + w.top.x1) / 2, y: w.top.y0 + 2 };
  const out = {};
  const step = (PLAYER.speed * 0.75) / 60;
  let i = 0;
  for (; i < 60000; i++) {
    routeTarget(w, e, goal.x, goal.y, w.topI, out);
    const dx = out.x - e.x;
    const dy = out.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    e.x += (dx / d) * step;
    e.y += (dy / d) * step;
    constrain(w, e);
    if (Math.hypot(goal.x - e.x, goal.y - e.y) < 0.5) break;
  }
  assert.ok(Math.hypot(goal.x - e.x, goal.y - e.y) < 0.5, `ficou preso em (${e.x.toFixed(2)}, ${e.y.toFixed(2)}), pedaço ${e.ri}`);
});

test('becos (D92): casas em volta dos becos sem entrar no chão, mureta ao sul das vielas deitadas e a placa na entrada', () => {
  const w = jogo().world;
  for (const k of w.path.filter((q) => q.principal === false && !q.deitada && !q.pracinha)) {
    const esq = w.casas.some((c) => Math.abs(c.x1 - k.x0) < 0.01 && c.y1 > k.y0 && c.y0 < k.y1);
    const dir = w.casas.some((c) => Math.abs(c.x0 - k.x1) < 0.01 && c.y1 > k.y0 && c.y0 < k.y1);
    assert.ok(esq && dir, `a viela do ${k.nome} sem casa dos lados`);
  }
  for (const k of w.path.filter((q) => q.deitada)) {
    assert.ok((w.muretas || []).some((m) => Math.abs(m.y - k.y1) < 0.01 && m.x1 > k.x0 && m.x0 < k.x1), `o ${k.nome} sem mureta`);
    // nada alto ao sul, colado na viela deitada (esconderia a viela)
    const colada = w.casas.filter((c) => c.y0 >= k.y1 - 0.01 && c.y0 < k.y1 + 3.9 && c.x1 > k.x0 + 0.1 && c.x0 < k.x1 - 0.1);
    assert.equal(colada.length, 0, `casa colada ao sul do ${k.nome}`);
  }
  for (const rm of ROUTE.morro.ramos) assert.ok(w.props.some((p) => p.kind === 'placa_parede' && p.text === rm.nome), `sem a placa do ${rm.nome}`);
});

test('favela: uma casa só em cada chão, e nenhum prédio da Orla desenhado por cima do Morro', () => {
  const w = jogo().world;
  // duas casas no mesmo chão = uma imagem colada por cima da outra (relato do autor)
  const C = w.casas;
  for (let i = 0; i < C.length; i++) {
    for (let j = i + 1; j < C.length; j++) {
      const a = C[i];
      const b = C[j];
      const sob = Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
      assert.ok(sob <= 0.05, `${a.peca} (${a.x0}, ${a.y1}) e ${b.peca} (${b.x0}, ${b.y1}) no mesmo chão: ${sob.toFixed(2)} m²`);
    }
  }
  // o prédio é desenhado por baixo de tudo: a imagem dele não pode entrar no chão de andar do Morro (o Juninho
  // andava por cima da fachada do prédio no Beco do Choro). Projeção do jogo: câmera de 55°, giro de 18°.
  const k = Math.sin((55 * Math.PI) / 180);
  const sh = Math.tan((18 * Math.PI) / 180);
  const tela = (x, y) => ({ x: x - sh * k * y, y: k * y });
  const rects = w.predios.map((pr) => {
    const M = PREDIOS.modelos[pr.img];
    const p = tela(pr.x0, pr.y1);
    const sx = p.x + (PREDIOS.x1 - pr.x0);
    const x0 = sx - M.canto[0] * pr.mpp;
    const y0 = p.y - M.canto[1] * pr.mpp;
    return { pr, x0, x1: x0 + M.w * pr.mpp, y0, y1: y0 + M.h * pr.mpp };
  });
  w.path.forEach((q, i) => {
    if (i < 1) return;
    for (let x = q.x0 + 0.25; x < q.x1; x += 0.5) {
      for (let y = q.y0 + 0.25; y < q.y1; y += 0.5) {
        const t = tela(x, y);
        const r = rects.find((r) => t.x > r.x0 && t.x < r.x1 && t.y > r.y0 && t.y < r.y1);
        assert.ok(!r, `o prédio ${r && r.pr.img} da Orla (y ${r && r.pr.y1.toFixed(1)}) cobre o chão do pedaço ${i} ${q.nome || q.kind} em (${x}, ${y})`);
      }
    }
  });
  // e nenhum sobe além do pé do Morro, onde ficam as casas da favela
  for (const r of rects) assert.ok(r.y0 >= k * w.orlaTop - 1e-6, `o prédio ${r.pr.img} (y ${r.pr.y1.toFixed(1)}) sobe por cima do Morro`);
});
