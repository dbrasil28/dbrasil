"""Quadros das rodas girando para os carros da avenida (prototype/assets/veiculos).

Para cada vista (<carro>_<norte|sul>.webp), as rodas visíveis são elipses (pneu escuro) medidas à mão em
ELIPSES. O conteúdo de cada roda gira em torno do eixo (a elipse vira círculo, gira, volta a ser elipse)
em QUADROS passos de 90°/QUADROS (rodas de 4 furos se repetem a cada 90°). Saída: um atlas por vista,
<carro>_<sentido>_rodas.webp, com uma linha por roda e uma coluna por quadro, e as medidas para
RODAS em config.js (caixa de cada roda na imagem do carro e a linha dela no atlas).
Uso: python3 -I tools/rodas-carros.py
"""
import json, math, os
import numpy as np, cv2
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASTA = os.path.join(RAIZ, 'prototype/assets/veiculos')
QUADROS = 4
# cx, cy, raio x, raio y, ângulo (graus), medidos na imagem de cada vista
ELIPSES = {
    'fusca_norte': [(322.9, 316.2, 17.4, 52.2, 15.7), (381.3, 129.1, 12.7, 47.4, 9.9)],
    'fusca_sul': [(324.7, 368.4, 22.0, 43.9, 16.5)],
    'brasilia_norte': [(328.0, 321.4, 20.2, 54.1, 7.9), (396.1, 130.5, 12.4, 46.8, 7.2)],
    'brasilia_sul': [(331.7, 365.8, 17.6, 54.4, 15.6), (398.9, 147.0, 12.7, 42.4, 10.5)],
    'uno_norte': [(328.2, 373.2, 17.0, 52.1, 5.7), (394.7, 154.2, 14.7, 51.2, 4.7)],
    'uno_sul': [(330.8, 399.5, 16.7, 49.5, 12.6), (396.6, 228.1, 11.0, 50.0, 13.3)],
}


def eh_roda(px):
    """Pixel de pneu ou aro: escuro, ou cinza sem cor e não muito claro; a lataria colorida ou branca fica fora."""
    f = px[..., :3].astype(np.float32) / 255
    mx, mn = f.max(-1), f.min(-1)
    sat = np.where(mx > 1e-3, (mx - mn) / np.maximum(mx, 1e-3), 0)
    return ((((mx < 0.42)) | ((sat < 0.3) & (mx < 0.8))) & (px[..., 3] > 128)).astype(np.float32)


def quadro(img, e, giro):
    cx, cy, rx, ry, ang = e
    t = math.radians(ang)
    R = np.array([[math.cos(t), -math.sin(t)], [math.sin(t), math.cos(t)]])
    A = R @ np.diag([rx, ry])  # círculo unitário -> elipse
    G = np.array([[math.cos(giro), -math.sin(giro)], [math.sin(giro), math.cos(giro)]])
    M = A @ G @ np.linalg.inv(A)  # gira dentro da elipse
    x0, y0 = int(cx - max(rx, ry) - 2), int(cy - max(rx, ry) - 2)
    w = h = int(2 * max(rx, ry) + 5)
    ys, xs = np.mgrid[y0:y0 + h, x0:x0 + w].astype(np.float32)
    d = np.stack([xs - cx, ys - cy], -1) @ np.linalg.inv(M).T  # de onde vem cada pixel
    mapx = (d[..., 0] + cx).astype(np.float32)
    mapy = (d[..., 1] + cy).astype(np.float32)
    f = img.astype(np.float32)
    f[..., :3] *= f[..., 3:4] / 255
    out = cv2.remap(f, mapx, mapy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    # só dentro da elipse e só onde há roda (pneu e aro: cinza ou escuro, sem a cor da lataria) tanto no
    # pixel de destino quanto no de origem; o resto fica transparente (a imagem do carro aparece por baixo)
    u = np.stack([xs - cx, ys - cy], -1) @ np.linalg.inv(A).T
    r = np.sqrt((u ** 2).sum(-1))
    dentro = np.clip((0.97 - r) / 0.08, 0, 1)
    orig = img[y0:y0 + h, x0:x0 + w]
    if orig.shape[:2] != (h, w):
        pad = np.zeros((h, w, 4), np.uint8); pad[:orig.shape[0], :orig.shape[1]] = orig; orig = pad
    rodaD = eh_roda(orig)
    src = cv2.remap(img, mapx, mapy, cv2.INTER_NEAREST, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    rodaO = eh_roda(src)
    mask = (dentro * rodaD * rodaO)[..., None]
    out *= mask
    a = out[..., 3:4] / 255
    rgb = np.where(a > 1e-4, out[..., :3] / np.maximum(a, 1e-4), 0)
    return np.clip(np.concatenate([rgb, out[..., 3:4]], -1) + 0.5, 0, 255).astype(np.uint8), (x0, y0, w, h)


def main():
    meta = {}
    for nome, els in ELIPSES.items():
        img = np.array(Image.open(os.path.join(PASTA, f'{nome}.webp')).convert('RGBA'))
        linhas, caixas = [], []
        for e in els:
            fs = []
            for q in range(QUADROS):
                p, caixa = quadro(img, e, math.radians(q * 90 / QUADROS))
                fs.append(p)
            linhas.append(np.concatenate(fs, 1)); caixas.append(caixa)
        W = max(l.shape[1] for l in linhas)
        atlas = np.zeros((sum(l.shape[0] for l in linhas), W, 4), np.uint8)
        y = 0
        rows = []
        for l, c in zip(linhas, caixas):
            atlas[y:y + l.shape[0], :l.shape[1]] = l
            rows.append([c[0], c[1], c[2], c[3], y]); y += l.shape[0]
        Image.fromarray(atlas).save(os.path.join(PASTA, f'{nome}_rodas.webp'), quality=90, method=6)
        meta[nome] = rows
    print(json.dumps({'quadros': QUADROS, 'rodas': meta}))


if __name__ == '__main__':
    main()
