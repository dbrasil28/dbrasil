// DJ Plantão (D91): o chefe do meio do Morro, no palco do baile da esplanada (baile.js). O som dele carrega o
// sinal da TV. Golpes, sempre com aviso:
// - o grave: ergue os braços (o aviso no chão em volta dele) e solta anéis que correm pelo chão; quem está na
//   linha do anel leva dano e voa para fora (como nos atropelamentos);
// - o drop: sobe no som (a hora de bater: leva o dobro) e a batida cai: um anel forte e a horda corre mais;
// - chama Funkeiros pelos lados da esplanada.
// Fica no palco e se afasta de quem chega perto. Ideia do autor: encostando num canhão de luz, o facho vira para
// o DJ e ele fica ofuscado (para os golpes e deixa chegar perto); com a vida em 70%, ele desce para a pista e a
// briga é na roda, com o povo da festa em volta (como na Orla). Números em config.js (ENEMIES.dj_plantao). Sem DOM.
import { ENEMIES } from './config.js';
import { palcoDoBaile } from './cenario.js';
import { formarRoda, atualizarRoda } from './baile.js';

const mov = { x: 0, y: 0 };

/** Os anéis do grave correndo pelo chão (o desenho e o bot leem game.djAneis). */
function soltarAnel(game, e, G, forte = false) {
  const D = ENEMIES.dj_plantao;
  const A = forte ? D.drop : G;
  // a brecha: a primeira de cada série fica do lado oposto ao Juninho (ele tem de andar até ela); as seguintes giram
  const p = game.player;
  e.brecha = e.anelSerie ? e.brecha + G.giroRad * (game.rng() < 0.5 ? 1 : -1) : Math.atan2(e.y - p.y, e.x - p.x) + (game.rng() - 0.5) * 0.8;
  e.anelSerie = true;
  (game.djAneis || (game.djAneis = [])).push({
    x: e.x, y: e.y, r: 0.6, v: forte ? G.velMS * 1.25 : G.velMS, max: G.raioM * (forte ? 1.2 : 1),
    larg: G.largM * (forte ? 1.3 : 1), dano: A.dano, derrubaM: A.derrubaM, hit: false, forte, palco: !e.naPista,
    brecha: e.brecha, brechaRad: G.brechaRad * (forte ? 0.8 : 1),
  });
  game.som('paredao', e.x, e.y);
  game.shake(forte ? 0.4 : 0.12);
}

/** Os anéis crescem; quem está na linha do anel (e não em cima de uma laje) leva o golpe. */
export function atualizarAneis(game, dt) {
  const L = game.djAneis;
  if (!L || !L.length) return;
  const p = game.player;
  for (const a of L) {
    a.r += a.v * dt;
    if (a.hit || game.over || p.invulnT > 0 || (p.plat && p.lvl)) continue;
    const dx = p.x - a.x;
    const dy = p.y - a.y;
    const d = Math.hypot(dx, dy) || 0.01;
    if (Math.abs(d - a.r) > a.larg / 2 + p.r) continue;
    let da = Math.atan2(dy, dx) - a.brecha;
    da = Math.atan2(Math.sin(da), Math.cos(da));
    if (Math.abs(da) < a.brechaRad / 2) continue; // na brecha: o anel passa por ele
    a.hit = true;
    game.hurtPlayer(a.dano, 'dj_plantao');
    const G = ENEMIES.dj_plantao.grave;
    // o do drop derruba; o comum, no palco, derruba quem está colado no paredão sem o canhão (na roda, só empurra
    // para a torcida: ali o DJ vem para cima e não tem para onde fugir)
    const derruba = a.derrubaM > 0 ? a.derrubaM : a.palco && d < G.pertoM ? G.pertoDerrubaM : 0;
    if (derruba > 0) {
      game.derrubar(dx / d, dy / d, derruba);
      game.som('atropelo', p.x, p.y);
      game.shake(0.35);
    } else {
      // o anel comum joga o Juninho para trás, para fora do anel
      game.empurrarJuninho(dx, dy, G.empurra);
      game.som('baque', p.x, p.y);
      game.shake(0.22);
    }
    game.word(p.x, p.y - 1.5, 'TUM!', '#ff5fd2');
  }
  game.djAneis = L.filter((a) => a.r < a.max);
}

/** Os canhões de luz (o desenho lê d.miraT para virar o facho para o DJ e d.cdT para a marca no chão). */
function canhoesDoBaile(game) {
  return (game.world.baileDeco || []).filter((d) => d.tipo === 'canhao');
}

