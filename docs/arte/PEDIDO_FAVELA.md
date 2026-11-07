# Pedido de arte: a Subida do Morro (favela)

Lista do que falta desenhar para a favela sair do provisório, com as medidas tiradas do mapa do jogo (`prototype/src/config.js`, `ROUTE.morro`, e `cenario.js`). Hoje o chão, as casas com laje e as escadarias do Morro são desenhados em código; os personagens principais e alguns objetos já têm arte.

## Regras para toda a arte

- **Estilo:** o prompt de estilo do guia (`GUIA_DE_PRODUCAO_DE_ARTE.md`, seção 3), o mesmo dos pacotes já entregues.
- **Ângulo:** leia a seção "O ângulo do jogo" logo abaixo e mande junto o gabarito de cada peça (`gabaritos_favela/`). Nada é girado, espremido ou entortado no jogo; a arte entra inteira, só na escala.
- **Luz:** quente, vindo do alto à esquerda.
- **Escala dos objetos:** cerca de 150 px por metro de altura real, base do objeto encostada embaixo, folga de uns 10% em volta. Os personagens são desenhados 1,4 vez maiores que a escala real para ler bem no celular, e os objetos que eles pegam crescem junto; as medidas abaixo são as reais.
- **Formato:** PNG com fundo transparente de verdade (chão: sem transparência), sem sombra no chão (o jogo desenha), sem texto, logotipo ou escudo, a não ser onde a lista pedir.
- **Personagens:** o formato dos pacotes já entregues (4 folhas de 1536×1024, grade 6×4, células de 256×256, 16 direções × 6 quadros; pés em y240, corpo em x128; 0° de frente, 90° direita, 180° costas, 270° esquerda). Poses extras em folhas 4×4 com as 16 direções, como as do Traficante.

## O ângulo do jogo (leia antes de desenhar)

A primeira versão deste pedido só dizia "câmera a 55°, giro de 18°" e "3/4 de frente". Isso não basta: o gerador desenhou as peças retas, de frente, e elas não encaixam no chão do jogo. As regras abaixo são as da câmera do jogo (`prototype/src/camera.js`), e os gabaritos em `gabaritos_favela/` foram gerados com a mesma conta (`python3 -I tools/gabaritos-favela.py docs/arte/gabaritos_favela`).

**1. Projeção paralela, sem ponto de fuga.** Linhas que são paralelas no mundo continuam paralelas na imagem. Nada diminui com a distância. Não é foto, não é perspectiva de 3/4 com fuga.

**2. As três direções, a 150 px por metro:**

| Direção no mundo | Na imagem | Por metro |
| --- | --- | --- |
| Altura (para cima) | vertical, reta | 150 px para cima |
| Largura (esquerda para direita) | horizontal, reta | 150 px para o lado |
| Profundidade (para o fundo do mapa, a direção da subida) | **linha inclinada que sobe para a direita, 18° da vertical** | 123 px para cima e 40 px para a direita |

**3. O que aparece de uma caixa (casa, barraco, objeto):** a frente, reta e sem distorção (um retângulo); o tampo (laje ou telhado), que vira um paralelogramo com os lados inclinados 18° para a direita; e a **lateral direita**, que vira uma faixa estreita e inclinada (40 px de largura para cada metro de fundo). **A lateral esquerda, o fundo e a base nunca aparecem.** Veja `objeto_caixa_1m.png`.

**4. Consequências nas vielas, que correm todas na direção da profundidade:**
- do lado **esquerdo** da viela aparece a parede da casa virada para a viela (faixa estreita e inclinada) e a beira do telhado em cima;
- do lado **direito** a parede fica de costas para a câmera e não aparece: só se vê o telhado e a frente da casa no começo da fileira. O telhado da direita cobre cerca de 1 m do chão da viela;
- nas pracinhas, as casas do fundo mostram a frente (as fachadas), o tampo e a lateral direita; as casas dos lados seguem a regra das vielas.
- `cena_exemplo.png` mostra um pedaço de morro montado assim, com o Juninho em pé na viela para dar a escala.

**5. Como pedir ao gerador:** anexe o gabarito da peça e cole o prompt abaixo, trocando [PEÇA] pela descrição da tabela. O gabarito é branco, com a grade de 1 m no chão; as cores dele não são as da arte, só separam as faces (bege claro = tampo, bege = frente, marrom = lateral direita, cinza = degraus).

