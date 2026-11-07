# Pedido de arte: efeitos das habilidades (versão 2)

Hoje os efeitos das 11 habilidades são círculos e linhas desenhados em código (fotos em `efeitos_hoje/`). Este pedido lista, para cada habilidade, a ideia, as peças que faltam desenhar, o formato e um prompt pronto. Os números (raio, duração, alcance) vêm de `prototype/src/config.js`, `WEAPONS` e `WEAPON_FX`.

**Por que existe a versão 2:** a primeira versão pedia "luz" em fundo preto, com cores próprias de cada habilidade (magenta, ciano, azul elétrico). O gerador devolveu efeito de filme de fantasia: neon, anéis de energia, raio de banco de imagem. Nada disso tem a ver com o jogo (exemplos em `nao_assim/`). Esta versão troca a direção de arte.

## 1. A direção de arte: efeito que acontece na rua

O jogo é quase fotográfico, sujo, no fim de tarde do Rio, com luz quente vindo do alto à esquerda. O efeito tem que parecer que **aconteceu de verdade naquela rua**, exagerado como num jogo, e não que alguém lançou um feitiço.

1. **Matéria do mundo, não energia:** poeira do calçadão, pedrinha, papel, nota de dinheiro, tinta de carimbo, picolé derretido, gelo, borracha queimada, fumaça, faísca de fio desencapado. Cada habilidade é feita do que ela é.
2. **A paleta do jogo** (`paleta_efeitos.png`): a tela é quase toda marrom-acinzentada (asfalto, concreto, reboco, tijolo, ocre do sol). Os únicos tons vivos são o vermelho e o amarelo da TV CAOS, o verde da bandeira e as camisas da horda. A cor de cada efeito sai do objeto da habilidade (o amarelo do capacete, o azul desbotado do chinelo, o violeta da tinta de carimbo) e fica na mesma saturação do resto. O efeito pode ser a coisa mais clara da tela por um instante, mas não pode destoar dela.
3. **Brilho só onde a física manda:** o arco elétrico do Gato, o fogo da explosão da Maleta e as faíscas brilham. O resto não emite luz: é iluminado pelo sol como tudo, com sombra no lado direito e embaixo.
4. **Proibido:** neon, anel de energia, aura mágica, runa, símbolo, estrela, purpurina, partícula de fantasia, raio de "poder", brilho em volta de objeto comum, cor que não existe na rua (magenta, roxo neon, verde-limão neon).
5. **Peso e tempo:** aviso curto (quando a habilidade tem aviso), impacto forte (1 ou 2 quadros) e a matéria caindo e a fumaça subindo depois.
6. **Não esconder a horda:** o que fica no chão é translúcido; o que fica em pé dura pouco.
7. **A luz no chão, o jogo faz:** a poça de luz que o efeito joga na rua em volta (o clarão do raio, o fogo da explosão) o jogo desenha, na cor e no tamanho de cada habilidade. Não precisa pedir.

## 2. Formato

| Tipo | O que é | Como desenhar |
| --- | --- | --- |
| **No chão** | aura, poça, marca, faixa, poeira que corre rente ao chão | Vista exatamente de cima (90°), centrada, como as texturas de chão. Ela é plana e fica deitada no chão; o jogo a deita com a mesma conta do chão, e por isso ela pode girar e pulsar. Não desenhe oval nem inclinado. |
| **Em pé** | raio, explosão, faísca, poeira subindo, objeto voando | De frente para a câmera, como os personagens: visto um pouco de cima (câmera a 55°), sem perspectiva forte e sem ponto de fuga. |

- **Fundo transparente de verdade (PNG)** em todas as peças. Sem chão, sem sombra projetada, sem moldura.
- **Tamanhos que o ChatGPT gera:** 1024×1024 ou 1536×1024.
  - **Animação de 6 quadros:** grade de 3 colunas por 2 linhas de 512×512 (imagem de 1536×1024), lida da esquerda para a direita e de cima para baixo.
  - **Objeto girando ou partículas:** grade 4×4 de 256×256 (1024×1024).
  - **Peça única:** 1024×1024, com o efeito centrado.
  - **Faixa comprida:** até 4 faixas de 1536×256 empilhadas (1536×1024).
  - **Em todo quadro:** o mesmo centro, folga de uns 10% em volta e sem encostar na borda do quadro.
