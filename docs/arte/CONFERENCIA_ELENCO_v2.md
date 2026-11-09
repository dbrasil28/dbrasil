# Conferência do pacote TODOS_PERSONAGENS_FINAL_v2 (09/11/2026)

Pacote do autor em 33 partes: 35 personagens do elenco (cada um com caminhada em 16 direções × 6 quadros, ataque e raiva em 16 direções) e 4 extras (Monstrão movimento, Juninho atropelado, Juninho arremesso com as duas mãos, bolsada da garota). Os originais não entram no repositório (≈ 900 MB); a prévia de todos está em `previas/elenco_v2_35.png`.

## O que foi conferido

| Item | Resultado |
| --- | --- |
| Pacote inteiro | 35 personagens com as 6 folhas cada (4 de caminhada, ataque, raiva); nenhum faltando |
| Direções da caminhada | As 16 de todos os 35, no olho: o giro anda liso, e 202,5°, 225° e 247,5° viram de costas para a esquerda (o erro dos pacotes anteriores sumiu) |
| Ataque e raiva | Giram certo nos que a medida automática acusou (a medida por espelho falha em quem leva algo de um lado só ou faz gesto com um braço) |
| Fundo | Transparente (PNG RGBA) |
| Bolsada da garota | 16 direções × 6 quadros: a bolsa vem de trás por cima e acerta na frente |
| Juninho arremesso com as duas mãos | 16 direções × 6 quadros: ergue, segura acima da cabeça e lança, de mãos vazias (o jogo desenha o objeto) |

## Pontos de atenção

- **O Barbudo e O Capitão** (e O Acordão, os dois juntos): a semelhança com Lula e Bolsonaro é forte na arte. Continua o ponto de loja do D21.
- **Mulher de Biquíni** (raiva de costas) e a garota: conferir a classificação etária antes da loja (D21).
- **Playboy** (conversível) e **2 Caras numa Moto** são veículos: a escala deles é a do veículo, maior que a de uma pessoa.

## No jogo

- **Parte 2 (D73):** Laranja e Rato de Academia como inimigos. Atlas em `prototype/assets/personagens/laranja/` e `rato_academia/`.
- **Parte 2b (D76):** Agiota e Coach Picareta como inimigos. Atlas em `prototype/assets/personagens/agiota/` e `coach/`.
- **Parte 1 (D72):** as 6 roupas da horda na Orla, a bolsada da garota e o Juninho pegando e lançando com as duas mãos. Atlas em `prototype/assets/personagens/horda_*/`, `garota_programa/bolsada_atlas.webp` e `juninho_arremesso/`.

## Onde cada um entra (pelo `docs/design/ELENCO_v0.3_BRASIL.md`)

- **Roupas da horda:** Mulher de Biquíni, Tiozão de Sunga, Tiozão de Pochete, Senhora do Controle Remoto, Atendente de Telemarketing, Peão de Obra.
- **Inimigos com mecânica própria:** Encostado do INSS, Laranja, Agiota, Coach Picareta, Pastor Picareta, Rato de Academia, 2 Caras numa Moto, Faria Limer, Playboy, Tio do Zap, Influencer da Bet, Segurança do Bairro.
- **Elites:** Candidato a Político, Bicheiro (com a Rainha de Samba no evento do desfile).
- **Chefes:** O Rapa (São Paulo), O Barbudo e O Capitão que viram O Acordão (Acordópolis), Barão do Guarda-Sol (Nordeste), Apresentador do Plantão Policial (a TV).
- **Jogáveis:** Jogador de Futebol, Vendedor de Picolé, Dona Cida, Márcia, Deputado Godofredo.
