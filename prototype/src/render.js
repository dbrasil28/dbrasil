// Renderização em Canvas 2D. "Arena cinza" da Fase 0: formas simples, mas com
// silhuetas distintas por família, para testar leitura em tela pequena.
import { ENEMIES, WAKE } from './config.js';
import { images, SpriteCache, crowdImage, ENEMY_ART, ICON_ART, drawFit, ATLAS, atlasRow } from './sprites.js';
import { OrlaLayer, drawImageProp } from './mapa.js';

const pt = { x: 0, y: 0 };
const pt2 = { x: 0, y: 0 };
const bounds = {};
const propsTmp = [];

const COLORS = {
  groundA: '#3a383d',
  groundB: '#343237',
  groundLine: 'rgba(255,255,255,0.035)',
  shadow: 'rgba(0,0,0,0.38)',
  player: '#e5252f',
  playerDark: '#8f1018',
  skin: '#c98d64',
  telespectador: ['#9a8a5a', '#6f7f62', '#7d6a8a', '#8a6f5e'],
  hypno: '#8fb4ff', // brilho de tela no rosto
  burocrata: '#5f6f86',
  golpista: '#2b2633',
  neon: '#36f0e0',
  politico: '#1e2740',
  gold: '#e8b62c',
  rival: '#f07a1a',
  boss: '#2c2a30',
  hardhat: '#ffd21f',
  paper: '#f2efe8',
  blood: '#a3121b',
  bloodDark: 'rgba(90,6,12,0.55)',
};

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.dpr = 1;
    this.w = 0;
    this.h = 0;
    this.sprites = new Map();
    this.spriteKey = '';
    this.shakeT = 0;
    this.shakeAmp = 0;
    this.flashT = 0;
    this.cache = new SpriteCache();
    this.orla = new OrlaLayer();
  }

  resize(w, h, dpr) {
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.sprites.clear();
    this.cache.clear(dpr);
    this.orla.clear();
    this.vignette = null;
  }

  addShake(amount, enabled) {
    if (!enabled) return;
    this.shakeAmp = Math.min(14, this.shakeAmp + amount * 14);
    this.shakeT = 0.25;
  }

  flash(enabled) {
    this.flashT = enabled ? 0.35 : 0.12;
    this.flashStrong = enabled;
  }

  // ---------- sprites pré-desenhados (1 drawImage por unidade) ----------
  sprite(kind, variant, heightPx, flash) {
    const key = `${kind}|${variant}|${Math.round(heightPx)}|${flash ? 1 : 0}`;
    let c = this.sprites.get(key);
    if (c) return c;
    const scale = this.dpr;
    const H = heightPx;
    const W = H * (kind === 'especulador' ? 1.0 : 0.8);
    c = makeCanvas(Math.ceil((W + 8) * scale), Math.ceil((H + 8) * scale));
    const g = c.getContext('2d');
    g.scale(scale, scale);
    g.translate((W + 8) / 2, H + 4);
    drawPuppet(g, kind, variant, W, H, flash);
    c.ox = (W + 8) / 2;
    c.oy = H + 4;
    c.cssW = W + 8;
    c.cssH = H + 8;
    this.sprites.set(key, c);
    return c;
  }

  draw(game, settings, perf) {
    const { ctx, dpr } = this;
    const cam = game.camera;
    const ppu = cam.ppu;
    const playerPx = settings.playerPct / 100 * (cam.playBottom - cam.playTop);
    const enemyMul = settings.enemyPct / 100;
    this.enemyMul = enemyMul;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let sx = 0;
    let sy = 0;
    if (this.shakeT > 0) {
      this.shakeT -= perf.dt;
      sx = (Math.random() - 0.5) * this.shakeAmp;
      sy = (Math.random() - 0.5) * this.shakeAmp;
      this.shakeAmp *= 0.88;
    }
    ctx.translate(sx, sy);

    if (game.map.bounded) {
      cam.visibleWorldBounds(1, bounds);
      this.orla.draw(ctx, game, bounds, this.dpr);
    } else this.drawGround(ctx, game);

    // manchas no chão
    if (settings.gore) {
      ctx.fillStyle = COLORS.bloodDark;
      for (const d of game.fx.decals) {
        cam.toScreen(d.x, d.y, pt);
        const a = d.t > 7 ? 1 - (d.t - 7) / 3 : 1;
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y, d.r * ppu, d.r * ppu * cam.k * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    this.drawZones(ctx, game, ppu);

    // lista de desenho com ordenação por profundidade
    const list = [];
    cam.visibleWorldBounds(3, bounds);
    for (const pr of game.propsInBounds(bounds, propsTmp)) list.push({ d: cam.depth(pr.x, pr.y), k: 'prop', o: pr });
    for (const g of game.gems) list.push({ d: cam.depth(g.x, g.y) - 0.5, k: 'gem', o: g });
    for (const p of game.pickups) list.push({ d: cam.depth(p.x, p.y) - 0.4, k: 'pickup', o: p });
    for (const e of game.enemies) list.push({ d: cam.depth(e.x, e.y), k: 'enemy', o: e });
    list.push({ d: cam.depth(game.player.x, game.player.y), k: 'player', o: game.player });
    for (const p of game.projectiles) list.push({ d: cam.depth(p.x, p.y) + 0.3, k: 'proj', o: p });
    for (const s of game.enemyShots) list.push({ d: cam.depth(s.x, s.y) + 0.3, k: 'shot', o: s });
    list.sort((a, b) => a.d - b.d);

    const t = game.t;
    for (const it of list) {
      const o = it.o;
      cam.toScreen(o.x, o.y, pt);
      if (pt.x < -80 || pt.x > this.w + 80 || pt.y < -120 || pt.y > this.h + 120) continue;
      switch (it.k) {
        case 'prop':
          if (o.type === 'poste' && images.poste) drawImageProp(ctx, images.poste, pt, ppu * 4.6);
          else if (o.type === 'cone' && images.cone) drawImageProp(ctx, images.cone, pt, ppu * 0.75);
          else drawProp(ctx, o, pt, ppu, cam.k);
          break;

        case 'gem':
          drawGem(ctx, o, pt, ppu, t);
          break;
        case 'pickup':
          drawPickup(ctx, o, pt, ppu, t);
          break;
        case 'enemy': {
          const def = ENEMIES[o.type];
          const h = playerPx * def.size * enemyMul;
          const variant = o.type === 'telespectador' ? o.tint : 0;
          // de frente quando desce na direção da câmera (está acima do jogador), de costas quando sobe;
          // com folga para não ficar trocando. O espelhamento é fixo por pessoa (variedade).
          const dyp = game.player.y - o.y;
          if (o.front === undefined) o.front = dyp >= 0;
          else if (dyp > 0.8) o.front = true;
          else if (dyp < -0.8) o.front = false;
          if (o.flipFix === undefined) o.flipFix = ((o.id * 2654435761) >>> 0) % 2 === 0;
          let spr = null;
          if (o.type === 'telespectador') {
            spr = this.cache.get(crowdImage(o.tint, o.id, o.front), h, { flip: o.flipFix, flash: o.flash > 0, hypno: true });
          } else if (ENEMY_ART[o.type]) {
            const art = ENEMY_ART[o.type];
            const img = o.front && art.front && images[art.front] ? art.front : art.img;
            spr = this.cache.get(img, h, { ...art, flip: o.flipFix, flash: o.flash > 0 });
          }
          if (!spr) spr = this.sprite(o.type === 'isca' ? 'golpista' : o.type, variant, h, o.flash > 0);
          o.stepPhase = o.stepPhase ?? (o.id % 7) * 0.9;
          const bob = Math.abs(Math.sin(o.walk)) * h * 0.035;
          if (o.type === 'isca' || o.type === 'golpista') {
            // brilho de "perfil falso": original e iscas piscam igual
            ctx.globalAlpha = 0.82 + Math.sin(t * 20 + o.id) * 0.18;
          }
          if (o.elite) drawEliteRing(ctx, pt, ppu, cam.k, o, t);
          // passada: o corpo balança a partir dos pés (os recortes têm uma pose só)
          const sw = Math.sin(o.walk * 1.6 + o.stepPhase);
          ctx.save();
          ctx.translate(pt.x, pt.y - bob);
          ctx.rotate(sw * (o.boss ? 0.03 : 0.075));
          ctx.scale(1, 1 + Math.abs(sw) * 0.03);
          ctx.drawImage(spr, -spr.ox, -spr.oy, spr.cssW, spr.cssH);
          ctx.restore();
          ctx.globalAlpha = 1;
          if (o.type === 'burocrata' && o.windup > 0) {
            ctx.fillStyle = COLORS.paper;
            ctx.font = `900 ${Math.max(11, h * 0.3)}px "Barlow Semi Condensed", "Arial Narrow", sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('!', pt.x, pt.y - h - 4);
          }
          if (o.elite && !o.boss) drawHpPip(ctx, pt, h, o.hp / o.maxHp);
          break;
        }
        case 'player': {
          // anel no chão: separa o protagonista da multidão (GDD 04, §5)
          ctx.fillStyle = 'rgba(229,37,47,0.22)';
          ctx.strokeStyle = 'rgba(255,74,82,0.95)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(pt.x, pt.y, (o.r + 0.32) * ppu, (o.r + 0.32) * ppu * cam.k, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          this.drawPlayer(ctx, game, pt, playerPx, 1);
          break;
        }
        case 'proj':
          drawProjectile(ctx, o, pt, ppu, cam, playerPx);
          break;
        case 'shot':
          drawPaper(ctx, pt, ppu, o.spin, playerPx);
          break;
        default:
          break;
      }
    }

    // silhueta do protagonista por cima de quem estiver na frente dele
    cam.toScreen(game.player.x, game.player.y, pt);
    this.drawPlayer(ctx, game, pt, playerPx, 0.38);

    this.drawFx(ctx, game, ppu, playerPx);
    this.drawLotsLabels(ctx, game);

    if (game.map.bounded) {
      if (!this.vignette) {
        const vc = makeCanvas(Math.ceil(this.w / 2), Math.ceil(this.h / 2));
        const vgc = vc.getContext('2d');
        const vg = vgc.createRadialGradient(vc.width / 2, vc.height / 2, vc.height * 0.25, vc.width / 2, vc.height / 2, vc.height * 0.75);
        vg.addColorStop(0, 'rgba(255,170,80,0)');
        vg.addColorStop(1, 'rgba(30,10,20,0.45)');
        vgc.fillStyle = vg;
        vgc.fillRect(0, 0, vc.width, vc.height);
        this.vignette = vc;
      }
      ctx.drawImage(this.vignette, -20, -20, this.w + 40, this.h + 40);
    }
    if (this.flashT > 0) {
      this.flashT -= perf.dt;
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0, this.flashT) * (this.flashStrong ? 1.6 : 0.5)})`;
      ctx.fillRect(-20, -20, this.w + 40, this.h + 40);
    }
    if (game.player.hurtT > 0) {
      ctx.fillStyle = 'rgba(200,0,20,0.10)';
      ctx.fillRect(-20, -20, this.w + 40, this.h + 40);
    }
  }

  drawPlayer(ctx, game, pt, playerPx, alpha) {
    const p = game.player;
    // ao levar dano, pisca em vermelho (não em branco, para não sumir na horda)
    const hurtBlink = p.hurtT > 0 && Math.floor(game.t * 16) % 2 === 0;
    let img = null;
    if (images.ja_0_0) {
      // TESTE do atlas: direção pela mira durante o arremesso, senão pelo movimento
      const aiming = p.throwT < 0.6 || p.catchT < 0.25 || p.helmetsOut > 0;
      const fx = aiming ? p.aimX : p.faceX;
      const fy = aiming ? p.aimY : p.faceY;
      const cam = game.camera;
      cam.toScreen(p.x + fx, p.y + fy, pt2);
      const row = atlasRow(pt2.x - pt.x, pt2.y - pt.y);
      let frame = 0; // capacete na mão
      if (p.throwT < 0.08) frame = 1; // arma o braço
      else if (p.throwT < 0.2) frame = 2; // solta
      else if (p.catchT < 0.09) frame = 4; // estende para pegar
      else if (p.catchT < 0.22) frame = 5; // pegou
      else if (p.helmetsOut > 0) frame = 3; // mãos livres, capacete em voo
      img = this.cache.get(`ja_${row}_${frame}`, playerPx * (ATLAS.ch / ATLAS.figureH), {
        mode: hurtBlink ? 'hurt' : '', tint: game.corruption >= 50 ? [232, 182, 44, 0.22] : null, noShadow: true,
      });
      if (img) {
        const invulnBlink = p.invulnT > 0 && Math.floor(game.t * 12) % 2 === 0 ? 0.45 : 1;
        ctx.globalAlpha = alpha * invulnBlink;
        this.drawPlayerAtlas(ctx, img, pt, playerPx * (ATLAS.ch / ATLAS.figureH), p, row, game);
        ctx.globalAlpha = 1;
        return;
      }
    }
    if (!img) {
      img = this.cache.get('juninho', playerPx, {
        flip: p.faceX < 0, mode: hurtBlink ? 'hurt' : '', tint: game.corruption >= 50 ? [232, 182, 44, 0.22] : null,
      });
    }
    const spr = img || this.sprite(game.corruption >= 50 ? 'playerGold' : 'player', p.faceX < 0 ? 1 : 0, playerPx, hurtBlink);
    const bob = p.moving ? Math.abs(Math.sin(game.t * 11)) * playerPx * 0.04 : 0;
    const invulnBlink = p.invulnT > 0 && Math.floor(game.t * 12) % 2 === 0 ? 0.45 : 1;
    ctx.globalAlpha = alpha * invulnBlink;
    if (img && p.moving) {
      // passada: leve balanço do corpo a partir dos pés
      ctx.save();
      ctx.translate(pt.x, pt.y - bob);
      ctx.rotate(Math.sin(game.t * 11) * 0.06);
      ctx.drawImage(spr, -spr.ox, -spr.oy, spr.cssW, spr.cssH);
      ctx.restore();
    } else ctx.drawImage(spr, pt.x - spr.ox, pt.y - spr.oy - bob, spr.cssW, spr.cssH);
    ctx.globalAlpha = 1;
  }

  /**
   * Desenha o Juninho do atlas com passada mecânica: o sprite é cortado na cintura e cada perna
   * gira a partir do quadril, em fases opostas. De frente/costas, as pernas alternam altura
   * (joelho sobe) em vez de abrir para os lados. Provisório até existir a folha de caminhada.
   */
  drawPlayerAtlas(ctx, spr, pt, h, p, row, game) {
    const shW = h * 0.26;
    ctx.fillStyle = 'rgba(0,0,0,0.38)';
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y - 1, shW, shW * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    const x0 = pt.x - spr.ox;
    const y0 = pt.y - spr.oy;
    if (!p.moving) {
      ctx.drawImage(spr, x0, y0, spr.cssW, spr.cssH);
      return;
    }
    const top = pt.y - h; // topo da célula
    const hipY = top + h * ATLAS.hipFrac;
    const pivY = top + h * ATLAS.pivotFrac;
    const ph = p.walkPhase;
    const s = Math.sin(ph);
    const sideness = Math.abs(Math.sin((row / 16) * Math.PI * 2)); // 1 = perfil, 0 = de frente/costas
    const bob = Math.abs(Math.cos(ph)) * h * 0.035;
    const legs = [[-1, s], [1, -s]]; // [lado, fase]
    for (const [side, f] of legs) {
      ctx.save();
      ctx.beginPath();
      // metade esquerda ou direita, da cintura até o chão (com folga)
      ctx.rect(side < 0 ? x0 - 10 : pt.x, hipY, side < 0 ? pt.x - x0 + 10 : x0 + spr.cssW + 10 - pt.x, pt.y + h * 0.2 - hipY);
      ctx.clip();
      ctx.translate(pt.x + side * h * 0.05, pivY);
      // de perfil: balança a partir do quadril; de frente: levanta o joelho (encurta a perna) e inclina pouco
      ctx.rotate(f * (0.05 + 0.2 * sideness));
      const lift = (1 - sideness) * Math.max(0, f) * 0.14;
      ctx.scale(1, 1 - lift);
      ctx.translate(-(pt.x + side * h * 0.05), -pivY);
      ctx.drawImage(spr, x0, y0 - bob * 0.3, spr.cssW, spr.cssH);
      ctx.restore();
    }
    // tronco (da cabeça à cintura), com balanço leve
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0 - 10, y0 - 10, spr.cssW + 20, hipY - (y0 - 10) + 1);
    ctx.clip();
    ctx.translate(pt.x, hipY);
    ctx.rotate(s * 0.035 * sideness);
    ctx.translate(-pt.x, -hipY);
    ctx.drawImage(spr, x0, y0 - bob, spr.cssW, spr.cssH);
    ctx.restore();
  }

  drawGround(ctx, game) {
    const cam = game.camera;
    ctx.fillStyle = COLORS.groundB;
    ctx.fillRect(-20, -20, this.w + 40, this.h + 40);
    cam.visibleWorldBounds(2, bounds);
    const step = 1.5;
    const x0 = Math.floor(bounds.minX / step);
    const x1 = Math.ceil(bounds.maxX / step);
    const y0 = Math.floor(bounds.minY / step);
    const y1 = Math.ceil(bounds.maxY / step);
    ctx.fillStyle = COLORS.groundA;
    ctx.beginPath();
    for (let i = x0; i < x1; i++) {
      for (let j = y0; j < y1; j++) {
        if ((i + j) & 1) continue;
        const wx = i * step;
        const wy = j * step;
        cam.toScreen(wx, wy, pt);
        ctx.moveTo(pt.x, pt.y);
        cam.toScreen(wx + step, wy, pt2);
        ctx.lineTo(pt2.x, pt2.y);
        cam.toScreen(wx + step, wy + step, pt2);
        ctx.lineTo(pt2.x, pt2.y);
        cam.toScreen(wx, wy + step, pt2);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.closePath();
      }
    }
    ctx.fill();
    // faixa de "rua" a cada 24 m para dar referência de deslocamento
    ctx.strokeStyle = 'rgba(255,210,31,0.16)';
    ctx.lineWidth = 2;
    ctx.setLineDash([14, 14]);
    ctx.beginPath();
    const street = 24;
    for (let j = Math.floor(bounds.minY / street); j <= Math.ceil(bounds.maxY / street); j++) {
      cam.toScreen(bounds.minX, j * street, pt);
      ctx.moveTo(pt.x, pt.y);
      cam.toScreen(bounds.maxX, j * street, pt);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawZones(ctx, game, ppu) {
    const cam = game.camera;
    for (const z of game.zones) {
      cam.toScreen(z.x, z.y, pt);
      if (z.kind === 'boleto') {
        const a = z.t < 0.2 ? z.t / 0.2 : z.t > z.dur - 0.4 ? Math.max(0, (z.dur - z.t) / 0.4) : 1;
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(255,210,31,0.18)';
        ctx.strokeStyle = 'rgba(255,210,31,0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y, z.r * ppu, z.r * ppu * cam.k, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // "código de barras"
        ctx.fillStyle = 'rgba(255,210,31,0.55)';
        const bw = z.r * ppu * 0.9;
        for (let i = 0; i < 9; i++) {
          const x = pt.x - bw / 2 + (i / 9) * bw;
          ctx.fillRect(x, pt.y - 4, i % 3 === 0 ? 3 : 1.5, 8);
        }
        ctx.globalAlpha = 1;
      } else if (z.kind === 'stamp') {
        const h = z.half;
        const quad = worldQuad(cam, z.x, z.y, h);
        const k = Math.min(1, z.t / z.delay);
        ctx.globalAlpha = z.done ? Math.max(0, 1 - (z.t - z.delay) / (z.life - z.delay)) : 0.35 + k * 0.4;
        ctx.strokeStyle = '#e5252f';
        ctx.lineWidth = z.done ? 4 : 2;
        ctx.fillStyle = z.done ? 'rgba(229,37,47,0.22)' : 'rgba(229,37,47,0.08)';
        pathQuad(ctx, quad);
        ctx.fill();
        ctx.stroke();
        if (z.done) {
          ctx.fillStyle = '#ff4a52';
          ctx.font = `900 ${Math.max(10, h * ppu * 0.42)}px "Anton", Impact, "Arial Narrow", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.save();
          ctx.translate(pt.x, pt.y);
          ctx.rotate(-0.18);
          ctx.fillText('INDEFERIDO', 0, 0);
          ctx.restore();
          ctx.textBaseline = 'alphabetic';
        }
        ctx.globalAlpha = 1;
      }
    }
    for (const lot of game.lots) {
      const quad = worldQuad(cam, lot.x, lot.y, lot.half);
      if (lot.state === 'warn') {
        const blink = 0.45 + 0.45 * Math.abs(Math.sin(lot.t * 9));
        ctx.globalAlpha = blink;
        ctx.fillStyle = 'rgba(255,210,31,0.14)';
        ctx.strokeStyle = '#ffd21f';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 8]);
        pathQuad(ctx, quad);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = 'rgba(150,10,20,0.42)';
        ctx.strokeStyle = 'rgba(255,74,82,0.9)';
        ctx.lineWidth = 2;
        pathQuad(ctx, quad);
        ctx.fill();
        ctx.stroke();
        // hachura
        ctx.save();
        pathQuad(ctx, quad);
        ctx.clip();
        ctx.strokeStyle = 'rgba(255,74,82,0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        cam.toScreen(lot.x, lot.y, pt);
        const span = lot.half * ppu * 2.2;
        for (let s = -span; s < span; s += 14) {
          ctx.moveTo(pt.x + s - span, pt.y + span);
          ctx.lineTo(pt.x + s + span, pt.y - span);
        }
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  drawLotsLabels(ctx, game) {
    const cam = game.camera;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const lot of game.lots) {
      cam.toScreen(lot.x, lot.y, pt);
      const sold = lot.state === 'sold';
      ctx.font = `400 ${Math.max(13, lot.half * cam.ppu * 0.32)}px "Anton", Impact, "Arial Narrow", sans-serif`;
      const label = sold ? 'VENDIDO' : 'À VENDA';
      const w = ctx.measureText(label).width + 14;
      ctx.fillStyle = sold ? '#e5252f' : '#ffd21f';
      ctx.fillRect(pt.x - w / 2, pt.y - 11, w, 22);
      ctx.fillStyle = sold ? '#fff' : '#141117';
      ctx.fillText(label, pt.x, pt.y + 1);
    }
    ctx.textBaseline = 'alphabetic';
  }

  drawFx(ctx, game, ppu, playerPx) {
    const cam = game.camera;
    const enemyH = playerPx * ENEMIES.telespectador.size * (this.enemyMul || 0.75);
    for (const w of game.fx.woken) {
      cam.toScreen(w.x, w.y, pt);
      const spr = this.cache.get(crowdImage(w.tint || 0, w.id || 0, w.vy > 0), enemyH, { mode: 'woken', flip: !!w.flipFix }) || this.sprite('acordado', w.tint || 0, enemyH, false);
      const left = WAKE.fadeS - w.t;
      ctx.globalAlpha = left < 0.35 ? Math.max(0, left / 0.35) : 1;
      const bob = Math.abs(Math.sin(w.walk)) * enemyH * 0.03;
      ctx.save();
      ctx.translate(pt.x, pt.y - bob);
      ctx.rotate(Math.sin(w.walk * 1.6) * 0.06);
      ctx.drawImage(spr, -spr.ox, -spr.oy, spr.cssW, spr.cssH);
      ctx.restore();
      if (w.t < 0.6) {
        ctx.fillStyle = '#ffffff';
        ctx.font = `900 ${Math.max(12, enemyH * 0.32)}px "Barlow Semi Condensed", "Arial Narrow", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('?', pt.x + enemyH * 0.25, pt.y - enemyH - 2);
      }
    }
    ctx.globalAlpha = 1;
    for (const q of game.fx.particles) {
      cam.toScreen(q.x, q.y, pt);
      const a = 1 - q.t / q.life;
      ctx.globalAlpha = a;
      ctx.fillStyle = q.kind === 'glitch' ? COLORS.neon : q.kind === 'static' ? (q.x * 7 % 1 > 0.5 ? '#ffffff' : COLORS.hypno) : COLORS.blood;
      const s = Math.max(2, playerPx * 0.05);
      ctx.fillRect(pt.x - s / 2, pt.y - q.z * ppu - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
    for (const r of game.fx.rings) {
      cam.toScreen(r.x, r.y, pt);
      const k = r.t / r.dur;
      const rad = (r.r0 + (r.r1 - r.r0) * k) * ppu;
      ctx.globalAlpha = 1 - k;
      ctx.strokeStyle = r.color === 'mic' ? '#bfe9ff' : '#ffb02e';
      ctx.lineWidth = r.color === 'mic' ? 3 : 5;
      ctx.beginPath();
      ctx.ellipse(pt.x, pt.y, rad, rad * cam.k, 0, 0, Math.PI * 2);
      ctx.stroke();
      if (r.color === 'blast') {
        ctx.fillStyle = 'rgba(255,176,46,0.25)';
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    for (const n of game.fx.numbers) {
      cam.toScreen(n.x, n.y, pt);
      ctx.globalAlpha = 1 - n.t / 0.7;
      ctx.font = `800 ${n.big ? 17 : 13}px "Barlow Semi Condensed", "Arial Narrow", sans-serif`;
      ctx.fillStyle = n.big ? '#ffd21f' : '#ffffff';
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 3;
      const y = pt.y - playerPx * 0.9 - n.t * 30;
      ctx.strokeText(String(n.v), pt.x, y);
      ctx.fillText(String(n.v), pt.x, y);
    }
    ctx.globalAlpha = 1;
  }

  /** Ícones do HUD e das cartas usam o mesmo desenho do jogo. */
  icon(kind, size) {
    const c = makeCanvas(size * this.dpr, size * this.dpr);
    const g = c.getContext('2d');
    g.scale(this.dpr, this.dpr);
    const art = images[ICON_ART[kind]];
    if (art) drawFit(g, art, 0, 0, size);
    else drawIcon(g, kind, size);
    return c;
  }
}

function makeCanvas(w, h) {
  if (typeof OffscreenCanvas !== 'undefined' && typeof document === 'undefined') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

function worldQuad(cam, x, y, h) {
  const q = [];
  for (const [ax, ay] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const p = { x: 0, y: 0 };
    cam.toScreen(x + ax * h, y + ay * h, p);
    q.push(p);
  }
  return q;
}

function pathQuad(ctx, q) {
  ctx.beginPath();
  ctx.moveTo(q[0].x, q[0].y);
  for (let i = 1; i < 4; i++) ctx.lineTo(q[i].x, q[i].y);
  ctx.closePath();
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

// Boneco genérico: sombra, pernas, tronco, cabeça + acessório da família.
function drawPuppet(g, kind, variant, W, H, flash) {
  const shadowW = W * 0.42;
  g.fillStyle = COLORS.shadow;
  g.beginPath();
  g.ellipse(0, 0, shadowW, shadowW * 0.32, 0, 0, Math.PI * 2);
  g.fill();

  const bodyW = W * (kind === 'especulador' || kind === 'politico' || kind === 'rival' ? 0.56 : 0.46);
  const legH = H * 0.32;
  const torsoH = H * 0.4;
  const headR = H * 0.12;
  let shirt = '#888';
  let pants = '#2a2a30';
  const outline = 'rgba(0,0,0,0.55)';

  switch (kind) {
    case 'player':
    case 'playerGold':
      shirt = COLORS.player;
      pants = '#25222a';
      break;
    case 'telespectador':
    case 'acordado':
      shirt = COLORS.telespectador[variant % 4];
      pants = '#3c3a40';
      break;
    case 'burocrata':
      shirt = COLORS.burocrata;
      pants = '#3d4655';
      break;
    case 'fiscal':
      shirt = '#ff7a1a'; // colete laranja
      pants = '#2f3a2f';
      break;
    case 'golpista':
      shirt = COLORS.golpista;
      pants = '#1a1720';
      break;
    case 'politico':
      shirt = COLORS.politico;
      pants = COLORS.politico;
      break;
    case 'rival':
      shirt = COLORS.politico;
      pants = COLORS.politico;
      break;
    case 'especulador':
      shirt = COLORS.boss;
      pants = COLORS.boss;
      break;
    default:
      break;
  }

  // pernas
  g.fillStyle = pants;
  g.strokeStyle = outline;
  g.lineWidth = Math.max(1, H * 0.02);
  roundRect(g, -bodyW * 0.42, -legH - 1, bodyW * 0.36, legH, bodyW * 0.12);
  g.fill();
  roundRect(g, bodyW * 0.06, -legH - 1, bodyW * 0.36, legH, bodyW * 0.12);
  g.fill();

  // mochila do entregador (atrás, lado oposto ao olhar)
  if (kind === 'player' || kind === 'playerGold') {
    const bx = variant ? bodyW * 0.18 : -bodyW * 0.78;
    g.fillStyle = kind === 'playerGold' ? COLORS.gold : COLORS.playerDark;
    roundRect(g, bx, -legH - torsoH * 1.05, bodyW * 0.6, torsoH * 0.95, 2);
    g.fill();
    g.stroke();
  }

  // tronco
  g.fillStyle = shirt;
  roundRect(g, -bodyW / 2, -legH - torsoH, bodyW, torsoH + 2, bodyW * 0.25);
  g.fill();
  g.stroke();

  // detalhes por família
  if (kind === 'politico' || kind === 'rival' || kind === 'especulador') {
    g.fillStyle = kind === 'rival' ? COLORS.rival : COLORS.gold; // gravata / faixa
    g.fillRect(-bodyW * 0.06, -legH - torsoH, bodyW * 0.12, torsoH * 0.8);
    if (kind === 'rival') {
      g.fillStyle = COLORS.rival;
      g.fillRect(-bodyW * 0.45, -legH - torsoH * 0.7, bodyW * 0.25, torsoH * 0.22);
      g.fillRect(bodyW * 0.2, -legH - torsoH * 0.7, bodyW * 0.25, torsoH * 0.22);
    }
    // maleta
    g.fillStyle = '#6b3f1d';
    roundRect(g, bodyW * 0.42, -legH - torsoH * 0.2, bodyW * 0.42, torsoH * 0.34, 2);
    g.fill();
    g.stroke();
  }
  if (kind === 'burocrata') {
    g.fillStyle = COLORS.paper;
    g.fillRect(-bodyW * 0.75, -legH - torsoH * 0.75, bodyW * 0.5, torsoH * 0.55);
    g.strokeRect(-bodyW * 0.75, -legH - torsoH * 0.75, bodyW * 0.5, torsoH * 0.55);
  }
  if (kind === 'fiscal') {
    // faixas refletivas + prancheta
    g.fillStyle = '#e8f04a';
    g.fillRect(-bodyW / 2, -legH - torsoH * 0.55, bodyW, torsoH * 0.1);
    g.fillRect(-bodyW / 2, -legH - torsoH * 0.3, bodyW, torsoH * 0.1);
    g.fillStyle = '#6b3f1d';
    g.fillRect(bodyW * 0.42, -legH - torsoH * 0.9, bodyW * 0.36, torsoH * 0.5);
    g.fillStyle = COLORS.paper;
    g.fillRect(bodyW * 0.46, -legH - torsoH * 0.84, bodyW * 0.28, torsoH * 0.4);
  }
  if (kind === 'golpista') {
    g.fillStyle = COLORS.neon;
    roundRect(g, bodyW * 0.3, -legH - torsoH * 1.05, bodyW * 0.32, torsoH * 0.5, 2);
    g.fill();
  }
  if (kind === 'telespectador') {
    // braços esticados para a frente, andar de sonâmbulo
    g.fillStyle = COLORS.skin;
    g.fillRect(bodyW * 0.3, -legH - torsoH * 0.92, bodyW * 0.62, torsoH * 0.16);
    g.fillRect(bodyW * 0.3, -legH - torsoH * 0.68, bodyW * 0.56, torsoH * 0.16);
  }
  if (kind === 'acordado') {
    // mão na cabeça: "onde eu estou?"
    g.fillStyle = COLORS.skin;
    g.fillRect(bodyW * 0.32, -legH - torsoH * 1.25, bodyW * 0.18, torsoH * 0.7);
  }

  // cabeça
  const hy = -legH - torsoH - headR * 0.9;
  if (kind === 'telespectador') {
    // halo azul de tela em volta da cabeça
    g.fillStyle = 'rgba(143,180,255,0.35)';
    g.beginPath();
    g.arc(0, hy, headR * 1.7, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = COLORS.skin;
  g.beginPath();
  g.arc(0, hy, headR, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  if (kind === 'telespectador') {
    // olhos vidrados (faixa azul brilhante)
    g.fillStyle = COLORS.hypno;
    g.fillRect(-headR * 0.75, hy - headR * 0.25, headR * 1.5, headR * 0.38);
  }

  if (kind === 'player' || kind === 'playerGold') {
    // capacete vermelho com viseira
    g.fillStyle = COLORS.player;
    g.beginPath();
    g.arc(0, hy - headR * 0.1, headR * 1.12, Math.PI, 0);
    g.closePath();
    g.fill();
    g.stroke();
    g.fillStyle = '#1b1b22';
    g.fillRect(variant ? -headR * 1.05 : -headR * 0.05, hy - headR * 0.25, headR * 1.1, headR * 0.35);
  }
  if (kind === 'especulador') {
    g.fillStyle = COLORS.hardhat;
    g.beginPath();
    g.arc(0, hy - headR * 0.15, headR * 1.15, Math.PI, 0);
    g.closePath();
    g.fill();
    g.stroke();
    g.fillRect(-headR * 1.45, hy - headR * 0.2, headR * 2.9, headR * 0.25);
  }
  if (kind === 'fiscal') {
    g.fillStyle = '#ff7a1a';
    g.beginPath();
    g.arc(0, hy - headR * 0.2, headR * 1.0, Math.PI, 0);
    g.closePath();
    g.fill();
    g.fillRect(-headR * 0.2, hy - headR * 0.35, headR * 1.5, headR * 0.22);
  }
  if (kind === 'burocrata') {
    g.strokeStyle = '#111';
    g.lineWidth = Math.max(1, H * 0.025);
    g.beginPath();
    g.moveTo(-headR * 0.7, hy - headR * 0.1);
    g.lineTo(headR * 0.7, hy - headR * 0.1);
    g.stroke();
  }

  if (flash) {
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = kind === 'player' || kind === 'playerGold' ? 'rgba(255,40,50,0.6)' : 'rgba(255,255,255,0.85)';
    g.fillRect(-W, -H - 10, W * 2, H + 20);
    g.globalCompositeOperation = 'source-over';
  }
}

function drawEliteRing(ctx, pt, ppu, k, o, t) {
  const r = (o.r + 0.25) * ppu;
  ctx.strokeStyle = o.boss ? 'rgba(255,210,31,0.9)' : 'rgba(232,182,44,0.8)';
  ctx.lineWidth = o.boss ? 4 : 2.5;
  ctx.beginPath();
  ctx.ellipse(pt.x, pt.y, r * (1 + Math.sin(t * 5) * 0.05), r * k, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawHpPip(ctx, pt, h, frac) {
  const w = Math.max(26, h * 0.6);
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(pt.x - w / 2, pt.y - h - 12, w, 5);
  ctx.fillStyle = '#e8b62c';
  ctx.fillRect(pt.x - w / 2, pt.y - h - 12, w * Math.max(0, frac), 5);
}

function drawProp(ctx, o, pt, ppu, k) {
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  if (o.type === 'banca') {
    const w = o.r * 2 * ppu;
    const h = o.r * 1.5 * ppu;
    ctx.fillStyle = COLORS.shadow;
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y, w * 0.6, w * 0.6 * k * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(pt.x - w / 2, pt.y - h, w, h);
    ctx.strokeRect(pt.x - w / 2, pt.y - h, w, h);
    // toldo listrado
    const stripes = 6;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 ? '#f2efe8' : (o.seed > 0.5 ? '#c4232b' : '#1f7a46');
      ctx.fillRect(pt.x - w * 0.6 + (i * w * 1.2) / stripes, pt.y - h - h * 0.35, (w * 1.2) / stripes + 0.5, h * 0.35);
    }
  } else if (o.type === 'poste') {
    const h = 3.6 * ppu * 0.55;
    ctx.fillStyle = COLORS.shadow;
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y, o.r * ppu * 1.6, o.r * ppu * k, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7d7b80';
    ctx.fillRect(pt.x - o.r * ppu * 0.6, pt.y - h, o.r * ppu * 1.2, h);
    ctx.strokeRect(pt.x - o.r * ppu * 0.6, pt.y - h, o.r * ppu * 1.2, h);
    ctx.fillStyle = '#ffd21f';
    ctx.fillRect(pt.x - o.r * ppu * 1.4, pt.y - h * 0.62, o.r * ppu * 2.8, h * 0.14); // "cartaz"
  } else {
    const h = 0.55 * ppu;
    ctx.fillStyle = '#ff7a1a';
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y - h);
    ctx.lineTo(pt.x + o.r * ppu, pt.y);
    ctx.lineTo(pt.x - o.r * ppu, pt.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f2efe8';
    ctx.fillRect(pt.x - o.r * ppu * 0.5, pt.y - h * 0.55, o.r * ppu, h * 0.14);
  }
}

function drawGem(ctx, g, pt, ppu, t) {
  const s = Math.max(4, ppu * (g.v >= 10 ? 0.26 : g.v >= 3 ? 0.2 : 0.15));
  const y = pt.y - s - Math.sin(t * 4 + g.x) * 1.5;
  ctx.fillStyle = g.v >= 10 ? '#b57bff' : g.v >= 3 ? '#3ddc5a' : '#4fb3ff';
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pt.x, y - s);
  ctx.lineTo(pt.x + s * 0.7, y);
  ctx.lineTo(pt.x, y + s);
  ctx.lineTo(pt.x - s * 0.7, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawPickup(ctx, k, pt, ppu, t) {
  const s = Math.max(9, ppu * 0.38);
  const y = pt.y - s - Math.abs(Math.sin(t * 3)) * 3;
  ctx.fillStyle = COLORS.shadow;
  ctx.beginPath();
  ctx.ellipse(pt.x, pt.y, s * 0.7, s * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  if (k.kind === 'maleta' && images.w_maleta) {
    const z = s * 1.8;
    drawFit(ctx, images.w_maleta, pt.x - z / 2, y - z / 2, z);
    return;
  }
  drawIconAt(ctx, k.kind, pt.x, y, s * 1.6);
}

function drawProjectile(ctx, o, pt, ppu, cam, playerPx) {
  const artId = o.kind === 'boomerang' ? 'w_capacete' : o.kind === 'slipper' ? 'w_chinelo' : o.kind === 'lob' ? 'w_maleta' : null;
  const art = artId && images[artId];
  if (art) {
    const s = Math.max(14, playerPx * (o.kind === 'slipper' ? 0.34 : 0.4));
    const y = o.kind === 'lob' ? pt.y - o.h * ppu - s * 0.5 : pt.y - playerPx * 0.45;
    if (o.kind === 'lob') {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(pt.x, pt.y, s * 0.4, s * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (o.evolved) {
      ctx.strokeStyle = 'rgba(255,210,31,0.5)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(pt.x, y);
      ctx.lineTo(pt.x - o.vx * ppu * 0.05, y - o.vy * ppu * cam.k * 0.05);
      ctx.stroke();
    }
    ctx.save();
    ctx.translate(pt.x, y);
    if (o.kind !== 'lob') ctx.rotate(o.spin);
    if (o.evolved) ctx.filter = 'sepia(1) saturate(4) hue-rotate(5deg)';
    ctx.drawImage(art, -s / 2, -s / 2, s, (s * art.height) / art.width);
    ctx.restore();
    return;
  }
  if (o.kind === 'boomerang') {
    const s = Math.max(7, playerPx * 0.17);
    const y = pt.y - playerPx * 0.45;
    ctx.save();
    ctx.translate(pt.x, y);
    ctx.rotate(o.spin);
    ctx.fillStyle = o.evolved ? '#ffd21f' : COLORS.player;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, s, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1b1b22';
    ctx.fillRect(-s * 0.2, -s * 0.45, s * 1.1, s * 0.3);
    ctx.restore();
    if (o.evolved) {
      ctx.strokeStyle = 'rgba(255,210,31,0.45)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(pt.x, y);
      ctx.lineTo(pt.x - o.vx * ppu * 0.04, y - o.vy * ppu * cam.k * 0.04);
      ctx.stroke();
    }
  } else if (o.kind === 'slipper') {
    const s = Math.max(6, playerPx * 0.14);
    const y = pt.y - playerPx * 0.4;
    ctx.save();
    ctx.translate(pt.x, y);
    ctx.rotate(o.spin);
    ctx.fillStyle = '#ffd21f';
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, -s * 0.45, -s, s * 0.9, s * 2, s * 0.45);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#1f7a46';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, -s * 0.2);
    ctx.lineTo(0, -s * 0.7);
    ctx.lineTo(s * 0.4, -s * 0.2);
    ctx.stroke();
    ctx.restore();
  } else if (o.kind === 'lob') {
    const s = Math.max(8, playerPx * 0.2);
    ctx.fillStyle = COLORS.shadow;
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y, s * 0.8, s * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    drawIconAt(ctx, 'maleta', pt.x, pt.y - o.h * ppu - s * 0.5, s * 1.4);
  }
}

function drawPaper(ctx, pt, ppu, spin, playerPx) {
  const s = Math.max(6, playerPx * 0.13);
  ctx.save();
  ctx.translate(pt.x, pt.y - playerPx * 0.45);
  ctx.rotate(spin);
  ctx.fillStyle = COLORS.paper;
  ctx.strokeStyle = '#5f6f86';
  ctx.lineWidth = 1.5;
  ctx.fillRect(-s * 0.7, -s, s * 1.4, s * 2);
  ctx.strokeRect(-s * 0.7, -s, s * 1.4, s * 2);
  ctx.restore();
}

function drawIconAt(ctx, kind, x, y, size) {
  ctx.save();
  ctx.translate(x - size / 2, y - size / 2);
  drawIcon(ctx, kind, size);
  ctx.restore();
}

// Ícones simples desenhados em código (sem assets externos).
export function drawIcon(g, kind, S) {
  const c = S / 2;
  g.lineJoin = 'round';
  g.lineWidth = Math.max(1.5, S * 0.05);
  g.strokeStyle = 'rgba(0,0,0,0.65)';
  switch (kind) {
    case 'capacete':
    case 'entrega':
      g.fillStyle = kind === 'entrega' ? '#ffd21f' : COLORS.player;
      g.beginPath();
      g.arc(c, c * 1.15, S * 0.34, Math.PI, 0);
      g.closePath();
      g.fill();
      g.stroke();
      g.fillStyle = '#1b1b22';
      g.fillRect(c - S * 0.05, c * 0.95, S * 0.36, S * 0.12);
      if (kind === 'entrega') {
        g.strokeStyle = '#ffd21f';
        g.beginPath();
        g.moveTo(S * 0.1, S * 0.8);
        g.lineTo(S * 0.35, S * 0.8);
        g.moveTo(S * 0.05, S * 0.68);
        g.lineTo(S * 0.25, S * 0.68);
        g.stroke();
      }
      break;
    case 'chinelo':
      g.save();
      g.translate(c, c);
      g.rotate(-0.6);
      g.fillStyle = '#ffd21f';
      roundRect(g, -S * 0.16, -S * 0.36, S * 0.32, S * 0.72, S * 0.16);
      g.fill();
      g.stroke();
      g.strokeStyle = '#1f7a46';
      g.lineWidth = S * 0.07;
      g.beginPath();
      g.moveTo(-S * 0.14, -S * 0.05);
      g.lineTo(0, -S * 0.25);
      g.lineTo(S * 0.14, -S * 0.05);
      g.stroke();
      g.restore();
      break;
    case 'boleto':
      g.fillStyle = COLORS.paper;
      g.fillRect(S * 0.18, S * 0.2, S * 0.64, S * 0.6);
      g.strokeRect(S * 0.18, S * 0.2, S * 0.64, S * 0.6);
      g.fillStyle = '#141117';
      for (let i = 0; i < 8; i++) g.fillRect(S * 0.24 + i * S * 0.065, S * 0.5, i % 3 ? S * 0.025 : S * 0.045, S * 0.22);
      g.fillStyle = '#e5252f';
      g.fillRect(S * 0.24, S * 0.27, S * 0.3, S * 0.08);
      break;
    case 'carimbo':
      g.fillStyle = '#6b3f1d';
      g.fillRect(c - S * 0.08, S * 0.16, S * 0.16, S * 0.3);
      g.fillStyle = '#e5252f';
      roundRect(g, S * 0.2, S * 0.46, S * 0.6, S * 0.2, S * 0.04);
      g.fill();
      g.stroke();
      g.fillStyle = '#ff4a52';
      g.fillRect(S * 0.16, S * 0.74, S * 0.68, S * 0.08);
      break;
    case 'maleta':
      g.fillStyle = '#7a4a22';
      roundRect(g, S * 0.16, S * 0.32, S * 0.68, S * 0.46, S * 0.06);
      g.fill();
      g.stroke();
      g.strokeStyle = '#7a4a22';
      g.lineWidth = S * 0.07;
      g.beginPath();
      g.moveTo(S * 0.38, S * 0.32);
      g.lineTo(S * 0.38, S * 0.22);
      g.lineTo(S * 0.62, S * 0.22);
      g.lineTo(S * 0.62, S * 0.32);
      g.stroke();
      g.fillStyle = COLORS.gold;
      g.fillRect(S * 0.46, S * 0.45, S * 0.08, S * 0.1);
      break;
    case 'microfone':
      g.fillStyle = '#c8c8d0';
      g.beginPath();
      g.arc(S * 0.42, S * 0.36, S * 0.17, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.fillStyle = '#e5252f';
      g.fillRect(S * 0.35, S * 0.5, S * 0.14, S * 0.34);
      g.strokeStyle = '#bfe9ff';
      g.lineWidth = S * 0.05;
      g.beginPath();
      g.arc(S * 0.42, S * 0.36, S * 0.3, -0.9, 0.5);
      g.stroke();
      break;
    case 'tenis':
      g.fillStyle = '#f2efe8';
      roundRect(g, S * 0.14, S * 0.46, S * 0.72, S * 0.24, S * 0.1);
      g.fill();
      g.stroke();
      g.fillStyle = '#3d8bff';
      g.fillRect(S * 0.2, S * 0.4, S * 0.34, S * 0.12);
      break;
    case 'marmita':
      g.fillStyle = '#c8c8d0';
      roundRect(g, S * 0.16, S * 0.36, S * 0.68, S * 0.4, S * 0.08);
      g.fill();
      g.stroke();
      g.fillStyle = '#e5252f';
      g.fillRect(S * 0.16, S * 0.3, S * 0.68, S * 0.1);
      break;
    case 'mochila':
      g.fillStyle = COLORS.playerDark;
      roundRect(g, S * 0.2, S * 0.2, S * 0.6, S * 0.6, S * 0.06);
      g.fill();
      g.stroke();
      g.fillStyle = '#f2efe8';
      g.fillRect(S * 0.36, S * 0.42, S * 0.28, S * 0.12);
      break;
    case 'cafe':
      g.fillStyle = '#f2efe8';
      g.fillRect(S * 0.26, S * 0.34, S * 0.38, S * 0.42);
      g.strokeRect(S * 0.26, S * 0.34, S * 0.38, S * 0.42);
      g.fillStyle = '#5a3a22';
      g.fillRect(S * 0.28, S * 0.38, S * 0.34, S * 0.1);
      g.strokeStyle = '#f2efe8';
      g.lineWidth = S * 0.06;
      g.beginPath();
      g.arc(S * 0.66, S * 0.53, S * 0.09, -1.4, 1.4);
      g.stroke();
      break;
    case 'ima':
      g.strokeStyle = '#e5252f';
      g.lineWidth = S * 0.16;
      g.beginPath();
      g.arc(c, S * 0.44, S * 0.22, Math.PI, 0, false);
      g.moveTo(c - S * 0.22, S * 0.44);
      g.lineTo(c - S * 0.22, S * 0.72);
      g.moveTo(c + S * 0.22, S * 0.44);
      g.lineTo(c + S * 0.22, S * 0.72);
      g.stroke();
      g.fillStyle = '#c8c8d0';
      g.fillRect(c - S * 0.3, S * 0.7, S * 0.16, S * 0.1);
      g.fillRect(c + S * 0.14, S * 0.7, S * 0.16, S * 0.1);
      break;
    case 'raiva':
      g.fillStyle = COLORS.skin;
      roundRect(g, S * 0.28, S * 0.3, S * 0.44, S * 0.44, S * 0.1);
      g.fill();
      g.stroke();
      g.strokeStyle = 'rgba(0,0,0,0.5)';
      g.beginPath();
      for (let i = 1; i < 4; i++) {
        g.moveTo(S * 0.28 + i * S * 0.11, S * 0.3);
        g.lineTo(S * 0.28 + i * S * 0.11, S * 0.45);
      }
      g.stroke();
      break;
    case 'pastel':
      g.fillStyle = '#e8b04a';
      g.beginPath();
      g.arc(c, S * 0.62, S * 0.32, Math.PI, 0);
      g.closePath();
      g.fill();
      g.stroke();
      break;
    case 'propina':
      g.fillStyle = '#2f8f4e';
      g.beginPath();
      g.arc(c, S * 0.58, S * 0.26, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.fillRect(c - S * 0.1, S * 0.22, S * 0.2, S * 0.14);
      g.fillStyle = '#d9f5df';
      g.font = `900 ${S * 0.34}px "Barlow Semi Condensed", sans-serif`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('$', c, S * 0.6);
      g.textBaseline = 'alphabetic';
      break;
    case 'horaextra':
      g.strokeStyle = '#f2efe8';
      g.lineWidth = S * 0.07;
      g.beginPath();
      g.arc(c, c, S * 0.3, 0, Math.PI * 2);
      g.moveTo(c, c);
      g.lineTo(c, c - S * 0.2);
      g.moveTo(c, c);
      g.lineTo(c + S * 0.15, c);
      g.stroke();
      break;
    default:
      g.fillStyle = '#666';
      g.fillRect(S * 0.25, S * 0.25, S * 0.5, S * 0.5);
  }
}
