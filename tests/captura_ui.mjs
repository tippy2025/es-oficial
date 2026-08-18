// Captura la UI (home y resultado) en formato celular para revisión visual.
import { chromium } from "playwright";
const URL = process.argv[2] || "http://localhost:3000";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await p.goto(URL, { waitUntil: "networkidle" });
await p.screenshot({ path: "tests/ui_home.png", fullPage: true });
await p.click("text=Soy de PAMI");
await p.click("text=Analizar mensaje");
await p.waitForSelector("text=Señales detectadas", { timeout: 60000 });
await p.waitForTimeout(500);
await p.screenshot({ path: "tests/ui_resultado.png", fullPage: true });
await b.close();
console.log("ok");
