// Conteúdo e números de balanceamento do protótipo Fase 0.
// TODOS os números são placeholders para playtest — nada aqui é decisão de design.
// Nomes seguem o pacote de conceito v0.1, trocando referências a marcas ou
// instituições reais por equivalentes fictícios (ver docs/ANALISE_CONCEITO_v0.1.md).

export const SESSION = {
  bossAt: 480, // 08:00 — chega o Especulador
  bossWarnAt: 470,
  length: 600, // 10:00 — referência do MVP
  eventTimes: [120, 270, 420], // 3 propostas de Corrupção
  firstWaveAt: 70,
  waveEvery: 70,
  firstEliteAt: 90,
};

export const PLAYER = {
  heightM: 1.8, // altura visual usada para calcular a escala da câmera
  radius: 0.35,
  speed: 3.4, // m/s
  hp: 120,
  magnet: 2.2, // m
  slowMul: 0.6, // velocidade enquanto lento (papelada do Burocrata, multa do Fiscal)
};

// Famílias de inimigos (4) + elite + chefe. `size` é relativo ao protagonista e
// multiplicado pelo ajuste "escala dos inimigos" (padrão 75%, faixa 60–80% do GDD).
export const ENEMIES = {
  // MECH-001 (docs/design/MECH-001_telespectador.md): horda base hipnotizada pela TV Caos.
  // Ao ser derrotado ele ACORDA e vai embora; não morre e não sangra.
  telespectador: {
    name: 'Telespectador Hipnotizado',
    hp: 10, speed: 2.0, dmg: 9, radius: 0.3, size: 1.0, xp: 1,
    behavior: 'chase', wakes: true,
  },
  golpista: {
    name: 'Golpista Digital',
    hp: 14, speed: 2.7, dmg: 8, radius: 0.3, size: 1.0, xp: 2,
    behavior: 'zigzag',
  },
  isca: {
    name: 'Perfil Falso', // duplicata criada pelo Golpista: inofensiva, mas atrai a mira automática
    hp: 1, speed: 2.7, dmg: 0, radius: 0.3, size: 1.0, xp: 0, ttl: 6,
    behavior: 'zigzag',
  },
  burocrata: {
    name: 'Burocrata-Monstro',
    hp: 24, speed: 1.4, dmg: 7, radius: 0.32, size: 1.25, xp: 3, // maior que a horda, menor que os elites
    behavior: 'ranged', range: 5.5, fireEvery: 3.2,
    windupS: 0.45, // mira parado, com a pose de ataque e o "!", antes de soltar
    throwPoseS: 0.25, // a pose de ataque continua este tempo depois de soltar
    // papelada: voa reto até o Juninho; se acertar, machuca e deixa lento (com papel grudado nele)
    shot: { speed: 6, life: 2.6, radius: 0.25, dmg: 6, slowS: 1.5 },
  },
  fiscal: {
    name: 'Fiscal do Impossível', // corta caminho mirando onde você vai estar; encostar gera "multa" (perde XP)
    hp: 30, speed: 2.4, dmg: 5, radius: 0.32, size: 1.05, xp: 4,
    behavior: 'intercept', fine: 4,
  },
  politico: {
    name: 'Político Corrupto',
    hp: 190, speed: 1.6, dmg: 16, radius: 0.45, size: 1.15 / 0.75, xp: 15,
    behavior: 'chase', elite: true,
    // arremessa a maleta de dinheiro em arco: machuca se acertar em cheio; onde cai, abre e vira
    // Propina no chão (pegar continua sendo escolha do jogador: cura e aumenta a Corrupção)
    throw: { range: 7, every: 4.5, windupS: 0.42, releaseS: 0.16, flightS: 0.8, arcM: 1.8, dmg: 10, hitR: 0.5, dropGapM: 1.3, maxOnGround: 6 },
    // quando a maleta cai aberta, quem está perto (horda e inimigos comuns) corre atrás do dinheiro por um instante
    lure: { radiusM: 7, durS: 2.5, speedMul: 1.35, reachM: 0.7 },
    // a maleta abre no ar (fases do pacote): fechada até 35% do voo, meio aberta até 65%, depois aberta
    // soltando notas; ao cair, as notas se espalham (só efeito visual)
    opening: { halfAt: 0.35, openAt: 0.65, trailEveryS: 0.05, burst: 12 },
  },
  rival: {
    name: 'Rival Patrocinado',
    hp: 300, speed: 1.9, dmg: 18, radius: 0.45, size: 1.2 / 0.75, xp: 25,
    behavior: 'chase', elite: true,
  },
  // Subida do Morro (D21): armado, mira com aviso (linha vermelha) antes de atirar; a mira trava no
  // ponto onde o Juninho estava, então dá para sair. Ao ver o Juninho pela primeira vez, solta fogos
  // e chama moradores hipnotizados.
  traficante: {
    name: 'Traficante do PCC do Morro',
    hp: 45, speed: 1.7, dmg: 8, radius: 0.32, size: 1.05, xp: 5,
    behavior: 'shooter', range: 9, keepM: 5.5, aimS: 0.6, fireEvery: 2.6,
    bullet: { speed: 16, life: 1.0, radius: 0.18, dmg: 9 },
    fogosM: 12, fogosPack: 6, raivaS: 0.9, // ao ver o Juninho: para, grita e solta os fogos
  },
  // Subida do Morro: chega perto, para de braços abertos (fúria, o aviso) e parte reto para cima do Juninho.
  // A direção trava quando ele abre os braços: dá para sair da frente.
  funkeiro: {
    name: 'Funkeiro Raivoso',
    hp: 55, speed: 1.8, dmg: 12, radius: 0.34, size: 1.1, xp: 6,
    behavior: 'investida',
    investida: { rangeM: 6, windupS: 0.7, dashS: 0.5, dashMul: 3.4, every: 3.2 },
  },
  // Chefe do morro (laje do topo): rajadas de 3 tiros com a linha de aviso antes; de tempo em tempo para,
  // grita no rádio (pose de raiva) e chama traficantes. A entrega só sai com ele derrubado.
  chefe_trafico: {
    name: 'Chefe do Tráfico',
    hp: 2600, speed: 1.3, dmg: 20, radius: 0.6, size: 1.5, xp: 0,
    behavior: 'chefe', elite: true, boss: true,
    range: 11, keepM: 6, aimS: 0.7, fireEvery: 2.8,
    rajada: { tiros: 3, intervaloS: 0.12, abertura: 0.08 }, // abertura: desvio (rad) entre os tiros
    bullet: { speed: 16, life: 1.0, radius: 0.2, dmg: 9 },
    reforco: { cadaS: 12, gritoS: 1.0, traficantes: 2 },
  },
  especulador: {
    name: 'Especulador Imobiliário',
    hp: 3000, speed: 1.45, dmg: 26, radius: 0.85, size: 1.9 / 0.75, xp: 0,
    behavior: 'boss', elite: true, boss: true,
  },
};

