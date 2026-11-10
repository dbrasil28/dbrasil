#!/bin/bash
# BRASIL: ESTADO DE CAOS — prepara o Mac para gerar o app e instalar no celular (rodar uma vez só).
#
# Usa o que já está instalado (Node, Java e Android SDK de outros projetos, do Android Studio, do Homebrew ou do
# Unity) e só instala o que faltar. Baixa o projeto em ~/dbrasil, instala as dependências, gera o primeiro APK e
# cria na Mesa o atalho "Atualizar jogo no celular" (dois cliques: baixa a versão nova, compila, instala e abre).
# Não mexe na configuração dos outros projetos: os caminhos achados ficam só dentro do atalho.
#
# No Terminal:  curl -fsSL https://raw.githubusercontent.com/dbrasil28/dbrasil/main/app/preparar-mac.sh | bash
# Em outra pasta (um HD externo, por exemplo):
#   curl -fsSL https://raw.githubusercontent.com/dbrasil28/dbrasil/main/app/preparar-mac.sh | bash -s -- "/Volumes/One Touch/Brasil Caos"
set -u
REPO="https://github.com/dbrasil28/dbrasil.git"
RAMO="main"
# com dois cliques no Instalar.command (sem pasta dada), uma janela do Mac pergunta onde instalar
if [ -z "${1:-}" ] && [ -f "$0" ] && [ "${0##*.}" = "command" ] && command -v osascript >/dev/null 2>&1; then
  INICIO="$(cd "$(dirname "$0")" && pwd)"
  ESCOLHIDA="$(osascript -e "POSIX path of (choose folder with prompt \"Em que pasta instalar o BRASIL: ESTADO DE CAOS?\" default location (POSIX file \"$INICIO\"))" 2>/dev/null)" \
    || { echo "Cancelado: nada foi instalado."; exit 0; }
  set -- "$ESCOLHIDA"
fi
PASTA="${1:-$HOME/dbrasil}"
PASTA="${PASTA%/}"
ATALHO="$HOME/Desktop/Atualizar jogo no celular.command"

ok() { printf '  \033[32m✓\033[0m %s\n' "$1"; }
falta() { printf '  \033[33m•\033[0m %s\n' "$1"; }
erro() { printf '\n\033[31mParou: %s\033[0m\n' "$1"; fecha; exit 1; }
fecha() { [ -t 0 ] && read -n 1 -s -r -p "Aperte uma tecla para fechar." && echo; }
echo
echo "BRASIL: ESTADO DE CAOS — preparando o Mac"
echo

# Homebrew (só para o que faltar)
BREW=""
for b in /opt/homebrew/bin/brew /usr/local/bin/brew; do [ -x "$b" ] && BREW="$b" && break; done
[ -n "$BREW" ] && eval "$("$BREW" shellenv)"

# --- Git ---
if command -v git >/dev/null 2>&1 && git --version >/dev/null 2>&1; then ok "Git: $(git --version | awk '{print $3}')"
elif [ -n "$BREW" ]; then falta "Git: instalando"; "$BREW" install git || erro "não consegui instalar o Git"
else xcode-select --install 2>/dev/null; erro "falta o Git. Aceite a instalação das Ferramentas de Linha de Comando que abriu e rode de novo."
fi

