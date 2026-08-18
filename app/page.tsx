"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  CheckCircle2,
  Dices,
  Flag,
  Globe,
  Image as ImageIcon,
  ListChecks,
  Loader2,
  Lock,
  Phone,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Smartphone,
  X,
} from "lucide-react";
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

// Más casos para el botón "sorprendeme" (no ocupan lugar en la UI)
const EJEMPLOS_EXTRA = [
  "Buen día, lo llamo del área de seguridad de Banco Galicia. Detectamos una compra sospechosa de $95.000 con su tarjeta. Para cancelarla necesito que se acerque al cajero más cercano y siga mis indicaciones para generar un código de cancelación. Manténgase en línea, es urgente.",
  "¡FELICITACIONES! Su número fue seleccionado ganador de un Samsung Galaxy S25 en el sorteo aniversario de Mercado Libre. Para recibirlo solo debe abonar el costo de envío de $4.500 en el siguiente link: bit.ly/premio-ml-2026",
  "Hola! Perdón, te mandé por error un código de 6 dígitos por SMS, ¿me lo pasás? Es que estaba registrando mi WhatsApp nuevo y puse mal el número. Gracias!!",
  "Hola, somos de RRHH de Amazon Argentina. Fuiste preseleccionado para trabajo remoto de carga de datos, $850.000/mes, medio tiempo. Para activar tu cuenta de trabajo necesitamos un depósito reembolsable de $25.000. Respondé SI para continuar.",
  "CORREO ARGENTINO: Su paquete N° AR7731 quedó retenido en aduana por falta de pago de tasa ($1.890). Regularice en las próximas 24 hs o será devuelto: correo-ar-envios.top/pago",
  "ANSES informa: usted tiene un reintegro pendiente de $48.300 por el bono de agosto. Para acreditarlo ingrese su CBU y clave de homebanking en anses-reintegros.com antes del viernes.",
  "Hola vecino, soy la nueva administradora del consorcio. Cambiamos la cuenta para el pago de expensas, a partir de este mes transferí al alias CONSORCIO.NUEVO.2026. Cualquier duda me escribís por acá.",
  "Andreani: tu envío 360001234567 está en camino y llegará hoy entre las 14 y las 18 hs. No es necesario que hagas nada. Podés seguirlo desde nuestra app o en andreani.com.",
  "Hola Juan Manuel, te recordamos tu turno de Oftalmología el martes 26/08 a las 15:40 hs con la Dra. Pérez, Centro Médico Belgrano. Si necesitás cancelar, hacelo desde la app OSDE o llamando al 0810-555-6733.",
];

const COLORES: Record<string, { borde: string; fondo: string; texto: string; punto: string }> = {
  rojo: { borde: "border-red-600", fondo: "bg-red-50", texto: "text-red-900", punto: "bg-red-600" },
  amarillo: { borde: "border-amber-500", fondo: "bg-amber-50", texto: "text-amber-900", punto: "bg-amber-500" },
  verde: { borde: "border-green-600", fondo: "bg-green-50", texto: "text-green-900", punto: "bg-green-600" },
};

