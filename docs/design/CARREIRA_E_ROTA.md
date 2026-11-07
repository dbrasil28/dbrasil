# Carreira: o turno do Juninho em rota contínua

Estrutura do jogo pedida pelo autor (06/11/2026):
- **Carreira:** o Juninho passa por vários mapas até a entrega final.
- **Liberação por nível:** ao chegar num nível, o próximo mapa libera e aparece uma seta para seguir até ele.
- **Ligação:** a passagem entre os mapas é direta e contínua.
- **Visão de cima:** um mapa mostra o que está liberado e o que está bloqueado.
- **Elenco próprio:** cada mapa tem os seus personagens.
- **Dificuldade:** o jogo é difícil.

Base no gênero: no Vampire Survivors, chegar a um nível num mapa abre o próximo; no Survivor.io, o maior survivor de celular, cada capítulo vencido abre o seguinte.

## 1. A rota

O mundo é **um caminho só**, a rota da entrega. Cada mapa é um trecho dela, e o fim de um trecho é o começo do próximo:

1. **Saída bloqueada:** a saída do trecho começa fechada, com tapume, cancela ou barricada.
2. **Nível da meta:** quando o Juninho chega ao nível da meta, a saída abre. A TV Caos anuncia "MAPA LIBERADO".
3. **A seta:** aparece uma **seta** na borda da tela apontando para a saída, e setas pintadas no chão marcam o caminho.
4. **Passagem:** a partida continua, com a horda vindo, até o Juninho atravessar a saída. Do outro lado já é o próximo trecho, sem tela de carregamento e sem menu.

| # | Trecho | Onde | Nível para abrir o próximo | Chefe do trecho |
| --- | --- | --- | --- | --- |
| 1 | Orla do Desespero | Rio, calçadão | 15 | Especulador Imobiliário |
| 2 | Subida do Morro | Rio, favela | 25 | Chefe do Tráfico |
| 3 | Rodovia | Estrada Rio–São Paulo | 10 | Nenhum (caminhões e pedágio) |
| 4 | Centro do Desespero | São Paulo | 20 | O Rapa |
| 5 | Rodovia | Estrada para a capital | 10 | Nenhum |
| 6 | Acordópolis | Capital | 20 | O Barbudo e O Capitão, que viram O Acordão |
| 7 | Rodovia | Estrada para o Nordeste | 10 | Nenhum |
| 8 | Paraíso à Venda | Praia do Nordeste | 20 | Barão do Guarda-Sol |
| 9 | Rede do Pânico | Estúdio de TV | 20 | Apresentador do Plantão |
| 10 | Entrega Final | Sede do aplicativo | Entregar o pacote | O Dono do App |

- **Os níveis da tabela:** são um ponto de partida. Vão para `config.js` e se acertam com o bot de balanceamento e com playtest.
- **O Rio é uma partida só:** Orla e Morro são o mesmo capítulo. O nível e as cartas da Orla seguem para o Morro, por isso o Morro pede o nível 25.
- **Nova cidade:** ao entrar numa cidade nova, as cartas e o nível recomeçam. Ficam só as melhorias permanentes.
- **O chefe:** continua aparecendo no tempo dele. Vencê-lo não é obrigatório para seguir, mas dá a estrela de chefe e uma gorjeta grande.
- **Rodovias:** são trechos curtos que ligam as cidades sem corte. O Juninho vai de moto entre caminhões, pedágio, posto de gasolina, borracharia e ambulante vendendo água no engarrafamento.
- **Ponto de controle:** cada saída atravessada grava o progresso. Quem cai no Morro volta ao pé do morro com o nível que tinha ao entrar.

## 2. O Mapa da Rota (visão de cima)

Tela com a rota inteira vista de cima, como os mapas de fase dos jogos de celular. Abre pela tela inicial, no botão "Rota", e pela pausa.

