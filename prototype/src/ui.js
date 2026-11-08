// Interface em DOM: HUD enxuto, TV Caos, cartas de melhoria, propostas e telas.
import { WEAPONS, PASSIVES, SLOTS, ENEMIES, verdictFor, TRECHOS, MELHORIAS, RELIQUIAS, ACHADOS } from './config.js';
import { upgradeLevel, upgradeCost } from './progresso.js';
import { SETTINGS_SCHEMA } from './settings.js';
import { formatTime, fmt } from './math.js';
import { fmtT } from './ranking.js';
import { weaponMaxLevel } from './upgrades.js';
import { ARTE } from './sprites.js';

const $ = (id) => document.getElementById(id);

const SOURCE_NAMES = {
  ...Object.fromEntries(Object.entries(ENEMIES).map(([k, v]) => [k, v.name])),
  lote: 'Lote vendido do Especulador',
  monstrao: 'O Monstrão',
};

export class UI {
  constructor(renderer) {
    this.renderer = renderer;
    this.last = {};
    this.tickerQueue = [];
    this.tickerUntil = 0;
    this.modalArmedAt = 0;
    this.iconCache = new Map();
    this.handlers = {};
    this.buildSlots();
    this.bind();
  }

  on(name, fn) {
    this.handlers[name] = fn;
  }

  fire(name, ...args) {
    this.handlers[name]?.(...args);
  }

  bind() {
    $('btn-pause').addEventListener('click', () => this.fire('pause'));
    $('btn-start').addEventListener('click', () => this.fire('start'));
    $('btn-favela').addEventListener('click', () => this.fire('favela')); // teste: direto no pé do Morro
    $('btn-title-settings').addEventListener('click', () => this.fire('settings', 'title'));
    $('btn-resume').addEventListener('click', () => this.fire('resume'));
    $('btn-restart').addEventListener('click', () => this.fire('start'));
    $('btn-pause-settings').addEventListener('click', () => this.fire('settings', 'pause'));
    $('btn-quit').addEventListener('click', () => this.fire('quit'));
    $('btn-again').addEventListener('click', () => this.fire('again'));
    $('btn-result-settings').addEventListener('click', () => this.fire('settings', 'result'));
    $('btn-copy').addEventListener('click', () => this.copyMetrics());
    $('btn-settings-back').addEventListener('click', () => this.fire('settingsBack'));
    $('btn-settings-reset').addEventListener('click', () => this.fire('settingsReset'));
    $('btn-rota').addEventListener('click', () => this.fire('rota'));
    $('btn-melhorias').addEventListener('click', () => this.fire('melhorias'));
    $('btn-result-melhorias').addEventListener('click', () => this.fire('melhoriasFim')); // gastar as gorjetas antes de jogar de novo
    $('btn-rota-back').addEventListener('click', () => this.fire('back'));
    $('btn-horda').addEventListener('click', () => this.fire('horda'));
    $('btn-desafio').addEventListener('click', () => this.fire('desafio'));
    $('btn-ranking').addEventListener('click', () => this.fire('ranking'));
    $('btn-horda-back').addEventListener('click', () => this.fire('back'));
    $('btn-desafio-back').addEventListener('click', () => this.fire('back'));
    $('btn-ranking-back').addEventListener('click', () => this.fire('back'));
    $('btn-desafio-play').addEventListener('click', () => this.fire('desafioPlay'));
    $('btn-mel-back').addEventListener('click', () => this.fire('back'));
  }

  icon(kind, size) {
    const key = `${kind}|${size}`;
    let c = this.iconCache.get(key);
    if (!c) {
      c = this.renderer.icon(kind, size);
      this.iconCache.set(key, c);
    }
    const copy = document.createElement('canvas');
    copy.width = c.width;
    copy.height = c.height;
    copy.style.width = `${size}px`;
    copy.style.height = `${size}px`;
    copy.getContext('2d').drawImage(c, 0, 0);
    copy.setAttribute('aria-hidden', 'true');
    return copy;
  }

  // ---------- telas ----------
  show(screen) {
    for (const id of ['screen-title', 'screen-pause', 'screen-result', 'screen-settings', 'screen-rota', 'screen-melhorias', 'screen-horda', 'screen-desafio', 'screen-ranking']) $(id).hidden = id !== screen;
    document.body.classList.toggle('in-menu', !!screen);
    // o botão de pular a abertura é do HUD: some com o menu e é refeito quando a partida volta
    const pular = document.getElementById('btn-pular');
    if (pular) pular.hidden = true;
    this.last.abertura = undefined;
  }

