"""Bola da Altinha em 3D de verdade (32 gomos do icosaedro truncado), com os materiais gerados no Figma.

Uso: python3 -I tools/render-bola.py docs/arte/objetos_figma/bola_texturas_figma.webp <saida_dir>
Gera <saida_dir>/bola_altinha.png, folha 2304x1728 (12x9, células 192): linha 0 a relíquia adormecida girando em
volta do eixo da fita (inclinado para a câmera, para a fita cruzar o meio); linhas 1 a 8 a acordada (cravo de aço no
meio de cada chapa, miolo dourado em volta delas) rolando em 8 direções da tela (física do Golaço). Câmera do jogo: de cima, 50 graus;
luz do alto à esquerda. A bola é renderizada em 3D (D70): nada é girado nem espremido numa imagem plana.
"""
import sys
import math
import numpy as np
from PIL import Image

TEX, OUT = sys.argv[1], sys.argv[2]
SS = 2  # superamostragem
CELL = 192
R_PX = 80
N = CELL * SS
R = R_PX * SS

tex = np.asarray(Image.open(TEX).convert('RGB')).astype(np.float32) / 255.0
H2 = tex.shape[0] // 2
COURO = tex[:H2, :H2]
ACO = tex[:H2, H2:]
FITA = tex[H2:, :H2]


def norm(v):
    return v / np.linalg.norm(v, axis=-1, keepdims=True)


# ---------- geometria: icosaedro truncado ----------
phi = (1 + 5 ** 0.5) / 2
ico = []
for a in (-1, 1):
    for b in (-phi, phi):
        ico += [(0, a, b), (a, b, 0), (b, 0, a)]
ico = np.array(ico, float)
arestas = [(i, j) for i in range(12) for j in range(i + 1, 12) if abs(np.linalg.norm(ico[i] - ico[j]) - 2) < 1e-6]
faces = [(i, j, k) for i in range(12) for j in range(i + 1, 12) for k in range(j + 1, 12)
         if (i, j) in arestas and (j, k) in arestas and (i, k) in arestas]
pent = norm(ico)
hexa = norm(np.array([ico[list(f)].mean(0) for f in faces]))
verts = norm(np.array([ico[i] + (ico[j] - ico[i]) * t for i, j in arestas for t in (1 / 3, 2 / 3)]))
# orientação: o eixo z do objeto passa por um pentágono (polo), a fita fica no equador
z = pent[0]
x = norm(np.cross(z, [0.3, 1, 0.2]))
y = np.cross(z, x)
M = np.stack([x, y, z])  # mundo-do-objeto <- icosaedro
pent, hexa, verts = pent @ M.T, hexa @ M.T, verts @ M.T
centros = np.concatenate([pent, hexa])
tipo = np.array([0] * 12 + [1] * 20)
ang_p = math.acos(np.clip(np.max(verts @ pent[0]), -1, 1))
ang_h = math.acos(np.clip(np.max(verts @ hexa[0]), -1, 1))
alfa = np.where(tipo == 0, ang_p, ang_h)
# rebites: 5 por pentágono, perto dos cantos
rebites = []
for c in pent:
    cs = verts[np.argsort(-(verts @ c))[:5]]
    for v in cs:
        rebites.append(norm(c * 0.30 + v * 0.70))
rebites = np.array(rebites)
# base tangente de cada gomo (para a textura)
ref = np.array([0.37, 0.61, 0.70])
e1 = norm(np.cross(centros, ref))
e2 = np.cross(centros, e1)
rng = np.random.default_rng(7)
desloc = rng.uniform(0, 1, (32, 2))
giro_tex = rng.uniform(0, 2 * math.pi, 32)


def amostra(img, u, v):
    """Amostra bilinear com repetição (u, v em pixels)."""
    h, w = img.shape[:2]
    u = np.mod(u, w - 1)
    v = np.mod(v, h - 1)
    x0 = np.floor(u).astype(int)
    y0 = np.floor(v).astype(int)
    fx = (u - x0)[..., None]
    fy = (v - y0)[..., None]
    x1 = np.minimum(x0 + 1, w - 1)
    y1 = np.minimum(y0 + 1, h - 1)
    return (img[y0, x0] * (1 - fx) * (1 - fy) + img[y0, x1] * fx * (1 - fy) + img[y1, x0] * (1 - fx) * fy + img[y1, x1] * fx * fy)


def ruido3(p, freq):
    """Ruído de valor 3D simples (0 a 1)."""
    q = p * freq
    i = np.floor(q).astype(np.int64)
    f = q - i
    f = f * f * (3 - 2 * f)

    def h(dx, dy, dz):
        n = (i[..., 0] + dx) * 73856093 ^ (i[..., 1] + dy) * 19349663 ^ (i[..., 2] + dz) * 83492791
        n = (n ^ (n >> 13)) * 1274126177
        return ((n ^ (n >> 16)) & 0xFFFF) / 65535.0

    out = 0
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                w = (f[..., 0] if dx else 1 - f[..., 0]) * (f[..., 1] if dy else 1 - f[..., 1]) * (f[..., 2] if dz else 1 - f[..., 2])
                out = out + w * h(dx, dy, dz)
    return out