/** O Juninho encostou num canhão pronto: o facho vira para o DJ e ele fica ofuscado (ideia do autor). */
function usarCanhoes(game, e, dt) {
  const C = ENEMIES.dj_plantao.canhao;
  const p = game.player;
  for (const d of canhoesDoBaile(game)) {
    if (d.cdT > 0) d.cdT -= dt;
    if (d.miraT > 0) d.miraT -= dt;
    if (d.cdT > 0 || Math.hypot(p.x - d.x, p.y - d.y) > C.ativaM) continue;
    d.cdT = C.cdS;
    d.miraT = C.ofuscaS;
    e.ofuscadoT = C.ofuscaS;
    game.metrics.ofuscaDJ = (game.metrics.ofuscaDJ || 0) + 1;
    // o que ele estava armando se perde: o grave, os anéis da série e o drop
    e.graveT = 0;
    e.aneisFila = 0;
    e.dropT = 0;
    game.word(e.x, e.y - 2.6, 'OFUSCADO!', '#fff3a0');
    game.som('aviso_chao', d.x, d.y);
    game.emit('flash', {});
  }
}

/** O DJ desce para a pista: a roda se forma em volta do Juninho (baile.js) e ele cai do lado dele. */
function abrirRodaNaPista(game, e) {
  const P = ENEMIES.dj_plantao.pista;
  const k = game.world.baile;
  const p = game.player;
  const m = P.rodaM + 0.6;
  const cx = Math.min(k.x1 - m, Math.max(k.x0 + m, p.x));
  const cy = Math.min(k.y1 - m, Math.max(k.y0 + m, p.y));
  formarRoda(game, cx, cy);
  // o DJ pula do palco e cai na roda, do lado do Juninho que dá para o palco
  e.x = cx;
  e.y = cy - P.rodaM * 0.45;
  game.burst(e.x, e.y, 10, 'poeira');
  game.shake(0.5);
  const dp = Math.hypot(p.x - cx, p.y - cy) || 1;
  if (dp > P.rodaM - 1) {
    p.x = cx + ((p.x - cx) / dp) * (P.rodaM - 1.6);
    p.y = cy + ((p.y - cy) / dp) * (P.rodaM - 1.6);
  }
  game.word(cx, cy - P.rodaM - 1, 'ABRE A RODA!', '#ff5fd2');
  game.tv('fase_dj');
}

/** Ninguém sai da roda: o DJ e a firma ficam dentro; o Juninho que encosta na torcida apanha e volta. */
function segurarNaRoda(game, dt) {
  const R = game.rodaDJ;
  if (!R) return;
  const P = ENEMIES.dj_plantao.pista;
  for (const o of game.enemies) {
    if (o.dead) continue;
    const dx = o.x - R.x;
    const dy = o.y - R.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d > R.r + 4) continue; // quem está longe (fora do baile) não entra
    const lim = R.r - (o.r || 0.3) - 0.15;
    if (d > lim) {
      o.x = R.x + (dx / d) * lim;
      o.y = R.y + (dy / d) * lim;
    }
  }
  if (R.toqueT > 0) R.toqueT -= dt;
  const p = game.player;
  const dx = p.x - R.x;
  const dy = p.y - R.y;
  const d = Math.hypot(dx, dy) || 1;
  const lim = R.r - (p.r || 0.3) - 0.1;
  if (d > lim) {
    p.x = R.x + (dx / d) * lim;
    p.y = R.y + (dy / d) * lim;
    if (R.toqueT <= 0 && !game.over) {
      R.toqueT = P.cdS;
      game.hurtPlayer(P.dano, 'cerco');
      game.empurrarJuninho(-dx, -dy, P.empurra);
    }
  }
}

/** Onde nasce a firma que o DJ chama: na beira da esplanada no palco; na pista, na beira de dentro da roda. */
function pontoDaFirma(game, i) {
  const R = game.rodaDJ;
  if (R) {
    const a = game.rng() * Math.PI * 2;
    return { x: R.x + Math.cos(a) * (R.r - 1.2), y: R.y + Math.sin(a) * (R.r - 1.2) };
  }
  const k = game.world.baile;
  return game.fitSpawn({ x: i % 2 ? k.x1 - 1 : k.x0 + 1, y: k.y0 + (k.y1 - k.y0) * (0.35 + 0.2 * i) });
}

/**
 * O DJ: no palco, anda devagar, se afasta de quem chega perto e solta os golpes; ofuscado pelo canhão de luz, para.
 * Com a vida em pista.vidaFrac, desce para a pista e vem para cima do Juninho na roda.
 */
