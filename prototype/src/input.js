// Entrada: joystick virtual (flutuante ou fixo) + teclado para testes no desktop.
const RADIUS = 52; // px
const DEAD = 6;

export class Input {
  constructor(layer, baseEl, knobEl) {
    this.layer = layer;
    this.baseEl = baseEl;
    this.knobEl = knobEl;
    this.mode = 'floating';
    this.vec = { x: 0, y: 0 };
    this.pointerId = null;
    this.origin = { x: 0, y: 0 };
    this.keys = new Set();
    this.fixedPos = { x: 96, y: 0 };
    this.touchedOnce = false;

    layer.addEventListener('pointerdown', (e) => this.down(e));
    layer.addEventListener('pointermove', (e) => this.move(e));
    layer.addEventListener('pointerup', (e) => this.up(e));
    layer.addEventListener('pointercancel', (e) => this.up(e));
    // o celular às vezes engole o "soltou" (print, barra de notificação, gesto do sistema): sem isso o
    // controle ficava preso num dedo que não existe mais e o Juninho parava de andar
    layer.addEventListener('lostpointercapture', (e) => this.up(e));
    if (typeof window === 'undefined') return;
    window.addEventListener('pointerup', (e) => this.up(e));
    window.addEventListener('pointercancel', (e) => this.up(e));
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => this.reset());
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.reset();
      });
    }
  }

  setMode(mode, viewH, bottomInset) {
    this.mode = mode;
    this.fixedPos = { x: 96, y: viewH - bottomInset - 96 };
    this.reset();
  }

  reset() {
    this.pointerId = null;
    this.vec.x = 0;
    this.vec.y = 0;
    this.keys.clear();
    this.render(false);
  }

  local(e) {
    const r = this.layer.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  down(e) {
    // um toque novo sempre assume o controle (o dedo antigo pode ter soltado sem avisar)
    const q = this.local(e);
    if (this.mode === 'fixed') {
      const d = Math.hypot(q.x - this.fixedPos.x, q.y - this.fixedPos.y);
      if (d > RADIUS * 2.2) return;
      this.origin.x = this.fixedPos.x;
      this.origin.y = this.fixedPos.y;
    } else {
      this.origin.x = q.x;
      this.origin.y = q.y;
    }
    this.pointerId = e.pointerId;
    this.touchedOnce = true;
    try {
      this.layer.setPointerCapture(e.pointerId);
    } catch {
      /* ignora */
    }
    this.move(e);
    e.preventDefault();
  }

  move(e) {
    if (e.pointerId !== this.pointerId) return;
    const q = this.local(e);
    let dx = q.x - this.origin.x;
    let dy = q.y - this.origin.y;
    const d = Math.hypot(dx, dy);
    if (this.mode === 'floating' && d > RADIUS) {
      // a base "segue" o dedo: arrastar longe não trava o controle
      const k = (d - RADIUS) / d;
      this.origin.x += dx * k;
      this.origin.y += dy * k;
      dx = q.x - this.origin.x;
      dy = q.y - this.origin.y;
    }
    const dd = Math.min(RADIUS, Math.hypot(dx, dy));
    if (dd < DEAD) {
      this.vec.x = 0;
      this.vec.y = 0;
    } else {
      const l = Math.hypot(dx, dy);
      this.vec.x = (dx / l) * (dd / RADIUS);
      this.vec.y = (dy / l) * (dd / RADIUS);
    }
    this.render(true, (dx / (Math.hypot(dx, dy) || 1)) * dd, (dy / (Math.hypot(dx, dy) || 1)) * dd);
    e.preventDefault();
  }

  up(e) {
    if (e.pointerId !== this.pointerId) return;
    this.pointerId = null;
    this.vec.x = 0;
    this.vec.y = 0;
    this.render(false);
  }

  render(active, kx = 0, ky = 0) {
    const show = active || this.mode === 'fixed';
    this.baseEl.hidden = !show;
    if (!show) return;
    const ox = active ? this.origin.x : this.fixedPos.x;
    const oy = active ? this.origin.y : this.fixedPos.y;
    this.baseEl.style.transform = `translate(${ox - RADIUS}px, ${oy - RADIUS}px)`;
    this.baseEl.classList.toggle('is-active', active);
    this.knobEl.style.transform = `translate(${kx}px, ${ky}px)`;
  }

  /** Vetor final em coordenadas de tela (x para a direita, y para baixo), magnitude 0–1. */
  read() {
    if (this.pointerId !== null) return this.vec;
    let x = 0;
    let y = 0;
    const k = this.keys;
    if (k.has('a') || k.has('arrowleft')) x -= 1;
    if (k.has('d') || k.has('arrowright')) x += 1;
    if (k.has('w') || k.has('arrowup')) y -= 1;
    if (k.has('s') || k.has('arrowdown')) y += 1;
    const l = Math.hypot(x, y);
    if (l > 0) {
      x /= l;
      y /= l;
    }
    return { x, y };
  }
}
