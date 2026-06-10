"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/configurador", label: "A medida" },
  { href: "/nosotros", label: "Nosotros" },
];

export function Navbar() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-arena bg-crema/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-2xl tracking-widest text-espresso">
          ZATIORI
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm uppercase tracking-wider transition-colors hover:text-madera",
                pathname === l.href ? "text-madera" : "text-espresso"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          className="md:hidden"
          onClick={() => setAbierto(!abierto)}
          aria-label="Abrir menú"
        >
          {abierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {abierto && (
        <nav className="border-t border-arena bg-crema md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setAbierto(false)}
              className="block px-6 py-3 text-sm uppercase tracking-wider text-espresso hover:bg-arena/50"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
