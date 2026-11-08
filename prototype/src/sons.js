// Efeitos sonoros (docs/som/PEDIDO_SONS.md). Enquanto os sons gravados não chegam, cada som é feito em código
// a partir de uma receita curta (camadas de ruído e de tom com envelope e filtro): provisórios, mas no lugar
// certo, para acertar a mistura antes. Chegando os arquivos (ARQUIVOS, abaixo), eles tomam o lugar.
//
// A mistura: um limite de quantos sons iguais tocam juntos e de quantos tocam no total (com prioridade), uma
// espera mínima entre dois iguais, variação de tom, volume pela distância e lado (esquerda/direita) pelo lugar.
// Só começa depois de um toque (o navegador não deixa tocar antes). Fora do navegador, não faz nada.
// sintetizar() e RECEITAS não usam o navegador: os testes conferem que todo som tem receita e soa.
import { SONS, SOM } from './config.js';

// Camada: tipo 'ruido' ou forma de onda ('sine', 'square', 'saw', 'tri'); ini (s), d (duração, s); f0 → f1
// (Hz, tom); lp → lp1 e hp (Hz, filtros); a (ataque, s); q (queda: tempo da curva, s; sem q, segura até o
// fim); v (volume da camada); am, amP (tremido: Hz e quanto).
const R = (tipo, d, o = {}) => ({ tipo, d, ...o });
const tom = (onda, f0, f1, d, o = {}) => R(onda, d, { f0, f1, ...o });
const ruido = (d, o = {}) => R('ruido', d, o);
const sopro = (d, o = {}) => ruido(d, { lp: 500, lp1: 3200, hp: 200, a: d * 0.45, q: d * 0.3, ...o }); // whoosh