// Poses dos inimigos: quanto tempo a pose de ataque fica depois de encostar no Juninho.
export const ENEMY_POSE = { ataqueS: 0.35 };

// Jogo de zumbi (D27): com "Respingos e manchas" ligado, todo inimigo morre explodindo em sangue e
// pedaços; desligado, a horda volta a acordar (MECH-001), para versões com classificação menor.
export const GORE = {
  gibs: { comum: 5, elite: 9, pesado: 3 }, // pedaços por morte; "pesado": objeto, mototáxi, maleta, explosão
  blood: { comum: 16, elite: 34 }, // gotas de sangue por morte
  maxGibs: 160, // limite de pedaços na tela (desempenho)
  gibLife: 6, // s até sumir
  decalMax: 220, // manchas no chão
  decalLife: 14, // s
};

// MECH-001: o que acontece quando um telespectador acorda.
export const WAKE = {
  walkSpeed: 1.6, // m/s, se afastando do jogador
  fadeS: 1.4, // s até sumir
  maxFx: 60, // limite de "acordados" na tela (desempenho)
  audienceLoss: 0.0008, // milhões de audiência perdidos por telespectador acordado
  audienceFloor: 0.1, // a audiência nunca cai abaixo disso
};

// Mapas (docs/arte/GUIA_DE_PRODUCAO_DE_ARTE.md, seção 2). Medidas em metros; x cresce para a direita.
export const MAPS = {
  orla: {
    name: 'Orla do Desespero', bounded: true,
    minX: -14, // fim do calçadão à esquerda: morro e favela (não dá para entrar)
    // da esquerda para o mar (como em Copacabana): prédios, calçadão, avenida, ciclovia, areia, mar
    avenidaX0: 1.0, // fim do calçadão e começo da avenida ao longo da praia
    avenidaX1: 12.4, // fim da avenida e começo da ciclovia
    sandX: 14, // começo da areia à direita
    maxX: 20, // até onde dá para andar na areia
    seaX: 26, // começo do mar (só visual)
    sandSpeedMul: 0.6, // areia deixa o jogador mais lento
    enemySandMul: 0.8,
    blockLen: 48, // quarteirão: 40 m de calçadão + 8 m de rua transversal
    streetLen: 8,
    propChance: 0.28, // chance de um obstáculo por pedaço de 10×10 m no calçadão
    groundTileM: 10, // a textura de pedra portuguesa cobre 10×10 m
  },
  aberto: { name: 'Arena aberta (teste)', bounded: false, groundTileM: 10 },
};

// Prédios da Orla (borda esquerda, depois do calçadão), desenhados no Figma já no ângulo do jogo
// (projeção paralela, câmera de 55°, giro de 18°): a frente curta fica reta, virada para a rua
// transversal, e a lateral comprida com as lojas sobe quase em pé, junto da beira do calçadão.
// A imagem é desenhada inteira, só na escala. Medidas em px da imagem: canto = pé do canto da frente
// com a lateral; esq = borda esquerda da frente; topo = beira do telhado na frente; fundo = beira do
// telhado no fundo (topo − fundo = comprimento do prédio na tela). alturaM: altura do prédio (m).
export const PREDIOS = {
  x1: -14.6, // beira do calçadão
  k: Math.sin((55 * Math.PI) / 180), // câmera em que os prédios foram desenhados
  modelos: {
    a: { w: 328, h: 1463, canto: [219, 1460], esq: 21, topo: 371, fundo: 76, alturaM: 21 },
    b: { w: 311, h: 1473, canto: [244, 1472], esq: 1, topo: 257, fundo: 64, alturaM: 25 },
    c: { w: 369, h: 1484, canto: [238, 1481], esq: 5, topo: 514, fundo: 29, alturaM: 16 },
    d: { w: 265, h: 1466, canto: [189, 1465], esq: 1, topo: 205, fundo: 35, alturaM: 31 },
  },
};


