#!/usr/bin/env python3
"""Gabaritos das peças da favela no ângulo exato do jogo (docs/arte/PEDIDO_FAVELA.md).

Usa a mesma projeção de prototype/src/camera.js: câmera de 55° (o chão encolhe para sin 55° = 0,82 na
vertical da tela), giro do mapa de 18° (a profundidade sobe inclinada para a direita, 18° da vertical) e
altura sem encolher. Projeção paralela: sem ponto de fuga. Cada gabarito é a forma que a arte tem que
preencher, na escala do pedido (150 px por metro), com a grade de 1 m no chão.

  python3 -I tools/gabaritos-favela.py docs/arte/gabaritos_favela
"""
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

K = math.sin(math.radians(55))  # profundidade -> vertical da tela
KS = K * math.tan(math.radians(18))  # profundidade -> horizontal da tela (para a direita)
VIEW = np.array([KS, -1.0, K])  # para onde fica a câmera (x leste, n fundo, z altura): maior = mais perto

COR = {
    'frente': (216, 195, 165),
    'tampo': (241, 234, 217),
    'lado': (156, 132, 102),
    'degrau': (201, 193, 178),
    'espelho': (169, 159, 143),
    'lado_escada': (125, 112, 96),
    'viela': (176, 176, 170),
    'laje': (206, 202, 192),
    'boneco': (60, 60, 70),
}


def caixa(x0, x1, n0, n1, z0, z1, quais='ftl'):
    """As faces de uma caixa que a câmera pode ver: frente (n0), tampo (z1) e lado direito (x1).
    O lado esquerdo, o fundo e a base nunca aparecem nesta câmera."""
    faces = []
    if 'f' in quais:
        faces.append(('n', n0, [(x0, n0, z0), (x1, n0, z0), (x1, n0, z1), (x0, n0, z1)], COR['frente']))
    if 't' in quais:
        faces.append(('z', z1, [(x0, n0, z1), (x1, n0, z1), (x1, n1, z1), (x0, n1, z1)], COR['tampo']))
    if 'l' in quais:
        faces.append(('x', x1, [(x1, n0, z0), (x1, n1, z0), (x1, n1, z1), (x1, n0, z1)], COR['lado']))
    return faces


def escada(x0, x1, n0, n1, h, degraus, lado_visivel=True):
    """Escada maciça de concreto subindo para o fundo: espelhos, pisos e o lado direito em serrote."""
    faces = []
    dn = (n1 - n0) / degraus
    dz = h / degraus
    for i in range(degraus):
        na, nb = n0 + i * dn, n0 + (i + 1) * dn
        za, zb = i * dz, (i + 1) * dz
        faces.append(('n', na, [(x0, na, za), (x1, na, za), (x1, na, zb), (x0, na, zb)], COR['espelho']))
        faces.append(('z', zb, [(x0, na, zb), (x1, na, zb), (x1, nb, zb), (x0, nb, zb)], COR['degrau']))
    if lado_visivel:
        perfil = [(x1, n0, 0.0)]
        for i in range(degraus):
            perfil.append((x1, n0 + i * dn, (i + 1) * dz))
            perfil.append((x1, n0 + (i + 1) * dn, (i + 1) * dz))
        perfil.append((x1, n1, 0.0))
        faces.append(('x', x1, perfil, COR['lado_escada']))
    return faces


