import { REGLAS_CANALES_OFICIALES, Veredicto } from "./reglas";
import { DIRECTORIO, buscarCanal, resumenDirectorioParaPrompt } from "./directorio";
import { sanearTelefonos } from "./sanear";

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
7. Antes de poner "verde", hacete esta pregunta: ¿es una OFERTA COMERCIAL que no pedí (promo, refinanciación, descuento, sorteo, encuesta con premio) y me empuja a entrar a un link? Si la respuesta es sí, NO puede ser verde: es amarillo cuando el dominio es exactamente el oficial de la marca, y rojo cuando no lo es. Los avisos de servicio sobre algo que ya existe (un envío, un turno, una factura, un movimiento de tu cuenta) no son ofertas: esos sí son verdes.

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
  /** el texto viene de la transcripción de una nota de voz o llamada */
  esAudio?: boolean;
}

// Sanea claves cargadas con BOM/espacios (p. ej. al pegarlas por consola en Windows)
const limpiarKey = (v?: string) => v?.replace(/^﻿/, "").trim() || undefined;
export const anthropicKey = () => limpiarKey(process.env.ANTHROPIC_API_KEY);
export const geminiKey = () => limpiarKey(process.env.GEMINI_API_KEY);

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
const PEDIDO_AUDIO = (texto: string) =>
  `Esto es la TRANSCRIPCIÓN de una nota de voz o llamada que recibió el usuario:\n\n"""\n${texto}\n"""\n\n` +
  `Analizala aplicando las reglas de notas de voz. Recordá: que la voz suene igual a la de un conocido no prueba nada, ` +
  `hoy se clona con menos de 30 segundos de audio. Si pide plata, datos o urgencia, es rojo aunque la reconozcan. ` +
  `En "queHacer" incluí siempre verificar llamando al número que el usuario ya tenía agendado de esa persona, ` +
  `o preguntándole algo que solo ella pueda saber. Si el audio es un mensaje común sin pedidos, es verde.`;
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
    content.push({
      type: "text",
      text: entrada.esAudio
        ? PEDIDO_AUDIO(entrada.texto || "")
        : PEDIDO_TEXTO(entrada.texto || ""),
    });
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

const MODELOS_GEMINI = [
  process.env.GEMINI_MODEL || "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-3.5-flash-lite",
];

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
    parts.push({
      text: entrada.esAudio
        ? PEDIDO_AUDIO(entrada.texto || "")
        : PEDIDO_TEXTO(entrada.texto || ""),
    });
  }

  // Si un modelo está saturado (503) probamos con el siguiente: alguien que está
  // mirando un mensaje sospechoso no puede quedarse sin respuesta.
  let ultimo: Error | null = null;
  for (const model of MODELOS_GEMINI) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey()}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts }],
          generationConfig: {
            // Los modelos nuevos razonan antes de contestar y ese razonamiento
            // gasta del mismo presupuesto: con poco margen devuelven vacío.
            maxOutputTokens: 4096,
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      }
    );
    if (res.ok) {
      const data = await res.json();
      // La respuesta puede venir partida en varios trozos, y algunos son el
      // razonamiento interno del modelo: nos quedamos solo con la respuesta.
      const texto: string = (data.candidates?.[0]?.content?.parts ?? [])
        .filter((p: { thought?: boolean }) => !p?.thought)
        .map((p: { text?: string }) => p?.text ?? "")
        .join("");
      if (texto.includes("{")) return texto;
      ultimo = new Error(`Gemini ${model}: respuesta sin JSON`);
      continue;
    }
    ultimo = new Error(`Gemini ${model} ${res.status}: ${await res.text()}`);
    // 401/403 son de credenciales: reintentar no cambia nada. 404 significa
    // que ese modelo ya no existe para esta cuenta, así que seguimos probando.
    if (res.status === 401 || res.status === 403) break;
  }
  throw ultimo ?? new Error("Gemini no respondió");
}

export async function analizar(entrada: EntradaAnalisis): Promise<Veredicto> {
  // Claude es el motor principal. Si falla por lo que sea (crédito agotado,
  // caída, límite de uso), seguimos con Gemini en vez de dejar sin respuesta a
  // alguien que está mirando un mensaje sospechoso y no sabe qué hacer.
  if (anthropicKey()) {
    try {
      return extraerJson(await llamarAnthropic(entrada));
    } catch (e) {
      if (!geminiKey()) throw e;
      console.error("Claude falló, sigo con Gemini:", e instanceof Error ? e.message : e);
    }
  }
  return extraerJson(await llamarGemini(entrada));
}
