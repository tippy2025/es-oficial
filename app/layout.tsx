import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
