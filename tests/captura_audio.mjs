// Captura el flujo de audio: subir nota de voz -> resultado con transcripción.
import { chromium } from "playwright";
const URL = process.argv[2] || "https://es-oficial.vercel.app";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await p.goto(URL, { waitUntil: "networkidle" });
await p.waitForTimeout(500);

await p.setInputFiles('input[accept="audio/*"]', "kit-prueba/audio_estafa_hijo.mp3");
await p.waitForTimeout(600);
await p.screenshot({ path: "tests/ui_audio_cargado.png", fullPage: true });

await p.click("text=Analizar mensaje");
await p.waitForSelector("text=Esto es lo que dice el audio", { timeout: 120000 });
await p.waitForTimeout(800);
await p.screenshot({ path: "tests/ui_audio_resultado.png", fullPage: true });
await b.close();
console.log("ok");
