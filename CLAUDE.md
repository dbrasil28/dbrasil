# BRASIL: ESTADO DE CAOS

Survival roguelite para celular (Android/iOS), em retrato, com câmera 2.5D e ataques automáticos. Sátira social sobre poder e violência no Brasil. **Gratuito com anúncios.** Status: pré-produção, Fase 0 (protótipo de arena cinza).

Responda e escreva documentos em **português do Brasil**.

## Onde fica cada coisa

| O quê | Onde |
| --- | --- |
| Conceito original (GDD, sistemas, conteúdo, arte, MVP, decisões) | `docs/concept-v0.1/` |
| Análise, riscos e respostas às perguntas abertas | `docs/ANALISE_CONCEITO_v0.1.md` |
| Decisões tomadas (registro único) | `docs/DECISOES.md` |
| Publicidade: pontos de anúncio, regras, políticas | `docs/MONETIZACAO_ANUNCIOS.md` |
| Roteiro de playtest | `docs/PLAYTEST_FASE0.md` |
| Specs de mecânica (MECH-xxx) e elenco/nomes | `docs/design/` |
| Arte: guia de produção, mapas, prompts e recortes de referência | `docs/arte/` (página gerada por `node tools/guia-para-html.mjs`) |
| Protótipo (HTML + JS, sem dependências) | `prototype/` |
| Conteúdo e todos os números de balanceamento | `prototype/src/config.js` |
| Simulação (sem DOM, roda no Node) | `prototype/src/game.js` |

## Comandos

```bash
npm test                                   # testes de unidade + partidas simuladas
npm start                                  # servidor local (mostra o endereço para o celular)
node tools/balance-report.mjs 20 alternar  # 20 partidas com o bot (aceitar | recusar, --reviver, --sem-desvio)
node tools/build-single.mjs                # gera dist/brasil-estado-de-caos.html (arquivo único)
node tools/build-single.mjs <saida.html> --fragment --separado
                                           # para a página de teste: HTML só com o código e as imagens em assets/ ao lado
node tools/planta-mundo.mjs <saida.html>   # planta da rota vista de cima, com cada objeto no lugar (a partir do jogo)
python3 -I tools/montar-atlas.py <pacote> prototype/assets/personagens/<pasta> <pasta-nova> x
                                           # atlas 16×6 de caminhada (+ pose de acordado na horda); Pillow, numpy, opencv
python3 -I tools/montar-poses.py <pacote> prototype/assets/personagens/<pasta> <pasta-nova> x ataque furia
                                           # poses paradas em 16 direções (folhas 4×4), na escala da caminhada
```

Rode `npm test` antes de qualquer commit.

## Regras do projeto

- **Nomes fictícios sempre:** nada de pessoas, partidos, instituições ou marcas reais. A loja e as redes de anúncio restringem violência contra pessoas reais.
- **Números de jogo ficam em `config.js`**, nunca espalhados pelo código.
- `game.js` não acessa o DOM, para continuar testável no Node.
- **Anúncios:** nunca durante a partida; assistir anúncio nunca aumenta a Corrupção; vídeos com recompensa são sempre opcionais.
- O bot de balanceamento compara versões. Ele não substitui playtest com pessoas.
- **Arte no ângulo do jogo:** quando o autor pedir para desenhar de novo, gerar arte nova no Figma já no ângulo certo. Nunca girar, espremer, estreitar ou entortar uma imagem no código para fingir o ângulo. Medir o ângulo da arte nova contra o chão do jogo antes de publicar.

## Skills e agentes de game dev instalados

Cópias revisadas, sem os hooks. Origem e licenças em `.claude/README.md`.

| Papel | Skill ou agente | Quando usar |
| --- | --- | --- |
| Construtor | skill `game-vibe-code` | Construir uma funcionalidade com spec, verificação no navegador e commit |
| Construtor | skill `game-web2d-specialist` | Phaser/PixiJS, migração do Canvas 2D para WebGL, desempenho em celular |
| Designer | skill `game-designer` | Loop, mecânicas, progressão, sensação de jogo |
| Designer | skill `game-gdd-author` | Transformar o conceito em GDD com critérios de aceite |
| Designer | skill `game-economy-designer` | Moedas, anúncios, compras, ética de monetização |
| Designer | skill `game-balance-check` | Curvas, taxas de vitória, simulações (use `tools/balance-report.mjs`) |
| Designer | agentes `lead-game-designer`, `systems-designer`, `economy-designer` | Trabalho de design em contexto separado (subagentes) |
| QA | skill `game-qa-lead` | Plano de testes, regressão, triagem de bugs |
| QA | skill `game-playtest` | Planejar e analisar playtests com pessoas |

Essas skills foram escritas para a estrutura de outros templates. Neste repositório:

- **GDD e documentos de design** ficam em `docs/`; não crie `design/gdd/`.
- **Estado da sessão** vai em `docs/DECISOES.md`; não crie `production/session-state/`, `progress.md` nem `.gameforge/`.
- **Tuning knobs** ficam em `prototype/src/config.js`; não crie `assets/data/`.
- **Modelos e guias** citados pelas skills estão em `.claude/gameforge/`.
- **Skills citadas que não foram instaladas** (`game-web-publish`, `game-technical-director` e outras): avise e siga sem elas.
