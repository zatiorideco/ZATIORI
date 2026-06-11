"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type EspejoFormData = {
  id?: string;
  nombre: string;
  descripcion: string;
  tipoMarco: string;
  alto: string;
  ancho: string;
  madera: string;
  patina: string;
  tallado: string;
  proveedorId: string;
  precio: string;
  fotos: string[];
  estado: string;
  esStock: boolean;
  publicadoWeb: boolean;
  destacado: boolean;
};

type ProveedorOpt = { id: string; nombre: string };

const TIPOS_MARCO = ["De pie", "Decorativo", "Industrial"];
const ESTADOS = ["DISPONIBLE", "RESERVADO", "VENDIDO"];

export function EspejoForm({
  inicial,
  proveedores,
  esAdmin,
}: {
  inicial: EspejoFormData;
  proveedores: ProveedorOpt[];
  esAdmin: boolean;
}) {
  const router = useRouter();
  const inputArchivo = useRef<HTMLInputElement>(null);
  const [datos, setDatos] = useState(inicial);
  const [urlManual, setUrlManual] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const esEdicion = !!inicial.id;

  async function subirArchivos(archivos: FileList | null) {
    if (!archivos?.length) return;
    setSubiendo(true);
    setError("");
    for (const archivo of Array.from(archivos)) {
      const fd = new FormData();
      fd.append("file", archivo);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No se pudo subir la foto.");
        break;
      }
      setDatos((d) => ({ ...d, fotos: [...d.fotos, data.url] }));
    }
    setSubiendo(false);
    if (inputArchivo.current) inputArchivo.current.value = "";
  }

  function agregarUrl() {
    const url = urlManual.trim();
    if (!url.startsWith("http") && !url.startsWith("/")) return;
    setDatos({ ...datos, fotos: [...datos.fotos, url] });
    setUrlManual("");
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    const body = {
      nombre: datos.nombre,
      descripcion: datos.descripcion || (esEdicion ? null : ""),
      tipoMarco: datos.tipoMarco || (esEdicion ? null : ""),
      alto: datos.alto ? parseInt(datos.alto, 10) : null,
      ancho: datos.ancho ? parseInt(datos.ancho, 10) : null,
      madera: datos.madera || (esEdicion ? null : ""),
      patina: datos.patina || (esEdicion ? null : ""),
      tallado: datos.tallado || (esEdicion ? null : ""),
      proveedorId: datos.proveedorId || null,
      precio: Number(datos.precio) || 0,
      fotos: datos.fotos,
      estado: datos.estado,
      esStock: datos.esStock,
      publicadoWeb: datos.publicadoWeb,
      destacado: datos.destacado,
    };
    const res = await fetch(
      esEdicion ? `/api/admin/espejos/${inicial.id}` : "/api/admin/espejos",
      {
        method: esEdicion ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    setGuardando(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo guardar.");
      return;
    }
    router.push("/panel/catalogo");
    router.refresh();
  }

  async function borrar() {
    if (!inicial.id) return;
    if (!confirm(`¿Borrar "${inicial.nombre}" del catálogo?`)) return;
    const res = await fetch(`/api/admin/espejos/${inicial.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo borrar.");
      return;
    }
    router.push("/panel/catalogo");
    router.refresh();
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/panel/catalogo"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-madera"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al catálogo
      </Link>
      <h1 className="mt-2 font-display text-3xl uppercase text-espresso">
        {esEdicion ? `Editar: ${inicial.nombre}` : "Nuevo espejo"}
      </h1>

      <form onSubmit={guardar} className="mt-6 space-y-6">
        {/* Fotos */}
        <div className="rounded-lg border border-arena bg-card p-4">
          <Label>Fotos</Label>
          <div className="mt-3 flex flex-wrap gap-3">
            {datos.fotos.map((foto, i) => (
              <div key={`${foto}-${i}`} className="group relative h-28 w-20">
                <Image
                  src={foto}
                  alt={`Foto ${i + 1}`}
                  fill
                  className="rounded-md object-cover"
                  sizes="80px"
                />
                <button
                  type="button"
                  onClick={() =>
                    setDatos({
                      ...datos,
                      fotos: datos.fotos.filter((_, j) => j !== i),
                    })
                  }
                  className="absolute -right-2 -top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-destructive text-white group-hover:flex"
                  aria-label="Quitar foto"
                >
                  <X className="h-3 w-3" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 rounded bg-negro/70 px-1 text-[10px] text-crema">
                    Portada
                  </span>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => inputArchivo.current?.click()}
              disabled={subiendo}
              className="flex h-28 w-20 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-arena text-muted-foreground transition-colors hover:border-madera hover:text-madera"
            >
              {subiendo ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ImagePlus className="h-5 w-5" />
              )}
              <span className="text-[10px]">{subiendo ? "Subiendo…" : "Subir"}</span>
            </button>
            <input
              ref={inputArchivo}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              className="hidden"
              onChange={(e) => subirArchivos(e.target.files)}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="…o pegá la URL de una imagen"
              value={urlManual}
              onChange={(e) => setUrlManual(e.target.value)}
            />
            <Button type="button" variant="outline" onClick={agregarUrl}>
              Agregar
            </Button>
          </div>
        </div>

        {/* Datos */}
        <div className="grid gap-4 rounded-lg border border-arena bg-card p-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="f-nombre">Nombre *</Label>
            <Input
              id="f-nombre"
              required
              value={datos.nombre}
              onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="f-desc">Descripción</Label>
            <textarea
              id="f-desc"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={datos.descripcion}
              onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Tipo de marco</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
              value={datos.tipoMarco}
              onChange={(e) => setDatos({ ...datos, tipoMarco: e.target.value })}
            >
              <option value="">Sin tipo</option>
              {TIPOS_MARCO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="f-precio">Precio (ARS) *</Label>
            <Input
              id="f-precio"
              type="number"
              min={0}
              required
              value={datos.precio}
              onChange={(e) => setDatos({ ...datos, precio: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="f-ancho">Ancho (cm)</Label>
            <Input
              id="f-ancho"
              type="number"
              min={1}
              max={500}
              value={datos.ancho}
              onChange={(e) => setDatos({ ...datos, ancho: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="f-alto">Alto (cm)</Label>
            <Input
              id="f-alto"
              type="number"
              min={1}
              max={500}
              value={datos.alto}
              onChange={(e) => setDatos({ ...datos, alto: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="f-madera">Madera</Label>
            <Input
              id="f-madera"
              value={datos.madera}
              onChange={(e) => setDatos({ ...datos, madera: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="f-patina">Pátina</Label>
            <Input
              id="f-patina"
              value={datos.patina}
              onChange={(e) => setDatos({ ...datos, patina: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="f-tallado">Tallado</Label>
            <Input
              id="f-tallado"
              value={datos.tallado}
              onChange={(e) => setDatos({ ...datos, tallado: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Proveedor</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
              value={datos.proveedorId}
              onChange={(e) => setDatos({ ...datos, proveedorId: e.target.value })}
            >
              <option value="">Sin proveedor</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Estado</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
              value={datos.estado}
              onChange={(e) => setDatos({ ...datos, estado: e.target.value })}
            >
              {ESTADOS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
            {(
              [
                ["publicadoWeb", "Publicado en la web"],
                ["destacado", "Destacado en la home"],
                ["esStock", "Es espejo de stock"],
              ] as const
            ).map(([campo, label]) => (
              <label key={campo} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-madera"
                  checked={datos[campo]}
                  onChange={(e) =>
                    setDatos({ ...datos, [campo]: e.target.checked })
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center justify-between">
          <Button type="submit" disabled={guardando || subiendo}>
            {guardando
              ? "Guardando…"
              : esEdicion
                ? "Guardar cambios"
                : "Crear espejo"}
          </Button>
          {esEdicion && esAdmin && (
            <Button type="button" variant="ghost" onClick={borrar}>
              <Trash2 className="h-4 w-4 text-destructive" /> Borrar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
