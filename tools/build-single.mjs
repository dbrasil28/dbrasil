// Gera um único HTML autocontido (CSS + JS embutidos) a partir de prototype/.
// Útil para mandar o protótipo por link ou abrir direto no celular sem servidor.
// Uso: node tools/build-single.mjs [saida.html] [--fragment] [--separado]
//   --fragment  gera só o conteúdo da página (sem <html>/<head>/<body>), para hospedagens
//               que já fornecem esse esqueleto.
//   --separado  as imagens não vão dentro do HTML: são copiadas para assets/ ao lado dele (o HTML fica
//               só com o código, sem limite de tamanho por causa das imagens); grava a lista em
//               arquivos.json para publicar junto.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const proto = path.join(root, 'prototype');
const args = process.argv.slice(2);
const fragment = args.includes('--fragment');
const separado = args.includes('--separado');
const assets = new Set();
const out = path.resolve(args.find((a) => !a.startsWith('--')) || path.join(root, 'dist', 'brasil-estado-de-caos.html'));

const order = [];
const seen = new Set();
const sources = new Map();

async function visit(rel) {
  const id = path.posix.normalize(rel);
  if (seen.has(id)) return;
  seen.add(id);
  const code = await readFile(path.join(proto, id), 'utf8');
  for (const m of code.matchAll(/^import\s+[^;]*?from\s+'(\.[^']+)';/gm)) {
    await visit(path.posix.join(path.posix.dirname(id), m[1]));
  }
  sources.set(id, await inlineAssets(code));
  order.push(id);
}

async function inlineAssets(code) {
  const re = /'(assets\/[^']+\.(png|jpg|jpeg|webp|mp3))'/g;
  const found = [...code.matchAll(re)];
  for (const [whole, rel, ext] of found) {
    if (separado) {
      assets.add(rel); // o caminho relativo continua no código: a imagem vai ao lado do HTML
      continue;
    }
    const buf = await readFile(path.join(proto, rel));
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'mp3' ? 'audio/mpeg' : 'image/jpeg';
    code = code.replace(whole, `'data:${mime};base64,${buf.toString('base64')}'`);
  }
  return code;
}

function transform(id, code) {
  const exportsList = [];
  let body = code.replace(/^import\s+\{([^}]*)\}\s+from\s+'(\.[^']+)';/gm, (_, names, from) => {
    const dep = path.posix.normalize(path.posix.join(path.posix.dirname(id), from));
    const list = names.split(',').map((n) => n.trim()).filter(Boolean).map((n) => n.replace(/\s+as\s+/, ': '));
    return `const { ${list.join(', ')} } = __m[${JSON.stringify(dep)}];`;
  });
  body = body.replace(/^export\s+(async\s+function|function|class|const|let)\s+([A-Za-z0-9_$]+)/gm, (_, kind, name) => {
    exportsList.push(name);
    return `${kind} ${name}`;
  });
  if (/^\s*(import|export)\s/m.test(body)) throw new Error(`Sintaxe de módulo não suportada em ${id}`);
  return `__m[${JSON.stringify(id)}] = (() => {\n${body}\nreturn { ${exportsList.join(', ')} };\n})();\n`;
}

await visit('src/main.js');
const js = `(() => {\n'use strict';\nconst __m = {};\n${order.map((id) => transform(id, sources.get(id))).join('\n')}\n})();`;
const css = await readFile(path.join(proto, 'styles.css'), 'utf8');
const html = await readFile(path.join(proto, 'index.html'), 'utf8');
const app = html.slice(html.indexOf('<!--APP-->') + 10, html.indexOf('<!--/APP-->'));
const fonts = html.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]+>/)[0];
const title = '<title>Brasil: Estado de Caos</title>';

const page = fragment
  ? `${title}\n<meta name="claude:viewport-fit-sides" content="cover">\n${fonts}\n<style>\n${css}\n</style>\n${app}\n<script>\n${js}\n</script>\n`
  : `<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">\n<meta name="theme-color" content="#141117">\n${title}\n${fonts}\n<style>\n${css}\n</style>\n</head>\n<body>\n${app}\n<script>\n${js}\n</script>\n</body>\n</html>\n`;

await mkdir(path.dirname(out), { recursive: true });
await writeFile(out, page);
if (separado) {
  const dir = path.dirname(out);
  for (const rel of assets) {
    await mkdir(path.join(dir, path.dirname(rel)), { recursive: true });
    await copyFile(path.join(proto, rel), path.join(dir, rel));
  }
  await writeFile(path.join(dir, 'arquivos.json'), JSON.stringify([...assets].sort(), null, 1));
  console.log(`${assets.size} imagens copiadas para ${path.relative(process.cwd(), path.join(dir, 'assets'))}`);
}
console.log(`Gerado: ${path.relative(process.cwd(), out)} (${(page.length / 1024).toFixed(0)} KB, ${order.length} módulos)`);
