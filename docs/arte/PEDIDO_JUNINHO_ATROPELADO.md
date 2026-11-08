# Pedido de arte: Juninho atropelado (08/11/2026)

**O que acontece hoje.** Quando o carro pega o Juninho, ele leva dano e é empurrado 1 m para o lado, de pé, com a caminhada de sempre.

**O que o autor pediu.** Ao ser atropelado, ele é jogado longe, cai de costas no chão, rola e depois levanta.

**A animação.** São 12 quadros, de "levou a pancada" até "de pé de novo", em 8 direções de voo:

| Direção | Para onde ele voa na tela |
| --- | --- |
| 0° | para baixo (vem para a câmera) |
| 45° | baixo-direita |
| 90° | direita |
| 135° | cima-direita |
| 180° | para cima (vai para longe) |
| 225° | cima-esquerda |
| 270° | esquerda |
| 315° | baixo-esquerda |

O jogo move o boneco pelo caminho do voo (o arco no ar e a distância). A arte traz o corpo girando, caindo e rolando, quadro a quadro. Nada é girado em código.

**Formato.**

- Igual ao das outras folhas: PNG 1536×1024, grade 6×4, células 256×256, fundo transparente.
- Cada folha tem 2 direções. A direção A fica nas linhas 1 e 2 (quadros 1 a 6 e 7 a 12); a direção B, nas linhas 3 e 4.
- São 4 folhas no total.

## Como pedir (ChatGPT)

1. Anexe as 4 folhas da caminhada do Juninho (`Juninho_Completo_v3/caminhada/folhas/folha_1..4.png`). Elas servem de referência de rosto, roupa, câmera e escala.
2. Faça uma folha por pedido, na ordem 1, 2, 3, 4. Cole o prompt base e depois a linha da folha.

Se o ChatGPT recusar por causa do carro, a frase "no vehicle drawn, slapstick knockdown" costuma resolver. O carro não aparece na arte: é o jogo que desenha.

## Pedido para colar

````text
Preciso de um pacote novo do Juninho, protagonista do jogo BRASIL ESTADO DE CAOS: a animação de QUANDO O CARRO PEGA ELE. Ele é jogado longe, cai de costas, rola e levanta. São 12 quadros em 8 direções de voo, em 4 folhas PNG 1536×1024 (grade 6×4, células 256×256, fundo transparente), duas direções por folha. Anexo as 4 folhas da caminhada dele como referência de rosto, roupa, câmera e escala. Faça uma folha por vez, com o prompt base + a linha da folha. Entregue um zip "Juninho_Atropelado_v1" com folhas/folha_1.png a folha_4.png, uma prévia animada de cada direção e os prompts usados.

