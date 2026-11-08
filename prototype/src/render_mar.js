// Mar da Orla e a enchente da Ressaca, desenhados a cada quadro. Ficam por cima do chão (a camada estática
// traz a areia seca, a areia molhada e o fundo do mar) e por baixo de tudo que fica em pé: a água nunca passa
// por cima de coqueiro, quiosque, barraca ou gente, que ganham só uma roda de espuma no pé.
//
// O chão é um plano: os caminhos são feitos em metros e deitados na tela pela própria conta da câmera (nada
// de girar ou entortar arte). O traço da espuma é dado depois, em pixels, para ter a mesma espessura em
// qualquer lugar da tela.

const PERIODO = 4.6; // s entre duas ondas na beira
const SOBE = 1.3; // quanto a água corre na areia (m)
const SOBE_ENCHENTE = 0.6; // na enchente a água já está alta e corre menos
const RESPIRO = 0.4; // a linha da água parada fica um pouco antes do começo do mar (m)
const PASSO = 0.4; // amostra da beira ao longo da praia (m)
const CRISTA = 1.5; // distância entre as cristas no mar (m)
const CRISTA_ENCHENTE = 2.3;
const MAX_AMOSTRAS = 400;
const ALEM_MAR = 32; // m: o mar segue além das pontas da Orla até sumir no escuro (mapa.js, drawEscuroPontas)

const fr = (v) => v - Math.floor(v);
const liso = (u) => u * u * (3 - 2 * u);
const lim = (v, a, b) => (v < a ? a : v > b ? b : v);
const hash = (i, j, s) => {
  const v = Math.sin(i * 127.1 + j * 311.7 + s * 74.7) * 43758.5453;
  return v - Math.floor(v);
};

/** Recorte da beira (m): a água nunca chega reta. Também desenha a areia molhada da camada estática. */
export function recorteMar(y) {
  return 0.3 * Math.sin(y * 0.52 + 1.3) + 0.18 * Math.sin(y * 1.31 + 0.4) + 0.08 * Math.sin(y * 2.9 + 2.0);
}

/** Até onde a onda chega na areia, no mar de todo dia (m, a partir do começo do mar). */
export const ALCANCE_MAR = { respiro: RESPIRO, sobe: SOBE };

/** Atraso da onda ao longo da praia (em ondas): ela chega torta, um trecho antes do outro. */
function atraso(y) {
  return 0.22 * Math.sin(y * 0.19 + 0.7) + 0.1 * Math.sin(y * 0.53 + 2.1);
}

/** Quanto a água subiu na areia (0 a 1) na fase s da onda: corre rápido e volta devagar. */
function subida(s) {
  if (s < 0.24) {
    const u = 1 - s / 0.24;
    return 1 - u * u;
  }
  return 1 - liso((s - 0.24) / 0.76);
}

/** A areia que a onda acabou de deixar continua brilhando molhada um pouco (0 a 1, como a subida). */
function pelicula(s) {
  if (s < 0.24) return Math.max(subida(s), 0.5 * (1 - s / 0.24));
  return Math.max(subida(s), 1 - (0.5 * (s - 0.24)) / 0.76);
}

// estado do quadro (sem criar objetos a cada quadro)
const S = { base: 0, amp: 0, off: 0, kf: 0, t: 0, oy: 0, rc: 1 };
const ys = new Float64Array(MAX_AMOSTRAS);
const beiraX = new Float64Array(MAX_AMOSTRAS);
const pelX = new Float64Array(MAX_AMOSTRAS);
const p0 = { x: 0, y: 0 };
const p1 = { x: 0, y: 0 };
const p2 = { x: 0, y: 0 };
const pt = { x: 0, y: 0 };
const propsTmp = [];
const pes = [];

function faseEm(y) {
  return fr(S.t / PERIODO + atraso(y));
}

/** Linha da água em y (m). */
function beira(y) {
  return S.base + recorteMar(y) * S.rc - S.amp * (subida(faseEm(y)) - S.off);
}

/** Põe o desenho no plano do chão: daqui em diante, (x, y − oy) em metros. */
function noChao(ctx, cam) {
  cam.toScreen(0, S.oy, p0);
  cam.toScreen(1, S.oy, p1);
  cam.toScreen(0, S.oy + 1, p2);
  ctx.transform(p1.x - p0.x, p1.y - p0.y, p2.x - p0.x, p2.y - p0.y, p0.x, p0.y);
}

