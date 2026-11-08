# Pedido de arte: Juninho recebendo a aura da relíquia (08/11/2026)

**O que acontece hoje.** Na cena de achar a relíquia (D67), o tempo para e o Juninho sobe no ar com raios de luz atrás. Ele sobe na pose normal, parado com o capacete na mão, como se estivesse em pé.

**O que o autor pediu.** No ar, ele toma a pose de quem recebe uma aura. Primeiro o corpo dá uma leve encolhida, se fechando e juntando força. Depois se abre todo para receber a luz: braços abertos, peito para frente, cabeça para trás. A câmera chega mais perto dele (o zoom é feito no jogo, não na arte).

**A animação.** Uma folha só, com o Juninho sempre de frente para a câmera (direção 0°), porque na cena ele sempre vira para a tela. São 24 quadros:

| Quadros | Onde na folha | O que é |
| --- | --- | --- |
| 1 a 12 | linhas 1 e 2 | A sequência: sobe, se encolhe, treme e se abre todo |
| 13 a 18 | linha 3 | Aberto recebendo a luz, em laço (o jogo repete enquanto a luz dura) |
| 19 a 24 | linha 4 | Desce e pousa de pé, de volta à pose normal |

O jogo faz a subida, a descida, a luz, os raios e o zoom. A arte traz só o corpo mudando de pose. Nada é girado nem espremido em código.

**Formato.**

- Igual ao das outras folhas: PNG 1536×1024, grade 6×4, células 256×256, fundo transparente.
- Quadros lidos da esquerda para a direita, de cima para baixo.

## Como pedir (ChatGPT)

1. Anexe as 4 folhas da caminhada do Juninho (`Juninho_Completo_v3/caminhada/folhas/folha_1..4.png`). A folha 1 é a mais importante: tem a direção de frente para a câmera. Elas servem de referência de rosto, roupa, câmera e escala.
2. Cole o pedido abaixo inteiro num pedido só.

Se o ChatGPT desenhar brilho, aura ou raios em volta dele, peça de novo a mesma folha "sem nenhum efeito de luz: só o personagem, fundo transparente". A luz é o jogo que desenha.

## Pedido para colar

````text
Preciso de um pacote novo do Juninho, protagonista do jogo BRASIL ESTADO DE CAOS: a animação de QUANDO ELE RECEBE O PODER DE UMA RELÍQUIA. Ele flutua no ar, se encolhe juntando força e depois se abre todo, como se recebesse uma aura de luz, e no fim desce e pousa. É uma folha PNG 1536×1024 (grade 6×4, células 256×256, fundo transparente), sempre de frente para a câmera. Anexo as 4 folhas da caminhada dele como referência de rosto, roupa, câmera e escala (a folha 1 tem a direção de frente). Entregue um zip "Juninho_Aura_v1" com folhas/folha_1.png, uma prévia animada e o prompt usado.