// Profundidade do chão (mapa reto, câmera olhando para o norte): sombras longas de fim de tarde,
// meio-fio com altura e a névoa quente no alto da tela. dx, dy: quanto a sombra anda no chão (m) por
// metro de altura do objeto (sol baixo vindo do alto à esquerda: a sombra cai para a direita e para baixo).
export const SOMBRA = {
  dx: 0.42,
  dy: 0.28,
  alpha: 0.38, // força da sombra
  desfoquePx: 3,
  maxM: 24, // altura máxima que conta para a sombra (prédios de alturas diferentes dão a borda em degraus)
  baseAlpha: 0.32, // escurecido na base de cada objeto
  meioFioM: 0.18, // altura do meio-fio
  nevoa: { cor: [255, 196, 150], alpha: 0.26, ate: 0.45 }, // névoa no alto da tela (até 45% da altura)
  rodape: { alpha: 0.14, desde: 0.78 }, // escurecido na parte de baixo da tela
};

// Avenida da praia (Orla): carros andando nas quatro faixas, dois sentidos. Atropelam o Juninho e a
// horda. Quem vem por trás do Juninho na faixa dele dá aviso na borda de baixo da tela antes de chegar.
export const AVENIDA = {
  faixas: [{ x: 2.4, sentido: 1 }, { x: 5.0, sentido: 1 }, { x: 8.4, sentido: -1 }, { x: 11.0, sentido: -1 }], // 1 = descendo (para a câmera)
  canteiroX: 6.7, // faixa dupla amarela no meio
  velocidade: [8, 12], // m/s
  intervaloS: [3, 8], // tempo entre um carro e o próximo na mesma faixa
  raioM: 42, // carros só existem perto do Juninho
  dano: 28, // atropelou o Juninho
  empurraoM: 2.2, // joga o Juninho para o lado
  invulnS: 0.8,
  danoHorda: 400, // atropelou zumbi: morre
  hordaInvulnS: 1.2, // o mesmo inimigo só leva outro atropelamento depois disso (antes o chefe morria embaixo do carro)
  avisoM: 16, // carro vindo por trás, nessa distância, na faixa do Juninho: aviso
  modelos: ['fusca', 'brasilia', 'uno'],
  // rodas girando (tools/rodas-carros.py): por vista, a caixa de cada roda na imagem do carro [x, y, w, h] e a
  // linha dela no atlas (<carro>_<sentido>_rodas.webp, um quadro por coluna); quadrosPorM: quadros por metro andado
  rodas: {
    quadros: 4,
    quadrosPorM: 3,
    fusca_norte: [[268, 262, 109, 109, 0], [331, 79, 99, 99, 109]],
    fusca_sul: [[278, 322, 92, 92, 0]],
    brasilia_norte: [[271, 265, 113, 113, 0], [347, 81, 98, 98, 113]],
    brasilia_sul: [[275, 309, 113, 113, 0], [354, 102, 89, 89, 113]],
    uno_norte: [[274, 319, 109, 109, 0], [341, 100, 107, 107, 109]],
    uno_sul: [[279, 348, 104, 104, 0], [344, 176, 105, 105, 104]],
  },
  distanciaM: 2.5, // distância mínima entre dois carros na mesma faixa
  espacoM: 11.4, // um carro novo só entra na faixa com essa folga para o anterior (o trânsito não fica mais denso com carro menor)
  escala: 0.95, // tamanho dos carros da avenida (cabem na faixa de 2,6 m; os parados nas ruas usam CENARIO.carros.escala)
};

// Rota contínua (docs/design/CARREIRA_E_ROTA.md): a Orla tem fim; a escadaria do pé do morro abre no
// nível da meta e leva direto à Subida do Morro, sem corte. Pedaços do morro de baixo para cima.
export const ROUTE = {
  orla: { blocks: 8, startY: 44, startX: -6.5, unlockLevel: 15, gate: { x0: -12.8, x1: -8.6, len: 8 } }, // startX: o Juninho começa no meio do calçadão
  morro: {
    unlockLevel: 25, // nível para fazer a entrega na laje do topo
    stairSlow: 0.75, // escadaria: todo mundo sobe mais devagar
    pieces: [
      { kind: 'viela', x0: -13, x1: -8, len: 24 },
      { kind: 'laje', x0: -18, x1: -4, len: 14 },
      { kind: 'viela', x0: -7, x1: -2, len: 26 },
      { kind: 'escadaria', x0: -6.5, x1: -2.5, len: 14 },
      { kind: 'laje', x0: -12, x1: 2, len: 16 },
      { kind: 'viela', x0: -11, x1: -6, len: 26 },
      { kind: 'escadaria', x0: -10.5, x1: -6.5, len: 14 },
      { kind: 'viela', x0: -17, x1: -7, len: 10 },
      { kind: 'viela', x0: -18, x1: -13, len: 24 },
      { kind: 'laje', x0: -23, x1: -9, len: 16 },
      { kind: 'escadaria', x0: -17, x1: -13, len: 14 },
      { kind: 'laje', x0: -24, x1: -4, len: 22 }, // laje do topo: arena e lugar da entrega
    ],
  },
};

// Lugares de cada quarteirão da Orla (índice 0 = quarteirão do começo) e altura das lajes (m).
export const PLACES = {
  orla: ['boteco', 'nada', 'boteco', 'nada', 'boteco', 'nada', 'boteco', 'nada', 'boteco'], // 'nada': entra um boteco a mais encostado no prédio (cenario.js)
  praia: ['quiosque', 'salva_vidas', 'quiosque', 'nada', 'salva_vidas', 'quiosque', 'nada', 'salva_vidas', 'quiosque'],
  salvaVidasH: 2.8, // torre do salva-vidas
  // desenho da torre (Figma): px da imagem no canto da frente, à esquerda, no chão (embaixo do deque) e px por metro
  salvaVidasArte: { canto: [1, 1218], pxPorM: 159 },
  lajeH: 3.2, // casa com laje no morro
};

