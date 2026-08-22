// Simula lo que hace el sistema operativo cuando elegís "¿Es Oficial?" en el
// menú Compartir con una nota de voz: POST multipart a /compartir y navegación.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = path.dirname(fileURLToPath(import.meta.url));
const URL_APP = process.env.APP_URL || "http://localhost:3000";
const audio = fs.readFileSync(path.join(BASE, "..", "kit-prueba", "audio_estafa_hijo.mp3"));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: "es-AR" });
page.on("console", (m) => m.type() === "error" && console.log("CONSOLA:", m.text()));

await page.goto(URL_APP, { waitUntil: "networkidle" });
await page.evaluate(
  async ([b64, destino]) => {
    const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const file = new File([bin], "PTT-20260821-WA0007.opus", { type: "audio/ogg" });
    const dt = new DataTransfer();
    dt.items.add(file);
    const form = document.createElement("form");
    form.method = "POST";
    form.action = destino;
    form.enctype = "multipart/form-data";
    const input = document.createElement("input");
    input.type = "file";
    input.name = "grabacion";
    input.files = dt.files;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  },
  [audio.toString("base64"), `${URL_APP}/compartir`]
);

await page.waitForSelector("text=Esto dice el audio", { timeout: 120000 });
const titulo = await page.textContent("h2");
const transcripcion = await page.textContent("text=/^“.*”$/");
console.log("VEREDICTO:", titulo?.trim());
console.log("TRANSCRIPCIÓN:", transcripcion?.trim().slice(0, 160));
await page.screenshot({ path: path.join(BASE, "vp_compartir_audio.png") });
await browser.close();
