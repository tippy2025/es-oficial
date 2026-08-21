"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  BadgeCheck,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Dices,
  Flag,
  Globe,
  Image as ImageIcon,
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
import { Marca } from "./marca";

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

// Más casos para el botón "probar con uno al azar"
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

const PASOS_CARGA = [
  "Leyendo el mensaje…",
  "Buscando señales de estafa conocidas…",
  "Verificando el canal oficial del organismo…",
  "Armando qué tenés que hacer…",
];

type Estilo = {
  linea: string;
  texto: string;
  fondo: string;
  etiqueta: string;
  nivelBarra: number;
};

const COLORES: Record<string, Estilo> = {
  rojo: {
    linea: "var(--danger-line)",
    texto: "var(--danger)",
    fondo: "var(--danger-bg)",
    etiqueta: "Riesgo alto",
    nivelBarra: 3,
  },
  amarillo: {
    linea: "var(--warn-line)",
    texto: "var(--warn)",
    fondo: "var(--warn-bg)",
    etiqueta: "Riesgo medio",
    nivelBarra: 2,
  },
  verde: {
    linea: "var(--ok-line)",
    texto: "var(--ok)",
    fondo: "var(--ok-bg)",
    etiqueta: "Riesgo bajo",
    nivelBarra: 1,
  },
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
  const [pasoCarga, setPasoCarga] = useState(PASOS_CARGA[0]);
  const fileRef = useRef<HTMLInputElement>(null);
  const resultadoRef = useRef<HTMLDivElement>(null);

  // Mensajes rotativos mientras analiza: la espera se siente trabajo, no cuelgue.
  useEffect(() => {
    if (!cargando) return;
    let i = 0;
    setPasoCarga(PASOS_CARGA[0]);
    const id = setInterval(() => {
      i = Math.min(i + 1, PASOS_CARGA.length - 1);
      setPasoCarga(PASOS_CARGA[i]);
    }, 1400);
    return () => clearInterval(id);
  }, [cargando]);

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
          120
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
      "es-oficial.vercel.app",
    ].join("\n");
    navigator.clipboard.writeText(resumen).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  }
  const c = veredicto ? COLORES[veredicto.nivel] : null;
  const hayResultado = Boolean(veredicto && c);

  return (
    <main className="min-h-screen">
      {/* Barra superior con la marca */}
      <div className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Marca />
          <span className="hidden text-xs font-medium text-slate-500 sm:block">
            Gratis · sin registro · no guardamos nada
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-16 pt-8 sm:pt-12">
        <header className="text-center">
          <h1 className="font-titulo text-balance text-[1.6rem] font-bold leading-[1.2] text-slate-900 sm:text-[2.3rem]">
            ¿Te llegó un mensaje raro?{" "}
            <span className="text-[var(--brand)]">Antes de responder, preguntá.</span>
          </h1>
          {!hayResultado && !cargando && (
            <p className="mx-auto mt-3 max-w-md text-pretty leading-snug text-slate-600 sm:text-lg">
              Pegá el mensaje o subí la captura. En segundos te decimos si tiene señales de
              estafa, qué hacer, y el teléfono real del organismo para verificar.
            </p>
          )}
        </header>

        {/* Formulario */}
        <section className="sombra-carta mt-7 rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5">
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
            placeholder={"Pegá acá el mensaje sospechoso…\n(WhatsApp, SMS o mail)"}
            className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-lg leading-relaxed text-slate-900 placeholder:text-slate-500 focus:border-[var(--brand-600)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--brand-600)]/10"
          />

          {imagen && (
            <div className="deslizar mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagen.preview} alt="Captura subida" className="h-16 w-16 rounded-xl object-cover" />
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <ImageIcon className="h-4 w-4 text-slate-500" aria-hidden /> Captura lista
              </span>
              <button
                onClick={() => setImagen(null)}
                className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-white hover:text-red-700"
                aria-label="Quitar captura"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}

          <button
            onClick={() => analizar()}
            disabled={cargando}
            className="sombra-boton mt-4 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[var(--brand)] px-5 py-4 text-lg font-bold text-white hover:bg-[var(--brand-600)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-75"
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

          <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 underline-offset-4 hover:text-[var(--brand)] hover:underline"
            >
              <Camera className="h-4 w-4" aria-hidden /> Subir una captura
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && cargarImagen(e.target.files[0])}
            />
            <button
              onClick={() => {
                const t = EJEMPLOS_EXTRA[Math.floor(Math.random() * EJEMPLOS_EXTRA.length)];
                setTexto(t);
                setImagen(null);
                setVeredicto(null);
              }}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 underline-offset-4 hover:text-[var(--brand)] hover:underline"
              title="Cargar un mensaje de prueba al azar"
            >
              <Dices className="h-4 w-4" aria-hidden /> Probar con uno al azar
            </button>
          </div>

          {error && (
            <p className="deslizar mt-4 flex items-start gap-2 rounded-2xl bg-red-50 p-3.5 text-red-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden /> {error}
            </p>
          )}
        </section>

        {/* Ejemplos: ruedas de entrenamiento, prioridad baja */}
        {!hayResultado && !cargando && (
          <div className="mt-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              O probá con un ejemplo
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
                  className="rounded-lg bg-slate-200/70 px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-300/70"
                >
                  {ej.etiqueta}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Esqueleto mientras analiza */}
        {cargando && (
          <section className="sombra-carta deslizar mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white">
            <div className="latir h-1.5 w-full bg-slate-300" />
            <div className="p-5 sm:p-7">
              <div className="flex items-center gap-4">
                <div className="latir h-14 w-14 shrink-0 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="latir h-3 w-28 rounded-full bg-slate-200" />
                  <div className="latir h-6 w-52 rounded-full bg-slate-200" />
                </div>
              </div>
              <div className="mt-6 space-y-2.5">
                <div className="latir h-4 w-full rounded-full bg-slate-200" />
                <div className="latir h-4 w-11/12 rounded-full bg-slate-200" />
                <div className="latir h-4 w-3/5 rounded-full bg-slate-200" />
              </div>
              <p className="mt-6 text-center text-sm text-slate-500">{pasoCarga}</p>
            </div>
          </section>
        )}

        {/* Resultado */}
        {veredicto && c && (
          <section
            ref={resultadoRef}
            className="sombra-alta aparecer mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white"
            aria-live="polite"
          >
            <div className="crecer h-1.5 w-full" style={{ background: c.linea }} />

            <div className="p-5 sm:p-7">
              <div className="flex items-start gap-4">
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ background: c.linea }}
                >
                  {veredicto.nivel === "rojo" ? (
                    <ShieldAlert className="h-7 w-7" aria-hidden />
                  ) : veredicto.nivel === "amarillo" ? (
                    <AlertTriangle className="h-7 w-7" aria-hidden />
                  ) : (
                    <ShieldCheck className="h-7 w-7" aria-hidden />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Resultado del análisis
                  </p>
                  <h2
                    className="font-titulo text-balance text-2xl font-bold leading-tight sm:text-3xl"
                    style={{ color: c.texto }}
                  >
                    {TITULOS[veredicto.nivel]}
                  </h2>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex flex-1 gap-1" aria-hidden>
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 flex-1 rounded-full"
                          style={{ background: i < c.nivelBarra ? c.linea : "#e2e8f0" }}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold" style={{ color: c.texto }}>
                      {c.etiqueta}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-pretty text-lg leading-relaxed text-slate-800">
                {veredicto.explicacionSimple}
              </p>

              {/* Qué hacer: visible siempre, es la acción */}
              {veredicto.queHacer.length > 0 && (
                <div className="mt-6 rounded-2xl p-4 sm:p-5" style={{ background: c.fondo }}>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: c.texto }}>
                    Qué hacer ahora
                  </h3>
                  <ol className="mt-3 space-y-3">
                    {veredicto.queHacer.map((s, i) => (
                      <li key={i} className="flex gap-3 text-slate-800">
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ background: c.linea }}
                        >
                          {i + 1}
                        </span>
                        <span className="font-medium leading-snug">{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Canal oficial: el diferencial del producto */}
              {veredicto.canalOficial && (
                <div className="mt-4 overflow-hidden rounded-2xl bg-[var(--brand)] text-white">
                  <div className="p-4 sm:p-5">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-200">
                      <BadgeCheck className="h-4 w-4" aria-hidden /> Canal oficial verificado ·{" "}
                      {veredicto.canalOficial.nombre}
                    </p>
                    <p className="mt-2 text-pretty leading-snug text-blue-50">
                      {veredicto.canalOficial.nuncaHace}
                    </p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      {veredicto.canalOficial.telefono && (
                        <a
                          href={`tel:${veredicto.canalOficial.telefono.replace(/[^\d+]/g, "")}`}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-lg font-bold text-[var(--brand)] hover:bg-blue-50 active:scale-[0.99]"
                        >
                          <Phone className="h-5 w-5" aria-hidden /> Llamar al {veredicto.canalOficial.telefono}
                        </a>
                      )}
                      {veredicto.canalOficial.web && (
                        <a
                          href={`https://${veredicto.canalOficial.web}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/40 px-4 py-3.5 font-bold text-white hover:bg-white/10 active:scale-[0.99]"
                        >
                          <Globe className="h-5 w-5" aria-hidden /> {veredicto.canalOficial.web}
                        </a>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-snug text-blue-200">
                      Estos son los datos reales del organismo, no los del mensaje. Llamá o entrá
                      vos: nunca desde el link que te mandaron.
                    </p>
                  </div>
                </div>
              )}

              {/* Detalle plegado */}
              <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
                {veredicto.senales.length > 0 && (
                  <Plegable
                    icono={<Search className="h-4 w-4" aria-hidden />}
                    titulo="Por qué lo detectamos"
                    contador={`${veredicto.senales.length} ${veredicto.senales.length === 1 ? "señal" : "señales"}`}
                  >
                    <ul className="space-y-2">
                      {veredicto.senales.map((s, i) => (
                        <li
                          key={i}
                          className="rounded-r-lg border-l-[3px] bg-slate-50 py-2.5 pl-3.5 pr-3 leading-snug text-slate-700"
                          style={{ borderColor: c.linea }}
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  </Plegable>
                )}

                {veredicto.verificacionOficial && (
                  <Plegable
                    icono={<CheckCircle2 className="h-4 w-4" aria-hidden />}
                    titulo="Cómo confirmarlo por las tuyas"
                  >
                    <p className="leading-relaxed text-slate-700">{veredicto.verificacionOficial}</p>
                  </Plegable>
                )}

                {veredicto.nivel !== "verde" && (
                  <Plegable
                    icono={<Siren className="h-4 w-4" aria-hidden />}
                    titulo="Si ya diste datos o transferiste"
                  >
                    <p className="leading-relaxed text-slate-700">
                      Llamá <strong>ya</strong> a tu banco por el número del dorso de tu tarjeta.
                      Denunciá el intento en la Unidad Fiscal de Ciberdelincuencia (UFECI):{" "}
                      <a
                        className="font-medium text-[var(--brand)] underline underline-offset-2"
                        href="mailto:denunciasufeci@mpf.gov.ar"
                      >
                        denunciasufeci@mpf.gov.ar
                      </a>{" "}
                      o en la comisaría más cercana. Línea gratuita de orientación:{" "}
                      <strong>134</strong>.
                    </p>
                  </Plegable>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <button
                  onClick={compartir}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--brand)] px-5 py-3.5 text-lg font-bold text-[var(--brand)] hover:bg-[var(--brand-tint)] active:scale-[0.99]"
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
                    className="mx-auto flex items-center gap-1.5 text-sm font-medium text-slate-600 underline-offset-4 hover:text-[var(--brand)] hover:underline disabled:no-underline disabled:opacity-70"
                  >
                    {reportado ? (
                      <>
                        <Check className="h-4 w-4" aria-hidden /> Gracias, lo sumamos a la base
                      </>
                    ) : (
                      <>
                        <Flag className="h-4 w-4" aria-hidden /> Esto me pasó de verdad: reportarlo
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        <GuiaInstalacion />

        <footer className="mt-10 space-y-2 text-center text-sm leading-relaxed text-slate-500">
          <p className="mx-auto max-w-lg text-pretty">
            ¿Es Oficial? evalúa señales de riesgo con inteligencia artificial y puede
            equivocarse. No reemplaza la verificación con el organismo o el banco por sus
            canales oficiales.
          </p>
          <p>
            <Lock className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden />
            No guardamos los mensajes ni las imágenes. No pedimos datos personales.
          </p>
        </footer>
      </div>
    </main>
  );
}

/** Sección plegable del detalle del resultado. */
function Plegable({
  icono,
  titulo,
  contador,
  children,
}: {
  icono: React.ReactNode;
  titulo: string;
  contador?: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 py-3.5 text-slate-800 marker:hidden hover:text-[var(--brand)]">
        <span className="text-slate-500">{icono}</span>
        <span className="font-bold">{titulo}</span>
        {contador && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
            {contador}
          </span>
        )}
        <ChevronDown
          className="ml-auto h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="deslizar pb-4 pl-7 pr-1">{children}</div>
    </details>
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
    <section className="mt-8 text-center">
      <button
        onClick={() => setAbierta((v) => !v)}
        className="mx-auto flex items-center gap-1.5 text-sm font-medium text-slate-600 underline-offset-4 hover:text-[var(--brand)] hover:underline"
        aria-expanded={abierta}
      >
        <Smartphone className="h-4 w-4" aria-hidden />
        Tenerla a mano en el celular{" "}
        {so === "ios" ? "(iPhone)" : so === "android" ? "(Android)" : ""}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${abierta ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {abierta && (
        <ol className="deslizar mx-auto mt-3 max-w-md list-decimal space-y-2 rounded-2xl border border-slate-200 bg-white p-4 pl-9 text-left text-[15px] leading-snug text-slate-700">
          {pasos.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ol>
      )}
    </section>
  );
}