class Tela:
    def __init__(self, pontos, s, margem=0.1, chao=None):
        self.s = s
        xs = [x + KS * n for x, n, z in pontos]
        ys = [-(K * n + z) for x, n, z in pontos]
        w = (max(xs) - min(xs)) * s
        h = (max(ys) - min(ys)) * s
        m = max(w, h) * margem
        self.ox = -min(xs) * s + m
        self.oy = -min(ys) * s + m
        self.w = int(math.ceil(w + 2 * m))
        self.h = int(math.ceil(h + 2 * m))
        self.img = Image.new('RGB', (self.w, self.h), (255, 255, 255))
        self.zbuf = np.full((self.h, self.w), -1e9)
        self.ids = np.full((self.h, self.w), -1, dtype=np.int32)
        gx, gy = np.meshgrid(np.arange(self.w) + 0.5, np.arange(self.h) + 0.5)
        self.u = (gx - self.ox) / s  # = x + KS·n
        self.v = (self.oy - gy) / s  # = K·n + z
        self.nfaces = 0

    def p(self, x, n, z):
        return (self.ox + self.s * (x + KS * n), self.oy - self.s * (K * n + z))

    def chao(self, x0, x1, n0, n1, cor):
        d = ImageDraw.Draw(self.img)
        d.polygon([self.p(x0, n0, 0), self.p(x1, n0, 0), self.p(x1, n1, 0), self.p(x0, n1, 0)], fill=cor)

    def grade(self, x0, x1, n0, n1, passo=1.0, cor=(190, 190, 190)):
        d = ImageDraw.Draw(self.img)
        lw = max(1, round(self.s / 75))
        x = x0
        while x <= x1 + 1e-6:
            d.line([self.p(x, n0, 0), self.p(x, n1, 0)], fill=cor, width=lw)
            x += passo
        n = n0
        while n <= n1 + 1e-6:
            d.line([self.p(x0, n, 0), self.p(x1, n, 0)], fill=cor, width=lw)
            n += passo

    def faces(self, lista):
        """Pinta cada face com z-buffer: o que está mais perto da câmera fica por cima."""
        arr = np.array(self.img)
        for plano, c, verts, cor in lista:
            mask = Image.new('L', (self.w, self.h), 0)
            ImageDraw.Draw(mask).polygon([self.p(*v) for v in verts], fill=255)
            m = np.array(mask) > 0
            if plano == 'z':
                n = (self.v - c) / K
                x = self.u - KS * n
                z = np.full_like(n, c)
            elif plano == 'n':
                n = np.full_like(self.u, c)
                x = self.u - KS * c
                z = self.v - K * c
            else:
                x = np.full_like(self.u, c)
                n = (self.u - c) / KS
                z = self.v - K * n
            prof = VIEW[0] * x + VIEW[1] * n + VIEW[2] * z
            ok = m & (prof > self.zbuf + 1e-7)
            self.zbuf[ok] = prof[ok]
            self.ids[ok] = self.nfaces
            arr[ok] = cor
            self.nfaces += 1
        # contorno onde muda a face (as linhas escondidas somem sozinhas)
        ids = self.ids
        borda = np.zeros_like(ids, dtype=bool)
        for dy, dx in ((0, 1), (1, 0)):
            a = ids[: ids.shape[0] - dy, : ids.shape[1] - dx]
            b = ids[dy:, dx:]
            dif = a != b
            borda[: ids.shape[0] - dy, : ids.shape[1] - dx] |= dif
            borda[dy:, dx:] |= dif
        lw = max(1, round(self.s / 60))
        if lw > 1:
            bi = Image.fromarray((borda * 255).astype(np.uint8)).filter(__import__('PIL.ImageFilter', fromlist=['x']).MaxFilter(lw * 2 - 1))
            borda = np.array(bi) > 0
        arr[borda] = (40, 34, 30)
        self.img = Image.fromarray(arr)

    def salvar(self, caminho):
        self.img.save(caminho)
        print(f'{caminho}  {self.w}×{self.h}')


def pontos(faces):
    return [v for _, _, vs, _ in faces for v in vs]


def peca(destino, nome, faces, s=150, chao_ret=None):
    pts = pontos(faces)
    if chao_ret:
        x0, x1, n0, n1 = chao_ret
        pts += [(x0, n0, 0), (x1, n0, 0), (x1, n1, 0), (x0, n1, 0)]
    t = Tela(pts, s)
    if chao_ret:
        t.grade(*chao_ret)
    t.faces(faces)
    t.salvar(destino / f'{nome}.png')


