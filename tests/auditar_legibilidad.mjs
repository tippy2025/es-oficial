// Mide legibilidad pensando en una persona mayor: tamaño de letra real y
// contraste de cada texto contra el fondo que efectivamente tiene detrás.
// Referencia: WCAG AA pide 4.5:1 para texto normal y 3:1 para texto grande
// (>=24px, o >=19px en negrita). Acá subimos la vara: 16px mínimo y 7:1 (AAA)
// para todo lo que sea texto de lectura.
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = path.dirname(fileURLToPath(import.meta.url));
const URL_APP = process.env.APP_URL || "http://localhost:3000";
const MSG =
  "Hola! Le escribimos de PAMI. Para no perder su cobertura de medicamentos gratis necesitamos validar su identidad hoy mismo. Envíenos foto de su DNI y el código de 6 dígitos que le llega por SMS. Es urgente, el sistema cierra a las 18hs.";

const MIN_PX = 16;
const MIN_CONTRASTE = 7;

const auditoria = `() => {
  const aRgb = (c) => {
    const m = c.match(/[\\d.]+/g);
    if (!m) return null;
    return { r: +m[0], g: +m[1], b: +m[2], a: m[3] === undefined ? 1 : +m[3] };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const mezclar = (frente, fondo) => ({
    r: frente.r * frente.a + fondo.r * (1 - frente.a),
    g: frente.g * frente.a + fondo.g * (1 - frente.a),
    b: frente.b * frente.a + fondo.b * (1 - frente.a),
    a: 1,
  });
  // El fondo real: el primer ancestro con color de fondo opaco.
  const fondoDe = (el) => {
    let n = el, acumulado = null;
    while (n && n !== document.documentElement) {
      const c = aRgb(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) {
        acumulado = acumulado ? mezclar(acumulado, c) : c;
        if (c.a === 1) return acumulado;
      }
      n = n.parentElement;
    }
    return acumulado || { r: 255, g: 255, b: 255, a: 1 };
  };
  const contraste = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };

  const problemas = [];
  const vistos = new Set();
  for (const el of document.querySelectorAll("body *")) {
    // solo elementos que pintan texto propio
    const propio = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!propio) continue;
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden" || +s.opacity === 0) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;

    const texto = el.textContent.trim().replace(/\\s+/g, " ").slice(0, 40);
    if (!texto || vistos.has(texto)) continue;
    vistos.add(texto);

    const px = parseFloat(s.fontSize);
    const peso = parseInt(s.fontWeight, 10) || 400;
    const frente = aRgb(s.color);
    const fondo = fondoDe(el);
    const ratio = contraste(mezclar(frente, fondo), fondo);

    if (px < ${MIN_PX}) problemas.push(\`CHICA \${px}px (peso \${peso}) · «\${texto}»\`);
    if (ratio < ${MIN_CONTRASTE}) problemas.push(\`CONTRASTE \${ratio.toFixed(1)}:1 (\${px}px) · «\${texto}»\`);
  }

  // Los placeholders se miden aparte: no son nodos de texto
  for (const el of document.querySelectorAll("input[placeholder], textarea[placeholder]")) {
    const s = getComputedStyle(el);
    const px = parseFloat(s.fontSize);
    const fondo = fondoDe(el);
    // el color del placeholder no sale de getComputedStyle: lo pedimos aparte
    const sonda = document.createElement("span");
    sonda.style.cssText = getComputedStyle(el).cssText;
    problemas.push(\`(placeholder «\${el.placeholder.slice(0, 30)}» \${px}px — revisar a ojo)\`);
    sonda.remove();
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

async function revisar(nombre) {
  const problemas = await page.evaluate(`(${auditoria})()`);
  console.log(`\n== ${nombre} ==`);
  console.log(problemas.length ? problemas.map((p) => "  · " + p).join("\n") : "  todo legible");
}

await page.goto(URL_APP, { waitUntil: "networkidle" });
await revisar("inicio");

await page.fill("#mensaje", MSG);
await page.click("text=Analizar mensaje");
await page.waitForSelector("text=Alto riesgo de estafa", { timeout: 120000 });
await page.waitForTimeout(500);
for (const s of await page.$$("details summary")) await s.click();
await page.waitForTimeout(300);
await revisar("resultado");

await browser.close();
