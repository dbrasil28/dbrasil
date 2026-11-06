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
    fogosM: 12, fogosPack: 6,
  },
  especulador: {
    name: 'Especulador Imobiliário',
    hp: 3000, speed: 1.45, dmg: 26, radius: 0.85, size: 1.9 / 0.75, xp: 0,
    behavior: 'boss', elite: true, boss: true,
  },
};

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

// Rota contínua (docs/design/CARREIRA_E_ROTA.md): a Orla tem fim; a escadaria do pé do morro abre no
// nível da meta e leva direto à Subida do Morro, sem corte. Pedaços do morro de baixo para cima.
export const ROUTE = {
  orla: { blocks: 8, startY: 44, unlockLevel: 15, gate: { x0: -12.8, x1: -8.6, len: 8 } },
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
  orla: ['boteco', 'predio', 'boteco', 'nada', 'predio', 'boteco', 'nada', 'boteco', 'predio'],
  praia: ['quiosque', 'salva_vidas', 'quiosque', 'nada', 'salva_vidas', 'quiosque', 'nada', 'salva_vidas', 'quiosque'],
  terracoH: 3.6, // terraço do prédio com escada de incêndio
  salvaVidasH: 2.8, // torre do salva-vidas
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
};
export const HEALS = { coco: 20, marmita: 35 }; // coco gelado do quiosque, marmita esquecida no terraço

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
  ],
  maxBurocratas: 22,
  eliteEvery: (caos) => (caos >= 60 ? 40 : 60),
};

// Armas: `levels[0]` é a base; os demais são incrementos. Nível máximo = levels.length.
export const WEAPONS = {
  capacete: {
    name: 'Capacete Bumerangue',
    role: 'Vai e volta atravessando a horda',
    levels: [
      { dmg: 14, cd: 1.5, count: 1, speed: 11, outT: 0.45 },
      { count: 1, desc: '+1 capacete' },
      { dmg: 7, desc: '+7 de dano' },
      { cd: -0.25, outT: 0.1, desc: 'Recarga menor e mais alcance' },
      { count: 1, dmg: 7, desc: '+1 capacete, +7 de dano' },
    ],
  },
  chinelo: {
    name: 'Chinelo Voador',
    role: 'Tiro rápido nos alvos mais próximos',
    levels: [
      { dmg: 9, cd: 0.9, count: 1, speed: 15, pierce: 1 },
      { count: 1, desc: '+1 alvo por disparo' },
      { dmg: 5, desc: '+5 de dano' },
      { pierce: 1, desc: 'Atravessa +1 inimigo' },
      { count: 1, cd: -0.15, desc: '+1 alvo, recarga menor' },
    ],
  },
  boleto: {
    name: 'Boleto Atrasado',
    role: 'Área que cobra juros por segundo',
    levels: [
      { dmg: 5, cd: 3.2, count: 1, radius: 1.3, duration: 3, tick: 0.5 },
      { radius: 0.3, desc: 'Área maior' },
      { count: 1, desc: '+1 boleto' },
      { dmg: 3, desc: '+3 de dano por cobrança' },
      { duration: 1.5, count: 1, desc: 'Vence mais tarde, +1 boleto' },
    ],
  },
  carimbo: {
    name: 'Carimbo Oficial',
    role: 'INDEFERIDO: dano em área e lentidão',
    levels: [
      { dmg: 22, cd: 2.6, count: 1, half: 1.0, slow: 0.5, slowT: 2 },
      { dmg: 10, desc: '+10 de dano' },
      { half: 0.3, desc: 'Carimbo maior' },
      { count: 1, desc: '+1 carimbo' },
      { cd: -0.6, slowT: 1, desc: 'Recarga menor, lentidão mais longa' },
    ],
  },
  maleta: {
    name: 'Maleta de Dinheiro',
    role: 'Arremesso que explode em área',
    levels: [
      { dmg: 30, cd: 2.8, count: 1, radius: 1.8, range: 7 },
      { dmg: 12, desc: '+12 de dano' },
      { radius: 0.4, desc: 'Explosão maior' },
      { count: 1, desc: '+1 maleta' },
      { cd: -0.6, dmg: 12, desc: 'Recarga menor, +12 de dano' },
    ],
  },
  // Habilidades exclusivas de cada trecho (aparecem só nele; quem pega leva para os próximos)
  picole: {
    name: 'Isopor de Picolé',
    role: 'Onda gelada em volta: a horda fica lenta',
    onlyIn: 'orla',
    levels: [
      { dmg: 6, cd: 2.6, radius: 2.2, slow: 0.45, slowT: 1.6 },
      { radius: 0.4, desc: 'Onda maior' },
      { slowT: 0.8, desc: 'O gelo dura mais' },
      { dmg: 6, cd: -0.4, desc: '+6 de dano e mais frequente' },
      { radius: 0.5, slow: -0.1, desc: 'Onda maior e horda mais lenta' },
    ],
  },
  mototaxi: {
    name: 'Mototáxi Amigo',
    role: 'A moto sobe a viela atropelando a horda',
    onlyIn: 'morro',
    levels: [
      { dmg: 40, cd: 4.2, speed: 24, lenM: 22, width: 1.0, startM: 9, count: 1 },
      { dmg: 15, desc: '+15 de dano' },
      { width: 0.5, desc: 'Moto mais larga: atropela mais gente' },
      { cd: -1.0, desc: 'Passa mais vezes' },
      { count: 1, dmg: 15, desc: '+1 mototáxi e +15 de dano' },
    ],
  },
  microfone: {
    name: 'Megafone da TV',
    role: 'Onda sonora em volta, empurra a horda',
    levels: [
      { dmg: 6, cd: 1.0, radius: 1.9, knock: 3.2 },
      { radius: 0.3, desc: 'Alcance maior' },
      { dmg: 4, desc: '+4 de dano' },
      { cd: -0.2, desc: 'Pulsa mais rápido' },
      { radius: 0.4, dmg: 4, desc: 'Alcance maior, +4 de dano' },
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
  fogos: ['FOGOS NO MORRO: CHEGOU ENCOMENDA', 'SOLTARAM FOGOS. O MORRO INTEIRO SABE QUE ELE CHEGOU'],
  botijao: ['BOTIJÃO VOA NA ORLA. PREÇO DO GÁS SOBE DE NOVO', 'EXPLOSÃO DE BOTIJÃO. GOVERNO PROMETE "VALE-GÁS" PARA 2040'],
  objeto: ['ENTREGADOR ARREMESSA CADEIRA DE BOTECO. DONO COBRA A MESA'],
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