export const RECEITAS = {
  dano: [tom('saw', 240, 120, 0.2, { lp: 1600, q: 0.08, v: 0.6 }), ruido(0.1, { lp: 1500, q: 0.04, v: 0.5 })],
  morte: [tom('saw', 300, 55, 1.0, { lp: 1200, q: 0.45, v: 0.6 }), ruido(0.7, { lp: 700, q: 0.3, v: 0.4 })],
  nivel: [523, 659, 784, 1046].map((f, i) => tom('square', f, f, 0.16 + (i === 3 ? 0.2 : 0), { ini: i * 0.08, lp: 3000, q: 0.12, v: 0.25 })),
  xp: [tom('sine', 1250, 1700, 0.07, { q: 0.03, v: 0.5 })],
  cura: [tom('sine', 600, 900, 0.22, { q: 0.12, v: 0.4 }), tom('sine', 900, 1300, 0.22, { ini: 0.09, q: 0.12, v: 0.35 })],
  gorjeta: [tom('square', 1800, 1800, 0.07, { lp: 6000, q: 0.03, v: 0.25 }), tom('square', 2500, 2500, 0.16, { ini: 0.06, lp: 6000, q: 0.06, v: 0.25 })],
  pega: [ruido(0.08, { lp: 2500, hp: 300, q: 0.03, v: 0.4 }), tom('tri', 300, 440, 0.09, { q: 0.05, v: 0.4 })],
  arremesso: [sopro(0.22, { v: 0.7 })],
  golpe: [ruido(0.09, { lp: 1800, hp: 120, q: 0.03, v: 0.8 }), tom('sine', 150, 60, 0.1, { q: 0.04, v: 0.7 })],
  bonk: [tom('tri', 560, 300, 0.13, { q: 0.05, v: 0.6 }), ruido(0.04, { lp: 3000, q: 0.01, v: 0.4 })],
  tapa: [ruido(0.07, { lp: 7000, hp: 900, q: 0.015, v: 0.9 }), ruido(0.05, { lp: 1200, q: 0.02, v: 0.4 })],
  morte_horda: [ruido(0.26, { lp: 900, lp1: 300, hp: 80, q: 0.08, v: 0.8 }), tom('sine', 95, 40, 0.2, { q: 0.07, v: 0.5 })],
  morte_elite: [ruido(0.6, { lp: 1200, lp1: 200, q: 0.2, v: 0.8 }), tom('saw', 220, 50, 0.6, { lp: 900, q: 0.25, v: 0.5 })],
  acorda: [ruido(0.28, { hp: 1000, lp: 6000, am: 50, amP: 0.8, q: 0.12, v: 0.5 })],
  gemido: [tom('saw', 145, 105, 0.75, { lp: 650, am: 5, amP: 0.4, a: 0.15, q: 0.4, v: 0.6 })],
  quebra_plastico: [ruido(0.18, { lp: 5000, hp: 1500, q: 0.05, v: 0.7 }), ...[0.05, 0.09, 0.14].map((ini) => ruido(0.03, { ini, lp: 6000, hp: 2000, q: 0.01, v: 0.4 }))],
  quebra_madeira: [ruido(0.2, { lp: 2500, hp: 200, q: 0.06, v: 0.8 }), tom('tri', 180, 90, 0.1, { q: 0.04, v: 0.5 })],
  baque: [tom('sine', 110, 55, 0.16, { q: 0.06, v: 0.9 }), ruido(0.08, { lp: 600, q: 0.03, v: 0.5 })],
  explosao: [ruido(1.1, { lp: 1400, lp1: 180, q: 0.35, v: 1 }), tom('sine', 75, 30, 0.7, { q: 0.25, v: 0.9 })],
  lataria: [tom('square', 520, 380, 0.14, { lp: 3500, q: 0.05, v: 0.5 }), tom('sine', 1650, 1500, 0.25, { q: 0.09, v: 0.25 }), ruido(0.06, { lp: 6000, hp: 1200, q: 0.02, v: 0.6 })],
  pega_fogo: [ruido(0.7, { lp: 300, lp1: 2400, hp: 100, a: 0.12, q: 0.35, v: 0.8 }), ruido(0.6, { ini: 0.1, hp: 2500, lp: 7000, am: 23, amP: 0.8, q: 0.3, v: 0.35 })],
  atropelo: [tom('sine', 130, 50, 0.26, { q: 0.08, v: 0.8 }), ruido(0.2, { lp: 1600, q: 0.07, v: 0.6 }), ruido(0.06, { lp: 7000, hp: 900, q: 0.02, v: 0.5 })],
  buzina: [tom('square', 415, 415, 0.38, { lp: 1800, v: 0.35 }), tom('square', 520, 520, 0.38, { lp: 1800, v: 0.3 })],
  chinelo: [sopro(0.12, { v: 0.5 }), ruido(0.06, { ini: 0.1, lp: 7000, hp: 900, q: 0.015, v: 0.8 })],
  boleto: [ruido(0.28, { lp: 4500, hp: 1500, am: 28, amP: 0.7, q: 0.12, v: 0.6 })],
  carimbo: [tom('sine', 95, 38, 0.28, { q: 0.1, v: 1 }), ruido(0.13, { lp: 900, q: 0.04, v: 0.6 })],
  picole: [tom('sine', 2000, 3300, 0.2, { q: 0.08, v: 0.35 }), ruido(0.26, { hp: 3000, lp: 9000, am: 35, amP: 0.6, q: 0.08, v: 0.5 })],
  moto: [tom('saw', 85, 150, 0.65, { lp: 900, am: 24, amP: 0.5, a: 0.05, q: 0.35, v: 0.6 }), ruido(0.6, { lp: 500, q: 0.3, v: 0.3 })],
  megafone: [tom('tri', 800, 1100, 0.26, { am: 9, amP: 0.5, q: 0.12, v: 0.5 }), tom('square', 200, 200, 0.2, { lp: 900, q: 0.08, v: 0.2 })],
  gato: [ruido(0.3, { hp: 2000, lp: 8000, am: 60, amP: 0.9, q: 0.1, v: 0.6 }), tom('square', 60, 60, 0.3, { lp: 1200, q: 0.1, v: 0.25 })],
  latido: [0, 0.17].map((ini) => tom('saw', 620, 340, 0.12, { ini, lp: 2600, q: 0.05, v: 0.55 })),
  mordida: [ruido(0.06, { lp: 4000, hp: 600, q: 0.02, v: 0.7 }), tom('sine', 300, 150, 0.05, { q: 0.02, v: 0.5 })],
  bola: [tom('sine', 270, 200, 0.11, { q: 0.04, v: 0.8 }), ruido(0.03, { lp: 3000, q: 0.01, v: 0.4 })],
  paredao: [tom('sine', 56, 44, 0.55, { q: 0.25, v: 1 }), tom('sine', 112, 88, 0.3, { q: 0.1, v: 0.4 })],
  grito_funkeiro: [tom('saw', 380, 720, 0.42, { lp: 3000, am: 12, amP: 0.35, a: 0.05, q: 0.2, v: 0.5 })],
  mira: [0, 0.18].map((ini) => tom('sine', 1800, 1800, 0.1, { ini, q: 0.05, v: 0.4 })),
  tiro: [ruido(0.26, { lp: 6000, lp1: 700, hp: 100, q: 0.06, v: 1 }), tom('sine', 150, 60, 0.1, { q: 0.04, v: 0.8 })],
  radio: [ruido(0.42, { hp: 1500, lp: 3500, am: 40, amP: 0.6, q: 0.25, v: 0.45 }), tom('sine', 900, 900, 0.05, { ini: 0.38, q: 0.02, v: 0.4 })],
  urro: [tom('saw', 125, 70, 1.0, { lp: 900, am: 9, amP: 0.4, a: 0.1, q: 0.5, v: 0.7 }), ruido(0.9, { lp: 500, a: 0.1, q: 0.4, v: 0.35 })],
  investida: [ruido(0.65, { lp: 350, lp1: 1300, a: 0.3, q: 0.2, v: 0.6 }), tom('sine', 60, 60, 0.65, { am: 6, amP: 0.9, q: 0.35, v: 0.5 })],
  soco_chao: [tom('sine', 72, 34, 0.42, { q: 0.15, v: 1 }), ruido(0.32, { lp: 800, q: 0.12, v: 0.7 })],
  anilha: [tom('tri', 1500, 1450, 0.5, { q: 0.25, v: 0.3 }), tom('sine', 2300, 2300, 0.4, { q: 0.2, v: 0.15 }), tom('sine', 110, 55, 0.14, { q: 0.05, v: 0.6 })],
  carro_cai: [ruido(0.65, { lp: 3000, lp1: 500, q: 0.2, v: 0.9 }), tom('square', 210, 80, 0.32, { lp: 1500, q: 0.1, v: 0.4 }), tom('sine', 70, 35, 0.4, { q: 0.15, v: 0.8 })],
  cata: [0, 0.12].map((ini) => ruido(0.09, { ini, lp: 3000, hp: 800, q: 0.035, v: 0.5 })),
  roubo: [tom('sine', 800, 1250, 0.11, { q: 0.06, v: 0.45 }), tom('sine', 1250, 800, 0.16, { ini: 0.12, q: 0.08, v: 0.45 })],
  multa: [tom('square', 2600, 2700, 0.32, { lp: 4000, am: 30, amP: 0.5, v: 0.25 })],
  aviso_chao: [tom('tri', 720, 500, 0.26, { q: 0.12, v: 0.5 })],
  crise: [0, 0.25, 0.5, 0.75].map((ini, i) => tom('square', i % 2 ? 660 : 880, i % 2 ? 660 : 880, 0.24, { ini, lp: 3000, v: 0.25 })),
  onda: [ruido(1.6, { lp: 350, lp1: 1600, a: 0.6, q: 0.6, v: 0.8 })],
  apagao: [tom('saw', 130, 38, 0.85, { lp: 700, q: 0.4, v: 0.5 }), ruido(0.03, { hp: 2000, q: 0.01, v: 0.6 })],
  faisca: [ruido(0.2, { hp: 3000, lp: 9000, am: 80, amP: 0.9, q: 0.06, v: 0.7 }), tom('square', 3000, 2400, 0.05, { lp: 6000, q: 0.02, v: 0.25 })],
  chefe: [110, 165, 55].map((f) => tom('saw', f, f, 1.3, { lp: 800, a: 0.05, q: 0.8, v: 0.4 })),
  fase: [tom('saw', 220, 440, 0.5, { lp: 1500, q: 0.25, v: 0.4 }), tom('sine', 90, 40, 0.3, { q: 0.12, v: 0.8 })],
  toque: [tom('sine', 900, 900, 0.045, { q: 0.015, v: 0.6 })],
  carta: [sopro(0.12, { v: 0.5 }), tom('sine', 700, 1050, 0.11, { ini: 0.05, q: 0.05, v: 0.35 })],
  cofre: [tom('tri', 300, 900, 0.6, { a: 0.3, q: 0.25, v: 0.4 }), ...[0.6, 0.7, 0.8].map((ini) => tom('square', 2400, 2400, 0.12, { ini, lp: 6000, q: 0.05, v: 0.2 }))],
  reliquia: [...[523, 659, 784].map((f) => tom('tri', f, f, 1.0, { a: 0.05, q: 0.6, v: 0.3 })), ruido(0.8, { hp: 6000, lp: 12000, q: 0.4, v: 0.12 })],
  passagem: [tom('tri', 400, 800, 0.42, { q: 0.2, v: 0.45 })],
  // ambiente em laço (o tremido fecha um número inteiro de voltas no laço: a emenda não estala)
  amb_orla: [ruido(6, { lp: 650, am: 1 / 3, amP: 0.6, v: 0.6 }), ruido(6, { hp: 2500, lp: 5000, am: 1 / 2, amP: 0.5, v: 0.05 })],
  amb_morro: [ruido(6, { lp: 240, am: 1 / 6, amP: 0.3, v: 0.5 }), tom('sine', 60, 60, 6, { v: 0.05 })],
};

