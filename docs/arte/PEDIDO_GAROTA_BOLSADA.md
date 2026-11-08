# Pedido: bolsada da garota (08/11/2026)

**O problema.** No pacote `Prostituta_v1`, o "ataque" é uma pose parada por direção, e ficou só com os braços abertos e a bolsa baixa. Não parece um golpe. A "raiva" também é de braços abertos. No jogo ela bate com a bolsa em quem chega colado (`figurantes.js`, `luta`), e hoje isso aparece como "abre os braços".

**O que pedir.** Uma animação de bolsada com 6 quadros em 16 direções, no mesmo formato do ataque do Juninho (`Juninho_Ataque_16_Angulos_6_Quadros_v2`):

- 4 folhas PNG 1536×1024;
- grade 6×4, com células 256×256;
- uma direção por linha e os 6 quadros do golpe nas colunas.

O jogo monta o atlas com `tools/montar-atlas.py`, igual à caminhada.

**Como pedir no ChatGPT.**

1. Anexe a folha de caminhada correspondente como referência de rosto, roupa e direção das linhas. Para a folha 1 do golpe, anexe `Prostituta_v1/caminhada/folhas/folha_1.png`; para a 2, a `folha_2.png`; e assim por diante.
2. Cole o pedido abaixo.

Os prompts das imagens ficam em inglês, que funciona melhor.

## Pedido para colar

````text
Preciso de um pacote novo da personagem "Prostituta" do jogo BRASIL ESTADO DE CAOS: a animação de BOLSADA (ela bate com a bolsa), 16 direções × 6 quadros, no mesmo formato do pacote de caminhada dela (Prostituta_v1). A pose de ataque do pacote v1 ficou só de braços abertos: agora quero o golpe de verdade, com o braço levando a bolsa para trás e batendo para a frente.

Formato: 4 folhas PNG 1536×1024, grade 6 colunas × 4 linhas, células 256×256, fundo transparente de verdade (alpha 0). Cada folha usa as MESMAS 4 direções da folha de caminhada de mesmo número (anexo como referência). Em cada linha, os 6 quadros seguidos do golpe, sem mudar de direção. Gere cada folha com a referência de caminhada correspondente e o prompt abaixo (base + linhas da folha).

Entregue um zip "Prostituta_Bolsada_v1" com folhas/folha_1.png a folha_4.png, uma prévia animada e os prompts usados. Pode dividir em partes.

PROMPT BASE (igual nas 4 folhas):
Game attack animation sprite sheet of the same fictional adult woman shown in the attached walking sheet (identity and row-orientation reference). Production sprites for Brazilian game BRASIL ESTADO DE CAOS. Digitized 1990s arcade near-photographic skin and fabric, slightly caricatured adult 7-head proportions. Fixed HIGH ELEVATED ORTHOGRAPHIC camera looking DOWN at 50 degrees above horizontal, same camera, scale and warm upper-left light as the reference, three-quarter top-down game view, NOT eye-level. SUBJECT exactly as reference: fictional Brazilian adult woman age 32, medium brown skin, long voluminous black wavy hair, bold eyeliner, vivid red lipstick, large gold hoop earrings, fierce angry expression; opaque BLACK HIGH-NECK SLEEVELESS fitted top covering the entire torso and chest, BLUE HIGH-WAIST DENIM SHORTS ending at mid-thigh with full opaque coverage, red high-heeled sandals; ONE black handbag with a short strap held in her anatomical RIGHT hand in EVERY frame, readable size. Entirely clothed non-explicit adult game character, natural proportions.
EXACT 1536x1024 PNG, 6 columns x 4 rows, 256x256 cells. ONE fixed facing per row, the same four row orientations as the attached walking sheet. Each row contains SIX CONSECUTIVE FRAMES of a HANDBAG SWING melee hit, same facing for the whole row, she stays in place (no walking, no jumping, no displacement). Columns:
1 READY: bag hanging from RIGHT hand beside the hip, feet apart, knees slightly bent, glaring toward the heading.
2 WINDUP: RIGHT arm pulls the bag back and up behind the RIGHT shoulder, elbow high, torso twisted back, LEFT arm forward for balance, weight on the back foot.
3 SWING: torso rotates forward, RIGHT arm comes over at head height, bag beside the head moving toward the heading.
4 IMPACT (key frame): RIGHT arm fully extended toward the heading at chest height, bag at its farthest point IN FRONT of her in the facing direction, strap taut, front foot planted, body leaning into the hit. The bag sits clearly OUTSIDE the body silhouette in every direction, back views included.
5 FOLLOW-THROUGH: the arm keeps going across the body toward her LEFT hip, the bag swings past to her LEFT side, torso rotated, hair swinging.
6 RECOVER: returning to READY, bag back at the RIGHT hip.
Big readable arm and torso motion between frames: frames 1, 2 and 4 must look clearly different from each other. Never switch hands, never mirror poses to invent views. She hits the air only: no other character, no victim, no injury.
Same body scale in all cells, pelvis/root at cell x128, feet baseline at cell y240, full body, hair, hands and bag inside every cell with 12px clear margin, never cropped. True alpha transparency: all empty areas alpha 0, opaque character, clean natural antialiased edges. NO ground, NO cast shadow, NO background color, NO mist, NO glow, NO motion blur, NO speed lines or trails, NO text, numbers, labels or grid lines. 24 poses in an exact 6x4 grid.

