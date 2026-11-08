// Super da relíquia (D67, pedido do autor em 08/11/2026). A relíquia é uma carta especial, fora das vagas de
// habilidade, com botão próprio. Vem cheia quando é achada e recarrega bem devagar: pelo tempo e um pouco pelos
// inimigos derrubados, nunca por anúncio ou compra. Solta um golpe enorme:
// - Golaço (Bola da Altinha): a bola fica gigante e atravessa a tela por uns segundos, quicando em todo mundo;
// - Solta o Batidão (Paredão de Som): o paredão cai do céu, o grave empurra a horda e quem está na tela dança.
// Achar a relíquia tem cena própria: o tempo para, o Juninho sobe no ar, a relíquia voa do esconderijo e entra
// nele, e aí o estouro (luz, som e uma onda que empurra a horda). Números em config.js (RELIQUIAS, SUPER).
// Sem DOM: roda igual no navegador e nos testes.
import { RELIQUIAS, SUPER, DIRECTOR, CARREIRA } from './config.js';
import { golpeNoCarro } from './reacoes.js';

const tmp = [];
const pt = { x: 0, y: 0 };
const ease = (k) => 1 - (1 - k) ** 3;

/**
 * O dano da super cresce junto com a vida da horda (mesma conta do nascimento, sem as melhorias da partida):
 * a carta especial pesa igual no começo e no fim do trecho. E soma o bônus de dano do Juninho.
 */
function danoMul(game) {
  const tt = game.world ? Math.max(0, game.t - (game.trechoT0 || 0)) : game.t;
  const base = game.world ? CARREIRA.trechoHpMul[game.segment] || 1 : 1;
  return DIRECTOR.hpScale(tt) * base * (game.stats.dmgMul || 1);
}

// ---------- cena de achar a relíquia ----------

/** Começa a cena: a = o achado (de onde a relíquia voa até o Juninho). */
export function cenaReliquia(game, id, a = null) {
  const p = game.player;
  game.cena = { kind: 'reliquia', id, t: 0, x0: a ? a.x : p.x, y0: a ? a.y : p.y, z0: p.z || 0, estourou: false };
  game.som('reliquia_sobe');
  game.shake(0.12);
}

/** Avança a cena. Devolve true enquanto o tempo está parado (até a relíquia entrar no Juninho). */
export function updateCena(game, dt) {
  const C = game.cena;
  if (!C) return false;
  const S = SUPER.cena;
  C.t += dt;
  if (!C.estourou && C.t >= S.chegaS) {
    C.estourou = true;
    estouro(game, C);
  }
  if (C.t >= S.durS) {
    game.cena = null;
    return false;
  }
  return !C.estourou;
}

/** A relíquia entrou no Juninho: a carta fica cheia, luz, som e a onda que empurra quem está perto. */
function estouro(game, C) {
  const S = SUPER.cena;
  const p = game.player;
  const R = RELIQUIAS[C.id];
  p.reliquia = C.id;
  p.superCarga = 1;
  p.invulnT = Math.max(p.invulnT || 0, S.durS - S.chegaS + 0.6);
  game.superT = 0;
  game.emit('reliquia', { id: C.id }); // o acorde da relíquia (main.js)
  game.som('reliquia_estouro');
  game.som('explosao');
  game.shake(0.7);
  game.tv(`reliquia_${C.id}`);
  game.word(p.x, p.y - 1, `${R.superNome.toUpperCase()}!`, '#ffd21f');
  game.burst(p.x, p.y, 26, 'fogo');
  const mul = danoMul(game);
  for (const e of game.enemies) {
    if (e.dead) continue;
    const dx = e.x - p.x;
    const dy = e.y - p.y;
    const d = Math.hypot(dx, dy) || 0.01;
    if (d > S.raioM) continue;
    const emp = e.boss ? 0 : S.empurra * (1 - (d / S.raioM) * 0.5);
    game.damageEnemy(e, S.dano * mul, 'reliquia', (dx / d) * emp, (dy / d) * emp);
  }
}