- **Escala:** cada peça diz quantos metros cobre. O Juninho aparece com cerca de 2,4 m na tela, e a horda passa a 1 ou 2 m dele.
- **Sem texto:** PÁ!, BUM!, NHAC!, AU AU!, DINHEIRO! e INDEFERIDO o jogo escreve por cima. Sem logotipo, marca, rosto real ou dinheiro de verdade (nota fictícia, sem rosto nem número).

## 3. Como pedir ao ChatGPT

Na primeira mensagem, anexe as referências da pasta `referencias/` do pacote (no repositório, as telas e os exemplos estão em `docs/arte/efeitos_referencias/` e a paleta em `docs/arte/paleta_efeitos.png`) (duas telas do jogo, o Juninho, um telespectador, os ícones e a paleta) e cole o **bloco de estilo**. Depois peça uma peça por mensagem, colando o prompt da tabela.

**Bloco de estilo (primeira mensagem):**

> Vou te pedir efeitos visuais para um jogo de celular chamado BRASIL: ESTADO DE CAOS. As imagens anexadas são telas do jogo, personagens e a paleta de cores: siga esse estilo em tudo. Regras para todos os efeitos:
> - O efeito acontece de verdade numa rua do Rio de Janeiro no fim de tarde, exagerado como num jogo: poeira, pedrinhas, papel, dinheiro, tinta, gelo, fumaça, faísca. Nada de magia ou fantasia: sem neon, sem anel de energia, sem aura mágica, sem runas, sem estrelinhas, sem purpurina, sem raio de poder.
> - Pintura quase fotográfica, suja e quente, com a mesma textura, o mesmo grão e as mesmas cores das telas anexadas. Use a paleta anexada; o efeito não pode destoar da tela.
> - Luz do sol de fim de tarde vindo do alto à esquerda. Só brilha o que brilha de verdade (arco elétrico, fogo, faísca); o resto é iluminado pelo sol.
> - Fundo 100% transparente (PNG), sem chão, sem sombra, sem moldura, sem nenhum texto, letra, número, logo ou marca.
> - Peça "no chão": vista exatamente de cima, 90°, centrada. Peça "em pé": de frente, vista um pouco de cima, sem perspectiva forte.
> Confirme que entendeu e espere o primeiro pedido.

Cada prompt das tabelas abaixo já diz o tipo, o formato e o tamanho.

## 4. Cada habilidade

Arquivos em `efeitos/<habilidade>/`. **C** = no chão, **P** = em pé.

### Capacete Bumerangue (a inicial)

**No jogo:** vai até a horda e volta para a mão em 0,9 s, a cada 1,5 s; acerta na ida e na volta. No nível 4 são 3 capacetes em leque. **Ideia:** o capacete de entregador girando, pesado, e cada acerto é uma pancada seca que levanta poeira. **Cor:** o amarelo-mostarda gasto do capacete.

| Arquivo | Tipo | Prompt | Cobre |
| --- | --- | --- | --- |
| `capacete_giro.png` | P | O capacete de entregador amarelo-mostarda, gasto e arranhado (o do ícone anexado), girando no ar de lado, com um leve borrão de movimento. Grade 4×4 de quadros de 256×256 (imagem 1024×1024): 16 quadros de uma volta inteira, o capacete no mesmo centro em todos. | 0,6 m |
| `pancada.png` | P | A pancada do capacete batendo numa pessoa: um estalo seco de poeira bege e suor espirrando, pedrinhas e lascas voando, sem brilho. Grade de 3 colunas por 2 linhas, quadros de 512×512 (imagem 1536×1024), do impacto ao fim. | 1,2 m |

**Entrega Expressa (evolução):** `entrega_giro.png` (o mesmo capacete, mas dourado e novo, com reflexo do sol; 16 quadros) e `entrega_ricochete.png` (a pancada com faíscas de metal e um reflexo dourado; 6 quadros). Mesmos formatos.

### Chinelo Voador

