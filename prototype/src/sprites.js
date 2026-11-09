// Arte em PNG (prototype/assets/). Enquanto uma imagem não carrega, o jogo usa o desenho em código.
// Os nomes seguem docs/arte/GUIA_DE_PRODUCAO_DE_ARTE.md e prototype/assets/asset_manifest.json.

export const IMAGES = {
  // Bola da Altinha (D70): 3D renderizada com os materiais do Figma (tools/render-bola.py); 6x4 células de 256:
  // quadros 0-11 a relíquia girando, 12-23 acordada rolando para baixo (o Golaço)
  bola_altinha: 'assets/objetos/bola_altinha.webp',
  w_altinha: 'assets/hud/w_altinha.png',
  juninho: 'assets/personagens/juninho.png',
  // Juninho: atlas de arremesso e de caminhada, 16 direções (linhas; 0° = de frente, 90° = direita) × 6 quadros
  juninho_atlas: 'assets/personagens/juninho_ataque_atlas.webp',
  juninho_walk_atlas: 'assets/personagens/juninho_caminhada_atlas.webp',
  juninho_carregando_atlas: 'assets/personagens/juninho_carregando/caminhada_atlas.webp', // braços erguidos com o objeto (Figma)
  juninho_atropelado_atlas: 'assets/personagens/juninho_atropelado/atropelado_atlas.webp', // derrubado: 8 direções × 12 quadros (2 linhas de 6 cada)
  juninho_aura_atlas: 'assets/personagens/juninho_aura/aura_atlas.webp', // recebendo a aura na cena da relíquia (D89): 24 quadros de frente
  // Caminhada em 16 direções × 6 quadros (atlas montados por tools/montar-atlas.py; ver WALK_ATLAS)
  // Telespectadores Hipnotizados, com pose de acordado
  tele_a_walk_atlas: 'assets/personagens/telespectador_a/caminhada_atlas.webp', // A: camisa amarela
  tele_a_acordado: 'assets/personagens/telespectador_a/acordado.png',
  tele_b_walk_atlas: 'assets/personagens/telespectador_b/caminhada_atlas.webp', // B: regata cinza
  tele_b_acordado: 'assets/personagens/telespectador_b/acordado.png',
  tele_c_walk_atlas: 'assets/personagens/telespectador_c/caminhada_atlas.webp', // C: camisa rubro-negra e chinelos
  // os mesmos A, B e C antes do sinal pegar (abertura): caminhada de cidadão e a transformação em horda
  cid_a_walk_atlas: 'assets/personagens/cidadao_a/caminhada_atlas.webp',
  cid_a_transf_atlas: 'assets/personagens/cidadao_a/transformacao_atlas.webp',
  cid_b_walk_atlas: 'assets/personagens/cidadao_b/caminhada_atlas.webp',
  cid_b_transf_atlas: 'assets/personagens/cidadao_b/transformacao_atlas.webp',
  cid_c_walk_atlas: 'assets/personagens/cidadao_c/caminhada_atlas.webp',
  cid_c_transf_atlas: 'assets/personagens/cidadao_c/transformacao_atlas.webp',
  tele_c_acordado: 'assets/personagens/telespectador_c/acordado.png',
  golpista_walk_atlas: 'assets/personagens/golpista/caminhada_atlas.webp', // Golpista Digital (e o Perfil Falso)
  burocrata_walk_atlas: 'assets/personagens/burocrata/caminhada_atlas.webp', // Burocrata-Monstro
  burocrata_ataque: 'assets/personagens/burocrata/ataque.png', // pose de frente lançando papéis (reserva)
  burocrata_poses_atlas: 'assets/personagens/burocrata/poses_atlas.webp', // ataque e fúria em 16 direções
  burocrata_papel: 'assets/personagens/burocrata/papel.png', // folha solta da pose de ataque: o projétil
  fiscal_walk_atlas: 'assets/personagens/fiscal/caminhada_atlas.webp', // Fiscal do Impossível
  monstrao_walk_atlas: 'assets/personagens/monstrao/caminhada_atlas.webp', // Monstrão, chefão da Orla (Figma)
  // figurantes da Orla (pacotes GPT, D55): a garota da esquina, o policial do pé do morro e o picolezeiro da areia
  garota_programa_walk_atlas: 'assets/personagens/garota_programa/caminhada_atlas.webp',
  garota_programa_poses_atlas: 'assets/personagens/garota_programa/poses_atlas.webp',
  garota_bolsada_atlas: 'assets/personagens/garota_programa/bolsada_atlas.webp', // a bolsada (elenco v2): 16 direções × 6 quadros
  juninho_arremesso_atlas: 'assets/personagens/juninho_arremesso/arremesso_atlas.webp', // pega e lança o objeto com as duas mãos
  policial_militar_walk_atlas: 'assets/personagens/policial_militar/caminhada_atlas.webp',
  policial_militar_poses_atlas: 'assets/personagens/policial_militar/poses_atlas.webp',
  vendedor_picole_walk_atlas: 'assets/personagens/vendedor_picole/caminhada_atlas.webp',
  vendedor_picole_poses_atlas: 'assets/personagens/vendedor_picole/poses_atlas.webp',
  monstrao_poses_atlas: 'assets/personagens/monstrao/poses_atlas.webp', // 7 golpes e poses em 16 direções
  monstrao_anilha: 'assets/personagens/monstrao/anilha.webp',
  // Cachorro Caramelo (habilidade): caminhada, corrida, mordida e latido em 16 direções × 6 quadros
  caramelo_walk_atlas: 'assets/personagens/caramelo/caminhada_atlas.webp',
  caramelo_corrida_atlas: 'assets/personagens/caramelo/corrida_atlas.webp',
  caramelo_mordida_atlas: 'assets/personagens/caramelo/mordida_atlas.webp',
  caramelo_latido_atlas: 'assets/personagens/caramelo/latido_atlas.webp',
  politico_walk_atlas: 'assets/personagens/politico/caminhada_atlas.webp', // Político Corrupto (e o Rival, tingido)
  politico_attack_atlas: 'assets/personagens/politico/ataque_atlas.webp', // arremesso da maleta (quadros 0–3)
  politico_maleta: 'assets/personagens/politico/maleta_voo.png', // maleta fechada em voo
  politico_maleta_meio: 'assets/personagens/politico/maleta_voo_meio.png', // abrindo no ar
  politico_maleta_aberta: 'assets/personagens/politico/maleta_voo_aberta.png', // aberta no ar, soltando notas
  politico_aberta: 'assets/personagens/politico/aberta_dinheiro.png', // maleta aberta com dinheiro: Propina no chão
  telespectador_a: 'assets/personagens/telespectador_a.png',
  telespectador_c: 'assets/personagens/telespectador_c.png',
  telespectador_d: 'assets/personagens/telespectador_d.png',
  telespectador_e: 'assets/personagens/telespectador_e.png',
  telespectador_f: 'assets/personagens/telespectador_f.png',
  telespectador_g: 'assets/personagens/telespectador_g.png',
  // vistas de frente (correndo na direção da câmera). Só entram recortes de corpo inteiro, com os pés.
  tf_semcamisa_3: 'assets/personagens/frente/telespectador_semcamisa_3.png',
  tf_escura_1: 'assets/personagens/frente/telespectador_escura_1.png',
  tf_escura_2: 'assets/personagens/frente/telespectador_escura_2.png',
  burocrata_frente: 'assets/personagens/frente/burocrata_frente.png',
  golpista: 'assets/personagens/golpista.png',
  burocrata: 'assets/personagens/burocrata.png',
  fiscal: 'assets/personagens/fiscal.png',
  politico: 'assets/personagens/politico.png',
  // poste de luz cheio de gato (Figma); o antigo com o cartaz "vote em mim de novo" saiu
  poste: 'assets/cenario/orla/poste_gato_a.webp',
  poste_b: 'assets/cenario/orla/poste_gato_b.webp',
  cone: 'assets/cenario/cone.png',
  // carros andando na avenida: de frente (descendo) e de traseira (subindo), 128 px por metro
  trafego_fusca_norte: 'assets/veiculos/fusca_norte.webp',
  trafego_fusca_sul: 'assets/veiculos/fusca_sul.webp',
  trafego_brasilia_norte: 'assets/veiculos/brasilia_norte.webp',
  trafego_brasilia_sul: 'assets/veiculos/brasilia_sul.webp',
  trafego_uno_norte: 'assets/veiculos/uno_norte.webp',
  trafego_uno_sul: 'assets/veiculos/uno_sul.webp',
  trafego_fusca_norte_rodas: 'assets/veiculos/fusca_norte_rodas.webp',
  trafego_fusca_sul_rodas: 'assets/veiculos/fusca_sul_rodas.webp',
  trafego_brasilia_norte_rodas: 'assets/veiculos/brasilia_norte_rodas.webp',
  trafego_brasilia_sul_rodas: 'assets/veiculos/brasilia_sul_rodas.webp',
  trafego_uno_norte_rodas: 'assets/veiculos/uno_norte_rodas.webp',
  trafego_uno_sul_rodas: 'assets/veiculos/uno_sul_rodas.webp',
  // objetos que o Juninho pega e arremessa (Figma, recortados); altura no chão em OBJ_ALTURA (config.js)
  obj_cadeira: 'assets/objetos/cadeira.webp',
  obj_mesa: 'assets/objetos/mesa.webp',
  obj_engradado: 'assets/objetos/engradado.webp',
  obj_botijao: 'assets/objetos/botijao.webp', // o botijão de gás que explode
  obj_cadeira_praia: 'assets/objetos/cadeira_praia.webp',
  obj_banquinho: 'assets/objetos/banquinho.webp',
  obj_lixeira: 'assets/objetos/lixeira.webp', // arrancada do poste: deitada, de lado, com o lixo caindo (Figma)
  obj_guarda_sol_a: 'assets/objetos/guarda_sol_a.webp', // arrancado da areia: deitado, de lado (Figma), nas cores de cada variação
  obj_guarda_sol_b: 'assets/objetos/guarda_sol_b.webp',
  // giro (360°): vistas diagonal da frente, frente, diagonal de trás e trás; o outro lado é espelhado
  obj_cadeira_se: 'assets/objetos/cadeira_se.webp',
  obj_cadeira_s: 'assets/objetos/cadeira_s.webp',
  obj_cadeira_ne: 'assets/objetos/cadeira_ne.webp',
  obj_cadeira_n: 'assets/objetos/cadeira_n.webp',
  obj_cadeira_praia_se: 'assets/objetos/cadeira_praia_se.webp',
  obj_cadeira_praia_s: 'assets/objetos/cadeira_praia_s.webp',
  obj_cadeira_praia_ne: 'assets/objetos/cadeira_praia_ne.webp',
  obj_cadeira_praia_n: 'assets/objetos/cadeira_praia_n.webp',
  obj_engradado_se: 'assets/objetos/engradado_se.webp',
  obj_engradado_s: 'assets/objetos/engradado_s.webp',
  obj_engradado_ne: 'assets/objetos/engradado_ne.webp',
  obj_engradado_n: 'assets/objetos/engradado_n.webp',
  // prédios da Orla (Figma), desenhados no ângulo do jogo (PREDIOS em config.js)
  salva_vidas: 'assets/cenario/orla/salva_vidas.webp',
  // favela (pacote v2): casas no ângulo do jogo (FAVELA em config.js) e objetos (ART em arte_cenario.js)
  fav_placa_parede: 'assets/cenario/favela/placa_parede.webp',
  cen_churrasqueira_a: 'assets/cenario/favela/churrasqueira_a.webp',
  cen_varal_a: 'assets/cenario/favela/varal_a.webp',
  cen_bandeira_a: 'assets/cenario/favela/bandeira_a.webp',
  cen_paredao_a: 'assets/cenario/favela/paredao_a.webp',
  cen_sofa_a: 'assets/cenario/favela/sofa_a.webp',
  cen_cadeiras_a: 'assets/cenario/favela/cadeiras_a.webp',
  cen_vaso_a: 'assets/cenario/favela/vaso_a.webp',
  // variações das casas (FAVELA.variantes): fav_<peça>_<letra>, uma linha por arquivo (o build acha pelo texto)
  predio_a: 'assets/cenario/predios/predio_a.webp',
  predio_b: 'assets/cenario/predios/predio_b.webp',
  predio_c: 'assets/cenario/predios/predio_c.webp',
  predio_d: 'assets/cenario/predios/predio_d.webp',
  // cenário com arte gerada (Figma, IA de imagem) e recortada; medidas em arte_cenario.js
  cen_carro_fusca: 'assets/cenario/orla/carro_fusca.webp',
  cen_carro_brasilia: 'assets/cenario/orla/carro_brasilia.webp',
  cen_carro_uno: 'assets/cenario/orla/carro_uno.webp', // o Uno com escada no teto
  cen_carro_taxi: 'assets/cenario/orla/carro_taxi.webp',
  // carcaças depois da explosão (Weave do Figma, a partir da arte de cima): mesmo tamanho e enquadramento
  cen_carro_fusca_queimado: 'assets/cenario/orla/carro_fusca_queimado.webp',
  cen_carro_brasilia_queimado: 'assets/cenario/orla/carro_brasilia_queimado.webp',
  cen_onibus_a: 'assets/cenario/orla/onibus_a.webp',
  cen_banca_a: 'assets/cenario/orla/banca_a.webp',
  cen_milho_a: 'assets/cenario/orla/milho_a.webp',
  cen_picole_a: 'assets/cenario/orla/picole_a.webp',
  cen_banco_a: 'assets/cenario/orla/banco_a.webp',
  cen_lixeira_a: 'assets/cenario/orla/lixeira_a.webp',
  cen_orelhao_laranja: 'assets/cenario/orla/orelhao_laranja.webp',
  cen_coqueiro_a: 'assets/cenario/orla/coqueiro_a.webp',
  cen_guarda_sol_a: 'assets/cenario/orla/guarda_sol_a.webp',
  cen_guarda_sol_b: 'assets/cenario/orla/guarda_sol_b.webp',
  cen_isopor_a: 'assets/cenario/orla/isopor_a.webp',
  cen_mate_a: 'assets/cenario/orla/mate_a.webp',
  cen_rede_a: 'assets/cenario/orla/rede_a.webp',
  cen_toalha_a: 'assets/cenario/orla/toalha_a.webp',
  cen_toalha_b: 'assets/cenario/orla/toalha_b.webp',
  cen_toalha_c: 'assets/cenario/orla/toalha_c.webp',
  cen_camburao_a: 'assets/cenario/orla/camburao_a.webp',
  cen_moto_a: 'assets/cenario/orla/moto_a.webp',
  cen_caixa_dagua_a: 'assets/cenario/orla/caixa_dagua_a.webp',
  cen_sinuca_a: 'assets/cenario/orla/sinuca_a.webp',
  cen_barricada_a: 'assets/cenario/orla/barricada_a.webp',
  cen_tambor_a: 'assets/cenario/orla/tambor_a.webp',
  cen_entulho_a: 'assets/cenario/orla/entulho_a.webp',
  cen_tapume_a: 'assets/cenario/orla/tapume_a.webp', // obra do Especulador e o tapume da escadaria
  cen_pneus_a: 'assets/cenario/orla/pneus_a.webp',
  cen_barraca_acai_a: 'assets/cenario/orla/barraca_acai_a.webp',
  cen_barraca_pastelaria_a: 'assets/cenario/orla/barraca_pastelaria_a.webp',
  cen_barraca_boteco_a: 'assets/cenario/orla/barraca_boteco_a.webp',
  chao: 'assets/chao/pedra_portuguesa_ondas.jpg',
  w_capacete: 'assets/hud/w_capacete.png',
  w_boleto: 'assets/hud/w_boleto.png',
  w_maleta: 'assets/hud/w_maleta.png',
  w_chinelo: 'assets/hud/w_chinelo.png',
  w_megafone: 'assets/hud/w_megafone.png',
  retrato: 'assets/hud/retrato_juninho.png',
  tv: 'assets/hud/tv_apresentador_ref.png',
  caveira: 'assets/hud/icone_eliminacoes.png',
  punho: 'assets/hud/icone_caos.png',
  logo: 'assets/hud/logo.png',
};

