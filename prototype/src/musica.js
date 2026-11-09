// Música de cada trecho (do autor, 07/11/2026): "Pulso da Sobrevivência" na Orla e "Pulsação Urbana" no
// Morro, em laço. Troca com fade quando o Juninho atravessa; abaixa na pausa e cala durante o anúncio.
// Por cima, uma camada que entra aos poucos (misturar): no baile do Morro (D94), "Ela Não Vale Nada" (do autor,
// 09/11/2026) sobe conforme o Juninho chega, e a do trecho desce na mesma medida.
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
  }

  el(id) {
    if (typeof Audio === 'undefined' || !FAIXAS[id]) return null;
    let a = this.els[id];
    if (!a) {
      a = new Audio(FAIXAS[id]);
      a.loop = true;
      a.preload = 'auto';
      a.volume = 0;
      a._v = 0;
      this.els[id] = a;
    }
    return a;
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
      a.volume = Math.max(0, Math.min(1, a._v));
      if (a._v <= 0.001 && !a.paused && alvo === 0) a.pause();
      else if (alvo > 0 && a.paused && this.liberada) a.play().catch(() => {});
    }
  }
}
