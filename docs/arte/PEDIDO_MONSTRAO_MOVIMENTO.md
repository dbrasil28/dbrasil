# Pedido de arte: mais movimento do Monstrão (08/11/2026)

**O problema.** O autor achou o Monstrão duro. A caminhada tem só 6 quadros e, como ele aparece com 3 vezes a altura do Juninho, cada salto de um quadro para o outro aparece. Entre um golpe e outro ele fica parado, congelado. E quando cai, some sem animação.

**O que pedir.** Três animações novas, nesta ordem de prioridade:

| # | Animação | Quadros | Direções | Folhas |
| --- | --- | --- | --- | --- |
| 1 | **Caminhada pesada**, com o corpo todo mexendo | 12 (dois passos completos) | 16 | 8 |
| 2 | **Morte**, em 3 variações (cai de costas, cai de joelhos e de cara, gira e desaba de lado) | 12 | 4 (frente, direita, costas, esquerda) | 6 |
| 3 | **Parado**, respirando forte e se exibindo | 6, em laço | 16 | 4 |

**Formato de todas as folhas:**

- PNG 1536×1024, grade 6×4, células 256×256;
- fundo transparente, ou verde puro #00FF00 se a ferramenta não fizer transparente;
- o mesmo Monstrão das folhas de hoje, do mesmo tamanho (uns 215 px de altura de pé).

**Referências para anexar:** as 4 folhas da caminhada atual, `docs/arte/personagens_figma/monstrao/folha_1_figma.png` a `folha_4_figma.png`. Anexe a de número igual ou a mais próxima da direção da folha pedida. Servem para o rosto, a roupa, a câmera e o tamanho.

**Atenção às direções de 202,5°, 225° e 247,5°.** Elas andam de costas para a **esquerda** da tela. É o erro que mais aparece nos pacotes.

## BASE (cole no começo de todo pedido)

```text
Production game sprite sheet for the mobile game BRASIL: ESTADO DE CAOS. Character: MONSTRÃO, the SAME fictional giant Brazilian beach bodybuilder as the attached reference sheets (identity, outfit, camera and scale reference). Huge exaggerated bodybuilder physique: massive shoulders and chest, very thick arms and neck, V-shaped torso, head small in proportion to the body, thick legs. Deeply tanned skin shiny with tanning oil, veins on arms and neck. Short dark hair shaved on the sides, heavy jaw, angry cocky expression. WHITE tank top with deep side cuts, stretched tight and sweat-darkened. ROYAL BLUE swim briefs. Thick GOLD chain necklace. Black fingerless gym gloves. Black flip-flops. NOTHING green on the character.
Style: 90s digitized arcade fighter look, near-photographic skin and fabric, saturated colors, slightly caricatural but not cartoon, warm late-afternoon sunlight from the upper left.
Camera: elevated orthographic 3/4 view, about 50 degrees above the ground, no perspective distortion, EXACTLY the same camera and scale as the reference sheets.
Direction angles: 0 = facing the camera, 90 = facing screen right, 180 = back to the camera, 270 = facing screen left (clockwise). 202.5, 225 and 247.5 face away from the camera toward SCREEN LEFT, never screen right.
EXACT 1536x1024 image, 6 columns x 4 rows, 256x256 cells. Transparent background (alpha 0) everywhere outside the character. No floor, no cast shadow, no glow, no dust, no motion lines, no text, letters, numbers, logos or brands. Whole body inside each cell with 12 px padding, never cropped, no overlap between cells, no mirroring, the same person and the same size in every cell.
```

## 1. Caminhada pesada (8 folhas)

Cada folha tem 2 direções. A direção A ocupa as linhas 1 e 2; a direção B, as linhas 3 e 4. Os 12 quadros de cada direção são lidos da esquerda para a direita: os quadros 1 a 6 na primeira linha e os 7 a 12 na segunda.

```text
HEAVY WALK CYCLE, 12 frames per direction (two full steps), much more body movement than a normal walk: this giant is heavy and proud. Rows 1-2 = DIRECTION A (frames 1-6, then 7-12), rows 3-4 = DIRECTION B (frames 1-6, then 7-12). Same facing in all 12 frames of a direction, he walks in place (no displacement), feet on cell line y=240, pelvis centered on x=128, about 215 px tall standing.
1 RIGHT heel strikes the ground in front, left leg straight behind, torso twisted so the LEFT shoulder is forward, arms held out wide by the huge lats.
2 the weight crashes onto the right leg: knee bends deep, the whole body drops to its lowest point, chest and shoulders bounce, head bobs down, gold chain swings.
3 pushing up on the right leg, left heel peeling off the ground behind.
4 PASSING: left leg swings forward under the body, body at its highest point, shoulders level, chest puffed.
5 left leg reaching forward, torso rotating the other way, right arm swinging forward.
6 left heel about to strike, shoulders rolled, leaning slightly to the side (side-to-side sway).
7 LEFT heel strikes (the mirror moment of frame 1, done with the other leg), RIGHT shoulder forward.
8 the weight crashes onto the left leg, deep knee bend, body lowest, chest bounce, head bob.
9 pushing up on the left leg, right heel peeling off.
10 PASSING with the right leg, body highest.
11 right leg reaching forward, torso rotating back.
12 right heel about to strike, flowing back into frame 1.
Big readable changes between frames: rolling shoulders, swinging arms, twisting torso, bobbing head, side-to-side sway, flip-flops slapping. Never two identical frames, no floating, at least one foot always on the ground.
```

Linha final de cada folha (cole depois do bloco acima):

