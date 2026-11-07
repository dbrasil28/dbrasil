# Pedido de arte: variações das casas da favela

O Morro já usa as peças do pacote v2 (`PEDIDO_FAVELA.md`, seção 8) e mistura nos lados das vielas as paredes, os telhados, as fachadas e os barracos. Mesmo assim, cada peça tem um desenho só e se repete a cada poucos metros. Este pedido é de **outros desenhos para as mesmas caixas**: mesma forma, mesmo ângulo e mesmo tamanho de imagem, com outra casa pintada dentro.

## Regras

- **O ângulo e as faces** são os de `PEDIDO_FAVELA.md`, seção "O ângulo do jogo": projeção paralela, profundidade subindo para a direita a 18° da vertical, aparecem a frente, o tampo e a lateral direita.
- **Cada variação usa o gabarito da peça principal** (pasta `gabaritos_favela/`), sem mudar nada: o canvas tem o mesmo tamanho e a casa ocupa a mesma forma. O que pode passar da forma é o que fica em cima do telhado (caixa d'água, antena, varal, vergalhão), como nas peças que já entraram.
- **Mude o desenho de verdade:** cor do reboco, material (tijolo, reboco, madeira, zinco), portas, janelas, o que há no telhado. A variação não pode parecer a mesma casa com outra cor.
- **Igual às peças do v2:** PNG com fundo transparente, sem sombra no chão, sem texto (letreiro e placa o jogo escreve), luz quente do alto à esquerda, o mesmo estilo e o mesmo fim de tarde.
- **Nome do arquivo:** `cenario/<peça>_<número>.png`, começando em 2 (a peça que já existe é a 1). Por exemplo, `cenario/parede_viela_esq_2.png`.

## O que pedir, por ordem de importância

As duas primeiras são as que mais aparecem: ocupam quase metade de cada lado das vielas.

### 1. Parede da viela, à esquerda (`parede_viela_esq`, gabarito `parede_viela_esq.png`, 1377×1425)

O módulo de 6 m do lado esquerdo: a parede virada para a viela (faixa estreita e inclinada) e o telhado em cima.

| Arquivo | Como é |
| --- | --- |
| `parede_viela_esq_2.png` | Reboco pintado de azul-claro descascando, porta de ferro verde, janela com grade, relógio de luz com um gato de fios saindo, laje cinza com caixa d'água azul |
| `parede_viela_esq_3.png` | Tijolo aparente sem reboco, janela basculante com a luz azul de TV acesa, cano de água descendo pela parede, ar-condicionado velho pingando, telhado de amianto |
| `parede_viela_esq_4.png` | Muro amarelo com grafite colorido abstrato (formas, sem letras), portão de garagem de ferro enferrujado, varal com roupas na laje |
| `parede_viela_esq_5.png` | Comércio virado para a viela: porta de aço de enrolar meio aberta mostrando prateleiras, parede vermelha gasta, toldo de lona listrado, sem letreiro |

### 2. Casa da viela, à direita (`telhado_viela_dir`, gabarito `telhado_viela_dir.png`, 1377×1425)

O módulo de 6 m do lado direito: o telhado inteiro e a frente da casa (a parede da viela fica de costas e não aparece).

| Arquivo | Como é |
| --- | --- |
| `telhado_viela_dir_2.png` | Telhado de telha de barro com algumas quebradas, frente rosa com porta de madeira |
| `telhado_viela_dir_3.png` | Laje cinza com varal e caixa d'água, frente verde com janela gradeada |
| `telhado_viela_dir_4.png` | Telhado de amianto remendado com lona azul e pneus segurando, frente de tijolo, antena parabólica |
| `telhado_viela_dir_5.png` | Laje com puxadinho em obra: tijolos empilhados, vergalhões para cima, lata de massa; frente de reboco grosso cinza |

### 3. Fachadas (`fachada_a`, `_b`, `_c`, gabaritos de mesmo nome)

A de 1 andar é a que mais aparece, porque é a única baixa o bastante para ficar à direita das vielas.

| Arquivo | Gabarito | Como é |
| --- | --- | --- |
| `fachada_a_2.png` | `fachada_a.png` (1417×1425) | Frente roxa com portão de garagem de ferro, laje com caixa d'água e antena |
| `fachada_a_3.png` | `fachada_a.png` | Mercadinho de 1 andar: porta de aço de enrolar aberta, engradados na porta, sem letreiro |
| `fachada_a_4.png` | `fachada_a.png` | Casa de tijolo com a janela azul de TV, telhado de telha de barro |
| `fachada_b_2.png` | `fachada_b.png` (1507×1965) | 2 andares: térreo de tijolo, andar de cima azul com sacada de grade e roupa pendurada |
| `fachada_c_2.png` | `fachada_c.png` (1597×2505) | 3 andares com o último em obra: tijolo sem reboco, vergalhões, janela sem vidro |

### 4. Barracos (`barraco_a`, gabarito `barraco_a.png`, 1153×1220)

O mesmo gabarito serve para os dois barracos que já existem; as variações novas entram no sorteio dos dois.

| Arquivo | Como é |
| --- | --- |
| `barraco_a_2.png` | Madeira pintada de azul, telhado de zinco com lona laranja |
| `barraco_a_3.png` | Zinco e madeira crua, plantas em latas na frente, telhado remendado com placas de outdoor (sem letras) |

### 5. Casa com laje (opcional)

`casa_laje_dir_2.png` e `casa_laje_esq_2.png` (gabaritos de mesmo nome, 1830×1523): a mesma casa com a escada, em outra cor e com outros detalhes (por exemplo, reboco verde, porta de madeira, plantas na laje). Aparece uma por pracinha, então repete menos.

## Prompt

Anexe o gabarito da peça e uma das peças v2 que já entraram, como referência de estilo (pasta `referencias/`), e cole:

> Use a primeira imagem anexada como gabarito de forma e de ângulo e a segunda como referência de estilo. Desenhe [DESCRIÇÃO DA TABELA] ocupando exatamente a forma do gabarito, com os mesmos contornos, no mesmo tamanho e na mesma posição. Mantenha a projeção do gabarito: projeção paralela, sem ponto de fuga e sem perspectiva; as linhas verticais continuam verticais, as linhas de largura continuam horizontais e as linhas de profundidade sobem inclinadas para a direita, todas paralelas entre si, como no gabarito. Mostre só as faces que o gabarito mostra (frente, tampo e lateral direita). Tem que ser uma casa diferente da referência: outro material, outras portas e janelas, outro telhado. Mesmo estilo da referência, fim de tarde com luz quente vindo do alto à esquerda. Fundo transparente, sem a grade, sem sombra no chão, sem texto.

## Quando chegar

Eu confiro cada variação contra o gabarito (forma e ângulo de 18°) e ponho no sorteio do jogo (`FAVELA.variantes`, em `prototype/src/config.js`): cada casa do Morro escolhe o desenho pelo lugar, e a mesma peça não aparece duas vezes seguidas no mesmo lado.
