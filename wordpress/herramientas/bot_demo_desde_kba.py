# -*- coding: utf-8 -*-
"""Genera prototipo/assets/bot-demo.js a partir de la base de conocimiento del plugin (plantillas/kba.json).

El prototipo es estático y no puede llamar a la IA: con este archivo, el asistente responde en modo demostración
eligiendo el tema con más coincidencias. En WordPress no se usa (responde la IA desde el plugin).
uso: python wordpress/herramientas/bot_demo_desde_kba.py
"""
import io
import json
import os

R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
kba = json.load(io.open(os.path.join(R, 'wordpress', 'falcon-capital-componentes', 'plantillas', 'kba.json'), encoding='utf-8'))
datos = [{'titulo': k['titulo'], 'claves': k.get('claves', ''), 'contenido': k['contenido']} for k in kba]
js = ('/* Asistente virtual · base de conocimiento de ejemplo para el modo demostración del prototipo.\n'
      '   Generado desde wordpress/falcon-capital-componentes/plantillas/kba.json: no editar a mano. */\n'
      'window.FC_BOT_DEMO = ' + json.dumps(datos, ensure_ascii=False, indent=1) + ';\n')
io.open(os.path.join(R, 'prototipo', 'assets', 'bot-demo.js'), 'w', encoding='utf-8', newline='\n').write(js)
print('bot-demo.js:', len(datos), 'temas')
