// Chegada do Monstrão e o cerco da horda (D82, pedido do autor). Com o covil aberto a Orla silencia conforme o
// Juninho chega perto do fim da praia; perto, a música para, a horda se organiza num cerco em volta dele e o
// Monstrão vem a pé pela avenida. O cerco fecha um passo de cada vez; encostar nele machuca e empurra para dentro.
// Os do cerco não são inimigos (as armas não miram neles): é uma parede de gente, leve de simular e de desenhar.
// Sem DOM: os números estão em config.js (CHEGADA).
import { CHEGADA } from './config.js';
import { removeSolid } from './mundo.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const VOLTA = Math.PI * 2;

/** O meio da arena: na frente da obra do fim da Orla, colada na entrada da favela. */
export function centroDaArena(game, out = {}) {
  const o = game.world.obra;
  const Z = CHEGADA.cerco.centro;
  out.x = o.x1 + Z.dxObra;
  out.y = (o.y0 + o.y1) / 2 + Z.dyObra;
  return out;
}

const tmpC = { x: 0, y: 0 };

/** O quanto a Orla está em silêncio (0 a 1): cresce com o covil aberto conforme o Juninho chega perto da arena. */
export function silencioDoCovil(game) {
  const K = game.cerco;
  if (K) return K.fase === 'dispersa' ? clamp(1 - K.t / CHEGADA.cerco.dispersaS, 0, 1) : 1;
  const C = game.covil;
  if (!C || !C.aberto || C.saiu || C.trecho !== 'orla' || !game.world) return 0;
  const p = game.player;
  const a = centroDaArena(game, tmpC);
  const d = Math.hypot(p.x - a.x, p.y - a.y);
  return clamp((CHEGADA.silencioDeM - d) / (CHEGADA.silencioDeM - CHEGADA.silencioAteM), 0, 1);
}

/** O Juninho entrou na arena: hora de o Monstrão chegar. */
export function hora(game) {
  const p = game.player;
  const a = centroDaArena(game, tmpC);
  return Math.hypot(p.x - a.x, p.y - a.y) < CHEGADA.disparaM;
}

/** Arena vazia: sai do chão, dentro da roda, o que atrapalha a luta (mesas, bancos, lixeiras, postes, objetos). */
function limparArena(game, cx, cy, r) {
  const w = game.world;
  const r2 = (r + CHEGADA.cerco.limpaM) ** 2;
  const dentro = (k) => {
    const qx = clamp(cx, k.x0 ?? k.x, k.x1 ?? k.x);
    const qy = clamp(cy, k.y0 ?? k.y, k.y1 ?? k.y);
    return (qx - cx) ** 2 + (qy - cy) ** 2 < r2;
  };
  let n = 0;
  for (let i = w.props.length - 1; i >= 0; i--) {
    const k = w.props[i];
    if (!dentro(k)) continue;
    w.props.splice(i, 1);
    if (k.solid) removeSolid(w, k);
    n++;
  }
  for (let i = w.slots.length - 1; i >= 0; i--) {
    if (!dentro(w.slots[i])) continue;
    w.slots.splice(i, 1); // os objetos de pegar e arremessar também saem (e não voltam ali)
    n++;
  }
  if (w.figurantes) w.figurantes = w.figurantes.filter((f) => f.grupo || !dentro(f)); // quem é do grupo fica
  return n;
}

/** Onde o Monstrão entra: pela avenida, no fim da Orla (a parede invisível da rua). */
export function pontoDeEntrada(game) {
  return { x: CHEGADA.entradaX, y: game.world.orlaTop + CHEGADA.entradaDy };
}

/** O Monstrão já está na Orla e a horda vira o cerco em volta do Juninho. */
export function iniciarCerco(game, boss) {
  const K = CHEGADA.cerco;
  const { x: cx, y: cy } = centroDaArena(game);
  limparArena(game, cx, cy, K.raioM);
  const cerco = { x: cx, y: cy, r: K.raioM, fase: 'junta', t: 0, passoT: K.fechaS, toqueT: 0, heT: 0, membros: [], boss };
  const n = Math.floor((VOLTA * K.raioM) / K.espacoM);
  for (let l = 0; l < K.linhas; l++) {
    for (let i = 0; i < n; i++) {
      const ang = ((i + (l % 2) * 0.5) / n) * VOLTA;
      const longe = 7 + game.fxRng() * 12; // quem não estava na tela chega de fora
      cerco.membros.push({
        ang, linha: l, tint: game.roupa('telespectador', game.fxRng()), fase: game.fxRng() * 6,
        x0: cx + Math.cos(ang) * (K.raioM + longe), y0: cy + Math.sin(ang) * (K.raioM + longe), jit: (game.fxRng() - 0.5) * 0.3,
      });
    }
  }
  // a horda que já estava ali vai andando para o lugar mais perto no cerco; o resto sai sem cair
  for (const o of game.enemies) {
    if (o.dead || o.boss) continue;
    const dx = o.x - cx;
    const dy = o.y - cy;
    if (dx * dx + dy * dy < 24 * 24) {
      const ang = Math.atan2(dy, dx);
      let melhor = null;
      let md = 1;
      for (const m of cerco.membros) {
        if (m.veio) continue;
        const da = Math.abs((((m.ang - ang) % VOLTA) + VOLTA * 1.5) % VOLTA - Math.PI);
        if (da < md) {
          md = da;
          melhor = m;
        }
      }
      if (melhor) {
        melhor.veio = true;
        melhor.x0 = o.x;
        melhor.y0 = o.y;
        if (o.type === 'telespectador') melhor.tint = o.tint;
      }
    }
    o.dead = true; // entrou no cerco: não conta abate, não solta nada
  }
  game.enemyShots.length = 0;
  game.traffic.length = 0; // a avenida fecha: a torcida está no meio dela
  game.cerco = cerco;
  return cerco;
}

