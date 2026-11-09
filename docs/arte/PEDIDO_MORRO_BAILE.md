# Pedido de arte: o baile da esplanada e o alto do Morro (D91)

Pedido do autor (09/11/2026). O Morro cresceu. A última esplanada antes do alto vira um baile funk à noite, com muita luz, néon, TVs, bares, sinuca, treliças de iluminação, globo espelhado e canhões de luz para o céu. As TVs mostram O Acordão (as duas cabeças de Brasília, só em silhueta), o sinal pega e a festa vira horda. Aí sobe no palco o **DJ Plantão**, o chefe do meio. Derrubado ele, o portão do fundo abre o resto do morro, até o **Chefe do Tráfico gigante, com duas metralhadoras**, no topo.

**A chegada mudou (D94, roteiro do autor):** chegando, os corredores esvaziam, a música do baile ("Ela Não Vale Nada") sobe e a noite cai. A pista está lotada, todo mundo dançando, e o DJ toca atrás da mesa desde o começo, com uma TV de cada lado do palco. O Acordão aparece nas TVs, os olhos de todos acendem (o brilho do Apagão, feito pelo jogo), começa a pancadaria e a polícia da entrada entra para ajudar. O DJ fica só olhando, até o Caos subir: aí ele entra na luta. Por isso o DJ precisa de mais duas folhas: **tocando** (34) e **olhando** (35).

O jogo já roda tudo isso. Enquanto a arte nova não chega:
- o DJ usa a arte do Funkeiro, pintada de roxo (atrás da mesa, dança no lugar);
- o Chefe usa a arte de hoje, aumentada (mesma escala nas duas direções, nada espremido);
- a mesa do DJ, o néon, o bar e a tela do Plantão são desenho de código.

**Já chegou (D93, Figma, conta pessoal do autor):** a treliça (27), o globo (28), o canhão (30) e a TV de tela plana (31) estão no jogo, em `prototype/assets/cenario/favela/baile_*.webp`. As folhas originais estão em `docs/arte/objetos_figma/` (`baile_frontal_figma.webp` e `baile_pecas_figma.webp`), recortadas com `tools/recortar-pecas.py`. A mesa do DJ (29), o bar (32) e a TV de tubo vieram girados de 7 a 15° e ficaram de fora (regra do ângulo). O que deu certo no pedido: **vista de frente, como uma planta de fachada**, os dois pés na mesma linha e nada de três-quartos (o texto em inglês está na seção 27–33, abaixo).

## Como pedir

