// Ponto de entrada no navegador: liga simulação, renderização, entrada e interface.
import { Game } from './game.js';
import { Renderer } from './render.js';
import { minimapRect } from './minimapa.js';
import { Input } from './input.js';
import { UI } from './ui.js';
import { loadSettings, saveSettings, defaultSettings } from './settings.js';
import { ENEMIES, FAVELA, SOM, RELIQUIAS } from './config.js';
import { fmt } from './math.js';
import { Ads, createMockProvider } from './ads.js';
import { loadImages, images, prewarm, carregarMorro, prewarmMorro, carregarHordaOrla, prewarmHordaOrla, arteSumiu, refazerArte, carregarMonstrao } from './sprites.js';
import { loadProgress, applyRun, buyUpgrade } from './progresso.js';
import { loadRanking, registrarPartida } from './ranking.js';
import { desafioDaSemana } from './horda.js';
import { Musica } from './musica.js';
import { Sons } from './sons.js';
import { prepararTesteDoChefe } from './chegada.js';

const $ = (id) => document.getElementById(id);
const STEP = 1 / 60;

let settings = loadSettings();
const renderer = new Renderer($('view'));
const input = new Input($('touch'), $('joy'), $('joy-knob'));
const ui = new UI(renderer);
const ads = new Ads(createMockProvider($('ad-layer'), () => Number(settings.adLength) || 5));
ads.configure(settings);
ads.provider.start();
ui.rewardedOk = () => ads.rewardedAvailable();
let game = new Game(settings);
let state = 'title'; // title | playing | paused | result
const musica = new Musica(); // a música de cada trecho (musica.js)
const sons = new Sons(); // efeitos sonoros (sons.js)

// No Android, voltar do segundo plano pode apagar os canvas (personagens, chão pronto, ícones): o jogo
// confere ao voltar e, se foram apagados, recorta tudo de novo (sprites.js, refazerArte)
let refazendo = false;
function conferirArte() {
  if (refazendo || !arteSumiu()) return;
  refazendo = true;
  refazerArte().then(() => {
    refazendo = false;
  });
}
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) setTimeout(conferirArte, 250);
});
window.addEventListener('pageshow', () => setTimeout(conferirArte, 250));
window.addEventListener('focus', () => setTimeout(conferirArte, 250));
setInterval(conferirArte, 4000); // e de tempos em tempos (nem todo aplicativo avisa quando volta)
// o canvas da tela avisa quando a memória de imagem foi perdida e devolvida (os outros canvas foram juntos)
$('view').addEventListener('contextrestored', () => {
  if (refazendo) return;
  refazendo = true;
  refazerArte().then(() => {
    refazendo = false;
  });
});
// o navegador só deixa tocar depois de um toque: o primeiro toque em qualquer lugar libera; botão faz clique
document.addEventListener('pointerdown', () => sons.liberar(), { capture: true });
document.addEventListener('click', (e) => {
  if (e.target && e.target.closest && e.target.closest('button')) sons.tocar('toque');
}, { capture: true });
let settingsFrom = 'title';
let modalOpen = false;
let acc = 0;
let last = performance.now();

// métricas de desempenho (frame time) durante a partida
const perf = { times: new Float32Array(40000), n: 0, total: 0 };
function perfReset() {
  perf.n = 0;
  perf.total = 0;
}
function perfPush(dt) {
  if (perf.n < perf.times.length) perf.times[perf.n++] = dt * 1000;
  perf.total += dt;
}
function perfSummary() {
  if (!perf.n) return {};
  const arr = Array.from(perf.times.subarray(0, perf.n)).sort((a, b) => a - b);
  return {
    avgFps: Math.round(perf.n / perf.total),
    p50ms: Math.round(arr[Math.floor(arr.length * 0.5)] * 10) / 10,
    p99ms: Math.round(arr[Math.floor(arr.length * 0.99)] * 10) / 10,
    frames: perf.n,
  };
}

