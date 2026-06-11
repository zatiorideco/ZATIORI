import { NextResponse } from "next/server";
import { guard, errorJson } from "@/lib/api-auth";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(req: Request) {
  const { error } = await guard("ADMIN", "VENTAS");
  if (error) return error;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return errorJson(
      "Falta configurar el almacenamiento de fotos (BLOB_READ_WRITE_TOKEN). Mientras tanto podés pegar una URL de imagen.",
      503
    );
  }

  const formData = await req.formData().catch(() => null);
  const archivo = formData?.get("file");
  if (!archivo || !(archivo instanceof File)) {
    return errorJson("No llegó ningún archivo.");
  }
  if (!TIPOS.includes(archivo.type)) {
    return errorJson("Formato no soportado (JPG, PNG, WebP o AVIF).");
  }
  if (archivo.size > MAX_BYTES) {
    return errorJson("La foto no puede superar los 8 MB.");
  }

  const { put } = await import("@vercel/blob");
  const blob = await put(`espejos/${archivo.name}`, archivo, {
    access: "public",
    addRandomSuffix: true,
  });

  return NextResponse.json({ url: blob.url }, { status: 201 });
}
