# Roteiro de playtest — Fase 0

Objetivo: responder às perguntas da Fase 0 em aparelho real. É divertido sem arte? A escala e o controle funcionam numa tela de ~6"? O desempenho aguenta as hordas?

## Preparação

- 3 a 5 pessoas, de preferência com pelo menos uma que não conheça o gênero.
- Pelo menos um **Android de entrada** (2–4 GB de RAM) e um iPhone.
- Abra o protótipo pelo link ou rode `npm start` e acesse o endereço da rede local mostrado no terminal.
- Brilho no máximo em pelo menos uma sessão, de preferência ao ar livre (o pacote pede esse teste de brilho externo).
- Não explique nada além de "arraste o dedo para andar". Observe e anote.

## Sessões

| # | O que muda | Hipótese | Ajuste |
| --- | --- | --- | --- |
| 1 | Padrão | Base de comparação | nenhum |
| 2 | Joystick fixo | H07: flutuante é melhor que fixo | Controle → fixo |
| 3 | Escala menor | Protagonista a 8% ainda é legível? | Altura do protagonista → 8 |
| 4 | Isometria diamante | Ruas a 45° confundem o controle? | Rotação da câmera → 45° |
| 5 | Chefe direto | O Especulador se lê bem? | Começar a partida em → 07:45 |

Ao fim de **cada** partida, toque em **Copiar métricas do teste** e cole numa planilha ou mensagem. O JSON traz tempo, causa da derrota, decisões, momento das melhorias, FPS médio, pior quadro (1%), pico de inimigos, ajustes usados e aparelho.

## O que observar (anotar por pessoa)

**Controle e leitura**
- [ ] Entendeu como andar em menos de 10 s?
- [ ] Percebeu sozinha que os ataques são automáticos?
- [ ] Consegue dizer, olhando a tela, quem é o Juninho, quem é inimigo e o que é item?
- [ ] Viu o "!" do Burocrata antes da papelada? Conseguiu desviar?
- [ ] Entendeu por que perdeu XP quando o Fiscal encostou?
- [ ] Algum toque acidental nas cartas de melhoria?

**Ritmo e decisões**
- [ ] Tempo até a primeira escolha que pareceu interessante (anotar).
- [ ] Leu as propostas de Corrupção ou tocou na primeira opção?
- [ ] Conseguiu explicar o custo da escolha que fez?
- [ ] Pegou a Propina (moeda verde) de propósito?
- [ ] O ticker da TV atrapalhou a visão em algum momento?

**Desempenho e conforto**
- [ ] O aparelho esquentou? Em que minuto?
- [ ] Houve travadas perceptíveis? Em que momento (onda, chefe, muitos números de dano)?
- [ ] Pior quadro (1%) e FPS médio vindos do JSON.

**Diversão (perguntar no fim)**
- "De 1 a 5, quanto você quer jogar de novo agora?"
- "O que foi mais engraçado? O que incomodou?"
- "Explique em uma frase do que se trata o jogo."

## Critérios para sair da Fase 0

- A maioria entende o controle sem ajuda e distingue jogador, inimigo e item.
- FPS médio ≥ 50 e pior quadro (1%) ≤ 33 ms no Android de entrada com o limite de 300 inimigos (ou o limite onde isso acontece fica registrado).
- Nota mediana de "jogar de novo" ≥ 4.
- Decisão registrada sobre joystick (H07), escala (8–11%) e câmera.