- **Trecho concluído:** mostra as estrelas, de 1 a 3, e o melhor tempo. Tocar repete o trecho para buscar estrela e gorjeta.
- **Trecho atual:** mostra a moto do Juninho e o botão "Continuar turno".
- **Trecho bloqueado:** aparece com cadeado, mais escuro, e com a meta escrita, por exemplo "Chegue ao nível 15 na Orla".
- **A trajetória:** a linha da rota liga um trecho ao outro, e a parte já percorrida aparece pintada.

## 3. Elenco de cada trecho

Cada mapa tem os seus personagens, tirados da lista de estereótipos do autor (`ELENCO_v0.3_BRASIL.md`).

| Trecho | Horda | Inimigos | Elite e chefe | Aliados e eventos |
| --- | --- | --- | --- | --- |
| Orla do Desespero | Banhistas: Mulher de Biquíni Minúsculo, Tiozão de Sunga, Rato de Academia, telespectadores A, B e C | Golpista do Pix, Fiscal do Impossível | Político Corrupto, Bicheiro; chefe: Especulador | Vendedor de Picolé; desfile com a Rainha de Escola de Samba |
| Subida do Morro | Moradores | Traficante do PCC do Morro (armado), Funkeiro Raivoso (investida de braços abertos, no protótipo), Cracudo, Trombadinha, Mototáxi | Chefe do Tráfico (armado) | Funkeiro e o baile na laje; o gatonet que cai |
| Rodovias | Gente do engarrafamento | 2 Caras numa Moto, Playboy (carro importado) | Fiscal do pedágio | Vendedor de água e de milho |
| Centro do Desespero | Gente do centro: telemarketing, peão de obra | Faria Limer, Coach Picareta, Influencer da Bet, Agiota, Burocrata-Monstro | O Rapa | Jogador de Futebol, na várzea |
| Acordópolis | Servidores e turistas | Laranja, Assessor Aspone, Candidato a Político, Encostado do INSS | O Barbudo e O Capitão | Márcia, a Servidora |
| Paraíso à Venda | Turistas | Influencer da Bet, Playboy | Barão do Guarda-Sol | Barraca de acarajé |
| Rede do Pânico | Plateia do programa | Pastor Picareta, Tio do Zap, Coach Picareta | Apresentador do Plantão | Dona Cida |
| Entrega Final | Entregadores hipnotizados pelo app | Faria Limer | O Dono do App | — |

## 4. Dificuldade e progresso

- **Difícil, mas lida na tela:** a dificuldade vem de ameaças que dá para ler, com aviso antes do golpe, da horda mais densa e dos gargalos do mapa. Não vem só de vida subindo.
- **Perder rende:** cada partida dá **gorjetas**, mesmo perdendo. Elas compram melhorias permanentes, como moto, capacete, mochila e marmita. Quem perde volta um pouco mais forte.
- **Estrelas por trecho:** 1 por liberar o próximo, 1 por vencer o chefe do trecho e 1 por concluir sem reviver.
- **Corrupção na carreira:** a Corrupção acumulada na rota decide o final: inocente, deu um jeitinho, parceiro do esquema ou virou o sistema.
- **Depois de zerar:** abre o "Turno da Madrugada", a rota inteira mais difícil.
- **Personagens:** os jogáveis se desbloqueiam pela rota. O Funkeiro sai do Morro, o Jogador de Futebol do Centro, a Márcia de Acordópolis e a Dona Cida da Rede do Pânico.
- **Anúncios:** reviver e dobrar as gorjetas no fim do trecho, sempre opcionais e nunca durante a partida.

## 5. Trecho 2: Subida do Morro (Rio)

**Fantasia:** a última entrega do Rio é lá no alto, na laje do chefe. O Juninho sobe vielas e escadarias com o pedido nas costas, no meio do PCC.

**Formato:** subida em zigue-zague, de baixo para cima, que combina com o celular em pé. É diferente da Orla, que é um corredor largo:

| Pedaço | Largura | Como joga |
| --- | --- | --- |
| Viela | 4 a 6 m | Gargalo: a horda vem de frente e de trás |
| Escadaria | 3 a 4 m | O Juninho sobe mais devagar; os degraus aparecem no chão |
| Laje ou pracinha | 10 a 14 m | Arena para respirar e lutar; aqui acontecem os eventos |
| Beco fechado | — | O toque de recolher fecha com barricada; é preciso dar a volta |