export function updateDJ(game, e, dt) {
  const D = ENEMIES.dj_plantao;
  const f = Math.min(2, e.fase || 0);
  const p = game.player;
  const ritmo = D.fases.cadenciaMul ** f;
  mov.x = 0;
  mov.y = 0;
  e.furia = true; // a arte provisória (a do Funkeiro) sai com a cor de néon dele, nas poses também
  if (e.janelaT > 0) e.janelaT -= dt;
  if (game.over) {
    e.pose = null;
    return mov;
  }
  if (!e.naPista && e.hp <= e.maxHp * D.pista.vidaFrac) {
    e.naPista = true;
    e.ofuscadoT = 0;
    // os canhões voltam a varrer a pista (antes o facho ficava preso na cara dele: o DJ brilhava até o fim)
    for (const d of canhoesDoBaile(game)) d.miraT = 0;
    e.graveT = 0;
    e.aneisFila = 0;
    e.dropT = 0;
    abrirRodaNaPista(game, e);
  }
  if (e.naPista) {
    atualizarRoda(game, dt);
    segurarNaRoda(game, dt);
  }
  else usarCanhoes(game, e, dt);
  const pc = palcoDoBaile(game.world) || { x: e.x, y: e.y };
  const dx = p.x - e.x;
  const dy = p.y - e.y;
  const d = Math.hypot(dx, dy) || 0.01;
  e.poseX = dx / d;
  e.poseY = dy / d;
  if (e.ofuscadoT > 0) {
    // ofuscado pelo canhão: parado, sem atacar nem fugir, levando o dobro (o Juninho chega perto e bate)
    e.ofuscadoT -= dt;
    e.pose = null;
    e.janelaT = Math.max(e.janelaT || 0, 0.15);
    return mov;
  }
  if (e.dropT > 0) {
    // subindo no som: braços para cima, parado no meio do palco (leva o dobro, mas o drop vem aí)
    e.dropT -= dt;
    e.pose = 'furia';
    e.janelaT = Math.max(e.janelaT || 0, 0.15);
    if (e.dropT <= 0) {
      e.anelSerie = false;
      soltarAnel(game, e, D.grave, true);
      const R2 = D.drop.frenesiM * D.drop.frenesiM;
      for (const o of game.enemies) {
        if (o.dead || o.boss || (o.x - e.x) ** 2 + (o.y - e.y) ** 2 > R2) continue;
        o.frenesiT = D.drop.frenesiS;
        o.frenesiMul = D.drop.frenesiMul;
      }
      game.word(e.x, e.y - 2.5, 'DROP!', '#ff5fd2');
      game.emit('flash', {});
    }
    return mov;
  }
  if (e.graveT > 0) {
    // o aviso do grave: o chão em volta dele marca e enche
    e.graveT -= dt;
    e.pose = 'ataque';
    (game.avisosChao || (game.avisosChao = [])).push({ tipo: 'circulo', x: e.x, y: e.y, r: 1.8, k: 1 - e.graveT / D.grave.avisoS });
    if (e.graveT <= 0) {
      e.aneisFila = D.grave.aneis[f];
      e.anelProx = 0;
      e.anelSerie = false;
    }
    return mov;
  }
  if (e.aneisFila > 0) {
    e.pose = 'ataque';
    e.anelProx -= dt;
    if (e.anelProx <= 0) {
      soltarAnel(game, e, D.grave);
      e.aneisFila--;
      e.anelProx = D.grave.entreS;
    }
    return mov;
  }
  e.pose = null;
  if (e.naPista) {
    // na roda: vem para cima do Juninho
    if (d > (e.r || 0.6) + 0.5) {
      mov.x = (dx / d) * D.pista.velMul;
      mov.y = (dy / d) * D.pista.velMul;
    }
  } else if (d < D.keepM) {
    // anda pelo palco, de um lado para o outro; quem chega perto, ele se afasta (sem sair da esplanada)
    mov.x = -dx / d;
    mov.y = -dy / d;
  } else {
    const tx = pc.x + Math.sin(game.t * 0.5 + (e.id % 7)) * D.palcoM * 0.5;
    const ty = pc.y + 0.6 + Math.cos(game.t * 0.37 + (e.id % 5)) * 0.8;
    const lx = tx - e.x;
    const ly = ty - e.y;
    const l = Math.hypot(lx, ly);
    if (l > 0.4) {
      mov.x = (lx / l) * 0.6;
      mov.y = (ly / l) * 0.6;
    }
  }
  e.graveCd = (e.graveCd ?? 1.6) - dt;
  e.dropCd = (e.dropCd ?? D.drop.cadaS * 0.55) - dt;
  e.chamaCd = (e.chamaCd ?? D.chama.cadaS * 0.5) - dt;
  if (e.dropCd <= 0) {
    e.dropCd = D.drop.cadaS * ritmo;
    e.dropT = D.drop.subirS;
    e.janelaT = D.drop.subirS; // subindo no som: a hora de bater
    game.tv('djDrop', 20);
    game.word(e.x, e.y - 2.6, 'O DROP VEM AÍ!', '#ffd21f');
  } else if (e.graveCd <= 0) {
    e.graveCd = D.grave.cadaS * ritmo;
    e.graveT = D.grave.avisoS;
    game.som('aviso_chao', e.x, e.y);
  } else if (e.chamaCd <= 0) {
    e.chamaCd = D.chama.cadaS * ritmo;
    const n = D.chama.funkeiros[f];
    for (let i = 0; i < n; i++) {
      const sp = pontoDaFirma(game, i);
      game.spawnEnemy('funkeiro', sp.x, sp.y);
    }
    game.word(e.x, e.y - 2.6, 'CHAMA A FIRMA!', '#ff9a3a');
  }
  return mov;
}
