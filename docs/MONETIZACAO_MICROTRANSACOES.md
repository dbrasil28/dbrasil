# Monetização com compras no app

**Status:** proposta de 06/11/2026, para o autor decidir. Complementa `MONETIZACAO_ANUNCIOS.md` (D09), que continua valendo.

- Os preços são chutes iniciais para testar. Não são referência de mercado.
- O que está marcado com "confirmar" precisa de checagem antes de publicar.
- Se o autor aprovar, a decisão entra em `DECISOES.md`.

**Em uma frase:** o dinheiro compra aparência, personagem mais cedo e menos interrupção. Nunca compra vitória, progresso ou atalho na dificuldade.

## 1. Princípios

O jogo é difícil e justo, como o Silksong que o autor citou. A morte ensina, e quem perde volta um pouco mais forte pelas gorjetas. A compra não pode encurtar esse caminho.

| Vende | Nunca vende |
| --- | --- |
| Visual: roupa, capacete, mochila, moto, rastro | Vitória: reviver extra, vida, dano, cartas, trocas de carta extras |
| Personagem jogável antes da hora, que também se ganha jogando | Progresso: trecho, nível, estrela, Turno da Madrugada |
| Menos interrupção: "Sem anúncios" | Gorjeta e melhoria permanente |
| Passe do Turno com faixa paga só de visual | Corrupção: nem limpar a ficha, nem escolher o final |
| | Caixa de recompensa aleatória, paga ou por vídeo |
| | Energia, vidas ou espera para poder jogar |
| | Visual de conquista, que prova habilidade |

**Regras:**

1. **Preço em reais, sempre.** Não existe moeda premium. Cada item mostra o preço em R$ que a loja informa. Assim nenhum valor quebrado esconde quanto custa.
2. **Sem sorte paga.** O jogador vê antes exatamente o que leva.
3. **Comprar nunca mexe na Corrupção.** É a mesma regra dos anúncios, nos dois sentidos.
4. **Visual não muda a leitura.** Mesma silhueta e mesma área de colisão. Nenhum visual usa o vermelho da linha de mira nem as cores de perigo. Som de visual nunca cobre aviso de ataque.
5. **Habilidade não se vende.** Os visuais de 3 estrelas, de chefe sem reviver e do Turno da Madrugada só saem jogando.
6. **Teste de bolso:** quem nunca paga zera a rota e o Turno da Madrugada com o mesmo esforço de quem paga? Se a resposta for não, a compra está errada.
7. **A loja não imita os vilões.** O jogo zomba do Influencer da Bet, do carnê da bênção e da "oferta no Pix". Se a loja usar as mesmas táticas, a sátira vira contra o jogo.

## 2. Catálogo inicial

Todas as compras são **não consumíveis**: compra uma vez, fica para sempre e volta no "Restaurar compras". Cada loja tem a sua tabela de pontos de preço em reais. Os valores abaixo são alvos e serão arredondados para o ponto mais próximo (confirmar as tabelas e se o preço já inclui impostos).

| Item | Preço sugerido | O que entrega | Por que não quebra a dificuldade |
| --- | --- | --- | --- |
| Sem anúncios | R$ 14,90 | Tira os intervalos comerciais e o banner. Os vídeos com recompensa continuam opcionais | Não dá nada na partida. Reviver e trocar cartas seguem iguais para todos: 1 e 2 por turno, por vídeo |
| Kit de Boas-Vindas | R$ 19,90 | Sem anúncios + visual completo "Toró de Verão" do Juninho | Só conforto e aparência |
| Personagem antecipado | R$ 7,90 cada | Libera agora um jogável que se ganha mais adiante na rota | O personagem é lateral, não mais forte, com paridade medida no bot. Não abre trecho nem dá estrela |
| Elenco da Rota | R$ 19,90 | Os 4 jogáveis da rota: Funkeiro, Jogador de Futebol, Márcia e Dona Cida | O mesmo motivo |
| Visual completo do Juninho | R$ 9,90 | Capacete, roupa e mochila de um tema, num conjunto só | Só aparência, com as regras de leitura acima |
| Visual de outro personagem | R$ 6,90 | Um conjunto para Funkeiro, Jogador, Márcia ou Dona Cida | Só aparência |
| Moto | R$ 4,90 | A moto das rodovias e do Mapa da Rota | Mesma velocidade e mesmo tamanho |
| Rastro | R$ 3,90 | Efeito atrás do personagem: confete, fitinha de São João | Desliga no ajuste "efeitos simples"; nunca usa cor de perigo |
| Passe do Turno | R$ 14,90 por temporada | Faixa paga com 20 recompensas de visual | Sem gorjeta, sem pontos extras, sem atalho |

