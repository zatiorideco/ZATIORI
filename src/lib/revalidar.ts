import { revalidatePath } from "next/cache";

/** Purga el caché ISR de la web pública después de un cambio desde el panel,
 *  para que publicar/editar un espejo o una reseña se vea al instante. */
export function revalidarWebPublica(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/catalogo");
  if (slug) revalidatePath(`/catalogo/${slug}`);
  revalidatePath("/nosotros");
  revalidatePath("/terminos");
}
