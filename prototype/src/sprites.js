// Arte em PNG (prototype/assets/). Enquanto uma imagem não carrega, o jogo usa o desenho em código.
// Os nomes seguem docs/arte/GUIA_DE_PRODUCAO_DE_ARTE.md e prototype/assets/asset_manifest.json.

export const IMAGES = {
  juninho: 'assets/personagens/juninho.png',
  // TESTE: atlas de arremesso do Juninho, 16 direções (linhas, 0° = de frente, 90° = direita) × 6 quadros
  juninho_atlas: 'assets/personagens/juninho_ataque_atlas.webp',
  telespectador_a: 'assets/personagens/telespectador_a.png',
  telespectador_c: 'assets/personagens/telespectador_c.png',
  telespectador_d: 'assets/personagens/telespectador_d.png',
  telespectador_e: 'assets/personagens/telespectador_e.png',
  telespectador_f: 'assets/personagens/telespectador_f.png',
  telespectador_g: 'assets/personagens/telespectador_g.png',
  // vistas de frente (correndo na direção da câmera). Só entram recortes de corpo inteiro, com os pés.
  tf_semcamisa_3: 'assets/personagens/frente/telespectador_semcamisa_3.png',
  tf_escura_1: 'assets/personagens/frente/telespectador_escura_1.png',
  tf_escura_2: 'assets/personagens/frente/telespectador_escura_2.png',
  burocrata_frente: 'assets/personagens/frente/burocrata_frente.png',
  golpista: 'assets/personagens/golpista.png',
  burocrata: 'assets/personagens/burocrata.png',
  fiscal: 'assets/personagens/fiscal.png',
  politico: 'assets/personagens/politico.png',
  especulador: 'assets/personagens/especulador.png',
  poste: 'assets/cenario/poste_cartaz_meio.png',
  cone: 'assets/cenario/cone.png',
  chao: 'assets/chao/pedra_portuguesa_ondas.jpg',
  w_capacete: 'assets/hud/w_capacete.png',
  w_boleto: 'assets/hud/w_boleto.png',
  w_maleta: 'assets/hud/w_maleta.png',
  w_chinelo: 'assets/hud/w_chinelo.png',
  w_megafone: 'assets/hud/w_megafone.png',
  retrato: 'assets/hud/retrato_juninho.png',
  tv: 'assets/hud/tv_apresentador_ref.png',
  caveira: 'assets/hud/icone_eliminacoes.png',
  punho: 'assets/hud/icone_caos.png',
  logo: 'assets/hud/logo.png',
};

/**
 * Horda (MECH-001) agrupada por roupa, com vista de frente e de costas. Cada pessoa mantém
 * a roupa; só troca de frente (descendo na direção da câmera) para costas (subindo).
 */
export const CROWD_SETS = [
  { front: [], back: ['telespectador_a', 'telespectador_d', 'telespectador_c'] }, // camisa amarela
  { front: [], back: ['telespectador_g'] }, // camisa verde
  { front: [], back: ['telespectador_e'] }, // camisa branca
  { front: ['tf_semcamisa_3'], back: [] }, // sem camisa
  { front: ['tf_escura_1', 'tf_escura_2'], back: [] }, // roupa escura
  { front: [], back: ['telespectador_f'] }, // camisa rosa
];
export const CROWD = [...new Set(CROWD_SETS.flatMap((s) => [...s.front, ...s.back]))];

/** Imagem da pessoa da horda conforme a roupa (tint), o indivíduo (id) e a direção. */
export function crowdImage(tint, id, front) {
  const set = CROWD_SETS[tint % CROWD_SETS.length];
  let list = front ? set.front : set.back;
  if (!list.length) list = front ? set.back : set.front;
  return list[id % list.length];
}

/** Tipo de inimigo -> imagem e tratamentos aplicados no cache. */
export const ENEMY_ART = {
  golpista: { img: 'golpista' },
  isca: { img: 'golpista', tint: [54, 240, 224, 0.55] },
  burocrata: { img: 'burocrata', front: 'burocrata_frente', papers: true },
  fiscal: { img: 'fiscal', vest: true },
  politico: { img: 'politico' },
  rival: { img: 'politico', tint: [240, 122, 26, 0.32] },
  especulador: { img: 'especulador', hardhat: true },
};

/** Ícone de arma/HUD -> imagem. */
export const ICON_ART = {
  capacete: 'w_capacete',
  entrega: 'w_capacete',
  boleto: 'w_boleto',
  maleta: 'w_maleta',
  chinelo: 'w_chinelo',
  microfone: 'w_megafone',
};

export const images = {};
let pending = 0;

export function loadImages(onEach) {
  if (typeof Image === 'undefined') return Promise.resolve(images);
  const entries = Object.entries(IMAGES);
  pending = entries.length;
  return Promise.all(entries.map(([id, src]) => new Promise((resolve) => {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => {
      images[id] = im;
      if (id === 'juninho_atlas') sliceAtlas(im);
      pending--;
      onEach?.(id);
      resolve();
    };
    im.onerror = () => {
      pending--;
      resolve();
    };
    im.src = src;
  }))).then(() => images);
}