| Folha | Linha |
| --- | --- |
| 1 | `DIRECTION A = 0 (facing the camera). DIRECTION B = 22.5.` |
| 2 | `DIRECTION A = 45. DIRECTION B = 67.5 (almost right profile).` |
| 3 | `DIRECTION A = 90 (right profile). DIRECTION B = 112.5 (back-right).` |
| 4 | `DIRECTION A = 135 (back-right). DIRECTION B = 157.5 (almost full back).` |
| 5 | `DIRECTION A = 180 (full back). DIRECTION B = 202.5 (walking away toward SCREEN LEFT).` |
| 6 | `DIRECTION A = 225 (back-left, toward SCREEN LEFT). DIRECTION B = 247.5 (almost left profile, nose to SCREEN LEFT).` |
| 7 | `DIRECTION A = 270 (left profile). DIRECTION B = 292.5 (front-left).` |
| 8 | `DIRECTION A = 315 (front-left). DIRECTION B = 337.5 (almost facing the camera).` |

## 2. Morte, 3 variações (6 folhas)

Cada folha tem uma variação em 2 direções, no mesmo esquema de linhas: direção A nas linhas 1 e 2, direção B nas linhas 3 e 4. Os 12 quadros vão da pancada final até ele estirado no chão.

```text
DEATH ANIMATION, 12 frames per direction, the giant boss is defeated and collapses. Rows 1-2 = DIRECTION A (frames 1-6, then 7-12), rows 3-4 = DIRECTION B (frames 1-6, then 7-12). DIRECTION is the way he faces when the final blow lands. Comic arcade defeat, no blood, no wounds: at the end he lies knocked out with eyes closed and tongue slightly out. Standing frames keep the feet on cell line y=240 at x=128; once he is falling or lying, shift the body so the WHOLE body stays inside the cell (the game moves him), lying body centered in the cell. About 215 px tall standing, the same scale in every frame. Big clear changes between frames, readable at small size.
```

Linha da variação (cole uma por folha, depois do bloco acima):

- **Variação 1, cai de costas:** `VARIATION: FELLED TREE. 1 the final blow snaps his head back, 2 he staggers back one step, arms flailing, 3 eyes roll up, 4 knees lock and he tips backward stiff as a tree, 5 falling, 6 his back slams flat on the ground, arms and legs bounce up, 7 the body bounces once, 8 settles, 9 one arm twitches, 10 the leg twitches, 11 the chest heaves a last time, 12 lying flat on his back, knocked out.`
- **Variação 2, cai de joelhos e de cara:** `VARIATION: KNEES THEN FACE. 1 the final blow hits his gut, 2 he doubles over clutching his belly, 3 his knees buckle, 4 he drops on both knees, 5 kneeling, swaying, arms hanging, 6 his eyes cross, 7 he tips forward, 8 he falls face down with his arms at his sides, 9 his face hits the ground, the butt sticks up, 10 his butt slowly sinks, 11 he lies flat face down, 12 lying face down, knocked out, one hand twitching.`
- **Variação 3, gira e desaba de lado:** `VARIATION: SPIN AND COLLAPSE. 1 the final blow hits his jaw, 2 his head whips to the side, 3 he spins a quarter turn on one foot, 4 he spins further, arms flung out, 5 he wobbles, 6 his legs give way, 7 he falls sideways, 8 his shoulder hits the ground, 9 he rolls onto his side, 10 he rolls onto his back, 11 his arms flop out wide, 12 lying on his back, arms and legs spread, knocked out.`

Direções de cada folha (cole por último):

| Folhas | Linha |
| --- | --- |
| 1 de cada variação | `DIRECTION A = 0 (facing the camera). DIRECTION B = 90 (facing screen right).` |
| 2 de cada variação | `DIRECTION A = 180 (back to the camera). DIRECTION B = 270 (facing screen left).` |

## 3. Parado, respirando (4 folhas)

Uma direção por linha, 6 quadros em laço, as mesmas direções da caminhada de hoje: folha 1 = 0, 22,5, 45, 67,5; folha 2 = 90 a 157,5; folha 3 = 180 a 247,5; folha 4 = 270 a 337,5.

```text
IDLE LOOP, 6 frames per row, each ROW is one facing direction, the 6 COLUMNS are a seamless loop (frame 6 flows into frame 1). He stands with feet apart, breathing hard and showing off: 1 chest heaving in, shoulders rising, 2 chest fully puffed, lats spread wide, 3 he rolls his neck to one side, 4 he rolls it to the other side, fists clenching, 5 he exhales, shoulders drop, 6 he cracks his knuckles, back to the start. Feet never move: feet on cell line y=240, pelvis centered on x=128, about 215 px tall.
Rows from top to bottom: SHEET 1 = 0, 22.5, 45, 67.5.
```

Nas folhas 2, 3 e 4, troque só a última linha por `SHEET 2 = 90, 112.5, 135, 157.5.`, `SHEET 3 = 180, 202.5, 225, 247.5.` e `SHEET 4 = 270, 292.5, 315, 337.5.`

## Conferir antes de mandar

- O mesmo Monstrão das folhas de hoje, do mesmo tamanho.
- Caminhada: nenhum quadro repetido e um pé sempre no chão.
- Direções de 202,5°, 225° e 247,5° de costas para a esquerda.
- Morte: ele termina inteiro dentro da célula.
- Fundo transparente, sem chão, sombra, poeira ou texto.

## Quando o pacote chegar

1. **Caminhada.** A de 12 quadros entra no lugar da atual, na mesma velocidade de passo, só que com o dobro de quadros.
2. **Parado.** Toca nas pausas entre os golpes, no lugar da pose congelada.
3. **Morte.** Quando o Monstrão cai, o jogo sorteia uma das 3 variações e usa a direção mais perto de onde ele estava virado. Ele fica no chão uns segundos antes de a passagem abrir.
