// Genera las placas gráficas (PNG 1080x1920) para las escenas sin app.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(BASE, "escenas");
fs.mkdirSync(OUT, { recursive: true });

const escudo = (fill, qFill) => `
<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M24 3.5 8.5 9.2v13.4c0 9.9 6.4 19.2 15.5 22 9.1-2.8 15.5-12.1 15.5-22V9.2L24 3.5Z" fill="${fill}"/>
  <path d="M20.1 19.4c0-2.3 1.8-4 4-4s3.9 1.5 3.9 3.6c0 1.7-.9 2.6-2.4 3.6-1.3.9-1.8 1.6-1.8 3v.8h-3v-1.1c0-2.1.8-3.3 2.4-4.3 1.1-.7 1.5-1.2 1.5-2 0-.9-.7-1.5-1.7-1.5s-1.8.7-1.8 1.9h-3.1Zm2.3 12.9c0-1.1.8-1.9 1.9-1.9s1.9.8 1.9 1.9-.8 1.9-1.9 1.9-1.9-.8-1.9-1.9Z" fill="${qFill}"/>
</svg>`;

const estilo = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 1080px; height: 1920px; background: #232d4f; color: #ffffff; font-family: "Montserrat", "Segoe UI", system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 90px; text-align: center; }
  .wa { background: #111b21; border-radius: 36px; padding: 40px; width: 900px; text-align: left; box-shadow: 0 30px 80px rgba(0,0,0,.6); }
  .wa .head { display:flex; align-items:center; gap:22px; border-bottom:1px solid #2a3942; padding-bottom:24px; margin-bottom:28px; }
  .wa .ava { width:84px; height:84px; border-radius:50%; background:#00a884; display:flex; align-items:center; justify-content:center; font-size:44px; }
  .wa .name { font-size:40px; font-weight:600; color:#e9edef; }
  .wa .sub { font-size:26px; color:#8696a0; }
  .wa .bubble { background:#202c33; color:#e9edef; border-radius:24px; border-top-left-radius:6px; padding:30px 34px; font-size:38px; line-height:1.4; max-width:820px; }
  .wa .time { color:#8696a0; font-size:24px; text-align:right; margin-top:14px; }
  h1 { font-size:88px; font-weight:800; line-height:1.1; margin-bottom:24px; }
  h2 { font-size:56px; font-weight:700; line-height:1.25; }
  p { font-size:44px; line-height:1.4; color:#cbd5e1; }
  .big { font-size:200px; font-weight:900; color:#60a5fa; line-height:1; }
  .stat { margin: 40px 0; }
  .stat .n { font-size:150px; font-weight:900; color:#f87171; line-height:1; }
  .stat .t { font-size:42px; color:#e2e8f0; margin-top:10px; }
  .url { font-size:60px; font-weight:700; color:#93c5fd; margin-top:40px; letter-spacing:1px; }
  .shield { font-size:260px; line-height:1; margin-bottom:30px; }
  .tag { display:inline-block; background:#1d4ed8; color:white; border-radius:999px; padding:14px 34px; font-size:34px; font-weight:600; margin-bottom:40px; }
  .warn { color:#fbbf24; font-size:52px; font-weight:800; margin-top:60px; }
`;

const placas = {
  "01_golpe": `
    <div class="wa">
      <div class="head"><div class="ava">🏥</div><div><div class="name">PAMI Atención</div><div class="sub">+54 9 11 6••• ••••</div></div></div>
      <div class="bubble">Hola! Le escribimos de <b>PAMI</b>. Para no perder su cobertura de medicamentos gratis necesitamos validar su identidad <b>hoy mismo</b>. Envíenos foto de su DNI y el código de 6 dígitos que le llega por SMS. Es urgente, el sistema cierra a las 18hs.</div>
      <div class="time">10:42 ✓✓</div>
    </div>
    <div class="warn">¿Le contestarías?</div>`,
  "02_problema": `
    <div class="tag">ARGENTINA · 2026</div>
    <div class="stat"><div class="n">9 de 10</div><div class="t">adultos mayores recibió un intento de estafa digital</div></div>
    <div class="stat"><div class="n">ANSES</div><div class="t">emitió una alerta oficial este mes por estafas a jubilados</div></div>
    <h2 style="margin-top:50px">La pregunta que miles de hijos reciben cada semana:</h2>
    <h1 style="color:#fbbf24;margin-top:30px">"¿Esto es verdad?"</h1>`,
  "08_cierre": `
    <div style="margin-bottom:36px">${escudo("#ffffff", "#232d4f").replace("<svg", '<svg width="220" height="220"')}</div>
    <h1>¿Es Oficial?</h1>
    <h2 style="color:#75aadb;margin-top:14px">Antes de responder, preguntá.</h2>
    <div class="url">es-oficial.vercel.app</div>
    <p style="margin-top:70px;font-size:32px;color:#9fb4d4">Texto · Capturas · Notas de voz<br>Gratis, sin registro, y no guarda nada</p>`,
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;800");
for (const [id, html] of Object.entries(placas)) {
  await page.setContent(`<html><head><meta charset="utf-8"><style>${estilo}</style></head><body>${html}</body></html>`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, `${id}.png`) });
  console.log("OK", id);
}
await browser.close();
