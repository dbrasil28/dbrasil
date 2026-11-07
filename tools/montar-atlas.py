# Atlas de caminhada de um personagem (16 direções × 6 quadros, célula 200×160, tronco no centro,
# pés na base) a partir das 4 folhas 6×4 do pacote. Poses extras do pacote (extras/*.png, como a de
# acordado da horda ou a de ataque) são gravadas com 320 px de altura.
# As folhas nem sempre respeitam a grade de 256 px: mãos invadem a célula do lado e cabeças ou pés
# passam alguns px para a linha de cima ou de baixo. Por isso cada figura é separada por componentes
# conectados na folha inteira e recortada pela própria máscara. A névoa de alfa baixo fora da figura
# é zerada.
# Requer Python 3 com Pillow, numpy e opencv-python (fora do jogo; o protótipo continua sem dependências).
# uso: python3 -I tools/montar-atlas.py <pacote com folhas/> prototype/assets/personagens/<pasta> \
#        <pasta de trabalho nova> <prefixo das prévias>
# Grava caminhada_atlas.webp, atlas_meta.json e as poses extras (acordado.png, ataque.png...). O figureH de atlas_meta.json
# vai para WALK_ATLAS em prototype/src/sprites.js.
import sys, os, json
import numpy as np, cv2
from PIL import Image, ImageDraw

# opções: --near=N (px até onde um pedaço solto, como a maleta no ar, entra na figura; padrão 12)
#         --like=<atlas_meta.json> (usa o mesmo recorte e a mesma escala de outro atlas, ex.: o de caminhada)
#         --out=nome (grava nome_atlas.webp e nome_meta.json; padrão: caminhada_atlas.webp e atlas_meta.json)
flags = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--'))
pkg, dst, work, tag = [a for a in sys.argv[1:] if not a.startswith('--')][:4]
os.makedirs(dst, exist_ok=True)
os.makedirs(work, exist_ok=False)  # pasta nova sempre
ref = os.path.join(os.path.dirname(os.path.abspath(work)), 'ref')
os.makedirs(ref, exist_ok=True)

