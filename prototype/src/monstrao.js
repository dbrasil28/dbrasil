// Monstrão, o chefão da Orla (D47): fisiculturista gigante que vem para cima. Todo golpe tem aviso no chão (D25):
//   investida de ombro (faixa vermelha), agachamento com soco no chão (círculo), anilha rolando (faixa fina) e,
//   da fase 2 em diante, o carro arremessado (círculo onde vai cair). Na fase 2 as investidas vêm em sequência;
//   na fase 3 ele fica vermelho e mais rápido, a investida quica na borda e o soco no chão solta um anel de choque
//   com uma brecha.
// A hora de bater: depois da investida ele para fazendo pose de fisiculturista; se bateu em carro, poste ou
// barraca, fica tonto. Nos dois, leva o dobro de dano (config: ENEMIES.monstrao.janela).
// Sem DOM: os avisos ficam em game.avisosChao (o desenho e o bot leem), os objetos em game.monstraoObjs.
import { ENEMIES, REACOES } from './config.js';
import { foraDoCerco, entradaDoMonstrao, pontoNoCerco } from './chegada.js';
import { explosaoPerto } from './reacoes.js';
import { pathIndex } from './mundo.js';
import { ferirFigurantes } from './figurantes.js';

const tmp = [];
const mov = { x: 0, y: 0, vel: 1 };

/** Avisos do quadro: { tipo: 'faixa', x, y, dx, dy, len, larg, k } ou { tipo: 'circulo', x, y, r, k } (k: 0 a 1). */
function aviso(game, a) {
  (game.avisosChao || (game.avisosChao = [])).push(a);
}

const objs = (game) => game.monstraoObjs || (game.monstraoObjs = []);

function fim(e, D, f) {
  e.golpe = null;
  e.pose = null;
  e.segura = null;
  e.pausaT = D.pausaS[f];
}

function mira(e, x, y) {
  const dx = x - e.x;
  const dy = y - e.y;
  const l = Math.hypot(dx, dy) || 1;
  e.dirX = dx / l;
  e.dirY = dy / l;
  e.poseX = e.dirX;
  e.poseY = e.dirY;
}

function iniciar(game, e, D, f, d) {
  const p = game.player;
  e.golpeIni = game.t;
  if (d < D.agacha.pertoM) {
    // colou nele: levanta os punhos e soca o chão
    e.golpe = 'levanta';
    e.golpeT = D.agacha.avisoS;
    game.som('aviso_chao', e.x, e.y);
    mira(e, p.x, p.y);
    return;
  }
  const r = game.rng();
  if (f >= 1 && r < D.carro.chance) {
    // arranca um carro e joga onde o Juninho vai estar
    e.golpe = 'carro';
    e.golpeT = D.carro.avisoS;
    e.segura = 'carro';
    e.carroArte = D.carro.arte[Math.floor(game.rng() * D.carro.arte.length)];
    game.som('urro', e.x, e.y); // arrancando o carro do chão
    e.alvoX = p.x + p.vx * D.carro.lead;
    e.alvoY = p.y + p.vy * D.carro.lead;
    mira(e, e.alvoX, e.alvoY);
    return;
  }
  if (r < D.escolha.investida + (f >= 1 ? D.carro.chance : 0)) {
    e.golpe = 'preparo';
    e.golpeT = D.investida.avisoS;
    e.corridas = D.investida.seguidas[f];
    game.som('urro', e.x, e.y); // o aviso da investida também se ouve
    mira(e, p.x, p.y);
    return;
  }
  e.golpe = 'arremesso';
  e.golpeT = D.anilha.avisoS;
  game.som('aviso_chao', e.x, e.y);
  mira(e, p.x + p.vx * D.anilha.lead, p.y + p.vy * D.anilha.lead);
}

/** Bateu num sólido do cenário? Devolve o sólido (carro, poste, barraca...). */
function solidoEm(game, x, y, r) {
  const w = game.world;
  if (!w) return null;
  if (foraDoCerco(game, x, y, r)) return { kind: 'cerco', x, y }; // a torcida do cerco é parede (D82)
  for (const k of w.solids) {
    if (y < k.y0 - r - 3 || y > k.y1 + r + 3) continue;
    const qx = Math.max(k.x0, Math.min(x, k.x1));
    const qy = Math.max(k.y0, Math.min(y, k.y1));
    if ((qx - x) ** 2 + (qy - y) ** 2 < r * r) return k;
  }
  return null;
}

