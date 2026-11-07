// Desenho dos efeitos das habilidades com a arte do pacote v2 (efeitos_arte.js). Cada folha só carrega
// quando o Juninho tem a habilidade (são 6 MB no total). Sem a imagem, quem chama desenha o efeito antigo.
//
// No chão, a peça é deitada com a mesma conta do chão do jogo (vista de cima e projetada no plano), e por
// isso pode girar e pulsar. Em pé, a peça fica de frente para a câmera, como os personagens.
import { FX, quadro, quadroNoTempo, quadroMisto } from './efeitos_arte.js';

// caminhos literais: o build acha as imagens pelo texto
const FX_SRC = {
  capacete_giro: 'assets/efeitos/capacete/capacete_giro.webp',
  entrega_giro: 'assets/efeitos/capacete/entrega_giro.webp',
  pancada: 'assets/efeitos/capacete/pancada.webp',
  entrega_ricochete: 'assets/efeitos/capacete/entrega_ricochete.webp',
  chinelo_giro: 'assets/efeitos/chinelo/chinelo_giro.webp',
  chinelada: 'assets/efeitos/chinelo/chinelada.webp',
  boleto_folha: 'assets/efeitos/boleto/boleto_folha.webp',
  boleto_vento: 'assets/efeitos/boleto/boleto_vento.webp',
  cobranca: 'assets/efeitos/boleto/cobranca.webp',
  carimbo_queda: 'assets/efeitos/carimbo/carimbo_queda.webp',
  carimbo_marca: 'assets/efeitos/carimbo/carimbo_marca.webp',
  carimbo_baque: 'assets/efeitos/carimbo/carimbo_baque.webp',
  explosao: 'assets/efeitos/maleta/explosao.webp',
  explosao_fumaca: 'assets/efeitos/maleta/explosao_fumaca.webp',
  chamuscado: 'assets/efeitos/maleta/chamuscado.webp',
  notas: 'assets/efeitos/maleta/notas.webp',
  pocas: 'assets/efeitos/picole/pocas.webp',
  congelado: 'assets/efeitos/picole/congelado.webp',
  gelo_quebra: 'assets/efeitos/picole/gelo_quebra.webp',
  faixa_aviso: 'assets/efeitos/mototaxi/faixa_aviso.webp',
  pneu_queimado: 'assets/efeitos/mototaxi/pneu_queimado.webp',
  poeira_moto: 'assets/efeitos/mototaxi/poeira_moto.webp',
  atropelo: 'assets/efeitos/mototaxi/atropelo.webp',
  aura_base: 'assets/efeitos/megafone/aura_base.webp',
  aura_pulso: 'assets/efeitos/megafone/aura_pulso.webp',
  empurrao: 'assets/efeitos/megafone/empurrao.webp',
  raio: 'assets/efeitos/gato/raio.webp',
  raio_estouro: 'assets/efeitos/gato/raio_estouro.webp',
  eletrocutado: 'assets/efeitos/gato/eletrocutado.webp',
  raio_origem: 'assets/efeitos/gato/raio_origem.webp',
  chamuscado_raio: 'assets/efeitos/gato/chamuscado_raio.webp',
  mordida: 'assets/efeitos/caramelo/mordida.webp',
  latido_onda: 'assets/efeitos/caramelo/latido_onda.webp',
  poeira_patas: 'assets/efeitos/caramelo/poeira_patas.webp',
};

