// Geração e aplicação das cartas de melhoria (subir de nível e maletas).
import { WEAPONS, PASSIVES, EVOLUTIONS, SLOTS } from './config.js';

export function weaponMaxLevel(id) {
  return WEAPONS[id].levels.length;
}

/** Soma base + incrementos até o nível atual. */
export function weaponStats(id, level) {
  const lv = WEAPONS[id].levels;
  const out = { ...lv[0] };
  for (let i = 1; i < level && i < lv.length; i++) {
    for (const [k, v] of Object.entries(lv[i])) {
      if (k === 'desc') continue;
      out[k] = (out[k] || 0) + v;
    }
  }
  delete out.desc;
  return out;
}

export function eligibleEvolutions(player) {
  const res = [];
  for (const evo of EVOLUTIONS) {
    const w = player.weapons.find((x) => x.id === evo.from);
    const p = player.passives.find((x) => x.id === evo.requires);
    if (w && p && w.level >= weaponMaxLevel(evo.from)) res.push(evo);
  }
  return res;
}

/**
 * Retorna até `n` opções distintas. Evolução elegível sempre aparece primeiro,
 * para que o jogador veja a única evolução do MVP dentro dos 10 minutos.
 */
export function rollOptions(player, rng, n = 3) {
  const opts = [];
  for (const evo of eligibleEvolutions(player)) {
    opts.push({ kind: 'evolution', id: evo.to, from: evo.from, title: WEAPONS[evo.to].name, desc: WEAPONS[evo.to].role, tag: 'EVOLUÇÃO' });
  }

  const pool = [];
  for (const w of player.weapons) {
    if (WEAPONS[w.id].evolution) continue;
    if (w.level < weaponMaxLevel(w.id)) {
      const next = WEAPONS[w.id].levels[w.level];
      pool.push({ kind: 'weapon', id: w.id, level: w.level + 1, title: WEAPONS[w.id].name, desc: next.desc, tag: `NV. ${w.level + 1}`, w: 1.2 });
    }
  }
  for (const p of player.passives) {
    if (p.level < PASSIVES[p.id].max) {
      pool.push({ kind: 'passive', id: p.id, level: p.level + 1, title: PASSIVES[p.id].name, desc: PASSIVES[p.id].desc, tag: `NV. ${p.level + 1}`, w: 1 });
    }
  }
  if (player.weapons.length < SLOTS.weapons) {
    for (const id of Object.keys(WEAPONS)) {
      if (WEAPONS[id].evolution) continue;
      if (player.weapons.some((w) => w.id === id)) continue;
      // a arma evoluída ocupa o lugar da original: não oferecer a original de novo
      if (EVOLUTIONS.some((e) => e.from === id && player.weapons.some((w) => w.id === e.to))) continue;
      pool.push({ kind: 'weapon', id, level: 1, title: WEAPONS[id].name, desc: WEAPONS[id].role, tag: 'NOVA', w: 1.4 });
    }
  }
  if (player.passives.length < SLOTS.passives) {
    for (const id of Object.keys(PASSIVES)) {
      if (player.passives.some((p) => p.id === id)) continue;
      pool.push({ kind: 'passive', id, level: 1, title: PASSIVES[id].name, desc: PASSIVES[id].desc, tag: 'NOVA', w: 1 });
    }
  }

  while (opts.length < n && pool.length) {
    let total = 0;
    for (const o of pool) total += o.w;
    let r = rng() * total;
    let idx = pool.length - 1;
    for (let i = 0; i < pool.length; i++) {
      r -= pool[i].w;
      if (r <= 0) {
        idx = i;
        break;
      }
    }
    opts.push(pool.splice(idx, 1)[0]);
  }

  // Tudo no máximo: cartas de consolo.
  if (opts.length === 0) {
    opts.push({ kind: 'heal', id: 'pastel', title: 'Pastel de Feira', desc: 'Cura 40 de vida', tag: 'CONSOLO' });
    opts.push({ kind: 'bonus', id: 'horaextra', title: 'Hora Extra', desc: '+5% de dano permanente', tag: 'CONSOLO' });
  }
  return opts.slice(0, n);
}

export function applyOption(player, opt) {
  if (opt.kind === 'evolution') {
    const w = player.weapons.find((x) => x.id === opt.from);
    if (w) {
      w.id = opt.id;
      w.level = 1;
      w.cd = 0;
    }
  } else if (opt.kind === 'weapon') {
    const w = player.weapons.find((x) => x.id === opt.id);
    if (w) w.level = opt.level;
    else player.weapons.push({ id: opt.id, level: 1, cd: 0.2 });
  } else if (opt.kind === 'passive') {
    const p = player.passives.find((x) => x.id === opt.id);
    if (p) p.level = opt.level;
    else player.passives.push({ id: opt.id, level: 1 });
    if (opt.id === 'marmita') player.hp += 20;
  } else if (opt.kind === 'heal') {
    player.hp += 40;
  } else if (opt.kind === 'bonus') {
    player.bonusDmg = (player.bonusDmg || 0) + 0.05;
  }
}

/** Atributos derivados das passivas + modificadores de eventos. */
export function playerStats(player, mods) {
  const lvl = (id) => player.passives.find((p) => p.id === id)?.level || 0;
  return {
    speedMul: (1 + 0.08 * lvl('tenis')) * (mods.speedMul || 1),
    maxHp: 120 + 20 * lvl('marmita'),
    areaMul: 1 + 0.1 * lvl('mochila'),
    cdMul: Math.pow(0.93, lvl('cafe')),
    magnetMul: 1 + 0.25 * lvl('ima'),
    dmgMul: (1 + 0.1 * lvl('raiva') + (player.bonusDmg || 0)) * (mods.dmgMul || 1),
    armor: mods.armor || 0,
    eliteDmgMul: mods.eliteDmgMul || 1,
  };
}
