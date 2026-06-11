import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorJson } from "@/lib/api-auth";

const MAX_BYTES = 8 * 1024 * 1024;
const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** Subida pública de foto para una reseña pendiente (validada por token). */
export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  const resena = await prisma.resena.findUnique({
    where: { token: params.token },
  });
  if (!resena || resena.texto !== "") {
    return errorJson("Link de reseña inválido.", 404);
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return errorJson("La subida de fotos no está disponible.", 503);
  }

  const formData = await req.formData().catch(() => null);
  const archivo = formData?.get("file");
  if (!archivo || !(archivo instanceof File)) return errorJson("No llegó ningún archivo.");
  if (!TIPOS.includes(archivo.type)) return errorJson("Formato no soportado (JPG, PNG o WebP).");
  if (archivo.size > MAX_BYTES) return errorJson("La foto no puede superar los 8 MB.");

  const { put } = await import("@vercel/blob");
  const blob = await put(`resenas/${archivo.name}`, archivo, {
    access: "public",
    addRandomSuffix: true,
  });
  return NextResponse.json({ url: blob.url }, { status: 201 });
}