/** Dentro da área de andar da rota (para a anilha e a investida na borda). */
function naRota(game, x, y, r) {
  const w = game.world;
  if (!w) {
    const m = game.map;
    return !m.bounded || (x > m.minX + r && x < m.maxX - r);
  }
  return pathIndex(w, x, y) >= 0;
}

function empurraJuninho(game, dx, dy, m) {
  const p = game.player;
  p.x += dx * m;
  p.y += dy * m;
  game.clampToMap(p);
}

/**
 * O golpe pegou no Juninho (D86): machuca e ele voa para trás no sentido (dx, dy), cai de costas, rola e levanta,
 * como atropelado (game.derrubar). Imune (já no chão ou levantando), não acontece nada.
 */
function acertaJuninho(game, dano, dx, dy, vooM) {
  const p = game.player;
  if (p.invulnT > 0 || game.over) return false;
  game.hurtPlayer(dano, 'monstrao');
  if (!game.derrubar(dx, dy, vooM)) empurraJuninho(game, dx, dy, Math.min(1.5, vooM));
  game.som('atropelo', p.x, p.y);
  return true;
}

function investida(game, e, D, f, dt) {
  const I = D.investida;
  const p = game.player;
  const vel = I.vel * (e.furia ? D.furiaVel : 1);
  const step = vel * dt;
  const x0 = e.x;
  const y0 = e.y;
  e.x += e.dirX * step;
  e.y += e.dirY * step;
  e.percorrido += step;
  e.walk += dt * vel * 1.5;
  // atropela a horda no caminho
  game.hash.query(e.x, e.y, e.r + 1, tmp);
  for (const o of tmp) {
    if (o === e || o.dead || o.boss || e.atropelou.has(o.id)) continue;
    if ((o.x - e.x) ** 2 + (o.y - e.y) ** 2 > (e.r + o.r + 0.2) ** 2) continue;
    e.atropelou.add(o.id);
    const lado = (o.x - e.x) * -e.dirY + (o.y - e.y) * e.dirX >= 0 ? 1 : -1;
    game.damageEnemy(o, I.hordaDano, 'monstrao', (e.dirX - e.dirY * lado) * I.voo, (e.dirY + e.dirX * lado) * I.voo, true);
  }
  // quem do grupo estiver no caminho leva a ombrada também
  for (const f of (game.world && game.world.figurantes) || []) {
    if ((e.atropelouF ||= new Set()).has(f) || Math.hypot(f.x - e.x, f.y - e.y) > e.r + f.r + 0.2) continue;
    e.atropelouF.add(f);
    f.hp -= I.dano;
    f.hurtT = 0.2;
  }
  // pega o Juninho uma vez por investida
  if (!e.acertou && Math.hypot(p.x - e.x, p.y - e.y) < e.r + (p.r || 0.3) + 0.2) {
    e.acertou = true;
    if (acertaJuninho(game, I.dano, e.dirX, e.dirY, I.derrubaM)) game.shake(0.35);
  }
  // bateu em carro, poste ou barraca: fica tonto (e o carro pode explodir)
  const k = solidoEm(game, e.x + e.dirX * e.r * 0.6, e.y + e.dirY * e.r * 0.6, e.r * 0.55);
  if (k) {
    e.x = x0;
    e.y = y0;
    e.golpe = 'tonto';
    e.golpeT = I.tontoS;
    e.janelaT = I.tontoS;
    e.pose = 'tonto';
    game.shake(0.5);
    game.burst(e.x + e.dirX * e.r, e.y + e.dirY * e.r, 10, 'poeira');
    game.word(e.x, e.y - 1, 'BUM!', '#ffd21f');
    game.som('carro_cai', e.x, e.y); // deu com o ombro no carro, no poste
    if (REACOES.carro.tipos[k.kind]) explosaoPerto(game, k.x, k.y, 0.5);
    game.emit('monstrao', { golpe: 'tonto' });
    return;
  }
  // borda da rota (prédios, mar): na fase 3 quica; antes, para ali
  if (!naRota(game, e.x + e.dirX * e.r, e.y + e.dirY * e.r, 0)) {
    e.x = x0;
    e.y = y0;
    if (e.quiques > 0) {
      e.quiques--;
      const bx = naRota(game, x0 - e.dirX * e.r * 1.2, y0 + e.dirY * e.r * 1.2, 0);
      if (bx) e.dirX = -e.dirX;
      else e.dirY = -e.dirY;
      e.poseX = e.dirX;
      e.poseY = e.dirY;
      game.shake(0.3);
      game.burst(x0, y0, 8, 'poeira');
      return;
    }
    e.percorrido = I.distM;
  }
  if (e.percorrido >= I.distM) {
    if (e.corridas > 1) {
      // sequência (fase 2 e 3): mira de novo, aviso curto
      e.corridas--;
      e.golpe = 'preparo';
      e.golpeT = I.avisoSeguidaS;
      mira(e, p.x, p.y);
    } else {
      e.golpe = 'pose';
      e.golpeT = I.poseS;
      e.janelaT = I.poseS;
      game.emit('monstrao', { golpe: 'pose' });
    }
  }
}

