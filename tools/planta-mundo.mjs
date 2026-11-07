// Planta da rota vista de cima: monta o mundo do jogo (o mesmo de toda partida) e gera uma página com
// a Orla e a Subida do Morro na escala certa, cada objeto no lugar exato, por categoria.
// Uso: node tools/planta-mundo.mjs <saida.html>
import { writeFile } from 'node:fs/promises';
import { Game } from '../prototype/src/game.js';
import { defaultSettings } from '../prototype/src/settings.js';
import { MAPS, ROUTE, PLACES } from '../prototype/src/config.js';

const out = process.argv[2] || 'planta.html';
const g = new Game({ ...defaultSettings(), elenco: false, aberta: true }, { seed: 1 });
const w = g.world;
const m = MAPS.orla;
const r2 = (v) => Math.round(v * 100) / 100;
const box = (k) => [r2(k.x0), r2(k.y0), r2(k.x1), r2(k.y1)];

// categoria de cada tipo de objeto (a legenda e as cores da planta)
const CAT = {
  carro: 'veiculo', onibus: 'veiculo', camburao: 'veiculo', moto: 'veiculo',
  banca: 'comercio', milho: 'comercio', picole: 'comercio', mate: 'comercio',
  banco: 'rua', lixeira: 'rua', orelhao: 'rua', poste: 'rua', placa: 'rua', cone: 'rua', bandeirinhas: 'rua', fios: 'rua', placa_parede: 'rua',
  muro: 'muro', muro_v: 'muro', tapume: 'muro',
  coqueiro: 'praia', guarda_sol: 'praia', toalha: 'praia', isopor: 'praia', rede: 'praia', poste_rede: 'praia',
  caixa_dagua: 'morro', sinuca: 'morro', churrasqueira: 'morro', barricada: 'morro', tambor: 'morro', entulho: 'morro', pneus: 'morro', varal: 'morro', bandeira: 'morro',
  garota: 'gente', policial: 'gente',
};
const NOME = {
  carro: 'Carro parado', onibus: 'Ônibus parado', camburao: 'Camburão', moto: 'Moto', banca: 'Banca de jornal', milho: 'Carrinho de milho',
  picole: 'Carrinho de picolé', mate: 'Carrinho de mate', banco: 'Banco', lixeira: 'Lixeira', orelhao: 'Orelhão', poste: 'Poste com gato', placa: 'Placa',
  cone: 'Cone', bandeirinhas: 'Bandeirinhas (no alto)', fios: 'Gato de luz (no alto)', placa_parede: 'Placa na parede', muro: 'Muro pichado',
  muro_v: 'Muro pichado (vertical)', tapume: 'Tapume com cartazes', coqueiro: 'Coqueiro', guarda_sol: 'Guarda-sol', toalha: 'Toalha', isopor: 'Isopor',
  rede: 'Rede de futevôlei', poste_rede: 'Poste da rede', caixa_dagua: "Caixa d'água", sinuca: 'Sinuca', churrasqueira: 'Churrasqueira',
  barricada: 'Barricada', tambor: 'Tambor em chamas', entulho: 'Entulho', pneus: 'Pneus', varal: 'Varal', bandeira: 'Mastro com bandeira',
  garota: 'Garota de programa', policial: 'Policial', boteco: 'Boteco', acai: 'Açaí', pastelaria: 'Pastelaria', quiosque: 'Quiosque',
  predio: 'Prédio (terraço)', salva_vidas: 'Posto de salva-vidas', laje_casa: 'Casa com laje', terraco: 'Terraço', mesa: 'Mesa', cadeira: 'Cadeira',
  cadeira_praia: 'Cadeira de praia', engradado: 'Engradado', botijao: 'Botijão', banquinho: 'Banquinho', pneu: 'Pneu solto',
  coco: 'Coco', marmita: 'Marmita', pastel: 'Pastel', milho_cura: 'Milho', acai_cura: 'Açaí',
};