export const imagesReady = () => pending === 0;

export const ATLAS = { cols: 6, rows: 16, cw: 200, ch: 160, figureH: 155 }; // figura ≈ 155 px numa célula de 160

/** Corta o atlas em 96 células (canvas) registradas como imagens `ja_<direção>_<quadro>`. */
function sliceAtlas(im) {
  for (let r = 0; r < ATLAS.rows; r++) {
    for (let f = 0; f < ATLAS.cols; f++) {
      const c = canvas(ATLAS.cw, ATLAS.ch);
      c.getContext('2d').drawImage(im, f * ATLAS.cw, r * ATLAS.ch, ATLAS.cw, ATLAS.ch, 0, 0, ATLAS.cw, ATLAS.ch);
      images[`ja_${r}_${f}`] = c;
    }
  }
}

/** Linha do atlas para uma direção na tela (dx para a direita, dy para baixo). */
export function atlasRow(dx, dy) {
  let deg = (Math.atan2(dx, dy) * 180) / Math.PI; // 0 = para baixo (de frente), 90 = direita
  if (deg < 0) deg += 360;
  return Math.round(deg / 22.5) % ATLAS.rows;
}

/** Monta de antemão todas as variações usadas na partida, para não travar no meio dela. */
export function prewarm(cache, playerPx, enemyPx, sizeOf) {
  // devolve uma fila de tarefas pequenas, feitas aos poucos entre os quadros (sem congelar a tela)
  const jobs = [];
  for (const flip of [false, true]) {
    jobs.push(() => cache.get('juninho', playerPx, { flip, mode: '' }));
    jobs.push(() => cache.get('juninho', playerPx, { flip, mode: 'hurt' }));
    if (flip) continue;
    for (let r = 0; r < ATLAS.rows; r++) {
      for (let f = 0; f < ATLAS.cols; f++) {
        for (const mode of ['', 'hurt']) jobs.push(() => cache.get(`ja_${r}_${f}`, playerPx * (ATLAS.ch / ATLAS.figureH), { mode, shadowScale: 0.62 }));
      }
    }
    for (const id of CROWD) {
      for (const flash of [false, true]) jobs.push(() => cache.get(id, enemyPx, { flip, flash, hypno: true }));
      jobs.push(() => cache.get(id, enemyPx, { mode: 'woken', flip }));
    }
    for (const [type, art] of Object.entries(ENEMY_ART)) {
      const h = enemyPx * sizeOf(type);
      for (const img of [art.img, art.front].filter(Boolean)) {
        for (const flash of [false, true]) jobs.push(() => cache.get(img, h, { ...art, flip, flash }));
      }
    }
  }
  return jobs;
}

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

/**
 * Monta (e guarda) o sprite pronto para desenhar: altura em px CSS, âncora nos pés,
 * sombra, contorno escuro e os tratamentos do tipo.
 */
export class SpriteCache {
  constructor() {
    this.map = new Map();
    this.dpr = 1;
  }

  clear(dpr) {
    this.map.clear();
    if (dpr) this.dpr = dpr;
  }

  get(imgId, heightCss, opts = {}) {
    const im = images[imgId];
    if (!im) return null;
    const flip = opts.flip ? 1 : 0;
    const flash = opts.flash ? 1 : 0;
    const key = `${imgId}|${Math.round(heightCss)}|${flip}|${flash}|${opts.mode || ''}|${opts.tint ? opts.tint.join() : ''}|${opts.shadowScale || ''}`;
    let c = this.map.get(key);
    if (c) return c;
    c = this.build(im, heightCss, opts);
    if (this.map.size > 600) this.map.clear();
    this.map.set(key, c);
    return c;
  }

