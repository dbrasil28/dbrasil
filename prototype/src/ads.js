// Publicidade. Duas camadas:
//  1. Provedor: quem mostra o anúncio. No protótipo é SIMULADO (tela própria com contagem).
//     No app (Capacitor + AdMob) entra um provedor real com a mesma interface:
//       { kind, start(), showInterstitial(): Promise<boolean>,
//         rewarded: { ready(): boolean, show(): Promise<boolean> } | null }
//  2. Ads: regras de frequência, pontos de anúncio (placements) e registro para métricas.
import { ADS } from './config.js';

/** Regra pura (testável no Node): pode mostrar um intersticial agora? */
export function interstitialAllowed(state, nowSec, cfg = ADS.interstitial) {
  if (!state.enabled || state.noAds) return false;
  if (state.runsEnded <= cfg.graceRuns) return false; // nunca depois da 1ª partida da sessão
  if (nowSec - state.lastInterstitialAt < cfg.minGapSec) return false;
  if (nowSec - state.lastRewardedAt < cfg.skipAfterRewardedSec) return false; // quem acabou de ver um anúncio não leva outro
  return true;
}

// Marcas fictícias do universo do jogo, para o espaço do anúncio não parecer parte da partida.
const MOCK_ADS = [
  { brand: 'Construtora Especula & Filhos', line: 'Seu bairro, nosso condomínio.', cta: 'Conheça o decorado', hue: 38 },
  { brand: 'Banco Juros Amigos', line: 'Crédito na hora. A parcela, para sempre.', cta: 'Simular parcela', hue: 140 },
  { brand: 'App Entrega Já', line: 'Seja seu próprio patrão. A taxa é por nossa conta (sua).', cta: 'Quero me cadastrar', hue: 4 },
  { brand: 'Coach Fênix Milionária', line: 'Fique rico em 7 dias ou faça o curso de novo.', cta: 'Mudar de vida', hue: 268 },
];

/** Provedor simulado: desenha um "anúncio" de mentira por cima do jogo. */
export function createMockProvider(layer, getLengthSec) {
  let rot = 0;
  let busy = false;

  function present(rewarded) {
    if (busy) return Promise.resolve(false);
    busy = true;
    const total = getLengthSec();
    const skipAt = Math.min(total, ADS.interstitial.skippableAfterSec);
    const ad = MOCK_ADS[rot++ % MOCK_ADS.length];
    const started = performance.now() / 1000;

    return new Promise((resolve) => {
      layer.hidden = false;
      layer.style.setProperty('--ad-hue', ad.hue);
      layer.innerHTML = `
        <div class="ad-top">
          <span class="ad-label">ANÚNCIO SIMULADO</span>
          <span class="ad-timer" aria-live="polite"></span>
        </div>
        <div class="ad-body">
          <div class="ad-art" aria-hidden="true"><i></i><i></i><i></i></div>
          <p class="ad-brand"></p>
          <p class="ad-line"></p>
          <span class="ad-cta"></span>
        </div>
        <div class="ad-bottom">
          <div class="ad-progress"><i></i></div>
          <div class="ad-actions"></div>
          <p class="ad-note">Protótipo: no app, este espaço é do anúncio da rede (AdMob).</p>
        </div>`;
      layer.querySelector('.ad-brand').textContent = ad.brand;
      layer.querySelector('.ad-line').textContent = ad.line;
      layer.querySelector('.ad-cta').textContent = ad.cta;
      const timer = layer.querySelector('.ad-timer');
      const bar = layer.querySelector('.ad-progress i');
      const actions = layer.querySelector('.ad-actions');

      let done = false;
      let raf = 0;
      const finish = (ok) => {
        if (done) return;
        done = true;
        cancelAnimationFrame(raf);
        layer.hidden = true;
        layer.textContent = '';
        busy = false;
        resolve(ok);
      };
      const button = (label, cls, fn) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `btn ${cls}`;
        b.textContent = label;
        b.addEventListener('click', fn);
        actions.appendChild(b);
        return b;
      };

      const giveUp = rewarded ? button('Desistir (sem recompensa)', 'btn-ghost', () => finish(false)) : null;
      let closeShown = false;
      const tick = () => {
        const el = performance.now() / 1000 - started;
        const left = Math.max(0, Math.ceil(total - el));
        bar.style.transform = `scaleX(${Math.min(1, el / total).toFixed(3)})`;
        if (rewarded) {
          timer.textContent = left > 0 ? `Recompensa em ${left} s` : 'Recompensa liberada';
          if (left === 0 && !closeShown) {
            closeShown = true;
            giveUp?.remove();
            button('Receber recompensa', 'btn-primary', () => finish(true)).focus({ preventScroll: true });
          }
        } else {
          timer.textContent = el < skipAt ? `Fechar em ${Math.ceil(skipAt - el)} s` : '';
          if (el >= skipAt && !closeShown) {
            closeShown = true;
            button('Fechar anúncio', 'btn-primary', () => finish(true)).focus({ preventScroll: true });
          }
        }
        if (!done) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
  }

  return {
    kind: 'simulado',
    start: () => Promise.resolve(),
    showInterstitial: () => present(false),
    rewarded: { ready: () => !busy, show: () => present(true) },
  };
}

export class Ads {
  constructor(provider) {
    this.provider = provider;
    this.state = { enabled: true, noAds: false, runsEnded: 0, lastInterstitialAt: -Infinity, lastRewardedAt: -Infinity };
    this.log = [];
  }

  configure(settings) {
    this.state.enabled = !!settings.ads;
    this.state.noAds = !!settings.noAds;
  }

  get enabled() {
    return this.state.enabled;
  }

  /** Vídeos com recompensa continuam disponíveis mesmo com "Sem anúncios" comprado. */
  rewardedAvailable() {
    return this.state.enabled && !!this.provider.rewarded?.ready();
  }

  now() {
    return performance.now() / 1000;
  }

  runEnded() {
    this.state.runsEnded++;
  }

  canShowInterstitial() {
    return interstitialAllowed(this.state, this.now());
  }

  async showRewarded(placement) {
    const r = this.provider.rewarded;
    if (!this.state.enabled || !r) return false;
    const t0 = this.now();
    let ok = false;
    try {
      ok = await r.show();
    } catch {
      ok = false;
    }
    if (ok) this.state.lastRewardedAt = this.now();
    this.log.push({ tipo: 'recompensado', ponto: placement, completo: ok, segundos: Math.round(this.now() - t0) });
    return ok;
  }

  async showInterstitial(placement) {
    if (!this.canShowInterstitial()) return false;
    let shown = false;
    try {
      shown = await this.provider.showInterstitial();
    } catch {
      shown = false;
    }
    this.state.lastInterstitialAt = this.now();
    this.log.push({ tipo: 'intersticial', ponto: placement, completo: shown });
    return shown;
  }

  summary() {
    const out = { provedor: this.provider.kind, partidas_encerradas: this.state.runsEnded, intersticiais: 0, recompensados_assistidos: 0, recompensados_abandonados: 0 };
    for (const e of this.log) {
      if (e.tipo === 'intersticial') out.intersticiais++;
      else if (e.completo) out.recompensados_assistidos++;
      else out.recompensados_abandonados++;
    }
    out.eventos = this.log;
    return out;
  }
}
