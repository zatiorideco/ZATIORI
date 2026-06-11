import { prisma } from "@/lib/prisma";
import {
  ESPEJOS_FALLBACK,
  type EspejoPublico,
} from "@/lib/espejos-data";
import type { EspejoCatalogo } from "@prisma/client";

function aPublico(e: EspejoCatalogo): EspejoPublico {
  return {
    slug: e.slug,
    nombre: e.nombre,
    descripcion: e.descripcion,
    tipoMarco: e.tipoMarco,
    alto: e.alto,
    ancho: e.ancho,
    madera: e.madera,
    patina: e.patina,
    tallado: e.tallado,
    precio: Number(e.precio),
    fotos: e.fotos,
    estado: e.estado,
    destacado: e.destacado,
  };
}

/** Espejos publicados en la web. Si la DB no está disponible o está vacía,
 *  devuelve los datos de respaldo para que la web nunca quede en blanco. */
export async function getEspejosPublicados(): Promise<EspejoPublico[]> {
  try {
    const espejos = await prisma.espejoCatalogo.findMany({
      where: { publicadoWeb: true },
      orderBy: [{ destacado: "desc" }, { createdAt: "desc" }],
    });
    if (espejos.length > 0) return espejos.map(aPublico);
  } catch {
    // DB no configurada todavía: usamos el respaldo
  }
  return ESPEJOS_FALLBACK;
}

export async function getEspejoPorSlug(
  slug: string
): Promise<EspejoPublico | null> {
  try {
    const e = await prisma.espejoCatalogo.findUnique({ where: { slug } });
    if (e && e.publicadoWeb) return aPublico(e);
    if (e) return null;
  } catch {
    // DB no configurada todavía
  }
  return ESPEJOS_FALLBACK.find((e) => e.slug === slug) ?? null;
}

export async function getDestacados(): Promise<EspejoPublico[]> {
  const todos = await getEspejosPublicados();
  return todos.filter((e) => e.destacado).slice(0, 6);
}

export async function getResenasPublicadas() {
  try {
    return await prisma.resena.findMany({
      where: { aprobada: true, publicadaWeb: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, nombre: true, rating: true, texto: true, fotos: true },
    });
  } catch {
    return [];
  }
}

export async function getTextosNegocio() {
  try {
    const config = await prisma.configuracion.findUnique({
      where: { id: "singleton" },
    });
    if (config) return config;
  } catch {
    // DB no configurada todavía
  }
  return null;
}
