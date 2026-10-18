# -*- coding: utf-8 -*-
"""Genera las plantillas de Elementor de las páginas internas a partir del prototipo (contenido real).

Salida: wordpress/falcon-capital-componentes/plantillas/<ruta>.json y sitio.json (manifiesto de páginas,
páginas de texto y entradas del blog que crea el botón de Ajustes → Falcon Capital). La del Inicio (inicio.json)
se mantiene aparte.

uso: python wordpress/herramientas/plantillas_desde_prototipo.py   (requiere beautifulsoup4)
"""
import glob
import hashlib
import io
import json
import os
import re

from bs4 import BeautifulSoup

R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
PROTO = os.path.join(R, 'prototipo')
SAL = os.path.join(R, 'wordpress', 'falcon-capital-componentes', 'plantillas')
ICONOS_PHP = os.path.join(R, 'wordpress', 'falcon-capital', 'inc', 'iconos.php')

# ---------------------------------------------------------------------------------------------- íconos
def norm_svg(sv):
    """Forma canónica de un SVG: sus trazos con los atributos ordenados (bs4 cambia el orden y las mayúsculas)."""
    sv = str(sv).replace("\\'", "'")
    if not sv.lstrip().startswith('<svg'):
        sv = '<svg>' + sv + '</svg>'
    raiz = BeautifulSoup(sv, 'html.parser').find('svg')
    if raiz is None:
        return ''
    return '|'.join(e.name + str(sorted((k.lower(), v) for k, v in e.attrs.items())) for e in raiz.find_all(True))


ICONOS = {}
for k, v in re.findall(r"'([\w-]+)' => '(<svg.*?</svg>)'", io.open(ICONOS_PHP, encoding='utf-8').read()):
    ICONOS[norm_svg(v)] = k
