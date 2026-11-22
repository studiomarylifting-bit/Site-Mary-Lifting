import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getSiteUrl } from "@/lib/env";
import { studio } from "@/lib/studio";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const sans = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${studio.name} · Lash e Estética — Embu-Guaçu`,
    template: `%s · ${studio.name}`,
  },
  description:
    "Beleza que respeita sua essência. Extensão de cílios, brow lamination, design de sobrancelhas, depilação facial e cuidados para os lábios em Embu-Guaçu — SP.",
  openGraph: { type: "website", locale: "pt_BR", siteName: studio.fullName },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#faf6f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
        <SiteHeader />
        <main id="conteudo" className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