**Por que conjunto, e não peça avulsa:** hoje cada personagem é um atlas pronto de 16 direções (`tools/montar-atlas.py`). Capacete, roupa e mochila saem juntos na mesma imagem. Vender peça solta exige camadas no sprite, e cada combinação viraria arte nova. A peça avulsa só entra se o desenho ganhar camadas.

### 2.1 Sem anúncios

- Pelas estimativas de `MONETIZACAO_ANUNCIOS.md` (US$ 1,3 a 2,2 por mil intersticiais na América Latina), um jogador com 2 intersticiais por dia rende cerca de US$ 1 a 1,6 por ano em intersticial. R$ 14,90 cobre isso com folga, dependendo do câmbio. A conta é estimativa.
- Não entrega a recompensa sem o vídeo. Pagar para pular o vídeo do reviver fica para decisão (seção 7).

### 2.2 Kit de Boas-Vindas

- Abre sozinho uma vez, quando o jogador volta ao menu depois de concluir a Orla.
- Nunca aparece na primeira sessão, depois de uma derrota ou depois de um intervalo comercial.
- Fica 7 dias na Banca, com a data de fim escrita e sem contador piscando. Depois disso, os dois itens continuam à venda separados (R$ 14,90 + R$ 9,90 = R$ 24,80).
- Quem já tem "Sem anúncios" não vê o kit.

### 2.3 Personagens antecipados

| Personagem | Se ganha jogando em | Preço |
| --- | --- | --- |
| Funkeiro | Subida do Morro (trecho 2) | R$ 7,90 |
| Jogador de Futebol | Centro do Desespero (trecho 4) | R$ 7,90 |
| Márcia, a Servidora | Acordópolis (trecho 6) | R$ 7,90 |
| Dona Cida | Rede do Pânico (trecho 9) | R$ 7,90 |
| Vendedor de Picolé e Deputado Godofredo | Trecho a definir | R$ 7,90, quando tiverem trecho |

1. **Lateral, não melhor.** Cada personagem joga de um jeito, com o mesmo orçamento de força do Juninho.
2. **Paridade no bot antes de vender.** Rodar o relatório de balanceamento com cada personagem, com no mínimo 200 partidas. A taxa de vitória não pode passar mais de 5 pontos percentuais da do Juninho. Com poucas partidas a diferença é ruído; com 200, o erro fica perto de 3 pontos. Hoje o `balance-report` só roda o Juninho: precisa de uma opção por personagem.
3. **Não pula nada.** Trechos, estrelas, melhorias e o Turno da Madrugada continuam iguais. As melhorias permanentes são da conta e valem para todos os personagens.
4. **Quem chega lá ganha algo.** Ao alcançar o trecho, todos recebem o visual de conquista do personagem, quem comprou e quem não comprou. O trecho não perde o prêmio.
5. **Preço único.** A Dona Cida custa o mesmo que o Funkeiro. Um preço maior para o personagem do fim sugeriria que ele é mais forte.
6. **À venda só depois da Orla.** Na Orla, o jogador aprende com o Juninho.
7. **A liberação grátis nunca muda de lugar** para vender mais.

### 2.4 Visuais com cara de Brasil

Sem marca real: nada de escudo de clube ou da seleção (ver D17), marca de moto, de chinelo ou de aplicativo.