// cores da água: o mar de todo dia e a enchente barrenta da Ressaca (misturadas pelo quanto a água subiu)
const MAR_COR = [
  [118, 170, 162, 0.3],
  [92, 150, 148, 0.55],
  [62, 124, 134, 0.86],
  [44, 95, 112, 1],
  [34, 78, 96, 1],
];
const ENCHENTE_COR = [
  [116, 152, 140, 0.36],
  [90, 140, 138, 0.54],
  [70, 126, 132, 0.7],
  [44, 95, 112, 1],
  [34, 78, 96, 1],
];
let grad = null;
let gradKey = '';
const gx = [0, 0, 0, 0, 0];

function gradiente(ctx, seaX) {
  const kf = S.kf;
  const b = S.base;
  gx[0] = b - S.amp - 0.7;
  gx[1] = b - 0.3;
  gx[2] = b + 0.8 + (seaX - RESPIRO - b) * 0.5;
  gx[3] = Math.max(b + 2.5, seaX + 1.8);
  gx[4] = gx[3] + 3.5;
  const key = `${b.toFixed(2)}|${kf.toFixed(2)}`;
  if (grad && key === gradKey) return grad;
  gradKey = key;
  grad = ctx.createLinearGradient(gx[0], 0, gx[4], 0);
  for (let i = 0; i < 5; i++) {
    const a = MAR_COR[i];
    const e = ENCHENTE_COR[i];
    const c = (j) => Math.round(a[j] + (e[j] - a[j]) * kf);
    grad.addColorStop((gx[i] - gx[0]) / (gx[4] - gx[0]), `rgba(${c(0)},${c(1)},${c(2)},${(a[3] + (e[3] - a[3]) * kf).toFixed(3)})`);
  }
  return grad;
}

/** Linha que acompanha a beira (desvio dx em metros), como caminho no chão. */
function linhaBeira(ctx, n, dx) {
  ctx.moveTo(beiraX[0] + dx, ys[0] - S.oy);
  for (let i = 1; i < n; i++) ctx.lineTo(beiraX[i] + dx, ys[i] - S.oy);
}

/** Ruído suave de 0 a 1 ao longo da praia. */
function ruido(y, sem) {
  return 0.5 + 0.3 * Math.sin(y * 1.9 + sem) + 0.2 * Math.sin(y * 4.3 + sem * 1.7);
}

/**
 * Faixa de espuma deitada no chão em volta de cx(i) (m), com largura que varia e some onde o ruído fica
 * abaixo do corte: falha sozinha, como espuma de verdade. cx devolve NaN onde a faixa não existe.
 * Só monta o caminho (já no plano do chão); quem chama escolhe a cor.
 */
function faixaIrregular(ctx, n, cx, larg, corte, sem) {
  ctx.beginPath();
  let ini = -1;
  const fecha = (fim) => {
    if (ini < 0) return;
    for (let k = fim; k >= ini; k--) {
      const y = ys[k];
      const w = larg * Math.sqrt(Math.max(0, ruido(y, sem) - corte) / (1 - corte)); // ponta redonda, sem lasca
      ctx.lineTo(cx(k) + w * 0.5, y - S.oy);
    }
    ctx.closePath();
    ini = -1;
  };
  for (let i = 0; i < n; i++) {
    const x = cx(i);
    if (Number.isNaN(x)) {
      fecha(i - 1);
      continue;
    }
    const y = ys[i];
    const w = larg * Math.sqrt(Math.max(0, ruido(y, sem) - corte) / (1 - corte)); // ponta redonda, sem lasca
    if (ini < 0) {
      ini = i;
      ctx.moveTo(x - w * 0.5, y - S.oy);
    } else ctx.lineTo(x - w * 0.5, y - S.oy);
  }
  fecha(n - 1);
}

/**
 * Mar e enchente. vb: área visível (m). altos: o que fica em pé na borda (coqueiros, postes), para a roda de
 * espuma no pé quando a água chega neles.
 */
