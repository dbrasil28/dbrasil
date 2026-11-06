# Skills e agentes de terceiros

Cópias revisadas de dois projetos com licença MIT. Os textos das licenças estão em `gameforge/LICENSE` e `agents/LICENSE-claude-code-game-studios`.

## AlterLab GameForge

- Origem: https://github.com/AlterLab-IEU/AlterLab_GameForge
- Commit: `aff1a3a58613a2b78d4b7a5224f29c86414aff85` (06/11/2026)
- © 2026 Cem Ipek, AlterLab Creative Technologies Laboratory, licença MIT

Copiado:

- Skills em `skills/`: `game-vibe-code`, `game-web2d-specialist`, `game-designer`, `game-gdd-author`, `game-economy-designer`, `game-balance-check`, `game-qa-lead`, `game-playtest`.
- Guias e modelos que essas skills citam, em `gameforge/`: `docs/`, `templates/` e `genre-packs/roguelike/`.

Alterações:

- `${CLAUDE_PLUGIN_ROOT}` trocado por `.claude/gameforge` e `/gameforge:` por `/`, porque aqui as skills não rodam como plugin.
- `game-vibe-code`: removidos `Bash(npm create *)` e `Bash(npm install *)` de `allowed-tools`. Instalar pacotes volta a pedir permissão.
- **Hooks não instalados.** O plugin tem 7 hooks que rodam scripts no início e no fim da sessão, em cada comando e em cada edição. Eles servem à estrutura de pastas do próprio template.

## Claude Code Game Studios

- Origem: https://github.com/Donchitos/Claude-Code-Game-Studios
- Commit: `05ad7c8a5b8aa2aa86bbd3439ae7cf7295cac418` (19/10/2026)
- © 2026 Donchitos, licença MIT

Copiado: os agentes `game-designer` (renomeado para `lead-game-designer`, para não confundir com a skill de mesmo nome), `systems-designer` e `economy-designer`, em `agents/`.

Alterações:

- No início de cada agente entrou um bloco de contexto com os caminhos deste repositório.
- `skills: [balance-check]` trocado por `skills: [game-balance-check]`.
- As referências a `game-designer` passaram a `lead-game-designer`.

## Atualizar

Baixe de novo o commit desejado, revise o que mudou e copie apenas estes arquivos, refazendo as alterações acima. Não instale os hooks sem ler os scripts.
