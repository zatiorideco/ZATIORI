import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const EXTENSION_POR_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/** Nombre seguro para subir a blob storage: base slugificada + extensión
 *  derivada del MIME type (nunca de lo que mande el cliente). */
export function nombreArchivoSeguro(nombreOriginal: string, mime: string) {
  const base = slugify(nombreOriginal.replace(/\.[^.]*$/, "")) || "foto";
  const ext = EXTENSION_POR_MIME[mime] ?? "bin";
  return `${base.slice(0, 80)}.${ext}`;
}

export function fechaAR(fecha: Date | string) {
  return new Date(fecha).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

/** Link de WhatsApp (wa.me): limpia el teléfono, antepone 54 si falta y
 *  codifica el mensaje. Devuelve null si no hay teléfono. */
export function waLink(
  telefono: string | null | undefined,
  mensaje?: string
): string | null {
  const tel = (telefono ?? "").replace(/\D/g, "");
  if (!tel) return null;
  const numero = tel.startsWith("54") ? tel : `54${tel}`;
  return `https://wa.me/${numero}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ""}`;
}

export function formatARS(valor: number | string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(valor));
}
