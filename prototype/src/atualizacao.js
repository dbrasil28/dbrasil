// Subida do Morro (D90, pedido do autor): passar pela escadaria recomeça o trecho, e o jogador precisa saber
// disso antes e ver acontecer. Antes da porta, uma faixa fixa avisa (pertoDaPorta). Ao passar, a "atualização
// obrigatória do aplicativo" vira uma cena curta com o tempo parado: a barra enche, cada arma e passivo leva o
// carimbo EXPIROU, o nível cai até 1, a relíquia fica e o letreiro do trecho entra. O desenho é do HUD (ui.js),
// que lê game.atualizacao. Números e textos em config.js (ATUALIZACAO). Sem DOM: roda igual nos testes.
import { ATUALIZACAO } from './config.js';
import { recomecar } from './carreira.js';

/** Escadaria aberta, ainda na Orla, e o Juninho a ATUALIZACAO.avisoM dela: a faixa do aviso aparece. */
export function pertoDaPorta(game) {
  const w = game.world;
  if (!w || !w.gateOpen || game.segment !== 'orla' || game.horda || game.over) return false;
  const g = w.gate;
  const p = game.player;
  const dx = Math.max(g.x0 - p.x, 0, p.x - g.x1);
  const dy = Math.max(g.y0 - p.y, 0, p.y - g.y1);
  return Math.hypot(dx, dy) < ATUALIZACAO.avisoM;
}

/** Passou pela porta: guarda o que ele tinha (para a cena mostrar sumindo), recomeça o trecho e para o tempo. */
export function iniciarAtualizacao(game, trecho) {
  const A = ATUALIZACAO;
  const p = game.player;
  const itens = [
    ...p.weapons.map((w) => ({ id: w.id, kind: 'w', level: w.level })),
    ...p.passives.map((x) => ({ id: x.id, kind: 'p', level: x.level })),
  ];
  const nivel = p.level;
  const reliquia = p.reliquia || null;
  recomecar(game, trecho, { calado: true }); // a cena diz o que a faixa e a TV diziam; a TV fala no fim
  const passo = itens.length ? Math.min(A.passoS, A.itensS / itens.length) : 0;
  const fimItens = A.barraS + itens.length * passo;
  const reliquiaT = fimItens + A.reliquiaS;
  const tituloT = reliquiaT + A.tituloS;
  game.atualizacao = {
    t: 0, trecho, itens, nivel, reliquia, bolsa: !!game.pendingInicial,
    passo, fimItens, reliquiaT, tituloT, durS: tituloT + A.fimS, carimbos: 0, titulou: false,
  };
  game.som('gorjeta'); // a notificação do celular
}

/** Quantos itens já levaram o carimbo nesta hora da cena. */
export function carimbados(U) {
  if (U.t < ATUALIZACAO.barraS || !U.itens.length) return 0;
  return Math.min(U.itens.length, Math.floor((U.t - ATUALIZACAO.barraS) / U.passo) + 1);
}

/** O nível mostrado na cena: cai do que ele tinha até 1 junto com os carimbos. */
export function nivelNaCena(U) {
  const A = ATUALIZACAO;
  if (U.t < A.barraS) return U.nivel;
  const k = Math.min(1, (U.t - A.barraS) / Math.max(0.01, U.fimItens - A.barraS));
  return Math.max(1, Math.round(U.nivel - (U.nivel - 1) * k));
}

/** Avança a cena. Devolve true enquanto o tempo está parado. */
export function updateAtualizacao(game, dt) {
  const U = game.atualizacao;
  if (!U) return false;
  U.t += dt;
  const n = carimbados(U);
  while (U.carimbos < n) {
    U.carimbos++;
    game.som('baque'); // o carimbo
  }
  if (!U.titulou && U.t >= U.tituloT) {
    U.titulou = true;
    game.som('fase');
  }
  if (U.t < U.durS) return true;
  game.atualizacao = null;
  const p = game.player;
  p.invulnT = Math.max(p.invulnT || 0, ATUALIZACAO.invulnS);
  if (U.trecho === 'morro') game.tv('morro');
  if (U.reliquia) game.tv('reliquia_leva');
  game.tv('recomeco');
  return false;
}
