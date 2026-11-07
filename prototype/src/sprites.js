// Arte em PNG (prototype/assets/). Enquanto uma imagem não carrega, o jogo usa o desenho em código.
// Os nomes seguem docs/arte/GUIA_DE_PRODUCAO_DE_ARTE.md e prototype/assets/asset_manifest.json.

export const IMAGES = {
  juninho: 'assets/personagens/juninho.png',
  // Juninho: atlas de arremesso e de caminhada, 16 direções (linhas; 0° = de frente, 90° = direita) × 6 quadros
  juninho_atlas: 'assets/personagens/juninho_ataque_atlas.webp',
  juninho_walk_atlas: 'assets/personagens/juninho_caminhada_atlas.webp',
  // Caminhada em 16 direções × 6 quadros (atlas montados por tools/montar-atlas.py; ver WALK_ATLAS)
  // Telespectadores Hipnotizados, com pose de acordado
  tele_a_walk_atlas: 'assets/personagens/telespectador_a/caminhada_atlas.webp', // A: camisa amarela
  tele_a_acordado: 'assets/personagens/telespectador_a/acordado.png',
  tele_b_walk_atlas: 'assets/personagens/telespectador_b/caminhada_atlas.webp', // B: regata cinza
  tele_b_acordado: 'assets/personagens/telespectador_b/acordado.png',
  tele_c_walk_atlas: 'assets/personagens/telespectador_c/caminhada_atlas.webp', // C: camisa rubro-negra e chinelos
  tele_c_acordado: 'assets/personagens/telespectador_c/acordado.png',
  golpista_walk_atlas: 'assets/personagens/golpista/caminhada_atlas.webp', // Golpista Digital (e o Perfil Falso)
  burocrata_walk_atlas: 'assets/personagens/burocrata/caminhada_atlas.webp', // Burocrata-Monstro
  burocrata_ataque: 'assets/personagens/burocrata/ataque.png', // pose de frente lançando papéis (reserva)
  burocrata_poses_atlas: 'assets/personagens/burocrata/poses_atlas.webp', // ataque e fúria em 16 direções
  burocrata_papel: 'assets/personagens/burocrata/papel.png', // folha solta da pose de ataque: o projétil
  fiscal_walk_atlas: 'assets/personagens/fiscal/caminhada_atlas.webp', // Fiscal do Impossível
  funkeiro_walk_atlas: 'assets/personagens/funkeiro/caminhada_atlas.webp', // Funkeiro Raivoso (Morro)
  traficante_walk_atlas: 'assets/personagens/traficante/caminhada_atlas.webp', // Traficante do Morro (Figma)
  chefe_trafico_walk_atlas: 'assets/personagens/chefe_trafico/caminhada_atlas.webp', // Chefe do Tráfico (Figma)
  chefe_trafico_poses_atlas: 'assets/personagens/chefe_trafico/poses_atlas.webp', // ataque e raiva em 16 direções
  traficante_poses_atlas: 'assets/personagens/traficante/poses_atlas.webp', // mira com o fuzil em 16 direções
  funkeiro_poses_atlas: 'assets/personagens/funkeiro/poses_atlas.webp', // fúria de braços abertos em 16 direções
  // Cachorro Caramelo (habilidade): caminhada, mordida e latido em 16 direções × 6 quadros
  caramelo_walk_atlas: 'assets/personagens/caramelo/caminhada_atlas.webp',
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
  funkeiro: 'assets/personagens/funkeiro.webp',
  traficante: 'assets/personagens/traficante.webp',
  chefe_trafico: 'assets/personagens/chefe_trafico.webp',
  politico: 'assets/personagens/politico.png',
  especulador: 'assets/personagens/especulador.png',
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
  predio_a: 'assets/cenario/predios/predio_a.webp',
  predio_b: 'assets/cenario/predios/predio_b.webp',
  predio_c: 'assets/cenario/predios/predio_c.webp',
  predio_d: 'assets/cenario/predios/predio_d.webp',
  // cenário com arte gerada (Figma, IA de imagem) e recortada; medidas em arte_cenario.js
  cen_carro_fusca: 'assets/cenario/orla/carro_fusca.webp',
  cen_carro_brasilia: 'assets/cenario/orla/carro_brasilia.webp',
  cen_carro_uno: 'assets/cenario/orla/carro_uno.webp', // o Uno com escada no teto
  cen_carro_taxi: 'assets/cenario/orla/carro_taxi.webp',
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
  ta: { atlas: 'tele_a_walk_atlas', prefix: 'ta', figureH: 158 },
  tb: { atlas: 'tele_b_walk_atlas', prefix: 'tb', figureH: 158 },
  tc: { atlas: 'tele_c_walk_atlas', prefix: 'tc', figureH: 158 },
  gd: { atlas: 'golpista_walk_atlas', prefix: 'gd', figureH: 157 },
  bm: { atlas: 'burocrata_walk_atlas', prefix: 'bm', figureH: 158 },
  fi: { atlas: 'fiscal_walk_atlas', prefix: 'fi', figureH: 158 },
  pc: { atlas: 'politico_walk_atlas', prefix: 'pc', figureH: 158 },
  fk: { atlas: 'funkeiro_walk_atlas', prefix: 'fk', figureH: 158 },
  tf: { atlas: 'traficante_walk_atlas', prefix: 'tf', figureH: 157 },
  ct: { atlas: 'chefe_trafico_walk_atlas', prefix: 'ct', figureH: 157 },
  pa: { atlas: 'politico_attack_atlas', prefix: 'pa', figureH: 158 }, // mesma escala da caminhada
  // Caramelo: as três na mesma escala. feetRows: onde ficam as patas em cada direção (px da célula de 160);
  // de lado o cachorro pisa mais alto na folha, então o desenho desce até as patas tocarem o chão
  cw: { atlas: 'caramelo_walk_atlas', prefix: 'cw', figureH: 152, feetRows: [153.7, 150.3, 147.5, 148.9, 136.0, 136.0, 143.3, 152.3, 153.0, 148.2, 144.3, 138.1, 129.0, 138.4, 146.1, 151.3] },
  cm: { atlas: 'caramelo_mordida_atlas', prefix: 'cm', figureH: 152, feetRows: [156.9, 156.5, 156.2, 151.0, 131.1, 136.0, 139.5, 145.4, 156.5, 153.0, 149.9, 145.4, 132.9, 138.8, 143.7, 148.9] },
  cl: { atlas: 'caramelo_latido_atlas', prefix: 'cl', figureH: 152, feetRows: [155.1, 151.7, 150.3, 150.6, 136.3, 139.5, 144.0, 152.3, 156.5, 153.0, 150.3, 143.7, 130.1, 140.5, 144.7, 151.7] },
};