function socoNoChao(game, e, D, f) {
  const A = D.agacha;
  const p = game.player;
  const dp = Math.hypot(p.x - e.x, p.y - e.y);
  ferirFigurantes(game, e.x, e.y, A.raioM, A.dano);
  if (dp < A.raioM + (p.r || 0.3)) {
    const l = dp || 1;
    acertaJuninho(game, A.dano, (p.x - e.x) / l, (p.y - e.y) / l, A.derrubaM);
  }
  game.hash.query(e.x, e.y, A.raioM + 0.5, tmp);
  for (const o of tmp) {
    if (o === e || o.dead || o.boss) continue;
    const dx = o.x - e.x;
    const dy = o.y - e.y;
    const l = Math.hypot(dx, dy) || 1;
    if (l > A.raioM + o.r) continue;
    game.damageEnemy(o, A.hordaDano, 'monstrao', (dx / l) * A.voo, (dy / l) * A.voo, true);
  }
  game.shake(0.55);
  game.burst(e.x, e.y, 16, 'poeira');
  game.efeito('latido_onda', e.x, e.y, { tam: A.raioM * 2.2 });
  game.word(e.x, e.y - 1, 'TUM!', '#d8d0c2');
  game.som('soco_chao', e.x, e.y);
  if (f >= 2) {
    // fase 3: o anel de choque abre pela areia, com uma brecha para passar
    objs(game).push({ tipo: 'anel', x: e.x, y: e.y, r: A.raioM, brecha: game.rng() * Math.PI * 2, pegou: false });
  }
}

function lancarAnilha(game, e) {
  // sai das mãos lá no alto, cai na frente dele com um baque e então rola (D85)
  objs(game).push({
    tipo: 'anilha', x: e.x + e.dirX * e.r, y: e.y + e.dirY * e.r, dx: e.dirX, dy: e.dirY,
    dist: 0, giro: 0, hit: new Set(), queda: ENEMIES.monstrao.anilha.quedaS,
  });
  game.word(e.x, e.y - 1.5, 'UH!', '#d8d0c2');
  game.som('anilha', e.x, e.y);
}

function lancarCarro(game, e, D) {
  const C = D.carro;
  objs(game).push({ tipo: 'carro', sx: e.x, sy: e.y, x: e.x, y: e.y, tx: e.alvoX, ty: e.alvoY, t: 0, dur: C.vooS, arte: e.carroArte, h: C.alturaM });
  game.word(e.x, e.y - 2, 'HRRRA!', '#ff5a3c');
}

