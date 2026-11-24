import { Container } from "@/components/shared/PageHero";
import { getT } from "@/i18n/server";

export async function AuthShell({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) {
  const t = await getT();
  return (
    <Container className="grid min-h-[70dvh] items-center gap-8 py-10 sm:py-14 md:py-24 lg:grid-cols-2 lg:gap-12">
      <div className="hidden lg:block">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-rose-deep">{t("brand.line")}</p>
        <p className="mt-6 max-w-md font-display text-6xl leading-[1.02] text-espresso">{t("brand.sub")}</p>
      </div>
      <div className="mx-auto w-full max-w-md rounded-panel bg-ivory p-6 shadow-lift sm:p-8 md:p-10 lg:mx-0 lg:justify-self-end">
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        {lead && <p className="mt-3 text-sm text-cocoa">{lead}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </Container>
  );
}
