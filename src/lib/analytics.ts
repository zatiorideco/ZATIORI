import { prisma } from "@/lib/prisma";

const TZ = "America/Argentina/Buenos_Aires";

// Provincias argentinas (ISO 3166-2) para mostrar "Bahía Blanca, Buenos Aires"
const PROVINCIAS: Record<string, string> = {
  A: "Salta", B: "Buenos Aires", C: "CABA", D: "San Luis", E: "Entre Ríos",
  F: "La Rioja", G: "Sgo. del Estero", H: "Chaco", J: "San Juan", K: "Catamarca",
  L: "La Pampa", M: "Mendoza", N: "Misiones", P: "Formosa", Q: "Neuquén",
  R: "Río Negro", S: "Santa Fe", T: "Tucumán", U: "Chubut", V: "T. del Fuego",
  W: "Corrientes", X: "Córdoba", Y: "Jujuy", Z: "Santa Cruz",
};

export type EstadisticasWeb = {
  visitas: { hoy: number; hoyUnicos: number; semana: number; semanaUnicos: number; mes: number; mesUnicos: number };
  porDia: Array<{ dia: string; etiqueta: string; visitas: number }>;
  paginas: Array<{ path: string; visitas: number }>;
  fuentes: Array<{ fuente: string; visitas: number }>;
  conversiones: {
    pedidosWeb: number;
    pedidosWebMonto: number;
    whatsapp: number;
    instagram: number;
    porFuente: Array<{ fuente: string; cantidad: number }>;
  };
  ciudades: Array<{ lugar: string; visitas: number }>;
};

/** Comienzo del día actual en Argentina (UTC-3), expresado en UTC. */
function inicioDiaAR(diasAtras = 0): Date {
  const ahoraAR = new Date(Date.now() - 3 * 3600 * 1000);
  return new Date(
    Date.UTC(
      ahoraAR.getUTCFullYear(),
      ahoraAR.getUTCMonth(),
      ahoraAR.getUTCDate() - diasAtras
    ) +
      3 * 3600 * 1000
  );
}

