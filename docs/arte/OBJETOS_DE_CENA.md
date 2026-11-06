# Objetos de cena — planejamento

**Projeto:** BRASIL: ESTADO DE CAOS · **Versão:** 1.0 · 06/11/2026
**Complementa:** `GUIA_DE_PRODUCAO_DE_ARTE.md`. O estilo, o prompt de estilo e o checklist valem igual aqui.
**Foco:** mapa 1, **Orla do Desespero (Rio de Janeiro)**. No fim, a lista-base dos outros mapas.

Este documento diz **quais objetos o cenário precisa, onde cada um fica, o que ele faz no jogo, de que tamanho é e qual prompt usar**. O objetivo é o cenário ser bem brasileiro sem atrapalhar a leitura da horda.

---

## 1. Como os objetos funcionam no jogo

### 1.1 Camadas

| Camada | O que é | Como desenhar | Exemplos |
| --- | --- | --- | --- |
| **Chão** | Texturas que se repetem | Vista **totalmente de cima** (90°), emenda perfeita nas 4 bordas, sem transparência | pedra portuguesa, asfalto, areia, cimento do morro |
| **Decalque** | Coisas planas no chão | Vista de cima, fundo transparente | faixa de pedestre, bueiro, poça, lixo, folhas |
| **Objeto em pé** | Tudo que tem altura | Vista **3/4 de cima** (~50°), base do objeto embaixo e centralizada, fundo transparente | barraca, poste, carro, coqueiro, orelhão |
| **Borda** | Paredes do mapa (morro, prédios) | Vista 3/4, blocos que encaixam lado a lado | casas do morro, barracos, prédios da orla |
| **Evento** | Coisas que se movem ou aparecem | Vista 3/4, **de lado** para veículos | ônibus atravessando, caminhão de obra, van |

### 1.2 Função na jogabilidade

| Função | Regra | Exemplos |
| --- | --- | --- |
| **Decoração** | Não colide, fica fora da área jogável ou é baixa | coqueiros na areia, prédios, decalques |
| **Parede** | Limita o mapa: dá para encostar, não para atravessar | casas do morro, fileira de barracas na calçada |
| **Obstáculo** | Colide com jogador e inimigos; serve para contornar a horda | poste, orelhão, banca de jornal, carrinho de açaí |
| **Evento** | Bloqueia uma passagem por alguns segundos, com aviso | ônibus na transversal, caminhão do Especulador |
| **Quebrável** *(ideia a testar)* | As armas quebram e ele solta um item | carrinho de açaí solta cura; banca de jornal solta XP |

### 1.3 Regras de leitura (valem para todo objeto)

1. **Os objetos são mais escuros e menos saturados que os personagens.** Quem chama atenção na tela é a horda e o Juninho.
2. **Objeto alto só na borda.** No meio do calçadão, nada passa de 2,5 m, para não esconder inimigos atrás.
3. **No meio do calçadão, no máximo 3 obstáculos por quarteirão**, com pelo menos 5 m entre eles e nenhum a menos de 6 m do ponto de partida.
4. **Nada de texto, marca, logo ou pessoa real** nos desenhos. Quando precisar de texto (barraca, placa), o jogo escreve por cima.
5. **A favela é cenário vivo e digno:** cores, comércio, laje, varal e música. Sem crime, sem arma e sem estigma.

### 1.4 Desempenho

- O chão, a borda e a decoração parada são desenhados **uma vez** e só copiados na tela. Pode ter muito detalhe sem pesar.
- Obstáculos: até ~10 na tela.
- Veículos em movimento: **no máximo 2 ao mesmo tempo.**
- Cada objeto pede **2 ou 3 variações** (cor, sujeira, ângulo), para o cenário não parecer copiado e colado.

---

## 2. Planta do mapa 1 e onde cada coisa fica

