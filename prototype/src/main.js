// Ponto de entrada no navegador: liga simulação, renderização, entrada e interface.
import { Game } from './game.js';
import { Renderer } from './render.js';
import { Input } from './input.js';
import { UI } from './ui.js';
import { loadSettings, saveSettings, defaultSettings } from './settings.js';
import { ENEMIES } from './config.js';
import { fmt } from './math.js';
import { Ads, createMockProvider } from './ads.js';

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
}

function updateReadout() {
  const cam = game.camera;
  const vm = cam.visibleMeters();
  const speed = ENEMIES.cidadao.speed;
  const lateral = vm.width / 2 / speed;
  const ahead = (cam.anchorY - cam.playTop) / (cam.ppu * cam.k) / speed;
  ui.setReadout(
    `Área visível: ${fmt(vm.width)} m de largura × ${fmt(vm.depth)} m de profundidade. ` +
      `Um Cidadão Revoltado leva ${fmt(lateral)} s da borda lateral até você e ${fmt(ahead)} s do topo.`,
  );
}

function newGame() {
  game = new Game(settings);
  layout();
  modalOpen = false;
  ui.closeModal();
  ui.tickerQueue.length = 0;
  ui.tickerUntil = 0;
  ui.last = {};
}

function start() {
  newGame();
  game.fastForward(Number(settings.startAt));
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
    else if (ev.type === 'warn') ui.warn(ev.angle, ev.dur * 1000, now, 'MANIFESTAÇÃO');
    else if (ev.type === 'boss') ui.warn(-Math.PI / 2, 2500, now, 'CHEFE');
    else if (ev.type === 'fine') ui.toast(`MULTA: −${ev.amount} XP`, now);
  }
  game.outbox.length = 0;
}

function frame(now) {
  const dtReal = Math.min(0.1, (now - last) / 1000);
  last = now;

  if (state === 'playing') {
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
      ui.showResult(game, perfSummary(), settings, deviceMeta(), ads.summary());
      updateBanner();
    }
  }

  renderer.draw(game, settings, { dt: dtReal });
  ui.updateHud(game, now);
  ui.tickWarn(now);
  ui.tickToast(now);
  updateFps(now, dtReal);
  requestAnimationFrame(frame);
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
    await ads.showInterstitial('fim_de_turno');
  }
  next();
}

function applySetting(id, value) {
  settings[id] = value;
  saveSettings(settings);
  ads.configure(settings);
  updateBanner();
  if (id === 'resolution' || id === 'playerPct' || id === 'elevation' || id === 'yaw' || id === 'joystick') layout();
  if (id === 'enemyPct') renderer.sprites.clear();
  if (id === 'showFps') $('fps').hidden = !value;
  updateReadout();
}

// ---------- eventos da interface ----------
ui.on('start', () => {
  start();
  updateBanner();
});
ui.on('again', () => leaveResult(() => {
  start();
  updateBanner();
}));
ui.on('revive', async (accept) => {
  if (!game.modal || game.modal.kind !== 'revive') return;
  let watched = false;
  if (accept) {
    ui.closeModal();
    watched = await ads.showRewarded('reviver');
  }
  game.chooseRevive(watched);
  modalOpen = false;
  ui.closeModal();
  last = performance.now();
});
ui.on('reroll', async () => {
  if (!game.modal || !game.modal.options) return;
  const ok = await ads.showRewarded('trocar_cartas');
  if (ok) game.rerollOptions();
  ui.openModal(game, performance.now());
});
ui.on('pause', () => {
  if (state !== 'playing') return;
  state = 'paused';
  input.reset();
  ui.show('screen-pause');
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
ui.on('choose', (i) => {
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
  else if (e.key === 'Escape' && state === 'paused') ui.fire('resume');
  if (game.modal && state === 'playing' && /^[1-3]$/.test(e.key)) {
    if (game.modal.kind === 'event') ui.fire('decide', e.key === '1');
    else ui.fire('choose', Number(e.key) - 1);
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state === 'playing' && !game.modal) ui.fire('pause');
});
window.addEventListener('resize', () => layout());
document.addEventListener('contextmenu', (e) => e.preventDefault());

// expõe estado para testes automatizados (Playwright)
window.__bec = { get game() { return game; }, get state() { return state; }, settings: () => settings, ads };

$('fps').hidden = !settings.showFps;
layout();
ui.show('screen-title');
updateBanner();
requestAnimationFrame((t) => {
  last = t;
  frame(t);
});
