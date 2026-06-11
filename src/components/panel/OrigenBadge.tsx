import { Badge } from "@/components/ui/badge";

const ETIQUETAS: Record<string, string> = {
  WEB: "Web",
  INSTAGRAM: "Instagram",
  LOCAL: "Local",
  REFERIDO: "Referido",
  WHATSAPP: "WhatsApp",
};

export function OrigenBadge({ origen }: { origen: string }) {
  return <Badge variant="secondary">{ETIQUETAS[origen] ?? origen}</Badge>;
}
