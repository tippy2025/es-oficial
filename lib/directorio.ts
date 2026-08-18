import type { CanalOficial } from "./reglas";

// Directorio de canales oficiales verificados (Argentina, agosto 2026).
// Criterio: incluir SOLO datos publicados en la web oficial de cada organismo/empresa.
// Los teléfonos de bancos se dejan en null a propósito: el número real está en el
// dorso de la tarjeta y en la web oficial — nunca en el mensaje recibido.
// La regla "nuncaHace" sale de las políticas antifraude publicadas por cada uno.

const REGLA_BANCO =
  "Ningún banco pide por teléfono, WhatsApp o mail tu clave, token, código de seguridad ni datos de la tarjeta, ni te manda al cajero a 'generar un código'. El número real está en el dorso de tu tarjeta y en su web oficial.";
const REGLA_BILLETERA =
  "No pide claves ni códigos de verificación por teléfono, mail, SMS ni WhatsApp. Toda gestión se hace desde la app oficial.";
const REGLA_SERVICIO =
  "No avisa cortes ni deudas por WhatsApp con un link de pago inmediato. Verificá tu cuenta entrando vos a la web o app oficial.";
const REGLA_CORREO =
  "No cobra 'liberación de paquetes' ni aduana por link. Cualquier pago se hace en sucursal o en la web oficial, entrando vos.";

