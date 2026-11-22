import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type Variant = "primary" | "outline" | "light" | "text";

const base =
  "group inline-flex items-center justify-center gap-2 text-sm tracking-wide transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50";
const variants: Record<Variant, string> = {
  primary: "bg-espresso px-7 py-3.5 text-ivory hover:bg-cocoa",
  outline: "border border-espresso px-7 py-3.5 text-espresso hover:bg-espresso hover:text-ivory",
  light: "bg-ivory px-7 py-3.5 text-espresso hover:bg-nude",
  text: "text-espresso underline underline-offset-[6px] decoration-rose hover:text-rose-deep",
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
        <ArrowUpRight size={16} aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
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
