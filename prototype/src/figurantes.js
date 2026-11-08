// Figurantes e o grupo de sobreviventes (D55, D56; config.js FIGURANTES). A garota da esquina, a PM do pé do
// morro, a tropa nas vielas e o picolezeiro da areia passeiam em volta do lugar deles e se defendem da horda:
// a PM e a tropa atiram, a garota dá bolsada em quem chega colado e o picolezeiro joga picolé, que congela.
// Quando o Juninho passa perto, entram no grupo dele (até grupoMax) e vão atrás, lutando junto. A horda que
// encosta tira vida deles; sem vida, viram telespectador e entram na horda. Um tempo depois, outro aparece no
// lugar, fora da tela. Na abertura, antes de a horda atacar, ninguém entra no grupo. Sem DOM.
import { FIGURANTES } from './config.js';
import { emAbertura } from './abertura.js';

const tmp = [];
const sorteio = (game, [a, b]) => a + game.fxRng() * (b - a);

/** Um figurante novo no lugar dele (ax, ay; o picolezeiro anda entre ya e yb). */
export function novoFigurante(tipo, x, y, v, extra = {}) {
  const vida = FIGURANTES.vida[tipo];
  return {
    tipo, x, y, ax: x, ay: y, v, r: 0.3, ri: -1, dirX: 0, dirY: 1, walk: 0, anda: false, pausa: v * 3,
    alvo: null, pose: null, poseT: 0, gritoT: 4 + v * 8, cd: v, hp: vida, maxHp: vida, hurtT: 0, grupo: false, ...extra,
  };
}

/**
 * Perigo em área (explosão, tiro, carro, golpe do Monstrão) pega também os figurantes: tira `dano` de quem
 * está a até `r` de (x, y). Quem fica sem vida cai no próximo quadro (vira telespectador). Devolve quantos.
 */
export function ferirFigurantes(game, x, y, r, dano) {
  const w = game.world;
  if (!w || !w.figurantes) return 0;
  let n = 0;
  for (const f of w.figurantes) {
    const rr = r + f.r;
    if ((f.x - x) ** 2 + (f.y - y) ** 2 > rr * rr) continue;
    f.hp -= dano;
    f.hurtT = 0.2;
    n++;
  }
  return n;
}

export const noGrupo = (game) => (game.world && game.world.figurantes ? game.world.figurantes.filter((f) => f.grupo).length : 0);

/** A horda mais perto até r (ou null). */
function maisPerto(game, f, r) {
  game.hash.query(f.x, f.y, r, tmp);
  let e = null;
  let d2 = r * r;
  for (const q of tmp) {
    if (q.dead) continue;
    const d = (q.x - f.x) ** 2 + (q.y - f.y) ** 2;
    if (d < d2) {
      d2 = d;
      e = q;
    }
  }
  return e;
}

function vira(f, x, y) {
  const l = Math.hypot(x - f.x, y - f.y) || 1;
  f.dirX = (x - f.x) / l;
  f.dirY = (y - f.y) / l;
}

/** O golpe de cada um: tiro (PM e tropa), bolsada (garota) ou picolé que congela. */
function luta(game, f, e) {
  const A = FIGURANTES.arma[f.tipo];
  const mul = game.stats.dmgMul || 1;
  vira(f, e.x, e.y);
  f.pose = 'ataque';
  f.poseT = 0.35;
  f.cd = A.cadaS;
  if (f.tipo === 'pm' || f.tipo === 'tropa') {
    game.clarao(f, f.dirX, f.dirY);
    game.damageEnemy(e, A.dano * mul, 'grupo_tiro', f.dirX * A.empurra, f.dirY * A.empurra);
  } else if (f.tipo === 'garota') {
    game.som('tapa', e.x, e.y);
    game.damageEnemy(e, A.dano * mul, 'bolsa', f.dirX * A.empurra, f.dirY * A.empurra);
  } else {
    e.frozenT = Math.max(e.frozenT || 0, A.congelaS);
    game.damageEnemy(e, A.dano * mul, 'picole_grupo', 0, 0);
  }
}

