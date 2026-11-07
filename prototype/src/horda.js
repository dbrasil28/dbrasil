// Modo Horda e Desafio da Semana (D43, D44, docs/design/MODOS_E_RANKING.md): um mapa, sem saída, para
// sobreviver o máximo que der. O Caos chega a 100% e o chefão sai do covil sozinho; derrubado, volta a cada
// 5 minutos, mais forte. Passados os 100%, a horda endurece a cada minuto. Crises sorteadas, isopores que
// reaparecem e, aos 30 minutos, o Rabecão, que não morre. Sem DOM: roda igual no navegador e nos testes.
import { HORDA, CRISES, DESAFIO } from './config.js';
import { soltarChefao, tempoNoTrecho } from './carreira.js';
import { esconderijosDaOrla } from './achados.js';

export const emHorda = (game) => game.modo === 'horda' || game.modo === 'desafio';

/** Começo da partida de Horda: a regra do Desafio da Semana, se houver. */
export function iniciarHorda(game) {
  game.horda = { chefoes: 0, proxChefao: 0, cem: null, proxCrise: 0, proxAchados: HORDA.achadosCadaS, rabecao: null };
  const r = game.desafio && game.desafio.regra;
  if (r === 'chinelada') game.player.weapons.push({ id: 'chinelo', level: 3, cd: 0.5 });
  if (r === 'feriadao') game.spawnExtra = 2;
}

/** A cada quadro, na Horda. */
export function updateHorda(game, dt) {
  const H = game.horda;
  if (!H || game.over) return;
  const C = game.covil;
  if (H.cem == null && game.caos >= 100) H.cem = game.t;
  // o chefão sai sozinho em 100% e volta, mais forte, um tempo depois de cair
  if (C && game.caos >= 100 && !game.boss && game.t >= H.proxChefao) {
    C.aberto = true;
    C.saiu = false;
    soltarChefao(game, C);
    const e = game.boss;
    if (e && H.chefoes > 0) {
      const mul = 1 + H.chefoes * HORDA.chefaoHpMais;
      e.hp *= mul;
      e.maxHp *= mul;
      game.tv('hordaChefaoVolta');
    }
  }
  // isopores voltam aos esconderijos
  if (game.t >= H.proxAchados && game.segment === 'orla') {
    H.proxAchados = game.t + HORDA.achadosCadaS;
    const abertos = game.achados.filter((a) => a.kind === 'isopor' && !a.aberto).length;
    const spots = esconderijosDaOrla(game.world, game.map).filter((s) => !s.reliquia && !s.cofre);
    for (let i = abertos; i < HORDA.isopores && spots.length; i++) {
      const s = spots.splice(Math.floor(game.rng() * spots.length), 1)[0];
      game.achados.push({ kind: 'isopor', x: s.x, y: s.y, plat: s.plat || null, onde: s.onde, cavar: !!s.cavar, prog: 0, aberto: false });
    }
  }
  // o fim inevitável
  if (!H.rabecao && tempoNoTrecho(game) >= HORDA.rabecaoS) {
    const sp = game.fitSpawn(game.edgePoint(game.rng() * Math.PI * 2, 30));
    H.rabecao = game.spawnEnemy('rabecao', sp.x, sp.y);
    game.tv('rabecao');
    game.emit('boss', {});
    game.shake(0.6);
  }
}

/** Passados os 100%, a horda fica mais resistente a cada minuto. */
export function durezaHorda(game) {
  const H = game.horda;
  if (!H || H.cem == null) return 1;
  return 1 + ((game.t - H.cem) / 60) * HORDA.durezaPorMin;
}

/** Crises sorteadas na Horda; no Desafio, a regra pode deixar uma delas para sempre. */
export function proximaCriseHorda(game) {
  const H = game.horda;
  if (!H || game.t < H.proxCrise) return null;
  const lista = CRISES.porTrecho[game.segment] || [];
  const r = game.desafio && game.desafio.regra;
  if (r === 'apagao' || r === 'ressaca') {
    const d = lista.find((x) => x.id === r);
    if (d && game.caos >= d.caos) return { ...d, duracaoS: 1e9 };
    return null;
  }
  const ok = lista.filter((d) => game.caos >= d.caos);
  if (!ok.length) return null;
  return ok[Math.floor(game.rng() * ok.length)];
}

export function criseAcabouNaHorda(game) {
  if (game.horda) game.horda.proxCrise = game.t + HORDA.criseCadaS;
}

/** Semana do ano (ISO): o Desafio da Semana muda toda segunda-feira. */
export function semanaAtual(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dia = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dia);
  const ano = t.getUTCFullYear();
  const semana = Math.ceil(((t - Date.UTC(ano, 0, 1)) / 86400000 + 1) / 7);
  return `${ano}-${String(semana).padStart(2, '0')}`;
}

/** O desafio da semana: o mesmo sorteio e a mesma regra para todo mundo. */
export function desafioDaSemana(id = semanaAtual()) {
  let h = 2166136261;
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const regra = DESAFIO.regras[h % DESAFIO.regras.length];
  return { id, seed: h % 1e9, trecho: DESAFIO.trecho, regra: regra.id, nome: regra.nome, desc: regra.desc };
}
