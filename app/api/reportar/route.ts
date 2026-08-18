import { NextRequest, NextResponse } from "next/server";

// Reporte anónimo de "esto era una estafa real". No guardamos el mensaje ni datos
// del usuario: solo el patrón (nivel, título, organismo suplantado, señales) para
// alimentar la curaduría de la base de reglas. Se registra en los logs de Vercel;
// en una versión siguiente va a una tabla (Vercel KV / Postgres).

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const reporte = {
      ts: new Date().toISOString(),
      nivel: String(body.nivel ?? "").slice(0, 10),
      titulo: String(body.titulo ?? "").slice(0, 200),
      organismo: body.organismo ? String(body.organismo).slice(0, 60) : null,
      senales: Array.isArray(body.senales)
        ? body.senales.slice(0, 8).map((s: unknown) => String(s).slice(0, 200))
        : [],
    };
    console.log("REPORTE_ESTAFA", JSON.stringify(reporte));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
