# Pedido de arte: Juninho carregando objeto acima da cabeça

Pedido do autor (08/11/2026): quando o Juninho pega cadeira, mesa, botijão ou isopor para arremessar, o objeto fica flutuando sobre a cabeça dele, porque a caminhada é a de sempre (braços para baixo, capacete na mão). Falta a caminhada com os dois braços erguidos segurando o objeto. **As mãos vêm vazias:** o jogo desenha o objeto entre elas.

## Como pedir (ChatGPT)

- **Anexe as 4 folhas da caminhada do Juninho** (`referencias/juninho_caminhada_folha_1..4.png`, no pacote). Elas são a referência de identidade, câmera, grade, ordem das direções e passada.
- **Uma folha por pedido**, nesta ordem: folha 1, 2, 3, 4. Cole o prompt de cada uma.
- **Formato igual ao da caminhada:** PNG 1536×1024, grade 6×4, células 256×256, fundo transparente, pés na linha y240, quadril em x128.

## Atenção na folha 3 (o erro que mais aparece)

Na folha 3, a linha 1 é de costas e as linhas 2, 3 e 4 andam de costas para a **esquerda** da imagem. Nos pacotes de personagem anteriores essas linhas vieram andando para a direita, iguais às da folha 2. Confira antes de aceitar.

## Prompts

Base (o começo de todos os quatro):

```
Game walk cycle sprite sheet of Juninho CARRYING AN OBJECT OVERHEAD, from the attached walking sheets. Identity reference only: the same young man, short dark hair, invented face, worn RED shirt with black details, GRAY cargo trousers with red kneepads, boots, RED square thermal delivery backpack with black straps, no logo. BOTH ARMS RAISED ABOVE THE HEAD, elbows slightly bent, both hands open with palms up at about the same height, a little wider than the shoulders, as if holding a chair or a small table up over his head. The hands are EMPTY: draw NOTHING in or above the hands (the game draws the object there). His red motorcycle helmet hangs from his belt on his right hip by its strap. Careful, slightly heavier walk than the normal one; the raised arms stay steady while the legs walk. Digitized 90s arcade near-photographic style, the same as the reference. The same elevated camera and scale as the reference sheets, warm upper-left light. EXACT 1536x1024 PNG, 6 columns x 4 rows, 256x256 cells. Each ROW is one facing direction; the 6 COLUMNS are the 6 consecutive frames of the walk cycle, in the same phase order as the reference. Same body scale as the reference, pelvis at cell x128, feet baseline at cell y240, whole body, hands and backpack inside every cell with padding, no overlap. True alpha transparency: all empty areas alpha 0. NO ground, NO cast shadow, NO background, NO glow, NO text, numbers, labels, gridlines or logos. Do not mirror the reference; keep the anatomical right side on the right.
```

Linha final de cada folha (cole depois da base):

- **Folha 1:** `Directions per row: row 1 FRONT 0 degrees, facing the viewer; row 2 FRONT-RIGHT 22.5; row 3 FRONT-RIGHT 45; row 4 FRONT-RIGHT 67.5, almost right profile, walking toward SCREEN RIGHT.`
- **Folha 2:** `Directions per row: row 1 RIGHT PROFILE 90 degrees, walking toward SCREEN RIGHT; row 2 BACK-RIGHT 112.5, walking away toward SCREEN RIGHT; row 3 BACK-RIGHT 135; row 4 BACK-RIGHT 157.5, almost full back.`
- **Folha 3:** `Directions per row: row 1 FULL BACK 180 degrees, walking straight away from the viewer; row 2 BACK-LEFT 202.5, walking away toward SCREEN LEFT; row 3 BACK-LEFT 225, walking away toward SCREEN LEFT; row 4 BACK-LEFT 247.5, almost left profile, nose pointing to SCREEN LEFT. Rows 2, 3 and 4 walk toward SCREEN LEFT, NEVER toward screen right: they are the mirror image of rows 4, 3 and 2 of the attached sheet 2.`
- **Folha 4:** `Directions per row: row 1 LEFT PROFILE 270 degrees, walking toward SCREEN LEFT; row 2 FRONT-LEFT 292.5; row 3 FRONT-LEFT 315; row 4 FRONT-LEFT 337.5, almost front.`

## Conferir antes de mandar

- Mãos vazias e erguidas em todos os quadros, na mesma altura.
- O mesmo Juninho da caminhada (rosto, roupa, mochila), do mesmo tamanho.
- Folha 3: linhas 2 a 4 andando para a esquerda.
- Fundo transparente, nada de texto, chão ou sombra.

## Depois que chegar

`tools/montar-atlas.py` monta o atlas; o jogo troca para esta caminhada enquanto o Juninho carrega o objeto e põe o objeto entre as mãos, na altura certa.