# --- Node 20+ ---
versao_maior() { "$1" -v 2>/dev/null | sed 's/^v//' | cut -d. -f1; }
NODE=""
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1
for n in "$(command -v node 2>/dev/null)" /opt/homebrew/bin/node /usr/local/bin/node "$HOME/.volta/bin/node" \
  $(ls -d "$HOME"/.nvm/versions/node/*/bin/node 2>/dev/null | sort -rV); do
  [ -n "$n" ] && [ -x "$n" ] || continue
  v=$(versao_maior "$n"); [ -n "$v" ] && [ "$v" -ge 20 ] && NODE="$n" && break
done
if [ -z "$NODE" ]; then
  [ -n "$BREW" ] || erro "falta o Node 20 ou mais novo (e não achei o Homebrew para instalar). Instale em nodejs.org e rode de novo."
  falta "Node: instalando"; "$BREW" install node || erro "não consegui instalar o Node"
  NODE="$(command -v node)"
fi
NODE_DIR="$(dirname "$NODE")"
export PATH="$NODE_DIR:$PATH"
ok "Node: $("$NODE" -v) ($NODE_DIR)"

# --- Java 21 a 23 (o Gradle 8.11 do projeto não roda no 24 em diante; o Android Studio novo traz o 25) ---
java_maior() { "$1/bin/java" -version 2>&1 | grep -m1 ' version "' | sed -E 's/.*version "([0-9]+).*/\1/'; }
JAVA=""
CANDIDATOS="${JAVA_HOME:-}
/Applications/Android Studio.app/Contents/jbr/Contents/Home
$HOME/Applications/Android Studio.app/Contents/jbr/Contents/Home
/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home
$(ls -d /Library/Java/JavaVirtualMachines/*/Contents/Home 2>/dev/null)
$(ls -d "$HOME"/Library/Java/JavaVirtualMachines/*/Contents/Home 2>/dev/null)
$(ls -d /usr/lib/jvm/* 2>/dev/null)"
while IFS= read -r j; do
  [ -n "$j" ] && [ -x "$j/bin/java" ] || continue
  v=$(java_maior "$j"); case "$v" in ''|*[!0-9]*) continue;; esac
  # o 21 primeiro; se não tiver, o 22 ou o 23
  if [ "$v" -eq 21 ]; then JAVA="$j"; break; fi
  [ -z "$JAVA" ] && [ "$v" -ge 22 ] && [ "$v" -le 23 ] && JAVA="$j"
done <<EOF
$CANDIDATOS
EOF
if [ -z "$JAVA" ]; then
  # baixa o Java 21 (Temurin, de graça) para a pasta do usuário: sem senha e sem mexer no Android Studio
  falta "Java 21: baixando (o que está instalado é mais novo do que o projeto aceita)"
  case "$(uname -m)" in arm64|aarch64) ARQ=aarch64 ;; *) ARQ=x64 ;; esac
  DEST="$HOME/Library/Java/JavaVirtualMachines"
  mkdir -p "$DEST"
  TMP="$(mktemp -d)"
  curl -fsSL "https://api.adoptium.net/v3/binary/latest/21/ga/mac/$ARQ/jdk/hotspot/normal/eclipse" -o "$TMP/jdk.tar.gz" || erro "não consegui baixar o Java 21"
  tar -xzf "$TMP/jdk.tar.gz" -C "$DEST" || erro "não consegui abrir o Java 21"
  rm -rf "$TMP"
  JAVA="$(ls -d "$DEST"/jdk-21*/Contents/Home 2>/dev/null | sort -rV | head -1)"
  [ -n "$JAVA" ] && [ -x "$JAVA/bin/java" ] || erro "o Java 21 baixado não abriu"
fi
export JAVA_HOME="$JAVA"
ok "Java: $(java_maior "$JAVA") ($JAVA)"

# --- Android SDK ---
SDK=""
for s in "${ANDROID_HOME:-}" "${ANDROID_SDK_ROOT:-}" "$HOME/Library/Android/sdk" \
  /opt/homebrew/share/android-commandlinetools /usr/local/share/android-commandlinetools \
  $(ls -d /Applications/Unity/Hub/Editor/*/PlaybackEngines/AndroidPlayer/SDK 2>/dev/null | sort -rV); do
  [ -n "$s" ] && [ -d "$s/platform-tools" ] && SDK="$s" && break
done
if [ -z "$SDK" ]; then
  [ -n "$BREW" ] || erro "não achei o Android SDK. Abra o Android Studio uma vez (ele instala o SDK) e rode de novo."
  falta "Android SDK: instalando"; "$BREW" install --cask android-commandlinetools || erro "não consegui instalar o Android SDK"
  SDK="$("$BREW" --prefix)/share/android-commandlinetools"
fi
export ANDROID_HOME="$SDK"
SDKM=""
for m in "$SDK/cmdline-tools/latest/bin/sdkmanager" $(ls -d "$SDK"/cmdline-tools/*/bin/sdkmanager 2>/dev/null) "$(command -v sdkmanager 2>/dev/null)"; do
  [ -n "$m" ] && [ -x "$m" ] && SDKM="$m" && break
done
if [ ! -d "$SDK/platforms/android-35" ] || [ ! -d "$SDK/build-tools/35.0.0" ] || [ ! -x "$SDK/platform-tools/adb" ]; then
  if [ -n "$SDKM" ]; then
    falta "Android 15 (API 35): instalando no SDK"
    yes | "$SDKM" --sdk_root="$SDK" --licenses >/dev/null 2>&1
    "$SDKM" --sdk_root="$SDK" "platform-tools" "platforms;android-35" "build-tools;35.0.0" >/dev/null || erro "não consegui instalar o Android 15 no SDK"
  else
    falta "Android 15 (API 35): a primeira compilação baixa (se pedir licença, abra o Android Studio uma vez)"
  fi
fi
ok "Android SDK: $SDK"

# --- O projeto ---
# o disco da pasta: no NTFS o Mac não grava; no exFAT (o de fábrica de muitos HDs externos) não há atalho de arquivo
# (symlink), então o npm instala sem eles
mkdir -p "$PASTA" 2>/dev/null || erro "não consegui criar a pasta $PASTA (o disco está ligado?)"
DISCO="$(df -P "$PASTA" 2>/dev/null | awk 'NR==2 {print $NF}')"
TIPO="$(mount | awk -v m="$DISCO" 'index($0, " on " m " (") { sub(/.* \(/, ""); sub(/[,)].*/, ""); print; exit }')"
NPM_EXTRA=""
case "$TIPO" in
  ntfs*) erro "o disco de $PASTA é NTFS, e o Mac não grava nele. Use outra pasta ou formate o disco em APFS ou exFAT (no Utilitário de Disco)." ;;
  exfat|msdos) NPM_EXTRA="--no-bin-links"; ok "Disco: $TIPO (funciona; o npm instala sem atalhos de arquivo)" ;;
