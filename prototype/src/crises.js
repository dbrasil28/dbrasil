// Crises da cidade (D39, docs/design/CARREIRA_E_ROTA.md seção 2): quando o Caos do trecho cruza 30%
// (Crise) e 60% (Colapso), a TV avisa uns 20 s antes e o trecho muda por um tempo, sempre com aviso e
// sem fechar a passagem. Orla: Ressaca do mar e Apagão. Morro: Baile na laje e Gato de luz em curto.
// Sem DOM: roda igual no navegador e nos testes.
import { CRISES } from './config.js';
import { proximaCriseHorda, criseAcabouNaHorda } from './horda.js';

const tmp = [];

/** Liga, avisa, roda e desliga as crises do trecho. */
export function updateCrises(game, dt) {
  const lista = CRISES.porTrecho[game.segment];
  if (!lista || !game.world || game.over) return;
  if (!game.crisesFeitas) game.crisesFeitas = new Set();
  let c = game.crise;
  if (!c && !game.caosParado) {
    // na Horda, as crises são sorteadas e voltam (horda.js); na Carreira, cada uma acontece uma vez
    const def = game.horda ? proximaCriseHorda(game) : lista.find((d) => !game.crisesFeitas.has(d.id) && game.caos >= d.caos);
    if (def) {
      c = game.crise = { id: def.id, def, fase: 'aviso', t: 0 };
      game.tv(`crise_${def.id}_aviso`);
      game.emit('criseAviso', { id: def.id });
    }
  }
  if (!c) return;
  c.t += dt;
  if (c.fase === 'aviso') {
    if (c.t < CRISES.avisoS) return;
    c.fase = 'ativa';
    c.t = 0;
    game.tv(`crise_${c.id}`);
    game.emit('crise', { id: c.id });
    INICIO[c.id]?.(game, c);
    return;
  }
  ATIVA[c.id]?.(game, c, dt);
  if (c.t >= c.def.duracaoS) {
    FIM[c.id]?.(game, c);
    game.crisesFeitas.add(c.id);
    game.crise = null;
    criseAcabouNaHorda(game);
  }
}

/** Quanto a crise deixa alguém mais lento ali (Ressaca: a areia molhada). */
export function criseLentidao(game, x) {
  const c = game.crise;
  if (!c || c.fase !== 'ativa' || c.id !== 'ressaca') return 1;
  return x > c.agua ? CRISES.ressaca.lentoMul : 1;
}

/** Linha da água na Ressaca: o mar avança, segura e recua. */
function aguaDe(game, c) {
  const R = CRISES.ressaca;
  const m = game.map;
  const ida = Math.min(1, c.t / R.avancaS);
  const volta = Math.min(1, Math.max(0, (c.def.duracaoS - c.t) / R.avancaS));
  const k = Math.min(ida, volta);
  return m.seaX - (m.seaX - (m.sandX + R.aguaSobraM)) * k;
}

const INICIO = {
  ressaca(game, c) {
    c.agua = game.map.seaX;
    c.ondaT = CRISES.ressaca.ondaS;
    c.onda = -1;
  },
  apagao(game, c) {
    // no escuro, uma coisa brilha num lugar que de dia ninguém nota
    const p = game.player;
    const A = CRISES.apagao;
    const x = Math.max(game.map.minX + 1, Math.min(game.map.maxX - 1, p.x + (game.rng() < 0.5 ? -1 : 1) * A.achadoLongeM * 0.6));
    game.achados.push({ kind: 'cofre', x, y: p.y - A.achadoLongeM, plat: null, onde: 'escuro', cavar: false, prog: 0, aberto: false, soNoEscuro: true });
  },
  baile(game, c) {
    // o batidão: a horda em volta para para dançar, mas chega uma leva de Funkeiros
    const B = CRISES.baile;
    const p = game.player;
    for (const e of game.enemies) {
      if (e.dead || e.type !== 'telespectador') continue;
      if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 < B.raioM ** 2) e.dancaT = c.def.duracaoS;
    }
    for (let i = 0; i < B.funkeiros; i++) {
      const sp = game.fitSpawn(game.edgePoint(-Math.PI / 2 + (i - (B.funkeiros - 1) / 2) * 0.5, 30));
      game.spawnEnemy('funkeiro', sp.x, sp.y);
    }
  },
  curto(game, c) {
    c.faiscas = [];
    c.prox = 0;
  },
};

