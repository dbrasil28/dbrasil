# Skills de "equipe de games" para Claude Code

> **Instalado em 06/11/2026:** as skills do GameForge e os 3 agentes de design do Game Studios estão em `.claude/`, sem hooks. Origem e alterações em `.claude/README.md`; uso em `CLAUDE.md`.

Pesquisa feita em 06/11/2026 para três papéis: **Construtor** (programação), **Designer** (GDD, sistemas, balanceamento) e **QA** (testes, playtest, regressão). Estrelas, licenças e datas foram conferidas na API de busca do GitHub. O conteúdo das skills foi lido nos READMEs e em alguns arquivos SKILL.md de amostra.

## Ranking

| # | Repositório | Estrelas | Último push | Licença | Cobertura dos 3 papéis |
| --- | --- | --- | --- | --- | --- |
| 1 | [AlterLab-IEU/AlterLab_GameForge](https://github.com/AlterLab-IEU/AlterLab_GameForge) | 52 | 06/11/2026 | MIT | Boa nos três; serve para JS/Canvas agora e para Godot/Unity depois |
| 2 | [Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) | 35.878 | 19/10/2026 | MIT | Designer e QA muito fortes; Construtor só Godot/Unity/Unreal |
| 3 | [MRCalderon3D/everything-game-dev-code](https://github.com/MRCalderon3D/everything-game-dev-code) | 104 | 09/10/2026 | MIT | Ampla; tem agentes de mobile/F2P e regras para web/Canvas |
| 4 | [gamedev-skills/awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills) | 7.070 | 28/10/2026 | Apache-2.0 | Construtor forte depois de escolher a engine; Designer e QA fracos |

**1. AlterLab GameForge.** Plugin com 41 skills, 11 subagentes e 7 hooks.
- Construtor: `game-vibe-code` (spec → código → verificação com Playwright → commit) e `game-web2d-specialist` (Phaser/Pixi, com notas de toque em celular). Também tem especialistas em Godot e Unity.
- Designer: `game-designer`, `game-gdd-author`, `game-economy-designer` e `game-balance-check`, que roda simulações de balanceamento.
- QA: `game-qa-lead` (Vitest/Playwright, GUT/gdUnit4, testes de Unity) e `game-playtest`.
- Pontos fracos: projeto pequeno e novo. As skills são longas (20–28 KB cada), então gastam bastante contexto.

**2. Claude Code Game Studios.** Template com 49 agentes, 70+ skills e 15 hooks. O mais popular, de longe.
- Designer e QA são os mais completos: `game-designer`, `systems-designer`, `economy-designer`, `/balance-check`, `/qa-plan`, `/smoke-check`, `/regression-suite`, `/playtest-report`.
- Pontos fracos:
  - o Construtor não cobre web/JS;
  - é um template que assume o repositório inteiro (CLAUDE.md, `.claude/`, estrutura de pastas);
  - exige Python e bash;
  - há reclamações de custo de tokens nas issues.

**3. everything-game-dev-code.** 42 agentes, entre eles `gdd-designer`, `gameplay-programmer`, `qa-lead`, `playtest-analyst` e `mobile-f2p-analyst`. É um scaffold grande, com mais de 100 regras e hooks via npm.

**4. awesome-gamedev-agent-skills.** 77 skills com versão de engine fixada (`prototype-fast`, `game-feel`, `performance-optimization`). É a melhor opção para o Construtor quando a engine de produção estiver escolhida.

**Promissores, mas imaturos:** [Xyloforge/claude-game-skills](https://github.com/Xyloforge/claude-game-skills), com Canvas, desempenho em celular e um guia de survivor-like, mas criado há 10 dias. [Bulugulu/game-qa](https://github.com/Bulugulu/game-qa), QA de jogo de navegador com Playwright, está na v0.1 e parado desde maio.

## Melhor por papel

| Papel | Escolha | Por quê |
| --- | --- | --- |
| Construtor | GameForge: `game-vibe-code` + `game-web2d-specialist` | Já cobre o protótipo em JS/Canvas; depois, as skills da engine escolhida (awesome-gamedev) |
| Designer | Agentes `game-designer`, `systems-designer` e `economy-designer` do Game Studios, copiados à parte, mais o `game-balance-check` do GameForge | Os mais profundos em sistemas e economia; o balance-check combina com `tools/balance-report.mjs` |
| QA | GameForge: `game-qa-lead` + `game-playtest` | Usa Playwright e testes em JS, como este repositório já faz |

## Recomendação

**AlterLab GameForge** como base, por ser o único que cobre bem os três papéis e já funcionar com o protótipo atual. Do Game Studios, copiar só os 3 agentes de design (adaptados ao nosso GDD), em vez de instalar o template inteiro.

Antes de instalar qualquer um:
- ler os **hooks**, que rodam comandos automaticamente a cada ação;
- começar com poucas skills ativas, por causa do custo de contexto;
- não adotar modos de "rigor total" que geram dezenas de documentos antes do código. Este projeto já tem GDD, e o gargalo agora é testar no celular.
