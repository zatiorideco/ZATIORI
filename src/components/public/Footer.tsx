import Link from "next/link";
import { Instagram, MapPin, Phone } from "lucide-react";
import { NEGOCIO } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-espresso/20 bg-negro text-crema">
      <div className="container grid gap-10 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl tracking-widest">ZATIORI</p>
          <p className="mt-3 max-w-xs font-editorial text-sm text-arena">
            Espejos artesanales, piezas únicas con marcos de madera nueva y
            reciclada.
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-display tracking-wider text-madera">CONTACTO</p>
          <p className="flex items-center gap-2 text-arena">
            <MapPin className="h-4 w-4" /> {NEGOCIO.ciudad}
          </p>
          <a
            href={NEGOCIO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-arena hover:text-crema"
          >
            <Phone className="h-4 w-4" /> WhatsApp
          </a>
          <a
            href={NEGOCIO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-arena hover:text-crema"
          >
            <Instagram className="h-4 w-4" /> {NEGOCIO.instagramUsuario}
          </a>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-display tracking-wider text-madera">SECCIONES</p>
          <Link href="/catalogo" className="block text-arena hover:text-crema">
            Catálogo
          </Link>
          <Link href="/configurador" className="block text-arena hover:text-crema">
            Espejos a medida
          </Link>
          <Link href="/nosotros" className="block text-arena hover:text-crema">
            Nosotros
          </Link>
          <Link href="/terminos" className="block text-arena hover:text-crema">
            Términos
          </Link>
        </div>
      </div>
      <div className="border-t border-crema/10 py-4 text-center text-xs text-arena/70">
        © {new Date().getFullYear()} Zatiori · Bahía Blanca, Argentina
      </div>
    </footer>
  );
}