  // ---------- HUD ----------
  buildSlots() {
    const wrap = $('slots');
    wrap.textContent = '';
    this.slotEls = [];
    const total = SLOTS.weapons + SLOTS.passives;
    for (let i = 0; i < total; i++) {
      const el = document.createElement('div');
      el.className = `slot ${i < SLOTS.weapons ? 'slot-weapon' : 'slot-passive'}`;
      el.innerHTML = '<span class="slot-icon"></span><span class="slot-pips"></span>';
      wrap.appendChild(el);
      this.slotEls.push(el);
    }
    // relíquia do trecho (D40): uma vaga só dela, dourada, que aparece quando ela é achada
    const rel = document.createElement('div');
    rel.className = 'slot slot-reliquia';
    rel.hidden = true;
    rel.innerHTML = '<span class="slot-icon"></span>';
    wrap.appendChild(rel);
    this.relEl = rel;
  }

  setText(id, text) {
    if (this.last[id] === text) return;
    this.last[id] = text;
    $(id).textContent = text;
  }

  setWidth(id, frac) {
    const v = Math.max(0, Math.min(1, frac)).toFixed(3);
    if (this.last[id] === v) return;
    this.last[id] = v;
    $(id).style.transform = `scaleX(${v})`;
  }

  updateHud(game, now) {
    if (this.geracaoArte !== ARTE.geracao) {
      // a arte foi refeita (canvas apagados): os ícones das vagas são desenhados de novo
      this.geracaoArte = ARTE.geracao;
      this.iconCache.clear();
      this.last = {};
    }
    const p = game.player;
    const st = game.stats;
    this.setText('timer', formatTime(game.t));
    this.setText('lvl', `NV. ${p.level}`);
    this.setText('hp-text', `${Math.ceil(p.hp)} / ${st.maxHp}`);
    this.setWidth('hp-fill', p.hp / st.maxHp);
    this.setWidth('xp-fill', p.xp / p.xpNext);
    // abertura: a barra de Caos só aparece quando o sinal pega; da 2ª vez, dá para pular
    const naAbertura = !!(game.abertura && game.abertura.fase !== 'feito');
    if (this.last.abertura !== naAbertura) {
      this.last.abertura = naAbertura;
      $('caos').style.visibility = naAbertura ? 'hidden' : '';
      let b = document.getElementById('btn-pular');
      if (naAbertura && this.podePular) {
        if (!b) {
          b = document.createElement('button');
          b.id = 'btn-pular';
          b.type = 'button';
          b.className = 'btn btn-ghost btn-pular';
          b.textContent = 'Pular abertura';
          b.addEventListener('click', () => this.fire('pularAbertura'));
          document.getElementById('hud')?.appendChild(b) || document.body.appendChild(b);
        }
        b.hidden = false;
      } else if (b) b.hidden = true;
    }
    this.setWidth('caos-fill', game.caos / 100);
    this.setText('caos-val', `${Math.round(game.caos)}%`);
    this.setText('caos-band', game.band.name);
    this.setText('kills', game.kills.toLocaleString('pt-BR'));
    const hpLow = p.hp < st.maxHp * 0.3;
    if (this.last.hpLow !== hpLow) {
      this.last.hpLow = hpLow;
      $('hud-top').classList.toggle('hp-low', hpLow);
    }
    const corrupt = game.corruption >= 50;
    if (this.last.corrupt !== corrupt) {
      this.last.corrupt = corrupt;
      $('avatar').classList.toggle('is-corrupt', corrupt);
    }

    const sig = p.weapons.map((w) => `${w.id}${w.level}`).join() + '|' + p.passives.map((x) => `${x.id}${x.level}`).join() + '|' + (p.reliquia || '');
    if (this.last.slots !== sig) {
      this.last.slots = sig;
      this.renderSlots(p);
    }

    const boss = game.boss;
    $('boss-bar').hidden = !boss;
    if (boss) {
      this.setWidth('boss-fill', boss.hp / boss.maxHp);
      this.setText('boss-name', (game.bossName || 'MONSTRÃO').toUpperCase());
    }

    // objetivo do trecho: o que fazer e quantos metros faltam
    const obj = game.objective ? game.objective() : null;
    const show = !!obj;
    if (this.last.obj !== show) {
      this.last.obj = show;
      $('objetivo').hidden = !show;
    }
    if (obj) {
      this.setText('obj-text', obj.text);
      this.setWidth('obj-fill', obj.frac);
    }

    this.updateTicker(game, now);
  }

