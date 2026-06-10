import type { MetadataRoute } from "next";
import { getEspejosPublicados } from "@/lib/catalogo";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const espejos = await getEspejosPublicados();
  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/catalogo`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/configurador`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/nosotros`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/terminos`, changeFrequency: "yearly", priority: 0.2 },
    ...espejos.map((e) => ({
      url: `${BASE}/catalogo/${e.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
