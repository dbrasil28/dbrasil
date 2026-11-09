# Pedido de arte: o baile da esplanada e o alto do Morro (D91)

Pedido do autor (09/11/2026). O Morro cresceu. A última esplanada antes do alto vira um baile funk à noite, com muita luz, néon, TVs, bares, sinuca, treliças de iluminação, globo espelhado e canhões de luz para o céu. As TVs mostram O Acordão (as duas cabeças de Brasília, só em silhueta), o sinal pega e a festa vira horda. Aí sobe no palco o **DJ Plantão**, o chefe do meio. Derrubado ele, o portão do fundo abre o resto do morro, até o **Chefe do Tráfico gigante, com duas metralhadoras**, no topo.

**A chegada mudou (D94, roteiro do autor):** chegando, os corredores esvaziam, a música do baile ("Ela Não Vale Nada") sobe e a noite cai. A pista está lotada, todo mundo dançando, e o DJ toca atrás da mesa desde o começo, com uma TV de cada lado do palco. O Acordão aparece nas TVs, os olhos de todos acendem (o brilho do Apagão, feito pelo jogo), começa a pancadaria e a polícia da entrada entra para ajudar. O DJ fica só olhando, até o Caos subir: aí ele entra na luta. Por isso o DJ precisa de mais duas folhas: **tocando** (34) e **olhando** (35).

O jogo já roda tudo isso. Enquanto a arte nova não chega:
- o DJ usa a arte do Funkeiro, pintada de roxo (atrás da mesa, dança no lugar);
- o Chefe usa a arte de hoje, aumentada (mesma escala nas duas direções, nada espremido);
- a mesa do DJ, o néon, o bar e a tela do Plantão são desenho de código.

**Já chegou (D93, Figma, conta pessoal do autor):** a treliça (27), o globo (28), o canhão (30) e a TV de tela plana (31) estão no jogo, em `prototype/assets/cenario/favela/baile_*.webp`. As folhas originais estão em `docs/arte/objetos_figma/` (`baile_frontal_figma.webp` e `baile_pecas_figma.webp`), recortadas com `tools/recortar-pecas.py`. A mesa do DJ (29), o bar (32) e a TV de tubo vieram girados de 7 a 15° e ficaram de fora (regra do ângulo). O que deu certo no pedido: **vista de frente, como uma planta de fachada**, os dois pés na mesma linha e nada de três-quartos (o texto em inglês está na seção 27–33, abaixo).

## Como pedir

- **Onde:** Figma (modelo GPT Image) ou ChatGPT. Uma imagem por pedido.
- **Cole sempre o bloco BASE** do personagem e, logo depois, o bloco da imagem.
- **Anexe as referências** das folhas que já estão no jogo, só para câmera, grade, ordem das direções e passada:
  - caminhada e poses do Funkeiro (`prototype/assets/personagens/funkeiro/`);
  - Chefe do Tráfico (`prototype/assets/personagens/chefe_trafico/`);
  - cidadão A (`prototype/assets/personagens/cidadao_a/`).