  renderSlots(p) {
    if (this.relEl) {
      const tem = !!p.reliquia;
      this.relEl.hidden = !tem;
      $('slots').classList.toggle('com-reliquia', tem);
      const ic = this.relEl.querySelector('.slot-icon');
      ic.textContent = '';
      if (tem) {
        ic.appendChild(this.icon(p.reliquia, 26));
        this.relEl.title = RELIQUIAS[p.reliquia].nome;
      }
    }
    const items = [];
    for (let i = 0; i < SLOTS.weapons; i++) items.push(p.weapons[i] ? { kind: 'w', ...p.weapons[i] } : null);
    for (let i = 0; i < SLOTS.passives; i++) items.push(p.passives[i] ? { kind: 'p', ...p.passives[i] } : null);
    items.forEach((it, i) => {
      const el = this.slotEls[i];
      const iconEl = el.querySelector('.slot-icon');
      const pips = el.querySelector('.slot-pips');
      iconEl.textContent = '';
      pips.textContent = '';
      el.classList.toggle('is-empty', !it);
      el.classList.toggle('is-evolved', !!(it && it.kind === 'w' && WEAPONS[it.id].evolution));
      if (!it) {
        el.title = 'Vazio';
        return;
      }
      iconEl.appendChild(this.icon(it.id, 26));
      const max = it.kind === 'w' ? weaponMaxLevel(it.id) : PASSIVES[it.id].max;
      el.title = it.kind === 'w' ? WEAPONS[it.id].name : PASSIVES[it.id].name;
      if (max > 1) {
        for (let k = 0; k < max; k++) {
          const d = document.createElement('i');
          if (k < it.level) d.className = 'on';
          pips.appendChild(d);
        }
      }
    });
  }

  // ---------- TV Caos ----------
  pushTicker(text) {
    if (this.tickerQueue.length >= 3) this.tickerQueue.shift();
    this.tickerQueue.push(text);
  }

  updateTicker(game, now) {
    const el = $('ticker');
    if (now < this.tickerUntil) return;
    const next = this.tickerQueue.shift();
    if (!next) {
      if (!el.hidden) el.hidden = true;
      return;
    }
    $('ticker-text').textContent = next;
    $('ticker-aud').textContent = `AUDIÊNCIA ${game.audience.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}M`;
    el.hidden = false;
    el.classList.remove('is-in');
    void el.offsetWidth; // reinicia a animação
    el.classList.add('is-in');
    this.tickerUntil = now + 3600;
  }

