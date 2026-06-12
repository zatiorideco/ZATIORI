"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, FileText, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, fechaAR, formatARS } from "@/lib/utils";

type PedidoRow = {
  id: string;
  numero: string;
  cliente: string;
  detalle: string;
  estado: string;
  total: number;
  fechaPedido: string;
  fechaEntrega: string | null;
};

export const ESTADOS_PEDIDO = [
  { valor: "SIN_PRESUPUESTAR", label: "Sin presupuestar", color: "bg-arena text-espresso" },
  { valor: "PRESUPUESTADO", label: "Presupuestado", color: "bg-info/15 text-info" },
  { valor: "PARA_FABRICAR", label: "Para fabricar", color: "bg-warn/15 text-warn" },
  { valor: "EN_FABRICACION", label: "En fabricación", color: "bg-madera/20 text-marron" },
  { valor: "PARA_ENTREGAR", label: "Para entregar", color: "bg-ok/15 text-ok" },
  { valor: "ENTREGADO", label: "Entregado", color: "bg-ok text-crema" },
];

export function PedidosLista({
  pedidos,
  puedeEditar,
}: {
  pedidos: PedidoRow[];
  puedeEditar: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [verArchivados, setVerArchivados] = useState(false);
  const [ocupado, setOcupado] = useState<string | null>(null);

  const visibles = pedidos.filter((p) => {
    const esArchivado = p.estado === "ENTREGADO";
    if (verArchivados !== esArchivado) return false;
    const texto = q.trim().toLowerCase();
    return (
      !texto ||
      p.numero.toLowerCase().includes(texto) ||
      p.cliente.toLowerCase().includes(texto) ||
      p.detalle.toLowerCase().includes(texto)
    );
  });

  async function cambiarEstado(p: PedidoRow, estado: string) {
    setOcupado(p.id);
    const res = await fetch(`/api/admin/pedidos/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    setOcupado(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "No se pudo cambiar el estado.");
    }
    router.refresh();
  }

  async function borrar(p: PedidoRow) {
    if (
      !confirm(
        `¿Borrar el pedido ${p.numero} de ${p.cliente}?\nSe elimina también del taller si estaba en el pipeline.`
      )
    )
      return;
    setOcupado(p.id);
    const res = await fetch(`/api/admin/pedidos/${p.id}`, { method: "DELETE" });
    setOcupado(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "No se pudo borrar.");
    }
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl uppercase text-espresso">Pedidos</h1>
        {puedeEditar && (
          <Link href="/panel/pedidos/nuevo">
            <Button>
              <Plus className="h-4 w-4" /> Nuevo pedido
            </Button>
          </Link>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, cliente o detalle…"
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <button
          onClick={() => setVerArchivados(!verArchivados)}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-colors",
            verArchivados
              ? "border-espresso bg-espresso text-crema"
              : "border-arena bg-card hover:border-madera"
          )}
        >
          <Archive className="h-3.5 w-3.5" />
          {verArchivados ? "Viendo archivados" : "Archivados (entregados)"}
        </button>
      </div>

      {visibles.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          {verArchivados
            ? "No hay pedidos entregados todavía."
            : "No hay pedidos activos. Creá el primero con “Nuevo pedido” — los del configurador de la web también caen acá."}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-arena bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-arena text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">N°</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Detalle</th>
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Entrega</th>
                <th className="px-4 py-3 text-right">Presup.</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((p) => {
                const estadoInfo = ESTADOS_PEDIDO.find((e) => e.valor === p.estado);
                return (
                  <tr
                    key={p.id}
                    className={cn(
                      "border-b border-arena/50 last:border-0",
                      ocupado === p.id && "opacity-50"
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-espresso">
                      <Link href={`/panel/pedidos/${p.id}`} className="hover:underline">
                        {p.numero}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{p.cliente}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground" title={p.detalle}>
                      {p.detalle}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {fechaAR(p.fechaPedido)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.fechaEntrega ? fechaAR(p.fechaEntrega) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.total > 0 ? formatARS(p.total) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {puedeEditar ? (
                        <select
                          className={cn(
                            "h-8 rounded-full border-0 px-3 text-xs font-semibold",
                            estadoInfo?.color
                          )}
                          value={p.estado}
                          onChange={(e) => cambiarEstado(p, e.target.value)}
                        >
                          {ESTADOS_PEDIDO.map((e) => (
                            <option key={e.valor} value={e.valor}>
                              {e.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", estadoInfo?.color)}>
                          {estadoInfo?.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <a
                          href={`/api/admin/pedidos/${p.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="PDF nota de pedido / presupuesto"
                        >
                          <Button variant="ghost" size="icon" aria-label="PDF">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </a>
                        {puedeEditar && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => borrar(p)}
                            aria-label={`Borrar ${p.numero}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
