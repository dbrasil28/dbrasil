"""Monta um atlas de dança (ou de pose parada) a partir de uma folha de personagem feita no ChatGPT.

Uso: python3 -I tools/montar-danca.py <folha.png> <saida.webp> <colunas>x<linhas> <linhas usadas> <quadros usados> [altura]
  ex.: ... input_file_10.png prototype/assets/personagens/cidadao_a/danca_atlas.webp 6x4 0,1,2 0,1,2,3,4

- O melhor fundo é o verde chapado (#00FF00): sai limpo, como no tools/recortar-pecas.py, e o verde que respinga na
  borda da pessoa é tirado (a pessoa não pode ter verde). Também serve fundo transparente de verdade ou preto liso.
- O xadrez "de transparência" PINTADO na imagem (o ChatGPT faz muito isso) só sai pela metade: quadradinho preto
  e cinza tem a cor de roupa e de cabelo, e o recorte deixa cacos em volta da pessoa (a regra mais solta come
  roupa). Nesse caso a ferramenta avisa; peça a folha de novo com o fundo verde.
- Cada célula vira uma célula de 200x160 (como os atlas de caminhada): a figura com o pé em y=155, no meio do pé.
- A escala é uma só para a folha inteira: o primeiro quadro da primeira linha usada fica com [altura] px (122 por
  padrão, para o braço para cima caber na célula). O jogo usa esse número como figureH. Nada é girado nem espremido.
- Grava o atlas (linhas usadas x quadros usados) e mostra a altura de cada quadro.
"""
import sys

import cv2
import numpy as np
from PIL import Image

CW, CH, PE = 200, 160, 155
BURACO_MAX = 500  # px (numa célula de 256): buraco menor que isso dentro da pessoa é roupa, não fundo


def cores_do_xadrez(rgb):
    """As duas cores do xadrez (luminância), pelos dois picos da borda, e o tamanho do quadradinho."""
    lum = rgb.mean(axis=2)
    borda = np.concatenate([lum[:4].ravel(), lum[-4:].ravel(), lum[:, :4].ravel(), lum[:, -4:].ravel()])
    hist, ed = np.histogram(borda, bins=64, range=(0, 256))
    a = int(np.argmax(hist))
    hist2 = hist.copy()
    hist2[max(0, a - 6):a + 7] = 0
    b = int(np.argmax(hist2))
    ca, cb = (ed[a] + ed[a + 1]) / 2, (ed[b] + ed[b + 1]) / 2
    # o quadradinho: o comprimento mediano dos trechos de mesma cor na borda de cima
    k = np.abs(lum[3] - ca) < np.abs(lum[3] - cb)
    trocas = np.where(np.diff(k.astype(np.int8)) != 0)[0]
    s = float(np.median(np.diff(trocas))) if len(trocas) > 4 else 10.0
    return ca, cb, s


def mascara_fundo(rgb):
    h, w, _ = rgb.shape
    lum = rgb.mean(axis=2)
    sat = rgb.max(axis=2).astype(np.int32) - rgb.min(axis=2)
    borda = np.concatenate([rgb[:3].reshape(-1, 3), rgb[-3:].reshape(-1, 3), rgb[:, :3].reshape(-1, 3), rgb[:, -3:].reshape(-1, 3)])
    bi = borda.astype(np.int32)
    if ((bi[:, 1] - np.maximum(bi[:, 0], bi[:, 2])) > 90).mean() > 0.8:
        # fundo verde chapado: sai o verde (a pessoa não pode ter verde)
        ri = rgb.astype(np.int32)
        return (ri[..., 1] - np.maximum(ri[..., 0], ri[..., 2])) > 60, True
    if borda.max(axis=1).mean() < 30 and borda.max(axis=1).std() < 12:
        cand = rgb.max(axis=2) < 22  # fundo preto liso
    else:
        # xadrez pintado: um ponto é do xadrez se a um quadradinho para o lado E para cima (ou baixo) a cor é a
        # outra do par. Roupa cinza da mesma cor de um dos quadradinhos não alterna assim, e fica.
        print('  aviso: fundo de xadrez pintado; o recorte deixa cacos em volta da pessoa. Melhor pedir fundo verde.')
        ca, cb, s = cores_do_xadrez(rgb)
        tol = max(14, abs(ca - cb) * 0.3)
        K = np.full((h, w), 2, np.int8)
        neutro = sat < 34
        K[neutro & (np.abs(lum - ca) < tol)] = 0
        K[neutro & (np.abs(lum - cb) < tol)] = 1
        # quantos dos 4 vizinhos a um quadradinho de distância (esquerda, direita, cima, baixo) têm a outra cor
        outro = np.zeros((h, w), np.int8)
        for eixo in (0, 1):
            for sinal in (1, -1):
                bate = np.zeros((h, w), bool)
                for o in {int(round(s)) - 1, int(round(s)), int(round(s)) + 1}:
                    bate |= np.roll(K, sinal * o, axis=eixo) == 1 - K
                outro += bate
        cand = (K != 2) & (outro >= 3)
        # as juntas entre quadradinhos (meio-tom do antialias): fundo se encostam em fundo e não têm cor
        perto = cv2.dilate(cand.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
        cand |= perto & neutro & (lum > min(ca, cb) - tol) & (lum < max(ca, cb) + tol)
    n, lab = cv2.connectedComponents(cand.astype(np.uint8), connectivity=4)
    na_borda = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fundo = np.isin(lab, list(na_borda))
    # o que sobrou do xadrez em ilhas pequenas, fora da pessoa: fecha com uma abertura
    fundo = cv2.morphologyEx(fundo.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8)).astype(bool)
    return fundo, False