```
   x (m):  -30        -16.5   -14                         12.4  14         26
           ┌──────────┬──────┬────────────────────────────┬────┬──────────┬────────
           │  MORRO   │CALÇA-│        CALÇADÃO            │CICLO│  AREIA   │  MAR
           │ casas,   │ DA   │  pedra portuguesa de ondas  │VIA │ coqueiro │ (só
           │ barracos,│barra-│  2–3 obstáculos por        │    │ quiosque │ visual)
           │ lajes,   │ cas, │  quarteirão (poste,        │    │ posto de │
           │ escada-  │ponto,│  orelhão, banca de jornal, │    │ salva-   │
           │ rias     │poste │  carrinho de açaí)         │    │ vidas    │
           ├──────────┴──────┴────────────────────────────┴────┴──────────┤
           │ RUA TRANSVERSAL (asfalto, 8 m) — a cada 48 m — ônibus/van     │
           │ atravessam (evento); faixa de pedestre; carros estacionados   │
           ├──────────┬──────┬────────────────────────────┬────┬──────────┤
           │ a cada 3 transversais: ESCADARIA que sobe o morro (abertura)  │
```

| Zona | Largura | Jogável? | Função | Objetos |
| --- | --- | --- | --- | --- |
| Morro | de −30 a −16,5 m | Não | Parede e fundo | casas do morro, barracos, lajes com caixa d'água, escadarias, antenas, fios, amendoeiras |
| Calçada do morro | de −16,5 a −14 m | Não (borda) | Parede baixa | barraca de pastel, ponto de ônibus, poste com cartaz, orelhão, banca de jornal, boteco |
| Calçadão | de −14 a 12,4 m | **Sim** | Área principal | pedra portuguesa; obstáculos baixos; decalques |
| Ciclovia | de 12,4 a 14 m | **Sim** | Faixa de transição | pintura vermelha, bicicleta caída (decalque) |
| Areia | de 14 a 20 m jogável (visual até 26) | **Sim** (deixa lento) | Fuga arriscada | coqueiros, quiosques, posto de salva-vidas, chuveirão, cadeiras e guarda-sóis |
| Mar | a partir de 26 m | Não | Fundo | ondas, espuma |
| Rua transversal | 8 m a cada 48 m | **Sim** | Evento | asfalto, faixa, bueiro, carros estacionados, ônibus/van passando |
| Escadaria do morro | a cada 3 transversais | Futuro: trecho final | Entrada do morro | escadaria, corrimão, grafite, barracos em volta |

**Por quarteirão de 48 m** (o jogo sorteia dentro destas faixas):

| Onde | Quantidade |
| --- | --- |
| Calçada do morro | 1–2 barracas de comércio + 1 ponto de ônibus ou orelhão + 2 postes |
| Calçadão | 2–3 obstáculos + 6–10 decalques |
| Areia | 3–5 coqueiros + 1 quiosque + 1 posto de salva-vidas a cada 2 quarteirões |
| Morro | fileira contínua de casas e barracos, com uma escadaria a cada 3 quarteirões |
| Transversal | 0–2 carros estacionados; o ônibus ou a van passa a cada 40–70 s, com aviso de 2 s |

---

## 3. Catálogo

Na coluna **Status**:
- **existe**: já está em `prototype/assets/`;
- **código**: hoje é desenhado em código, provisório;
- **falta**: ainda não existe.

Tamanhos em metros: largura × profundidade × altura.

### 3.1 Chão e decalques

| Arquivo | Nome | Tipo | Tamanho | Status | Leva |
| --- | --- | --- | --- | --- | --- |
| `chao/pedra_portuguesa_ondas.png` | Calçadão de ondas | Chão | tile 10×10 | existe | — |
| `chao/asfalto.png` | Asfalto da transversal | Chão | tile 8×8 | código | 1 |
| `chao/areia.png` | Areia pisoteada | Chão | tile 8×8 | código | 1 |
| `chao/cimento_morro.png` | Cimento rachado do morro | Chão | tile 8×8 | código | 1 |
| `chao/ciclovia.png` | Ciclovia vermelha | Chão (faixa) | tile 1,6×8 | código | 2 |
| `chao/faixa_pedestre.png` | Faixa de pedestre gasta | Decalque | 6×4 | código | 2 |
| `chao/bueiro.png` | Tampa de bueiro | Decalque | 0,8×0,8 | falta | 2 |
| `chao/poca.png` | Poça d'água com reflexo | Decalque | 2×1,2 | falta | 2 |
| `chao/folhas_amendoeira.png` | Folhas de amendoeira caídas | Decalque | 2×2 | falta | 2 |
| `chao/lixo_chao.png` | Copos, panfletos sem texto, tampinhas | Decalque | 1,5×1,5 | falta | 2 |
| `chao/jornal_chao.png` | Jornal amassado, sem texto legível | Decalque | 0,8×0,6 | falta | 2 |
| `chao/mancha_oleo.png` | Mancha de óleo | Decalque | 1,5×1 | falta | 3 |
| `chao/marca_pneu.png` | Marca de pneu no asfalto | Decalque | 3×0,6 | falta | 3 |