- **Onde:** os personagens no ChatGPT, pelo método da seção "Personagens no ChatGPT" (editar uma folha que já está no jogo). Os objetos no Figma. Uma imagem por pedido.
- **Anexe a folha base** que cada pedido indica: o GPT edita em cima dela (troca a pessoa ou a ação e mantém grade, câmera, direções e pés).
- **Fundo:** nos personagens (ChatGPT), transparente de verdade. Nos objetos (Figma), verde chapado (#00FF00), porque o recorte tira o verde; nada no objeto pode ser verde.
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
| 34 | `dj_plantao_tocando.png` | Tocando nos toca-discos, 6 quadros em laço, as 4 direções da folha 1 (0, 22,5, 45 e 67,5) | Atrás da mesa, da festa até ele entrar na luta (D94) |
| 35 | `dj_plantao_olhando.png` | Braços cruzados, sorriso de canto, olhando a pancadaria (16 direções) | Na pancadaria, só olhando o Juninho (D94) |
| 7–10 | `chefe_gigante_caminhada_1..4.png` | Chefe do Tráfico com uma metralhadora em cada mão, 16 direções, 6 quadros | Andando na laje do topo |
| 11 | `chefe_gigante_dupla.png` | Atirando com as duas, braços à frente (16 direções) | Rajada dupla |
| 12 | `chefe_gigante_varre.png` | Braços abertos, armas para os lados (16 direções) | Varredura em leque |
| 13 | `chefe_gigante_juntas.png` | As duas armas juntas à frente, no peito (16 direções) | O jato das duas juntas |
| 14 | `chefe_gigante_recarga.png` | Trocando o pente de uma das armas (16 direções) | Recarga (a hora de bater) |
| 15 | `chefe_gigante_radio.png` | Gritando no rádio, a outra arma para o alto (16 direções) | Chamando a firma |
| 16–19 | `funkeiro_loiro_caminhada_1..4.png` | Funkeiro de cabelo loiro platinado, 16 direções, 6 quadros | O povo do baile e a horda que ele vira |
| 20a, 20b | `funkeiro_loiro_ataque.png`, `funkeiro_loiro_furia.png` | Ataque e fúria do Funkeiro loiro (16 direções cada) | Igual ao Funkeiro de hoje |
| 21–26 | `danca_<pessoa>.png` | Dançando no lugar, 6 quadros, as 4 direções da folha 1 (0, 22,5, 45 e 67,5) | O povo da festa antes do sinal |
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

## Personagens no ChatGPT: o método que funciona

**Por que o GPT errava.** Os prompts antigos daqui pediam a folha inteira do zero (a grade, as 16 direções e os quadros só descritos em texto). O GPT não segura isso: erra a câmera (fica na altura dos olhos), as direções das linhas e a grade. Os personagens que deram certo no jogo (o Funkeiro v2, a garota, os moradores) saíram de outro jeito: **anexando uma folha que já está no jogo e pedindo para EDITAR**, trocando só a pessoa ou só a ação, e mantendo grade, câmera, direções e pés. É isso que os pedidos abaixo fazem.

**Passo a passo:**
1. Abra uma conversa nova só para o baile e cole a **mensagem de abertura** (abaixo) uma vez.
2. Para cada imagem: **anexe a folha base** indicada e cole o prompt dela. Uma imagem por mensagem.
3. **Fundo transparente** (alpha 0), não verde. O verde era só para o Figma.
4. Confira com o **checklist** (no fim desta seção). Se errar, peça de novo só o que errou, com as frases da tabela "Se o GPT errar".

As folhas base estão no repositório:
- Funkeiro: `prototype/assets/personagens/funkeiro/folha_1.png` a `folha_4.png`, `ataque_16_angulos.png` e `furia_16_angulos.png`;
- Traficante: `prototype/assets/personagens/traficante/folha_1.png`;
- cidadão A, B e C e a garota: `docs/arte/referencias_baile/<pessoa>_folha_1.png` (montadas da arte do jogo, no mesmo formato das outras).

### Mensagem de abertura (cole uma vez, no começo da conversa)

```text
Vou te pedir folhas de sprites do jogo de celular BRASIL: ESTADO DE CAOS. Em TODOS os pedidos eu anexo uma folha que já está no jogo, e você EDITA essa folha: troca só o que eu pedir (a pessoa ou a ação) e mantém EXATAMENTE o tamanho da imagem, a grade, o tamanho das células, a câmera, a luz, a escala, a direção de cada linha (ou de cada célula) e a posição dos pés.

Estilo de todos: personagem "digitalizado" de fliperama dos anos 90, quase fotográfico, texturas reais de pele e roupa, cores saturadas, levemente caricato, NUNCA cartoon, anime ou 3D de plástico. Câmera alta, olhando DE CIMA, uns 50 graus acima do chão, vista 3/4 de jogo, NUNCA na altura dos olhos. Luz quente vindo do alto à esquerda. Adulto com 7 cabeças de altura. Fundo transparente de verdade (alpha 0): sem chão, sem sombra, sem névoa, sem cor de fundo, sem texto, sem números, sem linhas de grade. Nada de marcas, logos, times, partidos ou rosto de pessoa real. Nunca espelhe uma pose para inventar outra direção. Ninguém cortado: corpo inteiro com folga em todas as células.

Responda só "entendi" e espere o primeiro pedido.
```

### Quem é quem (cole a descrição no lugar de [DJ] ou [LOIRO])

- **[DJ]:** `DJ PLANTÃO, a fictional young Brazilian baile funk DJ, lean and cocky: bleached platinum-blond buzz cut, mirrored purple sunglasses, oversized GOLD headphones around the neck, open NEON PURPLE tracksuit jacket over a white tank top, thick gold chains, black cargo shorts, white high-top sneakers, a small old TV screen glowing blue sewn on the back of the jacket (blank screen, no image). Nothing green.`
- **[LOIRO]:** `a fictional young Brazilian baile funk dancer from the favela, lean and wiry, cocky: bleached platinum-blond "nevou" hair, short on the sides with a shaved line design, thin mustache, white ribbed tank top, long red-and-black basketball shorts, thin gold chain, white socks pulled up, black slide sandals, a few simple tattoos on the arms. No sunglasses, no headphones, no jacket (he is NOT the DJ). Nothing green.`

### DJ Plantão (8 imagens)

**1 a 4. Caminhada.** Anexe `funkeiro/folha_1.png` (depois `folha_2`, `folha_3`, `folha_4`, uma por vez) e cole:

```text
Identity-replace edit of the attached game walking sprite sheet. KEEP EXACTLY: the 1536x1024 size, the 6 columns x 4 rows grid of 256x256 cells, the camera (high elevated orthographic view looking DOWN at 50 degrees, three-quarter top-down game view, NOT eye level), the warm upper-left light, the body scale, the facing direction of every row, the 6 walking phases of every row, the root at cell x128 and the feet on the same baseline as the attached sheet.
REPLACE ONLY the person in all 24 cells with: [DJ]
His walk: confident cocky swagger, shoulders loose, chin slightly up, arms swinging relaxed (no fists). Back views show the back of the jacket with the small TV screen; never turn the face around in back views. Same person and size in every cell, no mirroring, no direction changes, no extra people.
Opaque character, fully transparent alpha 0 background, NO floor, NO shadow, NO haze, NO backdrop color, NO text, NO numbers, NO grid lines, nothing cropped.
```

**34. Tocando** (atrás da mesa, da festa até ele entrar na luta). Anexe `funkeiro/folha_1.png`:

```text
Identity-replace AND action edit of the attached game walking sprite sheet. KEEP EXACTLY: the 1536x1024 size, the 6 columns x 4 rows grid of 256x256 cells, the camera (high elevated orthographic view looking DOWN at 50 degrees, NOT eye level), the light, the body scale, the facing direction of every row and the feet baseline.
REPLACE the person with: [DJ]
REPLACE the walk with a DJ PLAYING LOOP IN PLACE (no walking, no displacement, feet planted). The 6 columns are 6 consecutive frames:
1 both hands at waist height in front of him over an invisible turntable, head down looking at the decks;
2 head nods down hard on the beat, right hand scratching a record (hand moves sideways), left hand on the mixer;
3 left hand pressing one headphone cup to the ear, shoulders bounce up, head tilted;
4 head up, mouth open hyping the crowd, right hand still scratching;
5 head nods down hard again, both hands back on the decks;
6 returning to frame 1.
The turntables and the table are NOT drawn, only the hand poses. Big readable head and shoulder motion between frames.
Opaque character, fully transparent alpha 0 background, NO floor, NO shadow, NO text, NO grid lines, nothing cropped.
```

**5, 6 e 35. Grave, drop e olhando** (poses paradas em 16 direções). Anexe `funkeiro/furia_16_angulos.png` e cole, trocando só a última linha:

```text
Identity-replace AND pose edit of the attached 16-direction game pose sheet. KEEP EXACTLY: the 1536x1024 size, the 4 columns x 4 rows grid of 384x256 cells, the facing direction of EVERY cell (the 16 directions stay in the same cells as in the attached sheet), the camera (high elevated orthographic view looking DOWN at 50 degrees, NOT eye level), the light, the body scale and the feet baseline.
REPLACE the person with: [DJ]
REPLACE the pose in all 16 cells with the pose below, turned to the facing of each cell. Back views show the back of the jacket with the TV screen.
Opaque character, fully transparent alpha 0 background, NO floor, NO shadow, NO effects, NO text, NO grid lines, nothing cropped.
POSE: <linha da pose>
```

Linha da pose:
- 5, grave: `arms raised high above the head, palms open, chest pushed forward, mouth open shouting, as if releasing a bass wave.`
- 6, drop: `crouched slightly forward, both fists raised high, knees bent, about to jump, intense grin.`
- 35, olhando: `standing still, arms crossed over the chest, chin up, smug half smile, watching a fight as a spectator, headphones on one ear.`

### Funkeiro loiro (6 imagens)

**16 a 19. Caminhada.** Anexe `funkeiro/folha_1.png` (depois 2, 3 e 4) e cole o pedido da caminhada do DJ, trocando a linha `REPLACE ONLY the person` por `REPLACE ONLY the person in all 24 cells with: [LOIRO]` e o jeito de andar por `His walk: angry and ready to fight, exactly like the walk in the attached sheet (clenched fists, leaning forward).`

**20a e 20b. Ataque e fúria.** Anexe `funkeiro/ataque_16_angulos.png` (depois `furia_16_angulos.png`) e cole:

```text
Identity-replace edit of the attached 16-direction game pose sheet. KEEP EVERYTHING EXACTLY as in the attached sheet: size, 4x4 grid of 384x256 cells, the pose, the facing of every cell, the camera (looking DOWN at 50 degrees, NOT eye level), the light, the scale and the feet baseline.
REPLACE ONLY the person in all 16 cells with: [LOIRO]
Opaque character, fully transparent alpha 0 background, NO floor, NO shadow, NO text, NO grid lines, nothing cropped.
```

### A dança (6 imagens, uma por pessoa)

**Feita: a garota** (no jogo desde a v142). Saiu do **Canva** (gerador de imagem do conector), com a folha 1 dela anexada em fundo verde chapado e o prompt abaixo trocando "transparent" por "flat solid pure green #00FF00 background". Veio com a mesma pessoa, a grade 6×4 e a dança, mas com um **braço a mais** (o do punho fechado, sem ombro) na coluna 2, linhas 2 a 4; pedir a correção ao Canva não resolveu (ele refaz a folha toda). O braço a mais foi tirado à mão (só a pele dele virou fundo verde) e a folha passou por `tools/montar-danca.py`. As linhas giram menos que na folha anexada (de 0 a uns 45°), e a arte não se espelha: no jogo ela dança virando só entre as 4 direções da folha. A folha usada está em `docs/arte/referencias_baile/garota_danca_canva.webp`. Faltam os cidadãos A, B e C, o funkeiro loiro e o traficante.

Anexe a folha 1 da pessoa: `docs/arte/referencias_baile/cidadao_a_folha_1.png` (depois `cidadao_b`, `cidadao_c` e `garota_programa`), `traficante/folha_1.png` e, para o Funkeiro loiro, a folha 1 dele depois de pronta. Cole:

```text
Action edit of the attached game walking sprite sheet. KEEP EXACTLY: the same person (face, hair, clothes, body), the 1536x1024 size, the 6 columns x 4 rows grid of 256x256 cells, the camera (high elevated orthographic view looking DOWN at 50 degrees, NOT eye level), the light, the body scale, the facing direction of every row, the root at cell x128 and the feet baseline.
REPLACE ONLY the walk with a BAILE FUNK DANCE LOOP IN PLACE (no walking forward, no displacement). The 6 columns are 6 consecutive frames:
1 knees bent, hips pushed to the right, arms low;
2 hips swing to the left, one arm comes up;
3 bounce down on bent knees, on the beat;
4 hips to the right, both arms up waving;
5 hips to the left, arms coming down;
6 returning to frame 1.
Big readable hip, knee and arm motion between frames; the feet stay on the baseline (tiny steps in place are fine).
Opaque character, fully transparent alpha 0 background, NO floor, NO shadow, NO text, NO grid lines, nothing cropped.
```

Para o traficante, acrescente: `He keeps the rifle slung across his back in every frame, both hands free, dancing.`

### Checklist (cada imagem)

- [ ] A grade é a mesma da folha anexada (6×4, ou 4×4 nas poses) e não tem linha desenhada.
- [ ] Cada linha (ou célula) olha para o mesmo lado da folha anexada. Na folha 3 da caminhada, as linhas olham para a ESQUERDA da tela.
- [ ] A câmera está de cima (dá para ver o alto da cabeça e os ombros por cima), não na altura dos olhos.
- [ ] Fundo transparente de verdade: abra sobre fundo escuro e sobre fundo claro.
- [ ] Mesma pessoa e mesmo tamanho em todas as células; nada cortado.
- [ ] Nada verde no personagem, sem marca, sem texto.

### Se o GPT errar

| O que saiu errado | O que mandar |
| --- | --- |
| Câmera na altura dos olhos | `The camera is wrong: redo it looking DOWN from above at 50 degrees, like the attached sheet. Keep everything else.` |
| Direções trocadas ou espelhadas | `Keep the facing direction of every row exactly as in the attached sheet. Do not mirror.` |
| Grade diferente, células fora do lugar | `Keep the exact 6x4 grid of 256x256 cells of the attached sheet, one figure centered in each cell.` |
| Fundo colorido ou com chão | `Make the background fully transparent (alpha 0): no floor, no shadow, no color.` |
| Virou desenho animado | `Keep the near-photographic digitized 90s arcade look of the attached sheet, not cartoon.` |
| Mudou a pessoa (na dança) | `Keep the exact same person and clothes as the attached sheet. Change only the movement.` |

**O Chefe do Tráfico gigante** (7–15) fica para depois do baile. Quando for a vez dele, monto as folhas base dele do mesmo jeito e reescrevo os pedidos neste formato; os textos antigos dele, abaixo, ficam só como descrição.

## BASE do Chefe do Tráfico gigante (descrição; o pedido no formato novo vem depois)

```
Production game sprite sheet for the mobile game BRASIL: ESTADO DE CAOS. Character: the fictional CHEFE DO TRÁFICO, the final boss of the Rio favela level, now huge and holding TWO MACHINE GUNS, one in each hand. Keep his identity from the attached reference sheets (face, build, clothes and colors) but heavier and more imposing: broad shoulders, thick arms, gold chains, sunglasses pushed up on the head, a two-way radio clipped to the chest strap. Both guns are generic fictional black machine guns with long magazines, held low at the hips while walking. NOTHING green on the character, no logos, no brands, no text.
Style: 90s digitized arcade fighter look, near-photographic textures, saturated colors, slightly caricatural but not cartoon, warm light from the upper left.
Camera: elevated orthographic 3/4 view, about 50 degrees above the ground, no perspective distortion. EXACTLY the same camera, scale, grid and foot baseline as the attached reference sheets. Use the references ONLY for camera, grid, row/cell direction order and gait.
Direction angles: 0 = facing the camera, 90 = facing screen right, 180 = back to the camera, 270 = facing screen left (clockwise).
Background: flat pure green #00FF00 everywhere. No floor, no cast shadow, no muzzle flash, no bullets, no smoke, no motion lines, no text. Whole body and both guns inside each cell with padding, no overlap between cells, no mirroring, same person and size in every cell.
```

Poses do Chefe gigante (para o pedido no formato novo):
- Chefe, dupla: `POSE: firing both machine guns forward at waist height, arms extended, legs apart, recoil in the shoulders.`
- Chefe, varre: `POSE: arms spread wide to the sides, one machine gun pointing left and the other right, torso twisting.`
- Chefe, juntas: `POSE: both machine guns held together in front of the chest, pointing straight ahead, leaning forward.`
- Chefe, recarga: `POSE: one machine gun under the arm, the other hand pulling out the empty magazine and pushing a new one in, head down looking at the gun.`
- Chefe, rádio: `POSE: shouting into the radio held in one hand, the other machine gun raised high toward the sky.`

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
