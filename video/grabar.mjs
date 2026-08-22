// Graba las escenas del video con Playwright (la app real en uso, vertical 1080x1920).
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(BASE, "..");
const URL = process.env.APP_URL || "https://es-oficial.vercel.app";
const OUT = path.join(BASE, "escenas");
fs.mkdirSync(OUT, { recursive: true });
const tiempos = JSON.parse(fs.readFileSync(path.join(BASE, "guion_tiempos.json"), "utf-8"));
const dur = (id) => tiempos.find((e) => e.id === id)?.duracion ?? 8;

const MSG_PAMI =
  "Hola! Le escribimos de PAMI. Para no perder su cobertura de medicamentos gratis necesitamos validar su identidad hoy mismo. Envíenos foto de su DNI y el código de 6 dígitos que le llega por SMS. Es urgente, el sistema cierra a las 18hs.";
const MSG_TURNO =
  "Hospital Italiano: le recordamos su turno con Clínica Médica el jueves 21/08 a las 10:30 hs, sede central, piso 3. Si no puede asistir, cancele desde el Portal de Salud o la app.";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function tipearLento(page, texto, msPorChar = 10) {
  await page.click("#mensaje");
  await page.fill("#mensaje", "");
  for (const ch of texto) {
    await page.type("#mensaje", ch, { delay: 0 });
    if (msPorChar) await sleep(msPorChar);
  }
}

async function scrollA(page, selector, offset = 150, pasos = 26) {
  const y = await page.evaluate(
    ([sel, off]) => {
      const el = document.evaluate(
        `//*[contains(text(), ${JSON.stringify(sel)})]`,
        document,
        null,
        9,
        null
      ).singleNodeValue;
      if (!el) return window.scrollY;
      return window.scrollY + el.getBoundingClientRect().top - off;
    },
    [selector, offset]
  );
  const actual = await page.evaluate(() => window.scrollY);
  for (let i = 1; i <= pasos; i++) {
    await page.evaluate((v) => window.scrollTo(0, v), actual + ((y - actual) * i) / pasos);
    await sleep(26);
  }
}

/**
 * Graba una escena. `marcar` deja constancia del tramo muerto (la espera del
 * análisis): el montaje lo corta, si no la escena se va en pantalla de carga y
 * el resultado nunca llega a verse.
 */
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
  const t0 = Date.now();
  const marcas = {};
  const marcar = (nombre) => (marcas[nombre] = (Date.now() - t0) / 1000);
  await fn(page, marcar);
  const video = page.video();
  await ctx.close();
  await browser.close();
  fs.renameSync(await video.path(), path.join(OUT, `${id}.webm`));

  const cortes = path.join(OUT, `${id}.json`);
  if (marcas.esperaDesde != null && marcas.esperaHasta - marcas.esperaDesde > 2.5) {
    // Dejamos 1,2 s de pantalla de carga (se entiende que está trabajando) y
    // recortamos el resto de la espera.
    fs.writeFileSync(
      cortes,
      JSON.stringify({ saltar: [marcas.esperaDesde + 1.2, marcas.esperaHasta - 0.3] })
    );
    console.log(`OK ${id} (recorto ${(marcas.esperaHasta - marcas.esperaDesde - 1.5).toFixed(1)}s de espera)`);
    return;
  }
  if (fs.existsSync(cortes)) fs.unlinkSync(cortes);
  console.log("OK", id);
}

// 03 — se pega el mensaje y se analiza
await grabar("03_solucion", async (page, marcar) => {
  await page.goto(URL, { waitUntil: "networkidle" });
  await sleep(1000);
  await tipearLento(page, MSG_PAMI, 7);
  await sleep(600);
  await page.click("text=Analizar mensaje");
  marcar("esperaDesde");
  await page.waitForSelector("text=Alto riesgo de estafa", { timeout: 90000 });
  marcar("esperaHasta");
  await sleep(500);
});

// 04 + 05 — resultado rojo, qué hacer, canal oficial
await grabar("04_05_resultado_canal", async (page, marcar) => {
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.fill("#mensaje", MSG_PAMI);
  await page.click("text=Analizar mensaje");
  marcar("esperaDesde");
  await page.waitForSelector("text=Alto riesgo de estafa", { timeout: 90000 });
  marcar("esperaHasta");
  await sleep(1200);
  await scrollA(page, "Qué hacer ahora", 140);
  await sleep(dur("04_resultado") * 1000 - 2500);
  await scrollA(page, "Canal oficial verificado", 150);
  await sleep(dur("05_canal") * 1000 - 1200);
});

// 06 — nota de voz
await grabar("06_audio", async (page, marcar) => {
  await page.goto(URL, { waitUntil: "networkidle" });
  await sleep(700);
  await page.setInputFiles('input[accept="audio/*"]', path.join(RAIZ, "kit-prueba", "audio_estafa_hijo.mp3"));
  await sleep(1500);
  await page.click("text=Analizar mensaje");
  marcar("esperaDesde");
  await page.waitForSelector("text=Esto dice el audio", { timeout: 120000 });
  marcar("esperaHasta");
  await sleep(1200);
  await scrollA(page, "Esto dice el audio", 130);
  await sleep(dur("06_audio") * 1000 - 6000);
});

// 07 — mensaje legítimo
await grabar("07_verde", async (page, marcar) => {
  await page.goto(URL, { waitUntil: "networkidle" });
  await sleep(500);
  await tipearLento(page, MSG_TURNO, 6);
  await sleep(400);
  await page.click("text=Analizar mensaje");
  marcar("esperaDesde");
  await page.waitForSelector("text=Sin señales típicas", { timeout: 90000 });
  marcar("esperaHasta");
  await sleep(dur("07_verde") * 1000 - 3000);
});

console.log("LISTO");
