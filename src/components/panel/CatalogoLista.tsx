"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Star, Globe, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type EspejoRow = {
  id: string;
  slug: string;
  nombre: string;
  tipoMarco: string | null;
  alto: number | null;
  ancho: number | null;
  precio: number;
  foto: string | null;
  estado: string;
  publicadoWeb: boolean;
  destacado: boolean;
};

const ESTADOS = ["DISPONIBLE", "RESERVADO", "VENDIDO"];

export function CatalogoLista({ espejos }: { espejos: EspejoRow[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("TODOS");
  const [precios, setPrecios] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState<string | null>(null);

  const tipos = useMemo(() => {
    const set = new Set(
      espejos.map((e) => e.tipoMarco).filter((t): t is string => !!t)
    );
    return Array.from(set).sort();
  }, [espejos]);

  const visibles = espejos.filter((e) => {
    const pasaTab = tab === "TODOS" || e.tipoMarco === tab;
    const texto = q.trim().toLowerCase();
    const pasaQ = !texto || e.nombre.toLowerCase().includes(texto);
    return pasaTab && pasaQ;
  });

  async function patch(id: string, data: Record<string, unknown>) {
    setOcupado(id);
    const res = await fetch(`/api/admin/espejos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setOcupado(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "No se pudo guardar.");
      return;
    }
    router.refresh();
  }

  function guardarPrecio(e: EspejoRow) {
    const texto = precios[e.id];
    if (texto === undefined) return;
    const valor = Number(texto);
    if (Number.isNaN(valor) || valor < 0 || valor === e.precio) return;
    patch(e.id, { precio: valor });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl uppercase text-espresso">
          Catálogo
        </h1>
        <Link href="/panel/catalogo/nuevo">
          <Button>
            <Plus className="h-4 w-4" /> Nuevo espejo
          </Button>
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {["TODOS", ...tipos].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              tab === t
                ? "border-espresso bg-espresso text-crema"
                : "border-arena bg-card hover:border-madera"
            )}
          >
            {t === "TODOS" ? "Todos" : t}
          </button>
        ))}
        <div className="relative ml-auto w-full max-w-xs">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar espejo…"
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-arena bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arena text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Espejo</th>
              <th className="px-4 py-3">Medidas</th>
              <th className="px-4 py-3">Precio (ARS)</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-center">Web</th>
              <th className="px-4 py-3 text-center">Destacado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {visibles.map((e) => (
              <tr
                key={e.id}
                className={cn(
                  "border-b border-arena/50 last:border-0",
                  ocupado === e.id && "opacity-50"
                )}
              >
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded bg-arena">
                      {e.foto && (
                        <Image
                          src={e.foto}
                          alt={e.nombre}
                          fill
                          className="object-cover"
                          sizes="36px"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-espresso">{e.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.tipoMarco ?? "Sin tipo"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {e.ancho && e.alto ? `${e.ancho} × ${e.alto} cm` : "—"}
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    min={0}
                    className="h-8 w-28"
                    value={precios[e.id] ?? String(e.precio)}
                    onChange={(ev) =>
                      setPrecios({ ...precios, [e.id]: ev.target.value })
                    }
                    onBlur={() => guardarPrecio(e)}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter") (ev.target as HTMLInputElement).blur();
                    }}
                  />
                </td>
                <td className="px-4 py-2">
                  <select
                    className="h-8 rounded-md border border-input bg-card px-2 text-sm"
                    value={e.estado}
                    onChange={(ev) => patch(e.id, { estado: ev.target.value })}
                  >
                    {ESTADOS.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => patch(e.id, { publicadoWeb: !e.publicadoWeb })}
                    aria-label={e.publicadoWeb ? "Despublicar" : "Publicar"}
                    title={e.publicadoWeb ? "Publicado en la web" : "No publicado"}
                  >
                    <Globe
                      className={cn(
                        "mx-auto h-5 w-5",
                        e.publicadoWeb ? "text-madera" : "text-arena"
                      )}
                    />
                  </button>
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => patch(e.id, { destacado: !e.destacado })}
                    aria-label={e.destacado ? "Quitar destacado" : "Destacar"}
                  >
                    <Star
                      className={cn(
                        "mx-auto h-5 w-5",
                        e.destacado
                          ? "fill-madera text-madera"
                          : "text-arena"
                      )}
                    />
                  </button>
                </td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/panel/catalogo/${e.id}`}>
                    <Button variant="ghost" size="icon" aria-label="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
            {visibles.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No hay espejos con ese filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Precio, estado, publicación y destacado se editan acá mismo. Para fotos
        y descripción, entrá con el lápiz.
      </p>
    </div>
  );
}