PROMPT BASE (igual nas 4 folhas):
Game knockdown animation sprite sheet of Juninho, from the attached walking sheets (identity, camera and scale reference only). The same young delivery man: short dark hair, invented face, worn RED shirt with black details, GRAY cargo trousers with red kneepads, boots, RED square thermal delivery backpack with black straps, no logo; his red motorcycle helmet hangs from his belt on his right hip by its strap. Classic 90s beat 'em up slapstick KNOCKDOWN: he has just been struck by a car (no vehicle drawn), is thrown through the air, lands on his BACK, rolls over and gets back up. No blood, no wounds, comic arcade pain expression. Digitized 90s arcade near-photographic style, the same as the reference. Fixed HIGH ELEVATED ORTHOGRAPHIC camera looking DOWN at 50 degrees, the same camera, scale and warm upper-left light as the reference sheets.
EXACT 1536x1024 PNG, 6 columns x 4 rows, 256x256 cells. Rows 1 and 2 are THROW DIRECTION A, rows 3 and 4 are THROW DIRECTION B. Each direction is TWELVE CONSECUTIVE FRAMES read left to right: frames 1 to 6 in the first row, frames 7 to 12 in the second row. THROW DIRECTION is the way his body flies on the SCREEN; it stays the same for all 12 frames of that direction.
1 HIT: the impact jolts him, back arched, arms flung up, head snapped, feet just leaving the ground, pain face.
2 LAUNCH: body flying in the throw direction, tilting backward, legs swinging up, arms flailing.
3 AIRBORNE: body almost horizontal in the air, BACK facing the ground, arms and legs spread.
4 FALLING: shoulders dropping first, about to hit the ground on his back.
5 LANDS ON HIS BACK: flat on his back on the ground with the backpack under him, arms and legs bouncing up from the impact, feet pointing in the throw direction.
6 ROLL: momentum rolls him over sideways onto his side, knees pulled in.
7 ROLL END: face down on his stomach, sprawled.
8 STUNNED: lying face down, head lifting, dizzy.
9 PUSH UP: pushing up on both hands, chest off the ground.
10 HANDS AND KNEES: on all fours, head shaking.
11 KNEEL: one knee down, one foot planted, hand on the knee, standing up.
12 UP AGAIN: standing upright, slightly hunched, one hand on his lower back, ready to walk again.
Frames 2, 3 and 4 are in the air: draw the body centered in the cell around y140, with no ground (the game lifts it). Frames 1 and 5 to 12 touch the ground: lying bodies rest on the ground line, centered at x128 around y200; standing frames keep the feet baseline at cell y240 and the pelvis at cell x128. Same body scale as the reference in every cell. Whole body, backpack, hands, feet and helmet inside every cell with 12px clear margin, never cropped, no overlap between cells. Big clear changes between frames, readable at small size. Do not mirror to invent views; keep the anatomical right side (helmet on the right hip). True alpha transparency: all empty areas alpha 0, opaque character, clean edges. NO ground, NO cast shadow, NO dust, NO motion blur, NO speed lines, NO impact stars, NO vehicle, NO background, NO text, numbers, labels or grid lines. 24 cells in an exact 6x4 grid.

LINHA DA FOLHA 1:
THROW DIRECTION A (rows 1-2): toward SCREEN DOWN, flying toward the viewer; we see his front as he flies and lands. THROW DIRECTION B (rows 3-4): toward SCREEN DOWN-RIGHT diagonal.

LINHA DA FOLHA 2:
THROW DIRECTION A (rows 1-2): toward SCREEN RIGHT, side view, flying from left to right. THROW DIRECTION B (rows 3-4): toward SCREEN UP-RIGHT diagonal, flying away from the viewer and to the right.

LINHA DA FOLHA 3:
THROW DIRECTION A (rows 1-2): toward SCREEN UP, flying straight away from the viewer. THROW DIRECTION B (rows 3-4): toward SCREEN UP-LEFT diagonal, flying away from the viewer and to the LEFT, NEVER to the right.

LINHA DA FOLHA 4:
THROW DIRECTION A (rows 1-2): toward SCREEN LEFT, side view, flying from right to left. THROW DIRECTION B (rows 3-4): toward SCREEN DOWN-LEFT diagonal, flying toward the viewer and to the left.

Antes de entregar, confira em cada folha:
- é o mesmo Juninho da caminhada, do mesmo tamanho;
- ele cai DE COSTAS no quadro 5;
- em cada direção ele voa sempre para o mesmo lado da tela;
- na folha 3, a direção B vai para a ESQUERDA;
- nada está cortado e o fundo é transparente.
````

## Quando o pacote chegar (proposta de jogo)

1. Monto o atlas e confiro o ângulo e a escala contra o chão do jogo.
2. **O voo.** Ao ser atropelado, ele voa uns 3 a 4 m no sentido do carro e para fora da faixa, num arco. Usa a direção mais perto do voo.
3. **Os quadros.** Toca os 12 quadros em uns 1,6 s: o voo nos quadros 1 a 4, o tombo e o rolamento nos quadros 5 a 7 e a subida nos quadros 8 a 12.
4. **O controle.** Nesse tempo o jogador não controla o Juninho e ele não leva outro golpe. Ser atropelado fica mais perigoso: a horda chega enquanto ele levanta.
5. Os números vão para `config.js`, para acertar no playtest.
