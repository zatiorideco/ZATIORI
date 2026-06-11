"use client";

import { useState } from "react";
import { Check, Copy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PedirResena({
  clienteId,
  nombre,
  telefono,
}: {
  clienteId: string;
  nombre: string;
  telefono: string | null;
}) {
  const [url, setUrl] = useState("");
  const [cargando, setCargando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function generar() {
    setCargando(true);
    const res = await fetch("/api/admin/resenas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clienteId }),
    });
    setCargando(false);
    if (!res.ok) {
      alert("No se pudo generar el link.");
      return;
    }
    const data = await res.json();
    setUrl(data.url);
  }

  const tel = (telefono ?? "").replace(/\D/g, "");
  const waUrl = url && tel
    ? `https://wa.me/${tel.startsWith("54") ? tel : `54${tel}`}?text=${encodeURIComponent(
        `¡Hola ${nombre.split(" ")[0]}! ¿Cómo quedó el espejo en tu casa? Nos ayudaría un montón si nos dejás una reseña acá: ${url}`
      )}`
    : null;

  if (!url) {
    return (
      <Button variant="outline" size="sm" onClick={generar} disabled={cargando}>
        <Star className="h-4 w-4" /> {cargando ? "Generando…" : "Pedir reseña"}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          navigator.clipboard.writeText(url);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 1500);
        }}
      >
        {copiado ? <Check className="h-4 w-4 text-ok" /> : <Copy className="h-4 w-4" />}
        {copiado ? "Copiado" : "Copiar link"}
      </Button>
      {waUrl && (
        <a href={waUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="accent" size="sm">
            Mandar por WhatsApp
          </Button>
        </a>
      )}
    </div>
  );
}
