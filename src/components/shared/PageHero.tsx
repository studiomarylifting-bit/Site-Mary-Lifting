export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-rose-deep">{children}</p>;
}

/** Cabeçalho padrão das páginas internas. */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-b-[2rem] bg-blush/70 md:rounded-b-[3.5rem]">
      <div className="mx-auto max-w-7xl px-5 pb-14 pt-14 md:px-10 md:pb-20 md:pt-24">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="rise mt-4 max-w-4xl text-5xl md:text-7xl">{title}</h1>
        {lead && <p className="rise rise-2 mt-6 max-w-2xl text-lg leading-relaxed text-cocoa md:text-xl">{lead}</p>}
        {children && <div className="rise rise-3 mt-8">{children}</div>}
      </div>
    </section>
  );
}

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-7xl px-5 md:px-10 ${className}`}>{children}</div>;
}