### 3.2 Mobiliário urbano

| Arquivo | Nome | Função | Tamanho | Colisão (raio) | Status | Leva |
| --- | --- | --- | --- | --- | --- | --- |
| `cenario/poste_cartaz.png` | Poste com cartaz "VOTE EM MIM DE NOVO" | Obstáculo | 0,4×0,4×5 | 0,22 | existe | — |
| `cenario/poste_orla.png` | Poste de luz curvo da orla | Obstáculo/borda | 0,4×0,4×6 | 0,22 | falta | 1 |
| `cenario/orelhao.png` | Orelhão (cabine de telefone em concha) | Obstáculo | 1×1×2,2 | 0,45 | falta | 1 |
| `cenario/banca_jornal.png` | Banca de jornal verde | Obstáculo | 2,4×1,8×2,6 | 1,0 | código (genérico) | 1 |
| `cenario/cone.png` | Cone de trânsito | Obstáculo baixo | 0,4×0,4×0,7 | 0,24 | existe | — |
| `cenario/lixeira.png` | Lixeira laranja transbordando | Obstáculo baixo | 0,6×0,6×1 | 0,3 | falta | 1 |
| `cenario/ponto_onibus.png` | Abrigo de ponto de ônibus | Borda | 3×1,4×2,8 | — | código | 2 |
| `cenario/relogio_rua.png` | Relógio de rua marcando calor (o jogo escreve "41°C") | Obstáculo | 0,6×0,6×4 | 0,25 | falta | 2 |
| `cenario/banco_praca.png` | Banco de concreto | Obstáculo baixo | 2×0,6×0,5 | 0,6 | falta | 2 |
| `cenario/grade_contencao.png` | Grade de contenção amassada | Obstáculo baixo | 2,4×0,5×1,1 | caixa | falta | 2 |
| `cenario/cavalete_obra.png` | Cavalete de obra listrado | Obstáculo baixo | 1,5×0,5×1 | caixa | falta | 2 |
| `cenario/semaforo.png` | Semáforo com poste | Borda da transversal | 0,4×0,4×4,5 | — | falta | 3 |
| `cenario/chuveirao.png` | Chuveirão da praia | Decoração (areia) | 0,5×0,5×2,5 | 0,2 | falta | 2 |
| `cenario/posto_salva_vidas.png` | Posto de salva-vidas | Decoração (areia) | 2,4×2,4×4,5 | — | código | 2 |

### 3.3 Comércio de rua

| Arquivo | Nome | Função | Tamanho | Status | Leva |
| --- | --- | --- | --- | --- | --- |
| `cenario/banca_pastel.png` | Barraca de pastel e caldo de cana | Borda | 3×2×3,2 | código | 1 |
| `cenario/carrinho_acai.png` | Carrinho de açaí roxo com guarda-sol | Obstáculo (quebrável?) | 1,6×0,9×2 | falta | 1 |
| `cenario/quiosque_praia.png` | Quiosque de praia com teto curvo | Decoração (areia) | 3,2×3×3 | código | 1 |
| `cenario/barraca_coco.png` | Barraca de coco gelado com cocos empilhados | Decoração (areia) | 2×1,5×2,2 | falta | 2 |
| `cenario/carrinho_milho.png` | Carrinho de milho cozido com fumaça | Obstáculo | 1,4×0,8×1,6 | falta | 2 |
| `cenario/isopor_ambulante.png` | Isopor de mate e biscoito de polvilho (sem marca) | Decoração (areia) | 0,8×0,6×0,9 | falta | 2 |
| `cenario/churrasquinho.png` | Carrinho de churrasquinho com fumaça | Obstáculo | 1,2×0,7×1,4 | falta | 2 |
| `cenario/ambulante_cangas.png` | Arara de cangas e óculos de sol | Decoração (areia) | 1,5×0,6×2 | falta | 3 |
| `cenario/camelo.png` | Barraca de camelô com eletrônicos genéricos | Borda | 2,4×1,2×2,2 | falta | 3 |
| `cenario/boteco.png` | Boteco de esquina com mesas de plástico e engradados | Borda | 4×3×3,5 | falta | 2 |

