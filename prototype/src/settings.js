// Ajustes de teste. Cada item corresponde a uma hipótese aberta do pacote de conceito.
const KEY = 'bec.settings.v1';

export const SETTINGS_SCHEMA = [
  { id: 'map', label: 'Mapa', type: 'select', options: [['orla', 'Orla do Desespero (Rio) — calçadão'], ['aberto', 'Arena aberta (teste antigo)']], def: 'orla' },
  { id: 'playerPct', label: 'Altura do protagonista (% da área jogável)', type: 'range', min: 6, max: 14, step: 0.5, def: 8, hint: 'GDD: 8–11%; mockup aprovado: ~8%' },
  { id: 'enemyPct', label: 'Inimigo comum (% do protagonista)', type: 'range', min: 50, max: 110, step: 5, def: 90, hint: 'GDD: 60–80%; no mockup os adultos têm a altura do Juninho' },
  { id: 'elevation', label: 'Inclinação da câmera (°)', type: 'range', min: 35, max: 80, step: 1, def: 55, hint: '90° = vista de cima' },
  { id: 'yaw', label: 'Rotação da câmera', type: 'select', options: [['0', '0° — ruas retas (mockups)'], ['45', '45° — isometria diamante']], def: '0' },
  { id: 'joystick', label: 'Controle', type: 'select', options: [['floating', 'Joystick flutuante (toque em qualquer lugar)'], ['fixed', 'Joystick fixo (canto inferior esquerdo)']], def: 'floating', hint: 'Hipótese H07' },
  { id: 'maxEnemies', label: 'Limite de inimigos simultâneos', type: 'range', min: 100, max: 800, step: 50, def: 300, hint: 'Pergunta aberta 5' },
  { id: 'spawnMul', label: 'Intensidade das hordas', type: 'range', min: 0.5, max: 2, step: 0.1, def: 1 },
  { id: 'obstacles', label: 'Obstáculos (bancas, postes, cones)', type: 'toggle', def: true },
  { id: 'ads', label: 'Anúncios simulados', type: 'toggle', def: true, hint: 'Reviver e trocar cartas por anúncio; intervalo entre partidas' },
  { id: 'adLength', label: 'Duração do anúncio simulado', type: 'select', options: [['5', '5 s (teste rápido)'], ['15', '15 s'], ['30', '30 s (realista)']], def: '5' },
  { id: 'noAds', label: 'Simular compra "Sem anúncios"', type: 'toggle', def: false, hint: 'Tira intervalos e banner; vídeos com recompensa continuam opcionais' },
  { id: 'bannerMenu', label: 'Banner nos menus', type: 'toggle', def: false, hint: 'Nunca durante a partida' },
  { id: 'damageNumbers', label: 'Números de dano', type: 'toggle', def: true },
  { id: 'gore', label: 'Respingos e manchas', type: 'toggle', def: true },
  { id: 'shake', label: 'Tremor de câmera', type: 'toggle', def: true },
  { id: 'reduceFlashes', label: 'Reduzir flashes', type: 'toggle', def: false },
  { id: 'showFps', label: 'Mostrar FPS e contagem', type: 'toggle', def: false },
  { id: 'resolution', label: 'Resolução', type: 'select', options: [['auto', 'Automática (até 2x)'], ['1', '1x (mais leve)']], def: 'auto' },
  { id: 'elenco', label: 'Elenco completo desde o início', type: 'toggle', def: true, hint: 'Golpista, Burocrata e Fiscal desde 00:00 e o Político aos 12 s, para ver a arte. Desligado: ritmo normal (Golpista ~1:30, Político 1:30, Burocrata ~5:00, Fiscal ~6:00)' },
  { id: 'trecho', label: 'Começar no trecho', type: 'select', options: [['orla', 'Orla do Desespero'], ['morro', 'Subida do Morro (atalho de teste)']], def: 'orla', hint: 'Atalho de teste: começa no pé do morro, com a escadaria já aberta' },
  { id: 'startAt', label: 'Começar a partida em', type: 'select', options: [['0', '00:00'], ['115', '01:55 — 1ª proposta'], ['265', '04:25 — 2ª proposta'], ['415', '06:55 — 3ª proposta'], ['465', '07:45 — chefe']], def: '0', hint: 'Atalho de teste: começa com upgrades automáticos' },
];

export function defaultSettings() {
  const s = {};
  for (const f of SETTINGS_SCHEMA) s[f.id] = f.def;
  return s;
}

export function loadSettings() {
  const s = defaultSettings();
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      for (const f of SETTINGS_SCHEMA) if (f.id in saved && typeof saved[f.id] === typeof f.def) s[f.id] = saved[f.id];
    }
  } catch {
    /* armazenamento indisponível: segue com o padrão */
  }
  return s;
}

export function saveSettings(s) {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignora */
  }
}
