import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { guard, errorJson, withApi } from "@/lib/api-auth";

const esquema = z
  .object({
    clienteId: z.string().optional(),
    clienteNuevo: z
      .object({
        nombre: z.string().min(2).max(100),
        telefono: z.string().max(30).optional().or(z.literal("")),
        email: z.string().email().optional().or(z.literal("")),
        ciudad: z.string().max(100).optional().or(z.literal("")),
      })
      .optional(),
    descripcion: z.string().min(3).max(500),
    alto: z.number().int().min(1).max(500).nullable().optional(),
    ancho: z.number().int().min(1).max(500).nullable().optional(),
    fechaEstimada: z.string().datetime().nullable().optional(),
    presupuesto: z.number().min(0).default(0),
    notas: z.string().max(2000).optional().or(z.literal("")),
    espejoCatalogoId: z.string().nullable().optional(),
  })
  .refine((d) => d.clienteId || d.clienteNuevo, {
    message: "Elegí un cliente o creá uno nuevo.",
  });

/** Alta manual de pedido desde el panel. */
async function handlerPOST(req: Request) {
  const { session, error } = await guard("ADMIN", "VENTAS");
  if (error) return error;

  const parseado = esquema.safeParse(await req.json().catch(() => null));
  if (!parseado.success) {
    return errorJson(parseado.error.issues[0]?.message ?? "Datos inválidos");
  }
  const d = parseado.data;

  const resultado = await prisma.$transaction(async (tx) => {
    // Cliente: existente o alta nueva (queda en la base de clientes)
    let clienteId = d.clienteId;
    if (!clienteId && d.clienteNuevo) {
      const c = await tx.cliente.create({
        data: {
          nombre: d.clienteNuevo.nombre,
          telefono: d.clienteNuevo.telefono || null,
          email: d.clienteNuevo.email || null,
          ciudad: d.clienteNuevo.ciudad || null,
          origen: "LOCAL",
        },
      });
      clienteId = c.id;
    }
    const cliente = await tx.cliente.findUnique({ where: { id: clienteId! } });
    if (!cliente) throw new Error("Cliente no encontrado.");

    const creado = await tx.pedido.create({
      data: {
        numero: `TMP-${randomUUID()}`,
        clienteId: cliente.id,
        estado: d.presupuesto > 0 ? "PRESUPUESTADO" : "SIN_PRESUPUESTAR",
        origen: "LOCAL",
        subtotal: d.presupuesto,
        total: d.presupuesto,
        saldo: d.presupuesto,
        fechaEstimada: d.fechaEstimada ? new Date(d.fechaEstimada) : null,
        notas: d.notas || null,
        usuarioId: session.user.id,
      },
    });
    const numero = `ZAT-${String(creado.numeroSeq).padStart(4, "0")}`;
    await tx.pedido.update({
      where: { id: creado.id },
      data: { numero },
    });

    await tx.itemPedido.create({
      data: {
        pedidoId: creado.id,
        espejoCatalogoId: d.espejoCatalogoId ?? null,
        descripcion: d.descripcion,
        alto: d.alto ?? null,
        ancho: d.ancho ?? null,
        cantidad: 1,
        precioUnitario: d.presupuesto,
      },
    });

    // Pedido sobre un espejo del catálogo: queda reservado
    if (d.espejoCatalogoId) {
      await tx.espejoCatalogo.update({
        where: { id: d.espejoCatalogoId },
        data: { estado: "RESERVADO" },
      });
    }

    await tx.interaccionCliente.create({
      data: {
        clienteId: cliente.id,
        tipo: "NOTA",
        contenido: `Pedido ${numero} creado desde el panel.`,
        usuarioId: session.user.id,
      },
    });

    return { id: creado.id, numero };
  });

  return NextResponse.json(resultado, { status: 201 });
}

export const POST = withApi(handlerPOST);
