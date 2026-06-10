import { NextResponse } from "next/server";
import { z } from "zod";
import { crearPedidoDesdeConfigurador } from "@/lib/pedidos";
import { notificarPedidoNuevo } from "@/lib/notificaciones";

const esquema = z
  .object({
    tamanoId: z.string().optional(),
    ancho: z.number().int().min(20).max(300).optional(),
    alto: z.number().int().min(20).max(300).optional(),
    maderaId: z.string().min(1),
    patinaId: z.string().min(1),
    talladoId: z.string().optional(),
    extrasIds: z.array(z.string()).max(10).default([]),
    contacto: z.object({
      nombre: z.string().min(2).max(100),
      whatsapp: z
        .string()
        .min(8)
        .max(20)
        .regex(/^[\d\s+\-()]+$/, "Teléfono inválido"),
      email: z.string().email().optional().or(z.literal("")),
      ciudad: z.string().max(100).optional(),
      notas: z.string().max(1000).optional(),
    }),
  })
  .refine((d) => d.tamanoId || (d.ancho && d.alto), {
    message: "Elegí un tamaño o ingresá las medidas.",
  });

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parseado = esquema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json(
      { error: parseado.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  try {
    const datos = parseado.data;
    const pedido = await crearPedidoDesdeConfigurador({
      ...datos,
      contacto: {
        ...datos.contacto,
        whatsapp: datos.contacto.whatsapp.replace(/[\s\-()]/g, ""),
        email: datos.contacto.email || undefined,
      },
    });
    await notificarPedidoNuevo(pedido, datos.contacto);
    return NextResponse.json(pedido, { status: 201 });
  } catch (e) {
    console.error("[configurador] error creando pedido:", e);
    return NextResponse.json(
      { error: "No pudimos crear el pedido. Probá de nuevo o escribinos por WhatsApp." },
      { status: 500 }
    );
  }
}
