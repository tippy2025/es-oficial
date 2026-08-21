// Corre todos los casos de tests/casos.json contra la API y reporta aciertos.
// Uso: node tests/correr_casos.mjs [URL_BASE]   (default: https://es-oficial.vercel.app)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = path.dirname(fileURLToPath(import.meta.url));
const URL = (process.argv[2] || "https://es-oficial.vercel.app").replace(/\/$/, "");
const casos = JSON.parse(fs.readFileSync(path.join(BASE, "casos.json"), "utf-8"));
const CONCURRENCIA = 3;
const REINTENTOS = 2; // los 500 esporádicos de la API no son fallos de clasificación

// tolerancia: para "ambiguo" aceptamos amarillo o rojo; para estafa aceptamos rojo (amarillo cuenta como acierto parcial)
function evaluar(esperado, obtenido, categoria) {
  if (esperado === obtenido) return "ok";
  if (categoria === "ambiguo" && (obtenido === "amarillo" || obtenido === "rojo")) return "ok";
  if (categoria === "estafa" && obtenido === "amarillo") return "parcial";
  if (categoria === "legitimo" && obtenido === "amarillo") return "parcial";
  return "fallo";
}

async function analizar(texto) {
  let ultimo;
  for (let i = 0; i <= REINTENTOS; i++) {
    try {
      const r = await fetch(`${URL}/api/analizar`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ texto }),
      });
      if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 120)}`);
      return await r.json();
    } catch (e) {
      ultimo = e;
      await new Promise((res) => setTimeout(res, 1200 * (i + 1)));
    }
  }
  throw ultimo;
}

const resultados = [];
let i = 0;
async function worker() {
  while (i < casos.length) {
    const c = casos[i++];
    const t0 = Date.now();
    try {
      const v = await analizar(c.texto);
      const res = evaluar(c.esperado, v.nivel, c.categoria);
      resultados.push({ ...c, obtenido: v.nivel, titulo: v.titulo, canal: v.canalOficial?.nombre ?? null, res, ms: Date.now() - t0 });
      const icon = res === "ok" ? "✅" : res === "parcial" ? "🟨" : "❌";
      console.log(`${icon} ${c.id} [${c.categoria}/${c.tipo}] esperado=${c.esperado} obtenido=${v.nivel} (${Date.now() - t0}ms)`);
    } catch (e) {
      resultados.push({ ...c, obtenido: "ERROR", res: "error", error: String(e), ms: Date.now() - t0 });
      console.log(`💥 ${c.id} ERROR ${e}`);
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCIA }, worker));

const por = (f) => resultados.filter(f).length;
const total = resultados.length;
const ok = por((r) => r.res === "ok");
const parcial = por((r) => r.res === "parcial");
const fallo = por((r) => r.res === "fallo");
const errores = por((r) => r.res === "error");
const cat = (c) => {
  const rs = resultados.filter((r) => r.categoria === c);
  return `${c}: ${rs.filter((r) => r.res === "ok").length}/${rs.length} ok, ${rs.filter((r) => r.res === "parcial").length} parcial, ${rs.filter((r) => r.res === "fallo").length} fallo`;
};
const msProm = Math.round(resultados.reduce((a, r) => a + r.ms, 0) / total);

const resumen = [
  `TOTAL: ${total} casos — ✅ ${ok} ok (${Math.round((ok / total) * 100)}%), 🟨 ${parcial} parcial, ❌ ${fallo} fallo, 💥 ${errores} error`,
  cat("estafa"),
  cat("legitimo"),
  cat("ambiguo"),
  `latencia promedio: ${msProm} ms`,
  "",
  "FALLOS:",
  ...resultados.filter((r) => r.res === "fallo" || r.res === "error").map((r) => `- ${r.id} [${r.tipo}] esperado=${r.esperado} obtenido=${r.obtenido} :: ${r.texto.slice(0, 110)}…`),
  "",
  "PARCIALES:",
  ...resultados.filter((r) => r.res === "parcial").map((r) => `- ${r.id} [${r.tipo}] esperado=${r.esperado} obtenido=${r.obtenido} :: ${r.texto.slice(0, 110)}…`),
];
console.log("\n" + resumen.join("\n"));
fs.writeFileSync(path.join(BASE, "resultados.json"), JSON.stringify(resultados, null, 2));
fs.writeFileSync(path.join(BASE, "RESUMEN.md"), `# Resultados del test\n\n${resumen.join("\n")}\n`);
