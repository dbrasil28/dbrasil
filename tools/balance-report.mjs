// Relatório de balanceamento: roda N partidas headless com o bot e resume os resultados.
// O bot NÃO é um jogador humano: serve para comparar versões do balanceamento entre si.
// Uso: node tools/balance-report.mjs [partidas=20] [aceitar|recusar|alternar] [--sem-desvio] [--reviver]
import { simulate, BOT } from '../prototype/tests/bot.mjs';

const runs = Number(process.argv[2] || 20);
const policyName = process.argv[3] || 'alternar';
const policies = {
  aceitar: () => true,
  recusar: () => false,
  alternar: (i) => i % 2 === 0,
};
const policy = policies[policyName] || policies.alternar;
const flags = process.argv.slice(4);
BOT.dodge = !flags.some((f) => f.replace(/^--/, '') === 'sem-desvio');
BOT.revive = flags.some((f) => f.replace(/^--/, '') === 'reviver');

const rows = [];
const t0 = Date.now();
for (let i = 0; i < runs; i++) {
  const game = simulate({ seed: 1000 + i, seconds: 700, eventPolicy: policy });
  rows.push(game.summary());
}
const ms = Date.now() - t0;

const median = (arr) => {
  const a = [...arr].sort((x, y) => x - y);
  return a.length ? a[Math.floor(a.length / 2)] : null;
};
const wins = rows.filter((r) => r.resultado === 'vitória');
const losses = rows.filter((r) => r.resultado === 'derrota');
const causes = {};
for (const r of losses) causes[r.causa_da_derrota || '?'] = (causes[r.causa_da_derrota || '?'] || 0) + 1;
const reachedBoss = rows.filter((r) => r.tempo_s >= 480).length;

const fmt = (s) => (s == null ? '—' : `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.round(s % 60)).padStart(2, '0')}`);
console.log(`# Relatório de balanceamento (${runs} partidas, propostas: ${policyName}, bot ${BOT.dodge ? 'desvia' : 'não desvia'} dos projéteis${BOT.revive ? ', assiste o anúncio para reviver' : ''}, ${(ms / 1000).toFixed(1)} s)\n`);
console.log('| Métrica | Valor |');
console.log('| --- | --- |');
console.log(`| Vitórias | ${wins.length}/${runs} (${Math.round((wins.length / runs) * 100)}%) |`);
console.log(`| Chegaram ao chefe (08:00) | ${reachedBoss}/${runs} |`);
console.log(`| Duração mediana | ${fmt(median(rows.map((r) => r.tempo_s)))} |`);
console.log(`| Morte mediana (derrotas) | ${fmt(median(losses.map((r) => r.tempo_s)))} |`);
console.log(`| Vitória mediana | ${fmt(median(wins.map((r) => r.tempo_s)))} |`);
console.log(`| 1ª melhoria (mediana) | ${median(rows.map((r) => r.primeira_melhoria_s))} s |`);
console.log(`| Nível final (mediana) | ${median(rows.map((r) => r.nivel))} |`);
console.log(`| Abates (mediana) | ${median(rows.map((r) => r.abates))} |`);
console.log(`| Pico de inimigos (mediana / máx.) | ${median(rows.map((r) => r.pico_inimigos))} / ${Math.max(...rows.map((r) => r.pico_inimigos))} |`);
console.log(`| Corrupção final (mediana) | ${median(rows.map((r) => r.corrupcao_final))} |`);
console.log(`| Causas de derrota | ${Object.entries(causes).map(([k, v]) => `${k}: ${v}`).join(', ') || '—'} |`);
