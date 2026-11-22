import Link from "next/link";
import { Instagram, MapPin } from "lucide-react";
import { getCategories } from "@/features/catalog/queries";
import { studio } from "@/lib/studio";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-espresso text-nude">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-4 md:px-10">
        <div className="md:col-span-1">
          <p className="font-display text-3xl text-ivory">Mary Lifting</p>
          <p className="pt-1 text-[0.65rem] uppercase tracking-[0.32em] text-rose">Lash e Estética</p>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-sand">
            Beleza que respeita sua essência.
          </p>
        </div>

        <nav aria-label="Procedimentos">
          <h2 className="text-xs font-medium uppercase tracking-[0.25em] text-rose">Procedimentos</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {getCategories().map((c) => (
              <li key={c.slug}>
                <Link className="hover:text-ivory" href={`/catalogo/${c.slug}`}>{c.title}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="O Studio">
          <h2 className="text-xs font-medium uppercase tracking-[0.25em] text-rose">O Studio</h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li><Link className="hover:text-ivory" href="/studio">Conheça o Studio</Link></li>
            <li><Link className="hover:text-ivory" href="/quem-sou">Quem sou</Link></li>
            <li><Link className="hover:text-ivory" href="/pagamentos">Formas de pagamento</Link></li>
            <li><Link className="hover:text-ivory" href="/avaliacoes">Avaliações do Google</Link></li>
            <li><Link className="hover:text-ivory" href="/feedback">Feedback das clientes</Link></li>
            <li><Link className="hover:text-ivory" href="/sac">SAC</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.25em] text-rose">Contato</h2>
          <address className="mt-5 space-y-3 text-sm not-italic">
            <p className="flex gap-2"><MapPin size={16} className="mt-1 shrink-0" aria-hidden />{studio.address.display}</p>
            <p>
              <a className="inline-flex items-center gap-2 hover:text-ivory" href={studio.instagram.url} target="_blank" rel="noopener noreferrer">
                <Instagram size={16} aria-hidden /> {studio.instagram.handle}
              </a>
            </p>
            <p>
              <a className="underline underline-offset-4 hover:text-ivory" href={studio.maps.gps} target="_blank" rel="noopener noreferrer">
                Abrir no GPS
              </a>
            </p>
          </address>
          <div className="mt-6 flex gap-4 text-sm">
            <Link className="hover:text-ivory" href="/entrar">Entrar</Link>
            <Link className="hover:text-ivory" href="/cadastro">Criar conta</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-cocoa">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-sand md:flex-row md:justify-between md:px-10">
          <p>© {new Date().getFullYear()} {studio.fullName}</p>
          <p className="flex gap-5">
            <Link className="hover:text-ivory" href="/privacidade">Política de privacidade</Link>
            <Link className="hover:text-ivory" href="/termos">Termos de uso</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
