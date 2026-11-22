import type { Metadata } from "next";
import { Banknote, CreditCard, Link2, QrCode } from "lucide-react";
import { Container, PageHero } from "@/components/shared/PageHero";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Formas de pagamento",
  alternates: { canonical: "/pagamentos" },
};

const methods = [
  { name: "Dinheiro", icon: Banknote },
  { name: "Pix", icon: QrCode },
  { name: "Cartão", icon: CreditCard },
  { name: "Link de pagamento", icon: Link2 },
] as const;

export default function PaymentsPage() {
  return (
    <>
      <PageHero eyebrow="Pagamento" title="Formas de pagamento" lead="Estas são as formas aceitas pelo Studio." />
      <Container className="py-16 md:py-24">
        <ul className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {methods.map(({ name, icon: Icon }) => (
            <li key={name} className="flex flex-col items-start gap-8 bg-ivory p-8">
              <Icon size={30} strokeWidth={1.2} className="text-rose-deep" aria-hidden />
              <span className="font-display text-3xl text-espresso">{name}</span>
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-xl text-sm text-cocoa">
          Dúvidas sobre pagamento? Fale com o Studio pelo SAC.
        </p>
        <div className="mt-6"><LinkButton href="/sac?tipo=financeiro" variant="outline">Dúvida financeira</LinkButton></div>
      </Container>
    </>
  );
}
