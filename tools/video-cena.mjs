// Grava em vídeo a cena do Plantão do baile (o zoom nas TVs) para o autor aprovar. O vídeo não tem som: o script
// diz em que segundo dele o Plantão começa, para pôr o som por cima com o ffmpeg.
//
// uso (com `npm start` rodando):  OUT=<pasta> node tools/video-cena.mjs
//   o vídeo sai em <pasta>/*.webm; a saída mostra plantaoNoVideoS (o começo do Plantão no vídeo)
// som por cima (P = plantaoNoVideoS; os tempos de cada som saem de BAILE.cenaTv em config.js), por exemplo:
//   ffmpeg -ss <P-2.5> -t 16 -i video.webm -i som.wav -map 0:v -map 1:a -c:v libx264 -pix_fmt yuv420p -c:a aac cena.mp4
// Precisa do Playwright: npm i -D playwright && npx playwright install chromium (uma vez).
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const OUT = process.env.OUT;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, recordVideo: { dir: OUT, size: { width: 412, height: 915 } } });
const pg = await ctx.newPage();
const t0 = Date.now();
const erros = [];
pg.on('pageerror', (e) => erros.push(String(e)));
await pg.goto(process.env.URL || 'http://localhost:8765/', { waitUntil: 'load' });
await pg.waitForTimeout(1200);
await pg.click('#btn-favela');
await pg.waitForTimeout(3000);
await pg.evaluate(() => { const g = window.__bec.game; const w = g.world; const p = g.player; p.hp = 1e9; g.stats.maxHp = 1e9; const k = w.baile; p.x = (k.x0 + k.x1) / 2 + 2; p.y = k.y1 - 4; p.ri = w.baileI; });
await pg.waitForTimeout(5000);
const fecha = () => pg.evaluate(() => { for (const bt of document.querySelectorAll('.modal button, #ad-layer button')) { try { bt.click(); } catch {} } });
await fecha();
// faltando 2,5 s para o Plantão
await pg.evaluate(() => { const S = window.__bec.game.baile; S.faseT = 20 - 2.5; });
let ini = null;
for (let i = 0; i < 400 && !ini; i++) {
  const r = await pg.evaluate(() => { const S = window.__bec.game.baile; return S.fase === 'plantao' ? S.faseT : null; });
  if (r !== null) ini = (Date.now() - t0) / 1000 - r;
  else await pg.waitForTimeout(10);
}
const amostras = [];
for (let i = 0; i < 26; i++) {
  await pg.waitForTimeout(500);
  amostras.push(await pg.evaluate(() => { const g = window.__bec.game; const S = g.baile; return [S.fase, +S.faseT.toFixed(2), g.focoBaile ? +g.focoBaile.k.toFixed(2) : 0, +g.somDoBaile.toFixed(2), !!S.olhosTv]; }));
}
const fim = (Date.now() - t0) / 1000;
await ctx.close();
await b.close();
console.log(JSON.stringify({ plantaoNoVideoS: +ini.toFixed(3), fimS: +fim.toFixed(2), amostras }), erros.slice(0, 3).join(' | ') || 'sem erros');