  build(im, heightCss, opts) {
    const s = this.dpr;
    const h = heightCss * s;
    const w = (im.width / im.height) * h;
    const pad = Math.ceil(4 * s) + (opts.hypno ? Math.ceil(h * 0.12) : 0);
    const shadowH = Math.max(4, h * 0.1);
    const shadowW = w * 0.42 * (opts.shadowScale || 1);
    const c = canvas(w + pad * 2, h + pad * 2 + shadowH * 0.5);
    const g = c.getContext('2d');
    const footY = pad + h;
    const cx = c.width / 2;

    // sombra no chão
    g.fillStyle = 'rgba(0,0,0,0.38)';
    g.beginPath();
    g.ellipse(cx, footY - shadowH * 0.15, shadowW, shadowH * 0.5, 0, 0, Math.PI * 2);
    g.fill();

    // camada do personagem (com espelhamento e tratamentos)
    const layer = canvas(w, h);
    const lg = layer.getContext('2d', { willReadFrequently: opts.mode === 'woken' });
    if (opts.flip) {
      lg.translate(w, 0);
      lg.scale(-1, 1);
    }
    lg.drawImage(im, 0, 0, w, h);
    lg.setTransform(1, 0, 0, 1, 0, 0);
    if (opts.flip && opts.hardhat) {
      /* o capacete é desenhado depois, já considerando o espelho */
    }
    const atop = (fill, y0 = 0, y1 = h, alpha = 1) => {
      lg.globalCompositeOperation = 'source-atop';
      lg.globalAlpha = alpha;
      lg.fillStyle = fill;
      lg.fillRect(0, y0, w, y1 - y0);
      lg.globalAlpha = 1;
      lg.globalCompositeOperation = 'source-over';
    };
    if (opts.tint) atop(`rgb(${opts.tint[0]},${opts.tint[1]},${opts.tint[2]})`, 0, h, opts.tint[3]);
    if (opts.vest) atop('rgb(255,122,26)', h * 0.22, h * 0.52, 0.42); // colete laranja do Fiscal
    if (opts.hypno) atop('rgb(120,170,255)', 0, h * 0.24, 0.28); // luz de tela no rosto
    if (opts.mode === 'woken') desaturate(lg, w, h, 0.25);
    if (opts.flash) atop('rgb(255,255,255)', 0, h, 0.75);
    if (opts.mode === 'hurt') atop('rgb(255,40,50)', 0, h, 0.55);

    // contorno: silhueta escura deslocada em 8 direções
    const sil = canvas(w, h);
    const sg = sil.getContext('2d');
    sg.drawImage(layer, 0, 0);
    sg.globalCompositeOperation = 'source-in';
    sg.fillStyle = opts.outline || 'rgba(12,8,14,0.85)';
    sg.fillRect(0, 0, w, h);
    const o = Math.max(1, 1.2 * s);
    const x0 = cx - w / 2;
    const y0 = pad;
    if (opts.hypno) {
      // halo azul de tela em volta da cabeça
      const hx = cx;
      const hy = y0 + h * 0.09;
      const rg = g.createRadialGradient(hx, hy, 0, hx, hy, h * 0.2);
      rg.addColorStop(0, 'rgba(140,185,255,0.75)');
      rg.addColorStop(1, 'rgba(140,185,255,0)');
      g.fillStyle = rg;
      g.beginPath();
      g.arc(hx, hy, h * 0.2, 0, Math.PI * 2);
      g.fill();
    }
    for (const [dx, dy] of [[-o, 0], [o, 0], [0, -o], [0, o], [-o, -o], [o, -o], [-o, o], [o, o]]) g.drawImage(sil, x0 + dx, y0 + dy);
    g.drawImage(layer, x0, y0);

    if (opts.papers) {
      // pilha de papelada na mão
      const pw = w * 0.32;
      const ph = h * 0.16;
      const px = opts.flip ? x0 + w * 0.02 : x0 + w - pw * 0.9;
      const py = y0 + h * 0.4;
      for (let i = 0; i < 4; i++) {
        g.fillStyle = i % 2 ? '#e9e4d8' : '#f6f2ea';
        g.strokeStyle = 'rgba(40,40,50,0.6)';
        g.lineWidth = Math.max(1, s);
        g.fillRect(px + i * 1.5 * s, py - i * ph * 0.22, pw, ph * 0.3);
        g.strokeRect(px + i * 1.5 * s, py - i * ph * 0.22, pw, ph * 0.3);
      }
    }
    if (opts.hardhat) {
      // capacete de obra do Especulador (a cabeça fica em ~45% da largura, no topo)
      const hx = opts.flip ? x0 + w * 0.55 : x0 + w * 0.45;
      const hy = y0 + h * 0.075;
      const r = w * 0.15;
      g.fillStyle = '#ffd21f';
      g.strokeStyle = 'rgba(0,0,0,0.6)';
      g.lineWidth = Math.max(1, 1.2 * s);
      g.beginPath();
      g.arc(hx, hy, r, Math.PI, 0);
      g.closePath();
      g.fill();
      g.stroke();
      g.fillRect(hx - r * 1.35, hy - r * 0.05, r * 2.7, r * 0.28);
      g.strokeRect(hx - r * 1.35, hy - r * 0.05, r * 2.7, r * 0.28);
      g.fillStyle = '#e8b400';
      g.fillRect(hx - r * 0.12, hy - r * 0.95, r * 0.24, r * 0.9);
    }

    c.ox = cx / s;
    c.oy = footY / s;
    c.cssW = c.width / s;
    c.cssH = c.height / s;
    return c;
  }
}

function desaturate(g, w, h, amount) {
  try {
    const d = g.getImageData(0, 0, w, h);
    const p = d.data;
    for (let i = 0; i < p.length; i += 4) {
      const l = p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11;
      p[i] += (l - p[i]) * amount;
      p[i + 1] += (l - p[i + 1]) * amount;
      p[i + 2] += (l - p[i + 2]) * amount;
    }
    g.putImageData(d, 0, 0);
  } catch {
    /* canvas sem acesso aos pixels: segue colorido */
  }
}

/** Desenha uma imagem inteira encaixada num quadrado (ícones do HUD e projéteis). */
export function drawFit(g, im, x, y, size) {
  const s = Math.min(size / im.width, size / im.height);
  const w = im.width * s;
  const h = im.height * s;
  g.drawImage(im, x + (size - w) / 2, y + (size - h) / 2, w, h);
}
