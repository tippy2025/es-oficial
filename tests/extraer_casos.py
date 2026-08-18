"""Extrae el bloque JSON del output del agente y le suma los casos del kit."""
import json, os, re, sys

BASE = os.path.dirname(os.path.abspath(__file__))
casos = json.load(open(os.path.join(BASE, "casos_agente.json"), encoding="utf-8"))

kit = [
    ("k01", "estafa", "falso banco por teléfono", "Buen día, lo llamo del área de seguridad de Banco Galicia. Detectamos una compra sospechosa de $95.000 con su tarjeta. Para cancelarla necesito que se acerque al cajero más cercano y siga mis indicaciones para generar un código de cancelación. Manténgase en línea, es urgente.", "rojo"),
    ("k02", "estafa", "premio con costo de envío", "¡FELICITACIONES! Su número fue seleccionado ganador de un Samsung Galaxy S25 en el sorteo aniversario de Mercado Libre. Para recibirlo solo debe abonar el costo de envío de $4.500 en el siguiente link: bit.ly/premio-ml-2026", "rojo"),
    ("k03", "estafa", "código WhatsApp por error", "Hola! Perdón, te mandé por error un código de 6 dígitos por SMS, ¿me lo pasás? Es que estaba registrando mi WhatsApp nuevo y puse mal el número. Gracias!!", "rojo"),
    ("k04", "estafa", "oferta laboral con depósito", "Hola, somos de RRHH de Amazon Argentina. Fuiste preseleccionado para trabajo remoto de carga de datos, $850.000/mes, medio tiempo. Para activar tu cuenta de trabajo necesitamos un depósito reembolsable de $25.000. Respondé SI para continuar.", "rojo"),
    ("k05", "estafa", "falso ANSES reintegro CBU", "ANSES informa: usted tiene un reintegro pendiente de $48.300 por el bono de agosto. Para acreditarlo ingrese su CBU y clave de homebanking en anses-reintegros.com antes del viernes.", "rojo"),
    ("k06", "ambiguo", "cambio de cuenta de expensas", "Hola vecino, soy la nueva administradora del consorcio. Cambiamos la cuenta para el pago de expensas, a partir de este mes transferí al alias CONSORCIO.NUEVO.2026. Cualquier duda me escribís por acá.", "amarillo"),
    ("k07", "legitimo", "turno médico Hospital Italiano", "Hospital Italiano: le recordamos su turno con Clínica Médica el jueves 21/08 a las 10:30 hs, sede central, piso 3. Si no puede asistir, cancele desde el Portal de Salud o la app.", "verde"),
    ("k08", "legitimo", "Andreani envío en camino", "Andreani: tu envío 360001234567 está en camino y llegará hoy entre las 14 y las 18 hs. No es necesario que hagas nada. Podés seguirlo desde nuestra app o en andreani.com.", "verde"),
    ("k09", "legitimo", "turno OSDE", "Hola Juan Manuel, te recordamos tu turno de Oftalmología el martes 26/08 a las 15:40 hs con la Dra. Pérez, Centro Médico Belgrano. Si necesitás cancelar, hacelo desde la app OSDE o llamando al 0810-555-6733.", "verde"),
]
for id_, cat, tipo, texto, esp in kit:
    casos.append({"id": id_, "categoria": cat, "tipo": tipo, "texto": texto, "esperado": esp, "fuente": "kit propio"})

out = os.path.join(BASE, "casos.json")
json.dump(casos, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
from collections import Counter
print(len(casos), Counter(c["categoria"] for c in casos))