/** Altura do Juninho no ar durante a cena (m): sobe, flutua, e desce depois do estouro. */
export function alturaNaCena(game) {
  const C = game.cena;
  if (!C) return 0;
  const S = SUPER.cena;
  const t = C.t;
  if (t < S.sobeS) return ease(t / S.sobeS) * S.alturaM;
  if (t < S.chegaS) return S.alturaM + Math.sin((t - S.sobeS) * 5) * 0.06;
  return S.alturaM * (1 - ease(Math.min(1, (t - S.chegaS) / (S.durS - S.chegaS))));
}

// ---------- carga e uso ----------

/** A carta está cheia e dá para usar agora. */
export function superPronta(game) {
  const p = game.player;
  return !!p.reliquia && p.superCarga >= 1 && !(game.superT > 0) && !game.cena && !game.over && !game.modal;
}

/** Usa a super (botão na tela, Espaço no teclado, o bot). Devolve se usou. */
export function usarSuper(game) {
  if (!superPronta(game)) return false;
  const p = game.player;
  const id = p.reliquia;
  const R = RELIQUIAS[id];
  p.superCarga = 0;
  game.superT = R.super.durS;
  game.metrics.supers = (game.metrics.supers || 0) + 1;
  game.metrics[`super_${id}`] = (game.metrics[`super_${id}`] || 0) + 1;
  if (id === 'altinha') golaco(game, R.super);
  else batidao(game, R.super);
  game.som('super');
  game.tv(`super_${id}`);
  game.emit('super', { id });
  return true;
}

/** Carga pelo tempo (e o fim da super ativa). Chamado a cada quadro, depois das armas. */
export function updateSuper(game, dt) {
  const p = game.player;
  if (!p.reliquia) return;
  if (game.superT > 0) {
    game.superT -= dt;
    return;
  }
  if (p.superCarga < 1) carregar(game, dt);
}

/** Cada inimigo derrubado adianta um pouco a carga (elite e chefão, mais). */
export function cargaPorAbate(game, e) {
  if (!game.player.reliquia || game.superT > 0 || game.cena) return;
  carregar(game, e.boss ? SUPER.chefeS : e.elite ? SUPER.eliteS : SUPER.abateS);
}

function carregar(game, s) {
  const p = game.player;
  if (p.superCarga >= 1) return;
  p.superCarga = Math.min(1, (p.superCarga || 0) + s / SUPER.cargaS);
  if (p.superCarga >= 1) {
    game.som('super_pronta');
    game.emit('super_pronta', { id: p.reliquia });
  }
}

// ---------- Golaço ----------

function golaco(game, G) {
  const p = game.player;
  const d = { x: p.faceX || 0, y: p.faceY || -1 };
  meioDaHorda(game, p.x, p.y, d);
  const l = Math.hypot(d.x, d.y) || 1;
  game.projectiles.push({
    kind: 'golaco', x: p.x, y: p.y, vx: (d.x / l) * G.velM, vy: (d.y / l) * G.velM, life: G.durS, t: 0,
    fase: 0, alt: 0, quicou: 0, spin: 0, voltando: false, bateu: new Map(), carros: new Set(), src: 'golaco',
  });
  game.word(p.x, p.y - 1, 'GOLAÇO!', '#ffd21f');
  game.som('bola', p.x, p.y);
  game.shake(0.3);
}

/** Direção do meio da horda que está na tela, a partir de (x, y); sem ninguém, fica a direção dada. */
function meioDaHorda(game, x, y, out) {
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (const e of game.enemies) {
    if (e.dead || !game.onScreen(e.x, e.y)) continue;
    sx += e.x;
    sy += e.y;
    n++;
  }
  if (!n) return out;
  out.x = sx / n - x;
  out.y = sy / n - y;
  if (Math.hypot(out.x, out.y) < 0.5) {
    // o meio da horda é aqui: vai no mais perto
    let best = null;
    let bd = Infinity;
    for (const e of game.enemies) {
      if (e.dead) continue;
      const d2 = (e.x - x) ** 2 + (e.y - y) ** 2;
      if (d2 < bd) {
        bd = d2;
        best = e;
      }
    }
    if (best && bd > 0.01) {
      out.x = best.x - x;
      out.y = best.y - y;
    }
  }
  return out;
}