| Para | Exemplos |
| --- | --- |
| Juninho | "Toró de Verão": capa de chuva amarela e mochila embrulhada em saco plástico. "Bloco de Carnaval": abadá, glitter e capacete com orelhinha de gato. "Arraiá": camisa xadrez, chapéu de palha por cima do capacete e mochila de chita. "Réveillon": tudo branco. "Copa": camisa amarela sem escudo |
| Moto | Cinquentinha de entrega; 150 com baú e antena corta-pipa; moto de mototáxi com colete numerado; bicicleta de entregador raiz |
| Funkeiro | Corrente de ouro falsa e boné de aba reta; paredão com LED |
| Jogador de Futebol | Uniforme de várzea e bola de capotão |
| Márcia | Cardigã de repartição e carimbo dourado |
| Dona Cida | Avental de domingo, bobe e chinelo dourado |
| Rastro | Confete, fitinha de São João, fumaça colorida de escapamento |

Os visuais ficam em três prateleiras, sem conversão entre elas:

| Tipo | Como se ganha | Exemplo |
| --- | --- | --- |
| Em reais | Banca, com preço em R$ | Toró de Verão |
| Na gorjeta | Banca, com preço em gorjetas | Cores de mochila, capacetes simples |
| De conquista | Só jogando, nunca à venda | Capacete dourado do Turno da Madrugada; visual de 3 estrelas de cada trecho |

### 2.5 Passe do Turno

| Ponto | Proposta |
| --- | --- |
| Duração | 8 semanas, com tema do calendário: Carnaval, São João, Copa (sem marca), Fim de Ano |
| Formato | Compra única por temporada. Não é assinatura e não renova sozinho |
| Níveis | 30. Cada nível pede 100 pontos |
| Pontos | 8 por minuto jogado, ganhando ou perdendo. Mais 3 desafios por semana, de 50 pontos cada |
| Faixa grátis | 10 recompensas: gorjetas pequenas e 3 visuais |
| Faixa paga (R$ 14,90) | 20 recompensas, só visual: 1 visual completo do Juninho, 2 de outros personagens, 1 moto, rastros e molduras. Conveniência só fora da partida: modo foto, molduras para compartilhar, mais conjuntos de visual salvos |
| Comprou tarde | Recebe na hora tudo o que já passou |
| Não tem | Pontos extras à venda, nível à venda, ponto por anúncio, gorjeta na faixa paga, desafio que exige item pago |
| Depois da temporada | Os visuais pagos voltam à Banca depois de 1 ano, com preço fixo. Nada fica "nunca mais" |

**Tempo para completar:** minutos = (30 × 100 − pontos de desafio) ÷ 8.

| Caso | Pontos de partida | Minutos | Por semana |
| --- | --- | --- | --- |
| Sem nenhum desafio | 3.000 | 375 (6 h 15 min) | 47 min, cerca de 5 partidas |
| Com os 24 desafios (1.200 pontos) | 1.800 | 225 (3 h 45 min) | 28 min, cerca de 3 partidas, mais o que os desafios pedirem |

As partidas têm de 8 a 10 minutos. Meta: quem joga umas 3 partidas por semana e faz os desafios termina sem correr. Se mais de 30% dos compradores não terminarem, o passe está longo.

**Custo de arte:** cada temporada pede de 5 a 7 visuais novos, cada um com atlas de 16 direções e poses. O passe só entra quando a produção de arte der conta disso sem atrasar a rota.

### 2.6 Fora do catálogo de lançamento

- Pacotes de gorjeta (seção 3).
- Assinatura.
- Ofertas personalizadas pelo histórico de gasto.
- Reviver sem vídeo (seção 7).

## 3. Gorjetas e dinheiro real

**Recomendação: gorjeta não se compra com dinheiro. Nem com limite.**

1. A gorjeta compra melhoria permanente: moto, capacete, mochila, marmita. Isso é força. Vender gorjeta é vender o atalho da dificuldade.
2. Se a gorjeta for vendida, o jogo lucra quando a progressão é lenta. Todo ajuste de balanceamento ganha um lado comercial, e o jogador percebe.
3. "Perder rende" é a promessa da carreira. A gorjeta é o prêmio de quem tentou. Se dá para comprar, ela perde o valor.
4. Um limite não resolve. Um teto semanal ainda vende força, só mais devagar, e cria o hábito de comprar toda semana.