/** Anilhas rolando, carros no ar e anéis de choque: andam mesmo com ele parado. */
function atualizarObjs(game, D, dt) {
  const L = objs(game);
  const p = game.player;
  for (let i = L.length - 1; i >= 0; i--) {
    const o = L[i];
    let fora = false;
    if (o.tipo === 'anilha') {
      const N = D.anilha;
      const s = N.vel * dt;
      o.x += o.dx * s;
      o.y += o.dy * s;
      o.dist += s;
      o.giro += (s / N.arteRaioM) * (o.dx >= 0 ? 1 : -1);
      if (o.queda > 0) {
        // ainda caindo das mãos dele: só machuca quando bate no chão
        o.queda -= dt;
        if (o.queda <= 0) {
          game.shake(0.25);
          game.burst(o.x, o.y, 8, 'poeira');
          game.som('soco_chao', o.x, o.y);
        }
        continue;
      }
      if (!o.feriu && ferirFigurantes(game, o.x, o.y, N.raioM, N.dano)) o.feriu = true; // a anilha atropela um só
      if (Math.hypot(p.x - o.x, p.y - o.y) < N.raioM + (p.r || 0.3)) {
        if (acertaJuninho(game, N.dano, o.dx, o.dy, N.derrubaM)) fora = true; // levando a anilha de frente, voa junto
      }
      game.hash.query(o.x, o.y, N.raioM + 0.6, tmp);
      for (const e of tmp) {
        if (e.dead || e.boss || o.hit.has(e.id)) continue;
        if (Math.hypot(e.x - o.x, e.y - o.y) > N.raioM + e.r) continue;
        o.hit.add(e.id);
        game.damageEnemy(e, N.hordaDano, 'monstrao', o.dx * 4, o.dy * 4, true);
      }
      if (o.dist > N.distM || solidoEm(game, o.x, o.y, N.raioM * 0.8) || !naRota(game, o.x, o.y, 0)) {
        game.burst(o.x, o.y, 6, 'poeira');
        fora = true;
      } else {
        aviso(game, { tipo: 'faixa', x: o.x, y: o.y, dx: o.dx, dy: o.dy, len: Math.min(4, N.distM - o.dist), larg: N.raioM * 2, k: 1 });
      }
    } else if (o.tipo === 'carro') {
      const C = D.carro;
      o.t += dt;
      const u = Math.min(1, o.t / o.dur);
      o.x = o.sx + (o.tx - o.sx) * u;
      o.y = o.sy + (o.ty - o.sy) * u;
      o.h = C.alturaM * (1 - u) + C.arcoM * 4 * u * (1 - u);
      aviso(game, { tipo: 'circulo', x: o.tx, y: o.ty, r: C.raioM, k: 0.5 + 0.5 * u });
      if (u >= 1) {
        fora = true;
        const dc = Math.hypot(p.x - o.tx, p.y - o.ty);
        if (dc < C.raioM + (p.r || 0.3)) acertaJuninho(game, C.dano, (p.x - o.tx) / (dc || 1), (p.y - o.ty) / (dc || 1), C.derrubaM);
        ferirFigurantes(game, o.tx, o.ty, C.raioM, C.dano);
        game.hash.query(o.tx, o.ty, C.raioM + 0.5, tmp);
        for (const e of tmp) {
          if (e.dead || e.boss) continue;
          const dx = e.x - o.tx;
          const dy = e.y - o.ty;
          const l = Math.hypot(dx, dy) || 1;
          if (l > C.raioM + e.r) continue;
          game.damageEnemy(e, C.hordaDano, 'monstrao', (dx / l) * 8, (dy / l) * 8, true);
          e.vz = 6;
        }
        game.efeito('explosao', o.tx, o.ty, { tam: C.raioM * 2.6, z: C.raioM * 0.38 });
        game.efeito('luz', o.tx, o.ty, { dur: 0.5, tam: C.raioM * 3, cor: '255,150,60' });
        game.efeito('chamuscado', o.tx, o.ty, { tam: C.raioM * 1.6 });
        game.shake(0.7);
        game.som('carro_cai', o.tx, o.ty);
        explosaoPerto(game, o.tx, o.ty, C.raioM); // carros parados perto explodem junto
      }
    } else if (o.tipo === 'anel') {
      const A = D.agacha.anel;
      o.r += A.velM * dt;
      if (o.r > A.alcanceM) fora = true;
      else if (!o.pegou) {
        const dp = Math.hypot(p.x - o.x, p.y - o.y);
        if (Math.abs(dp - o.r) < A.largM / 2 + (p.r || 0.3)) {
          const ang = Math.atan2(p.y - o.y, p.x - o.x);
          let dif = Math.abs(ang - o.brecha) % (Math.PI * 2);
          if (dif > Math.PI) dif = Math.PI * 2 - dif;
          if (dif > A.brecha / 2) {
            o.pegou = true;
            acertaJuninho(game, A.dano, (p.x - o.x) / (dp || 1), (p.y - o.y) / (dp || 1), A.derrubaM);
          }
        }
      }
    }
    if (fora) L.splice(i, 1);
  }
}

/** Turma da academia: de tempos em tempos, uma roda da horda em volta do Juninho. */
function reforco(game, e, D, f, dt) {
  const R = D.reforco;
  e.reforcoT = (e.reforcoT ?? R.cadaS[f]) - dt;
  if (e.reforcoT > 0) return;
  e.reforcoT = R.cadaS[f];
  const p = game.player;
  const off = game.rng() * Math.PI * 2;
  const ratos = (R.ratos && R.ratos[f]) || 0; // a turma da academia (D73, D75): os Ratos e um pouco de horda
  const n = ratos + R.horda;
  for (let i = 0; i < n; i++) {
    const a = off + (i / n) * Math.PI * 2;
    const sp = game.cerco ? pontoNoCerco(game) : game.fitSpawn({ x: p.x + Math.cos(a) * R.raioM, y: p.y + Math.sin(a) * R.raioM });
    game.spawnEnemy(i < ratos ? 'rato' : 'telespectador', sp.x, sp.y);
  }
}

