"""O Acordão na TV do baile, tirado do busto aprovado pelo autor (docs/arte/conceito_acordao/bustos_viloes.png).

Pedido do autor: as mesmas caras em todas as imagens, sem gerar fotos novas. Por isso sai daqui uma folha com
2 quadros do MESMO recorte, lado a lado:
  quadro 0: olhos normais (o brilho azul apagado no próprio desenho: a íris fica escura);
  quadro 1: olhos acesos (o desenho original, como foi aprovado).
O jogo mostra o quadro 0 quando o Plantão entra e passa para o 1 quando a zoeira começa (BAILE.cenaTv.olhosTvS).

uso: python3 -I tools/acordao-tv.py docs/arte/conceito_acordao/bustos_viloes.png prototype/assets/cenario/favela/baile_acordao_tv.webp
"""
import sys
import numpy as np
from PIL import Image

src, out = sys.argv[1:3]
X0, Y0, X1, Y1 = 388, 96, 1152, 526          # o busto do meio (O Acordão: as duas cabeças), sem os vizinhos
OLHOS = [(625, 327), (720, 302), (838, 316), (932, 334)]   # centro de cada olho na folha original
HALO, MIOLO = 34, 13                          # raio do brilho em volta e da parte que vira íris (px)
W, H = 768, 432                               # cada quadro (a TV tem 2,3 × 1,3 m)

im = np.array(Image.open(src).convert('RGB')).astype(float)
aceso = im[Y0:Y1, X0:X1].copy()
normal = aceso.copy()
yy, xx = np.mgrid[0:aceso.shape[0], 0:aceso.shape[1]]
for ox, oy in OLHOS:
    d = np.hypot(xx - (ox - X0), yy - (oy - Y0))
    perto = d < HALO
    R, G, B = normal[..., 0], normal[..., 1], normal[..., 2]
    # o azul do brilho volta para o tom da pele em volta, mais forte perto do olho
    k = np.clip(1 - d / HALO, 0, 1) ** 0.6
    g2 = np.minimum(G, R * 0.86)
    b2 = np.minimum(B, R * 0.72)
    G[perto] = G[perto] * (1 - k[perto]) + g2[perto] * k[perto]
    B[perto] = B[perto] * (1 - k[perto]) + b2[perto] * k[perto]
    # o miolo aceso vira íris escura, com a beirada misturada
    m = np.clip((MIOLO + 3 - d) / 6, 0, 1)
    lum = (R + G + B) / 3
    m = m * np.clip((lum - 70) / 60, 0, 1)        # só onde estava claro (o brilho), não na pálpebra
    for c, v in enumerate((52, 40, 34)):
        normal[..., c] = normal[..., c] * (1 - m) + v * m


def vinheta(q):
    """Escurece as beiradas (esquerda 120 px, direita 90 px) para sumir o ombro dos bustos vizinhos."""
    h, w = q.shape[:2]
    x = np.arange(w)
    a = np.minimum(np.clip(x / 120, 0, 1), np.clip((w - 1 - x) / 90, 0, 1)) ** 1.4
    fundo = np.array([8, 14, 22], float)
    return q * a[None, :, None] + fundo * (1 - a[None, :, None])


folha = Image.new('RGB', (W * 2, H))
for i, q in enumerate((normal, aceso)):
    q = Image.fromarray(np.clip(vinheta(q), 0, 255).astype(np.uint8)).resize((W, H), Image.LANCZOS)
    folha.paste(q, (i * W, 0))
folha.save(out, quality=88, method=6)
print('folha', folha.size, '->', out)
print('olhos (0 a 1 em cada quadro):', [[round((ox - X0) / (X1 - X0), 4), round((oy - Y0) / (Y1 - Y0), 4)] for ox, oy in OLHOS])
