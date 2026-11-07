// Folhas dos efeitos das habilidades (docs/arte/PEDIDO_EFEITOS_HABILIDADES.md, pacote v2). Cada folha é uma
// grade de quadros, lida da esquerda para a direita e de cima para baixo; a imagem está em IMAGES (sprites.js)
// como fx_<nome>. Sem DOM: a tabela vale para o jogo e para os testes.
//
//   cols, rows: a grade. n: quadros usados (padrão: cols × rows).
//   chao: deitada no chão, vista de cima (o jogo deita com a conta do chão); senão fica em pé, de frente.
//   dur: quanto dura a animação (s). laco: repete enquanto durar.
//   tamP / zP (em pé, presas a um corpo): largura da célula e altura do centro, em fração da altura do
//     personagem na tela (os personagens são desenhados 1,4 vez maiores que o metro).
//   cobreM / zM (no mundo): largura da célula em metros e altura do centro em metros. Peças que seguem o
//     tamanho de uma área (raio da explosão, da aura, da poça) recebem o tamanho em cada efeito.
//   luz: desenho somado (brilho de arco elétrico); o resto é desenho normal, com a luz do sol da arte.
export const FX = {
  // Capacete Bumerangue e a Entrega Expressa
  capacete_giro: { cols: 4, rows: 4 },
  entrega_giro: { cols: 4, rows: 4 },
  pancada: { cols: 3, rows: 2, dur: 0.32, tamP: 0.62, zP: 0.5 },
  entrega_ricochete: { cols: 3, rows: 2, dur: 0.32, tamP: 0.7, zP: 0.5 },
  // Chinelo Voador
  chinelo_giro: { cols: 4, rows: 4 },
  chinelada: { cols: 3, rows: 2, dur: 0.28, tamP: 0.55, zP: 0.5 },
  // Boleto Atrasado: 4 boletos (linhas) × 4 quadros
  boleto_folha: { cols: 4, rows: 4 },
  boleto_vento: { cols: 1, rows: 1, chao: true },
  cobranca: { cols: 3, rows: 2, dur: 0.34, tamP: 0.55, zP: 0.55 },
  // Carimbo Oficial
  carimbo_queda: { cols: 3, rows: 1 },
  carimbo_marca: { cols: 1, rows: 1, chao: true },
  carimbo_baque: { cols: 3, rows: 2, dur: 0.55, cobreM: 4.2, zM: 0.55 },
  // Maleta de Dinheiro
  explosao: { cols: 3, rows: 2, dur: 0.95 },
  explosao_fumaca: { cols: 3, rows: 2, dur: 1.6 }, // entra pelos quadros só de fumaça (de: 3), por cima do fim da explosão
  chamuscado: { cols: 1, rows: 1, chao: true, dur: 4 },
  notas: { cols: 4, rows: 4 },
  // Isopor de Picolé: 4 poças (2 × 2)
  pocas: { cols: 2, rows: 2, chao: true },
  congelado: { cols: 3, rows: 2, tamP: 0.85, zP: 0.33 },
  gelo_quebra: { cols: 3, rows: 2, dur: 0.42, tamP: 0.95, zP: 0.35 },
  // Mototáxi Amigo
  faixa_aviso: { cols: 1, rows: 1, chao: true },
  pneu_queimado: { cols: 1, rows: 1, chao: true, dur: 2.6 },
  poeira_moto: { cols: 3, rows: 2, dur: 0.55, cobreM: 2.6, zM: 0.7 },
  atropelo: { cols: 3, rows: 2, dur: 0.36, tamP: 0.8, zP: 0.45 },
  // Megafone da TV: a aura é uma marcação de área, não um furacão. suave: a imagem ganha um borrão leve e
  // some aos poucos para fora, como fumaça (pontos: [distância do centro, 0 a 1; quanto aparece]); alpha: o
  // quanto ela aparece no chão.
  // borda: onde fica o alcance na imagem já esfumaçada (o desenho cresce para o alcance bater nela).
  aura_base: { cols: 1, rows: 1, chao: true, borda: 0.88, suave: { desfoque: 0.02, pontos: [[0, 1], [0.7, 1], [0.88, 0.65], [1, 0]] }, alpha: 0.62 },
  aura_pulso: { cols: 3, rows: 2, chao: true, dur: 0.45, borda: 0.88, suave: { desfoque: 0.02, pontos: [[0, 1], [0.7, 1], [0.88, 0.65], [1, 0]] }, alpha: 0.45 },
  empurrao: { cols: 3, rows: 2, dur: 0.3, tamP: 0.5, zP: 0.55 },
  // Gato de Luz: 4 raios (linhas) de 3 m cada
  raio: { cols: 1, rows: 4, luz: true, compM: 3 },
  raio_estouro: { cols: 3, rows: 2, dur: 0.4, tamP: 0.95, zP: 0.55 },
  eletrocutado: { cols: 2, rows: 2, laco: true, fps: 16, tamP: 1.05, zP: 0.5 },
  raio_origem: { cols: 2, rows: 2, dur: 0.24, tamP: 0.36, zP: 0.55 },
  chamuscado_raio: { cols: 1, rows: 1, chao: true, dur: 2.6, cobreM: 1.6 },
  // Cachorro Caramelo
  mordida: { cols: 3, rows: 2, dur: 0.3, tamP: 0.5, zP: 0.28 },
  latido_onda: { cols: 3, rows: 2, chao: true, dur: 0.45, cobreM: 5.5 },
  poeira_patas: { cols: 3, rows: 2, dur: 0.4, tamP: 0.42, zP: 0.12 },
};

