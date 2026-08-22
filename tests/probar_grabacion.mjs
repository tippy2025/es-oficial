// Prueba la grabación de verdad: le mete audio real al micrófono del navegador
// (micrófono falso de Chromium alimentado con un WAV) y verifica que el medidor
// se mueva, que la grabación se transcriba, y que el silencio se detecte.
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = path.dirname(fileURLToPath(import.meta.url));
const URL_APP = process.env.APP_URL || "http://localhost:3000";
const FF = path.join(process.env.LOCALAPPDATA, "ffmpeg", "bin", "ffmpeg.exe");
const TMP = path.join(BASE, "tmp");
fs.mkdirSync(TMP, { recursive: true });

const conVoz = path.join(TMP, "mic_voz.wav");
const enSilencio = path.join(TMP, "mic_silencio.wav");
if (!fs.existsSync(conVoz)) {
  execFileSync(FF, ["-y", "-loglevel", "error", "-i", path.join(BASE, "..", "kit-prueba", "audio_estafa_hijo.mp3"),
    "-ar", "48000", "-ac", "1", conVoz]);
}
if (!fs.existsSync(enSilencio)) {
  execFileSync(FF, ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", "6", enSilencio]);
}

async function correr(nombre, wav, segundos, esperar) {
  const browser = await chromium.launch({
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      `--use-file-for-fake-audio-capture=${wav}%noloop`,
      "--autoplay-policy=no-user-gesture-required",
    ],
  });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: "es-AR",
    permissions: ["microphone"],
  });
  const page = await ctx.newPage();
  await page.goto(URL_APP, { waitUntil: "networkidle" });

  await page.click("text=Grabar");
  await page.waitForSelector("text=/Grabando/", { timeout: 15000 });

  // ¿Se mueve el medidor? Miramos cuántas barras se encienden a lo largo de la toma.
  let picoBarras = 0;
  const hasta = Date.now() + segundos * 1000;
  while (Date.now() < hasta) {
    const encendidas = await page.evaluate(() =>
      [...document.querySelectorAll('[aria-hidden="true"] > span')].filter(
        (s) => getComputedStyle(s).backgroundColor === "rgb(198, 40, 40)"
      ).length
    );
    picoBarras = Math.max(picoBarras, encendidas);
    await page.waitForTimeout(250);
  }
  await page.screenshot({ path: path.join(BASE, `grab_${nombre}.png`) });
  await page.click("text=Listo");
  await page.waitForTimeout(800);

  const resultado = await esperar(page);
  console.log(`\n== ${nombre} ==`);
  console.log(`  barras encendidas (pico): ${picoBarras}/16`);
  console.log(`  ${resultado}`);
  await browser.close();
}

// 1) Con voz: tiene que grabar, transcribir y dar veredicto.
await correr("con_voz", conVoz, 12, async (page) => {
  if (await page.locator("text=No entró sonido").count()) return "FALLA: dijo que no entró sonido";
  await page.click("text=Analizar mensaje");
  await page.waitForSelector("text=Esto dice el audio", { timeout: 150000 });
  const t = await page.textContent("h2");
  const tr = await page.textContent('text=/^“.*”$/');
  return `veredicto: ${t?.trim()}\n  transcripción: ${tr?.trim().slice(0, 120)}…`;
});

// 2) En silencio: tiene que avisar, no mandar nada a analizar.
await correr("silencio", enSilencio, 5, async (page) => {
  const aviso = await page.locator("text=No entró sonido").count();
  return aviso ? "OK: detectó el silencio y avisó" : "FALLA: aceptó una grabación muda";
});
