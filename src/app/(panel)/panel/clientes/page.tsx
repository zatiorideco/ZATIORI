import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRol } from "@/lib/auth";
import { ClientesLista } from "@/components/panel/ClientesLista";

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = await requireRol("ADMIN", "VENTAS");
  if (!session) redirect("/panel");

  const q = searchParams.q?.trim();
  const clientes = await prisma.cliente.findMany({
    where: q
      ? {
          OR: [
            { nombre: { contains: q, mode: "insensitive" } },
            { telefono: { contains: q } },
            { email: { contains: q, mode: "insensitive" } },
            { ciudad: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { _count: { select: { pedidos: true } } },
  });

  return (
    <ClientesLista
      clientes={clientes.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        telefono: c.telefono,
        email: c.email,
        ciudad: c.ciudad,
        origen: c.origen,
        pedidos: c._count.pedidos,
        creado: c.createdAt.toISOString(),
      }))}
      busqueda={q ?? ""}
    />
  );
}
