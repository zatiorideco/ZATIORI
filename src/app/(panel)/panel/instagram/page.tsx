import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRol } from "@/lib/auth";
import { InstagramPublicador } from "@/components/panel/InstagramPublicador";

export const dynamic = "force-dynamic";

export default async function InstagramPage() {
  const session = await requireRol("ADMIN", "VENTAS");
  if (!session) redirect("/panel");

  const [publicaciones, espejos, config] = await Promise.all([
    prisma.publicacionInstagram.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { espejoCatalogo: { select: { nombre: true } } },
    }),
    prisma.espejoCatalogo.findMany({
      where: { fotos: { isEmpty: false } },
      orderBy: { updatedAt: "desc" },
      take: 100,
      select: { id: true, nombre: true, fotos: true, precio: true, ancho: true, alto: true },
    }),
    prisma.configuracion.findUnique({ where: { id: "singleton" } }),
  ]);

  return (
    <InstagramPublicador
      igConectado={!!config?.igTokenEncrypted && !!config?.igBusinessId}
      espejos={espejos.map((e) => ({
        id: e.id,
        nombre: e.nombre,
        fotos: e.fotos,
        precio: Number(e.precio),
        medidas: e.ancho && e.alto ? `${e.ancho} × ${e.alto} cm` : null,
      }))}
      publicaciones={publicaciones.map((p) => ({
        id: p.id,
        caption: p.caption,
        imagenes: p.imagenes,
        estado: p.estado,
        fechaProgramada: p.fechaProgramada?.toISOString() ?? null,
        igPermalink: p.igPermalink,
        errorMensaje: p.errorMensaje,
        espejo: p.espejoCatalogo?.nombre ?? null,
        creada: p.createdAt.toISOString(),
      }))}
    />
  );
}