const TAXA = 22050; // os provisórios não precisam de mais que isso

// Sons gravados (docs/som/PEDIDO_SONS.md): id → as variações. Caminhos literais (o build acha pelo texto).
// Um som com arquivo toca o gravado (sorteando a variação); sem arquivo, o provisório feito em código.
// De onde veio cada um (autor e licença): docs/som/CREDITOS_SONS.md.
export const ARQUIVOS = {
  // Firefly (Adobe), 08/11/2026: 5 das 8 pancadas de uma geração (as mais pesadas; original em docs/som/originais/)
  golpe: ['assets/sons/golpe_1.mp3', 'assets/sons/golpe_2.mp3', 'assets/sons/golpe_3.mp3', 'assets/sons/golpe_4.mp3', 'assets/sons/golpe_5.mp3'],
  // CC0 (OpenGameArt), aprovados pelo autor na sala de som em 08/11/2026
  dano: ['assets/sons/dano_1.mp3', 'assets/sons/dano_2.mp3', 'assets/sons/dano_3.mp3', 'assets/sons/dano_4.mp3'],
  morte: ['assets/sons/morte_1.mp3'],
  tapa: ['assets/sons/tapa_1.mp3', 'assets/sons/tapa_2.mp3', 'assets/sons/tapa_3.mp3', 'assets/sons/tapa_4.mp3'],
  morte_horda: ['assets/sons/morte_horda_1.mp3', 'assets/sons/morte_horda_2.mp3', 'assets/sons/morte_horda_3.mp3', 'assets/sons/morte_horda_4.mp3', 'assets/sons/morte_horda_5.mp3'],
  gemido: ['assets/sons/gemido_1.mp3', 'assets/sons/gemido_2.mp3', 'assets/sons/gemido_3.mp3', 'assets/sons/gemido_4.mp3', 'assets/sons/gemido_5.mp3', 'assets/sons/gemido_6.mp3'],
  quebra_plastico: ['assets/sons/quebra_plastico_1.mp3', 'assets/sons/quebra_plastico_2.mp3', 'assets/sons/quebra_plastico_3.mp3'],
  quebra_madeira: ['assets/sons/quebra_madeira_1.mp3', 'assets/sons/quebra_madeira_2.mp3', 'assets/sons/quebra_madeira_3.mp3'],
  baque: ['assets/sons/baque_1.mp3', 'assets/sons/baque_2.mp3'],
  explosao: ['assets/sons/explosao_1.mp3', 'assets/sons/explosao_2.mp3', 'assets/sons/explosao_3.mp3'],
  grito_funkeiro: ['assets/sons/grito_funkeiro_1.mp3', 'assets/sons/grito_funkeiro_2.mp3', 'assets/sons/grito_funkeiro_3.mp3'],
  amb_orla: ['assets/sons/amb_orla_1.mp3'], // estéreo, 30 s, emenda no começo
  // CC0, segunda rodada da sala de som (aprovados pelo autor em 08/11/2026)
  xp: ['assets/sons/xp_1.mp3', 'assets/sons/xp_2.mp3'],
  gorjeta: ['assets/sons/gorjeta_1.mp3', 'assets/sons/gorjeta_2.mp3', 'assets/sons/gorjeta_3.mp3'],
  acorda: ['assets/sons/acorda_1.mp3', 'assets/sons/acorda_2.mp3'],
  tiro: ['assets/sons/tiro_1.mp3', 'assets/sons/tiro_2.mp3'],
  soco_chao: ['assets/sons/soco_chao_1.mp3', 'assets/sons/soco_chao_2.mp3'],
};

