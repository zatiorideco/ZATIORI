"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ImagePlus, Loader2, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function ResenaForm({
  token,
  nombreInicial,
  yaEnviada,
}: {
  token: string;
  nombreInicial: string;
  yaEnviada: boolean;
}) {
  const inputArchivo = useRef<HTMLInputElement>(null);
  const [enviada, setEnviada] = useState(yaEnviada);
  const [nombre, setNombre] = useState(nombreInicial);
  const [rating, setRating] = useState(5);
  const [texto, setTexto] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function subir(archivos: FileList | null) {
    if (!archivos?.length || fotos.length >= 3) return;
    setSubiendo(true);
    setError("");
    for (const archivo of Array.from(archivos).slice(0, 3 - fotos.length)) {
      const fd = new FormData();
      fd.append("file", archivo);
      const res = await fetch(`/api/resenas/${token}/foto`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No se pudo subir la foto.");
        break;
      }
      setFotos((f) => [...f, data.url]);
    }
    setSubiendo(false);
    if (inputArchivo.current) inputArchivo.current.value = "";
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError("");
    const res = await fetch(`/api/resenas/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombre.trim(), rating, texto: texto.trim(), fotos }),
    });
    setEnviando(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo enviar. Probá de nuevo.");
      return;
    }
    setEnviada(true);
  }

  if (enviada) {
    return (
      <div className="rounded-lg border border-arena bg-card p-8 text-center">
        <Heart className="mx-auto h-10 w-10 text-madera" />
        <h2 className="mt-4 font-display text-2xl uppercase text-espresso">
          ¡Gracias!
        </h2>
        <p className="mt-2 font-editorial text-lg text-negro/80">
          Recibimos tu reseña. La revisamos y en breve aparece en la web.
        </p>
        <Link href="/catalogo" className="mt-6 inline-block">
          <Button variant="outline">Ver el catálogo</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-5 rounded-lg border border-arena bg-card p-6">
      <div className="space-y-1">
        <Label>Puntaje</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} estrellas`}
            >
              <Star
                className={cn(
                  "h-8 w-8 transition-colors",
                  n <= rating ? "fill-madera text-madera" : "text-arena"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="r-nombre">Tu nombre</Label>
        <Input
          id="r-nombre"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="r-texto">Contanos cómo fue la experiencia</Label>
        <textarea
          id="r-texto"
          rows={4}
          required
          minLength={5}
          placeholder="El espejo, la atención, cómo llegó, cómo queda en tu casa…"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label>Fotos de tu espejo (opcional, hasta 3)</Label>
        <div className="flex flex-wrap gap-3">
          {fotos.map((foto, i) => (
            <div key={foto} className="group relative h-20 w-20">
              <Image src={foto} alt={`Foto ${i + 1}`} fill className="rounded-md object-cover" sizes="80px" />
              <button
                type="button"
                onClick={() => setFotos(fotos.filter((_, j) => j !== i))}
                className="absolute -right-2 -top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-destructive text-white group-hover:flex"
                aria-label="Quitar foto"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {fotos.length < 3 && (
            <button
              type="button"
              onClick={() => inputArchivo.current?.click()}
              disabled={subiendo}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-arena text-muted-foreground hover:border-madera hover:text-madera"
            >
              {subiendo ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ImagePlus className="h-5 w-5" />
              )}
            </button>
          )}
          <input
            ref={inputArchivo}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => subir(e.target.files)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={enviando || subiendo}>
        {enviando ? "Enviando…" : "Enviar reseña"}
      </Button>
    </form>
  );
}
