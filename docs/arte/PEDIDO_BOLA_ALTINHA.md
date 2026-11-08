# Pedido de arte: a Bola da Altinha (08/11/2026)

> **Já feita no Figma (D70).** A bola do jogo é renderizada em 3D com os materiais gerados no Figma (`tools/render-bola.py`, originais em `docs/arte/objetos_figma/bola_*.webp`). Este pedido fica como alternativa, se o autor quiser uma versão pintada à mão.

**O que acontece hoje.** A Bola da Altinha (a relíquia da Orla, D67) é desenhada em código: um círculo branco com três manchas pretas. Aparece em três lugares: parada no alto da torre do salva-vidas, voando até o Juninho na cena de achar e gigante no Golaço. O autor achou tosca.

**O que o autor pediu.** Uma bola bem feita, com cara de bola de futebol e cara de arma também. É a mesma bola na torre, girando, e na bola gigante.

**A ideia da bola.** Uma bola de couro de futebol de rua, velha e lendária, reforçada como uma arma:

- os gomos brancos são de couro gasto, ralado de asfalto e areia;
- os gomos escuros são chapas de aço escuro, presas com rebites;
- as costuras são de fio dourado grosso;
- tem uma faixa de fita verde e amarela enrolada, já gasta.

Em repouso, é uma relíquia adormecida. **Acordada** (no Golaço), as chapas de aço se levantam um pouco e mostram cravos de aço curtos e arredondados por baixo. As costuras douradas racham e mostram um miolo dourado brilhante, como se a bola estivesse carregada de energia. Sem marca, sem escudo, sem número.

**A animação.** Uma folha só, com 24 quadros:

| Quadros | Onde na folha | O que é | Onde aparece no jogo |
| --- | --- | --- | --- |
| 1 a 12 | linhas 1 e 2 | A relíquia **adormecida**, girando como num toca-discos (eixo em pé), uma volta inteira | Na torre do salva-vidas, voando na cena de achar, ícone do botão |
| 13 a 24 | linhas 3 e 4 | A bola **acordada**, rolando para a frente (para baixo na tela), uma volta inteira | O Golaço, a bola gigante |

O jogo faz o tamanho (pequena na torre, gigante no Golaço), a sombra, o quique, a luz e o brilho em volta. A arte traz só a bola girando. Nada é girado nem espremido em código.

**Formato.**

- Igual ao das outras folhas: PNG 1536×1024, grade 6×4, células 256×256, fundo transparente.
- Quadros lidos da esquerda para a direita, de cima para baixo.
- A bola do mesmo tamanho e no mesmo lugar em todos os quadros: centrada na célula, com uns 210 px de diâmetro.

## Como pedir (ChatGPT)

1. Anexe a folha 1 da caminhada do Juninho (`Juninho_Completo_v3/caminhada/folhas/folha_1.png`). Ela serve só de referência de estilo, câmera e luz; a bola não leva nada dele.
2. Cole o pedido abaixo inteiro num pedido só.
3. Se vier com brilho ou aura em volta da bola (fora dela), peça a mesma folha de novo "sem brilho em volta, fundo transparente". O brilho de fora é o jogo que desenha. O miolo dourado aparecendo nas rachaduras da bola acordada pode ficar: faz parte da bola.

## Pedido para colar

````text
Preciso de uma arte nova para o jogo BRASIL ESTADO DE CAOS: a BOLA DA ALTINHA, uma relíquia lendária da praia que vira arma. É uma folha PNG 1536×1024 (grade 6×4, células 256×256, fundo transparente) com 24 quadros da bola girando: em cima ela adormecida, embaixo ela acordada. Anexo uma folha do protagonista só como referência de estilo, câmera e luz. Entregue um zip "Bola_Altinha_v1" com folhas/folha_1.png, uma prévia animada de cada linha e o prompt usado.

PROMPT:
Game sprite sheet of a single legendary FOOTBALL that is also a WEAPON, for a 90s-arcade style mobile game set on a Rio de Janeiro beach. The attached sheet is a STYLE, CAMERA and LIGHT reference only. Design: a heavy old street football in the classic 32-panel layout, but built like a weapon. The light panels are worn off-white LEATHER, scuffed by asphalt and sand, with scratches and dents. The dark panels are DARK STEEL PLATES fixed with small rivets at the corners. All seams are thick GOLDEN stitching. A worn strip of GREEN AND YELLOW tape wraps once around the ball. It looks heavy, battle-worn and legendary, like a relic that has seen a thousand street games. No brand, no logo, no crest, no numbers, no text.
Style: digitized 90s arcade look, near-photographic leather and metal, saturated colors, warm late-afternoon sunlight from the UPPER LEFT, highlight on the upper left of the ball, darker lower right. Camera: the same high elevated orthographic view as the reference, looking down at 50 degrees, no perspective distortion.
EXACT 1536x1024 PNG, 6 columns x 4 rows, 256x256 cells, 24 frames read left to right, top to bottom. The ball is the SAME SIZE and in the SAME PLACE in every cell: centered at cell point x128, y128, about 210 px in diameter, whole ball inside the cell with clear margin.
ROWS 1 AND 2 (frames 1 to 12): the DORMANT RELIC spinning like on a turntable, around its VERTICAL axis, 30 degrees per frame, one full turn, a seamless loop (frame 12 flows into frame 1). Steel plates flat and closed, golden seams intact.
ROWS 3 AND 4 (frames 13 to 24): the AWAKENED WEAPON BALL ROLLING FORWARD (rolling toward the bottom of the screen, around a horizontal axis), 30 degrees per frame, one full turn, a seamless loop (frame 24 flows into frame 13). Awakened: the steel plates are raised a little and short, thick, ROUNDED steel studs stick out between them (blunt, not sharp spikes, it is still a ball); the golden seams are cracked open and show a BRIGHT GOLDEN glowing core inside the cracks. The same ball as rows 1 and 2, the same size.
Big clear change between frames so the spin reads at small size. True alpha transparency: all empty areas alpha 0, opaque ball, clean edges. NO glow or aura OUTSIDE the ball, NO light rays, NO sparkles, NO motion blur, NO speed lines, NO cast shadow, NO ground, NO background, NO text, numbers, labels or grid lines. 24 cells in an exact 6x4 grid.

Antes de entregar, confira:
- é a mesma bola nos 24 quadros, do mesmo tamanho e no mesmo lugar;
- linhas 1 e 2: gira em pé, fechada, e o quadro 12 emenda no 1;
- linhas 3 e 4: rola para a frente, com os cravos redondos e o miolo dourado nas rachaduras, e o quadro 24 emenda no 13;
- tem cara de bola de futebol E de arma;
- sem marca, escudo, número ou texto;
- sem brilho fora da bola, sem sombra, fundo transparente, nada cortado.
````

## Quando o pacote chegar (proposta de jogo)

1. Confiro a folha (os laços sem pulo, o tamanho igual, o fundo) e monto o atlas.
2. **Na torre do salva-vidas:** a bola adormecida gira devagar e flutua um pouco acima do deque, com o facho de luz subindo dela.
3. **Na cena de achar:** a bola adormecida gira rápido enquanto voa e mergulha no Juninho.
4. **No Golaço:** a bola acordada, gigante, roda no ritmo do quanto ela anda, com o quique, a sombra e o brilho dourado em volta, que são do jogo.
5. **No botão da super:** o quadro 1 vira o ícone.
6. A bola desenhada em código sai dos três lugares.
