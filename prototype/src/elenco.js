// Inimigos do elenco v2 com mecânica própria (D76; ver docs/design/ELENCO_v0.3_BRASIL.md):
// - Agiota: fica a uma distância e marca o Juninho; marcado, o Juninho perde XP por segundo, e os juros crescem
//   enquanto o Agiota estiver de pé. Derrubado, a dívida volta ao chão como XP ("DÍVIDA PAGA!").
// - Coach Picareta: chega perto, prepara (aviso no chão) e dá a palestra: quem está na roda fica lento.
// Laranja e Rato de Academia (D73) estão em game.js. Sem DOM: os números estão em config.js (ENEMIES).
import { ENEMIES } from './config.js';

/** Um quadro do Agiota. d: distância até o Juninho; (ux, uy): rota até ele. Devolve para onde anda. */
export function updateAgiota(game, e, dt, d, ux, uy) {
  const A = ENEMIES.agiota;
  const p = game.player;
  if (!e.marcou && d < A.marcaM && !game.over) {
    e.marcou = true;
    e.jurosT = 0;
    e.atkT = 0.6; // aponta para ele
    game.word(p.x, p.y - 1, 'JUROS!', '#ff4d4d');
    game.som('multa', e.x, e.y);
    game.tv('agiota', 30);
  }
  if (e.marcou && d > A.soltaM) e.marcou = false; // longe demais: perdeu o devedor de vista
  if (e.marcou) {
    // juros compostos: a taxa cresce a cada segundo marcado
    e.jurosT += dt;
    const taxa = A.taxa * Math.pow(1 + A.juros, e.jurosT);
    const tira = Math.min(p.xp, taxa * dt);
    p.xp -= tira;
    e.divida = (e.divida || 0) + tira;
    game.jurosT = game.t; // o HUD mostra a barra de XP sangrando
    e.cobraT = (e.cobraT || 0) - dt;
    if (e.cobraT <= 0) {
      e.cobraT = A.cobraS;
      e.atkT = 0.5;
      game.word(p.x + (game.fxRng() - 0.5), p.y - 1.2, `-${Math.max(1, Math.round(taxa))} XP`, '#ff6b6b');
    }
  }
  // fica a distância: chega se está longe, recua se está perto, e anda de lado no meio
  if (d < A.distM - 0.6) return { x: -ux * 0.7, y: -uy * 0.7 };
  if (d < A.distM + 0.6) {
    const lado = e.id % 2 ? 1 : -1;
    return { x: -uy * 0.55 * lado, y: ux * 0.55 * lado };
  }
  return { x: ux, y: uy };
}

/** O Agiota caiu: a dívida volta ao chão como XP. */
export function agiotaCaiu(game, e) {
  if (!(e.divida > 0.5)) return;
  game.dropGem(e.x, e.y, Math.round(e.divida));
  game.word(e.x, e.y - 1, 'DÍVIDA PAGA!', '#7fe08a');
}

/** Um quadro do Coach Picareta: chega, prepara a palestra (aviso no chão) e fala; quem está na roda fica lento. */
export function updateCoach(game, e, dt, d, ux, uy) {
  const C = ENEMIES.coach;
  const p = game.player;
  if (e.palestraT > 0) {
    e.palestraT -= dt;
    e.raivaT = 0.2; // a pose de quem prega
    e.fraseT = (e.fraseT || 0) - dt;
    if (e.fraseT <= 0) {
      e.fraseT = C.fraseS;
      game.word(e.x, e.y - 1.6, C.frases[Math.floor(game.fxRng() * C.frases.length)], '#ffd21f');
    }
    const naRoda = (p.x - e.x) ** 2 + (p.y - e.y) ** 2 < C.raioM * C.raioM && Math.abs((p.z || 0) - (e.z || 0)) < 1;
    if (naRoda) p.slowT = Math.max(p.slowT || 0, 0.25);
    if (e.palestraT <= 0) e.cdT = C.cadaS;
    return { x: 0, y: 0 };
  }
  if (e.windup > 0) {
    e.windup -= dt;
    (game.avisosChao || (game.avisosChao = [])).push({ tipo: 'circulo', x: e.x, y: e.y, r: C.raioM, k: 1 - e.windup / C.windupS });
    if (e.windup <= 0) {
      e.palestraT = C.duracaoS;
      e.fraseT = 0;
      game.som('megafone', e.x, e.y);
      game.tv('coach', 40);
    }
    return { x: 0, y: 0 };
  }
  e.cdT = (e.cdT ?? C.cadaS * 0.4) - dt;
  if (d < C.comecaM && e.cdT <= 0 && !game.over) {
    e.windup = C.windupS;
    return { x: 0, y: 0 };
  }
  return { x: ux, y: uy };
}
