# Guia de produção de arte — BRASIL: ESTADO DE CAOS

**Para quem:** quem vai gerar as imagens (com o ChatGPT ou outro gerador) e quem vai colocar no jogo.
**Versão:** 1.1 · 06/11/2026 · Mapa 1: Rio de Janeiro · Base: `docs/concept-v0.1/04_Direcao_de_Arte_e_UI_Mobile.md` e o mockup `03_Concept_Mobile_Escala_Corrigida.png`.

A mecânica do protótipo está aprovada e é a base dos personagens; a arte não. Este guia diz **o que desenhar, em que formato e com qual prompt**, para que cada imagem entre no jogo sem retrabalho.

---

## 1. Como usar com o ChatGPT

1. Abra **uma conversa nova só para este jogo**. A consistência de estilo melhora quando todas as imagens saem da mesma conversa.
2. Na primeira mensagem, **anexe as referências** e cole o **Prompt de estilo (seção 3)**:
   - `docs/concept-v0.1/referencias/03_Concept_Mobile_Escala_Corrigida.png` (o mockup aprovado);
   - `docs/arte/recortes-do-mockup/juninho.png` e `t_amarelo16.png` (recortes do próprio mockup, para fixar o estilo dos personagens).
3. Depois peça **um asset por mensagem**, colando o prompt do asset (seção 6). Sempre termine com: *"fundo transparente, PNG"*.
4. Confira cada imagem com o **checklist da seção 7** antes de salvar.
5. Salve com o **nome de arquivo exato** indicado e coloque na pasta indicada. O jogo procura por esses nomes.

**Limites do gerador:** ele é bom em imagens únicas e em folhas com poucas poses lado a lado. É fraco em **animação quadro a quadro consistente**. Por isso a primeira leva pede **poses paradas em 5 direções**; o jogo anima com balanço, inclinação e espelhamento. Ciclos de caminhada ficam para a segunda leva, ou para o pipeline 3D previsto no conceito.

---

## 2. Mapas

### 2.1 Esse tipo de mapa funciona?

**Sim, com quatro ajustes.** O mockup mostra uma praça de calçadão vista de cima: as coisas ficam nas bordas e o centro fica aberto. Isso funciona para hordas. Mas o mockup é *uma tela parada*. No jogo, a câmera segue o Juninho e o mapa precisa continuar. Os ajustes:

1. **Formato que favorece o retrato.** O protótipo mediu que, em retrato, **se vê 22 m para a frente e só 13,7 m de largura**: o inimigo que vem do lado chega em 3,4 s, e o que vem do topo, em 5,9 s. Os mapas devem ser **mais compridos na vertical** e ter bordas laterais que funcionem como parede: dá para chegar perto, mas não atravessar. Assim, a maior parte da horda vem de cima e de baixo, onde se vê melhor.
2. **Centro aberto.** Só 2 ou 3 obstáculos por trecho, para contornar a horda. Todo o detalhe fica na borda.
3. **O chão não pode competir com os personagens.** No mockup, a pedra portuguesa preta e branca tem contraste alto, e a multidão também. Num celular de 6", isso embaralha a leitura. O chão precisa ser mais escuro e menos contrastado, com ondas largas e sem brilho. O jogo desenha sombra e um leve contorno nos personagens.
4. **Personagens em 5 direções.** No mockup, quase todo mundo está de costas. No jogo, a horda vem na direção do jogador, de todos os lados.

### 2.2 Tipos de mapa

Cada mapa é **um lugar brasileiro reconhecível**, com nome fictício quando aponta para governo, e **um formato de jogo diferente**. Assim, trocar de mapa muda a estratégia, não só a pintura.

| # | Mapa | Inspiração | Formato de jogo | Mecânica do lugar | Chefe |
| --- | --- | --- | --- | --- | --- |
| **1** | **Orla do Desespero** | **Rio de Janeiro**: calçadão de ondas, orla, morro com favela | **Corredor comprido** (calçadão) com transversais para o morro | Especulação na orla: o chefe "vende" trechos do calçadão; ônibus e vans cruzam as transversais | Especulador Imobiliário |
| 2 | Centro do Desespero | Centro de São Paulo: calçadão de mosaico, camelôs, prédios antigos, viadutos | **Grade de quarteirões** (ruas que se cruzam) | Obras e trânsito fecham ruas; camelôs fogem e viram obstáculos móveis | O Rapa (fiscal gigante) |
| 3 | Acordópolis: O Grande Acordo | Capital modernista: eixos enormes, gramados, palácios de concreto | **Arena muito aberta**, com pouca cobertura | Portas e passagens só abrem com favores (Corrupção) | Bloco Gelatina |
| 4 | Paraíso à Venda | Orla turística do Nordeste: areia, coqueiros, resorts, barracas | **Faixas paralelas** (areia lenta, calçadão rápido, mar) | Pedágio: andar em certas faixas custa vida ou XP | Dono da Orla |
| 5 | Rede do Pânico | Estúdio de TV sensacionalista | **Arena fechada e pequena** | A câmera do programa e a audiência mudam as regras ao vivo | O Apresentador |

A ordem e os nomes dos mapas 2 a 5 são propostas. O mapa 1 está decidido.

### 2.3 Mapa 1 — Orla do Desespero (Rio de Janeiro)

**Fantasia:** fim de tarde no Rio, calor, a orla lotada de gente hipnotizada pela TV. O Juninho precisa atravessar a orla e subir o morro para fazer a entrega.

**Planta (o que a câmera vê enquanto o Juninho anda para cima):**

```
          ↑ continua
 ┌──────────┬──────────────────────┬──────────┐
 │ PRÉDIOS  │                      │  AREIA   │
 │ bancas   │   CALÇADÃO de ondas  │ quiosque │
 │ pastel   │   (centro aberto,    │ posto de │
 │ ponto de │    2–3 obstáculos)   │ salva-   │
 │ ônibus   │                      │ vidas    │
 ├──────────┴──────────────────────┴──────────┤ ← transversal (asfalto): ônibus/van cruzam;
 │  ↖ subida para o MORRO (escadaria, vielas)  │   ondas laterais entram por aqui, com aviso
 ├──────────┬──────────────────────┬──────────┤
 │ PRÉDIOS  │   CALÇADÃO de ondas  │  AREIA   │
          ↓ continua
```