// as folhas de cada habilidade (carregam quando o Juninho tem a habilidade)
const DA_ARMA = {
  capacete: ['capacete_giro', 'pancada'],
  entrega: ['entrega_giro', 'entrega_ricochete'],
  chinelo: ['chinelo_giro', 'chinelada'],
  boleto: ['boleto_folha', 'boleto_vento', 'cobranca'],
  carimbo: ['carimbo_queda', 'carimbo_marca', 'carimbo_baque'],
  maleta: ['explosao', 'explosao_fumaca', 'chamuscado', 'notas'],
  picole: ['pocas', 'congelado', 'gelo_quebra'],
  mototaxi: ['faixa_aviso', 'pneu_queimado', 'poeira_moto', 'atropelo'],
  microfone: ['aura_base', 'aura_pulso', 'empurrao'],
  gato: ['raio', 'raio_estouro', 'eletrocutado', 'raio_origem', 'chamuscado_raio'],
  caramelo: ['mordida', 'latido_onda', 'poeira_patas'],
};

const fxImgs = {};
/** A folha carregada, ou null (e começa a carregar). */
export function fxImg(nome) {
  const r = fxImgs[nome];
  if (r) return r.ok ? r.im : null;
  if (typeof Image === 'undefined' || !FX_SRC[nome]) return null;
  const im = new Image();
  const reg = { im, ok: false };
  fxImgs[nome] = reg;
  im.decoding = 'async';
  im.onload = () => {
    reg.ok = true;
  };
  im.src = FX_SRC[nome];
  return null;
}

const suaves = {};
/**
 * Versão esfumaçada da folha (feita uma vez): borrão leve e a borda sumindo aos poucos, célula por célula,
 * como fumaça. Sem suporte a filtro no navegador, fica só a borda sumindo.
 */
function fxSuave(nome) {
  const im = fxImg(nome);
  const F = FX[nome];
  if (!im || !F.suave || typeof document === 'undefined') return im;
  if (suaves[nome]) return suaves[nome];
  const c = document.createElement('canvas');
  c.width = im.width;
  c.height = im.height;
  const g = c.getContext('2d');
  const cw = im.width / F.cols;
  const ch = im.height / F.rows;
  g.filter = `blur(${Math.max(1, Math.round(cw * F.suave.desfoque))}px)`;
  g.drawImage(im, 0, 0);
  g.filter = 'none';
  g.globalCompositeOperation = 'destination-in';
  for (let r = 0; r < F.rows; r++) {
    for (let k = 0; k < F.cols; k++) {
      const cx = (k + 0.5) * cw;
      const cy = (r + 0.5) * ch;
      const R = Math.min(cw, ch) / 2;
      const gr = g.createRadialGradient(cx, cy, 0, cx, cy, R);
      for (const [d, v] of F.suave.pontos) gr.addColorStop(d, `rgba(0,0,0,${v})`);
      g.fillStyle = gr;
      g.fillRect(k * cw, r * ch, cw, ch);
    }
  }
  suaves[nome] = c;
  return c;
}

let armasVistas = '';
/** Carrega as folhas das habilidades que o Juninho tem. */
export function precarregarFx(game) {
  const ids = game.player.weapons.map((w) => w.id).join(',');
  if (ids === armasVistas) return;
  armasVistas = ids;
  for (const w of game.player.weapons) for (const n of DA_ARMA[w.id] || []) fxImg(n);
}

const src = { sx: 0, sy: 0, sw: 0, sh: 0 };
const pt = { x: 0, y: 0 };

/** Peça deitada no chão: centro (x, y), largura em metros, giro no plano do chão. */
export function drawChao(ctx, cam, ppu, im, s, x, y, largM, rot = 0, alpha = 1, altM = null) {
  cam.toScreen(x, y, pt);
  const k = cam.k;
  const sh = cam.sh;
  const c = cam.c;
  const sn = cam.s;
  ctx.save();
  if (alpha < 1) ctx.globalAlpha *= Math.max(0, alpha);
  ctx.translate(pt.x, pt.y);
  ctx.transform(ppu * (c - sh * k * sn), ppu * k * sn, ppu * (-sn - sh * k * c), ppu * k * c, 0, 0);
  if (rot) ctx.rotate(rot);
  const h = altM ?? (largM * s.sh) / s.sw;
  ctx.drawImage(im, s.sx, s.sy, s.sw, s.sh, -largM / 2, -h / 2, largM, h);
  ctx.restore();
}

