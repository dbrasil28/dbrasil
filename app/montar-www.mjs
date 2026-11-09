// Monta app/www: o jogo (tools/build-single.mjs, com as imagens e os sons em assets/ ao lado) e as fontes
// embutidas (app/fontes/, baixadas do Google Fonts na primeira vez; licença OFL), para o app abrir sem internet.
// Uso: node app/montar-www.mjs  (ou, dentro de app/, npm run www)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, cpSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.dirname(app);
const www = path.join(app, 'www');
const fontes = path.join(app, 'fontes');
const CSS_URL = 'https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Semi+Condensed:wght@500;600;700;800;900&display=swap';
const UA = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36';

async function baixarFontes() {
  if (existsSync(path.join(fontes, 'fontes.css'))) return;
  mkdirSync(fontes, { recursive: true });
  const css = await (await fetch(CSS_URL, { headers: { 'User-Agent': UA } })).text();
  // só os alfabetos latinos (o jogo é em português): cada bloco @font-face vem com o comentário do alfabeto antes
  const blocos = css.split('/* ').filter((b) => /^latin(-ext)? \*\//.test(b));
  let saida = '';
  let n = 0;
  for (const b of blocos) {
    const url = b.match(/url\((https:[^)]+)\)/)[1];
    const nome = `fonte_${String(++n).padStart(2, '0')}.woff2`;
    const dados = Buffer.from(await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer());
    writeFileSync(path.join(fontes, nome), dados);
    saida += `/* ${b.replace(url, nome)}`;
  }
  writeFileSync(path.join(fontes, 'fontes.css'), saida);
  console.log(`fontes: ${n} arquivos em app/fontes/`);
}

await baixarFontes();
rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });
execFileSync('node', [path.join(raiz, 'tools', 'build-single.mjs'), path.join(www, 'index.html'), '--separado'], { stdio: 'inherit' });
// as fontes de dentro do app no lugar das do Google
const html = readFileSync(path.join(www, 'index.html'), 'utf8');
const link = html.match(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/);
if (!link) throw new Error('não achei o link das fontes no index.html');
writeFileSync(path.join(www, 'index.html'), html.replace(link[0], '<link rel="stylesheet" href="fontes/fontes.css">'));
cpSync(fontes, path.join(www, 'fontes'), { recursive: true });
rmSync(path.join(www, 'arquivos.json'), { force: true });
console.log(`www pronto: ${readdirSync(path.join(www, 'assets')).length} pastas de arquivos, fontes embutidas`);