/**
 * Um quadro do Monstrão. ux, uy: direção da rota até o Juninho. Devolve para onde ele anda e o quanto
 * (x, y já com a velocidade relativa; zero quando o golpe o segura no lugar ou quando ele mesmo se move).
 */
export function updateMonstrao(game, e, dt, ux, uy) {
  const D = ENEMIES.monstrao;
  const f = Math.min(2, e.fase || 0);
  const p = game.player;
  e.furia = f >= 2;
  if (e.janelaT > 0) e.janelaT -= dt;
  if (e.entrando) return entradaDoMonstrao(game, e, mov); // vindo pela avenida (D82)
  atualizarObjs(game, D, dt);
  mov.x = ux * (e.furia ? D.furiaVel : 1);
  mov.y = uy * (e.furia ? D.furiaVel : 1);
  if (game.over) {
    e.golpe = null;
    e.pose = null;
    return mov;
  }
  reforco(game, e, D, f, dt);
  const d = Math.hypot(p.x - e.x, p.y - e.y);
  if (!e.golpe) {
    e.pose = null;
    e.pausaT = (e.pausaT ?? D.pausaS[0]) - dt;
    if (e.pausaT <= 0 && d < D.alcanceM) iniciar(game, e, D, f, d);
    if (!e.golpe) return mov;
  }
  mov.x = 0;
  mov.y = 0;
  e.golpeT -= dt;
  switch (e.golpe) {
    case 'preparo': {
      e.pose = 'preparo';
      aviso(game, { tipo: 'faixa', x: e.x, y: e.y, dx: e.dirX, dy: e.dirY, len: D.investida.distM, larg: D.investida.largM, k: 1 - Math.max(0, e.golpeT) / D.investida.avisoS });
      if (e.golpeT <= 0) {
        e.golpe = 'investida';
        e.percorrido = 0;
        e.acertou = false;
        e.atropelou = new Set();
        e.atropelouF = new Set();
        e.quiques = D.investida.quiques[f];
        game.word(e.x, e.y - 1.5, 'RAAA!', '#ff5a3c');
        game.som('investida', e.x, e.y);
      }
      break;
    }
    case 'investida':
      e.pose = 'investida';
      investida(game, e, D, f, dt);
      break;
    case 'pose':
      e.pose = 'pose';
      if (e.golpeT <= 0) fim(e, D, f);
      break;
    case 'tonto':
      e.pose = 'tonto';
      if (e.golpeT <= 0) fim(e, D, f);
      break;
    case 'levanta':
      e.pose = 'levanta';
      aviso(game, { tipo: 'circulo', x: e.x, y: e.y, r: D.agacha.raioM, k: 1 - Math.max(0, e.golpeT) / D.agacha.avisoS });
      if (e.golpeT <= 0) {
        socoNoChao(game, e, D, f);
        e.golpe = 'agacha';
        e.golpeT = D.agacha.poseS;
      }
      break;
    case 'agacha':
      e.pose = 'agachamento';
      if (e.golpeT <= 0) fim(e, D, f);
      break;
    case 'arremesso':
      e.pose = 'arremesso';
      aviso(game, { tipo: 'faixa', x: e.x, y: e.y, dx: e.dirX, dy: e.dirY, len: D.anilha.distM, larg: D.anilha.raioM * 2, k: 1 - Math.max(0, e.golpeT) / D.anilha.avisoS });
      if (e.golpeT <= 0) {
        lancarAnilha(game, e);
        fim(e, D, f);
      }
      break;
    case 'carro':
      e.pose = 'levanta';
      aviso(game, { tipo: 'circulo', x: e.alvoX, y: e.alvoY, r: D.carro.raioM, k: 0.5 * (1 - Math.max(0, e.golpeT) / D.carro.avisoS) });
      if (e.golpeT <= 0) {
        lancarCarro(game, e, D);
        fim(e, D, f);
      }
      break;
    default:
      fim(e, D, f);
  }
  return mov;
}

/** Limpa o que ele deixou no mapa (caiu, recomeço). */
export function limparMonstrao(game) {
  if (game.monstraoObjs) game.monstraoObjs.length = 0;
  if (game.avisosChao) game.avisosChao.length = 0;
}
