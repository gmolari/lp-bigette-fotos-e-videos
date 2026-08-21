import { MapPin, Phone } from "lucide-react";
import { IconeInstagram } from "@/components/ui/icons";
import { site } from "@/config/site";
import { whatsappDisplay } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="relative z-1 border-t border-line bg-bg py-14 text-center">
      <div className="container-lp">
        <p className="mb-4 font-display text-[21px]">
          {site.shortName} <span className="text-accent">Fotos e Vídeos</span>
        </p>

        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted">
          <li>
            <a
              href={`https://instagram.com/${site.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="sublinha inline-flex items-center gap-2 transition-colors duration-300 hover:text-lilas-200"
            >
              <IconeInstagram />@
              {site.instagram}
            </a>
          </li>
          <li className="inline-flex items-center gap-2">
            <MapPin size={15} strokeWidth={1.7} aria-hidden="true" className="text-accent/70" />
            {site.region}
          </li>
          <li className="inline-flex items-center gap-2">
            <Phone size={15} strokeWidth={1.7} aria-hidden="true" className="text-accent/70" />
            {whatsappDisplay()}
          </li>
        </ul>

        <p className="mt-6 text-xs text-muted/55">
          © {new Date().getFullYear()} {site.legalName}. Todas as imagens são de
          autoria própria e protegidas por direitos autorais.
        </p>
      </div>
    </footer>
  );
}
