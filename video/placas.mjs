// Genera las placas gráficas (PNG 1080x1920) para las escenas sin app.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(BASE, "escenas");
fs.mkdirSync(OUT, { recursive: true });

const estilo = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 1080px; height: 1920px; background: #0f172a; color: #f8fafc; font-family: "Segoe UI", system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 90px; text-align: center; }
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
  "07_compartir_intro": `
    <div class="tag">EN EL CELULAR</div>
    <div class="shield">📲</div>
    <h1>Desde WhatsApp</h1>
    <h2 style="color:#93c5fd;margin-top:20px">Compartir → ¿Es Oficial?</h2>
    <p style="margin-top:50px">Un toque y el mensaje se analiza solo.<br>Otro toque y el resultado vuelve por WhatsApp.</p>`,
  "08_cierre": `
    <div class="shield">🛡️</div>
    <h1>¿Es Oficial?</h1>
    <h2 style="color:#93c5fd">Antes de responder, preguntá.</h2>
    <div class="url">es-oficial.vercel.app</div>
    <p style="margin-top:80px;font-size:34px;color:#94a3b8">Gratis · Sin registro · No guarda nada<br>Hecho con Claude + Next.js + Vercel · CoderCup AI 2026</p>`,
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
for (const [id, html] of Object.entries(placas)) {
  await page.setContent(`<html><head><meta charset="utf-8"><style>${estilo}</style></head><body>${html}</body></html>`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, `${id}.png`) });
  console.log("OK", id);
}
await browser.close();
