"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  AudioLines,
  BadgeCheck,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Dices,
  Download,
  Flag,
  Globe,
  Image as ImageIcon,
  Loader2,
  Lock,
  Mic,
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
import { Escudo } from "./marca";

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
    linea: "var(--peligro)",
    texto: "var(--peligro)",
    fondo: "var(--peligro-bg)",
    etiqueta: "Riesgo alto",
    nivelBarra: 3,
  },
  amarillo: {
    linea: "var(--alerta)",
    texto: "var(--alerta)",
    fondo: "var(--alerta-bg)",
    etiqueta: "Riesgo medio",
    nivelBarra: 2,
  },
  verde: {
    linea: "var(--ok)",
    texto: "var(--ok)",
    fondo: "var(--ok-bg)",
    etiqueta: "Sin señales",
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
  const [audio, setAudio] = useState<{ base64: string; mime: string; url: string } | null>(null);
  const [grabando, setGrabando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const resultadoRef = useRef<HTMLDivElement>(null);
  const textoRef = useRef<HTMLTextAreaElement>(null);

  // El campo crece con el mensaje, como en una app de mensajería: sin barra de
  // arrastre ni un cuadro vacío enorme cuando todavía no escribiste nada.
  useEffect(() => {
    const el = textoRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [texto]);

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

  const cargarAudio = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAudio({
        base64: dataUrl.split(",")[1],
        mime: file.type || "audio/webm",
        url: URL.createObjectURL(file),
      });
      setImagen(null);
      setTexto("");
      setVeredicto(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  // Contador de la grabación
  useEffect(() => {
    if (!grabando) return;
    setSegundos(0);
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [grabando]);

  const alternarGrabacion = useCallback(async () => {
    if (grabando) {
      recorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const trozos: BlobPart[] = [];
      rec.ondataavailable = (e) => e.data.size > 0 && trozos.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setGrabando(false);
        const blob = new Blob(trozos, { type: rec.mimeType || "audio/webm" });
        cargarAudio(new File([blob], "grabacion.webm", { type: blob.type }));
      };
      recorderRef.current = rec;
      rec.start();
      setGrabando(true);
      setError(null);
      // corte de seguridad a los 3 minutos
      setTimeout(() => rec.state === "recording" && rec.stop(), 180000);
    } catch {
      setError("No pudimos usar el micrófono. Podés subir el archivo de audio con el botón de al lado.");
    }
  }, [grabando, cargarAudio]);

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
      imagenIn: { base64: string; mime: string; preview: string } | null = imagen,
      audioIn: { base64: string; mime: string; url: string } | null = audio
    ) => {
      if (!textoIn.trim() && !imagenIn && !audioIn) {
        setError("Pegá el mensaje sospechoso, subí una captura o mandá el audio.");
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
            texto: audioIn ? undefined : textoIn.trim() || undefined,
            imagenBase64: imagenIn?.base64,
            audioBase64: audioIn?.base64,
            mimeType: audioIn?.mime ?? imagenIn?.mime,
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
    [texto, imagen, audio]
  );

  // Contenido que llega desde el menú "Compartir" del celular (Web Share Target).
  useEffect(() => {
    let compartido: {
      texto?: string;
      imagenDataUrl?: string | null;
      audioDataUrl?: string | null;
    } | null = null;
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

    const partir = (dataUrl: string, mimePorDefecto: string) => {
      const [meta, b64] = dataUrl.split(",");
      return { base64: b64, mime: meta.replace("data:", "").replace(";base64", "") || mimePorDefecto };
    };

    // El audio manda: si vino una nota de voz, se analiza eso.
    if (compartido.audioDataUrl) {
      const { base64, mime } = partir(compartido.audioDataUrl, "audio/ogg");
      const aud = { base64, mime, url: compartido.audioDataUrl };
      setAudio(aud);
      void analizar("", null, aud);
      return;
    }

    const t = compartido.texto ?? "";
    let img: { base64: string; mime: string; preview: string } | null = null;
    if (compartido.imagenDataUrl) {
      const { base64, mime } = partir(compartido.imagenDataUrl, "image/png");
      img = { base64, mime, preview: compartido.imagenDataUrl };
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
  const hayAlgo = Boolean(texto.trim() || imagen || audio);

  function limpiar() {
    setTexto("");
    setImagen(null);
    setAudio(null);
    setVeredicto(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[var(--niebla)]">
      {/* Barra de la app */}
      <header className="barra-superior sticky top-0 z-30 bg-[var(--azul)]">
        <div className="mx-auto flex h-14 max-w-xl items-center gap-2.5 px-4">
          <Escudo className="h-7 w-7 text-white" />
          <span className="text-[17px] font-bold tracking-tight text-white">¿Es Oficial?</span>
          <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--celeste)]">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Gratis
          </span>
        </div>
      </header>

      <main className="flex-1 pb-32">
        {/* Encabezado institucional */}
        <section className="bg-[var(--azul)] px-4 pb-7 pt-1">
          <div className="mx-auto max-w-xl">
            <h1 className="text-[22px] font-bold leading-snug text-white">
              ¿Te llegó un mensaje raro?
            </h1>
            <p className="mt-1 text-[15px] leading-snug text-[#c3d3ea]">
              Mostranoslo y te decimos si tiene señales de estafa, qué hacer, y con qué
              teléfono oficial verificar.
            </p>
          </div>
        </section>

        <div className="mx-auto -mt-4 max-w-xl px-4">
          {/* Entrada de texto */}
          <div className="elevacion overflow-hidden rounded-2xl bg-white">
            <label htmlFor="mensaje" className="sr-only">
              Mensaje sospechoso
            </label>
            <textarea
              id="mensaje"
              value={texto}
              ref={textoRef}
              onChange={(e) => {
                setTexto(e.target.value);
                setVeredicto(null);
              }}
              onPaste={onPaste}
              rows={3}
              placeholder="Pegá acá el mensaje que te llegó…"
              className="block max-h-[45vh] w-full resize-none overflow-y-auto border-0 bg-white p-4 text-[17px] leading-relaxed text-[var(--tinta)] placeholder:text-[#8b93a1] focus:outline-none"
            />

            {imagen && (
              <div className="aparecer flex items-center gap-3 border-t border-[var(--borde)] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagen.preview} alt="Captura subida" className="h-14 w-14 rounded-lg object-cover" />
                <span className="text-[15px] font-semibold text-[var(--gris)]">Captura lista</span>
                <button
                  onClick={() => setImagen(null)}
                  className="pulsable ml-auto rounded-full p-2 text-[var(--gris)] hover:bg-[var(--niebla)]"
                  aria-label="Quitar captura"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
            )}

            {audio && (
              <div className="aparecer border-t border-[var(--borde)] p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--cielo)]/10 text-[var(--cielo)]">
                    <AudioLines className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="text-[15px] font-semibold text-[var(--gris)]">Audio listo</span>
                  <button
                    onClick={() => setAudio(null)}
                    className="pulsable ml-auto rounded-full p-2 text-[var(--gris)] hover:bg-[var(--niebla)]"
                    aria-label="Quitar audio"
                  >
                    <X className="h-5 w-5" aria-hidden />
                  </button>
                </div>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio src={audio.url} controls className="mt-2 w-full" />
              </div>
            )}

            {grabando && (
              <div className="aparecer flex items-center gap-3 border-t border-[var(--borde)] bg-[var(--peligro-bg)] p-3.5">
                <span className="latir h-3 w-3 shrink-0 rounded-full bg-[var(--peligro)]" aria-hidden />
                <span className="font-semibold text-[var(--peligro)]">
                  Grabando… {String(Math.floor(segundos / 60)).padStart(2, "0")}:
                  {String(segundos % 60).padStart(2, "0")}
                </span>
                <button
                  onClick={alternarGrabacion}
                  className="pulsable ml-auto rounded-full bg-[var(--peligro)] px-5 py-2 font-bold text-white"
                >
                  Listo
                </button>
              </div>
            )}
          </div>

          {/* Otras formas de mostrar el mensaje */}
          <p className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-wider text-[var(--gris)]">
            O mostranoslo así
          </p>
          <div className="elevacion overflow-hidden rounded-2xl">
            <button onClick={() => fileRef.current?.click()} className="fila pulsable">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f1fb] text-[var(--cielo)]">
                <Camera className="h-5 w-5" aria-hidden />
              </span>
              <span className="flex-1 text-[16px] font-semibold text-[var(--tinta)]">
                Subir una captura de pantalla
              </span>
              <ChevronRight className="h-5 w-5 text-[#a8b0bd]" aria-hidden />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && cargarImagen(e.target.files[0])}
            />

            <button onClick={() => audioRef.current?.click()} className="fila pulsable">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f1fb] text-[var(--cielo)]">
                <AudioLines className="h-5 w-5" aria-hidden />
              </span>
              <span className="flex-1 text-[16px] font-semibold text-[var(--tinta)]">
                Subir una nota de voz
              </span>
              <ChevronRight className="h-5 w-5 text-[#a8b0bd]" aria-hidden />
            </button>
            <input
              ref={audioRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && cargarAudio(e.target.files[0])}
            />

            <button onClick={alternarGrabacion} className="fila pulsable">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f1fb] text-[var(--cielo)]">
                <Mic className="h-5 w-5" aria-hidden />
              </span>
              <span className="flex-1 text-[16px] font-semibold text-[var(--tinta)]">
                {grabando ? "Detener la grabación" : "Grabar un audio o una llamada"}
              </span>
              <ChevronRight className="h-5 w-5 text-[#a8b0bd]" aria-hidden />
            </button>
          </div>

          <p className="mt-2.5 text-[13px] leading-snug text-[var(--gris)]">
            ¿Es una nota de voz de WhatsApp? Mantenela apretada → <b>Compartir</b> → ¿Es Oficial?.
            Si no te aparece en la lista, poné el audio en altavoz y tocá <b>Grabar</b>.
          </p>

          {error && (
            <p className="aparecer mt-4 flex items-start gap-2 rounded-xl border-l-4 border-[var(--peligro)] bg-[var(--peligro-bg)] p-3.5 text-[15px] text-[var(--peligro)]">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden /> {error}
            </p>
          )}

          {/* Ejemplos */}
          {!veredicto && !cargando && (
            <div className="mt-6">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--gris)]">
                ¿No tenés ninguno a mano? Probá con un ejemplo
              </p>
              <div className="flex flex-wrap gap-2">
                {EJEMPLOS.map((ej) => (
                  <button
                    key={ej.etiqueta}
                    onClick={() => {
                      setTexto(ej.texto);
                      setImagen(null);
                      setAudio(null);
                      setVeredicto(null);
                    }}
                    className="pulsable rounded-full border border-[var(--borde)] bg-white px-3.5 py-2 text-[14px] font-semibold text-[var(--cielo)]"
                  >
                    {ej.etiqueta}
                  </button>
                ))}
                <button
                  onClick={() => {
                    const t = EJEMPLOS_EXTRA[Math.floor(Math.random() * EJEMPLOS_EXTRA.length)];
                    setTexto(t);
                    setImagen(null);
                    setAudio(null);
                    setVeredicto(null);
                  }}
                  className="pulsable flex items-center gap-1.5 rounded-full border border-dashed border-[var(--cielo)] bg-white px-3.5 py-2 text-[14px] font-semibold text-[var(--cielo)]"
                >
                  <Dices className="h-4 w-4" aria-hidden /> Uno al azar
                </button>
              </div>
            </div>
          )}

          {/* Esqueleto */}
          {cargando && (
            <section className="elevacion aparecer mt-5 overflow-hidden rounded-2xl bg-white">
              <div className="latir h-1.5 w-full bg-[#c8ced8]" />
              <div className="p-5">
                <div className="flex items-center gap-3.5">
                  <div className="latir h-14 w-14 shrink-0 rounded-full bg-[#e4e8ee]" />
                  <div className="flex-1 space-y-2">
                    <div className="latir h-3 w-24 rounded-full bg-[#e4e8ee]" />
                    <div className="latir h-5 w-44 rounded-full bg-[#e4e8ee]" />
                  </div>
                </div>
                <div className="mt-5 space-y-2.5">
                  <div className="latir h-4 w-full rounded-full bg-[#e4e8ee]" />
                  <div className="latir h-4 w-11/12 rounded-full bg-[#e4e8ee]" />
                  <div className="latir h-4 w-2/3 rounded-full bg-[#e4e8ee]" />
                </div>
                <p className="mt-5 text-center text-[14px] text-[var(--gris)]">{pasoCarga}</p>
              </div>
            </section>
          )}

          {/* Resultado */}
          {veredicto && c && (
            <section
              ref={resultadoRef}
              className="elevacion-alta aparecer mt-5 scroll-mt-[4.5rem] overflow-hidden rounded-2xl bg-white"
              aria-live="polite"
            >
              <div className="crecer h-1.5 w-full" style={{ background: c.linea }} />

              <div className="p-5">
                <div className="flex items-start gap-3.5">
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
                    <span
                      className="inline-block rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white"
                      style={{ background: c.linea }}
                    >
                      {c.etiqueta}
                    </span>
                    <h2
                      className="mt-1.5 text-[22px] font-bold leading-tight"
                      style={{ color: c.texto }}
                    >
                      {TITULOS[veredicto.nivel]}
                    </h2>
                  </div>
                </div>

                {veredicto.transcripcion && (
                  <div className="mt-4 rounded-xl border-l-4 border-[var(--cielo)] bg-[#f3f8fd] p-3.5">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--cielo)]">
                      <AudioLines className="h-4 w-4" aria-hidden /> Esto dice el audio
                    </p>
                    <p className="mt-1.5 text-[15px] italic leading-relaxed text-[var(--tinta)]">
                      “{veredicto.transcripcion}”
                    </p>
                  </div>
                )}

                <p className="mt-4 text-[17px] leading-relaxed text-[var(--tinta)]">
                  {veredicto.explicacionSimple}
                </p>

                {veredicto.queHacer.length > 0 && (
                  <div
                    className="mt-5 rounded-xl border-l-4 p-4"
                    style={{ borderColor: c.linea, background: c.fondo }}
                  >
                    <h3
                      className="text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: c.texto }}
                    >
                      Qué hacer ahora
                    </h3>
                    <ol className="mt-3 space-y-3">
                      {veredicto.queHacer.map((s, i) => (
                        <li key={i} className="flex gap-3">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                            style={{ background: c.linea }}
                          >
                            {i + 1}
                          </span>
                          <span className="text-[16px] font-medium leading-snug text-[var(--tinta)]">
                            {s}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>

              {/* Canal oficial: el diferencial */}
              {veredicto.canalOficial && (
                <div className="bg-[var(--azul)] p-5 text-white">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--celeste)]">
                    <BadgeCheck className="h-4 w-4" aria-hidden /> Canal oficial verificado ·{" "}
                    {veredicto.canalOficial.nombre}
                  </p>
                  <p className="mt-2 text-[15px] leading-snug text-[#c3d3ea]">
                    {veredicto.canalOficial.nuncaHace}
                  </p>
                  <div className="mt-4 space-y-2">
                    {veredicto.canalOficial.telefono && (
                      <a
                        href={`tel:${veredicto.canalOficial.telefono.replace(/[^\d+]/g, "")}`}
                        className="pulsable flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-[17px] font-bold text-[var(--azul)]"
                      >
                        <Phone className="h-5 w-5" aria-hidden /> Llamar al{" "}
                        {veredicto.canalOficial.telefono}
                      </a>
                    )}
                    {veredicto.canalOficial.web && (
                      <a
                        href={`https://${veredicto.canalOficial.web}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pulsable flex w-full items-center justify-center gap-2 rounded-xl border border-white/35 px-4 py-3.5 text-[16px] font-bold text-white"
                      >
                        <Globe className="h-5 w-5" aria-hidden /> {veredicto.canalOficial.web}
                      </a>
                    )}
                  </div>
                  <p className="mt-3 text-[13px] leading-snug text-[#9fb4d4]">
                    Estos son los datos reales del organismo, no los del mensaje. Llamá o entrá
                    vos: nunca desde el link que te mandaron.
                  </p>
                </div>
              )}

              {/* Detalle, como filas de app */}
              <div className="border-t border-[var(--borde)]">
                {veredicto.senales.length > 0 && (
                  <Plegable
                    icono={<Search className="h-5 w-5" aria-hidden />}
                    titulo="Por qué lo detectamos"
                    contador={`${veredicto.senales.length}`}
                  >
                    <ul className="space-y-2">
                      {veredicto.senales.map((s, i) => (
                        <li
                          key={i}
                          className="rounded-r-lg border-l-[3px] bg-[var(--niebla)] py-2.5 pl-3.5 pr-3 text-[15px] leading-snug text-[var(--tinta)]"
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
                    icono={<CheckCircle2 className="h-5 w-5" aria-hidden />}
                    titulo="Cómo confirmarlo por las tuyas"
                  >
                    <p className="text-[15px] leading-relaxed text-[var(--tinta)]">
                      {veredicto.verificacionOficial}
                    </p>
                  </Plegable>
                )}

                {veredicto.nivel !== "verde" && (
                  <Plegable
                    icono={<Siren className="h-5 w-5" aria-hidden />}
                    titulo="Si ya diste datos o transferiste"
                  >
                    <p className="text-[15px] leading-relaxed text-[var(--tinta)]">
                      Llamá <strong>ya</strong> a tu banco por el número del dorso de tu tarjeta.
                      Denunciá el intento en la Unidad Fiscal de Ciberdelincuencia (UFECI):{" "}
                      <a
                        className="font-semibold text-[var(--cielo)] underline underline-offset-2"
                        href="mailto:denunciasufeci@mpf.gov.ar"
                      >
                        denunciasufeci@mpf.gov.ar
                      </a>{" "}
                      o en la comisaría más cercana. Línea gratuita: <strong>134</strong>.
                    </p>
                  </Plegable>
                )}
              </div>

              <div className="space-y-2 border-t border-[var(--borde)] p-4">
                <button
                  onClick={compartir}
                  className="pulsable flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--azul)] px-4 py-3.5 text-[16px] font-bold text-[var(--azul)]"
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
                    className="mx-auto flex items-center gap-1.5 py-1 text-[14px] font-semibold text-[var(--gris)] disabled:opacity-70"
                  >
                    {reportado ? (
                      <>
                        <Check className="h-4 w-4" aria-hidden /> Gracias, lo sumamos
                      </>
                    ) : (
                      <>
                        <Flag className="h-4 w-4" aria-hidden /> Esto me pasó de verdad
                      </>
                    )}
                  </button>
                )}
              </div>
            </section>
          )}

          <GuiaInstalacion />

          <footer className="mt-8 space-y-2 text-center text-[13px] leading-relaxed text-[var(--gris)]">
            <p>
              ¿Es Oficial? evalúa señales de riesgo con inteligencia artificial y puede
              equivocarse. No reemplaza la verificación con el organismo o el banco por sus
              canales oficiales.
            </p>
            <p>
              <Lock className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden />
              No guardamos los mensajes, las imágenes ni los audios.
            </p>
          </footer>
        </div>
      </main>

      {/* Acción principal, fija abajo como en una app */}
      <div className="barra-inferior fixed inset-x-0 bottom-0 z-30 border-t border-[var(--borde)] bg-white/95 px-4 pt-3 backdrop-blur">
        <div className="mx-auto max-w-xl">
          {veredicto ? (
            <button
              onClick={limpiar}
              className="pulsable flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--azul)] px-5 py-4 text-[17px] font-bold text-white"
            >
              <Search className="h-5 w-5" aria-hidden /> Revisar otro mensaje
            </button>
          ) : (
            <button
              onClick={() => analizar()}
              disabled={cargando || grabando || !hayAlgo}
              className="pulsable flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--azul)] px-5 py-4 text-[17px] font-bold text-white disabled:bg-[#aab2c0]"
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
          )}
        </div>
      </div>
    </div>
  );
}

/** Fila plegable del detalle, con el look de lista de app. */
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
    <details className="group border-b border-[var(--borde)] last:border-b-0">
      <summary className="fila pulsable cursor-pointer list-none marker:hidden">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--niebla)] text-[var(--gris)]">
          {icono}
        </span>
        <span className="flex-1 text-[16px] font-semibold text-[var(--tinta)]">{titulo}</span>
        {contador && (
          <span className="rounded-full bg-[var(--niebla)] px-2 py-0.5 text-[13px] font-bold text-[var(--gris)]">
            {contador}
          </span>
        )}
        <ChevronDown
          className="h-5 w-5 shrink-0 text-[#a8b0bd] transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="aparecer bg-white px-4 pb-4 pl-[4.375rem]">{children}</div>
    </details>
  );
}
/** Evento propietario de Chrome/Edge para instalar la PWA sin pasar por el menú. */
type EventoInstalar = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** Guía para tener la app en el celular, según el sistema. Se oculta si ya está instalada. */
function GuiaInstalacion() {
  const [so, setSo] = useState<"ios" | "android" | "otro" | null>(null);
  const [abierta, setAbierta] = useState(false);
  const [instalada, setInstalada] = useState(false);
  const [instalador, setInstalador] = useState<EventoInstalar | null>(null);
  const [instalando, setInstalando] = useState(false);

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

  // Chrome/Edge avisan cuando la app es instalable: guardamos el evento para
  // dispararlo con un solo toque. Safari/iOS no lo implementan (Apple no lo permite),
  // así que ahí seguimos con los pasos manuales.
  useEffect(() => {
    const alPoder = (e: Event) => {
      e.preventDefault();
      setInstalador(e as EventoInstalar);
    };
    const alInstalar = () => {
      setInstalada(true);
      setInstalador(null);
    };
    window.addEventListener("beforeinstallprompt", alPoder);
    window.addEventListener("appinstalled", alInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", alPoder);
      window.removeEventListener("appinstalled", alInstalar);
    };
  }, []);

  async function instalar() {
    if (!instalador) return;
    setInstalando(true);
    try {
      await instalador.prompt();
      const { outcome } = await instalador.userChoice;
      if (outcome === "accepted") setInstalada(true);
      setInstalador(null);
    } finally {
      setInstalando(false);
    }
  }

  if (instalada || so === null) return null;

  // Camino de un toque: el sistema abre su propio diálogo de instalación.
  if (instalador) {
    return (
      <section className="mt-8">
        <button
          onClick={instalar}
          disabled={instalando}
          className="pulsable elevacion flex w-full items-center gap-3.5 rounded-2xl bg-white p-4 text-left disabled:opacity-70"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--azul)] text-white">
            {instalando ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <Download className="h-5 w-5" aria-hidden />
            )}
          </span>
          <span className="flex-1">
            <span className="block text-[16px] font-bold text-[var(--tinta)]">
              Instalar ¿Es Oficial? en este celular
            </span>
            <span className="mt-0.5 block text-[13px] leading-snug text-[var(--gris)]">
              Queda como una app más y podés mandarle mensajes desde Compartir.
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-[#a8b0bd]" aria-hidden />
        </button>
      </section>
    );
  }

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
      <div className="elevacion overflow-hidden rounded-2xl">
        <button
          onClick={() => setAbierta((v) => !v)}
          className="fila pulsable"
          aria-expanded={abierta}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f1fb] text-[var(--cielo)]">
            <Smartphone className="h-5 w-5" aria-hidden />
          </span>
          <span className="flex-1 text-[16px] font-semibold text-[var(--tinta)]">
            Tenerla a mano en el celular{" "}
            {so === "ios" ? "(iPhone)" : so === "android" ? "(Android)" : ""}
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-[#a8b0bd] transition-transform ${abierta ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
        {abierta && (
          <ol className="aparecer list-decimal space-y-2 border-t border-[var(--borde)] bg-white px-5 py-4 pl-9 text-[15px] leading-snug text-[var(--tinta)]">
            {pasos.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
