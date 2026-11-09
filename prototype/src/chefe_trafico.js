// Chefe do Tráfico (D91, pedido do autor): o chefão final do Rio, no alto do morro, gigante e com duas
// metralhadoras. Três golpes, sempre com aviso, e a recarga (a hora de bater):
// - rajada dupla: trava a mira (as duas linhas vermelhas) e solta tiros alternando as duas armas;
// - varredura: o leque aparece no chão e ele varre de um lado ao outro atirando com as duas;
// - as duas juntas: a faixa aparece no chão e ele despeja um jato de tiros nessa linha;
// - recarga: a cada tantos golpes, para e recarrega (leva o dobro);
// - e chama a firma pelo rádio (traficantes e fogos), como antes.
// Números em config.js (ENEMIES.chefe_trafico). Sem DOM.
import { ENEMIES } from './config.js';

const mov = { x: 0, y: 0 };
const GOLPES = ['dupla', 'leque', 'juntas'];

/** A boca de uma das armas (lado -1 ou 1), para o lado da direção (ux, uy). */
function cano(e, ux, uy, lado, out) {
  const C = ENEMIES.chefe_trafico.canoM;
  out.x = e.x - uy * C * lado + ux * 0.4;
  out.y = e.y + ux * C * lado + uy * 0.4;
  return out;
}
const bc = { x: 0, y: 0 };

function tiro(game, e, ang, lado) {
  const b = ENEMIES.chefe_trafico.bullet;
  const ux = Math.cos(ang);
  const uy = Math.sin(ang);
  cano(e, ux, uy, lado, bc);
  game.enemyShots.push({ kind: 'bala', x: bc.x, y: bc.y, vx: ux * b.speed, vy: uy * b.speed, life: b.life, r: b.radius, dmg: b.dmg, spin: 0 });
  game.clarao({ x: bc.x, y: bc.y }, ux, uy);
}

/** Um golpe novo (o próximo da roda, para o jogador aprender a ler). */
function iniciar(game, e, D) {
  const p = game.player;
  e.golpes = (e.golpes || 0) + 1;
  if (e.golpes > D.recarga.golpes) {
    e.golpes = 0;
    e.golpe = 'recarga';
    e.golpeT = D.recarga.recargaS;
    e.janelaT = D.recarga.recargaS; // a hora de bater
    game.word(e.x, e.y - 3.2, 'RECARREGANDO!', '#ffd21f');
    game.som('pega', e.x, e.y);
    return;
  }
  e.golpe = GOLPES[(e.roda = ((e.roda ?? -1) + 1) % GOLPES.length)];
  e.ax = p.x;
  e.ay = p.y;
  e.ang = Math.atan2(p.y - e.y, p.x - e.x);
  if (e.golpe === 'dupla') {
    e.aimT = D.dupla.miraS;
    e.golpeT = D.dupla.miraS;
    game.som('mira', e.x, e.y);
  } else if (e.golpe === 'leque') {
    e.golpeT = D.leque.avisoS;
    game.som('aviso_chao', e.x, e.y);
  } else {
    e.golpeT = D.juntas.avisoS;
    game.som('aviso_chao', e.x, e.y);
  }
  e.fogo = false;
}