function deviceMeta() {
  const vm = game.camera.visibleMeters();
  return {
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    area_de_jogo_px: `${Math.round(game.camera.viewW)}x${Math.round(game.camera.viewH)}`,
    devicePixelRatio: window.devicePixelRatio,
    cores: navigator.hardwareConcurrency || null,
    area_visivel_m: `${vm.width.toFixed(1)} x ${vm.depth.toFixed(1)}`,
  };
}

function layout() {
  const app = $('app').getBoundingClientRect();
  const w = app.width;
  const h = app.height;
  const dpr = settings.resolution === '1' ? 1 : Math.min(2, window.devicePixelRatio || 1);
  renderer.resize(w, h, dpr);
  lastSize = `${Math.round(w)}x${Math.round(h)}`;
  ui.iconCache.clear();
  const top = $('caos').getBoundingClientRect().bottom - app.top;
  const bottom = $('hud-bottom').getBoundingClientRect().top - app.top;
  ui.playTop = top;
  ui.playBottom = bottom;
  game.applyView({ viewW: w, viewH: h, playTop: top, playBottom: bottom });
  ui.appW = w;
  input.setMode(settings.joystick, h, h - bottom);
  ui.last.slots = null;
  updateReadout();
  if (images.juninho) warmSprites();
}

function updateReadout() {
  const cam = game.camera;
  const vm = cam.visibleMeters();
  const speed = ENEMIES.telespectador.speed;
  const lateral = vm.width / 2 / speed;
  const ahead = (cam.anchorY - cam.playTop) / (cam.ppu * cam.k) / speed;
  ui.setReadout(
    `Área visível: ${fmt(vm.width)} m de largura × ${fmt(vm.depth)} m de profundidade. ` +
      `Um Telespectador Hipnotizado leva ${fmt(lateral)} s da borda lateral até você e ${fmt(ahead)} s do topo.`,
  );
}

// carreira: progresso no aparelho (gorjetas, melhorias, trechos) e o trecho da próxima partida
const progress = loadProgress();
let runTrecho = 'orla';
let runModo = 'carreira'; // 'carreira' | 'horda' | 'desafio'
const ranking = loadRanking();
let menuFrom = 'screen-title';

function newGame() {
  // abertura (o sinal da TV pegando) em toda partida que começa na Orla; da 2ª partida em diante, dá para pular
  const desafio = runModo === 'desafio' ? desafioDaSemana() : null;
  const meta = {
    melhorias: runModo === 'desafio' ? {} : progress.melhorias, // no desafio, todo mundo igual
    trecho: desafio ? desafio.trecho : runTrecho,
    abertura: runModo === 'carreira' && runTrecho === 'orla' && !testeChefe,
    modo: runModo,
    desafio,
    teste: runModo === 'carreira' && trechoTeste === runTrecho, // "Testar a Favela": não libera trecho no Mapa da Rota
  };
  ui.podePular = progress.partidas > 0;
  game = new Game(settings, desafio ? { meta, seed: desafio.seed } : { meta });
  layout();
  modalOpen = false;
  ui.closeModal();
  ui.tickerQueue.length = 0;
  ui.tickerUntil = 0;
  ui.last = {};
}

function start() {
  musica.liberar(); // veio de um toque: o navegador deixa tocar
  musica.setVolume(Number(settings.musica ?? 60));
  sons.liberar();
  sons.setVolume(Number(settings.efeitos ?? 70));
  newGame();
  if (testeChefe) {
    prepararTesteDoChefe(game); // "Testar o Monstrão": já no fim da Orla (D82)
    carregarMonstrao();
  } else game.fastForward(Number(settings.startAt));
  state = 'playing';
  ui.show(null);
  perfReset();
  acc = 0;
  last = performance.now();
}