- **Largura jogável:** cerca de **28 m** de calçadão, pouco mais que 2 telas.
- **Borda esquerda:** avenida e prédios. Bancas, barraca de pastel e caldo de cana, banca de jornal, ponto de ônibus, postes com cartazes. Funciona como parede.
- **Borda direita:** ciclovia, a **areia** (anda mais devagar, desencoraja fugir por ali), quiosques de praia, posto de salva-vidas, palmeiras e coqueiros. O mar fica fora da área jogável.
- **Quarteirões de 48 m:** 40 m de calçadão e 8 m de rua transversal de asfalto. Nas transversais o **ônibus atravessa** como evento que bloqueia, e entram as ondas laterais, sempre com aviso.
- **Morro e favela:** a cada 3 quarteirões, uma transversal sobe para o morro. No mapa 1, a favela aparece na **borda e nas escadarias de acesso**: casas de tijolo empilhadas, lajes, caixas d'água azuis, varais, fios, comércio, cores. A **Subida do Morro** é a parte 2 do Rio, um trecho próprio da rota: ver a seção 2.4 e `docs/design/CARREIRA_E_ROTA.md`.
- **Chefe:** o Especulador Imobiliário "revitaliza a orla". Os lotes que ele vende cortam o calçadão e estreitam a passagem.

**Moradores e inimigos:** a favela tem cores, comércio, varal, laje e música, e os **moradores são a horda**, hipnotizados pela TV, que acordam em vez de morrer. Os inimigos do morro são os **traficantes do PCC e o Chefe do Tráfico**, armados, por decisão do autor (D21, em `docs/DECISOES.md`).

### 2.4 Mapa 1, parte 2 — Subida do Morro (Rio de Janeiro)

**Fantasia:** a última entrega do Rio é lá no alto, na laje do chefe. Ao chegar ao nível da meta na Orla, o tapume da escadaria cai e uma seta leva o Juninho até ela. Ele sobe vielas e escadarias em zigue-zague, no meio do PCC, até a laje do topo. O desenho completo do trecho está em `docs/design/CARREIRA_E_ROTA.md`, seção 5.

**Planta:** subida de baixo para cima, com 250 m de altura no total:

```
          ↑ LAJE DO TOPO (chefe; saída para a Rodovia)
   ┌─────────────┐
   │  escadaria  │  3–4 m
   └──┐       ┌──┘
      │ viela │       4–6 m (gargalo)
 ┌────┘       └─────┐
 │ laje / pracinha  │ 10–14 m (arena: baile, eventos)
 └────┐       ┌─────┘
      │ viela │ ← beco fechado no toque de recolher
          ↓ pé do morro (vem da Orla)
```

**Arte mínima para o trecho entrar no jogo**, nesta ordem:

| Arquivo | O que é | Formato |
| --- | --- | --- |
| `chao/cimento_morro.png` | Cimento rachado e remendado das vielas | Textura de chão: 1024×1024 sem transparência, vista de cima 90°, emenda perfeita |
| `chao/escadaria_degraus.png` | Degraus de concreto vistos de cima, repetindo no sentido da subida | Textura de chão; a emenda de cima com a de baixo tem que ser perfeita |
| `chao/laje_concreto.png` | Laje de concreto com marcas de chuva e de caixa d'água | Textura de chão |
| `cenario/casa_morro_a/b/c.png` | Casas de 2 a 3 andares: tijolo aparente, reboco gasto, laje com caixa d'água azul, varal, janela com a luz azul de TV | Bloco de borda, 1024×1024 transparente, vista 3/4, laterais retas para encaixar |
| `cenario/barraco_a/b.png` | Barraco de madeira, telha e lona, colorido e remendado | Bloco de borda |
| `cenario/muro_grafite_a/b.png` | Muro baixo com grafite colorido sem texto | Bloco de borda |
| `cenario/poste_gatonet.png` | Poste de concreto com emaranhado de fios e caixas de gatonet | Objeto em pé, 1024×1024 transparente |
| `cenario/barricada_pneus.png` | Barricada de pneus, entulho e sofá velho que fecha o beco (toque de recolher) | Objeto em pé |
| `cenario/moto_estacionada.png`, `botijao.png`, `caixa_dagua_chao.png`, `mesa_bar_plastico.png`, `caixa_de_som.png` | Obstáculos das vielas e da laje | Objeto em pé |
| `cenario/tapume_escadaria.png` | Tapume de obra fechando a escadaria do pé do morro (abre na meta) | Objeto em pé |

**Personagens do trecho**, no mesmo formato dos pacotes de caminhada já entregues: 4 folhas PNG de 1536×1024, grade 6×4, células de 256×256, 16 direções × 6 quadros, 0° de frente, 90° direita, 180° costas e 270° esquerda.

| Pacote | Descrição para o prompt | Além da caminhada |
| --- | --- | --- |
| `Traficante_PCC_Morro` | Homem adulto fictício, camiseta de time genérica sem escudo, bermuda, chinelo, boné para trás, cordão, rádio na cintura, fuzil genérico sem marca nas mãos | 16 poses paradas de tiro (uma por direção) e uma pose soltando fogos para o alto |
| `Chefe_do_Trafico` | Homem adulto fictício, corpo largo, cordão de ouro grosso, relógio dourado, camisa aberta, óculos escuros, rádio na mão, fuzil genérico sem marca; maior que os outros | 16 poses de rajada e uma pose de "toque de recolher", com o braço apontando |
| `Cracudo` | Homem adulto fictício, magro, roupa suja e larga, chinelo de dedo, andar cambaleante | Pose agachada catando coisa no chão |
| `Trombadinha` | Ladrão fictício de boné e moletom, mochila nas costas, andar rápido e esperto | Pose correndo com o celular roubado na mão |
| `Mototaxi` | Mototaxista fictício com colete numerado sem marca, capacete e moto popular sem logo | Basta descendo e subindo a viela, em 2 direções |

