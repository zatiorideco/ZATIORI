import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { EspejoFabricacion } from "@prisma/client";

/** Cliente interno: los pedidos a nombre de ZATIORI son espejos para stock. */
export function esClienteZatiori(nombre: string | null | undefined) {
  return (nombre ?? "").trim().toUpperCase() === "ZATIORI";
}

/** Crea (o reactiva) el EspejoCatalogo de un espejo terminado para stock. */
export async function pasarACatalogo(fab: EspejoFabricacion) {
  const specs = (fab.especificaciones ?? {}) as {
    madera?: string | null;
    patina?: string | null;
    tallado?: string | null;
  };

  if (fab.espejoCatalogoId) {
    return prisma.espejoCatalogo.update({
      where: { id: fab.espejoCatalogoId },
      data: {
        estado: "DISPONIBLE",
        esStock: true,
        fotos: fab.fotos.length ? fab.fotos : undefined,
      },
    });
  }

  const nombreBase = fab.descripcion.replace(/^ZAT-\d+\s*·\s*/, "").slice(0, 80);
  const base = slugify(nombreBase) || "espejo-stock";
  let slug = base;
  for (let i = 2; await prisma.espejoCatalogo.findUnique({ where: { slug } }); i++) {
    slug = `${base}-${i}`;
  }

  const espejo = await prisma.espejoCatalogo.create({
    data: {
      slug,
      nombre: nombreBase,
      alto: fab.alto,
      ancho: fab.ancho,
      madera: specs.madera ?? null,
      patina: specs.patina ?? null,
      tallado: specs.tallado ?? null,
      fotos: fab.fotos,
      precio: 0, // a definir desde el catálogo
      estado: "DISPONIBLE",
      esStock: true,
      publicadoWeb: false,
    },
  });
  await prisma.espejoFabricacion.update({
    where: { id: fab.id },
    data: { espejoCatalogoId: espejo.id },
  });
  return espejo;
}

/** Sincroniza el estado del Pedido cuando su espejo se mueve en el pipeline. */
export async function sincronizarPedidoDesdeFabrica(
  fab: EspejoFabricacion,
  nuevoEstado: string
) {
  if (!fab.pedidoItemId) return;
  const item = await prisma.itemPedido.findUnique({
    where: { id: fab.pedidoItemId },
    select: { pedidoId: true },
  });
  if (!item) return;

  const estadoPedido =
    nuevoEstado === "PARA_FABRICAR"
      ? "PARA_FABRICAR"
      : nuevoEstado === "EN_FABRICACION"
        ? "EN_FABRICACION"
        : nuevoEstado === "TERMINADO_CLIENTE"
          ? "PARA_ENTREGAR"
          : nuevoEstado === "TERMINADO_STOCK"
            ? "ENTREGADO" // stock propio: el pedido se archiva al cargarse en catálogo
            : null;
  if (!estadoPedido) return;

  await prisma.pedido.update({
    where: { id: item.pedidoId },
    data: { estado: estadoPedido },
  });
}
