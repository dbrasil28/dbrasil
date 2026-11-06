# Análise do pacote de conceito v0.1

**Projeto:** BRASIL: ESTADO DE CAOS · **Data:** 06/11/2026
**Fonte:** `docs/concept-v0.1/` (GDD, sistemas, conteúdo, arte/UI, MVP, decisões e os 3 mockups)

## Resumo

O pacote é bom e mais disciplinado que a média de documentos de conceito: separa decisões de hipóteses, fecha o escopo do MVP, dá critérios de aceite e admite que os mockups não são especificação. O diferencial proposto (três sistemas sociais ligados ao ritmo da partida) é real, mas também é a parte que ainda precisa ser provada.

Quatro pontos precisam de decisão antes da produção:

1. **Quem é a horda.** O inimigo base é o "Cidadão revoltado". Matar milhares de cidadãos comuns contradiz o princípio do próprio pacote ("o humor deve mirar abusos e estruturas, não vítimas") e é o maior risco de leitura e de loja.
2. **Nomes que apontam para coisas reais:** Centrão, Brasília, Havaianas, "patriota", "Fatality".
3. **O retrato reduz a visão lateral.** Medido no protótipo: o inimigo que vem do lado chega em 3,4 s; o que vem do topo, em 5,9 s.
4. **O visual digitalizado não aparece na escala aprovada.** Com o protagonista em 10% da área jogável, ele tem cerca de 51 px CSS de altura num iPhone 13, e o rosto fica com uns 12 px.

Para testar essas hipóteses construí um **protótipo jogável da Fase 0** (arena cinza) com parte das Fases 1 e 3: uma partida de 10 minutos com chefe, Caos, Corrupção e TV Caos (ver `README.md`).

---

## O que está forte

- **Escopo de MVP realista:** 1 personagem, 1 mapa, 10 minutos, 6 armas e 1 evolução, 4 famílias de inimigos, 1 elite e 1 chefe. Dá para construir e medir.
- **A Fase 0 pergunta a coisa certa:** "é divertido sem arte?". A maioria dos projetos pula essa etapa.
- **Princípios de UI corretos para celular:** escala definida como % da área jogável, HUD que precisa justificar o espaço que ocupa, TV como ticker e nunca como painel fixo.
- **O tema e a mecânica se encaixam.** No protótipo, recusar todas as propostas é o caminho mais difícil (40% de vitórias do bot, contra 75% de quem aceita). "Sobreviver é fácil; difícil é continuar inocente" virou regra de jogo, e isso vale preservar.
- **Riscos já listados com honestidade**, incluindo desempenho de multidões, classificação etária e complexidade dos três sistemas.

## Pontos de atenção (do mais grave ao menos grave)

### 1. A horda base é de cidadãos

O pacote diz "não transformar vítimas reais em piada" e "humor deve mirar abusos e estruturas", mas a horda que o jogador mata aos milhares é o **Cidadão revoltado**. Na prática, o entregador massacra manifestantes. Isso:

- inverte a sátira, porque o sistema opressor passa a ser o próprio jogador;
- é a imagem mais provável de aparecer num print fora de contexto;
- pesa na classificação indicativa e na revisão das lojas (violência realista contra pessoas comuns).

**Sugestões (escolher uma):**

- **Plateia hipnotizada:** a horda são *Telespectadores Hipnotizados* pela TV Caos ou pela Fake News. As armas os "desligam" (caem, piscam, acordam e saem andando) em vez de explodir. O gore fica reservado para políticos, especuladores e burocratas-monstro, que são as estruturas.
- **Horda institucional:** a horda base vira agentes do sistema, como fiscais, seguranças privados, robôs de aplicativo e cabos eleitorais pagos. O cidadão aparece só como *vítima a proteger*, e isso também pode virar mecânica.

**Decidido em 06/11/2026:** adotada a plateia hipnotizada. O Telespectador Hipnotizado acorda em vez de morrer (spec em `docs/design/MECH-001_telespectador.md`).

### 2. Nomes e referências reais (lojas e jurídico)

As regras da App Store proíbem que os inimigos de um jogo tenham como alvo exclusivo um governo, uma empresa ou outra entidade real (diretriz 1.1.2). Elas isentam de forma *geral* os "satiristas políticos profissionais", mas a isenção não é garantida. O Google Play tem regras parecidas sobre violência e ódio. No Brasil, a classificação etária sai pela ClassInd, que no Google Play é atribuída via IARC. Com o gore previsto, o resultado provável fica entre 16 e 18 anos.

