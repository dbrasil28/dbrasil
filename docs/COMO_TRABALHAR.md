# Como trabalhar neste projeto (para uma sessão nova)

Este arquivo é para quem chega sem a conversa anterior, como uma sessão nova do Claude no Mac do autor. O projeto foi feito até 10/11/2026 numa sessão na nuvem e passou para o computador do autor. Leia isto, o `CLAUDE.md` (as regras) e o fim de `docs/DECISOES.md` (o que falta) antes de começar.

## Onde está e como roda

- **Onde:** na pasta que o autor escolheu no instalador (`app/preparar-mac.sh`), por exemplo `/Volumes/One Touch/Brasil Caos`, e também no GitHub, em `dbrasil28/dbrasil`, ramo `main`. O repositório é **público**.
- **Testes:** `npm test`, sempre antes de um commit. Hoje são 155 e todos passam.
- **Jogo no navegador:** `npm start` mostra um endereço que também abre no celular, na mesma rede Wi-Fi.
- **Jogo no celular:** com o celular no cabo, `cd app && npm run celular` (ou o atalho "Atualizar jogo no celular", na Mesa). A cada APK novo, suba `versionCode` e `versionName` em `app/android/app/build.gradle`; o último foi 4 e 0.4.
- **Java:** o Gradle 8.11 do app não roda no Java 24 em diante, e o Android Studio novo traz o 25. O instalador acha ou baixa um Java 21 e deixa os caminhos dentro do atalho.

## Como o autor gosta de trabalhar

- **Linguagem:** fala em português, direto, e testa tudo no celular. Quando algo que ele já pediu volta a dar errado, fica bravo com razão. As regras que ele já pediu estão no código e nos testes, por isso nunca desfaça uma regra sem ele pedir.
- **Mostrar antes de pôr no jogo:**
  - **Sons:** mande as opções para ele ouvir. Quando for uma cena, mande a cena montada com o som. Só ponha no jogo depois do sim. Ele recusou quase todos os sons caseiros gratuitos (CC0); os que ele aprova costumam vir do Firefly ou do Suno, feitos por ele.
  - **Cenas com tempo** (câmera, TV, risada, olhos): grave um vídeo da cena com o som montado e mande. `tools/video-cena.mjs` grava a imagem (o som se põe por cima com o ffmpeg; veja o comentário no arquivo).
  - **Arte:** mande a imagem antes de pôr no jogo.
- **Mesmas caras sempre (D102):** variação de um personagem aprovado sai da imagem aprovada, numa folha de quadros. O gerador do Figma não aceita imagem de referência e muda as caras.
- **Arte no ângulo do jogo:** veja o `CLAUDE.md`.
- **Nada de rosto de pessoa real:** nem político nem celebridade. Os nomes são sempre fictícios.

## Regras de jogo que o autor já pediu (os testes guardam)

- O Juninho entra na festa do baile sem arma e sem nada na mão (nem cadeira).
- O anel do DJ faz efeito de perto: empurra ou derruba.
- O DJ só fica ofuscado (brilhando) com os dois holofotes apontados para ele ao mesmo tempo, e por pouco tempo.
- As melhorias permanentes são lentas e caras: 61 níveis, umas 20 a 25 horas para completar.
- A cena das TVs do Plantão segue esta ordem (D104):
  1. o zoom numa TV junto com o DUUUUMM, e o funk baixa;
  2. a TV fica fora de sintonia;
  3. as cabeças do Acordão entram no sinal;
  4. a risada das duas cabeças;
  5. os olhos acendem no MWAHAHA.
- Os anúncios seguem as regras do `CLAUDE.md`.

## Arte (Figma)

- **Arquivo:** use só o arquivo **pessoal** do autor, `IH2YcArYI3dvrEYhimEUFN`, e **nunca** a organização FIDUCIAL.
- **Folhas:** imagens de 1536×1024, com fundo verde para os bonecos (6×4 para a caminhada, 4×4 em 16 ângulos para as poses).
- **Montagem:** `tools/pacote-figma.py`, depois `tools/montar-atlas.py`, `montar-poses.py` ou `montar-danca.py` (comandos no `CLAUDE.md`).
- **Weave (os modelos pagos do Figma):** só use com o autor aprovando o custo antes.
- **Memória do celular:** atlas grandes carregados juntos já travaram o Morro. Os do DJ carregam sob demanda (`carregarDJ`, em `sprites.js`) e na escala 0,75. Faça igual com os personagens novos.

## Som

- O motor está em `prototype/src/sons.js` e os números em `config.js` (`SONS`, `SOM`). Os créditos de cada arquivo ficam em `docs/som/CREDITOS_SONS.md`.
- A música do baile e as risadas do Acordão foram feitas no Suno. Para vender o jogo, a conta precisa ser de um plano com uso comercial (ver as pendências).

## O que falta

Está no fim de `docs/DECISOES.md`, em "Pendentes" e "Próximos passos": as danças do baile, a Play Store, o iOS e as decisões antes da loja (D17, D21 e o Suno).
