// Conteúdo e números de balanceamento do protótipo Fase 0.
// TODOS os números são placeholders para playtest — nada aqui é decisão de design.
// Nomes seguem o pacote de conceito v0.1, trocando referências a marcas ou
// instituições reais por equivalentes fictícios (ver docs/ANALISE_CONCEITO_v0.1.md).

export const SESSION = {
  bossAt: 480, // 08:00 — chega o chefão (Monstrão)
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
    hp: 1400, speed: 1.3, dmg: 20, radius: 0.6, size: 1.5, xp: 0, // a vida cresce com o tempo no trecho (uns 6 mil aos 8 min)
    behavior: 'chefe', elite: true, boss: true,
    range: 11, keepM: 6, aimS: 0.7, fireEvery: 2.8,
    rajada: { tiros: 3, intervaloS: 0.12, abertura: 0.08 }, // abertura: desvio (rad) entre os tiros
    bullet: { speed: 16, life: 1.0, radius: 0.2, dmg: 9 },
    reforco: { cadaS: 12, gritoS: 1.0, traficantes: 2 },
    fases: { tirosMais: 1, cadenciaMul: 0.8, reforco: [[], ['traficante', 'funkeiro'], ['traficante', 'traficante', 'funkeiro']] },
    janela: { danoMul: 2 }, // hora de bater: parado mirando, atirando ou gritando no rádio, leva o dobro de dano
  },
  // Morro (D37): o Cracudo vem em bando, cambaleando, e cata o XP do chão antes do Juninho; quando cai, solta o que
  // catou. catarM: até onde ele enxerga XP; catarS: agachado catando
  cracudo: {
    name: 'Cracudo',
    hp: 22, speed: 1.5, dmg: 5, radius: 0.3, size: 1.0, xp: 2,
    behavior: 'cata', catarM: 9, pegaM: 0.8, catarS: 0.9, bando: [2, 4], cambaleia: 0.6,
  },
  // Trombadinha: corre até o Juninho, encosta, rouba XP e foge correndo com o celular; derrubado na fuga, devolve
  trombadinha: {
    name: 'Trombadinha',
    hp: 26, speed: 3.4, dmg: 3, radius: 0.3, size: 1.0, xp: 3,
    behavior: 'trombada', roubaXp: 4, roubaPorNivel: 1, fugaS: 6, fugaMul: 1.35,
  },
  // Modo Horda: aos 30 minutos chega o Rabecão; não morre e não para (D44)
  rabecao: {
    name: 'Rabecão',
    hp: 1e9, speed: 6.4, dmg: 400, radius: 1.4, size: 2.2, xp: 0,
    elite: true, invencivel: true,
  },
  // Monstrão (D47): o chefão da Orla, fisiculturista gigante que vem para cima (monstrao.js). Todo golpe tem
  // aviso no chão; depois da investida faz pose e, se bateu em carro, poste ou barraca, fica tonto: a hora de bater
  monstrao: {
    name: 'Monstrão',
    hp: 4500, speed: 1.5, dmg: 14, radius: 1.1, size: 3.0, xp: 0, // dmg: encostar nele (o perigo são os golpes)
    behavior: 'monstrao', elite: true, boss: true,
    alcanceM: 16, // só começa um golpe com o Juninho até esta distância
    pausaS: [2.0, 1.6, 1.2], // entre um golpe e outro, por fase
    furiaVel: 1.2, // fase 3: fica vermelho e mais rápido
    escolha: { investida: 0.55 }, // o resto é a anilha; da fase 2, o carro entra antes
    // seguidas: investidas em sequência por fase; quiques: quantas vezes quica na borda (fase 3)
    investida: { avisoS: 0.8, avisoSeguidaS: 0.5, vel: 15, distM: 15, largM: 2.5, dano: 26, empurraM: 2.2, hordaDano: 80, voo: 9, poseS: 1.5, tontoS: 2.0, seguidas: [1, 3, 3], quiques: [0, 0, 2] },
    // agachamento: quando o Juninho cola nele; na fase 3 solta o anel de choque (brecha: abertura em rad)
    agacha: {
      pertoM: 3.5, avisoS: 0.8, raioM: 3.2, dano: 16, empurraM: 2.5, hordaDano: 60, voo: 8, poseS: 0.5,
      anel: { velM: 9, alcanceM: 12, largM: 0.9, brecha: 1.0, dano: 14 },
    },
    anilha: { avisoS: 0.6, lead: 0.5, vel: 9, distM: 16, raioM: 0.45, dano: 15, hordaDano: 40 },
    carro: { chance: 0.3, avisoS: 0.9, lead: 0.9, vooS: 0.9, alturaM: 3.4, arcoM: 3, raioM: 3.0, dano: 30, hordaDano: 120, arte: ['cen_carro_fusca', 'cen_carro_brasilia', 'cen_carro_uno', 'cen_carro_taxi'] },
    reforco: { cadaS: [14, 12, 10], horda: 8, raioM: 9.5 }, // a turma da academia (por enquanto, a horda)
    fases: { reforco: [[], [], []] },
    janela: { danoMul: 2 }, // pose de fisiculturista e tonto: leva o dobro de dano
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
// Casas da favela (docs/arte/PEDIDO_FAVELA.md, pacote v2), desenhadas no ângulo do jogo por cima dos
// gabaritos de tools/gabaritos-favela.py (docs/arte/gabaritos_favela/gabaritos.json). A imagem entra
// inteira, só na escala: 150 px por metro. origem: px da imagem onde fica o canto da frente da caixa, no
// chão (à esquerda; na parede da viela, o pé da parede virada para a viela). w, d, h: a caixa (m).
export const FAVELA = {
  minimapa: false, // mapa da favela no canto da tela (D52: o autor tirou; true traz de volta)
  pxPorM: 150,
  pecas: {
    casa_laje_dir: { origem: [342.37, 1246.81], w: 5, d: 5, h: 3.2 },
    casa_laje_esq: { origem: [537.37, 1246.81], w: 5, d: 5, h: 3.2 },
    fachada_a: { origem: [308.65, 1183.09], w: 4, d: 5, h: 3 },
    fachada_b: { origem: [353.65, 1678.09], w: 4, d: 5, h: 6 },
    fachada_c: { origem: [398.65, 2173.09], w: 4, d: 5, h: 9 },
    barraco_a: { origem: [291.57, 995.27], w: 3, d: 3, h: 3.5 },
    barraco_b: { origem: [291.57, 995.27], w: 3, d: 3, h: 3.5 },
    // módulos de 6 m ao longo da viela: à esquerda a parede virada para a viela (a caixa fica a oeste do
    // pé da parede); à direita só o telhado e a frente (a caixa fica a leste)
    parede_viela_esq: { origem: [568.72, 1305.96], w: 3, d: 6, h: 3, oeste: true },
    telhado_viela_dir: { origem: [568.72, 1305.96], w: 3, d: 6, h: 3 },
  },
  // casas de frente no alto de cada pedaço (fundo das pracinhas, ponta das vielas), sorteadas
  fundo: ['fachada_a', 'fachada_b', 'fachada_a', 'fachada_c', 'fachada_b'],
  fundoBaixo: ['fachada_a'], // à direita da passagem (a leste do pedaço de cima): só casa baixa
  // o que entra ao longo de cada lado do caminho e o peso de cada peça no sorteio. À direita só casa baixa:
  // nesta câmera, casa alta a leste da viela esconderia a viela atrás dela. Barraco só nas vielas mais altas.
  ladoEsq: { parede_viela_esq: 4, fachada_a: 1, fachada_b: 1.4, fachada_c: 0.9, barraco_a: 0.8, barraco_b: 0.8 },
  ladoDir: { telhado_viela_dir: 4, fachada_a: 1.4, barraco_a: 1, barraco_b: 1 },
  // variações de arte de cada peça (mesma caixa, outro desenho): arquivo <peça>_<letra>.webp em
  // assets/cenario/favela/, com a linha fav_<peça>_<letra> em IMAGES (sprites.js). Vazio: só a arte principal.
  // Pedido em docs/arte/PEDIDO_FAVELA_VARIACOES.md.
  variantes: { parede_viela_esq: [], telhado_viela_dir: [], fachada_a: [], fachada_b: [], fachada_c: [], barraco_a: [], barraco_b: [], casa_laje_dir: [], casa_laje_esq: [] },
  barracoDesde: 8, // índice do pedaço da rota a partir do qual entram barracos (vielas mais altas)
  barracoChance: 0.5,
  vaoMinM: 0.8, // vão menor que isso no alto do pedaço fica sem casa
  // fileiras de trás, para os lados ficarem cheios até a borda da tela: quantas e de quanto em quanto (m).
  // À esquerda, casas de qualquer altura (ficam atrás de tudo); à direita, só baixas (não escondem a viela).
  fileirasTras: 3,
  passoFileiraM: 4,
  trasEsq: { parede_viela_esq: 3, fachada_a: 1, fachada_b: 1.6, fachada_c: 1.1, barraco_a: 0.6, barraco_b: 0.6 },
  trasDir: { telhado_viela_dir: 3, fachada_a: 1.4, barraco_a: 0.8, barraco_b: 0.8 },
};

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
  meioFioM: 0.35, // o muro do fim da Orla abre a avenida mais esta folga dos dois lados (o meio-fio)
  foraM: 30, // a avenida segue esses metros depois do muro do fim e da obra do começo; os carros saem por ela
  livreM: 14, // e nenhuma casa da favela fica em cima dela até essa folga além do fim
  calcadaM: 1.6, // depois do muro do fim, do lado do morro, a calçada da avenida (entre as casas e o meio-fio)
  someM: 12, // os carros somem aos poucos nos últimos metros da avenida, no escuro
  // (o Juninho e a horda não passam: a área de andar acaba no muro)
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
  orla: { blocks: 8, startY: 44, startX: -6.5, gate: { x0: -12.8, x1: -8.6, len: 8 } }, // startX: o Juninho começa no meio do calçadão
  morro: {
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
// Juninho em cima da laje (ou na escada dela): a horda cerca a casa, colada nas paredes; de tempos em tempos um
// é sorteado para subir pela escada, no máximo maxSubindo de cada vez. O chefão sempre sobe.
// vaoM: a casa fica afastada das paredes da pracinha (fundo e lado), para a horda dar a volta e cercar;
// chegouM: a essa distância do lugar dela no cerco, o inimigo para (sem empurrar a parede e tremer).
// Reações do cenário (pedido do autor, 07/11/2026). Carro: um veículo a menos de gatilhoM da borda de uma
// explosão explode também, depois de um atraso, e pode disparar outro (reação em cadeia); fica queimado e
// soltando fumaça. tipos: tamanho da explosão de cada veículo. Poste: o Gato de Luz acertando a menos de
// gatilhoM de um poste (ou dos fios do gatonet) faz ele descarregar do alto (altura em tipos) um raio enorme
// em até `alvos` inimigos a até raioM; depois recarrega.
export const REACOES = {
  carro: {
    gatilhoM: 2.4, raioM: 3.4, dano: 90, voo: 7, atrasoS: [0.15, 0.45], danoJuninho: 18, fumacaS: 10, fumacaCadaS: 0.9,
    tipos: { carro: 1, onibus: 1.35, camburao: 1.15, moto: 0.6 },
  },
  poste: { gatilhoM: 3.2, raioM: 7, alvos: 6, dano: 60, travaS: 0.6, recargaS: 6, tipos: { poste: 6.0, fios: 5.2 } },
};

export const LAJE = { subirChance: 0.12, maxSubindo: 3, sorteioS: [3, 6], vaoM: 1.6, chegouM: 0.35 };
export const INTERACT = { pickR: 1.0, holdS: 0.25, throwRange: 8, flightS: 0.5, arcM: 2.4, respawnS: 35, respawnMinDistM: 14 };
export const THROWABLES = {
  cadeira: { name: 'Cadeira de plástico', dmg: 28, radius: 1.3, som: 'quebra_plastico' },
  mesa: { name: 'Mesa de plástico', dmg: 45, radius: 1.8, som: 'quebra_plastico' },
  cadeira_praia: { name: 'Cadeira de praia', dmg: 32, radius: 1.5, som: 'quebra_madeira' },
  engradado: { name: 'Engradado', dmg: 36, radius: 1.5, som: 'quebra_madeira' },
  botijao: { name: 'Botijão de gás', dmg: 90, radius: 2.8, selfDmg: 16, explosive: true, som: 'explosao' }, // machuca o Juninho se estiver perto
  banquinho: { name: 'Banquinho de plástico', dmg: 22, radius: 1.2, som: 'quebra_plastico' },
  pneu: { name: 'Pneu velho', dmg: 30, radius: 1.5, som: 'baque' },
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
  // bem pequenas (D39): o jogo continua difícil; o progresso vem mais das melhorias de opção
  vida: { name: 'Marmita reforçada', desc: '+5 de vida máxima', step: 5, custo: [40, 80, 130, 200] }, // até +20
  dano: { name: 'Capacete de aço', desc: '+2,5% de dano', step: 0.025, custo: [50, 100, 160, 240] }, // até +10%
  velocidade: { name: 'Tênis de corrida', desc: '+2% de velocidade', step: 0.02, custo: [40, 90, 150] }, // até +6%
  recarga: { name: 'Café de garrafa', desc: '−2% de recarga das armas', step: 0.02, custo: [50, 110, 180] }, // até −6%
  ima: { name: 'Mochila maior', desc: '+5% de raio de coleta', step: 0.05, custo: [30, 55, 85, 125, 180] }, // até +25%
  // melhorias de opção: dão escolha, não força
  armaInicial: { name: 'Bolsa de ferramentas', desc: 'No começo de cada trecho, escolhe uma arma a mais', opcao: true, custo: [150] },
  troca: { name: 'Contato no app', desc: '1 troca de cartas por partida, sem anúncio', opcao: true, custo: [120] },
  pista: { name: 'Rádio da polícia', desc: 'O helicóptero da TV já aparece no sinal do covil', opcao: true, custo: [100] },
};
// Carreira (D39, docs/design/CARREIRA_E_ROTA.md): cada trecho tem o seu Caos (0 a 100%), um chefão
// que mora num covil do mapa e guarda a saída, e pistas que crescem em vez de setas.
export const CARREIRA = {
  caosTempoS: 600, // sozinho, só com o tempo, o Caos do trecho chega a 100% nesse tempo
  caosExp: 1.15,
  // os abates somam até caosAbateMax pontos, cada vez menos (sem isso, mais abates traziam mais horda,
  // que dava mais abates, e o Caos chegava a 100% em 3 minutos): quem joga bem chega antes, em ~6–7 min
  caosAbateMax: 30,
  caosAbateK: 4000, // abates para chegar a 63% do máximo
  pressaoMul: 0.82, // a horda (quantidade, ritmo, elenco) segue o tempo e as propostas nessa escala, a mesma de antes da D39
  sinal: 85, // Calamidade: o covil começa a dar sinal (barulho e tremor perto dele)
  sinalPertoM: 18, // até onde se ouve o barulho do covil
  barulhoS: 1.6, // de quanto em quanto tempo o covil faz barulho
  covilPertoM: 10, // com o covil aberto, o chefão sai quando o Juninho chega a essa distância
  pistaHordaS: 45, // aberto o covil, se o Juninho não chega, a horda começa a andar para lá
  hordaChamadaFrac: 0.35, // parte dos inimigos novos que anda para o covil
  hordaChamadaPertoM: 6, // o chamado só vale enquanto o Juninho estiver longe deles
  heli: { raioM: 3.5, voltaS: 5, alturaTela: 0.42 }, // holofote do helicóptero da TV circulando o covil
  fases: [0.66, 0.33], // vida do chefão em que ele muda de fase
  reforcoHorda: 18, // assessoria: horda chamada em volta do chefão a cada fase nova
  quedaRaioM: 16, // ao cair, o sinal da TV cai junto: a horda em volta desaba
  chefaoAlcanceM: 14, // longe disso, o chefão corre atrás do Juninho (não dá para fugir dele para sempre)
  chefaoCorreMul: 2.4,
  portaCaiS: 0.9, // o tapume cai
  // obra no fim da praia (covil do Monstrão): no último quarteirão, encostada nos prédios, de frente para a escadaria
  obra: { x0: -13.6, x1: -6.2, dy0: 1.2, fundoM: 10.5 },
  recomeco: 'ATUALIZAÇÃO OBRIGATÓRIA DO APLICATIVO: SEUS ITENS EXPIRARAM',
  trechoHpMul: { orla: 1, morro: 1.25 }, // cada trecho começa mais duro que o anterior
};

// Modo Horda (D44, docs/design/MODOS_E_RANKING.md): um mapa já conquistado, sobreviver o máximo que der.
export const HORDA = {
  chefaoVoltaS: 300, // derrubado, o chefão volta depois desse tempo...
  chefaoHpMais: 0.5, // ...com +50% de vida a cada volta
  durezaPorMin: 0.15, // passados os 100%, a horda fica 15% mais resistente a cada minuto
  criseCadaS: 90, // crises sorteadas entre as do mapa
  achadosCadaS: 120, // isopores reaparecem nos esconderijos
  isopores: 3,
  rabecaoS: 1800, // aos 30 minutos chega o Rabecão, que não morre
  gorjetaMul: 0.7, // gorjeta um pouco menor que a da Carreira
};
// Desafio da Semana (D43): uma partida de Horda igual para todo mundo, com a regra da semana.
export const DESAFIO = {
  trecho: 'orla',
  regras: [
    { id: 'apagao', nome: 'Semana do Apagão', desc: 'O apagão chega e a luz não volta' },
    { id: 'ressaca', nome: 'Semana da Ressaca', desc: 'A ressaca chega e o mar não recua' },
    { id: 'feriadao', nome: 'Feriadão', desc: 'A horda vem em dobro' },
    { id: 'chinelada', nome: 'Semana da Chinelada', desc: 'Começa com o Chinelo no nível 3' },
  ],
};

// Abertura do jogo (D39): a Orla começa normal até o sinal da TV pegar.
export const ABERTURA = {
  pessoas: 28, // gente passeando em volta do Juninho
  pertoM: 14,
  passeioMs: 0.9,
  plantaoS: 10, // a TV anuncia o sinal novo
  sinalS: 20, // o sinal pega
  transfS: 1.2, // a transformação (6 quadros da arte): trava, o olho acende, os braços sobem
  viraS: 4, // todas viram horda nesse tempo, a mais perto do Juninho por último
  lentoMul: 0.6, // logo depois, só telespectadores lentos (o tutorial sem texto)
  lentosS: 30,
};

// Crises da cidade (D39): em 30% e 60% do Caos do trecho; a TV avisa antes e nada fecha a passagem.
export const CRISES = {
  avisoS: 20, // a TV avisa esse tempo antes
  porTrecho: {
    orla: [{ id: 'ressaca', caos: 30, duracaoS: 35 }, { id: 'apagao', caos: 60, duracaoS: 35 }],
    morro: [{ id: 'baile', caos: 30, duracaoS: 30 }, { id: 'curto', caos: 60, duracaoS: 35 }],
  },
  // Ressaca: o mar avança até perto da ciclovia, a areia molhada deixa lento e as ondas derrubam a horda
  ressaca: { avancaS: 5, aguaSobraM: 1.5, lentoMul: 0.6, ondaS: 5, ondaCorreS: 1.0, ondaDano: 18, ondaEmpurra: 7, ondaEmpurraJuninho: 1.2 },
  // Apagão: a tela escurece; só a luz dos postes e em volta do Juninho; os olhos da horda brilham
  apagao: { luzPosteM: 4.5, luzJuninhoM: 3.4, escuro: 0.8, achadoLongeM: 14, rampaS: 2 },
  // Baile na laje: a horda em volta para para dançar, mas chega uma leva de Funkeiros
  baile: { raioM: 22, funkeiros: 4 },
  // Gato de luz em curto: faíscas perto do Juninho estalam (aviso) e dão o choque, nele também
  curto: { cadaS: 1.1, maxFaiscas: 5, pertoM: 7, avisoS: 0.8, choqueS: 0.35, raioM: 1.4, danoJuninho: 12, danoHorda: 30 },
};

// Achados pelo caminho (D40): esconderijos com pista e sem seta; nada se compra nem se abre com anúncio.
export const ACHADOS = {
  isopores: 5, // por trecho, sorteados entre os esconderijos
  pegaM: 0.9, // encostar abre
  cavarS: 2, // enterrado na areia: parar em cima esse tempo para cavar
  isoporGorjeta: 8,
  isoporCura: 20,
  cofreGorjeta: 20,
  // cartas do cofre: chance de 5 e de 3 (o resto é 1); sobem com o Caos na hora de abrir
  cofre: { chance5: 0.08, chance5Caos: 0.27, chance3: 0.3, chance3Caos: 0.15 },
  bichos: ['AVESTRUZ', 'ÁGUIA', 'BURRO', 'BORBOLETA', 'CACHORRO', 'CABRA', 'CARNEIRO', 'CAMELO', 'COBRA', 'COELHO',
    'CAVALO', 'ELEFANTE', 'GALO', 'GATO', 'JACARÉ', 'LEÃO', 'MACACO', 'PORCO', 'PAVÃO', 'PERU', 'TOURO', 'TIGRE',
    'URSO', 'VEADO', 'VACA'],
  brilhoM: 14, // até onde se vê o brilho de um achado escondido
  faroM: 8, // o Caramelo fareja isopor e cofre a essa distância
  faroReliquiaM: 4, // a relíquia, só bem de perto
  faroCadaS: 6, // e late de novo a cada tanto, enquanto estiver perto
};
// Relíquias (D40): uma por trecho, sempre no mesmo lugar, já no máximo, numa vaga só dela.
export const RELIQUIAS = {
  altinha: {
    nome: 'Bola da Altinha', onde: 'orla',
    desc: 'A bola quica de inimigo em inimigo, sem parar',
    dmg: 28, speed: 13, alcanceM: 7, pulaM: 6, voltaM: 1.2,
  },
  // no carrinho atrás do Juninho; a cada cadaS o grave solta uma onda que corre até raioM (velM, m/s),
  // bate em quem ela passa e empurra para fora (o chefão só leva o dano)
  paredao: {
    nome: 'Paredão de Som', onde: 'morro',
    desc: 'O grave solta uma onda que empurra a horda para longe',
    cadaS: 2.4, raioM: 6.5, velM: 16, dmg: 26, empurra: 16, segueM: 1.5, // empurra: ~1,8 m
  },
};

// Trechos da rota, de baixo para cima no Mapa da Rota (o que não foi descoberto aparece como ???).
// `jogavel`: já existe no protótipo. A segunda parte (Nordeste, TV, sede do app) vem depois (D42).
export const TRECHOS = [
  { id: 'orla', nome: 'Orla do Desespero', onde: 'Rio · calçadão', jogavel: true,
    estrelas: ['Derrubar o chefão', 'Achar a relíquia', 'Sem reviver'] },
  { id: 'morro', nome: 'Subida do Morro', onde: 'Rio · favela', jogavel: true,
    estrelas: ['Derrubar o chefão e entregar', 'Achar a relíquia', 'Sem reviver'] },
  { id: 'sp', nome: 'São Paulo', onde: 'Rodovia e Centro do Desespero' },
  { id: 'brasilia', nome: 'Brasília', onde: 'Rodovia e a Esplanada' },
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
    { type: 'cracudo', w: 0.05 }, // vem em bando (ENEMIES.cracudo.bando)
    { type: 'trombadinha', w: 0.06 },
  ],
  maxBurocratas: 22,
  eliteEvery: (caos) => (caos >= 60 ? 40 : 60),
};

// Horda do Morro (D37): moradores hipnotizados com roupa de favela (listrado, moça, moleque, senhor, senhora,
// tiozinho), cada um com caminhada, ataque e raiva (sprites.js, CROWD_ANIM_MORRO)
export const HORDA_MORRO = { roupas: 6 };

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
    role: 'Cai aberta, a horda corre atrás do dinheiro e ela explode',
    levels: [
      // distM: onde cai, na direção da horda; iscaR/iscaS: até onde e por quanto tempo atrai; voo: o quanto lança para o alto
      { dmg: 26, cd: 4.6, count: 1, radius: 2.6, iscaR: 7, iscaS: 2.2, distM: 4.5, arcM: 3.4, flightS: 0.85, voo: 6.5 },
      { count: 1, desc: '2ª maleta: duas iscas de uma vez' },
      { radius: 0.6, iscaR: 1.5, desc: 'Atrai de mais longe e explode maior' },
      { dmg: 14, desc: '+14 de dano' },
      { cd: -0.8, iscaS: 0.6, desc: 'Mais frequente, e a horda fica mais tempo em volta' },
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
  maletaAvisoS: 0.6, // antes de explodir, a maleta pisca (aviso)
  vooGravidade: 22, // m/s² de quem a explosão da maleta lança para o alto
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
  mochila: { name: 'Mochila Térmica', desc: '+10% no tamanho e no alcance de todas as habilidades', max: 5 },
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
    text: 'O Monstrão propõe um acordo de bastidor: ele chega "mais fraco", você não pergunta por quê.',
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
  unlock: ['O TAPUME CAIU. ATRÁS DA OBRA, UMA ESCADARIA QUE NINGUÉM TINHA VISTO', 'A OBRA ABRIU UMA PASSAGEM. GPS NÃO RECONHECE O CAMINHO'],
  morro: ['ENTREGADOR COMEÇA A SUBIDA. APP CALCULA 3 MINUTOS (MENTIRA)'],
  recomeco: ['ATUALIZAÇÃO OBRIGATÓRIA DO APLICATIVO: SEUS ITENS EXPIRARAM', 'APP ATUALIZOU: NOVO TURNO, NOVA ENTREGA, ZERO BENEFÍCIOS'],
  // o Caos do trecho chama o chefão (D39): sinal na Calamidade e o chamado em 100%, sem dizer o nome
  covilSinal_orla: ['MORADORES RECLAMAM DE BARULHO DE FERRO BATENDO ATRÁS DO TAPUME DO FIM DA PRAIA'],
  covilSinal_morro: ['RÁDIO COMUNITÁRIA: MOVIMENTAÇÃO NO ALTO DO MORRO. MORADORES FECHAM AS JANELAS'],
  covilAberto_orla: ['PLANTÃO: ALGO ENORME SE MEXE ATRÁS DO TAPUME DO FIM DA PRAIA. HELICÓPTERO DA TV JÁ ESTÁ NO LOCAL'],
  covilAberto_morro: ['PLANTÃO: TIROS E FOGOS NO ALTO DO MORRO. HELICÓPTERO DA TV SOBREVOA A LAJE'],
  covilDemora: ['A PLATEIA INTEIRA ESTÁ INDO PARA LÁ. A EMISSORA AGRADECE A AUDIÊNCIA'],
  fase_orla: ['MONSTRÃO PERDE A PACIÊNCIA: AGORA ARREMESSA CARROS', 'MONSTRÃO ENTRA NO MODO "SÉRIE ATÉ A FALHA"'],
  fase_morro: ['CHEFE DO TRÁFICO CHAMA A FIRMA INTEIRA', 'CHEFE DECRETA TOQUE DE RECOLHER NA LAJE'],
  chefaoCaiu: ['MONSTRÃO VAI AO CHÃO. O SINAL DA TV CAI JUNTO COM ELE'],
  hordaChefaoVolta: ['ELE VOLTOU. E MAIS FORTE: A TV CHAMA DE "SEGUNDA TEMPORADA"'],
  rabecao: ['O RABECÃO CHEGOU. ELE NÃO PARA PARA NINGUÉM. AUDIÊNCIA RECORDE'],
  aberturaPlantao: ['PLANTÃO: TV CAOS TESTA SINAL NOVO NA ORLA. "VOCÊ NÃO VAI CONSEGUIR DESLIGAR"'],
  aberturaSinal: ['O SINAL PEGOU. FIQUE LIGADO. FIQUE LIGADO. FIQUE LIGADO.'],
  crise_ressaca_aviso: ['PREVISÃO: RESSACA NA ORLA EM 20 SEGUNDOS. DEFESA CIVIL PEDE CALMA (E SOME)'],
  crise_ressaca: ['RESSACA! O MAR INVADE A AREIA. PLATEIA HIPNOTIZADA NÃO SAI DA FRENTE'],
  crise_ressaca_fim: ['O MAR RECUA E DEIXA ALGUMA COISA NA AREIA MOLHADA'],
  crise_apagao_aviso: ['CONCESSIONÁRIA ANUNCIA "INSTABILIDADE" NA REDE. PREVISÃO: 20 SEGUNDOS'],
  crise_apagao: ['APAGÃO NA ORLA! SÓ OS POSTES COM GATO CONTINUAM ACESOS'],
  crise_baile_aviso: ['DJ DA LAJE TESTA O SOM. EM 20 SEGUNDOS, O BAILE COMEÇA'],
  crise_baile: ['BAILE NA LAJE! A HORDA PARA PARA DANÇAR. OS FUNKEIROS, NÃO'],
  crise_curto_aviso: ['GATONET SOBRECARREGADO. CHEIRO DE FIO QUEIMADO NO MORRO'],
  crise_curto: ['GATO DE LUZ EM CURTO! FAÍSCA PARA TODO LADO, OLHE ONDE PISA'],
  cofre: ['ENTREGADOR ACHA COFRE NA ORLA. RECEITA DIZ QUE NÃO VIU NADA', 'COFRE ABERTO AO VIVO. DONO AINDA NÃO SE APRESENTOU'],
  cofre5: ['DEU BICHO! ENTREGADOR TIRA A SORTE GRANDE. BANCA PEDE RECONTAGEM'],
  reliquia_altinha: ['ENTREGADOR ACHA A BOLA DA ALTINHA. A PRAIA INTEIRA PARA PARA OLHAR'],
  reliquia_paredao: ['ENTREGADOR ACHA UM PAREDÃO NA LAJE. O MORRO INTEIRO SENTE O GRAVE'],
  chefe: ['CHEFE DO TRÁFICO DECRETA: PIZZA SÓ PASSA COM AUTORIZAÇÃO DA FIRMA'],
  chefeRadio: ['CHEFE CHAMA REFORÇO NO RÁDIO. MORADORES FECHAM AS JANELAS'],
  chefeVencido: ['CHEFE DO TRÁFICO CAI NA LAJE. ENTREGADOR SEGUE COM A PIZZA'],
  trombadinha: ['TROMBADINHA LEVA O XP DO ENTREGADOR. POLÍCIA DIZ QUE "FAZ PARTE"', 'ROUBARAM O CELULAR DO ENTREGADOR. O APLICATIVO DESCONTA DO SALDO'],
  cracudo: ['CRACUDOS CATAM TUDO O QUE CAI NO CHÃO DO MORRO. PREFEITURA ANUNCIA "OPERAÇÃO"'],
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
  bossWarn: ['URGENTE: FISICULTURISTA GIGANTE VISTO NA ORLA. ESPECIALISTAS: "É SÓ SHAPE"'],
  boss: ['MONSTRÃO CHEGOU: "SAI DA FRENTE QUE HOJE É DIA DE PERNA"'],
  lot: ['LOTE VENDIDO. ÁREA AGORA É PRIVADA', 'MAIS UM TERRENO "REVITALIZADO"'],
  accept: ['ACORDO FECHADO! ENTREGADOR AGORA É "PARCEIRO"'],
  revive: ['VOLTAMOS DO INTERVALO. ENTREGADOR, INEXPLICAVELMENTE, CONTINUA DE PÉ'],
  refuse: ['ENTREGADOR RECUSA PROPOSTA. INVESTIGADO POR SER HONESTO DEMAIS'],
  rival: ['RIVAL PATROCINADO ENTRA NA DISPUTA. LOGO BEM VISÍVEL'],
  death: ['ENTREGADOR NÃO RESISTE. APP DESCONTA A ENTREGA'],
  victory: ['MONSTRÃO VAI AO CHÃO. ACADEMIA DA PRAIA FICA SEM DONO'],
};

// Sons (docs/som/PEDIDO_SONS.md). Cada som: vol (0 a 1), max (quantos iguais ao mesmo tempo), espera (s
// mínimos entre dois iguais), prio (1 a 3: quem fica quando estoura o limite de vozes), perto (false: não
// diminui com a distância, para avisos e interface), varia (variação de tom, ±). Os arquivos gravados ficam
// listados em sons.js (ARQUIVOS); sem arquivo, toca o provisório feito em código.
const S = (vol, max = 3, espera = 0.05, prio = 1, o = {}) => ({ vol, max, espera, prio, perto: true, varia: 0.06, ...o });
const FIXO = { perto: false };
export const SOM = {
  vozes: 22, // máximo de sons tocando juntos
  ouvidoM: 24, // além disso, um som de longe toca no mínimo (longeMin)
  longeMin: 0.15,
  panM: 14, // quanto de lado (m) vira som todo num ouvido (até panMax)
  panMax: 0.75,
  gemidoCadaS: [1.4, 3.2], // a horda geme de tempos em tempos quando há gente perto (gemidoM)
  gemidoM: 9,
  amb: { orla: 'amb_orla', morro: 'amb_morro' }, // ambiente de cada trecho, em laço
  ambVol: 0.12, // o ambiente fica bem baixo, por baixo de tudo (era 0,5: o mar cobria a música)
  musica: 0.5, // a música toca a essa fração do volume escolhido nas configurações (fica por baixo dos efeitos)
};
export const SONS = {
  // Juninho
  dano: S(0.75, 1, 0.3, 3, FIXO), morte: S(0.9, 1, 1, 3, FIXO), nivel: S(0.55, 1, 0.3, 2, FIXO),
  xp: S(0.22, 3, 0.04, 1, { varia: 0.12 }), cura: S(0.5, 1, 0.15, 2), gorjeta: S(0.45, 2, 0.08, 2),
  pega: S(0.5, 1, 0.1, 2), arremesso: S(0.45, 3, 0.06, 1),
  // golpes e horda
  golpe: S(0.4, 4, 0.03, 1, { varia: 0.12 }), bonk: S(0.45, 3, 0.04, 1, { varia: 0.1 }), tapa: S(0.5, 3, 0.04, 1, { varia: 0.1 }),
  morte_horda: S(0.45, 4, 0.04, 1, { varia: 0.15 }), morte_elite: S(0.8, 2, 0.1, 3),
  acorda: S(0.3, 2, 0.1, 1), gemido: S(0.3, 2, 0.5, 1, { varia: 0.15 }),
  quebra_plastico: S(0.6, 2, 0.05, 2), quebra_madeira: S(0.6, 2, 0.05, 2), baque: S(0.6, 2, 0.05, 2),
  explosao: S(0.9, 2, 0.08, 3), atropelo: S(0.7, 2, 0.08, 2), buzina: S(0.5, 1, 0.5, 2),
  // habilidades
  chinelo: S(0.4, 2, 0.05, 1), boleto: S(0.3, 1, 0.2, 1), carimbo: S(0.7, 2, 0.05, 2), picole: S(0.45, 2, 0.1, 1),
  moto: S(0.6, 1, 0.3, 2), megafone: S(0.35, 1, 0.3, 1), gato: S(0.45, 2, 0.08, 1), latido: S(0.55, 1, 0.25, 2),
  mordida: S(0.5, 2, 0.08, 1), bola: S(0.45, 2, 0.06, 1), paredao: S(0.85, 1, 0.5, 2),
  // inimigos
  grito_funkeiro: S(0.55, 2, 0.3, 2), mira: S(0.4, 2, 0.15, 3), tiro: S(0.65, 4, 0.04, 2), radio: S(0.5, 1, 0.5, 2),
  urro: S(0.8, 1, 0.6, 3), investida: S(0.75, 1, 0.3, 3), soco_chao: S(0.9, 1, 0.2, 3), anilha: S(0.55, 2, 0.2, 2),
  carro_cai: S(0.9, 1, 0.3, 3), cata: S(0.35, 2, 0.2, 1), roubo: S(0.6, 1, 0.3, 3), multa: S(0.5, 1, 0.5, 2),
  // avisos, crises e chefão
  aviso_chao: S(0.4, 2, 0.15, 3), crise: S(0.55, 1, 1, 3, FIXO), onda: S(0.7, 1, 1, 2, FIXO), apagao: S(0.7, 1, 1, 3, FIXO),
  faisca: S(0.5, 3, 0.08, 2), chefe: S(0.75, 1, 2, 3, FIXO), fase: S(0.7, 1, 1, 3, FIXO),
  // interface e TV
  toque: S(0.3, 2, 0.05, 2, FIXO), carta: S(0.4, 1, 0.1, 2, FIXO), cofre: S(0.6, 1, 0.5, 3, FIXO),
  reliquia: S(0.6, 1, 1, 3, FIXO), passagem: S(0.55, 1, 1, 3, FIXO),
  // ambiente (em laço, um por trecho)
  amb_orla: S(1, 1, 0, 1, FIXO), amb_morro: S(1, 1, 0, 1, FIXO),
};
// som do golpe em quem leva, por habilidade (null: a habilidade já tem o som dela, ou é contínua)
export const SOM_GOLPE = {
  capacete: 'golpe', entrega: 'golpe', chinelo: 'tapa', // o capacete usa o golpe gravado (Firefly), mais pesado que o bonk altinha: 'bola', mototaxi: 'atropelo', carro: 'atropelo',
  caramelo: null, microfone: null, gato: null, curto: null, ressaca: null, paredao: null, objeto: null, carimbo: null,
  maleta: null, explosao: null, ressacaOnda: null,
};
// som de quando a habilidade dispara (null: o som vem no impacto)
export const SOM_ARMA = {
  capacete: 'arremesso', entrega: 'arremesso', chinelo: 'chinelo', boleto: 'boleto', maleta: 'arremesso', picole: 'picole',
  mototaxi: 'moto', microfone: 'megafone', gato: 'gato', carimbo: null, caramelo: null,
};