// Objetos de cena: o Juninho pega sozinho ao passar perto e arremessa no inimigo mais próximo
// (docs/design/MAPAS_CARACTERIZACAO.md). Cada lugar repõe os seus depois de um tempo, fora da tela.
export const INTERACT = { pickR: 1.0, holdS: 0.25, throwRange: 8, flightS: 0.5, arcM: 2.4, respawnS: 35, respawnMinDistM: 14 };
export const THROWABLES = {
  cadeira: { name: 'Cadeira de plástico', dmg: 28, radius: 1.3 },
  mesa: { name: 'Mesa de plástico', dmg: 45, radius: 1.8 },
  cadeira_praia: { name: 'Cadeira de praia', dmg: 32, radius: 1.5 },
  engradado: { name: 'Engradado', dmg: 36, radius: 1.5 },
  botijao: { name: 'Botijão de gás', dmg: 90, radius: 2.8, selfDmg: 16, explosive: true }, // machuca o Juninho se estiver perto
  banquinho: { name: 'Banquinho de plástico', dmg: 22, radius: 1.2 },
  pneu: { name: 'Pneu velho', dmg: 30, radius: 1.5 },
};
// Curas dos lugares: coco do quiosque, açaí, pastel e milho das barracas.
// Voltam depois de um tempo, fora da tela. O açaí também deixa o Juninho mais rápido por uns segundos.
// Altura de cada objeto arremessável quando está no chão (m, na escala dos personagens, que são
// desenhados com 1,75 m): a imagem gerada é desenhada com essa altura.
export const OBJ_ALTURA = { cadeira: 0.85, mesa: 0.8, engradado: 0.45, botijao: 0.65, cadeira_praia: 0.85, banquinho: 0.5, pneu: 0.4 };
// Os personagens são desenhados maiores que a escala real (para ler bem no celular); os objetos crescem
// junto para não parecerem de brinquedo ao lado deles. Cadeiras ficam a esta distância do centro da mesa.
export const OBJ_ESCALA = 1.4;
export const CADEIRA_DIST = 1.2;
export const HEALS = { coco: 20, marmita: 35, acai: 15, pastel: 30, milho: 12 };
export const HEAL_RESPAWN_S = 45;
export const ACAI_BUFF = { speedMul: 1.25, s: 6 };

// Cenário vivo da rota (docs/design/MAPAS_CARACTERIZACAO.md): carros parados, barracas, bancos, postes,
// placas e lixo no meio do caminho. Tudo determinístico (a mesma rota em toda partida).
export const CENARIO = {
  // carros estacionados nas duas faixas de cada rua transversal (vagas: começo de cada carro em x)
  // medidas reais em metros; escala: os personagens são desenhados maiores que a escala real (para ler
  // bem no celular), então os veículos crescem junto para não parecerem de brinquedo ao lado deles
  carros: { vagaX: [-13.4, -8.0], chance: 0.6, len: 4.0, larg: 1.8, h: 1.45, onibusChance: 0.3, onibusLen: 8.8, onibusLarg: 2.5, onibusH: 3.0, escala: 1.3 },
  buracoChance: 0.4, // buraco no meio da rua, com cones em volta
  livreInicioM: 7, // área livre em volta do começo da partida
  livreJuntaM: 3, // nada sólido perto das passagens entre pedaços da rota
  // por quarteirão da Orla (índice 0 = começo): barraca do meio do calçadão, segunda loja do lado do morro
  // e o carrinho perto da rua
  meio: ['acai', 'pastelaria', 'boteco', 'pastelaria', 'acai', 'boteco', 'pastelaria', 'acai', 'boteco'],
  esquerda2: ['pastelaria', 'acai', 'boteco', 'acai', 'pastelaria', 'boteco', 'acai', 'boteco', 'pastelaria'],
  carrinho: ['milho', 'banca', 'picole', 'milho', 'banca', 'milho', 'picole', 'banca', 'milho'],
  posteCadaM: 12, // postes no meio-fio da avenida
  postes: { avenidaDe: 2, ruaX: -4.8, ruaCima: 0.76, ruaBaixo: 39.6 }, // y no quarteirão (0 = rua de cima); ruaX: postes das ruas transversais
  // faixas do calçadão (x de −14 nos prédios a 1 na avenida): frente das lojas até −11, faixa livre de −11 a
  // −4,6 (nada sólido) e faixa do mobiliário junto do meio-fio da avenida. y no quarteirão (0 = rua de cima)
  // areia (x a partir do começo dela, y no quarteirão): coqueiros na beira da ciclovia, duas filas de
  // guarda-sol desencontradas perto do mar
  areia: {
    coqueiroX: 0.5,
    coqueirosY: [3, 13, 33],
    filas: [[3.0, [6, 18, 30]], [5.0, [12, 24, 36]]],
    quadraY: 31,
    mateY: 9,
  },
  calcadao: {
    faixaX: -2.6, // centro da faixa do mobiliário (barraca, banca, carrinhos, orelhão)
    bancoX: -2.85, // começo do banco (1,9 m)
    lixeiraX: -4.2, // lixeira do lado do banco
    bancos: [9, 29],
    barracaY: 16,
    orelhaoY: 32,
    cantoY: [4.5, 35.5], // banca ou carrinho nas duas esquinas
    garotas: [[-4.2, 1.8, 1], [-0.2, 3.2, 2], [-4.3, 38.4, 3], [-0.3, 37.2, 4]],
  },
  posteAlturaM: 6.4, // altura do poste de luz com o gato de fios
  lixoPorQuarteirao: 34, // sujeira no chão (só desenho): manchas, latinhas, papel, sacos, poças
  santinhos: 10, // santinhos de candidato no chão, por rua e por quarteirão
  bandeirinhasChance: 0.6, // bandeirinhas verde-amarelas atravessando a rua
  morro: { motosPorViela: 2, lixoPorPedaco: 14 },
  // polícia na favela (ambiente): camburão no pé do morro (começo em x) e nas primeiras lajes,
  // policiais na entrada das vielas indicadas (índice do pedaço da rota), barricada numa viela
  policia: { peX0: -7.4, len: 4.6, larg: 2.0, h: 2.1, lajesComCamburao: 2, vielas: [2, 7, 10], barricadaViela: 7 },
};

