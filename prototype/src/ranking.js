// Ranking "Entregador do Mês" (D43, docs/design/MODOS_E_RANKING.md), por enquanto só no aparelho:
// na Carreira, o menor tempo para derrubar o chefão de cada trecho; na Horda, o maior tempo sobrevivido
// em cada mapa; no Desafio da Semana, a melhor partida da semana. Partida com segunda chance por anúncio
// não entra. Sem armazenamento (aba anônima), o ranking dura só a sessão.
const KEY = 'bec.ranking.v1';
const TOP = 10;

function fresh() {
  return { carreira: { orla: [], morro: [] }, horda: { orla: [], morro: [] }, desafio: {} };
}

export function loadRanking() {
  const r = fresh();
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      for (const k of ['carreira', 'horda']) for (const t of ['orla', 'morro']) if (Array.isArray(s?.[k]?.[t])) r[k][t] = s[k][t];
      if (s?.desafio && typeof s.desafio === 'object') r.desafio = s.desafio;
    }
  } catch {
    /* sem armazenamento: o ranking dura só a sessão */
  }
  return r;
}

function save(r) {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(r));
  } catch {
    /* ignora */
  }
}

/** Põe na lista (menor é melhor na Carreira, maior na Horda) e devolve a posição (1 = melhor) ou null. */
function entrar(lista, valor, menorMelhor) {
  const e = { s: Math.round(valor), d: new Date().toISOString().slice(0, 10) };
  lista.push(e);
  lista.sort((a, b) => (menorMelhor ? a.s - b.s : b.s - a.s));
  if (lista.length > TOP) lista.length = TOP;
  const i = lista.indexOf(e);
  return i < 0 ? null : i + 1;
}

/**
 * Registra a partida que acabou. Devolve o que mostrar no resultado:
 * { linhas: [texto], fora: motivo }.
 */
export function registrarPartida(r, game) {
  const m = game.metrics;
  const out = { linhas: [] };
  if (m.ads && m.ads.aceitos && m.ads.aceitos.reviver) {
    out.fora = 'Partida com segunda chance por anúncio não entra no ranking';
    return out;
  }
  if (game.modo === 'carreira') {
    if (m.chefaoOrlaS != null && game.startTrecho !== 'morro') {
      const pos = entrar(r.carreira.orla, m.chefaoOrlaS - (m.inicioOrlaS || 0), true);
      if (pos) out.linhas.push(`Especulador em ${fmtT(m.chefaoOrlaS - (m.inicioOrlaS || 0))}: ${pos}º lugar na Orla`);
    }
    if (m.chefaoMorroS != null && m.morroAt != null) {
      const pos = entrar(r.carreira.morro, m.chefaoMorroS - m.morroAt, true);
      if (pos) out.linhas.push(`Chefe do Tráfico em ${fmtT(m.chefaoMorroS - m.morroAt)}: ${pos}º lugar no Morro`);
    }
  } else if (game.modo === 'horda') {
    const t = game.t - (m.inicioOrlaS || 0);
    const pos = entrar(r.horda[game.startTrecho] || (r.horda[game.startTrecho] = []), t, false);
    if (pos) out.linhas.push(`Sobreviveu ${fmtT(t)}: ${pos}º lugar na Horda`);
  } else if (game.modo === 'desafio' && game.desafio) {
    const t = game.t - (m.inicioOrlaS || 0);
    const lista = r.desafio[game.desafio.id] || (r.desafio[game.desafio.id] = []);
    const pos = entrar(lista, t, false);
    if (pos) out.linhas.push(`${game.desafio.nome}: ${fmtT(t)}, ${pos}º lugar da semana`);
  }
  save(r);
  return out;
}

export function fmtT(s) {
  s = Math.max(0, Math.round(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
