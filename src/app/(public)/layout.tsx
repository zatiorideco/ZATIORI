import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { BotonesFlotantes } from "@/components/public/BotonesFlotantes";
import { Analytics } from "@/components/public/Analytics";
import { PopupCaptacion } from "@/components/public/PopupCaptacion";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <BotonesFlotantes />
      <PopupCaptacion />
      <Analytics />
    </div>
  );
}