PROMPT:
Game power-up animation sprite sheet of Juninho, from the attached walking sheets (identity, camera and scale reference only). The same young delivery man: short dark hair, invented face, worn RED shirt with black details, GRAY cargo trousers with red kneepads, boots, RED square thermal delivery backpack with black straps, no logo; his red motorcycle helmet hangs from his belt on his right hip by its strap. He is floating in the air receiving the power of a magical relic: first his body CURLS UP gathering strength, then it BURSTS OPEN to receive an aura of light, like a classic 90s arcade power-up moment. Heroic and a little comic, not scary. Digitized 90s arcade near-photographic style, the same as the reference. Fixed HIGH ELEVATED ORTHOGRAPHIC camera looking DOWN at 50 degrees, the same camera, scale and warm upper-left light as the reference sheets. He FACES THE CAMERA (front view, direction 0) in ALL 24 frames.
EXACT 1536x1024 PNG, 6 columns x 4 rows, 256x256 cells, 24 consecutive frames read left to right, top to bottom.
ROWS 1 AND 2, THE SEQUENCE (frames 1 to 12):
1 LIFTED: just lifted off the ground, body relaxed, arms hanging a little away from the body, toes pointing down, surprised face looking up.
2 RISING: knees slightly bent, arms starting to come in toward the body, eyes wide.
3 CURL STARTS: shoulders hunch forward, head lowering, forearms coming up in front of the chest.
4 CURLING: knees pulled up toward the chest, forearms crossed over the chest, fists clenched, chin down.
5 FULLY CURLED: tight and compact in the air, knees high, arms wrapped in front, eyes shut tight, whole body tense, gathering strength.
6 HOLD THE CURL: the same tight curl, a little smaller and trembling (a small visible change so it reads as shaking).
7 BURST BEGINS: arms starting to fling outward, legs extending down, head starting to lift.
8 OPENING: arms halfway out to the sides, chest pushing forward, legs straightening apart.
9 FULLY OPEN: arms spread wide to the sides and up, palms open toward the sky, chest out, head tilted back, mouth open in a shout, legs apart, toes pointed down.
10 STRETCH: the same open pose stretched even more, back arched, arms and fingers reaching out, shirt and backpack straps lifted upward as if by a wind from below.
11 HOLD OPEN: open pose, head coming forward a little, eyes open, amazed.
12 POWERED UP: open pose, head level, confident smile.
ROW 3, AURA LOOP (frames 13 to 18, a seamless loop, frame 18 flows into frame 13): floating in the open pose, chest breathing in and out, arms gently rising and lowering, hair and clothes fluttering upward as if lifted by energy from below, confident expression.
ROW 4, LANDING (frames 19 to 24): 19 arms lowering to the sides, 20 descending with legs reaching down, 21 feet touch the ground, knees bend, 22 crouched landing with one fist touching the ground, 23 standing up, 24 standing upright in his normal standing pose, holding the helmet in his hand like in the reference, confident.
PLACEMENT: frames 1 to 20 are in the air: keep the PELVIS at cell point x128, y150 in every one of them, so the body does not jump between frames (the game lifts him and moves him down); no ground under him. Frames 21 to 24 touch the ground: feet baseline at cell y240, pelvis at cell x128. Same body scale as the reference in every cell; the curled frames are smaller because the body is curled, never because the scale changed. Whole body, backpack, hands, feet and helmet inside every cell with 12px clear margin, never cropped, no overlap between cells. Big clear changes between frames, readable at small size. Do not mirror to invent views; keep the anatomical right side (helmet on the right hip). True alpha transparency: all empty areas alpha 0, opaque character, clean edges. NO glow, NO aura, NO light rays, NO sparkles, NO energy effects, NO ground, NO cast shadow, NO dust, NO motion blur, NO speed lines, NO background, NO text, numbers, labels or grid lines. 24 cells in an exact 6x4 grid.

Antes de entregar, confira:
- é o mesmo Juninho da caminhada, do mesmo tamanho, sempre de frente para a câmera;
- ele se encolhe nos quadros 3 a 6 e se abre todo nos quadros 9 e 10;
- a linha 3 emenda o quadro 18 no 13 sem pulo;
- no quadro 24 ele está de pé como na pose parada da referência;
- não tem brilho, aura nem raio desenhado, e o fundo é transparente;
- nada está cortado.
````

## Quando o pacote chegar (proposta de jogo)

1. Monto o atlas e confiro o ângulo e a escala contra o chão do jogo e contra a pose parada do Juninho.
2. **A cena.** A subida usa os quadros 1 e 2. Enquanto a relíquia voa até ele, ele se encolhe e treme (3 a 6). Logo antes de ela entrar, ele se abre (7 a 9). No estouro de luz, estica e fica aberto (10 a 12), e o laço da linha 3 segura enquanto a luz dura. Na descida, pousa com os quadros 19 a 24.
3. **O zoom.** Já está no jogo (D69): a câmera chega perto dele enquanto ele sobe, dá um tranco no estouro e volta ao normal enquanto ele desce.
4. Se precisar de mais tempo para a sequência, a cena cresce um pouco (hoje são 3 s). Os números vão para `config.js` (`SUPER.cena`).