const data = {
  mapa: { minX: m.minX, avX0: m.avenidaX0, avX1: m.avenidaX1, sandX: m.sandX, maxX: m.maxX, seaX: m.seaX, blockLen: m.blockLen, streetLen: m.streetLen, blocks: ROUTE.orla.blocks },
  startX: ROUTE.orla.startX,
  orlaTop: r2(w.orlaTop), startY: ROUTE.orla.startY, morroTop: r2(w.morroTop),
  path: w.path.map((k, i) => ({ i, kind: i === 0 ? 'orla' : i === 1 ? 'escadaria_pe' : k.kind, b: box(k) })),
  gate: box(w.gate),
  joints: w.joints.map((j) => [r2(j.x), r2(j.y)]),
  plats: w.platforms.map((P) => ({ kind: P.kind, b: box(P), s: box(P.stair) })),
  places: w.places.filter((p) => p.x0 !== undefined).map((p) => ({ kind: p.kind, side: p.side || '', sign: p.sign || '', b: box(p), c: p.counter ? box(p.counter) : null })),
  props: w.props.map((p) => ({ kind: p.kind, cat: CAT[p.kind] || 'rua', solid: !!p.solid, b: box(p), t: p.text || '' })),
  slots: w.slots.filter((s) => !s.plat).map((s) => ({ kind: s.kind, x: r2(s.x), y: r2(s.y) })),
  heals: w.heals.filter((h) => !h.plat).map((h) => ({ kind: h.kind, x: r2(h.x), y: r2(h.y) })),
  ruas: Array.from({ length: ROUTE.orla.blocks + 2 }, (_, s) => r2(-m.blockLen * s + (m.blockLen - m.streetLen))),
  nome: NOME,
  sujeira: w.litter.length,
  terracoH: PLACES.terracoH,
};