function drainOutbox(now) {
  for (const ev of game.outbox) {
    if (ev.type === 'tv') ui.pushTicker(ev.text);
    else if (ev.type === 'shake') renderer.addShake(ev.amount, settings.shake);
    else if (ev.type === 'flash') renderer.flash(!settings.reduceFlashes);
    else if (ev.type === 'warn') ui.warn(ev.angle, ev.dur * 1000, now, ev.label || 'PLATEIA');
    else if (ev.type === 'boss') {
      ui.warn(-Math.PI / 2, 2500, now, 'CHEFE');
      sons.tocar('chefe');
    }
    else if (ev.type === 'fine') ui.toast(`MULTA: −${ev.amount} XP`, now);
    else if (ev.type === 'paper') ui.toast('PAPELADA! VOCÊ FICOU LENTO', now);
    else if (ev.type === 'unlock') {
      ui.toast('UMA PASSAGEM SE ABRIU', now); // sem seta: o jogador descobre (D39)
      sons.tocar('passagem');
    }
    else if (ev.type === 'segment') ui.toast(ev.name, now);
    else if (ev.type === 'recomeco') ui.toast(ev.text, now);
    else if (ev.type === 'fase') {
      ui.warn(-Math.PI / 2, 1800, now, `FASE ${ev.fase + 1}`);
      sons.tocar('fase');
    } else if (ev.type === 'criseAviso') sons.tocar('crise');
    else if (ev.type === 'crise' && ev.id === 'apagao') sons.tocar('apagao');
    else if (ev.type === 'reliquia') sons.tocar('reliquia');
    else if (ev.type === 'super_pronta') ui.toast(`SUPER PRONTA: ${RELIQUIAS[ev.id].superNome.toUpperCase()}`, now);
    else if (ev.type === 'modal' && game.modal && (game.modal.kind === 'cofre' || game.modal.kind === 'chest')) sons.tocar('cofre');
  }
  game.outbox.length = 0;
}

