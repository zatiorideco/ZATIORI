"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  Columns3,
  FileText,
  List,
  Plus,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn, fechaAR } from "@/lib/utils";

export type FabricacionItem = {
  id: string;
  estado: string;
  descripcion: string;
  prioridad: string;
  cliente: string | null;
  responsableId: string | null;
  responsable: string | null;
  pedidoNumero: string | null;
  fechaEstimada: string | null;
  medidas: string | null;
  enCatalogo: boolean;
  creado: string;
};

type UsuarioOpt = { id: string; nombre: string };

const COLUMNAS = [
  { id: "PARA_FABRICAR", titulo: "Para fabricar", color: "border-t-warn" },
  { id: "EN_FABRICACION", titulo: "En fabricación", color: "border-t-info" },
  { id: "TERMINADO_CLIENTE", titulo: "Terminados Clientes", color: "border-t-ok" },
  { id: "TERMINADO_STOCK", titulo: "Terminados Stock", color: "border-t-madera" },
];

const PRIORIDADES = ["BAJA", "MEDIA", "ALTA"];

function PrioridadChip({ prioridad }: { prioridad: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
        prioridad === "ALTA" && "bg-danger/15 text-danger",
        prioridad === "MEDIA" && "bg-warn/15 text-warn",
        prioridad === "BAJA" && "bg-ok/15 text-ok"
      )}
    >
      {prioridad}
    </span>
  );
}

function TarjetaContenido({ item }: { item: FabricacionItem }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-espresso">
          {item.descripcion}
        </p>
        <PrioridadChip prioridad={item.prioridad} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {item.medidas && <span>{item.medidas}</span>}
        {item.cliente ? (
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" /> {item.cliente}
          </span>
        ) : (
          <Badge variant="secondary" className="text-[10px]">
            STOCK
          </Badge>
        )}
        {item.fechaEstimada && <span>Entrega {fechaAR(item.fechaEstimada)}</span>}
        {item.responsable && <span>👤 {item.responsable}</span>}
      </div>
    </>
  );
}

function Tarjeta({ item }: { item: FabricacionItem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={
        transform
          ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
          : undefined
      }
      className={cn(
        "cursor-grab rounded-lg border border-arena bg-card p-3 shadow-sm transition-shadow hover:shadow active:cursor-grabbing",
        isDragging && "opacity-30"
      )}
    >
      <TarjetaContenido item={item} />
    </div>
  );
}

