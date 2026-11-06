# BRASIL: ESTADO DE CAOS — Assets de protótipo (recortes aprovados)

Este ZIP utiliza **apenas os recortes do mockup aprovado**, incluídos no Guia de Arte, preservando a identidade de Juninho (entregador de capacete vermelho e mochila vermelha) e a perspectiva visual dos modelos originais. Nenhuma folha de 5 direções inventada foi incluída.

## Para integração no Claude

Copie `prototype/assets/` para a raiz do seu repositório. Consulte `asset_manifest.json` para nomes exatos, tamanhos, âncoras e o status individual dos assets. Exiba os personagens com tamanho de referência de **170px de altura** no jogo (escalando o chefe quando necessário); use `anchor = bottom-center`, posicionando as colisões nos pés. No gameplay, o renderizador pode aplicar um ligeiro contorno, sombra gerada via código e espelhamento horizontal como solução temporária.

- `personagens/juninho.png`: recorte autêntico do personagem vermelho.
- `personagens/telespectador_a.png` até `h.png`: base da horda em diferentes roupas.
- `personagens/golpista.png`, `burocrata.png`, `fiscal.png`, `politico.png`: inimigos especiais.
- `personagens/especulador.png`: chefe.
- `cenario/`: dois objetos simples do mockup.
- `hud/`: recortes temporários da interface; **alguns incluem partes da moldura**.
- `chao/pedra_portuguesa_ondas.png`: textura quadrada de teste, com tratamento leve de borda, não validada para produção final.

## Pendências importantes

1. **Não há 5 direções novas**. Os recortes do mockup oferecem apenas uma pose cada. A geração de vistas inéditas foi reprovada por não preservar o personagem e o estilo.
2. Vários recortes são pequenos (aprox. 85–170 px de altura) e **não devem ser apresentados como renders em alta resolução**.
3. Alguns ícones recortados incluem partes da moldura roxa; é preciso retrabalhá-los antes da versão final.
4. Falta produzir os demais objetos e texturas do mapa 1, bem como os sprites completos de animação.
5. Recomenda-se manter o nome e figurino da referência: **Juninho é o entregador vermelho**.

**Atenção:** este pacote é uma base *funcional de prototipagem* — não é a entrega final de arte solicitada pelo guia. Não contém imagens erradas de homens com camisas amarelas fingindo ser o Juninho.