// mapa da favela: o botão fica por cima do mapa do canto; tocando, abre grande e o jogo pausa
let mapaAberto = false;
// super da relíquia (D67): o botão fica por cima da área do controle; o toque não move o Juninho
$('btn-super').addEventListener('pointerdown', (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (state === 'playing' && !game.modal && !mapaAberto) game.pedirSuper();
});
const btnMapa = $('btn-mapa');
const mapaLast = { show: false, key: '' };
btnMapa.addEventListener('click', () => {
  if (state !== 'playing' || game.modal) return;
  mapaAberto = !mapaAberto;
  input.reset();
  if (!mapaAberto) {
    last = performance.now();
    acc = 0;
  }
});
function updateMapaButton() {
  const show = FAVELA.minimapa && state === 'playing' && !!game.world && game.segment === 'morro' && !game.modal && !game.over;
  if (!show) mapaAberto = false;
  if (mapaLast.open !== mapaAberto) {
    mapaLast.open = mapaAberto;
    document.body.classList.toggle('mapa-aberto', mapaAberto);
  }
  if (mapaLast.show !== show) {
    mapaLast.show = show;
    btnMapa.hidden = !show;
  }
  if (!show) return;
  const r = mapaAberto ? { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight } : minimapRect(game.camera, false);
  const key = `${Math.round(r.x)}|${Math.round(r.y)}|${Math.round(r.w)}|${Math.round(r.h)}`;
  if (mapaLast.key === key) return;
  mapaLast.key = key;
  Object.assign(btnMapa.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h + (mapaAberto ? 0 : 15)}px` });
  btnMapa.setAttribute('aria-label', mapaAberto ? 'Fechar o mapa da favela' : 'Abrir o mapa da favela');
}

// Um erro num quadro não pode congelar o jogo (o próximo quadro só era pedido no fim): o quadro com erro é
// pulado, o jogo segue e o erro aparece na tela, para o print chegar com o que quebrou.
let errosVistos = 0;
function avisarErro(e, onde) {
  errosVistos++;
  console.error(onde, e);
  const el = $('erro');
  if (!el) return;
  if (errosVistos === 1 || el.hidden) {
    const pilha = String((e && e.stack) || '').split('\n').slice(0, 3).map((l) => l.trim()).join(' | ');
    el.dataset.msg = `${onde}: ${(e && e.message) || e} | ${pilha}`.slice(0, 420);
  }
  el.textContent = `DEU ERRO (manda um print; toque para fechar) [${errosVistos}]: ${el.dataset.msg}`;
  el.hidden = false;
}
$('erro').addEventListener('click', () => {
  $('erro').hidden = true;
});
window.addEventListener('error', (ev) => avisarErro(ev.error || ev.message, 'janela'));
window.addEventListener('unhandledrejection', (ev) => avisarErro(ev.reason, 'promessa'));

function frame(now) {
  try {
    quadro(now);
  } catch (e) {
    avisarErro(e, 'quadro');
    renderer.limparEstado(); // um desenho que parou no meio deixa a transparência ou a soma de luz ligadas
  }
  requestAnimationFrame(frame);
}

function quadro(now) {
  const dtReal = Math.min(0.1, (now - last) / 1000);
  last = now;
  runWarmJobs();

  if (state === 'playing' && !mapaAberto) {
    if (!game.modal) {
      acc += dtReal;
      let steps = 0;
      while (acc >= STEP && steps < 4) {
        game.update(STEP, input.read());
        acc -= STEP;
        steps++;
        if (game.modal) {
          acc = 0;
          break;
        }
      }
      if (steps === 4) acc = 0;
      perfPush(dtReal);
    }
    drainOutbox(now);
    if (game.modal && !modalOpen) {
      modalOpen = true;
      input.reset();
      ui.openModal(game, now);
    }
    if (game.finished) {
      state = 'result';
      ui.closeModal();
      input.reset();
      ads.runEnded();
      const res = applyRun(progress, game);
      ui.showResult(game, perfSummary(), settings, deviceMeta(), ads.summary());
      ui.showTips(res, progress);
      ui.showRankingResult(registrarPartida(ranking, game));
      ui.setTitleTips(progress);
      updateBanner();
    }
  }

  // música: a do trecho em que o Juninho está; mais baixa fora da partida (pausa, menus, resultado)
  if (state !== 'title') musica.tocar(game.segment === 'morro' ? 'morro' : 'orla');
  musica.abafar(state !== 'playing' || !!game.modal);
  musica.silenciar(game.silencio); // perto do Monstrão a Orla fica em silêncio (D82)
  sons.silenciar(game.silencio);
  musica.update(dtReal);
  // sons: os que o jogo pediu, no lugar de cada um; o ambiente do trecho, baixo fora da partida
  sons.drenar(game, state === 'playing' && !game.modal ? dtReal : 0);
  sons.ambiente(state === 'title' ? null : SOM.amb[game.segment === 'morro' ? 'morro' : 'orla']);
  sons.abafar(state !== 'playing' || !!game.modal);
  try {
    renderer.draw(game, settings, { dt: dtReal, mapa: mapaAberto });
  } catch (e) {
    avisarErro(e, 'desenho'); // o jogo e o HUD seguem mesmo se o desenho quebrar
    renderer.limparEstado();
  }
  updateMapaButton();
  ui.updateHud(game, now);
  ui.tickWarn(now);
  ui.tickToast(now);
  updateFps(now, dtReal);
}

let fpsAcc = 0;
let fpsFrames = 0;
let fpsLast = 0;
function updateFps(now, dt) {
  if (!settings.showFps) return;
  fpsAcc += dt;
  fpsFrames++;
  if (now - fpsLast > 500) {
    fpsLast = now;
    const fps = Math.round(fpsFrames / Math.max(fpsAcc, 1e-3));
    $('fps').textContent = `${fps} fps · ${fmt((fpsAcc / Math.max(1, fpsFrames)) * 1000)} ms · ${game.enemies.length} inimigos`;
    fpsAcc = 0;
    fpsFrames = 0;
  }
}

function updateBanner() {
  ui.setBanner(settings.ads && settings.bannerMenu && !settings.noAds && (state === 'title' || state === 'result'));
}

/** Intervalo comercial ao sair da tela de resultado (respeita as regras de frequência). */
async function leaveResult(next) {
  if (ads.canShowInterstitial()) {
    ui.setBanner(false);
    musica.calar(true); // sem música durante o anúncio
    sons.calar(true);
    await ads.showInterstitial('fim_de_turno');
    musica.calar(false);
    sons.calar(false);
  }
  next();
}

function applySetting(id, value) {
  settings[id] = value;
  if (id === 'musica') musica.setVolume(Number(value));
  if (id === 'efeitos') sons.setVolume(Number(value));
  saveSettings(settings);
  ads.configure(settings);
  updateBanner();
  if (id === 'resolution' || id === 'playerPct' || id === 'elevation' || id === 'yaw' || id === 'giroMapa' || id === 'joystick') layout();
  if (id === 'enemyPct') renderer.sprites.clear();
  if (id === 'showFps') $('fps').hidden = !value;
  updateReadout();
}

// ---------- eventos da interface ----------
let trechoTeste = null; // "Testar a Favela": recomeçar continua no Morro até voltar para o início
let testeChefe = false; // "Testar o Monstrão": recomeçar volta para o fim da Orla, com o covil aberto
ui.on('start', () => {
  if (state === 'title') {
    runModo = 'carreira'; // "Começar turno" é a Carreira; "Recomeçar" repete o modo
    trechoTeste = null;
    testeChefe = false;
  }
  if (state !== 'paused' && runModo === 'carreira') runTrecho = trechoTeste || (settings.trecho === 'morro' ? 'morro' : 'orla');
  start();
  updateBanner();
});
// atalho de teste da tela de início: a Carreira começa no pé do Morro, com a escadaria já aberta
ui.on('favela', () => {
  runModo = 'carreira';
  testeChefe = false;
  trechoTeste = 'morro';
  runTrecho = 'morro';
  start();
  updateBanner();
});
// atalho de teste da tela de início: só a luta com o Monstrão, a partir do fim da Orla (D82)
ui.on('chefe', () => {
  runModo = 'carreira';
  trechoTeste = 'orla';
  runTrecho = 'orla';
  testeChefe = true;
  start();
  updateBanner();
});
// Mapa da Rota e Melhorias (só nos menus)
function openRota() {
  ui.buildRota(progress, (id) => {
    runModo = 'carreira';
    runTrecho = id;
    start();
    updateBanner();
  }, settings.aberta);
  ui.show('screen-rota');
  const scr = document.getElementById('screen-rota');
  scr.scrollTop = scr.scrollHeight; // a rota sobe: abre mostrando o começo, embaixo
}
function openMelhorias() {
  const rebuild = (comprada = null) => ui.buildMelhorias(progress, (id) => {
    if (buyUpgrade(progress, id)) {
      ui.setTitleTips(progress);
      rebuild(id);
    }
  }, comprada);
  rebuild();
  ui.show('screen-melhorias');
}
ui.on('rota', () => {
  menuFrom = 'screen-title';
  openRota();
});
ui.on('melhorias', () => {
  menuFrom = 'screen-title';
  openMelhorias();
});
ui.on('melhoriasFim', () => {
  // do fim do turno: compra e volta para o resultado, de onde "Jogar de novo" já sai com as melhorias novas
  menuFrom = 'screen-result';
  openMelhorias();
});
ui.on('back', () => ui.show(menuFrom));
// Modo Horda, Desafio da Semana e o ranking (D43, D44)
ui.on('horda', () => {
  menuFrom = 'screen-title';
  ui.buildHorda(progress, ranking, (id) => {
    runModo = 'horda';
    runTrecho = id;
    start();
    updateBanner();
  }, settings.aberta);
  ui.show('screen-horda');
});
ui.on('desafio', () => {
  menuFrom = 'screen-title';
  ui.buildDesafio(desafioDaSemana(), ranking);
  ui.show('screen-desafio');
});
ui.on('desafioPlay', () => {
  runModo = 'desafio';
  runTrecho = 'orla';
  start();
  updateBanner();
});
ui.on('ranking', () => {
  menuFrom = 'screen-title';
  ui.buildRanking(ranking, desafioDaSemana());
  ui.show('screen-ranking');
});
ui.setTitleTips(progress);
ui.on('again', () => leaveResult(() => {
  start();
  updateBanner();
}));
ui.on('revive', async (accept) => {
  if (!game.modal || game.modal.kind !== 'revive') return;
  let watched = false;
  if (accept) {
    ui.closeModal();
    musica.calar(true);
    sons.calar(true);
    watched = await ads.showRewarded('reviver');
    musica.calar(false);
    sons.calar(false);
  }
  game.chooseRevive(watched);
  modalOpen = false;
  ui.closeModal();
  last = performance.now();
});
ui.on('rerollGratis', () => {
  if (!game.modal || !game.modal.options) return;
  game.rerollOptions(true);
  ui.openModal(game, performance.now());
});
ui.on('reroll', async () => {
  if (!game.modal || !game.modal.options) return;
  musica.calar(true);
  sons.calar(true);
  const ok = await ads.showRewarded('trocar_cartas');
  musica.calar(false);
  sons.calar(false);
  if (ok) game.rerollOptions();
  ui.openModal(game, performance.now());
});
ui.on('pause', () => {
  if (state !== 'playing') return;
  state = 'paused';
  input.reset();
  ui.show('screen-pause'); // primeiro a tela: se os números quebrarem, o jogador ainda vê o menu e volta
  try {
    ui.showNumeros(game);
  } catch (e) {
    avisarErro(e, 'pausa');
  }
});
ui.on('resume', () => {
  state = 'playing';
  ui.show(null);
  last = performance.now();
  acc = 0;
});
ui.on('quit', () => {
  const fromResult = state === 'result';
  const go = () => {
    newGame();
    state = 'title';
    ui.show('screen-title');
    updateBanner();
  };
  if (fromResult) leaveResult(go);
  else go();
});
ui.on('settings', (from) => {
  settingsFrom = from;
  ui.buildSettings(settings, applySetting);
  updateReadout();
  ui.show('screen-settings');
});
ui.on('settingsBack', () => ui.show(`screen-${settingsFrom}`));
ui.on('settingsReset', () => {
  settings = defaultSettings();
  game.settings = settings;
  saveSettings(settings);
  layout();
  renderer.sprites.clear();
  $('fps').hidden = !settings.showFps;
  ui.buildSettings(settings, applySetting);
  updateReadout();
});
ui.on('pularAbertura', () => {
  if (game) game.pularAbertura();
});
ui.on('cofreOk', () => {
  game.fecharCofre();
  modalOpen = false;
  ui.closeModal();
  last = performance.now();
});
ui.on('choose', (i) => {
  sons.tocar('carta');
  game.chooseOption(i);
  modalOpen = false;
  ui.closeModal();
  last = performance.now();
});
ui.on('decide', (accept) => {
  game.chooseEvent(accept);
  modalOpen = false;
  ui.closeModal();
  last = performance.now();
});

window.addEventListener('keydown', (e) => {
  if ((e.key === 'Escape' || e.key === 'p') && state === 'playing' && !game.modal) ui.fire('pause');
  if ((e.key === ' ' || e.key === 'e') && state === 'playing' && !game.modal) {
    game.pedirSuper(); // super da relíquia no teclado (D67)
    e.preventDefault();
  }
  else if (e.key === 'Escape' && state === 'paused') ui.fire('resume');
  if (game.modal && state === 'playing' && /^[1-3]$/.test(e.key)) {
    if (game.modal.kind === 'event') ui.fire('decide', e.key === '1');
    else ui.fire('choose', Number(e.key) - 1);
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state === 'playing' && !game.modal) ui.fire('pause');
});
// No celular, a barra do navegador aparecendo e sumindo dispara "resize" o tempo todo.
// Só refaz a tela quando o tamanho muda de verdade, e espera o movimento terminar.
let resizeTimer = 0;
let lastSize = '';
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const r = $('app').getBoundingClientRect();
    const size = `${Math.round(r.width)}x${Math.round(r.height)}`;
    if (size === lastSize) return;
    lastSize = size;
    layout();
  }, 180);
});
document.addEventListener('contextmenu', (e) => e.preventDefault());

// expõe estado para testes automatizados (Playwright)
window.__bec = { get game() { return game; }, get state() { return state; }, settings: () => settings, ads, renderer, musica, sons };

$('fps').hidden = !settings.showFps;

/** Troca os elementos desenhados em CSS pelas artes do mockup, quando carregam. */
function applyHudArt() {
  const put = (el, im, cls, alt = '') => {
    if (!el || !im) return;
    const tag = document.createElement('img');
    tag.src = im.src;
    tag.alt = alt;
    tag.className = cls;
    tag.draggable = false;
    el.replaceChildren(tag);
    el.classList.add('has-art');
  };
  put($('avatar'), images.retrato, 'hud-portrait');
  put(document.querySelector('.kills .skull'), images.caveira, 'hud-skull');
  if (images.punho && !document.querySelector('.hud-fist')) {
    const f = document.createElement('img');
    f.src = images.punho.src;
    f.alt = '';
    f.className = 'hud-fist';
    document.querySelector('.caos-label')?.before(f);
  }
  put(document.querySelector('#ticker .tv-tag'), images.tv, 'hud-tv', 'TV Caos ao vivo');
  const logo = document.querySelector('#screen-title .logo');
  if (logo && images.logo && !logo.querySelector('img')) {
    const tag = document.createElement('img');
    tag.src = images.logo.src;
    tag.alt = 'Brasil: Estado de Caos';
    tag.className = 'logo-art';
    logo.classList.add('has-art');
    logo.prepend(tag);
  }
}

loadImages(() => {
  renderer.cache.clear(renderer.dpr);
  renderer.orla.clear();
  ui.iconCache.clear();
  ui.last.slots = null;
}).then(() => {
  applyHudArt();
  warmSprites();
  // as roupas novas da horda da Orla (elenco v2) vêm depois: o jogo abre sem esperar por elas
  carregarHordaOrla()?.then(() => {
    const cam = game.camera;
    const playerPx = (settings.playerPct / 100) * (cam.playBottom - cam.playTop);
    warmJobs.push(...prewarmHordaOrla(renderer.cache, playerPx * (settings.enemyPct / 100) * ENEMIES.telespectador.size));
  });
});

/** Prepara os sprites no tamanho atual da tela antes de jogar (evita travadas na partida). */
let warmJobs = [];
function warmSprites() {
  const cam = game.camera;
  const playerPx = (settings.playerPct / 100) * (cam.playBottom - cam.playTop);
  warmJobs = prewarm(renderer.cache, playerPx, playerPx * (settings.enemyPct / 100), (type) => ENEMIES[type].size);
}

/** Atlas do Morro: carregados quando a passagem abre (ou ao começar já no Morro) e preparados aos poucos. */
let morroPedido = false;
function prepararMorro() {
  const w = game && game.world;
  if (morroPedido || !w || !(w.gateOpen || game.segment === 'morro')) return;
  morroPedido = true;
  carregarMorro()?.then(() => {
    const cam = game.camera;
    const playerPx = (settings.playerPct / 100) * (cam.playBottom - cam.playTop);
    warmJobs.push(...prewarmMorro(renderer.cache, playerPx * (settings.enemyPct / 100), (type) => ENEMIES[type].size));
  });
}

/** Faz um pouco da preparação dos sprites por quadro: mais nos menus, pouco durante a partida. */
function runWarmJobs() {
  prepararMorro();
  if (!warmJobs.length) return;
  const budgetMs = state === 'playing' ? 2 : 10;
  const t0 = performance.now();
  while (warmJobs.length && performance.now() - t0 < budgetMs) warmJobs.shift()();
}

layout();
ui.show('screen-title');
updateBanner();
requestAnimationFrame((t) => {
  last = t;
  frame(t);
});