def cena(destino):
    """Um pedaço de morro montado com as peças: viela, pracinha, casa com laje e fachadas no fundo."""
    S = 40
    f = []
    # viela de 5 m (x 0..5) por 16 m; casas dos dois lados, 3 m de altura
    f += caixa(-4, 0, 0, 16, 0, 3.0)  # esquerda: mostra a parede virada para a viela
    f += caixa(5, 9, 0, 16, 0, 3.2)  # direita: a parede fica de costas; aparece o telhado
    # pracinha de 14 m (x -4.5..9.5), n 16..30; casas dos lados
    f += caixa(-8.5, -4.5, 16, 30, 0, 6.0)
    f += caixa(9.5, 13.5, 16, 30, 0, 3.2)
    # fachadas no fundo da pracinha (4 m de largura, 1 a 3 andares)
    for i, hh in enumerate((3.0, 6.0, 9.0, 6.0)):
        x0 = -4.5 + i * 4 - (0.5 if i == 3 else 0)
        f += caixa(x0, x0 + 4, 30, 35, 0, hh)
    # casa com laje no fundo da pracinha, escada do lado esquerdo
    f += escada(2.7, 4.0, 24.4, 29.4, 3.2, 18, lado_visivel=False)
    f += caixa(4.0, 9.0, 24.4, 29.4, 0, 3.2)
    # o Juninho em pé na viela (de pé continua de pé)
    f += [('n', 8, [(2.2, 8, 0), (2.8, 8, 0), (2.8, 8, 2.4), (2.2, 8, 2.4)], COR['boneco'])]
    pts = pontos(f) + [(-9, 0, 0), (14, 36, 0)]
    t = Tela(pts, S, margem=0.04)
    t.chao(-9, 14, 0, 36, (120, 105, 92))
    t.chao(0, 5, 0, 16, COR['viela'])
    t.chao(-4.5, 9.5, 16, 30, COR['laje'])
    t.grade(-4.5, 9.5, 16, 30)
    t.grade(0, 5, 0, 16)
    t.faces(f)
    t.salvar(destino / 'cena_exemplo.png')


def main():
    destino = Path(sys.argv[1] if len(sys.argv) > 1 else 'docs/arte/gabaritos_favela')
    destino.mkdir(parents=True, exist_ok=True)
    # casa com laje 5 × 5 m, 3,2 m de altura; escada 1,3 × 5 m, 18 degraus
    peca(destino, 'casa_laje_dir', caixa(0, 5, 0, 5, 0, 3.2) + escada(5, 6.3, 0, 5, 3.2, 18), chao_ret=(-1, 7.3, -1, 6))
    peca(destino, 'casa_laje_esq', escada(-1.3, 0, 0, 5, 3.2, 18, lado_visivel=False) + caixa(0, 5, 0, 5, 0, 3.2), chao_ret=(-2.3, 6, -1, 6))
    # fachadas: casa de 4 m de frente e 5 m de fundo, 1, 2 e 3 andares
    for letra, hh in (('a', 3.0), ('b', 6.0), ('c', 9.0)):
        peca(destino, f'fachada_{letra}', caixa(0, 4, 0, 5, 0, hh), chao_ret=(-1, 5, -1, 6))
    # barraco de 3 × 3 m, 3,5 m de altura
    for letra in 'ab':
        peca(destino, f'barraco_{letra}', caixa(0, 3, 0, 3, 0, 3.5), chao_ret=(-1, 4, -1, 4))
    # módulos de 6 m ao longo da viela, encaixados um atrás do outro (a frente de cada um fica escondida
    # pelo módulo de baixo; no começo da viela entra uma fachada): à esquerda aparece a parede virada para
    # a viela; à direita a parede fica de costas para a câmera e só aparece o telhado
    peca(destino, 'parede_viela_esq', caixa(-3, 0, 0, 6, 0, 3.0, 'tl'), chao_ret=(-3, 3, 0, 6))
    peca(destino, 'telhado_viela_dir', caixa(0, 3, 0, 6, 0, 3.0, 'ft'), chao_ret=(-3, 3, 0, 6))
    # objeto em pé: caixa de 1 m, para todos os objetos da lista
    peca(destino, 'objeto_caixa_1m', caixa(0, 1, 0, 1, 0, 1), chao_ret=(-0.5, 1.5, -0.5, 1.5))
    cena(destino)


if __name__ == '__main__':
    main()