# ---------- câmera ----------
th = math.radians(50)
Xw = np.array([1.0, 0, 0])
Yw = np.array([0, math.sin(th), -math.cos(th)])  # para longe, no chão
Zw = np.array([0, math.cos(th), math.sin(th)])  # para cima
VIEW = np.stack([Xw, Yw, Zw])  # linhas: eixos do mundo vistos da câmera
L = norm(np.array([-0.55, 0.62, 0.56]))
Hh = norm(L + np.array([0, 0, 1.0]))

yy, xx = np.mgrid[0:N, 0:N].astype(np.float32)
px = (xx + 0.5 - N / 2) / R
py = -(yy + 0.5 - N / 2) / R
rr = px * px + py * py
dentro = rr < 1
nz = np.sqrt(np.clip(1 - rr, 0, 1))
nv = np.stack([px, py, nz], -1)  # normal na câmera
nworld = nv @ VIEW.T  # componentes no mundo (x, y, z)


def rot(eixo, a):
    eixo = eixo / np.linalg.norm(eixo)
    K = np.array([[0, -eixo[2], eixo[1]], [eixo[2], 0, -eixo[0]], [-eixo[1], eixo[0], 0]])
    return np.eye(3) + math.sin(a) * K + (1 - math.cos(a)) * K @ K


def render(Rm, acordada):
    """Rm: rotação do objeto no mundo. Devolve RGBA (N x N)."""
    nobj = nworld @ Rm  # mundo -> objeto (Rm ortonormal: objeto = Rm^T mundo)
    d = nobj @ centros.T  # (N, N, 32)
    ang = np.arccos(np.clip(d, -1, 1)) - alfa
    ordem = np.argsort(ang, axis=-1)
    g1 = ordem[..., 0]
    g2 = ordem[..., 1]
    a1 = np.take_along_axis(ang, g1[..., None], -1)[..., 0]
    a2 = np.take_along_axis(ang, g2[..., None], -1)[..., 0]
    costura = (a2 - a1) / 2  # distância angular até a costura
    tp = tipo[g1]
    # textura do gomo: coordenadas no plano tangente, giradas e deslocadas por gomo
    u = np.sum(nobj * e1[g1], -1)
    v = np.sum(nobj * e2[g1], -1)
    gr = giro_tex[g1]
    uu = u * np.cos(gr) - v * np.sin(gr)
    vv = u * np.sin(gr) + v * np.cos(gr)
    esc = 420.0
    tu = uu * esc + desloc[g1, 0] * 512
    tv = vv * esc + desloc[g1, 1] * 512
    couro = amostra(COURO, tu, tv)
    aco = amostra(ACO, tu, tv)
    alb = np.where((tp == 0)[..., None], aco * 0.95, couro * np.array([1.0, 0.97, 0.9]))
    spec_k = np.where(tp == 0, 0.55, 0.12)
    shin = np.where(tp == 0, 38.0, 10.0)
    if acordada:
        alb = np.where((tp == 1)[..., None], alb * np.array([0.92, 0.86, 0.78]), alb)  # couro mais queimado
    nshade = nv.copy()
    emis = np.zeros(nv.shape, np.float32)
    # costura: sulco escuro com pontos de linha dourada
    w_c = 0.034
    em_cost = costura < w_c
    eixo_c = norm(centros[g1] - centros[g2])
    b1 = norm(np.cross(eixo_c, centros[g1] + centros[g2]))
    b2 = np.cross(eixo_c, b1)
    s = np.arctan2(np.sum(nobj * b1, -1), np.sum(nobj * b2, -1))
    ponto = (np.mod(s * 30, 1.0) < 0.5) & (costura < w_c * 0.85)
    sulco = np.clip(1 - costura / w_c, 0, 1)
    alb = np.where(em_cost[..., None], alb * (1 - 0.6 * sulco[..., None]), alb)
    ouro = np.array([0.86, 0.66, 0.22])
    alb = np.where(ponto[..., None], ouro, alb)
    spec_k = np.where(ponto, 0.9, spec_k)
    shin = np.where(ponto, 30.0, shin)
    if acordada:
        # costuras rachadas: o miolo dourado aparece (brilho próprio, varia ao longo da costura)
        rn = ruido3(nobj, 7.0)
        larg = w_c * (0.75 + 0.9 * rn)
        racha = (costura < larg) & ((tp == 0) | (tipo[g2] == 0))  # só em volta das chapas de aço (levantadas)
        forca = np.clip(1 - costura / np.maximum(larg, 1e-4), 0, 1) ** 0.6
        miolo = np.array([1.0, 0.82, 0.32])
        emis = np.where(racha[..., None], miolo * (0.55 + 0.6 * forca[..., None]), emis)
        alb = np.where(racha[..., None], alb * 0.25, alb)
    # fita verde e amarela no equador (por cima de tudo)
    lat = nobj[..., 2]
    w_f = 0.13
    em_fita = np.abs(lat) < w_f
    lon = np.arctan2(nobj[..., 1], nobj[..., 0])
    fu = lon / (2 * math.pi) * 512 * 3
    fv = 256 + (lat / w_f) * 150
    fita = amostra(FITA, fu, fv)
    borda = np.clip((np.abs(lat) - (w_f - 0.018)) / 0.018, 0, 1)
    fita = fita * (1 - 0.35 * borda[..., None])
    alb = np.where(em_fita[..., None], fita, alb)
    spec_k = np.where(em_fita, 0.06, spec_k)
    shin = np.where(em_fita, 8.0, shin)
    emis = np.where(em_fita[..., None], emis * 0.0, emis) if acordada else emis
    # rebites (adormecida) ou cravos de aço arredondados nos cantos (acordada)

    def calombos(pontos, raio, cor, ks):
        nonlocal alb, nshade, spec_k, shin, emis
        dd = nobj @ pontos.T
        k = np.argmax(dd, -1)
        cang = np.arccos(np.clip(np.take_along_axis(dd, k[..., None], -1)[..., 0], -1, 1))
        em = cang < raio
        pv = pontos @ Rm.T @ VIEW.T  # centro do calombo na câmera
        c = pv[k]
        t = nv - c * np.sum(nv * c, -1, keepdims=True)
        t = t / np.maximum(np.linalg.norm(t, axis=-1, keepdims=True), 1e-6)
        rho = np.clip(cang / raio, 0, 1)[..., None]
        nb = norm(nv * np.sqrt(1 - rho ** 2 * 0.85) + t * rho * 0.92)
        nshade = np.where(em[..., None], nb, nshade)
        alb = np.where(em[..., None], cor, alb)
        spec_k = np.where(em, ks, spec_k)
        shin = np.where(em, 45.0, shin)
        emis = np.where(em[..., None], 0, emis)
        # sombrinha em volta (o calombo assenta no couro)
        anel = (cang >= raio) & (cang < raio * 1.35)
        alb = np.where(anel[..., None], alb * 0.6, alb)

    if acordada:
        calombos(rebites, 0.035, np.array([0.55, 0.53, 0.5]), 0.8)
        calombos(pent, 0.15, np.array([0.40, 0.41, 0.45]), 1.0)  # cravo grande no meio de cada chapa (maça)
    else:
        calombos(rebites, 0.04, np.array([0.55, 0.53, 0.5]), 0.8)
    # luz
    dif = np.clip(np.sum(nshade * L, -1), 0, 1)
    spc = np.clip(np.sum(nshade * Hh, -1), 0, 1) ** shin * spec_k
    amb = 0.30 + 0.12 * np.clip(nshade[..., 1], 0, 1)  # céu de cima
    rebote = 0.10 * np.clip(-nshade[..., 1], 0, 1)[..., None] * np.array([1.0, 0.85, 0.6])  # areia quente embaixo
    cor = alb * (amb[..., None] + 0.95 * dif[..., None] * np.array([1.0, 0.93, 0.8])) + rebote * alb + spc[..., None] * np.array([1.0, 0.95, 0.85])
    # contorno: escurece a beira
    fres = np.clip(nz, 0, 1) ** 0.35
    cor = cor * (0.45 + 0.55 * fres[..., None])
    cor = cor + emis
    cor = np.clip(cor, 0, 1)
    a = dentro.astype(np.float32)
    rgba = np.concatenate([cor * a[..., None], a[..., None]], -1)
    im = Image.fromarray((rgba * 255).astype(np.uint8), 'RGBA').resize((CELL, CELL), Image.LANCZOS)
    return im


