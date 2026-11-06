# Atlas de caminhada de um personagem (16 direções × 6 quadros, célula 200×160, tronco no centro,
# pés na base) a partir das 4 folhas 6×4 do pacote. Se o pacote tiver extras/telespectador_acordado.png,
# grava também a pose de acordado com 320 px de altura (só a horda acorda).
# As folhas nem sempre respeitam a grade de 256 px: mãos invadem a célula do lado e cabeças ou pés
# passam alguns px para a linha de cima ou de baixo. Por isso cada figura é separada por componentes
# conectados na folha inteira e recortada pela própria máscara. A névoa de alfa baixo fora da figura
# é zerada.
# Requer Python 3 com Pillow, numpy e opencv-python (fora do jogo; o protótipo continua sem dependências).
# uso: python3 -I tools/montar-atlas.py <pacote com folhas/> prototype/assets/personagens/<pasta> \
#        <pasta de trabalho nova> <prefixo das prévias>
# Grava caminhada_atlas.webp, atlas_meta.json e, na horda, acordado.png. O figureH de atlas_meta.json
# vai para WALK_ATLAS em prototype/src/sprites.js.
import sys, os, json
import numpy as np, cv2
from PIL import Image, ImageDraw

pkg, dst, work, tag = sys.argv[1:5]
os.makedirs(dst, exist_ok=True)
os.makedirs(work, exist_ok=False)  # pasta nova sempre
ref = os.path.join(os.path.dirname(os.path.abspath(work)), 'ref')
os.makedirs(ref, exist_ok=True)

TH = 24          # alfa mínimo para pertencer à figura
GROW = 3         # px de borda antisserrilhada mantidos em volta da máscara
NEAR = 12        # fragmento solto (dedo) só entra se estiver a até 12 px da figura
PAD = 16         # margem de transparência em volta da folha, para recortes que passam da borda
CW, CH = 200, 160
GROUPS = [(1, 0), (2, 90), (3, 180), (4, 270)]
KER = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * GROW + 1, 2 * GROW + 1))

figs = {}  # (ângulo, quadro) -> figura
notes = []
for sheet, base in GROUPS:
    im = np.array(Image.open(os.path.join(pkg, 'folhas', f'folha_{sheet}.png')).convert('RGBA'))
    im = np.pad(im, ((PAD, PAD), (PAD, PAD), (0, 0)))
    rh = (im.shape[0] - 2 * PAD) // 4
    cwid = (im.shape[1] - 2 * PAD) // 6
    a = im[:, :, 3]
    n, lab, st, _ = cv2.connectedComponentsWithStats((a > TH).astype(np.uint8), connectivity=8)
    big = [i for i in range(1, n) if st[i, 4] > 2000]
    assert len(big) == 24, (sheet, len(big))
    rows = {}
    for i in big:
        cy = st[i, 1] + st[i, 3] / 2 - PAD
        rows.setdefault(int(cy // rh), []).append(i)
    assert sorted(rows) == [0, 1, 2, 3] and all(len(v) == 6 for v in rows.values()), (sheet, {k: len(v) for k, v in rows.items()})
    masks = {i: lab == i for i in big}
    for i in range(1, n):
        if i in masks:
            continue
        x0, y0, w, h = st[i, 0], st[i, 1], st[i, 2], st[i, 3]
        def gap(j):
            X0, Y0, W, H = st[j, 0], st[j, 1], st[j, 2], st[j, 3]
            return max(X0 - (x0 + w), x0 - (X0 + W), 0) + max(Y0 - (y0 + h), y0 - (Y0 + H), 0)
        j = min(big, key=gap)
        if gap(j) <= NEAR:
            masks[j] |= lab == i
    for row in range(4):
        ang = base + row * 22.5
        rtop = PAD + row * rh
        for f, i in enumerate(sorted(rows[row], key=lambda i: st[i, 0])):
            m = masks[i]
            mm = cv2.dilate(m.astype(np.uint8), KER) > 0
            ys, xs = np.nonzero(m)
            band = (ys >= rtop + rh * 0.43) & (ys < rtop + rh * 0.78)
            top, feet = int(ys.min()) - rtop, int(ys.max()) + 1 - rtop
            if top < 0 or feet > rh:
                notes.append(f'{ang}° q{f}: passa da linha ({top}..{feet})')
            figs[(ang, f)] = dict(sheet=im, mask=mm, rtop=rtop, cx=float(xs[band].mean()), top=top, feet=feet,
                                  x0=int(xs.min()), x1=int(xs.max()) + 1)

angs = sorted({k[0] for k in figs})
top = min(v['top'] for v in figs.values())
feet = max(v['feet'] for v in figs.values())
TOP, FEET = top - 2, feet + 2  # relativos ao topo da linha da folha; podem passar dela
scale = CH / (FEET - TOP)
half = CW / 2 / scale  # meia largura da célula em px da folha
atlas = Image.new('RGBA', (CW * 6, CH * 16), (0, 0, 0, 0))
clip = 0
for ri, a in enumerate(angs):
    line = []
    for f in range(6):
        v = figs[(a, f)]
        x0 = int(round(v['cx'] - half))
        x1 = x0 + int(round(2 * half))
        y0, y1 = v['rtop'] + TOP, v['rtop'] + FEET
        src = np.zeros((y1 - y0, x1 - x0, 4), np.uint8)
        sh, mk = v['sheet'], v['mask']
        sx0, sx1 = max(0, x0), min(sh.shape[1], x1)
        sy0, sy1 = max(0, y0), min(sh.shape[0], y1)
        part = sh[sy0:sy1, sx0:sx1].copy()
        part[:, :, 3] = np.where(mk[sy0:sy1, sx0:sx1], part[:, :, 3], 0)
        src[sy0 - y0:sy1 - y0, sx0 - x0:sx1 - x0] = part
        if v['x0'] < x0 or v['x1'] > x1:
            clip += 1
        cell = Image.fromarray(src).resize((CW, CH), Image.LANCZOS)
        atlas.paste(cell, (f * CW, ri * CH))
        line.append(f"{v['top']}-{v['feet']}")
    print(f'{a:6.1f}°  topo-pés {line}')
for s in notes:
    print('aviso:', s)
out = os.path.join(dst, 'caminhada_atlas.webp')
atlas.save(out, 'WEBP', quality=86, method=6)
figH = round((feet - top) * scale)
print(f'recorte y {TOP}..{FEET} da linha; figura ≈ {figH} px na célula de {CH}; atlas {atlas.size} '
      f'{os.path.getsize(out) // 1024} KB; figuras que passam da célula: {clip}')

# prévias do atlas final, sobre cinza: 0° e 90° quadro a quadro e as 16 direções
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
full = Image.new('RGBA', atlas.size, (70, 70, 70, 255))
full.alpha_composite(atlas)
full.convert('RGB').resize((atlas.width // 2, atlas.height // 2)).save(f'{ref}/{tag}_atlas.jpg', quality=85)

json.dump({'figureH': figH, 'top': TOP, 'feet': FEET}, open(os.path.join(dst, 'atlas_meta.json'), 'w'))
acp = os.path.join(pkg, 'extras', 'telespectador_acordado.png')
if not os.path.exists(acp):
    print('sem pose de acordado no pacote')
    sys.exit(0)
ac = Image.open(acp).convert('RGBA')
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
