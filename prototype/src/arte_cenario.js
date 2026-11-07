// Arte do cenário (imagem gerada por IA e recortada, PNG/WebP transparente). Esta tabela é o contrato
// entre a arte e o jogo: medidas do objeto no chão (m), folga do quadro em volta e as variações que já
// existem. A imagem tem a origem no canto da frente, à esquerda, no chão, na escala de 128 px por metro.
// Sem arte, o jogo desenha o objeto como um bloco simples (render_cenario.js).
export const ART_S = 128; // px por metro na imagem
export const ART_K = Math.sin((55 * Math.PI) / 180);

// w, d, h: largura, fundo e altura (m). padX: folga dos lados; top: quanto o quadro sobe acima da origem;
// bot: quanto desce abaixo dela (sombra). files: variações (arquivo <tipo>_<variação>.webp).
export const ART = {
  carro: { w: 4.0, d: 1.8, h: 1.45, padX: 0.5, top: 3.2, bot: 0.45, files: ['fusca'] },
  onibus: { w: 8.8, d: 2.5, h: 3.0, padX: 0.5, top: 5.4, bot: 0.5, files: [] },
  banca: { w: 2.4, d: 1.6, h: 2.3, padX: 0.5, top: 3.9, bot: 0.4, files: [] },
  milho: { w: 1.4, d: 0.8, h: 1.1, padX: 0.8, top: 2.9, bot: 0.35, files: [] },
  picole: { w: 1.2, d: 0.8, h: 1.0, padX: 0.8, top: 2.8, bot: 0.35, files: [] },
  banco: { w: 1.9, d: 0.55, h: 0.9, padX: 0.35, top: 1.5, bot: 0.3, files: [] },
  lixeira: { w: 0.5, d: 0.5, h: 1.0, padX: 0.45, top: 1.6, bot: 0.3, files: [] },
  orelhao: { w: 0.6, d: 0.5, h: 2.1, padX: 0.55, top: 2.7, bot: 0.3, files: [] },
  muro: { w: 4.4, d: 0.4, h: 2.4, padX: 0.3, top: 3.0, bot: 0.35, files: [] },
  tapume: { w: 4.6, d: 0.3, h: 2.2, padX: 0.3, top: 2.7, bot: 0.35, files: [] },
  // barracas soltas no meio do calçadão: o retângulo é o balcão (o toldo passa 0,4 m de cada lado)
  barraca_acai: { w: 3.4, d: 1.3, h: 1.1, padX: 0.75, top: 3.6, bot: 0.4, files: [] },
  barraca_pastelaria: { w: 3.4, d: 1.3, h: 1.1, padX: 0.75, top: 3.6, bot: 0.4, files: [] },
  barraca_boteco: { w: 3.4, d: 1.3, h: 1.1, padX: 0.75, top: 3.6, bot: 0.4, files: [] },
};

export const artKey = (kind, file) => `cen_${kind}_${file}`;
export const artPath = (kind, file) => `assets/cenario/orla/${kind}_${file}.webp`;

/** Escolhe a variação pelo número fixo do objeto (0 a 1). */
export const artFile = (kind, v) => {
  const f = ART[kind].files;
  return f.length ? f[Math.floor(v * f.length * 7) % f.length] : null;
};