**No jogo:** rajada de 2 a 4 chinelos em fila, a 15 m/s, até 9 m, na direção da horda. No nível 5, uma segunda rajada sai para o outro lado. **Ideia:** a chinelada de mãe: o chinelo de dedo voa girando de lado e cada acerto é um estalo achatado que levanta poeira. **Cor:** azul desbotado e branco.

| Arquivo | Tipo | Prompt | Cobre |
| --- | --- | --- | --- |
| `chinelo_giro.png` | P | Chinelo de dedo de borracha genérico, sola branca e tira azul desbotada, gasto, sem marca, girando no ar de lado, com leve borrão. Grade 4×4 de 256×256 (1024×1024): 16 quadros de uma volta. | 0,4 m |
| `chinelada.png` | P | O estalo da chinelada: uma onda achatada de poeira bege em leque, gotas de suor e de água espirrando, a marca vermelha de pele aparecendo; sem brilho. Grade 3×2 de 512×512 (1536×1024). | 1,0 m |

### Boleto Atrasado

**No jogo:** 2 a 5 boletos giram em volta do Juninho, a 1,6 a 1,95 m, por 3,2 a 4,1 s, e cobram de quem encosta a cada 0,5 s. **Ideia:** um redemoinho de contas vencidas: papel voando com o vento, e quem encosta leva um corte de papel e solta moedas. **Cor:** papel creme e o vermelho apagado de "vencido".

| Arquivo | Tipo | Prompt | Cobre |
| --- | --- | --- | --- |
| `boleto_folha.png` | P | Boleto bancário genérico, papel creme amassado com código de barras e uma faixa vermelha apagada, sem letras nem números legíveis, voando e dobrando no vento. Grade 4×4 de 256×256 (1024×1024): 4 boletos diferentes, 4 quadros de cada, um por linha. | 0,5 m |
| `boleto_vento.png` | C | Visto exatamente de cima: o redemoinho no chão, um anel de poeira bege e papeizinhos varridos em círculo, mais forte de um lado (o jogo gira junto com os boletos). Peça única 1024×1024. | 4,5 m (o diâmetro) |
| `cobranca.png` | P | O corte da cobrança: o papel rasgando no ar, pedaços de boleto e moedas de metal caindo, um risco vermelho apagado. Grade 3×2 de 512×512 (1536×1024). | 1,2 m |

### Carimbo Oficial

**No jogo:** a sombra cresce no chão e o carimbo cai do céu em 0,55 s, numa área de 2 a 2,6 m de lado; quem está embaixo leva dano e fica lento por 2 a 3 s, e o chão fica marcado com INDEFERIDO. **Ideia:** a burocracia caindo do céu: um carimbo de madeira gigante bate com um baque que levanta poeira e papelada, e deixa a tinta violeta no chão, que vai apagando. **Cor:** a madeira do cabo e o violeta escuro de tinta de repartição.

| Arquivo | Tipo | Prompt | Cobre |
| --- | --- | --- | --- |
| `carimbo_queda.png` | P | Carimbo de repartição gigante: cabo de madeira envernizada e gasta, base de borracha cheia de tinta violeta escura, caindo reto com borrão de velocidade. 3 quadros lado a lado de 512×1024 (imagem 1536×1024): no alto, no meio e quase tocando o chão. | 2,6 m de base |
| `carimbo_marca.png` | C | Visto exatamente de cima: a marca de carimbo no asfalto, um retângulo de tinta violeta escura com moldura dupla, falhada e com respingos, **sem nenhuma letra** (o jogo escreve). Peça única 1024×1024. | 2,6 m |
| `carimbo_baque.png` | P | O baque no chão: poeira bege saindo rente ao chão para todos os lados, folhas de papel e clipes voando. Grade 3×2 de 512×512 (1536×1024). | 3,5 m |

### Maleta de Dinheiro

**No jogo:** a maleta cai aberta a 4,5 m, na direção da horda. Por 2,2 a 2,8 s a horda corre atrás do dinheiro; nos últimos 0,6 s ela pisca o aviso e explode, num raio de 2,6 a 3,2 m, jogando para o alto quem sobrevive. A maleta aberta já tem arte. **Ideia:** a tentação e a armadilha: notas espalhadas no chão em volta da maleta, a horda corre, e a explosão é fogo de verdade com notas queimando. **Cor:** o verde-acinzentado das notas; o laranja do fogo e a fumaça marrom-escura.

