"""Recorta as peças de uma folha de objetos gerada no Figma (fundo verde chapado #00FF00) em arquivos soltos.

Uso: python3 -I tools/recortar-pecas.py <folha.png> <pasta de saída> <prefixo> <nome1> <nome2> ...
  ex.: ... docs/arte/objetos_figma/baile_frontal_figma.webp <pasta> baile trelica canhao tv

- O verde-chave sai inteiro (a peça não pode ter verde) e a borda esverdeada perde o verde (como no
  tools/pacote-figma.py).
- Cada peça é o que está ligado no desenho (as partes perto umas das outras contam juntas: a corrente e o
  globo, os engradados e o bar). A ordem é a de leitura: de cima para baixo, da esquerda para a direita.
- Nada é girado nem espremido: só o recorte, com uma folga em volta.
- Grava <prefixo>_<nome>.webp e <prefixo>_pecas.json com o tamanho de cada uma (px) e a base (o pé da peça
  no meio de baixo), para o jogo pôr no chão.
"""
import json
import os
import sys

import cv2
import numpy as np
from PIL import Image

FOLGA = 6


def sem_verde(im):
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    ex = g - np.maximum(r, b)
    a = np.clip((90 - ex) / 50, 0, 1)
    g2 = np.where(ex > 0, np.maximum(r, b) + np.minimum(ex, 12), g)
    return np.dstack([r, g2, b, a * 255]).clip(0, 255).astype(np.uint8)


def main():
    src, out, prefixo, *nomes = sys.argv[1:]
    os.makedirs(out, exist_ok=True)
    im = np.array(Image.open(src).convert('RGB')).astype(np.float32)
    rgba = sem_verde(im)
    m = (rgba[..., 3] > 24).astype(np.uint8)
    # junta as partes perto (a corrente do globo, os engradados do bar) antes de separar as peças
    junto = cv2.dilate(m, np.ones((15, 15), np.uint8))
    n, lab, st, cen = cv2.connectedComponentsWithStats(junto, 8)
    pecas = [i for i in range(1, n) if st[i, 4] > 2000]
    if len(pecas) != len(nomes):
        raise SystemExit(f'achei {len(pecas)} peças, esperava {len(nomes)}')
    altura = im.shape[0]
    # ordem de leitura: uma fila junta as peças que se sobrepõem na altura; cada fila da esquerda para a direita
    filas = []
    for i in sorted(pecas, key=lambda i: st[i, 1]):
        y0, y1 = st[i, 1], st[i, 1] + st[i, 3]
        if filas and y0 < filas[-1]['y1'] - 0.3 * min(st[i, 3], filas[-1]['y1'] - filas[-1]['y0']):
            filas[-1]['pecas'].append(i)
            filas[-1]['y1'] = max(filas[-1]['y1'], y1)
        else:
            filas.append({'y0': y0, 'y1': y1, 'pecas': [i]})
    pecas = [i for f in filas for i in sorted(f['pecas'], key=lambda i: st[i, 0])]
    meta = {}
    for nome, i in zip(nomes, pecas):
        mask = (lab == i) & (m > 0)
        ys, xs = np.where(mask)
        y0, y1 = max(0, ys.min() - FOLGA), min(altura, ys.max() + 1 + FOLGA)
        x0, x1 = max(0, xs.min() - FOLGA), min(im.shape[1], xs.max() + 1 + FOLGA)
        corte = rgba[y0:y1, x0:x1].copy()
        corte[..., 3] = np.where(mask[y0:y1, x0:x1], corte[..., 3], 0)
        arq = f'{prefixo}_{nome}.webp'
        Image.fromarray(corte, 'RGBA').save(os.path.join(out, arq), quality=90, method=6)
        meta[nome] = {'arquivo': arq, 'w': int(x1 - x0), 'h': int(y1 - y0), 'base': [int((xs.min() + xs.max()) / 2 - x0), int(ys.max() - y0)]}
        print(f'{nome}: {x1 - x0}×{y1 - y0} px')
    with open(os.path.join(out, f'{prefixo}_pecas.json'), 'w') as f:
        json.dump(meta, f, indent=1, ensure_ascii=False)


if __name__ == '__main__':
    main()