# folha 12 x 9 (células de 192): linha 0 = a relíquia girando (12 quadros, 30 graus cada); linhas 1 a 8 = acordada
# rolando em 8 direções da tela (k: 0 direita, 1 baixo-direita, 2 baixo, 3 baixo-esquerda, 4 esquerda, 5 cima-esquerda,
# 6 cima, 7 cima-direita), 12 quadros de 30 graus cada. Rolar = girar em volta de (cima x direção), no chão.
inclina = rot(np.array([1.0, 0, 0]), math.radians(-38))  # eixo da relíquia inclinado para a câmera: a fita cruza o meio
eixo = inclina @ np.array([0, 0, 1.0])
base = inclina @ rot(np.array([0, 0, 1.0]), math.radians(20))
folha = Image.new('RGBA', (CELL * 12, CELL * 9), (0, 0, 0, 0))
for i in range(12):
    folha.paste(render(rot(eixo, math.radians(30 * i)) @ inclina, False), (i * CELL, 0))
for k in range(8):
    a = math.radians(45 * k)
    d = np.array([math.cos(a), -math.sin(a), 0.0])  # na tela y desce; no mundo daqui, y vai para longe (sobe na tela)
    eixo_rolar = np.cross(np.array([0, 0, 1.0]), d)
    for i in range(12):
        folha.paste(render(rot(eixo_rolar, math.radians(30 * i)) @ base, True), (i * CELL, (1 + k) * CELL))
folha.save(f'{OUT}/bola_altinha.png')
print('ok')
