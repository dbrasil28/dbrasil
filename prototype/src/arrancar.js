// Arrancar do cenário (pedido do autor, 08/11/2026): lixeiras, guarda-sóis e isopores da praia viram
// arremessáveis. O Juninho encosta e arranca (como pega cadeira e mesa); o lugar fica vazio e outro volta
// depois de um tempo, fora da tela. Quais objetos: THROWABLES com `arranca` (config.js). Sem DOM.
import { THROWABLES, INTERACT } from './config.js';
import { lowerBound } from './cenario.js';
import { addSolid, removeSolid } from './mundo.js';

const distRet = (x, y, k) => Math.hypot(Math.max(k.x0 - x, 0, x - k.x1), Math.max(k.y0 - y, 0, y - k.y1));
export const arrancavel = (kind) => !!(THROWABLES[kind] && THROWABLES[kind].arranca);

/** O objeto arrancável mais perto do Juninho, até `maxM` da borda dele (ou null). */
export function arrancavelPerto(game, maxM = INTERACT.arrancaM) {
  const w = game.world;
  const p = game.player;
  if (!w || !w.props) return null;
  let best = null;
  let bd = maxM;
  for (let i = lowerBound(w.props, p.y - 3); i < w.props.length && w.props[i].y <= p.y + 3; i++) {
    const k = w.props[i];
    if (!arrancavel(k.kind)) continue;
    const d = distRet(p.x, p.y, k);
    if (d < bd) {
      bd = d;
      best = k;
    }
  }
  return best;
}

/** Tira o objeto do cenário (e do chão desenhado, por causa da sombra) e guarda para voltar depois. */
export function arrancar(game, k) {
  const w = game.world;
  const i = w.props.indexOf(k);
  if (i >= 0) w.props.splice(i, 1);
  if (k.solid) removeSolid(w, k);
  (w.arrancados ||= []).push({ k, t: 0 });
  (w.chaoMudou ||= []).push([k.y0, k.y1]);
}

/** Os arrancados voltam ao lugar depois de INTERACT.respawnS, longe do Juninho e fora da tela. */
export function updateArrancados(game, dt) {
  const w = game.world;
  if (!w || !w.arrancados || !w.arrancados.length) return;
  const p = game.player;
  const I = INTERACT;
  for (let i = w.arrancados.length - 1; i >= 0; i--) {
    const a = w.arrancados[i];
    a.t += dt;
    const k = a.k;
    if (a.t < I.respawnS || Math.hypot(k.x - p.x, k.y - p.y) < I.respawnMinDistM || game.onScreen(k.x, k.y)) continue;
    w.props.splice(lowerBound(w.props, k.y), 0, k);
    if (k.solid) addSolid(w, k);
    (w.chaoMudou ||= []).push([k.y0, k.y1]);
    w.arrancados.splice(i, 1);
  }
}
