import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";

// Tipografía diseñada por el Braille Institute para máxima legibilidad (adultos mayores, baja visión).
const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "¿Es Oficial? — Antes de responder, preguntá",
  description:
    "¿Te llegó un mensaje raro? Pegalo o subí la captura y te decimos en segundos si tiene señales de estafa y qué hacer. Pensado para proteger a nuestros mayores.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "¿Es Oficial?", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
  openGraph: {
    title: "¿Es Oficial? — Antes de responder, preguntá",
    description:
      "Verificador de estafas con IA. Pegá el mensaje sospechoso o compartí la captura desde WhatsApp.",
    locale: "es_AR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b3d91",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={`${atkinson.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
