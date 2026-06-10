export const NEGOCIO = {
  nombre: "Zatiori",
  descripcion:
    "Almacén de espejos artesanales en Bahía Blanca. Piezas únicas con marcos de madera nueva y reciclada.",
  ciudad: "Bahía Blanca, Argentina",
  whatsapp: "5492914313204",
  whatsappUrl: "https://wa.me/5492914313204",
  whatsappMensaje:
    "¡Hola Zatiori! Vi la web y quiero consultar por un espejo.",
  instagramUrl: "https://instagram.com/zatiori",
  instagramUsuario: "@zatiori",
  email: "hola@zatiori.com",
} as const;

export function whatsappLink(mensaje?: string) {
  const texto = encodeURIComponent(mensaje ?? NEGOCIO.whatsappMensaje);
  return `${NEGOCIO.whatsappUrl}?text=${texto}`;
}