**Efeitos:**
- **Fogos:** `efeitos/fogos.png`, com 6 quadros de um rojão estourando no céu.
- **Tiro:** `efeitos/clarao_tiro.png`, com 4 quadros de clarão de boca de arma.
- **Linha de mira:** o jogo desenha a linha vermelha do aviso antes do tiro.

### 2.5 Mapa da Rota (tela vista de cima)

Tela com a rota inteira do Juninho, como os mapas de fase dos jogos de celular. Mostra os trechos liberados e os bloqueados, com cadeado.

| Arquivo | O que é | Formato |
| --- | --- | --- |
| `hud/mapa_rota.png` | Ilustração vista de cima do caminho da entrega: a orla do Rio com o calçadão de ondas, o morro, a rodovia, o centro de São Paulo, a capital modernista, a praia do Nordeste, um estúdio de TV e a sede do aplicativo, ligados por uma estrada contínua que serpenteia de baixo para cima. Estilo do jogo, fim de tarde, sem nomes nem texto, porque o jogo escreve | PNG 1080×2400 em retrato, sem transparência |
| `hud/cadeado.png` | Cadeado dourado gasto | Ícone de HUD, 512×512 transparente |
| `hud/moto_rota.png` | O Juninho na moto, visto de cima, pequeno, para marcar onde ele está na rota | Ícone de HUD, 512×512 transparente |
| `hud/seta_rota.png` | Seta grossa amarela com contorno escuro, para apontar a saída liberada | Ícone de HUD, 512×512 transparente |

## 3. Prompt de estilo (cole na primeira mensagem)

```
Vou te pedir assets de um jogo de celular chamado BRASIL: ESTADO DE CAOS. Use como referência de estilo as imagens anexadas (o mockup e os recortes de personagens). Regras de estilo para TODOS os assets:

- Visual de personagem "digitalizado" de fliperama dos anos 90: aparência quase fotográfica, texturas reais de roupa e pele, cores saturadas, levemente exagerado/caricato, mas não cartoon.
- Ambiente: Brasil reconhecível. O primeiro mapa é a orla do Rio de Janeiro (calçadão de pedra portuguesa de ondas, praia, morro com favela), no fim de tarde, com sol quente vindo do alto à esquerda, sujeira urbana e calor.
- Câmera: vista 3/4 de cima, cerca de 50° acima do chão, como no mockup.
- Personagens de corpo inteiro, pés apoiados embaixo e centralizados, sem cortar nenhuma parte.
- Fundo 100% transparente (PNG). Sem chão, sem sombra projetada, sem cenário atrás.
- Sem nenhum texto, letra, número, logo ou marca real. Sem rostos de pessoas reais. Sem uniformes, brasões ou nomes de instituições reais (polícia, times, partidos, empresas).
- Mesmo tamanho de cabeça e proporção entre todos os personagens (adulto ≈ 7 cabeças de altura).

Confirme que entendeu e espere o primeiro pedido.
```

---

## 4. Especificações técnicas

| Tipo | Formato pedido ao gerador | Como o jogo usa | Pasta / nome |
| --- | --- | --- | --- |
| Personagem (folha de 5 direções) | PNG transparente 1536×1024, 5 poses lado a lado, mesma escala, espaçadas por igual, pés na mesma linha | Recortado em 5 sprites de até 170 px de altura; espelhado para as outras direções | `prototype/assets/personagens/<id>_folha.png` |
| Personagem (pose única, provisório) | PNG transparente 1024×1024, corpo inteiro centralizado ocupando ~85% da altura | Sprite de até 170 px | `prototype/assets/personagens/<id>.png` |
| Chefe | PNG transparente 1024×1024 (pose única) ou 1536×1024 (5 direções) | Até 420 px de altura | `prototype/assets/personagens/<id>.png` |
| Objeto de cenário em pé | PNG transparente 1024×1024, mesma vista 3/4, base do objeto embaixo e centralizada | Billboard; altura conforme a tabela da seção 6.3 | `prototype/assets/cenario/<id>.png` |
| Textura de chão | PNG **sem** transparência 1024×1024, **vista totalmente de cima (90°)**, **emenda perfeita** nas 4 bordas | Repetida no chão; o jogo aplica a perspectiva | `prototype/assets/chao/<id>.png` |
| Decalque de chão | PNG transparente 512×512, vista de cima | Desenhado plano no chão | `prototype/assets/chao/<id>.png` |
| Item coletável | PNG transparente 512×512, objeto centralizado, leve brilho próprio | 24–40 px | `prototype/assets/itens/<id>.png` |
| Projétil | PNG transparente 512×512, objeto centralizado, **sem** rastro | 20–40 px; o jogo gira e desenha o rastro | `prototype/assets/projeteis/<id>.png` |
| Ícone de HUD | PNG transparente 512×512, objeto 3D brilhante como os ícones do mockup, **sem moldura e sem texto** | 56 px; o jogo desenha moldura e nível | `prototype/assets/hud/<id>.png` |
| Retrato | PNG 512×512 (pode ter fundo), busto | 64 px no HUD | `prototype/assets/hud/<id>.png` |

**Ordem das 5 direções na folha**, da esquerda para a direita:
1. **frente**, vindo em direção à câmera;
2. **frente-direita**, na diagonal;
3. **direita**, de perfil;
4. **costas-direita**, na diagonal;
5. **costas**.

O jogo espelha 2, 3 e 4 para fazer as direções da esquerda.

---

## 5. Prioridade de produção

| Leva | O quê | Por quê |
| --- | --- | --- |
| 1 | Juninho · Telespectador Hipnotizado (3 variações) · chão do mapa 1 (pedra portuguesa de ondas e areia) · borda do mapa 1 (barraca de pastel, poste com cartaz, quiosque, coqueiro, 3 blocos de favela) | É o que aparece 90% do tempo na tela |
| 2 | Golpista · Burocrata · Fiscal · Político · itens · projéteis | Completa a partida |
| 3 | Especulador (chefe) · lotes · Rival · retratos e ícones do HUD | Fecha os 10 minutos |
| 4 | Variações extras de telespectador · 2º quadro de caminhada para todos | Variedade e animação |
| 5 | Personagens jogáveis: Godofredo, Dona Cida e Márcia (folhas, retratos e cards) e tela de escolha | Depois do MVP, que sai só com o Juninho |