- **Altura:** a subida tem cerca de 250 m. A saída para a Rodovia fica na laje do topo e abre no nível 25, com a seta mostrando o caminho.
- **Horda:** os moradores, hipnotizados pelas TVs das janelas.

**Ameaças:**

| Quem | O que faz |
| --- | --- |
| Traficante do PCC do Morro | Armado, na laje. Mira com uma linha vermelha por 0,6 s antes de atirar, para dar tempo de sair. Solta fogos quando vê o Juninho, chamando a próxima leva da horda |
| Mototáxi | Desce a viela rasgando e atropela quem estiver no caminho, a horda também. Dá para usar a favor |
| Cracudo | Cata os itens do chão antes do Juninho |
| Trombadinha | Encosta, rouba XP e foge |

**Eventos:**

| Evento | O que acontece |
| --- | --- |
| Baile funk na laje | O Funkeiro solta o batidão e a horda para para dançar. Ajuda o Juninho |
| Toque de recolher | O Chefe fecha becos com barricadas e o caminho muda |
| Gatonet caiu | As TVs das janelas apagam e a horda acorda por um instante |
| Fogos | Aviso de que a próxima leva está chegando |

**Chefe: o Chefe do Tráfico**, armado, na laje do topo:
- **Rajadas:** atira em rajadas, sempre com a linha de mira de aviso.
- **Reforço:** chama traficantes.
- **Toque de recolher:** decreta toque de recolher em volta da laje.

No meio da luta, ele faz uma proposta de Corrupção: "trabalhar pra firma". Aceitar dá mais dano e +30 de Corrupção.

**Entrega:** com o chefe derrubado, a TV Caos noticia: "ENTREGA FEITA NO ALTO DO MORRO: UMA PIZZA DE CALABRESA. GORJETA: NENHUMA". O caminho desce pelo outro lado do morro até a Rodovia.

**Como o jogador sabe o caminho (feito em 06/11/2026):**

| Ajuda | O que mostra |
| --- | --- |
| Mapa da favela | No canto direito, sempre que o Juninho está no morro: o caminho inteiro visto de cima (vielas, escadarias, lajes, casas com laje), o Juninho em vermelho, a entrega em amarelo, a linha tracejada até lá, traficantes em laranja e camburões em branco. Tocando, abre grande, com o nome de cada pedaço, e o jogo pausa; tocando de novo, fecha |
| Objetivo na tela | Acima das armas: "SUBA E ENTREGUE NO ALTO · 182 M", com a barra de progresso da subida. Antes do nível da entrega, mostra o nível que falta |
| Setas | Setas amarelas no chão até a próxima passagem e seta na borda da tela (abaixo do plantão da TV) quando ela está fora da tela |
| Marcador da entrega | Anel pulsando, coluna de luz e placa "ENTREGA AQUI" com a caixa de pizza na laje do topo |

Correção do mesmo dia: o Juninho travava no pé da escadaria e em todas as emendas entre um pedaço e o próximo (a fresta entre os dois retângulos era menor que o corpo dele). Agora cada emenda tem uma passagem, e um teste sobe a rota inteira andando em passos curtos.

**No mapa:** os moradores são a horda, as vítimas que acordam. Os inimigos do morro são os traficantes do PCC e o Chefe do Tráfico, por decisão do autor (D21).

## 6. Ordem de construção

1. **Fim da Orla:** a Orla ganha fim. São 8 quarteirões até a escadaria do morro, com o tapume que abre no nível 15 e a seta até ele.
2. **Mapa da Rota:** a tela com os trechos, os cadeados e as estrelas, com o progresso gravado no aparelho.
3. **Subida do Morro:** entra quando chegar a arte do chão, das casas e dos traficantes. A lista está no guia de arte, na seção 2.4.
4. **Gorjetas e melhorias permanentes.**
5. **Rodovia e as cidades seguintes,** conforme a arte chegar.