export const DIRECTORIO: CanalOficial[] = [
  // ——— Organismos públicos ———
  { id: "pami", nombre: "PAMI", categoria: "organismo", telefono: "138", web: "pami.org.ar", app: "Mi PAMI",
    alias: ["pami", "obra social de jubilados", "medicamentos gratis", "cobertura de jubilados"],
    nuncaHace: "PAMI no contacta afiliados por WhatsApp ni por llamada para pedir datos, códigos o foto del DNI. No cobra por prestaciones. Trámites: app Mi PAMI o pami.org.ar." },
  { id: "anses", nombre: "ANSES", categoria: "organismo", telefono: "130", web: "anses.gob.ar", app: "Mi ANSES",
    alias: ["anses", "jubilación", "auh", "asignación", "bono", "haberes", "mi anses"],
    nuncaHace: "ANSES no envía links por SMS ni WhatsApp, no pide claves, códigos ni datos bancarios, y los turnos y trámites son gratuitos." },
  { id: "arca", nombre: "ARCA (ex AFIP)", categoria: "organismo", telefono: null, web: "arca.gob.ar", app: null,
    alias: ["arca", "afip", "clave fiscal", "monotributo", "impuestos"],
    nuncaHace: "ARCA no manda links de pago por mail ni SMS. Todo se gestiona con clave fiscal en arca.gob.ar." },
  { id: "mi_argentina", nombre: "Mi Argentina", categoria: "organismo", telefono: null, web: "argentina.gob.ar", app: "Mi Argentina",
    alias: ["mi argentina", "argentina.gob.ar", "trámites nacionales"],
    nuncaHace: "Mi Argentina no pide validar identidad por WhatsApp ni cobra por trámites." },
  { id: "renaper", nombre: "RENAPER (DNI y pasaporte)", categoria: "organismo", telefono: null, web: "argentina.gob.ar/interior/renaper", app: null,
    alias: ["renaper", "dni", "pasaporte", "registro de las personas"],
    nuncaHace: "El RENAPER no pide foto del DNI por WhatsApp ni cobra por 'actualizar' documentos por link." },
  { id: "defensa_consumidor", nombre: "Defensa del Consumidor", categoria: "organismo", telefono: "0800-666-1518", web: "argentina.gob.ar/defensadelconsumidor", app: null,
    alias: ["defensa del consumidor", "reclamo", "coprec"],
    nuncaHace: "El reclamo en Defensa del Consumidor es gratuito: nadie te cobra por gestionarlo." },
  { id: "ufeci", nombre: "UFECI (fiscalía de ciberdelitos)", categoria: "organismo", telefono: null, web: "mpf.gob.ar/ufeci", app: null,
    alias: ["ufeci", "ciberdelito", "denuncia estafa", "fiscalía"],
    nuncaHace: "La denuncia se hace por mail a denunciasufeci@mpf.gov.ar o en comisaría. Nadie de la fiscalía te llama para pedir datos bancarios." },
  { id: "linea_134", nombre: "Línea 134 (Ministerio de Seguridad)", categoria: "organismo", telefono: "134", web: "argentina.gob.ar/seguridad", app: null,
    alias: ["134", "ministerio de seguridad", "denuncia anónima"],
    nuncaHace: "Línea gratuita y anónima para denunciar delitos, incluidas estafas." },
  { id: "linea_137", nombre: "Línea 137 (violencia familiar y sexual)", categoria: "organismo", telefono: "137", web: "argentina.gob.ar/justicia/violencia-familiar-sexual", app: null,
    alias: ["137", "violencia familiar"], nuncaHace: "Atención gratuita las 24 horas." },
  { id: "linea_144", nombre: "Línea 144 (violencia de género)", categoria: "organismo", telefono: "144", web: "argentina.gob.ar/generos/linea-144", app: null,
    alias: ["144", "violencia de género"], nuncaHace: "Atención gratuita las 24 horas." },
  { id: "correo_argentino", nombre: "Correo Argentino", categoria: "correo", telefono: null, web: "correoargentino.com.ar", app: null,
    alias: ["correo argentino", "correo", "paquete retenido", "aduana", "encomienda"], nuncaHace: REGLA_CORREO },
  { id: "andreani", nombre: "Andreani", categoria: "correo", telefono: null, web: "andreani.com", app: "Andreani",
    alias: ["andreani", "envío", "paquete"], nuncaHace: REGLA_CORREO },
  { id: "oca", nombre: "OCA", categoria: "correo", telefono: null, web: "oca.com.ar", app: null,
    alias: ["oca", "envío", "paquete"], nuncaHace: REGLA_CORREO },

  // ——— Bancos (teléfono: dorso de la tarjeta) ———
  { id: "banco_nacion", nombre: "Banco Nación", categoria: "banco", telefono: null, web: "bna.com.ar", app: "BNA+",
    alias: ["banco nación", "bna", "nación"], nuncaHace: REGLA_BANCO },
  { id: "banco_provincia", nombre: "Banco Provincia", categoria: "banco", telefono: null, web: "bancoprovincia.com.ar", app: "Banco Provincia",
    alias: ["banco provincia", "bapro", "provincia"], nuncaHace: REGLA_BANCO },
  { id: "banco_ciudad", nombre: "Banco Ciudad", categoria: "banco", telefono: null, web: "bancociudad.com.ar", app: "Banco Ciudad",
    alias: ["banco ciudad", "ciudad"], nuncaHace: REGLA_BANCO },
  { id: "galicia", nombre: "Banco Galicia", categoria: "banco", telefono: null, web: "galicia.ar", app: "Galicia",
    alias: ["galicia", "banco galicia", "galicia más", "hsbc"], nuncaHace: REGLA_BANCO },
  { id: "santander", nombre: "Santander", categoria: "banco", telefono: null, web: "santander.com.ar", app: "Santander",
    alias: ["santander", "santander río", "río"], nuncaHace: REGLA_BANCO },
  { id: "bbva", nombre: "BBVA", categoria: "banco", telefono: null, web: "bbva.com.ar", app: "BBVA",
    alias: ["bbva", "francés", "banco francés"], nuncaHace: REGLA_BANCO },
  { id: "macro", nombre: "Banco Macro", categoria: "banco", telefono: null, web: "macro.com.ar", app: "Macro",
    alias: ["macro", "banco macro"], nuncaHace: REGLA_BANCO },
  { id: "icbc", nombre: "ICBC", categoria: "banco", telefono: null, web: "icbc.com.ar", app: "ICBC",
    alias: ["icbc"], nuncaHace: REGLA_BANCO },
  { id: "credicoop", nombre: "Banco Credicoop", categoria: "banco", telefono: null, web: "bancocredicoop.coop", app: "Credicoop",
    alias: ["credicoop"], nuncaHace: REGLA_BANCO },
  { id: "patagonia", nombre: "Banco Patagonia", categoria: "banco", telefono: null, web: "bancopatagonia.com.ar", app: "Patagonia",
    alias: ["patagonia", "banco patagonia"], nuncaHace: REGLA_BANCO },
  { id: "supervielle", nombre: "Banco Supervielle", categoria: "banco", telefono: null, web: "supervielle.com.ar", app: "Supervielle",
    alias: ["supervielle"], nuncaHace: REGLA_BANCO },
  { id: "itau", nombre: "Itaú", categoria: "banco", telefono: null, web: "itau.com.ar", app: "Itaú",
    alias: ["itaú", "itau"], nuncaHace: REGLA_BANCO },
  { id: "brubank", nombre: "Brubank", categoria: "banco", telefono: null, web: "brubank.com", app: "Brubank",
    alias: ["brubank"], nuncaHace: "Brubank atiende solo por el chat de la app y mail: no ofrece atención por WhatsApp ni pide claves por teléfono." },
  { id: "uala", nombre: "Ualá", categoria: "banco", telefono: null, web: "uala.com.ar", app: "Ualá",
    alias: ["ualá", "uala"], nuncaHace: REGLA_BILLETERA },
  { id: "naranja_x", nombre: "Naranja X", categoria: "banco", telefono: null, web: "naranjax.com", app: "Naranja X",
    alias: ["naranja", "naranja x", "tarjeta naranja"], nuncaHace: REGLA_BANCO },

  // ——— Billeteras ———
  { id: "mercado_pago", nombre: "Mercado Pago", categoria: "billetera", telefono: null, web: "mercadopago.com.ar", app: "Mercado Pago",
    alias: ["mercado pago", "mercadopago", "mp"], nuncaHace: "Mercado Pago no pide claves ni códigos por teléfono, mail, SMS ni WhatsApp. Sus mails oficiales terminan en @mercadopago.com. Todo se gestiona desde la app." },
  { id: "modo", nombre: "MODO", categoria: "billetera", telefono: null, web: "modo.com.ar", app: "MODO",
    alias: ["modo"], nuncaHace: REGLA_BILLETERA },
  { id: "cuenta_dni", nombre: "Cuenta DNI (Banco Provincia)", categoria: "billetera", telefono: null, web: "bancoprovincia.com.ar/cdni", app: "Cuenta DNI",
    alias: ["cuenta dni"], nuncaHace: REGLA_BILLETERA },
  { id: "personal_pay", nombre: "Personal Pay", categoria: "billetera", telefono: null, web: "personalpay.com.ar", app: "Personal Pay",
    alias: ["personal pay"], nuncaHace: REGLA_BILLETERA },
  { id: "prex", nombre: "Prex", categoria: "billetera", telefono: null, web: "prexcard.com.ar", app: "Prex",
    alias: ["prex"], nuncaHace: REGLA_BILLETERA },
  { id: "lemon", nombre: "Lemon", categoria: "billetera", telefono: null, web: "lemon.me", app: "Lemon",
    alias: ["lemon", "lemon cash"], nuncaHace: REGLA_BILLETERA },

  // ——— Servicios ———
  { id: "edenor", nombre: "Edenor", categoria: "servicio", telefono: null, web: "edenor.com", app: "Edenor",
    alias: ["edenor", "luz"], nuncaHace: REGLA_SERVICIO },
  { id: "edesur", nombre: "Edesur", categoria: "servicio", telefono: null, web: "edesur.com.ar", app: "Edesur",
    alias: ["edesur", "luz"], nuncaHace: REGLA_SERVICIO },
  { id: "metrogas", nombre: "Metrogas", categoria: "servicio", telefono: null, web: "metrogas.com.ar", app: "Metrogas",
    alias: ["metrogas", "gas"], nuncaHace: REGLA_SERVICIO },
  { id: "naturgy", nombre: "Naturgy", categoria: "servicio", telefono: null, web: "naturgy.com.ar", app: "Naturgy",
    alias: ["naturgy", "gas ban", "gas"], nuncaHace: REGLA_SERVICIO },
  { id: "aysa", nombre: "AySA", categoria: "servicio", telefono: null, web: "aysa.com.ar", app: "AySA",
    alias: ["aysa", "agua"], nuncaHace: REGLA_SERVICIO },
  { id: "movistar", nombre: "Movistar", categoria: "servicio", telefono: null, web: "movistar.com.ar", app: "Mi Movistar",
    alias: ["movistar"], nuncaHace: REGLA_SERVICIO },
  { id: "claro", nombre: "Claro", categoria: "servicio", telefono: null, web: "claro.com.ar", app: "Mi Claro",
    alias: ["claro"], nuncaHace: REGLA_SERVICIO },
  { id: "personal", nombre: "Personal / Flow", categoria: "servicio", telefono: null, web: "personal.com.ar", app: "Mi Personal",
    alias: ["personal", "flow", "fibertel", "cablevisión"], nuncaHace: REGLA_SERVICIO },
  { id: "telecentro", nombre: "Telecentro", categoria: "servicio", telefono: null, web: "telecentro.com.ar", app: "Telecentro",
    alias: ["telecentro"], nuncaHace: REGLA_SERVICIO },
  { id: "directv", nombre: "DirecTV", categoria: "servicio", telefono: null, web: "directv.com.ar", app: "DirecTV",
    alias: ["directv"], nuncaHace: REGLA_SERVICIO },

  // ——— Empresas frecuentemente suplantadas ———
  { id: "mercado_libre", nombre: "Mercado Libre", categoria: "empresa", telefono: null, web: "mercadolibre.com.ar", app: "Mercado Libre",
    alias: ["mercado libre", "mercadolibre", "meli"], nuncaHace: "Mercado Libre no pide datos sensibles por mail, teléfono ni WhatsApp. Sus mails oficiales terminan en @mercadolibre.com. Los reclamos se hacen desde la app." },
  { id: "netflix", nombre: "Netflix", categoria: "empresa", telefono: null, web: "netflix.com", app: "Netflix",
    alias: ["netflix"], nuncaHace: "Netflix no pide datos de pago por mail ni SMS: cualquier problema de cobro se resuelve entrando vos a netflix.com." },
  { id: "ypf", nombre: "YPF", categoria: "empresa", telefono: null, web: "ypf.com", app: "YPF App",
    alias: ["ypf", "serviclub"], nuncaHace: "YPF no regala combustible por links ni sortea por WhatsApp." },
  { id: "aerolineas", nombre: "Aerolíneas Argentinas", categoria: "empresa", telefono: null, web: "aerolineas.com.ar", app: "Aerolíneas Argentinas",
    alias: ["aerolíneas", "aerolineas argentinas"], nuncaHace: "Aerolíneas no regala pasajes por links compartidos ni pide datos de tarjeta por WhatsApp." },
];

const POR_ID = new Map(DIRECTORIO.map((c) => [c.id, c]));

/** Busca por id exacto o por alias (tolerante a mayúsculas/acentos). */
export function buscarCanal(idOAlias: string | null | undefined): CanalOficial | null {
  if (!idOAlias) return null;
  const q = normalizar(idOAlias);
  const porId = POR_ID.get(q) ?? POR_ID.get(q.replace(/\s+/g, "_"));
  if (porId) return porId;
  return (
    DIRECTORIO.find(
      (c) => normalizar(c.nombre) === q || c.alias.some((a) => normalizar(a) === q)
    ) ??
    DIRECTORIO.find((c) => c.alias.some((a) => q.includes(normalizar(a)) && normalizar(a).length > 3)) ??
    null
  );
}

function normalizar(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

/** Lista compacta para el prompt: id → nombre (alias). */
export function resumenDirectorioParaPrompt(): string {
  return DIRECTORIO.map((c) => `- ${c.id}: ${c.nombre} (${c.alias.slice(0, 4).join(", ")})`).join("\n");
}