/** Peça em pé, de frente: centro na tela e largura em px. */
function drawEmPe(ctx, im, s, cx, cy, wPx, alpha = 1) {
  const h = (wPx * s.sh) / s.sw;
  if (alpha < 1) ctx.globalAlpha = Math.max(0, alpha);
  ctx.drawImage(im, s.sx, s.sy, s.sw, s.sh, cx - wPx / 2, cy - h / 2, wPx, h);
  if (alpha < 1) ctx.globalAlpha = 1;
}

const fimSuave = (a) => (a.dur ? Math.min(1, (a.dur - a.t) / (a.dur * 0.3)) : 1);
const posDe = (a, game) => (a.segue ? game.player : a.alvo && !a.alvo.dead ? a.alvo : a);

/** Efeitos deitados no chão e a luz no chão (desenhados com o chão, antes de quem anda). */
export function drawFxChao(ctx, game, cam, ppu) {
  for (const a of game.fx.anims) {
    if (a.t < 0) continue;
    const q = posDe(a, game);
    if (a.nome === 'luz') {
      // a luz que o efeito joga na rua: uma poça de luz no chão, somada
      cam.toScreen(q.x, q.y, pt);
      const R = (a.tam / 2) * ppu;
      const f = Math.pow(1 - a.t / a.dur, 1.6);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.translate(pt.x, pt.y);
      ctx.scale(1, cam.k);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
      g.addColorStop(0, `rgba(${a.cor},${0.5 * f})`);
      g.addColorStop(1, `rgba(${a.cor},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      continue;
    }
    const F = FX[a.nome];
    if (!F || !F.chao) continue;
    const im = fxImg(a.nome);
    if (!im) continue;
    if (a.nome === 'pneu_queimado') {
      // marca de pneu ao longo da faixa da moto: a faixa da arte (6 m) repetida, de pé no sentido da viela
      quadro(F, im, 0, src);
      const n = Math.max(1, Math.round(a.comp / 6));
      const L = a.comp / n;
      for (let i = 0; i < n; i++) drawChao(ctx, cam, ppu, im, src, q.x, q.y - a.comp / 2 + L * (i + 0.5), L, Math.PI / 2, fimSuave(a) * 0.8, a.larg);
      continue;
    }
    const larg = (a.tam || F.cobreM || 2) / (F.borda || 1);
    const alpha = (F.laco || a.nome === 'aura_pulso' || a.nome === 'latido_onda' ? fimSuave(a) : Math.min(1, a.t / 0.08) * fimSuave(a)) * (F.alpha ?? 1);
    const img = F.suave ? fxSuave(a.nome) : im;
    const n = F.n || F.cols * F.rows;
    if (n > 1 && !F.laco) {
      // animação no chão: um quadro se mistura no seguinte
      const [f0, f1, w] = quadroMisto(F, a.t, a.dur, 0, mix);
      quadro(F, im, f0, src);
      drawChao(ctx, cam, ppu, img, src, q.x, q.y, larg, a.rot || 0, alpha * (1 - w * w));
      if (w > 0.02 && f1 !== f0) {
        quadro(F, im, f1, src);
        drawChao(ctx, cam, ppu, img, src, q.x, q.y, larg, a.rot || 0, alpha * w);
      }
    } else {
      quadro(F, im, quadroNoTempo(F, a.t, a.dur), src);
      drawChao(ctx, cam, ppu, img, src, q.x, q.y, larg, a.rot || 0, alpha);
    }
    if (a.nome === 'carimbo_marca') textoNoChao(ctx, cam, ppu, 'INDEFERIDO', q.x, q.y, larg * 0.17, a.rot || 0, alpha);
  }
}

/** Texto deitado no chão (o INDEFERIDO na tinta do carimbo), na mesma conta do chão. altM: altura das letras. */
function textoNoChao(ctx, cam, ppu, txt, x, y, altM, rot, alpha) {
  cam.toScreen(x, y, pt);
  const k = cam.k;
  ctx.save();
  ctx.globalAlpha *= Math.max(0, alpha) * 0.92;
  ctx.translate(pt.x, pt.y);
  ctx.transform(ppu * cam.c - ppu * cam.sh * k * cam.s, ppu * k * cam.s, -ppu * cam.s - ppu * cam.sh * k * cam.c, ppu * k * cam.c, 0, 0);
  ctx.rotate(rot);
  ctx.scale(altM / 100, altM / 100);
  ctx.font = '900 100px "Anton", Impact, "Arial Narrow", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(232,222,240,0.95)';
  ctx.fillText(txt, 0, 0);
  ctx.restore();
}

/** Efeitos em pé entram na ordem por profundidade, como os projéteis. */
export function fxEmPeNaLista(game, cam, list) {
  for (const a of game.fx.anims) {
    if (a.t < 0 || a.nome === 'luz') continue;
    const F = FX[a.nome];
    if (!F || F.chao) continue;
    const q = posDe(a, game);
    list.push({ d: cam.depth(q.x, q.y) + 0.35, k: 'fx', o: a, x: q.x, y: q.y });
  }
}

export function drawFxEmPe(ctx, a, game, cam, ppu, playerPx) {
  const F = FX[a.nome];
  const im = fxImg(a.nome);
  if (!F || !im) return;
  const q = posDe(a, game);
  cam.toScreen(q.x, q.y, pt);
  let y = pt.y - (q.z || 0) * ppu - (q.alt || 0) * ppu;
  const wPx = a.tam ? a.tam * ppu : F.tamP ? F.tamP * playerPx : (F.cobreM || 1.5) * ppu;
  y -= a.z != null ? a.z * ppu : F.zP != null ? F.zP * playerPx : (F.zM || 0) * ppu;
  if (a.sobe) y -= a.sobe * a.t * ppu; // a fumaça sobe devagar
  if (F.laco) {
    quadro(F, im, quadroNoTempo(F, a.t, a.dur), src);
    drawEmPe(ctx, im, src, pt.x, y, wPx, 1);
    return;
  }
  // um quadro se mistura no seguinte (sem pular), entrando aos poucos e saindo no fim
  const alpha = fimSuave(a) * (a.entra ? Math.min(1, a.t / a.entra) : 1);
  const [f0, f1, w] = quadroMisto(F, a.t, a.dur, a.de || 0, mix);
  quadro(F, im, f0, src);
  drawEmPe(ctx, im, src, pt.x, y, wPx, alpha * (1 - w * w));
  if (w > 0.02 && f1 !== f0) {
    quadro(F, im, f1, src);
    drawEmPe(ctx, im, src, pt.x, y, wPx, alpha * w);
  }
}
const mix = [0, 0, 0];

/** Por cima do inimigo: o gelo do picolé e os arcos do choque. h: altura do inimigo na tela. */
export function drawSobreInimigo(ctx, e, pt0, h, t) {
  let drew = false;
  if (e.frozenT > 0) {
    const F = FX.congelado;
    const im = fxImg('congelado');
    if (im) {
      // o gelo sobe nos primeiros quadros e fica no último até soltar
      const k = 1 - e.frozenT / 1.0;
      quadro(F, im, Math.min(5, Math.floor(k * 18)), src);
      drawEmPe(ctx, im, src, pt0.x, pt0.y - F.zP * h, F.tamP * h);
      drew = true;
    }
  }
  if (e.choqueAte > t) {
    const F = FX.eletrocutado;
    const im = fxImg('eletrocutado');
    if (im) {
      quadro(F, im, quadroNoTempo(F, t), src);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawEmPe(ctx, im, src, pt0.x, pt0.y - F.zP * h, F.tamP * h);
      ctx.restore();
    }
  }
  return drew;
}

/** Capacete, capacete dourado ou chinelo girando no ar: o quadro sai do giro. */
export function drawGiro(ctx, nome, spin, x, y, wPx) {
  const im = fxImg(nome);
  if (!im) return false;
  const F = FX[nome];
  const n = F.cols * F.rows;
  const f = Math.floor((((spin / (Math.PI * 2)) % 1) + 1) * n) % n;
  quadro(F, im, f, src);
  drawEmPe(ctx, im, src, x, y, wPx);
  return true;
}

/** Boleto voando em volta do Juninho: cada boleto da roda é um dos 4 da folha, dobrando no vento. */
export function drawBoletoArte(ctx, i, t, x, y, wPx, alpha) {
  const im = fxImg('boleto_folha');
  if (!im) return false;
  const F = FX.boleto_folha;
  quadro(F, im, (i % 4) * 4 + (Math.floor(t * 10 + i * 1.7) % 4), src);
  drawEmPe(ctx, im, src, x, y, wPx, alpha);
  return true;
}

/** O redemoinho de poeira e papel no chão, embaixo da roda de boletos. */
export function drawBoletoVento(ctx, cam, ppu, z) {
  const im = fxImg('boleto_vento');
  if (!im) return false;
  const a = z.t < 0.2 ? z.t / 0.2 : z.t > z.dur - 0.3 ? Math.max(0, (z.dur - z.t) / 0.3) : 1;
  quadro(FX.boleto_vento, im, 0, src);
  drawChao(ctx, cam, ppu, im, src, z.x, z.y, (z.r + 0.6) * 2, z.ang, a * 0.85);
  return true;
}

/** Poça de picolé derretido: uma das 4 da folha, pela poça. */
export function drawPoca(ctx, cam, ppu, z) {
  const im = fxImg('pocas');
  if (!im) return false;
  const a = Math.min(1, z.t / 0.15, (z.dur - z.t) / 0.6);
  quadro(FX.pocas, im, Math.floor(z.rot * 7) % 4, src);
  drawChao(ctx, cam, ppu, im, src, z.x, z.y, z.r * 2 * 1.3, z.rot, a);
  return true;
}

/** Aura do Megafone: a onda de som no chão, girando devagar, no raio do nível. */
export function drawAura(ctx, cam, ppu, p, t) {
  const im = fxImg('aura_base');
  if (!im) return false;
  const F = FX.aura_base;
  quadro(F, im, 0, src);
  drawChao(ctx, cam, ppu, fxSuave('aura_base'), src, p.x, p.y, (p.auraR * 2) / F.borda, t * 0.2, F.alpha);
  return true;
}

/** O carimbo de madeira caindo do céu: quadro pela queda; a base chega no chão no fim. */
export function drawCarimboQueda(ctx, z, X, Y, ppu) {
  const im = fxImg('carimbo_queda');
  if (!im) return false;
  const F = FX.carimbo_queda;
  const k = Math.min(1, z.t / z.delay);
  quadro(F, im, Math.min(2, Math.floor(k * 3)), src);
  const wPx = z.half * 2 * 1.25 * ppu;
  const h = (wPx * src.sh) / src.sw;
  ctx.drawImage(im, src.sx, src.sy, src.sw, src.sh, X - wPx / 2, Y - h * 0.92, wPx, h);
  return true;
}

/** Faixa de aviso do mototáxi: ladrilhos da faixa pintada, com a seta no sentido da moto. */
export function drawFaixaMoto(ctx, cam, ppu, pr, blink) {
  const im = fxImg('faixa_aviso');
  if (!im) return false;
  // um ladrilho com uma seta inteira (a faixa repete a seta a cada ~24% da largura)
  src.sx = im.width * 0.262;
  src.sw = im.width * 0.239;
  src.sy = im.height * 0.12;
  src.sh = im.height * 0.88;
  const larg = pr.width * 2;
  const passo = (larg * src.sh) / src.sw;
  const n = Math.max(1, Math.round(pr.lenM / passo));
  for (let i = 0; i < n; i++) drawChao(ctx, cam, ppu, im, src, pr.x, pr.y0 - passo * (i + 0.5), larg, 0, blink, passo);
  return true;
}

const raioA = { x: 0, y: 0 };
const raioB = { x: 0, y: 0 };
/** O choque do Gato de Luz: arcos da folha emendados de um ponto ao outro, piscando entre os 4 desenhos. */
export function drawRaio(ctx, b, cam, ppu, playerPx) {
  const im = fxImg('raio');
  if (!im) return false;
  const F = FX.raio;
  const a = 1 - b.t / b.dur;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = Math.min(1, a * 1.6);
  for (let i = 1; i < b.pts.length; i++) {
    cam.toScreen(b.pts[i - 1].x, b.pts[i - 1].y, raioA);
    cam.toScreen(b.pts[i].x, b.pts[i].y, raioB);
    // altura de cada ponta: o corpo de quem leva o choque, ou o alto do poste (z, em metros)
    const y0 = raioA.y - (b.pts[i - 1].z != null ? b.pts[i - 1].z * ppu : playerPx * 0.55);
    const y1 = raioB.y - (b.pts[i].z != null ? b.pts[i].z * ppu : playerPx * 0.55);
    const dx = raioB.x - raioA.x;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy);
    if (len < 2) continue;
    // pedaços de até ~3 m (o tamanho da arte), sem esticar: o pedaço mais comprido vira dois
    // grosso: o raio do poste usa pedaços mais compridos, e por isso mais grossos (a arte só muda de escala)
    const comp = F.compM * ppu * (b.grosso || 1);
    const n = Math.max(1, Math.round(len / comp));
    const L = len / n;
    ctx.save();
    ctx.translate(raioA.x, y0);
    ctx.rotate(Math.atan2(dy, dx));
    // o brilho azul em volta do arco (luz do curto, somada), para o raio ler bem no celular
    const gw = playerPx * 0.34 * (b.grosso || 1);
    const g = ctx.createLinearGradient(0, -gw, 0, gw);
    g.addColorStop(0, 'rgba(120,180,255,0)');
    g.addColorStop(0.5, 'rgba(150,200,255,0.6)');
    g.addColorStop(1, 'rgba(120,180,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, -gw, len, gw * 2);
    // o arco da arte, duas vezes (núcleo mais forte), sem esticar: o pedaço mais comprido vira dois
    for (let pass = 0; pass < 2; pass++) {
      for (let j = 0; j < n; j++) {
        quadro(F, im, Math.floor(b.seed + b.t * 30 + i * 3 + j + pass * 2) % 4, src);
        const h = (L * src.sh) / src.sw;
        ctx.drawImage(im, src.sx, src.sy, src.sw, src.sh, j * L, -h / 2, L, h);
      }
    }
    ctx.restore();
  }
  ctx.restore();
  return true;
}

/** Notas voando em volta da maleta aberta (a isca): 4 notas da folha, dobrando no ar. */
export function drawNotasIsca(ctx, z, pt0, ppu, playerPx, t) {
  const im = fxImg('notas');
  if (!im) return false;
  const F = FX.notas;
  const n = 7;
  for (let i = 0; i < n; i++) {
    const ang = t * (0.9 + (i % 3) * 0.25) + (i / n) * Math.PI * 2;
    const r = (0.5 + (i % 3) * 0.35) * ppu;
    const x = pt0.x + Math.cos(ang) * r;
    const y = pt0.y - playerPx * (0.25 + 0.25 * ((i * 0.37) % 1)) + Math.sin(ang) * r * 0.45 + Math.sin(t * 3 + i) * 4;
    quadro(F, im, (i % 4) * 4 + (Math.floor(t * 9 + i) % 4), src);
    drawEmPe(ctx, im, src, x, y, playerPx * 0.22);
  }
  return true;
}
