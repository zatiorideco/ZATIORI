import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRol } from "@/lib/auth";
import { EspejoForm } from "@/components/panel/EspejoForm";

export const dynamic = "force-dynamic";

export default async function EditarEspejoPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireRol("ADMIN", "VENTAS");
  if (!session) redirect("/panel");

  const [espejo, proveedores] = await Promise.all([
    prisma.espejoCatalogo.findUnique({ where: { id: params.id } }),
    prisma.proveedor.findMany({
      where: { tipo: { in: ["MADERA", "ESPEJO"] } },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
  ]);
  if (!espejo) notFound();

  return (
    <EspejoForm
      esAdmin={session.user.rol === "ADMIN"}
      proveedores={proveedores}
      inicial={{
        id: espejo.id,
        nombre: espejo.nombre,
        descripcion: espejo.descripcion ?? "",
        tipoMarco: espejo.tipoMarco ?? "",
        alto: espejo.alto?.toString() ?? "",
        ancho: espejo.ancho?.toString() ?? "",
        madera: espejo.madera ?? "",
        patina: espejo.patina ?? "",
        tallado: espejo.tallado ?? "",
        proveedorId: espejo.proveedorId ?? "",
        precio: Number(espejo.precio).toString(),
        fotos: espejo.fotos,
        estado: espejo.estado,
        esStock: espejo.esStock,
        publicadoWeb: espejo.publicadoWeb,
        destacado: espejo.destacado,
      }}
    />
  );
}
