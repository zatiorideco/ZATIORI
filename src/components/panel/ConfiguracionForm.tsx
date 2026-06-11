"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Config = {
  nombreNegocio: string;
  direccion: string;
  whatsapp: string;
  instagram: string;
  emailContacto: string;
  datosFiscales: string;
  horarios: string;
  textoNosotros: string;
  textoTerminos: string;
  igBusinessId: string;
  fbPageId: string;
  igConfigurado: boolean;
};

export function ConfiguracionForm({ config }: { config: Config }) {
  const router = useRouter();
  const [datos, setDatos] = useState(config);
  const [igToken, setIgToken] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setMensaje("");
    const res = await fetch("/api/admin/configuracion", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombreNegocio: datos.nombreNegocio,
        direccion: datos.direccion || null,
        whatsapp: datos.whatsapp || null,
        instagram: datos.instagram || null,
        emailContacto: datos.emailContacto || null,
        datosFiscales: datos.datosFiscales || null,
        horarios: datos.horarios || null,
        textoNosotros: datos.textoNosotros || null,
        textoTerminos: datos.textoTerminos || null,
        igBusinessId: datos.igBusinessId || null,
        fbPageId: datos.fbPageId || null,
        ...(igToken && { igToken }),
      }),
    });
    setGuardando(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMensaje(data.error ?? "No se pudo guardar.");
      return;
    }
    setMensaje("Guardado ✓");
    if (igToken) {
      setDatos({ ...datos, igConfigurado: true });
      setIgToken("");
    }
    router.refresh();
  }

  const campos: Array<[keyof Config, string]> = [
    ["nombreNegocio", "Nombre del negocio"],
    ["whatsapp", "WhatsApp (549...)"],
    ["instagram", "Instagram (sin @)"],
    ["emailContacto", "Email de contacto"],
    ["direccion", "Dirección"],
    ["horarios", "Horarios"],
    ["datosFiscales", "Datos fiscales"],
  ];

  return (
    <form onSubmit={guardar}>
      <h1 className="font-display text-3xl uppercase text-espresso">
        Configuración
      </h1>

      <div className="mt-4 grid gap-4 rounded-lg border border-arena bg-card p-4 sm:grid-cols-2">
        {campos.map(([campo, label]) => (
          <div key={campo} className="space-y-1">
            <Label htmlFor={`c-${campo}`}>{label}</Label>
            <Input
              id={`c-${campo}`}
              value={datos[campo] as string}
              onChange={(e) => setDatos({ ...datos, [campo]: e.target.value })}
            />
          </div>
        ))}
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="c-nosotros">Texto “Nosotros” (separá párrafos con línea en blanco)</Label>
          <textarea
            id="c-nosotros"
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={datos.textoNosotros}
            onChange={(e) => setDatos({ ...datos, textoNosotros: e.target.value })}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="c-terminos">Términos y condiciones</Label>
          <textarea
            id="c-terminos"
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={datos.textoTerminos}
            onChange={(e) => setDatos({ ...datos, textoTerminos: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-arena bg-card p-4">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl uppercase text-espresso">
            Conexión con Instagram
          </h2>
          {datos.igConfigurado && (
            <Badge variant="accent">
              <ShieldCheck className="mr-1 h-3 w-3" /> Token cargado y cifrado
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Para el publicador: token de larga duración de la Graph API. Se
          guarda cifrado (AES-256-GCM) y nunca sale del servidor.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="c-igbiz">IG Business ID</Label>
            <Input
              id="c-igbiz"
              value={datos.igBusinessId}
              onChange={(e) => setDatos({ ...datos, igBusinessId: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="c-fbpage">Facebook Page ID</Label>
            <Input
              id="c-fbpage"
              value={datos.fbPageId}
              onChange={(e) => setDatos({ ...datos, fbPageId: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="c-igtoken">
              {datos.igConfigurado ? "Reemplazar token" : "Token de acceso"}
            </Label>
            <Input
              id="c-igtoken"
              type="password"
              placeholder={datos.igConfigurado ? "••••••••" : "EAAG..."}
              value={igToken}
              onChange={(e) => setIgToken(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button type="submit" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar configuración"}
        </Button>
        {mensaje && (
          <p className={`text-sm ${mensaje.includes("✓") ? "text-ok" : "text-destructive"}`}>
            {mensaje}
          </p>
        )}
      </div>
    </form>
  );
}
