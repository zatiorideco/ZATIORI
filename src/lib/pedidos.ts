import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import type { OpcionConfigurador } from "@prisma/client";

/** Estimación para medidas fuera de los tamaños estándar.
 *  Es un precio orientativo: el definitivo lo ajusta el taller al confirmar. */
export const PRECIO_M2_BASE = 160000;
export const PRECIO_MINIMO_BASE = 100000;

export function precioBaseMedidas(anchoCm: number, altoCm: number) {
  const m2 = (anchoCm / 100) * (altoCm / 100);
  const precio = Math.round((m2 * PRECIO_M2_BASE) / 1000) * 1000;
  return Math.max(precio, PRECIO_MINIMO_BASE);
}

export type DatosConfigurador = {
  tamanoId?: string;
  ancho?: number; // cm, para "A medida"
  alto?: number; // cm
  maderaId: string;
  patinaId: string;
  talladoId?: string;
  extrasIds: string[];
  contacto: {
    nombre: string;
    whatsapp: string;
    email?: string;
    ciudad?: string;
    notas?: string;
  };
};

export type ResultadoPedido = {
  numero: string;
  total: number;
  descripcion: string;
};

function nombreOpcion(o: OpcionConfigurador | null | undefined) {
  return o?.nombre ?? null;
}

/** Crea Cliente (o lo reutiliza por teléfono/email) + Pedido + ItemPedido +
 *  EspejoFabricacion en PARA_FABRICAR, todo en una transacción. */
export async function crearPedidoDesdeConfigurador(
  datos: DatosConfigurador
): Promise<ResultadoPedido> {
  const ids = [
    datos.tamanoId,
    datos.maderaId,
    datos.patinaId,
    datos.talladoId,
    ...datos.extrasIds,
  ].filter((x): x is string => !!x);

  const opciones = await prisma.opcionConfigurador.findMany({
    where: { id: { in: ids }, activo: true },
  });
  const porId = new Map(opciones.map((o) => [o.id, o]));

  const tamano = datos.tamanoId ? porId.get(datos.tamanoId) : undefined;
  const madera = porId.get(datos.maderaId);
  const patina = porId.get(datos.patinaId);
  const tallado = datos.talladoId ? porId.get(datos.talladoId) : undefined;
  const extras = datos.extrasIds
    .map((id) => porId.get(id))
    .filter((o): o is OpcionConfigurador => !!o);

  if (!madera || !patina) {
    throw new Error("Opciones de madera o pátina inválidas.");
  }

  // Medidas: del tamaño estándar ("80 × 120 cm") o custom
  let ancho = datos.ancho ?? null;
  let alto = datos.alto ?? null;
  if (tamano) {
    const match = tamano.nombre.match(/(\d+)\s*×\s*(\d+)/);
    if (match) {
      ancho = parseInt(match[1], 10);
      alto = parseInt(match[2], 10);
    }
  }

  // Precio: base (tamaño estándar o estimación por m²) + adicionales
  const base =
    tamano && Number(tamano.precioAdicional) > 0
      ? Number(tamano.precioAdicional)
      : ancho && alto
        ? precioBaseMedidas(ancho, alto)
        : PRECIO_MINIMO_BASE;
  const total =
    base +
    Number(madera.precioAdicional) +
    Number(patina.precioAdicional) +
    Number(tallado?.precioAdicional ?? 0) +
    extras.reduce((sum, e) => sum + Number(e.precioAdicional), 0);

  const medidasTxt = ancho && alto ? `${ancho} × ${alto} cm` : "a definir";
  const descripcion = `Espejo a medida ${medidasTxt} — ${madera.nombre}, pátina ${patina.nombre}${
    tallado && tallado.precioAdicional.toString() !== "0"
      ? `, ${tallado.nombre.toLowerCase()}`
      : ""
  }`;

  const c = datos.contacto;

  const numero = await prisma.$transaction(async (tx) => {
    // Cliente: reutilizamos si ya existe por teléfono o email
    const existente = await tx.cliente.findFirst({
      where: {
        OR: [
          { telefono: c.whatsapp },
          ...(c.email ? [{ email: c.email }] : []),
        ],
      },
    });
    const cliente =
      existente ??
      (await tx.cliente.create({
        data: {
          nombre: c.nombre,
          telefono: c.whatsapp,
          email: c.email || null,
          ciudad: c.ciudad || null,
          origen: "WEB",
        },
      }));

    // Pedido con número ZAT-0001 sobre la secuencia autoincremental
    const creado = await tx.pedido.create({
      data: {
        numero: `TMP-${randomUUID()}`,
        clienteId: cliente.id,
        estado: "PRESUPUESTO",
        origen: "WEB",
        subtotal: total,
        total,
        saldo: total,
        notas: c.notas || null,
      },
    });
    const numeroFinal = `ZAT-${String(creado.numeroSeq).padStart(4, "0")}`;
    await tx.pedido.update({
      where: { id: creado.id },
      data: { numero: numeroFinal },
    });

    const item = await tx.itemPedido.create({
      data: {
        pedidoId: creado.id,
        descripcion,
        ancho,
        alto,
        maderaOpcionId: madera.id,
        patinaOpcionId: patina.id,
        talladoOpcionId: tallado?.id ?? null,
        extras: extras.map((e) => ({
          opcionId: e.id,
          nombre: e.nombre,
          precio: Number(e.precioAdicional),
        })),
        cantidad: 1,
        precioUnitario: total,
        notas: c.notas || null,
      },
    });

    // Registro de fábrica: entra directo como PARA_FABRICAR con cliente vinculado
    await tx.espejoFabricacion.create({
      data: {
        pedidoItemId: item.id,
        clienteId: cliente.id,
        estado: "PARA_FABRICAR",
        descripcion: `${numeroFinal} · ${descripcion}`,
        ancho,
        alto,
        especificaciones: {
          madera: nombreOpcion(madera),
          patina: nombreOpcion(patina),
          tallado: nombreOpcion(tallado),
          extras: extras.map((e) => e.nombre),
        },
        prioridad: "MEDIA",
      },
    });

    await tx.interaccionCliente.create({
      data: {
        clienteId: cliente.id,
        tipo: "NOTA",
        contenido: `Pedido ${numeroFinal} creado desde el configurador web. Total estimado: $${total.toLocaleString("es-AR")}.`,
      },
    });

    return numeroFinal;
  });

  return { numero, total, descripcion };
}
