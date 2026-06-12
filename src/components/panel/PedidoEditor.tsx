"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatARS } from "@/lib/utils";

type Pedido = {
  id: string;
  estado: string;
  subtotal: number;
  descuento: number;
  total: number;
  sena: number;
  saldo: number;
  fechaEstimada: string | null;
  notas: string | null;
};

const ESTADOS = [
  ["SIN_PRESUPUESTAR", "Sin presupuestar"],
  ["PRESUPUESTADO", "Presupuestado"],
  ["PARA_FABRICAR", "Para fabricar"],
  ["EN_FABRICACION", "En fabricación"],
  ["PARA_ENTREGAR", "Para entregar"],
  ["ENTREGADO", "Entregado (archiva)"],
] as const;

export function PedidoEditor({
  pedido,
  puedeEditar,
}: {
  pedido: Pedido;
  puedeEditar: boolean;
}) {
  const router = useRouter();
  const [estado, setEstado] = useState(pedido.estado);
  const [descuento, setDescuento] = useState(String(pedido.descuento));
  const [sena, setSena] = useState(String(pedido.sena));
  const [fecha, setFecha] = useState(
    pedido.fechaEstimada ? pedido.fechaEstimada.slice(0, 10) : ""
  );
  const [notas, setNotas] = useState(pedido.notas ?? "");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const totalCalc = Math.max(pedido.subtotal - (Number(descuento) || 0), 0);
  const saldoCalc = Math.max(totalCalc - (Number(sena) || 0), 0);

  async function guardar() {
    setGuardando(true);
    setMensaje("");
    const res = await fetch(`/api/admin/pedidos/${pedido.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estado,
        descuento: Number(descuento) || 0,
        sena: Number(sena) || 0,
        fechaEstimada: fecha ? new Date(`${fecha}T12:00:00-03:00`).toISOString() : null,
        notas: notas || null,
      }),
    });
    setGuardando(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMensaje(data.error ?? "No se pudo guardar.");
      return;
    }
    setMensaje("Guardado ✓");
    router.refresh();
  }

  return (
    <aside className="h-fit rounded-lg border border-arena bg-card p-4">
      <h2 className="font-display text-xl uppercase text-espresso">
        Estado y montos
      </h2>

      <div className="mt-4 space-y-4">
        <div className="space-y-1">
          <Label>Estado</Label>
          <select
            disabled={!puedeEditar}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            {ESTADOS.map(([valor, label]) => (
              <option key={valor} value={valor}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 rounded-md bg-background p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatARS(pedido.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Descuento</span>
            <Input
              type="number"
              min={0}
              disabled={!puedeEditar}
              className="h-8 w-28 text-right"
              value={descuento}
              onChange={(e) => setDescuento(e.target.value)}
            />
          </div>
          <div className="flex justify-between border-t border-arena pt-2 font-medium">
            <span>Total</span>
            <span>{formatARS(totalCalc)}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Seña</span>
            <Input
              type="number"
              min={0}
              disabled={!puedeEditar}
              className="h-8 w-28 text-right"
              value={sena}
              onChange={(e) => setSena(e.target.value)}
            />
          </div>
          <div className="flex justify-between font-medium">
            <span>Saldo</span>
            <span className={saldoCalc > 0 ? "text-warn" : "text-ok"}>
              {saldoCalc > 0 ? formatARS(saldoCalc) : "Pagado"}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="p-fecha">Fecha estimada de entrega</Label>
          <Input
            id="p-fecha"
            type="date"
            disabled={!puedeEditar}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="p-notas">Notas</Label>
          <textarea
            id="p-notas"
            rows={3}
            disabled={!puedeEditar}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>

        {mensaje && (
          <p
            className={`text-sm ${mensaje.includes("✓") ? "text-ok" : "text-destructive"}`}
          >
            {mensaje}
          </p>
        )}

        {puedeEditar && (
          <Button onClick={guardar} disabled={guardando} className="w-full">
            {guardando ? "Guardando…" : "Guardar cambios"}
          </Button>
        )}
      </div>
    </aside>
  );
}
