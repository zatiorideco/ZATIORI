"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Phone,
  Store,
  Mail,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Interaccion = {
  id: string;
  tipo: string;
  contenido: string;
  fecha: string;
  usuario: string | null;
};

const TIPOS = [
  { valor: "NOTA", label: "Nota", icono: StickyNote },
  { valor: "WHATSAPP", label: "WhatsApp", icono: MessageSquare },
  { valor: "LLAMADA", label: "Llamada", icono: Phone },
  { valor: "VISITA", label: "Visita", icono: Store },
  { valor: "EMAIL", label: "Email", icono: Mail },
];

function iconoDe(tipo: string) {
  return TIPOS.find((t) => t.valor === tipo)?.icono ?? StickyNote;
}

export function Timeline({
  clienteId,
  interacciones,
}: {
  clienteId: string;
  interacciones: Interaccion[];
}) {
  const router = useRouter();
  const [tipo, setTipo] = useState("NOTA");
  const [contenido, setContenido] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function agregar(e: React.FormEvent) {
    e.preventDefault();
    if (!contenido.trim()) return;
    setGuardando(true);
    const res = await fetch(`/api/admin/clientes/${clienteId}/interacciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, contenido: contenido.trim() }),
    });
    setGuardando(false);
    if (res.ok) {
      setContenido("");
      router.refresh();
    }
  }

  return (
    <div className="mt-3">
      <form
        onSubmit={agregar}
        className="rounded-lg border border-arena bg-card p-3"
      >
        <div className="flex flex-wrap gap-1">
          {TIPOS.map((t) => (
            <button
              key={t.valor}
              type="button"
              onClick={() => setTipo(t.valor)}
              className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors ${
                tipo === t.valor
                  ? "border-espresso bg-espresso text-crema"
                  : "border-arena hover:border-madera"
              }`}
            >
              <t.icono className="h-3 w-3" /> {t.label}
            </button>
          ))}
        </div>
        <textarea
          rows={2}
          placeholder="Anotá la llamada, el mensaje, la visita…"
          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <Button size="sm" type="submit" disabled={guardando || !contenido.trim()}>
            {guardando ? "Guardando…" : "Agregar"}
          </Button>
        </div>
      </form>

      <ol className="mt-4 space-y-3">
        {interacciones.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Sin interacciones registradas.
          </p>
        )}
        {interacciones.map((i) => {
          const Icono = iconoDe(i.tipo);
          return (
            <li
              key={i.id}
              className="flex gap-3 rounded-lg border border-arena/60 bg-card p-3"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-arena text-espresso">
                <Icono className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <p className="whitespace-pre-wrap text-sm">{i.contenido}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(i.fecha).toLocaleString("es-AR", {
                    dateStyle: "short",
                    timeStyle: "short",
                    timeZone: "America/Argentina/Buenos_Aires",
                  })}
                  {i.usuario ? ` · ${i.usuario}` : ""}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
