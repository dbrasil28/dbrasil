// Gera a arte pintada do cenário da Orla com o ateliê em canvas (tools/arte/pintor-orla.js).
// Uso: node tools/arte/gerar-cenario.cjs   (precisa do Playwright com Chromium)
// Saída: docs/arte/cenario_orla/<tipo>_<variação>.png (PNG transparente, 128 px/m, mestre),
//        prototype/assets/cenario/orla/<tipo>_<variação>.webp (versão leve usada no jogo)
//        e docs/arte/cenario_orla/prancha.png (todos juntos, para ver).
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..', '..');
const outPng = path.join(root, 'docs', 'arte', 'cenario_orla');
const outWebp = path.join(root, 'prototype', 'assets', 'cenario', 'orla');

const PAGE = `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#2a2622">
<script type="module">
import { paintAll } from '/tools/arte/pintor-orla.js';
import { ART, ART_S } from '/prototype/src/arte_cenario.js';
window.run = async () => {
  await document.fonts.ready;
  const list = paintAll();
  // prancha: todos os objetos lado a lado sobre o chão de pedra portuguesa escurecido
  const cols = 4;
  const cellW = 760;
  const rows = [];
  for (let i = 0; i < list.length; i += cols) rows.push(list.slice(i, i + cols));
  const heights = rows.map((r) => Math.max(...r.map((o) => o.canvas.height * Math.min(1, cellW / o.canvas.width))) + 46);
  const sheet = document.createElement('canvas');
  sheet.width = cols * cellW;
  sheet.height = heights.reduce((a, b) => a + b, 0) + 70;
  const g = sheet.getContext('2d');
  g.fillStyle = '#3b332c';
  g.fillRect(0, 0, sheet.width, sheet.height);
  g.fillStyle = '#ffd21f';
  g.font = '900 40px "Inter Display", Inter, sans-serif';
  g.fillText('CENÁRIO DA ORLA · pintado em canvas · PNG transparente, 128 px por metro, câmera a 55°', 24, 48);
  let y = 70;
  rows.forEach((r, ri) => {
    r.forEach((o, ci) => {
      const k = Math.min(1, cellW / o.canvas.width);
      const w = o.canvas.width * k;
      const h = o.canvas.height * k;
      const x = ci * cellW + (cellW - w) / 2;
      g.fillStyle = 'rgba(255,255,255,0.04)';
      g.fillRect(ci * cellW + 6, y, cellW - 12, heights[ri] - 8);
      g.drawImage(o.canvas, x, y + (heights[ri] - 46 - h), w, h);
      g.fillStyle = '#f2efe8';
      g.font = '700 22px Inter, sans-serif';
      g.fillText(o.kind + ' · ' + o.file, ci * cellW + 18, y + heights[ri] - 18);
    });
    y += heights[ri];
  });
  return {
    items: list.map((o) => ({ kind: o.kind, file: o.file, png: o.canvas.toDataURL('image/png'), webp: o.canvas.toDataURL('image/webp', 0.9), w: o.canvas.width, h: o.canvas.height })),
    sheet: sheet.toDataURL('image/png'),
  };
};
window.ready = true;
</script>`;

(async () => {
  fs.mkdirSync(outPng, { recursive: true });
  fs.mkdirSync(outWebp, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.route('http://arte.local/**', (route) => {
    const u = new URL(route.request().url());
    if (u.pathname === '/') return route.fulfill({ contentType: 'text/html', body: PAGE });
    const file = path.join(root, decodeURIComponent(u.pathname));
    if (!file.startsWith(root) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
    return route.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(file) });
  });
  await page.goto('http://arte.local/');
  await page.waitForFunction(() => window.ready === true, null, { timeout: 15000 }).catch(() => { throw new Error('a página do ateliê não carregou: ' + errors.join(' | ')); });
  const res = await page.evaluate(() => window.run());
  if (errors.length) console.error(errors.join('\n'));
  const save = (file, dataUrl) => fs.writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));
  let pngBytes = 0;
  let webpBytes = 0;
  for (const it of res.items) {
    const name = `${it.kind}_${it.file}`;
    save(path.join(outPng, `${name}.png`), it.png);
    save(path.join(outWebp, `${name}.webp`), it.webp);
    pngBytes += fs.statSync(path.join(outPng, `${name}.png`)).size;
    webpBytes += fs.statSync(path.join(outWebp, `${name}.webp`)).size;
  }
  save(path.join(outPng, 'prancha.png'), res.sheet);
  console.log(`${res.items.length} objetos · PNG ${(pngBytes / 1024).toFixed(0)} KB · WebP ${(webpBytes / 1024).toFixed(0)} KB`);
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