/** Caiu: vira telespectador e entra na horda; um outro volta para o lugar dele depois de um tempo. */
function cai(game, f) {
  const w = game.world;
  const F = FIGURANTES;
  game.spawnEnemy('telespectador', f.x, f.y);
  game.word(f.x, f.y - 1.4, 'VIROU TELESPECTADOR!', '#ff6b6b');
  game.som('acorda', f.x, f.y);
  if (f.grupo) {
    game.tv('grupoPerdeu', 20);
    game.metrics.parceirosCaidos = (game.metrics.parceirosCaidos || 0) + 1;
  }
  w.voltas.push({ tipo: f.tipo, ax: f.ax, ay: f.ay, v: f.v, ya: f.ya, yb: f.yb, t: F.voltaS });
  w.figurantes.splice(w.figurantes.indexOf(f), 1);
}

export function updateFigurantes(game, dt) {
  const w = game.world;
  if (!w || !w.figurantes) return;
  const F = FIGURANTES;
  const p = game.player;
  if (!w.voltas) w.voltas = [];
  // quem caiu volta para o lugar dele depois de um tempo, sem ninguém ver
  for (let i = w.voltas.length - 1; i >= 0; i--) {
    const v = w.voltas[i];
    v.t -= dt;
    if (v.t > 0 || game.onScreen(v.ax, v.ay) || Math.hypot(v.ax - p.x, v.ay - p.y) < F.voltaLongeM) continue;
    w.figurantes.push(novoFigurante(v.tipo, v.ax, v.ay, v.v, v.ya !== undefined ? { ya: v.ya, yb: v.yb } : {}));
    w.voltas.splice(i, 1);
  }
  let grupo = 0;
  for (const f of w.figurantes) if (f.grupo) grupo++;
  if (grupo) game.metrics.grupoS = (game.metrics.grupoS || 0) + grupo * dt; // parceiro × segundo (para o bot medir)
  // o grupo anda em leque atrás do Juninho
  const tras = Math.atan2(-(p.faceY || 0), -(p.faceX || 1));
  let vaga = 0;
  for (let i = w.figurantes.length - 1; i >= 0; i--) {
    const f = w.figurantes[i];
    if (!f.grupo && Math.abs(f.y - p.y) > F.vistaM) continue;
    if (f.poseT > 0) {
      f.poseT -= dt;
      if (f.poseT <= 0) f.pose = null;
    }
    if (f.hurtT > 0) f.hurtT -= dt;
    if (f.cd > 0) f.cd -= dt;
    // a horda que encosta tira vida
    game.hash.query(f.x, f.y, f.r + 1, tmp);
    for (const e of tmp) {
      if (e.dead || e.dmg <= 0) continue;
      const rr = f.r + e.r + F.agarraM;
      if ((e.x - f.x) ** 2 + (e.y - f.y) ** 2 > rr * rr) continue;
      f.hp -= e.dmg * dt * F.danoRecebidoMul;
      f.hurtT = 0.12;
    }
    if (f.hp <= 0) {
      cai(game, f);
      continue;
    }
    // o Juninho passou perto: entra no grupo (só depois de a horda começar a atacar: na abertura ninguém vai atrás dele)
    if (!f.grupo && !game.over && !emAbertura(game) && grupo < F.grupoMax && Math.hypot(p.x - f.x, p.y - f.y) < F.entraM && !(p.plat && p.lvl)) {
      f.grupo = true;
      grupo++;
      f.pose = 'raiva'; // o punho para cima: tamo junto
      f.poseT = 0.8;
      f.alvo = null;
      game.word(f.x, f.y - 1.4, '+1 NO GRUPO', '#7fe08a');
      game.som('pega', f.x, f.y);
      game.tv('grupo', 25);
      game.metrics.parceirosEntraram = (game.metrics.parceirosEntraram || 0) + 1;
    }
    // luta com quem está no alcance; com a horda chegando, fica com raiva (o policial já mira)
    const A = F.arma[f.tipo];
    const alvoLuta = maisPerto(game, f, A.alcanceM);
    if (alvoLuta && f.cd <= 0) luta(game, f, alvoLuta);
    else if (!f.pose) {
      const e = alvoLuta || maisPerto(game, f, F.reageM[f.tipo]);
      if (e) {
        vira(f, e.x, e.y);
        f.pose = f.tipo === 'pm' || f.tipo === 'tropa' ? 'ataque' : 'raiva';
        f.poseT = 0.3;
      }
    }
    if (f.grupo) {
      segue(game, f, dt, tras, vaga++);
      continue;
    }
    if (f.pose) {
      f.anda = false;
      continue;
    }
    passeia(game, f, dt);
  }
}

