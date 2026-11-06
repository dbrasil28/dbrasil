// Converte docs/arte/GUIA_DE_PRODUCAO_DE_ARTE.md numa página com botão "Copiar" em cada prompt.
// Uso: node tools/guia-para-html.mjs <saida.html>
import { readFile, writeFile } from 'node:fs/promises';
const src = await readFile(new URL('../docs/arte/GUIA_DE_PRODUCAO_DE_ARTE.md', import.meta.url), 'utf8');
const out = process.argv[2] || 'guia.html';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (t) => esc(t)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
const slug = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const lines = src.split('\n');
let html = '';
const toc = [];
let i = 0;
let codeN = 0;
while (i < lines.length) {
  const l = lines[i];
  if (l.startsWith('```')) {
    const buf = [];
    i++;
    while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++]);
    i++;
    const id = `p${++codeN}`;
    const isPrompt = !buf.some((b) => /[┌│└├]/.test(b));
    html += isPrompt
      ? `<div class="prompt"><div class="prompt-bar"><span>Prompt</span><button type="button" data-copy="${id}">Copiar</button></div><pre id="${id}">${esc(buf.join('\n'))}</pre></div>`
      : `<pre class="plan">${esc(buf.join('\n'))}</pre>`;
    continue;
  }
  const h = l.match(/^(#{1,5}) (.*)$/);
  if (h) {
    const lvl = h[1].length;
    const id = slug(h[2].replace(/`/g, ''));
    if (lvl === 2) toc.push([id, h[2]]);
    html += `<h${lvl} id="${id}">${inline(h[2])}</h${lvl}>`;
    i++;
    continue;
  }
  if (/^---\s*$/.test(l)) { html += '<hr>'; i++; continue; }
  if (l.startsWith('|')) {
    const rows = [];
    while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
    const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
    const head = cells(rows[0]);
    const body = rows.slice(2).map(cells);
    html += `<div class="table"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    continue;
  }
  if (/^\s*([-*]|\d+\.) /.test(l)) {
    const ordered = /^\s*\d+\./.test(l);
    const items = [];
    while (i < lines.length && /^\s*([-*]|\d+\.) /.test(lines[i])) {
      let t = lines[i].replace(/^\s*([-*]|\d+\.) /, '');
      const nested = /^\s{2,}/.test(lines[i]);
      const box = t.match(/^\[ \] (.*)$/);
      t = box ? `<label class="check"><input type="checkbox"> <span>${inline(box[1])}</span></label>` : inline(t);
      items.push(nested ? `<li class="sub">${t}</li>` : `<li>${t}</li>`);
      i++;
    }
    html += ordered ? `<ol>${items.join('')}</ol>` : `<ul>${items.join('')}</ul>`;
    continue;
  }
  if (l.startsWith('> ')) {
    const buf = [];
    while (i < lines.length && lines[i].startsWith('>')) buf.push(lines[i++].replace(/^>\s?/, ''));
    html += `<blockquote>${inline(buf.join(' '))}</blockquote>`;
    continue;
  }
  if (!l.trim()) { i++; continue; }
  const buf = [];
  while (i < lines.length && lines[i].trim() && !/^(#|\||```|>|\s*([-*]|\d+\.) |---)/.test(lines[i])) buf.push(lines[i++]);
  html += `<p>${inline(buf.join(' '))}</p>`;
}
const tocHtml = `<nav class="toc" aria-label="Seções">${toc.map(([id, t]) => `<a href="#${id}">${inline(t)}</a>`).join('')}</nav>`;
const page = `<title>Guia de Arte do Caos</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Semi+Condensed:wght@500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* Layout: coluna única de leitura com sumário no topo; prompts como "fichas de pedido" com botão de copiar. */
:root {
  --bg: #f6f3ee; --fg: #1b171e; --muted: #5c5560; --line: #ddd5cc; --card: #fffdf9;
  --accent: #d81f2e; --gold: #b7860b; --code-bg: #efe9e1;
  --display: "Anton", Impact, "Arial Narrow", sans-serif;
  --ui: "Barlow Semi Condensed", "Arial Narrow", system-ui, sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #151217; --fg: #f1edf3; --muted: #aaa1ae; --line: #2f2933; --card: #1d1920; --accent: #ff3b48; --gold: #e8b62c; --code-bg: #241f27; color-scheme: dark } }
:root[data-theme="dark"] { --bg: #151217; --fg: #f1edf3; --muted: #aaa1ae; --line: #2f2933; --card: #1d1920; --accent: #ff3b48; --gold: #e8b62c; --code-bg: #241f27; color-scheme: dark }
body { background: var(--bg); color: var(--fg); font: 17px/1.5 var(--ui); margin: 0; }
main { max-width: 820px; margin: 0 auto; padding-block: 28px 80px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
h1 { font: 400 clamp(34px, 7vw, 54px)/1 var(--display); margin: 0 0 12px; text-wrap: balance; }
h1::first-line { color: var(--accent); }
h2 { font: 400 30px/1.1 var(--display); margin: 44px 0 12px; padding-top: 12px; border-top: 3px solid var(--accent); text-wrap: balance; }
h3 { font-size: 23px; font-weight: 800; margin: 30px 0 8px; }
h4 { font-size: 19px; font-weight: 800; margin: 26px 0 6px; }
h5 { font-size: 17px; font-weight: 800; margin: 20px 0 6px; color: var(--muted); }
p, li { max-width: 68ch; }
code { font: 0.86em var(--mono); background: var(--code-bg); padding: 1px 5px; border-radius: 4px; overflow-wrap: anywhere; }
hr { border: 0; border-top: 1px solid var(--line); margin: 28px 0; }
blockquote { margin: 16px 0; padding: 10px 14px; border-left: 4px solid var(--gold); background: var(--card); }
ul, ol { padding-left: 22px; }
li.sub { margin-left: 18px; list-style: circle; }
.toc { display: flex; flex-wrap: wrap; gap: 6px 14px; padding: 12px 0 18px; border-bottom: 1px solid var(--line); font-weight: 700; }
.toc a { color: var(--fg); text-decoration: none; border-bottom: 2px solid var(--accent); }
.toc a:focus-visible, button:focus-visible { outline: 3px solid var(--gold); outline-offset: 2px; }
.table { overflow-x: auto; margin: 12px 0; border: 1px solid var(--line); border-radius: 6px; }
table { border-collapse: collapse; width: 100%; font-size: 15.5px; }
th, td { text-align: left; vertical-align: top; padding: 8px 10px; border-bottom: 1px solid var(--line); }
th { background: var(--card); font-weight: 800; white-space: nowrap; }
tr:last-child td { border-bottom: 0; }
.prompt { margin: 12px 0 18px; border: 1px solid var(--line); border-left: 4px solid var(--accent); border-radius: 6px; background: var(--card); min-width: 0; }
.prompt-bar { display: flex; justify-content: space-between; align-items: center; padding: 6px 8px 6px 12px; border-bottom: 1px solid var(--line); font-size: 13px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
.prompt-bar button { min-height: 36px; padding: 0 14px; border: 0; border-radius: 6px; background: var(--accent); color: #fff; font: 800 15px var(--ui); letter-spacing: 0.04em; cursor: pointer; }
.prompt-bar button.ok { background: var(--gold); color: #1b171e; }
.prompt pre, pre.plan { margin: 0; padding: 12px; font: 14px/1.5 var(--mono); white-space: pre-wrap; overflow-wrap: anywhere; }
pre.plan { white-space: pre; overflow-x: auto; background: var(--code-bg); border-radius: 6px; font-size: 12.5px; }
.check { display: inline-flex; gap: 8px; align-items: baseline; }
.check input { width: 18px; height: 18px; accent-color: var(--accent); }
ul:has(.check) { list-style: none; padding-left: 4px; }
</style>
<main>
${html.replace(/(<\/h1>)/, '$1' + tocHtml)}
</main>
<script>
document.addEventListener('click', async (e) => {
  const b = e.target.closest('button[data-copy]');
  if (!b) return;
  const pre = document.getElementById(b.dataset.copy);
  const done = (ok) => { b.textContent = ok ? 'Copiado' : 'Selecionado'; b.classList.toggle('ok', ok); setTimeout(() => { b.textContent = 'Copiar'; b.classList.remove('ok'); }, 1800); };
  try { await navigator.clipboard.writeText(pre.textContent); done(true); }
  catch { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); done(false); }
});
</script>
`;
await writeFile(out, page);
console.log('ok', out, codeN, 'blocos');
