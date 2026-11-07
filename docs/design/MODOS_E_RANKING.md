# Modos de jogo e ranking

Pedido do autor (07/11/2026): além da Carreira, um modo em que se escolhe qualquer mapa e tenta sobreviver o máximo que der, e um ranking online (D42 a D44).

## 1. Os modos

| Modo | O que é |
| --- | --- |
| **Carreira** | A viagem da Orla até Brasília, com o chefão de cada trecho guardando a saída (`CARREIRA_E_ROTA.md`) |
| **Horda** | Escolhe um mapa e sobrevive o máximo que der |
| **Desafio da Semana** | Uma partida de Horda igual para todo mundo, que muda toda semana (seção 3) |

Tela inicial: **Carreira** (continuar a viagem ou abrir o Mapa da Rota), **Horda** (escolher o mapa), **Desafio da Semana** e **Ranking**.

## 2. Modo Horda

- **Mapas:** só os que o jogador já conquistou na Carreira, isto é, derrubou o chefão. Assim o modo não estraga a descoberta do mapa.
- **Começo:** nível 1, com o Capacete e as melhorias permanentes, como na Carreira.
- **Mapa:** o trecho inteiro, sem saída. A passagem para o trecho seguinte fica fechada.
- **Caos sem teto:** sobe de 0 a 100% como na Carreira. Em 100% o chefão sai do covil; depois ele volta a cada 5 minutos, mais forte. Passados os 100%, a horda fica mais resistente a cada minuto.
- **Crises:** sorteadas entre as do mapa, sempre com aviso antes (como os eventos sorteados do Vampire Survivors).
- **Achados:** isopores e cofres reaparecem nos esconderijos de tempos em tempos. A relíquia fica no lugar de sempre.
- **O fim inevitável (proposta):** aos 30 minutos chega o **Rabecão**, que não morre e caça o Juninho, como a Morte do Vampire Survivors. Ninguém passa muito disso, e o ranking separa quem chegou mais longe.
- **Propostas de Corrupção:** continuam aparecendo.
- **Gorjeta:** pelo tempo sobrevivido, um pouco menor que na Carreira (proposta: 70%), para a Carreira continuar sendo o caminho principal.

O protótipo de hoje já é quase um Modo Horda da Orla: a partida de 10 minutos com o chefão aos 8:00. O que falta é o Caos sem teto, o chefão que volta e o Rabecão.

## 3. Ranking: "Entregador do Mês"

O ranking é do aplicativo, como a gamificação que os aplicativos de entrega fazem com quem trabalha para eles: "ENTREGADOR DO MÊS: OS MAIS PRODUTIVOS DO TURNO", com selo.

| Ranking | Modo | O que mede |
| --- | --- | --- |
| **Por trecho** | Carreira | Menor tempo para derrubar o chefão. É onde a exploração rende: quem conhece o covil, o cofre e a relíquia vai direto |
| **Por mapa** | Horda | Maior tempo sobrevivido; no empate, mais inimigos derrubados |
| **Desafio da Semana** | Horda | Mesmo mapa, mesmo sorteio e uma regra da semana para todo mundo (por exemplo, "Semana do Apagão: a luz não volta"), sem melhorias permanentes. Vale a melhor partida da semana |

**Regras para ser justo:**
- Partida em que o jogador reviveu com anúncio não entra no ranking. Senão, assistir anúncio vira vantagem.
- Comprar "Sem anúncios" e as aparências não muda nada no ranking (D23).
- As melhorias permanentes são pequenas (D39) e valem nos rankings por trecho e por mapa. No Desafio da Semana ficam desligadas.

**Conferência contra trapaça.** O aparelho não manda a pontuação: manda a partida gravada (a semente do sorteio, o joystick a cada passo de 1/60 s e as cartas e propostas escolhidas, poucos KB). O servidor roda a partida de novo no Node, sem tela, e só entra no ranking o que ele reproduzir. Isso é possível porque `game.js` não usa o DOM, sorteia com semente e avança em passo fixo. Cuidado: seno, cosseno e outras contas podem dar resultados um pouquinho diferentes no iPhone e no servidor, e numa partida longa a diferença cresce. A conferência precisa aceitar uma margem pequena, ou o jogo passa a usar contas próprias que dão sempre o mesmo resultado.

**Contas:** entrar com o Google Play Games e o Game Center, sem conta própria do jogo e sem apelido ofensivo para moderar. Ranking online pede política de privacidade (LGPD), que o jogo já vai precisar por causa dos anúncios.

**Quando:**
1. Agora: ranking local, só no aparelho, para testar o formato com quem jogar.
2. No lançamento: o ranking online com a conferência no servidor.

## 4. Depois do lançamento

- **Segunda parte, grátis:** Paraíso à Venda (Nordeste), Rede do Pânico (o estúdio da TV Caos) e Entrega Final, com o Dono do App como chefão final do jogo inteiro. Miram o poder que está por trás da política: a mídia e a plataforma. O gancho fica no epílogo de Brasília: derrubado o chefão, nada muda, e o celular do Juninho apita "NOVA ENTREGA: SEDE DO APLICATIVO". A piada da "atualização obrigatória do aplicativo" a cada recomeço e o Plantão da TV em todo canto já plantam os dois vilões desde o começo.
- **Por que grátis e não DLC paga:** o jogo é gratuito com anúncios, e conteúdo novo dá dinheiro trazendo o jogador de volta. Cobrar por trecho contraria a D23 (o dinheiro nunca compra progresso). Junto da atualização, vende-se aparência ligada aos mapas novos.
- **No Mapa da Rota, depois de Brasília:** só "???", para o jogador sentir que tem mais por vir.
- **Turno da Madrugada** (a Carreira inteira mais difícil): fica para depois. O Modo Horda cumpre o papel de "o que fazer depois de zerar".
