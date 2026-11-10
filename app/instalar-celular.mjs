// Instala o APK de teste no celular ligado no cabo (depuração USB ativada) e abre o jogo. Instala por cima da versão
// que já está lá (mesma chave de teste), sem apagar o progresso. Acha o adb no Android SDK (ANDROID_HOME ou
// ANDROID_SDK_ROOT) ou no PATH.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = import.meta.dirname ?? dirname(fileURLToPath(import.meta.url));

const APK = join(AQUI, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const APP = 'br.estadodecaos.jogo';
const exe = process.platform === 'win32' ? 'adb.exe' : 'adb';
const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
const doSdk = sdk && join(sdk, 'platform-tools', exe);
const adb = doSdk && existsSync(doSdk) ? doSdk : exe;
const rodar = (args) => spawnSync(adb, args, { encoding: 'utf8' });

if (!existsSync(APK)) {
  console.error('Ainda não tem APK. Rode antes: npm run apk');
  process.exit(1);
}
const lista = rodar(['devices']);
if (lista.error) {
  console.error('Não achei o adb. Ele vem no Android Studio (SDK, pasta platform-tools); defina ANDROID_HOME ou ponha essa pasta no PATH.');
  process.exit(1);
}
const linhas = lista.stdout.split('\n').slice(1).map((l) => l.trim()).filter(Boolean);
const prontos = linhas.filter((l) => /\tdevice$/.test(l));
if (!prontos.length) {
  const semPermissao = linhas.some((l) => /unauthorized/.test(l));
  console.error(semPermissao
    ? 'O celular está ligado, mas falta permitir: aceite o aviso "Permitir depuração USB?" na tela dele e rode de novo.'
    : 'Nenhum celular encontrado. Ligue no cabo, com as Opções do desenvolvedor e a Depuração USB ativadas.');
  process.exit(1);
}
console.log(`Instalando em ${prontos.map((l) => l.split('\t')[0]).join(', ')}...`);
const inst = spawnSync(adb, ['install', '-r', APK], { stdio: 'inherit' });
if (inst.status !== 0) process.exit(inst.status ?? 1);
rodar(['shell', 'monkey', '-p', APP, '-c', 'android.intent.category.LAUNCHER', '1']);
console.log('Pronto: o jogo abriu no celular.');
