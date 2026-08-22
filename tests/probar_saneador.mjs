// Verifica el saneador de teléfonos contra el módulo real: tiene que tapar
// números inventados sin romper montos de plata, fechas ni cantidades.
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const BASE = path.dirname(fileURLToPath(import.meta.url));
const { sanearTelefonos } = await import(
  pathToFileURL(path.join(BASE, "..", "lib", "sanear.ts")).href
);

const TAPADO = "el número oficial que ves abajo";
const casos = [
  // [texto, teléfono verificado del organismo, qué esperamos]
  ["Pide una transferencia de 200.000 pesos", "138", "intacto"],
  ["Te piden $180.000 al alias", "138", "intacto"],
  ["Abonar el costo de envío de $4.500", null, "intacto"],
  ["Un reintegro de 48.300 por el bono de agosto", null, "intacto"],
  ["Refinanciá en 24 cuotas sin interés", null, "intacto"],
  ["El turno es el 21/08 a las 10:30 hs", null, "intacto"],
  ["La alerta de ANSES es de 2026", null, "intacto"],
  ["Pide 1.500.000 de golpe", null, "intacto"],
  ["Llamá al 0800-222-4636 para verificar", null, "tapado"],
  ["Comunicate al 11 4567 8900", null, "tapado"],
  ["Escribile al +54 9 11 2345 6789", null, "tapado"],
  ["Llamá al 130 para consultar", "138", "tapado"],
  ["Llamá al 138 que figura en tu carnet", "138", "intacto"],
  ["Marcá el 130 de la otra línea", "138", "tapado"],
  ["El número es 0810 555 6733", null, "tapado"],
  ["Llamá al número oficial que ves abajo", "138", "intacto"],
  ["Denunciá en la línea 134", null, "intacto"],
  ["Marcá el 137 si es violencia familiar", null, "intacto"],
  ["El PAMI atiende al 138", "138", "intacto"],
];

let fallos = 0;
for (const [texto, tel, esperado] of casos) {
  const salida = sanearTelefonos(texto, tel);
  const tapado = salida.includes(TAPADO);
  const ok = esperado === "tapado" ? tapado : !tapado;
  if (!ok) fallos++;
  console.log(`${ok ? "✅" : "❌"} ${esperado.padEnd(7)} │ ${salida}`);
}
console.log(`\n${casos.length - fallos}/${casos.length} correctos`);
process.exit(fallos ? 1 : 0);
