# -*- coding: utf-8 -*-
"""Arma la versión premium del prototipo: por cada página, una copia «-v2.html» con la capa premium
(assets/premium.css y assets/premium.js) y los enlaces internos apuntando a las otras páginas -v2.
La versión actual (las páginas sin -v2) no se toca.

uso: python wordpress/herramientas/prototipo_v2.py
"""
import glob
import io
import os
import re

R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
P = os.path.join(R, 'prototipo')

paginas = sorted(os.path.basename(f)[:-5] for f in glob.glob(os.path.join(P, '*.html')) if not f.endswith('-v2.html'))
for nombre in paginas:
    s = io.open(os.path.join(P, nombre + '.html'), encoding='utf-8').read()
    s = s.replace("className+=' js';", "className+=' js v2';", 1)
    # la capa premium va después de las hojas del diseño y del script del sitio
    ultima = list(re.finditer(r'<link rel="stylesheet" href="assets/[\w-]+\.css">', s))[-1]
    s = s[:ultima.end()] + '\n<link rel="stylesheet" href="assets/premium.css">' + s[ultima.end():]
    s = s.replace('<script src="assets/falcon.js"></script>', '<script src="assets/falcon.js"></script>\n<script src="assets/premium.js"></script>', 1)
    # enlaces entre páginas: a su versión -v2
    s = re.sub(r'href="([\w-]+)\.html(#[\w-]*)?"', lambda m: 'href="%s%s.html%s"' % (m.group(1), '-v2' if m.group(1) in paginas else '', m.group(2) or ''), s)
    io.open(os.path.join(P, nombre + '-v2.html'), 'w', encoding='utf-8', newline='\n').write(s)
print('versión premium:', len(paginas), 'páginas (-v2.html)')
