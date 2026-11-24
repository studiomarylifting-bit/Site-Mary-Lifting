import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getSiteUrl } from "@/lib/env";
import { I18nProvider } from "@/i18n/client";
import { localeMeta } from "@/i18n/config";
import { dictionary } from "@/i18n/messages";
import { getT } from "@/i18n/server";
import { themeInitScript } from "@/components/layout/theme-script";
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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: `${studio.name} · ${t("meta.title")}`,
      template: `%s · ${studio.name}`,
    },
    description: t("meta.description"),
    openGraph: { type: "website", locale: localeMeta[t.locale].og, siteName: studio.fullName },
    robots: { index: true, follow: true },
    // Favicon que acompanha o tema do navegador (aba clara ou escura).
    icons: {
      icon: [
        { url: "/brand/icon-light.png", type: "image/png", media: "(prefers-color-scheme: light)" },
        { url: "/brand/icon-dark.png", type: "image/png", media: "(prefers-color-scheme: dark)" },
      ],
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6f0" },
    { media: "(prefers-color-scheme: dark)", color: "#16100d" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  const locale = t.locale;
  return (
    // suppressHydrationWarning: o script do tema altera data-theme antes da hidratação.
    <html lang={localeMeta[locale].htmlLang} className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <I18nProvider locale={locale} messages={dictionary[locale]}>
          <a href="#conteudo" className="skip-link">{t("skip")}</a>
          <SiteHeader />
          <main id="conteudo" className="flex-1">{children}</main>
          <SiteFooter />
        </I18nProvider>
      </body>
    </html>
  );
}
