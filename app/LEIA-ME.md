# App Android (Capacitor)

O jogo inteiro dentro de um APK: código, imagens, sons, músicas e fontes. Nada vem da internet.

## Gerar o APK

Precisa de Node 20+, Java 21 e o Android SDK (plataforma 35 e build-tools 35). Com o SDK em `/opt/android-sdk`:

```bash
cd app
npm install                      # a primeira vez
echo "sdk.dir=/opt/android-sdk" > android/local.properties
npm run apk                      # monta app/www, copia para o projeto Android e compila
```

O APK sai em `app/android/app/build/outputs/apk/debug/app-debug.apk`.

- `npm run www` monta só `app/www` (o jogo de `tools/build-single.mjs --separado` e as fontes de `app/fontes/`).
- `npm run sync` monta e copia para `app/android` (sem compilar).
- Na primeira vez, `montar-www.mjs` baixa as fontes do Google Fonts (Anton e Barlow Semi Condensed, licença OFL) para `app/fontes/`; depois usa as de lá.

## Instalar no celular

É um APK de teste (assinado com a chave de depuração). No Android: abrir o arquivo, permitir "instalar apps desconhecidos" para o app que abriu o arquivo e instalar. Para a loja, falta gerar o pacote de publicação (AAB) com uma chave própria.

## O que o app faz diferente da página

- Sempre em retrato, em tela cheia (sem as barras do sistema; um deslize na borda mostra as barras por um instante) e com a tela acesa enquanto está aberto (`MainActivity.java`).
- Ícone com o retrato do Juninho e abertura com o logo do jogo.
