# App Android (Capacitor)

O jogo inteiro dentro de um APK: código, imagens, sons, músicas e fontes. Nada vem da internet.

## Gerar o APK

Precisa de Node 20+, Java 21 e o Android SDK (plataforma 35 e build-tools 35). Com o SDK em `/opt/android-sdk`:

```bash
cd app
npm install                      # a primeira vez
echo "sdk.dir=/opt/android-sdk" > android/local.properties
npm run apk                      # monta app/www, copia para o projeto Android e compila (Windows, Mac ou Linux)
```

O APK sai em `app/android/app/build/outputs/apk/debug/app-debug.apk`.

- `npm run www` monta só `app/www` (o jogo de `tools/build-single.mjs --separado` e as fontes de `app/fontes/`).
- `npm run sync` monta e copia para `app/android` (sem compilar).
- Na primeira vez, `montar-www.mjs` baixa as fontes do Google Fonts (Anton e Barlow Semi Condensed, licença OFL) para `app/fontes/`; depois usa as de lá.

## No seu computador, com o celular no cabo

Mais rápido que a nuvem: um comando monta o jogo, compila, instala no celular por cima da versão anterior e abre.

**No Mac, um comando prepara tudo.** Abra o Terminal e cole:

```bash
curl -fsSL https://raw.githubusercontent.com/dbrasil28/dbrasil/ccr-78bf25c0-ckp1pr/app/preparar-mac.sh | bash
```

Ele usa o Node, o Java e o Android SDK que já estão instalados (de outros projetos, do Android Studio, do Homebrew ou do Unity) e só instala o que faltar. Baixa o projeto em `~/dbrasil`, gera o primeiro APK e cria na Mesa o atalho **Atualizar jogo no celular**. Depois, é só ligar o celular no cabo e dar dois cliques no atalho: ele baixa a versão nova, compila, instala e abre o jogo. Não muda a configuração dos outros projetos.

Sem o instalador, à mão:

Uma vez só:

1. Instale o Git, o Node.js 20 ou mais novo e o Android Studio (ele traz o Java e o Android SDK). No Android Studio, em More Actions → SDK Manager, marque a plataforma Android 15 (API 35).
2. Defina a variável `ANDROID_HOME` com a pasta do SDK. No Windows é `%LOCALAPPDATA%\Android\Sdk`, e no Mac é `~/Library/Android/sdk`.
3. Baixe o projeto e as dependências:

   ```bash
   git clone https://github.com/dbrasil28/dbrasil.git
   cd dbrasil
   git checkout ccr-78bf25c0-ckp1pr
   cd app
   npm install
   ```

4. No celular, ligue as Opções do desenvolvedor e a Depuração USB. Ligue o celular no cabo e aceite o aviso "Permitir depuração USB?".

A cada versão nova:

```bash
cd app
npm run celular      # monta, compila, instala no celular e abre o jogo
npm run instalar     # só instala o último APK (sem compilar de novo)
```

Para testar mais rápido ainda, sem gerar APK: na raiz do projeto, `npm start` mostra um endereço. Abra esse endereço no Chrome do celular, ligado na mesma rede Wi-Fi do computador. Cada mudança aparece ao recarregar a página.

Para trabalhar com o Claude no computador, abra a pasta `dbrasil` no app Claude Desktop (aba Code) ou rode `claude` no terminal dentro dela. Ele lê o `CLAUDE.md` e o `docs/DECISOES.md` e continua de onde parou.

## Instalar no celular

É um APK de teste, assinado com a chave de teste guardada em `app/android/app/teste.keystore` (a padrão do Android, senha `android`): assim o APK gerado em qualquer máquina instala por cima do anterior, sem apagar o progresso. A cada APK novo, suba `versionCode` e `versionName` em `app/android/app/build.gradle`. No Android: abrir o arquivo, permitir "instalar apps desconhecidos" para o app que abriu o arquivo e instalar. Para a loja, falta gerar o pacote de publicação (AAB) com uma chave própria.

## O que o app faz diferente da página

- Sempre em retrato, em tela cheia (sem as barras do sistema; um deslize na borda mostra as barras por um instante) e com a tela acesa enquanto está aberto (`MainActivity.java`).
- Ícone com o retrato do Juninho e abertura com o logo do jogo.
