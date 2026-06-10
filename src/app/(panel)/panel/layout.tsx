import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { BotonSalir } from "@/components/panel/BotonSalir";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/panel");

  return (
    <div className="flex min-h-screen flex-col bg-crema">
      <header className="border-b border-arena bg-negro text-crema">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/panel" className="font-display text-xl tracking-widest">
              ZATIORI
            </Link>
            <span className="text-xs uppercase tracking-wider text-arena">
              Panel de gestión
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span>{session.user.name}</span>
            <Badge variant="accent">{session.user.rol}</Badge>
            <BotonSalir />
          </div>
        </div>
      </header>
      <main className="container flex-1 py-8">{children}</main>
    </div>
  );
}