/**
 * Horda (MECH-001) agrupada por roupa, com vista de frente e de costas. Cada pessoa mantém
 * a roupa; só troca de frente (descendo na direção da câmera) para costas (subindo).
 */
// Só roupas com atlas animado (D18). Os recortes de pose única ficam como reserva, caso o atlas não
// carregue. Roupa nova: um conjunto com `anim` aqui e o atlas em WALK_ATLAS e CROWD_ANIM.
export const CROWD_SETS = [
  { front: [], back: ['telespectador_a', 'telespectador_d', 'telespectador_c'], anim: 'a' }, // camisa amarela
  { front: [], back: ['telespectador_e'], anim: 'b' }, // regata cinza (reserva: camiseta clara)
  { front: ['tf_escura_1', 'tf_escura_2'], back: [], anim: 'c' }, // camisa rubro-negra, ver D17 (reserva: roupa escura)
];
export const CROWD = [...new Set(CROWD_SETS.flatMap((s) => [...s.front, ...s.back]))];

/**
 * Atlas de caminhada: imagem, prefixo das 96 células (`<prefixo>_<direção>_<quadro>`) e altura da
 * figura na célula de 160 px (atlas_meta.json de cada pasta).
 */
export const WALK_ATLAS = {
  ta: { atlas: 'tele_a_walk_atlas', prefix: 'ta', figureH: 158, escala: 0.65 },
  tb: { atlas: 'tele_b_walk_atlas', prefix: 'tb', figureH: 158, escala: 0.65 },
  tc: { atlas: 'tele_c_walk_atlas', prefix: 'tc', figureH: 158, escala: 0.65 },
  // cidadãos (abertura), na escala dos telespectadores: caminhada e transformação (6 quadros, toca uma vez)
  ca: { atlas: 'cid_a_walk_atlas', prefix: 'ca', figureH: 158, escala: 0.65 },
  cb: { atlas: 'cid_b_walk_atlas', prefix: 'cb', figureH: 158, escala: 0.65 },
  cc: { atlas: 'cid_c_walk_atlas', prefix: 'cc', figureH: 158, escala: 0.65 },
  cat: { atlas: 'cid_a_transf_atlas', prefix: 'cat', figureH: 158, escala: 0.65 },
  cbt: { atlas: 'cid_b_transf_atlas', prefix: 'cbt', figureH: 158, escala: 0.65 },
  cct: { atlas: 'cid_c_transf_atlas', prefix: 'cct', figureH: 158, escala: 0.65 },
  gd: { atlas: 'golpista_walk_atlas', prefix: 'gd', figureH: 157, escala: 0.7 },
  bm: { atlas: 'burocrata_walk_atlas', prefix: 'bm', figureH: 158, escala: 0.7 },
  fi: { atlas: 'fiscal_walk_atlas', prefix: 'fi', figureH: 158, escala: 0.7 },
  pc: { atlas: 'politico_walk_atlas', prefix: 'pc', figureH: 158, escala: 0.8 },
  fk: { atlas: 'funkeiro_walk_atlas', prefix: 'fk', figureH: 158, escala: 0.75 },
  tf: { atlas: 'traficante_walk_atlas', prefix: 'tf', figureH: 157, escala: 0.75 },
  ct: { atlas: 'chefe_trafico_walk_atlas', prefix: 'ct', figureH: 157, escala: 0.85 },
  // Juninho carregando cadeira, mesa ou botijão acima da cabeça: a figura inteira (com os braços) tem 158 px, mas
  // o corpo, da cabeça aos pés, tem 1,17 vez menos; figureH é o do corpo, para ele sair do tamanho do Juninho andando
  jc: { atlas: 'juninho_carregando_atlas', prefix: 'jc', figureH: 133, escala: 0.8 },
  jat: { atlas: 'juninho_atropelado_atlas', prefix: 'jat', figureH: 158, escala: 0.75 },
  // Juninho pegando e lançando o objeto com as duas mãos (elenco v2): mesmo recorte do carregando; corpo pela caminhada
  jd: { atlas: 'juninho_arremesso_atlas', prefix: 'jd', figureH: 128, escala: 0.8 },
  // horda da Orla, roupas novas (elenco v2): carregadas logo depois do começo (IMAGES_ORLA_HORDA)
  hbq: { atlas: 'horda_biquini_walk_atlas', prefix: 'hbq', figureH: 157, escala: 0.7 },
  hts: { atlas: 'horda_sunga_walk_atlas', prefix: 'hts', figureH: 157, escala: 0.7 },
  htp: { atlas: 'horda_pochete_walk_atlas', prefix: 'htp', figureH: 157, escala: 0.7 },
  hsc: { atlas: 'horda_controle_walk_atlas', prefix: 'hsc', figureH: 157, escala: 0.7 },
  hat: { atlas: 'horda_telemarketing_walk_atlas', prefix: 'hat', figureH: 157, escala: 0.7 },
  hpo: { atlas: 'horda_peao_walk_atlas', prefix: 'hpo', figureH: 157, escala: 0.7 },
  // inimigos do elenco v2 (D73): Laranja e Rato de Academia (carregam com as roupas novas da Orla)
  lj: { atlas: 'laranja_walk_atlas', prefix: 'lj', figureH: 157, escala: 0.8 },
  ra: { atlas: 'rato_walk_atlas', prefix: 'ra', figureH: 157, escala: 0.8 }, // o tamanho vem de ENEMIES.rato.size (do Político, D79)
  ag: { atlas: 'agiota_walk_atlas', prefix: 'ag', figureH: 157, escala: 0.8 }, // D76
  co: { atlas: 'coach_walk_atlas', prefix: 'co', figureH: 157, escala: 0.8 }, // linha = (direção ÷ 2) × 4 + (direção % 2) × 2 + (quadro ≥ 6)
  ps: { atlas: 'pastor_walk_atlas', prefix: 'ps', figureH: 157, escala: 0.8 }, // D77
  bi: { atlas: 'bicheiro_walk_atlas', prefix: 'bi', figureH: 157, escala: 0.8 }, // D80: elite, do tamanho do Político (ENEMIES.bicheiro.size)
  en: { atlas: 'encostado_walk_atlas', prefix: 'en', figureH: 157, escala: 0.8 }, // D77
  mo: { atlas: 'monstrao_walk_atlas', prefix: 'mo', figureH: 157 },
  mo12a: { atlas: 'monstrao_cam12a_atlas', prefix: 'moa', figureH: 157 },
  mo12b: { atlas: 'monstrao_cam12b_atlas', prefix: 'mob', figureH: 157 },
  mopar: { atlas: 'monstrao_parado_atlas', prefix: 'mopa', figureH: 157 },
  momA: { atlas: 'monstrao_morteA_atlas', prefix: 'moma', figureH: 157, escala: 0.8 }, // vista uma vez só: célula menor
  momB: { atlas: 'monstrao_morteB_atlas', prefix: 'momb', figureH: 157, escala: 0.8 },
  // Morro (pacotes v2): moradores da horda, Cracudo e Trombadinha; carregados ao chegar no morro (IMAGES_MORRO)
  mli: { atlas: 'morador_listrado_walk_atlas', prefix: 'mli', figureH: 158, escala: 0.7 },
  mmc: { atlas: 'morador_moca_walk_atlas', prefix: 'mmc', figureH: 157, escala: 0.7 },
  mmq: { atlas: 'morador_moleque_walk_atlas', prefix: 'mmq', figureH: 158, escala: 0.7 },
  msr: { atlas: 'morador_senhor_walk_atlas', prefix: 'msr', figureH: 158, escala: 0.7 },
  msa: { atlas: 'morador_senhora_walk_atlas', prefix: 'msa', figureH: 158, escala: 0.7 },
  mtz: { atlas: 'morador_tiozinho_walk_atlas', prefix: 'mtz', figureH: 158, escala: 0.7 },
  cq: { atlas: 'cracudo_walk_atlas', prefix: 'cq', figureH: 158, escala: 0.7 },
  tr: { atlas: 'trombadinha_walk_atlas', prefix: 'tr', figureH: 158, escala: 0.7 },
  // figurantes (D55): cortados em 60% (são de fundo e não lutam)
  gp: { atlas: 'garota_programa_walk_atlas', prefix: 'gp', figureH: 157, escala: 0.6 },
  // a bolsada da garota (elenco v2): o recorte reserva espaço para a bolsa no alto; figureH acerta o corpo com a caminhada
  gbo: { atlas: 'garota_bolsada_atlas', prefix: 'gbo', figureH: 140, escala: 0.6 },
  // a dança da garota no baile: só as 4 primeiras direções (0 a 67,5°); figureH acerta o corpo com a caminhada
  // (o short tem a mesma largura; de joelho dobrado ela fica mais baixa que andando)
  gpd: { atlas: 'garota_danca_atlas', prefix: 'gpd', figureH: 144, escala: 0.6, rows: 4 },
  // a do morador listrado: só 3 direções (a 4ª do modelo veio de costas); o brilho dos olhos da horda foi apagado
  mlid: { atlas: 'morador_listrado_danca_atlas', prefix: 'mlid', figureH: 132, escala: 0.7, rows: 3, linhas: [0, 1, 2, 1, 0, 2, 1, 0] },
  pm: { atlas: 'policial_militar_walk_atlas', prefix: 'pm', figureH: 157, escala: 0.6 },
  pt: { atlas: 'policial_tropa_walk_atlas', prefix: 'pt', figureH: 158, escala: 0.6 },
  vp: { atlas: 'vendedor_picole_walk_atlas', prefix: 'vp', figureH: 157, escala: 0.6 },
  pa: { atlas: 'politico_attack_atlas', prefix: 'pa', figureH: 158, escala: 0.8 }, // mesma escala da caminhada
  // Caramelo: as quatro na mesma escala. feetRows: onde ficam as patas em cada direção (px da célula de 160);
  // de lado o cachorro pisa mais alto na folha, então o desenho desce até as patas tocarem o chão
  cw: { atlas: 'caramelo_walk_atlas', prefix: 'cw', figureH: 152, feetRows: [153.7, 150.3, 147.5, 148.9, 136.0, 136.0, 143.3, 152.3, 153.0, 148.2, 144.3, 138.1, 129.0, 138.4, 146.1, 151.3], escala: 0.6 },
  cr: { atlas: 'caramelo_corrida_atlas', prefix: 'cr', figureH: 152, feetRows: [155.5,  153.4,  145.0,  144.3,  127.3,  130.8,  131.5,  142.6,  159.0,  155.1,  146.8,  140.2,  129.4,  133.6,  142.3,  151.3], escala: 0.6 },
  cm: { atlas: 'caramelo_mordida_atlas', prefix: 'cm', figureH: 152, feetRows: [156.9, 156.5, 156.2, 151.0, 131.1, 136.0, 139.5, 145.4, 156.5, 153.0, 149.9, 145.4, 132.9, 138.8, 143.7, 148.9], escala: 0.6 },
  cl: { atlas: 'caramelo_latido_atlas', prefix: 'cl', figureH: 152, feetRows: [155.1, 151.7, 150.3, 150.6, 136.3, 139.5, 144.0, 152.3, 156.5, 153.0, 150.3, 143.7, 130.1, 140.5, 144.7, 151.7], escala: 0.6 },
};