TH = 24          # alfa mínimo para pertencer à figura
GROW = 3         # px de borda antisserrilhada mantidos em volta da máscara
NEAR = int(flags.get('near', 12))  # fragmento solto (dedo) só entra se estiver a até NEAR px da figura
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
    fig = (a > TH).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(fig, connectivity=8)
    big = [i for i in range(1, n) if st[i, 4] > 2000]
    if len(big) < 24:
        # duas figuras vizinhas se encostando (braço esticado de uma toca a outra): corta a mancha que
        # ocupa mais de uma coluna da grade na divisa entre as colunas, só onde as duas se tocam
        # (ou o pé de uma toca a cabeça da de baixo: corta na divisa das linhas)
        for i in big:
            x0, w = st[i, 0] - PAD, st[i, 2]
            y0, h = st[i, 1] - PAD, st[i, 3]
            c0, c1 = int(x0 // cwid), int((x0 + w - 1) // cwid)
            r0, r1 = int(y0 // rh), int((y0 + h - 1) // rh)
            if c1 > c0 and w > cwid * 1.25:
                for c in range(c0 + 1, c1 + 1):
                    sl = np.s_[:, PAD + c * cwid - 1:PAD + c * cwid + 1]
                    fig[sl][lab[sl] == i] = 0
                notes.append(f'folha {sheet}: figuras encostadas separadas na divisa das colunas')
            if r1 > r0 and h > rh * 1.25:
                for r in range(r0 + 1, r1 + 1):
                    sl = np.s_[PAD + r * rh - 1:PAD + r * rh + 1, :]
                    fig[sl][lab[sl] == i] = 0
                notes.append(f'folha {sheet}: figuras encostadas separadas na divisa das linhas')
        n, lab, st, _ = cv2.connectedComponentsWithStats(fig, connectivity=8)
    # as 24 maiores manchas são as figuras; o resto (dedos, maleta no ar, notas) é pedaço solto
    big = sorted((i for i in range(1, n) if st[i, 4] > 2000), key=lambda i: -st[i, 4])[:24]
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
        # prefere a figura da mesma célula da folha (a maleta no ar é do quadro em que ela está)
        cell = lambda k: (int((st[k, 0] + st[k, 2] / 2 - PAD) // cwid), int((st[k, 1] + st[k, 3] / 2 - PAD) // rh))
        same = [j for j in big if cell(j) == cell(i) and gap(j) <= NEAR * 2]
        j = same[0] if same else min(big, key=gap)
        if same or gap(j) <= NEAR:
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
if 'like' in flags:
    like = json.load(open(flags['like']))
    TOP, FEET = like['top'], like['feet']
    print(f"recorte e escala de {flags['like']}: y {TOP}..{FEET}")
scale = CH / (FEET - TOP)
half = CW / 2 / scale  # meia largura da célula em px da folha
atlas = Image.new('RGBA', (CW * 6, CH * 16), (0, 0, 0, 0))
clip = 0
feet_rows = []  # pés de cada direção (mediana dos 6 quadros), em px da célula: quadrúpede de lado pisa mais alto na folha
for ri, a in enumerate(angs):
    line = []
    feet_rows.append(round((float(np.median([figs[(a, f)]['feet'] for f in range(6)])) - TOP) * scale, 1))
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
OUT = flags.get('out', 'caminhada')
out = os.path.join(dst, f'{OUT}_atlas.webp')
META = os.path.join(dst, 'atlas_meta.json' if OUT == 'caminhada' else f'{OUT}_meta.json')
atlas.save(out, 'WEBP', quality=86, method=6)
figH = round((feet - top) * scale) if 'like' not in flags else like['figureH']
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

json.dump({'figureH': figH, 'top': TOP, 'feet': FEET, 'feetRows': feet_rows}, open(META, 'w'))
# poses extras (extras/<personagem>_<pose>.png, ex.: telespectador_acordado, burocrata_ataque) viram
# <pose>.png com 320 px de altura. Ficam os pedaços grandes (papéis soltos, por exemplo); somem os pontinhos.
exdir = os.path.join(pkg, 'extras')
extras = sorted(f for f in os.listdir(exdir) if f.endswith('.png')) if os.path.isdir(exdir) else []
if not extras:
    print('sem poses extras no pacote')
for fn in extras:
    stem = fn[:-4]
    name = stem.split('_', 1)[1] if '_' in stem else stem
    arr = np.array(Image.open(os.path.join(exdir, fn)).convert('RGBA'))
    n, lab, st, _ = cv2.connectedComponentsWithStats((arr[:, :, 3] > TH).astype(np.uint8), connectivity=8)
    keep_min = max(200, 0.002 * st[1:, 4].max())
    keep = [i for i in range(1, n) if st[i, 4] >= keep_min]
    mm = cv2.dilate(np.isin(lab, keep).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))) > 0
    arr[:, :, 3] = np.where(mm, arr[:, :, 3], 0)
    ac = Image.fromarray(arr)
    bb = ac.getchannel('A').point(lambda v: 255 if v > TH else 0).getbbox()
    edge = [side for side, hit in zip(('esquerda', 'topo', 'direita', 'base'),
            (bb[0] == 0, bb[1] == 0, bb[2] == arr.shape[1], bb[3] == arr.shape[0])) if hit]
    ac = ac.crop(bb)
    ac = ac.resize((round(ac.width * 320 / ac.height), 320), Image.LANCZOS)
    out = os.path.join(dst, f'{name}.png')
    ac.save(out, optimize=True)
    print(f'{fn} -> {name}.png', ac.size, os.path.getsize(out) // 1024, 'KB; pedaços mantidos', len(keep), 'de', n - 1,
          '; encosta na borda:' if edge else '', ', '.join(edge))