---

## 6. Lista de assets com prompt

> Cole o prompt de estilo uma vez, no começo da conversa. Em cada pedido, cole só o bloco do asset.

### 6.1 Personagens

#### `juninho_folha.png` — Juninho, o Entregador (protagonista) · Leva 1
- **Leitura que não pode falhar:** capacete vermelho, mochila térmica vermelha quadrada nas costas e uniforme vermelho e preto gasto. Tem que ser reconhecível em 50 px.
```
Folha de personagem, 5 poses lado a lado (frente, frente-direita, direita, costas-direita, costas), mesma escala e mesma altura, pés na mesma linha, fundo transparente. Juninho, entregador de aplicativo brasileiro, 25 anos, magro e ágil, capacete vermelho de moto com viseira escura levantada, mochila térmica vermelha quadrada nas costas (sem logo), jaqueta vermelha com detalhes pretos gasta, calça preta, joelheiras, tênis surrados. Pose de corrida leve, em movimento. Mesmo personagem do recorte anexado juninho.png.
```

#### Outros personagens jogáveis

O jogador escolhe o personagem antes da partida (documento `03_Personagens_Inimigos_Mapas.md`). O MVP sai só com o Juninho, mas os outros já entram no estilo para tudo combinar. Cada um tem silhueta, arma e cor dominante próprias, para não se confundir com a horda.

| Personagem | Papel | Cor dominante | Arma (projétil) | Especial | Leva |
| --- | --- | --- | --- | --- | --- |
| **Juninho, o Entregador** | Mobilidade | Vermelho | Capacete bumerangue | Entrega Expressa (investida) | 1 |
| **Deputado Godofredo, o Intocável** | Economia e manipulação | Azul-marinho e dourado | Maletas explosivas | Foro Privilegiado (invulnerável por um tempo) | 5 |
| **Dona Cida, a Indignada** | Controle de multidão | Rosa e florido | Chinelo voador | Respeita os Mais Velhos (onda de choque) | 5 |
| **Márcia, a Funcionária Pública** | Defesa e armadilhas | Bege e verde-repartição | Carimbos e folhas cortantes | Sistema Fora do Ar (paralisa inimigos) | 5 |

O Deputado Godofredo é do mesmo arquétipo do inimigo Político Corrupto, mas precisa ser **outra pessoa** (rosto, corpo e roupa diferentes). A piada é jogar com o próprio sistema, não confundir o jogador.

##### `godofredo_folha.png` — Deputado Godofredo, o Intocável
```
Folha de personagem, 5 poses lado a lado (frente, frente-direita, direita, costas-direita, costas), mesma escala, pés na mesma linha, fundo transparente. Deputado fictício e caricato (rosto inventado, não parecido com nenhum político real), 60 anos, baixo e barrigudo, terno azul-marinho impecável, gravata e abotoaduras douradas, cabelo grisalho penteado com gel, sorriso de quem nunca vai ser preso, segurando uma maleta de couro em cada mão. Andar tranquilo e confiante, nunca com pressa.
```

##### `dona_cida_folha.png` — Dona Cida, a Indignada
```
Folha de personagem, 5 poses lado a lado (frente, frente-direita, direita, costas-direita, costas), mesma escala, pés na mesma linha, fundo transparente. Dona Cida, senhora brasileira de 68 anos, baixinha e muito vigorosa, vestido florido rosa, avental, bobes no cabelo, bolsa de feira no ombro, um chinelo de borracha erguido na mão pronto para arremessar, cara de indignação. Silhueta exagerada e inconfundível, andar decidido de quem vai reclamar com o gerente.
```

##### `marcia_folha.png` — Márcia, a Funcionária Pública
```
Folha de personagem, 5 poses lado a lado (frente, frente-direita, direita, costas-direita, costas), mesma escala, pés na mesma linha, fundo transparente. Márcia, servidora pública de 45 anos, óculos de armação grossa, coque preso com caneta, camisa bege, cardigã verde-claro, crachá sem texto, uma pilha de documentos num braço e um carimbo na outra mão, expressão de "o sistema caiu". Postura firme e cansada.
```

##### Retratos e tela de escolha (Leva 5)
- `hud/retrato_<id>.png` para cada personagem: busto de frente, no mesmo estilo do retrato do Juninho no mockup (`recortes-do-mockup/portrait.png`). Os ids são `juninho`, `godofredo`, `dona_cida` e `marcia`.
- `hud/card_<id>.png` para a tela de escolha: personagem de corpo inteiro em pose heroica caricata, 768×1024, com fundo transparente. O jogo desenha nome, papel e atributos.
```
Arte de seleção de personagem, corpo inteiro, pose heroica e caricata, fundo transparente, estilo digitalizado realista: [PERSONAGEM, mesma descrição da folha].
```

##### Futuros candidatos (só conceito, ainda sem prompt fechado)
Apresentador sensacionalista, coach financeiro falido, empresário privatizador e influenciador guiado por métricas. Quando forem aprovados, seguem o mesmo formato: folha de 5 poses, retrato e card.

#### `telespectador_a_folha.png`, `_b`, `_c` — Telespectador Hipnotizado (horda base) · Leva 1
- **Regra (MECH-001):** são pessoas comuns **hipnotizadas pela TV**, não vilões. A pista tem que estar no rosto e na postura: olhos com **brilho azul de tela**, rosto iluminado por luz azulada, **braços esticados para a frente**, andar de sonâmbulo.
- **Variações de roupa:** camisa amarela de torcedor **sem escudo nem número**, regata, sem camisa com corrente, camisa branca, camisa vinho, camisa verde.
```
Folha de personagem, 5 poses lado a lado (frente, frente-direita, direita, costas-direita, costas), mesma escala, pés na mesma linha, fundo transparente. Telespectador hipnotizado: homem brasileiro comum de [VARIAÇÃO: camisa amarela de torcedor sem escudo e sem número, bermuda jeans | regata cinza e bermuda | sem camisa, corrente dourada, bermuda preta], andando como sonâmbulo com os dois braços esticados para a frente, olhos vidrados com brilho azul de tela de TV, rosto iluminado por luz azulada. Expressão vazia, não agressiva.
```
- **Também:** `telespectador_acordado.png`, uma pose única de frente, sem brilho nos olhos, com a mão na cabeça e cara de "onde eu estou?". O jogo usa essa pose quando ele acorda.
```
Pose única, corpo inteiro, fundo transparente. O mesmo homem da folha anterior, agora acordado: sem brilho nos olhos, braços normais, uma mão coçando a cabeça, expressão confusa de "onde eu estou?".
```
- **Mulheres (leva 4):** `telespectadora_a_folha.png`, com o mesmo prompt trocando para "mulher brasileira comum, [roupa]".

