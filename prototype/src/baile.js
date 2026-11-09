// O baile da esplanada (D91; a chegada no roteiro do autor, D94): o chefe do meio do Morro.
// Chegando: os corredores da favela esvaziam (a horda para de nascer e a de fora da tela vai embora), a música do
// Morro some e a do baile sobe, e a noite cai; quando a noite cai, o Juninho chega na festa. A pista está lotada,
// todo mundo dançando, e o DJ Plantão toca lá no fundo, no palco, com uma TV de cada lado. Nas TVs entra O Acordão
// (as duas cabeças de Brasília, em silhueta: D21) e os olhos do povo todo acendem com o brilho da noite. Aí começa
// a pancadaria: todo mundo para cima do Juninho, e a polícia que tinha ficado na entrada entra para ajudar. O DJ
// segue tocando, só olhando; quando o Caos sobe o bastante, ele entra na luta (dj.js). Com ele no chão, o som cai,
// a pista acorda e o portão do fundo abre o resto do morro. Números em config.js (BAILE). Sem DOM.
import { BAILE, ENEMIES, HORDA_MORRO } from './config.js';
import { makeRng } from './math.js';
import { palcoDoBaile } from './cenario.js';

const clamp01 = (v) => Math.max(0, Math.min(1, v));
// a arte de cada um do povo (WALK_ATLAS; o morador usa a da horda do Morro, pelo tint) e o tamanho
const ARTE_DO_POVO = { morador: null, garota: 'gp', funkeiro: 'fk', traficante: 'tf' };
const TAM_DO_POVO = { morador: null, garota: 1.0, funkeiro: ENEMIES.funkeiro.size, traficante: ENEMIES.traficante.size };
/** O tint de um morador do Morro sorteado da lista (BAILE.moradores na pista): a roupa n da horda do Morro. */
const tintMorador = (rng, lista = BAILE.moradores) => 100 + HORDA_MORRO.nomes.indexOf(lista[Math.floor(rng() * lista.length)]);

/** Distância de (x, y) até a esplanada (0 dentro dela). */
export function distEsplanada(w, x, y) {
  const k = w.baile;
  const dx = Math.max(k.x0 - x, 0, x - k.x1);
  const dy = Math.max(k.y0 - y, 0, y - k.y1);
  return Math.hypot(dx, dy);
}

/** O baile pode acontecer nesta partida (carreira, no Morro, com a esplanada e o portão ainda fechado). */
const temBaile = (game) => !!(game.world && game.world.baile && !game.horda && game.segment === 'morro');

/**
 * Avança o baile: a chegada (corredores esvaziando, a música e a noite), a festa, o Plantão (os olhos acendem), a
 * pancadaria, o DJ e o fim. Deixa no jogo a noite (game.noiteBaile), o quanto já se chegou (game.chegadaBaile, 0 a
 * 1), o som do baile (game.somDoBaile, 0 a 1, para a música) e, na pancadaria, a marca do Caos em que o DJ entra.
 */
export function updateBaile(game, dt) {
  if (!temBaile(game)) {
    game.noiteBaile = 0;
    game.chegadaBaile = 0;
    game.somDoBaile = 0;
    game.caosMarca = null;
    return;
  }
  const B = BAILE;
  const w = game.world;
  const p = game.player;
  let S = game.baile;
  const d = distEsplanada(w, p.x, p.y);
  if (!S && !w.portaoAberto && !game.over && d <= B.entraM) S = iniciar(game);
  // a chegada: de chegaM até a beira (0 longe, 1 na entrada); depois do DJ, nada
  const perto = w.portaoAberto ? 0 : 1 - clamp01((d - B.entraM) / (B.chegaM - B.entraM));
  game.chegadaBaile = S ? (S.fase === 'fim' ? 0 : 1) : perto;
  if (!S && perto > 0) esvaziarCorredores(game, perto, dt);
  // a noite cai com a chegada (cheia na entrada) e vai embora depois do DJ
  const alvo = (S && S.fase === 'fim') || (!S && w.portaoAberto) ? 0 : S ? 1 : perto;
  const passo = dt / (S && S.fase === 'fim' ? B.fimS : B.noiteS);
  const n = game.noiteBaile || 0;
  game.noiteBaile = alvo > n ? Math.min(alvo, n + passo) : Math.max(alvo, n - passo);
  game.somDoBaile = somDoBaile(S, perto);
  game.caosMarca = S && S.fase === 'briga' ? { v: S.caosDJ, nome: 'DJ' } : null;
  if (!S) return;
  S.t += dt;
  S.faseT += dt;
  for (const c of S.pessoas) atualizarPessoa(game, S, c, dt);
  switch (S.fase) {
    case 'festa':
      if (S.faseT >= B.plantaoS) plantao(game, S);
      break;
    case 'plantao':
      if (S.faseT >= B.olhosS + B.encaraS) briga(game, S);
      break;
    case 'briga':
      // a pista vem em levas (e depois o resto do baile); o DJ só olha e entra quando o Caos chega na marca
      chegaMaisGente(game, S, dt);
      if (game.caos >= S.caosDJ) soltarDJ(game, S);
      break;
    default:
      break;
  }
}

