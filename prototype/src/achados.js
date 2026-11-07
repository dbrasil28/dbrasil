// Achados pelo caminho (D40, docs/design/CARREIRA_E_ROTA.md seção 6): isopor perdido (gorjeta e vida),
// cofre (1, 3 ou 5 cartas de uma vez, com a abertura em pausa) e a relíquia de cada trecho (um poder que
// não existe em outro lugar). Esconderijos com pista e sem seta; o Cachorro Caramelo fareja.
// Sem DOM: roda igual no navegador e nos testes.
import { ACHADOS, RELIQUIAS } from './config.js';
import { makeRng } from './math.js';
import { rollOptions, applyOption, playerStats } from './upgrades.js';

/** Esconderijos da Orla, tirados do mundo: torres de salva-vidas, areia, atrás dos quiosques, carros, a pedra. */
export function esconderijosDaOrla(w, map) {
  const out = [];
  const torres = w.places.filter((p) => p.kind === 'salva_vidas').map((p) => p.plat).sort((a, b) => b.y0 - a.y0);
  const iRel = Math.floor(torres.length / 2); // a relíquia fica numa torre do meio da praia, sempre a mesma
  torres.forEach((P, i) => {
    out.push({ onde: 'torre', x: (P.x0 + P.x1) / 2, y: (P.y0 + P.y1) / 2, plat: P, reliquia: i === iRel });
  });
  const bl = map.blockLen;
  for (let b = 0; b <= 8; b++) {
    // enterrado na areia: um montinho com a gaivota pousando; parar em cima para cavar
    out.push({ onde: 'areia', x: map.sandX + 2.2 + ((b * 7) % 4), y: -bl * b + 8 + ((b * 13) % 20), cavar: true });
  }
  for (const q of w.places.filter((p) => p.kind === 'quiosque')) {
    out.push({ onde: 'quiosque', x: q.x1 + 0.7, y: q.y0 + 0.8 });
  }
  const carros = (w.props || []).filter((p) => p.kind === 'carro' && p.y < -10);
  for (let i = 0; i < carros.length; i += Math.max(1, Math.floor(carros.length / 4))) {
    const c = carros[i];
    out.push({ onde: 'carro', x: c.x1 + 0.45, y: (c.y0 + c.y1) / 2 });
  }
  // a pedra do fim da praia: o canto mais longe, na areia funda
  out.push({ onde: 'pedra', x: map.maxX - 0.8, y: w.orlaTop + 3, cofre: true });
  return out;
}

/** Sorteia os achados do trecho (sorteio próprio: não mexe no da partida). */
export function sortearAchados(game) {
  const w = game.world;
  if (!w) return [];
  const rng = makeRng((game.seed ^ 0x51ed27) >>> 0);
  const spots = esconderijosDaOrla(w, game.map);
  const out = [];
  const livres = [];
  for (const s of spots) {
    if (s.reliquia) out.push(achado('reliquia', s, { reliquia: 'altinha' }));
    else if (s.cofre) out.push(achado('cofre', s));
    else livres.push(s);
  }
  // mais um cofre num lugar difícil (enterrado), o resto vira isopor
  const enterrados = livres.filter((s) => s.cavar);
  if (enterrados.length) {
    const s = enterrados[Math.floor(rng() * enterrados.length)];
    out.push(achado('cofre', s));
    livres.splice(livres.indexOf(s), 1);
  }
  for (let i = 0; i < ACHADOS.isopores && livres.length; i++) {
    const s = livres.splice(Math.floor(rng() * livres.length), 1)[0];
    out.push(achado('isopor', s));
  }
  return out;
}

const achado = (kind, s, extra = {}) => ({ kind, x: s.x, y: s.y, plat: s.plat || null, onde: s.onde, cavar: !!s.cavar, prog: 0, aberto: false, ...extra });

/** Coleta: encostar (ou parar em cima para cavar) abre o achado. */
export function updateAchados(game, dt) {
  const p = game.player;
  if (game.over) return;
  for (const a of game.achados) {
    if (a.aberto) continue;
    if (a.plat && (p.plat !== a.plat || p.lvl !== 1)) continue; // no alto da torre: só lá em cima
    const d2 = (p.x - a.x) ** 2 + (p.y - a.y) ** 2;
    if (d2 > ACHADOS.pegaM ** 2) {
      a.prog = Math.max(0, a.prog - dt * 2);
      continue;
    }
    if (a.cavar) {
      if (p.moving) continue;
      a.prog += dt;
      if (a.prog < ACHADOS.cavarS) continue;
    }
    abrir(game, a);
  }
}

