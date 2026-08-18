// Genera capturas de pantalla realistas (WhatsApp / SMS / mail) para probar la app con imágenes.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(BASE, "..", "kit-prueba");
fs.mkdirSync(OUT, { recursive: true });

const css = `
* { box-sizing:border-box; margin:0; padding:0; }
body { width:390px; height:844px; font-family:-apple-system,"Segoe UI",Roboto,sans-serif; }
.wa { background:#0b141a url() ; height:100%; display:flex; flex-direction:column; }
.wa .top { background:#202c33; color:#e9edef; padding:48px 12px 10px; display:flex; align-items:center; gap:10px; }
.wa .ava { width:38px; height:38px; border-radius:50%; background:#6a7175; display:flex; align-items:center; justify-content:center; font-size:20px; }
.wa .name { font-weight:600; font-size:16px; }
.wa .sub { font-size:12px; color:#8696a0; }
.wa .chat { flex:1; padding:14px 10px; background:#0b141a; }
.wa .b { background:#202c33; color:#e9edef; border-radius:8px; border-top-left-radius:0; padding:8px 10px; font-size:15px; line-height:1.35; max-width:85%; margin-bottom:8px; }
.wa .b .t { color:#8696a0; font-size:11px; text-align:right; margin-top:4px; }
.wa .b a { color:#53bdeb; }
.sms { background:#000; color:#fff; height:100%; }
.sms .top { padding:52px 16px 8px; text-align:center; border-bottom:1px solid #222; }
.sms .top .n { font-size:15px; color:#fff; }
.sms .top .s { font-size:12px; color:#8e8e93; }
.sms .b { background:#26252a; margin:14px 16px; padding:10px 14px; border-radius:18px; font-size:16px; line-height:1.35; max-width:78%; }
.sms .d { text-align:center; color:#8e8e93; font-size:12px; margin-top:12px; }
.mail { background:#fff; color:#111; height:100%; }
.mail .top { padding:52px 16px 10px; border-bottom:1px solid #ddd; }
.mail .from { font-weight:600; font-size:15px; }
.mail .addr { font-size:12px; color:#666; }
.mail .subj { font-size:17px; font-weight:600; margin-top:12px; }
.mail .body { padding:16px; font-size:15px; line-height:1.45; }
.mail .btn { display:block; background:#009ee3; color:#fff; text-align:center; padding:12px; border-radius:6px; margin:16px 0; font-weight:600; }
.mail .foot { font-size:11px; color:#888; }
`;

const capturas = {
  "captura_whatsapp_banco": `<div class="wa">
    <div class="top"><div class="ava">🏦</div><div><div class="name">Banco Nación - Seguridad</div><div class="sub">+54 9 11 2345-6789</div></div></div>
    <div class="chat">
      <div class="b">Estimado cliente, detectamos un ingreso a su Home Banking desde un dispositivo no reconocido en Córdoba.<div class="t">09:14</div></div>
      <div class="b">Para bloquear la operación y proteger sus fondos, ingrese AHORA a <a>https://bna-seguridad-online.com.ar.info</a> y valide su usuario, clave y token.<div class="t">09:14</div></div>
      <div class="b">Tiene 20 minutos. Pasado ese plazo la transferencia de $ 350.000 se hará efectiva.<div class="t">09:15</div></div>
    </div></div>`,
  "captura_sms_correo": `<div class="sms">
    <div class="top"><div class="n">Correo Arg</div><div class="s">SMS</div></div>
    <div class="d">Hoy 11:02</div>
    <div class="b">CORREO ARGENTINO: Su paquete N° AR7731 quedó retenido en aduana por falta de pago de tasa ($1.890). Regularice en las próximas 24 hs o será devuelto: correo-ar-envios.top/pago</div>
  </div>`,
  "captura_mail_mercadopago": `<div class="mail">
    <div class="top"><div class="from">Mercado Pago</div><div class="addr">notificaciones@mercado-pago-alertas.com</div><div class="subj">⚠️ Tu cuenta será suspendida en 24 horas</div></div>
    <div class="body">Hola,<br><br>Detectamos actividad inusual en tu cuenta. Por tu seguridad, tu cuenta y tu dinero quedarán bloqueados si no verificás tu identidad antes de las próximas 24 horas.<br>
    <span class="btn">Verificar mi cuenta ahora</span>
    Vas a necesitar tu clave de ingreso y el código de seguridad que te enviaremos por SMS.<br><br>
    <div class="foot">Mercado Pago S.A. · Este es un mensaje automático, no responder.</div></div>
  </div>`,
  "captura_whatsapp_turno_real": `<div class="wa">
    <div class="top"><div class="ava">🏥</div><div><div class="name">OSDE Turnos</div><div class="sub">cuenta de empresa</div></div></div>
    <div class="chat">
      <div class="b">Hola Juan Manuel, te recordamos tu turno de Oftalmología el martes 26/08 a las 15:40 hs con la Dra. Pérez, Centro Médico Belgrano (Cabildo 1250, piso 2).<div class="t">10:00</div></div>
      <div class="b">Si necesitás cancelar o reprogramar, hacelo desde la app OSDE o llamando al 0810-555-6733. Llegá 10 minutos antes con tu credencial y DNI.<div class="t">10:00</div></div>
    </div></div>`,
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
for (const [id, html] of Object.entries(capturas)) {
  await page.setContent(`<html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}</body></html>`);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, `${id}.png`) });
  console.log("OK", id);
}
await browser.close();
