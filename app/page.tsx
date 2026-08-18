"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Veredicto } from "@/lib/reglas";

const EJEMPLOS = [
  {
    etiqueta: "“Soy de PAMI”",
    texto:
      "Hola! Le escribimos de PAMI. Para no perder su cobertura de medicamentos gratis necesitamos validar su identidad hoy mismo. Envíenos foto de su DNI y el código de 6 dígitos que le llega por SMS. Es urgente, el sistema cierra a las 18hs.",
  },
  {
    etiqueta: "“Hijo con número nuevo”",
    texto:
      "Hola ma, se me rompió el celu y estoy usando este número nuevo. Necesito que me hagas una transferencia urgente de $180.000 a este alias porque tengo que pagar algo ya y no puedo entrar al banco. Después te explico, no le digas a nadie que me da vergüenza.",
  },
  {
    etiqueta: "Turno médico real",
    texto:
      "Hospital Italiano: le recordamos su turno con Clínica Médica el jueves 21/08 a las 10:30 hs, sede central, piso 3. Si no puede asistir, cancele desde el Portal de Salud o la app.",
  },
];

const COLORES: Record<string, { borde: string; fondo: string; texto: string; punto: string }> = {
  rojo: { borde: "border-red-500", fondo: "bg-red-50", texto: "text-red-800", punto: "bg-red-600" },
  amarillo: { borde: "border-amber-500", fondo: "bg-amber-50", texto: "text-amber-800", punto: "bg-amber-500" },
  verde: { borde: "border-green-500", fondo: "bg-green-50", texto: "text-green-800", punto: "bg-green-600" },
};

const TITULOS: Record<string, string> = {
  rojo: "⛔ Alto riesgo de estafa",
  amarillo: "⚠️ Sospechoso: verificá antes de actuar",
  verde: "✅ Sin señales típicas de estafa",
};

