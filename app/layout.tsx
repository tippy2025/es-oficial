import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

// Montserrat es la tipografía del sistema de diseño del Estado argentino (Poncho):
// es la que el ojo asocia con "trámite oficial". La usamos en tamaños grandes
// para que sea cómoda de leer para adultos mayores.
const montserrat = Montserrat({
  variable: "--font-app",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const URL_BASE = "https://es-oficial.vercel.app";
const TITULO = "¿Es Oficial? — Antes de responder, preguntá";
const DESCRIPCION =
  "¿Te llegó un mensaje raro? Pegalo, subí la captura o mandá el audio y te decimos en segundos si tiene señales de estafa, qué hacer, y el teléfono real del organismo para verificar.";

export const metadata: Metadata = {
  metadataBase: new URL(URL_BASE),
  title: TITULO,
  description: DESCRIPCION,
  manifest: "/manifest.json",
  applicationName: "¿Es Oficial?",
  appleWebApp: { capable: true, title: "¿Es Oficial?", statusBarStyle: "black-translucent" },
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
  themeColor: "#232D4F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
