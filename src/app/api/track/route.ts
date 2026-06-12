import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const esquema = z.object({
  tipo: z.enum(["PAGEVIEW", "WHATSAPP_CLICK", "INSTAGRAM_CLICK"]),
  path: z.string().max(200),
  referrer: z.string().max(500).optional().or(z.literal("")),
});

const BOTS =
  /bot|crawl|spider|slurp|preview|lighthouse|headless|curl|wget|python|monitor|pingdom|uptime/i;

function clasificarFuente(referrer: string, hostPropio: string): string {
  if (!referrer) return "directo";
  try {
    const h = new URL(referrer).hostname.toLowerCase();
    if (h.includes(hostPropio) || h.includes("zatiori")) return "interno";
    if (h.includes("instagram")) return "Instagram";
    if (h.includes("facebook") || h.startsWith("fb.") || h.includes("fbcdn"))
      return "Facebook";
    if (h.includes("google")) return "Google";
    if (h.includes("bing")) return "Bing";
    if (h.includes("whatsapp") || h.includes("wa.me")) return "WhatsApp";
    if (h.includes("tiktok")) return "TikTok";
    return h.replace(/^www\./, "");
  } catch {
    return "directo";
  }
}

/** Tracking público de la web (primera parte, sin servicios externos). */
export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  if (BOTS.test(ua)) return NextResponse.json({ ok: true });

  const parseado = esquema.safeParse(await req.json().catch(() => null));
  if (!parseado.success) return NextResponse.json({ ok: false }, { status: 400 });
  const d = parseado.data;

  // No registramos navegación interna del panel
  if (d.path.startsWith("/panel") || d.path.startsWith("/login")) {
    return NextResponse.json({ ok: true });
  }

  // Visitante anónimo por cookie (para contar únicos)
  const cookies = req.headers.get("cookie") ?? "";
  const existente = cookies.match(/zat_vid=([a-f0-9-]+)/)?.[1];
  const visitante = existente ?? randomUUID();

  const host = new URL(req.url).hostname;
  const geo = (h: string) => {
    const v = req.headers.get(h);
    try {
      return v ? decodeURIComponent(v) : null;
    } catch {
      return v;
    }
  };

  try {
    await prisma.eventoWeb.create({
      data: {
        tipo: d.tipo,
        path: d.path.slice(0, 200),
        fuente: clasificarFuente(d.referrer ?? "", host),
        visitante,
        ciudad: geo("x-vercel-ip-city"),
        region: geo("x-vercel-ip-country-region"),
        pais: geo("x-vercel-ip-country"),
      },
    });
  } catch {
    // la analítica jamás rompe la web
  }

  const res = NextResponse.json({ ok: true });
  if (!existente) {
    res.headers.set(
      "Set-Cookie",
      `zat_vid=${visitante}; Path=/; Max-Age=31536000; SameSite=Lax`
    );
  }
  return res;
}
