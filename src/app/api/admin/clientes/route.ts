import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard, errorJson, withApi } from "@/lib/api-auth";

const esquemaCliente = z.object({
  nombre: z.string().min(2).max(100),
  telefono: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  direccion: z.string().max(200).optional().or(z.literal("")),
  ciudad: z.string().max(100).optional().or(z.literal("")),
  origen: z.enum(["WEB", "INSTAGRAM", "LOCAL", "REFERIDO", "WHATSAPP"]).default("LOCAL"),
  notas: z.string().max(2000).optional().or(z.literal("")),
});

/** Buscador de clientes (para el alta de pedidos). */
async function handlerGET(req: Request) {
  const { error } = await guard("ADMIN", "VENTAS");
  if (error) return error;

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  const clientes = await prisma.cliente.findMany({
    where: q
      ? {
          OR: [
            { nombre: { contains: q, mode: "insensitive" } },
            { telefono: { contains: q } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    take: 10,
    select: { id: true, nombre: true, telefono: true, ciudad: true },
  });
  return NextResponse.json(clientes);
}

async function handlerPOST(req: Request) {
  const { error } = await guard("ADMIN", "VENTAS");
  if (error) return error;

  const parseado = esquemaCliente.safeParse(await req.json().catch(() => null));
  if (!parseado.success) return errorJson("Datos inválidos");

  const d = parseado.data;
  const cliente = await prisma.cliente.create({
    data: {
      nombre: d.nombre,
      telefono: d.telefono || null,
      email: d.email || null,
      direccion: d.direccion || null,
      ciudad: d.ciudad || null,
      origen: d.origen,
      notas: d.notas || null,
    },
  });
  return NextResponse.json(cliente, { status: 201 });
}

export const GET = withApi(handlerGET);
export const POST = withApi(handlerPOST);
