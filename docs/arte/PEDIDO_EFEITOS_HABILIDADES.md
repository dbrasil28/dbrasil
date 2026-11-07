# Pedido de arte: efeitos das habilidades

Hoje os efeitos das 11 habilidades são círculos, linhas e manchas desenhados em código (fotos em `efeitos_hoje/`): sem luz, sem volume, sem nada que diga o que a habilidade é. Este pedido lista, para cada habilidade, a ideia visual, as peças que faltam desenhar e o formato de cada uma. Os números (raio, duração, alcance) vêm de `prototype/src/config.js`, `WEAPONS` e `WEAPON_FX`.

## 1. O que faz um efeito bom aqui

1. **Cada habilidade tem uma cor e uma forma próprias.** No celular, o jogador tem que saber o que está acontecendo em meio segundo, no meio de 80 zumbis. A cor de cada uma está na tabela abaixo; não repita a cor de outra.
2. **Luz de verdade, não traço.** Núcleo quase branco, a cor saturada no meio e a borda se dissolvendo, como luz real. Nunca um círculo de linha fina com cor chapada.
3. **Três camadas em todo efeito:**
   - **Luz no chão:** a poça de luz que o efeito joga na rua em volta. É ela que faz o efeito parecer estar no mundo e não colado por cima.
   - **Corpo:** o raio, a onda, a explosão, o objeto girando.
   - **Matéria:** fumaça, poeira, papel, gelo, notas, cacos. Dá peso e dura mais que a luz.
4. **Tempo em três partes:** aviso curto (quando a habilidade tem aviso), impacto forte (1 ou 2 quadros bem mais claros) e dissipação mais longa, com a matéria caindo e a fumaça subindo.
5. **Não esconder a horda.** O que fica no chão é translúcido. O que fica em pé dura pouco. O centro da aura do Megafone é mais fraco que a borda, para não apagar o Juninho.
6. **Mesmo mundo dos personagens:** pintado, quase fotográfico, saturado, fim de tarde com o sol vindo do alto à esquerda. O efeito tem luz própria: o lado mais claro dele é o de dentro, não o da esquerda.

| Habilidade | Cor | Forma |
| --- | --- | --- |
| Capacete Bumerangue | amarelo-laranja de entregador | arco de vento que vai e volta |
| Entrega Expressa (evolução) | dourado com brilho branco | arco dourado e estrela no ricochete |
| Chinelo Voador | azul anil e branco | risco reto e estalo achatado |
| Boleto Atrasado | vermelho-alaranjado de conta vencida, papel creme | anel girando com papel |
| Carimbo Oficial | violeta de tinta de carimbo | quadrado que cai e marca o chão |
| Maleta de Dinheiro | verde-dinheiro e dourado; aviso vermelho | brilho de ouro no chão e explosão de notas |
| Isopor de Picolé | ciano gelado e as cores das frutas | poças brilhantes e cristais |
| Mototáxi Amigo | vermelho de sirene e branco do farol | faixa no chão e rastro reto |
| Megafone da TV | magenta e ciano de sinal de TV | aura de ondas no chão |
| Gato de Luz | azul elétrico com núcleo branco | raio em zigue-zague e estouro |
| Cachorro Caramelo | âmbar quente | arco de dentes e onda em leque |

## 2. Formato

**Dois tipos de peça, e o ângulo de cada um:**

| Tipo | O que é | Como desenhar |
| --- | --- | --- |
| **No chão** | aura, poça, marca, faixa, luz no chão, onda que corre no chão | **Vista exatamente de cima (90°)**, centrada, como as texturas de chão. Ela é plana e fica deitada no chão; o jogo a deita com a mesma conta do chão, e por isso ela pode girar e pulsar. Não desenhe a aura oval nem inclinada. |
| **Em pé** | raio, explosão, faísca, clarão, objeto voando, fumaça | **De frente para a câmera, de pé**, como os personagens: visto um pouco de cima (câmera a 55°), sem perspectiva forte e sem ponto de fuga. |

