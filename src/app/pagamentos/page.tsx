import type { Metadata } from "next";
import { Banknote, CreditCard, Link2, QrCode } from "lucide-react";
import { Container, PageHero } from "@/components/shared/PageHero";
import { LinkButton } from "@/components/ui/Button";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("payments.title"), alternates: { canonical: "/pagamentos" } };
}

const methods = [
  { key: "cash", icon: Banknote },
  { key: "pix", icon: QrCode },
  { key: "card", icon: CreditCard },
  { key: "link", icon: Link2 },
] as const;

export default async function PaymentsPage() {
  const t = await getT();
  return (
    <>
      <PageHero eyebrow={t("payments.eyebrow")} title={t("payments.title")} lead={t("payments.lead")} />
      <Container className="py-16 md:py-24">
        <ul className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {methods.map(({ key, icon: Icon }) => (
            <li key={key} className="flex flex-col items-start gap-8 bg-ivory p-8">
              <Icon size={30} strokeWidth={1.2} className="text-rose-deep" aria-hidden />
              <span className="font-display text-3xl text-espresso">{t(`payments.${key}`)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-xl text-sm text-cocoa">
          {t("payments.help")}
        </p>
        <div className="mt-6"><LinkButton href="/sac?tipo=financeiro" variant="outline">{t("payments.cta")}</LinkButton></div>
      </Container>
    </>
  );
}
