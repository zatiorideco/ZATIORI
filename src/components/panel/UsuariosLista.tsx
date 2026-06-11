"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
};

const ROLES = ["ADMIN", "VENTAS", "FABRICA"];

export function UsuariosLista({
  usuarios,
  miId,
}: {
  usuarios: Usuario[];
  miId: string;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [nuevo, setNuevo] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "VENTAS",
  });

  async function patch(id: string, data: Record<string, unknown>) {
    const res = await fetch(`/api/admin/usuarios/${id}`, {
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
    setGuardando(true);
    setError("");
    const res = await fetch("/api/admin/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevo),
    });
    setGuardando(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "No se pudo crear.");
      return;
    }
    setNuevo({ nombre: "", email: "", password: "", rol: "VENTAS" });
    setAbierto(false);
    router.refresh();
  }

  function resetPassword(u: Usuario) {
    const password = prompt(`Nueva contraseña para ${u.nombre} (mínimo 8 caracteres):`);
    if (!password) return;
    if (password.length < 8) {
      alert("Mínimo 8 caracteres.");
      return;
    }
    patch(u.id, { password });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl uppercase text-espresso">Usuarios</h1>
        <Button onClick={() => setAbierto(!abierto)}>
          {abierto ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {abierto ? "Cancelar" : "Nuevo usuario"}
        </Button>
      </div>

      {abierto && (
        <form
          onSubmit={crear}
          className="mt-4 grid gap-4 rounded-lg border border-arena bg-card p-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <div className="space-y-1">
            <Label htmlFor="u-nombre">Nombre *</Label>
            <Input id="u-nombre" required value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="u-email">Email *</Label>
            <Input id="u-email" type="email" required value={nuevo.email} onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="u-pass">Contraseña *</Label>
            <Input id="u-pass" type="password" required minLength={8} value={nuevo.password} onChange={(e) => setNuevo({ ...nuevo, password: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Rol</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
              value={nuevo.rol}
              onChange={(e) => setNuevo({ ...nuevo, rol: e.target.value })}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={guardando} className="w-full">
              {guardando ? "Creando…" : "Crear"}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive lg:col-span-5">{error}</p>}
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-arena bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arena text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3 text-center">Activo</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-arena/50 last:border-0">
                <td className="px-4 py-3 font-medium text-espresso">
                  {u.nombre} {u.id === miId && <Badge variant="secondary">vos</Badge>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                    value={u.rol}
                    disabled={u.id === miId}
                    onChange={(e) => patch(u.id, { rol: e.target.value })}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-madera"
                    checked={u.activo}
                    disabled={u.id === miId}
                    onChange={(e) => patch(u.id, { activo: e.target.checked })}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => resetPassword(u)}>
                    <KeyRound className="h-4 w-4" /> Contraseña
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
