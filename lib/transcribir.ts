/**
 * Transcripción de notas de voz / audios de llamadas.
 *
 * El análisis lo sigue haciendo Claude (motor validado con 71 casos reales);
 * acá solo convertimos el audio a texto. Se usa Gemini —que entiende audio de
 * forma nativa y tiene tier gratuito— y, si estuviera disponible, Whisper.
 */
import { geminiKey } from "./ia";

const INSTRUCCION_TRANSCRIPCION =
  "Transcribí literalmente lo que se dice en este audio, en español rioplatense. " +
  "No resumas, no interpretes, no agregues comentarios: solo el texto hablado. " +
  "Si hay más de una voz, indicá los turnos con un guion al principio de cada línea. " +
  "Si el audio está vacío o no se entiende nada, respondé exactamente: [SIN AUDIO].";

const openaiKey = () => process.env.OPENAI_API_KEY?.replace(/^﻿/, "").trim() || undefined;

export function hayTranscripcion(): boolean {
  return Boolean(geminiKey() || openaiKey());
}

// Si un modelo está saturado (503) probamos con el siguiente: la demo no puede fallar.
const MODELOS_AUDIO = [
  process.env.GEMINI_MODEL_AUDIO || "gemini-flash-latest",
  "gemini-2.5-flash",
  "gemini-flash-lite-latest",
  "gemini-2.5-flash-lite",
];

async function intentar(model: string, audioBase64: string, mimeType: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey()}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { inline_data: { mime_type: mimeType, data: audioBase64 } },
              { text: INSTRUCCION_TRANSCRIPCION },
            ],
          },
        ],
        generationConfig: { temperature: 0, maxOutputTokens: 1200 },
      }),
    }
  );
  if (!res.ok) {
    const cuerpo = (await res.text()).slice(0, 200);
    const err = new Error(`Gemini audio ${res.status}: ${cuerpo}`) as Error & { reintentable?: boolean };
    err.reintentable = res.status === 503 || res.status === 429 || res.status >= 500;
    throw err;
  }
  const data = await res.json();
  return (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
}

async function conGemini(audioBase64: string, mimeType: string): Promise<string> {
  let ultimo: unknown;
  for (const model of MODELOS_AUDIO) {
    for (let intento = 0; intento < 2; intento++) {
      try {
        return await intentar(model, audioBase64, mimeType);
      } catch (e) {
        ultimo = e;
        const r = (e as { reintentable?: boolean }).reintentable;
        if (!r) throw e;
        await new Promise((res) => setTimeout(res, 600 * (intento + 1)));
      }
    }
  }
  throw ultimo instanceof Error ? ultimo : new Error("No se pudo transcribir el audio");
}

async function conWhisper(audioBase64: string, mimeType: string): Promise<string> {
  const bin = Buffer.from(audioBase64, "base64");
  const ext = (mimeType.split("/")[1] || "webm").split(";")[0];
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(bin)], { type: mimeType }), `audio.${ext}`);
  form.append("model", "whisper-1");
  form.append("language", "es");
  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${openaiKey()}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Whisper ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return (data.text ?? "").trim();
}

/** Saca preámbulos del tipo "Aquí tienes la transcripción:" y las comillas que a veces agrega. */
function limpiarTranscripcion(t: string): string {
  let s = t.trim();
  s = s.replace(/^[^\n:]{0,80}transcripci[óo]n[^\n:]{0,40}:\s*/i, "");
  s = s.replace(/^["“«']+|["”»']+$/g, "");
  return s.trim();
}

export async function transcribir(audioBase64: string, mimeType: string): Promise<string> {
  const crudo = geminiKey()
    ? await conGemini(audioBase64, mimeType)
    : await conWhisper(audioBase64, mimeType);
  const texto = limpiarTranscripcion(crudo);
  if (!texto || texto.includes("[SIN AUDIO]")) {
    throw new Error("No pudimos entender el audio. Probá con una grabación más clara.");
  }
  return texto;
}