/** Amostras do som (Float32Array, pico em 0,9). Sem navegador: dá para conferir nos testes. */
export function sintetizar(id, taxa = TAXA) {
  const camadas = RECEITAS[id];
  if (!camadas) return null;
  let fim = 0;
  for (const c of camadas) fim = Math.max(fim, (c.ini || 0) + c.d);
  const n = Math.ceil(fim * taxa) + 1;
  const out = new Float32Array(n);
  let semente = 0;
  for (let i = 0; i < id.length; i++) semente = (semente * 31 + id.charCodeAt(i)) >>> 0;
  const rnd = () => {
    semente = (semente * 1664525 + 1013904223) >>> 0;
    return semente / 4294967296;
  };
  for (const c of camadas) {
    const s0 = Math.round((c.ini || 0) * taxa);
    const len = Math.round(c.d * taxa);
    const a = c.a ?? 0.005;
    const v = c.v ?? 0.5;
    let fase = 0;
    let lpY = 0;
    let hpY = 0;
    for (let k = 0; k < len && s0 + k < n; k++) {
      const t = k / taxa;
      const u = t / c.d;
      let x;
      if (c.tipo === 'ruido') x = rnd() * 2 - 1;
      else {
        const f = c.f0 * (c.f1 / c.f0) ** u;
        fase += f / taxa;
        const p = fase - Math.floor(fase);
        x = c.tipo === 'sine' ? Math.sin(p * Math.PI * 2) : c.tipo === 'square' ? (p < 0.5 ? 1 : -1) : c.tipo === 'saw' ? p * 2 - 1 : 1 - 4 * Math.abs(p - 0.5);
      }
      if (c.lp) {
        const corte = c.lp1 ? c.lp + (c.lp1 - c.lp) * u : c.lp;
        lpY += (1 - Math.exp((-2 * Math.PI * corte) / taxa)) * (x - lpY);
        x = lpY;
      }
      if (c.hp) {
        hpY += (1 - Math.exp((-2 * Math.PI * c.hp) / taxa)) * (x - hpY);
        x -= hpY;
      }
      if (c.am) x *= 1 - (c.amP ?? 1) * (0.5 - 0.5 * Math.cos(2 * Math.PI * c.am * t));
      let env = t < a ? t / a : c.q ? Math.exp(-(t - a) / c.q) : 1;
      env *= Math.min(1, (c.d - t) / 0.012); // sem estalo no fim
      out[s0 + k] += x * env * v;
    }
  }
  let pico = 0;
  for (let i = 0; i < n; i++) pico = Math.max(pico, Math.abs(out[i]));
  if (pico > 0) for (let i = 0; i < n; i++) out[i] *= 0.9 / pico;
  return out;
}

