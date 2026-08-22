/**
 * Red de seguridad: el modelo no debe dictar números de teléfono en el texto libre.
 * Un número inventado (ej. decir 130 —que es ANSES— cuando PAMI es 138) manda al
 * usuario al lugar equivocado. Sacamos cualquier número que no esté verificado,
 * pero sin romper los montos de plata, las fechas ni las cantidades, que también
 * se escriben con números y sí tienen que quedar en el texto.
 */

// Solo líneas generales de emergencia/denuncia (no las de un organismo puntual:
// justamente confundir 130 de ANSES con 138 de PAMI es el error que queremos evitar).
const LINEAS_PERMITIDAS = new Set(["134", "137", "144", "911"]);

export const REEMPLAZO = "el número oficial que ves abajo";

// Números largos con pinta de teléfono (mínimo 6 dígitos en dos grupos).
const RE_TELEFONO = /(?:\+?54\s*)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}(?:[\s.-]?\d{2,4})?/g;
// Líneas cortas (130, 138…) pero solo cuando el texto las está dictando.
const RE_LINEA_CORTA =
  /\b(?:llam|marc|comunic|tel[eé]fono|l[ií]nea|n[úu]mero)\w*(?:á|a)?[^.,;\n]{0,20}?\b(\d{3,4})\b/gi;
// Plata y cantidades: en Argentina se escriben 4.500, 48.300, 1.500.000.
const RE_MONTO = /^\d{1,3}(?:[.,]\d{3})+$/;
const RE_UNIDAD =
  /^\s*(?:pesos?|d[óo]lares?|usd|ars|mil|millones?|%|cuotas?|d[ií]as?|horas?)\b/i;

/** ¿Este número es en realidad plata, una fecha o una cantidad? */
function esCantidad(texto: string, coincidencia: string, desde: number): boolean {
  const antes = texto.slice(Math.max(0, desde - 14), desde);
  const despues = texto.slice(desde + coincidencia.length, desde + coincidencia.length + 16);
  if (/[$€]\s*$/.test(antes)) return true; // $180.000
  if (RE_UNIDAD.test(despues)) return true; // 200.000 pesos
  if (RE_MONTO.test(coincidencia.trim())) return true; // 4.500 · 1.500.000
  if (/\d\s*[/-]\s*$/.test(antes) || /^\s*[/-]\s*\d/.test(despues)) return true; // fecha
  return false;
}

export function sanearTelefonos(txt: string, telefonoVerificado?: string | null): string {
  if (!txt) return txt;
  const digitosOk = telefonoVerificado?.replace(/\D/g, "") ?? "";
  const verificado = (d: string) =>
    Boolean(digitosOk) && (d === digitosOk || digitosOk.endsWith(d) || d.endsWith(digitosOk));

  let salida = txt.replace(RE_TELEFONO, (m, ...args) => {
    const desde = args[args.length - 2] as number;
    const d = m.replace(/\D/g, "");
    if (d.length < 6) return m;
    if (verificado(d)) return m;
    if (LINEAS_PERMITIDAS.has(d)) return m;
    if (/^\d{4}$/.test(d) && Number(d) >= 1900 && Number(d) <= 2100) return m; // un año
    if (esCantidad(txt, m, desde)) return m;
    return REEMPLAZO;
  });

  // Segunda pasada: "llamá al 138" no lo agarra la regex larga, y es justo el
  // caso que más daño hace (mandar al usuario a la línea de otro organismo).
  salida = salida.replace(RE_LINEA_CORTA, (m, num: string) =>
    verificado(num) || LINEAS_PERMITIDAS.has(num) ? m : m.replace(num, REEMPLAZO)
  );
  return salida;
}
