// Progresso da carreira guardado no aparelho: gorjetas, melhorias permanentes, trechos liberados e
// estrelas. Sem armazenamento (aba anônima, bloqueio), o jogo funciona e o progresso dura só a sessão.
import { MELHORIAS, TRECHOS } from './config.js';

const KEY = 'bec.progresso.v1';

function fresh() {
  const trechos = {};
  for (const t of TRECHOS) trechos[t.id] = { liberado: t.id === 'orla', estrelas: [false, false, false], melhor: null };
  return { gorjetas: 0, melhorias: {}, trechos, nivelNoMorro: 1, partidas: 0 };
}

export function loadProgress() {
  const p = fresh();
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (typeof s.gorjetas === 'number') p.gorjetas = s.gorjetas;
      if (s.melhorias && typeof s.melhorias === 'object') p.melhorias = s.melhorias;
      if (typeof s.nivelNoMorro === 'number') p.nivelNoMorro = s.nivelNoMorro;
      if (typeof s.partidas === 'number') p.partidas = s.partidas;
      for (const t of TRECHOS) if (s.trechos?.[t.id]) Object.assign(p.trechos[t.id], s.trechos[t.id]);
    }
  } catch {
    /* sem armazenamento: progresso só desta sessão */
  }
  return p;
}

export function saveProgress(p) {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignora */
  }
}

/** Fecha a conta da partida: gorjetas, estrelas e trechos liberados. Devolve o que mudou. */
export function applyRun(p, game) {
  const tips = game.tips();
  p.gorjetas += tips.total;
  p.partidas += 1;
  const novas = [];
  const star = (id, i, ok) => {
    const t = p.trechos[id];
    if (ok && !t.estrelas[i]) {
      t.estrelas[i] = true;
      novas.push(`${TRECHOS.find((x) => x.id === id).nome}: ${TRECHOS.find((x) => x.id === id).estrelas[i]}`);
    }
  };
  const semReviver = !game.metrics.ads.aceitos.reviver;
  const m = game.metrics;
  if (game.startTrecho !== 'morro') {
    star('orla', 0, m.portaoAberto != null);
    star('orla', 1, game.bossKilled);
    star('orla', 2, semReviver && (m.portaoAberto != null || game.bossKilled));
  }
  if (m.portaoAberto != null || game.segment === 'morro') {
    if (!p.trechos.morro.liberado) novas.push('Subida do Morro liberada no Mapa da Rota');
    p.trechos.morro.liberado = true;
  }
  if (m.nivelNoMorro) p.nivelNoMorro = Math.max(p.nivelNoMorro, m.nivelNoMorro);
  star('morro', 0, game.delivered);
  star('morro', 1, game.delivered && m.entregaAt <= 540);
  star('morro', 2, game.delivered && semReviver);
  if (game.delivered) {
    // a entrega no morro libera o próximo trecho da rota (ainda em produção)
    p.trechos.rodovia_sp.liberado = true;
  }
  saveProgress(p);
  return { tips, novas };
}

export const upgradeLevel = (p, id) => Math.min(p.melhorias[id] || 0, MELHORIAS[id].custo.length);
export const upgradeCost = (p, id) => MELHORIAS[id].custo[upgradeLevel(p, id)] ?? null;

/** Compra o próximo nível da melhoria, se houver gorjeta. */
export function buyUpgrade(p, id) {
  const cost = upgradeCost(p, id);
  if (cost == null || p.gorjetas < cost) return false;
  p.gorjetas -= cost;
  p.melhorias[id] = upgradeLevel(p, id) + 1;
  saveProgress(p);
  return true;
}
