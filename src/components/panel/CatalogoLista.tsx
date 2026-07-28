"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FilePlus2,
  Globe,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, formatARS } from "@/lib/utils";

type EspejoRow = {
  id: string;
  slug: string;
  nombre: string;
  tipoMarco: string | null;
  alto: number | null;
  ancho: number | null;
  madera: string | null;
  patina: string | null;
  tallado: string | null;
  precio: number;
  foto: string | null;
  estado: string;
  publicadoWeb: boolean;
  destacado: boolean;
};

const ESTADO_BADGE: Record<string, { label: string; clase: string }> = {
  DISPONIBLE: { label: "Disponible", clase: "bg-ok/15 text-ok" },
  RESERVADO: { label: "Reservado", clase: "bg-warn/15 text-warn" },
  VENDIDO: { label: "Vendido", clase: "bg-arena text-muted-foreground" },
};

export function CatalogoLista({ espejos }: { espejos: EspejoRow[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("TODOS");
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [editandoPrecio, setEditandoPrecio] = useState<string | null>(null);
  const [precioDraft, setPrecioDraft] = useState("");

  const tipos = useMemo(() => {
    const set = new Set(
      espejos.map((e) => e.tipoMarco).filter((t): t is string => !!t)
    );
    return Array.from(set).sort();
  }, [espejos]);

  const visibles = espejos.filter((e) => {
    const pasaTab = tab === "TODOS" || e.tipoMarco === tab;
    const texto = q.trim().toLowerCase();
    const pasaQ =
      !texto ||
      e.nombre.toLowerCase().includes(texto) ||
      (e.madera ?? "").toLowerCase().includes(texto) ||
      (e.patina ?? "").toLowerCase().includes(texto);
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

  function empezarEdicionPrecio(e: EspejoRow) {
    setEditandoPrecio(e.id);
    setPrecioDraft(e.precio > 0 ? String(e.precio) : "");
  }

  async function guardarPrecio(e: EspejoRow) {
    setEditandoPrecio(null);
    const nuevo = Number(precioDraft.replace(/[^\d.]/g, ""));
    if (!Number.isFinite(nuevo) || nuevo < 0 || nuevo === e.precio) return;
    await patch(e.id, { precio: nuevo });
  }

  async function borrar(e: EspejoRow) {
    if (!confirm(`¿Borrar "${e.nombre}" del catálogo?`)) return;
    setOcupado(e.id);
    const res = await fetch(`/api/admin/espejos/${e.id}`, { method: "DELETE" });
    setOcupado(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "No se pudo borrar.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase text-espresso">
            Catálogo
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lo que se muestra en la web y tu control de stock. Los espejos de
            fábrica terminados para stock entran solos.
          </p>
        </div>
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
            placeholder="Buscar por nombre, madera, pátina…"
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
              <th className="px-4 py-3">Madera</th>
              <th className="px-4 py-3">Acabados</th>
              <th className="px-4 py-3">Precio (ARS)</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-center">Web</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((e) => {
              const badge = ESTADO_BADGE[e.estado] ?? ESTADO_BADGE.DISPONIBLE;
              return (
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
                          <Image src={e.foto} alt={e.nombre} fill className="object-cover" sizes="36px" />
                        )}
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 font-medium text-espresso">
                          {e.nombre}
                          <button
                            onClick={() => patch(e.id, { destacado: !e.destacado })}
                            title={
                              e.destacado
                                ? "Destacado en la home — click para sacarlo"
                                : "Click para destacarlo en la home"
                            }
                            aria-label={`Destacar ${e.nombre}`}
                          >
                            <Star
                              className={cn(
                                "h-4 w-4 transition-colors",
                                e.destacado
                                  ? "fill-madera text-madera"
                                  : "text-arena hover:text-madera"
                              )}
                            />
                          </button>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {e.tipoMarco ?? "Sin tipo"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {e.ancho && e.alto ? `${e.ancho} × ${e.alto} cm` : "—"}
                  </td>
                  <td className="px-4 py-2">{e.madera ?? "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {[e.patina, e.tallado].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-2">
                    {editandoPrecio === e.id ? (
                      <input
                        autoFocus
                        type="number"
                        min={0}
                        className="h-8 w-28 rounded-md border border-madera bg-background px-2 text-sm"
                        value={precioDraft}
                        onChange={(ev) => setPrecioDraft(ev.target.value)}
                        onBlur={() => guardarPrecio(e)}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter") ev.currentTarget.blur();
                          if (ev.key === "Escape") setEditandoPrecio(null);
                        }}
                      />
                    ) : (
                      <button
                        onClick={() => empezarEdicionPrecio(e)}
                        className="rounded px-1 py-0.5 text-left hover:bg-arena/50"
                        title="Click para editar el precio"
                      >
                        {e.precio > 0 ? (
                          formatARS(e.precio)
                        ) : (
                          <span className="text-warn">Sin precio</span>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <select
                      className={cn(
                        "h-8 rounded-full border-0 px-2.5 text-xs font-semibold",
                        badge.clase
                      )}
                      value={e.estado}
                      onChange={(ev) => patch(e.id, { estado: ev.target.value })}
                      title="Cambiar estado"
                    >
                      {Object.entries(ESTADO_BADGE).map(([valor, b]) => (
                        <option key={valor} value={valor}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => patch(e.id, { publicadoWeb: !e.publicadoWeb })}
                      title={e.publicadoWeb ? "Publicado — click para ocultar" : "Oculto — click para publicar"}
                    >
                      <Globe
                        className={cn(
                          "mx-auto h-5 w-5",
                          e.publicadoWeb ? "text-madera" : "text-arena"
                        )}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-0.5">
                      <Link href={`/panel/catalogo/${e.id}`} title="Editar (detalle, fotos, precio)">
                        <Button variant="ghost" size="icon" aria-label="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      {e.estado !== "VENDIDO" && (
                        <Link
                          href={`/panel/pedidos/nuevo?espejo=${e.id}`}
                          title="Generar pedido con este espejo"
                        >
                          <Button variant="ghost" size="icon" aria-label="Generar pedido">
                            <FilePlus2 className="h-4 w-4 text-madera" />
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Borrar"
                        aria-label="Borrar"
                        onClick={() => borrar(e)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {visibles.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  No hay espejos con ese filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <Star className="h-3 w-3" /> Generar pedido reserva el espejo; al
        entregarse el pedido queda marcado como vendido.
      </p>
    </div>
  );
}
