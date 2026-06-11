import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRol } from "@/lib/auth";
import { ProveedoresLista } from "@/components/panel/ProveedoresLista";

export const dynamic = "force-dynamic";

export default async function ProveedoresPage() {
  const session = await requireRol("ADMIN");
  if (!session) redirect("/panel");

  const proveedores = await prisma.proveedor.findMany({
    orderBy: [{ tipo: "asc" }, { nombre: "asc" }],
  });

  return (
    <ProveedoresLista
      proveedores={proveedores.map((p) => ({
        id: p.id,
        tipo: p.tipo,
        nombre: p.nombre,
        contacto: p.contacto,
        telefono: p.telefono,
        email: p.email,
        direccion: p.direccion,
        notas: p.notas,
      }))}
    />
  );
}
