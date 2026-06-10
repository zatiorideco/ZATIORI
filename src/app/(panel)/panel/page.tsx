import { auth } from "@/lib/auth";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const secciones = [
  { titulo: "Dashboard", detalle: "KPIs del negocio", fase: "Fase 4" },
  { titulo: "Clientes (CRM)", detalle: "Clientes y timeline de interacciones", fase: "Fase 4" },
  { titulo: "Pedidos", detalle: "Presupuestos, pedidos y PDFs", fase: "Fase 5" },
  { titulo: "Fábrica", detalle: "Tablero lista + pipeline kanban", fase: "Fase 5" },
  { titulo: "Catálogo", detalle: "ABM de espejos con fotos", fase: "Fase 4" },
  { titulo: "Proveedores", detalle: "Madera, espejos, insumos y herrajes", fase: "Fase 4" },
  { titulo: "Reseñas", detalle: "Aprobación y publicación", fase: "Fase 6" },
  { titulo: "Instagram", detalle: "Publicador con borradores", fase: "Fase 6" },
  { titulo: "Configuración", detalle: "Negocio, opciones y usuarios", fase: "Fase 6" },
];

export default async function PanelHome() {
  const session = await auth();

  return (
    <div>
      <h1 className="font-display text-3xl uppercase text-espresso">
        Hola, {session?.user.name}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Fase 1 lista: base de datos, autenticación con roles y design system.
        Las secciones se habilitan en las próximas fases.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {secciones.map((s) => (
          <Card key={s.titulo} className="opacity-70">
            <CardHeader>
              <CardTitle className="font-display text-lg uppercase tracking-wide">
                {s.titulo}
              </CardTitle>
              <CardDescription>
                {s.detalle} · <span className="text-madera">{s.fase}</span>
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
