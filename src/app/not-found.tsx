import { Container } from "@/components/shared/PageHero";
import { LinkButton } from "@/components/ui/Button";
import { getT } from "@/i18n/server";

export default async function NotFound() {
  const t = await getT();
  return (
    <Container className="flex min-h-[60dvh] flex-col items-start justify-center gap-6 py-20">
      <p className="font-display text-8xl text-rose">404</p>
      <h1 className="text-4xl sm:text-5xl">{t("app.notFound.title")}</h1>
      <p className="max-w-md text-cocoa">{t("app.notFound.text")}</p>
      <div className="flex flex-wrap gap-4"><LinkButton href="/">{t("app.notFound.home")}</LinkButton><LinkButton href="/catalogo" variant="outline">{t("app.notFound.catalog")}</LinkButton></div>
    </Container>
  );
}
