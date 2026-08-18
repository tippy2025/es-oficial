// Graba las escenas del video con Playwright (video real de la app en uso, vertical 1080x1920).
// Cada escena se graba en un contexto aparte para tener un archivo por escena.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = path.dirname(fileURLToPath(import.meta.url));
const URL = process.env.APP_URL || "https://es-oficial.vercel.app";
const OUT = path.join(BASE, "escenas");
fs.mkdirSync(OUT, { recursive: true });
const tiempos = JSON.parse(fs.readFileSync(path.join(BASE, "guion_tiempos.json"), "utf-8"));
const dur = (id) => tiempos.find((e) => e.id === id).duracion;

const MSG_PAMI =
  "Hola! Le escribimos de PAMI. Para no perder su cobertura de medicamentos gratis necesitamos validar su identidad hoy mismo. Envíenos foto de su DNI y el código de 6 dígitos que le llega por SMS. Es urgente, el sistema cierra a las 18hs.";
const MSG_TURNO =
  "Hospital Italiano: le recordamos su turno con Clínica Médica el jueves 21/08 a las 10:30 hs, sede central, piso 3. Si no puede asistir, cancele desde el Portal de Salud o la app.";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function tipearLento(page, sel, texto, msPorChar = 12) {
  await page.click(sel);
  await page.fill(sel, "");
  for (const ch of texto) {
    await page.type(sel, ch, { delay: 0 });
    if (msPorChar) await sleep(msPorChar);
  }
}

async function scrollSuave(page, y, pasos = 30) {
  const actual = await page.evaluate(() => window.scrollY);
  for (let i = 1; i <= pasos; i++) {
    await page.evaluate((v) => window.scrollTo(0, v), actual + ((y - actual) * i) / pasos);
    await sleep(25);
  }
}

async function grabar(id, fn) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 540, height: 960 },
    deviceScaleFactor: 2,
    recordVideo: { dir: OUT, size: { width: 1080, height: 1920 } },
    locale: "es-AR",
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await fn(page);
  const video = page.video();
  await ctx.close();
  await browser.close();
  const p = await video.path();
  const dest = path.join(OUT, `${id}.webm`);
  fs.renameSync(p, dest);
  console.log("OK", id);
}

// Escena 3: pegar mensaje y analizar (la carga se ve en vivo)
await grabar("03_solucion", async (page) => {
  await page.goto(URL, { waitUntil: "networkidle" });
  await sleep(1200);
  await tipearLento(page, "textarea", MSG_PAMI, 8);
  await sleep(700);
  await page.click("text=Analizar mensaje");
  await page.waitForSelector("text=Señales detectadas", { timeout: 60000 });
  await sleep(600);
});

// Escena 4+5: resultado rojo, recorrer señales, qué hacer y canal oficial
await grabar("04_05_resultado_canal", async (page) => {
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.fill("textarea", MSG_PAMI);
  await page.click("text=Analizar mensaje");
  await page.waitForSelector("text=Señales detectadas", { timeout: 60000 });
  await sleep(1000);
  const s1 = await page.locator("text=Señales detectadas").boundingBox();
  await scrollSuave(page, Math.max(0, (await page.evaluate(() => window.scrollY)) + s1.y - 140));
  await sleep(4000);
  const s2 = await page.locator("text=Qué hacer ahora").boundingBox();
  await scrollSuave(page, (await page.evaluate(() => window.scrollY)) + s2.y - 140);
  await sleep(4500);
  const s3 = await page.locator("text=Canal oficial verificado").boundingBox();
  await scrollSuave(page, (await page.evaluate(() => window.scrollY)) + s3.y - 200);
  await sleep(dur("05_canal") * 1000 - 1500);
});

// Escena 6: turno legítimo → verde
await grabar("06_verde", async (page) => {
  await page.goto(URL, { waitUntil: "networkidle" });
  await sleep(500);
  await tipearLento(page, "textarea", MSG_TURNO, 6);
  await sleep(500);
  await page.click("text=Analizar mensaje");
  await page.waitForSelector("text=Sin señales típicas", { timeout: 60000 });
  await sleep(1000);
  const s = await page.locator("text=Sin señales típicas").boundingBox();
  await scrollSuave(page, (await page.evaluate(() => window.scrollY)) + s.y - 120);
  await sleep(dur("06_verde") * 1000 - 5000);
});

// Escena 7: botón compartir con mamá (el share desde WhatsApp se ilustra con placa)
await grabar("07_compartir", async (page) => {
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.fill("textarea", MSG_PAMI);
  await page.click("text=Analizar mensaje");
  await page.waitForSelector("text=Copiar para compartir", { timeout: 60000 });
  await sleep(500);
  const s = await page.locator("text=Copiar para compartir").boundingBox();
  await scrollSuave(page, (await page.evaluate(() => window.scrollY)) + s.y - 500);
  await sleep(2500);
  await page.click("text=Copiar para compartir");
  await sleep(4000);
});

console.log("LISTO");
