// Geração e aplicação das cartas de melhoria (subir de nível e maletas).
import { WEAPONS, PASSIVES, EVOLUTIONS, SLOTS, MELHORIAS, PLAYER } from './config.js';

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
export function rollOptions(player, rng, n = 3, segment = 'orla') {
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
      const only = WEAPONS[id].onlyIn;
      if (only && only !== segment) continue; // habilidade exclusiva: só aparece no trecho dela
      const tag = only === 'orla' ? 'SÓ NA ORLA' : only === 'morro' ? 'SÓ NO MORRO' : 'NOVA';
      pool.push({ kind: 'weapon', id, level: 1, title: WEAPONS[id].name, desc: WEAPONS[id].role, tag, w: only ? 2.4 : 1.4 });
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

/** Só armas novas (para a melhoria "Bolsa de ferramentas", no começo do trecho). */
export function rollNewWeapons(player, rng, n = 3, segment = 'orla') {
  const pool = Object.keys(WEAPONS).filter((id) => {
    const W = WEAPONS[id];
    if (W.evolution || player.weapons.some((w) => w.id === id)) return false;
    return !W.onlyIn || W.onlyIn === segment;
  });
  const out = [];
  while (out.length < n && pool.length) {
    const id = pool.splice(Math.floor(rng() * pool.length), 1)[0];
    const only = WEAPONS[id].onlyIn;
    out.push({ kind: 'weapon', id, level: 1, title: WEAPONS[id].name, desc: WEAPONS[id].role, tag: only === 'orla' ? 'SÓ NA ORLA' : only === 'morro' ? 'SÓ NO MORRO' : 'ARMA INICIAL' });
  }
  return out;
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
    maxHp: PLAYER.hp + 20 * lvl('marmita') + (mods.maxHpAdd || 0),
    areaMul: 1 + 0.1 * lvl('mochila'),
    cdMul: Math.pow(0.93, lvl('cafe')) * (mods.cdMul || 1),
    magnetMul: (1 + 0.25 * lvl('ima')) * (mods.magnetMul || 1),
    dmgMul: (1 + 0.1 * lvl('raiva') + (player.bonusDmg || 0)) * (mods.dmgMul || 1),
    armor: mods.armor || 0,
    eliteDmgMul: mods.eliteDmgMul || 1,
  };
}

// ---------- números à vista (pedido do autor, 08/11/2026: "comprei a melhoria e ficou tudo igual") ----------

/** Porcentagem em português: 0.075 → "7,5%" (sem sinal). */
const pct = (x) => `${(Math.round(Math.abs(x) * 1000) / 10).toString().replace('.', ',')}%`;
const nivelDe = (melhorias, id) => Math.min((melhorias && melhorias[id]) || 0, MELHORIAS[id].custo.length);

/** O efeito somado de uma melhoria permanente no nível `lv` (o texto da tela de melhorias). */
export function efeitoMelhoria(id, lv) {
  const M = MELHORIAS[id];
  if (M.opcao) return lv > 0 ? 'Comprada' : 'Ainda não comprada';
  const v = M.step * lv;
  const mais = v ? `+${pct(v)}` : '0%';
  switch (id) {
    case 'vida': return `Vida máxima: ${PLAYER.hp + v}`;
    case 'dano': return `Dano: ${mais}`;
    case 'velocidade': return `Velocidade: ${mais}`;
    case 'recarga': return `Recarga das armas: ${v ? `−${pct(v)}` : '0%'}`;
    case 'ima': return `Raio de coleta: ${mais}`;
    default: return `${M.desc} × ${lv}`;
  }
}

/** Agora e depois da próxima compra: "Vida máxima: 135 → 140" (no máximo, "... (máximo)"). */
export function efeitoAgoraEDepois(id, lv) {
  const M = MELHORIAS[id];
  if (M.opcao) return efeitoMelhoria(id, lv);
  const agora = efeitoMelhoria(id, lv);
  if (lv >= M.custo.length) return `${agora} (máximo)`;
  return `${agora} → ${efeitoMelhoria(id, lv + 1).split(': ')[1]}`;
}

/** As melhorias permanentes que valem nesta partida, curtas, para a TV ("+15 DE VIDA", "+5% DE DANO"). */
export function resumoMelhorias(melhorias) {
  const out = [];
  const lv = (id) => nivelDe(melhorias, id);
  if (lv('vida')) out.push(`+${lv('vida') * MELHORIAS.vida.step} DE VIDA`);
  if (lv('dano')) out.push(`+${pct(lv('dano') * MELHORIAS.dano.step)} DE DANO`);
  if (lv('velocidade')) out.push(`+${pct(lv('velocidade') * MELHORIAS.velocidade.step)} DE VELOCIDADE`);
  if (lv('recarga')) out.push(`−${pct(lv('recarga') * MELHORIAS.recarga.step)} DE RECARGA`);
  if (lv('ima')) out.push(`+${pct(lv('ima') * MELHORIAS.ima.step)} DE COLETA`);
  return out;
}

/**
 * Os números do Juninho agora (a tela de pausa): o total de cada um e de onde vem (melhorias permanentes,
 * cartas desta partida, propostas e eventos). Linhas { nome, valor, partes: [texto] }.
 */
export function numerosDoJuninho(player, mods, melhorias) {
  const total = playerStats(player, mods);
  const cartas = playerStats(player, {});
  const lv = (id) => nivelDe(melhorias, id);
  const mel = {
    vida: lv('vida') * MELHORIAS.vida.step,
    dano: 1 + lv('dano') * MELHORIAS.dano.step,
    velocidade: 1 + lv('velocidade') * MELHORIAS.velocidade.step,
    recarga: 1 - lv('recarga') * MELHORIAS.recarga.step,
    ima: 1 + lv('ima') * MELHORIAS.ima.step,
  };
  const sinal = (x) => (Math.abs(x) < 5e-4 ? '0%' : x > 0 ? `+${pct(x)}` : `−${pct(x)}`);
  const partes = (m, c, t) => {
    // m: das melhorias, c: das cartas, t: total (multiplicadores); o resto vem das propostas e eventos
    const out = [];
    if (Math.abs(m - 1) > 1e-6) out.push(`melhorias ${sinal(m - 1)}`);
    if (Math.abs(c - 1) > 1e-6) out.push(`cartas ${sinal(c - 1)}`);
    const resto = t / (m * c);
    if (Math.abs(resto - 1) > 1e-3) out.push(`propostas ${sinal(resto - 1)}`);
    return out;
  };
  const vidaCartas = cartas.maxHp - PLAYER.hp;
  return [
    {
      nome: 'Vida máxima',
      valor: String(Math.round(total.maxHp)),
      partes: [`base ${PLAYER.hp}`, ...(mel.vida ? [`melhorias +${mel.vida}`] : []), ...(vidaCartas ? [`cartas +${vidaCartas}`] : [])],
    },
    { nome: 'Dano', valor: sinal(total.dmgMul - 1), partes: partes(mel.dano, cartas.dmgMul, total.dmgMul) },
    { nome: 'Velocidade', valor: sinal(total.speedMul - 1), partes: partes(mel.velocidade, cartas.speedMul, total.speedMul) },
    { nome: 'Recarga das armas', valor: sinal(total.cdMul - 1), partes: partes(mel.recarga, cartas.cdMul, total.cdMul) },
    { nome: 'Raio de coleta', valor: sinal(total.magnetMul - 1), partes: partes(mel.ima, cartas.magnetMul, total.magnetMul) },
    { nome: 'Área das armas', valor: sinal(total.areaMul - 1), partes: partes(1, cartas.areaMul, total.areaMul) },
  ];
}

