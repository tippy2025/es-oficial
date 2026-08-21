import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Fraunces } from "next/font/google";
import "./globals.css";

// Cuerpo: diseñada por el Braille Institute para máxima legibilidad (adultos mayores, baja visión).
const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Títulos: serif con carácter institucional y cálido, para que no se vea genérico.
const fraunces = Fraunces({
  variable: "--font-titulo",
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const URL_BASE = "https://es-oficial.vercel.app";
const TITULO = "¿Es Oficial? — Antes de responder, preguntá";
const DESCRIPCION =
  "¿Te llegó un mensaje raro? Pegalo o subí la captura y te decimos en segundos si tiene señales de estafa, qué hacer, y el teléfono real del organismo para verificar.";

export const metadata: Metadata = {
  metadataBase: new URL(URL_BASE),
  title: TITULO,
  description: DESCRIPCION,
  manifest: "/manifest.json",
  applicationName: "¿Es Oficial?",
  appleWebApp: { capable: true, title: "¿Es Oficial?", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: TITULO,
    description: DESCRIPCION,
    url: URL_BASE,
    siteName: "¿Es Oficial?",
    locale: "es_AR",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "¿Es Oficial? — Antes de responder, preguntá" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESCRIPCION,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b3d91",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={`${atkinson.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
