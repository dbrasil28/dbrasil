// Compila o APK de teste (app/android) em qualquer sistema: gradlew no Linux e no Mac, gradlew.bat no Windows.
// Sem android/local.properties, usa o Android SDK de ANDROID_HOME (ou ANDROID_SDK_ROOT), que o Android Studio instala.
import { spawnSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = import.meta.dirname ?? dirname(fileURLToPath(import.meta.url));

const pasta = join(AQUI, 'android');
const props = join(pasta, 'local.properties');
const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
if (!existsSync(props) && sdk) writeFileSync(props, `sdk.dir=${sdk.replace(/\\/g, '\\\\')}\n`);
if (!existsSync(props) && !sdk) {
  console.error('Não achei o Android SDK. Instale o Android Studio e defina ANDROID_HOME, ou crie app/android/local.properties com sdk.dir=<pasta do SDK>.');
  process.exit(1);
}
const windows = process.platform === 'win32';
const r = spawnSync(windows ? 'gradlew.bat' : './gradlew', ['assembleDebug'], { cwd: pasta, stdio: 'inherit', shell: windows });
if (r.status !== 0) process.exit(r.status ?? 1);
console.log('APK pronto: app/android/app/build/outputs/apk/debug/app-debug.apk');