export async function getEstadisticasWeb(): Promise<EstadisticasWeb | null> {
  try {
    const hoy = inicioDiaAR();
    const hace7 = inicioDiaAR(6);
    const hace30 = inicioDiaAR(29);

    const [contadores, porDiaRaw, paginas, fuentes, convRaw, convFuente, ciudadesRaw] =
      await Promise.all([
        prisma.$queryRaw<
          Array<{
            hoy: bigint; hoy_u: bigint;
            semana: bigint; semana_u: bigint;
            mes: bigint; mes_u: bigint;
          }>
        >`
          SELECT
            count(*) FILTER (WHERE "createdAt" >= ${hoy}) as hoy,
            count(DISTINCT visitante) FILTER (WHERE "createdAt" >= ${hoy}) as hoy_u,
            count(*) FILTER (WHERE "createdAt" >= ${hace7}) as semana,
            count(DISTINCT visitante) FILTER (WHERE "createdAt" >= ${hace7}) as semana_u,
            count(*) as mes,
            count(DISTINCT visitante) as mes_u
          FROM "EventoWeb"
          WHERE tipo = 'PAGEVIEW' AND "createdAt" >= ${hace30}`,
        prisma.$queryRaw<Array<{ dia: string; visitas: bigint }>>`
          SELECT to_char("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${TZ}, 'YYYY-MM-DD') as dia,
                 count(*) as visitas
          FROM "EventoWeb"
          WHERE tipo = 'PAGEVIEW' AND "createdAt" >= ${hace7}
          GROUP BY 1 ORDER BY 1`,
        prisma.$queryRaw<Array<{ path: string; visitas: bigint }>>`
          SELECT path, count(*) as visitas FROM "EventoWeb"
          WHERE tipo = 'PAGEVIEW' AND "createdAt" >= ${hace30} AND path IS NOT NULL
          GROUP BY 1 ORDER BY 2 DESC LIMIT 6`,
        prisma.$queryRaw<Array<{ fuente: string; visitas: bigint }>>`
          SELECT fuente, count(*) as visitas FROM "EventoWeb"
          WHERE tipo = 'PAGEVIEW' AND "createdAt" >= ${hace30} AND fuente IS NOT NULL
          GROUP BY 1 ORDER BY 2 DESC LIMIT 6`,
        prisma.$queryRaw<
          Array<{ tipo: string; cantidad: bigint; monto: number | null }>
        >`
          SELECT tipo::text, count(*) as cantidad, sum(valor)::float as monto
          FROM "EventoWeb"
          WHERE tipo != 'PAGEVIEW' AND "createdAt" >= ${hace30}
          GROUP BY 1`,
        prisma.$queryRaw<Array<{ fuente: string; cantidad: bigint }>>`
          SELECT coalesce(v.fuente, 'directo') as fuente, count(*) as cantidad
          FROM "EventoWeb" e
          LEFT JOIN LATERAL (
            SELECT fuente FROM "EventoWeb"
            WHERE visitante = e.visitante AND tipo = 'PAGEVIEW' AND fuente != 'interno'
            ORDER BY "createdAt" DESC LIMIT 1
          ) v ON true
          WHERE e.tipo != 'PAGEVIEW' AND e."createdAt" >= ${hace30}
          GROUP BY 1 ORDER BY 2 DESC LIMIT 6`,
        prisma.$queryRaw<
          Array<{ ciudad: string; region: string | null; pais: string | null; visitas: bigint }>
        >`
          SELECT ciudad, region, pais, count(*) as visitas FROM "EventoWeb"
          WHERE tipo = 'PAGEVIEW' AND "createdAt" >= ${hace30} AND ciudad IS NOT NULL
          GROUP BY 1, 2, 3 ORDER BY 4 DESC LIMIT 10`,
      ]);

    const c0 = contadores[0];

    // Serie de 7 días completa (con días sin visitas en cero)
    const porDia: EstadisticasWeb["porDia"] = [];
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(inicioDiaAR(i).getTime());
      const clave = new Date(fecha.getTime() - 3 * 3600 * 1000)
        .toISOString()
        .slice(0, 10);
      const fila = porDiaRaw.find((d) => d.dia === clave);
      porDia.push({
        dia: clave,
        etiqueta: fecha.toLocaleDateString("es-AR", {
          weekday: "short",
          day: "numeric",
          timeZone: TZ,
        }),
        visitas: Number(fila?.visitas ?? 0),
      });
    }

    const conv = (tipo: string) =>
      convRaw.find((c) => c.tipo === tipo);

    return {
      visitas: {
        hoy: Number(c0?.hoy ?? 0),
        hoyUnicos: Number(c0?.hoy_u ?? 0),
        semana: Number(c0?.semana ?? 0),
        semanaUnicos: Number(c0?.semana_u ?? 0),
        mes: Number(c0?.mes ?? 0),
        mesUnicos: Number(c0?.mes_u ?? 0),
      },
      porDia,
      paginas: paginas.map((p) => ({ path: p.path, visitas: Number(p.visitas) })),
      fuentes: fuentes.map((f) => ({ fuente: f.fuente, visitas: Number(f.visitas) })),
      conversiones: {
        pedidosWeb: Number(conv("PEDIDO_WEB")?.cantidad ?? 0),
        pedidosWebMonto: conv("PEDIDO_WEB")?.monto ?? 0,
        whatsapp: Number(conv("WHATSAPP_CLICK")?.cantidad ?? 0),
        instagram: Number(conv("INSTAGRAM_CLICK")?.cantidad ?? 0),
        porFuente: convFuente.map((c) => ({
          fuente: c.fuente,
          cantidad: Number(c.cantidad),
        })),
      },
      ciudades: ciudadesRaw.map((c) => {
        const region =
          c.pais === "AR" && c.region
            ? PROVINCIAS[c.region] ?? c.region
            : c.pais && c.pais !== "AR"
              ? c.pais
              : null;
        return {
          lugar: region ? `${c.ciudad}, ${region}` : c.ciudad,
          visitas: Number(c.visitas),
        };
      }),
    };
  } catch {
    return null;
  }
}

export function etiquetaPath(path: string) {
  if (path === "/") return "Inicio";
  if (path === "/catalogo") return "Catálogo";
  if (path === "/configurador") return "Configurador";
  if (path === "/nosotros") return "Nosotros";
  if (path === "/terminos") return "Términos";
  if (path.startsWith("/catalogo/")) {
    const slug = path.replace("/catalogo/", "");
    return slug
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  }
  return path;
}
