"""Troca direções de um atlas de caminhada pelo espelho da direção oposta.

Os pacotes v2 dos moradores, do Cracudo e do Trombadinha vieram com 202,5°, 225° e 247,5° (costas indo
para a esquerda) desenhadas andando para a direita. A direção θ é o espelho de 360° − θ, então essas
linhas viram o espelho de 157,5°, 135° e 112,5°. Só espelha na horizontal: nada é girado ou entortado.

Uso: python3 -I tools/espelhar-direcoes.py <caminhada_atlas.webp> [destino:origem ...]
     (sem pares: 9:7 10:6 11:5, as três direções acima). Linhas de 0 a 15 (22,5° cada).
Requer Pillow.
"""
import sys

from PIL import Image, ImageOps

CW, CH, COLS = 200, 160, 6  # célula e quadros do atlas de caminhada (tools/montar-atlas.py)


def main():
    path = sys.argv[1]
    pares = [tuple(int(v) for v in p.split(':')) for p in sys.argv[2:]] or [(9, 7), (10, 6), (11, 5)]
    im = Image.open(path).convert('RGBA')
    for dst, src in pares:
        assert dst != src and (dst + src) % 16 == 0, f'{dst}:{src} não são direções opostas'
        for f in range(COLS):
            cel = ImageOps.mirror(im.crop((f * CW, src * CH, (f + 1) * CW, (src + 1) * CH)))
            im.paste(Image.new('RGBA', (CW, CH), (0, 0, 0, 0)), (f * CW, dst * CH))
            im.paste(cel, (f * CW, dst * CH))
    im.save(path, 'WEBP', quality=86, method=6)
    print(path, ', '.join(f'{d * 22.5:g}° ← espelho de {s * 22.5:g}°' for d, s in pares))


if __name__ == '__main__':
    main()
