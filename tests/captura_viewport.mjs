// Capturas de pantalla tal como se ven en el celular (viewport, no página completa).
import { chromium } from "playwright";
const URL = process.argv[2] || "http://localhost:3000";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await p.goto(URL, { waitUntil: "networkidle" });
await p.waitForTimeout(700);
await p.screenshot({ path: "tests/vp_home.png" });

await p.click("text=Soy de PAMI");
await p.click("text=Analizar mensaje");
await p.waitForSelector("text=Alto riesgo de estafa", { timeout: 120000 });
await p.waitForTimeout(900);
await p.screenshot({ path: "tests/vp_resultado.png" });

await p.evaluate(() => window.scrollBy(0, 520));
await p.waitForTimeout(400);
await p.screenshot({ path: "tests/vp_resultado2.png" });
await b.close();
console.log("ok");
