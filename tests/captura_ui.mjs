// Captura la UI (home, cargando y resultado) en formato celular para revisión visual.
import { chromium } from "playwright";
const URL = process.argv[2] || "http://localhost:3000";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await p.goto(URL, { waitUntil: "networkidle" });
await p.waitForTimeout(700);
await p.screenshot({ path: "tests/ui_home.png", fullPage: true });

await p.click("text=Soy de PAMI");
await p.click("text=Analizar mensaje");
await p.waitForTimeout(900);
await p.screenshot({ path: "tests/ui_cargando.png", fullPage: true });

await p.waitForSelector("text=Alto riesgo de estafa", { timeout: 120000 });
await p.waitForTimeout(800);
await p.screenshot({ path: "tests/ui_resultado.png", fullPage: true });

await p.click("text=Por qué lo detectamos");
await p.waitForTimeout(500);
await p.screenshot({ path: "tests/ui_resultado_abierto.png", fullPage: true });
await b.close();
console.log("ok");
