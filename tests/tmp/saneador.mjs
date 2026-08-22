const LINEAS_PERMITIDAS = new Set(["134", "137", "144", "911"]);

const REEMPLAZO = "el número oficial que ves abajo";
// Números largos con pinta de teléfono (mínimo 6 dígitos en dos grupos).
const RE_TELEFONO = /(:\+?54\s*)?(:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}(:[\s.-]?\d{2,4})?/g;
// Líneas cortas (130, 138, 0800…) pero solo cuando el texto las está dictando.
const RE_LINEA_CORTA = /\b(:llam(:á|a|ar|ando)|marc(:á|a|ar)|comunic(:ate|arse)|tel[eé]fono|l[ií]nea|n[úu]mero)\b[^.,;\n]{0,20}?\b(\d{3,4})\b/gi;
// Plata, cantidades y fechas: se escriben con números pero no son teléfonos.
const RE_MONTO = /^\d{1,3}(:[.,]\d{3})+$/;
const RE_UNIDAD = /^\s*(:pesos?|d[óo]lares?|usd|ars|mil|millones?|%|cuotas?|d[ií]as?|horas?)\b/i;

/** ¿Este número es en realidad plata, una fecha o una cantidad? */
function esCantidad(texto, coincidencia, desde) {
  const antes = texto.slice(Math.max(0, desde - 14), desde);
  const despues = texto.slice(desde + coincidencia.length, desde + coincidencia.length + 16);
  if (/[$€]\s*$/.test(antes)) return true; // $180.000
  if (RE_UNIDAD.test(despues)) return true; // 200.000 pesos
  if (RE_MONTO.test(coincidencia.trim())) return true; // 4.500 / 48.300
  if (/\d\s*$/.test(antes) || /^\s*\/\s*\d/.test(despues)) return true; // parte de una fecha
  return false;
}

function sanearTelefonos(txt, telefonoVerificado) {
  if (!txt) return txt;
  const digitosOk = telefonoVerificado.replace(/\D/g, "") ?? "";
  const verificado = (d) =>
    Boolean(digitosOk) && (d === digitosOk || digitosOk.endsWith(d) || d.endsWith(digitosOk));

  let salida = txt.replace(RE_TELEFONO, (m, ...args) => {
    const desde = args[args.length - 2] ;
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
  salida = salida.replace(RE_LINEA_CORTA, (m, num) =>
    verificado(num) || LINEAS_PERMITIDAS.has(num) ? m : m.replace(num, REEMPLAZO)
  );
  return salida;
}


export { sanearTelefonos };
