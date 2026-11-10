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
  contornaM: 0.04, // empurrando um sólido (moto, tambor, carro), escorrega isso por quadro para a ponta que tem espaço
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
    behavior: 'ranged', range: 5.5, fireEvery: 3.2, trecho: 'saopaulo', // D80: elenco de São Paulo; saiu da Orla
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
    laranjas: 2, // chegam com ele (D73), só no trecho do Laranja (Brasília, D78)
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
    investida: { rangeM: 6, windupS: 0.7, dashS: 0.5, dashMul: 3.4, every: 3.2, som: 'grito_funkeiro' },
  },
  // Elenco v2 (D73). Laranja: vem com o Político e fica entre ele e o Juninho (guarda: frenteM à frente do
  // Político, ladoM para o lado); apanha no lugar dele: com um Laranja até escudo.raioM, `parte` do dano vai
  // para o Laranja. Cai e espalha o dinheiro do chefe (uma Propina no chão).
  laranja: {
    name: 'Laranja',
    hp: 70, speed: 1.75, dmg: 9, radius: 0.32, size: 1.0, xp: 5,
    behavior: 'laranja', trecho: 'brasilia', // D78: elenco de Brasília (CARREIRA_E_ROTA.md, seção 10)
    guarda: { frenteM: 1.3, ladoM: 0.9, bateM: 1.6 },
    escudo: { raioM: 3.2, parte: 0.7 },
  },
  // Agiota (D76): fica a distM e marca o Juninho a até marcaM; marcado, ele perde XP por segundo (taxa, crescendo
  // `juros` por segundo, composto) até o Agiota cair (a dívida volta ao chão como XP) ou ele se afastar soltaM
  agiota: {
    name: 'Agiota',
    hp: 110, speed: 1.55, dmg: 10, radius: 0.36, size: 1.05, xp: 10,
    behavior: 'agiota', trecho: 'saopaulo', // D78: elenco de São Paulo
    distM: 5, marcaM: 7, soltaM: 13, taxa: 1.0, juros: 0.12, cobraS: 1.5,
  },
  // Coach Picareta (D76): chega a comecaM, prepara windupS (aviso no chão) e dá a palestra por duracaoS: quem está
  // a até raioM fica lento; depois espera cadaS
  coach: {
    name: 'Coach Picareta',
    hp: 90, speed: 1.7, dmg: 8, radius: 0.34, size: 1.0, xp: 8,
    behavior: 'coach', trecho: 'saopaulo', // D78: elenco de São Paulo
    comecaM: 5, raioM: 3.6, windupS: 0.9, duracaoS: 3, cadaS: 6, fraseS: 1.1,
    frases: ['ACORDA PRA VIDA, CAMPEÃO!', 'SAI DA ZONA DE CONFORTO!', 'MINDSET!', 'VOCÊ É O CEO DA SUA VIDA!', 'GRATIDÃO!'],
  },
  // Pastor Picareta (D77): fica atrás da horda, a distM do Juninho. A cada curaS cura quem está a até raioM
  // (cura: parte da vida cheia de cada um; ele mesmo e o chefão não); a cada chamaS chama `chama` fiéis da horda
  pastor: {
    name: 'Pastor Picareta',
    hp: 150, speed: 1.45, dmg: 9, radius: 0.36, size: 1.05, xp: 14,
    behavior: 'pastor', trecho: 'orla', // D78: o autor quis o Pastor na Orla
    distM: 6.5, raioM: 4.5, curaS: 2.5, cura: 0.25, chamaS: 11, chama: 3, chamaRaioM: 1.6, fraseS: 2.4,
    frases: ['ALELUIA!', 'OFERTA NO PIX!', 'CARNÊ DA BÊNÇÃO!', 'TÁ AMARRADO!', 'DÍZIMO É INVESTIMENTO!', 'RECEBA!'],
  },
  // Encostado (D77): de colar cervical e muleta. Com o Juninho olhando para ele (o ângulo entre para onde o Juninho
  // olha e o Encostado com cosseno acima de vistoCos), manca a lentoMul da velocidade; com o Juninho de costas,
  // corre a correMul (passa do Juninho, que anda a 3,4 m/s). Pego correndo: congela flagradoS e solta uma desculpa.
  encostado: {
    name: 'Encostado',
    hp: 55, speed: 1.0, dmg: 11, radius: 0.32, size: 1.0, xp: 5,
    behavior: 'encostado', trecho: 'brasilia', // D78: elenco de Brasília
    vistoCos: -0.15, lentoMul: 0.45, correMul: 3.7, flagradoS: 0.7, fraseS: 4,
    frases: ['AI, MINHA COLUNA!', 'TÔ DE ATESTADO!', 'É A HÉRNIA!', 'PERÍCIA SÓ EM 2031!', 'FOI SÓ UM ESPASMO!'],
  },
  // Bicheiro (D80): elite da Orla no lugar do Burocrata; reveza com o Político. Chega e abre a banca: espalha
  // `bilhetes` bilhetes no chão em volta do Juninho (entre bilheteM), cada um com um bicho, e solta `apontadores` da
  // horda que correm para recolher os bilhetes. O Juninho aposta pegando um (os outros somem). Derrubado o Bicheiro,
  // sai o bicho, um dos bilhetes: quem acertou ganha um cofre. Os bilhetes somem em bilheteS.
  bicheiro: {
    name: 'Bicheiro',
    hp: 230, speed: 1.45, dmg: 14, radius: 0.45, size: 1.15 / 0.75, xp: 18,
    behavior: 'bicheiro', elite: true, trecho: 'orla',
    bilhetes: 3, bilheteM: [4.5, 7], pegaM: 0.9, apontadores: 3, apontadorMul: 1.45, recolheM: 0.8, bilheteS: 25,
  },
  // Rato de Academia: investida em linha reta (como o Funkeiro), mais pesado; se pega o Juninho na corrida,
  // empurra (empurra: m/s, perde rápido). Na Orla com o Caos alto e na turma de reforço do Monstrão.
  // Pedido do autor (D79, corrige o D74): do tamanho do Político (mesmo size e raio) e com a barra de força em
  // cima, como ele (barra: true).
  rato: {
    name: 'Rato de Academia',
    hp: 190, speed: 1.5, dmg: 16, radius: 0.45, size: 1.15 / 0.75, xp: 12, barra: true,
    behavior: 'investida', trecho: 'orla',
    investida: { rangeM: 7, windupS: 0.65, dashS: 0.55, dashMul: 3.6, every: 3.2, som: 'investida', empurra: 11 },
  },
  // Chefe do morro (laje do topo): rajadas de 3 tiros com a linha de aviso antes; de tempo em tempo para,
  // grita no rádio (pose de raiva) e chama traficantes. A entrega só sai com ele derrubado.
  // D91 (pedido do autor): o chefão final do Rio é um traficante gigante com duas metralhadoras. Três golpes, com
  // aviso: a rajada dupla (as duas armas, uma de cada lado, alternando: travou a mira em miraS e solta tiros de
  // cada lado), a varredura (o leque de lequeGraus aparece no chão em avisoS e ele varre de um lado ao outro em
  // varreS) e as duas juntas (a faixa no chão em avisoS e um jato de tiros por jatoS nessa linha). A cada golpes
  // golpes, para recarregar por recargaS: a hora de bater (leva o dobro). canoM: a boca de cada arma, para o lado.
  // A arte nova (16 direções com as duas armas) está pedida em docs/arte/PEDIDO_MORRO_BAILE.md; até chegar, a de hoje.
  chefe_trafico: {
    name: 'Chefe do Tráfico',
    hp: 1700, speed: 1.2, dmg: 22, radius: 0.85, size: 2.4, xp: 0, // a vida cresce com o tempo no trecho
    behavior: 'chefe', elite: true, boss: true,
    range: 13, keepM: 6, aimS: 0.7, fireEvery: 2.8,
    bullet: { speed: 16, life: 1.1, radius: 0.2, dmg: 8 },
    canoM: 0.55,
    pausaS: [0.9, 1.6], // entre um golpe e outro, anda (menos a cada fase)
    dupla: { miraS: 0.75, tiros: 4, intervaloS: 0.09, abertura: 0.05 },
    leque: { avisoS: 0.9, lequeGraus: 80, varreS: 1.1, cadaS: 0.06, alcanceM: 12 },
    juntas: { avisoS: 1.0, jatoS: 0.9, cadaS: 0.05, alcanceM: 14, largM: 1.3 },
    recarga: { golpes: 3, recargaS: 2.2 },
    reforco: { cadaS: 13, gritoS: 1.0, traficantes: 2 },
    fases: { tirosMais: 1, cadenciaMul: 0.8, reforco: [[], ['traficante', 'funkeiro'], ['traficante', 'traficante', 'funkeiro']] },
    janela: { danoMul: 2, soJanela: true }, // hora de bater: recarregando ou gritando no rádio, leva o dobro de dano
  },
  // D91: o chefe do meio do Morro, no baile da esplanada. O som dele carrega o sinal da TV. O grave: ergue os braços
  // (avisoS, o aviso em volta dele) e solta anéis que correm pelo chão (velMS até raioM; quem está na linha do anel,
  // fora da brecha, leva dano e voa para fora, derrubaM). O drop: a cada dropS sobe no som (subirS, a hora de bater) e a batida cai:
  // um anel forte e a horda em volta corre mais (frenesiMul por frenesiS). Chama Funkeiros a cada chamaS.
  // Fica no palco (palcoM do meio do fundo) e se afasta de quem chega perto (keepM). Arte provisória: a do Funkeiro.
  dj_plantao: {
    name: 'DJ Plantão',
    hp: 1100, speed: 1.3, dmg: 10, radius: 0.6, size: 1.5, xp: 0, // a vida cresce com o tempo no trecho (uns 2.400 no baile)
    behavior: 'dj', elite: true, boss: true,
    keepM: 2.5, palcoM: 6, // keepM: só foge de quem chega mais perto que isso (era 4: com arma de perto, não dava)
    // cada anel tem uma brecha (brechaRad); o anel seguinte vem com a brecha girada (giroRad): quem está na brecha passa
    // o anel comum joga o Juninho para trás (empurra, m/s: uns 3 m); no palco, colado no DJ (pertoM), derruba (pertoDerrubaM).
    // Pedidos do autor: de longe não dava nem para chegar perto (derrubava sempre); de perto, o anel "não tinha
    // efeito nenhum" (empurrava 1,2 m). O jeito de chegar perto é o canhão de luz: ofuscado, ele não solta anel
    grave: { cadaS: 4.2, avisoS: 0.75, velMS: 6, raioM: 12, largM: 0.8, dano: 13, derrubaM: 0, empurra: 26, pertoM: 3.2, pertoDerrubaM: 2.2, aneis: [1, 2, 2], entreS: 0.5, brechaRad: 1.0, giroRad: 1.9 },
    drop: { cadaS: 15, subirS: 2.4, dano: 14, derrubaM: 2.6, frenesiMul: 1.5, frenesiS: 4, frenesiM: 20 },
    chama: { cadaS: 11, funkeiros: [1, 2, 2] },
    fases: { cadenciaMul: 0.82, reforco: [[], ['funkeiro'], ['funkeiro', 'funkeiro']] },
    faseHorda: 10, // a cada fase, essa horda chega pelos lados da esplanada
    janela: { danoMul: 2 }, // subindo no som para o drop, leva o dobro
    // pedido do autor ("matei o DJ em 2 toques"): fora da janela, o paredão segura o dano, no palco (palco) e na
    // roda (pista); ofuscado pelo canhão ou subindo para o drop, leva o dobro (janela)
    resiste: { palco: 0.3, pista: 0.55 },
    // ideia do autor (o Juninho não conseguia nem chegar perto): no palco, quem encosta (ativaM) num dos canhões de luz
    // vira o facho para o DJ. Depois (pedido do autor: "tem que apontar os 2 holofotes pra ele"), um facho sozinho
    // não basta: ele espera o outro por esperaS (sem o par, o canhão descansa voltaS); com `juntos` fachos nele ao
    // mesmo tempo, o DJ fica ofuscado por ofuscaS, poucos segundos (não solta anel, não foge, não faz o drop, e leva
    // o dobro da janela), e os canhões voltam a servir cdS depois. Com a vida em vidaFrac, ele desce para a pista e
    // a briga é na roda (rodaM de raio, como na Orla): ele vem para cima (velMul), a torcida empurra quem encosta
    // (dano a cada cdS, empurra)
    canhao: { ativaM: 1.8, juntos: 2, esperaS: 6, voltaS: 2, ofuscaS: 3.5, cdS: 9 },
    // a roda (pedido do autor: em volta do Juninho e do DJ, e vai fechando como na Orla): duas linhas (linhaM) de gente
    // a espacoM, que dá um passo para dentro (passoM) a cada fechaS, até minM; quem falta chega andando (andaMS)
    pista: { vidaFrac: 0.7, rodaM: 7, minM: 4.5, fechaS: 5, passoM: 0.35, velMul: 1.5, linhaM: 0.85, espacoM: 0.85, andaMS: 5, dano: 2, cdS: 0.6, empurra: 6 },
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
    // derrubaM (D86): acertado, o Juninho voa essa distância para trás, cai de costas, rola e levanta (como atropelado)
    investida: { avisoS: 0.8, avisoSeguidaS: 0.5, vel: 15, distM: 15, largM: 2.5, dano: 26, empurraM: 2.2, derrubaM: 4.5, hordaDano: 80, voo: 9, poseS: 1.5, tontoS: 2.0, seguidas: [1, 3, 3], quiques: [0, 0, 2] },
    // agachamento: quando o Juninho cola nele; na fase 3 solta o anel de choque (brecha: abertura em rad)
    agacha: {
      pertoM: 3.5, avisoS: 0.8, raioM: 3.2, dano: 16, empurraM: 2.5, derrubaM: 3.2, hordaDano: 60, voo: 8, poseS: 0.5,
      anel: { velM: 9, alcanceM: 12, largM: 0.9, brecha: 1.0, dano: 14, derrubaM: 2.6 },
    },
    // anilha (D85): do tamanho da que ele segura na arte (arteRaioM, ~2 m de diâmetro); sai das mãos (alturaM) e
    // cai no chão em quedaS antes de rolar; raioM é a área que machuca (só depois de cair)
    anilha: { avisoS: 0.6, lead: 0.5, vel: 9, distM: 16, raioM: 0.8, arteRaioM: 1.0, alturaM: 4.0, quedaS: 0.24, dano: 15, derrubaM: 3.2, hordaDano: 40 },
    carro: { chance: 0.3, avisoS: 0.9, lead: 0.9, vooS: 0.9, alturaM: 3.4, arcoM: 3, raioM: 3.0, dano: 30, derrubaM: 3.8, hordaDano: 120, arte: ['cen_carro_fusca', 'cen_carro_brasilia', 'cen_carro_uno', 'cen_carro_taxi'] },
    // derrubado (D65): uma das 3 mortes, sorteada, na direção mais perto de onde ele olhava; fica no chão e some
    corpo: { quadroS: 0.12, noChaoS: 4, someS: 1 },
    paradoQuadroS: 0.12, // parado entre os golpes: laço de 6 quadros respirando
    // a turma da academia (D75, sugestão do autor): poucos Ratos de Academia por chamada e um pouco de horda; a
    // cada fase nova chegam mais Ratos (fases.reforco). Pouco mais que isso: a luta é com ele
    reforco: { cadaS: [14, 12, 10], horda: 3, raioM: 9.5, ratos: [1, 1, 2] },
    fases: { reforco: [[], ['rato', 'rato'], ['rato', 'rato', 'rato']] },
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
  becoQuintalM: 4, // D92: ao sul de uma viela deitada, a mureta e o quintal; casa (baixa) só depois disso
  // tapa-buracos: o chão sem casa a até raioM da rota e dos becos ganha casa (grade de passoM; casa cortada até
  // minD de fundo), nunca em cima de outra casa; nunca a até sombraM ao sul de um chão de andar (nesta câmera,
  // esconderia quem anda).
  // Ao sul de quem anda até sombraAltaM e a leste até lesteM, só casa baixa: casa de 9 m esconde uns 11 m atrás dela
  buracos: { raioM: 16, passoM: 0.5, minD: 2, sombraM: 4, sombraAltaM: 11, lesteM: 3.5, pecas: ['fachada_a', 'fachada_b', 'fachada_c', 'barraco_a', 'barraco_b'] },
  alturaBaixaM: 3.5, // casa baixa: até essa altura (a que pode ficar a leste da viela ou ao sul dela)
  mureta: { altM: 0.9 },
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
  foraM: 30, // a avenida segue esses metros depois da obra do começo; os carros saem por ela
  // do lado do Morro (pedido do autor: o canto escuro ao lado da Travessa do Gato ficava vazio), a avenida segue só
  // foraTopoM depois do muro do fim e some no escuro em escuroTopoM; dali em diante, a favela enche
  foraTopoM: 10, escuroTopoM: 5,
  livreM: 3, // e nenhuma casa da favela fica em cima dela até essa folga além do fim
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
  // dia normal (D88): na abertura, antes do sinal pegar, o carro para para quem atravessa (pedestre ou o Juninho)
  // na frente dele: começa a frear a pararM, para a paradoM, olha ladoM para os lados da faixa; freia e acelera
  // com esses limites (m/s²) e, parado por gente, às vezes buzina
  pedestre: { pararM: 9, paradoM: 1.4, ladoM: 0.7, frear: 22, acelerar: 6, buzina: 0.3 },
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
      // D91 (pedido do autor): a última esplanada vira o baile (o chefe do meio, o DJ Plantão) e o morro continua
      // pelo portão do fundo dela, fechado até o DJ cair, até a laje do topo do Chefe do Tráfico
      { kind: 'laje', x0: -24, x1: -4, len: 26, baile: true }, // esplanada do baile
      { kind: 'escadaria', x0: -10, x1: -6, len: 12, portao: true }, // o portão: fechado até o DJ cair
      { kind: 'viela', x0: -9, x1: -4, len: 24 },
      { kind: 'laje', x0: -13, x1: 1, len: 14 },
      { kind: 'escadaria', x0: -3, x1: 1, len: 12 },
      { kind: 'viela', x0: -5, x1: 0, len: 18 },
      { kind: 'viela', x0: -14, x1: -1, len: 8 },
      { kind: 'escadaria', x0: -13, x1: -9, len: 12 },
      { kind: 'laje', x0: -22, x1: -2, len: 22 }, // laje do topo: arena do Chefe do Tráfico e lugar da entrega
    ],
    // Becos (D92, pedido do autor: a favela cheia de bifurcações, para se perder e achar tesouro). Cada beco sai
    // de um pedaço da rota principal (de: índice em pieces; em: onde, 0 = pé e 1 = alto do pedaço; lado: 'esq' ou
    // 'dir') e anda por trechos: 'esq'/'dir' (viela deitada, comp m) e 'sobe' (comp m, ou ate: índice do pedaço
    // principal, até a altura do meio dele). larg: largura da viela. fim: a pracinha do fundo ([larg, fundo] m)
    // com o achado (cofre, isopor ou a relíquia), ou liga: o pedaço principal onde ele volta (atalho, sem
    // atalho por cima do portão do baile). nome: a placa na entrada (nomes inventados).
    ramos: [
      { nome: 'BECO DO CHORO', de: 0, em: 0.5, lado: 'esq', larg: 4, trechos: [{ vai: 'esq', comp: 14 }, { vai: 'sobe', comp: 10 }], fim: { pracinha: [7, 6], achado: 'cofre' } },
      { nome: 'TRAVESSA DO GATO', de: 2, em: 0.35, lado: 'dir', larg: 4, trechos: [{ vai: 'dir', comp: 14 }, { vai: 'sobe', ate: 4 }, { vai: 'esq', ate: 4 }], fim: { liga: 4 } },
      { nome: 'BECO DA SAUDADE', de: 5, em: 0.45, lado: 'esq', larg: 4, trechos: [{ vai: 'esq', comp: 16 }], fim: { pracinha: [6, 7], achado: 'isopor' } },
      { nome: 'VIELA SEM VOLTA', de: 8, em: 0.4, lado: 'dir', larg: 4, trechos: [{ vai: 'dir', comp: 14 }, { vai: 'sobe', comp: 12 }, { vai: 'dir', comp: 9 }], fim: { pracinha: [7, 7], achado: 'cofre' } },
      { nome: 'BECO DO PAREDÃO', de: 13, em: 0.5, lado: 'esq', larg: 4, trechos: [{ vai: 'esq', comp: 18 }, { vai: 'sobe', comp: 10 }], fim: { pracinha: [8, 7], achado: 'reliquia' } },
      { nome: 'ATALHO DOS FUNDOS', de: 16, em: 0.45, lado: 'dir', larg: 4, trechos: [{ vai: 'dir', comp: 10 }, { vai: 'sobe', ate: 19 }, { vai: 'esq', ate: 19 }], fim: { liga: 19 } },
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
// explosão pega fogo e explode depois de fogoCadeiaS, e pode disparar outro (reação em cadeia); fica
// queimado e soltando fumaça. tipos: tamanho da explosão de cada veículo (e quanto de vida ele tem).
// Porrada no carro (pedido do autor, 08/11/2026): capacete, chinelo, carimbo e objeto arremessado tiram
// vida (vida × tipos); com menos de fumacaVida solta fumaça do capô; sem vida pega fogo, com o círculo da
// explosão no chão enchendo, e explode depois de fogoS: dá tempo de o Juninho sair de perto. Poste: o Gato de Luz acertando a menos de
// gatilhoM de um poste (ou dos fios do gatonet) faz ele descarregar do alto (altura em tipos) um raio enorme
// em até `alvos` inimigos a até raioM; depois recarrega.
export const REACOES = {
  carro: {
    gatilhoM: 2.4, raioM: 3.4, dano: 90, voo: 7, danoJuninho: 18, fumacaS: 10, fumacaCadaS: 0.9,
    fogoCadeiaS: [0.8, 1.4], // explosão perto: pega fogo e explode depois disso (sorteado pelo lugar do carro)
    vida: 110, fumacaVida: 0.5, fogoS: 3, fogoCadaS: 0.12, chamasM: 3.4, // porrada: vida do carro; abaixo da metade, fumaça; sem vida, fogo por fogoS
    tipos: { carro: 1, onibus: 1.35, camburao: 1.15, moto: 0.6 },
  },
  poste: { gatilhoM: 3.2, raioM: 7, alvos: 6, dano: 60, travaS: 0.6, recargaS: 6, tipos: { poste: 6.0, fios: 5.2 } },
};

// Juninho derrubado (D64): atropelado, ou perto de um carro explodindo, ele voa no sentido do golpe, cai de
// costas, rola e levanta (arte: juninho_atropelado, 8 direções × 12 quadros). Sem controle e sem levar dano
// até levantar; o objeto que carregava cai.
export const DERRUBADO = {
  quadrosS: [0.1, 0.12, 0.12, 0.12, 0.14, 0.14, 0.12, 0.14, 0.14, 0.16, 0.16, 0.14], // tempo de cada quadro (do pacote): 1,6 s
  vooQuadros: 4, // quadros no ar; no seguinte ele cai de costas
  rolaQuadros: 2, // depois de cair, rolando
  vooM: 3.2, // atropelado: distância do voo
  rolaM: 0.8,
  alturaM: 0.6, // altura do arco (a arte do voo já sobe um pouco)
  carroExplodeM: 2.6, // carro explodindo perto: voa para longe dele essa distância
  ladoAtropelo: 0.6, // atropelado: além de ir no sentido do carro, sai para o lado da faixa
};

export const LAJE = { subirChance: 0.12, maxSubindo: 3, sorteioS: [3, 6], vaoM: 1.6, chegouM: 0.35 };
export const INTERACT = { pickR: 1.0, arrancaM: 0.55, holdS: 0.25, throwRange: 8, flightS: 0.5, arcM: 2.4, respawnS: 35, respawnMinDistM: 14, pegaAnimS: 0.25, lancaAnimS: 0.4 }; // arrancaM: distância da borda de uma lixeira, guarda-sol ou isopor para arrancar; pegaAnimS e lancaAnimS: o arremesso com as duas mãos (pegar: prepara, ergue, acima da cabeça; lançar: lança, solta, recupera)
export const THROWABLES = {
  cadeira: { name: 'Cadeira de plástico', dmg: 28, radius: 1.3, som: 'quebra_plastico' },
  mesa: { name: 'Mesa de plástico', dmg: 45, radius: 1.8, som: 'quebra_plastico' },
  cadeira_praia: { name: 'Cadeira de praia', dmg: 32, radius: 1.5, som: 'quebra_madeira' },
  engradado: { name: 'Engradado', dmg: 36, radius: 1.5, som: 'quebra_madeira' },
  botijao: { name: 'Botijão de gás', dmg: 90, radius: 2.8, selfDmg: 16, explosive: true, som: 'explosao' }, // machuca o Juninho se estiver perto
  banquinho: { name: 'Banquinho de plástico', dmg: 22, radius: 1.2, som: 'quebra_plastico' },
  pneu: { name: 'Pneu velho', dmg: 30, radius: 1.5, som: 'baque' },
  // arrancados do cenário (pedido do autor, 08/11/2026): o Juninho encosta e arranca; o lugar fica vazio e
  // outro volta depois de INTERACT.respawnS, fora da tela. A arte é a do cenário (arte_cenario.js)
  lixeira: { name: 'Lixeira', dmg: 30, radius: 1.5, som: 'baque', arranca: true },
  guarda_sol: { name: 'Guarda-sol', dmg: 26, radius: 2.0, som: 'quebra_madeira', arranca: true }, // a copa larga pega mais gente
  isopor: { name: 'Isopor', dmg: 22, radius: 1.4, som: 'quebra_plastico', arranca: true },
};
// Curas dos lugares: coco do quiosque, açaí, pastel e milho das barracas.
// Voltam depois de um tempo, fora da tela. O açaí também deixa o Juninho mais rápido por uns segundos.
// Altura de cada objeto arremessável quando está no chão (m, na escala dos personagens, que são
// desenhados com 1,75 m): a imagem gerada é desenhada com essa altura.
export const OBJ_ALTURA = { cadeira: 0.85, mesa: 0.8, engradado: 0.45, botijao: 0.65, cadeira_praia: 0.85, banquinho: 0.5, pneu: 0.4, lixeira: 0.4, guarda_sol: 1.7 }; // lixeira e guarda-sol: deitados
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
// O preço de cada nível: base × mult^nível, de 5 em 5 (pedido do autor, 09/11/2026: "está fácil demais completar
// tudo... tem que ser bem mais lento, mais caro, com mais barrinhas"). Antes, tudo custava 2.465 gorjetas e o bot
// comprava 20 dos 22 níveis em menos de 2 horas. Agora são 61 níveis e 27.635 gorjetas: o primeiro sai na primeira
// partida e, no ritmo do bot, tudo completo fica em umas 20 a 25 horas (no Vampire Survivors, completar tudo leva umas 40)
const curva = (base, mult, n) => Array.from({ length: n }, (_, i) => Math.round((base * mult ** i) / 5) * 5);
export const MELHORIAS = {
  // pequenas por nível (D39): o jogo continua difícil; no máximo, a soma pesa
  vida: { name: 'Marmita reforçada', desc: '+3 de vida máxima', step: 3, custo: curva(50, 1.42, 10) }, // até +30
  dano: { name: 'Capacete de aço', desc: '+1,5% de dano', step: 0.015, custo: curva(70, 1.43, 10) }, // até +15%
  velocidade: { name: 'Tênis de corrida', desc: '+1% de velocidade', step: 0.01, custo: curva(60, 1.48, 8) }, // até +8%
  recarga: { name: 'Café de garrafa', desc: '−1% de recarga das armas', step: 0.01, custo: curva(70, 1.48, 8) }, // até −8%
  ima: { name: 'Mochila maior', desc: '+4% de raio de coleta', step: 0.04, custo: curva(40, 1.45, 8) }, // até +32%
  armadura: { name: 'Colete de motoboy', desc: '−1,5% de dano recebido', step: 0.015, custo: curva(100, 1.55, 6) }, // até −9%
  gorjeta: { name: 'Avaliação 5 estrelas', desc: '+4% de gorjeta no fim da partida', step: 0.04, custo: curva(80, 1.48, 8) }, // até +32%
  // melhorias de opção: dão escolha, não força
  armaInicial: { name: 'Bolsa de ferramentas', desc: 'No começo de cada trecho, escolhe uma arma a mais', opcao: true, custo: [2000] },
  troca: { name: 'Contato no app', desc: '1 troca de cartas por partida, sem anúncio', opcao: true, custo: [1500] },
  pista: { name: 'Rádio da polícia', desc: 'O helicóptero da TV já aparece no sinal do covil', opcao: true, custo: [1000] },
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
  heli: { raioM: 3.5, voltaS: 5, alturaTela: 0.42, manchaM: 2.1, manchaAlfa: 0.32 }, // holofote do helicóptero da TV circulando o covil; a mancha no chão (raio, m; brilho)
  fases: [0.66, 0.33], // vida do chefão em que ele muda de fase
  reforcoHorda: 18, // assessoria: horda chamada em volta do chefão a cada fase nova
  // luta com o Monstrão (D75, pedido do autor: horda demais, não dava para lutar e o jogo ficava lento): no máximo
  // `max` inimigos comuns vivos, nascendo no `ritmo` de sempre × isso; na chegada dele, somem os que passam do
  // máximo (os mais longe, fora da tela); a assessoria de cada fase traz `faseHorda` da horda
  chefaoHorda: { max: 90, ritmo: 0.5, faseHorda: 4 }, // a assessoria de verdade são os Ratos de Academia (ENEMIES.monstrao)
  quedaRaioM: 16, // ao cair, o sinal da TV cai junto: a horda em volta desaba
  chefaoAlcanceM: 14, // longe disso, o chefão corre atrás do Juninho (não dá para fugir dele para sempre)
  chefaoCorreMul: 2.4,
  portaCaiS: 0.9, // o tapume cai
  // obra no fim da praia (covil do Monstrão): no último quarteirão, encostada nos prédios, de frente para a escadaria
  obra: { x0: -13.6, x1: -6.2, dy0: 1.2, fundoM: 10.5 },
  recomeco: 'ATUALIZAÇÃO OBRIGATÓRIA DO APLICATIVO: SEUS ITENS EXPIRARAM',
  trechoHpMul: { orla: 1, morro: 1.25 }, // cada trecho começa mais duro que o anterior
};

// Subida do Morro (D90): passar pela escadaria recomeça o trecho (o app "atualiza": nível 1, só o Capacete).
// Antes, com a escadaria aberta e o Juninho a avisoM dela, uma faixa fixa diz o que vai acontecer. Ao passar,
// a atualização vira uma cena curta com o tempo parado: a barra enche (barraS), cada arma e passivo leva o
// carimbo EXPIROU (um a cada passoS, todos em no máximo itensS) enquanto o nível cai, a relíquia "fica com você"
// (reliquiaS depois do último carimbo), o letreiro do trecho entra (tituloS depois) e a tela some em fimS.
// De volta ao jogo, invulnS sem levar dano.
export const ATUALIZACAO = {
  avisoM: 6,
  barraS: 0.9, passoS: 0.16, itensS: 1.3, reliquiaS: 0.35, tituloS: 0.5, fimS: 1.0,
  invulnS: 1.2,
  texto: {
    aviso: 'FIM DA ÁREA DE COBERTURA DO APP',
    avisoSub: 'Subindo, o app atualiza: você volta ao nível 1, só com o Capacete.',
    avisoReliquia: 'A relíquia fica com você.',
    app: 'APP DE ENTREGA',
    titulo: 'Atualização obrigatória',
    expirou: 'EXPIROU',
    reliquia: 'A relíquia não é do app: fica com você',
    bolsa: 'Bolsa de ferramentas: +1 arma',
  },
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
  // dia normal (D88): antes do sinal, a pessoa olha antes de atravessar: não pisa olharM na frente de um carro
  // andando (acima de carroAndandoMs) nem entra nele (folgaCarroM em volta); quem já está na rua termina de passar
  // e o carro para (AVENIDA.pedestre)
  olharM: 10,
  carroAndandoMs: 1.5,
  folgaCarroM: 0.9, // espera fora do que o carro olha para os lados (AVENIDA.pedestre.ladoM), senão ele para à toa
};

// Crises da cidade (D39): em 30% e 60% do Caos do trecho; a TV avisa antes e nada fecha a passagem.
// D87: nenhuma crise começa com o covil aberto ou com o chefão em campo; a que estiver no ar quando ele chega
// acaba em corteS (com o escuro e o mar voltando ao normal), e a que só estava avisada não acontece.
export const CRISES = {
  avisoS: 20, // a TV avisa esse tempo antes
  corteS: 1.5,
  porTrecho: {
    orla: [{ id: 'ressaca', caos: 30, duracaoS: 35 }, { id: 'apagao', caos: 60, duracaoS: 35 }],
    morro: [{ id: 'temporal', caos: 30, duracaoS: 30 }, { id: 'curto', caos: 60, duracaoS: 35 }], // D91: o Baile virou a esplanada
  },
  // Ressaca: o mar avança até perto da ciclovia, a areia molhada deixa lento e as ondas derrubam a horda
  ressaca: { avancaS: 5, aguaSobraM: 1.5, lentoMul: 0.6, ondaS: 5, ondaCorreS: 1.0, ondaDano: 18, ondaEmpurra: 7, ondaEmpurraJuninho: 1.2 },
  // Apagão: a tela escurece; só a luz dos postes e em volta do Juninho; os olhos da horda brilham. A luz é
  // esfumaçada (D87): cheia até miolo da distância e some aos poucos até luz*M; os postes têm um brilho quente
  apagao: { luzPosteM: 5.5, luzJuninhoM: 4.2, miolo: 0.3, escuro: 0.8, brilhoPoste: 0.16, achadoLongeM: 14, rampaS: 2 },
  // Baile na laje: a horda em volta para para dançar, mas chega uma leva de Funkeiros
  // Temporal (D91, no lugar do Baile): chuva forte; nas escadarias a água desce como cachoeira e quem está nela
  // escorrega morro abaixo (escorregaMS, o Juninho um pouco menos); a horda escorrega junto
  temporal: { escorregaMS: 1.6, juninhoMul: 0.55, rampaS: 2 },
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
// Relíquias (D40, D67): uma por trecho, sempre no mesmo lugar. Desde o D67 cada uma é uma super: uma carta
// especial fora das vagas de habilidade, com botão próprio, que vem cheia quando é achada e recarrega devagar.
// Vale até o fim da rota (a relíquia da Orla segue para o Morro); achar a outra troca a carta.
export const RELIQUIAS = {
  altinha: {
    nome: 'Bola da Altinha', onde: 'orla', superNome: 'Golaço',
    desc: 'Super: a bola fica gigante e atravessa a tela quicando em todo mundo',
    // a bola gigante (física, D70) cai de caiM em cima da horda e quica por durS: gravidade (m/s²), quique que
    // devolve `restitui` da velocidade até um mínimo (quiqueMin, m/s: ~1,35 m de altura) que se mantém; corre a
    // velM e ricocheteia em quem pega (com um desvio, rad) e na beira da tela (com `efeito`: puxa essa fração para
    // o meio da horda). Só pega quem está embaixo dela
    // (até alturaBate, m); cada um leva dano de novo a cada acertaCadaS; o primeiro quique é um pancadão até
    // impactoRaioM. Carros no caminho levam a pancada (pegam fogo e explodem).
    super: {
      durS: 6, raioM: 0.85, velM: 13, dano: 45, empurra: 10, acertaCadaS: 0.45, carroDano: 60,
      caiM: 6, gravidade: 30, restitui: 0.8, quiqueMin: 9, alturaBate: 1.3, desvio: 0.35, efeito: 0.45, impactoRaioM: 3, impactoDano: 60,
    },
  },
  paredao: {
    nome: 'Paredão de Som', onde: 'morro', superNome: 'Solta o Batidão',
    desc: 'Super: a horda da tela inteira para para dançar, e o grave empurra todo mundo',
    // o paredão cai do céu do lado do Juninho (caiS) e solta o grave: uma onda até raioM (velM, m/s) que bate e
    // empurra; quem está na tela dança por dancaS (o chefão, chefeDancaS) sem andar nem atacar; a cada batidaS
    // o grave bate de novo, com dano pequeno, e quem chega na tela entra na dança
    super: { durS: 4.6, caiS: 0.3, dancaS: 4, chefeDancaS: 1.5, raioM: 12, velM: 32, dano: 40, empurra: 27, batidaS: 0.47, batidaDano: 6 }, // empurra: ~3 m
  },
};
// A super (D67): carga de 0 a 1. Cheia em cargaS só com o tempo; cada inimigo derrubado adianta abateS
// segundos (elite eliteS, chefão chefeS). Não carrega enquanto a super está ativa. Nada de anúncio ou compra.
// A cena de achar a relíquia: o tempo para, o Juninho sobe alturaM em sobeS, a relíquia voa do esconderijo e
// entra nele em chegaS; aí o estouro (luz, som, onda que empurra quem está até raioM) e o jogo volta, com ele
// descendo devagar até durS, sem levar dano. A câmera chega perto dele (zoom, D69): enche em zoomS, dá um
// tranco a mais no estouro e volta ao normal na descida.
// Chegada do Monstrão (D82, pedido do autor): com o covil aberto, a Orla silencia conforme o Juninho chega perto
// da arena, na frente da obra do fim da praia, colada na entrada da favela (música e ambiente somem entre
// silencioDeM e silencioAteM do centro dela, e a horda nasce menos). A disparaM do centro, a música para, o
// tapume da obra cai, a arena fica vazia (sai o que estava no chão dentro da roda), a horda se organiza num
// cerco (juntaS) e o Monstrão vem a pé pela avenida, do fim da Orla (entradaX, orlaTop + entradaDy), a
// velEntrada, com um tremor a cada passoS; dentro do cerco, urra (urroS) e a luta começa. O cerco: linhas de
// gente a espacoM, de raioM, que dá um passo para dentro (passoM) a cada fechaS, até minM; encostar machuca
// (dano a cada cdS) e empurra para dentro; a horda não nasce mais (só a assessoria dele, de dentro do cerco).
// Com o Monstrão no chão, a torcida se espalha em dispersaS e o tapume do fundo da obra cai: a escadaria do
// Morro fica logo ali. centro: o meio da arena, a partir do canto da obra (dx do lado da rua, dy do meio dela).
export const CHEGADA = {
  silencioDeM: 40, silencioAteM: 12, hordaSilencio: 0.25,
  disparaM: 8,
  entradaX: 5.0, entradaDy: 1.2, velEntrada: 4, passoS: 0.62, urroS: 1.3,
  cameraM: 7, // enquanto ele entra, a câmera vai até cameraM na direção dele (para ver o Monstrão chegando)
  cerco: {
    raioM: 9, minM: 4.5, fechaS: 5, passoM: 0.25, linhas: 2, linhaM: 0.85, espacoM: 0.8, limpaM: 0.8,
    dano: 9, cdS: 0.6, empurra: 9, juntaS: 2.4, dispersaS: 2.2, brechaRad: 0.42,
    centro: { dxObra: 1.2, dyObra: -1.5 },
  },
  // atalho "Testar o Monstrão" (tela de início): a Orla aos tempoS (build e horda de quem chegou lá), o covil
  // aberto, a super da relíquia cheia e o Juninho a distM da arena, para sentir o silêncio chegando
  teste: { tempoS: 600, distM: 34, reliquia: 'altinha' },
};

// D89: depois do estouro ele fica no ar, aberto recebendo a luz, até desceS; desce até pousaS e pousa agachado
// (a cena acaba em durS, já de pé). aura.quadros: a folha do Juninho recebendo a aura (tools/montar-aura.py),
// pela hora da cena: [desde (s), quadro]. Sobe (1, 2), se encolhe (3 a 5), treme ('treme': 5 e 6 a cada tremeS),
// se abre logo antes de a relíquia entrar (7 a 9), estica no estouro (10 a 12), o laço aberto ('laco': 13 a 18,
// lacoFps), desce (19, 20) e pousa (21 a 24). Depois de pousar, se o jogador anda, volta a caminhada.
// O baile da esplanada (D91; a chegada no roteiro do autor, D94): o chefe do meio do Morro.
// A chegada: a chegaM da esplanada (o último corredor), o caminho fica vazio de uma vez (a horda vai embora e não
// nasce mais), a música do Morro para, a do baile começa de longe e sobe, e a noite começa a cair (cheia na
// entrada); entrando, a de fora da tela que sobrou vai embora até sobrar hordaMax. Na entrada, a festa: a pista lotada (povo, longe palcoM do palco), o DJ tocando
// atrás da mesa (djAtrasM do fundo) e a horda que vinha atrás dança junto. Em plantaoS as TVs entram no Plantão com
// O Acordão (em silhueta, D21), o som baixa (musica.plantaoMul) e os olhos de todos acendem, um por um, em olhosS;
// encaraS depois, a pancadaria: cada um vira horda (viraS, a transformação em transfS), o mais perto do Juninho por
// último, a polícia do grupo, que tinha ficado de guarda postoM antes da beira, entra para ajudar, e o resto do baile
// vai chegando pelas beiradas (briga). O DJ só olha:
// entra na luta quando o Caos chega em caos.sobe pontos acima do da hora da pancadaria (no máximo caos.max), e cada
// um da festa que cai soma caos.porAbate. Com o DJ no chão, o som cai, quem está na esplanada acorda (acordaM), o
// portão do fundo abre e a noite vai embora em fimS. A música do baile é "Ela Não Vale Nada" (do autor, 130 BPM;
// musica.faseS é a primeira batida, para a dança e as luzes baterem com ela).
export const BAILE = {
  entraM: 2, chegaM: 40, noiteS: 3, noite: 0.62, pistaLuz: 0.45, // pistaLuz: a luz geral da pista (o povo aparece)
  // pedido do autor: a chegaM do baile (o último corredor) o caminho fica vazio de uma vez (a horda vai embora), a música
  // do jogo para e começa a anoitecer (noiteVazio, mais escuro conforme chega); a do baile começa de longe (musica.longe)
  // e sobe até a entrada. Quem volta para trás mais que soltaM depois da chegaM desfaz isso.
  noiteVazio: 0.75, soltaM: 25,
  debanda: { velMul: 2.4, someS: 2.5 }, // a horda indo embora: corre (velMul) para longe do baile e some em someS
  luzJuninho: { festaM: 4.2, festa: 0.85, corredorM: 2.6, corredor: 0.45 }, // a luz em volta dele: na festa e no corredor escuro
  // a música no Plantão: baixa para climaxMul em climaxS (pedido do autor: "o funk tem que baixar um pouco
  // momentaneamente pra acontecer esse clímax") enquanto a câmera está nas TVs; volta para plantaoMul quando a câmera
  // volta (o povo encarando) e para o alto na pancadaria (voltaS)
  musica: { faseS: 0.265, plantaoMul: 0.35, climaxMul: 0.15, climaxS: 0.35, voltaS: 0.6, longe: 0.12 },
  // o povo falando, gritando e assobiando (pedido do autor: "som de pessoas", junto com a música): de longe, baixinho
  // (longe); cheio na festa; cala no Plantão (em plantaoS: todo mundo encarando a TV); na pancadaria (briga) e na
  // roda do DJ (luta), a fração de volume de cada uma
  povoSom: { longe: 0.08, plantaoS: 0.6, briga: 0.45, luta: 0.85 },
  // o povo da festa (pedido do autor: lotado, quase sem espaço): moradores do Morro, mulheres de roupa curta,
  // funkeiros e traficantes, um a cada passoM (com folgaM de sobra para não ficar em fila), até max; povo é o peso
  // de cada um. Ninguém nasce em cima do Juninho (entradaM) nem no palco (palcoM). Na pancadaria, cada um vira horda:
  // o morador vira a horda do Morro, a mulher vira a Mulher de Biquíni da horda e o funkeiro e o traficante viram o
  // inimigo deles (a firma). A arte dos funkeiros loiros está pedida (PEDIDO_MORRO_BAILE.md).
  // moradores: quais moradores do Morro vão ao baile (pedido do autor: os cidadãos da Orla não têm nada a ver com
  // a favela), pelo nome da roupa da horda do Morro (HORDA_MORRO)
  povo: { morador: 35, garota: 38, funkeiro: 23, traficante: 4 },
  moradores: ['listrado'], // na pista, só quem tem a dança (DANCA_ATLAS): a arte dos outros é só a da horda
  moradoresReforco: ['listrado', 'moca', 'moleque', 'tiozinho'], // nos reforços da pancadaria (já horda), todos
  lotacao: { passoM: 1.2, folgaM: 0.35, max: 210, entradaM: 2.6 },
  palcoM: 3.6, beiraM: 0.8, djAtrasM: 0.75,
  hordaMax: 6,
  // plantaoS: a festa antes do Plantão (pedido do autor: chegar, ficar um tempo vendo a festa, a vida acontecendo; só
  // depois o vagabundo aparece nas TVs do palco e o povo muda)
  plantaoS: 20, olhosS: 2.6, encaraS: 1.2, viraS: 1.8, transfS: 1.2, acordaM: 18, fimS: 3,
  telaGrandeS: 0, // a TV grande do Plantão no meio da tela (pedido do autor: não; só as TVs do palco). 0 = sem ela
  // a câmera vai às TVs (pedido do autor: com a câmera no Juninho, ninguém via o Plantão nas TVs do palco): quando o
  // sinal entra, ela vai até o palco em vaiS, dá zoom nas duas TVs (até zoomMax, com margemM de folga dos lados), fica
  // ficaS e volta em voltaS; só então os olhos acendem (olhosS) e o povo encara (encaraS)
  // A ordem da cena (pedido do autor: "primeiro vem o zoom e aí eles aparecem na TV e dão a risada; o duum vem antes
  // e a risada depois, bem sincronizado com a TV e o zoom"), contada do começo do Plantão: duumS, o DUUUUMM junto com
  // o zoom; apareceS, O Acordão entra nas TVs quando a câmera chega (até lá, o clipe da festa), com chiadoS de sinal
  // pegando; risadaS, as duas cabeças começam a rir; olhosTvS, os olhos acendem no "MWAHAHA" da risada (uns 3,1 s
  // depois de ela começar); a câmera fica até um pouco depois disso (ficaS) e volta
  cenaTv: { vaiS: 0.9, ficaS: 4.5, voltaS: 0.9, zoomMax: 1.8, margemM: 0.4, duumS: 0, apareceS: 0.9, chiadoS: 0.25, risadaS: 1.1,
    olhosTvS: 4.2 },
  // o DJ entra quando o Caos chega na marca: sobe pontos acima do de quando a pancadaria começa, e pelo menos min
  // (pedido do autor: chegava rápido demais no DJ e o Caos mal subia); cada um da festa que cai soma porAbate
  caos: { sobe: 40, min: 70, max: 95, porAbate: 0.25 },
  // na pancadaria, a pista toda encara o Juninho, mas parte para cima aos poucos: no máximo max da festa brigando
  // de uma vez, o mais perto primeiro (viraS entre o primeiro e o último de cada leva); cada um que cai, outro da
  // pista vem. Acabando a pista, o resto do baile chega pelas beiradas (ritmo por segundo, longe longeM do Juninho;
  // povo: o peso de cada um), até o DJ entrar. Com o DJ na luta, quem não brigou fica olhando; com ele no chão, vai
  // embora.
  briga: { max: 36, ritmo: 2.5, longeM: 7, povo: { morador: 6, garota: 4, funkeiro: 2 } },
  // quando o DJ entra na luta, a roda abre: quem estava brigando para, se afasta raioM do Juninho e fica olhando
  // de olho aceso (a luta é o Juninho contra o DJ e a firma que ele chama)
  roda: { raioM: 5 },
  postoM: 2.5,
  // luzes do baile: refletores de néon girando (cores, raio no chão), as TVs (largura e altura, m) e o brilho
  luzes: { n: 7, raioM: 4.2, giroS: 5.5, cores: ['255,60,200', '60,220,255', '170,90,255', '60,255,140', '255,170,40'], brilho: 0.3 },
  // as duas TVs, uma de cada lado do palco (palcoDx do meio dele, em cima dos paredões): a tela (m) e a altura da
  // beirada de baixo dela, as da arte do Figma
  tv: { larg: 2.3, alt: 1.3, altura: 2.43, palcoDx: 3.1,
    // O Acordão no Plantão (baile_acordao_tv, tirada do busto aprovado, docs/arte/conceito_acordao/bustos_viloes.png,
    // por tools/acordao-tv.py): folha de 2 quadros das MESMAS caras, olhos normais e olhos acesos. Pedido do autor:
    // aparece de olhos normais; quando os olhos acendem, começa a zoeira. acendeS: quanto leva a passagem de um quadro
    // para o outro; olhos (0 a 1 no quadro) e raio (fração da largura): um pulso leve por cima dos olhos já acesos
    acordao: { quadros: 2, olhos: [[0.3102, 0.5372], [0.4346, 0.4791], [0.589, 0.5116], [0.712, 0.5535]], raio: 0.022,
      pulso: 0.45, acendeS: 0.35 } },
  // o cenário da festa (pedido do autor): palco com a mesa do DJ entre os paredões e o néon no muro, treliças de
  // iluminação (a do palco emoldura a mesa do DJ; duas de lado, nos cantos da frente), canhões de luz no chão, o
  // globo espelhado no meio da pista, dois bares (com engradados, mesas e cadeiras para arremessar), sinuca, sofá,
  // isopor e a churrasqueira do espetinho. Treliça, globo, TVs e canhões têm arte do Figma (D93), desenhada na escala
  // dela: a largura (ou a altura) daqui decide o tamanho. Mesa do DJ e néon ainda são desenho de código.
  cenario: {
    // a treliça do palco: largura da arte inteira (m) e a distância do fundo; altM só vale para o desenho de código
    trelica: { palcoLargM: 4.6, palcoDy: 1.0, altM: 4.4 },
    refletores: 5,
    // as treliças de lado (pedido do autor: nos cantos, fora do meio da pista): uma junto de cada muro, nos cantos da
    // frente, correndo para o fundo, com os refletores virados para a pista. altM: a torre (escala da arte); compM:
    // a viga; beiraM: do muro; frenteM: da beirada da frente até a torre de perto
    trelicaLado: { altM: 4.3, compM: 4.2, beiraM: 1.3, frenteM: 1.6, luzes: 3 },
    // canhões de luz no chão (altura da arte, m): dois por fora dos paredões e dois nos cantos da frente, junto das
    // treliças de lado (frenteDx: do muro; frenteM: da beirada da frente)
    canhao: { altM: 1.3, palcoDx: 4.5, palcoDy: 2.6, frenteDx: 4.5, frenteM: 4.0 }, // pedido do autor: mais para dentro (eram 4.8, 1.4, 2.0, 1.0)
    globoAltM: 4.9, globoDy: 0.45, globoRaioM: 0.6, reflexos: 46, brilhosGlobo: 7,
    neonAltM: 4.5, neonTexto: 'BAILE DA ESPLANADA',
    mesaDj: { larg: 2.4, prof: 0.9, alt: 1.05, dy: 1.5 },
  },
  pulsoBpm: 130, // o batidão: pulso das luzes e o passo da dança
  danca: { batidasPorVolta: 2 }, // quem tem a arte da dança (DANCA_ATLAS): os 6 quadros duram 2 batidas
  // canhões de luz apontados para o céu (pedido do autor), saindo da lente de cada canhão: varrem ±varreRad e se veem de longe
  // (de pertoM para cá; acima da tela, a claridade colorida na beira de cima avisa onde é o baile)
  canhoes: { varreRad: 0.42, giroS: 3.2, forca: 0.3, pertoM: 70, cores: ['200,230,255', '255,80,210', '90,220,255', '200,140,255'] },
};

export const SUPER = {
  cargaS: 75, abateS: 0.04, eliteS: 3, chefeS: 15,
  cena: { durS: 3.35, sobeS: 0.55, voaS: 0.3, chegaS: 1.55, desceS: 2.45, pousaS: 2.85, alturaM: 1.3, raioM: 8, dano: 60, empurra: 18, zoom: 1.6, zoomS: 0.9, tranco: 0.14, trancoS: 0.25 },
  aura: {
    quadros: [[0, 1], [0.25, 2], [0.55, 3], [0.65, 4], [0.77, 5], [0.9, 'treme'], [1.25, 7], [1.35, 8], [1.45, 9],
      [1.55, 10], [1.67, 11], [1.77, 12], [1.89, 'laco'], [2.45, 19], [2.65, 20], [2.85, 21], [2.95, 22], [3.12, 23], [3.22, 24]],
    tremeS: 0.06,
    lacoFps: 10,
  },
};
// pista da relíquia (D67): o facho de luz dourado que sobe do esconderijo, visto até fachoM; fora da tela,
// a claridade dourada na beira da tela, do lado dela
export const FACHO_RELIQUIA = { fachoM: 40, alturaM: 14, larguraM: 1.1 };

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
    // o Burocrata-Monstro é de São Paulo (D80): na Orla, o lugar dele é do Bicheiro, que vem como elite
    if (caos >= 45) list.push({ type: 'fiscal', w: 0.1 });
    if (caos >= 30) list.push({ type: 'rato', w: 0.035 }); // Rato de Academia (D73; do tamanho do Político, D79)
    // Coach e Agiota (D76) são de São Paulo e o Encostado (D77) de Brasília: entram quando os trechos deles existirem (D78)
    if (caos >= 35) list.push({ type: 'pastor', w: 0.01 }); // Pastor Picareta (D77)
    return list;
  },
  // ajuste "Elenco completo" (ligado por padrão enquanto a arte entra): todos os inimigos desde 00:00
  castTestComposition: [
    { type: 'telespectador', w: 1 },
    { type: 'golpista', w: 0.3 },
    { type: 'fiscal', w: 0.25 },
    { type: 'rato', w: 0.12 },
    { type: 'pastor', w: 0.05 },
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
  elitesOrla: ['politico', 'bicheiro'], // revezam (D80): o primeiro é sempre o Político
};

// Horda do Morro (D37): moradores hipnotizados com roupa de favela (listrado, moça, moleque, senhor, senhora,
// tiozinho), cada um com caminhada, ataque e raiva (sprites.js, CROWD_ANIM_MORRO)
// roupas da horda do Morro, na ordem das artes (CROWD_ANIM_MORRO em sprites.js): a roupa n é o tint 100 + n
export const HORDA_MORRO = { roupas: 6, nomes: ['listrado', 'moca', 'moleque', 'senhor', 'senhora', 'tiozinho'] };
// horda da Orla: além dos três telespectadores, as roupas novas do elenco v2 (biquíni, sunga, pochete, controle
// remoto, telemarketing, peão); `novas`: a parte da horda que sai com elas
export const HORDA_ORLA = { roupasNovas: 4, novas: 0.5 }; // D78: Telemarketing e Peão de Obra são da horda de São Paulo

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
  decretoMarcaS: 1.2, // a marca "INDEFERIDO" do Decreto (D66) some logo: ela pega a tela inteira
};
export const EVOLUTIONS = [
  { from: 'capacete', requires: 'tenis', to: 'entrega' },
  // D66 (aprovadas pelo autor): uma evolução para cada arma; cada passiva serve para no máximo duas
  { from: 'chinelo', requires: 'raiva', to: 'contaTres' },
  { from: 'boleto', requires: 'cafe', to: 'juros' },
  { from: 'carimbo', requires: 'mochila', to: 'decreto' },
  { from: 'maleta', requires: 'ima', to: 'caixa2' },
  { from: 'picole', requires: 'mochila', to: 'frenteFria' },
  { from: 'mototaxi', requires: 'tenis', to: 'bonde' },
  { from: 'microfone', requires: 'marmita', to: 'cadeia' },
  { from: 'gato', requires: 'cafe', to: 'apagaoGeral' },
  { from: 'caramelo', requires: 'marmita', to: 'matilha' },
];

