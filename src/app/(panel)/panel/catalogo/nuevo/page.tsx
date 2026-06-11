import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRol } from "@/lib/auth";
import { EspejoForm } from "@/components/panel/EspejoForm";

export const dynamic = "force-dynamic";

export default async function NuevoEspejoPage() {
  const session = await requireRol("ADMIN", "VENTAS");
  if (!session) redirect("/panel");

  const proveedores = await prisma.proveedor.findMany({
    where: { tipo: { in: ["MADERA", "ESPEJO"] } },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true },
  });

  return (
    <EspejoForm
      esAdmin={session.user.rol === "ADMIN"}
      proveedores={proveedores}
      inicial={{
        nombre: "",
        descripcion: "",
        tipoMarco: "",
        alto: "",
        ancho: "",
        madera: "",
        patina: "",
        tallado: "",
        proveedorId: "",
        precio: "",
        fotos: [],
        estado: "DISPONIBLE",
        esStock: true,
        publicadoWeb: false,
        destacado: false,
      }}
    />
  );
}
