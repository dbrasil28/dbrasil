"""Monta dist/Instalar Brasil Caos.zip: o Instalar.command (o app/preparar-mac.sh, executável) e o LEIA-ME.txt.

uso: python3 -I tools/montar-instalador-mac.py
"""
import os
import zipfile

raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
saida = os.path.join(raiz, 'dist', 'Instalar Brasil Caos.zip')
os.makedirs(os.path.dirname(saida), exist_ok=True)
with zipfile.ZipFile(saida, 'w', zipfile.ZIP_DEFLATED) as z:
    for origem, nome, modo in ((os.path.join(raiz, 'app', 'preparar-mac.sh'), 'Instalar.command', 0o755),
                               (os.path.join(raiz, 'app', 'instalador-mac', 'LEIA-ME.txt'), 'LEIA-ME.txt', 0o644)):
        info = zipfile.ZipInfo(nome, date_time=(2026, 11, 10, 12, 0, 0))
        info.external_attr = (0o100000 | modo) << 16   # arquivo comum com as permissões (o Mac respeita ao abrir)
        info.compress_type = zipfile.ZIP_DEFLATED
        z.writestr(info, open(origem, 'rb').read())
print(saida)
