"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { waLink } from "@/lib/utils";

type Cliente = {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  ciudad: string | null;
  origen: string;
  notas: string | null;
};

function IconoWhatsAppMini() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function ClienteAcciones({ cliente }: { cliente: Cliente }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [datos, setDatos] = useState({
    nombre: cliente.nombre,
    telefono: cliente.telefono ?? "",
    email: cliente.email ?? "",
    direccion: cliente.direccion ?? "",
    ciudad: cliente.ciudad ?? "",
    notas: cliente.notas ?? "",
  });

  const waUrl = waLink(
    cliente.telefono,
    `¡Hola ${cliente.nombre.split(" ")[0]}! Te escribimos de Zatiori.`
  );

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    const res = await fetch(`/api/admin/clientes/${cliente.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: datos.nombre,
        telefono: datos.telefono || null,
        email: datos.email || null,
        direccion: datos.direccion || null,
        ciudad: datos.ciudad || null,
        notas: datos.notas || null,
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

  return (
    <div className="w-full lg:w-auto">
      <div className="flex gap-2">
        {waUrl && (
          <a href={waUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="accent" size="sm">
              <IconoWhatsAppMini /> WhatsApp
            </Button>
          </a>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditando(!editando)}
        >
          {editando ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          {editando ? "Cancelar" : "Editar"}
        </Button>
      </div>

      {!editando ? (
        <dl className="mt-3 space-y-1 text-sm text-muted-foreground">
          {cliente.telefono && <dd>📞 {cliente.telefono}</dd>}
          {cliente.email && <dd>✉️ {cliente.email}</dd>}
          {cliente.direccion && <dd>📍 {cliente.direccion}</dd>}
        </dl>
      ) : (
        <form
          onSubmit={guardar}
          className="mt-3 grid w-full gap-3 rounded-lg border border-arena bg-card p-4 sm:grid-cols-2"
        >
          {(
            [
              ["nombre", "Nombre"],
              ["telefono", "Teléfono"],
              ["email", "Email"],
              ["ciudad", "Ciudad"],
              ["direccion", "Dirección"],
            ] as const
          ).map(([campo, label]) => (
            <div key={campo} className="space-y-1">
              <Label htmlFor={`e-${campo}`}>{label}</Label>
              <Input
                id={`e-${campo}`}
                value={datos[campo]}
                onChange={(e) => setDatos({ ...datos, [campo]: e.target.value })}
              />
            </div>
          ))}
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="e-notas">Notas</Label>
            <textarea
              id="e-notas"
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={datos.notas}
              onChange={(e) => setDatos({ ...datos, notas: e.target.value })}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive sm:col-span-2">{error}</p>
          )}
          <div className="sm:col-span-2">
            <Button type="submit" size="sm" disabled={guardando}>
              {guardando ? "Guardando…" : "Guardar cambios"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
