import { prisma } from "@/lib/prisma";
import { descifrar } from "@/lib/crypto";
import { SITE_URL } from "@/lib/constants";

const GRAPH = "https://graph.facebook.com/v25.0";

type RespuestaGraph = { id?: string; permalink?: string; error?: { message: string } };

async function graph(
  path: string,
  params: Record<string, string>
): Promise<RespuestaGraph> {
  const res = await fetch(`${GRAPH}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  return res.json();
}

function urlAbsoluta(url: string) {
  return url.startsWith("/") ? `${SITE_URL}${url}` : url;
}

/** Publica una PublicacionInstagram vía Content Publishing API.
 *  Actualiza estado a PUBLICADA o ERROR según resultado. */
export async function publicarEnInstagram(publicacionId: string) {
  const pub = await prisma.publicacionInstagram.findUnique({
    where: { id: publicacionId },
  });
  if (!pub) throw new Error("Publicación no encontrada.");
  if (pub.estado === "PUBLICADA") throw new Error("Ya está publicada.");
  if (pub.imagenes.length === 0) throw new Error("La publicación no tiene imágenes.");

  const config = await prisma.configuracion.findUnique({
    where: { id: "singleton" },
  });
  if (!config?.igTokenEncrypted || !config.igBusinessId) {
    throw new Error(
      "Instagram no está conectado: cargá el token y el Business ID en Configuración."
    );
  }

  try {
    const token = descifrar(config.igTokenEncrypted);
    const imagenes = pub.imagenes.map(urlAbsoluta);

    let creationId: string;
    if (imagenes.length === 1) {
      const contenedor = await graph(`${config.igBusinessId}/media`, {
        image_url: imagenes[0],
        caption: pub.caption,
        access_token: token,
      });
      if (!contenedor.id) throw new Error(contenedor.error?.message ?? "Error creando el contenedor.");
      creationId = contenedor.id;
    } else {
      const hijos: string[] = [];
      for (const imagen of imagenes.slice(0, 10)) {
        const hijo = await graph(`${config.igBusinessId}/media`, {
          image_url: imagen,
          is_carousel_item: "true",
          access_token: token,
        });
        if (!hijo.id) throw new Error(hijo.error?.message ?? "Error en imagen del carrusel.");
        hijos.push(hijo.id);
      }
      const carrusel = await graph(`${config.igBusinessId}/media`, {
        media_type: "CAROUSEL",
        children: hijos.join(","),
        caption: pub.caption,
        access_token: token,
      });
      if (!carrusel.id) throw new Error(carrusel.error?.message ?? "Error creando el carrusel.");
      creationId = carrusel.id;
    }

    const publicado = await graph(`${config.igBusinessId}/media_publish`, {
      creation_id: creationId,
      access_token: token,
    });
    if (!publicado.id) throw new Error(publicado.error?.message ?? "Error al publicar.");

    // Permalink (best-effort)
    let permalink: string | null = null;
    try {
      const detalle = (await (
        await fetch(`${GRAPH}/${publicado.id}?fields=permalink&access_token=${token}`)
      ).json()) as RespuestaGraph;
      permalink = detalle.permalink ?? null;
    } catch {
      // sin permalink no pasa nada
    }

    return prisma.publicacionInstagram.update({
      where: { id: pub.id },
      data: {
        estado: "PUBLICADA",
        igMediaId: publicado.id,
        igPermalink: permalink,
        errorMensaje: null,
      },
    });
  } catch (e) {
    await prisma.publicacionInstagram.update({
      where: { id: pub.id },
      data: {
        estado: "ERROR",
        errorMensaje: e instanceof Error ? e.message : "Error desconocido",
      },
    });
    throw e;
  }
}