const TITULOS: Record<string, string> = {
  rojo: "Alto riesgo de estafa",
  amarillo: "Sospechoso: verificá antes de actuar",
  verde: "Sin señales típicas de estafa",
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
    const emoji = { rojo: "🔴", amarillo: "🟡", verde: "🟢" }[veredicto.nivel];
    const resumen = [
      `${emoji} ${TITULOS[veredicto.nivel].toUpperCase()}`,
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
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-14">
        <header className="flex flex-col items-center text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0b3d91] shadow-lg shadow-blue-900/20"
            aria-hidden
          >
            <ShieldCheck className="h-11 w-11 text-white" strokeWidth={2.2} />
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#0b3d91] sm:text-5xl">
            ¿Es Oficial?
          </h1>
          <p className="mt-3 text-xl text-slate-700">
            ¿Te llegó un mensaje raro? Antes de responder, preguntá.
          </p>
          <p className="mx-auto mt-2 max-w-md text-base text-slate-600">
            Pegá el mensaje o subí una captura y te decimos en segundos si tiene
            señales de estafa y qué hacer.
          </p>
        </header>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <label htmlFor="mensaje" className="sr-only">
            Mensaje sospechoso
          </label>
          <textarea
            id="mensaje"
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
            className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-lg text-slate-900 placeholder:text-slate-500 focus:border-[#1d4ed8] focus:ring-2 focus:ring-blue-200"
          />

          {imagen && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagen.preview} alt="Captura subida" className="h-20 rounded-lg object-cover" />
              <span className="flex items-center gap-2 text-sm text-slate-700">
                <ImageIcon className="h-4 w-4" aria-hidden /> Captura lista para analizar
              </span>
              <button
                onClick={() => setImagen(null)}
                className="ml-auto flex items-center gap-1 rounded-lg px-3 py-1 text-sm text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" aria-hidden /> Quitar
              </button>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-lg font-medium text-slate-800 hover:border-slate-400 hover:bg-slate-50"
            >
              <Camera className="h-5 w-5" aria-hidden /> Subir captura
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
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0b3d91] px-5 py-3 text-lg font-bold text-white shadow-md shadow-blue-900/20 hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {cargando ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Analizando…
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" aria-hidden /> Analizar mensaje
                </>
              )}
            </button>
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
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
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-[#1d4ed8] hover:text-[#1d4ed8]"
                >
                  {ej.etiqueta}
                </button>
              ))}
              <button
                onClick={() => {
                  const t = EJEMPLOS_EXTRA[Math.floor(Math.random() * EJEMPLOS_EXTRA.length)];
                  setTexto(t);
                  setImagen(null);
                  setVeredicto(null);
                }}
                className="flex items-center gap-1.5 rounded-full border border-dashed border-[#1d4ed8] px-3 py-1.5 text-sm text-[#1d4ed8] hover:bg-blue-50"
                title="Cargar un mensaje de prueba al azar (¿estafa o real? descubrilo)"
              >
                <Dices className="h-4 w-4" aria-hidden /> Sorprendeme
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-red-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden /> {error}
            </p>
          )}
        </section>

        {veredicto && c && (
          <section
            ref={resultadoRef}
            className={`mt-6 rounded-2xl border-2 ${c.borde} ${c.fondo} p-5 shadow-sm sm:p-6`}
            aria-live="polite"
          >
            <div className="flex items-center gap-3">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${c.punto} text-white`}>
                {veredicto.nivel === "rojo" ? (
                  <ShieldAlert className="h-6 w-6" aria-hidden />
                ) : veredicto.nivel === "amarillo" ? (
                  <AlertTriangle className="h-6 w-6" aria-hidden />
                ) : (
                  <ShieldCheck className="h-6 w-6" aria-hidden />
                )}
              </span>
              <h2 className={`text-2xl font-bold leading-tight ${c.texto}`}>{TITULOS[veredicto.nivel]}</h2>
            </div>
            <p className="mt-4 text-lg leading-relaxed text-slate-800">
              {veredicto.explicacionSimple}
            </p>

            {veredicto.senales.length > 0 && (
              <div className="mt-5">
                <h3 className="flex items-center gap-2 font-bold text-slate-900">
                  <Search className="h-4 w-4 text-slate-600" aria-hidden /> Señales detectadas
                </h3>
                <ul className="mt-2 space-y-2">
                  {veredicto.senales.map((s, i) => (
                    <li key={i} className="flex gap-2 text-slate-800">
                      <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${c.punto}`} aria-hidden />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {veredicto.queHacer.length > 0 && (
              <div className="mt-5">
                <h3 className="flex items-center gap-2 font-bold text-slate-900">
                  <ListChecks className="h-4 w-4 text-slate-600" aria-hidden /> Qué hacer ahora
                </h3>
                <ul className="mt-2 space-y-2">
                  {veredicto.queHacer.map((s, i) => (
                    <li key={i} className="flex gap-2 text-slate-800">
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-600" aria-hidden />
                      <span className="font-medium">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {veredicto.canalOficial && (
              <div className="mt-5 rounded-xl border-2 border-[#0b3d91] bg-white p-4">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#0b3d91]">
                  <BadgeCheck className="h-4 w-4" aria-hidden /> Canal oficial verificado · {veredicto.canalOficial.nombre}
                </p>
                <p className="mt-1 text-slate-800">
                  {veredicto.canalOficial.nuncaHace}
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  {veredicto.canalOficial.telefono && (
                    <a
                      href={`tel:${veredicto.canalOficial.telefono.replace(/[^\d+]/g, "")}`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0b3d91] px-4 py-3 text-center text-lg font-bold text-white hover:bg-[#1d4ed8]"
                    >
                      <Phone className="h-5 w-5" aria-hidden /> Llamar al {veredicto.canalOficial.telefono}
                    </a>
                  )}
                  {veredicto.canalOficial.web && (
                    <a
                      href={`https://${veredicto.canalOficial.web}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#0b3d91] px-4 py-3 text-center text-lg font-bold text-[#0b3d91] hover:bg-blue-50"
                    >
                      <Globe className="h-5 w-5" aria-hidden /> {veredicto.canalOficial.web}
                    </a>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Estos son los datos reales del organismo, no los del mensaje. Llamá o entrá vos: nunca desde el link que te mandaron.
                </p>
              </div>
            )}

            {veredicto.verificacionOficial && (
              <div className="mt-4 rounded-xl bg-white/80 p-4">
                <h3 className="flex items-center gap-2 font-bold text-slate-900">
                  <CheckCircle2 className="h-4 w-4 text-slate-600" aria-hidden /> Cómo confirmarlo
                </h3>
                <p className="mt-1 text-slate-800">{veredicto.verificacionOficial}</p>
              </div>
            )}

            {veredicto.nivel !== "verde" && (
              <div className="mt-4 rounded-xl bg-white/80 p-4">
                <h3 className="flex items-center gap-2 font-bold text-slate-900">
                  <Siren className="h-4 w-4 text-slate-600" aria-hidden /> Dónde denunciar
                </h3>
                <p className="mt-1 text-slate-800">
                  Si transferiste dinero o diste datos, llamá <strong>ya</strong> a tu banco por el número del dorso de tu tarjeta.
                  Denunciá el intento en la Unidad Fiscal de Ciberdelincuencia (UFECI):{" "}
                  <a className="font-medium text-[#0b3d91] underline" href="mailto:denunciasufeci@mpf.gov.ar">denunciasufeci@mpf.gov.ar</a>{" "}
                  o en la comisaría más cercana. Línea gratuita de orientación: <strong>134</strong>.
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={compartir}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0b3d91] px-5 py-3 text-lg font-bold text-white shadow-md shadow-blue-900/20 hover:bg-[#1d4ed8]"
              >
                {copiado ? (
                  <>
                    <Check className="h-5 w-5" aria-hidden /> ¡Copiado! Pegalo en WhatsApp
                  </>
                ) : (
                  <>
                    <Share2 className="h-5 w-5" aria-hidden /> Copiar para compartir con mamá
                  </>
                )}
              </button>
              {veredicto.nivel !== "verde" && (
                <button
                  onClick={reportar}
                  disabled={reportado}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-400 bg-white px-5 py-3 text-lg font-medium text-slate-800 hover:border-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {reportado ? (
                    <>
                      <Check className="h-5 w-5" aria-hidden /> Gracias, sumado a la base
                    </>
                  ) : (
                    <>
                      <Flag className="h-5 w-5" aria-hidden /> Reportar estafa real
                    </>
                  )}
                </button>
              )}
            </div>
          </section>
        )}

        <GuiaInstalacion />

        <footer className="mt-10 text-center text-sm leading-relaxed text-slate-600">
          <p>
            ¿Es Oficial? evalúa señales de riesgo con inteligencia artificial y
            puede equivocarse. No reemplaza la verificación con el organismo o
            banco por sus canales oficiales. No envíes datos personales sensibles.
          </p>
          <p className="mt-2">
            <Lock className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden />
            Las imágenes y textos se analizan al momento y no se guardan.
          </p>
        </footer>
      </div>
    </main>
  );
}

/** Guía para tener la app en el celular, según el sistema. Se oculta si ya está instalada. */
function GuiaInstalacion() {
  const [so, setSo] = useState<"ios" | "android" | "otro" | null>(null);
  const [abierta, setAbierta] = useState(false);
  const [instalada, setInstalada] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setInstalada(standalone);
    if (/iPhone|iPad|iPod/i.test(ua)) setSo("ios");
    else if (/Android/i.test(ua)) setSo("android");
    else setSo("otro");
  }, []);

  if (instalada || so === null) return null;

  const pasos =
    so === "ios"
      ? [
          "Tocá el botón Compartir de Safari (el cuadrado con la flecha ↑, abajo en el centro).",
          "Deslizá la lista hacia abajo y tocá “Agregar a inicio”.",
          "Tocá “Agregar”. Listo: el escudo queda en tu pantalla como una app más.",
          "Cuando te llegue un mensaje raro: mantenelo apretado → Copiar, abrí ¿Es Oficial? y pegalo. Si es una captura, guardala y subila con 📷.",
        ]
      : so === "android"
        ? [
            "Tocá el menú ⋮ de Chrome (arriba a la derecha).",
            "Elegí “Agregar a pantalla de inicio” o “Instalar app” y confirmá.",
            "Desde WhatsApp: mantené apretado el mensaje → Compartir → ¿Es Oficial?. Se analiza solo.",
          ]
        : [
            "Desde el celular podés instalarla como app: en Android desde el menú ⋮ de Chrome; en iPhone desde el botón Compartir de Safari → “Agregar a inicio”.",
          ];

  return (
    <section className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left">
      <button
        onClick={() => setAbierta((v) => !v)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={abierta}
      >
        <span className="flex items-center gap-2 text-base font-bold text-[#0b3d91]">
          <Smartphone className="h-5 w-5" aria-hidden /> Tenela en tu celular {so === "ios" ? "(iPhone)" : so === "android" ? "(Android)" : ""}
        </span>
        <span className="text-[#0b3d91]">{abierta ? "▲" : "▼"}</span>
      </button>
      {abierta && (
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-base text-slate-800">
          {pasos.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ol>
      )}
    </section>
  );
}
