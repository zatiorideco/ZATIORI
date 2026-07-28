import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard, errorJson, withApi } from "@/lib/api-auth";
import { cifrar } from "@/lib/crypto";
import { revalidarWebPublica } from "@/lib/revalidar";

const esquema = z.object({
  nombreNegocio: z.string().min(1).max(100).optional(),
  direccion: z.string().max(200).nullable().optional(),
  whatsapp: z.string().max(30).nullable().optional(),
  instagram: z.string().max(100).nullable().optional(),
  emailContacto: z.string().email().nullable().optional().or(z.literal("").transform(() => null)),
  datosFiscales: z.string().max(500).nullable().optional(),
  textoNosotros: z.string().max(5000).nullable().optional(),
  textoTerminos: z.string().max(5000).nullable().optional(),
  horarios: z.string().max(300).nullable().optional(),
  // Instagram Graph API: el token llega plano y se guarda cifrado.
  igToken: z.string().max(500).optional(), // "" = borrar
  igBusinessId: z.string().max(50).nullable().optional(),
  fbPageId: z.string().max(50).nullable().optional(),
});

async function handlerPATCH(req: Request) {
  const { error } = await guard("ADMIN");
  if (error) return error;

  const parseado = esquema.safeParse(await req.json().catch(() => null));
  if (!parseado.success) return errorJson("Datos inválidos");
  const { igToken, ...resto } = parseado.data;

  let igTokenEncrypted: string | null | undefined;
  if (igToken !== undefined) {
    if (igToken === "") igTokenEncrypted = null;
    else {
      try {
        igTokenEncrypted = cifrar(igToken);
      } catch {
        return errorJson(
          "Falta IG_TOKEN_ENCRYPTION_KEY en el servidor: no se puede guardar el token.",
          503
        );
      }
    }
  }

  const config = await prisma.configuracion.upsert({
    where: { id: "singleton" },
    update: { ...resto, ...(igTokenEncrypted !== undefined && { igTokenEncrypted }) },
    create: {
      id: "singleton",
      ...Object.fromEntries(Object.entries(resto).filter(([, v]) => v !== undefined)),
      ...(igTokenEncrypted !== undefined && { igTokenEncrypted }),
    },
  });
  revalidarWebPublica();
  return NextResponse.json({ ok: true, igConfigurado: !!config.igTokenEncrypted });
}

export const PATCH = withApi(handlerPATCH);
