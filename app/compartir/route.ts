import { NextRequest, NextResponse } from "next/server";

// Web Share Target: el sistema operativo hace POST acá cuando el usuario
// elige "¿Es Oficial?" en el menú Compartir de WhatsApp/SMS/Galería.
// Guardamos lo compartido en una cookie de un solo uso y redirigimos al home,
// que lo levanta y lo analiza automáticamente. Nada se persiste en servidor.

export const maxDuration = 15;
const MAX_IMG_BYTES = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const url = new URL("/", req.url);
  const res = NextResponse.redirect(url, 303);

  try {
    const form = await req.formData();
    const texto = [form.get("title"), form.get("text"), form.get("url")]
      .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
      .join("\n")
      .slice(0, 6000);

    const archivo = form.get("captura");
    let imagenDataUrl: string | null = null;
    if (archivo instanceof File && archivo.type.startsWith("image/") && archivo.size <= MAX_IMG_BYTES) {
      const buf = Buffer.from(await archivo.arrayBuffer());
      imagenDataUrl = `data:${archivo.type};base64,${buf.toString("base64")}`;
    }

    if (texto || imagenDataUrl) {
      // La cookie tiene límite (~4KB); imágenes grandes van por sessionStorage vía la página puente.
      if (imagenDataUrl && imagenDataUrl.length > 3500) {
        // Devolvemos una mini página que guarda en sessionStorage y redirige (misma pestaña).
        const html = `<!doctype html><meta charset="utf-8"><title>¿Es Oficial?</title>
<body style="font-family:system-ui;padding:2rem;text-align:center">Analizando lo que compartiste…
<script>
sessionStorage.setItem("esoficial_compartido", JSON.stringify(${JSON.stringify({ texto, imagenDataUrl })}));
location.replace("/?compartido=1");
</script></body>`;
        return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } });
      }
      res.cookies.set("esoficial_compartido", JSON.stringify({ texto, imagenDataUrl }), {
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
