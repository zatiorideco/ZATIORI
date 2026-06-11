import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRol } from "@/lib/auth";
import { UsuariosLista } from "@/components/panel/UsuariosLista";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const session = await requireRol("ADMIN");
  if (!session) redirect("/panel");

  const usuarios = await prisma.usuario.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, nombre: true, email: true, rol: true, activo: true },
  });

  return <UsuariosLista usuarios={usuarios} miId={session.user.id} />;
}