/** O som do baile (0 a 1): sobe na chegada, cheio na festa, baixa no Plantão (a TV fala), some no fim. */
function somDoBaile(S, perto) {
  const B = BAILE;
  if (!S) return perto * perto; // de longe, só um eco; perto da entrada, alto
  if (S.fase === 'plantao') return 1 - (1 - B.musica.plantaoMul) * clamp01(S.faseT / 0.5);
  if (S.fase === 'briga') return B.musica.plantaoMul + (1 - B.musica.plantaoMul) * clamp01(S.faseT / B.musica.voltaS);
  if (S.fase === 'fim') return 1 - clamp01(S.faseT / B.fimS);
  return 1;
}

/** Chegando no baile, os corredores esvaziam: a horda de fora da tela vai embora, até sobrar hordaMax. */
function esvaziarCorredores(game, perto, dt) {
  game.esvaziaT = (game.esvaziaT || 0) - dt;
  if (game.esvaziaT > 0) return;
  game.esvaziaT = 0.5;
  game.aliviarHorda(Math.round(BAILE.hordaMax + (1 - perto) * BAILE.hordaLonge));
}

/** As TVs entram no Plantão com O Acordão; os olhos do povo vão acendendo, um por um, e todos encaram o Juninho. */
function plantao(game, S) {
  S.fase = 'plantao';
  S.faseT = 0;
  const rng = makeRng((game.seed ^ 0x01d05) >>> 0);
  for (const c of S.pessoas) c.olhoEm = rng() * BAILE.olhosS;
  for (const e of game.enemies) if (e.dancaT > 0) e.olhoEm = rng() * BAILE.olhosS;
  game.tv('baileAcordao');
  game.emit('plantao', {});
}

/** A chegada: o povo na pista, a horda que vinha atrás para para dançar e a de fora não nasce. */
function iniciar(game) {
  const B = BAILE;
  const w = game.world;
  const k = w.baile;
  const pc = palcoDoBaile(w);
  const rng = makeRng((game.seed ^ 0xba11e) >>> 0);
  const pessoas = [];
  const p0 = game.player;
  // a pista lotada: um a cada passoM, com uma folga sorteada (sem fila), fora do palco, dos móveis e do Juninho
  const L = B.lotacao;
  const pesos = Object.entries(B.povo);
  const total = pesos.reduce((a, [, n]) => a + n, 0);
  const lugares = [];
  for (let y = k.y0 + B.beiraM + L.passoM / 2; y < k.y1 - B.beiraM; y += L.passoM) {
    for (let x = k.x0 + B.beiraM + L.passoM / 2; x < k.x1 - B.beiraM; x += L.passoM) {
      lugares.push({ x: x + (rng() - 0.5) * 2 * L.folgaM, y: y + (rng() - 0.5) * 2 * L.folgaM, o: rng() });
    }
  }
  lugares.sort((a, b) => a.o - b.o); // passando do máximo, quem fica de fora é sorteado (não um canto inteiro)
  for (const { x, y } of lugares) {
    if (pessoas.length >= L.max) break;
    if (Math.hypot(x - pc.x, y - pc.y) < B.palcoM) continue; // o palco fica livre para o DJ
    if (Math.hypot(x - p0.x, y - p0.y) < L.entradaM) continue; // ninguém em cima do Juninho na chegada
    const s = game.fitSpawn({ x, y });
    if (Math.hypot(s.x - x, s.y - y) > 0.5) continue;
    let r = rng() * total;
    let tipo = pesos[0][0];
    for (const [t, n] of pesos) if ((r -= n) < 0) { tipo = t; break; }
    pessoas.push({
      x: s.x, y: s.y, vx: 0, vy: 0, tipo, arte: ARTE_DO_POVO[tipo], tam: TAM_DO_POVO[tipo], tint: tipo === 'morador' ? tintMorador(rng) : 0,
      walk: rng() * 10, ritmo: rng(), danca: true, viraT: -1, virou: false, id: 950000 + pessoas.length, olho: 0, olhoEm: -1,
    });
  }
  // o DJ Plantão atrás da mesa, tocando (ainda não é inimigo: só entra na luta quando o Caos chama)
  const noPalco = {
    x: pc.x, y: k.y0 + B.djAtrasM, vx: 0, vy: 0, tipo: 'dj', arte: 'fk', tam: ENEMIES.dj_plantao.size, tint: 0,
    walk: 0, ritmo: 0.5, danca: true, viraT: -1, virou: false, id: 949999, olho: 0, olhoEm: -1, dj: true,
  };
  const S = (game.baile = { fase: 'festa', t: 0, faseT: 0, pessoas, noPalco, dj: null, caosDJ: 100 });
  // a horda que vinha atrás do Juninho: a de longe vai embora (fora da tela) e a de perto entra na dança,
  // os traficantes também (até o sinal pegar)
  game.aliviarHorda(B.hordaMax);
  const p = game.player;
  for (const e of game.enemies) {
    if (e.dead || e.boss) continue;
    if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 < 18 * 18) e.dancaT = 1e9;
  }
  game.metrics.baileS = Math.round(game.t);
  game.tv('baileComeca');
  game.emit('baile', {});
  return S;
}

