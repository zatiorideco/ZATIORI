import type { Metadata } from "next";
import { getTextosNegocio } from "@/lib/catalogo";

export const metadata: Metadata = {
  title: "Términos y condiciones",
};

export const revalidate = 300;

const TEXTO_DEFAULT = `Pedidos a medida: requieren una seña del 50% para entrar en fabricación. El saldo se abona al retirar o antes del envío.

Plazos: el plazo de fabricación estimado se informa al confirmar el pedido y depende de la complejidad de la pieza. Al ser trabajo artesanal, puede variar algunos días.

Piezas únicas: trabajamos con maderas naturales y pátinas hechas a mano. Los tonos y vetas pueden variar levemente respecto de las fotos; eso es parte del valor de cada pieza.

Entregas: coordinamos retiro por el taller en Bahía Blanca o envío a cargo del comprador.

Cambios y devoluciones: los espejos de catálogo se cambian dentro de los 10 días en el mismo estado en que se entregaron. Los pedidos a medida no tienen devolución, salvo defecto de fabricación.`;

export default async function TerminosPage() {
  const config = await getTextosNegocio();
  const texto = config?.textoTerminos?.trim() || TEXTO_DEFAULT;

  return (
    <div className="container max-w-3xl py-12">
      <h1 className="font-display text-4xl uppercase text-espresso">
        Términos y condiciones
      </h1>
      <div className="mt-8 space-y-5 leading-relaxed text-negro/85">
        {texto.split("\n\n").map((parrafo, i) => (
          <p key={i}>{parrafo}</p>
        ))}
      </div>
    </div>
  );
}
