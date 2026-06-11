"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Opcion = {
  id: string;
  tipo: string;
  nombre: string;
  descripcion: string | null;
  precioAdicional: number;
  orden: number;
  activo: boolean;
};

const TIPOS = [
  { valor: "TAMANO", label: "Tamaños" },
  { valor: "MADERA", label: "Maderas" },
  { valor: "PATINA", label: "Pátinas" },
  { valor: "TALLADO", label: "Tallados" },
  { valor: "EXTRA", label: "Extras" },
];

export function OpcionesAdmin({ opciones }: { opciones: Opcion[] }) {
  const router = useRouter();
  const [tab, setTab] = useState("TAMANO");
  const [nuevo, setNuevo] = useState({ nombre: "", descripcion: "", precio: "" });
  const [guardando, setGuardando] = useState(false);

  const visibles = opciones
    .filter((o) => o.tipo === tab)
    .sort((a, b) => a.orden - b.orden);

  async function patch(id: string, data: Record<string, unknown>) {
    const res = await fetch(`/api/admin/opciones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "No se pudo guardar.");
    }
    router.refresh();
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevo.nombre.trim()) return;
    setGuardando(true);
    const res = await fetch("/api/admin/opciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: tab,
        nombre: nuevo.nombre.trim(),
        descripcion: nuevo.descripcion.trim(),
        precioAdicional: Number(nuevo.precio) || 0,
        orden: visibles.length + 1,
      }),
    });
    setGuardando(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "No se pudo crear.");
      return;
    }
    setNuevo({ nombre: "", descripcion: "", precio: "" });
    router.refresh();
  }

  async function borrar(o: Opcion) {
    if (!confirm(`¿Borrar "${o.nombre}"?`)) return;
    const res = await fetch(`/api/admin/opciones/${o.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "No se pudo borrar.");
      return;
    }
    router.refresh();
  }

  return (
    <section>
      <h2 className="font-display text-2xl uppercase text-espresso">
        Opciones del configurador
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Lo que el cliente elige en “Diseñá tu espejo”: tamaños, maderas,
        pátinas, tallados y extras, con su precio adicional.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {TIPOS.map((t) => (
          <button
            key={t.valor}
            onClick={() => setTab(t.valor)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              tab === t.valor
                ? "border-espresso bg-espresso text-crema"
                : "border-arena bg-card hover:border-madera"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-arena bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arena text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3">Precio adicional</th>
              <th className="px-4 py-3 text-center">Activa</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {visibles.map((o) => (
              <tr key={o.id} className={cn("border-b border-arena/50 last:border-0", !o.activo && "opacity-50")}>
                <td className="px-4 py-2">
                  <Input
                    className="h-8"
                    defaultValue={o.nombre}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v && v !== o.nombre) patch(o.id, { nombre: v });
                    }}
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    className="h-8"
                    defaultValue={o.descripcion ?? ""}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v !== (o.descripcion ?? "")) patch(o.id, { descripcion: v || null });
                    }}
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    min={0}
                    className="h-8 w-32"
                    defaultValue={o.precioAdicional}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!Number.isNaN(v) && v !== o.precioAdicional) patch(o.id, { precioAdicional: v });
                    }}
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-madera"
                    checked={o.activo}
                    onChange={(e) => patch(o.id, { activo: e.target.checked })}
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <Button variant="ghost" size="icon" onClick={() => borrar(o)} aria-label={`Borrar ${o.nombre}`}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            <tr>
              <td className="px-4 py-2">
                <Input
                  className="h-8"
                  placeholder="Nueva opción…"
                  value={nuevo.nombre}
                  onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                />
              </td>
              <td className="px-4 py-2">
                <Input
                  className="h-8"
                  placeholder="Descripción"
                  value={nuevo.descripcion}
                  onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
                />
              </td>
              <td className="px-4 py-2">
                <Input
                  type="number"
                  min={0}
                  className="h-8 w-32"
                  placeholder="0"
                  value={nuevo.precio}
                  onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })}
                />
              </td>
              <td />
              <td className="px-4 py-2 text-right">
                <Button size="sm" onClick={crear} disabled={guardando || !nuevo.nombre.trim()}>
                  <Plus className="h-4 w-4" /> Agregar
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