const ATIVA = {
  ressaca(game, c, dt) {
    const R = CRISES.ressaca;
    c.agua = aguaDe(game, c);
    c.ondaT -= dt;
    if (c.onda >= 0) {
      // a onda corre do mar até a linha da água e derruba quem está na areia molhada
      c.onda += dt / R.ondaCorreS;
      if (c.onda >= 1) {
        c.onda = -1;
        for (const e of game.enemies) {
          if (e.dead || e.boss || e.x < c.agua) continue;
          game.damageEnemy(e, R.ondaDano, 'ressaca', -R.ondaEmpurra, 0, true);
        }
        const p = game.player;
        if (p.x > c.agua && !(p.plat && p.lvl === 1)) p.x -= R.ondaEmpurraJuninho; // o Juninho só é empurrado
        game.shake(0.12);
      }
    } else if (c.ondaT <= 0 && c.t < c.def.duracaoS - R.avancaS) {
      c.ondaT = R.ondaS;
      c.onda = 0;
      game.word((c.agua + game.map.seaX) / 2, game.player.y - 3, 'ONDA!', '#cfeeff');
    }
  },
  baile(game, c) {
    if (Math.floor(c.t * 2) !== Math.floor((c.t - 1 / 30) * 2)) {
      const p = game.player;
      game.word(p.x + (game.fxRng() - 0.5) * 8, p.y - 2 - game.fxRng() * 4, game.fxRng() < 0.5 ? 'TUM TSS' : 'POC POC', '#ff5fd2');
    }
  },
  curto(game, c, dt) {
    // faíscas nos postes perto do Juninho: estala (aviso) e depois dá o choque, nele também
    const K = CRISES.curto;
    const p = game.player;
    c.prox -= dt;
    if (c.prox <= 0 && c.faiscas.length < K.maxFaiscas) {
      c.prox = K.cadaS;
      const a = game.rng() * Math.PI * 2;
      const r = K.pertoM * (0.4 + game.rng() * 0.6);
      const f = game.fitSpawn({ x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r });
      c.faiscas.push({ x: f.x, y: f.y, t: 0 });
    }
    for (const f of c.faiscas) {
      f.t += dt;
      if (!f.choque && f.t >= K.avisoS) {
        f.choque = true;
        if ((p.x - f.x) ** 2 + (p.y - f.y) ** 2 < K.raioM ** 2) game.hurtPlayer(K.danoJuninho, 'curto');
        game.hash.query(f.x, f.y, K.raioM + 0.6, tmp);
        for (const e of tmp) {
          if (e.dead || (e.x - f.x) ** 2 + (e.y - f.y) ** 2 > (K.raioM + e.r) ** 2) continue;
          game.damageEnemy(e, K.danoHorda, 'curto', 0, 0);
        }
      }
    }
    c.faiscas = c.faiscas.filter((f) => f.t < K.avisoS + K.choqueS);
  },
};

const FIM = {
  ressaca(game) {
    // o mar recua e aparece um cofre na areia molhada, perto de onde o Juninho está
    const p = game.player;
    game.achados.push({ kind: 'cofre', x: game.map.maxX - 1, y: p.y - 6, plat: null, onde: 'ressaca', cavar: false, prog: 0, aberto: false });
    game.tv('crise_ressaca_fim');
  },
  baile(game) {
    for (const e of game.enemies) if (e.dancaT > 0) e.dancaT = 0;
  },
};
