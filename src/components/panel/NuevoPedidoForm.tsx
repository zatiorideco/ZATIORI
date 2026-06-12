"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Search, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ClienteOpt = {
  id: string;
  nombre: string;
  telefono: string | null;
  ciudad: string | null;
};

type EspejoPre = {
  id: string;
  nombre: string;
  ancho: number | null;
  alto: number | null;
  precio: number;
  detalle: string;
};

export function NuevoPedidoForm({ espejo }: { espejo: EspejoPre | null }) {
  const router = useRouter();

  // Cliente
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<ClienteOpt[]>([]);
  const [cliente, setCliente] = useState<ClienteOpt | null>(null);
  const [modoNuevo, setModoNuevo] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    telefono: "",
    email: "",
    ciudad: "",
  });

  // Pedido
  const [descripcion, setDescripcion] = useState(espejo?.detalle ?? "");
  const [ancho, setAncho] = useState(espejo?.ancho?.toString() ?? "");
  const [alto, setAlto] = useState(espejo?.alto?.toString() ?? "");
  const [fecha, setFecha] = useState("");
  const [presupuesto, setPresupuesto] = useState(
    espejo && espejo.precio > 0 ? String(espejo.precio) : ""
  );
  const [notas, setNotas] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Buscador con debounce
  useEffect(() => {
    if (cliente || modoNuevo) return;
    const t = setTimeout(async () => {
      const res = await fetch(
        `/api/admin/clientes?q=${encodeURIComponent(busqueda)}`
      );
      if (res.ok) setResultados(await res.json());
    }, 250);
    return () => clearTimeout(t);
  }, [busqueda, cliente, modoNuevo]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!cliente && !(modoNuevo && nuevoCliente.nombre.trim().length >= 2)) {
      setError("Elegí un cliente o cargá uno nuevo.");
      return;
    }
    setGuardando(true);
    const res = await fetch("/api/admin/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clienteId: cliente?.id,
        clienteNuevo: modoNuevo
          ? {
              nombre: nuevoCliente.nombre.trim(),
              telefono: nuevoCliente.telefono.trim(),
              email: nuevoCliente.email.trim(),
              ciudad: nuevoCliente.ciudad.trim(),
            }
          : undefined,
        descripcion: descripcion.trim(),
        ancho: ancho ? parseInt(ancho, 10) : null,
        alto: alto ? parseInt(alto, 10) : null,
        fechaEstimada: fecha
          ? new Date(`${fecha}T12:00:00-03:00`).toISOString()
          : null,
        presupuesto: Number(presupuesto) || 0,
        notas: notas.trim(),
        espejoCatalogoId: espejo?.id ?? null,
      }),
    });
    setGuardando(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "No se pudo crear el pedido.");
      return;
    }
    router.push(`/panel/pedidos/${data.id}`);
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/panel/pedidos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-madera"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a pedidos
      </Link>
      <h1 className="mt-2 font-display text-3xl uppercase text-espresso">
        Nuevo pedido
      </h1>
      {espejo && (
        <p className="mt-1 text-sm text-muted-foreground">
          Sobre el espejo del catálogo:{" "}
          <span className="font-medium text-espresso">{espejo.nombre}</span>{" "}
          (queda reservado al crear el pedido)
        </p>
      )}

      <form onSubmit={crear} className="mt-6 space-y-6">
        {/* ── Cliente ── */}
        <div className="rounded-lg border border-arena bg-card p-4">
          <div className="flex items-center justify-between">
            <Label className="text-base">Cliente</Label>
            <button
              type="button"
              onClick={() => {
                setModoNuevo(!modoNuevo);
                setCliente(null);
              }}
              className="flex items-center gap-1 text-sm text-madera hover:underline"
            >
              {modoNuevo ? (
                <>
                  <Search className="h-3.5 w-3.5" /> Buscar existente
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" /> Crear nuevo cliente
                </>
              )}
            </button>
          </div>

          {cliente ? (
            <div className="mt-3 flex items-center justify-between rounded-md bg-arena/40 px-3 py-2">
              <div>
                <p className="font-medium text-espresso">{cliente.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {[cliente.telefono, cliente.ciudad].filter(Boolean).join(" · ")}
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setCliente(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : modoNuevo ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="nc-nombre">Nombre *</Label>
                <Input
                  id="nc-nombre"
                  value={nuevoCliente.nombre}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="nc-tel">WhatsApp / Teléfono</Label>
                <Input
                  id="nc-tel"
                  value={nuevoCliente.telefono}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="nc-email">Email</Label>
                <Input
                  id="nc-email"
                  type="email"
                  value={nuevoCliente.email}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="nc-ciudad">Ciudad</Label>
                <Input
                  id="nc-ciudad"
                  value={nuevoCliente.ciudad}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, ciudad: e.target.value })}
                />
              </div>
              <p className="text-xs text-muted-foreground sm:col-span-2">
                El cliente queda guardado en la base de clientes.
              </p>
            </div>
          ) : (
            <div className="relative mt-3">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscá por nombre, teléfono o email…"
                className="pl-9"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {resultados.length > 0 && (
                <ul className="mt-2 max-h-52 overflow-y-auto rounded-md border border-arena">
                  {resultados.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setCliente(c)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-arena/40"
                      >
                        <span className="font-medium text-espresso">{c.nombre}</span>
                        <span className="text-xs text-muted-foreground">
                          {[c.telefono, c.ciudad].filter(Boolean).join(" · ")}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Tip: para espejos de stock propio, usá el cliente{" "}
                <Badge variant="secondary">ZATIORI</Badge> — al terminarse en
                fábrica van directo al catálogo.
              </p>
            </div>
          )}
        </div>

        {/* ── Detalle del pedido ── */}
        <div className="grid gap-4 rounded-lg border border-arena bg-card p-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="p-desc">Detalle del pedido *</Label>
            <textarea
              id="p-desc"
              rows={2}
              required
              placeholder="Espejo marco madera reciclada, pátina blanco tiza, 120 × 200"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="p-ancho">Ancho (cm)</Label>
            <Input id="p-ancho" type="number" min={1} max={500} value={ancho} onChange={(e) => setAncho(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="p-alto">Alto (cm)</Label>
            <Input id="p-alto" type="number" min={1} max={500} value={alto} onChange={(e) => setAlto(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="p-fecha">Fecha de entrega estimada</Label>
            <Input id="p-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="p-presu">Presupuesto (ARS)</Label>
            <Input
              id="p-presu"
              type="number"
              min={0}
              placeholder="Dejalo vacío si todavía no está presupuestado"
              value={presupuesto}
              onChange={(e) => setPresupuesto(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Con monto entra como <b>Presupuestado</b>; sin monto, como{" "}
              <b>Sin presupuestar</b>.
            </p>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="p-notas">Notas internas</Label>
            <textarea
              id="p-notas"
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" disabled={guardando} className={cn(guardando && "opacity-70")}>
          <Check className="h-4 w-4" />
          {guardando ? "Creando…" : "Crear pedido"}
        </Button>
      </form>
    </div>
  );
}
