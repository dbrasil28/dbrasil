// Figurantes (D55, config.js FIGURANTES): a garota da esquina, a PM do pé do morro, a tropa nas vielas e o
// picolezeiro da areia. Gente de ambiente: anda um pouco em volta do lugar dela, reage à horda chegando e não
// luta (ninguém bate nem é atingido). Sem DOM.
import { FIGURANTES } from './config.js';

const tmp = [];
const sorteio = (game, [a, b]) => a + game.fxRng() * (b - a);

export function updateFigurantes(game, dt) {
  const w = game.world;
  if (!w || !w.figurantes) return;
  const F = FIGURANTES;
  const p = game.player;
  for (const f of w.figurantes) {
    if (Math.abs(f.y - p.y) > F.vistaM) continue;
    if (f.poseT > 0) {
      f.poseT -= dt;
      if (f.poseT <= 0) f.pose = null;
    }
    // a horda chegando: vira para quem está mais perto (raiva; o policial mira; colada, pose de ataque)
    const R = F.reageM[f.tipo];
    game.hash.query(f.x, f.y, R, tmp);
    let e = null;
    let d2 = R * R;
    for (const q of tmp) {
      if (q.dead) continue;
      const d = (q.x - f.x) ** 2 + (q.y - f.y) ** 2;
      if (d < d2) {
        d2 = d;
        e = q;
      }
    }
    if (e) {
      const l = Math.sqrt(d2) || 1;
      f.dirX = (e.x - f.x) / l;
      f.dirY = (e.y - f.y) / l;
      const armado = f.tipo === 'pm' || f.tipo === 'tropa';
      f.pose = armado || d2 < F.pertoM * F.pertoM ? 'ataque' : 'raiva';
      f.poseT = 0.5;
      f.anda = false;
      continue;
    }
    if (f.pose) continue; // acabando a pose
    if (f.tipo === 'picole') {
      f.gritoT -= dt;
      if (f.gritoT <= 0) {
        f.gritoT = sorteio(game, F.gritoCadaS);
        f.pose = 'raiva'; // a mão na boca, gritando
        f.poseT = F.gritoS;
        f.anda = false;
        f.dirX = 0;
        f.dirY = 1;
        game.word(f.x, f.y - 1.4, F.grito, '#fff2c0');
        continue;
      }
    }
    if (f.pausa > 0) {
      f.pausa -= dt;
      f.anda = false;
      continue;
    }
    if (!f.alvo) {
      if (f.tipo === 'picole') f.alvo = { x: f.ax, y: Math.abs(f.y - f.ya) < Math.abs(f.y - f.yb) ? f.yb : f.ya }; // vai e volta
      else {
        const a = game.fxRng() * Math.PI * 2;
        const r = F.raioM[f.tipo] * Math.sqrt(game.fxRng());
        f.alvo = { x: f.ax + Math.cos(a) * r, y: f.ay + Math.sin(a) * r };
      }
    }
    const dx = f.alvo.x - f.x;
    const dy = f.alvo.y - f.y;
    const l = Math.hypot(dx, dy);
    const passo = F.passoMS * dt;
    if (l <= passo) {
      f.x = f.alvo.x;
      f.y = f.alvo.y;
      f.alvo = null;
      f.anda = false;
      f.pausa = sorteio(game, F.pausaS);
      if (f.tipo !== 'picole') {
        f.dirX = 0; // parado, olha para a rua (de frente)
        f.dirY = 1;
      }
      continue;
    }
    f.x += (dx / l) * passo;
    f.y += (dy / l) * passo;
    f.dirX = dx / l;
    f.dirY = dy / l;
    f.walk += passo * 4.4; // um ciclo de 6 quadros a cada ~1,4 m
    f.anda = true;
  }
}