> Use a imagem anexada como gabarito de forma e de ângulo. Desenhe [PEÇA] ocupando exatamente a forma do gabarito, com os mesmos contornos, no mesmo tamanho e na mesma posição. Mantenha a projeção do gabarito: projeção paralela, sem ponto de fuga e sem perspectiva; as linhas verticais continuam verticais, as linhas de largura continuam horizontais e as linhas de profundidade sobem inclinadas para a direita, todas paralelas entre si, como no gabarito. Mostre só as faces que o gabarito mostra (frente, tampo e lateral direita); a lateral esquerda não aparece. Não gire, não mude o ângulo, não mostre a peça de frente reta. Fundo transparente, sem a grade, sem sombra no chão, sem texto. Luz quente vindo do alto à esquerda.

**6. Exemplo de peça que já entrou certa:** os prédios da Orla (`prototype/assets/cenario/predios/predio_a.webp`): a frente curta fica reta e a lateral comprida com as lojas sobe inclinada para a direita.

**7. Conferência:** quando a arte chegar, eu meço as linhas de profundidade (têm que dar 18° da vertical) e encaixo no gabarito antes de pôr no jogo. Peça que vier reta, de frente, volta.

## O mapa, em metros

A subida tem uns 250 m, de baixo para cima, em zigue-zague, alternando:

| Pedaço | Largura | Comprimento | Quantos |
| --- | --- | --- | --- |
| Escadaria do pé do morro (a passagem da Orla) | 4,2 m | 8 m | 1 |
| Viela | 5 a 10 m (a maioria 5 m) | 10 a 26 m | 5 |
| Escadaria | 4 m | 14 m | 3 |
| Laje ou pracinha (arena) | 14 m | 14 a 16 m | 3 |
| Laje do topo (covil do Chefe do Tráfico) | 20 m | 22 m | 1 |
| Casa com laje (dá para subir pela escada) | 5 × 5 m, 3,2 m de altura | escada de 1,3 × 5 m | 1 por pracinha |

## 1. Chão (vista totalmente de cima, 90°, emenda perfeita nas quatro bordas)

O chão é o único que vai reto, visto de cima: ele é plano, e o jogo o deita no ângulo da câmera como faz com a pedra portuguesa da Orla.

