"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function enviar(tipo: string, path: string, referrer = "") {
  fetch("/api/track", {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tipo, path, referrer }),
  }).catch(() => {});
}

/** Analítica propia: registra pageviews y clicks a WhatsApp/Instagram. */
export function Analytics() {
  const pathname = usePathname();
  const anterior = useRef<string | null>(null);

  // Pageviews (incluye navegación interna del sitio)
  useEffect(() => {
    if (anterior.current === pathname) return;
    const referrer = anterior.current
      ? window.location.origin
      : document.referrer;
    anterior.current = pathname;
    enviar("PAGEVIEW", pathname, referrer);
  }, [pathname]);

  // Clicks salientes a WhatsApp / Instagram (delegado: cubre todos los botones)
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest?.("a");
      if (!a?.href) return;
      if (a.href.includes("wa.me") || a.href.includes("whatsapp")) {
        enviar("WHATSAPP_CLICK", window.location.pathname);
      } else if (a.href.includes("instagram.com")) {
        enviar("INSTAGRAM_CLICK", window.location.pathname);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