| Arquivo | Tipo | Prompt | Cobre |
| --- | --- | --- | --- |
| `notas_chao.png` | C | Visto exatamente de cima: notas de dinheiro fictícias (verde-acinzentadas, sem rosto e sem número) espalhadas no chão em círculo, mais juntas no meio e soltas na borda, com algumas moedas. Peça única 1024×1024. | 3 m |
| `notas.png` | P | Notas de dinheiro fictícias voando e dobrando no ar, iluminadas pelo sol. Grade 4×4 de 256×256 (1024×1024): 4 notas, 4 quadros de cada. | 0,3 m |
| `explosao.png` | P | A explosão da maleta: clarão, bola de fogo laranja baixa e larga vista um pouco de cima, com notas e pedaços de couro voando; termina em brasa e fumaça escura. Fogo de verdade, como numa foto de explosão, sem anel de energia. Grade 3×2 de 512×512 (1536×1024). | 6 m |
| `explosao_fumaca.png` | P | Fumaça marrom-escura e cinza subindo, com notas queimando nas beiradas e cinzas caindo. Grade 3×2 de 512×512 (1536×1024). | 5 m |
| `chamuscado.png` | C | Visto exatamente de cima: a marca preta de queimado no asfalto, com notas meio queimadas e cinzas em volta. Peça única 1024×1024. | 4 m |

### Isopor de Picolé (só na Orla)

**No jogo:** poças atrás do Juninho, de 0,75 a 1,2 m de raio, por 2,6 a 4 s (até 16 ao mesmo tempo). Quem pisa fica lento; no nível 4, às vezes congela por 1 s. **Ideia:** picolé de fruta derretido no calçadão quente, poça grudenta com pedaços de gelo; quem congela fica com gelo subindo pelas pernas. **Cor:** as cores das frutas (groselha, uva, limão, coco) e o branco-azulado do gelo.

| Arquivo | Tipo | Prompt | Cobre |
| --- | --- | --- | --- |
| `pocas.png` | C | Visto exatamente de cima: 4 poças de picolé derretido no chão, uma em cada quarto da imagem (2×2): groselha, uva, limão e coco, molhadas e brilhando de sol, com pedacinhos de gelo e um palito de picolé. Imagem 1024×1024. | 2,4 m cada |
| `congelado.png` | P | Gelo branco-azulado crescendo dos pés até a cintura, como se fosse em volta das pernas de uma pessoa (só o gelo, sem a pessoa). Grade 3×2 de 512×512 (1536×1024), do começo ao gelo inteiro. | 1,6 m de altura |
| `gelo_quebra.png` | P | O gelo estilhaçando em cacos e lascas que caem, com gotas de água. Grade 3×2 de 512×512 (1536×1024). | 2 m |

### Mototáxi Amigo (só no Morro)

**No jogo:** uma faixa pisca por 0,7 s no caminho, com "BI-BI!", e a moto passa a 24 m/s numa faixa de 22 m por 1 a 1,5 m. A moto e o mototaxista estão no pedido da favela. **Ideia:** a faixa é a marca de quem vai passar: tinta de rua vermelha e branca gasta, como faixa de obra; a moto deixa marca de pneu, poeira de terra e fumaça de escapamento. **Cor:** o vermelho e o branco de tinta de rua; a poeira de terra e a borracha.

| Arquivo | Tipo | Prompt | Cobre |
| --- | --- | --- | --- |
| `faixa_aviso.png` | C | Visto exatamente de cima: faixa de aviso pintada no chão, listras diagonais vermelhas e brancas de tinta de rua gasta, com setas brancas apontando para a frente, emendando nas pontas para repetir. Faixa de 1536×256 na primeira linha de uma imagem 1536×1024. | 6 × 1 m |
| `pneu_queimado.png` | C | Visto exatamente de cima: marca dupla de pneu de moto queimado no chão, com poeira, emendando nas pontas. Faixa de 1536×256 na primeira linha de 1536×1024. | 6 × 1 m |
| `poeira_moto.png` | P | Nuvem de poeira de terra e fumaça de escapamento levantando atrás de uma moto. Grade 3×2 de 512×512 (1536×1024). | 2,5 m |
| `atropelo.png` | P | O impacto da moto numa pessoa: poeira, pedrinhas, um chinelo e um boné voando. Grade 3×2 de 512×512 (1536×1024). | 1,8 m |

