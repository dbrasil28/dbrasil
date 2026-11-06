# Correção de transparência

Quatro folhas de ataque com fundo removido pela ferramenta nativa de geração/edição de imagens. Originais preservados na pasta irmã `ataque_rascunhos`.

Validação: cantos com alfa zero, áreas vazias transparentes; relatório em validacao_alpha.json. Prévias de conferência sobre fundo claro e escuro em docs/arte/qa_juninho_ataque_*.jpg. Essas prévias são JPG de teste, não assets.

Esta entrega corrige o fundo das folhas existentes. Não aprova automaticamente a direção das poses, o alinhamento, a câmera nem a fluidez: essas limitações anteriores continuam pendentes. Os nomes dos arquivos indicam os ângulos solicitados; as linhas ainda precisam de revisão visual.

Prompt de edição: recortar os 24 personagens e capacetes, apagar fundo e sombras para alfa zero, preservar poses, dimensões e disposição 6×4, manter interiores opacos e bordas suavizadas, sem chão ou cenário.