/** A pessoa dançando no lugar; no Plantão o olho acende; na pancadaria ela trava, transforma e vira horda. */
function atualizarPessoa(game, S, c, dt) {
  if (c.virou) return;
  if (c.acorda) {
    // o DJ caiu: quem não brigou acorda (o olho apaga) e vai sumindo
    c.danca = false;
    c.olho = 0;
    c.some = Math.max(0, (c.some ?? 1) - dt / BAILE.fimS);
    if (c.some <= 0) c.virou = true;
    return;
  }
  c.walk += dt * 9; // o passo no batidão (o desenho também pula no pulso)
  if (c.olhoEm >= 0 && S.fase === 'plantao') c.olho = clamp01((S.faseT - c.olhoEm) / 0.4);
  if (c.viraT < 0) return;
  c.viraT -= dt;
  c.danca = c.viraT > BAILE.transfS; // a transformação começa: para de dançar
  if (c.viraT <= 0) {
    c.virou = true;
    let e;
    if (c.tipo === 'funkeiro' || c.tipo === 'traficante') {
      e = game.spawnEnemy(c.tipo, c.x, c.y, { walk: c.walk });
      if (c.tipo === 'traficante') e.saw = true; // já está na festa: sem soltar os fogos
    } else {
      // a mulher de roupa curta vira a Mulher de Biquíni da horda (a primeira roupa nova da Orla, tint 200)
      e = game.spawnEnemy('telespectador', c.x, c.y, { tint: c.tipo === 'garota' ? 200 : c.tint, walk: c.walk });
    }
    e.doBaile = true; // cada um que cai na pancadaria sobe o Caos (abateNoBaile)
    game.burst(c.x, c.y, 6, 'static');
  }
}

/**
 * Começa a pancadaria: cada um trava numa hora (o mais perto do Juninho por último) e vira horda; a horda dançando
 * acorda; a polícia da entrada entra (figurantes.js). O DJ segue tocando: entra quando o Caos chegar em caosDJ.
 */
function briga(game, S) {
  const B = BAILE;
  S.fase = 'briga';
  S.faseT = 0;
  S.caosDJ = Math.round(Math.min(B.caos.max, game.caos + B.caos.sobe));
  game.tv('baileSinal');
  game.emit('flash', {});
  game.shake(0.25);
  soltarLeva(game, S);
  for (const e of game.enemies) {
    if (e.dancaT > 0) {
      e.dancaT = 0;
      e.doBaile = true;
    }
  }
  // a polícia do grupo, que tinha ficado de guarda na entrada, entra para ajudar (figurantes.js)
  const w = game.world;
  if ((w.figurantes || []).some((f) => f.grupo && (f.tipo === 'pm' || f.tipo === 'tropa'))) game.tv('policiaEntra');
  game.metrics.brigaS = Math.round(game.t);
}