esac
# o que pode estar na pasta sem atrapalhar: o próprio instalador e os arquivos que o Mac cria
outras_coisas() {
  ls -A "$1" 2>/dev/null | grep -v -e '^\.DS_Store$' -e '^\._' -e '^\.Spotlight' -e '^\.Trashes$' -e '^\.fseventsd$' \
    -e '^\.TemporaryItems$' -e '^Instalar\.command$' -e '^LEIA-ME\.txt$' -e '^Instalar Brasil Caos.*\.zip$'
}
if [ ! -d "$PASTA/.git" ] && [ -n "$(outras_coisas "$PASTA")" ]; then
  # a pasta já tem outras coisas: o projeto vai numa pasta dentro dela
  PASTA="$PASTA/dbrasil"
  mkdir -p "$PASTA"
fi
if [ -d "$PASTA/.git" ]; then
  # também serve para a cópia baixada antes, de outro ramo (só aquele ramo, sem o histórico todo)
  (cd "$PASTA" && git remote set-branches --add origin "$RAMO" && git fetch -q origin "$RAMO" \
    && { git checkout -q "$RAMO" 2>/dev/null || git checkout -q -b "$RAMO" --track "origin/$RAMO"; } \
    && git pull -q --ff-only origin "$RAMO") || erro "não consegui atualizar $PASTA"
  ok "Projeto atualizado em $PASTA"
else
  [ -n "$(outras_coisas "$PASTA")" ] && erro "já existe $PASTA e não é o projeto. Renomeie essa pasta e rode de novo."
  echo "  … baixando o projeto (uns minutos na primeira vez)"
  # na própria pasta (o instalador pode estar nela): só o ramo principal, sem o histórico antigo
  (cd "$PASTA" && git init -q && git remote add -t "$RAMO" origin "$REPO" \
    && git fetch -q --depth 1 origin "+refs/heads/$RAMO:refs/remotes/origin/$RAMO" \
    && git checkout -q -f -B "$RAMO" "origin/$RAMO" && git branch -q --set-upstream-to="origin/$RAMO" "$RAMO") \
    || erro "não consegui baixar o projeto"
  ok "Projeto baixado em $PASTA"
fi
cd "$PASTA/app" || erro "não achei $PASTA/app"
printf 'sdk.dir=%s\n' "$SDK" > android/local.properties
echo "  … instalando as dependências do app"
npm install $NPM_EXTRA --no-audit --no-fund --loglevel=error >/dev/null || erro "o npm install falhou"
ok "Dependências do app"

# --- O atalho na Mesa ---
mkdir -p "$(dirname "$ATALHO")"
cat > "$ATALHO" <<EOF
#!/bin/bash
# Dois cliques: baixa a versão nova do jogo, compila, instala no celular do cabo e abre.
export PATH="$NODE_DIR:\$PATH"
export JAVA_HOME="$JAVA"
export ANDROID_HOME="$SDK"
cd "$PASTA" || exit 1
echo "Baixando a versão nova..."
git pull --ff-only origin "$RAMO"
cd app && npm run celular
echo
read -n 1 -s -r -p "Aperte uma tecla para fechar."
EOF
chmod +x "$ATALHO"
ok "Atalho na Mesa: Atualizar jogo no celular"

# --- O primeiro APK (confere que está tudo certo; demora alguns minutos só desta vez) ---
echo "  … gerando o primeiro APK (só desta vez demora alguns minutos)"
npm run apk >/tmp/dbrasil-primeiro-apk.log 2>&1 || erro "a compilação falhou. O registro está em /tmp/dbrasil-primeiro-apk.log (mande para o Claude)."
ok "Primeiro APK gerado"
echo
if "$SDK/platform-tools/adb" devices 2>/dev/null | grep -q "	device$"; then
  npm run instalar
else
  echo "Pronto. Ligue o celular no cabo (com a Depuração USB) e dê dois cliques em \"Atualizar jogo no celular\", na Mesa."
fi
echo
echo "O projeto está em: $PASTA"
echo "Para trabalhar com o Claude no Mac, abra essa pasta no app Claude (aba Code); ele começa pelo CLAUDE.md."
fecha
