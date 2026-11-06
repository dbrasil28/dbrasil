# Direção visual e interface mobile

## 1. Linguagem visual
- Visual desejado: personagens **digitalizados** / realistas em acabamento arcade, referência cultural ao Mortal Kombat dos anos 1990 sem copiar sprites ou marcas.
- Cenários: cidade brasileira fictícia, suja, cheia de detalhes reconhecíveis (comércio de rua, placas, ônibus, calçamento, cartazes, política e TV).
- Humor gráfico: contraste entre sofrimento urbano, anúncios coloridos e violência grotesca teatral.
- Produção recomendada para investigação: modelos 3D pré-renderizados em sprites com poucas direções, animações modulares, cenários por tiles/props e efeitos 2D baratos. **Não é decisão técnica fechada.**

## 2. Formato de tela e câmera
- Prioridade: **portrait** (referência de layout: 9:16, com zonas seguras para outros ratios).
- Arena: **câmera fixa inclinada isométrica 2.5D**; o personagem se mantém perto do centro útil enquanto cenário rola.
- Evitar a primeira versão do concept mobile, com avatares grandes que deixam pouca área para hordas e manobras.
- Referência quantitativa **a validar em aparelho real**: protagonista ~8–11% da altura da **área jogável**; inimigos comuns ~60–80% do tamanho visual do protagonista; elites até ~110–120%; chefes maiores, com limites de legibilidade.
- Priorizar densidade de arena com espaço livre suficiente para esquivas; obstáculos só onde acrescentam estratégia e não atrapalham toque/joystick.

## 3. Hierarquia de informação
1. **Sobrevivência:** HP e ameaça imediata sempre legíveis.
2. **Tempo, nível e progressão:** tempo, XP e avanço claros sem ocupar a arena.
3. **Construção de build:** armas e níveis em HUD inferior compacto, preferencialmente ocultáveis.
4. **Sistemas sociais:** Caos visível de forma resumida; Corrupção/Audiência aparecem em momentos de consequência relevante.
5. **TV Caos:** ticker situacional e cut-in breve, não painel permanente.

## 4. Layout sugerido (mobile)
- Topo: avatar + nome/HP/nível, tempo e pausa.
- Faixa fina abaixo do topo: Índice de Caos; não repetir medidores gigantes.
- Centro e maior parte da tela: arena/isometria e hordas; evitar pop-ups sobre o jogador.
- Canto inferior esquerdo: joystick móvel transparente (zona de toque segura).
- Inferior direito: habilidade ativa **opcional** com cooldown; não sobrecarregar o MVP.
- Rodapé: 4–6 slots de armas/poderes e barra de XP; em jogo mais intenso podem recolher.
- TV Caos: pequena interrupção visual no alto/lateral, sem esconder rotas de fuga.

## 5. Tamanho e qualidade de leitura
- Cenário com muito detalhe, mas unidades de gameplay precisam contrastar com o fundo.
- Criar máscaras de separação/sombra sob personagens; outline leve quando multidões sobrepõem.
- Em testes: avaliar legibilidade em dispositivos de ~6 polegadas, brilho externo, efeitos em cena e acessibilidade.
- Reduzir números de dano e partículas durante pico de hordas; opção de desativar flashes intensos.

## 6. Comparativo das três imagens
- **01_Concept_Desktop_Denso.png:** protótipo horizontal original, HUD maximalista com TV e painéis extensos; referência de tom e sátira, **não de UX final**.
- **02_Concept_Mobile_Personagens_Grandes.png:** primeira adaptação portrait, interface e atores grandes demais; referência de exploração, **não de escala aprovada**.
- **03_Concept_Mobile_Escala_Corrigida.png:** iteração portrait com personagens menores, arena ampliada e maior horda. **Referência prioritária** para próximos mockups, ainda não validada em dispositivo.

## 7. Arte ≠ especificação executável
As imagens geradas mostram a intenção estética. Não garantem perspectiva matematicamente consistente, navegação, zonas seguras, performance, quantidade real de inimigos, animação ou renderização. Todas essas questões exigem protótipo funcional.