#### `golpista_folha.png` — Golpista Digital · Leva 2
- **Leitura:** celular erguido com tela brilhando em verde-ciano, roupa escura de influenciador, anel de luz pequeno. Rápido.
```
Folha de 5 poses, fundo transparente. Golpista digital: jovem influenciador brasileiro, boné e jaqueta escura, óculos espelhados, segurando o celular erguido com a tela brilhando em verde-ciano, mini anel de luz preso no celular, sorriso falso. Pose de corrida em zigue-zague.
```
- **Perfil Falso:** o jogo usa o mesmo sprite com efeito holográfico. Não precisa desenhar.

#### `burocrata_folha.png` — Burocrata-Monstro · Leva 2
- **Leitura:** pilha de papéis e um carimbo enorme, óculos grossos, colete de servidor. Lento, ataca à distância jogando papelada.
```
Folha de 5 poses, fundo transparente. Burocrata-monstro: servidor público caricato, corpo largo, óculos grossos, camisa social branca amassada, colete cinza, crachá sem texto, segurando uma pilha alta de papéis num braço e um carimbo gigante na outra mão. Andar lento e pesado.
```
- **Também:** `burocrata_ataque.png`, pose única de frente arremessando papéis, para o aviso antes do tiro.
- **Ataque em 16 direções (pacote `Burocrata_Ataque`):** mesmo formato da caminhada. São 4 folhas PNG de 1536×1024, grade 6×4, células de 256×256, 16 direções × 6 quadros, com 0° de frente, 90° direita, 180° costas e 270° esquerda. As colunas são o tempo do arremesso. No jogo, as colunas 1 a 3 cobrem a mira (0,45 s, com o "!") e as colunas 4 a 6 vêm logo depois de soltar (0,25 s). O papel que voa é desenhado pelo jogo, então só aparecem folhas saindo da mão, nunca longe dela.
```
Production game ATTACK sprite sheet BUROCRATA-MONSTRO, same character as the walk sheets: fictional Brazilian municipal office clerk, wide heavy stocky body, round face, thick black eyeglasses, short thinning dark hair, crumpled WHITE dress shirt with rolled sleeves, GRAY waistcoat, slate-gray dress pants, worn brown shoes, blank ID badge without letters. HIGH STACK of loose white PAPERS in ANATOMICAL LEFT arm, OVERSIZED WOODEN STAMP with RED handle in ANATOMICAL RIGHT hand. He THROWS a handful of loose sheets with the LEFT hand toward the direction he faces. EXACT 1536x1024 transparent PNG, 6 columns × 4 rows, 256x256 cells, same camera (elevated orthographic 3/4, 50 deg), same scale, same foot baseline (cell y 240) and registered torso as the walk sheets. Rows = facing directions exactly as in the walk sheets (sheet 1: 0, 22.5, 45, 67.5; sheet 2: 90, 112.5, 135, 157.5; sheet 3: 180, 202.5, 225, 247.5; sheet 4: 270, 292.5, 315, 337.5). SIX columns = consecutive throw phases: 1 standing, glares toward target, papers tucked in left arm; 2 left hand grabs a handful of sheets and pulls back; 3 maximum wind-up, left arm far back, body twisted, knees bent; 4 RELEASE, left arm swings forward, sheets just leaving the fingers; 5 follow-through, left arm fully extended forward, open hand, two or three sheets right next to the hand; 6 recovering, arm coming back to the stack. Stamp stays in the right hand in all frames. Both feet stay on the ground, no jumping. Whole body, papers and stamp inside the cell with padding, no overlap between cells. ALL EMPTY SPACE real ALPHA 0, opaque character, clean edges. NO floor, NO cast shadow, NO glow, NO text, labels, numbers, brands or grid lines. No mirroring.
```

#### `fiscal_folha.png` — Fiscal do Impossível · Leva 2
- **Leitura:** **colete laranja refletivo**, prancheta, boné. Corta caminho e aplica multa.
- **Não pode parecer polícia real:** nada de colete balístico, distintivo, arma ou siglas.
```
Folha de 5 poses, fundo transparente. Fiscal municipal fictício: colete laranja refletivo com faixas prateadas (sem nenhuma sigla), boné laranja, prancheta e caneta na mão, apito no pescoço, expressão de quem vai multar. Andar rápido e decidido. Não pode parecer policial: sem arma, sem distintivo, sem colete balístico.
```

#### `politico_folha.png` — Político Corrupto (elite) · Leva 2
- **Leitura:** terno escuro, gravata dourada, maleta. Um pouco maior que a horda.
```
Folha de 5 poses, fundo transparente. Político corrupto fictício (rosto inventado, não parecido com ninguém real): terno azul-marinho brilhante, gravata dourada, broche dourado na lapela, maleta marrom de dinheiro na mão, sorriso de campanha, corpo um pouco mais largo. Andar confiante.
```

#### `rival_folha.png` — Rival Patrocinado (elite) · Leva 3
```
Folha de 5 poses, fundo transparente. Rival patrocinado: homem forte de terno cinza coberto de adesivos de patrocinadores genéricos coloridos (só formas, sem texto e sem marcas reais), faixa laranja atravessada no peito, óculos escuros. Andar de lutador.
```

