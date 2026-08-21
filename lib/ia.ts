import { REGLAS_CANALES_OFICIALES, Veredicto } from "./reglas";
import { DIRECTORIO, buscarCanal, resumenDirectorioParaPrompt } from "./directorio";

const SYSTEM_PROMPT = `Sos "¿Es Oficial?", un asistente argentino que evalúa si un mensaje (WhatsApp, SMS, mail, carta o llamada transcripta) es una probable estafa o una comunicación legítima. Tu usuario típico es una persona mayor o un familiar que la protege. Hablás en español rioplatense, simple y sin tecnicismos.

Usá esta base de conocimiento verificada sobre canales oficiales argentinos y patrones de estafa como fuente de verdad principal:
${REGLAS_CANALES_OFICIALES}

Directorio de organismos y empresas con canal oficial verificado (id → nombre y alias con los que la gente los nombra):
${resumenDirectorioParaPrompt()}

Reglas de tu análisis:
1. Evaluás RIESGO, nunca certeza absoluta. Si el mensaje es ambiguo o falta contexto, usá nivel "amarillo" y decí qué falta verificar.
2. "verde" no significa "seguro al 100%": significa que no detectaste señales típicas. Decilo así.
3. **NUNCA escribas un número de teléfono, un CBU, un alias ni una URL en "senales", "queHacer", "verificacionOficial" ni "explicacionSimple"** — ni siquiera si lo ves en la base de conocimiento. Los datos de contacto los agrega el sistema aparte, ya verificados. Si necesitás mandar a llamar, escribí "llamá al número oficial que ves abajo" o "entrá vos a la web oficial del organismo". Un número equivocado en una app anti-estafas es peor que no dar ninguno. La única excepción son las líneas de emergencia/denuncia generales que puedas citar textualmente de la base de conocimiento.
4. Las señales deben citar elementos CONCRETOS del mensaje analizado (qué pide, qué canal usa, qué urgencia mete), no generalidades.
5. "queHacer" son acciones inmediatas, imperativas y cortas ("No respondas", "No toques el link", "Llamá al número oficial de abajo, nunca al del mensaje").
6. "organismoSuplantado": si el mensaje dice venir de (o se hace pasar por) alguno del directorio, poné su id exacto; si es de un familiar, un desconocido o de alguien que no está en el directorio, poné null. También completalo cuando el mensaje sea legítimo y venga de un organismo del directorio (así el usuario tiene el canal oficial a mano).

Respondé ÚNICAMENTE con un JSON válido, sin markdown ni texto extra, con esta forma exacta:
{
  "nivel": "rojo" | "amarillo" | "verde",
  "titulo": "resumen de una línea del veredicto",
  "senales": ["señal concreta 1", "señal concreta 2", ...],
  "queHacer": ["acción 1", "acción 2", ...],
  "verificacionOficial": "cómo verificar por el canal oficial correspondiente",
  "explicacionSimple": "explicación de 2-3 frases como para contársela a tu mamá",
  "organismoSuplantado": "id del directorio" | null
}`;

interface EntradaAnalisis {
  texto?: string;
  imagenBase64?: string;
  mimeType?: string;
}

// Sanea claves cargadas con BOM/espacios (p. ej. al pegarlas por consola en Windows)
const limpiarKey = (v?: string) => v?.replace(/^﻿/, "").trim() || undefined;
export const anthropicKey = () => limpiarKey(process.env.ANTHROPIC_API_KEY);
export const geminiKey = () => limpiarKey(process.env.GEMINI_API_KEY);

/**
 * Red de seguridad: el modelo no debe dictar números de teléfono en el texto libre.
 * Un número inventado (ej. decir 130 —que es ANSES— cuando PAMI es 138) manda al
 * usuario al lugar equivocado. Sacamos cualquier número que no esté verificado.
 */