- **Fundo verde chapado (#00FF00).** O recorte tira o verde, então nada no personagem ou no objeto pode ser verde.
- **Ângulo:** a mesma câmera das folhas de referência, de cima, uns 50° acima do chão, sem perspectiva. É o ângulo do Juninho e da horda no jogo. Antes de pôr no jogo, a arte é medida contra o chão.
- **Nomes e marcas:** tudo fictício. Nada de logo, marca, time, partido ou rosto de pessoa real.

## O que desenhar primeiro (baile)

1. **DJ Plantão:** tocando (34), olhando (35), caminhada (1–4), grave (5) e drop (6). São 8 imagens; é o rosto do baile.
2. **A dança** (21–26): 6 imagens, uma por pessoa da pista.
3. **Funkeiro loiro:** caminhada (16–19), ataque (20a) e fúria (20b). São 6 imagens.
4. Depois do baile: o Chefe do Tráfico gigante (7–15).

## Lista de imagens

| # | Arquivo | O que é | Uso no jogo |
| --- | --- | --- | --- |
| 1–4 | `dj_plantao_caminhada_1..4.png` | DJ Plantão: caminhada, 16 direções, 6 quadros | Andando pelo palco |
| 5 | `dj_plantao_grave.png` | Braços para cima, mãos abertas, soltando o grave (16 direções) | Aviso e anéis do grave |
| 6 | `dj_plantao_drop.png` | Debruçado, punhos no alto, pronto para soltar o drop (16 direções) | Subindo no som (a hora de bater) |
| 34 | `dj_plantao_tocando.png` | Tocando nos toca-discos, 6 quadros em laço, 4 direções (0, 22,5, 337,5 e 45) | Atrás da mesa, da festa até ele entrar na luta (D94) |
| 35 | `dj_plantao_olhando.png` | Braços cruzados, sorriso de canto, olhando a pancadaria (16 direções) | Na pancadaria, só olhando o Juninho (D94) |
| 7–10 | `chefe_gigante_caminhada_1..4.png` | Chefe do Tráfico com uma metralhadora em cada mão, 16 direções, 6 quadros | Andando na laje do topo |
| 11 | `chefe_gigante_dupla.png` | Atirando com as duas, braços à frente (16 direções) | Rajada dupla |
| 12 | `chefe_gigante_varre.png` | Braços abertos, armas para os lados (16 direções) | Varredura em leque |
| 13 | `chefe_gigante_juntas.png` | As duas armas juntas à frente, no peito (16 direções) | O jato das duas juntas |
| 14 | `chefe_gigante_recarga.png` | Trocando o pente de uma das armas (16 direções) | Recarga (a hora de bater) |
| 15 | `chefe_gigante_radio.png` | Gritando no rádio, a outra arma para o alto (16 direções) | Chamando a firma |
| 16–19 | `funkeiro_loiro_caminhada_1..4.png` | Funkeiro de cabelo loiro platinado, 16 direções, 6 quadros | O povo do baile e a horda que ele vira |
| 20a, 20b | `funkeiro_loiro_ataque.png`, `funkeiro_loiro_furia.png` | Ataque e fúria do Funkeiro loiro (16 direções cada) | Igual ao Funkeiro de hoje |
| 21–26 | `danca_<pessoa>.png` | Dançando no lugar, 6 quadros, 4 direções (0, 22,5, 337,5 e 45) | O povo da festa antes do sinal |
| 27 | `baile_trelica.png` | Torre de treliça de alumínio e um pedaço de viga com refletores | As estruturas de iluminação (**feito, D93**) |
| 28 | `baile_globo.png` | Globo espelhado pendurado, 6 quadros girando | O globo do meio da pista (**feito, D93**, um quadro; o giro é do jogo) |
| 29 | `baile_mesa_dj.png` | Case preto com dois toca-discos e notebook | O palco do DJ |
| 30 | `baile_canhao.png` | Canhão de luz no chão, apontado para cima (o facho é do jogo) | Os canhões para o céu (**feito, D93**) |
| 31 | `baile_tvs.png` | TV de tubo e TV de tela plana, cada uma num pé de ferro, tela apagada | As TVs (o jogo põe o clipe e o Plantão na tela; **a de tela plana está feita, D93**) |
| 32 | `baile_bar.png` | Bar do baile: balcão com isopor, freezer e engradados | Os dois bares da esplanada |
| 33 | `baile_neon.png` | Moldura de néon rosa vazia, para pendurar no muro | O letreiro (o texto é do jogo) |

Pessoas da dança (21–26): o cidadão A, o B e o C (as roupas de hoje), a mulher de roupa curta (top curto e minissaia ou short), o funkeiro loiro e o traficante (sem camisa, cabelo descolorido, o fuzil atravessado nas costas enquanto dança).

Medidas no jogo:
- o DJ aparece com 1,5 vez a altura do Juninho, e o Chefe gigante com 2,4 vezes;
- nas folhas, todos têm o mesmo tamanho dos outros personagens nas células, e o jogo aumenta.

## BASE do DJ Plantão

```
Production game sprite sheet for the mobile game BRASIL: ESTADO DE CAOS. Character: DJ PLANTÃO, a fictional Brazilian baile funk DJ who broadcasts a hypnotic TV signal through his sound. Young man, lean, cocky. Bleached platinum-blond buzz cut, mirrored purple sunglasses, oversized GOLD headphones around the neck, open NEON PURPLE tracksuit jacket over a white tank top, thick gold chains, black cargo shorts, white high-top sneakers. A small old TV screen glowing blue is sewn on the back of the jacket (no image on it). NOTHING green on the character, no logos, no brands, no text.
Style: 90s digitized arcade fighter look, near-photographic textures, saturated colors, slightly caricatural but not cartoon, warm light from the upper left.
Camera: elevated orthographic 3/4 view, about 50 degrees above the ground, no perspective distortion. EXACTLY the same camera, scale, grid and foot baseline as the attached reference sheets. Use the references ONLY for camera, grid, row/cell direction order and gait. Do NOT copy the reference character.
Direction angles: 0 = facing the camera, 90 = facing screen right, 180 = back to the camera, 270 = facing screen left (clockwise).
Background: flat pure green #00FF00 everywhere. No floor, no cast shadow, no glow, no light effects, no motion lines, no text. Whole body inside each cell with padding, no overlap between cells, no mirroring, same person and size in every cell.
```

## BASE do Funkeiro loiro

O Funkeiro de hoje é o grandão de camiseta roxa. O loiro é outro, mais magro e mais novo, para a pista ter variedade. Não confundir com o DJ: o DJ tem óculos roxos espelhados, fone dourado e jaqueta roxa; o loiro não.

```
Production game sprite sheet for the mobile game BRASIL: ESTADO DE CAOS. Character: a fictional young Brazilian baile funk dancer from the favela, lean and wiry, cocky grin. Bleached platinum-blond "nevou" hair, short on the sides with a shaved line design, thin mustache. White ribbed tank top, long red-and-black basketball shorts, thin gold chain, white socks pulled up, black slide sandals. Bare arms with a few simple tattoos. NOTHING green on the character, no logos, no brands, no team crests, no text.
Style: 90s digitized arcade fighter look, near-photographic textures, saturated colors, slightly caricatural but not cartoon, warm light from the upper left.
Camera: elevated orthographic 3/4 view, about 50 degrees above the ground, no perspective distortion. EXACTLY the same camera, scale, grid and foot baseline as the attached reference sheets. Use the references ONLY for camera, grid, row/cell direction order and gait. Do NOT copy the reference character.
Direction angles: 0 = facing the camera, 90 = facing screen right, 180 = back to the camera, 270 = facing screen left (clockwise).
Background: flat pure green #00FF00 everywhere. No floor, no cast shadow, no glow, no light effects, no motion lines, no text. Whole body inside each cell with padding, no overlap between cells, no mirroring, same person and size in every cell.
```

## BASE do Chefe do Tráfico gigante

```
Production game sprite sheet for the mobile game BRASIL: ESTADO DE CAOS. Character: the fictional CHEFE DO TRÁFICO, the final boss of the Rio favela level, now huge and holding TWO MACHINE GUNS, one in each hand. Keep his identity from the attached reference sheets (face, build, clothes and colors) but heavier and more imposing: broad shoulders, thick arms, gold chains, sunglasses pushed up on the head, a two-way radio clipped to the chest strap. Both guns are generic fictional black machine guns with long magazines, held low at the hips while walking. NOTHING green on the character, no logos, no brands, no text.
Style: 90s digitized arcade fighter look, near-photographic textures, saturated colors, slightly caricatural but not cartoon, warm light from the upper left.
Camera: elevated orthographic 3/4 view, about 50 degrees above the ground, no perspective distortion. EXACTLY the same camera, scale, grid and foot baseline as the attached reference sheets. Use the references ONLY for camera, grid, row/cell direction order and gait.
Direction angles: 0 = facing the camera, 90 = facing screen right, 180 = back to the camera, 270 = facing screen left (clockwise).
Background: flat pure green #00FF00 everywhere. No floor, no cast shadow, no muzzle flash, no bullets, no smoke, no motion lines, no text. Whole body and both guns inside each cell with padding, no overlap between cells, no mirroring, same person and size in every cell.
```

## Caminhada (DJ, Chefe gigante e Funkeiro loiro, 4 imagens cada)

Anexe a folha de caminhada de mesmo número do Funkeiro (ou do Chefe do Tráfico, para o Chefe gigante).

```
WALK CYCLE sheet. EXACT 1536x1024 image, 6 columns x 4 rows, 256x256 cells. Each ROW is one facing direction; the 6 COLUMNS are consecutive frames of one walk cycle. Feet on cell line y=240, body centered on x=128, figure about 215 px tall in every cell.
Rows from top to bottom: SHEET 1 = 0, 22.5, 45, 67.5.
```

Nas folhas 2, 3 e 4, troque só a última linha (`SHEET 2 = 90, 112.5, 135, 157.5`, `SHEET 3 = 180, 202.5, 225, 247.5`, `SHEET 4 = 270, 292.5, 315, 337.5`).

## Poses em 16 ângulos (DJ, Chefe gigante e Funkeiro loiro)

Anexe a folha de poses em 16 ângulos do Funkeiro (ou do Chefe do Tráfico). Cole a BASE, o bloco abaixo e a linha da pose.

```
POSE SHEET. EXACT 1536x1024 image, 4 columns x 4 rows, 384x256 cells, ONE still pose per cell. The 16 cells are the 16 facing directions in reading order: 0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5. Same scale as the walk sheets, feet on cell line y=240, body centered in the cell, the whole pose turned toward the listed direction.
```

Linha da pose (uma por imagem):
- DJ, grave: `POSE: arms raised high above the head, palms open, chest pushed forward, mouth open shouting, as if releasing a bass wave.`
- DJ, drop: `POSE: crouched slightly forward, both fists raised high, knees bent, about to jump, intense grin.`
- Chefe, dupla: `POSE: firing both machine guns forward at waist height, arms extended, legs apart, recoil in the shoulders.`
- Chefe, varre: `POSE: arms spread wide to the sides, one machine gun pointing left and the other right, torso twisting.`
- Chefe, juntas: `POSE: both machine guns held together in front of the chest, pointing straight ahead, leaning forward.`
- Chefe, recarga: `POSE: one machine gun under the arm, the other hand pulling out the empty magazine and pushing a new one in, head down looking at the gun.`
- Chefe, rádio: `POSE: shouting into the radio held in one hand, the other machine gun raised high toward the sky.`
- DJ, olhando (35): `POSE: standing still behind the DJ decks, arms crossed over the chest, chin up, smug half smile, watching a fight below as a spectator, headphones on one ear.`
- Funkeiro loiro, ataque (20a, com a BASE dele): `POSE: throwing a wide hooking punch, weight on the front foot, teeth clenched.`
- Funkeiro loiro, fúria (20b, com a BASE dele): `POSE: fury, arms spread wide, chest out, shouting, about to charge.`

## O DJ tocando (34)

Anexe a folha de caminhada 1 do Funkeiro (só para câmera e grade). Cole a BASE do DJ e este bloco. Desenhe o corpo inteiro: no jogo a mesa cobre as pernas.

```
DJ PLAYING LOOP sheet. EXACT 1536x1024 image, 6 columns x 4 rows, 256x256 cells. Each ROW is one facing direction; the 6 COLUMNS are consecutive frames of one loop IN PLACE: one hand pressing a headphone cup to the ear, the other hand scratching a vinyl record at waist height in front of him (the turntable itself is NOT drawn, only the hand pose), head nodding hard to the beat, shoulders bouncing; frame 6 flows back into frame 1. Feet on cell line y=240, body centered on x=128, same scale as the walk sheets.
Rows from top to bottom: 0, 22.5, 337.5, 45.
```

## A dança (6 imagens, uma por pessoa)

Pessoas: o cidadão A, o B e o C (as roupas de hoje), a mulher de roupa curta (a garota da esquina), o Funkeiro loiro (a BASE dele, acima) e o traficante (o de hoje, com o fuzil atravessado nas costas). Quando o Acordão aparece, o jogo vira cada um para o Juninho e acende o olho: a dança só precisa das 4 direções de frente.

Anexe a folha de caminhada 1 da pessoa (para o cidadão, a do cidadão A; para a mulher, a da garota da esquina). Descreva a pessoa no lugar da BASE, com a mesma câmera e o mesmo fundo.

```
DANCE CYCLE sheet. EXACT 1536x1024 image, 6 columns x 4 rows, 256x256 cells. Each ROW is one facing direction; the 6 COLUMNS are consecutive frames of one baile funk dance loop IN PLACE (no walking forward): hips swinging, knees bending to the beat, arms moving, frame 6 flows back into frame 1. Feet on cell line y=240, body centered on x=128, same scale as the walk sheets.
Rows from top to bottom: 0, 22.5, 337.5, 45.
```

## Peças do baile (objetos, uma imagem cada)

```
Production game prop for the mobile game BRASIL: ESTADO DE CAOS, a favela baile funk at night. Same camera as the attached reference props: elevated orthographic 3/4 view, about 50 degrees above the ground, no perspective distortion. Near-photographic 90s arcade style, worn and improvised, saturated colors. Flat pure green #00FF00 background, no floor, no cast shadow, no glow or light effect drawn (the game adds the light), no text, no logos.
OBJECT: <descrição>
```

Descrições (`OBJECT:`):
- 27, treliça: `one square aluminum truss tower 4 meters tall with a short horizontal truss beam on top, five small black PAR stage lights hanging from the beam.`
- 28, globo: `a mirror disco ball hanging from a thin chain, 6 frames of it rotating, in a 6x1 strip.`
- 29, mesa do DJ: `a black road case DJ table with two turntables, a mixer and a small open laptop on top.`
- 30, canhão: `a stage searchlight on a heavy base on the ground, pointing straight up.`
- 31, TVs: `an old CRT television and a flat screen TV, each on a welded iron stand, screens dark.`
- 32, bar: `an improvised baile bar counter made of plywood with a white chest freezer, a styrofoam cooler and stacked beer crates (no brands).`

O pedido acima, de três-quartos, saiu girado de 7 a 15° no Figma (GPT Image) e isométrico no Gemini. O que acertou o ângulo (D93) foi trocar a câmera por esta, que serve para as peças que faltam (mesa do DJ, bar, TV de tubo):

```
CAMERA, critical: perfectly straight-on front view at eye level, the camera exactly centered in front of each object, zero rotation, zero yaw. The object faces the camera flat: its bottom edge is one horizontal line, its sides perfectly vertical. We see only the front of each object, like a flat elevation drawing. No three-quarter view, no corner view, no isometric, no perspective convergence.
```

Antes de pôr no jogo, medir: os dois pés na mesma altura e a beirada de cima reta (0°, como as casas da favela).
- 33, néon: `an empty neon sign frame, pink neon tube border only, to hang on a wall.`

## Quando chegar

1. Monto os atlas com `tools/montar-atlas.py` e `tools/montar-poses.py` e confiro o ângulo contra o chão do jogo.
2. O DJ e o Chefe gigante trocam a arte provisória pela nova. O povo do baile troca o passo no lugar pela dança.
3. As peças trocam o desenho de código pelas imagens. O jogo continua desenhando a luz: néon, refletores, fachos e a tela das TVs.