// Carreira (docs/design/CARREIRA_E_ROTA.md). Gorjetas: ganhas em toda partida, mesmo perdendo;
// compram melhorias permanentes das habilidades básicas, para voltar um pouco mais forte.
export const GORJETAS = { porMinuto: 5, porNivel: 2, porMilAbates: 10, liberarTrecho: 25, chefe: 60, entrega: 80 };
export const MELHORIAS = {
  vida: { name: 'Marmita reforçada', desc: '+10 de vida máxima', step: 10, custo: [40, 70, 110, 160, 230] },
  dano: { name: 'Capacete de aço', desc: '+5% de dano', step: 0.05, custo: [50, 85, 130, 190, 270] },
  velocidade: { name: 'Tênis de corrida', desc: '+3% de velocidade', step: 0.03, custo: [40, 70, 110, 160, 230] },
  recarga: { name: 'Café de garrafa', desc: '−3% de recarga das armas', step: 0.03, custo: [50, 85, 130, 190, 270] },
  ima: { name: 'Mochila maior', desc: '+10% de raio de coleta', step: 0.1, custo: [30, 55, 85, 125, 180] },
};
// Trechos da rota, de baixo para cima no Mapa da Rota. `jogavel`: já existe no protótipo.
export const TRECHOS = [
  { id: 'orla', nome: 'Orla do Desespero', onde: 'Rio · calçadão', jogavel: true,
    estrelas: ['Liberar a Subida do Morro', 'Vencer o Especulador', 'Sem reviver'] },
  { id: 'morro', nome: 'Subida do Morro', onde: 'Rio · favela', jogavel: true,
    meta: `Chegue ao nível ${ROUTE.orla.unlockLevel} na Orla`,
    estrelas: ['Fazer a entrega', 'Entregar antes de 9:00', 'Sem reviver'] },
  { id: 'rodovia_sp', nome: 'Rodovia', onde: 'Rio → São Paulo', meta: 'Faça a entrega no alto do morro' },
  { id: 'centro', nome: 'Centro do Desespero', onde: 'São Paulo', meta: 'Atravesse a rodovia' },
  { id: 'rodovia_capital', nome: 'Rodovia', onde: 'São Paulo → capital', meta: 'Vença o Rapa' },
  { id: 'acordopolis', nome: 'Acordópolis', onde: 'Capital', meta: 'Atravesse a rodovia' },
  { id: 'rodovia_ne', nome: 'Rodovia', onde: 'Capital → Nordeste', meta: 'Vença O Acordão' },
  { id: 'paraiso', nome: 'Paraíso à Venda', onde: 'Praia do Nordeste', meta: 'Atravesse a rodovia' },
  { id: 'tv', nome: 'Rede do Pânico', onde: 'Estúdio de TV', meta: 'Vença o Barão do Guarda-Sol' },
  { id: 'final', nome: 'Entrega Final', onde: 'Sede do aplicativo', meta: 'Vença o Apresentador' },
];

// Diretor de spawn guiado pelo Índice de Caos (0–100).
export const CAOS_BANDS = [
  { min: 0, name: 'NORMALIDADE SUSPEITA' },
  { min: 30, name: 'CRISE' },
  { min: 60, name: 'COLAPSO INSTITUCIONAL' },
  { min: 85, name: 'ESTADO DE CALAMIDADE' },
];

export function caosBand(caos) {
  let band = CAOS_BANDS[0];
  for (const b of CAOS_BANDS) if (caos >= b.min) band = b;
  return band;
}

export const DIRECTOR = {
  caosFromTime: (t) => 100 * Math.pow(Math.min(t, 600) / 600, 1.15) * 0.82,
  targetAlive: (caos) => 26 + caos * 3.8,
  spawnPerSec: (caos) => 2.2 + caos * 0.2,
  hpScale: (t) => 1 + (t / 600) * 3.2, // jogo bem difícil e justo (D25): bot sem melhorias ganha ~25%
  composition(caos) {
    const list = [{ type: 'telespectador', w: 1 }];
    if (caos >= 8) list.push({ type: 'golpista', w: 0.16 });
    if (caos >= 28) list.push({ type: 'burocrata', w: 0.14 });
    if (caos >= 45) list.push({ type: 'fiscal', w: 0.1 });
    return list;
  },
  // ajuste "Elenco completo" (ligado por padrão enquanto a arte entra): todos os inimigos desde 00:00
  castTestComposition: [
    { type: 'telespectador', w: 1 },
    { type: 'golpista', w: 0.3 },
    { type: 'burocrata', w: 0.25 },
    { type: 'fiscal', w: 0.25 },
  ],
  castTestFirstElite: 12, // com o elenco completo, o primeiro Político chega aos 12 s
  castTestEliteEvery: 35,
  // Subida do Morro: moradores hipnotizados e traficantes do PCC (vale com ou sem o elenco completo)
  morroComposition: [
    { type: 'telespectador', w: 1 },
    { type: 'traficante', w: 0.22 },
    { type: 'funkeiro', w: 0.18 },
  ],
  maxBurocratas: 22,
  eliteEvery: (caos) => (caos >= 60 ? 40 : 60),
};