function abrir(game, a) {
  a.aberto = true;
  const p = game.player;
  const m = game.metrics;
  m.achados = (m.achados || 0) + 1;
  if (a.kind === 'isopor') {
    m.achadosGorjeta = (m.achadosGorjeta || 0) + ACHADOS.isoporGorjeta;
    p.hp = Math.min(game.stats.maxHp, p.hp + ACHADOS.isoporCura);
    game.word(a.x, a.y, `+${ACHADOS.isoporGorjeta} GORJETA`, '#ffd21f');
    game.moneyBurst(a.x, a.y, 8);
    game.emit('pickup', { kind: 'isopor' });
  } else if (a.kind === 'cofre') {
    m.achadosGorjeta = (m.achadosGorjeta || 0) + ACHADOS.cofreGorjeta;
    abrirCofre(game, a);
  } else if (a.kind === 'reliquia') {
    pegarReliquia(game, a.reliquia);
  }
}

/** Cofre: 1, 3 ou 5 cartas de uma vez (mais chance de 5 com o Caos alto), em pausa, com a roleta do bicho. */
export function abrirCofre(game, a) {
  const C = ACHADOS.cofre;
  const caos = game.caos / 100;
  const r = game.rng();
  const n = r < C.chance5 + C.chance5Caos * caos ? 5 : r < C.chance3 + C.chance3Caos * caos + C.chance5 + C.chance5Caos * caos ? 3 : 1;
  const cards = [];
  for (let i = 0; i < n; i++) {
    const opt = rollOptions(game.player, game.rng, 1, game.segment)[0];
    if (!opt) break;
    applyOption(game.player, opt);
    cards.push({ id: opt.id, kind: opt.kind, title: opt.title, desc: opt.desc, tag: opt.tag });
  }
  game.stats = playerStats(game.player, game.mods);
  game.player.hp = Math.min(game.player.hp, game.stats.maxHp);
  const bicho = ACHADOS.bichos[Math.floor(game.rng() * ACHADOS.bichos.length)];
  game.modal = { kind: 'cofre', n, bicho, cards, x: a ? a.x : game.player.x, y: a ? a.y : game.player.y };
  game.metrics.cofres = (game.metrics.cofres || 0) + 1;
  game.tv(n === 5 ? 'cofre5' : 'cofre');
  game.emit('modal', {});
}

/** O jogador viu a abertura do cofre: o jogo continua. */
export function fecharCofre(game) {
  if (game.modal && game.modal.kind === 'cofre') game.modal = null;
}

/** A relíquia do trecho: vem pronta e forte, numa vaga só dela. */
export function pegarReliquia(game, id) {
  const p = game.player;
  p.reliquia = id;
  const R = RELIQUIAS[id];
  game.metrics[`reliquia_${R.onde}`] = true; // estrela do trecho
  game.tv(`reliquia_${id}`);
  game.word(p.x, p.y - 1, R.nome.toUpperCase(), '#ffd21f');
  game.emit('reliquia', { id });
  game.shake(0.3);
  if (id === 'altinha') {
    game.projectiles.push({ kind: 'altinha', x: p.x, y: p.y, vx: 0, vy: 0, tgt: null, last: null, alt: 0, fase: 0, hitT: 0, dmg: R.dmg, src: 'altinha' });
  }
}

/** O chefão sempre solta um cofre onde caiu. */
export function cofreDoChefao(game, e) {
  game.achados.push({ kind: 'cofre', x: e.x, y: e.y, plat: null, onde: 'chefao', cavar: false, prog: 0, aberto: false });
}

/** Achado fechado mais perto de (x, y) que o Caramelo fareja: isopor e cofre de longe, a relíquia só de perto. */
export function achadoParaFarejar(game, x, y) {
  let best = null;
  let bd = Infinity;
  for (const a of game.achados || []) {
    if (a.aberto) continue;
    const r = a.kind === 'reliquia' ? ACHADOS.faroReliquiaM : ACHADOS.faroM;
    const d2 = (a.x - x) ** 2 + (a.y - y) ** 2;
    if (d2 < r * r && d2 < bd) {
      bd = d2;
      best = a;
    }
  }
  return best;
}
