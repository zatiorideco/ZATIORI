import {
  Eye,
  Globe,
  MapPin,
  MousePointerClick,
  ShoppingCart,
  Users,
} from "lucide-react";
import { getEstadisticasWeb, etiquetaPath } from "@/lib/analytics";
import { formatARS, cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function IconoWA() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export async function EstadisticasWeb() {
  const stats = await getEstadisticasWeb();
  if (!stats) return null;

  const maxDia = Math.max(...stats.porDia.map((d) => d.visitas), 1);
  const periodos = [
    { titulo: "Hoy", visitas: stats.visitas.hoy, unicos: stats.visitas.hoyUnicos },
    { titulo: "Semana", visitas: stats.visitas.semana, unicos: stats.visitas.semanaUnicos },
    { titulo: "Mes", visitas: stats.visitas.mes, unicos: stats.visitas.mesUnicos },
  ];

  const sinDatos = stats.visitas.mes === 0;

  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 font-display text-xl uppercase text-espresso">
        <Globe className="h-5 w-5 text-madera" /> La web
      </h2>

      {sinDatos && (
        <p className="mt-2 text-sm text-muted-foreground">
          Recién empezamos a medir: los números se llenan solos a medida que la
          gente visite zatiori.com.ar.
        </p>
      )}

      {/* Visitas hoy / semana / mes */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {periodos.map((p) => (
          <Card key={p.titulo}>
            <CardContent className="pt-6 text-center">
              <p className="font-editorial text-4xl text-espresso">{p.visitas}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.titulo}</p>
              <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" /> {p.unicos} únicos
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Últimos 7 días */}
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Últimos 7 días
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-end gap-2">
            {stats.porDia.map((d) => (
              <div key={d.dia} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground">{d.visitas}</span>
                <div
                  className="w-full rounded-t bg-madera/70"
                  style={{ height: `${Math.max((d.visitas / maxDia) * 100, 2)}%` }}
                />
                <span className="text-[11px] text-muted-foreground">{d.etiqueta}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Páginas + fuentes */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Eye className="h-4 w-4" /> Páginas más vistas (30 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.paginas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos todavía.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {stats.paginas.map((p) => (
                  <li key={p.path} className="flex items-center justify-between">
                    <span>{etiquetaPath(p.path)}</span>
                    <span className="text-muted-foreground">{p.visitas}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Globe className="h-4 w-4" /> De dónde vienen
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.fuentes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos todavía.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {stats.fuentes.map((f) => (
                  <li key={f.fuente} className="flex items-center justify-between">
                    <span className="capitalize">{f.fuente}</span>
                    <span className="text-muted-foreground">{f.visitas}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conversiones */}
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MousePointerClick className="h-4 w-4" /> Conversiones (30 días)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-background p-4 text-center">
              <ShoppingCart className="mx-auto h-5 w-5 text-madera" />
              <p className="mt-2 font-editorial text-2xl text-espresso">
                {stats.conversiones.pedidosWeb}
              </p>
              <p className="text-xs text-muted-foreground">Pedidos desde la web</p>
              {stats.conversiones.pedidosWebMonto > 0 && (
                <p className="mt-1 text-sm font-medium text-ok">
                  {formatARS(stats.conversiones.pedidosWebMonto)}
                </p>
              )}
            </div>
            <div className="rounded-lg bg-background p-4 text-center text-[#25D366]">
              <span className="mx-auto inline-block"><IconoWA /></span>
              <p className="mt-2 font-editorial text-2xl text-espresso">
                {stats.conversiones.whatsapp}
              </p>
              <p className="text-xs text-muted-foreground">Clicks a WhatsApp</p>
            </div>
            <div className="rounded-lg bg-background p-4 text-center">
              <p className="text-lg">📸</p>
              <p className="mt-1 font-editorial text-2xl text-espresso">
                {stats.conversiones.instagram}
              </p>
              <p className="text-xs text-muted-foreground">Clicks a Instagram</p>
            </div>
          </div>
          {stats.conversiones.porFuente.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              Conversiones por fuente:
              {stats.conversiones.porFuente.map((c) => (
                <span
                  key={c.fuente}
                  className="rounded-full bg-arena px-2.5 py-0.5 font-medium text-espresso"
                >
                  {c.fuente}: {c.cantidad}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ciudades */}
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MapPin className="h-4 w-4" /> Ciudades (30 días)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.ciudades.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin datos todavía.</p>
          ) : (
            <ul className="grid gap-x-10 gap-y-2 text-sm sm:grid-cols-2">
              {stats.ciudades.map((c) => (
                <li key={c.lugar} className="flex items-center justify-between">
                  <span className={cn(c.lugar.includes("Bahía Blanca") && "font-medium text-espresso")}>
                    {c.lugar}
                  </span>
                  <span className="text-muted-foreground">{c.visitas}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
