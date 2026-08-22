import { NextRequest, NextResponse } from "next/server";

// Web Share Target: el sistema operativo hace POST acá cuando el usuario
// elige "¿Es Oficial?" en el menú Compartir de WhatsApp/SMS/Galería.
// Guardamos lo compartido en una cookie de un solo uso (o en sessionStorage
// vía página puente, si no entra) y redirigimos al home, que lo levanta y lo
// analiza automáticamente. Nada se persiste en servidor.

export const maxDuration = 15;
const MAX_IMG_BYTES = 4 * 1024 * 1024;
const MAX_AUDIO_BYTES = 3 * 1024 * 1024;
const LIMITE_COOKIE = 3500;

/** Convierte un archivo del formulario en data URL, si es del tipo y tamaño esperados. */
async function aDataUrl(v: FormDataEntryValue | null, prefijo: string, maxBytes: number) {
  if (!(v instanceof File) || v.size === 0 || v.size > maxBytes) return null;
  // Algunos clientes mandan las notas de voz sin mime (o como application/octet-stream):
  // en ese caso confiamos en la extensión.
  const porExtension = /\.(opus|ogg|oga|mp3|m4a|aac|wav|weba|webm|amr)$/i.test(v.name);
  const tipoOk = v.type.startsWith(prefijo) || (prefijo === "audio/" && porExtension);
  if (!tipoOk) return null;
  const mime = v.type.startsWith(prefijo) ? v.type : "audio/ogg";
  const buf = Buffer.from(await v.arrayBuffer());
  return `data:${mime};base64,${buf.toString("base64")}`;
}

export async function POST(req: NextRequest) {
  const url = new URL("/", req.url);
  const res = NextResponse.redirect(url, 303);

  try {
    const form = await req.formData();
    const texto = [form.get("title"), form.get("text"), form.get("url")]
      .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
      .join("\n")
      .slice(0, 6000);

    const imagenDataUrl = await aDataUrl(form.get("captura"), "image/", MAX_IMG_BYTES);
    // Algunos sistemas mandan el audio en el campo genérico de archivos.
    const audioDataUrl =
      (await aDataUrl(form.get("grabacion"), "audio/", MAX_AUDIO_BYTES)) ??
      (await aDataUrl(form.get("captura"), "audio/", MAX_AUDIO_BYTES));

    if (texto || imagenDataUrl || audioDataUrl) {
      const carga = { texto, imagenDataUrl, audioDataUrl };
      const serializado = JSON.stringify(carga);
      // La cookie tiene límite (~4KB); las capturas y los audios van por la
      // página puente, que los deja en sessionStorage antes de redirigir.
      if (serializado.length > LIMITE_COOKIE) {
        const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>¿Es Oficial?</title>
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#232d4f">
<body style="margin:0;height:100dvh;display:flex;align-items:center;justify-content:center;background:#232d4f;color:#fff;font-family:system-ui,sans-serif;font-size:17px">Analizando lo que compartiste…
<script>
sessionStorage.setItem("esoficial_compartido", ${JSON.stringify(serializado)});
location.replace("/?compartido=1");
</script></body></html>`;
        return new NextResponse(html, {
          headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
        });
      }
      res.cookies.set("esoficial_compartido", serializado, {
        maxAge: 60,
        path: "/",
        sameSite: "lax",
      });
    }
  } catch (e) {
    console.error("Error en /compartir:", e);
  }
  return res;
}

export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/", req.url), 303);
}
