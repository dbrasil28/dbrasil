"""O "DUUUUMM" da cena das TVs do Plantão (pedido do autor: "uma coisa mais tipo um duuuumm"): uma nota grave e longa
de metal de cinema (braam), com eco de sala, 4,9 s. Feito aqui, sem licença de terceiros.
modo: 'metal' (só a nota; é o do jogo) | 'estrondo' (com um estrondo grave no começo) | 'grave' (mais grave e escuro).

uso: python3 -I tools/duum.py <saida.wav> metal
  depois, em MP3 mono com o pico em -1 dB (como os outros sons):
  ffmpeg -i <saida.wav> -af "afade=t=out:st=4.3:d=0.6,volume=<ganho>dB" -codec:a libmp3lame -q:a 2 prototype/assets/sons/duum_tv_1.mp3
"""
import sys, wave
import numpy as np
SR = 44100; FIM = 4.9
out, modo = sys.argv[1], sys.argv[2]
n = int(FIM * SR); t = np.arange(n) / SR
rng = np.random.default_rng(11)
f0 = 41.2 if modo == 'grave' else 49.0                      # mi grave / sol grave

def lp(x, fc):
    fc = np.broadcast_to(fc, x.shape); a = 1 - np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s += a[i] * (x[i] - s); y[i] = s
    return y

def saw(f):
    fase = np.cumsum(np.broadcast_to(f, t.shape) / SR) + rng.random(); return 2 * (fase - np.floor(fase)) - 1

# a nota: 7 vozes desafinadas na fundamental, a oitava e a quinta (o "metal" de trailer), um pouco de vibrato lento
vib = 1 + 0.002 * np.sin(2 * np.pi * 4.5 * t) * np.clip((t - 0.6) / 1, 0, 1)
voz = sum(saw(f0 * d * vib) for d in (1, 1.004, 0.996, 1.008, 0.992)) / 5
voz += 0.6 * sum(saw(2 * f0 * d * vib) for d in (1.003, 0.997)) / 2
voz += 0.35 * saw(1.5 * f0 * 1.001 * vib)
# o filtro abre rápido ("bwaa") e fecha devagar ("...mm")
abre = np.where(t < 0.12, t / 0.12, np.exp(-(t - 0.12) * (1.3 if modo != 'grave' else 1.7)))
corte = 140 + (1500 if modo != 'grave' else 900) * abre
voz = lp(voz, corte)
voz = np.tanh(voz * 2.2) / np.tanh(2.2)                    # o rosnado do metal
env = np.minimum(1, t / 0.035) * np.where(t < 1.6, 1, np.exp(-(t - 1.6) * 1.25))
x = voz * env
x += 0.8 * np.sin(2 * np.pi * f0 * t) * env                # o grave por baixo
if modo == 'estrondo':
    boom = np.sin(2 * np.pi * np.cumsum(30 + 55 * np.exp(-t * 10)) / SR) * np.exp(-t * 1.8)
    x += 1.3 * boom + 0.6 * lp(rng.standard_normal(n), 2500) * np.exp(-t * 16)
# eco de sala grande: resposta de ruído caindo em 2,6 s (convolução pela FFT), misturada com o seco
ir_n = int(2.6 * SR); ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR * 2.7)
ir = lp(ir, 3500); ir /= np.sqrt((ir ** 2).sum())
m = 1 << int(np.ceil(np.log2(n + ir_n)))
eco = np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[:n]
x = 0.8 * x + 0.55 * eco / np.abs(eco).max() * np.abs(x).max()
x[-int(0.3 * SR):] *= np.linspace(1, 0, int(0.3 * SR))
x = x / np.abs(x).max() * 0.89
w = wave.open(out, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close()
print(out, modo)
