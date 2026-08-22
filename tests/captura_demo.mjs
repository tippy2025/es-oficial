import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
const BASE = path.dirname(fileURLToPath(import.meta.url));
const URL_APP = (process.argv[2] || "https://es-oficial.vercel.app") + "/demo";
const browser = await chromium.launch();
for (const [nombre, vp] of [["escritorio", { width: 1280, height: 900 }], ["celular", { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 2, locale: "es-AR" });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  await page.goto(URL_APP, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(BASE, `demo_${nombre}.png`), fullPage: true });
  const listo = await page.evaluate(() => {
    const v = document.querySelector("video");
    return v ? { duracion: v.duration, ancho: v.videoWidth, listo: v.readyState } : null;
  });
  console.log(nombre, JSON.stringify(listo), errs.length ? "ERRORES: " + errs.join(" | ") : "");
  await page.close();
}
await browser.close();