// Solo líneas generales de emergencia/denuncia (no las de un organismo puntual:
// justamente confundir 130 de ANSES con 138 de PAMI es el error que queremos evitar).
const LINEAS_PERMITIDAS = new Set(["134", "137", "144", "911"]);

function sanearTelefonos(txt: string, telefonoVerificado?: string | null): string {
  if (!txt) return txt;
  const digitosOk = telefonoVerificado?.replace(/\D/g, "") ?? "";
  return txt.replace(/(?:\+?54\s*)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}(?:[\s.-]?\d{2,4})?/g, (m) => {
    const d = m.replace(/\D/g, "");
    if (d.length < 3) return m; // no es un teléfono
    if (digitosOk && (d === digitosOk || digitosOk.endsWith(d) || d.endsWith(digitosOk))) return m;
    if (LINEAS_PERMITIDAS.has(d)) return m;
    if (/^\d{4}$/.test(d) && Number(d) >= 1900 && Number(d) <= 2100) return m; // es un año
    return "el número oficial que ves abajo";
  });
}

function extraerJson(raw: string): Veredicto {
  const limpio = raw.replace(/```json|```/g, "").trim();
  const inicio = limpio.indexOf("{");
  const fin = limpio.lastIndexOf("}");
  if (inicio === -1 || fin === -1) throw new Error("La IA no devolvió JSON");
  const v = JSON.parse(limpio.slice(inicio, fin + 1)) as Veredicto;
  if (!["rojo", "amarillo", "verde"].includes(v.nivel)) v.nivel = "amarillo";
  v.senales = Array.isArray(v.senales) ? v.senales : [];
  v.queHacer = Array.isArray(v.queHacer) ? v.queHacer : [];
  // Resolvemos el canal oficial en el servidor, desde el directorio verificado:
  // la IA solo elige el id; los teléfonos y webs nunca salen del modelo.
  const canal = buscarCanal(v.organismoSuplantado ?? null);
  v.organismoSuplantado = canal?.id ?? null;
  v.canalOficial = canal;

  const tel = canal?.telefono ?? null;
  v.senales = v.senales.map((s) => sanearTelefonos(s, tel));
  v.queHacer = v.queHacer.map((s) => sanearTelefonos(s, tel));
  v.explicacionSimple = sanearTelefonos(v.explicacionSimple ?? "", tel);
  v.verificacionOficial = sanearTelefonos(v.verificacionOficial ?? "", tel);
  return v;
}

export { DIRECTORIO };

const PEDIDO_TEXTO = (texto: string) =>
  `Analizá este mensaje que recibió el usuario:\n\n"""\n${texto}\n"""`;
const PEDIDO_IMAGEN =
  "Analizá el mensaje que se ve en esta captura de pantalla que recibió el usuario. Primero leé todo el texto visible y después evaluá el riesgo.";

async function llamarAnthropic(entrada: EntradaAnalisis): Promise<string> {
  const content: unknown[] = [];
  if (entrada.imagenBase64) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: entrada.mimeType || "image/png",
        data: entrada.imagenBase64,
      },
    });
    content.push({ type: "text", text: PEDIDO_IMAGEN });
  } else {
    content.push({ type: "text", text: PEDIDO_TEXTO(entrada.texto || "") });
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey()!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

async function llamarGemini(entrada: EntradaAnalisis): Promise<string> {
  const parts: unknown[] = [];
  if (entrada.imagenBase64) {
    parts.push({
      inline_data: {
        mime_type: entrada.mimeType || "image/png",
        data: entrada.imagenBase64,
      },
    });
    parts.push({ text: PEDIDO_IMAGEN });
  } else {
    parts.push({ text: PEDIDO_TEXTO(entrada.texto || "") });
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey()}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts }],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.2 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export async function analizar(entrada: EntradaAnalisis): Promise<Veredicto> {
  const raw = anthropicKey()
    ? await llamarAnthropic(entrada)
    : await llamarGemini(entrada);
  return extraerJson(raw);
}