# variante del enlace con radio 1 (ventajas del confirming)
ICONOS[norm_svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>')] = 'enlace'
FALTAN = set()


def icono(el):
    sv = el.find('svg') if el is not None else None
    if sv is None:
        return 'check'
    n = ICONOS.get(norm_svg(sv))
    if not n:
        FALTAN.add(str(sv)[:120])
        return 'check'
    return n


# ---------------------------------------------------------------------------------------------- utilidades
def _id(*partes):
    return hashlib.md5('|'.join(map(str, partes)).encode()).hexdigest()[:7]


def txt(el):
    """Texto de un elemento: <em> → *…*, <b>/<strong> se conservan, sin íconos."""
    if el is None:
        return ''
    el = BeautifulSoup(str(el), 'html.parser')
    for s in el.find_all('svg'):
        s.decompose()
    for e in el.find_all('em'):
        e.replace_with('*' + e.get_text() + '*')
    h = el.decode_contents() if el.name else str(el)
    inner = el.find()
    h = inner.decode_contents() if inner is not None else h
    h = re.sub(r'</?(?!b>|/b>|strong>|/strong>)[a-z][^>]*>', '', h)
    h = h.replace('&nbsp;', '\u00a0').replace('&amp;', '&')
    return re.sub(r'\s+', ' ', h).strip()


def plano(el):
    return re.sub(r'\s+', ' ', el.get_text(' ', strip=True)) if el is not None else ''


RUTAS = {'index.html': '/', 'reclamaciones.html': '/libro-de-reclamaciones/'}


def url(h):
    h = (h or '').strip()
    if not h:
        return ''
    if 'wa.me/' in h:
        return 'whatsapp:'
    if h.startswith('#') or h.startswith('mailto:') or h.startswith('http'):
        return h
    m = re.match(r'([\w-]+)\.html(#.*)?$', h)
    if m:
        base = RUTAS.get(m.group(1) + '.html', '/' + m.group(1) + '/')
        return base + (m.group(2) or '')
    return h


def u(h):
    return {'url': url(h), 'is_external': '', 'nofollow': ''}


def img(src):
    src = src or ''
    if src.startswith('img/'):
        return {'url': '{{img}}' + src[4:], 'id': ''}
    return {'url': src, 'id': ''}


def pos(im):
    m = re.search(r'object-position:\s*([^;"]+)', im.get('style', '') if im else '')
    return m.group(1).strip() if m else '50% 40%'


def botones(sec):
    acts = sec.select_one('.b-phero-acts')
    s = {'b1': '', 'b1_url': u(''), 'b2': '', 'b2_url': u('')}
    if acts:
        a = acts.find_all('a')
        if len(a) > 0:
            s.update(b1=plano(a[0]), b1_url=u(a[0].get('href')))
        if len(a) > 1:
            s.update(b2=plano(a[1]), b2_url=u(a[1].get('href')))
    return s


def datos_cortos(sec):
    return [{'_id': _id('dc', i, plano(li)), 'icono': icono(li), 'texto': plano(li)} for i, li in enumerate(sec.select('.b-facts li'))]


def parrafos(ps):
    return '\n\n'.join(txt(p) for p in ps)


# ---------------------------------------------------------------------------------------------- secciones
def w_hero(sec):
    im = sec.select_one('.b-phero-bg img')
    migas = sec.select('.b-crumbs > *')
    medio = ''
    spans = [m for m in migas if m.name == 'span' and m.get_text(strip=True) != '/']
    if spans:
        medio = plano(spans[0])
    s = {'foto': img(im.get('src')), 'foto_pos': pos(im), 'miga_medio': medio, 'miga': '',
         'titulo': txt(sec.select_one('.b-h1')), 'bajada': txt(sec.select_one('.b-phero-sub')),
         'datos': datos_cortos(sec), 'destacado': 'yes' if sec.select_one('.b-feat') else ''}
    s.update(botones(sec))
    return 'fc-pagina-hero', s


def w_que(sec):
    side = sec.select_one('.b-que-side')
    ben = [{'_id': _id('ben', i), 'icono': icono(li.select_one('span')), 'titulo': plano(li.find('b')), 'texto': plano(li.find('small'))}
           for i, li in enumerate(side.select('.b-que-ben li'))]
    pasos = []
    for i, li in enumerate(sec.select('.b-tl-i')):
        dot = li.select_one('.b-tl-dot')
        im = dot.find('img')
        p = {'_id': _id('paso', i), 'titulo': plano(li.find('b')), 'texto': plano(li.find('p')), 'marca': 'icono', 'icono': icono(dot), 'logo': {'url': '', 'id': ''}}
        if im is not None:
            if 'isotipo' in im.get('src', ''):
                p['marca'] = 'falcon'
            else:
                p['marca'] = 'logo'
                p['logo'] = img(im.get('src'))
        pasos.append(p)
    return 'fc-que', {'kicker': plano(side.select_one('.b-kicker')), 'titulo': txt(side.find('h2')),
                      'texto': parrafos(side.find_all('p', recursive=False)), 'beneficios': ben,
                      'pasos_t': plano(sec.select_one('.b-tl-k')), 'pasos': pasos}


def w_simsec(sec):
    im = sec.select_one('.b-simsec-bg img')
    return 'fc-simulador', {'modo': 'seccion', 'foto': img(im.get('src')), 'foto_pos': pos(im), 'kicker': plano(sec.select_one('.b-kicker')),
                            'titulo': txt(sec.select_one('.b-head h2')), 'bajada': txt(sec.select_one('.b-head-p'))}


def w_simpage(sec):
    im = sec.select_one('.b-phero-bg img')
    alt = sec.select_one('.b-simpage-alt')
    a = alt.find('a') if alt else None
    alt_t = re.sub(r'\s+', ' ', alt.get_text(' ', strip=True)) if alt else ''
    if a is not None:
        alt_t = alt_t.replace(a.get_text(strip=True), '').rstrip(' .').strip()
    return 'fc-simulador', {'modo': 'pagina', 'foto': img(im.get('src')), 'foto_pos': pos(im), 'miga': '',
                            'titulo': txt(sec.select_one('.b-h1')), 'bajada': txt(sec.select_one('.b-phero-sub')),
                            'datos': datos_cortos(sec), 'alt': alt_t, 'alt_enlace': a.get_text(strip=True) if a is not None else '',
                            'alt_url': u(a.get('href') if a is not None else '')}


def w_norm(sec):
    side = sec.select_one('.b-norm-side')
    law = sec.select_one('.b-norm-law')
    grupos = []
    for i, g in enumerate(sec.select('.b-norm-g')):
        filas = [plano(r.find('b')) + ' | ' + plano(r.find('span')) for r in g.select('.b-norm-row')]
        grupos.append({'_id': _id('g', i), 'titulo': plano(g.find('h4')), 'normas': '\n'.join(filas)})
    return 'fc-cumplimiento', {
        'fondo': img(sec.select_one('.b-norm-bg img').get('src')), 'kicker': plano(side.select_one('.b-kicker')),
        'titulo': txt(side.find('h2')), 'texto': txt(side.find('p')),
        'sellos': [{'_id': _id('se', i), 'logo': img(x.get('src')), 'alt': x.get('alt', '')} for i, x in enumerate(sec.select('.b-norm-seals img'))],
        'ley_k': plano(law.find('small')) if law else '', 'ley': plano(law.find('b')) if law else '', 'ley_d': plano(law.find('span')) if law else '',
        'idx_t': plano(sec.select_one('.b-norm-k')), 'grupos': grupos}


def w_why(sec):
    fotos = {f.get('data-w'): f for f in sec.select('.b-why-frame > img[data-w]')}
    items = []
    for i, li in enumerate(sec.select('.b-why-i')):
        f = fotos.get(li.get('data-w'))
        items.append({'_id': _id('why', i), 'icono': icono(li.select_one('.b-why-n')), 'titulo': plano(li.find('b')), 'texto': plano(li.find('p')),
                      'foto': img(f.get('src') if f is not None else ''), 'foto_pos': pos(f) if f is not None else '50% 40%'})
    return 'fc-por-que', {'kicker': plano(sec.select_one('.b-kicker')), 'titulo': txt(sec.select_one('h2')), 'items': items}


def w_contacto(sec):
    side = sec.select_one('.b-contact-side')
    req = side.select_one('.b-req')
    form = sec.select_one('form')
    btn = form.select_one('.lf-send span')
    safe = form.select_one('.lf-safe')
    s = {'kicker': plano(side.select_one('.b-kicker')), 'titulo': txt(side.find('h2')), 'texto': txt(side.find('p')),
         'con_req': 'yes' if req else '', 'con_canales': 'yes' if side.select_one('.b-contact-ch') else '',
         'producto': form.get('data-prod', ''), 'boton': plano(btn), 'seguro': plano(safe)}
    if req:
        s.update(req_t=plano(req.find('b')), req='\n'.join(plano(li) for li in req.select('li')), req_n=plano(req.find('small')))
    return 'fc-contacto', s


def w_conf(sec):
    partes = []
    for i, li in enumerate(sec.select('.b-partes li')):
        ic = li.select_one('.b-parte-i')
        partes.append({'_id': _id('pa', i), 'marca': 'falcon' if ic.find('img') else 'icono', 'icono': icono(ic),
                       'titulo': plano(li.find('b')), 'texto': plano(li.find_all('span')[-1])})
    cols = sec.select('.b-gana-col')
    ven = sec.select_one('.b-ven')
    return 'fc-confirming-partes', {
        'kicker': plano(sec.select_one('.b-kicker')), 'titulo': txt(sec.select_one('.b-head h2')), 'partes': partes,
        'gana1_t': plano(cols[0].find('h3')), 'gana1': '\n'.join(plano(li) for li in cols[0].select('li')),
        'gana2_t': plano(cols[1].find('h3')), 'gana2': '\n'.join(plano(li) for li in cols[1].select('li')),
        'ven_tag': plano(ven.select_one('.b-tag')), 'ven_t': plano(ven.find('h3')),
        'ventajas': [{'_id': _id('ve', i), 'icono': icono(li.find('span')), 'titulo': plano(li.find('b'))} for i, li in enumerate(ven.select('ol li'))]}


def w_somos(sec):
    fig = sec.select_one('.b-somos-photo')
    t = sec.select_one('.b-somos-txt')
    return 'fc-somos', {'foto': img(fig.find('img').get('src')), 'pie': plano(fig.find('figcaption')), 'kicker': plano(t.select_one('.b-kicker')),
                        'titulo': txt(t.find('h2')), 'texto': parrafos(t.find_all('p')), 'con_cifras': 'yes'}


def w_video(sec):
    t = sec.select_one('.b-intro-txt')
    ps = t.find_all('p')
    v = sec.select_one('.b-video')
    return 'fc-presentacion', {'kicker': plano(sec.select_one('.b-kicker')), 'titulo': txt(sec.select_one('h2')),
                               'lead': txt(ps[0]) if ps else '', 'texto': parrafos(ps[1:]), 'enlace': '',
                               'video_img': img(v.find('img').get('src')), 'video_tit': plano(v.select_one('.b-video-cap b')),
                               'video_sub': plano(v.select_one('.b-video-cap small')), 'con_cifras': ''}


def w_oficina(sec):
    return 'fc-oficina', {'kicker': plano(sec.select_one('.b-kicker')), 'titulo': txt(sec.select_one('h2')),
                          'enlace': plano(sec.select_one('.b-link')), 'foto': img(sec.select_one('.b-map-card img').get('src'))}


def w_corta(sec):
    s = {'miga': '', 'kicker': plano(sec.select_one('.b-kicker')), 'titulo': txt(sec.select_one('.b-h1')), 'bajada': txt(sec.select_one('.b-phero-sub'))}
    s.update(botones(sec))
    return 'fc-pagina-corta', s


def w_faq(sec):
    items = [{'_id': _id('faq', i), 'pregunta': plano(d.find('summary')), 'respuesta': plano(d.find('p'))} for i, d in enumerate(sec.select('details'))]
    pend = sec.select_one('.b-pending, .b-doc-nota')
    cta = sec.select_one('.b-art-cta')
    return 'fc-preguntas', {'items': items, 'abierta': 'yes', 'pendiente': txt(pend) if pend else '',
                            'cta_t': plano(cta.find('b')), 'cta_b': plano(cta.find('a')), 'cta_url': u('whatsapp:')}


def w_acceso(sec):
    side = sec.select_one('.b-contact-side')
    pend = side.select_one('.b-pending')
    modo = 'registro' if sec.select_one('.b-sso') else 'login'
    aviso = sec.select_one('[data-demo-ok]')
    av = plano(aviso).replace('Prototipo:', '').strip() if aviso else ''
    return 'fc-acceso', {'modo': modo, 'kicker': plano(side.select_one('.b-kicker')), 'titulo': txt(side.find('h2')),
                         'texto': txt(side.find('p')), 'puntos': '\n'.join(plano(li) for li in side.select('.b-acc-list li')),
                         'pendiente': txt(pend) if pend else '', 'aviso': av[:1].upper() + av[1:]}


def sin_datos(nombre):
    return lambda sec: (nombre, {})


TIPOS = [
    ('b-simpage', w_simpage), ('b-phero-s', w_corta), ('b-phero', w_hero), ('b-que', w_que), ('b-simsec', w_simsec),
    ('b-norm', w_norm), ('b-why', w_why), ('b-contact', None), ('b-conf', w_conf), ('b-somos', w_somos), ('b-map', w_oficina),
    ('b-cta', sin_datos('fc-cta')), ('b-can', sin_datos('fc-canales')), ('b-ceo', sin_datos('fc-gerencia')), ('b-seg', sin_datos('fc-seguridad')),
    ('b-act', sin_datos('fc-actualidad')), ('b-testis', sin_datos('fc-testimonios')), ('b-blogall', sin_datos('fc-blog-lista')),
]


def widget(sec):
    clases = sec.get('class', [])
    k = sec.get('data-sec')
    if 'b-contact' in clases:
        if k == 'acceso':
            return w_acceso(sec)
        if k == 'reclamo':
            return 'fc-reclamaciones', {}
        return w_contacto(sec)
    if 'b-intro' in clases and k == 'video':
        return w_video(sec)
    if 'b-art' in clases and k == 'preguntas':
        return w_faq(sec)
    for c, f in TIPOS:
        if c in clases and f:
            return f(sec)
    raise ValueError('sección sin widget: %s %s' % (clases, k))


# nombre de cada sección en el panel «Estructura» de Elementor: el título de su widget
TITULOS = {}
for _f in glob.glob(os.path.join(R, 'wordpress', 'falcon-capital-componentes', 'widgets', '*.php')):
    _t = io.open(_f, encoding='utf-8').read()
    _n = re.search(r"get_name\(\)\s*\{\s*return '([^']+)'", _t)
    _ti = re.search(r"get_title\(\)\s*\{\s*return '([^']+)'", _t)
    if _n and _ti:
        TITULOS[_n.group(1)] = _ti.group(1)
TITULOS['fc-hero'] = 'Banner con simulador'

CONT = {'content_width': 'full', 'padding': {'unit': 'px', 'top': '0', 'right': '0', 'bottom': '0', 'left': '0', 'isLinked': True},
        'flex_gap': {'unit': 'px', 'size': 0, 'column': '0', 'row': '0', 'isLinked': True}}


def pagina(archivo, ruta, titulo=''):
    soup = BeautifulSoup(io.open(os.path.join(PROTO, archivo), encoding='utf-8').read(), 'html.parser')
    main = soup.find('main')
    data = []
    for i, sec in enumerate(main.find_all('section', recursive=False)):
        nombre, s = widget(sec)
        # la ruta del diseño, solo si no es el título de la página (p. ej. Gracias → «Contáctanos»)
        ult = sec.select('.b-crumbs > b')
        if 'miga' in s and ult and plano(ult[-1]) != titulo:
            s['miga'] = plano(ult[-1])
        data.append({'id': _id(ruta, 'c', i), 'elType': 'container', 'isInner': False, 'settings': dict(CONT, _title=TITULOS.get(nombre, nombre)),
                     'elements': [{'id': _id(ruta, 'w', i), 'elType': 'widget', 'widgetType': nombre, 'settings': s, 'elements': []}]})
    return data


PAGINAS = [
    ('factoring.html', 'factoring', 'Factoring'),
    ('confirming.html', 'confirming', 'Confirming'),
    ('capital-de-trabajo.html', 'capital-de-trabajo', 'Capital de Trabajo'),
    ('simulador.html', 'simulador', 'Simulador'),
    ('conocenos.html', 'conocenos', 'Conócenos'),
    ('blog.html', 'blog', 'Blog'),
    ('contactanos.html', 'contactanos', 'Contáctanos'),
    ('preguntas-frecuentes.html', 'preguntas-frecuentes', 'Preguntas frecuentes'),
    ('iniciar-sesion.html', 'iniciar-sesion', 'Iniciar sesión'),
    ('registro.html', 'registro', 'Crea tu cuenta'),
    ('reclamaciones.html', 'libro-de-reclamaciones', 'Libro de Reclamaciones'),
    ('gracias.html', 'gracias', 'Gracias'),
]

LEGALES = [
    ('politica-de-privacidad', 'Política de Privacidad', 'Tratamiento de los datos personales que recogemos en los formularios de la web y en Mi Portal Falcon.', 'Falcon Capital debe entregar la Política de Privacidad aprobada por el área legal.'),
    ('terminos-y-condiciones', 'Términos y Condiciones', 'Condiciones de uso de la web de Falcon Capital y de los servicios que se contratan a través de ella.', 'Falcon Capital debe entregar los Términos y Condiciones aprobados por el área legal.'),
    ('politica-de-cookies', 'Política de Cookies', 'Qué cookies utilizamos, para qué sirven y cómo puedes cambiar tus preferencias en cualquier momento.', 'Falcon Capital debe entregar el detalle de las cookies que finalmente use la web.'),
    ('reglamento-de-factoring', 'Reglamento de Factoring', 'Condiciones bajo las que Falcon Capital realiza operaciones de factoring y descuento de facturas.', 'Falcon Capital debe entregar el Reglamento de Factoring vigente.'),
    ('constancia-de-registro', 'Constancia de Registro', 'Constancia de registro de Falcon Capital ante la Superintendencia de Banca, Seguros y AFP.', 'Falcon Capital debe entregar la constancia emitida por la SBS.'),
]


def enlaces_wp(html):
    """Enlaces del prototipo (pagina.html) a rutas de WordPress (/pagina/)."""
    return re.sub(r'href="([\w-]+\.html(?:#[\w-]*)?)"', lambda m: 'href="%s"' % url(m.group(1)), html)


def documento(archivo):
    """Contenido de una página de texto del prototipo (legales), sin los botones del final."""
    doc = BeautifulSoup(io.open(os.path.join(PROTO, archivo), encoding='utf-8').read(), 'html.parser').select_one('.b-doc')
    for x in doc.select('.b-doc-acts'):
        x.decompose()
    return enlaces_wp(re.sub(r'\s+\n', '\n', doc.decode_contents()).strip())


def articulo(archivo):
    """Bajada y contenido de la página de un artículo del prototipo (sin la llamada final ni las anclas del índice)."""
    art = BeautifulSoup(io.open(os.path.join(PROTO, archivo), encoding='utf-8').read(), 'html.parser')
    cuerpo = art.select_one('.b-art-body')
    for x in cuerpo.select('.b-art-cta'):
        x.decompose()
    for h in cuerpo.find_all('h2'):
        if h.has_attr('id'):
            del h['id']
    return plano(art.select_one('.b-phero-sub')), enlaces_wp(re.sub(r'\s+\n', '\n', cuerpo.decode_contents()).strip())


def entradas():
    """Las entradas del blog del prototipo, cada una con el texto de su página (articulo*.html)."""
    soup = BeautifulSoup(io.open(os.path.join(PROTO, 'blog.html'), encoding='utf-8').read(), 'html.parser')
    destacado = soup.select_one('.b-feat')
    destacado = destacado.get('href') if destacado else ''
    # las que el diseño muestra en el blog del Inicio, en ese orden
    ini = BeautifulSoup(io.open(os.path.join(PROTO, 'index.html'), encoding='utf-8').read(), 'html.parser')
    del_inicio = [plano(h) for h in ini.select('[data-sec="blog"] .b-post h3')]
    out = []
    for i, a in enumerate(soup.select('.b-blog-grid .b-post')):
        titulo = plano(a.find('h3'))
        cat = plano(a.select_one('.b-tag'))
        foto = a.find('img').get('src').replace('img/', '')
        extracto, contenido = articulo(a.get('href'))
        fijo = a.get('href') == destacado
        e = {'titulo': titulo, 'categoria': cat, 'foto': foto, 'extracto': extracto, 'contenido': contenido, 'fijo': fijo, 'orden': i}
        if titulo in del_inicio:
            e['inicio'] = del_inicio.index(titulo)
        out.append(e)
    return out


if __name__ == '__main__':
    os.makedirs(SAL, exist_ok=True)
    manifiesto = {'paginas': [{'ruta': 'inicio', 'titulo': 'Inicio', 'plantilla': 'inicio.json', 'portada': True}], 'textos': [], 'entradas': entradas()}
    for archivo, ruta, titulo in PAGINAS:
        data = pagina(archivo, ruta, titulo)
        io.open(os.path.join(SAL, ruta + '.json'), 'w', encoding='utf-8').write(json.dumps(data, ensure_ascii=False))
        manifiesto['paginas'].append({'ruta': ruta, 'titulo': titulo, 'plantilla': ruta + '.json'})
        print('%-24s %s' % (ruta, ' · '.join(e['elements'][0]['widgetType'] for e in data)))
    for ruta, titulo, lead, pend in LEGALES:
        manifiesto['textos'].append({'ruta': ruta, 'titulo': titulo, 'extracto': lead, 'rotulo': 'Legal', 'contenido': documento(ruta + '.html')})
    io.open(os.path.join(SAL, 'sitio.json'), 'w', encoding='utf-8').write(json.dumps(manifiesto, ensure_ascii=False, indent=1))
    print('entradas', len(manifiesto['entradas']), '· textos', len(manifiesto['textos']))
    if FALTAN:
        print('ÍCONOS SIN NOMBRE:', len(FALTAN))
        for f in sorted(FALTAN):
            print('  ', f)