/**
 * Poses paradas em 16 direções (montadas por tools/montar-poses.py): uma coluna por estado, célula de
 * 320×200 com os pés na base, na mesma escala do atlas de caminhada (boneco em pé = figureH px).
 */
export const POSE_ATLAS = {
  bp: { atlas: 'burocrata_poses_atlas', prefix: 'bp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 } },
  fkp: { atlas: 'funkeiro_poses_atlas', prefix: 'fkp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 } },
  tfp: { atlas: 'traficante_poses_atlas', prefix: 'tfp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 } },
  ctp: { atlas: 'chefe_trafico_poses_atlas', prefix: 'ctp', cols: 2, rows: 16, cw: 320, ch: 200, figureH: 158, col: { ataque: 0, furia: 1 } },
};
export const POSE_OPTS = { shadowScale: 0.4 };

/** O atlas, se já carregou; senão null (o jogo usa o recorte de pose única). */
export const walkReady = (w) => (w && images[`${w.prefix}_0_0`] ? w : null);

/** Telespectadores animados: atlas de caminhada e pose de acordado de cada roupa. */
export const CROWD_ANIM = {
  a: { walk: WALK_ATLAS.ta, acordado: 'tele_a_acordado' },
  b: { walk: WALK_ATLAS.tb, acordado: 'tele_b_acordado' },
  c: { walk: WALK_ATLAS.tc, acordado: 'tele_c_acordado' },
};

/** Atlas animado da roupa (tint), quando ela tem um e ele já carregou; senão null (usa o recorte). */
export function crowdAnim(tint) {
  const a = CROWD_ANIM[CROWD_SETS[tint % CROWD_SETS.length].anim];
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
  // aim: pose de mira (fuzil no ombro) virada para o ponto travado, enquanto mira e logo depois do tiro
  traficante: { img: 'traficante', walk: WALK_ATLAS.tf, poses: POSE_ATLAS.tfp, aim: 'ataque', fury: true },
  // chefe: ataque (rajada) enquanto mira e atira; raiva (grito no rádio) enquanto chama reforço
  chefe_trafico: { img: 'chefe_trafico', walk: WALK_ATLAS.ct, poses: POSE_ATLAS.ctp, aim: 'ataque', fury: true },
  // throwAnim: quadros 0–2 na preparação, 3 ao soltar a maleta
  politico: { img: 'politico', walk: WALK_ATLAS.pc, throwAnim: WALK_ATLAS.pa },
  // Rival: o Político tingido de laranja até chegar a arte dele; aparece pouco, então não é preparado antes
  rival: { img: 'politico', tint: [240, 122, 26, 0.32], walk: WALK_ATLAS.pc, lazy: true },
  especulador: { img: 'especulador', hardhat: true },
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
};

export const images = {};
let pending = 0;

export function loadImages(onEach) {
  if (typeof Image === 'undefined') return Promise.resolve(images);
  const entries = Object.entries(IMAGES);
  pending = entries.length;
  return Promise.all(entries.map(([id, src]) => new Promise((resolve) => {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => {
      images[id] = im;
      if (id === 'juninho_atlas') sliceAtlas(im, 'ja');
      if (id === 'juninho_walk_atlas') sliceAtlas(im, 'jw');
      for (const w of Object.values(WALK_ATLAS)) if (id === w.atlas) sliceAtlas(im, w.prefix);
      if (id === WALK_ATLAS.cl.atlas) images.caramelo_icone = cropAlpha(images[`${WALK_ATLAS.cl.prefix}_2_3`]); // latindo, de 3/4
      for (const p of Object.values(POSE_ATLAS)) if (id === p.atlas) sliceAtlas(im, p.prefix, p);
      pending--;
      onEach?.(id);
      resolve();
    };
    im.onerror = () => {
      pending--;
      resolve();
    };
    im.src = src;
  }))).then(() => images);
}

export const imagesReady = () => pending === 0;

export const ATLAS = { cols: 6, rows: 16, cw: 200, ch: 160, figureH: 155, hipFrac: 0.585, pivotFrac: 0.53 }; // figura ≈ 155 px numa célula de 160; cintura a 58,5% da altura

/** Corta um atlas em 96 células (canvas) registradas como imagens `<prefixo>_<direção>_<quadro>`. */
function sliceAtlas(im, prefix, g = ATLAS) {
  for (let r = 0; r < g.rows; r++) {
    for (let f = 0; f < g.cols; f++) {
      const c = canvas(g.cw, g.ch);
      c.getContext('2d').drawImage(im, f * g.cw, r * g.ch, g.cw, g.ch, 0, 0, g.cw, g.ch);
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
      if (!flip && art.poses) {
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
    if (dpr) this.dpr = dpr;
  }

  get(imgId, heightCss, opts = {}) {
    const im = images[imgId];
    if (!im) return null;
    const flip = opts.flip ? 1 : 0;
    const flash = opts.flash ? 1 : 0;
    const key = `${imgId}|${Math.round(heightCss)}|${flip}|${flash}|${opts.mode || ''}|${opts.tint ? opts.tint.join() : ''}|${opts.shadowScale || ''}|${opts.noShadow ? 1 : 0}`;
    let c = this.map.get(key);
    if (c) return c;
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