| Opção | Como seria | Problema |
| --- | --- | --- |
| A. Não vender (recomendada) | Gorjeta só jogando | Menos receita direta; a receita vem do visual |
| B. Vender com teto semanal | Pacote limitado por semana | Ainda é força paga, com compra recorrente |
| C. Gorjeta em dobro para sempre | Compra única que dobra todo ganho | O mesmo que B, sem teto |

**Como as duas convivem:** são prateleiras separadas na Banca, "Em reais" e "Na gorjeta". Não existe câmbio em nenhum sentido. Não se compra gorjeta com real, nem visual pago com gorjeta. "Sem anúncios" também não dobra gorjeta sozinho.

**Fontes e gastos de gorjeta.** Os valores ainda não existem em `config.js`. Entram quando as gorjetas forem construídas (passo 4 de `CARREIRA_E_ROTA.md`).

| Entra | Sai |
| --- | --- |
| Fim de cada partida, mesmo perdendo | Melhorias permanentes: catálogo finito, que acaba |
| Chefe vencido: gorjeta grande | Visuais na gorjeta: gasto que se renova a cada temporada |
| Dobrar no fim do trecho, por vídeo opcional | |
| Faixa grátis do Passe do Turno | |

**O problema a resolver:** as melhorias acabam e as gorjetas não. Sem um gasto que se renova, quem chega ao teto acumula gorjeta sem uso. A prateleira de visuais na gorjeta é esse gasto de longo prazo. A economia de gorjetas só estará balanceada quando fontes e preços existirem e forem medidos.

**Ritmo proposto:** partidas até o teto = custo total das melhorias ÷ gorjeta média por partida. Meta: o teto chega perto do fim da rota, nos trechos 8 a 10. Assim a melhoria ajuda, mas nunca substitui a habilidade. No Turno da Madrugada, com tudo no teto, a taxa de vitória do bot deve continuar baixa (valor a definir no balanceamento).

**O vídeo de dobrar:** se ele dobrar toda a gorjeta e o jogador sempre assistir, o teto chega na metade das partidas. Proposta: dobrar só a gorjeta base do trecho, sem o bônus do chefe. Se a base for uma fração b do total, quem sempre assiste precisa de 1 ÷ (1 + b) das partidas.

| b (base no total) | Partidas de quem sempre assiste | Fica mais rápido |
| --- | --- | --- |
| 100% (dobra tudo) | 50% | 2 vezes |
| 40% | 71% | cerca de 30% |
| 25% | 80% | 20% |

Medir no bot com e sem o vídeo.

## 4. Onde a loja aparece

A loja se chama **Banca** (o tema fica com o autor). Só existe fora da partida, como os anúncios.

| Lugar | O que aparece | Regra |
| --- | --- | --- |
| Tela inicial | Botão "Banca" | Ponto de novidade só quando entra item novo; nada piscando |
| Banca | Prateleiras "Em reais" e "Na gorjeta", mais a aba "Conquistas", que mostra o que não se vende e como ganhar | Botão "Restaurar compras" visível |
| Escolha de personagem | Personagem bloqueado com "Libera na Subida do Morro" em destaque e, menor, "Liberar agora: R$ 7,90" | O caminho grátis vem primeiro; só depois da Orla |
| Vestiário | Prévia animada nas 16 direções e na moto | O jogador vê antes de comprar |
| Mapa da Rota | Nada à venda | O trecho bloqueado mostra só a meta de jogo |
| Tela de resultado | Nada à venda | Mostra gorjeta e visuais conquistados. Depois de derrota, nenhuma oferta |
| Pausa e partida | Nada | A mesma regra dos anúncios |
| Oferta que abre sozinha | Só o Kit de Boas-Vindas, uma vez | Fecha com um toque e não volta a abrir sozinha |

**O que o jogador vê em cada item:**