#### `especulador.png` — Especulador Imobiliário (chefe) · Leva 3
- **Leitura:** **capacete de obra amarelo**, terno caro, charuto, maleta. Até 2,5× a altura do Juninho.
```
Pose única de frente, corpo inteiro, fundo transparente, personagem grande e imponente. Especulador imobiliário fictício: homem gordo de terno risca de giz caro, capacete de obra amarelo, charuto, anel de ouro, maleta de couro numa mão e uma placa "VENDIDO" sem texto (só a placa) na outra, sorriso de quem comprou o bairro. Mesmo estilo do recorte especulador.png anexado.
```
- **Também:** `especulador_folha.png`, a versão em 5 direções para a leva 4.

### 6.2 Chão

#### `pedra_portuguesa_ondas.png` — calçadão do Rio (mapa 1) · Leva 1
```
Textura de chão vista totalmente de cima (90°, sem perspectiva), quadrada, que emende perfeitamente nas 4 bordas para repetir. Calçadão de pedra portuguesa do Rio de Janeiro com o desenho clássico de ondas largas, pedras escuras e creme gastas e sujas, com contraste baixo (nada de preto puro e branco puro), juntas escuras, manchas de chiclete e de óleo, algumas pedras soltas. Sem objetos, sem sombras de objetos, sem texto.
```

#### `areia.png` — praia (mapa 1) · Leva 1
```
Textura de chão vista totalmente de cima (90°), emenda perfeita nas 4 bordas. Areia de praia carioca, clara e pisoteada, pegadas, alguns palitos de picolé e tampinhas. Sem objetos grandes e sem texto.
```

#### `ciclovia.png` — faixa entre calçadão e areia (mapa 1) · Leva 2
```
Textura de chão vista totalmente de cima (90°), emenda perfeita em cima e embaixo. Faixa de ciclovia vermelha gasta, com linhas brancas apagadas. Sem texto e sem símbolos.
```

#### `asfalto.png` — rua transversal · Leva 1
```
Textura de chão vista totalmente de cima (90°), emenda perfeita nas 4 bordas. Asfalto velho de rua de centro de cidade brasileira, remendos, rachaduras, faixa amarela gasta. Sem objetos e sem texto.
```

#### Decalques de chão (transparentes, vista de cima) · Leva 2
Cada um em PNG 512×512.
- `faixa_pedestre.png`: faixa de pedestre gasta.
- `bueiro.png`: tampa de bueiro.
- `jornal_chao.png`: jornal velho amassado, sem texto legível.
- `lixo_chao.png`: copos, papel de bala, panfletos sem texto.
- `mancha_oleo.png`: mancha de óleo.
```
Decalque de chão visto totalmente de cima (90°), fundo transparente: [ITEM]. Estilo realista, sujo, cores apagadas.
```

### 6.3 Cenário (em pé, vista 3/4)

| Arquivo | Altura no jogo | Onde fica | Leva |
| --- | --- | --- | --- |
| `banca_pastel.png` | 3,2 m | borda | 1 |
| `poste_cartaz.png` | 5 m | borda / centro | 1 |
| `palmeira_canteiro.png` | 6 m | borda | 1 |
| `grade_contencao.png` | 1,1 m | borda | 1 |
| `banca_jornal.png` | 2,6 m | centro (obstáculo) | 2 |
| `carrinho_ambulante.png` | 1,5 m | centro (obstáculo) | 2 |
| `tapume_obra.png` | 2,4 m | borda | 2 |
| `cone.png` | 0,7 m | qualquer lugar | 2 |
| `lixeira.png` | 1,0 m | borda | 2 |
| `onibus.png` | 3,2 m | rua transversal (evento) | 3 |
| `quiosque_praia.png` | 3,0 m | borda da areia (mapa 1) | 1 |
| `posto_salva_vidas.png` | 4,5 m | borda da areia (mapa 1) | 2 |
| `coqueiro.png` | 7 m | borda da areia (mapa 1) | 1 |
| `ponto_onibus.png` | 2,8 m | borda da avenida (mapa 1) | 2 |
| `favela_bloco_a.png`, `_b`, `_c` | 6–9 m | borda e subida do morro (mapa 1) | 1 |
| `escadaria_morro.png` | 4 m | entrada das transversais do morro (mapa 1) | 2 |
| `van_kombi.png` | 2,4 m | transversal (evento, mapa 1) | 3 |
| `placa_lote_venda.png` / `placa_lote_vendido.png` | 1,8 m | lotes do chefe | 3 |

**Prompt base:** troque `[OBJETO]` pela descrição da tabela abaixo.
```
Objeto de cenário em vista 3/4 de cima (~50°), base do objeto embaixo e centralizada, fundo transparente, sem sombra projetada, sem chão. [OBJETO]. Estilo realista e sujo de centro de cidade brasileira, fim de tarde.
```

| Arquivo | `[OBJETO]` |
| --- | --- |
| `banca_pastel` | Barraca de rua de pastel e caldo de cana com toldo vermelho listrado, balcão de madeira com moedor de cana, 2 cadeiras de plástico amarelas e 1 mesa. Placa do toldo em branco, sem texto (o jogo escreve "PASTEL • CALDO DE CANA") |
| `poste_cartaz` | Poste de concreto com fios, lambe-lambes rasgados e um cartaz eleitoral de candidato inventado e caricato sorrindo. Cartaz sem texto (o jogo escreve "VOTE EM MIM DE NOVO") |
| `palmeira_canteiro` | Palmeira em canteiro de concreto rachado com lixo em volta |
| `grade_contencao` | Grade metálica de contenção de evento, amassada |
| `banca_jornal` | Banca de jornal verde fechada, coberta de cartazes sem texto |
| `carrinho_ambulante` | Carrinho de ambulante com guarda-sol colorido, isopor e garrafas |
| `tapume_obra` | Tapume de obra de madeira pintado, com placa de obra sem texto |
| `cone` | Cone de trânsito laranja e branco, sujo |
| `lixeira` | Lixeira laranja de rua transbordando |
| `onibus` | Ônibus urbano brasileiro velho, visto de lado, letreiro em branco, sem número e sem empresa |
| `placa_lote_venda` / `placa_lote_vendido` | Placa de imobiliária em cavalete, uma amarela e uma vermelha, sem texto |
| `quiosque_praia` | Quiosque de praia carioca com teto curvo, cadeiras de plástico e coco gelado no balcão, sem marca e sem texto |
| `posto_salva_vidas` | Posto de salva-vidas de praia sobre pilares, com bandeira vermelha de mar perigoso, sem texto |
| `coqueiro` | Coqueiro alto e meio torto plantado na areia, com cocos |
| `ponto_onibus` | Abrigo de ponto de ônibus de cidade brasileira, com painel em branco e sem texto |
| `favela_bloco_a/b/c` | Bloco de casas de favela carioca empilhadas em encosta: tijolo aparente, lajes, caixas d'água azuis, varal com roupas, fios emaranhados, portas e janelas coloridas, um pequeno comércio no térreo. Lugar vivo e digno, sem pessoas armadas. Três variações de forma e cor |
| `escadaria_morro` | Escadaria de concreto estreita subindo o morro, corrimão de cano, paredes pintadas com grafite colorido sem texto |
| `van_kombi` | Van ou kombi branca velha de transporte alternativo, vista de lado, sem texto |

