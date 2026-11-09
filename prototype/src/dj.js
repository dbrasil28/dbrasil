// DJ Plantão (D91): o chefe do meio do Morro, no palco do baile da esplanada (baile.js). O som dele carrega o
// sinal da TV. Golpes, sempre com aviso:
// - o grave: ergue os braços (o aviso no chão em volta dele) e solta anéis que correm pelo chão; quem está na
//   linha do anel leva dano e voa para fora (como nos atropelamentos);
// - o drop: sobe no som (a hora de bater: leva o dobro) e a batida cai: um anel forte e a horda corre mais;
// - chama Funkeiros pelos lados da esplanada.
// Fica no palco e se afasta de quem chega perto. Números em config.js (ENEMIES.dj_plantao). Sem DOM.
import { ENEMIES } from './config.js';
import { palcoDoBaile } from './cenario.js';

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
    larg: G.largM * (forte ? 1.3 : 1), dano: A.dano, derrubaM: A.derrubaM, hit: false, forte,
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
    game.derrubar(dx / d, dy / d, a.derrubaM);
    game.som('atropelo', p.x, p.y);
  }
  game.djAneis = L.filter((a) => a.r < a.max);
}

/** O DJ no palco: anda devagar pelo palco, se afasta de quem chega perto e solta os golpes. */
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
  const pc = palcoDoBaile(game.world) || { x: e.x, y: e.y };
  const dx = p.x - e.x;
  const dy = p.y - e.y;
  const d = Math.hypot(dx, dy) || 0.01;
  e.poseX = dx / d;
  e.poseY = dy / d;
  if (e.dropT > 0) {
    // subindo no som: braços para cima, parado no meio do palco (a hora de bater)
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
  // anda pelo palco, de um lado para o outro; quem chega perto, ele se afasta (sem sair da esplanada)
  if (d < D.keepM) {
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
    const w = game.world;
    const k = w.baile;
    const n = D.chama.funkeiros[f];
    for (let i = 0; i < n; i++) {
      const x = i % 2 ? k.x1 - 1 : k.x0 + 1;
      const sp = game.fitSpawn({ x, y: k.y0 + (k.y1 - k.y0) * (0.35 + 0.2 * i) });
      game.spawnEnemy('funkeiro', sp.x, sp.y);
    }
    game.word(e.x, e.y - 2.6, 'CHAMA A FIRMA!', '#ff9a3a');
  }
  return mov;
}
