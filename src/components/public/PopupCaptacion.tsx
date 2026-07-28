"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STORAGE_KEY = "zatiori_popup_visto";
const DELAY_MS = 10_000;

/** Popup de captación: a los 10 segundos ofrece avisar cuando entran piezas
 *  nuevas a cambio de nombre + WhatsApp. Se muestra una sola vez por visitante
 *  (localStorage) y crea el cliente en el CRM. */
export function PopupCaptacion() {
  const [visible, setVisible] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState("");
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return; // sin localStorage no molestamos en cada visita
    }
    const timer = setTimeout(() => {
      setVisible(true);
      try {
        localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      } catch {}
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  function cerrar() {
    setVisible(false);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError("");
    try {
      const res = await fetch("/api/captacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre.trim(), whatsapp: whatsapp.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "No pudimos anotarte.");
      setListo(true);
      setTimeout(() => setVisible(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos anotarte.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-negro/40 p-4 backdrop-blur-sm sm:items-center"
      onClick={cerrar}
      role="dialog"
      aria-modal="true"
      aria-label="Enterate primero cuando entran piezas nuevas"
    >
      <div
        className="w-full max-w-md rounded-lg border border-arena bg-crema p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <Sparkles className="h-7 w-7 shrink-0 text-madera" />
          <button
            onClick={cerrar}
            aria-label="Cerrar"
            className="rounded p-1 text-muted-foreground transition-colors hover:text-espresso"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {listo ? (
          <div className="mt-2 text-center">
            <h2 className="font-display text-2xl uppercase text-espresso">
              ¡Listo!
            </h2>
            <p className="mt-2 font-editorial text-negro/80">
              Te escribimos por WhatsApp apenas entren piezas nuevas.
            </p>
          </div>
        ) : (
          <>
            <h2 className="mt-2 font-display text-2xl uppercase leading-tight text-espresso">
              Enterate primero cuando entran piezas nuevas
            </h2>
            <p className="mt-2 font-editorial text-negro/80">
              Cada espejo es único y los más lindos vuelan. Dejanos tu WhatsApp
              y te avisamos antes que a nadie.
            </p>
            <form onSubmit={enviar} className="mt-5 space-y-3">
              <div className="space-y-1">
                <Label htmlFor="popup-nombre">Nombre</Label>
                <Input
                  id="popup-nombre"
                  required
                  minLength={2}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="popup-whatsapp">WhatsApp</Label>
                <Input
                  id="popup-whatsapp"
                  type="tel"
                  required
                  minLength={8}
                  placeholder="291 4 313204"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={enviando} className="w-full">
                {enviando ? "Anotando…" : "Quiero enterarme primero"}
              </Button>
              <button
                type="button"
                onClick={cerrar}
                className="w-full text-center text-xs text-muted-foreground underline hover:text-espresso"
              >
                Ahora no, gracias
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