#### Cenário vivo (pedido de 06/11/2026) · Leva 2

**Teste com o Figma (07/11/2026):** os objetos desenhados em código ficaram amadores e saíram do jogo; no lugar deles há blocos simples, só para marcar o lugar e o tamanho. O primeiro objeto gerado por IA de imagem no Figma pessoal do autor (modelo GPT Image) é o fusca azul de `docs/arte/cenario_orla/fusca_figma.png`, no jogo junto com a Brasília (`brasilia_figma.png`) e o Uno com escada no teto (`uno_escada_figma.png`). Os três carros têm 8 direções nítidas em `docs/arte/cenario_orla/<carro>_8dir/` (lado, diagonais, frente e traseira na mesma escala, com o giro animado e um JSON com o ponto de apoio), prontas para carro andando. Para fazer as 8 direções, peça duas vistas por imagem (diagonal da frente com frente; diagonal de trás com traseira) e espelhe o outro lado. Como ele foi feito: fundo verde chapado (#00FF00), câmera 3/4 de cima com o carro de lado, apontando para a direita, luz de fim de tarde vinda da esquerda e nenhum texto, logotipo ou emblema. Depois o recorte tira o fundo e a borda verde, apaga emblemas que escaparem e enquadra pelas medidas de `prototype/src/arte_cenario.js` (128 px por metro, origem no canto da frente, no chão).

Já está no jogo desenhado em código; estas imagens substituem o provisório. Mesmo prompt base acima. Onde há texto (letreiro, placa, cartaz), peça **sem texto**: o jogo escreve por cima.

| Arquivo | Altura no jogo | `[OBJETO]` |
| --- | --- | --- |
| `carro_parado_a.png` … `_d` | 1,5 m | Carro popular brasileiro velho estacionado, visto de lado e de cima, sem marca e sem placa. Quatro cores: branco, prata, vermelho, preto; um com papel "vende-se" em branco no vidro e um com pneu furado |
| `taxi.png` | 1,5 m | Táxi amarelo com faixa azul e luminoso no teto em branco, sem marca |
| `onibus_parado.png` | 3,0 m | Ônibus urbano velho parado, de lado, letreiro em branco, pichado na lateral |
| `camburao.png` | 2,1 m | Furgão de polícia genérico branco com faixa azul e vermelha, giroflex no teto e grade no compartimento de trás, marcas de tiro na lataria. Sem brasão, sem sigla e sem texto |
| `policial_parado_16.png` | 1,8 m (altura do Juninho) | Folha 4×4 do mesmo policial genérico parado de guarda em 16 direções, uniforme azul-escuro, colete preto, capacete, fuzil atravessado no peito. Sem brasão nem sigla. Como as folhas de pose do elenco |
| `garota_esquina_a/b/c_16.png` | 0,94 × Juninho | Folha 4×4 de mulher parada na esquina em 16 direções, roupa curta e chamativa, bota, bolsa, mão na cintura. Sem nudez e sem pose sexual. Três variações de pele, cabelo e roupa |
| `barraca_acai.png` | 2,6 m | Barraca de açaí com toldo roxo listrado, balcão com potes, banquinhos de plástico. Letreiro em branco |
| `pastelaria.png` | 2,6 m | Barraca de pastel e caldo de cana com toldo amarelo e vermelho, vitrine com pastéis. Letreiro em branco |
| `boteco_esquina.png` | 2,6 m | Boteco de esquina com toldo vermelho e branco, balcão com garrafas sem rótulo. Letreiro em branco |
| `carrinho_milho.png` | 2,2 m | Carrinho de milho cozido com panela fumegando e guarda-sol verde e amarelo |
| `carrinho_picole.png` | 2,1 m | Carrinho de picolé branco e azul com guarda-sol, sem marca |
| `banco_praca.png` | 0,9 m | Banco de praça de madeira com pés de concreto, pichado |
| `orelhao.png` | 2,1 m | Orelhão brasileiro (concha laranja ou azul) com telefone, pichado |
| `muro_pichado_a/b/c.png` | 2,4 m × 4,4 m | Muro de terreno baldio com reboco caído, caco de vidro no alto, pichação em letra de pixo e um espaço vazio para cartaz. Um com a bandeira do Brasil pintada |
| `tapume_cartazes.png` | 2,2 m × 4,6 m | Tapume de obra parada coberto de cartazes eleitorais repetidos (rostos inventados, sem texto) e pichação |
| `cartaz_candidato.png` | 0,8 m | Cartaz eleitoral de candidato inventado e caricato sorrindo, faixa de cor no alto, sem texto (o jogo escreve VOTE, nome e número) |
| `bandeira_mastro.png` | 3,4 m | Mastro de cano com a bandeira do Brasil inteira, sem mudar forma nem cores |
| `bandeirinhas.png` | faixa repetível | Fio com bandeirinhas triangulares verdes e amarelas, de frente, para repetir na horizontal |
| `gato_de_luz.png` | faixa repetível | Fios emaranhados de gato de luz com uma pipa presa, para repetir na horizontal |
| `moto_parada.png` | 1,1 m | Moto popular estacionada, de lado; variação com baú de entrega vermelho |
| `caixa_dagua.png` | 1,3 m | Caixa d'água azul de fibra, pichada |
| `sinuca.png` | 0,9 m | Mesa de sinuca de boteco de laje, pano verde gasto, bolas e taco |
| `churrasqueira_tambor.png` | 1,0 m | Churrasqueira feita de tambor cortado, brasa e fumaça |
| `varal_laje.png` | 1,9 m | Varal com camisa amarela de futebol sem escudo, bermuda e toalha |
| `barricada.png` | 1,0 m × 2,4 m | Barricada de viela: pneus, tambor enferrujado e dois trilhos cruzados |
| `tambor_fogo.png` | 1,4 m | Tambor de óleo enferrujado com fogo saindo |
| `entulho.png`, `pneus.png` | 0,7 m | Monte de entulho com tijolos; pilha de três pneus velhos |

Decalques de chão novos (vista de cima, transparentes, folha 4×4): sacos de lixo pretos, latinhas, garrafas, papelão, bitucas, poça, mancha de óleo, bueiro, buraco no asfalto e **santinhos** de candidato espalhados.

### 6.4 Itens e projéteis · Leva 2

**Prompt base:** troque `[ITEM]` pela descrição.
```
Item de jogo, objeto único centralizado, vista 3/4, fundo transparente, leve brilho próprio, sem texto: [ITEM].
```

| Arquivo | `[ITEM]` |
| --- | --- |
| `itens/gema_xp_1.png` | cristal azul |
| `itens/gema_xp_2.png` | cristal verde |
| `itens/gema_xp_3.png` | cristal roxo |
| `itens/pastel.png` | pastel de feira dourado (cura) |
| `itens/propina.png` | bolo de notas de dinheiro preso com elástico, sem símbolos de moeda real |
| `itens/maleta.png` | maleta de couro entreaberta com brilho dourado saindo (melhoria) |
| `projeteis/capacete.png` | capacete vermelho de moto de perfil (o jogo faz ele girar) |
| `projeteis/chinelo.png` | chinelo de borracha amarelo com tira verde, sem marca |
| `projeteis/papelada.png` | maço de papéis voando |
| `projeteis/maleta_voo.png` | maleta de dinheiro fechada |
| `projeteis/carimbo.png` | marca de carimbo vermelho no chão, vista de cima, sem texto (o jogo escreve "INDEFERIDO") |

### 6.5 HUD · Leva 3

**Ícones de arma e passiva** (512×512, estilo dos ícones do mockup: objeto 3D brilhante, sem moldura e sem texto). Use `docs/arte/recortes-do-mockup/w_*.png` como referência.

| Arquivo | Objeto |
| --- | --- |
| `hud/w_capacete.png` | capacete vermelho |
| `hud/w_chinelo.png` | chinelo amarelo e verde |
| `hud/w_boleto.png` | boleto de papel amassado, com código de barras e sem texto |
| `hud/w_carimbo.png` | carimbo vermelho de madeira |
| `hud/w_maleta.png` | maleta marrom com dinheiro saindo |
| `hud/w_megafone.png` | megafone branco e vermelho |
| `hud/w_entrega.png` (evolução) | capacete dourado com rastro de velocidade |
| `hud/p_tenis.png` | tênis gasto |
| `hud/p_marmita.png` | marmita de alumínio |
| `hud/p_mochila.png` | mochila térmica |
| `hud/p_cafe.png` | copo americano de café |
| `hud/p_ima.png` | ímã de geladeira em forma de ferradura |
| `hud/p_raiva.png` | punho fechado vermelho |

```
Ícone de jogo mobile, objeto único em 3D brilhante, iluminação de estúdio, centralizado, fundo transparente, sem moldura, sem texto, no mesmo estilo dos ícones anexados: [OBJETO].
```

**Retratos e TV**
- `hud/retrato_juninho.png`: busto do Juninho, de frente, com capacete. Também `retrato_juninho_ferido.png` (machucado e suado) e `retrato_juninho_corrupto.png` (corrente e óculos dourados, sorriso torto).
- `hud/apresentador_neutro.png`, `apresentador_gritando.png` e `apresentador_chocado.png`: busto de um apresentador de telejornal sensacionalista **fictício**, terno, fundo de estúdio azul. O jogo coloca a moldura da TV.
```
Retrato de busto, quadrado, de frente, estilo digitalizado realista: [PERSONAGEM E EXPRESSÃO]. Fundo [transparente | estúdio de TV azul desfocado].
```

**Tela de início:** `hud/logo.png`, o logo "BRASIL: ESTADO DE CAOS" como no mockup (aqui o texto é permitido), em fundo transparente e 1024×512.

---

## 7. Checklist de aprovação (cada imagem)

- [ ] **Fundo transparente de verdade.** Abra no celular sobre fundo escuro e sobre fundo claro.
- [ ] **Sem texto**, salvo o logo, **sem marcas**, **sem rostos reais**, **sem uniforme ou sigla real**.
- [ ] **Pés na base**, centralizados; nada cortado.
- [ ] **Teste dos 50 px:** reduza a imagem para 50 px de altura. Ainda dá para saber quem é? A cor principal e o objeto característico continuam visíveis?
- [ ] **Mesma luz:** sol do alto à esquerda, fim de tarde.
- [ ] **Mesma escala:** a cabeça tem o mesmo tamanho que a dos outros personagens.
- [ ] Nas folhas de 5 poses: **mesmo personagem nas 5**, na ordem certa, pés na mesma linha.
- [ ] Texturas de chão: **emenda sem costura visível** quando repetida 2×2.

Se uma imagem quase serve mas tem defeito (fundo, um pedaço de outra pessoa, emenda), mande para o repositório assim mesmo: dá para limpar aqui, como foi feito com os recortes do mockup.

---

## 8. Entrega

Coloque os arquivos nas pastas da seção 4 dentro de `prototype/assets/`, ou mande pelo chat. A integração (recorte das folhas, redução de tamanho, âncora nos pés, espelhamento e ligação no jogo) é feita do lado do código. Enquanto a arte não chega, o protótipo usa os recortes do mockup que estão em `docs/arte/recortes-do-mockup/`.
