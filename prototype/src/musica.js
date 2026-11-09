// Música de cada trecho (do autor, 07/11/2026): "Pulso da Sobrevivência" na Orla e "Pulsação Urbana" no
// Morro, em laço. Troca com fade quando o Juninho atravessa; abaixa na pausa e cala durante o anúncio.
// Por cima, uma camada que entra aos poucos (misturar): no baile do Morro (D94), "Ela Não Vale Nada" (do autor,
// 09/11/2026) sobe conforme o Juninho chega, e a do trecho desce na mesma medida.
// O baile toca "ao vivo" (pedido do autor): de longe só o grave atravessa as casas, com o eco da rua; chegando, o
// som abre (aoVivo, com SOM.aoVivo). Isso passa pelo Web Audio do motor de som (conectar); se o navegador não deixar
// ler o arquivo por ali, a música toca normal, sem o efeito.
// Só começa depois de um toque (o navegador não deixa tocar antes). Fora do navegador, não faz nada.
import { SOM } from './config.js';

const FAIXAS = {
  orla: 'assets/musica/orla_pulso_da_sobrevivencia.mp3',
  morro: 'assets/musica/morro_pulsacao_urbana.mp3',
  baile: 'assets/musica/baile_ela_nao_vale_nada.mp3',
};
const FADE_S = 1.6; // tempo da troca de uma música para a outra
const PAUSA = 0.35; // na pausa e nos menus, toca mais baixo

export class Musica {
  constructor() {
    this.els = {};
    this.vol = 0.6;
    this.atual = null;
    this.liberada = false;
    this.abafada = false;
    this.calada = false;
    this.silencio = 0; // 0 a 1: perto do Monstrão a música some (D82)
    this.camada = null; // a música que entra por cima (o baile) e o quanto (0 a 1)
    this.camadaK = 0;
    this.ctx = null; // o Web Audio do motor de som (conectar), para o baile ao vivo
    this.podeVivo = null; // o navegador deixa o Web Audio ler o arquivo do baile? (null: ainda não sabe)
    this.vivo = null; // os filtros do baile ao vivo
    this.perto = 0;
  }

  /** O Web Audio do motor de som (sons.js): o baile passa a tocar ao vivo, se o navegador deixar ler o arquivo. */
  conectar(ctx) {
    if (this.ctx || !ctx || typeof fetch === 'undefined') return;
    this.ctx = ctx;
    // o Web Audio só ouve um arquivo de outro endereço se o servidor deixar (CORS); sem isso, sairia mudo: confere antes
    const ab = typeof AbortController !== 'undefined' ? new AbortController() : null;
    fetch(FAIXAS.baile, ab ? { signal: ab.signal } : undefined)
      .then((r) => {
        this.podeVivo = !!r.ok;
        if (ab) ab.abort(); // só queria saber se dá: não baixa o arquivo inteiro aqui
      })
      .catch(() => {
        if (this.podeVivo === null) this.podeVivo = false;
      });
  }

  el(id) {
    if (typeof Audio === 'undefined' || !FAIXAS[id]) return null;
    let a = this.els[id];
    if (!a) {
      const vivo = id === 'baile' && this.ctx && this.podeVivo === true;
      a = new Audio();
      if (vivo) a.crossOrigin = 'anonymous';
      a.src = FAIXAS[id];
      a.loop = true;
      a.preload = 'auto';
      a.volume = 0;
      a._v = 0;
      this.els[id] = a;
      if (vivo) this.montarVivo(a);
    }
    return a;
  }

  /**
   * O baile ao vivo: a faixa → grave reforçado → filtro que abre com a distância → o seco e o eco da rua → volume.
   * O volume vai no último ganho (o do elemento fica em 1).
   */
  montarVivo(a) {
    const ctx = this.ctx;
    const V = SOM.aoVivo;
    try {
      const src = ctx.createMediaElementSource(a);
      const grave = ctx.createBiquadFilter();
      grave.type = 'lowshelf';
      grave.frequency.value = V.graveHz;
      grave.gain.value = V.graveDb[0];
      const filtro = ctx.createBiquadFilter();
      filtro.type = 'lowpass';
      filtro.Q.value = 0.8;
      filtro.frequency.value = V.fechadoHz;
      const seco = ctx.createGain();
      const molhado = ctx.createGain();
      molhado.gain.value = V.eco[0];
      const eco = ctx.createConvolver();
      eco.buffer = ecoDaRua(ctx, V.ecoS);
      const vol = ctx.createGain();
      vol.gain.value = 0;
      src.connect(grave);
      grave.connect(filtro);
      filtro.connect(seco);
      filtro.connect(eco);
      eco.connect(molhado);
      seco.connect(vol);
      molhado.connect(vol);
      vol.connect(ctx.destination);
      this.vivo = { grave, filtro, seco, molhado, vol };
      a.volume = 1;
      a._vivo = true;
      this.aoVivo(this.perto, true);
    } catch {
      this.vivo = null; // sem o efeito: toca normal
    }
  }