| Item no pacote | Risco | Sugestão |
| --- | --- | --- |
| Chefe **"Centrão Supremo"** | Centrão é um bloco político real | Nome fictício que mantenha a piada da mudança de lado, como "Bloco Gelatina" |
| Mapa **"Brasília: O Grande Acordo"** | Cidade-sede de um governo real, com políticos como inimigos | Capital fictícia com o mesmo subtítulo, como "Acordópolis: O Grande Acordo" |
| Arma **"Havaianas do Apocalipse"** | Marca registrada | "Chinelada do Apocalipse" |
| Inimigo **"Patriota radical"** | É o rótulo de um grupo político real, mesmo com "fictício" no nome, e só ataca um lado | Remover, ou trocar por um arquétipo que exista em todos os lados ("Militante de Algoritmo") |
| Termo **"Fatality"** | Associado a uma marca de jogos de luta | "Finalização", "Despejo", "Execução Sumária" |
| "Mortal Kombat" como referência | Só pode ser referência interna | Não usar o nome em loja, trailer ou material de imprensa |

**Decidido em 06/11/2026:** todas as trocas da tabela foram adotadas, mais "Deputado Valdemar" virando "Deputado Godofredo". Ver `docs/design/ELENCO_E_NOMES_v0.2.md`. Os pontos jurídicos ainda merecem uma conversa com advogado antes de qualquer material público.

### 3. Retrato: menos tempo de reação nas laterais

A tela de **Ajustes de teste** do protótipo mostra a área visível e o tempo de reação calculados para o aparelho. Num iPhone 13 (390×844 pt), com o protagonista em 10%, a câmera a 55° e as ruas retas:

- área visível: **13,7 m de largura × 22,0 m de profundidade**;
- um inimigo comum leva **3,4 s** da borda lateral até o jogador e **5,9 s** do topo.

Se os inimigos surgem igualmente de todos os lados, os golpes vão vir principalmente das laterais. Opções para testar:

- concentrar o spawn no topo e na base (ondas laterais só com aviso);
- deslocar o centro útil para baixo, como já está no protótipo (54% da área), para ganhar visão à frente;
- reduzir o protagonista para 8%: a área visível cresce, mas a leitura das unidades piora.

### 4. Os três sistemas sociais ao mesmo tempo

A preocupação está no próprio pacote (risco 6). O protótipo testa uma divisão que recomendo manter no MVP:

- **Caos** é o diretor da partida: controla quantidade, composição e ondas. É invisível como complexidade, o jogador só sente.
- **Corrupção** aparece em 3 propostas com ganho e custo explícitos, mais a **Propina** que cai das elites. A Propina não é puxada pelo ímã: pegar é uma escolha.
- **Audiência** é só feedback: o ticker da TV mostra o número. Só vira sistema se os testes pedirem (P2 no backlog).

Resultado com o bot (20 partidas por política, mesmas seeds):

| Política nas propostas | Vitórias | Chegaram ao chefe | Duração mediana | Morte mediana | Corrupção final (mediana) |
| --- | --- | --- | --- | --- | --- |
| Aceitar tudo | 15/20 | 17/20 | 08:35 | 05:51 | 90 |
| Alternar | 15/20 | 17/20 | 08:33 | 07:49 | 65 |
| Recusar tudo | 8/20 | 18/20 | 08:55 | 08:34 | 5 |

Leitura: aceitar facilita o chefe, mas quem aceita e perde morre mais cedo (a Emenda deixa os inimigos com +25% de vida). A tensão existe. O que falta saber, e só se descobre com pessoas, é se o custo da corrupção é *sentido* além do veredito final e da mochila dourada.

### 5. Visual digitalizado em escala pequena

As decisões D06 (personagens digitalizados) e D07 (personagens menores) puxam em direções opostas. A 8–11% da área jogável, o protagonista ocupa de 41 a 56 px CSS num iPhone 13 e o rosto quase some. O que torna o visual "digitalizado" reconhecível (rosto, textura, iluminação) não aparece nessa escala.

**Recomendação:** na arena, silhuetas exageradas com textura digitalizada (cor, roupa, acessório que se leia de longe). Os rostos digitalizados de verdade ficam para os momentos em close: cut-ins da TV Caos, cartas de proposta, finalizações de chefe e tela de resultado. Isso também reduz muito o custo de produção, porque não exige 8 direções × N animações em fotorrealismo para cada inimigo.

O spike H06 deveria comparar **1 personagem** em dois pipelines (3D pré-renderizado e ator filmado) dentro deste protótipo, medindo memória num Android de entrada.

### 6. Lacunas no pacote

- **Áudio:** não há nenhuma seção. O locutor da TV Caos é um dos melhores ativos de humor, e a voz pode valer mais que o texto.
- **Meta-progressão e economia:** em aberto, e dependem do modelo de negócio.
- **Interrupções do celular** (ligação, app em segundo plano): o protótipo pausa sozinho, mas o tema deve entrar no GDD.
- **Acessibilidade além dos flashes:** daltonismo, porque gemas e pickups não podem depender só de cor (o protótipo usa forma e cor); vibração; tamanho de texto.
- **Mercado:** a sátira é muito local. Decidir cedo se o jogo é para o Brasil ou para fora muda o humor, a localização e o negócio.

## Respostas propostas para as 10 perguntas abertas

