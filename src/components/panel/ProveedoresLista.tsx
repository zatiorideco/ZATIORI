"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Proveedor = {
  id: string;
  tipo: string;
  nombre: string;
  contacto: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  notas: string | null;
};

const TIPOS = [
  { valor: "MADERA", label: "Madera" },
  { valor: "ESPEJO", label: "Espejos" },
  { valor: "INSUMO", label: "Insumos" },
  { valor: "HERRAJE", label: "Herrajes" },
];

const VACIO = {
  tipo: "MADERA",
  nombre: "",
  contacto: "",
  telefono: "",
  email: "",
  direccion: "",
  notas: "",
};

export function ProveedoresLista({ proveedores }: { proveedores: Proveedor[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<string>("TODOS");
  const [form, setForm] = useState<typeof VACIO & { id?: string }>(VACIO);
  const [abierto, setAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const visibles =
    tab === "TODOS" ? proveedores : proveedores.filter((p) => p.tipo === tab);

  function editar(p: Proveedor) {
    setForm({
      id: p.id,
      tipo: p.tipo,
      nombre: p.nombre,
      contacto: p.contacto ?? "",
      telefono: p.telefono ?? "",
      email: p.email ?? "",
      direccion: p.direccion ?? "",
      notas: p.notas ?? "",
    });
    setAbierto(true);
    setError("");
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    const esEdicion = !!form.id;
    const res = await fetch(
      esEdicion ? `/api/admin/proveedores/${form.id}` : "/api/admin/proveedores",
      {
        method: esEdicion ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: form.tipo,
          nombre: form.nombre,
          contacto: form.contacto || (esEdicion ? null : ""),
          telefono: form.telefono || (esEdicion ? null : ""),
          email: form.email || (esEdicion ? null : ""),
          direccion: form.direccion || (esEdicion ? null : ""),
          notas: form.notas || (esEdicion ? null : ""),
        }),
      }
    );
    setGuardando(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo guardar.");
      return;
    }
    setForm(VACIO);
    setAbierto(false);
    router.refresh();
  }

  async function borrar(p: Proveedor) {
    if (!confirm(`¿Borrar al proveedor "${p.nombre}"?`)) return;
    const res = await fetch(`/api/admin/proveedores/${p.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "No se pudo borrar.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl uppercase text-espresso">
          Proveedores
        </h1>
        <Button
          onClick={() => {
            setForm(VACIO);
            setAbierto(!abierto);
            setError("");
          }}
        >
          {abierto ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {abierto ? "Cancelar" : "Nuevo proveedor"}
        </Button>
      </div>

      {abierto && (
        <form
          onSubmit={guardar}
          className="mt-4 grid gap-4 rounded-lg border border-arena bg-card p-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div className="space-y-1">
            <Label>Tipo *</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              {TIPOS.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          {(
            [
              ["nombre", "Nombre *"],
              ["contacto", "Persona de contacto"],
              ["telefono", "Teléfono"],
              ["email", "Email"],
              ["direccion", "Dirección"],
            ] as const
          ).map(([campo, label]) => (
            <div key={campo} className="space-y-1">
              <Label htmlFor={`p-${campo}`}>{label}</Label>
              <Input
                id={`p-${campo}`}
                required={campo === "nombre"}
                value={form[campo]}
                onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
              />
            </div>
          ))}
          <div className="space-y-1 sm:col-span-2 lg:col-span-3">
            <Label htmlFor="p-notas">Notas</Label>
            <textarea
              id="p-notas"
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive lg:col-span-3">{error}</p>
          )}
          <div>
            <Button type="submit" disabled={guardando}>
              {guardando
                ? "Guardando…"
                : form.id
                  ? "Guardar cambios"
                  : "Crear proveedor"}
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {[{ valor: "TODOS", label: "Todos" }, ...TIPOS].map((t) => (
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

      {visibles.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          No hay proveedores cargados en esta categoría.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-arena bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-arena text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((p) => (
                <tr key={p.id} className="border-b border-arena/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-espresso">
                    {p.nombre}
                  </td>
                  <td className="px-4 py-3">
                    {TIPOS.find((t) => t.valor === p.tipo)?.label ?? p.tipo}
                  </td>
                  <td className="px-4 py-3">{p.contacto ?? "—"}</td>
                  <td className="px-4 py-3">{p.telefono ?? "—"}</td>
                  <td className="px-4 py-3">{p.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => editar(p)}
                        aria-label={`Editar ${p.nombre}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => borrar(p)}
                        aria-label={`Borrar ${p.nombre}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
