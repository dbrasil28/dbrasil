"""Transforma as folhas de um personagem geradas no Figma (fundo verde chapado) num pacote no formato dos
pacotes do GPT, pronto para tools/montar-atlas.py e tools/montar-poses.py.

Uso: python3 -I tools/pacote-figma.py <nome> <pacote de saída> <folha_1> <folha_2> <folha_3> <folha_4> \\
         [<estado>=<folha 4×4 de 16 ângulos> ...]
  ex.: ... chefe /tmp/pkg f1.png f2.png f3.png f4.png ataque=ataque.png furia=furia.png
Guarda as folhas originais em docs/arte/personagens_figma/<nome>/ e grava em <pacote>/folhas/:
folha_1..4.png (caminhada, grade 6×4) e <estado>_16_angulos.png (poses, grade 4×4), com fundo transparente.
O verde-chave sai inteiro (o personagem não pode ter verde); a borda esverdeada perde o verde.
"""
import os
import shutil
import sys

import cv2
import numpy as np
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def sem_verde(path):
    im = np.array(Image.open(path).convert('RGB')).astype(np.float32)
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    ex = g - np.maximum(r, b)
    a = np.clip((90 - ex) / 50, 0, 1)
    g2 = np.where(ex > 0, np.maximum(r, b) + np.minimum(ex, 12), g)
    rgba = np.dstack([r, g2, b, a * 255]).clip(0, 255).astype(np.uint8)
    m = (rgba[..., 3] > 24).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    keep = np.zeros(n, bool)
    keep[1:] = st[1:, 4] >= 40  # névoa solta no fundo some
    rgba[..., 3] = np.where(keep[lab], rgba[..., 3], 0)
    big = int((st[1:, 4] > 3000).sum())
    return rgba, big


def main():
    nome, pkg, *resto = sys.argv[1:]
    folhas, estados = resto[:4], [a.split('=', 1) for a in resto[4:]]
    assert len(folhas) == 4, 'são 4 folhas de caminhada'
    arte = os.path.join(RAIZ, 'docs/arte/personagens_figma', nome)
    os.makedirs(arte, exist_ok=True)
    os.makedirs(os.path.join(pkg, 'folhas'), exist_ok=True)
    itens = [(f'folha_{i + 1}', p, 24) for i, p in enumerate(folhas)] + [(f'{e}_16_angulos', p, 16) for e, p in estados]
    for out, p, esperado in itens:
        shutil.copyfile(p, os.path.join(arte, f'{out}_figma.png'))
        rgba, big = sem_verde(p)
        Image.fromarray(rgba).save(os.path.join(pkg, 'folhas', f'{out}.png'))
        aviso = '' if big == esperado else f'  ATENÇÃO: esperava {esperado}'
        print(f'{out}: {big} figuras{aviso}')


if __name__ == '__main__':
    main()