### 3.4 Veículos

| Arquivo | Nome | Função | Tamanho | Status | Leva |
| --- | --- | --- | --- | --- | --- |
| `cenario/onibus.png` | Ônibus urbano velho, letreiro em branco | Evento (atravessa a transversal) | 12×2,6×3,2 (de lado) | falta | 2 |
| `cenario/van_lotacao.png` | Van ou kombi de lotação | Evento | 5×2×2,4 (de lado) | falta | 2 |
| `cenario/carro_popular.png` | Carro popular velho estacionado (3 cores) | Obstáculo (transversal) | 4×1,8×1,5 | falta | 2 |
| `cenario/fusca.png` | Fusca antigo | Obstáculo | 4×1,6×1,5 | falta | 3 |
| `cenario/moto_entrega.png` | Moto de entregador estacionada com baú | Obstáculo baixo | 2×0,8×1,2 | falta | 2 |
| `cenario/bicicleta_entrega.png` | Bicicleta de entrega caída | Decalque/obstáculo | 1,8×0,6×0,5 | falta | 3 |
| `cenario/caminhao_obra.png` | Caminhão de obra do Especulador | Evento do chefe | 8×2,5×3,5 | falta | 3 |
| `cenario/carro_forte.png` | Carro-forte "da propina" (sátira, sem marca) | Evento (solta dinheiro?) | 6×2,3×2,8 | falta | 3 |

### 3.5 Construções e relevo

| Arquivo | Nome | Função | Tamanho | Status | Leva |
| --- | --- | --- | --- | --- | --- |
| `cenario/casa_morro_a/b/c.png` | Casas de tijolo e reboco empilhadas, lajes, caixa d'água azul, varal | Borda (morro) | 3–4 de largura × 6–9 de altura | código | 1 |
| `cenario/barraco_a/b.png` | Barracos de madeira, telha e lona, coloridos e remendados | Borda (morro) | 2,5–3 de largura × 3–4 de altura | falta | 1 |
| `cenario/laje_festa.png` | Laje com caixa de som, churrasqueira e bandeirinhas | Borda (morro) | 4 de largura × 5 de altura | falta | 3 |
| `cenario/escadaria_morro.png` | Escadaria estreita com corrimão de cano e grafite sem texto | Abertura da borda | 3 de largura × 4 de altura | falta | 2 |
| `cenario/fios_gato.png` | Emaranhado de fios entre postes | Decoração alta | 6 de largura | falta | 3 |
| `cenario/predio_orla_a/b.png` | Prédios da orla (anos 50 a 70, varandas, ar-condicionado) | Fundo da borda | 8–10 de largura × 12+ de altura | falta | 2 |
| `cenario/tapume_condominio.png` | Tapume "EM BREVE: CONDOMÍNIO" (o jogo escreve) | Evento do chefe | 6 de largura × 2,4 de altura | falta | 3 |
| `cenario/stand_vendas.png` | Estande de vendas de imóvel com balões | Evento do chefe | 4×3×3 | falta | 3 |
| `cenario/muro_grafite.png` | Muro com grafite colorido, sem texto | Borda | 6 de largura × 2,5 de altura | falta | 2 |
| `cenario/pedras_arpoador.png` | Pedras grandes na areia | Decoração (areia) | 4×3×1,5 | falta | 3 |

### 3.6 Natureza e vida