LINHAS DA FOLHA 1 (referência: caminhada folha_1):
ROWS: row1 0deg FRONT facing the viewer, heading screen DOWN; row2 22.5deg mostly DOWN slightly RIGHT; row3 45deg DOWN-RIGHT diagonal; row4 67.5deg mostly RIGHT slightly DOWN.

LINHAS DA FOLHA 2 (referência: caminhada folha_2):
ROWS: row1 90deg RIGHT profile, nose points screen RIGHT; row2 112.5deg REAR-RIGHT view, back of clothes and head, nose toward screen RIGHT-UP; row3 135deg REAR-RIGHT 45 degree view, back of head and clothes, chest NOT visible, heading UP-RIGHT; row4 157.5deg nearly FULL BACK, no face or chest visible, heading mostly UP slightly RIGHT.

LINHAS DA FOLHA 3 (referência: caminhada folha_3):
ROWS: row1 180deg FULL BACK facing away, heading screen UP, the bag in her anatomical RIGHT hand appears on the SCREEN RIGHT side; row2 202.5deg heading UP and SCREEN LEFT, back of head mostly visible, nose toward SCREEN LEFT; row3 225deg heading UP-LEFT diagonal, back of clothes visible, nose toward SCREEN LEFT; row4 247.5deg mostly SCREEN LEFT slightly UP away. Rows 2, 3 and 4 face SCREEN LEFT, NEVER screen right. Keep the reference row orientations; change ONLY walking into the handbag swing.

LINHAS DA FOLHA 4 (referência: caminhada folha_4):
ROWS: row1 270deg LEFT profile, nose points screen LEFT; row2 292.5deg mostly LEFT slightly DOWN toward the viewer; row3 315deg DOWN-LEFT diagonal toward the viewer; row4 337.5deg mostly DOWN slightly LEFT.

Antes de entregar, confira em cada folha:
- a bolsa está na mão DIREITA dela em todos os quadros;
- no quadro 4 a bolsa aparece bem fora do corpo, na direção para onde ela olha;
- as linhas da folha 3 olham para a ESQUERDA da tela;
- nada está cortado e o fundo é transparente.
````

## Quando o pacote chegar

1. Monto o atlas de 16×6 com `tools/montar-atlas.py`, na mesma escala da caminhada, e confiro o ângulo contra o chão do jogo.
2. No jogo, a bolsada toca os 6 quadros em uns 0,4 s. O dano entra no quadro 4.
3. Enquanto espera a horda chegar perto, ela fica no quadro 1 (pronta, bolsa na mão), no lugar dos braços abertos.
4. Os braços para cima ficam só para o "+1 NO GRUPO".
