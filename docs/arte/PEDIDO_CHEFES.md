# Pedido de arte: chefões

Pedido do autor (08/11/2026). Chefão da Orla: **Monstrão**, o fisiculturista gigante da academia ao ar livre do fim da praia (proposta que substitui o Especulador). O Chefe do Tráfico já tem caminhada, rajada e fúria (`personagens_figma/chefe_trafico/`); aqui entra só a pose extra da granada, se a fase 3 dele for aprovada.

## Como pedir

- **Onde:** Figma (modelo GPT Image) ou ChatGPT. Uma imagem por pedido.
- **Cole sempre o bloco BASE** e, logo depois, o bloco da imagem.
- **Anexe as referências** do pacote (`referencias/`): as folhas do Chefe do Tráfico. Elas servem **só** para câmera, grade, ordem das direções e passada. O personagem é outro.
- **Fundo verde chapado (#00FF00):** o recorte (`tools/pacote-figma.py`) tira o verde. Por isso o personagem não pode ter nada verde.
- **Ângulo:** a mesma câmera das folhas de referência, de cima, uns 50° acima do chão, sem perspectiva. É o ângulo da horda e do Juninho no jogo. Nunca de frente na altura do olho nem de baixo para cima.

## Lista de imagens

| # | Arquivo | O que é | Uso no jogo |
| --- | --- | --- | --- |
| 1–4 | `monstrao_caminhada_1..4.png` | Caminhada, 16 direções (4 por folha), 6 quadros | Andando atrás do Juninho |
| 5 | `monstrao_preparo.png` | Abaixado, ombro à frente | Aviso da investida (0,8 s) |
| 6 | `monstrao_investida.png` | Correndo de ombro | Investida |
| 7 | `monstrao_agachamento.png` | Socando o chão de cócoras | Pisão com onda de choque |
| 8 | `monstrao_anilha.png` | Braço para trás com a anilha | Arremesso da anilha |
| 9 | `monstrao_levanta.png` | Dois braços acima da cabeça, mãos vazias | Arranca o carro (o jogo põe o carro nas mãos) |
| 10 | `monstrao_pose.png` | Pose de fisiculturista (duplo bíceps) | Hora de bater, depois da investida |
| 11 | `monstrao_tonto.png` | Cambaleando, mão na testa | Tonto depois de bater em carro ou poste |
| 12 | `anilha.png` | A anilha de ferro sozinha | Projétil que rola pela areia |
| 13 | `chefe_trafico_granada.png` (opcional) | Chefe do Tráfico jogando granada | Fase 3, se aprovada |

Medidas no jogo: o Monstrão aparece com 3 vezes a altura do Juninho. Nas folhas ele tem o mesmo tamanho dos outros personagens nas células; o jogo aumenta.

## BASE (cole antes de cada pedido do Monstrão)

```
Production game sprite sheet for the mobile game BRASIL: ESTADO DE CAOS. Character: MONSTRÃO, a fictional giant Brazilian beach bodybuilder, the boss of the beach level. Huge exaggerated bodybuilder physique: massive shoulders and chest, very thick arms and neck, V-shaped torso, head small in proportion to the body, thick legs. Deeply tanned skin shiny with tanning oil, veins visible on arms and neck. Short dark hair shaved on the sides, heavy jaw, angry and cocky expression. WHITE tank top with deep side cuts, stretched tight and sweat-darkened. ROYAL BLUE swim briefs. Thick GOLD chain necklace. Black fingerless gym gloves. Black flip-flops. NOTHING green on the character.
Style: 90s digitized arcade fighter look, near-photographic textures of skin and fabric, saturated colors, slightly caricatural but not cartoon, warm late-afternoon sunlight from the upper left.
Camera: elevated orthographic 3/4 view, about 50 degrees above the ground, no perspective distortion. EXACTLY the same camera, scale, grid and foot baseline as the attached reference sheets. Use the references ONLY for camera, grid, row/cell direction order and gait. Do NOT copy the reference character.
Direction angles: 0 = facing the camera, 90 = facing screen right, 180 = back to the camera, 270 = facing screen left (clockwise: 22.5 is between front and right).
Background: flat pure green #00FF00 everywhere, no gradient, no texture. No floor, no cast shadow, no glow, no dust, no motion lines, no text, letters, numbers, logos or brands. Whole body inside each cell with padding, no overlap between cells, no mirroring, same person and same size in every cell.
```

## Caminhada (4 imagens)

Anexe `referencias/chefe_trafico_caminhada_1.png` (ou a folha de mesmo número).

```
WALK CYCLE sheet. EXACT 1536x1024 image, 6 columns x 4 rows, 256x256 cells. Each ROW is one facing direction; the 6 COLUMNS are consecutive frames of one heavy, swaggering walk cycle: arms held away from the body by the muscles, chest pushed forward, heavy flat-footed steps, slight side-to-side sway. Feet on cell line y=240, body centered on x=128, figure about 215 px tall in every cell.
Rows from top to bottom: SHEET 1 = 0, 22.5, 45, 67.5.
```

Nas folhas 2, 3 e 4, troque só a última linha:
- folha 2: `Rows from top to bottom: SHEET 2 = 90, 112.5, 135, 157.5.`
- folha 3: `Rows from top to bottom: SHEET 3 = 180, 202.5, 225, 247.5.`
- folha 4: `Rows from top to bottom: SHEET 4 = 270, 292.5, 315, 337.5.`

## Poses em 16 ângulos (7 imagens)

Anexe `referencias/chefe_trafico_ataque_16_angulos.png`. Cole a BASE, o bloco de grade e a linha da pose.

```
POSE SHEET. EXACT 1536x1024 image, 4 columns x 4 rows, 384x256 cells, ONE still pose per cell. The 16 cells are the 16 facing directions in reading order (left to right, top to bottom): 0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5. Same scale as the walk sheets, feet on cell line y=240, body centered in the cell, the whole pose turned toward the listed direction.
```

Linha de cada pose (cole depois do bloco de grade):

- **preparo:** `POSE: charge wind-up. Crouched low like a rugby player about to charge, leading shoulder forward, fists clenched, head down, glaring ahead, weight on the back foot.`
- **investida:** `POSE: full-sprint shoulder charge. Torso leaning forward about 30 degrees, leading shoulder in front, one foot off the ground, arms pumping, mouth open shouting.`
- **agachamento:** `POSE: ground slam at the moment of impact. Deep squat, knees wide, both fists together smashing the ground just in front of his feet, face strained. Draw no dust and no cracks.`
- **anilha:** `POSE: throwing a heavy round IRON weight plate (dark gray worn metal, hole in the middle, no letters or numbers). Throwing arm pulled far back holding the plate at shoulder height, the other arm pointing forward toward the target, torso twisted.`
- **levanta:** `POSE: lifting something huge overhead. Both arms raised straight above the head, hands open and wide apart as if gripping a long heavy object, knees bent, veins popping. Draw NOTHING in the hands (the game draws a car there).`
- **pose:** `POSE: classic front double-biceps bodybuilding pose. Both arms flexed, fists by the head, chest puffed out, proud grin.`
- **tonto:** `POSE: dazed after crashing into a car. Wobbling, knees buckling, one hand on the forehead, eyes half closed, mouth open. No stars or effects.`

## Anilha (projétil)

Sem a BASE:

```
Single game asset for the mobile game BRASIL: ESTADO DE CAOS: one heavy round IRON weight plate, dark gray worn metal with scratches and a hole in the middle, NO letters, numbers or logos. Standing on its edge, seen from the side, elevated orthographic 3/4 camera about 50 degrees above the ground, warm late-afternoon light from the upper left. EXACT 512x512 image, plate centered, about 300 px wide. Flat pure green #00FF00 background, no shadow, no floor, no text.
```

## Chefe do Tráfico: granada (opcional, só se a fase 3 for aprovada)

Anexe as folhas dele em `referencias/` (caminhada e ataque). Sem a BASE do Monstrão:

```
POSE SHEET for the mobile game BRASIL: ESTADO DE CAOS. EXACT SAME character as the attached Chefe do Tráfico sheets: same face, red and black striped shirt, black shorts, flip-flops, gold chain, sunglasses, same body and size. Same style, same camera (elevated orthographic 3/4, about 50 degrees), same scale and foot baseline as the attached sheets.
EXACT 1536x1024 image, 4 columns x 4 rows, 384x256 cells, ONE still pose per cell. The 16 cells are the 16 facing directions in reading order: 0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5 (0 = facing the camera, 90 = facing screen right, 180 = back, 270 = facing screen left).
POSE: overhand grenade throw. Rifle held low in the left hand, right arm swung forward at the moment of release, a small dark generic grenade (no markings) just leaving the fingers, body leaning into the throw.
Flat pure green #00FF00 background, no floor, no shadow, no glow, no text or brands, no mirroring.
```

## Conferir antes de mandar

- As direções na ordem certa: na folha 1 da caminhada, a primeira linha vem de frente para a câmera; na folha de poses, a primeira célula de frente e a quinta virada para a direita da tela.
- A câmera igual à das referências: dá para ver o alto da cabeça e dos ombros, e os pés ficam na mesma linha em todas as células.
- O mesmo homem, a mesma roupa e o mesmo tamanho em todas as imagens.
- Nada verde no personagem e nenhum texto, número ou marca, nem na anilha.
- Mãos vazias na pose `levanta`.

## Depois que chegar

`tools/pacote-figma.py` tira o verde e monta o pacote; `tools/montar-atlas.py` faz o atlas da caminhada e `tools/montar-poses.py` as poses. O ângulo é medido contra o chão do jogo antes de publicar.

## Situação (08/11/2026)

Monstrão gerado no Figma (GPT Image, arquivo do protótipo): as 4 folhas de caminhada, as 7 poses e a anilha. Originais em `personagens_figma/monstrao/`; no jogo, `prototype/assets/personagens/monstrao/` (`caminhada_atlas.webp`, `poses_atlas.webp`, `anilha.webp`).

- No Figma não dá para anexar referência. O que funcionou foi descrever a direção de cada linha ou célula com palavras ("row 1 = facing the camera...", "cell 5 exact right profile...") e a câmera como "slightly high, about 30 degrees above", igual aos prompts do Chefe do Tráfico. Saiu no mesmo ângulo da horda.
- Na investida, as direções 225° e 247,5° saíram viradas para o lado errado; ficaram com o espelho de 135° e 112,5°.
- O arremesso com um braço só apontava sempre para o lado; foi refeito com as duas mãos por cima da cabeça, que funciona em toda direção.
- O gerador desenha toda pose com a mesma altura na célula. Na montagem (`tools/montar-poses.py`), cada pose leva a altura em relação ao boneco em pé: `preparo=0.8 investida=0.95 agachamento=0.66 arremesso=1.12 levanta=1.15 pose=1.02 tonto=0.98`.
