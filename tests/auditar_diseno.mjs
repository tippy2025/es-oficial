// Audita el diseño en pantalla de celular: busca solapamientos reales entre
// bloques, márgenes izquierdos que no coinciden, texto que se desborda y
// objetivos táctiles chicos. Saca capturas de cada estado.
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = path.dirname(fileURLToPath(import.meta.url));
const URL_APP = process.env.APP_URL || "http://localhost:3000";
const MSG =
  "Hola! Le escribimos de PAMI. Para no perder su cobertura de medicamentos gratis necesitamos validar su identidad hoy mismo. Envíenos foto de su DNI y el código de 6 dígitos que le llega por SMS. Es urgente, el sistema cierra a las 18hs.";

const auditoria = `() => {
  const problemas = [];
  const visible = (e) => {
    const s = getComputedStyle(e);
    const r = e.getBoundingClientRect();
    return s.display !== "none" && s.visibility !== "hidden" && s.opacity !== "0" && r.width > 0 && r.height > 0;
  };

  // 1) Solapamiento entre hermanos en flujo normal (no cuenta lo que es fijo/absoluto a propósito)
  const contenedores = [document.querySelector("main"), ...document.querySelectorAll("main > div, main > div > *")];
  const vistos = new Set();
  for (const cont of contenedores) {
    if (!cont || vistos.has(cont)) continue;
    vistos.add(cont);
    const hijos = [...cont.children].filter((e) => {
      const s = getComputedStyle(e);
      return visible(e) && s.position !== "absolute" && s.position !== "fixed";
    });
    for (let i = 0; i < hijos.length - 1; i++) {
      const a = hijos[i].getBoundingClientRect();
      const b = hijos[i + 1].getBoundingClientRect();
      const solape = a.bottom - b.top;
      if (solape > 1) {
        problemas.push("SOLAPE " + solape.toFixed(1) + "px: <" + hijos[i].tagName.toLowerCase() +
          " class='" + String(hijos[i].className).slice(0, 45) + "'> pisa al siguiente");
      }
    }
  }

  // 2) Elementos fijos que tapan contenido
  for (const e of document.querySelectorAll("body *")) {
    if (!visible(e)) continue;
    if (getComputedStyle(e).position === "fixed" && e.getBoundingClientRect().height > 20) {
      problemas.push("FIJO: <" + e.tagName.toLowerCase() + " class='" + String(e.className).slice(0, 45) + "'> puede tapar contenido");
    }
  }

  // 3) Márgenes izquierdos de los bloques de contenido
  const cont = document.querySelector("main > div:last-of-type") || document.querySelector("main > div");
  const izq = new Map();
  for (const e of cont ? cont.children : []) {
    if (!visible(e)) continue;
    const l = Math.round(e.getBoundingClientRect().left);
    izq.set(l, (izq.get(l) || 0) + 1);
  }
  if (izq.size > 1) problemas.push("MÁRGENES distintos en la columna: " + [...izq.keys()].sort((a,b)=>a-b).join(", ") + "px");

  // 4) Desborde horizontal
  if (document.documentElement.scrollWidth > window.innerWidth + 1) {
    problemas.push("DESBORDE horizontal: " + document.documentElement.scrollWidth + " > " + window.innerWidth);
  }

  // 5) Objetivos táctiles chicos (mínimo recomendado 44px)
  for (const e of document.querySelectorAll("button, a, summary")) {
    if (!visible(e)) continue;
    const r = e.getBoundingClientRect();
    if (r.height < 40) problemas.push("TÁCTIL chico (" + r.height.toFixed(0) + "px): «" + e.textContent.trim().slice(0, 32) + "»");
  }

  // 6) Texto que se sale de su caja
  for (const e of document.querySelectorAll("h1, h2, h3, p, span, li, button")) {
    if (!visible(e) || e.children.length) continue;
    if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow === "visible") {
      problemas.push("TEXTO desbordado: «" + e.textContent.trim().slice(0, 32) + "»");
    }
  }
  return problemas;
}`;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: "es-AR",
});
const page = await ctx.newPage();
const errores = [];
page.on("pageerror", (e) => errores.push(String(e)));
page.on("console", (m) => m.type() === "error" && errores.push(m.text()));

async function revisar(nombre) {
  const problemas = await page.evaluate(`(${auditoria})()`);
  await page.screenshot({ path: path.join(BASE, `dis_${nombre}.png`), fullPage: true });
  console.log(`\n== ${nombre} ==`);
  console.log(problemas.length ? problemas.map((p) => "  · " + p).join("\n") : "  sin problemas");
}

await page.goto(URL_APP, { waitUntil: "networkidle" });
await revisar("inicio");

await page.fill("#mensaje", MSG);
await page.waitForTimeout(200);
await revisar("con_texto");

await page.click("text=Analizar mensaje");
await page.waitForSelector("text=Alto riesgo de estafa", { timeout: 120000 });
await page.waitForTimeout(600);
await revisar("resultado");

// abrir los plegables, que es donde más fácil se rompe el layout
for (const s of await page.$$("details summary")) await s.click();
await page.waitForTimeout(300);
await revisar("resultado_abierto");

if (errores.length) console.log("\nERRORES DE CONSOLA:\n" + errores.map((e) => "  · " + e).join("\n"));
await browser.close();