| Arquivo | O que é | Imagem | Cobre |
| --- | --- | --- | --- |
| `chao/cimento_viela.png` | Cimento rachado e remendado de beco, com escoamento de água, marcas de chinelo e manchas | 1024×1024, sem transparência | 6 × 6 m |
| `chao/escadaria_degraus.png` | Degraus de concreto vistos de cima, de borda a borda, repetindo no sentido da subida (a emenda de cima com a de baixo tem que bater) | 1024×1024 | 4 m de largura × 4 m (14 degraus de 28 cm) |
| `chao/laje_concreto.png` | Laje de concreto das pracinhas e do topo: marcas de chuva, ralo, ferrugem de caixa d'água, remendos | 1024×1024 | 8 × 8 m |
| `chao/telhados_a.png`, `_b`, `_c` | O que se vê do alto entre as vielas: lajes e telhados vistos de cima, colados uns nos outros (laje cinza com caixa d'água azul, telha de amianto, telha de barro, varal, antena, fios). Hoje é desenhado em código | 1024×1024 cada | 8 × 8 m |

## 2. Construções

Todas no ângulo do jogo (seção acima). O tamanho da imagem é o do gabarito, que já tem a folga de 10%.

| Arquivo | O que é | Medida real | Gabarito (tamanho da imagem) |
| --- | --- | --- | --- |
| `cenario/casa_laje_dir.png` | Casa de 1 andar de tijolo aparente e reboco gasto, com a laje em cima (onde o Juninho sobe) e a escada de concreto maciça, sem corrimão, encostada do lado **direito**, subindo da frente para o fundo (18 degraus) | casa 5 × 5 m, 3,2 m de altura; escada 1,3 × 5 m | `casa_laje_dir.png` (1830×1523) |
| `cenario/casa_laje_esq.png` | A mesma casa com a escada do lado **esquerdo**. Não espelhar: a luz vem da esquerda, e deste lado a casa esconde a beira de dentro da escada | igual | `casa_laje_esq.png` (1830×1523) |
| `cenario/fachada_a.png`, `_b`, `_c` | Casa da favela para a ponta das vielas e o fundo das pracinhas: na frente, porta de ferro, janela com a luz azul de TV, reboco colorido gasto, fios; em cima, a laje com caixa d'água; a lateral direita com reboco e tijolo. a, b e c com 1, 2 e 3 andares | 4 m de frente, 5 m de fundo; 3, 6 e 9 m de altura | `fachada_a.png` (1417×1425), `_b` (1507×1965), `_c` (1597×2505) |
| `cenario/parede_viela_esq.png` | Módulo de casa do lado **esquerdo** da viela: a parede virada para a viela (faixa estreita e inclinada), com janela acesa, porta e grafite sem texto, e a beira do telhado em cima. Os módulos se encaixam um atrás do outro, então a frente não aparece | 3 m de largura, 6 m de comprimento, 3 m de altura | `parede_viela_esq.png` (1377×1425) |
| `cenario/telhado_viela_dir.png` | Módulo de casa do lado **direito** da viela: aqui a parede fica de costas e não aparece. Só o telhado (laje, amianto, caixa d'água, varal) e a frente, que só se vê no começo da fileira | igual | `telhado_viela_dir.png` (1377×1425) |
| `cenario/barraco_a.png`, `_b` | Barraco de madeira, telha e lona, colorido e remendado (borda das vielas mais altas) | 3 × 3 m, 3,5 m de altura | `barraco_a.png` (1153×1220) |

## 3. Objetos em pé (transparentes, no ângulo do jogo)

Mesma regra das construções, numa caixa menor (`objeto_caixa_1m.png`): frente reta, tampo e lateral direita inclinados para a direita, sem ponto de fuga. Em objeto pequeno o erro aparece menos, mas a mesa, o sofá e o paredão de som são largos o bastante para destoar se vierem retos.

**Já existem e ficam como estão:** moto estacionada, caixa d'água, mesa de sinuca, barricada de pneus, tambor, entulho, pneus, botijão, mesa, cadeira de plástico, engradado e banquinho.

**Faltam:**

| Arquivo | O que é | Medida real (largura × fundo × altura) | Imagem |
| --- | --- | --- | --- |
| `cenario/churrasqueira.png` | Churrasqueira de tijolo de laje, com grelha e carvão | 0,8 × 0,8 × 0,95 m | ~240×300 |
| `cenario/varal.png` | Varal com roupas coloridas entre dois paus (camisas de time sem escudo, toalhas) | 4,0 × 0,2 × 1,9 m | ~700×400 |
| `cenario/fios_gatonet.png` | Emaranhado de fios do gatonet atravessando a viela no alto, com caixinhas penduradas (faixa comprida, vista de baixo para cima) | 5 m de comprimento, a 5,2 m de altura | ~900×250 |
| `cenario/bandeirinhas.png` | Bandeirinhas de festa atravessando a viela no alto | 5 m de comprimento, a 4 m de altura | ~900×200 |
| `cenario/bandeira_mastro.png` | Bandeira do Brasil num mastro de cano (a bandeira inteira, sem mudar forma nem cores, D28) | 0,2 × 0,2 × 3,4 m | ~300×600 |
| `cenario/placa_parede.png` | Placa de comércio pregada na parede, em branco (o jogo escreve "GELADINHO R$2", "SALÃO DA KELLY" e outras por cima) | 1,4 m de largura × 0,6 m | ~300×140 |
| `cenario/caixa_som_paredao.png` | Paredão de som do baile, caixas empilhadas com luz | 2,0 × 0,8 × 1,8 m | ~450×420 |
| `cenario/sofa_velho.png` | Sofá velho rasgado (vai na barricada do toque de recolher) | 1,8 × 0,8 × 0,8 m | ~380×250 |
| `cenario/cadeiras_empilhadas.png` | Pilha de cadeiras de plástico brancas | 0,6 × 0,6 × 1,4 m | ~180×330 |
| `cenario/vaso_planta.png` | Lata de tinta com planta (espada-de-são-jorge) | 0,4 × 0,4 × 0,8 m | ~130×220 |

**Lixo do chão** (vistos de cima, transparentes, 128×128 cada): saco de lixo, latinha amassada, papel, garrafa, papelão, bituca e poça. Hoje são desenhados em código.

## 4. Personagens

**Já existem:** Traficante, Chefe do Tráfico, Funkeiro Raivoso e Cachorro Caramelo (todos com caminhada e poses).

| Pacote | Descrição | Folhas |
| --- | --- | --- |
| `Morador_moleque` | Moleque sem camisa, bermuda vermelha, descalço, cabelo nevado | caminhada hipnotizada (braços à frente, olho azul) + ataque (avança agarrando) + raiva (grita de punho erguido) |
| `Morador_tiozinho` | Tiozinho de regata, bermuda jeans e chinelo de dedo | igual |
| `Morador_listrado` | Rapaz com a camisa listrada de preto e branco, sem escudo | igual |
| `Morador_moca` | Moça de short jeans, cropped e chinelo | igual |
| `Morador_senhor` | Senhor com a camisa branca de faixa preta na diagonal, sem escudo | igual |
| `Morador_senhora` | Senhora de vestido florido, bobe no cabelo e sacola | igual |
| `Cracudo` | Homem fictício magro, roupa suja e larga, chinelo de dedo, andar cambaleante | caminhada + pose agachada catando coisa no chão (16 direções) |
| `Trombadinha` | Ladrão fictício de boné e bermuda, mochila nas costas, andar rápido | caminhada + pose correndo com o celular roubado na mão (16 direções) |
| `Mototaxista` | Mototaxista fictício de colete sem número nem marca, capacete, moto popular sem logo | descendo a viela (de frente) e subindo (de costas), 6 quadros cada, com as rodas girando; serve para o inimigo e para a habilidade Mototáxi Amigo |

Os seis moradores são a horda do Morro (D37): cada um precisa das três folhas (caminhada 16×6, ataque e raiva em folhas 4×4 de 16 direções). As seis folhas do moleque foram geradas no Figma antes do limite do plano e não chegaram a ser baixadas.

## 5. Efeitos

| Arquivo | O que é | Imagem |
| --- | --- | --- |
| `efeitos/fogos.png` | Rojão estourando no céu (o Traficante avisa que o Juninho chegou) | 6 quadros de 256×256, numa tira |
| `efeitos/clarao_tiro.png` | Clarão de boca de fuzil | 4 quadros de 128×128 |
| `efeitos/faisca_gato.png` | Faísca do gato de luz em curto (crise do Morro) | 6 quadros de 256×256 |

## 6. Relíquia do Morro (decisão sua)

Uma relíquia por trecho, sempre no mesmo lugar (D40). As duas candidatas do plano:
- **Paredão de som:** um paredão portátil que o Juninho carrega; o grave empurra a horda em ondas. Arte: o objeto (~1,2 m) e o ícone (256×256).
- **Pipa com cerol:** a pipa voa em volta e a linha corta quem passa. Arte: a pipa (vista de cima, 256×256) e o ícone. A linha de cerol é um perigo real (mata motociclista); se for por ela, a sátira precisa deixar claro.

A minha recomendação é o Paredão de som, que combina com o Baile e não tem esse risco.

## 7. Ordem sugerida

1. **Chão:** cimento da viela, degraus, laje de concreto e os telhados vistos de cima. É o que mais muda a tela.
2. **Moradores:** são a horda, o que mais aparece.
3. **Casa com laje e fachadas.**
4. **Objetos que faltam**, a começar pelo paredão de som (usado no Baile) e pelos fios do gatonet.
5. **Cracudo, Trombadinha e Mototaxista.**
6. **Efeitos e a relíquia.**
7. **Paredes e telhados das vielas** (`parede_viela_esq` e `telhado_viela_dir`), com os gabaritos.

Quando cada pacote chegar, eu recorto, meço o ângulo contra o chão do jogo e coloco no lugar do provisório.

## 8. O que já está no jogo (pacote v2, 07/11/2026)

Conferido contra os gabaritos antes de entrar: as nove construções cobrem de 96% a 99% da forma, sem faltar nada, e as bordas de profundidade dão de 18,0° a 19,3° (o jogo usa 18°). Cada peça entra inteira, só na escala.

- **Casas em volta do caminho** (`prototype/src/favela.js`, desenho em `render_favela.js`): nos dois lados de cada viela, escadaria e pracinha, em módulos de 6 m (`parede_viela_esq` à esquerda, `telhado_viela_dir` à direita); o último módulo de cada lado, mais curto, é cortado no fundo pela silhueta da caixa. No alto de cada pedaço, menos na passagem para o de cima, entram as fachadas a, b e c sorteadas, e barracos a partir das vielas mais altas. As casas a oeste do caminho ficam atrás de quem anda; as a leste entram na ordem pela frente, e por isso o telhado da direita cobre cerca de 1 m da viela, como na câmera do jogo.
- **Casa com laje:** a arte com a escada do lado certo substitui o desenho em código; subir e descer continua igual.
- **Objetos:** churrasqueira, varal, bandeira no mastro, paredão de som, sofá velho e cadeiras empilhadas nas pracinhas; lata com planta nas vielas; fios do gatonet e bandeirinhas atravessando as vielas; a placa de parede com o nome escrito pelo jogo.

**Ainda pendente:** o chão (cimento, degraus, laje e telhados vistos de cima), o lixo do chão, os moradores, o Cracudo, o Trombadinha, o Mototaxista, os efeitos e a relíquia. Cada lado da viela tem uma arte só e ela se repete a cada 6 m: duas ou três variações de `parede_viela_esq` e `telhado_viela_dir` deixariam a viela menos repetida.