| Arquivo | Nome | Função | Tamanho | Status | Leva |
| --- | --- | --- | --- | --- | --- |
| `cenario/coqueiro_a/b.png` | Coqueiro alto e meio torto | Decoração (areia) | 7 de altura | código | 1 |
| `cenario/amendoeira.png` | Amendoeira de calçada (copa larga) | Borda | 6 de altura | falta | 1 |
| `cenario/canteiro_palmeira.png` | Palmeira em canteiro de concreto | Borda | 6 de altura | falta | 2 |
| `cenario/cadeira_guarda_sol.png` | Cadeira de praia e guarda-sol colorido | Decoração (areia) | 2×2×2,2 | falta | 2 |
| `cenario/pombos.png` | Bando de pombos (5 poses) | Decoração viva: voam quando o jogador passa | 0,3 | falta | 3 |
| `cenario/urubu.png` | Urubu no poste | Decoração | 0,6 | falta | 3 |
| `cenario/cachorro_caramelo.png` | Cachorro caramelo deitado | Decoração viva: foge da horda | 0,8 | falta | 3 |

### 3.7 Objetos ligados às mecânicas

| Arquivo | Nome | Mecânica | Status | Leva |
| --- | --- | --- | --- | --- |
| `cenario/placa_lote_venda.png` / `_vendido.png` | Placas de lote em cavalete | Chefe: lote à venda/vendido | código | 3 |
| `cenario/telao_tv_caos.png` | Telão de rua da TV Caos | *Ideia:* hipnotiza a horda em volta; quebrar o telão acorda quem está perto | falta | 3 |
| `cenario/cartaz_campanha.png` | Cartaz de candidato fictício no muro | Decoração satírica (o jogo escreve o texto) | falta | 2 |
| `cenario/caixa_som.png` | Caixa de som de baile | *Ideia:* atrai a horda (isca), uma vez | falta | 3 |

---

## 4. Prompts

Comece a conversa com o **prompt de estilo** do guia de arte. Depois use os blocos abaixo, trocando o que está entre colchetes pela descrição do catálogo.

**Objeto em pé** (barracas, postes, carros parados, árvores, construções):
```
Objeto de cenário de jogo mobile, vista 3/4 de cima (~50°), base do objeto embaixo e centralizada, fundo transparente, sem sombra projetada, sem chão, sem texto, sem marcas reais. [OBJETO]. Estilo realista digitalizado, sujo e vivido, de centro de cidade brasileira no Rio de Janeiro, fim de tarde com sol quente do alto à esquerda. Cores um pouco menos saturadas que as dos personagens. Gere 3 variações lado a lado (cor e desgaste diferentes), mesma escala.
```

**Veículo em evento** (atravessa a tela):
```
Veículo de cenário de jogo mobile, visto de lado e levemente de cima, fundo transparente, sem sombra, sem texto, sem número, sem marca: [VEÍCULO]. Estilo realista digitalizado, velho e sujo, Rio de Janeiro, fim de tarde.
```

**Bloco de borda** (casas do morro, barracos, prédios; precisam encaixar lado a lado):
```
Bloco de construção para a borda do mapa de um jogo mobile, vista 3/4 de cima (~50°), fundo transparente, laterais retas para encaixar com outros blocos lado a lado, base embaixo, sem texto: [CONSTRUÇÃO]. Favela/orla do Rio de Janeiro, lugar vivo e digno, cores de reboco gasto, fim de tarde. Gere 3 variações de forma e cor, mesma altura de base.
```

**Chão** (repetível):
```
Textura de chão vista totalmente de cima (90°, sem perspectiva), quadrada, que emenda perfeitamente nas 4 bordas para repetir, sem objetos, sem sombras de objetos, sem texto: [CHÃO]. Realista e gasto, contraste baixo.
```

**Decalque** (plano no chão):
```
Decalque de chão visto totalmente de cima (90°), fundo transparente, sem texto: [DECALQUE]. Realista, sujo, cores apagadas.
```

**Descrições prontas para a leva 1** (cole no lugar de `[OBJETO]`, `[CONSTRUÇÃO]` ou `[CHÃO]`):

