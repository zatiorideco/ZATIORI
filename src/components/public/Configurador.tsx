"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, formatARS } from "@/lib/utils";
import { whatsappLink } from "@/lib/constants";

export type OpcionUI = {
  id: string;
  tipo: "MADERA" | "PATINA" | "TALLADO" | "TAMANO" | "EXTRA";
  nombre: string;
  descripcion: string | null;
  precioAdicional: number;
};

type Props = {
  opciones: OpcionUI[];
  precioM2: number;
  precioMinimo: number;
};

type Seleccion = {
  tamanoId?: string;
  ancho?: string;
  alto?: string;
  maderaId?: string;
  patinaId?: string;
  talladoId?: string;
  extrasIds: string[];
  nombre: string;
  whatsapp: string;
  email: string;
  ciudad: string;
  notas: string;
};

const PASOS = ["Medidas", "Madera", "Pátina", "Tallado", "Extras", "Contacto"];

function OpcionCard({
  opcion,
  activa,
  onClick,
  multi,
}: {
  opcion: OpcionUI;
  activa: boolean;
  onClick: () => void;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full rounded-lg border-2 bg-card p-4 text-left transition-colors",
        activa ? "border-madera bg-arena/40" : "border-arena hover:border-madera/50"
      )}
    >
      {activa && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-madera text-crema">
          <Check className="h-3 w-3" />
        </span>
      )}
      <p className="pr-8 font-medium text-espresso">{opcion.nombre}</p>
      {opcion.descripcion && (
        <p className="mt-1 text-sm text-muted-foreground">{opcion.descripcion}</p>
      )}
      <p className="mt-2 text-sm font-medium text-madera">
        {opcion.precioAdicional > 0
          ? `+ ${formatARS(opcion.precioAdicional)}`
          : multi
            ? "Sin costo"
            : "Incluido"}
      </p>
    </button>
  );
}