/** O Chefe do Tráfico na laje do topo. Devolve o passo (mov), como os outros comportamentos. */
export function updateChefeTrafico(game, e, dt, ux, uy, d) {
  const D = ENEMIES.chefe_trafico;
  const R = D.reforco;
  const f = Math.min(2, e.fase || 0);
  const ritmo = D.fases.cadenciaMul ** f;
  mov.x = 0;
  mov.y = 0;
  if (e.throwT > 0) e.throwT -= dt;
  if (e.janelaT > 0) e.janelaT -= dt;
  if (game.over) {
    e.golpe = null;
    e.burst = 0;
    e.aimT = 0;
    return mov;
  }
  if (e.callT > 0) {
    // gritando no rádio (pose de raiva): chegam os traficantes e os fogos
    e.callT -= dt;
    if (e.callT <= 0) {
      for (let i = 0; i < R.traficantes; i++) {
        const sp = game.fitSpawn({ x: e.x + (i ? 2.8 : -2.8), y: e.y - 1.5 });
        const t = game.spawnEnemy('traficante', sp.x, sp.y);
        t.saw = true;
      }
      game.fogos(e);
    }
    return mov;
  }
  if (e.golpe) {
    e.golpeT -= dt;
    switch (e.golpe) {
      case 'recarga':
        break;
      case 'dupla': {
        if (!e.fogo) {
          if (e.golpeT <= 0) {
            e.fogo = true;
            e.burst = (D.dupla.tiros + f * D.fases.tirosMais) * 2;
            e.burstT = 0;
            e.golpeT = 1; // segue até acabar a rajada
          }
          break;
        }
        e.golpeT = 1;
        e.burstT -= dt;
        if (e.burstT <= 0 && e.burst > 0) {
          const tot = (D.dupla.tiros + f * D.fases.tirosMais) * 2;
          const k = tot - e.burst;
          const lado = k % 2 ? 1 : -1;
          const a = Math.atan2(e.ay - e.y, e.ax - e.x) + (Math.floor(k / 2) - (tot / 2 - 1) / 2) * D.dupla.abertura;
          tiro(game, e, a, lado);
          e.burst--;
          e.burstT = D.dupla.intervaloS;
          e.throwT = 0.3;
        }
        if (e.burst <= 0) e.golpeT = 0;
        break;
      }
      case 'leque': {
        const L = D.leque;
        const ab = (L.lequeGraus * Math.PI) / 180;
        if (!e.fogo) {
          (game.avisosChao || (game.avisosChao = [])).push({ tipo: 'leque', x: e.x, y: e.y, ang: e.ang, ab, r: L.alcanceM, k: 1 - Math.max(0, e.golpeT) / L.avisoS });
          if (e.golpeT <= 0) {
            e.fogo = true;
            e.golpeT = L.varreS;
            e.cadT = 0;
            e.lado = 1;
          }
          break;
        }
        // varre de um lado ao outro do leque, as duas armas alternando
        const u = 1 - Math.max(0, e.golpeT) / L.varreS;
        const a = e.ang - ab / 2 + ab * u;
        e.ax = e.x + Math.cos(a) * 6;
        e.ay = e.y + Math.sin(a) * 6;
        e.burst = 1; // a pose de tiro
        e.cadT -= dt;
        if (e.cadT <= 0) {
          e.cadT = L.cadaS;
          e.lado = -e.lado;
          tiro(game, e, a, e.lado);
        }
        break;
      }
      case 'juntas': {
        const J = D.juntas;
        const dxl = Math.cos(e.ang);
        const dyl = Math.sin(e.ang);
        if (!e.fogo) {
          (game.avisosChao || (game.avisosChao = [])).push({ tipo: 'faixa', x: e.x, y: e.y, dx: dxl, dy: dyl, len: J.alcanceM, larg: J.largM, k: 1 - Math.max(0, e.golpeT) / J.avisoS });
          if (e.golpeT <= 0) {
            e.fogo = true;
            e.golpeT = J.jatoS;
            e.cadT = 0;
            e.lado = 1;
          }
          break;
        }
        // as duas armas na mesma linha: o jato fecha no ponto travado
        e.ax = e.x + dxl * 8;
        e.ay = e.y + dyl * 8;
        e.burst = 1;
        e.cadT -= dt;
        if (e.cadT <= 0) {
          e.cadT = J.cadaS;
          e.lado = -e.lado;
          const alvoX = e.x + dxl * J.alcanceM;
          const alvoY = e.y + dyl * J.alcanceM;
          cano(e, dxl, dyl, e.lado, bc);
          tiro(game, e, Math.atan2(alvoY - bc.y, alvoX - bc.x), e.lado);
        }
        break;
      }
      default:
        break;
    }
    if (e.golpeT <= 0 && (e.golpe === 'recarga' || e.fogo)) {
      e.golpe = null;
      e.burst = 0;
      e.aimT = 0;
      e.pausaT = (D.pausaS[0] + game.rng() * (D.pausaS[1] - D.pausaS[0])) * ritmo;
    }
    if (e.golpe === 'dupla' && e.aimT > 0) e.aimT -= dt;
    return mov;
  }
  // entre os golpes: guarda distância e anda de lado; chama a firma de tempos em tempos
  if (d < D.keepM) {
    mov.x = -ux * 0.6;
    mov.y = -uy * 0.6;
  } else if (d < D.range) {
    mov.x = -uy * 0.3;
    mov.y = ux * 0.3;
  } else {
    mov.x = ux;
    mov.y = uy;
  }
  e.callCd = (e.callCd ?? R.cadaS * 0.6) - dt;
  e.pausaT = (e.pausaT ?? 1.2) - dt;
  if (e.callCd <= 0) {
    e.callCd = R.cadaS * ritmo;
    e.callT = R.gritoS;
    e.janelaT = R.gritoS;
    game.som('radio', e.x, e.y);
    game.tv('chefeRadio', 30);
  } else if (e.pausaT <= 0 && d < D.range + 2) iniciar(game, e, D);
  return mov;
}