  /** O quanto o Juninho está perto do baile (0 longe, 1 na festa): de longe só o grave; perto, o som aberto. */
  aoVivo(perto, ja = false) {
    const k = Math.max(0, Math.min(1, perto || 0));
    if (!ja && Math.abs(k - this.perto) < 0.01) return;
    this.perto = k;
    const v = this.vivo;
    if (!v) return;
    const V = SOM.aoVivo;
    const t = this.ctx.currentTime;
    const q = k ** V.curva; // segura fechado e abre no fim, chegando na esplanada
    v.filtro.frequency.setTargetAtTime(V.fechadoHz * (V.abertoHz / V.fechadoHz) ** q, t, V.suaveS);
    v.grave.gain.setTargetAtTime(V.graveDb[0] + (V.graveDb[1] - V.graveDb[0]) * k, t, V.suaveS);
    v.molhado.gain.setTargetAtTime(V.eco[0] + (V.eco[1] - V.eco[0]) * k, t, V.suaveS);
  }

  /** Chamar num toque do jogador (Começar turno): a partir daí o navegador deixa tocar. */
  liberar() {
    this.liberada = true;
  }

  /** A música do trecho (orla, morro); a outra some com fade. */
  tocar(id) {
    const tem = !!FAIXAS[id];
    if (!tem || id === this.atual) return;
    this.atual = id;
    const a = this.el(id);
    if (a && this.liberada && this.vol > 0) a.play().catch(() => {});
  }

  /** A camada por cima (o baile): k de 0 a 1; a música do trecho toca a (1 - k). */
  misturar(id, k) {
    const v = Math.max(0, Math.min(1, k || 0));
    if (v > 0 && FAIXAS[id]) {
      this.camada = id;
      this.el(id);
    }
    this.camadaK = v;
  }

  /** Quanto da faixa já tocou (s), ou null se ela não está tocando (para a dança bater com a música). */
  tempoDe(id) {
    const a = this.els[id];
    return a && !a.paused && a._v > 0.01 ? a.currentTime : null;
  }

  setVolume(v0a100) {
    this.vol = Math.max(0, Math.min(1, v0a100 / 100));
  }

  abafar(b) {
    this.abafada = b;
  }

  /** Perto do fim da Orla, com o covil aberto: a música vai sumindo (1 = parada). */
  silenciar(k) {
    this.silencio = Math.max(0, Math.min(1, k || 0));
  }

  /** Durante o anúncio: sem música. */
  calar(b) {
    this.calada = b;
  }

  update(dt) {
    const k = Math.min(1, dt / FADE_S);
    const base = this.calada ? 0 : this.vol * SOM.musica * (this.abafada ? PAUSA : 1);
    for (const [id, a] of Object.entries(this.els)) {
      let alvo = 0;
      if (id === this.camada) alvo = base * this.camadaK;
      else if (id === this.atual) alvo = base * (1 - this.silencio) * (1 - (this.camada ? this.camadaK : 0));
      a._v += (alvo - a._v) * Math.min(1, k * 3);
      if (Math.abs(alvo - a._v) < 0.004) a._v = alvo;
      if (a._vivo) {
        if (Math.abs(this.vivo.vol.gain.value - a._v) > 0.001) this.vivo.vol.gain.setTargetAtTime(Math.max(0, Math.min(1, a._v)), this.ctx.currentTime, 0.05);
      } else a.volume = Math.max(0, Math.min(1, a._v));
      if (a._v <= 0.001 && !a.paused && alvo === 0) a.pause();
      else if (alvo > 0 && a.paused && this.liberada) a.play().catch(() => {});
    }
  }
}

/**
 * O eco da rua para o baile ao vivo: ruído que cai aos poucos (s de cauda), um pouco diferente em cada ouvido, com
 * as primeiras batidas nas paredes das casas (os ecos curtos do começo).
 */
function ecoDaRua(ctx, s) {
  const n = Math.max(1, Math.round(ctx.sampleRate * s));
  const b = ctx.createBuffer(2, n, ctx.sampleRate);
  let x = 12345;
  const rnd = () => {
    x = (x * 1103515245 + 12345) >>> 0;
    return x / 4294967296;
  };
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    for (let i = 0; i < n; i++) d[i] = (rnd() * 2 - 1) * Math.exp((-4.5 * i) / n) * 0.35;
    for (const ms of c ? [23, 61, 97, 140] : [31, 54, 88, 131]) {
      const i = Math.round((ms / 1000) * ctx.sampleRate);
      if (i < n) d[i] += 0.5 * Math.exp((-3 * i) / n);
    }
  }
  return b;
}
