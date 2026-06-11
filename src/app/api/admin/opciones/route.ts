import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard, errorJson } from "@/lib/api-auth";

const esquema = z.object({
  tipo: z.enum(["MADERA", "PATINA", "TALLADO", "TAMANO", "EXTRA"]),
  nombre: z.string().min(1).max(100),
  descripcion: z.string().max(300).optional().or(z.literal("")),
  precioAdicional: z.number().min(0).default(0),
  orden: z.number().int().min(0).default(0),
});

export async function POST(req: Request) {
  const { error } = await guard("ADMIN");
  if (error) return error;

  const parseado = esquema.safeParse(await req.json().catch(() => null));
  if (!parseado.success) return errorJson("Datos inválidos");
  const d = parseado.data;

  const opcion = await prisma.opcionConfigurador.create({
    data: {
      tipo: d.tipo,
      nombre: d.nombre,
      descripcion: d.descripcion || null,
      precioAdicional: d.precioAdicional,
      orden: d.orden,
    },
  });
  return NextResponse.json(opcion, { status: 201 });
}