// impacto de cada habilidade em quem leva o golpe (o jogo põe no lugar do inimigo); espera: tempo mínimo
// entre dois impactos no mesmo inimigo (golpes que repetem rápido, como a aura e os boletos)
export const IMPACTO = {
  capacete: { fx: 'pancada', espera: 0.2 },
  entrega: { fx: 'entrega_ricochete', espera: 0.2 },
  chinelo: { fx: 'chinelada', espera: 0.15 },
  boleto: { fx: 'cobranca', espera: 0.45 },
  mototaxi: { fx: 'atropelo', espera: 0.3 },
  gato: { fx: 'raio_estouro', espera: 0.2 },
  caramelo: { fx: 'mordida', espera: 0.25 },
  microfone: { fx: 'empurrao', espera: 1.4, chance: 0.35 },
};

/** Recorte (px) do quadro f da folha, para uma imagem já carregada. */
export function quadro(F, im, f, out) {
  const n = F.n || F.cols * F.rows;
  const k = ((f % n) + n) % n;
  const cw = im.width / F.cols;
  const ch = im.height / F.rows;
  out.sx = (k % F.cols) * cw;
  out.sy = Math.floor(k / F.cols) * ch;
  out.sw = cw;
  out.sh = ch;
  return out;
}

/**
 * Animação suave: a posição entre dois quadros no tempo t, para misturar um no outro em vez de pular.
 * de: primeiro quadro usado (a fumaça da maleta começa nos quadros que só têm fumaça). Devolve [f0, f1, w].
 */
export function quadroMisto(F, t, dur = F.dur, de = 0, out = [0, 0, 0]) {
  const n = F.n || F.cols * F.rows;
  const p = de + Math.max(0, Math.min(1, t / (dur || 1))) * (n - 1 - de);
  out[0] = Math.floor(p);
  out[1] = Math.min(n - 1, out[0] + 1);
  out[2] = p - out[0];
  return out;
}

/** Quadro da animação no tempo t (de 0 a dur); no laço, pelo fps. */
export function quadroNoTempo(F, t, dur = F.dur) {
  const n = F.n || F.cols * F.rows;
  if (F.laco) return Math.floor(t * (F.fps || 12)) % n;
  return Math.min(n - 1, Math.floor((t / (dur || 1)) * n));
}