function Columna({
  columna,
  items,
}: {
  columna: (typeof COLUMNAS)[number];
  items: FabricacionItem[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columna.id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[200px] flex-col rounded-lg border border-arena border-t-4 bg-surface p-3 transition-colors",
        columna.color,
        isOver && "bg-sand/60"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-sm uppercase tracking-wide text-espresso">
          {columna.titulo}
        </h3>
        <span className="rounded-full bg-arena px-2 text-xs text-espresso">
          {items.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {items.map((item) => (
          <Tarjeta key={item.id} item={item} />
        ))}
        {items.length === 0 && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Arrastrá espejos acá
          </p>
        )}
      </div>
    </div>
  );
}

export function FabricaBoard({
  items: itemsIniciales,
  usuarios,
  puedePasarACatalogo,
}: {
  items: FabricacionItem[];
  usuarios: UsuarioOpt[];
  puedePasarACatalogo: boolean;
}) {
  const router = useRouter();
  const [vista, setVista] = useState<"pipeline" | "lista">("pipeline");
  const [items, setItems] = useState(itemsIniciales);
  const [arrastrando, setArrastrando] = useState<FabricacionItem | null>(null);
  const [formAbierto, setFormAbierto] = useState(false);
  const [nuevo, setNuevo] = useState({
    descripcion: "",
    ancho: "",
    alto: "",
    prioridad: "MEDIA",
  });
  const [guardando, setGuardando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    })
  );

  async function patch(id: string, data: Record<string, unknown>) {
    const res = await fetch(`/api/admin/fabricacion/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "No se pudo actualizar.");
      router.refresh();
      return null;
    }
    return res.json();
  }

  function onDragStart(e: DragStartEvent) {
    setArrastrando(items.find((i) => i.id === e.active.id) ?? null);
  }

  async function onDragEnd(e: DragEndEvent) {
    setArrastrando(null);
    const destino = e.over?.id as string | undefined;
    const item = items.find((i) => i.id === e.active.id);
    if (!destino || !item || item.estado === destino) return;

    // Optimista: movemos ya, la API confirma
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, estado: destino } : i))
    );
    const ok = await patch(item.id, { estado: destino });
    if (!ok) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, estado: item.estado } : i))
      );
    }
  }

  async function marcarTerminado(item: FabricacionItem) {
    const res = await patch(item.id, { estado: "TERMINADO_AUTO" });
    if (res) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, estado: res.estado } : i))
      );
    }
  }

  async function pasarACatalogo(item: FabricacionItem) {
    const res = await fetch(`/api/admin/fabricacion/${item.id}/a-catalogo`, {
      method: "POST",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error ?? "No se pudo pasar a catálogo.");
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, enCatalogo: true } : i))
    );
    router.push(`/panel/catalogo/${data.id}`);
  }

  async function crearStock(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    const res = await fetch("/api/admin/fabricacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        descripcion: nuevo.descripcion,
        ancho: nuevo.ancho ? parseInt(nuevo.ancho, 10) : null,
        alto: nuevo.alto ? parseInt(nuevo.alto, 10) : null,
        prioridad: nuevo.prioridad,
      }),
    });
    setGuardando(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "No se pudo crear.");
      return;
    }
    setNuevo({ descripcion: "", ancho: "", alto: "", prioridad: "MEDIA" });
    setFormAbierto(false);
    router.refresh();
    const creado = await res.json();
    setItems((prev) => [
      {
        id: creado.id,
        estado: "PARA_FABRICAR",
        descripcion: creado.descripcion,
        prioridad: creado.prioridad,
        cliente: null,
        responsableId: null,
        responsable: null,
        pedidoNumero: null,
        fechaEstimada: null,
        medidas:
          creado.ancho && creado.alto
            ? `${creado.ancho} × ${creado.alto} cm`
            : null,
        enCatalogo: false,
        creado: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  const visiblesLista =
    filtroEstado === "TODOS"
      ? items
      : items.filter((i) => i.estado === filtroEstado);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl uppercase text-espresso">
          Fábrica
        </h1>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-md border border-arena bg-card p-0.5">
            <button
              onClick={() => setVista("pipeline")}
              className={cn(
                "flex items-center gap-1 rounded px-3 py-1.5 text-sm",
                vista === "pipeline" && "bg-espresso text-crema"
              )}
            >
              <Columns3 className="h-4 w-4" /> Pipeline
            </button>
            <button
              onClick={() => setVista("lista")}
              className={cn(
                "flex items-center gap-1 rounded px-3 py-1.5 text-sm",
                vista === "lista" && "bg-espresso text-crema"
              )}
            >
              <List className="h-4 w-4" /> Lista
            </button>
          </div>
          <Button onClick={() => setFormAbierto(!formAbierto)}>
            {formAbierto ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {formAbierto ? "Cancelar" : "Espejo para stock"}
          </Button>
        </div>
      </div>

      {formAbierto && (
        <form
          onSubmit={crearStock}
          className="mt-4 grid gap-4 rounded-lg border border-arena bg-card p-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="s-desc">Descripción *</Label>
            <Input
              id="s-desc"
              required
              placeholder="Espejo marco reciclado pátina blanca"
              value={nuevo.descripcion}
              onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="s-ancho">Ancho (cm)</Label>
            <Input
              id="s-ancho"
              type="number"
              value={nuevo.ancho}
              onChange={(e) => setNuevo({ ...nuevo, ancho: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="s-alto">Alto (cm)</Label>
            <Input
              id="s-alto"
              type="number"
              value={nuevo.alto}
              onChange={(e) => setNuevo({ ...nuevo, alto: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Prioridad</Label>
            <div className="flex gap-2">
              <select
                className="flex h-10 flex-1 rounded-md border border-input bg-background px-2 text-sm"
                value={nuevo.prioridad}
                onChange={(e) => setNuevo({ ...nuevo, prioridad: e.target.value })}
              >
                {PRIORIDADES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <Button type="submit" disabled={guardando}>
                {guardando ? "…" : "Crear"}
              </Button>
            </div>
          </div>
        </form>
      )}

      {vista === "pipeline" ? (
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {COLUMNAS.map((col) => (
              <Columna
                key={col.id}
                columna={col}
                items={items.filter((i) => i.estado === col.id)}
              />
            ))}
          </div>
          <DragOverlay>
            {arrastrando && (
              <div className="w-64 rotate-2 rounded-lg border border-madera bg-card p-3 shadow-lg">
                <TarjetaContenido item={arrastrando} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="mt-6">
          <div className="flex flex-wrap gap-2">
            {[{ id: "TODOS", titulo: "Todos" }, ...COLUMNAS].map((c) => (
              <button
                key={c.id}
                onClick={() => setFiltroEstado(c.id)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm transition-colors",
                  filtroEstado === c.id
                    ? "border-espresso bg-espresso text-crema"
                    : "border-arena bg-card hover:border-madera"
                )}
              >
                {c.titulo}
              </button>
            ))}
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border border-arena bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-arena text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Espejo</th>
                  <th className="px-4 py-3">Destino</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Prioridad</th>
                  <th className="px-4 py-3">Responsable</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visiblesLista.map((item) => (
                  <tr key={item.id} className="border-b border-arena/50 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-espresso">{item.descripcion}</p>
                      <p className="text-xs text-muted-foreground">
                        {[item.medidas, item.pedidoNumero, `Creado ${fechaAR(item.creado)}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {item.cliente ?? <Badge variant="secondary">STOCK</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                        value={item.estado}
                        onChange={async (e) => {
                          const estado = e.target.value;
                          setItems((prev) =>
                            prev.map((i) =>
                              i.id === item.id ? { ...i, estado } : i
                            )
                          );
                          await patch(item.id, { estado });
                        }}
                      >
                        {COLUMNAS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.titulo}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                        value={item.prioridad}
                        onChange={async (e) => {
                          const prioridad = e.target.value;
                          setItems((prev) =>
                            prev.map((i) =>
                              i.id === item.id ? { ...i, prioridad } : i
                            )
                          );
                          await patch(item.id, { prioridad });
                        }}
                      >
                        {PRIORIDADES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="h-8 max-w-[140px] rounded-md border border-input bg-background px-2 text-xs"
                        value={item.responsableId ?? ""}
                        onChange={async (e) => {
                          const responsableId = e.target.value || null;
                          const responsable =
                            usuarios.find((u) => u.id === responsableId)?.nombre ?? null;
                          setItems((prev) =>
                            prev.map((i) =>
                              i.id === item.id
                                ? { ...i, responsableId, responsable }
                                : i
                            )
                          );
                          await patch(item.id, { responsableId });
                        }}
                      >
                        <option value="">Sin asignar</option>
                        {usuarios.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1">
                        {(item.estado === "PARA_FABRICAR" ||
                          item.estado === "EN_FABRICACION") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => marcarTerminado(item)}
                          >
                            Marcar terminado
                          </Button>
                        )}
                        {item.estado === "TERMINADO_STOCK" &&
                          puedePasarACatalogo &&
                          !item.enCatalogo && (
                            <Button
                              variant="accent"
                              size="sm"
                              onClick={() => pasarACatalogo(item)}
                            >
                              <ShoppingBag className="h-3.5 w-3.5" /> Pasar a catálogo
                            </Button>
                          )}
                        <a
                          href={`/api/admin/fabricacion/${item.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm" aria-label="Orden PDF">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
                {visiblesLista.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      Nada por acá. Los pedidos del configurador entran solos a
                      &quot;Para fabricar&quot;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