export class Sons {
  constructor() {
    this.ctx = null;
    this.vol = 0.7;
    this.abafado = false;
    this.calado = false;
    this.buffers = new Map();
    this.vozes = [];
    this.ultimo = {};
    this.amb = { id: null, src: null, g: null };
    this.gemidoT = 1;
    this.gravados = {};
  }

  /** Carrega os sons gravados que existem (os provisórios seguem tocando até eles chegarem). */
  carregarGravados() {
    if (this.pediuGravados || typeof fetch === 'undefined') return;
    this.pediuGravados = true;
    for (const [id, lista] of Object.entries(ARQUIVOS)) {
      for (const src of lista) {
        fetch(src)
          .then((r) => (r.ok ? r.arrayBuffer() : null))
          .then((dados) => dados && this.ctx.decodeAudioData(dados))
          .then((buf) => {
            if (!buf) return;
            (this.gravados[id] ||= []).push(buf);
            // o ambiente já tocava o provisório: troca pelo gravado (com fade)
            if (this.amb.id === id && !this.amb.gravado) {
              this.amb.id = null;
              this.ambiente(id);
            }
          })
          .catch(() => {});
      }
    }
  }

  /** Chamar num toque do jogador: a partir daí o navegador deixa tocar. */
  liberar() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.mestre = this.ctx.createGain();
      // um compressor no fim: muitos sons juntos não estouram
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 6;
      this.mestre.connect(comp);
      comp.connect(this.ctx.destination);
      this.aplicarVolume();
      this.carregarGravados();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  setVolume(v0a100) {
    this.vol = Math.max(0, Math.min(1, v0a100 / 100));
    this.aplicarVolume();
  }