**Luz e matéria vêm separadas:**
- **Luz** (brilho, raio, clarão, aura): em **fundo preto puro (#000000)**, sem transparência. O jogo soma a luz na tela (mistura aditiva): o preto some e o brilho fica limpo, sem borda suja. Não ponha nada escuro numa peça de luz.
- **Matéria** (fumaça, poeira, papel, gelo, notas, marca no chão): **PNG com fundo transparente de verdade**.

**Tamanhos:** os que o ChatGPT gera, para não precisar cortar: 1024×1024, 1536×1024 ou 1024×1536.
- **Animação de 6 quadros:** grade de 3 colunas × 2 linhas de 512×512 (imagem de 1536×1024), lida da esquerda para a direita e de cima para baixo.
- **Partículas pequenas:** grade 4×4 de 256×256 (1024×1024).
- **Peça única:** 1024×1024. O jogo anima girando, pulsando, subindo ou apagando.
- **Peça comprida:** até 4 faixas empilhadas de 1536×256 (1536×1024).
- **Em todo quadro:** o efeito fica no mesmo centro, sem encostar na borda do quadro (folga de uns 10%). Quadro de laço: o último emenda no primeiro.

**Escala:** cada item diz quantos metros a imagem cobre. Para comparar, o Juninho aparece com cerca de 2,4 m na tela (1,7 m desenhado 1,4 vez maior) e a horda passa a 1 ou 2 m dele.

**Sem texto:** as palavras PÁ!, BUM!, NHAC!, AU AU!, DINHEIRO! e INDEFERIDO o jogo escreve por cima, na fonte do jogo. Sem logotipo, marca, rosto real ou dinheiro de verdade (nota fictícia, sem rosto e sem número).

**Por que poucas peças:** o gerador é fraco em animação quadro a quadro. Cada efeito pede poucas peças, e o jogo anima o resto: gira, pulsa, sobe a fumaça, apaga a luz e joga as partículas.

## 3. Prompt para o ChatGPT

Cole o prompt de estilo do guia (`GUIA_DE_PRODUCAO_DE_ARTE.md`, seção 3) na primeira mensagem. Depois, para cada peça, use um destes três, trocando o que está entre colchetes pela descrição da tabela da habilidade:

**Luz em pé:**
> Efeito visual de jogo de celular, pintado, quase fotográfico e muito bem iluminado: [DESCRIÇÃO]. Fundo preto puro (#000000) e nada além do efeito. Núcleo quase branco, [COR] saturado no meio, borda que se dissolve no preto, com volume: camadas de luz, brilho e faíscas em profundidades diferentes. Visto de frente, um pouco de cima, sem perspectiva forte. Sem texto, sem logotipo, sem moldura. [QUADROS: por exemplo "6 quadros de animação numa grade de 3 colunas por 2 linhas, cada quadro 512×512, o efeito no mesmo centro em todos, do começo ao fim: …"]

**Luz no chão:**
> Efeito visual de jogo de celular, pintado e muito bem iluminado, visto exatamente de cima (90°), centrado, deitado no chão: [DESCRIÇÃO]. Fundo preto puro (#000000). Núcleo e borda como luz de verdade, [COR], com textura e detalhe, nunca um círculo de linha lisa. Sem texto, sem logotipo. Imagem quadrada de 1024×1024, o efeito centrado com folga em volta.

**Matéria:**
> Elemento de efeito de jogo de celular, pintado, quase fotográfico: [DESCRIÇÃO]. Fundo transparente de verdade (PNG), sem chão, sem sombra, sem texto. [Visto de frente, um pouco de cima | visto exatamente de cima, 90°]. [QUADROS]

## 4. Cada habilidade

Arquivos em `prototype/assets/efeitos/<habilidade>/`. Tipo: **C** = no chão, **P** = em pé; **L** = luz (fundo preto), **M** = matéria (transparente).

### Capacete Bumerangue (a inicial)

**No jogo:** o capacete vai até a horda e volta para a mão em 0,9 s, a cada 1,5 s; acerta na ida e na volta. No nível 4 são 3 capacetes abrindo em leque. **Hoje:** um capacete pequeno e um traço amarelo.

**Ideia:** o capacete de entregador girando rápido, cortando o ar com um arco de vento quente, e cada acerto é uma pancada seca, com estrela de impacto e faíscas.

| Arquivo | Tipo | O que desenhar | Formato | Cobre |
| --- | --- | --- | --- | --- |
| `capacete_giro.png` | P M | O capacete de entregador (o mesmo do ícone `w_capacete.png`) girando no ar, um pouco borrado pelo giro | grade 4×4 de 256: 16 quadros de uma volta inteira | 0,6 m |
| `capacete_rastro.png` | P L | Rastro de vento quente amarelo-laranja, curvo, mais forte na frente e se desfazendo atrás | peça única, 1536×256 (na primeira faixa de uma imagem 1536×1024) | 3 m |
| `pancada.png` | P L | A pancada: clarão amarelo, estrela de impacto, anel de choque e faíscas voando | 6 quadros (3×2 de 512) | 1,5 m |
| `pegou_volta.png` | P L | O brilho de quando o capacete volta para a mão: um estalo pequeno de luz | 6 quadros (3×2 de 512) | 0,8 m |

**Entrega Expressa (evolução):** `entrega_giro.png` (o capacete dourado, 16 quadros), `entrega_rastro.png` (rastro dourado com brilho branco) e `entrega_ricochete.png` (6 quadros: estrela dourada e faíscas a cada ricochete). Mesmos formatos do Capacete.

### Chinelo Voador

**No jogo:** rajada de 2 a 4 chinelos em fila, a 15 m/s, até 9 m, na direção da horda; cada um atravessa 1 ou 2 inimigos. No nível 5, uma segunda rajada sai para o outro lado. **Hoje:** chinelinho pequeno e "PÁ!".

**Ideia:** a chinelada de mãe. O chinelo de dedo voa girando de lado e cada acerto é um estalo achatado, como uma onda de choque em leque: é o "PÁ!" que se vê.

| Arquivo | Tipo | O que desenhar | Formato | Cobre |
| --- | --- | --- | --- | --- |
| `chinelo_giro.png` | P M | Chinelo de dedo de borracha azul e branco, genérico, sem marca, girando de lado | grade 4×4 de 256: 16 quadros de uma volta | 0,4 m |
| `chinelo_vento.png` | P L | Risco de vento reto, azul claro, atrás do chinelo | peça única 1536×256 | 2,5 m |
| `chinelada.png` | P L | O estalo: onda de choque achatada em leque, branca-creme com borda azul, poeira fina e gotas de suor saltando | 6 quadros (3×2 de 512) | 1,2 m |

### Boleto Atrasado

**No jogo:** 2 a 5 boletos giram em volta do Juninho, a 1,6 a 1,95 m, por 3,2 a 4,1 s, e cobram de quem encosta a cada 0,5 s. **Hoje:** retângulos brancos com a palavra BOLETO e um anel cinza.

**Ideia:** um redemoinho de cobrança. As contas vencidas voam em volta dele num anel de vento avermelhado; quem encosta leva um corte de papel e solta moedinhas.

| Arquivo | Tipo | O que desenhar | Formato | Cobre |
| --- | --- | --- | --- | --- |
| `boleto_folha.png` | P M | O boleto voando: folha de papel creme com código de barras genérico e uma faixa vermelha, dobrando e tremendo no vento, sem letras | grade 4×4 de 256: 4 boletos diferentes × 4 quadros | 0,5 m |
| `boleto_orbita.png` | C L | O rastro da órbita no chão: anel de vento vermelho-alaranjado com borrão de movimento, mais forte num lado e sumindo no outro (o jogo gira junto com os boletos) | peça única 1024 | 4,5 m (o diâmetro) |
| `cobranca.png` | P L | O corte da cobrança: risco cortante vermelho em diagonal, faíscas e moedinhas brilhando | 6 quadros (3×2 de 512) | 1,2 m |
| `papel_picado.png` | P M | Pedacinhos de papel e moedinhas caindo | grade 4×4 de 256 (16 pedaços soltos) | 0,2 m cada |

### Carimbo Oficial

**No jogo:** a sombra cresce no chão e o carimbo cai do céu em 0,55 s, numa área de 2 a 2,6 m de lado; quem está embaixo leva dano e fica lento por 2 a 3 s, e o chão fica marcado com INDEFERIDO. **Hoje:** um retângulo vermelho e duas varetas.

**Ideia:** a burocracia caindo do céu. Um carimbo de madeira gigante, de cabo torneado, cai com borrão de velocidade, bate com um baque que levanta poeira e papelada, e deixa uma marca violeta de tinta falhada no chão, que vai apagando enquanto a lentidão dura.

| Arquivo | Tipo | O que desenhar | Formato | Cobre |
| --- | --- | --- | --- | --- |
| `carimbo_queda.png` | P M | O carimbo gigante de madeira com a base de borracha cheia de tinta violeta, caindo reto, com borrão de velocidade: alto, no meio e quase tocando o chão | 3 quadros lado a lado, de 512×1024 (imagem 1536×1024) | 2,6 m de base |
| `carimbo_marca.png` | C M | A marca no chão, vista de cima: retângulo de tinta violeta com moldura dupla, falhada e com respingos, **sem letras** (o jogo escreve INDEFERIDO) | peça única 1024 | 2,6 m |
| `carimbo_baque.png` | P M | O baque: anel de poeira saindo rente ao chão, papéis e clipes voando | 6 quadros (3×2 de 512) | 3,5 m |
| `carimbo_luz.png` | C L | Clarão violeta no chão no instante do impacto | peça única 1024 | 4 m |

### Maleta de Dinheiro

**No jogo:** a maleta sobe em arco (0,85 s) e cai aberta a 4,5 m, na direção da horda. Por 2,2 a 2,8 s a horda corre atrás do dinheiro, de até 7 a 8,5 m de distância. Nos últimos 0,6 s ela pisca o aviso e explode, num raio de 2,6 a 3,2 m, jogando para o alto quem sobrevive. **Hoje:** a maleta aberta (já tem arte, `maleta_voo_aberta.png`), um círculo verde tracejado e um círculo vermelho piscando.

**Ideia:** a tentação e a armadilha. A maleta aberta joga uma luz dourada de ouro no chão, as notas voam em volta e um brilho chama a horda de longe. No aviso, a luz vira vermelha e a maleta treme. A explosão é uma bola de fogo dourada cheia de notas e moedas, com onda de choque no chão e fumaça com notas queimando.

| Arquivo | Tipo | O que desenhar | Formato | Cobre |
| --- | --- | --- | --- | --- |
| `isca_luz.png` | C L | A luz do dinheiro no chão: poça dourada-esverdeada, com raios e cintilação de ouro | peça única 1024 | 3 m |
| `isca_chamado.png` | C L | O chamado: anel largo e fraco de brilho dourado, quebrado em fagulhas, que marca até onde a horda é atraída (no lugar do tracejado verde) | peça única 1024 | o diâmetro da atração, de 14 a 17 m (o jogo escala) |
| `notas.png` | P M | Notas de dinheiro fictícias (verdes e douradas, sem rosto nem número) voando e dobrando no ar | grade 4×4 de 256: 4 notas × 4 quadros | 0,3 m |
| `aviso.png` | C L | O aviso: anel vermelho de perigo, com listras de alerta e brilho pulsando para dentro, no raio da explosão | peça única 1024 | o diâmetro da explosão, de 5,2 a 6,4 m (o jogo escala) |
| `explosao.png` | P L | A explosão: clarão branco, bola de fogo laranja-dourada baixa e larga, vista um pouco de cima, com notas e moedas brilhando lá dentro; termina em brasa | 6 quadros (3×2 de 512) | 6 m |
| `explosao_onda.png` | C L | A onda de choque no chão: anel de luz laranja saindo do centro | 6 quadros (3×2 de 512) | 7 m |
| `explosao_fumaca.png` | P M | Fumaça escura subindo, com notas queimando nas beiradas | 6 quadros (3×2 de 512) | 5 m |
| `chamuscado.png` | C M | Marca preta de queimado no chão, com notas meio queimadas em volta | peça única 1024 | 4 m |

### Isopor de Picolé (só na Orla)

**No jogo:** o Juninho deixa poças atrás de si, de 0,75 a 1,2 m de raio, que duram 2,6 a 4 s (até 16 ao mesmo tempo). Quem pisa fica lento; no nível 4, às vezes congela por 1 s. **Hoje:** elipses azuis.

**Ideia:** picolé de fruta derretido no calçadão quente. Poças coloridas e brilhantes de groselha, uva, limão e coco, com cristais de gelo na borda e um vapor frio subindo. Quem congela fica com gelo subindo pelas pernas e, quando solta, o gelo estilhaça.

| Arquivo | Tipo | O que desenhar | Formato | Cobre |
| --- | --- | --- | --- | --- |
| `poca_a.png` a `poca_d.png` | C M | Poça de picolé derretido vista de cima: groselha (vermelha), uva (roxa), limão (verde) e coco (branca), molhada e brilhante, com cristais de gelo na borda e um palito de picolé | peça única 1024 cada | 2,4 m |
| `poca_frio.png` | C L | O brilho gelado debaixo da poça: luz ciano com textura de cristal | peça única 1024 | 2,8 m |
| `vapor_frio.png` | P M | Vapor frio subindo, branco-azulado e transparente | 6 quadros (3×2 de 512) | 1,5 m |
| `congelado.png` | P M | Gelo crescendo dos pés até a cintura de quem pisou (só o gelo, sem a pessoa: o jogo põe por cima do inimigo) | 6 quadros (3×2 de 512) | 1,6 m de altura |
| `gelo_quebra.png` | P M | O gelo estilhaçando em cacos brilhantes | 6 quadros (3×2 de 512) | 2 m |

### Mototáxi Amigo (só no Morro)

**No jogo:** uma faixa vermelha pisca por 0,7 s no caminho, com "BI-BI!", e a moto passa a 24 m/s, numa faixa de 22 m de comprimento e 1 a 1,5 m de largura. **Hoje:** faixa vermelha lisa e a moto desenhada em código. A moto e o mototaxista estão no pedido da favela (`PEDIDO_FAVELA.md`, Mototaxista).

**Ideia:** sirene e arrancada. A faixa de aviso é uma pista de luz vermelha com setas correndo na direção em que a moto vem; a moto chega com o farol jogando um cone de luz na viela e deixa marca de pneu queimado, poeira e um rastro de velocidade.

| Arquivo | Tipo | O que desenhar | Formato | Cobre |
| --- | --- | --- | --- | --- |
| `faixa_aviso.png` | C L | Pista de alerta vista de cima: faixa vermelha de luz com setas brancas apontando para a frente, que emenda nas pontas para repetir ao longo | faixa 1536×256 (na primeira faixa de 1536×1024) | 6 × 1 m |
| `farol.png` | C L | Cone de luz branca-amarelada do farol, no chão à frente da moto | peça única 1024 | 5 m |
| `pneu_queimado.png` | C M | Marca dupla de pneu queimado com poeira, que emenda nas pontas | faixa 1536×256 | 6 × 1 m |
| `poeira_moto.png` | P M | Nuvem de poeira de terra levantando atrás da moto | 6 quadros (3×2 de 512) | 2,5 m |
| `atropelo.png` | P L | O impacto: clarão, linhas de velocidade e faíscas | 6 quadros (3×2 de 512) | 1,8 m |

### Megafone da TV

**No jogo:** a aura fica sempre ligada em volta do Juninho, num raio de 1,9 m que chega a 2,6 m no nível 5 (e a uns 3,9 m com a Mochila no máximo). A cada 0,5 s ela pulsa, machuca de leve e empurra quem está dentro. **Hoje:** um círculo amarelo de linha.

**Ideia:** o sinal da TV saindo do Juninho. Uma aura deitada no chão, de ondas sonoras concêntricas e irregulares, com chuvisco de TV e brilho magenta e ciano, viva na borda e fraca no centro. A cada pulso, uma onda corre do centro até a borda e quem é empurrado solta um estalo de chiado.

| Arquivo | Tipo | O que desenhar | Formato | Cobre |
| --- | --- | --- | --- | --- |
| `aura_base.png` | C L | A aura deitada no chão, vista de cima: disco de ondas sonoras concêntricas e irregulares, com chuvisco de TV e linhas de varredura, magenta e ciano; borda viva e brilhante, centro bem mais fraco. O jogo gira devagar e escala para o raio do nível | peça única 1024, a borda da aura a uns 90% da imagem | o diâmetro da aura |
| `aura_pulso.png` | C L | O pulso: onda de choque saindo do centro até a borda, com a frente da onda distorcida e brilhante | 6 quadros (3×2 de 512) | o diâmetro da aura |
| `aura_chiado.png` | P L | Partículas de chiado de TV (quadradinhos de estática e ondinhas) subindo da borda | grade 4×4 de 256 (16 partículas soltas) | 0,3 m |
| `empurrao.png` | P L | O empurrão: estalo de onda sonora magenta batendo em quem está dentro | 6 quadros (3×2 de 512) | 1,2 m |

### Gato de Luz

**No jogo:** a cada 1,4 s sai um choque do Juninho para o inimigo mais perto (até 7 m), que pula para 3 a 5 vizinhos, a até 2,6 a 3,4 m um do outro; aparece por 0,28 s e trava cada um por 0,35 s. No nível 5 saem 2 choques. **Hoje:** uma linha azul fina em zigue-zague.

**Ideia:** um raiozão. O gato de luz puxado do poste estoura na mão do Juninho e o raio azul elétrico, de núcleo branco e galhos finos, rasga de um inimigo para o outro. Cada um que leva o choque explode num estouro azul que ilumina a rua inteira, fica com arcos elétricos no corpo e deixa o chão chamuscado.

| Arquivo | Tipo | O que desenhar | Formato | Cobre |
| --- | --- | --- | --- | --- |
| `raio.png` | P L | 4 raios diferentes, deitados na horizontal: núcleo branco grosso, azul elétrico em volta, galhos finos saindo e brilho largo; as pontas afinam para emendar um no outro. O jogo vira cada raio de um inimigo para o outro e emenda peças nos pulos longos | 4 faixas de 1536×256 empilhadas (1536×1024) | 3 m cada |
| `raio_estouro.png` | P L | O estouro em cada inimigo: clarão branco-azul, anel elétrico e faíscas saltando para todos os lados | 6 quadros (3×2 de 512) | 2,5 m |
| `raio_luz_chao.png` | C L | O clarão azul que o raio joga no chão em volta de cada estouro | peça única 1024 | 5 m |
| `eletrocutado.png` | P L | Arcos elétricos e faíscas em volta de um corpo (sem o corpo: o jogo põe por cima do inimigo travado), em laço | 6 quadros (3×2 de 512) | 2,4 m de altura |
| `raio_origem.png` | P L | A faísca na mão do Juninho: o fio desencapado estourando em luz azul | 6 quadros (3×2 de 512) | 0,8 m |
| `chamuscado_raio.png` | C M | Marca de queimado elétrico no chão, em estrela, com brasinhas | peça única 1024 | 1,5 m |

### Cachorro Caramelo

**No jogo:** o Caramelo já tem arte (caminhada, corrida, mordida e latido). Ele corre até o inimigo, dá o bote (a mordida dura 0,36 s, o dano sai quando a boca fecha), morde 2 ou 3 e volta. No nível 4, depois de morder, late e a horda em volta recua 2,4 m. Também fareja os achados. **Hoje:** só as palavras NHAC! e AU AU!.

**Ideia:** força de vira-lata. A mordida é um arco de dentes branco com respingo âmbar; o latido é uma onda em leque que se abre no chão e empurra; as patas levantam poeira na arrancada; no faro, uma trilha de cheiro âmbar aponta para o achado.

| Arquivo | Tipo | O que desenhar | Formato | Cobre |
| --- | --- | --- | --- | --- |
| `mordida.png` | P L | A mordida: dois arcos de dentes brancos fechando, com estalo âmbar e faíscas | 6 quadros (3×2 de 512) | 1 m |
| `latido_onda.png` | C L | A onda do latido no chão: leque de ondas âmbar se abrindo para a frente | 6 quadros (3×2 de 512) | 5 m |
| `poeira_patas.png` | P M | Poeirinha das patas na arrancada e na freada | 6 quadros (3×2 de 512) | 1 m |
| `faro_trilha.png` | C L | A trilha de cheiro: pontinhos e fiapos âmbar flutuando numa linha, que emenda nas pontas | faixa 1536×256 | 4 × 0,5 m |

## 5. Peças que várias habilidades usam

| Arquivo | Tipo | O que desenhar | Formato | Cobre |
| --- | --- | --- | --- | --- |
| `comum/luz_impacto.png` | C L | Luz de impacto genérica no chão, branca-quente, para quando uma habilidade acerta (o jogo pinta na cor da habilidade) | peça única 1024 | 2 m |
| `comum/faiscas.png` | P L | Faíscas soltas, de vários tamanhos | grade 4×4 de 256 | 0,2 m cada |
| `comum/poeira.png` | P M | Bolinhas de poeira e fumaça clara, soltas | grade 4×4 de 256 | 0,5 m cada |

## 6. Ordem sugerida

1. **Megafone e Gato de Luz:** o Megafone fica o tempo todo na tela, e o Gato é o mais vistoso.
2. **Maleta e Carimbo:** as explosões grandes.
3. **Boleto, Capacete e Chinelo:** o que mais aparece no começo (o Capacete é a arma inicial).
4. **Picolé e Mototáxi:** as exclusivas da Orla e do Morro.
5. **Caramelo e as peças comuns.**

Quando cada pacote chegar, eu recorto, confiro o centro e a escala e troco o desenho em código. Peça de luz que vier com fundo transparente ou com coisa escura volta; peça de chão que vier oval ou inclinada também.
