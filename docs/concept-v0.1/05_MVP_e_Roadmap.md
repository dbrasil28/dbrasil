# MVP, testes e roteiro de produção

## Objetivo da vertical slice
Validar se **mobile portrait + hordas + estética 2.5D digitalizada + sátira social** funciona na prática em aparelhos reais sem sacrificar legibilidade e desempenho.

## Proposta de escopo inicial (a validar)
- 1 personagem: Juninho.
- 1 arena: Centro do Desespero.
- 1 sessão de 10 minutos.
- 6 armas/upgrades simples e 1 evolução.
- 4 famílias de inimigos, 1 elite e 1 chefe (Especulador Imobiliário).
- 3 eventos sociais curtos com efeitos de gameplay.
- Caos e Corrupção em versão simplificada; Audiência como feedback narrativo antes de criar sistema complexo.
- 1 locutor fictício / TV Caos com frases contextuais; sem VO necessária no primeiro teste.
- Controles: movimento + autoataque + seleção de cartas.

## Fases sugeridas, sem estimativa de prazo
**Fase 0: teste de escala e controle.** Arena cinza com câmera vertical, um avatar, 50–150 unidades simples, joystick flutuante, colisões, saúde e XP. Objetivo: se o jogo é divertido sem arte.

**Fase 1: combate mínimo.** Famílias de inimigos, seis armas, upgrades, curva de spawn, VFX adaptativos e balanceamento.

**Fase 2: identidade.** Substituir placeholders por Juninho digitalizado e props brasileiros; implementar HUD reduzido e TV Caos.

**Fase 3: sátira sistêmica.** Corrupção, 3 escolhas/efeitos, Caos e chefe que transforma arena.

**Fase 4: validação.** Rodar em aparelhos Android/iOS de faixas diferentes, verificar frame pacing, calor, memória, toque, clareza e duração das partidas.

## Backlog prioritário
| Prioridade | Tarefa | Critério de aceite de teste |
| --- | --- | --- |
| P0 | Camera portrait isométrica | personagem e ameaça legíveis com hordas |
| P0 | Joystick virtual | mover sem esconder informações essenciais |
| P0 | Hordas e desempenho | simulação estável no hardware-alvo definido |
| P0 | XP e upgrades | escolha clara com toque em uma mão |
| P1 | Juninho digitalizado | silhueta reconhecível a escala real |
| P1 | HUD enxuto | vida, tempo, caos e poderes claros |
| P1 | Armas evolutivas | progressão perceptível em 10 min |
| P1 | 1 evento Corrupção | escolha altera estratégia sem bloquear fluxo |
| P2 | Audiência avançada | sistema só se gerar valor mecânico |
| P2 | Fatality de chefe | espetáculo curto e controlado |

## Métricas exploratórias
- % de jogadores que compreendem como mover/atacar sem tutorial longo.
- % que distingue jogador, inimigo e pickup em tela pequena.
- Tempo até primeira decisão interessante de upgrade.
- Taxa de morte e principais causas de morte.
- Clareza dos custos das decisões de Corrupção.
- Queda de FPS e frame time em picos de inimigos.
- Duração de sessão e vontade de jogar novamente.

## Riscos
1. Multidão 2.5D + sprites grandes pode comprometer frame rate.
2. UI, numerais e TV podem ocultar espaço tático.
3. Gore e referências sociais podem afetar classificação etária/lojas.
4. Foto-realismo de atores exige pipeline consistente de animação e direções.
5. Mapas cheios de props aumentam custo de colisão e prejudicam leitura.
6. Três sistemas sociais simultâneos podem criar complexidade sem diversão.

## Questões de negócio (não definidas)
Preço, monetização, live ops, monetização cosmética ou anúncios, distribuição, orçamento, equipe e cronograma. Não assumir free-to-play por ser mobile.