/** Quantos da festa estão brigando agora (os que já viraram horda e os que estão virando). */
function brigando(game, S) {
  let n = 0;
  for (const e of game.enemies) if (!e.dead && e.doBaile) n++;
  for (const c of S.pessoas) if (!c.virou && c.viraT >= 0) n++;
  return n;
}

/**
 * Uma leva da pista parte para cima: até completar briga.max brigando, os mais perto do Juninho (o primeiro já, o
 * último em viraS). Os outros seguem dançando, de olho aceso, encarando ele.
 */
function soltarLeva(game, S) {
  const B = BAILE;
  const vagas = B.briga.max - brigando(game, S);
  if (vagas <= 0) return 0;
  const p = game.player;
  const fila = S.pessoas.filter((c) => !c.virou && c.viraT < 0 && !c.acorda);
  if (!fila.length) return 0;
  fila.sort((a, b) => (a.x - p.x) ** 2 + (a.y - p.y) ** 2 - ((b.x - p.x) ** 2 + (b.y - p.y) ** 2));
  const n = Math.min(vagas, fila.length);
  for (let i = 0; i < n; i++) fila[i].viraT = B.transfS + (n > 1 ? (i / (n - 1)) * B.viraS : 0);
  return n;
}

/** Na pancadaria: cada um que cai, outro da pista vem; acabando a pista, o resto do baile chega pelas beiradas. */
function chegaMaisGente(game, S, dt) {
  const R = BAILE.briga;
  const w = game.world;
  const k = w.baile;
  const p = game.player;
  S.levaT = (S.levaT || 0) - dt;
  if (S.levaT <= 0) {
    S.levaT = 0.5;
    if (soltarLeva(game, S) || S.pessoas.some((c) => !c.virou && !c.acorda)) return;
  }
  if (S.pessoas.some((c) => !c.virou && !c.acorda)) return;
  S.chegaAcc = (S.chegaAcc || 0) + R.ritmo * dt;
  if (S.chegaAcc < 1) return;
  let emPe = brigando(game, S);
  const rng = game.fxRng;
  const pesos = Object.entries(R.povo);
  const total = pesos.reduce((a, [, n]) => a + n, 0);
  for (let tent = 0; S.chegaAcc >= 1 && tent < 8; tent++) {
    if (emPe >= R.max) {
      S.chegaAcc = Math.min(S.chegaAcc, 1);
      return;
    }
    // um ponto na beirada (lados e frente), longe do Juninho
    const lado = rng();
    const x = lado < 0.35 ? k.x0 + 0.6 : lado < 0.7 ? k.x1 - 0.6 : k.x0 + 1 + rng() * (k.x1 - k.x0 - 2);
    const y = lado < 0.7 ? k.y0 + 3 + rng() * (k.y1 - k.y0 - 4) : k.y1 - 0.6;
    if (Math.hypot(x - p.x, y - p.y) < R.longeM) continue;
    const s = game.fitSpawn({ x, y });
    let r = rng() * total;
    let tipo = pesos[0][0];
    for (const [t, n] of pesos) if ((r -= n) < 0) { tipo = t; break; }
    const e = tipo === 'funkeiro' ? game.spawnEnemy('funkeiro', s.x, s.y) : game.spawnEnemy('telespectador', s.x, s.y, { tint: tipo === 'garota' ? 200 : tintMorador(rng, BAILE.moradoresReforco) });
    e.doBaile = true;
    game.burst(s.x, s.y, 4, 'static');
    S.chegaAcc -= 1;
    emPe++;
  }
}

/** Na pancadaria (e na luta com o DJ), cada um da festa que cai sobe o Caos: é ele que chama o DJ. */
export function abateNoBaile(game, e) {
  const S = game.baile;
  if (!e.doBaile || !S || (S.fase !== 'briga' && S.fase !== 'luta')) return;
  game.caosBonus += BAILE.caos.porAbate;
}

/** A pessoa da festa que a horda era, pelo inimigo dela (quem não é da festa segue brigando: null). */
function pessoaDoInimigo(o) {
  if (o.type === 'funkeiro' || o.type === 'traficante') return { tipo: o.type, arte: ARTE_DO_POVO[o.type], tint: 0 };
  if (o.type !== 'telespectador') return null;
  if (o.tint === 200) return { tipo: 'garota', arte: ARTE_DO_POVO.garota, tint: 0 };
  if (o.tint >= 100 && o.tint < 200) return { tipo: 'morador', arte: null, tint: o.tint };
  return null;
}

