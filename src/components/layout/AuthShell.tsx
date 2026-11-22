import { Container } from "@/components/shared/PageHero";

export function AuthShell({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) {
  return (
    <Container className="grid min-h-[70dvh] items-center gap-12 py-14 md:py-24 lg:grid-cols-2">
      <div className="hidden lg:block">
        <p className="text-[0.7rem] uppercase tracking-[0.34em] text-rose-deep">Mary Lifting · Lash e Estética</p>
        <p className="mt-6 max-w-md font-display text-6xl leading-[1.02] text-espresso">
          Seu próximo cuidado começa aqui.
        </p>
      </div>
      <div className="w-full max-w-md border border-line bg-ivory p-8 md:p-10 lg:justify-self-end">
        <h1 className="text-4xl">{title}</h1>
        {lead && <p className="mt-3 text-sm text-cocoa">{lead}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </Container>
  );
}
