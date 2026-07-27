"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Hammer, Pencil, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatARS } from "@/lib/utils";

export type ItemData = {
  id: string;
  descripcion: string;
  alto: number | null;
  ancho: number | null;
  cantidad: number;
  precioUnitario: number;
  notas: string | null;
  madera: string | null;
  patina: string | null;
  tallado: string | null;
  fabricaciones: { id: string; estado: string }[];
};

export function ItemEditor({
  item,
  puedeEditar,
}: {
  item: ItemData;
  puedeEditar: boolean;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [d, setD] = useState({
    descripcion: item.descripcion,
    ancho: item.ancho?.toString() ?? "",
    alto: item.alto?.toString() ?? "",
    cantidad: String(item.cantidad),
    precioUnitario: String(item.precioUnitario),
    notas: item.notas ?? "",
  });

  async function guardar() {
    setGuardando(true);
    setError("");
    const res = await fetch(`/api/admin/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        descripcion: d.descripcion.trim(),
        ancho: d.ancho ? parseInt(d.ancho, 10) : null,
        alto: d.alto ? parseInt(d.alto, 10) : null,
        cantidad: Number(d.cantidad) || 1,
        precioUnitario: Number(d.precioUnitario) || 0,
        notas: d.notas.trim() || null,
      }),
    });
    setGuardando(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo guardar.");
      return;
    }
    setEditando(false);
    router.refresh();
  }

  if (editando) {
    return (
      <div className="rounded-lg border border-madera bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor={`d-${item.id}`}>Detalle</Label>
            <textarea
              id={`d-${item.id}`}
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={d.descripcion}
              onChange={(e) => setD({ ...d, descripcion: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Ancho (cm)</Label>
            <Input type="number" value={d.ancho} onChange={(e) => setD({ ...d, ancho: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Alto (cm)</Label>
            <Input type="number" value={d.alto} onChange={(e) => setD({ ...d, alto: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Cantidad</Label>
            <Input type="number" min={1} value={d.cantidad} onChange={(e) => setD({ ...d, cantidad: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Precio unitario (ARS)</Label>
            <Input type="number" min={0} value={d.precioUnitario} onChange={(e) => setD({ ...d, precioUnitario: e.target.value })} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Notas del ítem</Label>
            <Input value={d.notas} onChange={(e) => setD({ ...d, notas: e.target.value })} />
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={guardar} disabled={guardando}>
            <Check className="h-4 w-4" /> {guardando ? "Guardando…" : "Guardar"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditando(false)}>
            <X className="h-4 w-4" /> Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-arena bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-espresso">{item.descripcion}</p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {item.ancho && item.alto && (
              <span>{item.ancho} × {item.alto} cm</span>
            )}
            {item.cantidad > 1 && <span>Cantidad: {item.cantidad}</span>}
            {item.madera && <span>Madera: {item.madera}</span>}
            {item.patina && <span>Pátina: {item.patina}</span>}
            {item.tallado && <span>Tallado: {item.tallado}</span>}
          </div>
          {item.notas && (
            <p className="mt-1 text-sm text-muted-foreground">📝 {item.notas}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="font-editorial text-lg">
            {formatARS(item.precioUnitario * item.cantidad)}
          </p>
          {puedeEditar && (
            <Button variant="ghost" size="icon" onClick={() => setEditando(true)} aria-label="Editar ítem">
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {item.fabricaciones.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-arena/60 pt-3">
          <Hammer className="h-4 w-4 text-madera" />
          {item.fabricaciones.map((f) => (
            <span key={f.id} className="flex items-center gap-2">
              <Badge variant="secondary">{f.estado.replace(/_/g, " ")}</Badge>
              <a
                href={`/api/admin/fabricacion/${f.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-madera hover:underline"
              >
                Orden de fabricación (PDF)
              </a>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