  /** Pausa e menus: o jogo baixa (a interface continua). Anúncio: cala tudo. */
  abafar(sim) {
    if (this.abafado === sim) return;
    this.abafado = sim;
    this.aplicarVolume();
  }

  calar(sim) {
    this.calado = sim;
    this.aplicarVolume();
  }

  aplicarVolume() {
    if (!this.ctx) return;
    const alvo = this.calado ? 0 : this.vol;
    this.mestre.gain.setTargetAtTime(alvo, this.ctx.currentTime, 0.05);
    if (this.amb.g) this.amb.g.gain.setTargetAtTime(this.abafado || this.calado ? 0 : SOM.ambVol * SONS[this.amb.id].vol, this.ctx.currentTime, 0.3);
  }

  buffer(id) {
    const gr = this.gravados[id];
    if (gr && gr.length) return gr[Math.floor(Math.random() * gr.length)];
    let b = this.buffers.get(id);
    if (b) return b;
    const amostras = sintetizar(id);
    if (!amostras) return null;
    b = this.ctx.createBuffer(1, amostras.length, TAXA);
    b.copyToChannel ? b.copyToChannel(amostras, 0) : b.getChannelData(0).set(amostras);
    this.buffers.set(id, b);
    return b;
  }

  /** Toca o som; dx, dy: onde ele está em relação ao Juninho (m). Devolve se tocou. */
  tocar(id, dx = 0, dy = 0) {
    const D = SONS[id];
    if (!this.ctx || !D || this.calado || this.ctx.state !== 'running') return false;
    const agora = this.ctx.currentTime;
    if (agora - (this.ultimo[id] ?? -1) < D.espera) return false;
    this.vozes = this.vozes.filter((v) => v.fim > agora);
    let iguais = 0;
    let fraca = null;
    for (const v of this.vozes) {
      if (v.id === id) iguais++;
      if (!fraca || v.prio < fraca.prio) fraca = v;
    }
    if (iguais >= D.max) return false;
    if (this.vozes.length >= SOM.vozes) {
      if (!fraca || fraca.prio >= D.prio) return false;
      try {
        fraca.src.stop();
      } catch {
        /* já parou */
      }
      this.vozes.splice(this.vozes.indexOf(fraca), 1);
    }
    const buf = this.buffer(id);
    if (!buf) return false;
    const d = Math.hypot(dx, dy);
    const longe = D.perto ? Math.max(SOM.longeMin, 1 - d / SOM.ouvidoM) : 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = 1 + (Math.random() * 2 - 1) * D.varia;
    const g = this.ctx.createGain();
    g.gain.value = D.vol * longe * (this.abafado && D.perto ? 0.3 : 1);
    let saida = g;
    if (D.perto && this.ctx.createStereoPanner) {
      const pan = this.ctx.createStereoPanner();
      pan.pan.value = Math.max(-SOM.panMax, Math.min(SOM.panMax, dx / SOM.panM));
      g.connect(pan);
      saida = pan;
    }
    src.connect(g);
    saida.connect(this.mestre);
    src.start();
    this.ultimo[id] = agora;
    this.vozes.push({ id, prio: D.prio, src, fim: agora + buf.duration / src.playbackRate.value });
    return true;
  }