  warn(angle, durMs, now, label) {
    const el = $('warn');
    el.textContent = label;
    el.hidden = false;
    const cx = (this.appW || window.innerWidth) / 2;
    const top = this.playTop;
    const bottom = this.playBottom;
    const cy = (top + bottom) / 2;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const hw = cx - 70;
    const hh = (bottom - top) / 2 - 30;
    const t = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
    el.style.left = `${cx + dx * t}px`;
    el.style.top = `${cy + dy * t}px`;
    el.dataset.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'e' : 'w') : dy > 0 ? 's' : 'n';
    this.warnUntil = now + durMs;
  }

  toast(text, now) {
    const el = $('toast');
    el.textContent = text;
    el.hidden = false;
    el.classList.remove('is-in');
    void el.offsetWidth;
    el.classList.add('is-in');
    this.toastUntil = now + 1400;
  }

  tickToast(now) {
    if (this.toastUntil && now > this.toastUntil) {
      $('toast').hidden = true;
      this.toastUntil = 0;
    }
  }

  tickWarn(now) {
    if (this.warnUntil && now > this.warnUntil) {
      $('warn').hidden = true;
      this.warnUntil = 0;
    }
  }

  // ---------- modais ----------
  openModal(game, now) {
    const m = game.modal;
    const box = $('modal');
    box.textContent = '';
    box.hidden = false;
    box.className = `modal modal-${m.kind}`;
    this.modalArmedAt = now + 380; // evita escolher sem querer com o dedo ainda arrastando
    box.classList.add('is-arming');
    setTimeout(() => box.classList.remove('is-arming'), 380);

    if (m.kind === 'cofre') {
      box.appendChild(this.cofreSheet(game, m));
    } else if (m.kind === 'event') {
      box.appendChild(this.eventSheet(game, m));
    } else if (m.kind === 'revive') {
      box.appendChild(this.reviveSheet(game));
    } else {
      box.appendChild(this.levelSheet(game, m));
    }
    const first = box.querySelector('button');
    first?.focus({ preventScroll: true });
  }

  closeModal() {
    $('modal').hidden = true;
    $('modal').textContent = '';
  }

  armed() {
    return performance.now() >= this.modalArmedAt;
  }

  levelSheet(game, m) {
    const sheet = document.createElement('div');
    sheet.className = 'sheet';
    const head = document.createElement('div');
    head.className = 'sheet-head';
    head.innerHTML = m.kind === 'chest'
      ? '<span class="eyebrow">MALETA ENCONTRADA</span><h2>Abra e escolha</h2>'
      : m.kind === 'inicial'
        ? '<span class="eyebrow">BOLSA DE FERRAMENTAS</span><h2>Escolha uma arma para o trecho</h2>'
        : `<span class="eyebrow">NÍVEL ${m.level}</span><h2>Escolha uma melhoria</h2>`;
    sheet.appendChild(head);
    const list = document.createElement('div');
    list.className = 'cards';
    m.options.forEach((opt, i) => {
      const b = document.createElement('button');
      b.className = `card card-${opt.kind}`;
      b.type = 'button';
      const ic = document.createElement('span');
      ic.className = 'card-icon';
      ic.appendChild(this.icon(opt.id, 44));
      const body = document.createElement('span');
      body.className = 'card-body';
      const tag = document.createElement('span');
      tag.className = 'card-tag';
      tag.textContent = opt.tag;
      const title = document.createElement('span');
      title.className = 'card-title';
      title.textContent = opt.title;
      const desc = document.createElement('span');
      desc.className = 'card-desc';
      desc.textContent = opt.desc;
      body.append(tag, title, desc);
      b.append(ic, body);
      b.addEventListener('click', () => {
        if (!this.armed()) return;
        this.fire('choose', i);
      });
      list.appendChild(b);
    });
    sheet.appendChild(list);
    if (game.trocasGratis > 0) {
      // melhoria "Contato no app": troca sem anúncio
      const rg = document.createElement('button');
      rg.type = 'button';
      rg.className = 'reroll';
      rg.textContent = 'Trocar as cartas (contato no app, grátis)';
      rg.addEventListener('click', () => {
        if (!this.armed()) return;
        this.fire('rerollGratis');
      });
      sheet.appendChild(rg);
    }
    if (game.rerollsLeft > 0 && this.rewardedOk?.()) {
      const rr = document.createElement('button');
      rr.type = 'button';
      rr.className = 'reroll';
      rr.innerHTML = '<span class="ad-chip">ANÚNCIO</span><span></span>';
      rr.lastChild.textContent = `Trocar as cartas (resta${game.rerollsLeft > 1 ? 'm' : ''} ${game.rerollsLeft})`;
      rr.addEventListener('click', () => {
        if (!this.armed()) return;
        this.fire('reroll');
      });
      sheet.appendChild(rr);
    }
    return sheet;
  }

  /**
   * Abertura do cofre (D40), com o jogo em pausa: treme três vezes, explode em luz, chafariz de notas,
   * a roleta do jogo do bicho para num bicho e as cartas saem uma por uma. Da 2ª vez, um toque acelera.
   */
  cofreSheet(game, m) {
    const sheet = document.createElement('div');
    sheet.className = `sheet sheet-cofre tier-${m.n}`;
    const palco = document.createElement('div');
    palco.className = 'cofre-palco';
    palco.innerHTML = '<div class="cofre-luz"></div><div class="cofre-notas"></div>';
    const img = document.createElement('div');
    img.className = 'cofre-img';
    img.appendChild(this.icon('maleta', 112));
    palco.appendChild(img);
    const notas = palco.querySelector('.cofre-notas');
    for (let i = 0; i < 16; i++) {
      const n = document.createElement('i');
      n.style.setProperty('--dx', `${Math.round((Math.random() - 0.5) * 260)}px`);
      n.style.setProperty('--dy', `${Math.round(-120 - Math.random() * 170)}px`);
      n.style.setProperty('--r', `${Math.round((Math.random() - 0.5) * 720)}deg`);
      n.style.animationDelay = `${0.95 + Math.random() * 0.25}s`;
      n.className = i % 3 ? 'nota' : 'moeda';
      notas.appendChild(n);
    }
    const roleta = document.createElement('div');
    roleta.className = 'cofre-roleta';
    roleta.textContent = '???';
    const res = document.createElement('div');
    res.className = 'cofre-resultado';
    const cards = document.createElement('div');
    cards.className = 'cards cofre-cartas';
    const ok = document.createElement('button');
    ok.type = 'button';
    ok.className = 'btn btn-primary cofre-ok';
    ok.textContent = 'Pegar tudo';
    ok.disabled = true;
    sheet.append(palco, roleta, res, cards, ok);

    let visto = false;
    try { visto = localStorage.getItem('bec_cofre_visto') === '1'; } catch { /* sem armazenamento */ }
    const timers = [];
    const later = (ms, fn) => timers.push(setTimeout(fn, ms));
    const bichos = ACHADOS.bichos;
    const final = () => {
      for (const t of timers) clearTimeout(t);
      timers.length = 0;
      sheet.classList.add('aberto', 'fim');
      roleta.textContent = m.bicho;
      res.textContent = m.n === 5 ? 'DEU BICHO! 5 CARTAS' : m.n === 3 ? '3 CARTAS' : '1 CARTA';
      cards.textContent = '';
      m.cards.forEach((c) => cards.appendChild(this.cofreCard(c, 0)));
      ok.disabled = false;
      try { localStorage.setItem('bec_cofre_visto', '1'); } catch { /* sem armazenamento */ }
    };
    // roteiro da abertura
    later(950, () => sheet.classList.add('aberto'));
    let k = 0;
    const gira = (ms) => {
      roleta.textContent = bichos[k++ % bichos.length];
      if (ms < 260) later(ms, () => gira(ms * 1.12));
      else later(ms, () => {
        roleta.textContent = m.bicho;
        roleta.classList.add('parou');
        res.textContent = m.n === 5 ? 'DEU BICHO! 5 CARTAS' : m.n === 3 ? '3 CARTAS' : '1 CARTA';
        m.cards.forEach((c, i) => later(350 * (i + 1), () => cards.appendChild(this.cofreCard(c, i))));
        later(350 * (m.cards.length + 1), () => { ok.disabled = false; });
      });
    };
    later(1250, () => gira(45));
    sheet.addEventListener('click', (ev) => {
      if (ev.target === ok) return;
      if (visto && ok.disabled) final(); // da segunda vez, um toque acelera
    });
    ok.addEventListener('click', () => {
      if (!this.armed() || ok.disabled) return;
      for (const t of timers) clearTimeout(t);
      this.fire('cofreOk');
    });
    return sheet;
  }

  cofreCard(c, i) {
    const b = document.createElement('div');
    b.className = `card card-${c.kind} cofre-carta`;
    b.style.animationDelay = `${i * 0.02}s`;
    const ic = document.createElement('span');
    ic.className = 'card-icon';
    ic.appendChild(this.icon(c.id, 38));
    const body = document.createElement('span');
    body.className = 'card-body';
    body.innerHTML = '<span class="card-tag"></span><span class="card-title"></span><span class="card-desc"></span>';
    body.children[0].textContent = c.tag || '';
    body.children[1].textContent = c.title;
    body.children[2].textContent = c.desc || '';
    b.append(ic, body);
    return b;
  }

  reviveSheet(game) {
    const sheet = document.createElement('div');
    sheet.className = 'sheet sheet-revive';
    sheet.innerHTML = `
      <div class="tv-bug"><b>TV CAOS</b><em>INTERVALO COMERCIAL</em></div>
      <h2>Segunda chance</h2>
      <p class="event-text">Assista a um anúncio e o Juninho volta com metade da vida. Quem estiver em volta cai junto. Vale uma vez por turno.</p>
      <div class="choices"></div>`;
    const choices = sheet.querySelector('.choices');
    const watch = document.createElement('button');
    watch.type = 'button';
    watch.className = 'btn btn-primary btn-ad';
    watch.innerHTML = '<span class="ad-chip">ANÚNCIO</span> Assistir e voltar';
    watch.addEventListener('click', () => {
      if (!this.armed()) return;
      this.fire('revive', true);
    });
    const end = document.createElement('button');
    end.type = 'button';
    end.className = 'btn btn-ghost';
    end.textContent = 'Encerrar turno';
    end.addEventListener('click', () => {
      if (!this.armed()) return;
      this.fire('revive', false);
    });
    choices.append(watch, end);
    return sheet;
  }

  setBanner(show) {
    $('banner').hidden = !show;
  }

  eventSheet(game, m) {
    const ev = m.event;
    const sheet = document.createElement('div');
    sheet.className = 'sheet sheet-event';
    sheet.innerHTML = `
      <div class="tv-bug"><b>TV CAOS</b><em>PROPOSTA INDECENTE</em></div>
      <h2></h2>
      <p class="event-text"></p>
      <div class="corr"><span>CORRUPÇÃO</span><div class="bar"><i style="transform:scaleX(${(game.corruption / 100).toFixed(2)})"></i></div><b>${game.corruption}</b></div>
      <div class="choices"></div>`;
    sheet.querySelector('h2').textContent = ev.title;
    sheet.querySelector('.event-text').textContent = ev.text;
    const choices = sheet.querySelector('.choices');
    for (const [key, accept] of [['accept', true], ['refuse', false]]) {
      const c = ev[key];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `choice choice-${key}`;
      const label = document.createElement('span');
      label.className = 'choice-label';
      label.textContent = c.label;
      const ul = document.createElement('ul');
      for (const g of c.good) {
        const li = document.createElement('li');
        li.className = 'good';
        li.textContent = g;
        ul.appendChild(li);
      }
      for (const g of c.bad) {
        const li = document.createElement('li');
        li.className = 'bad';
        li.textContent = g;
        ul.appendChild(li);
      }
      b.append(label, ul);
      b.addEventListener('click', () => {
        if (!this.armed()) return;
        this.fire('decide', accept);
      });
      choices.appendChild(b);
    }
    return sheet;
  }

  // ---------- resultado ----------
  showResult(game, perfSummary, settings, meta, adsSummary) {
    const s = game.summary();
    const win = game.over === 'victory';
    $('result-title').textContent = game.modo === 'desafio' ? 'FIM DO DESAFIO' : game.modo === 'horda' ? 'FIM DA HORDA' : game.delivered ? 'ENTREGA FEITA' : win ? 'TURNO CONCLUÍDO' : 'FIM DO TURNO';
    $('result-headline').textContent = game.delivered
      ? 'ENTREGA FEITA NO ALTO DO MORRO: UMA PIZZA DE CALABRESA. GORJETA: NENHUMA'
      : win
      ? 'MONSTRÃO VAI AO CHÃO. ACADEMIA DA PRAIA FICA SEM DONO'
      : 'ENTREGADOR NÃO RESISTE. APP DESCONTA A ENTREGA';
    const verdict = verdictFor(game.corruption);
    $('result-verdict').textContent = verdict.title;
    $('result-corr').textContent = `Corrupção ${game.corruption}`;
    const rows = [
      ['Tempo', formatTime(game.t)],
      ['Nível', String(s.nivel)],
      ['Derrubados', s.abates.toLocaleString('pt-BR')],
      ['Caos final', `${s.caos_final}%`],
      ['1ª melhoria', s.primeira_melhoria_s == null ? '—' : `${fmt(s.primeira_melhoria_s)} s`],
      ['Causa', win ? '—' : SOURCE_NAMES[s.causa_da_derrota] || '—'],
      ['FPS médio', perfSummary.avgFps ? String(perfSummary.avgFps) : '—'],
      ['1% pior quadro', perfSummary.p99ms ? `${fmt(perfSummary.p99ms)} ms` : '—'],
      ['Pico de inimigos', String(s.pico_inimigos)],
      ['Segunda chance', game.metrics.ads.aceitos.reviver ? 'usada' : game.reviveUsed ? 'recusada' : '—'],
    ];
    const dl = $('result-stats');
    dl.textContent = '';
    for (const [k, v] of rows) {
      const dt = document.createElement('dt');
      dt.textContent = k;
      const dd = document.createElement('dd');
      dd.textContent = v;
      dl.append(dt, dd);
    }
    this.metricsJson = JSON.stringify({ ...s, anuncios_na_sessao: adsSummary, desempenho: perfSummary, ajustes: settings, dispositivo: meta }, null, 2);
    $('metrics-out').value = this.metricsJson;
    $('metrics-out').hidden = true;
    $('copy-status').textContent = '';
    this.show('screen-result');
  }

  // ---------- carreira ----------
  setTitleTips(progress) {
    $('title-tips').textContent = progress.gorjetas ? `${progress.gorjetas}` : '';
    $('result-tips-chip').textContent = progress.gorjetas ? `${progress.gorjetas}` : '';
  }

  /** Mapa da Rota: trechos de baixo para cima; liberado = jogar; bloqueado = cadeado e a meta. */
  buildRota(progress, onPlay, aberta = false) {
    const list = $('rota-list');
    list.textContent = '';
    for (const t of TRECHOS) {
      const st = aberta ? { ...progress.trechos[t.id], liberado: true } : progress.trechos[t.id]; // versão aberta: tudo liberado
      const open = st.liberado && t.jogavel;
      const li = document.createElement('li');
      if (!st.liberado) {
        // ainda não descoberto (D39): sem nome e sem meta
        const item = document.createElement('div');
        item.className = 'rota-item is-locked';
        item.innerHTML = '<span><span class="rota-name">???</span></span><span class="rota-lock">🔒</span>';
        li.append(item);
        list.append(li);
        continue;
      }
      const item = document.createElement(open ? 'button' : 'div');
      item.className = `rota-item ${open ? 'is-open' : 'is-locked'}`;
      if (open) item.type = 'button';
      const name = document.createElement('span');
      name.className = 'rota-name';
      name.textContent = t.nome;
      const where = document.createElement('span');
      where.className = 'rota-where';
      where.textContent = t.onde;
      const left = document.createElement('span');
      left.append(name, document.createElement('br'), where);
      const right = document.createElement('span');
      if (open) {
        right.className = 'rota-play';
        right.textContent = 'JOGAR';
      } else if (st.liberado) {
        right.className = 'rota-lock';
        right.textContent = 'EM PRODUÇÃO';
      } else {
        right.className = 'rota-lock';
        right.textContent = '🔒 BLOQUEADO';
      }
      item.append(left, right);
      const goal = document.createElement('span');
      goal.className = 'rota-goal';
      if (t.estrelas) {
        const n = st.estrelas.filter(Boolean).length;
        const stars = document.createElement('span');
        stars.className = 'rota-stars';
        stars.textContent = '★'.repeat(n) + '☆'.repeat(3 - n);
        goal.append(stars, document.createTextNode(` ${t.estrelas.map((s, i) => (st.estrelas[i] ? '✓ ' : '') + s).join(' · ')}`));
        if (!st.liberado && t.meta) goal.textContent = t.meta;
      } else goal.textContent = st.liberado ? 'Liberado. O trecho entra quando a arte chegar.' : t.meta;
      item.append(goal);
      if (open) item.addEventListener('click', () => onPlay(t.id));
      li.append(item);
      list.append(li);
    }
  }

  /** Modo Horda: os mapas conquistados na Carreira (derrubou o chefão); o resto, trancado ou ???. */
  buildHorda(progress, ranking, onPlay, aberta = false) {
    const list = $('horda-list');
    list.textContent = '';
    for (const t of TRECHOS.filter((x) => x.jogavel)) {
      const st = progress.trechos[t.id];
      const conquistado = aberta || st.estrelas[0];
      const li = document.createElement('li');
      const item = document.createElement(conquistado ? 'button' : 'div');
      item.className = `rota-item ${conquistado ? 'is-open' : 'is-locked'}`;
      if (conquistado) item.type = 'button';
      const left = document.createElement('span');
      const name = document.createElement('span');
      name.className = 'rota-name';
      name.textContent = st.liberado || aberta ? t.nome : '???';
      left.append(name);
      const right = document.createElement('span');
      right.className = conquistado ? 'rota-play' : 'rota-lock';
      right.textContent = conquistado ? 'JOGAR' : '🔒';
      item.append(left, right);
      const goal = document.createElement('span');
      goal.className = 'rota-goal';
      const best = (ranking.horda[t.id] || [])[0];
      goal.textContent = conquistado
        ? (best ? `Seu recorde: ${fmtT(best.s)}` : 'Ainda sem recorde')
        : st.liberado ? 'Derrube o chefão deste trecho na Carreira' : '';
      item.append(goal);
      if (conquistado) item.addEventListener('click', () => onPlay(t.id));
      li.append(item);
      list.append(li);
    }
  }

  /** Desafio da Semana: a regra, o recorde da semana neste aparelho. */
  buildDesafio(d, ranking) {
    const box = $('desafio-info');
    box.textContent = '';
    const h = document.createElement('div');
    h.innerHTML = '<b></b>';
    h.firstChild.textContent = d.nome;
    const p1 = document.createElement('div');
    p1.textContent = `${d.desc}. Orla do Desespero, o mesmo sorteio para todo mundo, sem melhorias permanentes.`;
    const best = (ranking.desafio[d.id] || [])[0];
    const p2 = document.createElement('div');
    p2.textContent = best ? `Seu melhor nesta semana: ${fmtT(best.s)}` : 'Você ainda não jogou o desafio desta semana.';
    box.append(h, p1, p2);
  }

  /** Entregador do Mês: os recordes deste aparelho. */
  buildRanking(ranking, desafio) {
    const box = $('ranking-list');
    box.textContent = '';
    const bloco = (titulo, lista, vazio) => {
      const h = document.createElement('div');
      h.innerHTML = '<b></b>';
      h.firstChild.textContent = titulo;
      box.append(h);
      if (!lista || !lista.length) {
        const v = document.createElement('div');
        v.textContent = vazio;
        box.append(v);
        return;
      }
      lista.slice(0, 5).forEach((e, i) => {
        const r = document.createElement('div');
        r.textContent = `${i + 1}º  ${fmtT(e.s)}  ·  ${e.d.split('-').reverse().join('/')}`;
        box.append(r);
      });
    };
    bloco('Carreira · Orla: menor tempo para derrubar o Monstrão', ranking.carreira.orla, 'Ainda ninguém derrubou o Monstrão.');
    bloco('Carreira · Morro: menor tempo para derrubar o Chefe do Tráfico', ranking.carreira.morro, 'Ainda ninguém derrubou o Chefe do Tráfico.');
    bloco('Horda · Orla: mais tempo vivo', ranking.horda.orla, 'Sem partidas de Horda na Orla.');
    bloco('Horda · Morro: mais tempo vivo', ranking.horda.morro, 'Sem partidas de Horda no Morro.');
    bloco(`Desafio da Semana · ${desafio.nome}`, ranking.desafio[desafio.id], 'Sem partidas do desafio desta semana.');
  }

  /** No resultado: o que entrou no ranking (ou por que não entrou). */
  showRankingResult(res) {
    const box = $('result-tips');
    if (!res) return;
    const linhas = res.fora ? [res.fora] : res.linhas;
    for (const l of linhas) {
      const d = document.createElement('div');
      d.className = 'ranking-linha';
      d.textContent = res.fora ? l : `ENTREGADOR DO MÊS · ${l}`;
      box.append(d);
    }
  }

  /** Melhorias permanentes: nível, custo e compra com gorjetas. */
  buildMelhorias(progress, onBuy) {
    $('mel-total').textContent = String(progress.gorjetas);
    const list = $('mel-list');
    list.textContent = '';
    for (const [id, m] of Object.entries(MELHORIAS)) {
      const lv = upgradeLevel(progress, id);
      const cost = upgradeCost(progress, id);
      const row = document.createElement('div');
      row.className = 'mel-item';
      const name = document.createElement('span');
      name.className = 'mel-name';
      name.textContent = m.name;
      const desc = document.createElement('span');
      desc.className = 'mel-desc';
      desc.textContent = m.opcao ? m.desc : `${m.desc} por nível`;
      const pips = document.createElement('span');
      pips.className = 'mel-pips';
      for (let i = 0; i < m.custo.length; i++) {
        const p = document.createElement('i');
        if (i < lv) p.className = 'on';
        pips.append(p);
      }
      const buy = document.createElement('button');
      buy.type = 'button';
      buy.className = 'mel-buy';
      buy.textContent = cost == null ? 'MÁXIMO' : `${cost} 💰`;
      buy.disabled = cost == null || progress.gorjetas < cost;
      buy.addEventListener('click', () => onBuy(id));
      row.append(name, buy, desc, pips);
      list.append(row);
    }
  }

  /** Gorjetas da partida no resultado. */
  showTips(res, progress) {
    const box = $('result-tips');
    box.textContent = '';
    const head = document.createElement('div');
    head.innerHTML = '';
    head.append(document.createTextNode('Gorjetas do turno: '));
    const b = document.createElement('b');
    b.textContent = `+${res.tips.total}`;
    head.append(b, document.createTextNode(` · total ${progress.gorjetas}`));
    box.append(head);
    for (const [label, n] of res.tips.parts) {
      if (!n) continue;
      const r = document.createElement('small');
      r.textContent = `${label}: +${n}`;
      box.append(r);
    }
    for (const s of res.novas) {
      const r = document.createElement('small');
      r.textContent = `★ ${s}`;
      box.append(r);
    }
  }

  async copyMetrics() {
    const out = $('metrics-out');
    try {
      await navigator.clipboard.writeText(this.metricsJson);
      $('copy-status').textContent = 'Métricas copiadas.';
    } catch {
      out.hidden = false;
      out.focus();
      out.select();
      $('copy-status').textContent = 'Não deu para copiar automaticamente. O texto está selecionado abaixo.';
    }
  }

  // ---------- ajustes ----------
  buildSettings(settings, onChange) {
    const form = $('settings-form');
    form.textContent = '';
    for (const f of SETTINGS_SCHEMA) {
      const row = document.createElement('div');
      row.className = `field field-${f.type}`;
      const id = `set-${f.id}`;
      const label = document.createElement('label');
      label.htmlFor = id;
      label.textContent = f.label;
      let input;
      const value = document.createElement('output');
      value.className = 'field-value';
      if (f.type === 'range') {
        input = document.createElement('input');
        input.type = 'range';
        input.min = f.min;
        input.max = f.max;
        input.step = f.step;
        input.value = settings[f.id];
        value.textContent = String(settings[f.id]);
        input.addEventListener('input', () => {
          value.textContent = input.value;
          onChange(f.id, Number(input.value));
        });
      } else if (f.type === 'toggle') {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = !!settings[f.id];
        input.addEventListener('change', () => onChange(f.id, input.checked));
      } else {
        input = document.createElement('select');
        for (const [v, t] of f.options) {
          const o = document.createElement('option');
          o.value = v;
          o.textContent = t;
          input.appendChild(o);
        }
        input.value = settings[f.id];
        input.addEventListener('change', () => onChange(f.id, input.value));
      }
      input.id = id;
      const top = document.createElement('div');
      top.className = 'field-top';
      top.append(label);
      if (f.type === 'range') top.append(value);
      if (f.type === 'toggle') top.append(input);
      row.append(top);
      if (f.type !== 'toggle') row.append(input);
      if (f.hint) {
        const h = document.createElement('small');
        h.textContent = f.hint;
        row.append(h);
      }
      form.appendChild(row);
    }
  }

  setReadout(text) {
    $('settings-readout').textContent = text;
  }
}