/** A bola gigante: corre reto, quica no chão, volta da beira da tela para o meio da horda, bate em todo mundo. */
function updateGolaco(game, pr, dt) {
  const G = RELIQUIAS.altinha.super;
  pr.t += dt;
  pr.life -= dt;
  pr.fase += dt / G.quicaS;
  pr.alt = Math.sin((pr.fase % 1) * Math.PI) * G.altM;
  pr.spin += dt * 9;
  if (Math.floor(pr.fase) !== pr.quicou) {
    pr.quicou = Math.floor(pr.fase); // bateu no chão
    game.som('bola', pr.x, pr.y);
    game.burst(pr.x, pr.y, 4, 'poeira');
    game.shake(0.05);
  }
  pr.x += pr.vx * dt;
  pr.y += pr.vy * dt;
  const m = game.map;
  if (m && m.bounded) {
    if (pr.x < m.minX + G.raioM) {
      pr.x = m.minX + G.raioM;
      pr.vx = Math.abs(pr.vx);
    } else if (pr.x > m.maxX - G.raioM) {
      pr.x = m.maxX - G.raioM;
      pr.vx = -Math.abs(pr.vx);
    }
  }
  // na beira da tela: vira para o meio da horda (ou para o Juninho), com um desvio, e atravessa de novo
  const cam = game.camera;
  cam.toScreen(pr.x, pr.y, pt);
  const mg = 34;
  const fora = pt.x < mg || pt.x > cam.viewW - mg || pt.y < (cam.playTop || 0) + mg || pt.y > (cam.playBottom || cam.viewH) - mg;
  if (fora && !pr.voltando) {
    pr.voltando = true;
    const p = game.player;
    const d = { x: p.x - pr.x, y: p.y - pr.y };
    const h = meioDaHorda(game, pr.x, pr.y, { x: d.x, y: d.y });
    const tx = (h.x + d.x) / 2; // entre o meio da horda e o Juninho: a bola volta sempre para a tela
    const ty = (h.y + d.y) / 2;
    const a = Math.atan2(ty, tx) + (game.rng() - 0.5) * 0.7;
    pr.vx = Math.cos(a) * G.velM;
    pr.vy = Math.sin(a) * G.velM;
  } else if (!fora) pr.voltando = false;
  // pancada em quem a bola pega (cada um, de novo só depois de acertaCadaS)
  const mul = danoMul(game);
  const v = Math.hypot(pr.vx, pr.vy) || 1;
  game.hash.query(pr.x, pr.y, G.raioM + 1.2, tmp);
  for (const e of tmp) {
    if (e.dead) continue;
    const dx = e.x - pr.x;
    const dy = e.y - pr.y;
    const rr = G.raioM + (e.r || 0.3);
    if (dx * dx + dy * dy > rr * rr) continue;
    if (pr.t - (pr.bateu.get(e.id) ?? -9) < G.acertaCadaS) continue;
    pr.bateu.set(e.id, pr.t);
    const d = Math.hypot(dx, dy) || 0.01;
    const emp = e.boss ? 0 : G.empurra;
    // para frente (no sentido da bola) e para o lado de fora
    const kx = ((pr.vx / v) * 0.6 + (dx / d) * 0.8) * emp;
    const ky = ((pr.vy / v) * 0.6 + (dy / d) * 0.8) * emp;
    game.damageEnemy(e, G.dano * mul, 'golaco', kx, ky);
  }
  golpeNoCarro(game, pr.x, pr.y, G.raioM, G.carroDano, pr.carros);
  return pr.life <= 0;
}

// ---------- Solta o Batidão ----------