/**
 * Poses paradas em 16 direções (montadas por tools/montar-poses.py): uma coluna por estado, célula de
 * 320×200 com os pés na base, na mesma escala do atlas de caminhada (boneco em pé = figureH px).
 */
export const POSE_ATLAS = {
  bp: { atlas: 'burocrata_poses_atlas', prefix: 'bp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.7 },
  fkp: { atlas: 'funkeiro_poses_atlas', prefix: 'fkp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.75 },
  tfp: { atlas: 'traficante_poses_atlas', prefix: 'tfp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.75 },
  ctp: { atlas: 'chefe_trafico_poses_atlas', prefix: 'ctp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.85 },
  mop: { atlas: 'monstrao_poses_atlas', prefix: 'mop', cols: 7, rows: 16, cw: 320, ch: 200, figureH: 158, col: { preparo: 0, investida: 1, agachamento: 2, arremesso: 3, levanta: 4, pose: 5, tonto: 6 } },
  mlip: { atlas: 'morador_listrado_poses_atlas', prefix: 'mlip', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.7 },
  mmcp: { atlas: 'morador_moca_poses_atlas', prefix: 'mmcp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.7 },
  mmqp: { atlas: 'morador_moleque_poses_atlas', prefix: 'mmqp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.7 },
  msrp: { atlas: 'morador_senhor_poses_atlas', prefix: 'msrp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.7 },
  msap: { atlas: 'morador_senhora_poses_atlas', prefix: 'msap', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.7 },
  mtzp: { atlas: 'morador_tiozinho_poses_atlas', prefix: 'mtzp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.7 },
  cqp: { atlas: 'cracudo_poses_atlas', prefix: 'cqp', cols: 1, rows: 16, cw: 320, ch: 200, figureH: 158, col: { agachado: 0 }, escala: 0.7 },
  trp: { atlas: 'trombadinha_poses_atlas', prefix: 'trp', cols: 1, rows: 16, cw: 320, ch: 200, figureH: 158, col: { correndo: 0 }, escala: 0.7 },
  hbqp: { atlas: 'horda_biquini_poses_atlas', prefix: 'hbqp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.7 },
  htsp: { atlas: 'horda_sunga_poses_atlas', prefix: 'htsp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.7 },
  htpp: { atlas: 'horda_pochete_poses_atlas', prefix: 'htpp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.7 },
  hscp: { atlas: 'horda_controle_poses_atlas', prefix: 'hscp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.7 },
  hatp: { atlas: 'horda_telemarketing_poses_atlas', prefix: 'hatp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.7 },
  ljp: { atlas: 'laranja_poses_atlas', prefix: 'ljp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.8 },
  rap: { atlas: 'rato_poses_atlas', prefix: 'rap', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.8 },
  agp: { atlas: 'agiota_poses_atlas', prefix: 'agp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.8 },
  cop: { atlas: 'coach_poses_atlas', prefix: 'cop', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.8 },
  bip: { atlas: 'bicheiro_poses_atlas', prefix: 'bip', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.8 },
  psp: { atlas: 'pastor_poses_atlas', prefix: 'psp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.8 },
  enp: { atlas: 'encostado_poses_atlas', prefix: 'enp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.8 },
  hpop: { atlas: 'horda_peao_poses_atlas', prefix: 'hpop', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 }, escala: 0.7 },
  gpp: { atlas: 'garota_programa_poses_atlas', prefix: 'gpp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, raiva: 1 }, escala: 0.6 },
  pmp: { atlas: 'policial_militar_poses_atlas', prefix: 'pmp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, raiva: 1 }, escala: 0.6 },
  ptp: { atlas: 'policial_tropa_poses_atlas', prefix: 'ptp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, raiva: 1 }, escala: 0.6 },
  vpp: { atlas: 'vendedor_picole_poses_atlas', prefix: 'vpp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, raiva: 1 }, escala: 0.6 },
  // Juninho recebendo a aura (D89, tools/montar-aura.py): 24 quadros de frente em 6×4; célula 200×176 com o chão a pe px
  // (sobra embaixo para a ponta do pé no ar); em pé ele tem figureH px, como na caminhada
  jau: { atlas: 'juninho_aura_atlas', prefix: 'jau', cols: 6, rows: 4, cw: 200, ch: 176, pe: 168, figureH: 155 },
  // Mototaxista (pacote 360 v3, tools/montar-veiculo.py): pilotando em 16 direções × 6 quadros; figureH: a maior figura
  mtx: { atlas: 'mototaxista_atlas', prefix: 'mtx', cols: 6, rows: 16, cw: 220, ch: 170, figureH: 120, escala: 0.8 },
};
export const POSE_OPTS = { shadowScale: 0.4 };

/** O atlas, se já carregou; senão null (o jogo usa o recorte de pose única). */
/**
 * A dança de cada um do povo do baile, pelo prefixo da arte da caminhada dele (quem não tem segue no passo no
 * lugar). linhas: a ordem das direções em que ele vira dançando, só as que a folha tem certas.
 */
export const DANCA_ATLAS = { gp: WALK_ATLAS.gpd, mli: WALK_ATLAS.mlid };

export const walkReady = (w) => (w && images[`${w.prefix}_0_0`] ? w : null);

/** Figurantes (D55): caminhada e as poses de ataque e raiva de cada um (figurantes.js diz quando). */
export const FIGURANTE_ART = {
  garota: { walk: WALK_ATLAS.gp, poses: POSE_ATLAS.gpp, golpe: WALK_ATLAS.gbo }, // golpe: a bolsada animada (6 quadros)
  pm: { walk: WALK_ATLAS.pm, poses: POSE_ATLAS.pmp },
  tropa: { walk: WALK_ATLAS.pt, poses: POSE_ATLAS.ptp },
  picole: { walk: WALK_ATLAS.vp, poses: POSE_ATLAS.vpp },
};

/** Telespectadores animados: atlas de caminhada e pose de acordado de cada roupa. */
export const CROWD_ANIM = {
  a: { walk: WALK_ATLAS.ta, acordado: 'tele_a_acordado', civil: WALK_ATLAS.ca, transf: WALK_ATLAS.cat },
  b: { walk: WALK_ATLAS.tb, acordado: 'tele_b_acordado', civil: WALK_ATLAS.cb, transf: WALK_ATLAS.cbt },
  c: { walk: WALK_ATLAS.tc, acordado: 'tele_c_acordado', civil: WALK_ATLAS.cc, transf: WALK_ATLAS.cct },
};

/** Horda do Morro (D37): uma roupa por morador (tint 100 em diante), com caminhada e as poses de ataque e raiva. */
export const CROWD_ANIM_MORRO = ['mli', 'mmc', 'mmq', 'msr', 'msa', 'mtz'].map((k) => ({ walk: WALK_ATLAS[k], poses: POSE_ATLAS[`${k}p`], morro: true }));

/**
 * Horda da Orla, roupas novas (elenco v2, tint 200 em diante): Mulher de Biquíni, Tiozão de Sunga, Tiozão de Pochete,
 * Senhora do Controle Remoto, Atendente de Telemarketing e Peão de Obra. Hipnotizados pela TV como os telespectadores;
 * acordados, vão embora andando com a própria caminhada.
 */
// a horda da Orla (D78): Biquíni, Sunga, Pochete e Controle Remoto; Telemarketing (hat) e Peão (hpo) são de São Paulo
export const CROWD_ANIM_ORLA = ['hbq', 'hts', 'htp', 'hsc'].map((k) => ({ walk: WALK_ATLAS[k], poses: POSE_ATLAS[`${k}p`], acordaAndando: true }));

/** Atlas animado da roupa (tint), quando ela tem um e ele já carregou; senão null (usa o recorte). */
export function crowdAnim(tint) {
  const a = tint >= 200
    ? CROWD_ANIM_ORLA[(tint - 200) % CROWD_ANIM_ORLA.length]
    : tint >= 100 ? CROWD_ANIM_MORRO[(tint - 100) % CROWD_ANIM_MORRO.length] : CROWD_ANIM[CROWD_SETS[tint % CROWD_SETS.length].anim];
  return a && walkReady(a.walk) ? a : null;
}

/** Imagem da pessoa da horda conforme a roupa (tint), o indivíduo (id) e a direção. */
export function crowdImage(tint, id, front) {
  const set = CROWD_SETS[tint % CROWD_SETS.length];
  let list = front ? set.front : set.back;
  if (!list.length) list = front ? set.back : set.front;
  return list[id % list.length];
}

/** Tipo de inimigo -> imagem e tratamentos aplicados no cache. */
export const ENEMY_ART = {
  golpista: { img: 'golpista', walk: WALK_ATLAS.gd },
  isca: { img: 'golpista', walk: WALK_ATLAS.gd, tint: [54, 240, 224, 0.55] },
  // attack: pose de ataque; attackH: altura dela em relação ao boneco andando (ela é agachada)
  // poses: fúria enquanto mira e ataque ao soltar, nas 16 direções; attack/attackH: pose única de reserva
  burocrata: { img: 'burocrata', front: 'burocrata_frente', papers: true, walk: WALK_ATLAS.bm, poses: POSE_ATLAS.bp, attack: 'burocrata_ataque', attackH: 0.92 },
  fiscal: { img: 'fiscal', vest: true, walk: WALK_ATLAS.fi }, // vest pinta o colete só no recorte antigo
  // fury: pose de fúria (braços abertos) virada para o Juninho enquanto prepara a investida
  funkeiro: { img: 'funkeiro', walk: WALK_ATLAS.fk, poses: POSE_ATLAS.fkp, fury: true, dash: 'ataque' },
  laranja: { walk: WALK_ATLAS.lj, poses: POSE_ATLAS.ljp }, // elenco v2 (D73)
  rato: { walk: WALK_ATLAS.ra, poses: POSE_ATLAS.rap, fury: true, dash: 'ataque' },
  agiota: { walk: WALK_ATLAS.ag, poses: POSE_ATLAS.agp }, // D76: aponta (ataque) quando marca e cobra
  coach: { walk: WALK_ATLAS.co, poses: POSE_ATLAS.cop, fury: true }, // a palestra: pose de quem prega (raiva)
  bicheiro: { walk: WALK_ATLAS.bi, poses: POSE_ATLAS.bip }, // D80
  pastor: { walk: WALK_ATLAS.ps, poses: POSE_ATLAS.psp, fury: true }, // D77: cura de mão erguida (ataque), chama fiéis de Bíblia no alto (raiva)
  encostado: { walk: WALK_ATLAS.en, poses: POSE_ATLAS.enp, fury: true }, // D77: pego correndo, congela de muleta no alto (raiva)
  // aim: pose de mira (fuzil no ombro) virada para o ponto travado, enquanto mira e logo depois do tiro
  traficante: { img: 'traficante', walk: WALK_ATLAS.tf, poses: POSE_ATLAS.tfp, aim: 'ataque', fury: true },
  // chefe: ataque (rajada) enquanto mira e atira; raiva (grito no rádio) enquanto chama reforço
  chefe_trafico: { img: 'chefe_trafico', walk: WALK_ATLAS.ct, poses: POSE_ATLAS.ctp, aim: 'ataque', fury: true },
  // D91: o DJ Plantão usa por enquanto a arte do Funkeiro (maior); a dele está pedida em docs/arte/PEDIDO_MORRO_BAILE.md
  dj_plantao: { img: 'funkeiro', walk: WALK_ATLAS.fk, poses: POSE_ATLAS.fkp, estados: true, tint: [170, 60, 255, 0.3], furia: [170, 60, 255, 0.3] },
  // throwAnim: quadros 0–2 na preparação, 3 ao soltar a maleta
  politico: { img: 'politico', walk: WALK_ATLAS.pc, throwAnim: WALK_ATLAS.pa },
  // Rival: o Político tingido de laranja até chegar a arte dele; aparece pouco, então não é preparado antes
  rival: { img: 'politico', tint: [240, 122, 26, 0.32], walk: WALK_ATLAS.pc, lazy: true },
  // Rabecão (Modo Horda): o camburão escurecido até chegar a arte do rabecão
  rabecao: { img: 'cen_camburao_a', tint: [18, 18, 22, 0.6], lazy: true },
  // Morro: o Cracudo agacha para catar o XP; o Trombadinha foge correndo com o celular (e.pose, como o Monstrão)
  cracudo: { img: 'cq_0_0', walk: WALK_ATLAS.cq, poses: POSE_ATLAS.cqp, estados: true, lazy: true },
  trombadinha: { img: 'tr_0_0', walk: WALK_ATLAS.tr, poses: POSE_ATLAS.trp, estados: true, lazy: true },
  // Monstrão: estados (e.pose) escolhem a coluna das poses, virada para e.poseX/poseY; gigante, então não é
  // preparado antes (lazy) e a fúria da fase 3 pinta de vermelho
  // walk12: caminhada de 12 quadros (as duas metades); parado: entre os golpes; morte: as 3 quedas (render_monstrao.js)
  monstrao: {
    img: 'mo_0_0', walk: WALK_ATLAS.mo, poses: POSE_ATLAS.mop, estados: true, lazy: true, furia: [215, 40, 28, 0.3],
    walk12: [WALK_ATLAS.mo12a, WALK_ATLAS.mo12b], parado: WALK_ATLAS.mopar, morte: [WALK_ATLAS.momA, WALK_ATLAS.momB],
  },
};

/**
 * Onde fica cada parte nas peças do baile (px da própria arte, medidos no recorte): base = o pé no chão (meio de
 * baixo); a treliça tem as lentes dos refletores (com a cor de cada uma); a TV, o retângulo da tela; o canhão, a lente
 * e o topo; o globo, o centro e o raio da bola e o topo da corrente. O jogo desenha na escala da arte, sem espremer
 * nem girar: na treliça de lado, as torres e os refletores são recortes da arte e só a viga, que corre para o fundo,
 * é desenhada em código, na projeção do jogo.
 */
export const ARTE_BAILE = {
  trelica: {
    base: [342, 746], raioLente: 18,
    lentes: [[159, 138], [252, 139], [344, 139], [434, 139], [526, 138]],
    cores: ['255,170,40', '255,60,170', '60,150,255', '240,60,230', '255,170,40'],
    // para a treliça de lado: cada torre recortada sozinha (em cima, sem a ponta da viga; embaixo, a chapa mais
    // larga) com o pé, o topo das torres, as linhas da viga e o recorte de cada refletor (o gancho no meio de cima)
    torres: [
      { cima: [42, 0, 108, 700], baixo: [0, 700, 160, 753], pe: [77, 746] },
      { cima: [577, 0, 644, 700], baixo: [526, 700, 686, 753], pe: [607, 746] },
    ],
    topoTorre: 6, viga: [8, 65],
    luzes: [[127, 66, 194, 166], [218, 66, 286, 166], [310, 66, 377, 166], [400, 66, 468, 166], [492, 66, 559, 166]],
  },
  tv: { base: [204, 622], tela: [17, 17, 390, 228] },
  canhao: { base: [114, 503], topo: 7, lente: [115, 64] },
  globo: { base: [115, 332], bola: [115.5, 224, 109], corrente: [116, 6] },
};

/** Atlas do Morro: carregados quando a passagem para o morro abre (carregarMorro), não no começo do jogo. */
export const IMAGES_MORRO = {
  // casas da favela e os inimigos só do Morro (D81): fora da memória enquanto o Juninho está na Orla
  fav_casa_laje_dir: 'assets/cenario/favela/casa_laje_dir.webp',
  fav_casa_laje_esq: 'assets/cenario/favela/casa_laje_esq.webp',
  fav_fachada_a: 'assets/cenario/favela/fachada_a.webp',
  fav_fachada_b: 'assets/cenario/favela/fachada_b.webp',
  fav_fachada_c: 'assets/cenario/favela/fachada_c.webp',
  fav_barraco_a: 'assets/cenario/favela/barraco_a.webp',
  fav_barraco_b: 'assets/cenario/favela/barraco_b.webp',
  fav_parede_viela_esq: 'assets/cenario/favela/parede_viela_esq.webp',
  fav_telhado_viela_dir: 'assets/cenario/favela/telhado_viela_dir.webp',
  fav_fios: 'assets/cenario/favela/fios_gatonet.webp',
  fav_bandeirinhas: 'assets/cenario/favela/bandeirinhas.webp',
  // peças do baile (Figma, de frente, ângulo 0° conferido; tools/recortar-pecas.py; geometria em ARTE_BAILE)
  baile_trelica: 'assets/cenario/favela/baile_trelica.webp',
  baile_globo: 'assets/cenario/favela/baile_globo.webp',
  baile_tv: 'assets/cenario/favela/baile_tv.webp',
  baile_canhao: 'assets/cenario/favela/baile_canhao.webp',
  // a dança do povo do baile (folhas 6×4 de frente a 67,5°, tools/montar-danca.py; DANCA_ATLAS)
  garota_danca_atlas: 'assets/personagens/garota_programa/danca_atlas.webp', // Canva, com o braço a mais tirado à mão
  morador_listrado_danca_atlas: 'assets/personagens/morador_listrado/danca_atlas.webp', // Canva (pessoa trocada numa dança pronta)
  funkeiro_walk_atlas: 'assets/personagens/funkeiro/caminhada_atlas.webp', // Funkeiro Raivoso (Morro)
  traficante_walk_atlas: 'assets/personagens/traficante/caminhada_atlas.webp', // Traficante do Morro (Figma)
  chefe_trafico_walk_atlas: 'assets/personagens/chefe_trafico/caminhada_atlas.webp', // Chefe do Tráfico (Figma)
  chefe_trafico_poses_atlas: 'assets/personagens/chefe_trafico/poses_atlas.webp', // ataque e raiva em 16 direções
  traficante_poses_atlas: 'assets/personagens/traficante/poses_atlas.webp', // mira com o fuzil em 16 direções
  funkeiro_poses_atlas: 'assets/personagens/funkeiro/poses_atlas.webp', // fúria de braços abertos em 16 direções
  funkeiro: 'assets/personagens/funkeiro.webp',
  traficante: 'assets/personagens/traficante.webp',
  chefe_trafico: 'assets/personagens/chefe_trafico.webp',
  morador_listrado_walk_atlas: 'assets/personagens/morador_listrado/caminhada_atlas.webp',
  morador_listrado_poses_atlas: 'assets/personagens/morador_listrado/poses_atlas.webp',
  morador_moca_walk_atlas: 'assets/personagens/morador_moca/caminhada_atlas.webp',
  morador_moca_poses_atlas: 'assets/personagens/morador_moca/poses_atlas.webp',
  morador_moleque_walk_atlas: 'assets/personagens/morador_moleque/caminhada_atlas.webp',
  morador_moleque_poses_atlas: 'assets/personagens/morador_moleque/poses_atlas.webp',
  morador_senhor_walk_atlas: 'assets/personagens/morador_senhor/caminhada_atlas.webp',
  morador_senhor_poses_atlas: 'assets/personagens/morador_senhor/poses_atlas.webp',
  morador_senhora_walk_atlas: 'assets/personagens/morador_senhora/caminhada_atlas.webp',
  morador_senhora_poses_atlas: 'assets/personagens/morador_senhora/poses_atlas.webp',
  morador_tiozinho_walk_atlas: 'assets/personagens/morador_tiozinho/caminhada_atlas.webp',
  morador_tiozinho_poses_atlas: 'assets/personagens/morador_tiozinho/poses_atlas.webp',
  cracudo_walk_atlas: 'assets/personagens/cracudo/caminhada_atlas.webp',
  cracudo_poses_atlas: 'assets/personagens/cracudo/poses_atlas.webp',
  trombadinha_walk_atlas: 'assets/personagens/trombadinha/caminhada_atlas.webp',
  trombadinha_poses_atlas: 'assets/personagens/trombadinha/poses_atlas.webp',
  mototaxista_atlas: 'assets/personagens/mototaxista/pilotando_atlas.webp', // a moto do Mototáxi Amigo (só no Morro)
  policial_tropa_walk_atlas: 'assets/personagens/policial_tropa/caminhada_atlas.webp', // a tropa nas vielas (D55)
  policial_tropa_poses_atlas: 'assets/personagens/policial_tropa/poses_atlas.webp',
  // chão do Morro visto de cima (sem emenda) e a relíquia do Morro (docs/arte/morro_figma/)
  chao_viela: 'assets/chao/cimento_viela.webp',
  chao_escadaria: 'assets/chao/escadaria_degraus.webp',
  chao_laje: 'assets/chao/laje_concreto.webp',
  paredao: 'assets/objetos/paredao.webp',
  w_paredao: 'assets/hud/w_paredao.png',
};

/** Ícone de arma/HUD -> imagem. */
export const ICON_ART = {
  capacete: 'w_capacete',
  entrega: 'w_capacete',
  boleto: 'w_boleto',
  maleta: 'w_maleta',
  chinelo: 'w_chinelo',
  microfone: 'w_megafone',
  caramelo: 'caramelo_icone', // recortado do atlas do latido quando ele carrega
  paredao: 'w_paredao',
  altinha: 'w_altinha',
};

export const images = {};
let pending = 0;

// No Android, voltar do segundo plano pode apagar todo canvas (o sistema solta a memória de imagem e devolve
// em branco). Os personagens vivem em canvas (as células recortadas das folhas, que saem da memória depois
// do recorte): sem isso, todos sumiam e não voltavam. ARTE.geracao sobe quando a arte é refeita: quem guarda
// desenho pronto em canvas compara e refaz o seu.
export const ARTE = { geracao: 0 };
const cortados = new Map(); // folha recortada → caminho (para recortar de novo)
let sentinela = null; // cópia de uma célula do Juninho, só para ver se os canvas foram apagados

let sonda = null;
/**
 * Os canvas foram apagados? Copia uma coluna da sentinela (cópia de uma célula do Juninho) numa sonda e lê a
 * sonda: sem nada, foi. Ler a própria sentinela faria o navegador tirá-la da memória de vídeo, e aí ela não
 * seria mais apagada junto com as outras.
 */
export function arteSumiu() {
  if (!sentinela || typeof document === 'undefined') return false;
  try {
    if (!sonda || sonda.height !== sentinela.height) {
      sonda = canvas(1, sentinela.height);
      sonda.ctx = sonda.getContext('2d', { willReadFrequently: true });
    }
    sonda.ctx.clearRect(0, 0, 1, sonda.height);
    sonda.ctx.drawImage(sentinela, sentinela.width >> 1, 0, 1, sentinela.height, 0, 0, 1, sonda.height);
    const d = sonda.ctx.getImageData(0, 0, 1, sonda.height).data;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) return false;
    return true;
  } catch {
    return false;
  }
}

/** Recorta de novo todas as folhas (vêm do cache do navegador) e avisa os outros caches (ARTE.geracao). */
export function refazerArte() {
  ARTE.geracao++;
  sentinela = null;
  const lista = [...cortados];
  pending += lista.length;
  return Promise.all(lista.map(([id, src]) => carregar(id, src)));
}

export function loadImages(onEach) {
  if (typeof Image === 'undefined') return Promise.resolve(images);
  const entries = Object.entries(IMAGES);
  pending = entries.length;
  return Promise.all(entries.map(([id, src]) => carregar(id, src, onEach))).then(() => images);
}

// Monstrão com mais movimento (pacote do autor, D65): caminhada de 12 quadros (duas folhas de 6), parado e as
// 3 mortes. Pesam: só carregam quando o chefão se aproxima (carregarMonstrao); até lá vale a caminhada antiga.
export const IMAGES_MONSTRAO = {
  monstrao_cam12a_atlas: 'assets/personagens/monstrao/cam12a_atlas.webp', // quadros 1 a 6 de cada direção
  monstrao_cam12b_atlas: 'assets/personagens/monstrao/cam12b_atlas.webp', // quadros 7 a 12
  monstrao_parado_atlas: 'assets/personagens/monstrao/parado_atlas.webp', // respirando entre os golpes (laço de 6)
  monstrao_morteA_atlas: 'assets/personagens/monstrao/morteA_atlas.webp', // mortes 1 e 2
  monstrao_morteB_atlas: 'assets/personagens/monstrao/morteB_atlas.webp', // morte 3
};
let monstraoPedido = null;
/** Carrega o Monstrão novo uma vez só. */
export function carregarMonstrao() {
  if (monstraoPedido || typeof Image === 'undefined') return monstraoPedido;
  const entries = Object.entries(IMAGES_MONSTRAO);
  pending += entries.length;
  monstraoPedido = Promise.all(entries.map(([id, src]) => carregar(id, src)));
  return monstraoPedido;
}

let morroPedido = null;
/** Carrega os atlas do Morro uma vez só (a horda de moradores, o Cracudo e o Trombadinha). */
// Horda da Orla, roupas novas (elenco v2): carregam logo depois do começo; até lá, a horda usa as roupas de antes
export const IMAGES_ORLA_HORDA = {
  horda_biquini_walk_atlas: 'assets/personagens/horda_biquini/caminhada_atlas.webp',
  horda_biquini_poses_atlas: 'assets/personagens/horda_biquini/poses_atlas.webp',
  horda_sunga_walk_atlas: 'assets/personagens/horda_sunga/caminhada_atlas.webp',
  horda_sunga_poses_atlas: 'assets/personagens/horda_sunga/poses_atlas.webp',
  horda_pochete_walk_atlas: 'assets/personagens/horda_pochete/caminhada_atlas.webp',
  horda_pochete_poses_atlas: 'assets/personagens/horda_pochete/poses_atlas.webp',
  horda_controle_walk_atlas: 'assets/personagens/horda_controle/caminhada_atlas.webp',
  horda_controle_poses_atlas: 'assets/personagens/horda_controle/poses_atlas.webp',
  rato_walk_atlas: 'assets/personagens/rato_academia/caminhada_atlas.webp',
  rato_poses_atlas: 'assets/personagens/rato_academia/poses_atlas.webp',
  pastor_walk_atlas: 'assets/personagens/pastor/caminhada_atlas.webp',
  bicheiro_walk_atlas: 'assets/personagens/bicheiro/caminhada_atlas.webp',
  bicheiro_poses_atlas: 'assets/personagens/bicheiro/poses_atlas.webp',
  pastor_poses_atlas: 'assets/personagens/pastor/poses_atlas.webp',
};
// Elenco v2 de outros trechos (D78), pronto e à espera do trecho: São Paulo (Telemarketing e Peão na horda, Agiota,
// Coach) e Brasília (Laranja, Encostado). Não carrega na Orla nem no Morro.
export const IMAGES_OUTROS_TRECHOS = {
  horda_telemarketing_walk_atlas: 'assets/personagens/horda_telemarketing/caminhada_atlas.webp',
  horda_telemarketing_poses_atlas: 'assets/personagens/horda_telemarketing/poses_atlas.webp',
  horda_peao_walk_atlas: 'assets/personagens/horda_peao/caminhada_atlas.webp',
  horda_peao_poses_atlas: 'assets/personagens/horda_peao/poses_atlas.webp',
  laranja_walk_atlas: 'assets/personagens/laranja/caminhada_atlas.webp',
  laranja_poses_atlas: 'assets/personagens/laranja/poses_atlas.webp',
  agiota_walk_atlas: 'assets/personagens/agiota/caminhada_atlas.webp',
  agiota_poses_atlas: 'assets/personagens/agiota/poses_atlas.webp',
  coach_walk_atlas: 'assets/personagens/coach/caminhada_atlas.webp',
  coach_poses_atlas: 'assets/personagens/coach/poses_atlas.webp',
  encostado_walk_atlas: 'assets/personagens/encostado/caminhada_atlas.webp',
  encostado_poses_atlas: 'assets/personagens/encostado/poses_atlas.webp',
};
let orlaHordaPedido = null;
/** Carrega as roupas novas da horda da Orla uma vez só. */
export function carregarHordaOrla() {
  if (orlaHordaPedido || typeof Image === 'undefined') return orlaHordaPedido;
  const entries = Object.entries(IMAGES_ORLA_HORDA);
  pending += entries.length;
  orlaHordaPedido = Promise.all(entries.map(([id, src]) => carregar(id, src)));
  return orlaHordaPedido;
}
/** Prepara as figuras das roupas novas da horda da Orla aos poucos (como prewarmMorro). */
export function prewarmHordaOrla(cache, enemyPx) {
  const jobs = [];
  for (const a of CROWD_ANIM_ORLA) {
    for (let r = 0; r < ATLAS.rows; r++) {
      for (let f = 0; f < ATLAS.cols; f++) jobs.push(() => cache.get(`${a.walk.prefix}_${r}_${f}`, enemyPx * (ATLAS.ch / a.walk.figureH), CROWD_WALK_OPTS));
      for (let c = 0; c < a.poses.cols; c++) jobs.push(() => cache.get(`${a.poses.prefix}_${r}_${c}`, enemyPx * (a.poses.ch / a.poses.figureH), POSE_OPTS));
    }
  }
  return jobs;
}

export function carregarMorro() {
  if (morroPedido || typeof Image === 'undefined') return morroPedido;
  const entries = Object.entries(IMAGES_MORRO);
  pending += entries.length;
  morroPedido = Promise.all(entries.map(([id, src]) => carregar(id, src)));
  return morroPedido;
}

function carregar(id, src, onEach) {
  return new Promise((resolve) => {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => {
      images[id] = im;
      let cortado = false;
      if (id === 'juninho_atlas') {
        sliceAtlas(im, 'ja');
        cortado = true;
      }
      if (id === 'juninho_walk_atlas') {
        sliceAtlas(im, 'jw');
        cortado = true;
      }
      for (const w of Object.values(WALK_ATLAS)) {
        if (id !== w.atlas) continue;
        sliceAtlas(im, w.prefix, w.escala || w.rows ? { ...ATLAS, escala: w.escala || 1, rows: w.rows || ATLAS.rows } : ATLAS);
        cortado = true;
      }
      if (id === WALK_ATLAS.cl.atlas) images.caramelo_icone = cropAlpha(images[`${WALK_ATLAS.cl.prefix}_2_3`]); // latindo, de 3/4
      for (const p of Object.values(POSE_ATLAS)) {
        if (id !== p.atlas) continue;
        sliceAtlas(im, p.prefix, p);
        cortado = true;
      }
      if (cortado) {
        cortados.set(id, src);
        delete images[id]; // as células bastam: o atlas inteiro sai da memória
      }
      if (id === 'juninho_walk_atlas' && typeof document !== 'undefined') {
        const cel = images.jw_0_0;
        if (cel) {
          sentinela = canvas(cel.width, cel.height);
          sentinela.getContext('2d').drawImage(cel, 0, 0);
        }
      }
      pending--;
      onEach?.(id);
      resolve();
    };
    im.onerror = () => {
      pending--;
      resolve();
    };
    im.src = src;
  });
}

export const imagesReady = () => pending === 0;

export const ATLAS = { cols: 6, rows: 16, cw: 200, ch: 160, figureH: 155, hipFrac: 0.585, pivotFrac: 0.53 }; // figura ≈ 155 px numa célula de 160; cintura a 58,5% da altura

/** Corta um atlas em 96 células (canvas) registradas como imagens `<prefixo>_<direção>_<quadro>`. */
function sliceAtlas(im, prefix, g = ATLAS) {
  // escala < 1: células menores (as do Morro), para caber na memória do celular; o jogo escala pela altura
  const e = g.escala || 1;
  for (let r = 0; r < g.rows; r++) {
    for (let f = 0; f < g.cols; f++) {
      const c = canvas(g.cw * e, g.ch * e);
      c.getContext('2d').drawImage(im, f * g.cw, r * g.ch, g.cw, g.ch, 0, 0, c.width, c.height);
      images[`${prefix}_${r}_${f}`] = c;
    }
  }
}

/** Recorta a célula até onde há desenho (para ícones: a célula do atlas tem muita margem). */
function cropAlpha(src) {
  const d = src.getContext('2d').getImageData(0, 0, src.width, src.height).data;
  let x0 = src.width, y0 = src.height, x1 = 0, y1 = 0;
  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      if (d[(y * src.width + x) * 4 + 3] < 24) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < x0) return src;
  const c = canvas(x1 - x0 + 1, y1 - y0 + 1);
  c.getContext('2d').drawImage(src, -x0, -y0);
  return c;
}

/** Linha do atlas para uma direção na tela (dx para a direita, dy para baixo). */
export function atlasRow(dx, dy) {
  let deg = (Math.atan2(dx, dy) * 180) / Math.PI; // 0 = para baixo (de frente), 90 = direita
  if (deg < 0) deg += 360;
  return Math.round(deg / 22.5) % ATLAS.rows;
}

/** As figuras do Morro (moradores, Cracudo, Trombadinha), preparadas aos poucos quando os atlas chegam. */
export function prewarmMorro(cache, enemyPx, sizeOf) {
  const jobs = [];
  for (const a of CROWD_ANIM_MORRO) {
    for (let r = 0; r < ATLAS.rows; r++) {
      for (let f = 0; f < ATLAS.cols; f++) jobs.push(() => cache.get(`${a.walk.prefix}_${r}_${f}`, enemyPx * (ATLAS.ch / a.walk.figureH), MORRO_WALK_OPTS));
      for (let c = 0; c < a.poses.cols; c++) jobs.push(() => cache.get(`${a.poses.prefix}_${r}_${c}`, enemyPx * (a.poses.ch / a.poses.figureH), POSE_OPTS));
    }
  }
  for (const type of ['cracudo', 'trombadinha']) {
    const art = ENEMY_ART[type];
    const h = enemyPx * sizeOf(type);
    for (let r = 0; r < ATLAS.rows; r++) {
      for (let f = 0; f < ATLAS.cols; f++) jobs.push(() => cache.get(`${art.walk.prefix}_${r}_${f}`, h * (ATLAS.ch / art.walk.figureH), enemyWalkOpts(art)));
      jobs.push(() => cache.get(`${art.poses.prefix}_${r}_0`, h * (art.poses.ch / art.poses.figureH), POSE_OPTS));
    }
  }
  return jobs;
}

/** Monta de antemão todas as variações usadas na partida, para não travar no meio dela. */
export function prewarm(cache, playerPx, enemyPx, sizeOf) {
  // devolve uma fila de tarefas pequenas, feitas aos poucos entre os quadros (sem congelar a tela)
  const jobs = [];
  for (const flip of [false, true]) {
    jobs.push(() => cache.get('juninho', playerPx, { flip, mode: '' }));
    jobs.push(() => cache.get('juninho', playerPx, { flip, mode: 'hurt' }));
    if (flip) continue;
    for (let r = 0; r < ATLAS.rows; r++) {
      for (let f = 0; f < ATLAS.cols; f++) {
        for (const mode of ['', 'hurt']) {
          jobs.push(() => cache.get(`ja_${r}_${f}`, playerPx * (ATLAS.ch / ATLAS.figureH), { mode, noShadow: true }));
          jobs.push(() => cache.get(`jw_${r}_${f}`, playerPx * (ATLAS.ch / ATLAS.figureH), { mode, noShadow: true }));
        }
      }
    }
    // o brilho de dano dos inimigos é desenhado na hora (render.js), então não há cópia "flash" aqui
    for (const id of CROWD) {
      jobs.push(() => cache.get(id, enemyPx, { flip, hypno: true }));
      jobs.push(() => cache.get(id, enemyPx, { mode: 'woken', flip }));
    }
    for (const a of Object.values(CROWD_ANIM)) {
      jobs.push(() => cache.get(a.acordado, enemyPx, { flip }));
      if (flip) continue;
      for (let r = 0; r < ATLAS.rows; r++) {
        for (let f = 0; f < ATLAS.cols; f++) jobs.push(() => cache.get(`${a.walk.prefix}_${r}_${f}`, enemyPx * (ATLAS.ch / a.walk.figureH), CROWD_WALK_OPTS));
      }
    }
    for (const [type, art] of Object.entries(ENEMY_ART)) {
      const h = enemyPx * sizeOf(type);
      for (const img of [art.img, art.front].filter(Boolean)) jobs.push(() => cache.get(img, h, { ...art, flip }));
      if (art.attack) jobs.push(() => cache.get(art.attack, h * art.attackH, attackOpts(flip)));
      if (!flip && art.poses && !art.lazy) {
        const P = art.poses;
        for (let r = 0; r < P.rows; r++) {
          for (let c = 0; c < P.cols; c++) jobs.push(() => cache.get(`${P.prefix}_${r}_${c}`, h * (P.ch / P.figureH), POSE_OPTS));
        }
      }
      if (flip || !art.walk || art.lazy) continue;
      for (let r = 0; r < ATLAS.rows; r++) {
        for (let f = 0; f < ATLAS.cols; f++) jobs.push(() => cache.get(`${art.walk.prefix}_${r}_${f}`, h * (ATLAS.ch / art.walk.figureH), enemyWalkOpts(art)));
        if (art.throwAnim) {
          for (let f = 0; f < 4; f++) jobs.push(() => cache.get(`${art.throwAnim.prefix}_${r}_${f}`, h * (ATLAS.ch / art.throwAnim.figureH), enemyWalkOpts(art)));
        }
      }
    }
  }
  return jobs;
}

/** Opções de cache dos quadros animados (as mesmas no prewarm e no render, senão a chave muda). */
export const CROWD_WALK_OPTS = { hypno: true, shadowScale: 0.6 };
// moradores do Morro: a arte já vem com os olhos brilhando; a luz de TV por cima apagaria o rosto
export const MORRO_WALK_OPTS = { shadowScale: 0.6 };
const walkOpts = new Map();
export function enemyWalkOpts(art) {
  let o = walkOpts.get(art);
  if (!o) walkOpts.set(art, (o = { tint: art.tint, shadowScale: 0.6 }));
  return o;
}

const ATTACK_OPTS = [{ flip: false, shadowScale: 0.5 }, { flip: true, shadowScale: 0.5 }];
export const attackOpts = (flip) => ATTACK_OPTS[flip ? 1 : 0];

/** Máximo de sprites prontos guardados; acima disso saem os mais antigos (ordem de inserção). */
const CACHE_MAX = 1600;
// Figuras prontas da horda: no máximo esta densidade (a 2 ou 3 o cache passava de 120 MB no celular) e no
// máximo MONTAR_POR_QUADRO figuras novas por quadro; quem fica sem a figura nova usa a do quadro anterior.
export const FIGURAS_DPR_MAX = 1.6;
const MONTAR_POR_QUADRO = 4;

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

/**
 * Monta (e guarda) o sprite pronto para desenhar: altura em px CSS, âncora nos pés,
 * sombra, contorno escuro e os tratamentos do tipo.
 */
export class SpriteCache {
  constructor() {
    this.map = new Map();
    this.dpr = 1;
  }

  clear(dpr) {
    this.map.clear();
    if (dpr) this.dpr = Math.min(dpr, FIGURAS_DPR_MAX);
  }

  /** Começo de cada quadro: zera a conta das figuras montadas. */
  novoQuadro() {
    this.montadas = 0;
  }

  /** adiavel: se já montou o bastante neste quadro, devolve null (quem chama usa a figura anterior). */
  get(imgId, heightCss, opts = {}, adiavel = false) {
    const im = images[imgId];
    if (!im) return null;
    const flip = opts.flip ? 1 : 0;
    const flash = opts.flash ? 1 : 0;
    const key = `${imgId}|${Math.round(heightCss)}|${flip}|${flash}|${opts.mode || ''}|${opts.tint ? opts.tint.join() : ''}|${opts.shadowScale || ''}|${opts.noShadow ? 1 : 0}`;
    let c = this.map.get(key);
    if (c) return c;
    if (adiavel && this.montadas >= MONTAR_POR_QUADRO) return null;
    this.montadas = (this.montadas || 0) + 1;
    c = this.build(im, heightCss, opts);
    if (this.map.size >= CACHE_MAX) {
      let n = CACHE_MAX >> 3;
      for (const k of this.map.keys()) {
        this.map.delete(k);
        if (--n <= 0) break;
      }
    }
    this.map.set(key, c);
    return c;
  }

  build(im, heightCss, opts) {
    const s = this.dpr;
    const h = heightCss * s;
    const w = (im.width / im.height) * h;
    const pad = Math.ceil(4 * s) + (opts.hypno ? Math.ceil(h * 0.12) : 0);
    const shadowH = Math.max(4, h * 0.1);
    const shadowW = w * 0.42 * (opts.shadowScale || 1);
    const c = canvas(w + pad * 2, h + pad * 2 + shadowH * 0.5);
    const g = c.getContext('2d');
    const footY = pad + h;
    const cx = c.width / 2;

    // sombra no chão (opcional: o jogador desenha a dele à parte, porque as pernas mexem)
    if (!opts.noShadow) {
      g.fillStyle = 'rgba(0,0,0,0.38)';
      g.beginPath();
      g.ellipse(cx, footY - shadowH * 0.15, shadowW, shadowH * 0.5, 0, 0, Math.PI * 2);
      g.fill();
    }

    // camada do personagem (com espelhamento e tratamentos)
    const layer = canvas(w, h);
    const lg = layer.getContext('2d', { willReadFrequently: opts.mode === 'woken' });
    if (opts.flip) {
      lg.translate(w, 0);
      lg.scale(-1, 1);
    }
    lg.drawImage(im, 0, 0, w, h);
    lg.setTransform(1, 0, 0, 1, 0, 0);
    if (opts.flip && opts.hardhat) {
      /* o capacete é desenhado depois, já considerando o espelho */
    }
    const atop = (fill, y0 = 0, y1 = h, alpha = 1) => {
      lg.globalCompositeOperation = 'source-atop';
      lg.globalAlpha = alpha;
      lg.fillStyle = fill;
      lg.fillRect(0, y0, w, y1 - y0);
      lg.globalAlpha = 1;
      lg.globalCompositeOperation = 'source-over';
    };
    if (opts.tint) atop(`rgb(${opts.tint[0]},${opts.tint[1]},${opts.tint[2]})`, 0, h, opts.tint[3]);
    if (opts.vest) atop('rgb(255,122,26)', h * 0.22, h * 0.52, 0.42); // colete laranja do Fiscal
    if (opts.hypno) atop('rgb(120,170,255)', 0, h * 0.24, 0.28); // luz de tela no rosto
    if (opts.mode === 'woken') desaturate(lg, w, h, 0.25);
    if (opts.flash) atop('rgb(255,255,255)', 0, h, 0.75);
    if (opts.mode === 'hurt') atop('rgb(255,40,50)', 0, h, 0.55);

    // contorno: silhueta escura deslocada em 8 direções
    const sil = canvas(w, h);
    const sg = sil.getContext('2d');
    sg.drawImage(layer, 0, 0);
    sg.globalCompositeOperation = 'source-in';
    sg.fillStyle = opts.outline || 'rgba(12,8,14,0.85)';
    sg.fillRect(0, 0, w, h);
    const o = Math.max(1, 1.2 * s);
    const x0 = cx - w / 2;
    const y0 = pad;
    if (opts.hypno) {
      // halo azul de tela em volta da cabeça
      const hx = cx;
      const hy = y0 + h * 0.09;
      const rg = g.createRadialGradient(hx, hy, 0, hx, hy, h * 0.2);
      rg.addColorStop(0, 'rgba(140,185,255,0.75)');
      rg.addColorStop(1, 'rgba(140,185,255,0)');
      g.fillStyle = rg;
      g.beginPath();
      g.arc(hx, hy, h * 0.2, 0, Math.PI * 2);
      g.fill();
    }
    for (const [dx, dy] of [[-o, 0], [o, 0], [0, -o], [0, o], [-o, -o], [o, -o], [-o, o], [o, o]]) g.drawImage(sil, x0 + dx, y0 + dy);
    g.drawImage(layer, x0, y0);

    if (opts.papers) {
      // pilha de papelada na mão
      const pw = w * 0.32;
      const ph = h * 0.16;
      const px = opts.flip ? x0 + w * 0.02 : x0 + w - pw * 0.9;
      const py = y0 + h * 0.4;
      for (let i = 0; i < 4; i++) {
        g.fillStyle = i % 2 ? '#e9e4d8' : '#f6f2ea';
        g.strokeStyle = 'rgba(40,40,50,0.6)';
        g.lineWidth = Math.max(1, s);
        g.fillRect(px + i * 1.5 * s, py - i * ph * 0.22, pw, ph * 0.3);
        g.strokeRect(px + i * 1.5 * s, py - i * ph * 0.22, pw, ph * 0.3);
      }
    }
    if (opts.hardhat) {
      // capacete de obra do Especulador (a cabeça fica em ~45% da largura, no topo)
      const hx = opts.flip ? x0 + w * 0.55 : x0 + w * 0.45;
      const hy = y0 + h * 0.075;
      const r = w * 0.15;
      g.fillStyle = '#ffd21f';
      g.strokeStyle = 'rgba(0,0,0,0.6)';
      g.lineWidth = Math.max(1, 1.2 * s);
      g.beginPath();
      g.arc(hx, hy, r, Math.PI, 0);
      g.closePath();
      g.fill();
      g.stroke();
      g.fillRect(hx - r * 1.35, hy - r * 0.05, r * 2.7, r * 0.28);
      g.strokeRect(hx - r * 1.35, hy - r * 0.05, r * 2.7, r * 0.28);
      g.fillStyle = '#e8b400';
      g.fillRect(hx - r * 0.12, hy - r * 0.95, r * 0.24, r * 0.9);
    }

    c.ox = cx / s;
    c.oy = footY / s;
    c.cssW = c.width / s;
    c.cssH = c.height / s;
    return c;
  }
}

function desaturate(g, w, h, amount) {
  try {
    const d = g.getImageData(0, 0, w, h);
    const p = d.data;
    for (let i = 0; i < p.length; i += 4) {
      const l = p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11;
      p[i] += (l - p[i]) * amount;
      p[i + 1] += (l - p[i + 1]) * amount;
      p[i + 2] += (l - p[i + 2]) * amount;
    }
    g.putImageData(d, 0, 0);
  } catch {
    /* canvas sem acesso aos pixels: segue colorido */
  }
}

/** Desenha uma imagem inteira encaixada num quadrado (ícones do HUD e projéteis). */
export function drawFit(g, im, x, y, size) {
  const s = Math.min(size / im.width, size / im.height);
  const w = im.width * s;
  const h = im.height * s;
  g.drawImage(im, x + (size - w) / 2, y + (size - h) / 2, w, h);
}
