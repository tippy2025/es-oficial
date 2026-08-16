import { NextRequest, NextResponse } from "next/server";
import { analizar, anthropicKey, geminiKey } from "@/lib/ia";

export const maxDuration = 30;

const MAX_TEXTO = 6000;
const MAX_IMAGEN_BYTES = 6 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const texto: string | undefined = body.texto?.trim() || undefined;
    const imagenBase64: string | undefined = body.imagenBase64 || undefined;
    const mimeType: string | undefined = body.mimeType || undefined;

    if (!texto && !imagenBase64) {
      return NextResponse.json(
        { error: "Pegá el texto del mensaje o subí una captura." },
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
    if (!anthropicKey() && !geminiKey()) {
      return NextResponse.json(
        { error: "El servidor no tiene configurada una API key de IA." },
        { status: 500 }
      );
    }

    const veredicto = await analizar({ texto, imagenBase64, mimeType });
    return NextResponse.json(veredicto);
  } catch (e) {
    console.error("Error en /api/analizar:", e);
    return NextResponse.json(
      { error: "No pudimos analizar el mensaje. Probá de nuevo en unos segundos." },
      { status: 500 }
    );
  }
}