export function Configurador({ opciones, precioM2, precioMinimo }: Props) {
  const [paso, setPaso] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<{
    numero: string;
    total: number;
  } | null>(null);
  const [sel, setSel] = useState<Seleccion>({
    extrasIds: [],
    nombre: "",
    whatsapp: "",
    email: "",
    ciudad: "",
    notas: "",
  });

  const por = (tipo: OpcionUI["tipo"]) => opciones.filter((o) => o.tipo === tipo);
  const buscar = (id?: string) => opciones.find((o) => o.id === id);

  const tamano = buscar(sel.tamanoId);
  const esCustom = tamano ? tamano.precioAdicional === 0 : false;
  const anchoNum = parseInt(sel.ancho ?? "", 10);
  const altoNum = parseInt(sel.alto ?? "", 10);
  const medidasValidas =
    anchoNum >= 20 && anchoNum <= 300 && altoNum >= 20 && altoNum <= 300;

  const total = useMemo(() => {
    let base = 0;
    if (tamano && tamano.precioAdicional > 0) base = tamano.precioAdicional;
    else if (medidasValidas) {
      base = Math.max(
        Math.round(((anchoNum / 100) * (altoNum / 100) * precioM2) / 1000) * 1000,
        precioMinimo
      );
    }
    const extras = sel.extrasIds.reduce(
      (s, id) => s + (buscar(id)?.precioAdicional ?? 0),
      0
    );
    return (
      base +
      (buscar(sel.maderaId)?.precioAdicional ?? 0) +
      (buscar(sel.patinaId)?.precioAdicional ?? 0) +
      (buscar(sel.talladoId)?.precioAdicional ?? 0) +
      extras
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, anchoNum, altoNum]);

  const puedeAvanzar = [
    !!sel.tamanoId && (!esCustom || medidasValidas),
    !!sel.maderaId,
    !!sel.patinaId,
    !!sel.talladoId,
    true, // extras opcionales
    sel.nombre.trim().length >= 2 && sel.whatsapp.trim().length >= 8,
  ][paso];

  async function enviar() {
    setEnviando(true);
    setError("");
    try {
      const res = await fetch("/api/configurador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tamanoId: sel.tamanoId,
          ancho: esCustom && medidasValidas ? anchoNum : undefined,
          alto: esCustom && medidasValidas ? altoNum : undefined,
          maderaId: sel.maderaId,
          patinaId: sel.patinaId,
          talladoId: sel.talladoId,
          extrasIds: sel.extrasIds,
          contacto: {
            nombre: sel.nombre.trim(),
            whatsapp: sel.whatsapp.trim(),
            email: sel.email.trim() || undefined,
            ciudad: sel.ciudad.trim() || undefined,
            notas: sel.notas.trim() || undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error inesperado");
      setResultado(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos enviar el pedido.");
    } finally {
      setEnviando(false);
    }
  }

  // ── Pantalla de éxito ──
  if (resultado) {
    const mensajeWA = `¡Hola Zatiori! Acabo de armar mi espejo en la web. Mi pedido es el ${resultado.numero} (estimado ${formatARS(resultado.total)}). ¿Cómo seguimos?`;
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <PartyPopper className="mx-auto h-12 w-12 text-madera" />
        <h2 className="mt-4 font-display text-3xl uppercase text-espresso">
          ¡Pedido recibido!
        </h2>
        <p className="mt-3 font-editorial text-lg text-negro/80">
          Tu número de pedido es{" "}
          <span className="font-semibold text-espresso">{resultado.numero}</span>{" "}
          y el precio estimado {formatARS(resultado.total)}. Ya entró a la cola
          del taller: te vamos a escribir para confirmar los detalles y la seña.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <a href={whatsappLink(mensajeWA)} target="_blank" rel="noopener noreferrer">
            <Button size="lg">Confirmar por WhatsApp ahora</Button>
          </a>
          <Link href="/catalogo" className="text-sm underline hover:text-madera">
            Seguir viendo el catálogo
          </Link>
        </div>
      </div>
    );
  }

  // ── Wizard ──
  return (
    <div className="mx-auto max-w-2xl">
      {/* Progreso */}
      <ol className="flex items-center gap-1">
        {PASOS.map((nombre, i) => (
          <li key={nombre} className="flex-1">
            <button
              type="button"
              disabled={i > paso}
              onClick={() => setPaso(i)}
              className="w-full"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full",
                  i <= paso ? "bg-madera" : "bg-arena"
                )}
              />
              <span
                className={cn(
                  "mt-1 hidden text-[11px] uppercase tracking-wide sm:block",
                  i === paso ? "text-espresso" : "text-muted-foreground"
                )}
              >
                {nombre}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <h2 className="mt-6 font-display text-2xl uppercase text-espresso">
        {paso + 1}. {PASOS[paso]}
      </h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {paso === 0 &&
          por("TAMANO").map((o) => (
            <OpcionCard
              key={o.id}
              opcion={o}
              activa={sel.tamanoId === o.id}
              onClick={() => setSel({ ...sel, tamanoId: o.id })}
            />
          ))}
        {paso === 1 &&
          por("MADERA").map((o) => (
            <OpcionCard
              key={o.id}
              opcion={o}
              activa={sel.maderaId === o.id}
              onClick={() => setSel({ ...sel, maderaId: o.id })}
            />
          ))}
        {paso === 2 &&
          por("PATINA").map((o) => (
            <OpcionCard
              key={o.id}
              opcion={o}
              activa={sel.patinaId === o.id}
              onClick={() => setSel({ ...sel, patinaId: o.id })}
            />
          ))}
        {paso === 3 &&
          por("TALLADO").map((o) => (
            <OpcionCard
              key={o.id}
              opcion={o}
              activa={sel.talladoId === o.id}
              onClick={() => setSel({ ...sel, talladoId: o.id })}
            />
          ))}
        {paso === 4 &&
          por("EXTRA").map((o) => (
            <OpcionCard
              key={o.id}
              opcion={o}
              multi
              activa={sel.extrasIds.includes(o.id)}
              onClick={() =>
                setSel({
                  ...sel,
                  extrasIds: sel.extrasIds.includes(o.id)
                    ? sel.extrasIds.filter((id) => id !== o.id)
                    : [...sel.extrasIds, o.id],
                })
              }
            />
          ))}
      </div>

      {/* Medidas custom */}
      {paso === 0 && esCustom && (
        <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg border border-arena bg-card p-4">
          <div className="space-y-2">
            <Label htmlFor="ancho">Ancho (cm)</Label>
            <Input
              id="ancho"
              type="number"
              min={20}
              max={300}
              placeholder="120"
              value={sel.ancho ?? ""}
              onChange={(e) => setSel({ ...sel, ancho: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alto">Alto (cm)</Label>
            <Input
              id="alto"
              type="number"
              min={20}
              max={300}
              placeholder="200"
              value={sel.alto ?? ""}
              onChange={(e) => setSel({ ...sel, alto: e.target.value })}
            />
          </div>
          <p className="col-span-2 text-xs text-muted-foreground">
            Entre 20 y 300 cm por lado. El precio es estimado y lo confirmamos
            con vos antes de fabricar.
          </p>
        </div>
      )}

      {/* Contacto */}
      {paso === 5 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={sel.nombre}
              onChange={(e) => setSel({ ...sel, nombre: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp *</Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="291 4 313204"
              value={sel.whatsapp}
              onChange={(e) => setSel({ ...sel, whatsapp: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={sel.email}
              onChange={(e) => setSel({ ...sel, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input
              id="ciudad"
              placeholder="Bahía Blanca"
              value={sel.ciudad}
              onChange={(e) => setSel({ ...sel, ciudad: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notas">¿Algo más que tengamos que saber?</Label>
            <textarea
              id="notas"
              rows={3}
              className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Referencias, fotos que viste en Instagram, dónde va el espejo…"
              value={sel.notas}
              onChange={(e) => setSel({ ...sel, notas: e.target.value })}
            />
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {/* Barra inferior: precio + navegación */}
      <div className="sticky bottom-0 mt-8 flex items-center justify-between gap-4 rounded-t-lg border border-arena bg-crema/95 p-4 backdrop-blur">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Precio estimado
          </p>
          <p className="font-editorial text-2xl text-espresso">
            {total > 0 ? formatARS(total) : "—"}
          </p>
        </div>
        <div className="flex gap-2">
          {paso > 0 && (
            <Button variant="outline" onClick={() => setPaso(paso - 1)}>
              <ArrowLeft className="h-4 w-4" /> Atrás
            </Button>
          )}
          {paso < PASOS.length - 1 ? (
            <Button disabled={!puedeAvanzar} onClick={() => setPaso(paso + 1)}>
              Siguiente <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button disabled={!puedeAvanzar || enviando} onClick={enviar}>
              {enviando ? "Enviando…" : "Enviar pedido"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
