import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard, errorJson, withApi } from "@/lib/api-auth";
import { slugify } from "@/lib/utils";
import { revalidarWebPublica } from "@/lib/revalidar";

const esquemaEspejo = z.object({
  nombre: z.string().min(2).max(100),
  descripcion: z.string().max(2000).optional().or(z.literal("")),
  tipoMarco: z.string().max(50).optional().or(z.literal("")),
  alto: z.number().int().min(1).max(500).nullable().optional(),
  ancho: z.number().int().min(1).max(500).nullable().optional(),
  madera: z.string().max(100).optional().or(z.literal("")),
  patina: z.string().max(100).optional().or(z.literal("")),
  tallado: z.string().max(100).optional().or(z.literal("")),
  proveedorId: z.string().nullable().optional(),
  precio: z.number().min(0),
  fotos: z.array(z.string()).max(12).default([]),
  estado: z.enum(["DISPONIBLE", "RESERVADO", "VENDIDO"]).default("DISPONIBLE"),
  esStock: z.boolean().default(true),
  publicadoWeb: z.boolean().default(false),
  destacado: z.boolean().default(false),
});

async function handlerPOST(req: Request) {
  const { error } = await guard("ADMIN", "VENTAS");
  if (error) return error;

  const parseado = esquemaEspejo.safeParse(await req.json().catch(() => null));
  if (!parseado.success) return errorJson("Datos inválidos");

  const d = parseado.data;

  // Slug único a partir del nombre
  const base = slugify(d.nombre) || "espejo";
  let slug = base;
  for (let i = 2; await prisma.espejoCatalogo.findUnique({ where: { slug } }); i++) {
    slug = `${base}-${i}`;
  }

  const espejo = await prisma.espejoCatalogo.create({
    data: {
      slug,
      nombre: d.nombre,
      descripcion: d.descripcion || null,
      tipoMarco: d.tipoMarco || null,
      alto: d.alto ?? null,
      ancho: d.ancho ?? null,
      madera: d.madera || null,
      patina: d.patina || null,
      tallado: d.tallado || null,
      proveedorId: d.proveedorId || null,
      precio: d.precio,
      fotos: d.fotos,
      estado: d.estado,
      esStock: d.esStock,
      publicadoWeb: d.publicadoWeb,
      destacado: d.destacado,
    },
  });
  revalidarWebPublica(espejo.slug);
  return NextResponse.json(espejo, { status: 201 });
}

export const POST = withApi(handlerPOST);
