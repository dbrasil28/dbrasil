# Atlas de caminhada de um telespectador (16 direções × 6 quadros, célula 200×160, tronco no centro,
# pés na base) a partir das 4 folhas 6×4 do pacote, mais a pose de acordado com 320 px de altura.
# Separa as 6 figuras de cada linha por componentes conectados, porque as folhas nem sempre respeitam
# a grade de 256 px (mãos invadem a célula vizinha). Também zera a névoa de alfa baixo fora da figura.
# Requer Python 3 com Pillow, numpy e opencv-python (fora do jogo; o protótipo continua sem dependências).
# uso: python3 -I tools/montar-atlas-telespectador.py <pacote com folhas/ e extras/> \
#        prototype/assets/personagens/telespectador_x <pasta de trabalho nova> <prefixo das prévias>
# Grava caminhada_atlas.webp, acordado.png e atlas_meta.json (figureH vai para CROWD_ANIM em sprites.js).
import sys, os, json
import numpy as np, cv2
from PIL import Image, ImageDraw

pkg, dst, work, tag = sys.argv[1:5]
os.makedirs(dst, exist_ok=True)
os.makedirs(work, exist_ok=False)
ref = os.path.join(os.path.dirname(work), 'ref')
os.makedirs(ref, exist_ok=True)

TH = 24          # alfa mínimo para pertencer à figura
GROW = 3         # px de borda antisserrilhada mantidos em volta da máscara
CW, CH = 200, 160
GROUPS = [(1, 0), (2, 90), (3, 180), (4, 270)]

figs = {}  # (ang, frame) -> dict(rgba strip crop, cx, top, feet)
for sheet, base in GROUPS:
    im = np.array(Image.open(os.path.join(pkg, 'folhas', f'folha_{sheet}.png')).convert('RGBA'))
    rh = im.shape[0] // 4
    for row in range(4):
        ang = base + row * 22.5
        strip = im[row * rh:(row + 1) * rh].copy()
        a = strip[:, :, 3]
        n, lab, st, _ = cv2.connectedComponentsWithStats((a > TH).astype(np.uint8), connectivity=8)
        comps = sorted([i for i in range(1, n)], key=lambda i: -st[i, 4])
        big = sorted(comps[:6], key=lambda i: st[i, 0])
        assert len(big) == 6 and st[big[-1], 4] > 2000, (sheet, row, [st[i, 4] for i in comps[:8]])
        cxs_big = [st[i, 0] + st[i, 2] / 2 for i in big]
        masks = [lab == i for i in big]
        # fragmentos soltos (dedos) vão para a figura mais próxima
        for i in comps[6:]:
            cx = st[i, 0] + st[i, 2] / 2
            k = int(np.argmin([abs(cx - c) for c in cxs_big]))
            masks[k] |= lab == i
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * GROW + 1, 2 * GROW + 1))
        for f, m in enumerate(masks):
            mm = cv2.dilate(m.astype(np.uint8), k) > 0
            fig = strip.copy()
            fig[:, :, 3] = np.where(mm, fig[:, :, 3], 0)
            ys, xs = np.nonzero(m)
            t0, t1 = round(rh * 0.43), round(rh * 0.78)
            band = (ys >= t0) & (ys < t1)
            figs[(ang, f)] = dict(img=fig, cx=float(xs[band].mean()), top=int(ys.min()), feet=int(ys.max()) + 1,
                                  x0=int(xs.min()), x1=int(xs.max()) + 1)

angs = sorted({k[0] for k in figs})
top = min(v['top'] for v in figs.values())
feet = max(v['feet'] for v in figs.values())
rh = next(iter(figs.values()))['img'].shape[0]
TOP, FEET = max(0, top - 2), min(rh, feet + 2)
scale = CH / (FEET - TOP)
half = CW / 2 / scale  # meia largura da célula em px da folha
atlas = Image.new('RGBA', (CW * 6, CH * 16), (0, 0, 0, 0))
clip = 0
for ri, a in enumerate(angs):
    line = []
    for f in range(6):
        v = figs[(a, f)]
        x0 = int(round(v['cx'] - half))
        src = np.zeros((rh, int(round(2 * half)), 4), np.uint8)
        sx0, sx1 = max(0, x0), min(v['img'].shape[1], x0 + src.shape[1])
        src[:, sx0 - x0:sx1 - x0] = v['img'][:, sx0:sx1]
        if v['x0'] < x0 or v['x1'] > x0 + src.shape[1]:
            clip += 1
        cell = Image.fromarray(src[TOP:FEET]).resize((CW, CH), Image.LANCZOS)
        atlas.paste(cell, (f * CW, ri * CH))
        line.append(f"{v['top']}-{v['feet']}")
    print(f'{a:6.1f}°  topo-pés {line}')
out = os.path.join(dst, 'caminhada_atlas.webp')
atlas.save(out, 'WEBP', quality=86, method=6)
figH = round((feet - top) * scale)
print(f'recorte y {TOP}..{FEET}; figura ≈ {figH} px na célula de {CH}; atlas {atlas.size} {os.path.getsize(out) // 1024} KB; '
      f'figuras que passam da célula: {clip}')

# prévias: 0° e 90° quadro a quadro, e as 16 direções, sobre cinza, do atlas final
def cellimg(r, f):
    return atlas.crop((f * CW, r * CH, (f + 1) * CW, (r + 1) * CH))
def strip_img(items, path):
    sh = Image.new('RGBA', (CW * len(items), CH + 20), (70, 70, 70, 255))
    d = ImageDraw.Draw(sh)
    for i, (im, lab) in enumerate(items):
        sh.alpha_composite(im, (i * CW, 20))
        d.text((i * CW + 4, 4), lab, fill=(255, 255, 0, 255))
        d.line([(i * CW + CW // 2, 20), (i * CW + CW // 2, CH + 20)], fill=(110, 110, 110, 255))
    sh.convert('RGB').save(path, quality=88)
strip_img([(cellimg(0, i), f'0° q{i}') for i in range(6)], f'{ref}/{tag}_anim_0.jpg')
strip_img([(cellimg(4, i), f'90° q{i}') for i in range(6)], f'{ref}/{tag}_anim_90.jpg')
strip_img([(cellimg(r, 0), f'{angs[r]}°') for r in range(16)], f'{ref}/{tag}_dirs.jpg')

ac = Image.open(os.path.join(pkg, 'extras', 'telespectador_acordado.png')).convert('RGBA')
arr = np.array(ac)
n, lab, st, _ = cv2.connectedComponentsWithStats((arr[:, :, 3] > TH).astype(np.uint8), connectivity=8)
main = 1 + int(np.argmax(st[1:, 4]))
mm = cv2.dilate((lab == main).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))) > 0
arr[:, :, 3] = np.where(mm, arr[:, :, 3], 0)
ac = Image.fromarray(arr)
bb = ac.getchannel('A').point(lambda v: 255 if v > TH else 0).getbbox()
ac = ac.crop(bb)
ac = ac.resize((round(ac.width * 320 / ac.height), 320), Image.LANCZOS)
ac.save(os.path.join(dst, 'acordado.png'), optimize=True)
print('acordado', ac.size, os.path.getsize(os.path.join(dst, 'acordado.png')) // 1024, 'KB; componentes', n - 1)
json.dump({'figureH': figH, 'top': TOP, 'feet': FEET}, open(os.path.join(dst, 'atlas_meta.json'), 'w'))