// Armas: `levels[0]` é a base; os demais são incrementos. Nível máximo = levels.length.
export const WEAPONS = {
  // Cada arma tem um padrão próprio (docs/design/HABILIDADES.md): vai e volta, rajada, órbita, cai do céu,
  // arco, aura, rastro, atravessa a tela, ricochete, corrente e companheiro.
  capacete: {
    name: 'Capacete Bumerangue',
    role: 'Vai e volta pela horda, na ida e na volta',
    levels: [
      { dmg: 14, cd: 1.5, count: 1, speed: 11, outT: 0.45, spread: 0.45 },
      { count: 1, desc: '+1 capacete, abrindo em leque' },
      { outT: 0.12, desc: 'Vai mais longe' },
      { count: 1, cd: -0.2, desc: '+1 capacete, recarga menor' },
      { dmg: 10, desc: '+10 de dano' },
    ],
  },
  chinelo: {
    name: 'Chinelo Voador',
    role: 'Rajada em linha reta na direção da horda',
    levels: [
      { dmg: 14, cd: 0.9, count: 2, speed: 15, pierce: 1, gap: 0.08, back: 0, range: 9, cone: 0.5 },
      { count: 1, desc: '+1 chinelo por rajada' },
      { dmg: 5, desc: '+5 de dano' },
      { pierce: 1, desc: 'Atravessa +1 inimigo' },
      { back: 1, cd: -0.15, desc: 'Chinelada de mãe: 2ª rajada no outro lado da horda' },
    ],
  },
  boleto: {
    name: 'Boleto Atrasado',
    role: 'Boletos giram em volta e cobram de quem encosta',
    levels: [
      { dmg: 14, cd: 3.8, count: 2, radius: 1.6, duration: 3.2, spin: 2.6, hitEvery: 0.5 },
      { count: 1, desc: '+1 boleto girando' },
      { radius: 0.35, desc: 'Gira mais longe' },
      { spin: 0.9, dmg: 6, desc: 'Gira mais rápido, +6 de dano' },
      { count: 2, duration: 0.9, desc: '+2 boletos, giram mais tempo' },
    ],
  },
  carimbo: {
    name: 'Carimbo Oficial',
    role: 'INDEFERIDO cai do céu: dano em área e lentidão',
    levels: [
      { dmg: 22, cd: 2.4, count: 1, half: 1.0, slow: 0.5, slowT: 2, fallS: 0.55 },
      { count: 1, desc: '+1 carimbo de cada vez' },
      { half: 0.3, desc: 'Carimbo maior' },
      { cd: -0.6, dmg: 8, desc: 'Cai mais vezes, +8 de dano' },
      { count: 1, slowT: 1, desc: '+1 carimbo, lentidão mais longa' },
    ],
  },
  maleta: {
    name: 'Maleta de Dinheiro',
    role: 'Sobe em arco, cai de lado e abre em notas',
    levels: [
      { dmg: 40, cd: 2.3, count: 1, radius: 1.7, sideM: 3.6, arcM: 3.4, flightS: 0.85 },
      { count: 1, desc: '2ª maleta: uma para cada lado' },
      { radius: 0.5, desc: 'Explosão maior' },
      { dmg: 20, desc: '+20 de dano' },
      { cd: -0.6, sideM: 0.8, desc: 'Mais frequente e vai mais longe' },
    ],
  },
  // Habilidades exclusivas de cada trecho (aparecem só nele; quem pega leva para os próximos)
  picole: {
    name: 'Isopor de Picolé',
    role: 'Deixa poças geladas no caminho: quem pisa fica lento',
    onlyIn: 'orla',
    levels: [
      { dmg: 4, cd: 0.32, radius: 0.75, duration: 2.6, slow: 0.4, freeze: 0, tick: 0.5 },
      { radius: 0.25, desc: 'Poças maiores' },
      { duration: 1.4, desc: 'As poças duram mais' },
      { freeze: 0.2, desc: 'Às vezes congela quem pisa' },
      { dmg: 3, radius: 0.2, desc: '+3 de dano e poças maiores' },
    ],
  },
  mototaxi: {
    name: 'Mototáxi Amigo',
    role: 'Faixa vermelha, buzina e a moto rasga a viela',
    onlyIn: 'morro',
    levels: [
      { dmg: 40, cd: 4.2, speed: 24, lenM: 22, width: 1.0, startM: 9, count: 1, warnS: 0.7 },
      { dmg: 10, desc: '+10 de dano' },
      { width: 0.5, desc: 'Moto mais larga: atropela mais gente' },
      { cd: -1.0, desc: 'Passa mais vezes' },
      { count: 1, dmg: 5, desc: '+1 mototáxi e +5 de dano' },
    ],
  },
  microfone: {
    name: 'Megafone da TV',
    role: 'Círculo sempre ligado: machuca devagar e empurra',
    levels: [
      { dmg: 6, cd: 0.5, radius: 1.9, knock: 2.2 },
      { radius: 0.3, desc: 'Círculo maior' },
      { knock: 1.2, desc: 'Empurra mais longe' },
      { dmg: 3, desc: '+3 de dano' },
      { radius: 0.4, dmg: 2, desc: 'Círculo ainda maior, +2 de dano' },
    ],
  },
  gato: {
    name: 'Gato de Luz',
    role: 'Choque que pula de um inimigo para o outro',
    levels: [
      { dmg: 24, cd: 1.4, count: 1, chain: 3, jumpM: 2.6, range: 7, stunS: 0.35 },
      { chain: 2, desc: 'Pula para +2 inimigos' },
      { jumpM: 0.8, desc: 'Pula mais longe' },
      { dmg: 10, desc: '+10 de dano' },
      { count: 1, desc: 'Dois choques de cada vez' },
    ],
  },
  caramelo: {
    name: 'Cachorro Caramelo',
    role: 'O vira-lata corre, morde dois e volta',
    levels: [
      { dmg: 50, cd: 1.0, count: 1, speed: 9, range: 7, bark: 0, combo: 2, comboM: 2.5 },
      { dmg: 20, desc: 'Mordida mais forte' },
      { speed: 2.5, cd: -0.3, desc: 'Corre mais rápido' },
      { bark: 2.4, desc: 'AU AU!: depois de morder, late e a horda em volta recua' },
      { count: 2, combo: 1, desc: 'A matilha: mais 2 caramelos, e cada um morde 3' },
    ],
  },
  // Evolução (1 no MVP): Capacete nível máximo + Tênis Gasto.
  entrega: {
    name: 'Entrega Expressa',
    role: 'EVOLUÇÃO: 3 capacetes que ricocheteiam',
    evolution: true,
    levels: [{ dmg: 30, cd: 1.1, count: 3, speed: 14, outT: 0.5, bounces: 5 }],
  },
};

