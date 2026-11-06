# Atlas de poses paradas em 16 direções (ataque, fúria...) a partir de folhas 4×4 do pacote
# (folhas/<estado>_16_angulos.png, ângulos em ordem de leitura: 0, 22,5 ... 337,5).
# Cada estado vira uma coluna; cada direção, uma linha (célula 320×200, pés na base, pernas no centro).
# As folhas encaixam a pose inteira na célula, então braços erguidos encolhem o corpo. Por isso a escala
# é medida da cabeça aos pés (nas vistas de frente e de costas, onde a cabeça fica livre) e igualada à do
# atlas de caminhada: o boneco andando tem 158 px na célula de 160; a pose agachada tem CROUCH disso.
# Requer Python 3 com Pillow, numpy e opencv-python.
# uso: python3 -I tools/montar-poses.py <pacote> prototype/assets/personagens/<pasta> <pasta-nova> <prefixo> ataque furia
# Grava poses_atlas.webp e poses_meta.json (colunas, célula e figureH para POSE_ATLAS em sprites.js).
import sys, os, json
import numpy as np, cv2
from PIL import Image, ImageDraw

pkg, dst, work, tag = sys.argv[1:5]
states = sys.argv[5:]
assert states, 'diga os estados, ex.: ataque furia'
os.makedirs(dst, exist_ok=True)
os.makedirs(work, exist_ok=False)
ref = os.path.join(os.path.dirname(os.path.abspath(work)), 'ref')
os.makedirs(ref, exist_ok=True)

TH = 24
GROW = 3
NEAR = 40          # papéis soltos perto da mão entram na figura
WALK_FIG = 158     # altura do boneco andando na célula de 160 do atlas de caminhada
CROUCH = 0.92      # pose agachada: cabeça-pés em relação ao boneco em pé
CW, CH = 320, 200
KER = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * GROW + 1, 2 * GROW + 1))

def figures(path):
    im = np.array(Image.open(path).convert('RGBA'))
    a = im[:, :, 3]
    cw, ch = im.shape[1] // 4, im.shape[0] // 4
    n, lab, st, _ = cv2.connectedComponentsWithStats((a > TH).astype(np.uint8), connectivity=8)
    big = [i for i in range(1, n) if st[i, 4] > 3000]
    assert len(big) == 16, (path, len(big))
    cell = {}
    for i in big:
        cx, cy = st[i, 0] + st[i, 2] / 2, st[i, 1] + st[i, 3] / 2
        cell[int(cy // ch) * 4 + int(cx // cw)] = i
    assert sorted(cell) == list(range(16)), sorted(cell)
    masks = {i: lab == i for i in big}
    for j in range(1, n):
        if j in masks:
            continue
        x0, y0, w, h = st[j, :4]
        def gap(i):
            X0, Y0, W, H = st[i, :4]
            return max(X0 - (x0 + w), x0 - (X0 + W), 0) + max(Y0 - (y0 + h), y0 - (Y0 + H), 0)
        i = min(big, key=gap)
        if gap(i) <= (NEAR if st[j, 4] > 50 else 12):
            masks[i] |= lab == j
    out = []
    for k in range(16):
        i = cell[k]
        body = lab == i
        ys, xs = np.nonzero(body)
        feet, top = int(ys.max()) + 1, int(ys.min())
        legs = ys >= feet - 0.3 * (feet - top)
        cx = float(np.median(xs[legs]))
        # topo da cabeça: o ponto mais alto numa faixa estreita sobre as pernas
        band = np.abs(xs - cx) <= cw * 0.1
        head = int(ys[band].min())
        m = cv2.dilate(masks[i].astype(np.uint8), KER) > 0
        out.append(dict(img=im, mask=m, feet=feet, top=top, head=head, cx=cx))
    return out

data = {s: figures(os.path.join(pkg, 'folhas', f'{s}_16_angulos.png')) for s in states}
atlas = Image.new('RGBA', (CW * len(states), CH * 16), (0, 0, 0, 0))
clip = 0
for c, s in enumerate(states):
    figs = data[s]
    # cabeça-pés / altura total, medido de frente (0°) e de costas (180°)
    ratio = np.mean([(figs[k]['feet'] - figs[k]['head']) / (figs[k]['feet'] - figs[k]['top']) for k in (0, 8)])
    print(f'{s}: cabeça-pés = {ratio:.2f} da altura total da pose')
    for r, v in enumerate(figs):
        scale = WALK_FIG * CROUCH / ((v['feet'] - v['top']) * ratio)
        src = v['img'].copy()
        src[:, :, 3] = np.where(v['mask'], src[:, :, 3], 0)
        ys, xs = np.nonzero(v['mask'])
        x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        part = Image.fromarray(src[y0:y1, x0:x1])
        pw, ph = max(1, round((x1 - x0) * scale)), max(1, round((y1 - y0) * scale))
        part = part.resize((pw, ph), Image.LANCZOS)
        px = round(CW / 2 - (v['cx'] - x0) * scale)
        py = round(CH - 2 - (v['feet'] - y0) * scale)
        if px < 0 or py < 0 or px + pw > CW or py + ph > CH:
            clip += 1
        cellim = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
        cellim.alpha_composite(part, (max(0, px), max(0, py)), (max(0, -px), max(0, -py)))
        atlas.paste(cellim, (c * CW, r * CH))
out = os.path.join(dst, 'poses_atlas.webp')
atlas.save(out, 'WEBP', quality=86, method=6)
json.dump({'cols': states, 'cw': CW, 'ch': CH, 'figureH': WALK_FIG}, open(os.path.join(dst, 'poses_meta.json'), 'w'))
print(f'atlas {atlas.size} {os.path.getsize(out) // 1024} KB; poses que passam da célula: {clip}')

# prévia: cada direção com o boneco andando ao lado, na mesma escala (confere o tamanho)
walkp = os.path.join(dst, 'caminhada_atlas.webp')
walk = Image.open(walkp).convert('RGBA') if os.path.exists(walkp) else None
cols = len(states) + (1 if walk else 0)
sheet = Image.new('RGBA', (cols * CW, 16 * CH), (70, 70, 70, 255))
for r in range(16):
    if walk:
        w = walk.crop((0, r * 160, 200, (r + 1) * 160))
        sheet.alpha_composite(w, (60, r * CH + CH - 160))
    for c in range(len(states)):
        x = (c + (1 if walk else 0)) * CW
        sheet.alpha_composite(atlas.crop((c * CW, r * CH, (c + 1) * CW, (r + 1) * CH)), (x, r * CH))
d = ImageDraw.Draw(sheet)
for r in range(16):
    d.line([(0, r * CH + CH - 2), (cols * CW, r * CH + CH - 2)], fill=(110, 110, 110, 255))
    d.text((4, r * CH + 4), f'{r * 22.5}°', fill=(255, 255, 0, 255))
sheet.convert('RGB').resize((sheet.width // 2, sheet.height // 2)).save(f'{ref}/{tag}_poses.jpg', quality=85)
