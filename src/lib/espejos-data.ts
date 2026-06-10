// Datos de respaldo del catálogo: se usan mientras la DB no esté conectada
// o no tenga espejos publicados. Cuando haya DATABASE_URL con datos, la web
// lee de Prisma automáticamente (ver catalogo.ts).

export type EspejoPublico = {
  slug: string;
  nombre: string;
  descripcion: string | null;
  tipoMarco: string | null;
  alto: number | null; // cm
  ancho: number | null; // cm
  madera: string | null;
  patina: string | null;
  tallado: string | null;
  precio: number;
  fotos: string[];
  estado: "DISPONIBLE" | "RESERVADO" | "VENDIDO";
  destacado: boolean;
};

export const TIPOS_MARCO = ["De pie", "Decorativo", "Industrial"] as const;

export const ESPEJOS_FALLBACK: EspejoPublico[] = [
  {
    slug: "espejo-toscana",
    nombre: "Espejo Toscana",
    descripcion:
      "Espejo de cuerpo entero con marco de madera recuperada de tono nogal. Cálido, rústico y con muchísima presencia. Ideal para livings y dormitorios.",
    tipoMarco: "De pie",
    alto: 205,
    ancho: 140,
    madera: "Madera maciza recuperada",
    patina: "Nogal natural",
    tallado: null,
    precio: 568000,
    fotos: ["/espejos/1.jpg"],
    estado: "DISPONIBLE",
    destacado: true,
  },
  {
    slug: "espejo-marrakech",
    nombre: "Espejo Marrakech",
    descripcion:
      "Marco con textura artesanal estilo orgánico, en tono arena. Una pieza escultórica que aporta calidez y diseño a cualquier pared.",
    tipoMarco: "Decorativo",
    alto: 180,
    ancho: 100,
    madera: "Marco texturado",
    patina: "Arena",
    tallado: "Textura orgánica",
    precio: 472000,
    fotos: ["/espejos/2.jpg"],
    estado: "DISPONIBLE",
    destacado: true,
  },
  {
    slug: "espejo-riviera",
    nombre: "Espejo Riviera",
    descripcion:
      "Gran espejo de pie con marco robusto de madera natural. Tamaño imponente para ambientes amplios y luminosos.",
    tipoMarco: "De pie",
    alto: 220,
    ancho: 150,
    madera: "Madera maciza recuperada",
    patina: "Natural",
    tallado: null,
    precio: 672000,
    fotos: ["/espejos/3.jpg"],
    estado: "DISPONIBLE",
    destacado: true,
  },
  {
    slug: "espejo-brooklyn",
    nombre: "Espejo Brooklyn",
    descripcion:
      "Marco de madera de nogal con líneas sobrias. Combina perfecto en ambientes industriales, lofts y espacios modernos.",
    tipoMarco: "Industrial",
    alto: 195,
    ancho: 90,
    madera: "Madera de nogal",
    patina: "Nogal oscuro",
    tallado: null,
    precio: 536000,
    fotos: ["/espejos/4.jpg"],
    estado: "DISPONIBLE",
    destacado: true,
  },
  {
    slug: "espejo-santorini",
    nombre: "Espejo Santorini",
    descripcion:
      "Marco texturado en blanco roto, terminación mate. Minimalista y luminoso, suma un aire mediterráneo a la decoración.",
    tipoMarco: "Decorativo",
    alto: 200,
    ancho: 110,
    madera: "Marco texturado",
    patina: "Blanco roto",
    tallado: null,
    precio: 500000,
    fotos: ["/espejos/5.jpg"],
    estado: "DISPONIBLE",
    destacado: true,
  },
  {
    slug: "espejo-provenza",
    nombre: "Espejo Provenza",
    descripcion:
      "Marco de madera patinada en blanco con desgaste vintage. Estilo campo francés, romántico y atemporal.",
    tipoMarco: "De pie",
    alto: 210,
    ancho: 120,
    madera: "Madera patinada",
    patina: "Blanco vintage",
    tallado: null,
    precio: 552000,
    fotos: ["/espejos/6.jpg"],
    estado: "DISPONIBLE",
    destacado: true,
  },
  {
    slug: "espejo-camden",
    nombre: "Espejo Camden",
    descripcion:
      "Marco de maderas recuperadas con vetas y tonos únicos. Cada pieza es irrepetible. Carácter industrial y rústico a la vez.",
    tipoMarco: "Industrial",
    alto: 205,
    ancho: 100,
    madera: "Madera recuperada multicolor",
    patina: "Natural",
    tallado: null,
    precio: 592000,
    fotos: ["/espejos/7.jpg"],
    estado: "DISPONIBLE",
    destacado: false,
  },
  {
    slug: "espejo-oslo",
    nombre: "Espejo Oslo",
    descripcion:
      "Marco de roble claro de líneas limpias, estilo nórdico. Aporta amplitud y luz natural a cualquier ambiente.",
    tipoMarco: "De pie",
    alto: 200,
    ancho: 95,
    madera: "Madera de roble claro",
    patina: "Natural",
    tallado: null,
    precio: 516000,
    fotos: ["/espejos/8.jpg"],
    estado: "DISPONIBLE",
    destacado: true,
  },
  {
    slug: "espejo-miel",
    nombre: "Espejo Miel",
    descripcion:
      "Marco ancho de madera patinada en tonos miel y crema. Gran formato, perfecto para crear un punto focal en el living.",
    tipoMarco: "De pie",
    alto: 220,
    ancho: 150,
    madera: "Madera patinada",
    patina: "Miel y crema",
    tallado: null,
    precio: 636000,
    fotos: ["/espejos/9.jpg"],
    estado: "DISPONIBLE",
    destacado: false,
  },
  {
    slug: "espejo-umbria",
    nombre: "Espejo Umbría",
    descripcion:
      "Marco de madera envejecida con terminación rústica natural. Estilo campestre italiano, lleno de textura y calidez.",
    tipoMarco: "De pie",
    alto: 210,
    ancho: 130,
    madera: "Madera envejecida",
    patina: "Rústica natural",
    tallado: null,
    precio: 608000,
    fotos: ["/espejos/10.jpg"],
    estado: "DISPONIBLE",
    destacado: false,
  },
];
