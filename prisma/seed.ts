import { PrismaClient, TipoOpcion } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ESPEJOS_FALLBACK } from "../src/lib/espejos-data";

const prisma = new PrismaClient();

async function main() {
  // Usuario admin inicial
  const passwordHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD ?? "zatiori2026",
    10
  );
  await prisma.usuario.upsert({
    where: { email: "admin@zatiori.com" },
    update: {},
    create: {
      nombre: "Administrador",
      email: "admin@zatiori.com",
      passwordHash,
      rol: "ADMIN",
    },
  });

  // Configuración singleton
  await prisma.configuracion.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      nombreNegocio: "Zatiori",
      direccion: "Bahía Blanca, Buenos Aires, Argentina",
      whatsapp: "5492914313204",
      instagram: "zatiori",
      emailContacto: "hola@zatiori.com",
      horarios: "Lunes a viernes de 9 a 18 hs · Sábados de 9 a 13 hs",
      textoNosotros:
        "Somos un almacén de espejos artesanal de Bahía Blanca. Cada espejo es una pieza única, con marcos de madera nueva o reciclada y pátinas hechas a mano.",
      textoTerminos:
        "Los pedidos a medida requieren una seña del 50%. El plazo de fabricación estimado se informa al confirmar el pedido.",
    },
  });

  // Opciones del configurador
  const opciones: Array<{
    tipo: TipoOpcion;
    nombre: string;
    descripcion?: string;
    precioAdicional?: number;
    orden: number;
  }> = [
    // Maderas
    { tipo: "MADERA", nombre: "Madera nueva", descripcion: "Pino o eucalipto seleccionado", orden: 1 },
    { tipo: "MADERA", nombre: "Madera reciclada", descripcion: "Maderas recuperadas con historia", precioAdicional: 20000, orden: 2 },
    // Pátinas
    { tipo: "PATINA", nombre: "Natural", descripcion: "Madera a la vista con protección", orden: 1 },
    { tipo: "PATINA", nombre: "Blanco tiza", descripcion: "Pátina blanca desgastada", precioAdicional: 15000, orden: 2 },
    { tipo: "PATINA", nombre: "Negro cálido", descripcion: "Pátina oscura mate", precioAdicional: 15000, orden: 3 },
    { tipo: "PATINA", nombre: "Verde oliva", descripcion: "Pátina verde envejecida", precioAdicional: 18000, orden: 4 },
    // Tallados
    { tipo: "TALLADO", nombre: "Sin tallado", descripcion: "Marco liso", orden: 1 },
    { tipo: "TALLADO", nombre: "Tallado simple", descripcion: "Detalle tallado en esquinas", precioAdicional: 25000, orden: 2 },
    { tipo: "TALLADO", nombre: "Tallado completo", descripcion: "Marco tallado en todo el perímetro", precioAdicional: 60000, orden: 3 },
    // Tamaños (precio base del espejo)
    { tipo: "TAMANO", nombre: "60 × 80 cm", precioAdicional: 120000, orden: 1 },
    { tipo: "TAMANO", nombre: "80 × 120 cm", precioAdicional: 180000, orden: 2 },
    { tipo: "TAMANO", nombre: "100 × 180 cm", precioAdicional: 260000, orden: 3 },
    { tipo: "TAMANO", nombre: "A medida", descripcion: "Decinos las medidas que necesitás", orden: 4 },
    // Extras
    { tipo: "EXTRA", nombre: "Colgado reforzado", descripcion: "Herrajes para pared de durlock o gran tamaño", precioAdicional: 12000, orden: 1 },
    { tipo: "EXTRA", nombre: "Espejo biselado", descripcion: "Borde biselado de 2,5 cm", precioAdicional: 30000, orden: 2 },
  ];

  for (const o of opciones) {
    const existente = await prisma.opcionConfigurador.findFirst({
      where: { tipo: o.tipo, nombre: o.nombre },
    });
    if (!existente) {
      await prisma.opcionConfigurador.create({
        data: { ...o, precioAdicional: o.precioAdicional ?? 0 },
      });
    }
  }

  // Cliente interno: pedidos a nombre de ZATIORI son espejos para stock propio
  const zatiori = await prisma.cliente.findFirst({
    where: { nombre: "ZATIORI" },
  });
  if (!zatiori) {
    await prisma.cliente.create({
      data: {
        nombre: "ZATIORI",
        origen: "LOCAL",
        notas:
          "Cliente interno. Usalo en pedidos de espejos para stock: al terminarse en fábrica pasan directo al catálogo.",
      },
    });
  }

  // Espejos del catálogo (los mismos del respaldo estático, ahora en DB)
  for (const e of ESPEJOS_FALLBACK) {
    await prisma.espejoCatalogo.upsert({
      where: { slug: e.slug },
      update: {},
      create: {
        slug: e.slug,
        nombre: e.nombre,
        descripcion: e.descripcion,
        tipoMarco: e.tipoMarco,
        alto: e.alto,
        ancho: e.ancho,
        madera: e.madera,
        patina: e.patina,
        tallado: e.tallado,
        precio: e.precio,
        fotos: e.fotos,
        estado: e.estado,
        esStock: true,
        publicadoWeb: true,
        destacado: e.destacado,
      },
    });
  }

  console.log("Seed completado: admin@zatiori.com, configuración, opciones del configurador y 10 espejos de catálogo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