| Arquivo | Descrição |
| --- | --- |
| `banca_pastel` | Barraca de rua de pastel e caldo de cana: toldo vermelho e branco listrado com faixa em branco, balcão de madeira com moedor de cana, vitrine de pastéis, 2 cadeiras de plástico amarelas e 1 mesa |
| `carrinho_acai` | Carrinho de açaí de ambulante pintado de roxo, com isopor, tigelas, granola e banana, guarda-sol roxo e amarelo |
| `quiosque_praia` | Quiosque de praia carioca com teto curvo branco, balcão com cocos gelados, cadeiras de plástico e um guarda-sol ao lado |
| `coqueiro_a` | Coqueiro alto e meio torto plantado na areia, com cocos verdes |
| `poste_orla` | Poste de luz curvo de calçadão de orla, metal pintado e descascado, com luminária acesa |
| `orelhao` | Orelhão brasileiro clássico (cabine de telefone em forma de concha) em poste curto, laranja desbotado e pichado sem letras |
| `banca_jornal` | Banca de jornal de metal verde, fechada, com revistas penduradas e cartazes sem texto |
| `lixeira` | Lixeira laranja de rua presa a um poste, transbordando de lixo |
| `amendoeira` | Amendoeira de calçada com copa larga e folhas verdes e avermelhadas, raízes quebrando o calçamento |
| `casa_morro_a` | Casa de favela de 2 andares em encosta: tijolo aparente e reboco gasto, laje com caixa d'água azul, varal com roupas, janelas coloridas, uma vendinha no térreo |
| `barraco_a` | Barraco de madeira e telha de amianto remendado com lona azul, porta pintada, vaso de planta, fios descendo do telhado |
| `pedra_portuguesa_ondas` | (já existe) |
| `asfalto` | Asfalto velho de rua de centro, remendos, rachaduras e faixa amarela gasta |
| `areia` | Areia de praia carioca, clara e pisoteada, pegadas, palitos de picolé e tampinhas |
| `cimento_morro` | Cimento rachado de beco de favela, com escoamento de água e marcas de chinelo |

---

## 5. Ordem de produção

| Leva | Objetos | Por quê |
| --- | --- | --- |
| **1** | Barraca de pastel · carrinho de açaí · quiosque · coqueiro · poste da orla · orelhão · banca de jornal · lixeira · amendoeira · 3 casas do morro · 2 barracos · chão de asfalto, areia e cimento | Já faz a tela "ser o Rio" e substitui o que hoje é desenhado em código |
| 2 | Ônibus · van · carro popular · moto · boteco · relógio de rua · ponto de ônibus · chuveirão · posto de salva-vidas · prédios da orla · escadaria · muro com grafite · decalques | Vida e variedade; eventos das transversais |
| 3 | Objetos do chefe (tapume, estande de vendas, caminhão, placas) · telão da TV Caos · laje de festa · animais · carro-forte | Mecânicas e piadas extras |

---

## 6. Outros mapas (lista-base)

| Mapa | Objetos que definem o lugar |
| --- | --- |
| 2 · Centro do Desespero (inspirado no centro de SP) | Viaduto, calçadão de mosaico geométrico, prédios antigos com marquise, camelódromo, banca de flores, orelhões, tapumes, ônibus, catracas, bancas de caldo de cana |
| 3 · Acordópolis | Gramados enormes, espelho d'água, palácios de concreto modernistas, carros oficiais pretos, cercas, tendas de manifestação sem texto, ministérios iguais |
| 4 · Paraíso à Venda (orla do Nordeste) | Coqueiros, barracas de praia com cadeiras, jangadas, resorts murados, catracas de pedágio na areia, vendedores de queijo coalho, buggies |
| 5 · Rede do Pânico (estúdio de TV) | Câmeras, gruas, refletores, cenário de telejornal, plateia, telões, teleprompter, mesas de jurados |

---

## 7. Entrega

Salve com os nomes da seção 3 em `prototype/assets/cenario/` e `prototype/assets/chao/`. Quando chegar uma imagem, ela entra no jogo no lugar do desenho em código, com o tamanho e a colisão desta tabela.
