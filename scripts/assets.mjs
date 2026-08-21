// Genera íconos PWA, favicon y la imagen de previsualización (OG) con la marca propia.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "public");
fs.mkdirSync(OUT, { recursive: true });

const BRAND = "#0b3d91";
const BRAND_LIGHT = "#1d4ed8";

const escudo = (fill, qFill) => `
<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M24 3.5 8.5 9.2v13.4c0 9.9 6.4 19.2 15.5 22 9.1-2.8 15.5-12.1 15.5-22V9.2L24 3.5Z" fill="${fill}"/>
  <path d="M20.1 19.4c0-2.3 1.8-4 4-4s3.9 1.5 3.9 3.6c0 1.7-.9 2.6-2.4 3.6-1.3.9-1.8 1.6-1.8 3v.8h-3v-1.1c0-2.1.8-3.3 2.4-4.3 1.1-.7 1.5-1.2 1.5-2 0-.9-.7-1.5-1.7-1.5s-1.8.7-1.8 1.9h-3.1Zm2.3 12.9c0-1.1.8-1.9 1.9-1.9s1.9.8 1.9 1.9-.8 1.9-1.9 1.9-1.9-.8-1.9-1.9Z" fill="${qFill}"/>
</svg>`;

const iconoHTML = (size) => `
<html><head><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;
       background:linear-gradient(145deg, ${BRAND_LIGHT} 0%, ${BRAND} 100%);}
  svg{width:${Math.round(size * 0.66)}px;height:${Math.round(size * 0.66)}px}
</style></head><body>${escudo("#ffffff", BRAND)}</body></html>`;

const ogHTML = `
<html><head>
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#0b1f4b;color:#fff;
       font-family:'Atkinson Hyperlegible',system-ui,sans-serif;
       display:flex;flex-direction:column;justify-content:center;padding:72px 80px;position:relative;overflow:hidden}
  .glow{position:absolute;width:700px;height:700px;border-radius:50%;
        background:radial-gradient(circle, rgba(59,130,246,.35) 0%, rgba(59,130,246,0) 70%);
        right:-140px;top:-200px}
  .row{display:flex;align-items:center;gap:20px;margin-bottom:36px;position:relative}
  .row svg{width:64px;height:64px}
  .brand{font-size:38px;font-weight:700;letter-spacing:-.5px}
  h1{font-size:74px;line-height:1.08;font-weight:700;letter-spacing:-1.5px;position:relative;max-width:920px}
  p{font-size:32px;color:#b6c8e8;margin-top:26px;position:relative}
  .chips{display:flex;gap:14px;margin-top:44px;position:relative}
  .chip{border:2px solid rgba(255,255,255,.22);border-radius:999px;padding:12px 26px;font-size:24px;color:#dbe6f8}
  .url{position:absolute;bottom:48px;left:80px;font-size:26px;color:#8fa9d4}
</style></head>
<body>
  <div class="glow"></div>
  <div class="row">${escudo("#ffffff", "#0b1f4b")}<span class="brand">¿Es Oficial?</span></div>
  <h1>Antes de responder ese mensaje, preguntá.</h1>
  <p>Pegá el mensaje o la captura y sabé en segundos si es una estafa.</p>
  <div class="chips"><span class="chip">Gratis</span><span class="chip">Sin registro</span><span class="chip">Hecho en Argentina</span></div>
  <div class="url">es-oficial.vercel.app</div>
</body></html>`;

const browser = await chromium.launch();

for (const size of [192, 512, 180]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(iconoHTML(size));
  await page.waitForTimeout(150);
  const name = size === 180 ? "apple-icon.png" : `icon-${size}.png`;
  await page.screenshot({ path: path.join(OUT, name) });
  await page.close();
  console.log("OK", name);
}

const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await og.setContent(ogHTML);
await og.waitForTimeout(900);
await og.screenshot({ path: path.join(OUT, "og.png") });
console.log("OK og.png");
await browser.close();
