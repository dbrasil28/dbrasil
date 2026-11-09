// Inimigos do elenco v2 com mecânica própria (D76; ver docs/design/ELENCO_v0.3_BRASIL.md):
// - Agiota: fica a uma distância e marca o Juninho; marcado, o Juninho perde XP por segundo, e os juros crescem
//   enquanto o Agiota estiver de pé. Derrubado, a dívida volta ao chão como XP ("DÍVIDA PAGA!").
// - Coach Picareta: chega perto, prepara (aviso no chão) e dá a palestra: quem está na roda fica lento.
// - Pastor Picareta (D77): fica atrás da horda, cura quem está em volta e chama fiéis.
// - Encostado (D77): manca enquanto o Juninho olha para ele; de costas, sai correndo.
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

/** Um quadro do Pastor Picareta (D77): fica atrás da horda, cura quem está em volta e chama fiéis. */
export function updatePastor(game, e, dt, d, ux, uy) {
  const P = ENEMIES.pastor;
  if (!game.over) {
    e.curaT = (e.curaT ?? P.curaS * 0.5) - dt;
    if (e.curaT <= 0) {
      e.curaT = P.curaS;
      const r2 = P.raioM * P.raioM;
      let curou = 0;
      for (const o of game.enemies) {
        if (o === e || o.dead || o.boss || o.hp >= o.maxHp) continue;
        if ((o.x - e.x) ** 2 + (o.y - e.y) ** 2 > r2) continue;
        o.hp = Math.min(o.maxHp, o.hp + o.maxHp * P.cura);
        o.curadoAte = game.t + 0.7; // a cruzinha verde em cima de quem foi curado
        curou++;
      }
      if (curou) {
        (game.curasFx || (game.curasFx = [])).push({ x: e.x, y: e.y, z: e.z || 0, r: P.raioM, t0: game.t });
        e.atkT = 0.5; // a mão erguida
      }
    }
    e.chamaT = (e.chamaT ?? P.chamaS * 0.6) - dt;
    if (e.chamaT <= 0 && d < P.distM * 2.5) {
      e.chamaT = P.chamaS;
      e.raivaT = 0.8; // a Bíblia no alto
      for (let i = 0; i < P.chama; i++) {
        const a = game.rng() * Math.PI * 2;
        const sp = game.fitSpawn({ x: e.x + Math.cos(a) * P.chamaRaioM, y: e.y + Math.sin(a) * P.chamaRaioM });
        game.spawnEnemy('telespectador', sp.x, sp.y);
      }
      game.word(e.x, e.y - 1.6, 'VEM, IRMÃO!', '#ffd21f');
      game.som('megafone', e.x, e.y);
      game.tv('pastor', 30);
    }
    e.fraseT = (e.fraseT ?? game.fxRng() * P.fraseS) - dt;
    if (e.fraseT <= 0 && d < 14) {
      e.fraseT = P.fraseS * (0.8 + game.fxRng() * 0.6);
      game.word(e.x, e.y - 1.6, P.frases[Math.floor(game.fxRng() * P.frases.length)], '#ffe27a');
    }
  }
  if (game.curasFx && game.curasFx.length && game.t - game.curasFx[0].t0 > 1) game.curasFx = game.curasFx.filter((c) => game.t - c.t0 < 1);
  if (e.raivaT > 0) return { x: 0, y: 0 };
  // fica atrás da horda: chega se está longe, recua se está perto
  if (d < P.distM - 1) return { x: -ux * 0.8, y: -uy * 0.8 };
  if (d < P.distM + 1) return { x: 0, y: 0 };
  return { x: ux, y: uy };
}

/** O Juninho está olhando para o Encostado? (o ângulo entre para onde ele olha e o Encostado) */
export function juninhoOlha(p, e, cos) {
  const dx = e.x - p.x;
  const dy = e.y - p.y;
  const l = Math.hypot(dx, dy) || 1;
  const fl = Math.hypot(p.faceX || 0, p.faceY || 0) || 1;
  return ((p.faceX || 0) * dx + (p.faceY || 0) * dy) / (l * fl) > cos;
}

/** Um quadro do Encostado (D77): manca enquanto o Juninho olha; de costas, sai correndo. Pego correndo, disfarça. */
export function updateEncostado(game, e, dt, d, ux, uy) {
  const E = ENEMIES.encostado;
  const p = game.player;
  if (e.flagradoT > 0) {
    e.flagradoT -= dt;
    return { x: 0, y: 0 };
  }
  const visto = juninhoOlha(p, e, E.vistoCos);
  if (visto && e.correndo) {
    // pego no flagra: congela com a muleta no alto e solta a desculpa (uma de cada vez, para não encher a tela)
    e.correndo = false;
    e.flagradoT = E.flagradoS;
    e.raivaT = E.flagradoS;
    if (game.t - (game.encostadoFalaT ?? -99) > 1.2 && game.t - (e.falouT ?? -99) > E.fraseS && d < 14) {
      game.encostadoFalaT = game.t;
      e.falouT = game.t;
      game.word(e.x, e.y - 1.4, E.frases[Math.floor(game.fxRng() * E.frases.length)], '#9fd4ff');
      game.som('gemido', e.x, e.y);
      if (game.fxRng() < 0.3) game.tv('encostado', 40);
    }
    return { x: 0, y: 0 };
  }
  e.correndo = !visto && !game.over;
  const mul = e.correndo ? E.correMul : E.lentoMul;
  e.walk += dt * e.speed * 3 * (mul - 1); // as pernas no ritmo de quem corre (ou de quem manca)
  return { x: ux * mul, y: uy * mul };
}
