import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard, errorJson } from "@/lib/api-auth";

const esquemaProveedor = z.object({
  tipo: z.enum(["MADERA", "ESPEJO", "INSUMO", "HERRAJE"]),
  nombre: z.string().min(2).max(100),
  contacto: z.string().max(100).optional().or(z.literal("")),
  telefono: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  direccion: z.string().max(200).optional().or(z.literal("")),
  notas: z.string().max(2000).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const { error } = await guard("ADMIN");
  if (error) return error;

  const parseado = esquemaProveedor.safeParse(await req.json().catch(() => null));
  if (!parseado.success) return errorJson("Datos inválidos");

  const d = parseado.data;
  const proveedor = await prisma.proveedor.create({
    data: {
      tipo: d.tipo,
      nombre: d.nombre,
      contacto: d.contacto || null,
      telefono: d.telefono || null,
      email: d.email || null,
      direccion: d.direccion || null,
      notas: d.notas || null,
    },
  });
  return NextResponse.json(proveedor, { status: 201 });
}