export function drawMar(ctx, game, cam, t, vb, altos) {
  const m = game.map;
  if (!m.bounded || m.seaX === undefined) return;
  const w = game.world;
  const c = game.crise;
  const ress = c && c.fase === 'ativa' && c.id === 'ressaca' && c.agua !== undefined ? c : null;
  const repouso = m.seaX - RESPIRO;
  S.base = ress ? Math.min(repouso, c.agua) : repouso;
  S.kf = ress ? lim((repouso - S.base) / Math.max(1, repouso - m.sandX - 1.5), 0, 1) : 0;
  S.amp = SOBE + (SOBE_ENCHENTE - SOBE) * S.kf;
  S.off = 0.4 * S.kf; // na enchente a linha da água do jogo fica no meio do vaivém
  S.rc = 1 - 0.2 * S.kf;
  S.t = t;
  S.oy = Math.floor(cam.y);
  if (vb.maxX < S.base - S.amp - 1.2) return; // o mar não aparece
  // o mar segue um pouco além das pontas da Orla (lá o chão já vai escurecendo; mais longe, só o chão)
  const Y0 = Math.max(vb.minY, w ? w.orlaTop - ALEM_MAR : -Infinity);
  const Y1 = Math.min(vb.maxY, w ? w.orla.y1 + ALEM_MAR : Infinity);
  if (Y1 <= Y0) return;
  const n = Math.min(MAX_AMOSTRAS, Math.ceil((Y1 - Y0) / PASSO) + 1);
  for (let i = 0; i < n; i++) {
    const y = Y0 + ((Y1 - Y0) * i) / (n - 1);
    ys[i] = y;
    const s = faseEm(y);
    const r = S.base + recorteMar(y) * S.rc;
    beiraX[i] = r - S.amp * (subida(s) - S.off);
    pelX[i] = r - S.amp * (pelicula(s) - S.off);
  }
  const XR = vb.maxX + 1;
  const ppu = cam.ppu;

  // 1. areia que a onda acabou de deixar: brilho molhado e a renda de espuma que fica para trás
  ctx.save();
  noChao(ctx, cam);
  ctx.beginPath();
  ctx.moveTo(pelX[0], ys[0] - S.oy);
  for (let i = 1; i < n; i++) ctx.lineTo(pelX[i], ys[i] - S.oy);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(beiraX[i], ys[i] - S.oy);
  ctx.closePath();
  ctx.fillStyle = 'rgba(150,168,160,0.2)';
  ctx.fill();
  // a renda: fiapo fino de espuma que fica onde a onda parou, falhado
  faixaIrregular(ctx, n, (i) => (beiraX[i] - pelX[i] < 0.1 ? NaN : pelX[i] + 0.03), 0.07, 0.3, 5.1);
  ctx.fillStyle = 'rgba(236,238,228,0.32)';
  ctx.fill();

  // 2. a água: rasa e clara na beira, funda e escura para fora (na enchente, barrenta por cima da areia)
  ctx.beginPath();
  linhaBeira(ctx, n, 0);
  ctx.lineTo(XR, ys[n - 1] - S.oy);
  ctx.lineTo(XR, ys[0] - S.oy);
  ctx.closePath();
  ctx.fillStyle = gradiente(ctx, m.seaX);
  ctx.fill();

  // 3. ondulação: cristas claras chegando, com o vale escuro logo atrás; perto da beira viram espuma.
  //    Cada crista é uma faixa de largura que varia e falha sozinha (nada de traço de régua).
  const L = CRISTA + (CRISTA_ENCHENTE - CRISTA) * S.kf;
  const u0 = t / PERIODO;
  const nA = Math.ceil(u0 - 0.35);
  const nB = Math.floor(u0 + 0.35 + (XR - S.base) / L) + 1;
  const yMeio = (Y0 + Y1) / 2;
  const span = Math.max(1, XR - S.base - 1);
  for (let w2 = nA; w2 <= nB; w2++) {
    const dm = L * (w2 - u0 - atraso(yMeio));
    if (dm < -0.3 || S.base + dm > XR) continue;
    const cx = (i) => {
      const y = ys[i];
      const d = L * (w2 - u0 - atraso(y));
      if (d <= 0.05) return NaN;
      const x = S.base + recorteMar(y) * S.rc * 0.6 + d + 0.15 * Math.sin(y * 1.7 + w2 * 2.3);
      return x < beiraX[i] + 0.1 ? NaN : x;
    };
    if (dm < 1) {
      // arrebentando: espuma grossa e rasgada
      const f = lim(1 - dm, 0, 1);
      faixaIrregular(ctx, n, cx, 0.16 + 0.34 * f, 0.3 - 0.15 * f, w2 * 1.37);
      ctx.fillStyle = `rgba(242,244,236,${(0.35 + 0.4 * f).toFixed(3)})`;
      ctx.fill();
    } else {
      const far = lim((dm - 1) / span, 0, 1);
      const a = (0.32 - 0.18 * far) * (1 - 0.1 * S.kf);
      faixaIrregular(ctx, n, (i) => cx(i) + 0.22, 0.26, 0.25, w2 * 2.11);
      ctx.fillStyle = `rgba(16,44,56,${(a * 0.45).toFixed(3)})`;
      ctx.fill();
      faixaIrregular(ctx, n, cx, 0.13, 0.35, w2 * 1.37);
      ctx.fillStyle = `rgba(182,216,208,${a.toFixed(3)})`;
      ctx.fill();
    }
  }

  // 4. espuma solta logo atrás da beira, indo e voltando com ela (manchas compridas ao longo da praia)
  ctx.beginPath();
  const j0 = Math.floor(Y0 / 1.1);
  const j1 = Math.ceil(Y1 / 1.1);
  for (let j = j0; j <= j1; j++) {
    for (let q = 0; q < 3; q++) {
      const h = hash(j, q, 3);
      if (h < 0.4) continue;
      const y = j * 1.1 + hash(j, q, 4) * 1.1;
      if (y < Y0 || y > Y1) continue;
      const x = beira(y) + 0.12 + hash(j, q, 5) * (0.3 + 0.45 * q);
      const ry = 0.16 + (h - 0.4) * 0.6;
      const rx = ry * (0.25 + hash(j, q, 6) * 0.2);
      ctx.moveTo(x + rx, y - S.oy);
      ctx.ellipse(x, y - S.oy, rx, ry, 0, 0, Math.PI * 2);
    }
  }
  ctx.fillStyle = 'rgba(238,242,234,0.22)';
  ctx.fill();

  // 5. enchente: espuma suja boiando por cima da areia alagada
  if (ress) {
    ctx.beginPath();
    const cx0 = Math.floor((S.base - 1) / 1.5);
    const cx1 = Math.ceil((m.seaX + 1) / 1.5);
    const k0 = Math.floor(Y0 / 1.5);
    const k1 = Math.ceil(Y1 / 1.5);
    for (let i = cx0; i <= cx1; i++) {
      for (let j = k0; j <= k1; j++) {
        const h = hash(i, j, 11);
        if (h < 0.45) continue;
        const y = j * 1.5 + hash(i, j, 12) * 1.5 + 0.25 * Math.sin(t * 0.5 + h * 5);
        if (y < Y0 || y > Y1) continue;
        const x = i * 1.5 + hash(i, j, 13) * 1.5 + 0.35 * Math.sin(t * 0.7 + h * 9);
        if (x < beira(y) + 0.3) continue;
        const ry = 0.12 + (h - 0.45) * 0.5;
        ctx.moveTo(x + ry * 0.35, y - S.oy);
        ctx.ellipse(x, y - S.oy, ry * 0.35, ry, (hash(i, j, 14) - 0.5) * 0.8, 0, Math.PI * 2);
      }
    }
    ctx.fillStyle = 'rgba(228,234,224,0.16)';
    ctx.fill();
  }

  // 6. a beira: espuma macia do lado da água, de largura que varia, e a linha branca onde a água toca a areia
  faixaIrregular(ctx, n, (i) => beiraX[i] + 0.18, 0.42, 0.1, 0.7);
  ctx.fillStyle = 'rgba(240,244,238,0.22)';
  ctx.fill();
  faixaIrregular(ctx, n, (i) => beiraX[i] + 0.06, 0.16, 0.0, 3.3);
  ctx.fillStyle = 'rgba(242,245,238,0.45)';
  ctx.fill();
  ctx.beginPath();
  linhaBeira(ctx, n, 0);
  ctx.restore();
  ctx.strokeStyle = 'rgba(244,245,236,0.8)';
  ctx.lineWidth = Math.max(1.2, ppu * 0.08);
  ctx.lineJoin = 'round';
  ctx.stroke();

  // 7. Ressaca: a onda grande correndo do mar até a linha da água
  if (ress && c.onda >= 0) {
    const sai = 1 - lim((c.onda - 0.8) / 0.2, 0, 1) * 0.6;
    const xf = m.seaX - (m.seaX - c.agua) * c.onda;
    const frente = (y) => xf + 0.35 * Math.sin(y * 0.8 + 1) + 0.15 * Math.sin(y * 2.1);
    ctx.save();
    noChao(ctx, cam);
    // o corpo da onda, mais claro, vindo atrás da frente
    ctx.beginPath();
    for (let i = 0; i < n; i++) ctx[i ? 'lineTo' : 'moveTo'](frente(ys[i]), ys[i] - S.oy);
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(frente(ys[i]) + 1.8, ys[i] - S.oy);
    ctx.closePath();
    ctx.fillStyle = `rgba(160,204,200,${(0.26 * sai).toFixed(3)})`;
    ctx.fill();
    // a frente: espuma grossa e rasgada, e uma segunda linha de espuma logo atrás
    faixaIrregular(ctx, n, (i) => frente(ys[i]) + 0.12, 0.62, 0.12, t * 3);
    ctx.fillStyle = `rgba(244,246,238,${(0.72 * sai).toFixed(3)})`;
    ctx.fill();
    faixaIrregular(ctx, n, (i) => frente(ys[i]) + 0.75, 0.3, 0.3, 9.2 + t);
    ctx.fillStyle = `rgba(240,244,236,${(0.35 * sai).toFixed(3)})`;
    ctx.fill();
    // borrifo: pingos de espuma na frente
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const h = hash(i, Math.floor(t * 6), 17);
      if (h < 0.55) continue;
      const y = ys[i] + (hash(i, 1, 18) - 0.5) * PASSO;
      const x = frente(y) - 0.15 - h * 0.45;
      const r = 0.04 + (h - 0.55) * 0.12;
      ctx.moveTo(x + r, y - S.oy);
      ctx.ellipse(x, y - S.oy, r, r, 0, 0, Math.PI * 2);
    }
    ctx.fillStyle = `rgba(244,246,238,${(0.55 * sai).toFixed(3)})`;
    ctx.fill();
    ctx.restore();
  }

  // 8. brilho do sol de fim de tarde no mar fundo
  const gx0 = Math.max(vb.minX, S.base + 0.9 + (m.seaX - S.base) * S.kf);
  const i0 = Math.floor(gx0 / 1.0);
  const i1 = Math.ceil(XR / 1.0);
  const g0 = Math.floor(Y0 / 0.9);
  const g1 = Math.ceil(Y1 / 0.9);
  ctx.fillStyle = 'rgb(255,232,192)';
  for (let i = i0; i <= i1; i++) {
    for (let j = g0; j <= g1; j++) {
      const h = hash(i, j, 21);
      if (h < 0.45) continue;
      const tw = Math.sin(t * (1.3 + h) + h * 40);
      if (tw < 0.75) continue;
      const x = i + hash(i, j, 22);
      if (x < gx0) continue;
      const y = j * 0.9 + hash(i, j, 23) * 0.9;
      if (y < Y0 || y > Y1) continue;
      cam.toScreen(x, y, pt);
      const a = ((tw - 0.75) / 0.25) ** 2;
      ctx.globalAlpha = 0.8 * a;
      const len = ppu * (0.18 + h * 0.3);
      ctx.fillRect(pt.x - len / 2, pt.y, len, Math.max(1, ppu * 0.05));
    }
  }
  ctx.globalAlpha = 1;

  // 9. roda de espuma no pé de quem está na água (gente, barracas, coqueiros); a água fica por baixo deles
  if (S.base - S.amp - 0.6 > Math.min(vb.maxX, m.maxX + 6)) return;
  pes.length = 0;
  const pe = (x, y, r, i) => {
    if (y < Y0 || y > Y1 || x < vb.minX || x > vb.maxX) return;
    if (x < beira(y) + 0.05) return;
    pes.push(x, y, r, i);
  };
  for (let i = 0; i < game.enemies.length; i++) {
    const e = game.enemies[i];
    if (!e.dead && !e.plat) pe(e.x, e.y, e.r || 0.35, i);
  }
  const p = game.player;
  if (p && !p.plat) pe(p.x, p.y, p.r || 0.35, 999);
  if (game.propsInBounds) for (const pr of game.propsInBounds(vb, propsTmp)) pe(pr.x, pr.y, Math.min(1, pr.r || 0.4), pr.x * 7 + pr.y);
  if (altos) for (const d of altos) if (d.kind === 'coqueiro' || d.kind === 'poste') pe(d.x, d.y, 0.22, d.y);
  if (!pes.length) return;
  for (let passe = 0; passe < 2; passe++) {
    ctx.save();
    noChao(ctx, cam);
    ctx.beginPath();
    for (let k = 0; k < pes.length; k += 4) {
      const x = pes[k];
      const y = pes[k + 1] - S.oy;
      const r = pes[k + 2];
      const i = pes[k + 3];
      const rr = passe === 0 ? (r + 0.12) * (1 + 0.08 * Math.sin(t * 4 + i)) : r + 0.2 + 0.55 * fr(t * 0.8 + i * 0.37);
      ctx.moveTo(x + rr, y);
      ctx.ellipse(x, y, rr, rr, 0, 0, Math.PI * 2);
    }
    ctx.restore();
    ctx.strokeStyle = passe === 0 ? 'rgba(236,242,236,0.55)' : 'rgba(236,242,236,0.2)';
    ctx.lineWidth = Math.max(1, ppu * 0.05);
    ctx.stroke();
  }
}