/**
 * A roda abre: quem estava brigando para, se afasta do Juninho (roda.raioM) e fica olhando de olho aceso. Sai da
 * luta sem contar como abate (não sobe o Caos nem solta XP); com o DJ no chão, vai embora com o resto da pista.
 */
function abrirRoda(game, S) {
  const B = BAILE;
  const p = game.player;
  for (const o of game.enemies) {
    if (o.dead || o.boss || !o.doBaile) continue;
    const quem = pessoaDoInimigo(o);
    if (!quem) continue;
    const dx = o.x - p.x;
    const dy = o.y - p.y;
    const d = Math.hypot(dx, dy) || 0.01;
    const longe = Math.max(d, B.roda.raioM);
    const s = game.fitSpawn({ x: p.x + (dx / d) * longe, y: p.y + (dy / d) * longe });
    o.dead = true;
    S.pessoas.push({
      x: s.x, y: s.y, vx: 0, vy: 0, ...quem, tam: TAM_DO_POVO[quem.tipo], walk: o.walk || 0, ritmo: game.fxRng(),
      danca: true, viraT: -1, virou: false, id: 960000 + S.pessoas.length, olho: 1, olhoEm: -1, roda: true,
    });
  }
  game.word(p.x, p.y - 2.4, 'ABRIU A RODA!', '#ff5fd2');
}

/** O DJ Plantão para de só olhar: sai de trás da mesa e entra na luta. */
function soltarDJ(game, S) {
  const w = game.world;
  const q = S.noPalco;
  const pc = palcoDoBaile(w);
  const e = game.spawnEnemy('dj_plantao', q ? q.x : pc.x, q ? q.y : pc.y, { fase: 0 });
  e.ri = w.baileI;
  S.noPalco = null;
  S.dj = e;
  S.fase = 'luta';
  S.faseT = 0;
  abrirRoda(game, S);
  game.boss = e;
  game.bossName = ENEMIES.dj_plantao.name;
  game.emit('boss', {});
  game.shake(0.45);
  game.tv('djPlantao');
  // os canhões de luz ofuscam o DJ (ideia do autor): a dica aparece em cima de cada um
  for (const d of w.baileDeco || []) if (d.tipo === 'canhao') game.word(d.x, d.y - 2.2, 'ENCOSTA NO CANHÃO!', '#ffe85a');
  game.metrics.djSaiuS = Math.round(game.t);
}

/** O DJ caiu: o som cai, a pista acorda, o portão do fundo abre e a noite vai embora. */
export function djCaiu(game, e) {
  const B = BAILE;
  const S = game.baile;
  const w = game.world;
  if (S) {
    S.fase = 'fim';
    S.faseT = 0;
    S.dj = null;
    for (const c of S.pessoas) if (!c.virou) c.acorda = true; // quem só olhava (ou ia virando) acorda e vai embora
  }
  if (game.boss === e) game.boss = null;
  game.rodaDJ = null; // a roda da pista (dj.js) se desfaz
  w.portaoAberto = true;
  w.portaoT = game.t;
  game.metrics.djCaiuS = Math.round(game.t);
  for (const o of game.enemies) {
    if (o.dead || o.boss || o === e) continue;
    if ((o.x - e.x) ** 2 + (o.y - e.y) ** 2 > B.acordaM * B.acordaM) continue;
    o.dead = true;
    if (ENEMIES[o.type].wakes) game.wake(o);
    else game.burst(o.x, o.y, 5, 'blood');
  }
  game.pickups.push({ kind: 'propina', x: e.x + 0.6, y: e.y, t: 0 });
  game.pickups.push({ kind: 'maleta', x: e.x - 0.6, y: e.y, t: 0, magnet: true });
  game.shake(0.6);
  game.emit('flash', {});
  game.emit('unlock', {}); // "UMA PASSAGEM SE ABRIU" e o som da passagem
  game.tv('djCaiu');
}

/** A horda nasce? Do começo do baile até o DJ cair, só a festa (e quem o DJ chama). */
export const baileSegura = (game) => !!(game.baile && game.baile.fase !== 'fim');
