// Inimigos do Morro que mexem com o XP do chão (D37, docs/design/CARREIRA_E_ROTA.md, seção 12). Sem DOM.
//   Cracudo: vem em bando, cambaleando; enxerga XP no chão por perto, vai até lá, agacha e cata (o XP some).
//     Quando cai, solta tudo o que catou: vale a pena derrubar quem catou muito.
//   Trombadinha: corre até o Juninho, encosta e rouba XP; foge correndo com o celular e some se não for
//     derrubado a tempo. Derrubado na fuga, devolve o que roubou.
// A pose (e.pose, virada para e.poseX/poseY) é desenhada pelo atlas de poses do personagem (render.js).
import { ENEMIES } from './config.js';

const mov = { x: 0, y: 0 };

function gemaPerto(game, x, y, r, ignora) {
  let best = null;
  let bd = r * r;
  for (const g of game.gems) {
    if (g.pull || g === ignora) continue; // já indo para o Juninho, ou atrás da parede
    const d = (g.x - x) ** 2 + (g.y - y) ** 2;
    if (d < bd) {
      bd = d;
      best = g;
    }
  }
  return best;
}

/** Anda cambaleando: a direção balança de um lado para o outro. */
function cambaleia(game, e, ux, uy, amp) {
  const a = Math.sin(game.t * 2.3 + (e.phase || e.id)) * amp;
  const c = Math.cos(a);
  const s = Math.sin(a);
  mov.x = ux * c - uy * s;
  mov.y = ux * s + uy * c;
  return mov;
}

export function updateCracudo(game, e, dt, ux, uy) {
  const C = ENEMIES.cracudo;
  if (e.catarT > 0) {
    // agachado catando
    e.catarT -= dt;
    e.pose = 'agachado';
    if (e.catarT <= 0) {
      const g = e.alvoGem;
      const i = g ? game.gems.indexOf(g) : -1;
      if (i >= 0 && !g.pull) {
        game.gems.splice(i, 1);
        e.guardou = (e.guardou || 0) + g.v;
        game.word(e.x, e.y - 1.2, 'CATOU!', '#c9b48a');
      }
      e.alvoGem = null;
      e.alvoD = undefined;
      e.pose = null;
    }
    mov.x = 0;
    mov.y = 0;
    return mov;
  }
  e.pose = null;
  e.procuraT = (e.procuraT || 0) - dt;
  if (e.procuraT <= 0) {
    e.procuraT = 0.4;
    const antes = e.alvoGem;
    e.alvoGem = gemaPerto(game, e.x, e.y, C.catarM, e.ignora);
    if (e.alvoGem !== antes) {
      e.presoT = 0;
      e.alvoD = undefined;
    }
  }
  const g = e.alvoGem;
  if (g && !g.pull && game.gems.includes(g)) {
    const dx = g.x - e.x;
    const dy = g.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    // não chega mais perto (a gema caiu atrás de uma parede): desiste dela
    if (d < (e.alvoD ?? Infinity) - 0.05) {
      e.alvoD = d;
      e.presoT = 0;
    } else if ((e.presoT = (e.presoT || 0) + dt) > 1.2) {
      e.ignora = g;
      e.alvoGem = null;
      e.alvoD = undefined;
      e.procuraT = 0;
    }
    if (d < C.pegaM) {
      e.catarT = C.catarS;
      e.poseX = dx || 0.01;
      e.poseY = dy || 1;
      if (game.rng() < 0.15) game.tv('cracudo', 40);
      mov.x = 0;
      mov.y = 0;
      return mov;
    }
    return cambaleia(game, e, dx / d, dy / d, C.cambaleia * 0.5);
  }
  e.alvoGem = null;
  return cambaleia(game, e, ux, uy, C.cambaleia);
}

export function updateTrombadinha(game, e, dt, ux, uy) {
  const T = ENEMIES.trombadinha;
  if (e.fugaT > 0) {
    e.fugaT -= dt;
    const p = game.player;
    let ax = e.x - p.x;
    let ay = e.y - p.y;
    const l = Math.hypot(ax, ay) || 1;
    ax /= l;
    ay /= l;
    e.pose = 'correndo';
    e.poseX = ax;
    e.poseY = ay;
    if (e.fugaT <= 0) {
      // sumiu no beco com o XP
      e.dead = true;
      game.word(e.x, e.y - 1.2, 'FUGIU!', '#ff6b6b');
    }
    mov.x = ax * T.fugaMul;
    mov.y = ay * T.fugaMul;
    return mov;
  }
  e.pose = null;
  mov.x = ux;
  mov.y = uy;
  return mov;
}

/** Encostou no Juninho: rouba XP e foge (uma vez só). */
export function trombada(game, e) {
  if (e.fugaT > 0 || e.roubou !== undefined) return;
  const T = ENEMIES.trombadinha;
  const p = game.player;
  const v = Math.min(p.xp, Math.round(T.roubaXp + p.level * T.roubaPorNivel));
  p.xp -= v;
  e.roubou = v;
  e.fugaT = T.fugaS;
  e.dmg = 0; // fugindo, não encosta mais
  game.word(p.x, p.y - 1.6, v ? `-${v} XP` : 'NADA!', '#ff6b6b');
  game.emit('fine', { amount: v });
  game.tv('trombadinha', 25);
}

/** Caiu: devolve o XP catado ou roubado. */
export function devolveXp(game, e) {
  if (e.guardou) game.dropGem(e.x - 0.3, e.y, e.guardou);
  if (e.roubou) game.dropGem(e.x + 0.3, e.y, e.roubou);
}