export default function Home() {
  const [texto, setTexto] = useState("");
  const [imagen, setImagen] = useState<{ base64: string; mime: string; preview: string } | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [veredicto, setVeredicto] = useState<Veredicto | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [reportado, setReportado] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const resultadoRef = useRef<HTMLDivElement>(null);

  const cargarImagen = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagen({ base64: dataUrl.split(",")[1], mime: file.type, preview: dataUrl });
      setVeredicto(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const onPaste = useCallback(
    (e: React.ClipboardEvent) => {
      const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
      const file = item?.getAsFile();
      if (file) {
        e.preventDefault();
        cargarImagen(file);
      }
    },
    [cargarImagen]
  );

  const analizar = useCallback(
    async (
      textoIn: string = texto,
      imagenIn: { base64: string; mime: string; preview: string } | null = imagen
    ) => {
      if (!textoIn.trim() && !imagenIn) {
        setError("Pegá el mensaje sospechoso o subí una captura de pantalla.");
        return;
      }
      setCargando(true);
      setError(null);
      setVeredicto(null);
      setReportado(false);
      try {
        const res = await fetch("/api/analizar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            texto: textoIn.trim() || undefined,
            imagenBase64: imagenIn?.base64,
            mimeType: imagenIn?.mime,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error desconocido");
        setVeredicto(data);
        setTimeout(
          () => resultadoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
          100
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "No pudimos analizar el mensaje.");
      } finally {
        setCargando(false);
      }
    },
    [texto, imagen]
  );

  // Contenido que llega desde el menú "Compartir" del celular (Web Share Target).
  useEffect(() => {
    let compartido: { texto?: string; imagenDataUrl?: string | null } | null = null;
    try {
      const raw = sessionStorage.getItem("esoficial_compartido");
      if (raw) {
        compartido = JSON.parse(raw);
        sessionStorage.removeItem("esoficial_compartido");
      } else {
        const m = document.cookie.match(/(?:^|; )esoficial_compartido=([^;]*)/);
        if (m) {
          compartido = JSON.parse(decodeURIComponent(m[1]));
          document.cookie = "esoficial_compartido=; Max-Age=0; path=/";
        }
      }
    } catch {
      compartido = null;
    }
    if (!compartido) return;
    const t = compartido.texto ?? "";
    let img: { base64: string; mime: string; preview: string } | null = null;
    if (compartido.imagenDataUrl) {
      const [meta, b64] = compartido.imagenDataUrl.split(",");
      const mime = meta.replace("data:", "").replace(";base64", "") || "image/png";
      img = { base64: b64, mime, preview: compartido.imagenDataUrl };
    }
    setTexto(t);
    setImagen(img);
    if (t || img) void analizar(t, img);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function reportar() {
    if (!veredicto || reportado) return;
    setReportado(true);
    try {
      await fetch("/api/reportar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nivel: veredicto.nivel,
          titulo: veredicto.titulo,
          organismo: veredicto.organismoSuplantado ?? null,
          senales: veredicto.senales,
        }),
      });
    } catch {
      /* el reporte es best-effort */
    }
  }

  function compartir() {
    if (!veredicto) return;
    const resumen = [
      `${TITULOS[veredicto.nivel]}`,
      "",
      veredicto.explicacionSimple,
      "",
      "Señales detectadas:",
      ...veredicto.senales.map((s) => `• ${s}`),
      "",
      "Qué hacer:",
      ...veredicto.queHacer.map((s) => `• ${s}`),
      "",
      "Analizado con ¿Es Oficial? — antes de responder, preguntá.",
    ].join("\n");
    navigator.clipboard.writeText(resumen).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  }

  const c = veredicto ? COLORES[veredicto.nivel] : null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
        <header className="text-center">
          <p className="text-5xl" aria-hidden>
            {"🛡️"}
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            ¿Es Oficial?
          </h1>
          <p className="mt-3 text-xl text-slate-600">
            ¿Te llegó un mensaje raro? Antes de responder, preguntá.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Pegá el mensaje o subí una captura y te decimos en segundos si tiene
            señales de estafa y qué hacer.
          </p>
        </header>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <textarea
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setVeredicto(null);
            }}
            onPaste={onPaste}
            rows={5}
            placeholder={
              "Pegá acá el mensaje sospechoso (WhatsApp, SMS o mail)...\nTambién podés pegar una captura con Ctrl+V."
            }
            className="w-full resize-y rounded-xl border border-slate-300 p-4 text-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />

          {imagen && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagen.preview} alt="Captura subida" className="h-20 rounded-lg object-cover" />
              <span className="text-sm text-slate-600">Captura lista para analizar</span>
              <button
                onClick={() => setImagen(null)}
                className="ml-auto rounded-lg px-3 py-1 text-sm text-red-600 hover:bg-red-50"
              >
                Quitar
              </button>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-xl border border-slate-300 px-5 py-3 text-lg font-medium text-slate-700 hover:bg-slate-100"
            >
              {"📷"} Subir captura
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && cargarImagen(e.target.files[0])}
            />
            <button
              onClick={() => analizar()}
              disabled={cargando}
              className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-lg font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
            >
              {cargando ? "Analizando..." : "Analizar mensaje"}
            </button>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Probá con un ejemplo
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EJEMPLOS.map((ej) => (
                <button
                  key={ej.etiqueta}
                  onClick={() => {
                    setTexto(ej.texto);
                    setImagen(null);
                    setVeredicto(null);
                  }}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:border-blue-400 hover:text-blue-700"
                >
                  {ej.etiqueta}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>
          )}
        </section>

        {veredicto && c && (
          <section
            ref={resultadoRef}
            className={`mt-6 rounded-2xl border-2 ${c.borde} ${c.fondo} p-5 sm:p-6`}
          >
            <div className="flex items-center gap-3">
              <span className={`h-4 w-4 shrink-0 animate-pulse rounded-full ${c.punto}`} />
              <h2 className={`text-2xl font-bold ${c.texto}`}>{TITULOS[veredicto.nivel]}</h2>
            </div>
            <p className="mt-3 text-lg leading-relaxed text-slate-800">
              {veredicto.explicacionSimple}
            </p>

            {veredicto.senales.length > 0 && (
              <div className="mt-5">
                <h3 className="font-semibold text-slate-900">Señales detectadas</h3>
                <ul className="mt-2 space-y-2">
                  {veredicto.senales.map((s, i) => (
                    <li key={i} className="flex gap-2 text-slate-800">
                      <span aria-hidden>{"🔎"}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {veredicto.queHacer.length > 0 && (
              <div className="mt-5">
                <h3 className="font-semibold text-slate-900">Qué hacer ahora</h3>
                <ul className="mt-2 space-y-2">
                  {veredicto.queHacer.map((s, i) => (
                    <li key={i} className="flex gap-2 text-slate-800">
                      <span aria-hidden>{"👉"}</span>
                      <span className="font-medium">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {veredicto.canalOficial && (
              <div className="mt-5 rounded-xl border-2 border-blue-500 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  {"☑️"} Canal oficial verificado · {veredicto.canalOficial.nombre}
                </p>
                <p className="mt-1 text-slate-800">
                  {veredicto.canalOficial.nuncaHace}
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  {veredicto.canalOficial.telefono && (
                    <a
                      href={`tel:${veredicto.canalOficial.telefono.replace(/[^\d+]/g, "")}`}
                      className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-center text-lg font-semibold text-white hover:bg-blue-700"
                    >
                      {"📞"} Llamar al {veredicto.canalOficial.telefono}
                    </a>
                  )}
                  {veredicto.canalOficial.web && (
                    <a
                      href={`https://${veredicto.canalOficial.web}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-xl border border-blue-600 px-4 py-3 text-center text-lg font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      {"🌐"} {veredicto.canalOficial.web}
                    </a>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Estos son los datos reales del organismo, no los del mensaje. Llamá o entrá vos: nunca desde el link que te mandaron.
                </p>
              </div>
            )}

            {veredicto.verificacionOficial && (
              <div className="mt-4 rounded-xl bg-white/70 p-4">
                <h3 className="font-semibold text-slate-900">
                  {"🔎"} Cómo confirmarlo
                </h3>
                <p className="mt-1 text-slate-800">{veredicto.verificacionOficial}</p>
              </div>
            )}

            {veredicto.nivel !== "verde" && (
              <div className="mt-4 rounded-xl bg-white/70 p-4">
                <h3 className="font-semibold text-slate-900">{"🚨"} Dónde denunciar</h3>
                <p className="mt-1 text-slate-800">
                  Si transferiste dinero o diste datos, llamá <strong>ya</strong> a tu banco por el número del dorso de tu tarjeta.
                  Denunciá el intento en la Unidad Fiscal de Ciberdelincuencia (UFECI):{" "}
                  <a className="underline" href="mailto:denunciasufeci@mpf.gov.ar">denunciasufeci@mpf.gov.ar</a>{" "}
                  o en la comisaría más cercana. Línea gratuita de orientación: <strong>134</strong>.
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={compartir}
                className="flex-1 rounded-xl bg-slate-900 px-5 py-3 text-lg font-semibold text-white hover:bg-slate-700"
              >
                {copiado ? "¡Copiado! Pegalo en WhatsApp" : "💬 Copiar para compartir con mamá"}
              </button>
              {veredicto.nivel !== "verde" && (
                <button
                  onClick={reportar}
                  disabled={reportado}
                  className="rounded-xl border border-slate-400 px-5 py-3 text-lg font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                >
                  {reportado ? "✔️ Gracias, sumado a la base" : "🚩 Reportar estafa real"}
                </button>
              )}
            </div>
          </section>
        )}

        <footer className="mt-10 text-center text-xs leading-relaxed text-slate-400">
          <p>
            ¿Es Oficial? evalúa señales de riesgo con inteligencia artificial y
            puede equivocarse. No reemplaza la verificación con el organismo o
            banco por sus canales oficiales. No envíes datos personales sensibles.
          </p>
          <p className="mt-2">
            Las imágenes y textos se analizan al momento y no se guardan.
          </p>
        </footer>
      </div>
    </main>
  );
}