  /** O ambiente do trecho, em laço (troca com fade). */
  ambiente(id) {
    if (!this.ctx || this.amb.id === id) return;
    const t = this.ctx.currentTime;
    if (this.amb.g) {
      const { src, g } = this.amb;
      g.gain.setTargetAtTime(0, t, 0.5);
      setTimeout(() => {
        try {
          src.stop();
        } catch {
          /* já parou */
        }
      }, 3000);
    }
    this.amb = { id, src: null, g: null };
    const buf = id && this.buffer(id);
    if (!buf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const g = this.ctx.createGain();
    g.gain.value = 0;
    src.connect(g);
    g.connect(this.mestre);
    src.start();
    g.gain.setTargetAtTime(this.abafado || this.calado ? 0 : SOM.ambVol * SONS[id].vol, t, 0.8);
    this.amb = { id, src, g, gravado: !!(this.gravados[id] && this.gravados[id].length) };
  }

  /** Os sons que o jogo pediu neste quadro (game.sons), no lugar de cada um; e a horda gemendo por perto. */
  drenar(game, dt) {
    const p = game.player;
    for (const s of game.sons) this.tocar(s.id, s.x - p.x, s.y - p.y);
    game.sons.length = 0;
    if (!this.ctx || game.over) return;
    this.gemidoT -= dt;
    if (this.gemidoT > 0) return;
    const [a, b] = SOM.gemidoCadaS;
    this.gemidoT = a + Math.random() * (b - a);
    let perto = null;
    let pd = SOM.gemidoM * SOM.gemidoM;
    for (const e of game.enemies) {
      if (e.dead || e.boss) continue;
      const d = (e.x - p.x) ** 2 + (e.y - p.y) ** 2;
      if (d < pd && Math.random() < 0.5) {
        pd = d;
        perto = e;
      }
    }
    if (perto) this.tocar('gemido', perto.x - p.x, perto.y - p.y);
  }
}
