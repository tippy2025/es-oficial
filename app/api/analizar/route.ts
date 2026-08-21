import { NextRequest, NextResponse } from "next/server";
import { analizar, anthropicKey, geminiKey } from "@/lib/ia";
import { hayTranscripcion, transcribir } from "@/lib/transcribir";

export const maxDuration = 60;

const MAX_TEXTO = 6000;
const MAX_IMAGEN_BYTES = 6 * 1024 * 1024;
const MAX_AUDIO_BYTES = 3 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let texto: string | undefined = body.texto?.trim() || undefined;
    const imagenBase64: string | undefined = body.imagenBase64 || undefined;
    const audioBase64: string | undefined = body.audioBase64 || undefined;
    const mimeType: string | undefined = body.mimeType || undefined;

    if (!texto && !imagenBase64 && !audioBase64) {
      return NextResponse.json(
        { error: "Pegá el texto del mensaje, subí una captura o mandá el audio." },
        { status: 400 }
      );
    }
    if (texto && texto.length > MAX_TEXTO) {
      return NextResponse.json(
        { error: "El texto es demasiado largo. Pegá solo el mensaje sospechoso." },
        { status: 400 }
      );
    }
    if (imagenBase64 && imagenBase64.length * 0.75 > MAX_IMAGEN_BYTES) {
      return NextResponse.json(
        { error: "La imagen es demasiado pesada (máximo ~6 MB)." },
        { status: 400 }
      );
    }
    if (audioBase64 && audioBase64.length * 0.75 > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: "El audio es demasiado largo. Mandá un fragmento de hasta ~3 minutos." },
        { status: 400 }
      );
    }
    if (!anthropicKey() && !geminiKey()) {
      return NextResponse.json(
        { error: "El servidor no tiene configurada una API key de IA." },
        { status: 500 }
      );
    }

    // Audio: primero lo pasamos a texto, después lo analiza el mismo motor de siempre.
    let transcripcion: string | undefined;
    if (audioBase64) {
      if (!hayTranscripcion()) {
        return NextResponse.json(
          { error: "El análisis de audio no está configurado en este servidor." },
          { status: 503 }
        );
      }
      transcripcion = await transcribir(audioBase64, mimeType || "audio/webm");
      texto = transcripcion;
    }

    const veredicto = await analizar({
      texto,
      imagenBase64,
      mimeType: audioBase64 ? undefined : mimeType,
      esAudio: Boolean(audioBase64),
    });
    return NextResponse.json({ ...veredicto, transcripcion });
  } catch (e) {
    console.error("Error en /api/analizar:", e);
    const msg =
      e instanceof Error && e.message.startsWith("No pudimos entender el audio")
        ? e.message
        : "No pudimos analizar el mensaje. Probá de nuevo en unos segundos.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