/** Raio de um do cerco agora, com a brecha que se abre para o Monstrão passar. */
export function raioDoMembro(K, m) {
  let r = K.r + m.linha * CHEGADA.cerco.linhaM + m.jit;
  if (K.brecha != null) {
    const da = Math.abs((((m.ang - K.brecha) % VOLTA) + VOLTA * 1.5) % VOLTA - Math.PI);
    const B = CHEGADA.cerco.brechaRad;
    if (da < B) r += 2.4 * (1 - da / B) * (K.brechaK || 0);
  }
  if (K.fase === 'dispersa') r += K.t * (5 + (m.fase % 3));
  return r;
}

/** Onde está um do cerco agora (no chão, em metros). */
export function posDoMembro(K, m, out) {
  const r = raioDoMembro(K, m);
  const sx = K.x + Math.cos(m.ang) * r;
  const sy = K.y + Math.sin(m.ang) * r;
  if (K.fase === 'junta') {
    const k = clamp(K.t / CHEGADA.cerco.juntaS, 0, 1);
    const e = k * k * (3 - 2 * k);
    out.x = m.x0 + (sx - m.x0) * e;
    out.y = m.y0 + (sy - m.y0) * e;
  } else {
    out.x = sx;
    out.y = sy;
  }
  return out;
}

/** O Monstrão andando pela avenida até a arena (devolve para onde ele anda, na velocidade de entrada). */
export function entradaDoMonstrao(game, e, mov) {
  const K = game.cerco;
  if (!K) {
    mov.x = 0;
    mov.y = 0;
    return mov;
  }
  const dx = K.x - e.x;
  const dy = K.y - e.y;
  const l = Math.hypot(dx, dy) || 1;
  const v = CHEGADA.velEntrada / (e.speed || 1);
  mov.x = (dx / l) * v;
  mov.y = (dy / l) * v;
  e.dirX = dx / l;
  e.dirY = dy / l;
  return mov;
}

/** Fora do cerco (para quem tem raio r)? Os golpes do Monstrão param nele como num carro. */
export function foraDoCerco(game, x, y, r = 0) {
  const K = game.cerco;
  if (!K || K.fase === 'dispersa' || (K.boss && K.boss.entrando)) return false;
  return Math.hypot(x - K.x, y - K.y) > K.r - r - 0.2;
}

