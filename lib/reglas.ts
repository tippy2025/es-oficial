// Base curada de reglas sobre canales oficiales argentinos y patrones de estafa.
// Fuente de verdad inyectada al modelo para anclar el análisis y evitar alucinaciones.

export const REGLAS_CANALES_OFICIALES = `
ORGANISMOS PÚBLICOS
- PAMI no contacta a afiliados por WhatsApp ni por llamada para pedir datos, códigos o fotos del DNI. Trámites: app Mi PAMI o pami.org.ar.
- ANSES no envía links por SMS/WhatsApp ni pide claves, códigos o datos bancarios. Trámites: anses.gob.ar y app Mi ANSES. Los turnos no se cobran.
- ARCA (ex AFIP) no manda links de pago por mail o SMS. Todo se gestiona con clave fiscal en arca.gob.ar.
- Ningún organismo público cobra por un trámite mediante transferencia a un CBU/alias de una persona física.

BANCOS Y BILLETERAS
- Ningún banco pide por teléfono, WhatsApp o mail: claves, token, código de seguridad, coordenadas ni datos de tarjeta. Jamás.
- Los bancos NO llaman para "frenar una transferencia sospechosa" pidiendo que hagas algo desde el cajero o el home banking. Ese llamado es la estafa.
- Ir al cajero "a generar un código" o "actualizar claves" guiado por teléfono = estafa siempre.
- Mercado Pago / Mercado Libre no piden claves ni códigos por teléfono. Mails oficiales: @mercadopago.com, @mercadolibre.com.
- El "asesor" que se ofrece a ayudarte por WhatsApp con un problema bancario que publicaste en redes es un estafador (los bancos responden solo por canales verificados con tilde).

WHATSAPP Y CUENTAS
- El código de verificación de WhatsApp (6 dígitos por SMS) NUNCA se comparte con nadie, ni "soporte técnico", ni familiares. Que ALGUIEN te lo PIDA = robo de cuenta.
- OJO, distinguí: el SMS automático que dice "Tu código de verificación de WhatsApp/Google/Mercado Pago es 123456, no lo compartas" es LEGÍTIMO y normal (verde) — es la propia plataforma avisándote. Solo es peligroso si vos no lo pediste (entonces alguien intenta entrar a tu cuenta: no lo compartas y listo, amarillo a lo sumo) o si otra persona te escribe pidiéndotelo (rojo).
- "Hola, soy tu hijo/a, cambié de número, necesito plata urgente" = patrón clásico de suplantación. Verificar SIEMPRE llamando al número de siempre.
- Perfil con foto de un conocido pidiendo dinero o dólares baratos = cuenta clonada.
- Cualquier mensaje de un supuesto familiar/amigo/conocido que pide una transferencia (aunque sea chica, aunque suene informal y cercano, aunque diga "después te lo devuelvo") sin que puedas verificar la identidad por otro canal = ROJO. La cercanía del tono es parte de la técnica.

PATRONES UNIVERSALES DE ESTAFA
- Urgencia extrema + pedido de secreto ("no le cuentes a nadie", "es ahora o nunca") = señal fuerte.
- Premios, sorteos o herencias que exigen pagar algo para cobrar = estafa.
- Ofertas de trabajo que piden depósito inicial, "activación" o datos bancarios antes de contratar = estafa.
- Inversiones con retornos garantizados (cripto, forex, "trader famoso") = estafa.
- Links acortados (bit.ly, etc.) o dominios imitación (banco-seguro-ar.com, anses-tramites.net) = phishing.
- Pedido de DNI + selfie por WhatsApp para "validar identidad" fuera de una app oficial = robo de identidad.
- Empresas de luz/gas/internet no avisan cortes por WhatsApp con link de pago inmediato.
- Jefe/gerente pidiendo por chat la compra urgente de gift cards = fraude.
- Cobrar por adelantado para "liberar un paquete retenido en aduana" de un correo = estafa (el Correo Argentino cobra solo en sucursal o su web oficial).

LINKS Y SITIOS (si el mensaje trae una URL, analizala)
- Dominios oficiales argentinos: los organismos públicos usan .gob.ar o .gov.ar (anses.gob.ar, arca.gob.ar, argentina.gob.ar); PAMI usa pami.org.ar. Un "gob" en un dominio .com/.net/.xyz/.top es imitación.
- Señales de dominio falso: nombre de la marca + palabras como "seguridad", "verificacion", "online", "ar" separadas por guiones (galicia-seguridad-online.com), terminaciones raras (.xyz, .top, .click, .icu, .site), subdominios que imitan (bna.com.ar.algo.net: el dominio real es lo que va justo antes del .net), letras cambiadas (mercadopag0, santamder), acortadores (bit.ly, cutt.ly, tinyurl).
- HTTP sin S, o un link que no coincide con el texto visible, son señales fuertes.
- Un mail oficial de Mercado Libre/Pago termina en @mercadolibre.com / @mercadopago.com; los bancos usan su dominio propio, nunca gmail/hotmail/outlook.

NOTAS DE VOZ Y LLAMADAS (voz clonada con IA)
- Que la voz suene idéntica a la de un familiar NO prueba nada: en 2026 alcanzan 20-30 segundos de audio sacado de una historia de Instagram o un estado de WhatsApp para clonar una voz con IA. En Argentina hubo casos resonantes (le clonaron la voz a periodistas conocidos y a funcionarios; el Banco Central alertó por videos manipulados de sus propios voceros).
- Si el audio pide plata, una transferencia, datos, códigos, o dice que es una emergencia y hay que actuar ya, tratalo como ROJO aunque la voz sea reconocible. La técnica es justamente que la reconozcas.
- Señales típicas en audios de estafa: audio corto y con ruido de fondo o cortado (para disimular artefactos de la clonación), tono de urgencia extrema, pedido de secreto ("no le digas a nadie", "no cortes"), el que habla evita responder preguntas concretas, insiste en cambiar de canal o de número, o pide que no lo llames de vuelta.
- Regla de oro que hay que decirle SIEMPRE al usuario ante un audio con pedido de dinero: cortá y llamá vos al número de siempre de esa persona (el que ya tenés agendado), o preguntale algo que solo ella pueda saber. Nunca verifiques por la misma vía por la que te llegó el audio.
- Un audio legítimo (un recordatorio, un mensaje familiar común, una nota de voz de trabajo sin pedidos de dinero ni datos) es verde: no marques todo audio como estafa.

CUÁNDO ALGO ES VERDE (no marques todo como sospechoso)
- Un aviso que solo INFORMA algo y no te pide nada es legítimo (verde): "se registró una compra de $X en tal comercio", "tu envío llega hoy", "te recordamos tu turno", "tu factura vence el 30", "tu suscripción se renueva". Que digan "si no fuiste vos, avisanos" o "comunicate con nosotros" es lo que hace un banco de verdad: no es una señal de estafa.
- La diferencia clave es qué te piden: si NO hay link para poner datos, ni pedido de claves/códigos/DNI, ni pedido de transferencia, ni un plazo amenazante para no perder algo, entonces es verde aunque hable de plata o mencione urgencia.
- Desconfiar de todo tiene un costo: si marcamos como sospechoso un mensaje real, la persona deja de confiar en la herramienta y va a ignorarnos cuando sí sea una estafa. Ante un aviso puramente informativo, verde y listo.
- PERO ojo con la excepción: una OFERTA COMERCIAL no solicitada que te empuja a entrar a un link (promos, refinanciación, descuentos, sorteos de marcas, encuestas con premio) es AMARILLO **solo si el dominio del link es exactamente el oficial de esa marca** (bbva.com.ar, santander.com.ar, claro.com.ar). Ahí la recomendación es: no toques el link igual, entrá vos por la app oficial y fijate si la promo existe. Un aviso de servicio (envío, turno, factura, movimiento de cuenta) no entra en esta excepción: eso es verde.
- **Si el dominio NO es el oficial de la marca, es ROJO y punto**, sin importar lo tentadora que suene la oferta: dominios inventados o con palabras pegadas (credito-express-aprobado.com, bono-social-xxx.gob.ar, billetera-x-regalo.com.ar, anses-bono.com.ar), marcas en el subdominio en vez del dominio, o terminaciones raras. Un crédito pre-aprobado, un bono del gobierno o una billetera que regala plata, llegando desde un dominio que no es el oficial, es estafa: rojo.

CÓMO VERIFICAR EN SERIO
- Cortá y llamá vos al número oficial que figura en la web del organismo/banco (no al que te llamó ni al que figura en el mensaje).
- Entrá escribiendo vos la dirección oficial en el navegador, nunca desde el link recibido.
- Ante la duda: no respondas, no toques links, no transfieras, y consultá con alguien de confianza.
`;

export const NIVELES = {
  rojo: { etiqueta: "ALTO RIESGO DE ESTAFA", color: "#dc2626" },
  amarillo: { etiqueta: "SOSPECHOSO — VERIFICÁ ANTES DE ACTUAR", color: "#d97706" },
  verde: { etiqueta: "SIN SEÑALES TÍPICAS DE ESTAFA", color: "#16a34a" },
} as const;

export type Nivel = keyof typeof NIVELES;

export interface CanalOficial {
  id: string;
  nombre: string;
  categoria: string;
  telefono: string | null;
  web: string | null;
  app: string | null;
  alias: string[];
  nuncaHace: string;
}

export interface Veredicto {
  nivel: Nivel;
  titulo: string;
  senales: string[];
  queHacer: string[];
  verificacionOficial: string;
  explicacionSimple: string;
  /** id del organismo/empresa que el mensaje dice ser (del directorio) o null */
  organismoSuplantado?: string | null;
  /** datos verificados del canal oficial, resueltos en el servidor */
  canalOficial?: CanalOficial | null;
  /** si la entrada fue un audio, lo que se escuchó */
  transcripcion?: string | null;
}
