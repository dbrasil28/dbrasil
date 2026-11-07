# Pedido de arte: veículos queimados

Quando um veículo explode perto de uma explosão (`prototype/src/reacoes.js`, REACOES em `config.js`), ele fica no lugar como carcaça queimada, soltando fumaça. A carcaça é a **mesma arte do veículo, queimada**: mesmo modelo, mesmo tamanho, mesmo ângulo e mesmo enquadramento, para entrar no lugar dele sem pular. Sem a carcaça desenhada, o jogo escurece a arte original.

## Situação

| Veículo | Base (pasta `base/`) | Carcaça |
| --- | --- | --- |
| Fusca | `carro_fusca.png` | feita (Weave do Figma, Nano Banana Pro) |
| Brasília | `carro_brasilia.png` | feita (Weave do Figma, Nano Banana Pro) |
| Uno com a escada no teto | `carro_uno.png` | falta |
| Táxi | `carro_taxi.png` | falta |
| Ônibus | `onibus_a.png` | falta |
| Camburão | `camburao_a.png` | falta |
| Moto | `moto_a.png` | falta |

As 5 que faltam não saíram porque o plano gratuito do Weave tem 2 gerações. Com um plano pago do Weave, ou noutro gerador que edite uma imagem a partir dela (o modelo tem que receber a base, não só o texto), é só repetir.

## Como gerar

Anexe a base (o veículo sobre o verde puro, com folga em volta) e peça uma edição dela, não uma imagem nova:

> Edit this image: turn this exact same vehicle into a burnt-out wreck after an explosion, keeping exactly the same vehicle model, size, position, viewing angle and framing. Charred black and scorched bodywork with peeled paint, soot, shattered windows, melted tires on bare rims, dented doors and a buckled hood, a few glowing embers and thin wisps of smoke. Still recognizable as the same vehicle. Same painted, near-photographic style and warm late-afternoon light from the upper left. Keep the solid pure green (#00FF00) background exactly as it is. No text, no logos.

Para o Uno, acrescente "including the ladder on the roof (scorched and bent)"; para o ônibus e o camburão, "no route numbers, no emblems".

## Quando chegar

Eu tiro o verde, ponho no tamanho e no enquadramento do original (a mesma escala nos dois eixos) e confiro o encaixe na silhueta: o fusca deu 97% e a brasília 98%. A carcaça entra como `prototype/assets/cenario/orla/<veículo>_queimado.webp`, com a linha `cen_<veículo>_queimado` em IMAGES (`sprites.js`).