/** Um quadro do cerco: a horda chega, o Monstrão entra, a roda fecha e empurra quem encosta. */
export function updateCerco(game, dt) {
  const K = game.cerco;
  if (!K) return;
  const Q = CHEGADA.cerco;
  const p = game.player;
  const e = K.boss;
  K.t += dt;
  if (K.heT > 0) K.heT -= dt;
  if (K.fase === 'dispersa') {
    if (K.t >= Q.dispersaS) game.cerco = null;
    return;
  }
  // o Monstrão entrando: um tremor a cada passo; a torcida abre a brecha por onde ele vem
  if (e && e.entrando) {
    K.passoBossT = (K.passoBossT ?? 0) - dt;
    if (K.passoBossT <= 0) {
      K.passoBossT = CHEGADA.passoS;
      game.shake(0.16);
      game.som('soco_chao', e.x, e.y);
      game.burst(e.x, e.y, 4, 'poeira');
    }
    const de = Math.hypot(e.x - K.x, e.y - K.y);
    K.brecha = Math.atan2(e.y - K.y, e.x - K.x);
    K.brechaK = clamp((de - (K.r - 2.5)) / 2, 0, 1);
    if (de < K.r - 2.5 && K.fase !== 'junta') {
      e.entrando = false;
      e.golpe = 'pose'; // urra na arena
      e.golpeT = CHEGADA.urroS;
      e.janelaT = 0;
      e.pausaT = CHEGADA.urroS;
      game.som('urro', e.x, e.y);
      game.shake(0.6);
      game.word(e.x, e.y - 2.2, 'UAAARGH!', '#ff5a3c');
      game.tv('chegadaUrro');
      K.fase = 'luta';
      K.passoT = Q.fechaS;
    }
  } else if (K.brechaK > 0) {
    K.brechaK = Math.max(0, K.brechaK - dt * 1.5); // a torcida fecha atrás dele
  }
  if (K.fase === 'junta' && K.t >= Q.juntaS) {
    K.fase = e && e.entrando ? 'espera' : 'luta';
    const d = Math.hypot(p.x - K.x, p.y - K.y);
    if (d > K.r - 0.8) {
      // ficou do lado de fora: a torcida empurra o Juninho para dentro
      const l = d || 1;
      p.x = K.x + ((p.x - K.x) / l) * (K.r - 1.6);
      p.y = K.y + ((p.y - K.y) / l) * (K.r - 1.6);
      game.word(p.x, p.y - 1.2, 'PRA DENTRO!', '#ffd21f');
    }
  }
  // a roda fecha: um passo para dentro, todos juntos ("HU!")
  if (K.fase === 'luta') {
    K.passoT -= dt;
    if (K.passoT <= 0 && K.r > Q.minM) {
      K.passoT = Q.fechaS;
      K.r = Math.max(Q.minM, K.r - Q.passoM);
      K.heT = 0.45;
      game.shake(0.12);
      game.som('baque', K.x, K.y - K.r);
      for (let i = 0; i < 3; i++) {
        const a = game.fxRng() * VOLTA;
        game.word(K.x + Math.cos(a) * K.r, K.y + Math.sin(a) * K.r - 1.2, 'HU!', '#e9e3d4');
      }
    }
  }
  if (K.fase === 'junta') return;
  // ninguém sai: quem está dentro fica dentro (o Monstrão também, menos quando está entrando)
  for (const o of game.enemies) {
    if (o.dead || o.entrando) continue;
    const dx = o.x - K.x;
    const dy = o.y - K.y;
    const d = Math.hypot(dx, dy) || 1;
    const lim = K.r - (o.r || 0.3) - 0.15;
    if (d > lim) {
      o.x = K.x + (dx / d) * lim;
      o.y = K.y + (dy / d) * lim;
    }
  }
  // o Juninho encostou na torcida: apanha e é empurrado para dentro
  if (K.toqueT > 0) K.toqueT -= dt;
  const dx = p.x - K.x;
  const dy = p.y - K.y;
  const d = Math.hypot(dx, dy) || 1;
  const lim = K.r - (p.r || 0.3) - 0.1;
  if (d > lim) {
    p.x = K.x + (dx / d) * lim;
    p.y = K.y + (dy / d) * lim;
    if (K.toqueT <= 0 && !game.over) {
      K.toqueT = Q.cdS;
      game.hurtPlayer(Q.dano, 'cerco');
      game.empurrarJuninho(-dx, -dy, Q.empurra);
      K.heT = 0.3;
      if (!K.avisou) {
        K.avisou = true;
        game.tv('cercoEmpurra');
      }
    }
  }
}

/** Para onde a câmera se desloca do Juninho (m): na direção do Monstrão enquanto ele entra; depois volta. */
export function deslocaCamera(game, dt) {
  const o = game.camOff || (game.camOff = { x: 0, y: 0 });
  let tx = 0;
  let ty = 0;
  const K = game.cerco;
  if (K && K.boss && K.boss.entrando && !K.boss.dead) {
    const dx = K.boss.x - game.player.x;
    const dy = K.boss.y - game.player.y;
    const l = Math.hypot(dx, dy) || 1;
    const m = Math.min(CHEGADA.cameraM, l * 0.55);
    tx = (dx / l) * m;
    ty = (dy / l) * m;
  }
  const k = Math.min(1, dt * 2.2);
  o.x += (tx - o.x) * k;
  o.y += (ty - o.y) * k;
  if (Math.abs(o.x) < 0.01 && Math.abs(o.y) < 0.01 && !tx && !ty) o.x = o.y = 0;
  return o;
}

/** O Monstrão caiu: a torcida se espalha e a Orla volta a fazer barulho. */
export function fimDoCerco(game) {
  const K = game.cerco;
  if (!K || K.fase === 'dispersa') return;
  K.fase = 'dispersa';
  K.t = 0;
  K.brecha = null;
}

/** Nasce gente de dentro do cerco (a assessoria do Monstrão): na beira de dentro, num ângulo qualquer. */
export function pontoNoCerco(game, out = {}) {
  const K = game.cerco;
  const a = game.rng() * VOLTA;
  const r = Math.max(1.5, K.r - 1.4);
  out.x = K.x + Math.cos(a) * r;
  out.y = K.y + Math.sin(a) * r;
  return out;
}