### Megafone da TV

**No jogo:** a aura fica sempre ligada em volta do Juninho, num raio de 1,9 m que chega a 2,6 m no nível 5 (e a uns 3,9 m com a Mochila no máximo). A cada 0,5 s ela pulsa, machuca de leve e empurra quem está dentro. **Ideia:** o som do plantão da TV saindo do megafone com tanta força que mexe no chão: anéis de poeira e pedrinhas levantadas, o ar tremendo como calor no asfalto, e um brilho amarelo fraco da cor do plantão, nítido na borda e quase invisível no meio. **Cor:** o amarelo e o vermelho da TV CAOS, sobre a poeira.

| Arquivo | Tipo | Prompt | Cobre |
| --- | --- | --- | --- |
| `aura_base.png` | C | Visto exatamente de cima, deitado no chão: a onda de som do megafone. Anéis concêntricos irregulares de poeira bege levantada e pedrinhas tremendo, o ar distorcido como calor no asfalto e um brilho amarelo quente fraco (amarelo #ffd21f do plantão da TV), mais forte na borda e quase invisível no meio. Nada de neon nem anel de energia. A borda da onda a uns 90% da imagem. Peça única 1024×1024. | o diâmetro da aura |
| `aura_pulso.png` | C | Visto exatamente de cima: o pulso do megafone, um anel de poeira e de ar empurrado saindo do centro até a borda, com papéis e tampinhas sendo varridos para fora. Grade 3×2 de 512×512 (1536×1024). | o diâmetro da aura |
| `empurrao.png` | P | O empurrão do som numa pessoa: o ar batendo, poeira e suor espirrando para trás, a camisa sacudindo (só o efeito, sem a pessoa). Grade 3×2 de 512×512 (1536×1024). | 1,2 m |

### Gato de Luz

**No jogo:** a cada 1,4 s sai um choque do Juninho para o inimigo mais perto (até 7 m), que pula para 3 a 5 vizinhos a 2,6 a 3,4 m; aparece por 0,28 s e trava cada um por 0,35 s. No nível 5 saem 2 choques. **Ideia:** um raiozão azul de verdade: o fio do gato de luz puxado do poste dá curto e o arco elétrico pula de um para o outro, como um curto-circuito filmado na rua. Cada um que leva o choque estoura em faíscas de metal e fumaça e fica com o chão queimado. **Cor:** o arco elétrico branco no meio e azul-claro em volta (#9fd4ff), faíscas laranja de metal derretido, fumaça cinza.

| Arquivo | Tipo | Prompt | Cobre |
| --- | --- | --- | --- |
| `raio.png` | P | 4 arcos elétricos diferentes, deitados na horizontal, um em cada faixa da imagem: o arco de um curto-circuito de verdade, núcleo branco, azul-claro em volta, galhos finos, faíscas laranja saindo; as pontas afinam para emendar uma na outra. Como foto de arco elétrico, não raio de fantasia. 4 faixas de 1536×256 empilhadas (1536×1024). | 3 m cada |
| `raio_estouro.png` | P | O estouro do choque numa pessoa: clarão branco-azulado curto, faíscas laranja de metal saltando, fumaça cinza subindo (só o efeito, sem a pessoa). Grade 3×2 de 512×512 (1536×1024). | 2,5 m |
| `eletrocutado.png` | P | Arcos elétricos curtos e faíscas em volta de um corpo de pé (sem o corpo), com fumacinha, mudando de lugar em cada quadro para piscar em laço. Grade 2×2 de 512×512 (1024×1024): 4 quadros. | 2,4 m de altura |
| `raio_origem.png` | P | A ponta de um fio elétrico desencapado, com a fita isolante solta, estourando em faíscas e num arco curto. Grade 2×2 de 512×512 (1024×1024): 4 quadros. | 0,8 m |
| `chamuscado_raio.png` | C | Visto exatamente de cima: marca de queimado elétrico no asfalto, em estrela, com brasinhas e fumaça fina. Peça única 1024×1024. | 1,5 m |

### Cachorro Caramelo

**No jogo:** o Caramelo já tem arte. Ele corre até o inimigo, dá o bote (a mordida dura 0,36 s), morde 2 ou 3 e volta. No nível 4, depois de morder, late e a horda em volta recua 2,4 m. **Ideia:** força de vira-lata: a mordida levanta poeira e pedaço de pano; o latido é um empurrão de ar que varre poeira e papel em leque; as patas levantam poeira na arrancada. **Cor:** o caramelo do pelo e a poeira.

| Arquivo | Tipo | Prompt | Cobre |
| --- | --- | --- | --- |
| `mordida.png` | P | O impacto da mordida de um cachorro numa perna: poeira, pedaços de pano de calça rasgada e baba espirrando (só o efeito, sem o cachorro e sem a pessoa). Grade 3×2 de 512×512 (1536×1024). | 1 m |
| `latido_onda.png` | C | Visto exatamente de cima: o empurrão do latido, um leque de poeira e papéis sendo varridos para a frente no chão. Grade 3×2 de 512×512 (1536×1024). | 5 m |
| `poeira_patas.png` | P | Poeirinha de terra levantando das patas de um cachorro na arrancada e na freada (só a poeira). Grade 3×2 de 512×512 (1536×1024). | 1 m |

## 5. Ordem sugerida

1. **Megafone e Gato de Luz:** o Megafone fica o tempo todo na tela, e o Gato é o mais vistoso.
2. **Maleta e Carimbo:** as explosões grandes.
3. **Capacete, Chinelo e Boleto:** o que mais aparece no começo (o Capacete é a arma inicial).
4. **Picolé e Mototáxi:** as exclusivas da Orla e do Morro.
5. **Caramelo.**

## 6. Quando chegar

Eu confiro cada peça antes de pôr no jogo: fundo transparente, centro e escala, peça de chão vista de cima, e se a cor está dentro da paleta. Volta a peça com neon, anel de energia, brilho de magia, cor fora da paleta, fundo sólido ou chão oval.

## 7. O que já está no jogo (pacote de 07/11/2026)

Chegaram as 35 peças. 34 estão no jogo (`prototype/assets/efeitos/`, tabela em `prototype/src/efeitos_arte.js`, desenho em `prototype/src/render_fx.js`), e cada folha só carrega quando o Juninho tem a habilidade.

- **Capacete e Entrega Expressa:** o capacete girando (amarelo e dourado), a pancada e o ricochete em quem leva.
- **Chinelo:** o chinelo girando e a chinelada.
- **Boleto:** os 4 boletos voando na roda, o redemoinho de poeira e papel no chão e o corte da cobrança.
- **Carimbo:** o carimbo de madeira caindo, o baque de poeira e papelada e a marca violeta com o INDEFERIDO escrito pelo jogo, que apaga com a lentidão.
- **Maleta:** as notas voando em volta da maleta aberta, a explosão, a fumaça com notas queimando e a marca preta no chão; no aviso, a luz vira vermelha e a maleta treme.
- **Picolé:** as 4 poças, o gelo subindo nas pernas de quem congela e o gelo estilhaçando.
- **Mototáxi:** a faixa pintada com as setas, a poeira atrás da moto, a marca de pneu e o atropelo.
- **Megafone:** a aura de poeira no chão, o pulso e o empurrão.
- **Gato de Luz:** os arcos emendados de um inimigo ao outro, com um brilho azul em volta, o estouro, os arcos no corpo de quem trava, a faísca na mão e o chão queimado.
- **Caramelo:** a mordida, a onda do latido no chão e a poeira das patas.

**Falta:** `notas_chao.png` (o dinheiro espalhado no chão em volta da maleta) veio pegando fogo; a isca precisa do dinheiro inteiro, chamando a horda. Enquanto não chega, a isca usa as notas voando e a luz quente do ouro.

**Ajustes feitos aqui:** o fundo claro da marca de pneu ficou transparente.
