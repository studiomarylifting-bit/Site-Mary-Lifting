import { Container } from "@/components/shared/PageHero";
import { getT } from "@/i18n/server";

export default async function Loading() {
  const t = await getT();
  return (
    <Container className="space-y-6 py-20" aria-busy="true">
      <div className="skeleton h-4 w-40" />
      <div className="skeleton h-16 w-full max-w-2xl" />
      <div className="skeleton h-5 w-full max-w-xl" />
      <span className="sr-only" role="status">{t("app.loading")}</span>
    </Container>
  );
}