// Build completa (D66): com tudo no máximo, o nível novo não abre mais a tela de cartas. Vira um bônus na hora:
// com a vida abaixo de curaAbaixo, "PASTEL!" cura `cura`; senão, "HORA EXTRA!" dá +danoMais de dano. E rende
// `gorjetas` a mais no fim do turno.
export const NIVEL_MAXIMO = { curaAbaixo: 0.5, cura: 30, danoMais: 0.05, gorjetas: 3 };

// Evoluções (D66): o padrão da arma de base (`base`) com os números dela no nível 5 e o que muda.
const nivel5 = (id) => {
  const lv = WEAPONS[id].levels;
  const out = { ...lv[0] };
  for (const l of lv.slice(1)) for (const [k, v] of Object.entries(l)) if (k !== 'desc') out[k] = (out[k] || 0) + v;
  delete out.desc;
  return out;
};
const evolucao = (base, name, role, muda) => ({ name, role: `EVOLUÇÃO: ${role}`, evolution: true, base, levels: [{ ...nivel5(base), ...muda }] });
Object.assign(WEAPONS, {
  // dirs: rajada para todos os lados; espera: a contagem "1… 2… 3!" antes de sair
  contaTres: evolucao('chinelo', 'Vou Contar Até Três', 'a chinelada sai para todos os lados', { dirs: 8, espera: 0.5, dmg: 30, pierce: 4, back: 0, cd: 1.5 }),
  // juros: cada cobrança gera outro boleto, até esse número
  juros: evolucao('boleto', 'Juros Compostos', 'cada cobrança gera outro boleto, até 12', { juros: 12, dmg: 24, duration: 6, cd: 4 }),
  // tela: um carimbo só, gigante, em cima do Juninho (half: meia largura em m)
  decreto: evolucao('carimbo', 'Decreto', 'um carimbo gigante bate na tela inteira', { tela: true, count: 1, half: 7.5, dmg: 70, slowT: 4, cd: 6 }),
  // caixa2: quantas vezes as notas atraem a horda e explodem de novo
  caixa2: evolucao('maleta', 'Caixa Dois', 'as notas atraem a horda e explodem de novo', { caixa2: 2, dmg: 55 }),
  frenteFria: evolucao('picole', 'Frente Fria', 'a trilha de gelo congela todo mundo', { radius: 1.6, duration: 6, freeze: 1, dmg: 10 }),
  bonde: evolucao('mototaxi', 'Bonde dos Mototáxis', '3 motos em fila atravessam a tela', { count: 3, dmg: 80, width: 1.8, cd: 2.8 }),
  // cura: vida devolvida ao Juninho a cada pulso
  cadeia: evolucao('microfone', 'Cadeia Nacional', 'o pulso empurra tudo e cura o Juninho', { radius: 4, knock: 6, dmg: 16, cura: 1, cd: 0.6 }),
  // paraF: lentidão de quem leva o choque (0: parado)
  apagaoGeral: evolucao('gato', 'Apagão Geral', 'o choque pula por 12 e deixa todos parados', { chain: 12, stunS: 1, paraF: 0, dmg: 40 }),
  matilha: evolucao('caramelo', 'Matilha do Bairro', 'vem a matilha inteira de vira-latas', { count: 5, dmg: 80 }),
});

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
  chegada: ['SILÊNCIO NA ORLA. A HORDA PARA, FAZ UMA RODA E OLHA PARA A AVENIDA', 'ALGO ENORME VEM A PÉ PELA AVENIDA. O TRÂNSITO PAROU SOZINHO'],
  chegadaUrro: ['O MONSTRÃO ENTRA NA RODA. A TORCIDA FECHA ATRÁS DELE'],
  cercoEmpurra: ['A TORCIDA NÃO DEIXA NINGUÉM SAIR DA RODA. E ELA ESTÁ FECHANDO'],
  bicheiro: ['BICHEIRO ABRE A BANCA NO CALÇADÃO. POLÍCIA DIZ QUE NÃO VIU', 'APONTADORES CORREM NA ORLA. A BANCA ACEITA PIX E FIADO'],
  bicheiroPaga: ['ENTREGADOR ACERTA NO BICHO E LEVA O COFRE. BANCA PEDE RECONTAGEM'],
  unlock: ['O TAPUME CAIU. NO FIM DA PRAIA, UMA ESCADARIA QUE NINGUÉM TINHA VISTO', 'O FIM DA PRAIA ABRIU UMA PASSAGEM. GPS NÃO RECONHECE O CAMINHO'],
  avisoItens: ['APP AVISA: ACIMA DA ORLA, SEUS ITENS PERDEM A VALIDADE', 'TERMOS DE USO MUDARAM: QUEM SUBIR O MORRO COMEÇA DO ZERO'], // D90
  morro: ['ENTREGADOR COMEÇA A SUBIDA. APP CALCULA 3 MINUTOS (MENTIRA)'],
  recomeco: ['ATUALIZAÇÃO OBRIGATÓRIA DO APLICATIVO: SEUS ITENS EXPIRARAM', 'APP ATUALIZOU: NOVO TURNO, NOVA ENTREGA, ZERO BENEFÍCIOS'],
  // o Caos do trecho chama o chefão (D39): sinal na Calamidade e o chamado em 100%, sem dizer o nome
  covilSinal_orla: ['MORADORES RECLAMAM DE BARULHO DE FERRO BATENDO NO FIM DA PRAIA'],
  covilSinal_morro: ['RÁDIO COMUNITÁRIA: MOVIMENTAÇÃO NO ALTO DO MORRO. MORADORES FECHAM AS JANELAS'],
  covilAberto_orla: ['PLANTÃO: ALGO ENORME SE MEXE NO FIM DA AVENIDA. HELICÓPTERO DA TV JÁ ESTÁ NO LOCAL'],
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
  crise_temporal_aviso: ['DEFESA CIVIL AVISA: TEMPORAL CHEGANDO NO MORRO EM 20 SEGUNDOS'],
  crise_temporal: ['TEMPORAL! A ESCADARIA VIROU CACHOEIRA. SEGURA NO CORRIMÃO (NÃO TEM CORRIMÃO)'],
  // o baile da esplanada (D91)
  baileComeca: ['BAILE NA ESPLANADA: O MORRO INTEIRO SUBIU PARA DANÇAR', 'BATIDÃO NA ESPLANADA. A FESTA NÃO TEM HORA PARA ACABAR'],
  baileAcordao: ['PLANTÃO: O RESPONSÁVEL POR TUDO MANDA UM RECADO, AO VIVO DE BRASÍLIA', 'PLANTÃO URGENTE: DE BRASÍLIA, AS DUAS CABEÇAS DO PAÍS FALAM COM A NAÇÃO'],
  baileSinal: ['O SINAL PEGOU NO BAILE. A PISTA INTEIRA PARTE PARA CIMA DO ENTREGADOR', 'PANCADARIA NO BAILE. O DJ SEGUE TOCANDO: O SHOW NÃO PODE PARAR'],
  policiaEntra: ['A POLÍCIA ENTRA NO BAILE PARA GARANTIR A ORDEM. A ORDEM NÃO FOI ENCONTRADA', 'PM ENTRA NA ESPLANADA. COMANDO DIZ QUE A FESTA "SAIU DO CONTROLE"'],
  djPlantao: ['DJ PLANTÃO ASSUME O SOM: A BATIDA AGORA É DO SINAL', 'NO PALCO, DJ PLANTÃO. O PANCADÃO AGORA É AO VIVO E HIPNÓTICO'],
  djDrop: ['DJ PLANTÃO VAI SOLTAR O DROP. A PISTA ENLOUQUECE', 'O GRAVE VAI CAIR. QUEM ESTIVER PERTO, VOA'],
  fase_dj: ['DJ PLANTÃO AUMENTA O VOLUME. VIZINHO RECLAMA, NINGUÉM ESCUTA', 'DJ PLANTÃO TOCA A VERSÃO ESTENDIDA'],
  djCaiu: ['O SOM CAIU. A PISTA ACORDOU, E O PORTÃO DO ALTO DO MORRO ABRIU', 'DJ PLANTÃO SAI DO AR. O PORTÃO DO FUNDO DA ESPLANADA ABRIU'],
  policiaBaile: ['POLÍCIA ACOMPANHA O BAILE DE LONGE', 'POLÍCIA DECIDE QUE O BAILE NÃO É COM ELA'],
  crise_curto_aviso: ['GATONET SOBRECARREGADO. CHEIRO DE FIO QUEIMADO NO MORRO'],
  crise_curto: ['GATO DE LUZ EM CURTO! FAÍSCA PARA TODO LADO, OLHE ONDE PISA'],
  cofre: ['ENTREGADOR ACHA COFRE NA ORLA. RECEITA DIZ QUE NÃO VIU NADA', 'COFRE ABERTO AO VIVO. DONO AINDA NÃO SE APRESENTOU'],
  cofre5: ['DEU BICHO! ENTREGADOR TIRA A SORTE GRANDE. BANCA PEDE RECONTAGEM'],
  agiota: ['AGIOTA COBRA O ENTREGADOR NO MEIO DA RUA: JUROS DE 30% AO DIA', 'DEVEDOR É MARCADO NO CALÇADÃO. ESPECIALISTA: "É SÓ NÃO PEGAR EMPRESTADO"'],
  pastor: ['PASTOR DE TV FAZ CULTO NO CALÇADÃO: A CURA VEM DEPOIS DA OFERTA', 'HORDA LEVANTA CURADA NA ORLA. CHAVE PIX DO MINISTÉRIO NA TELA'],
  encostado: ['HOMEM DE COLAR CERVICAL É VISTO CORRENDO NA ORLA. PERÍCIA FICA PARA 2031', 'ENCOSTADO DE MULETA APOSTA CORRIDA COM ENTREGADOR E GANHA'],
  coach: ['COACH DÁ PALESTRA GRÁTIS NO CALÇADÃO E A HORDA SAI MOTIVADA', 'PALESTRA MOTIVACIONAL PARA O TRÂNSITO NA ORLA. INGRESSO: SUA ALMA'],
  laranja: ['LARANJA CAI E ESPALHA O DINHEIRO DO CHEFE NA CALÇADA', 'O LARANJA APANHOU PELO POLÍTICO. A ASSESSORIA NEGA QUALQUER LIGAÇÃO'],
  reliquia_altinha: ['ENTREGADOR ACHA A BOLA DA ALTINHA. A PRAIA INTEIRA PARA PARA OLHAR'],
  reliquia_paredao: ['ENTREGADOR ACHA UM PAREDÃO NA LAJE. O MORRO INTEIRO SENTE O GRAVE'],
  super_altinha: ['GOLAÇO! A BOLA DA ALTINHA ATRAVESSA A RUA LEVANDO A HORDA JUNTO', 'O NARRADOR PERDE A VOZ: QUE GOLAÇO DO ENTREGADOR'],
  super_paredao: ['SOLTA O BATIDÃO: A HORDA INTEIRA PARA PARA DANÇAR', 'O GRAVE BATE E NINGUÉM RESISTE: É BAILE NO MEIO DA RUA'],
  reliquia_leva: ['O APLICATIVO ATUALIZOU, MAS A RELÍQUIA CONTINUA NA MOCHILA DO ENTREGADOR'],
  grupo: ['ENTREGADOR FORMA GRUPO DE SOBREVIVENTES. APP COBRA TAXA POR PASSAGEIRO', 'MAIS UM SE JUNTA AO ENTREGADOR. TV CHAMA DE AGLOMERAÇÃO'],
  grupoPerdeu: ['SOBREVIVENTE CAI E VIRA TELESPECTADOR. AUDIÊNCIA AGRADECE'],
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
  buildCompleta: ['BUILD COMPLETA: AGORA É ATRÁS DO CHEFÃO. O APP AGRADECE A DEDICAÇÃO (E NÃO PAGA HORA EXTRA)'],
  evolucao: ['EVOLUÇÃO! O APP CHAMA DE "NOVA FUNCIONALIDADE". O ENTREGADOR CHAMA DE MILAGRE'],
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
// listados em sons.js (ARQUIVOS); sem arquivo, toca o provisório feito em código. O vol de quem tem arquivo
// gravado foi acertado para o gravado soar perto do provisório (os gravados têm o pico preso em −1 dB e soam
// mais baixos; vol acima de 1 é ganho, e o compressor do fim segura).
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
  // o baile ao vivo (pedido do autor: "um baixo proeminente quando está longe e depois vai chegando perto"): a faixa
  // do baile passa por um filtro que de longe deixa só o grave (fechadoHz) e abre até abertoHz chegando (curva: o
  // quanto ele segura fechado antes de abrir); o grave sobe graveDb (longe → perto) e o eco da rua (ecoS de cauda)
  // vai de eco.longe a eco.perto
  aoVivo: { fechadoHz: 260, abertoHz: 17000, curva: 1.7, graveHz: 120, graveDb: [10, 4], ecoS: 1.6, eco: [0.45, 0.12], suaveS: 0.25 },
  // o povo do baile (feito em código, enquanto não chega um gravado): vozes (quantas pessoas), segundos do laço,
  // volume e o filtro de longe (fechadoHz) a perto (abertoHz)
  povo: { vozes: 18, segundos: 9, vol: 0.38, fechadoHz: 550, abertoHz: 7500 },
};
export const SONS = {
  // Juninho
  dano: S(0.85, 1, 0.3, 3, FIXO), morte: S(1, 1, 1, 3, FIXO), nivel: S(0.75, 1, 0.3, 2, FIXO),
  xp: S(0.6, 3, 0.04, 1, { varia: 0.12 }), cura: S(0.5, 1, 0.15, 2), gorjeta: S(1.1, 2, 0.08, 2),
  pega: S(0.5, 1, 0.1, 2), arremesso: S(0.45, 3, 0.06, 1),
  // golpes e horda
  golpe: S(0.4, 4, 0.03, 1, { varia: 0.12 }), bonk: S(0.45, 3, 0.04, 1, { varia: 0.1 }), tapa: S(0.7, 3, 0.04, 1, { varia: 0.1 }),
  morte_horda: S(0.55, 4, 0.04, 1, { varia: 0.15 }), morte_elite: S(0.8, 2, 0.1, 3),
  acorda: S(0.5, 2, 0.1, 1), gemido: S(0.5, 2, 0.5, 1, { varia: 0.15 }),
  quebra_plastico: S(1.2, 2, 0.05, 2), quebra_madeira: S(0.95, 2, 0.05, 2), baque: S(0.95, 2, 0.05, 2),
  explosao: S(1.4, 2, 0.08, 3), atropelo: S(0.7, 2, 0.08, 2), buzina: S(0.5, 1, 0.5, 2),
  lataria: S(0.45, 3, 0.05, 1, { varia: 0.12 }), pega_fogo: S(0.7, 2, 0.3, 3), // porrada no carro; o carro pegou fogo (aviso)
  // habilidades
  chinelo: S(0.4, 2, 0.05, 1), boleto: S(0.3, 1, 0.2, 1), carimbo: S(0.7, 2, 0.05, 2),
  moto: S(0.6, 1, 0.3, 2), megafone: S(0.35, 1, 0.3, 1), gato: S(0.45, 2, 0.08, 1), latido: S(0.5, 1, 0.25, 2),
  mordida: S(0.5, 2, 0.08, 1), bola: S(0.45, 2, 0.06, 1), paredao: S(0.85, 1, 0.5, 2),
  // inimigos
  grito_funkeiro: S(0.8, 2, 0.3, 2), mira: S(0.4, 2, 0.15, 3), tiro: S(1.4, 4, 0.04, 2), radio: S(0.5, 1, 0.5, 2),
  urro: S(0.9, 1, 0.6, 3), investida: S(0.75, 1, 0.3, 3), soco_chao: S(1.1, 1, 0.2, 3), anilha: S(0.55, 2, 0.2, 2),
  carro_cai: S(0.9, 1, 0.3, 3), cata: S(0.35, 2, 0.2, 1), roubo: S(0.6, 1, 0.3, 3), multa: S(0.5, 1, 0.5, 2),
  // avisos, crises e chefão
  aviso_chao: S(0.4, 2, 0.15, 3), holofote: S(0.7, 2, 0.1, 2), // o canhão de luz girando (pedido do autor: "mais mecânico, de dobradiça")
  // O Acordão rindo na TV do Plantão (pedido do autor: "risada diabólica de ambos, duas, sobrepostas"): uma risada por
  // cabeça, as duas juntas, o Barbudo à esquerda e o Capitão à direita (pan: lado fixo, de −1 a 1), sem variar o tom
  risada_barbudo: S(1, 1, 5, 3, { ...FIXO, pan: -0.35, varia: 0 }), risada_capitao: S(1, 1, 5, 3, { ...FIXO, pan: 0.35, varia: 0 }),
  // o DUUUUMM do zoom nas TVs (pedido do autor: "uma coisa mais tipo um duuuumm"), por baixo das risadas
  duum_tv: S(0.8, 1, 5, 3, { ...FIXO, varia: 0 }),
  crise: S(0.55, 1, 1, 3, FIXO), onda: S(0.7, 1, 1, 2, FIXO), apagao: S(0.7, 1, 1, 3, FIXO),
  faisca: S(0.5, 3, 0.08, 2), chefe: S(0.75, 1, 2, 3, FIXO), fase: S(0.7, 1, 1, 3, FIXO),
  // interface e TV
  toque: S(0.3, 2, 0.05, 2, FIXO), carta: S(0.4, 1, 0.1, 2, FIXO), cofre: S(0.6, 1, 0.5, 3, FIXO),
  reliquia: S(0.6, 1, 1, 3, FIXO), passagem: S(0.55, 1, 1, 3, FIXO),
  // super da relíquia (D67): a subida na cena, o estouro, o disparo e a carga cheia
  reliquia_sobe: S(0.7, 1, 1, 3, FIXO), reliquia_estouro: S(1, 1, 1, 3, FIXO), super: S(0.8, 1, 1, 3, FIXO), super_pronta: S(0.5, 1, 1, 2, FIXO),
  // ambiente (em laço, um por trecho)
  amb_orla: S(1.3, 1, 0, 1, FIXO), amb_morro: S(1, 1, 0, 1, FIXO),
};
// som do golpe em quem leva, por habilidade (null: a habilidade já tem o som dela, ou é contínua)
export const SOM_GOLPE = {
  // o capacete usa o golpe gravado (Firefly), mais pesado que o bonk
  capacete: 'golpe', entrega: 'golpe', chinelo: 'tapa', mototaxi: 'atropelo', carro: 'atropelo',
  golaco: 'bola', batidao: null, reliquia: 'baque', // super da relíquia (D67): a bola gigante; o grave já tem som
  caramelo: null, microfone: null, gato: null, curto: null, ressaca: null, paredao: null, objeto: null, carimbo: null,
  maleta: null, explosao: null, ressacaOnda: null,
  grupo_tiro: null, bolsa: null, picole_grupo: null, // o grupo de sobreviventes (o som sai de quem bate)
};
// som de quando a habilidade dispara (null: o som vem no impacto)
export const SOM_ARMA = {
  capacete: 'arremesso', entrega: 'arremesso', chinelo: 'chinelo', boleto: 'boleto', maleta: 'arremesso', picole: null, // o picolé fica sem som (o autor: "é algo constante, derretendo, fica chato")
  mototaxi: 'moto', gato: 'gato', carimbo: null, caramelo: null,
  microfone: null, // o Megafone ativo fica sem o barulho (pedido do autor)
};