def main():
    src, out, grade, linhas, quadros, *resto = sys.argv[1:]
    cols, rows = map(int, grade.split('x'))
    linhas = [int(v) for v in linhas.split(',')]
    quadros = [int(v) for v in quadros.split(',')]
    alvo = float(resto[0]) if resto else 122.0
    im = Image.open(src)
    rgba = np.array(im.convert('RGBA'))
    rgb = rgba[..., :3]
    verde = False
    if im.mode == 'RGBA' and (rgba[..., 3] < 250).mean() > 0.2:
        alfa = rgba[..., 3] > 40
    else:
        fundo, verde = mascara_fundo(rgb)
        alfa = ~fundo
    if verde:
        # o verde que respinga na borda (e o do JPEG em volta): o verde nunca passa do maior dos outros dois
        ri = rgba[..., :3].astype(np.int32)
        ri[..., 1] = np.minimum(ri[..., 1], np.maximum(ri[..., 0], ri[..., 2]))
        rgba[..., :3] = ri.astype(np.uint8)
        # e a borda de 1 px, onde o verde se mistura com a pessoa
        alfa = cv2.erode(alfa.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    h, w = alfa.shape
    cw, ch = w / cols, h / rows
    celulas = {}
    for r in linhas:
        for f in quadros:
            x0, y0 = int(round(f * cw)), int(round(r * ch))
            x1, y1 = int(round((f + 1) * cw)), int(round((r + 1) * ch))
            m = alfa[y0:y1, x0:x1].astype(np.uint8)
            # só a pessoa: o maior pedaço e o que está perto dele (a bolsa, o braço)
            n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
            if n <= 1:
                raise SystemExit(f'célula vazia: linha {r} quadro {f}')
            maior = 1 + int(np.argmax(st[1:, 4]))
            bx, by, bw, bh = st[maior, :4]
            manter = np.zeros_like(m, bool)
            for i in range(1, n):
                cx, cy, cw2, ch2, area = st[i]
                if i == maior or (area > 30 and cx < bx + bw + 8 and cx + cw2 > bx - 8 and cy < by + bh + 8 and cy + ch2 > by - 8):
                    manter |= lab == i
            # buraquinho dentro da pessoa (o xadrez comeu um pedaço de roupa escura da mesma cor): fecha. No fundo
            # verde não: ali o vão entre o braço e o corpo é fundo mesmo
            fora = (~manter).astype(np.uint8) if not verde else np.zeros_like(m)
            nb, lb, sb, _ = cv2.connectedComponentsWithStats(fora, 4)
            borda_lab = set(np.unique(np.concatenate([lb[0], lb[-1], lb[:, 0], lb[:, -1]])))
            for i in range(1, nb):
                if i not in borda_lab and sb[i, 4] < BURACO_MAX * (cw * ch) / (256 * 256):
                    manter |= lb == i
            ys, xs = np.where(manter)
            cel = rgba[y0:y1, x0:x1].copy()
            cel[..., 3] = np.where(manter, 255, 0)
            pe = ys.max()
            baixo = xs[ys > pe - (pe - ys.min()) * 0.12]
            meio = (baixo.min() + baixo.max()) / 2
            celulas[(r, f)] = (cel, ys.min(), pe, meio)
    # quadro quebrado (bem mais baixo que os outros da linha: a pessoa saiu cortada): usa o da linha vizinha
    for r in linhas:
        alts = {f: celulas[(r, f)][2] - celulas[(r, f)][1] for f in quadros}
        med = float(np.median(list(alts.values())))
        for f, a in alts.items():
            if a < med * 0.7:
                viz = [q for q in linhas if q != r and celulas[(q, f)][2] - celulas[(q, f)][1] >= med * 0.7]
                if viz:
                    q = min(viz, key=lambda q: abs(q - r))
                    print(f'  linha {r} quadro {f} veio cortado: uso o da linha {q}')
                    celulas[(r, f)] = celulas[(q, f)]
    r0, f0 = linhas[0], quadros[0]
    _, topo, pe, _ = celulas[(r0, f0)]
    esc = alvo / (pe - topo)
    atlas = Image.new('RGBA', (CW * len(quadros), CH * len(linhas)), (0, 0, 0, 0))
    for i, r in enumerate(linhas):
        alturas = []
        for j, f in enumerate(quadros):
            cel, topo, pe, meio = celulas[(r, f)]
            img = Image.fromarray(cel, 'RGBA')
            img = img.resize((max(1, round(img.width * esc)), max(1, round(img.height * esc))), Image.LANCZOS)
            ox = round(j * CW + CW / 2 - meio * esc)
            oy = round(i * CH + PE - pe * esc)
            alturas.append(round((pe - topo) * esc))
            if oy + topo * esc < i * CH - 1:
                print(f'  aviso: linha {r} quadro {f} passa do alto da célula')
            camada = Image.new('RGBA', atlas.size, (0, 0, 0, 0))
            camada.paste(img, (ox, oy))
            # cada figura só na célula dela
            caixa = (j * CW, i * CH, (j + 1) * CW, (i + 1) * CH)
            atlas.alpha_composite(camada.crop(caixa), caixa[:2])
        print(f'linha {r}: alturas {alturas}')
    atlas.save(out, quality=90, method=6)
    print(f'gravado {out}: {len(linhas)} linhas x {len(quadros)} quadros, figureH {round(alvo)}')


if __name__ == '__main__':
    main()
