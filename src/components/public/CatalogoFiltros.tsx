"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { EspejoCard } from "@/components/public/EspejoCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, formatARS } from "@/lib/utils";
import type { EspejoPublico } from "@/lib/espejos-data";

type Props = { espejos: EspejoPublico[] };

// Tolerancia (cm) para considerar una medida "cercana" a la pedida
const TOLERANCIA_CM = 40;

function distancia(e: EspejoPublico, ancho?: number, alto?: number) {
  let d = 0;
  if (ancho && e.ancho) d += (e.ancho - ancho) ** 2;
  if (alto && e.alto) d += (e.alto - alto) ** 2;
  return Math.sqrt(d);
}

function toggle<T>(arr: T[], v: T) {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

export function CatalogoFiltros({ espejos }: Props) {
  // Facetas derivadas de los datos reales del catálogo
  const facetas = useMemo(() => {
    const unicos = (sel: (e: EspejoPublico) => string | null) =>
      Array.from(new Set(espejos.map(sel).filter((v): v is string => !!v))).sort();
    const precios = espejos.map((e) => e.precio).filter((p) => p > 0);
    return {
      marcos: unicos((e) => e.tipoMarco),
      maderas: unicos((e) => e.madera),
      patinas: unicos((e) => e.patina),
      tallados: unicos((e) => e.tallado),
      precioMin: precios.length ? Math.min(...precios) : 0,
      precioMax: precios.length ? Math.max(...precios) : 0,
    };
  }, [espejos]);

  const [marcos, setMarcos] = useState<string[]>([]);
  const [maderas, setMaderas] = useState<string[]>([]);
  const [patinas, setPatinas] = useState<string[]>([]);
  const [tallados, setTallados] = useState<string[]>([]);
  const [precioMax, setPrecioMax] = useState<number>(facetas.precioMax);
  const [ancho, setAncho] = useState("");
  const [alto, setAlto] = useState("");
  const [soloCercanos, setSoloCercanos] = useState(false);
  const [panelAbierto, setPanelAbierto] = useState(false);

  const anchoNum = parseInt(ancho, 10) || undefined;
  const altoNum = parseInt(alto, 10) || undefined;
  const buscaMedida = !!(anchoNum || altoNum);

  const resultado = useMemo(() => {
    let lista = espejos.filter((e) => {
      if (marcos.length && (!e.tipoMarco || !marcos.includes(e.tipoMarco))) return false;
      if (maderas.length && (!e.madera || !maderas.includes(e.madera))) return false;
      if (patinas.length && (!e.patina || !patinas.includes(e.patina))) return false;
      if (tallados.length && (!e.tallado || !tallados.includes(e.tallado))) return false;
      if (e.precio > 0 && e.precio > precioMax) return false;
      if (buscaMedida && soloCercanos) {
        const dist = distancia(e, anchoNum, altoNum);
        if (dist > TOLERANCIA_CM) return false;
      }
      return true;
    });

    // Si pidió una medida, ordenamos por cercanía
    if (buscaMedida) {
      lista = [...lista].sort(
        (a, b) => distancia(a, anchoNum, altoNum) - distancia(b, anchoNum, altoNum)
      );
    }
    return lista;
  }, [espejos, marcos, maderas, patinas, tallados, precioMax, buscaMedida, soloCercanos, anchoNum, altoNum]);

  const hayFiltros =
    marcos.length || maderas.length || patinas.length || tallados.length ||
    buscaMedida || precioMax < facetas.precioMax;

  function limpiar() {
    setMarcos([]);
    setMaderas([]);
    setPatinas([]);
    setTallados([]);
    setPrecioMax(facetas.precioMax);
    setAncho("");
    setAlto("");
    setSoloCercanos(false);
  }

  const GrupoChips = ({
    titulo,
    opciones,
    seleccion,
    onToggle,
  }: {
    titulo: string;
    opciones: string[];
    seleccion: string[];
    onToggle: (v: string) => void;
  }) =>
    opciones.length === 0 ? null : (
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-espresso">
          {titulo}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {opciones.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => onToggle(o)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                seleccion.includes(o)
                  ? "border-espresso bg-espresso text-crema"
                  : "border-arena bg-card hover:border-madera"
              )}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
    );

  const Panel = (
    <div className="space-y-6">
      {/* Medida */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-espresso">
          Medida que buscás (cm)
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="f-ancho" className="text-xs text-muted-foreground">
              Ancho
            </Label>
            <Input
              id="f-ancho"
              type="number"
              min={20}
              max={300}
              placeholder="120"
              value={ancho}
              onChange={(e) => setAncho(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="f-alto" className="text-xs text-muted-foreground">
              Alto
            </Label>
            <Input
              id="f-alto"
              type="number"
              min={20}
              max={300}
              placeholder="200"
              value={alto}
              onChange={(e) => setAlto(e.target.value)}
            />
          </div>
        </div>
        {buscaMedida && (
          <label className="mt-2 flex items-center gap-2 text-sm text-negro/75">
            <input
              type="checkbox"
              className="h-4 w-4 accent-madera"
              checked={soloCercanos}
              onChange={(e) => setSoloCercanos(e.target.checked)}
            />
            Solo medidas cercanas (±{TOLERANCIA_CM} cm)
          </label>
        )}
        {buscaMedida && !soloCercanos && (
          <p className="mt-1 text-xs text-muted-foreground">
            Ordenado de la medida más parecida a la más distinta.
          </p>
        )}
      </div>

      {/* Precio */}
      {facetas.precioMax > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-espresso">
            Precio hasta
          </p>
          <input
            type="range"
            min={facetas.precioMin}
            max={facetas.precioMax}
            step={1000}
            value={precioMax}
            onChange={(e) => setPrecioMax(Number(e.target.value))}
            className="mt-3 w-full accent-madera"
          />
          <p className="mt-1 text-sm text-negro/80">{formatARS(precioMax)}</p>
        </div>
      )}

      <GrupoChips titulo="Tipo de marco" opciones={facetas.marcos} seleccion={marcos} onToggle={(v) => setMarcos((s) => toggle(s, v))} />
      <GrupoChips titulo="Madera" opciones={facetas.maderas} seleccion={maderas} onToggle={(v) => setMaderas((s) => toggle(s, v))} />
      <GrupoChips titulo="Color / pátina" opciones={facetas.patinas} seleccion={patinas} onToggle={(v) => setPatinas((s) => toggle(s, v))} />
      <GrupoChips titulo="Tallado" opciones={facetas.tallados} seleccion={tallados} onToggle={(v) => setTallados((s) => toggle(s, v))} />

      {hayFiltros && (
        <Button variant="outline" className="w-full" onClick={limpiar}>
          <X className="h-4 w-4" /> Limpiar filtros
        </Button>
      )}
    </div>
  );

  return (
    <div className="mt-8 lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
      {/* Sidebar desktop */}
      <aside className="hidden lg:block">
        <div className="sticky top-20 rounded-lg border border-arena bg-card p-5">
          <p className="mb-4 flex items-center gap-2 font-display text-lg uppercase text-espresso">
            <SlidersHorizontal className="h-4 w-4 text-madera" /> Filtros
          </p>
          {Panel}
        </div>
      </aside>

      {/* Botón filtros mobile */}
      <div className="mb-4 lg:hidden">
        <Button variant="outline" onClick={() => setPanelAbierto(!panelAbierto)} className="w-full">
          <SlidersHorizontal className="h-4 w-4" />
          {panelAbierto ? "Ocultar filtros" : "Filtrar"}
          {hayFiltros && !panelAbierto && (
            <span className="ml-1 rounded-full bg-madera px-1.5 text-xs text-crema">•</span>
          )}
        </Button>
        {panelAbierto && (
          <div className="mt-4 rounded-lg border border-arena bg-card p-5">{Panel}</div>
        )}
      </div>

      {/* Resultados */}
      <div>
        <p className="mb-4 text-sm text-muted-foreground">
          {resultado.length} {resultado.length === 1 ? "espejo" : "espejos"}
          {hayFiltros ? " con esos filtros" : " en el catálogo"}
        </p>
        {resultado.length === 0 ? (
          <div className="rounded-lg border border-dashed border-arena py-16 text-center">
            <p className="text-muted-foreground">
              No tenemos un espejo con esos filtros en stock.
            </p>
            <a
              href="/configurador"
              className="mt-2 inline-block text-madera underline hover:text-espresso"
            >
              Diseñá uno a tu medida →
            </a>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {resultado.map((e) => (
              <EspejoCard key={e.slug} espejo={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