- Nome e prévia animada.
- Preço em R$, com o texto que a loja devolve.
- "O que muda: só a aparência." Para personagem: "Libera agora. Também libera jogando na Subida do Morro."
- "Não muda: dificuldade, Corrupção, estrelas e melhorias."
- O botão "Comprar" abre a janela da loja (Google Play ou App Store). A confirmação e o controle dos pais são da loja.
- Nenhum contador regressivo. A única data é o fim real do passe, escrita por extenso.
- Desconto só com o preço anterior real ao lado.

## 5. Riscos e regras a confirmar

| Tema | O que sabemos | Confirmar | Com quem |
| --- | --- | --- | --- |
| ECA Digital | Lei 15.211/2025, sancionada em setembro de 2025 (confirmar o número). Pelo que sabemos, proíbe caixas de recompensa (loot boxes) em jogos para crianças e adolescentes ou de acesso provável por eles. Também trata de verificação de idade, supervisão dos pais e publicidade com perfilamento de menores | O artigo exato, a data de vigência (provavelmente já vale em novembro de 2026), o que conta como "acesso provável", se a classificação 16 ou 18 basta e o efeito nos anúncios personalizados do AdMob | Assessoria jurídica |
| Maleta grátis por dia | Está prevista em `MONETIZACAO_ANUNCIOS.md`. Se tiver conteúdo sorteado e abrir por vídeo, pode ser lida como caixa de recompensa | Recomendação: conteúdo fixo ou mostrado antes de abrir | Assessoria jurídica |
| Código de Defesa do Consumidor | Preço claro e informação adequada são obrigatórios. Publicidade dirigida a criança é considerada abusiva | Se o arrependimento de 7 dias (art. 49) vale para bem digital e quem reembolsa, provavelmente a loja | Assessoria jurídica |
| Faturamento da loja | Bem digital se vende pelo sistema da loja: Google Play Billing e compra no app da Apple (diretriz 3.1.1) | Se já há pagamento alternativo ou link externo permitido no Brasil. Há processo no CADE sobre as regras da Apple | Jurídico e documentação das lojas |
| Pix | Pelo que sabemos, o Google Play aceita Pix no Brasil | Se vale para compras dentro do app e se a App Store aceita Pix | Teste real em cada loja |
| Pontos de preço e impostos | Cada loja tem a sua tabela de preços em reais | Se R$ 7,90, R$ 14,90 e os outros existem nas duas lojas; se o preço mostrado já inclui impostos | Consoles das lojas e contador |
| Taxa da loja | Pelo que sabemos, Google e Apple cobram 15% de pequenos desenvolvedores nos programas atuais | A condição atual e a inscrição no programa | Consoles das lojas |
| Tributação | | Como a receita das lojas é tributada no Brasil | Contador |
| Restaurar compras | A Apple exige um jeito de restaurar compras não consumíveis | Botão na Banca e nos Ajustes | Diretrizes da Apple |
| Classificação etária | ClassInd e questionário IARC; a loja mostra o aviso "Compras no app" | Se a aposta do Bicheiro conta como jogo de azar simulado e sobe a classificação | Questionário IARC |
| Pix na arte | O Pastor Picareta e o Golpista do Pix usam o tema | Nenhum QR code válido nem chave Pix real na arte ou nos textos | Arte |
| Marcas reais | O escudo do Flamengo (D17) é exceção só do protótipo | Nenhum visual pago com marca real | Autor |
| Aprovação na loja (D21) | Caricaturas de políticos reais e facção real podem barrar o jogo | A loja inteira depende dessa aprovação | Autor |
| Fraude e reembolso | Uma compra pode ser reembolsada depois de usada | Validar o recibo num servidor antes de liberar o item | Construtor |

**Riscos de design:**

