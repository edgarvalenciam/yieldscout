import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const arimo = localFont({
  src: [
    {
      path: "../fonts/arimo/Arimo-VariableFont_wght.ttf",
      style: "normal",
    },
    {
      path: "../fonts/arimo/Arimo-Italic-VariableFont_wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-arimo",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Redito — DeFi vs CETES y Letras",
    template: "%s · Redito",
  },
  description:
    "Compara APY de stablecoins en protocolos DeFi con CETES (México) y Letras del Tesoro (España). Montos en MXN, EUR o USD.",
  openGraph: {
    title: "Redito — Compara rendimientos DeFi vs CETES y Letras",
    description:
      "Tabla en vivo con datos de DeFiLlama, referencias soberanas y calculadora por capital.",
    locale: "es_MX",
    type: "website",
    siteName: "Redito",
  },
  twitter: {
    card: "summary_large_image",
    title: "Redito — DeFi vs CETES y Letras",
    description:
      "Compara rendimientos en stablecoins con referencias de deuda soberana en MXN, EUR y USD.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${arimo.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white font-sans">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
