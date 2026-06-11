import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ResenaForm } from "@/components/public/ResenaForm";

export const metadata: Metadata = {
  title: "Dejanos tu reseña",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function ResenaPage({
  params,
}: {
  params: { token: string };
}) {
  const resena = await prisma.resena
    .findUnique({ where: { token: params.token } })
    .catch(() => null);
  if (!resena) notFound();

  return (
    <div className="container max-w-xl py-16">
      <p className="text-center font-editorial italic text-madera">
        Tu opinión nos ayuda un montón
      </p>
      <h1 className="mt-2 text-center font-display text-4xl uppercase text-espresso">
        ¿Cómo quedó tu espejo?
      </h1>
      <div className="mt-8">
        <ResenaForm
          token={params.token}
          nombreInicial={resena.nombre}
          yaEnviada={resena.texto !== ""}
        />
      </div>
    </div>
  );
}
