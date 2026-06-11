import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicarEnInstagram } from "@/lib/instagram";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Cron de Vercel: publica las programadas cuya fecha ya pasó. */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const vencidas = await prisma.publicacionInstagram.findMany({
    where: { estado: "PROGRAMADA", fechaProgramada: { lte: new Date() } },
    take: 5,
  });

  const resultados: Array<{ id: string; ok: boolean; error?: string }> = [];
  for (const pub of vencidas) {
    try {
      await publicarEnInstagram(pub.id);
      resultados.push({ id: pub.id, ok: true });
    } catch (e) {
      resultados.push({
        id: pub.id,
        ok: false,
        error: e instanceof Error ? e.message : "error",
      });
    }
  }
  return NextResponse.json({ procesadas: resultados.length, resultados });
}
