import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard, errorJson, withApi } from "@/lib/api-auth";
import { pasarACatalogo } from "@/lib/fabrica";
import { revalidarWebPublica } from "@/lib/revalidar";

/** "Pasar a catálogo": crea (o actualiza) el EspejoCatalogo de un espejo
 *  terminado para stock y lo deja vinculado. */
async function handlerPOST(
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
  revalidarWebPublica(espejo.slug);
  return NextResponse.json(espejo, { status: 201 });
}

export const POST = withApi(handlerPOST);
