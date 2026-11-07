// Progresso da carreira guardado no aparelho: gorjetas, melhorias permanentes, trechos liberados e
// estrelas. Sem armazenamento (aba anônima, bloqueio), o jogo funciona e o progresso dura só a sessão.
import { MELHORIAS, TRECHOS } from './config.js';

const KEY = 'bec.progresso.v1';

function fresh() {
  const trechos = {};
  for (const t of TRECHOS) trechos[t.id] = { liberado: t.id === 'orla', estrelas: [false, false, false], melhor: null };
  return { gorjetas: 0, melhorias: {}, trechos, partidas: 0 };
}

export function loadProgress() {
  const p = fresh();
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (typeof s.gorjetas === 'number') p.gorjetas = s.gorjetas;
      if (s.melhorias && typeof s.melhorias === 'object') p.melhorias = s.melhorias;
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
  // estrelas e descoberta só na Carreira de verdade (Horda, Desafio e o atalho de teste rendem só gorjeta)
  if ((game.modo && game.modo !== 'carreira') || game.teste) {
    saveProgress(p);
    return { tips, novas };
  }
  // estrelas (D39): derrubar o chefão, achar a relíquia, sem reviver
  if (game.startTrecho !== 'morro') {
    star('orla', 0, m.chefaoOrlaS != null);
    star('orla', 1, !!m.reliquia_orla);
    star('orla', 2, semReviver && m.chefaoOrlaS != null);
  }
  star('morro', 0, game.delivered);
  star('morro', 1, !!m.reliquia_morro);
  star('morro', 2, game.delivered && semReviver);
  // descoberta: o trecho só aparece no Mapa da Rota depois que o Juninho chega nele
  const descobrir = (id, ok, txt) => {
    if (ok && !p.trechos[id].liberado) {
      p.trechos[id].liberado = true;
      novas.push(txt);
    }
  };
  descobrir('morro', m.morroAt != null, 'Novo trecho no Mapa da Rota: Subida do Morro');
  descobrir('sp', game.delivered, 'Novo trecho no Mapa da Rota: São Paulo (em produção)');
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
