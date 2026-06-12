import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard, errorJson } from "@/lib/api-auth";
import { pasarACatalogo } from "@/lib/fabrica";

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

  const espejo = await pasarACatalogo(fab);
  return NextResponse.json(espejo, { status: 201 });
}
