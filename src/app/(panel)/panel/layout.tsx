import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { BotonSalir } from "@/components/panel/BotonSalir";
import { PanelNav } from "@/components/panel/PanelNav";

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
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Link href="/panel" className="font-display text-xl tracking-widest">
              ZATIORI
            </Link>
            <span className="hidden text-xs uppercase tracking-wider text-arena sm:inline">
              Panel de gestión
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline">{session.user.name}</span>
            <Badge variant="accent">{session.user.rol}</Badge>
            <BotonSalir />
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="border-b border-arena bg-crema px-2 md:w-56 md:border-b-0 md:border-r md:px-3 md:py-6">
          <PanelNav rol={session.user.rol} />
        </aside>
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
