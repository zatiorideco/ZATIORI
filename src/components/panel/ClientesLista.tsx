"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, Pencil, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrigenBadge } from "@/components/panel/OrigenBadge";
import { fechaAR, waLink } from "@/lib/utils";

type ClienteRow = {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  ciudad: string | null;
  origen: string;
  pedidos: number;
  creado: string;
};

const ORIGENES = ["LOCAL", "WEB", "INSTAGRAM", "WHATSAPP", "REFERIDO"];

export function ClientesLista({
  clientes,
  busqueda,
}: {
  clientes: ClienteRow[];
  busqueda: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(busqueda);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [nuevo, setNuevo] = useState({
    nombre: "",
    telefono: "",
    email: "",
    ciudad: "",
    origen: "LOCAL",
  });
  const [editandoTel, setEditandoTel] = useState<string | null>(null);
  const [telDraft, setTelDraft] = useState("");

  async function guardarTelefono(c: ClienteRow) {
    setEditandoTel(null);
    const nuevoTel = telDraft.trim();
    if (nuevoTel === (c.telefono ?? "")) return;
    const res = await fetch(`/api/admin/clientes/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefono: nuevoTel || null }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "No se pudo guardar el teléfono.");
      return;
    }
    router.refresh();
  }

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    router.push(q ? `/panel/clientes?q=${encodeURIComponent(q)}` : "/panel/clientes");
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    const res = await fetch("/api/admin/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevo),
    });
    setGuardando(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo crear el cliente.");
      return;
    }
    const creado = await res.json();
    router.push(`/panel/clientes/${creado.id}`);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl uppercase text-espresso">
          Clientes
        </h1>
        <Button onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {mostrarForm ? "Cancelar" : "Nuevo cliente"}
        </Button>
      </div>

      {mostrarForm && (
        <form
          onSubmit={crear}
          className="mt-4 grid gap-4 rounded-lg border border-arena bg-card p-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <div className="space-y-1">
            <Label htmlFor="n-nombre">Nombre *</Label>
            <Input
              id="n-nombre"
              required
              value={nuevo.nombre}
              onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="n-tel">Teléfono</Label>
            <Input
              id="n-tel"
              value={nuevo.telefono}
              onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="n-email">Email</Label>
            <Input
              id="n-email"
              type="email"
              value={nuevo.email}
              onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="n-ciudad">Ciudad</Label>
            <Input
              id="n-ciudad"
              value={nuevo.ciudad}
              onChange={(e) => setNuevo({ ...nuevo, ciudad: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="n-origen">Origen</Label>
            <select
              id="n-origen"
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
              value={nuevo.origen}
              onChange={(e) => setNuevo({ ...nuevo, origen: e.target.value })}
            >
              {ORIGENES.map((o) => (
                <option key={o} value={o}>
                  {o.charAt(0) + o.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p className="text-sm text-destructive sm:col-span-2 lg:col-span-4">
              {error}
            </p>
          )}
          <div className="flex items-end lg:col-start-5">
            <Button type="submit" disabled={guardando} className="w-full">
              {guardando ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </form>
      )}

      <form onSubmit={buscar} className="mt-4 flex max-w-md gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, teléfono, email o ciudad…"
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline">
          Buscar
        </Button>
      </form>

      {clientes.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          {busqueda
            ? "No encontramos clientes con esa búsqueda."
            : "Todavía no hay clientes. Se crean solos cuando entra un pedido por la web, o cargalos con el botón de arriba."}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-arena bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-arena text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Ciudad</th>
                <th className="px-4 py-3">Origen</th>
                <th className="px-4 py-3 text-center">Pedidos</th>
                <th className="px-4 py-3">Alta</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer border-b border-arena/50 transition-colors last:border-0 hover:bg-arena/30"
                  onClick={() => router.push(`/panel/clientes/${c.id}`)}
                >
                  <td className="px-4 py-3 font-medium text-espresso">
                    <Link href={`/panel/clientes/${c.id}`}>{c.nombre}</Link>
                  </td>
                  <td
                    className="px-4 py-3 text-muted-foreground"
                    onClick={(ev) => ev.stopPropagation()}
                  >
                    {editandoTel === c.id ? (
                      <input
                        autoFocus
                        type="tel"
                        placeholder="291 4…"
                        className="h-8 w-36 rounded-md border border-madera bg-background px-2 text-sm"
                        value={telDraft}
                        onChange={(ev) => setTelDraft(ev.target.value)}
                        onBlur={() => guardarTelefono(c)}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter") ev.currentTarget.blur();
                          if (ev.key === "Escape") setEditandoTel(null);
                        }}
                      />
                    ) : (
                      <button
                        className="group/tel inline-flex items-center gap-1 rounded px-1 py-0.5 hover:bg-arena/50"
                        title="Click para editar el teléfono"
                        onClick={() => {
                          setEditandoTel(c.id);
                          setTelDraft(c.telefono ?? "");
                        }}
                      >
                        {c.telefono ?? "Sin teléfono"}
                        <Pencil className="h-3 w-3 opacity-0 transition-opacity group-hover/tel:opacity-60" />
                      </button>
                    )}
                    {c.email && (
                      <span className="ml-1 text-xs"> · {c.email}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{c.ciudad ?? "—"}</td>
                  <td className="px-4 py-3">
                    <OrigenBadge origen={c.origen} />
                  </td>
                  <td className="px-4 py-3 text-center">{c.pedidos}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {fechaAR(c.creado)}
                  </td>
                  <td
                    className="px-4 py-3"
                    onClick={(ev) => ev.stopPropagation()}
                  >
                    <div className="flex justify-end">
                      {waLink(
                        c.telefono,
                        `¡Hola ${c.nombre.split(" ")[0]}! Te escribimos de Zatiori.`
                      ) ? (
                        <a
                          href={
                            waLink(
                              c.telefono,
                              `¡Hola ${c.nombre.split(" ")[0]}! Te escribimos de Zatiori.`
                            )!
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`WhatsApp a ${c.nombre}`}
                        >
                          <Button variant="ghost" size="icon" aria-label={`WhatsApp a ${c.nombre}`}>
                            <MessageCircle className="h-4 w-4 text-ok" />
                          </Button>
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