function batidao(game, B) {
  const p = game.player;
  // do lado do Juninho, para o lado do meio do mapa (longe da parede)
  const m = game.map;
  const lado = m && m.bounded && p.x > (m.minX + m.maxX) / 2 ? -1 : 1;
  game.projectiles.push({
    kind: 'batidao', x: p.x + lado * 1.1, y: p.y + 0.2, z: p.z || 0, t: 0, life: B.durS, onda: -1, bateu: new Set(),
    batida: 0, batidaT: 9, pulso: 0, lado: -lado, chefes: new Set(), src: 'batidao',
  });
  game.word(p.x, p.y - 1, 'SOLTA O BATIDÃO!', '#ff3cc8');
}

/** Quem está na tela (ou no alcance) entra na dança; quem chega depois, dança o que falta da música. */
function dancar(game, pr, B) {
  const resta = Math.max(0.3, B.dancaS - (pr.t - B.caiS));
  for (const e of game.enemies) {
    if (e.dead) continue;
    const d2 = (e.x - pr.x) ** 2 + (e.y - pr.y) ** 2;
    if (d2 > B.raioM * B.raioM && !game.onScreen(e.x, e.y)) continue;
    if (e.boss) {
      if (pr.chefes.has(e.id)) continue; // o chefão dança uma vez só, e menos
      pr.chefes.add(e.id);
      e.bailaT = B.chefeDancaS;
      continue;
    }
    if (!(e.bailaT > 0)) e.bailaT = resta;
  }
}

function updateBatidao(game, pr, dt) {
  const B = RELIQUIAS.paredao.super;
  pr.t += dt;
  pr.life -= dt;
  if (pr.pulso > 0) pr.pulso = Math.max(0, pr.pulso - dt * 3);
  pr.batidaT += dt;
  if (pr.t < B.caiS) return false; // caindo do céu
  if (!pr.caiu) {
    // chegou no chão: o grave grande sai e todo mundo na tela para para dançar
    pr.caiu = true;
    pr.onda = 0;
    pr.pulso = 1;
    pr.batida = B.batidaS;
    pr.batidaT = 0;
    game.shake(0.45);
    game.som('paredao', pr.x, pr.y);
    game.som('baque', pr.x, pr.y);
    game.burst(pr.x, pr.y, 10, 'poeira');
    dancar(game, pr, B);
  }
  const mul = danoMul(game);
  if (pr.onda >= 0) {
    pr.onda += B.velM * dt;
    const r = Math.min(pr.onda, B.raioM);
    for (const e of game.enemies) {
      if (e.dead || pr.bateu.has(e.id)) continue;
      const dx = e.x - pr.x;
      const dy = e.y - pr.y;
      const d = Math.hypot(dx, dy) || 0.01;
      if (d > r + (e.r || 0.3)) continue;
      pr.bateu.add(e.id);
      const emp = e.boss ? 0 : B.empurra;
      game.damageEnemy(e, B.dano * mul, 'batidao', (dx / d) * emp, (dy / d) * emp);
    }
    if (pr.onda >= B.raioM) pr.onda = -1;
  }
  pr.batida -= dt;
  if (pr.batida <= 0 && pr.life > 0.3) {
    // mais uma batida do grave: dano pequeno em quem dança e mais gente na dança
    pr.batida += B.batidaS;
    pr.pulso = 1;
    pr.batidaT = 0;
    game.som('paredao', pr.x, pr.y);
    game.shake(0.08);
    for (const e of game.enemies) {
      if (e.dead || !(e.bailaT > 0)) continue;
      game.damageEnemy(e, B.batidaDano * mul, 'batidao', 0, 0, true);
    }
    dancar(game, pr, B);
  }
  return pr.life <= 0;
}

/** Projéteis da super (chamado de updateProjectiles). Devolve true quando acabou. */
export function updateSuperProj(game, pr, dt) {
  if (pr.kind === 'golaco') return updateGolaco(game, pr, dt);
  return updateBatidao(game, pr, dt);
}