| # | Pergunta | Proposta |
| --- | --- | --- |
| 1 | Pipeline de arte | Híbrido: 3D pré-renderizado em sprites na arena; digitalização real só nos closes (TV, cartas, finalizações). |
| 2 | Câmera | Fixa e sem rotação. Ponto de partida no protótipo: 55° de inclinação, ruas retas. A isometria a 45° está disponível nos ajustes para comparar. |
| 3 | Habilidade ativa | Fora do MVP. Movimento e escolhas já bastam; reavaliar na Fase 2. |
| 4 | Arena | Contínua, com scroll infinito, como no protótipo. Eventos fecham áreas: o Especulador "vende" lotes que passam a causar dano. |
| 5 | Limite de inimigos | Começar com 300 (ajustável) e medir num Android de entrada (2–4 GB de RAM). No navegador, o pico do bot ficou em torno de 300. |
| 6 | Humor e gore | Gore ajustável, com padrão moderado; decidir o teto depois de simular a ClassInd. Ver o ponto 1, sobre quem leva o gore. |
| 7 | Corrupção | Escolha explícita (propostas) e também consequência da build (pegar Propina). O protótipo tem as duas. |
| 8 | Negócio | **Decidido em 06/11/2026:** gratuito com anúncios, nos moldes do Marble Division. Ver `MONETIZACAO_ANUNCIOS.md`. |
| 9 | Engine | **A mesma pilha do Marble Division:** jogo web (JavaScript) empacotado com Capacitor, AdMob via plugin. O protótipo já é web, e a pilha já foi publicada pelo autor. Para produção, trocar o Canvas 2D por WebGL (Phaser ou PixiJS) e medir 300 inimigos dentro do Capacitor num Android de entrada. |
| 10 | Referências reais | Sim, inspiração brasileira com nomes fictícios. Ver a tabela do ponto 2. |

## O que o protótipo cobre do backlog

| Prioridade | Item | No protótipo |
| --- | --- | --- |
| P0 | Câmera retrato isométrica | Feito; inclinação, rotação e escala ajustáveis |
| P0 | Joystick virtual | Flutuante (padrão) e fixo, para testar H07 |
| P0 | Hordas e desempenho | Limite ajustável; FPS e pior quadro (1%) na tela de resultado. **Falta testar em aparelho real** |
| P0 | XP e melhorias | Feito; cartas grandes para uma mão, com trava de 380 ms contra toque acidental |
| P1 | Juninho digitalizado | Não; o boneco é geométrico, com capacete, viseira e mochila |
| P1 | HUD enxuto | Feito (vida, nível, tempo, Caos, 4+4 espaços, XP) |
| P1 | Armas evolutivas | 6 armas, 6 passivas e 1 evolução (Capacete + Tênis vira Entrega Expressa) |
| P1 | Evento de Corrupção | 3 propostas (Patrocínio, Emenda, O Grande Acordo) |
| P2 | Audiência avançada | Só o número no ticker |
| P2 | Finalização de chefe | Não; há só um "despejo" simples com flash |

O conteúdo segue o escopo do MVP: 4 famílias (Telespectador Hipnotizado, antes Cidadão Revoltado; Golpista Digital com Perfis Falsos, Burocrata-Monstro, Fiscal do Impossível), 1 elite (Político Corrupto, que larga Propina e uma Maleta de melhoria), o Rival Patrocinado (consequência de recusar o patrocínio) e o chefe Especulador Imobiliário, que reduz a área útil vendendo lotes.

## Descobertas do protótipo

1. **A dificuldade depende de desviar das papeladas.** Com o mesmo balanceamento e as mesmas 20 seeds, um bot que não desvia dos projéteis do Burocrata venceu 5 partidas, e o Burocrata causou 11 das 15 derrotas. O bot que desvia venceu 15. O aviso visual ("!" antes do tiro) e a leitura do projétil são críticos e precisam de teste com pessoas.
2. **A primeira melhoria sai aos 20 s** (mediana), dentro do esperado para o gênero.
3. **Recusar tudo é o caminho mais difícil**, como descrito no ponto 4.
4. **O protagonista some na multidão** sem ajuda visual. O protótipo usa um anel vermelho no chão, desenha uma silhueta do Juninho por cima de quem estiver na frente e faz ele piscar em vermelho (não em branco) ao levar dano. Isso confirma a orientação do pacote (máscaras e sombra sob os personagens) e mostra que ela é obrigatória.

> O bot é uma ferramenta para comparar versões do balanceamento, não um substituto para jogadores. Os números valem como tendência, não como meta.

## Próximos passos recomendados

1. **Jogar no celular** com 3 a 5 pessoas seguindo `docs/PLAYTEST_FASE0.md`, copiando as métricas ao fim de cada partida.
2. **Decidir os pontos 1 e 2** (quem é a horda; nomes reais) antes de qualquer arte, porque isso muda o *concept* dos inimigos. Com anúncios, o ponto 2 deixa de ser opcional: as redes restringem anúncios em jogos com violência contra pessoas reais conhecidas.
3. **Spike de arte H06** com 1 personagem, dentro do protótipo.
4. **Rodar o protótipo dentro do Capacitor** num Android de entrada e decidir se o desenho migra para WebGL antes da Fase 1.
