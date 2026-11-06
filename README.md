# BRASIL: ESTADO DE CAOS

Survival roguelite para celular (Android/iOS) em retrato, com câmera 2.5D, ataques automáticos e sátira social sobre poder e violência no Brasil.

> *No Brasil, sobreviver é fácil. Difícil é continuar inocente.*

Status: **pré-produção, Fase 0** (protótipo de arena cinza).

## Conteúdo

| Caminho | O que é |
| --- | --- |
| `docs/concept-v0.1/` | Pacote de conceito original: GDD, sistemas, conteúdo, arte/UI, MVP, decisões e os 3 mockups |
| `docs/ANALISE_CONCEITO_v0.1.md` | Análise do pacote: riscos, respostas às perguntas abertas e descobertas do protótipo |
| `docs/PLAYTEST_FASE0.md` | Roteiro de teste em aparelho real e critérios para sair da Fase 0 |
| `docs/MONETIZACAO_ANUNCIOS.md` | Modelo de publicidade: onde entram os anúncios, regras de frequência, políticas das redes e pilha técnica |
| `docs/SKILLS_EQUIPE_GAMES.md` | Pesquisa de skills de Claude Code para construtor, designer e QA de games |
| `docs/DECISOES.md` | Registro de decisões |
| `docs/design/` | Specs de mecânica (MECH-001) e elenco com os nomes v0.2 |
| `docs/arte/` | Guia de produção de arte (mapas, specs, prompts) e recortes do mockup usados como referência |
| `.claude/` | Skills e agentes de game dev instalados no projeto (ver `CLAUDE.md`) |
| `prototype/` | Protótipo jogável (HTML + JavaScript, sem dependências) |
| `tools/` | Servidor local, empacotador em arquivo único e relatório de balanceamento |

## Rodar o protótipo

Precisa só de **Node.js 20+**, sem `npm install`.

```bash
npm start            # abre em http://localhost:8080 e mostra o endereço para o celular na mesma rede Wi-Fi
npm test             # testes de unidade + partidas simuladas
node tools/balance-report.mjs 20 alternar   # 20 partidas com o bot; também: aceitar | recusar, --reviver, --sem-desvio
node tools/build-single.mjs                 # gera dist/brasil-estado-de-caos.html (arquivo único)
```

**Controles:** arraste o dedo em qualquer lugar para andar (ou use o joystick fixo nos ajustes). No computador: WASD ou setas, `P`/`Esc` para pausar, `1`–`3` para escolher cartas.

## O que tem no protótipo

- **Mapa 1, Orla do Desespero (Rio):** corredor de calçadão de pedra portuguesa, com o morro e a favela à esquerda, a areia à direita (deixa mais lento) e ruas transversais a cada 48 m. A arena aberta antiga continua nos ajustes.
- **Arte provisória do mockup aprovado:** personagens, ícones, retrato, TV e logo em PNG transparente (`prototype/assets/`). Casas, quiosques e areia ainda são desenhados em código.
- Partida de **10 minutos**: a TV avisa do chefe aos 07:50 e o **Especulador Imobiliário** chega aos 08:00, vendendo lotes que fecham a arena.
- **Juninho** com 6 armas (Capacete Bumerangue, Chinelo Voador, Boleto Atrasado, Carimbo Oficial, Maleta de Dinheiro, Microfone de TV), 6 passivas e 1 evolução (**Entrega Expressa**).
- 4 famílias de inimigos (Telespectador Hipnotizado, que acorda em vez de morrer; Golpista Digital e seus Perfis Falsos, Burocrata-Monstro, Fiscal do Impossível), a elite Político Corrupto e o Rival Patrocinado.
- **Índice de Caos** como diretor de hordas, com quatro faixas: Normalidade Suspeita, Crise, Colapso Institucional e Estado de Calamidade.
- **Corrupção:** 3 propostas com ganho e custo explícitos, Propina opcional e um veredito no fim ("Inocente (por enquanto)" … "Virou o sistema").
- **TV Caos:** ticker com manchetes contextuais e a Audiência como número.
- **Anúncios simulados** (modelo gratuito com publicidade):
  - segunda chance ao morrer, com anúncio recompensado;
  - troca de cartas por anúncio;
  - intervalo comercial entre partidas, com regras de frequência;
  - banner opcional só nos menus;
  - simulação da compra "Sem anúncios".
  No app, o simulador é trocado pelo AdMob (ver `docs/MONETIZACAO_ANUNCIOS.md`).
- **Ajustes de teste** para as hipóteses abertas: escala do protagonista e dos inimigos, inclinação e rotação da câmera, joystick flutuante ou fixo, limite de inimigos, gore, flashes, tremor, FPS e começar direto numa proposta ou no chefe.
- Ao fim, **métricas em JSON** para copiar: tempo, causa da derrota, decisões, FPS médio, pior quadro e aparelho.

Tudo é placeholder: bonecos geométricos com silhuetas distintas, sem assets externos. Os números de balanceamento estão em `prototype/src/config.js`.

## Estrutura do código

```
prototype/src/
  config.js     conteúdo e balanceamento (inimigos, armas, eventos, falas da TV, regras de anúncio)
  ads.js        anúncios: provedor simulado + regras de frequência e registro
  game.js       simulação (sem DOM, roda também no Node para testes)
  camera.js     projeção 2.5D com inclinação/rotação e escala por % da área jogável
  weapons.js    armas automáticas e projéteis
  upgrades.js   cartas de melhoria, passivas e evolução
  spatial.js    grade espacial para colisões com centenas de unidades
  render.js     Canvas 2D (sprites pré-desenhados em cache)
  ui.js         HUD, TV Caos, cartas, propostas e telas
  input.js      joystick virtual e teclado
  main.js       laço do jogo e ligação entre as partes
```
