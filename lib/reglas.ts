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
- El código de verificación de WhatsApp (6 dígitos por SMS) NUNCA se comparte con nadie, ni "soporte técnico", ni familiares. Pedirlo = robo de cuenta.
- "Hola, soy tu hijo/a, cambié de número, necesito plata urgente" = patrón clásico de suplantación. Verificar SIEMPRE llamando al número de siempre.
- Perfil con foto de un conocido pidiendo dinero o dólares baratos = cuenta clonada.

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

export interface Veredicto {
  nivel: Nivel;
  titulo: string;
  senales: string[];
  queHacer: string[];
  verificacionOficial: string;
  explicacionSimple: string;
}
