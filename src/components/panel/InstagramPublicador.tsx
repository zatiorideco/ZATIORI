"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ExternalLink, Plus, Send, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn, fechaAR, formatARS } from "@/lib/utils";

type EspejoOpt = {
  id: string;
  nombre: string;
  fotos: string[];
  precio: number;
  medidas: string | null;
};

type Publicacion = {
  id: string;
  caption: string;
  imagenes: string[];
  estado: string;
  fechaProgramada: string | null;
  igPermalink: string | null;
  errorMensaje: string | null;
  espejo: string | null;
  creada: string;
};

const ESTADO_BADGE: Record<string, { label: string; variant: "secondary" | "accent" | "destructive" | "outline" }> = {
  BORRADOR: { label: "Borrador", variant: "secondary" },
  PROGRAMADA: { label: "Programada", variant: "outline" },
  PUBLICADA: { label: "Publicada", variant: "accent" },
  ERROR: { label: "Error", variant: "destructive" },
};

export function InstagramPublicador({
  publicaciones,
  espejos,
  igConectado,
}: {
  publicaciones: Publicacion[];
  espejos: EspejoOpt[];
  igConectado: boolean;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [espejoId, setEspejoId] = useState("");
  const [caption, setCaption] = useState("");
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [fecha, setFecha] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [publicando, setPublicando] = useState<string | null>(null);

  const espejo = espejos.find((e) => e.id === espejoId);

  function elegirEspejo(id: string) {
    setEspejoId(id);
    const e = espejos.find((x) => x.id === id);
    if (e) {
      setImagenes(e.fotos.slice(0, 10));
      setCaption(
        `✨ ${e.nombre}${e.medidas ? ` · ${e.medidas}` : ""}\n\nPieza única hecha a mano en nuestro taller de Bahía Blanca. Marcos de madera con pátinas artesanales.\n\n💬 Consultas por DM o WhatsApp\n📍 Bahía Blanca, Argentina\n\n#espejos #decoracion #maderareciclada #hechoamano #bahiablanca #deco #espejosartesanales`
      );
    } else {
      setImagenes([]);
    }
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    const res = await fetch("/api/admin/instagram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        espejoCatalogoId: espejoId || null,
        caption,
        imagenes,
        fechaProgramada: fecha ? new Date(fecha).toISOString() : null,
      }),
    });
    setGuardando(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "No se pudo crear el borrador.");
      return;
    }
    setAbierto(false);
    setEspejoId("");
    setCaption("");
    setImagenes([]);
    setFecha("");
    router.refresh();
  }

  async function publicar(p: Publicacion) {
    if (
      !confirm(
        `¿Publicar AHORA en Instagram?\n\n"${p.caption.slice(0, 80)}…"\n\nEsta acción es pública y no se puede deshacer desde acá.`
      )
    )
      return;
    setPublicando(p.id);
    const res = await fetch(`/api/admin/instagram/${p.id}/publicar`, {
      method: "POST",
    });
    setPublicando(null);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error ?? "No se pudo publicar.");
    }
    router.refresh();
  }

  async function borrar(p: Publicacion) {
    if (!confirm("¿Borrar este borrador?")) return;
    await fetch(`/api/admin/instagram/${p.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl uppercase text-espresso">
          Publicador de Instagram
        </h1>
        <Button onClick={() => setAbierto(!abierto)}>
          {abierto ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {abierto ? "Cancelar" : "Nueva publicación"}
        </Button>
      </div>

      {!igConectado && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-warn/40 bg-warn/10 p-3 text-sm text-warn">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Instagram no está conectado todavía: cargá el token y el Business ID
            en{" "}
            <Link href="/panel/configuracion" className="underline">
              Configuración
            </Link>
            . Mientras tanto podés dejar borradores listos.
          </span>
        </div>
      )}

      {abierto && (
        <form onSubmit={crear} className="mt-4 grid gap-4 rounded-lg border border-arena bg-card p-4 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Espejo del catálogo (opcional)</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={espejoId}
                onChange={(e) => elegirEspejo(e.target.value)}
              >
                <option value="">Publicación libre</option>
                {espejos.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre} {e.precio > 0 ? `(${formatARS(e.precio)})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="ig-caption">Caption *</Label>
              <textarea
                id="ig-caption"
                rows={9}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ig-fecha">Programar para (opcional)</Label>
              <Input
                id="ig-fecha"
                type="datetime-local"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Sin fecha queda como borrador. Las programadas se publican solas
                (revisión diaria a las 9 AM).
              </p>
            </div>
          </div>

          <div>
            <Label>Imágenes ({imagenes.length}/10)</Label>
            {espejo ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {espejo.fotos.map((foto) => {
                  const elegida = imagenes.includes(foto);
                  return (
                    <button
                      key={foto}
                      type="button"
                      onClick={() =>
                        setImagenes(
                          elegida
                            ? imagenes.filter((i) => i !== foto)
                            : [...imagenes, foto].slice(0, 10)
                        )
                      }
                      className={cn(
                        "relative h-24 w-24 overflow-hidden rounded-md border-2",
                        elegida ? "border-madera" : "border-transparent opacity-60"
                      )}
                    >
                      <Image src={foto} alt="" fill className="object-cover" sizes="96px" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                {imagenes.map((url, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={url} readOnly className="h-8 text-xs" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => setImagenes(imagenes.filter((_, j) => j !== i))}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Input
                  placeholder="Pegá una URL de imagen y Enter"
                  className="h-9"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const v = (e.target as HTMLInputElement).value.trim();
                      if (v.startsWith("http")) {
                        setImagenes([...imagenes, v].slice(0, 10));
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                />
              </div>
            )}
            <div className="mt-4">
              <Button type="submit" disabled={guardando || imagenes.length === 0 || !caption.trim()}>
                {guardando ? "Guardando…" : fecha ? "Programar" : "Guardar borrador"}
              </Button>
            </div>
          </div>
        </form>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {publicaciones.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Sin publicaciones todavía. Creá la primera con el botón de arriba.
          </p>
        )}
        {publicaciones.map((p) => {
          const badge = ESTADO_BADGE[p.estado] ?? ESTADO_BADGE.BORRADOR;
          return (
            <div key={p.id} className="rounded-lg border border-arena bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                  {p.espejo && (
                    <span className="text-xs text-muted-foreground">{p.espejo}</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {p.estado === "PROGRAMADA" && p.fechaProgramada
                    ? `Para el ${fechaAR(p.fechaProgramada)}`
                    : fechaAR(p.creada)}
                </span>
              </div>

              {p.imagenes.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {p.imagenes.slice(0, 4).map((img, i) => (
                    <div key={i} className="relative h-20 w-20 shrink-0">
                      <Image src={img} alt="" fill className="rounded-md object-cover" sizes="80px" />
                    </div>
                  ))}
                  {p.imagenes.length > 4 && (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-arena text-sm text-espresso">
                      +{p.imagenes.length - 4}
                    </div>
                  )}
                </div>
              )}

              <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm text-negro/80">
                {p.caption}
              </p>

              {p.errorMensaje && (
                <p className="mt-2 text-xs text-destructive">⚠ {p.errorMensaje}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2 border-t border-arena/60 pt-3">
                {p.estado === "PUBLICADA" && p.igPermalink ? (
                  <a href={p.igPermalink} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" /> Ver en Instagram
                    </Button>
                  </a>
                ) : p.estado !== "PUBLICADA" ? (
                  <>
                    <Button
                      variant="accent"
                      size="sm"
                      disabled={!igConectado || publicando === p.id}
                      onClick={() => publicar(p)}
                    >
                      <Send className="h-4 w-4" />
                      {publicando === p.id ? "Publicando…" : "Publicar ahora"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => borrar(p)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
