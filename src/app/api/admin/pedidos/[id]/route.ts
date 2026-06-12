import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard, errorJson } from "@/lib/api-auth";
import { esClienteZatiori } from "@/lib/fabrica";

const esquemaPatch = z.object({
  estado: z
    .enum([
      "SIN_PRESUPUESTAR",
      "PRESUPUESTADO",
      "PARA_FABRICAR",
      "EN_FABRICACION",
      "PARA_ENTREGAR",
      "ENTREGADO",
    ])
    .optional(),
  descuento: z.number().min(0).optional(),
  sena: z.number().min(0).optional(),
  presupuesto: z.number().min(0).optional(), // actualiza subtotal/total/saldo
  fechaEstimada: z.string().datetime().nullable().optional(),
  notas: z.string().max(2000).nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await guard("ADMIN", "VENTAS");
  if (error) return error;

  const parseado = esquemaPatch.safeParse(await req.json().catch(() => null));
  if (!parseado.success) return errorJson("Datos inválidos");
  const d = parseado.data;

  const actual = await prisma.pedido.findUnique({
    where: { id: params.id },
    include: {
      cliente: { select: { nombre: true } },
      items: {
        include: {
          fabricaciones: { select: { id: true, estado: true } },
          maderaOpcion: { select: { nombre: true } },
          patinaOpcion: { select: { nombre: true } },
          talladoOpcion: { select: { nombre: true } },
        },
      },
    },
  });
  if (!actual) return errorJson("Pedido no encontrado", 404);

  // Montos
  const subtotal = d.presupuesto ?? Number(actual.subtotal);
  const descuento = d.descuento ?? Number(actual.descuento);
  const sena = d.sena ?? Number(actual.sena);
  const total = Math.max(subtotal - descuento, 0);
  const saldo = Math.max(total - sena, 0);

  await prisma.pedido.update({
    where: { id: params.id },
    data: {
      ...(d.estado && { estado: d.estado }),
      subtotal,
      descuento,
      sena,
      total,
      saldo,
      ...(d.fechaEstimada !== undefined && {
        fechaEstimada: d.fechaEstimada ? new Date(d.fechaEstimada) : null,
      }),
      ...(d.notas !== undefined && { notas: d.notas }),
    },
  });
  if (d.presupuesto !== undefined && actual.items.length === 1) {
    await prisma.itemPedido.update({
      where: { id: actual.items[0].id },
      data: { precioUnitario: d.presupuesto },
    });
  }

  // ── Sincronización con el taller ──
  if (d.estado) {
    const esZatiori = esClienteZatiori(actual.cliente.nombre);
    const fabricaciones = actual.items.flatMap((i) =>
      i.fabricaciones.map((f) => ({ ...f, itemId: i.id }))
    );
    const noTerminadas = fabricaciones.filter(
      (f) => f.estado === "PARA_FABRICAR" || f.estado === "EN_FABRICACION"
    );

    if (d.estado === "PARA_FABRICAR") {
      // Entra al pipeline: crear orden para cada item que no tenga
      for (const item of actual.items) {
        if (item.fabricaciones.length === 0) {
          const extras = Array.isArray(item.extras)
            ? (item.extras as Array<{ nombre?: string }>)
                .map((e) => e.nombre)
                .filter((n): n is string => !!n)
            : [];
          await prisma.espejoFabricacion.create({
            data: {
              pedidoItemId: item.id,
              clienteId: actual.clienteId,
              estado: "PARA_FABRICAR",
              descripcion: `${actual.numero} · ${item.descripcion}`,
              alto: item.alto,
              ancho: item.ancho,
              especificaciones: {
                madera: item.maderaOpcion?.nombre ?? null,
                patina: item.patinaOpcion?.nombre ?? null,
                tallado: item.talladoOpcion?.nombre ?? null,
                extras,
              },
              prioridad: "MEDIA",
            },
          });
        }
      }
      if (noTerminadas.length) {
        await prisma.espejoFabricacion.updateMany({
          where: { id: { in: noTerminadas.map((f) => f.id) } },
          data: { estado: "PARA_FABRICAR", fechaFin: null },
        });
      }
    } else if (d.estado === "EN_FABRICACION" && noTerminadas.length) {
      await prisma.espejoFabricacion.updateMany({
        where: { id: { in: noTerminadas.map((f) => f.id) } },
        data: { estado: "EN_FABRICACION" },
      });
    } else if (d.estado === "PARA_ENTREGAR" || d.estado === "ENTREGADO") {
      if (noTerminadas.length) {
        await prisma.espejoFabricacion.updateMany({
          where: { id: { in: noTerminadas.map((f) => f.id) } },
          data: {
            estado: esZatiori ? "TERMINADO_STOCK" : "TERMINADO_CLIENTE",
            fechaFin: new Date(),
          },
        });
      }
      // Entregado: los espejos de catálogo vendidos quedan marcados
      if (d.estado === "ENTREGADO") {
        const espejoIds = actual.items
          .map((i) => i.espejoCatalogoId)
          .filter((x): x is string => !!x);
        if (espejoIds.length) {
          await prisma.espejoCatalogo.updateMany({
            where: { id: { in: espejoIds } },
            data: { estado: "VENDIDO" },
          });
        }
      }
    } else if (d.estado === "SIN_PRESUPUESTAR" || d.estado === "PRESUPUESTADO") {
      // Vuelve atrás: sacamos del pipeline lo que no se empezó
      const sinEmpezar = fabricaciones.filter((f) => f.estado === "PARA_FABRICAR");
      if (sinEmpezar.length) {
        await prisma.espejoFabricacion.deleteMany({
          where: { id: { in: sinEmpezar.map((f) => f.id) } },
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await guard("ADMIN", "VENTAS");
  if (error) return error;

  const pedido = await prisma.pedido.findUnique({
    where: { id: params.id },
    include: { items: { select: { id: true, espejoCatalogoId: true } } },
  });
  if (!pedido) return errorJson("Pedido no encontrado", 404);

  const itemIds = pedido.items.map((i) => i.id);
  const espejoIds = pedido.items
    .map((i) => i.espejoCatalogoId)
    .filter((x): x is string => !!x);

  await prisma.$transaction([
    // Se baja la operación: limpiamos las órdenes del taller
    prisma.espejoFabricacion.deleteMany({
      where: { pedidoItemId: { in: itemIds } },
    }),
    prisma.pedido.delete({ where: { id: params.id } }),
    // Los espejos de catálogo reservados vuelven a estar disponibles
    ...(espejoIds.length
      ? [
          prisma.espejoCatalogo.updateMany({
            where: { id: { in: espejoIds }, estado: "RESERVADO" },
            data: { estado: "DISPONIBLE" },
          }),
        ]
      : []),
  ]);

  return NextResponse.json({ ok: true });
}
