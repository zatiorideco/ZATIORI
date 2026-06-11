import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard, errorJson } from "@/lib/api-auth";
import { slugify } from "@/lib/utils";

/** "Pasar a catálogo": crea (o actualiza) el EspejoCatalogo de un espejo
 *  terminado para stock y lo deja vinculado. */
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await guard("ADMIN", "VENTAS");
  if (error) return error;

  const fab = await prisma.espejoFabricacion.findUnique({
    where: { id: params.id },
  });
  if (!fab) return errorJson("No encontrado", 404);
  if (fab.estado !== "TERMINADO_STOCK") {
    return errorJson("Solo los espejos en Terminados Stock pasan a catálogo.");
  }

  const specs = (fab.especificaciones ?? {}) as {
    madera?: string | null;
    patina?: string | null;
    tallado?: string | null;
  };

  // Si ya está vinculado, actualizamos; si no, creamos
  if (fab.espejoCatalogoId) {
    const espejo = await prisma.espejoCatalogo.update({
      where: { id: fab.espejoCatalogoId },
      data: {
        estado: "DISPONIBLE",
        esStock: true,
        fotos: fab.fotos.length ? fab.fotos : undefined,
      },
    });
    return NextResponse.json(espejo);
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
  return NextResponse.json(espejo, { status: 201 });
}