// Detalhes dos padrões das armas (não mudam com o nível).
export const WEAPON_FX = {
  orbitaHitR: 0.45, // alcance de cada boleto girando
  pocasMax: 16, // poças de picolé no chão ao mesmo tempo
  congelaS: 1.0, // quanto dura o congelamento da poça
  maletaPierce: 0.5, // dano de quem a maleta atravessa na queda (fração do dano)
  caochegaM: 0.5, // distância da mordida
  caoSegueM: 1.0, // o cachorro anda a essa distância do Juninho
  mordidaS: 0.36, // a mordida inteira (6 quadros da arte): prepara, dá o bote, fecha a boca, recua
  mordidaContato: 0.5, // o dano sai no quadro 3 de 6, quando a boca fecha
  latidoS: 0.45, // o latido do nível 4 (6 quadros), uma vez por corrida, depois da última mordida
  latidoPico: 0.45, // a horda recua no pico do latido
  raioDur: 0.28, // quanto o choque fica visível
};
export const EVOLUTIONS = [
  { from: 'capacete', requires: 'tenis', to: 'entrega' },
];

export const PASSIVES = {
  tenis: { name: 'Tênis Gasto', desc: '+8% de velocidade', max: 5 },
  marmita: { name: 'Marmita da Mãe', desc: '+20 de vida máxima e cura 20', max: 5 },
  mochila: { name: 'Mochila Térmica', desc: '+10% de área', max: 5 },
  cafe: { name: 'Café Requentado', desc: '−7% de recarga', max: 5 },
  ima: { name: 'Ímã de Geladeira', desc: '+25% de raio de coleta', max: 5 },
  raiva: { name: 'Raiva Acumulada', desc: '+10% de dano', max: 5 },
};

export const SLOTS = { weapons: 4, passives: 4 };

// Publicidade (modelo gratuito com anúncios). Valores iniciais para teste, não metas.
export const ADS = {
  reviveHpFrac: 0.5, // volta com 50% da vida
  reviveClearRadius: 3.5, // m: inimigos comuns em volta são derrubados
  reviveInvuln: 2.5, // s de invulnerabilidade depois de voltar
  rerollsPerRun: 2, // trocas de cartas por anúncio, por partida
  interstitial: {
    graceRuns: 1, // nenhum intersticial depois da 1ª partida da sessão
    minGapSec: 180, // no mínimo 3 min entre intersticiais
    skipAfterRewardedSec: 90, // quem viu um recompensado há pouco não leva intersticial
    skippableAfterSec: 5, // botão de fechar aparece após 5 s
  },
};

export const xpToNext = (level) => Math.floor(5 + level * 5 + Math.pow(level, 1.6));

// Propostas de Corrupção: sempre duas saídas com ganho real, custo explícito.
export const EVENTS = [
  {
    id: 'patrocinio',
    title: 'Patrocínio da Construtora',
    text: 'Uma construtora quer o logo dela na sua mochila. "Só um apoio institucional."',
    accept: {
      label: 'Aceitar patrocínio',
      good: ['+40% de dano até o fim do turno'],
      bad: ['Corrupção +30', 'Caos +10'],
    },
    refuse: {
      label: 'Recusar',
      good: ['Recebe 20% menos dano'],
      bad: ['Um Rival Patrocinado vem atrás de você'],
    },
  },
  {
    id: 'emenda',
    title: 'Emenda de Última Hora',
    text: 'Um assessor oferece verba extra, sem perguntas. A conta chega depois — para todo mundo.',
    accept: {
      label: 'Pegar a verba',
      good: ['+2 melhorias agora'],
      bad: ['Corrupção +25', 'Inimigos com +25% de vida'],
    },
    refuse: {
      label: 'Recusar',
      good: ['Cura toda a vida'],
      bad: [],
    },
  },
  {
    id: 'acordao',
    title: 'O Grande Acordo',
    text: 'O Especulador propõe um acordo de bastidor: ele chega "mais fraco", você não pergunta por quê.',
    accept: {
      label: 'Fechar o acordo',
      good: ['Chefe chega com 40% menos vida'],
      bad: ['Corrupção +30', 'Caos +15 agora'],
    },
    refuse: {
      label: 'Recusar',
      good: ['+20% de dano contra elites e chefe'],
      bad: [],
    },
  },
];

export const VERDICTS = [
  { max: 0, title: 'INOCENTE (POR ENQUANTO)' },
  { max: 39, title: 'DEU UM JEITINHO' },
  { max: 79, title: 'PARCEIRO DO ESQUEMA' },
  { max: Infinity, title: 'VIROU O SISTEMA' },
];