// Figurantes e o grupo de sobreviventes (D55, D56): a garota da esquina e o policial do pé do morro (Orla), a
// tropa nas vielas (Morro) e o picolezeiro andando na areia. Passeiam em volta do lugar deles e se defendem da
// horda (arma); quando o Juninho passa perto, entram no grupo dele e vão atrás, lutando junto. A horda que
// encosta tira vida deles; sem vida, viram telespectador. Depois de voltaS, outro aparece no lugar, fora da tela.
export const FIGURANTES = {
  grupoMax: 3, // quantos andam com o Juninho
  entraM: 2.2, // o Juninho passa a essa distância: entra no grupo
  segueM: 1.7, // o grupo anda em leque atrás dele, a essa distância
  correMS: 4.6, // correndo atrás do Juninho (m/s)
  vida: { garota: 75, pm: 110, tropa: 140, picole: 85 }, // eram 90, 140, 180 e 100: aguentavam a partida inteira
  danoRecebidoMul: 1.0, // a horda encostando tira essa fração do dano que tiraria do Juninho (era 0,5: ninguém caía)
  aggroM: 4, // quem da horda está a essa distância de um parceiro, e mais perto dele que do Juninho, vai nele
  agarraM: 0.3, // a horda agarra o parceiro um pouco antes de encostar (ele não foge como o Juninho)
  atropeloMul: 2, // o carro da avenida tira do figurante o dobro do que tira do Juninho
  arma: {
    pm: { alcanceM: 7, cadaS: 0.9, dano: 12, empurra: 0.6 }, // pistola
    tropa: { alcanceM: 9, cadaS: 0.7, dano: 14, empurra: 0.8 }, // fuzil
    garota: { alcanceM: 1.4, cadaS: 0.8, dano: 18, empurra: 2.5, golpeS: 0.4 }, // bolsada em quem chega colado (golpeS: a animação)
    picole: { alcanceM: 5, cadaS: 2.4, dano: 6, congelaS: 1.6 }, // picolé que congela
  },
  voltaS: 40, // quem caiu volta para o lugar dele depois disso
  voltaLongeM: 14, // e só longe do Juninho, fora da tela
  passoMS: 0.55, // andando (m/s)
  pausaS: [1.5, 4.5], // parado entre um passeio e outro
  raioM: { garota: 0.9, pm: 0.9, tropa: 0.7 }, // quanto se afastam do lugar deles
  picoleCadaQuarteiroes: 2, // um picolezeiro a cada tanto de quarteirão, onde a areia tem caminho livre
  picoleX: 1.6, // a faixa dele na areia, a partir do começo dela (entre os coqueiros e os guarda-sóis)
  picoleMinM: 8, // o trecho livre mínimo para ele ir e voltar
  reageM: { garota: 3.5, pm: 8, tropa: 10, picole: 5 }, // a horda chegando, fora do alcance: raiva (o policial mira)
  gritoCadaS: [8, 14], // o picolezeiro grita (pose de raiva)
  gritoS: 1.3,
  grito: 'OLHA O PICOLÉ!',
  vistaM: 40, // longe do Juninho, ficam parados (ninguém vê)
};
