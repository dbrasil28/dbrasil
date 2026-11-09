"""Monta o atlas do Juninho recebendo a aura (D89) a partir da folha 6×4 do pedido PEDIDO_JUNINHO_AURA.md.

Uso: python3 -I tools/montar-aura.py <folha.png|webp> <pasta_saida> [--previa <saida.gif>]

- A folha chegou com a grade torta (as figuras não ficam no meio das células e algumas encostam na vizinha),
  então cada figura é separada pelo próprio desenho (partes ligadas) e vai para a célula onde está o centro dela.
- Escala: a pose em pé do fim (quadro 24) fica com FIGURA_H px, a mesma altura do Juninho na caminhada.
  Todas as figuras usam essa mesma escala (o encolhido é menor porque está encolhido).
- Chão: a linha dos pés dos quadros de pouso (21 a 24) vira a linha PE da célula; os quadros no ar guardam a
  altura em que foram desenhados em relação a essa linha. No meio: o centro do tronco (metade de cima da figura).
- Nada é girado nem espremido: só recorte, escala uniforme e posição.
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

COLS, ROWS = 6, 4
CW, CH = 200, 176  # célula do atlas
PE = 168  # linha do chão na célula (sobra embaixo para a ponta do pé no ar)
FIGURA_H = 155  # altura do Juninho em pé (a mesma da caminhada)


def main():
    args = sys.argv[1:]
    previa = None
    if '--previa' in args:
        i = args.index('--previa')
        previa = args[i + 1]
        del args[i:i + 2]
    src, out = Path(args[0]), Path(args[1])
    out.mkdir(parents=True, exist_ok=True)
    im = np.array(Image.open(src).convert('RGBA')).astype(np.float32)
    H, W = im.shape[:2]
    # a compressão deixou um véu de alfa 1 a 6 no fundo e o corpo em 246 a 254: limpa e devolve o opaco
    a = np.clip((im[..., 3] - 8) / (244 - 8), 0, 1)
    im[..., 3] = a * 255
    m = (a > 0.08).astype(np.uint8)
    n, lab, st, cen = cv2.connectedComponentsWithStats(m, connectivity=8)
    pw, ph = W / COLS, H / ROWS
    dono = {}
    for i in range(1, n):
        if st[i, 4] < 6:
            continue  # pontinho solto
        c = min(COLS - 1, int(cen[i][0] // pw))
        r = min(ROWS - 1, int(cen[i][1] // ph))
        dono.setdefault(r * COLS + c, []).append(i)
    assert len(dono) == COLS * ROWS, f'achei {len(dono)} figuras, esperava {COLS * ROWS}'
    figs = []
    for k in range(COLS * ROWS):
        r = k // COLS
        mk = np.isin(lab, dono[k])
        ys, xs = np.where(mk)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        rgba = im[y0:y1, x0:x1].copy()
        rgba[..., 3] *= mk[y0:y1, x0:x1]
        al = rgba[..., 3]
        meio = al[: max(1, (y1 - y0) // 2)]  # metade de cima: cabeça, ombros e peito (o capacete fica no quadril)
        cx = x0 + (meio.sum(axis=0) * np.arange(x1 - x0)).sum() / meio.sum()
        figs.append({'k': k, 'r': r, 'rgba': rgba, 'x0': x0, 'y0': y0, 'h': y1 - y0, 'cx': cx, 'pe': y1 - r * ph})
    s = FIGURA_H / figs[23]['h']
    chao = float(np.median([f['pe'] for f in figs[20:24]]))  # linha dos pés no pouso, medida do alto da linha
    atlas = Image.new('RGBA', (CW * COLS, CH * ROWS), (0, 0, 0, 0))
    meta = {'cols': COLS, 'rows': ROWS, 'cw': CW, 'ch': CH, 'pe': PE, 'figureH': FIGURA_H, 'escala_da_folha': round(s, 4), 'quadros': []}
    for f in figs:
        h, w = f['rgba'].shape[:2]
        nw, nh = max(1, round(w * s)), max(1, round(h * s))
        # escala com o alfa pré-multiplicado (a borda não escurece nem clareia)
        pm = f['rgba'].copy()
        pm[..., :3] *= pm[..., 3:4] / 255
        res = cv2.resize(pm, (nw, nh), interpolation=cv2.INTER_AREA)
        al = np.clip(res[..., 3:4], 1e-3, 255)
        res[..., :3] = np.where(res[..., 3:4] > 0.5, res[..., :3] * 255 / al, 0)
        fig = Image.fromarray(np.clip(res, 0, 255).astype(np.uint8), 'RGBA')
        c, r = f['k'] % COLS, f['r']
        # o centro do tronco vai para o meio da célula; o chão do desenho, para a linha PE
        dx = CW / 2 - (f['cx'] - f['x0']) * s
        topo_na_linha = f['y0'] - r * ph  # alto da figura, medido do alto da linha da folha
        dy = PE - (chao - topo_na_linha) * s
        px, py = round(c * CW + dx), round(r * CH + dy)
        cortado = dx < 0 or dy < 0 or dx + nw > CW or dy + nh > CH
        atlas.alpha_composite(fig, (px, py)) if not cortado else colar_cortado(atlas, fig, px, py, c, r)
        meta['quadros'].append({'quadro': f['k'] + 1, 'w': nw, 'h': nh, 'x': round(dx), 'y': round(dy), 'cortado': bool(cortado)})
        if cortado:
            print(f'aviso: quadro {f["k"] + 1} passa da célula (x {dx:.0f}..{dx + nw:.0f}, y {dy:.0f}..{dy + nh:.0f})')
    atlas.save(out / 'aura_atlas.webp', quality=92, method=6)
    (out / 'aura_meta.json').write_text(json.dumps(meta, indent=1, ensure_ascii=False))
    print('escala', round(s, 4), 'chão da folha', chao, '→', out / 'aura_atlas.webp')
    if previa:
        fazer_previa(atlas, previa)


def colar_cortado(atlas, fig, px, py, c, r):
    """Cola só o que cabe na célula (não invade a vizinha)."""
    tmp = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
    tmp.paste(fig, (px - c * CW, py - r * CH), fig)
    atlas.alpha_composite(tmp, (c * CW, r * CH))


def fazer_previa(atlas, saida):
    """GIF dos 24 quadros em fundo escuro, com a linha do chão, para conferir se o corpo pula."""
    quadros = []
    for k in range(COLS * ROWS):
        c, r = k % COLS, k // COLS
        cel = atlas.crop((c * CW, r * CH, (c + 1) * CW, (r + 1) * CH))
        bg = Image.new('RGBA', (CW, CH), (28, 22, 40, 255))
        for x in range(0, CW, 4):
            bg.putpixel((x, PE), (255, 210, 60, 255))
        for y in range(0, CH, 4):
            bg.putpixel((CW // 2, y), (90, 90, 120, 255))
        bg.alpha_composite(cel)
        quadros.append(bg.convert('RGB').resize((CW * 2, CH * 2), Image.NEAREST))
    quadros[0].save(saida, save_all=True, append_images=quadros[1:], duration=120, loop=0)


if __name__ == '__main__':
    main()
