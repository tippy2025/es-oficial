import type { Metadata } from "next";
import Link from "next/link";
import { Escudo } from "../marca";

export const metadata: Metadata = {
  title: "¿Es Oficial? — Video demo",
  description:
    "Video de 1:39 que muestra el problema, cómo funciona ¿Es Oficial? y cómo se usa. CoderCup AI 2026.",
  openGraph: {
    title: "¿Es Oficial? — Video demo",
    description: "Antes de responder, preguntá. Verificador de estafas para WhatsApp, SMS y notas de voz.",
    images: ["/demo-portada.jpg"],
  },
};

/** Página del video para la entrega: un solo lugar con la demo y el acceso a la app. */
export default function Demo() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[var(--niebla)]">
      <header className="barra-superior sticky top-0 z-30 bg-[var(--azul)]">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-2.5 px-4">
          <Escudo className="h-7 w-7 text-white" />
          <span className="text-[19px] font-bold tracking-tight text-white">¿Es Oficial?</span>
          <span className="ml-auto text-[14px] font-semibold uppercase tracking-wider text-[var(--celeste-claro)]">
            CoderCup AI 2026
          </span>
        </div>
      </header>

      <section className="bg-[var(--azul)] px-4 pb-7 pt-2">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-[28px] font-bold leading-snug text-white">
            Antes de responder, preguntá.
          </h1>
          <p className="mt-2 max-w-xl text-[18px] leading-snug text-[var(--sobre-azul)]">
            Nueve de cada diez adultos mayores recibió un intento de estafa digital. ¿Es
            Oficial? lee el mensaje, la captura o la nota de voz, dice si tiene señales de
            estafa, qué hacer, y con qué teléfono oficial verificar.
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-12 pt-6">
        {/* El video es vertical: la caja se ajusta a él para no dejar marcos negros. */}
        <div className="elevacion-alta mx-auto w-fit overflow-hidden rounded-2xl bg-black">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src="/demo.mp4"
            poster="/demo-portada.jpg"
            controls
            playsInline
            preload="metadata"
            className="block max-h-[78vh] w-full max-w-[min(100%,26rem)]"
          />
        </div>
        <p className="mt-2 text-center text-[16px] text-[var(--gris)]">
          1 minuto 39 · con audio
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/"
            className="pulsable elevacion flex items-center justify-center rounded-xl bg-[var(--azul)] px-5 py-4 text-[19px] font-bold text-white"
          >
            Probar la app
          </Link>
          <a
            href="https://github.com/tippy2025/es-oficial"
            target="_blank"
            rel="noopener noreferrer"
            className="pulsable elevacion flex items-center justify-center rounded-xl bg-white px-5 py-4 text-[19px] font-bold text-[var(--azul)]"
          >
            Ver el código
          </a>
        </div>

        <section className="elevacion mt-8 rounded-2xl bg-white p-5">
          <h2 className="text-[14px] font-bold uppercase tracking-wider text-[var(--gris)]">
            Qué tiene adentro
          </h2>
          <ul className="mt-3 space-y-3 text-[18px] leading-snug text-[var(--tinta)]">
            <li>
              <b>Analiza texto, capturas y notas de voz.</b> Las estafas con voz clonada
              explotaron en 2026 y hoy se clona una voz con menos de 30 segundos de audio.
            </li>
            <li>
              <b>Da el canal oficial verificado.</b> No solo dice “ojo, es estafa”: te muestra el
              teléfono real del organismo, sacado de un directorio propio, para que verifiques vos.
            </li>
            <li>
              <b>Probada con 71 casos reales</b> de estafas argentinas y mensajes legítimos, con
              99–100% de acierto. Los mensajes legítimos tienen que dar verde: si la herramienta
              desconfía de todo, la gente la ignora justo cuando importa.
            </li>
            <li>
              <b>Gratis, sin registro y no guarda nada.</b> Se instala en el celular y se le puede
              compartir un mensaje directo desde el menú Compartir.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
