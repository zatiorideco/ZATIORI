"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  Hammer,
  FileText,
  Star,
  Instagram,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Rol } from "@prisma/client";

type Item = {
  href: string;
  label: string;
  icono: React.ComponentType<{ className?: string }>;
  roles: Rol[];
  proximamente?: string;
};

const items: Item[] = [
  { href: "/panel", label: "Dashboard", icono: LayoutDashboard, roles: ["ADMIN", "VENTAS"] },
  { href: "/panel/clientes", label: "Clientes", icono: Users, roles: ["ADMIN", "VENTAS"] },
  { href: "/panel/catalogo", label: "Catálogo", icono: Package, roles: ["ADMIN", "VENTAS"] },
  { href: "/panel/proveedores", label: "Proveedores", icono: Truck, roles: ["ADMIN"] },
  { href: "/panel/pedidos", label: "Pedidos", icono: FileText, roles: ["ADMIN", "VENTAS", "FABRICA"] },
  { href: "/panel/fabrica", label: "Fábrica", icono: Hammer, roles: ["ADMIN", "VENTAS", "FABRICA"] },
  { href: "/panel/resenas", label: "Reseñas", icono: Star, roles: ["ADMIN", "VENTAS"], proximamente: "Fase 6" },
  { href: "/panel/instagram", label: "Instagram", icono: Instagram, roles: ["ADMIN", "VENTAS"], proximamente: "Fase 6" },
  { href: "/panel/configuracion", label: "Configuración", icono: Settings, roles: ["ADMIN"], proximamente: "Fase 6" },
];

export function PanelNav({ rol }: { rol: Rol }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto py-2 md:flex-col md:gap-0.5 md:overflow-visible md:py-0">
      {items
        .filter((i) => i.roles.includes(rol))
        .map((i) => {
          const activo =
            i.href === "/panel"
              ? pathname === "/panel"
              : pathname.startsWith(i.href);
          const deshabilitado = !!i.proximamente;
          return (
            <Link
              key={i.href}
              href={deshabilitado ? "#" : i.href}
              aria-disabled={deshabilitado}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                activo
                  ? "bg-espresso text-crema"
                  : deshabilitado
                    ? "cursor-default text-muted-foreground/50"
                    : "text-espresso hover:bg-arena/60"
              )}
            >
              <i.icono className="h-4 w-4" />
              {i.label}
              {i.proximamente && (
                <span className="ml-auto rounded bg-arena px-1.5 py-0.5 text-[10px] uppercase text-espresso/60">
                  {i.proximamente}
                </span>
              )}
            </Link>
          );
        })}
    </nav>
  );
}