/** No grupo: vai para a vaga dele no leque atrás do Juninho (em volta dele, se o Juninho parou). */
function segue(game, f, dt, tras, vaga) {
  const F = FIGURANTES;
  const p = game.player;
  const a = tras + (vaga - (F.grupoMax - 1) / 2) * 0.85;
  const tx = p.x + Math.cos(a) * F.segueM;
  const ty = p.y + Math.sin(a) * F.segueM;
  const dx = tx - f.x;
  const dy = ty - f.y;
  const l = Math.hypot(dx, dy);
  if (l < 0.2) {
    f.anda = false;
    if (!f.pose) {
      f.dirX = p.faceX || 0;
      f.dirY = p.faceY || 1;
    }
    return;
  }
  const passo = Math.min(l, Math.max(F.passoMS, Math.min(F.correMS, l * 3)) * dt);
  f.x += (dx / l) * passo;
  f.y += (dy / l) * passo;
  game.collideProps(f);
  game.clampToMap(f);
  if (!f.pose) {
    f.dirX = dx / l;
    f.dirY = dy / l;
  }
  f.walk += passo * 4.4;
  f.anda = !f.pose;
}

/** Fora do grupo: passeia um pouco em volta do lugar dele; o picolezeiro vai e volta e grita de vez em quando. */
function passeia(game, f, dt) {
  const F = FIGURANTES;
  if (f.tipo === 'picole') {
    f.gritoT -= dt;
    if (f.gritoT <= 0) {
      f.gritoT = sorteio(game, F.gritoCadaS);
      f.pose = 'raiva'; // a mão na boca, gritando
      f.poseT = F.gritoS;
      f.anda = false;
      f.dirX = 0;
      f.dirY = 1;
      game.word(f.x, f.y - 1.4, F.grito, '#fff2c0');
      return;
    }
  }
  if (f.pausa > 0) {
    f.pausa -= dt;
    f.anda = false;
    return;
  }
  if (!f.alvo) {
    if (f.tipo === 'picole') f.alvo = { x: f.ax, y: Math.abs(f.y - f.ya) < Math.abs(f.y - f.yb) ? f.yb : f.ya }; // vai e volta
    else {
      const a = game.fxRng() * Math.PI * 2;
      const r = F.raioM[f.tipo] * Math.sqrt(game.fxRng());
      f.alvo = { x: f.ax + Math.cos(a) * r, y: f.ay + Math.sin(a) * r };
    }
  }
  const dx = f.alvo.x - f.x;
  const dy = f.alvo.y - f.y;
  const l = Math.hypot(dx, dy);
  const passo = F.passoMS * dt;
  if (l <= passo) {
    f.x = f.alvo.x;
    f.y = f.alvo.y;
    f.alvo = null;
    f.anda = false;
    f.pausa = sorteio(game, F.pausaS);
    if (f.tipo !== 'picole') {
      f.dirX = 0; // parado, olha para a rua (de frente)
      f.dirY = 1;
    }
    return;
  }
  f.x += (dx / l) * passo;
  f.y += (dy / l) * passo;
  f.dirX = dx / l;
  f.dirY = dy / l;
  f.walk += passo * 4.4; // um ciclo de 6 quadros a cada ~1,4 m
  f.anda = true;
}
