import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type Variant = "primary" | "outline" | "light" | "soft" | "text";

/** Botões em pill: a forma é o sinal de "ação"; campos e cards usam raios menores. */
const base =
  "group inline-flex min-h-12 items-center justify-center gap-2 rounded-full text-sm font-medium tracking-wide transition duration-300 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100";
const variants: Record<Variant, string> = {
  primary: "bg-espresso px-7 py-3.5 text-ivory shadow-soft hover:bg-cocoa hover:shadow-lift",
  outline: "border border-cocoa/35 px-7 py-3.5 text-espresso hover:border-espresso hover:bg-espresso hover:text-ivory",
  light: "bg-ivory px-7 py-3.5 text-espresso hover:bg-nude",
  soft: "bg-nude/70 px-7 py-3.5 text-espresso hover:bg-nude",
  text: "rounded-md px-1 text-espresso underline decoration-rose underline-offset-[6px] hover:text-rose-deep",
};

export function buttonClass(variant: Variant = "primary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`.trim();
}

interface LinkButtonProps {
  href: string;
  variant?: Variant;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
  arrow?: boolean;
}

export function LinkButton({ href, variant = "primary", children, external, className, arrow }: LinkButtonProps) {
  const content = (
    <>
      {children}
      {arrow && (
        <ArrowUpRight size={16} aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" />
      )}
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClass(variant, className)}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {content}
    </Link>
  );
}
