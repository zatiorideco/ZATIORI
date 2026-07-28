"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Copy, EyeOff, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, fechaAR, waLink } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";

type ResenaRow = {
  id: string;
  token: string;
  nombre: string;
  rating: number;
  texto: string;
  fotos: string[];
  aprobada: boolean;
  publicadaWeb: boolean;
  creada: string;
  clienteId: string | null;
  clienteTelefono: string | null;
};

const TABS = [
  { id: "PENDIENTES", label: "Para revisar" },
  { id: "PUBLICADAS", label: "Publicadas" },
  { id: "ESPERANDO", label: "Esperando respuesta" },
  { id: "TODAS", label: "Todas" },
];

function Estrellas({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating ? "fill-madera text-madera" : "text-arena"
          )}
        />
      ))}
    </div>
  );
}

export function ResenasLista({ resenas }: { resenas: ResenaRow[] }) {
  const router = useRouter();
  const [tab, setTab] = useState("PENDIENTES");
  const [copiado, setCopiado] = useState<string | null>(null);

  const visibles = resenas.filter((r) => {
    if (tab === "PENDIENTES") return r.texto !== "" && !r.aprobada;
    if (tab === "PUBLICADAS") return r.aprobada && r.publicadaWeb;
    if (tab === "ESPERANDO") return r.texto === "";
    return true;
  });

  async function patch(id: string, data: Record<string, boolean>) {
    const res = await fetch(`/api/admin/resenas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "No se pudo actualizar.");
      return;
    }
    router.refresh();
  }

  async function borrar(r: ResenaRow) {
    if (!confirm(`¿Borrar la reseña de ${r.nombre}?`)) return;
    const res = await fetch(`/api/admin/resenas/${r.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  function copiarLink(r: ResenaRow) {
    navigator.clipboard.writeText(`${SITE_URL}/resena/${r.token}`);
    setCopiado(r.id);
    setTimeout(() => setCopiado(null), 1500);
  }

  function linkWA(r: ResenaRow) {
    const url = `${SITE_URL}/resena/${r.token}`;
    return waLink(
      r.clienteTelefono,
      `¡Hola ${r.nombre.split(" ")[0]}! ¿Cómo quedó el espejo en tu casa? Nos ayudaría un montón si nos dejás una reseña acá: ${url}`
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl uppercase text-espresso">Reseñas</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Las invitaciones se generan desde la ficha del cliente. Nada se publica
        sin tu aprobación.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              tab === t.id
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
          Nada por acá todavía.
        </p>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {visibles.map((r) => (
            <div key={r.id} className="rounded-lg border border-arena bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-espresso">{r.nombre}</p>
                  <div className="mt-1 flex items-center gap-2">
                    {r.texto !== "" && <Estrellas rating={r.rating} />}
                    <span className="text-xs text-muted-foreground">
                      {fechaAR(r.creada)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {r.texto === "" ? (
                    <Badge variant="secondary">Esperando</Badge>
                  ) : r.aprobada && r.publicadaWeb ? (
                    <Badge variant="accent">En la web</Badge>
                  ) : (
                    <Badge variant="outline">Para revisar</Badge>
                  )}
                </div>
              </div>

              {r.texto !== "" ? (
                <p className="mt-3 font-editorial text-sm text-negro/85">
                  “{r.texto}”
                </p>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  El cliente todavía no completó la reseña. Mandale el link:
                </p>
              )}

              {r.fotos.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {r.fotos.map((foto) => (
                    <a key={foto} href={foto} target="_blank" rel="noopener noreferrer">
                      <div className="relative h-16 w-16">
                        <Image src={foto} alt="Foto de la reseña" fill className="rounded-md object-cover" sizes="64px" />
                      </div>
                    </a>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2 border-t border-arena/60 pt-3">
                {r.texto === "" ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => copiarLink(r)}>
                      {copiado === r.id ? <Check className="h-4 w-4 text-ok" /> : <Copy className="h-4 w-4" />}
                      {copiado === r.id ? "Copiado" : "Copiar link"}
                    </Button>
                    {linkWA(r) && (
                      <a href={linkWA(r)!} target="_blank" rel="noopener noreferrer">
                        <Button variant="accent" size="sm">Pedir por WhatsApp</Button>
                      </a>
                    )}
                  </>
                ) : r.aprobada && r.publicadaWeb ? (
                  <Button variant="outline" size="sm" onClick={() => patch(r.id, { publicadaWeb: false, aprobada: false })}>
                    <EyeOff className="h-4 w-4" /> Despublicar
                  </Button>
                ) : (
                  <Button variant="accent" size="sm" onClick={() => patch(r.id, { aprobada: true, publicadaWeb: true })}>
                    <Check className="h-4 w-4" /> Aprobar y publicar
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => borrar(r)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
