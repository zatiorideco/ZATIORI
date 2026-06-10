import { prisma } from "@/lib/prisma";
import type { ResultadoPedido } from "@/lib/pedidos";

/** Notificación interna de pedido nuevo. Usa Resend si hay API key
 *  (inicialización lazy para no romper el build sin la variable);
 *  si no, queda registrado en los logs del servidor. */
export async function notificarPedidoNuevo(
  pedido: ResultadoPedido,
  contacto: { nombre: string; whatsapp: string }
) {
  const resumen = `Pedido ${pedido.numero}: ${pedido.descripcion} — $${pedido.total.toLocaleString("es-AR")} — Cliente: ${contacto.nombre} (WA ${contacto.whatsapp})`;

  if (!process.env.RESEND_API_KEY) {
    console.log(`[pedido-nuevo] ${resumen}`);
    return;
  }

  try {
    const config = await prisma.configuracion.findUnique({
      where: { id: "singleton" },
    });
    const destino = config?.emailContacto;
    if (!destino) return;

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Zatiori Web <onboarding@resend.dev>",
      to: destino,
      subject: `Nuevo pedido ${pedido.numero} desde la web`,
      text: `${resumen}\n\nEntrá al panel para verlo: ${process.env.NEXTAUTH_URL ?? "https://zatiori.vercel.app"}/panel`,
    });
  } catch (e) {
    // La notificación nunca debe tirar abajo la creación del pedido
    console.error("[pedido-nuevo] error enviando email:", e);
  }
}
