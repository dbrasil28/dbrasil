"""Atlas de um veículo com piloto (16 direções × 6 quadros) a partir das 4 folhas 6×4 do pacote.

Diferente da caminhada (tools/montar-atlas.py), o veículo de lado é mais largo que alto: a célula é larga
e a escala é uma só para todas as direções (a moto não encolhe de lado nem cresce de frente). Cada figura é
separada por componentes conectados e encostada pela roda mais baixa na base da célula, centrada pela caixa.

Uso: python3 -I tools/montar-veiculo.py <pacote com folhas/folha_1..4.png> <saída.webp> [--cw=280 --ch=220 --alt=150]
     --alt: altura, em px da célula, da maior figura (a de frente ou de costas, com o piloto).
Grava também <saída>.json com a célula e a escala. Requer Pillow, numpy e opencv-python.
"""
import json
import os
import sys

import cv2
import numpy as np
from PIL import Image

flags = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--'))
pkg, out = [a for a in sys.argv[1:] if not a.startswith('--')][:2]
CW, CH, ALT = int(flags.get('cw', 280)), int(flags.get('ch', 220)), int(flags.get('alt', 150))
TH = 24

figs = {}
for folha in range(4):
    im = np.array(Image.open(os.path.join(pkg, 'folhas', f'folha_{folha + 1}.png')).convert('RGBA'))
    a = im[:, :, 3] > TH
    n, lab, st, _ = cv2.connectedComponentsWithStats(a.astype(np.uint8), 8)
    big = [i for i in range(1, n) if st[i, 4] > 1500]
    cw, ch = im.shape[1] / 6, im.shape[0] / 4
    for i in big:
        cx, cy = st[i, 0] + st[i, 2] / 2, st[i, 1] + st[i, 3] / 2
        r, f = int(cy // ch), int(cx // cw)
        mask = lab == i
        # pedaços soltos perto (espelho, pedaleira) entram na figura
        for j in range(1, n):
            if j in big or st[j, 4] < 12:
                continue
            x0, y0, w, h = st[j, :4]
            if x0 + w >= st[i, 0] - 6 and x0 <= st[i, 0] + st[i, 2] + 6 and y0 + h >= st[i, 1] - 6 and y0 <= st[i, 1] + st[i, 3] + 6:
                mask |= lab == j
        ys, xs = np.nonzero(mask)
        src = im.copy()
        src[:, :, 3] = np.where(mask, src[:, :, 3], 0)
        figs[(folha * 4 + r, f)] = Image.fromarray(src[ys.min():ys.max() + 1, xs.min():xs.max() + 1])
assert len(figs) == 96, f'esperava 96 figuras, achei {len(figs)}'
maior = max(im.height for im in figs.values())
escala = ALT / maior
atlas = Image.new('RGBA', (CW * 6, CH * 16), (0, 0, 0, 0))
fora = 0
for (r, f), im in figs.items():
    w, h = max(1, round(im.width * escala)), max(1, round(im.height * escala))
    im = im.resize((w, h), Image.LANCZOS)
    x, y = (CW - w) // 2, CH - 4 - h
    if x < 0 or y < 0:
        fora += 1
    cel = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
    cel.alpha_composite(im, (max(0, x), max(0, y)), (max(0, -x), max(0, -y)))
    atlas.paste(cel, (f * CW, r * CH))
atlas.save(out, 'WEBP', quality=86, method=6)
json.dump({'cw': CW, 'ch': CH, 'cols': 6, 'rows': 16, 'alt': ALT, 'escala': round(escala, 4)}, open(os.path.splitext(out)[0] + '.json', 'w'))
print(f'{out}: {atlas.size}, escala {escala:.3f}, figuras que passam da célula: {fora}')