export function verdictFor(corruption) {
  return VERDICTS.find((v) => corruption <= v.max);
}

// Falas da TV Caos (emissora fictícia). A sátira mira estruturas, não vítimas.
export const TV = {
  start: ['MAIS UM DIA NORMAL NA ORLA DO DESESPERO. CALOR DE 41 GRAUS', 'ENTREGADOR INICIA TURNO. APP PROMETE "FLEXIBILIDADE"'],
  firstKill: ['TELESPECTADOR ACORDA E MUDA DE CANAL. EMISSORA CHAMA DE "INCIDENTE ISOLADO"'],
  multikill: ['ENTREGADOR DESLIGA A PLATEIA INTEIRA. EMISSORA PEDE CALMA', 'AUDIÊNCIA EM QUEDA: ENTREGADOR ACORDA MAIS UM QUARTEIRÃO'],
  lowHp: ['AO VIVO: ENTREGADOR À BEIRA DO COLAPSO. AUDIÊNCIA DISPARA', 'APP AVISA: ATRASO PODE GERAR PUNIÇÃO'],
  levelUp: ['ENTREGADOR SE ESPECIALIZA. MERCADO EXIGE MAIS', 'NOVA HABILIDADE! AINDA SEM CARTEIRA ASSINADA'],
  burocrata: ['NOVA EXIGÊNCIA: FORMULÁRIO EM TRÊS VIAS'],
  fiscal: ['ENTREGADOR MULTADO POR EXCESSO DE ESFORÇO', 'FISCAL APLICA MULTA. MOTIVO: "SIM"'],
  elite: ['POLÍTICO APARECE PARA FOTO. TRAZ MALETA'],
  unlock: ['MAPA LIBERADO: SUBIDA DO MORRO. PEDIDO NO ALTO DA LAJE', 'ENTREGADOR LIBERADO PARA SUBIR O MORRO. GPS DESISTE'],
  morro: ['ENTREGADOR COMEÇA A SUBIDA. APP CALCULA 3 MINUTOS (MENTIRA)'],
  chefe: ['CHEFE DO TRÁFICO DECRETA: PIZZA SÓ PASSA COM AUTORIZAÇÃO DA FIRMA'],
  chefeRadio: ['CHEFE CHAMA REFORÇO NO RÁDIO. MORADORES FECHAM AS JANELAS'],
  chefeVencido: ['CHEFE DO TRÁFICO CAI NA LAJE. ENTREGADOR SEGUE COM A PIZZA'],
  fogos: ['FOGOS NO MORRO: CHEGOU ENCOMENDA', 'SOLTARAM FOGOS. O MORRO INTEIRO SABE QUE ELE CHEGOU'],
  botijao: ['BOTIJÃO VOA NA ORLA. PREÇO DO GÁS SOBE DE NOVO', 'EXPLOSÃO DE BOTIJÃO. GOVERNO PROMETE "VALE-GÁS" PARA 2040'],
  objeto: ['ENTREGADOR ARREMESSA CADEIRA DE BOTECO. DONO COBRA A MESA'],
  atropelado: ['ENTREGADOR É ATROPELADO NA AVENIDA DA PRAIA. MOTORISTA NÃO PARA', 'CARRO PASSA POR CIMA DE ENTREGADOR. APP DESCONTA A ENTREGA ATRASADA'],
  acai: ['ENTREGADOR PARA PARA TOMAR AÇAÍ NO MEIO DO APOCALIPSE', 'AÇAÍ COM GRANOLA: O ÚNICO SERVIÇO PÚBLICO QUE FUNCIONA'],
  entrega: ['ENTREGA FEITA NO ALTO DO MORRO: UMA PIZZA DE CALABRESA. GORJETA: NENHUMA'],
  maleta: ['POLÍTICO ARREMESSA MALETA. ASSESSORIA FALA EM "DOAÇÃO ESPONTÂNEA"', 'MALETA VOANDO NA ORLA. DONO NÃO SE IDENTIFICA'],
  lure: ['PLATEIA ESQUECE A NOVELA E CORRE ATRÁS DO DINHEIRO', 'MALETA ABERTA NO CALÇADÃO. HIPNOSE SUSPENSA POR TEMPO INDETERMINADO'],
  propina: ['ENTREGADOR É FLAGRADO COM DINHEIRO VIVO. "ERA GORJETA", DIZ'],
  wave: (dir) => [`PLATEIA HIPNOTIZADA SE APROXIMA PELO ${dir}`, `FIM DA NOVELA: TELESPECTADORES SAEM PELO ${dir}`],
  bossWarn: ['URGENTE: ESPECULADOR ANUNCIA "REVITALIZAÇÃO" DA ÁREA'],
  boss: ['MORADORES? QUE MORADORES? ESPECULADOR CHEGA AO CENTRO'],
  lot: ['LOTE VENDIDO. ÁREA AGORA É PRIVADA', 'MAIS UM TERRENO "REVITALIZADO"'],
  accept: ['ACORDO FECHADO! ENTREGADOR AGORA É "PARCEIRO"'],
  revive: ['VOLTAMOS DO INTERVALO. ENTREGADOR, INEXPLICAVELMENTE, CONTINUA DE PÉ'],
  refuse: ['ENTREGADOR RECUSA PROPOSTA. INVESTIGADO POR SER HONESTO DEMAIS'],
  rival: ['RIVAL PATROCINADO ENTRA NA DISPUTA. LOGO BEM VISÍVEL'],
  death: ['ENTREGADOR NÃO RESISTE. APP DESCONTA A ENTREGA'],
  victory: ['ESPECULADOR SOFRE DESPEJO. TERRENO VOLTA A SER... DE NINGUÉM'],
};
