import { NextResponse } from "next/server";
import { guard, errorJson, withApi } from "@/lib/api-auth";
import { publicarEnInstagram } from "@/lib/instagram";

/** Publicación explícita e inmediata en Instagram. */
async function handlerPOST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await guard("ADMIN", "VENTAS");
  if (error) return error;

  try {
    const pub = await publicarEnInstagram(params.id);
    return NextResponse.json({
      ok: true,
      igPermalink: pub.igPermalink,
    });
  } catch (e) {
    return errorJson(
      e instanceof Error ? e.message : "No se pudo publicar.",
      502
    );
  }
}

export const POST = withApi(handlerPOST);
