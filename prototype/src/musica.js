// Música de cada trecho (do autor, 07/11/2026): "Pulso da Sobrevivência" na Orla e "Pulsação Urbana" no
// Morro, em laço. Troca com fade quando o Juninho atravessa; abaixa na pausa e cala durante o anúncio.
// Só começa depois de um toque (o navegador não deixa tocar antes). Fora do navegador, não faz nada.
import { SOM } from './config.js';

const FAIXAS = {
  orla: 'assets/musica/orla_pulso_da_sobrevivencia.mp3',
  morro: 'assets/musica/morro_pulsacao_urbana.mp3',
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

  setVolume(v0a100) {
    this.vol = Math.max(0, Math.min(1, v0a100 / 100));
  }

  abafar(b) {
    this.abafada = b;
  }

  /** Durante o anúncio: sem música. */
  calar(b) {
    this.calada = b;
  }

  update(dt) {
    const k = Math.min(1, dt / FADE_S);
    for (const [id, a] of Object.entries(this.els)) {
      const alvo = id === this.atual && !this.calada ? this.vol * SOM.musica * (this.abafada ? PAUSA : 1) : 0;
      a._v += (alvo - a._v) * Math.min(1, k * 3);
      if (Math.abs(alvo - a._v) < 0.004) a._v = alvo;
      a.volume = Math.max(0, Math.min(1, a._v));
      if (a._v <= 0.001 && !a.paused && alvo === 0) a.pause();
      else if (alvo > 0 && a.paused && this.liberada) a.play().catch(() => {});
    }
  }
}