const html = `<title>Planta da Rota</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Semi+Condensed:wght@500;600;700;800&family=IBM+Plex+Mono:wght@500&display=swap">
<style>
/* Planta de obra: papel de projeto, faixas da Orla em cor de chão real, objetos por categoria */
:root {
  --bg: #efe9dc; --panel: #f8f4ea; --ink: #1d1a18; --muted: #6b635a; --line: #d6ccba; --accent: #c8342b; --focus: #1f5fb0;
  --display: "Anton", "Arial Narrow", Impact, sans-serif;
  --body: "Barlow Semi Condensed", "Arial Narrow", system-ui, sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #17141a; --panel: #211d24; --ink: #f1ece2; --muted: #a59d93; --line: #3a3440; --accent: #ff5a4f; --focus: #7fb0ff; color-scheme: dark } }
:root[data-theme="dark"] { --bg: #17141a; --panel: #211d24; --ink: #f1ece2; --muted: #a59d93; --line: #3a3440; --accent: #ff5a4f; --focus: #7fb0ff; color-scheme: dark }
body { background: var(--bg); color: var(--ink); font-family: var(--body); font-size: 16px; line-height: 1.45;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 20px 48px; }
.wrap { max-width: 1180px; margin: 0 auto; display: grid; gap: 28px; }
header { display: grid; gap: 8px; }
h1 { font-family: var(--display); font-weight: 400; font-size: clamp(30px, 6vw, 52px); line-height: 1; letter-spacing: 0.01em; margin: 0; text-wrap: balance; }
h2 { font-family: var(--display); font-weight: 400; font-size: 24px; margin: 0; letter-spacing: 0.02em; text-wrap: balance; }
p { margin: 0; max-width: 70ch; }
.sub { color: var(--muted); }
.legend { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { display: inline-flex; align-items: center; gap: 8px; padding: 6px 10px; border: 1px solid var(--line); border-radius: 999px; background: var(--panel);
  color: var(--ink); font: 700 14px var(--body); cursor: pointer; }
.chip i { width: 14px; height: 14px; border-radius: 3px; border: 1px solid rgba(0,0,0,0.35); }
.chip b { font-family: var(--mono); font-weight: 500; font-size: 12px; color: var(--muted); }
.chip[aria-pressed="false"] { opacity: 0.4; }
.chip:focus-visible, button:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; align-items: start; }
.card { background: var(--panel); border: 1px solid var(--line); border-radius: 6px; padding: 14px; display: grid; gap: 10px; min-width: 0; }
.scroll { overflow-x: auto; }
canvas { display: block; max-width: none; touch-action: pan-x pan-y; }
.strip { display: grid; grid-template-columns: auto 1fr; gap: 20px; align-items: start; }
.strip .scroll { max-height: 78vh; overflow: auto; border: 1px solid var(--line); border-radius: 6px; background: #2b4f5c; }
.notes { display: grid; gap: 10px; min-width: 0; }
.notes h3 { margin: 0; font: 800 15px var(--body); text-transform: uppercase; letter-spacing: 0.06em; }
.notes ul { margin: 0; padding-left: 18px; display: grid; gap: 4px; }
.tip { position: fixed; z-index: 20; pointer-events: none; background: #141117; color: #ffd21f; font: 700 13px var(--body); padding: 4px 8px; border-radius: 4px; }
.scale { font: 500 12px var(--mono); color: var(--muted); }
@media (max-width: 760px) { .strip { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto !important; } }
</style>
<div class="wrap">
  <header>
    <h1>Planta da Rota</h1>
    <p class="sub">A Orla do Desespero e a Subida do Morro vistas de cima, na escala certa: cada objeto está onde o jogo põe hoje. Toque nas categorias para mostrar ou esconder; toque num objeto para ver o nome. Objetos sólidos (que bloqueiam) têm borda cheia; os de passar por cima, tracejada.</p>
  </header>
  <div class="legend" id="legend"></div>
  <section class="grid2">
    <div class="card"><h2>Um quarteirão da Orla</h2><p class="sub">Quarteirão 2 entre as duas ruas de carro que o cercam, do calçadão à areia. As faixas mostram como o cenário está organizado hoje.</p><div class="scroll"><canvas id="zoomOrla" aria-label="Planta de um quarteirão da Orla"></canvas></div><span class="scale" id="escalaOrla"></span></div>
    <div class="card"><h2>Um trecho do morro</h2><p class="sub">A primeira viela, a primeira laje e a viela de cima, com a passagem entre elas.</p><div class="scroll"><canvas id="zoomMorro" aria-label="Planta de um trecho do morro"></canvas></div><span class="scale" id="escalaMorro"></span></div>
  </section>
  <section class="strip">
    <div class="scroll" id="stripBox"><canvas id="strip" aria-label="Planta da rota inteira"></canvas></div>
    <div class="notes">
      <h2>A rota inteira</h2>
      <p class="sub">De baixo para cima: o começo da partida no pé da Orla, nove quarteirões com uma rua entre cada um, a escadaria do fim da Orla e a subida até a laje da entrega. Role dentro do mapa.</p>
      <h3>Como está organizado hoje</h3>
      <ul id="resumo"></ul>
      <h3>Faixas da Orla (da esquerda para o mar)</h3>
      <ul>
        <li><b>Prédios</b>, fora do caminho (hoje casas desenhadas; os prédios entram aqui).</li>
        <li><b>Calçadão, lado das lojas</b> (7 m): botecos, açaí, pastelaria, prédio com terraço, muro.</li>
        <li><b>Calçadão, meio</b> (8 m): barraca do meio, carrinho, tapume, orelhão, bancos e postes na beira da avenida, garotas na esquina.</li>
        <li><b>Avenida</b> (11 m, quatro faixas, dois sentidos): carros andando que atropelam o Juninho e a horda; faixa de pedestre em cada rua.</li>
        <li><b>Ciclovia</b> e <b>areia</b>: quiosque, salva-vidas, guarda-sóis, coqueiros, futevôlei. O <b>mar</b> vem depois da areia.</li>
        <li><b>Ruas transversais</b>: uma entre cada quarteirão, 8 m de largura, saindo dos prédios e terminando na avenida, com carros e ônibus parados nas duas mãos, buraco com cones e bandeirinhas.</li>
      </ul>
    </div>
  </section>
</div>
<div class="tip" id="tip" hidden></div>
<script>
const D = ${JSON.stringify(data)};
const CATS = {
  lugar: { nome: 'Lojas e lugares', cor: '#e07a1f' },
  veiculo: { nome: 'Veículos', cor: '#5f8fc8' },
  comercio: { nome: 'Carrinhos e bancas', cor: '#f2b632' },
  rua: { nome: 'Rua: bancos, postes, placas', cor: '#3aa597' },
  muro: { nome: 'Muros e tapumes', cor: '#a0603a' },
  praia: { nome: 'Praia', cor: '#e8d35a' },
  morro: { nome: 'Coisas do morro', cor: '#b07ad8' },
  gente: { nome: 'Gente parada', cor: '#ff5fa2' },
  objeto: { nome: 'Pega e arremessa', cor: '#ffffff' },
  cura: { nome: 'Curas', cor: '#3fdc6a' },
  laje: { nome: 'Lajes e escadas', cor: '#4a4038' },
};
const on = Object.fromEntries(Object.keys(CATS).map((k) => [k, true]));
const count = { lugar: D.places.length, objeto: D.slots.length, cura: D.heals.length, laje: D.plats.length };
for (const p of D.props) count[p.cat] = (count[p.cat] || 0) + 1;
const legend = document.getElementById('legend');
for (const [k, c] of Object.entries(CATS)) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'chip'; b.setAttribute('aria-pressed', 'true'); b.id = 'cat-' + k;
  b.innerHTML = '<i style="background:' + c.cor + '"></i>' + c.nome + ' <b>' + (count[k] || 0) + '</b>';
  b.addEventListener('click', () => { on[k] = !on[k]; b.setAttribute('aria-pressed', String(on[k])); drawAll(); });
  legend.appendChild(b);
}
const resumo = document.getElementById('resumo');
const kinds = {};
for (const p of D.props) kinds[p.kind] = (kinds[p.kind] || 0) + 1;
const linhas = [
  D.places.filter((p) => p.kind === 'boteco').length + ' botecos, ' + D.places.filter((p) => p.kind === 'acai').length + ' açaís e ' + D.places.filter((p) => p.kind === 'pastelaria').length + ' pastelarias',
  (kinds.carro || 0) + ' carros, ' + (kinds.onibus || 0) + ' ônibus, ' + (kinds.camburao || 0) + ' camburões e ' + (kinds.moto || 0) + ' motos',
  (kinds.poste || 0) + ' postes com gato, ' + (kinds.banco || 0) + ' bancos, ' + (kinds.lixeira || 0) + ' lixeiras, ' + (kinds.placa || 0) + ' placas',
  (kinds.muro || 0) + ' muros, ' + (kinds.muro_v || 0) + ' muros verticais, ' + (kinds.tapume || 0) + ' tapumes',
  (kinds.coqueiro || 0) + ' coqueiros, ' + (kinds.guarda_sol || 0) + ' guarda-sóis, ' + (kinds.rede || 0) + ' quadras de futevôlei',
  D.slots.length + ' objetos para arremessar, ' + D.heals.length + ' curas, ' + D.sujeira + ' manchas e lixo no chão',
];
for (const l of linhas) { const li = document.createElement('li'); li.textContent = l; resumo.appendChild(li); }

const GROUND = { orla: '#c9bca6', escadaria_pe: '#9c9488', viela: '#a39a8e', escadaria: '#bdb4a6', laje: '#cdb48a' };
const dpr = Math.min(window.devicePixelRatio || 1, 2);
const views = [];
function setup(id, x0, x1, y0, y1, ppm, escalaId) {
  const c = document.getElementById(id);
  const W = (x1 - x0) * ppm;
  const H = (y1 - y0) * ppm;
  c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
  c.style.width = W + 'px'; c.style.height = H + 'px';
  const v = { c, g: c.getContext('2d'), x0, x1, y0, y1, ppm, hits: [] };
  views.push(v);
  if (escalaId) document.getElementById(escalaId).textContent = 'Escala: 1 quadrado da grade = 2 m · ' + Math.round(x1 - x0) + ' m × ' + Math.round(y1 - y0) + ' m';
  return v;
}
function draw(v, opts = {}) {
  const { g, ppm } = v;
  const X = (x) => (x - v.x0) * ppm;
  const Y = (y) => (y - v.y0) * ppm;
  const R = (b) => [X(b[0]), Y(b[1]), (b[2] - b[0]) * ppm, (b[3] - b[1]) * ppm];
  v.hits = [];
  const ruasDesenhadas = [];
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  // fundo: casas do morro, depois o mar à direita
  g.fillStyle = '#4a3c34'; g.fillRect(0, 0, v.c.width, v.c.height);
  g.fillStyle = 'rgba(0,0,0,0.18)';
  for (let y = Math.floor(v.y0 / 3) * 3; y < v.y1; y += 3) for (let x = Math.floor(v.x0 / 3) * 3; x < v.x1; x += 3) if ((x + y) % 2 === 0) g.fillRect(X(x) + 1, Y(y) + 1, 3 * ppm - 2, 3 * ppm - 2);
  // Orla: calçadão, ciclovia, areia, mar
  const oy0 = Math.max(v.y0, D.orlaTop), oy1 = Math.min(v.y1, D.startY);
  if (oy1 > oy0) {
    const band = (a, b, cor) => { g.fillStyle = cor; g.fillRect(X(a), Y(oy0), (b - a) * ppm, (oy1 - oy0) * ppm); };
    band(D.mapa.minX - 2.5, D.mapa.minX, '#8d8478');
    band(D.mapa.minX, D.mapa.avX0, GROUND.orla);
    // avenida da praia: quatro faixas, dois sentidos
    band(D.mapa.avX0, D.mapa.avX1, '#26262b');
    g.strokeStyle = '#ffd21f'; g.lineWidth = Math.max(1.5, ppm * 0.12);
    for (const dx of [-0.12, 0.12]) { const x = X((D.mapa.avX0 + D.mapa.avX1) / 2 + dx); g.beginPath(); g.moveTo(x, Y(oy0)); g.lineTo(x, Y(oy1)); g.stroke(); }
    g.strokeStyle = 'rgba(241,236,226,0.7)'; g.setLineDash([ppm * 2, ppm * 2]); g.lineWidth = Math.max(1, ppm * 0.1);
    const mid = (D.mapa.avX0 + D.mapa.avX1) / 2;
    for (const x of [(D.mapa.avX0 + mid) / 2, (mid + D.mapa.avX1) / 2]) { g.beginPath(); g.moveTo(X(x), Y(oy0)); g.lineTo(X(x), Y(oy1)); g.stroke(); }
    g.setLineDash([]);
    band(D.mapa.sandX - 1.6, D.mapa.sandX, '#a3554b');
    band(D.mapa.sandX, D.mapa.seaX, '#e2cf9e');
    band(D.mapa.seaX, D.mapa.seaX + 30, '#2f6b80');
    g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(X(D.mapa.maxX), Y(oy0), (D.mapa.seaX - D.mapa.maxX) * ppm, (oy1 - oy0) * ppm); // areia fora do caminho
    if (opts.faixas) {
      const fx = [[D.mapa.minX, -7, 'lojas'], [-7, D.mapa.avX0, 'meio'], [D.mapa.sandX, D.mapa.maxX, 'areia']];
      fx.forEach(([a, b, nome], i) => {
        g.fillStyle = i % 2 ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)'; g.fillRect(X(a), Y(oy0), (b - a) * ppm, (oy1 - oy0) * ppm);

      });
    }
    // ruas de carro: asfalto atravessando o calçadão entre os quarteirões, meio-fio branco, faixa
    // amarela no meio e faixa de pedestre perto das lojas
    for (const ys of D.ruas) {
      const a = Math.max(ys, D.orlaTop), b = Math.min(ys + D.mapa.streetLen, D.startY);
      if (b <= a || b < v.y0 || a > v.y1) continue;
      const rx0 = X(D.mapa.minX - 2.5), rw = (D.mapa.avX0 - D.mapa.minX + 2.5) * ppm;
      g.fillStyle = '#26262b'; g.fillRect(rx0, Y(a), rw, (b - a) * ppm);
      g.fillStyle = '#f1ece2'; g.fillRect(rx0, Y(a), rw, Math.max(2, ppm * 0.25)); g.fillRect(rx0, Y(b) - Math.max(2, ppm * 0.25), rw, Math.max(2, ppm * 0.25));
      g.strokeStyle = '#ffd21f'; g.setLineDash([ppm * 1.6, ppm * 1.2]); g.lineWidth = Math.max(1.5, ppm * 0.15);
      g.beginPath(); g.moveTo(rx0, Y(ys + 4)); g.lineTo(rx0 + rw, Y(ys + 4)); g.stroke(); g.setLineDash([]);
      g.fillStyle = 'rgba(241,236,226,0.85)';
      for (let x = D.mapa.avX0 - 3.4; x < D.mapa.avX0 - 0.3; x += 0.9) g.fillRect(X(x), Y(Math.max(a, ys + 1)), 0.5 * ppm, (Math.min(b, ys + 7) - Math.max(a, ys + 1)) * ppm);
      for (let y = ys + 1.2; y < ys + 4.6; y += 0.9) if (y > v.y0 && y < v.y1) g.fillRect(X(D.mapa.avX0 + 0.3), Y(y), (D.mapa.avX1 - D.mapa.avX0 - 0.6) * ppm, 0.5 * ppm);
      ruasDesenhadas.push(ys);
    }
  }
  // morro: pedaços da rota
  for (const k of D.path) {
    if (k.i === 0) continue;
    const [x, y, ww, hh] = R(k.b);
    g.fillStyle = GROUND[k.kind] || '#a39a8e'; g.fillRect(x, y, ww, hh);
    if (k.kind === 'escadaria' || k.kind === 'escadaria_pe') { g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 1; for (let yy = k.b[1]; yy < k.b[3]; yy += 0.6) { g.beginPath(); g.moveTo(x, Y(yy)); g.lineTo(x + ww, Y(yy)); g.stroke(); } }
  }
  // grade de 2 m
  g.strokeStyle = 'rgba(0,0,0,0.07)'; g.lineWidth = 1;
  for (let x = Math.ceil(v.x0 / 2) * 2; x < v.x1; x += 2) { g.beginPath(); g.moveTo(X(x), 0); g.lineTo(X(x), v.c.height); g.stroke(); }
  for (let y = Math.ceil(v.y0 / 2) * 2; y < v.y1; y += 2) { g.beginPath(); g.moveTo(0, Y(y)); g.lineTo(v.c.width, Y(y)); g.stroke(); }
  const shape = (b, cat, solid, kind, label) => {
    if (b[2] < v.x0 || b[0] > v.x1 || b[3] < v.y0 || b[1] > v.y1) return;
    const [x, y, ww, hh] = R(b);
    const cor = CATS[cat].cor;
    const mw = Math.max(ww, 3), mh = Math.max(hh, 3);
    g.globalAlpha = solid ? 0.92 : 0.55; g.fillStyle = cor; g.fillRect(x, y, mw, mh); g.globalAlpha = 1;
    g.strokeStyle = 'rgba(20,16,14,0.85)'; g.lineWidth = 1; if (!solid) g.setLineDash([3, 2]);
    g.strokeRect(x + 0.5, y + 0.5, mw - 1, mh - 1); g.setLineDash([]);
    v.hits.push({ x, y, w: mw, h: mh, t: label || D.nome[kind] || kind });
  };
  // lajes, lugares, objetos de cenário, objetos soltos, curas
  if (on.laje) for (const P of D.plats) { shape(P.b, 'laje', true, P.kind); shape(P.s, 'laje', false, 'escada', 'Escada de ' + (D.nome[P.kind] || P.kind).toLowerCase()); }
  if (on.lugar) for (const p of D.places) {
    if (p.b[2] < v.x0 || p.b[0] > v.x1 || p.b[3] < v.y0 || p.b[1] > v.y1) continue;
    const [x, y, ww, hh] = R(p.b);
    g.strokeStyle = CATS.lugar.cor; g.lineWidth = 2; g.setLineDash([5, 3]); g.strokeRect(x, y, ww, hh); g.setLineDash([]);
    if (p.c) shape(p.c, 'lugar', true, p.kind, (D.nome[p.kind] || p.kind) + (p.sign ? ' · ' + p.sign : ''));
    v.hits.push({ x, y, w: ww, h: hh, t: (D.nome[p.kind] || p.kind) + (p.sign ? ' · ' + p.sign : '') });
  }
  for (const p of D.props) if (on[p.cat]) shape(p.b, p.cat, p.solid, p.kind, D.nome[p.kind] + (p.t ? ' · ' + p.t : ''));
  if (on.objeto) for (const s of D.slots) {
    if (s.x < v.x0 || s.x > v.x1 || s.y < v.y0 || s.y > v.y1) continue;
    g.fillStyle = '#ffffff'; g.strokeStyle = '#141117'; g.lineWidth = 1.5;
    g.beginPath(); g.arc(X(s.x), Y(s.y), Math.max(2.5, ppm * 0.28), 0, Math.PI * 2); g.fill(); g.stroke();
    v.hits.push({ x: X(s.x) - 5, y: Y(s.y) - 5, w: 10, h: 10, t: (D.nome[s.kind] || s.kind) + ' (pega e arremessa)' });
  }
  if (on.cura) for (const h of D.heals) {
    if (h.x < v.x0 || h.x > v.x1 || h.y < v.y0 || h.y > v.y1) continue;
    const s = Math.max(4, ppm * 0.35); g.fillStyle = '#3fdc6a';
    g.fillRect(X(h.x) - s, Y(h.y) - s / 3, s * 2, s * 0.66); g.fillRect(X(h.x) - s / 3, Y(h.y) - s, s * 0.66, s * 2);
    v.hits.push({ x: X(h.x) - s, y: Y(h.y) - s, w: s * 2, h: s * 2, t: 'Cura: ' + (D.nome[h.kind] || h.kind) });
  }
  // tapume do fim da orla, começo e entrega
  const lbl = (x, y, t, cor) => { g.font = '800 ' + Math.max(11, Math.min(16, ppm * 1.4)) + 'px ' + getComputedStyle(document.body).fontFamily; g.textAlign = 'center';
    g.lineWidth = 4; g.strokeStyle = '#141117'; g.strokeText(t, X(x), Y(y)); g.fillStyle = cor; g.fillText(t, X(x), Y(y)); };
  if (0 > v.y0 && 0 < v.y1) { g.fillStyle = '#ff2d3d'; g.beginPath(); g.arc(X(D.startX), Y(0), Math.max(5, ppm * 0.5), 0, Math.PI * 2); g.fill(); lbl(D.startX, 3, 'COMEÇO', '#ff2d3d'); }
  const top = D.path[D.path.length - 1];
  if (top.b[1] > v.y0 - 5 && top.b[1] < v.y1) lbl((top.b[0] + top.b[2]) / 2, top.b[1] + 4, 'ENTREGA', '#ffd21f');
  if (D.orlaTop > v.y0 && D.orlaTop < v.y1) lbl((D.gate[0] + D.gate[2]) / 2, D.orlaTop + 2.5, 'ESCADARIA', '#ffd21f');
  // nome de cada rua, no meio do asfalto
  for (const ys of ruasDesenhadas) {
    const perto = D.props.filter((p) => p.kind === 'placa' && /^(R\.|AV\.|TRAV\.)/.test(p.t) && Math.abs(p.b[1] - (ys + 4)) < 7);
    const placa = perto.sort((p, q) => Math.abs(p.b[1] - ys - 4) - Math.abs(q.b[1] - ys - 4))[0];
    const nome = placa ? placa.t : 'RUA';
    lbl((D.mapa.minX + D.mapa.avX0) / 2, Math.min(ys + 5.2, D.startY - 0.5), nome, '#ffd21f');
  }
  if (opts.faixas) {
    // nome de cada faixa logo abaixo da rua de cima do quarteirão
    const yl = Math.ceil(v.y0 / D.mapa.blockLen) * D.mapa.blockLen + 2.2;
    for (const [a, b, nome] of [[D.mapa.minX, -7, 'LOJAS'], [-7, D.mapa.avX0, 'MEIO'], [D.mapa.avX0, D.mapa.avX1, 'AVENIDA'], [D.mapa.sandX, D.mapa.maxX, 'AREIA']]) lbl((a + b) / 2, yl, nome, '#ffd21f');
  }
  if (opts.quarteiroes) {
    for (let b = 0; b <= D.mapa.blocks; b++) { const y = -D.mapa.blockLen * b + 20; lbl(D.mapa.minX - 6, y, 'Q' + b, '#f1ece2'); }
    D.path.forEach((k) => { if (k.i < 2) return; lbl(k.b[0] - 3.5, (k.b[1] + k.b[3]) / 2, k === top ? 'TOPO' : k.kind.toUpperCase(), '#f1ece2'); });
  }
}
const vo = setup('zoomOrla', D.mapa.minX - 3, D.mapa.seaX + 1, -2 * D.mapa.blockLen - 8.5, -2 * D.mapa.blockLen + 48.5, 11, 'escalaOrla');
const p2 = D.path[2], p3 = D.path[3], p4 = D.path[4];
const vm = setup('zoomMorro', Math.min(p2.b[0], p3.b[0], p4.b[0]) - 3, Math.max(p2.b[2], p3.b[2], p4.b[2]) + 3, p4.b[3] - 14, p2.b[1] + 12, 11, 'escalaMorro');
const xs = D.path.flatMap((k) => [k.b[0], k.b[2]]);
const vs = setup('strip', Math.min(D.mapa.minX - 9, ...xs) - 1, D.mapa.seaX + 3, D.morroTop - 4, D.startY + 2, 6.2);
function drawAll() { draw(vo, { faixas: true }); draw(vm); draw(vs, { quarteiroes: true }); }
drawAll();
// começa mostrando o pé da Orla (o começo da partida fica embaixo)
const box = document.getElementById('stripBox');
requestAnimationFrame(() => { box.scrollTop = box.scrollHeight; });
const tip = document.getElementById('tip');
for (const v of views) {
  const show = (ev) => {
    const r = v.c.getBoundingClientRect();
    const x = ev.clientX - r.left, y = ev.clientY - r.top;
    let hit = null;
    for (let i = v.hits.length - 1; i >= 0; i--) { const h = v.hits[i]; if (x >= h.x - 2 && x <= h.x + h.w + 2 && y >= h.y - 2 && y <= h.y + h.h + 2) { hit = h; break; } }
    if (!hit) { tip.hidden = true; return; }
    tip.textContent = hit.t; tip.hidden = false;
    tip.style.left = Math.min(window.innerWidth - 220, ev.clientX + 12) + 'px'; tip.style.top = (ev.clientY + 14) + 'px';
  };
  v.c.addEventListener('pointermove', show);
  v.c.addEventListener('pointerdown', show);
  v.c.addEventListener('pointerleave', () => { tip.hidden = true; });
}
</script>
`;
await writeFile(out, html);
console.log(`ok ${out}: ${data.props.length} objetos de cenário, ${data.places.length} lugares, ${data.slots.length} objetos soltos, ${data.heals.length} curas`);
