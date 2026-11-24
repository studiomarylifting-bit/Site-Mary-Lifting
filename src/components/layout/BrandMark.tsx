import Image from "next/image";

/** Flor da marca ao lado do nome. Duas versões (clara/escura) trocadas por CSS conforme o tema. */
export function BrandMark({ className = "h-9 w-6 md:h-11 md:w-[1.85rem]" }: { className?: string }) {
  return (
    <span aria-hidden className={`relative inline-block shrink-0 ${className}`}>
      <Image src="/brand/logo-light.png" alt="" width={171} height={256} priority className="brand-light h-full w-full object-contain" />
      <Image src="/brand/logo-dark.png" alt="" width={171} height={256} priority className="brand-dark h-full w-full object-contain" />
    </span>
  );
}
