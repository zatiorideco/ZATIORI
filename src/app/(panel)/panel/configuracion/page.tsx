import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRol } from "@/lib/auth";
import { ConfiguracionForm } from "@/components/panel/ConfiguracionForm";
import { OpcionesAdmin } from "@/components/panel/OpcionesAdmin";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const session = await requireRol("ADMIN");
  if (!session) redirect("/panel");

  const [config, opciones] = await Promise.all([
    prisma.configuracion.findUnique({ where: { id: "singleton" } }),
    prisma.opcionConfigurador.findMany({
      orderBy: [{ tipo: "asc" }, { orden: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-10">
      <ConfiguracionForm
        config={{
          nombreNegocio: config?.nombreNegocio ?? "Zatiori",
          direccion: config?.direccion ?? "",
          whatsapp: config?.whatsapp ?? "",
          instagram: config?.instagram ?? "",
          emailContacto: config?.emailContacto ?? "",
          datosFiscales: config?.datosFiscales ?? "",
          horarios: config?.horarios ?? "",
          textoNosotros: config?.textoNosotros ?? "",
          textoTerminos: config?.textoTerminos ?? "",
          igBusinessId: config?.igBusinessId ?? "",
          fbPageId: config?.fbPageId ?? "",
          igConfigurado: !!config?.igTokenEncrypted,
        }}
      />
      <OpcionesAdmin
        opciones={opciones.map((o) => ({
          id: o.id,
          tipo: o.tipo,
          nombre: o.nombre,
          descripcion: o.descripcion,
          precioAdicional: Number(o.precioAdicional),
          orden: o.orden,
          activo: o.activo,
        }))}
      />
    </div>
  );
}