- **Personagem pago forte demais.** Enfraquecer depois de vender gera reclamação. Por isso a paridade no bot vem antes da venda.
- **Pressão do passe.** O medo de perder empurra compra por impulso. Por isso os visuais voltam depois de 1 ano e o passe termina com pouca partida por semana.
- **Tentação de esticar a rota** para vender personagem. A regra 7 da seção 2.3 impede.
- **Troca de aparelho.** O visual comprado volta pela loja, mas gorjetas e trechos moram no aparelho. É preciso salvar o progresso na nuvem antes de vender.
- **Adolescentes.** Classificação 16 ou 18 não garante que só adulto joga. A loja inteira é desenhada como se houvesse adolescentes.

## 6. Como medir

### 6.1 No protótipo, sem loja real

- **Banca simulada**, no mesmo molde dos anúncios simulados de `prototype/src/ads.js`: um provedor falso e uma camada de regras. "Comprar" não cobra nada e avisa "Teste: nada foi cobrado".
- **Registro no JSON de métricas** da tela de resultado: Banca aberta, item visto, prévia tocada, "Comprar" tocado, com a partida e o trecho.
- **Pergunta no playtest**, depois da partida: "Qual visual você queria? Pagaria R$ X por ele?" A resposta falada costuma exagerar a intenção de compra. Vale como pista, não como previsão.

### 6.2 No bot

- Paridade por personagem: 200 partidas cada, até 5 pontos percentuais acima do Juninho.
- Partidas até o teto das melhorias, com e sem o vídeo de dobrar.
- Taxa de vitória no Turno da Madrugada com tudo no teto.

### 6.3 Na versão publicada

| Métrica | Conta | Sinal de alerta |
| --- | --- | --- |
| Conversão | Jogadores que compraram ÷ jogadores ativos no mês | Ver a tendência; não há meta de mercado confiável para usar |
| Primeira compra | Qual item, em qual partida e trecho | Muitas primeiras compras logo depois de derrota: rever as ofertas |
| Receita por pagante | Receita ÷ jogadores que compraram | |
| "Sem anúncios" e retenção | Retenção no dia 7 de quem comprou e de quem não comprou | |
| Justiça | Partidas até liberar cada trecho, de quem paga e de quem não paga | Diferença grande: alguma coisa está vendendo força |
| Passe | % que termina a faixa grátis; % dos compradores que terminam a paga | Mais de 30% dos compradores sem terminar |
| Reembolsos | Pedidos ÷ compras, por item | Item com muitos pedidos está mal explicado |
| Avaliações | Menções a "pago para ganhar" ou "pay to win" | Qualquer aumento |

Quem paga costuma jogar mais. Compare os grupos por horas jogadas, não no total.

## 7. Decisões para o autor

1. **Gorjeta à venda?**
   - **Não vender (Recomendado):** a gorjeta continua sendo só prêmio de quem joga.
   - **Vender com teto:** mais receita, mas vende força e cria compra semanal.
2. **Quando vender personagem antecipado?**
   - **Depois da Orla (Recomendado):** o jogador aprende com o Juninho e não compra no impulso da primeira sessão.
   - **Desde o começo:** mais chance de venda, menos aprendizado com o Juninho.
   - **Não vender:** personagem só jogando; menos receita.
3. **Quando entra o Passe do Turno?**
   - **Depois do lançamento (Recomendado):** só quando a arte der conta de 5 a 7 visuais por temporada.
   - **No lançamento:** mais receita cedo, com risco de atrasar a rota.
   - **Não ter passe:** menos trabalho, menos receita recorrente.
4. **Reviver sem vídeo para quem paga?**
   - **Não oferecer (Recomendado):** o vídeo continua sendo a única porta do reviver, igual para todos.
   - **Oferecer como item à parte:** não dá reviver extra, só pula o vídeo; tira receita de anúncio dos jogadores mais fiéis.

## 8. Ordem de construção

1. Nenhuma loja antes das gorjetas e do Mapa da Rota (passos 1 a 4 de `CARREIRA_E_ROTA.md`).
2. "Sem anúncios" e "Restaurar compras".
3. Banca simulada e Vestiário no protótipo, com 2 visuais do Juninho para medir interesse.
4. Personagens antecipados, quando houver o segundo jogável e o bot medir paridade.
5. Kit de Boas-Vindas, na primeira versão publicada.
6. Passe do Turno, depois do lançamento.
