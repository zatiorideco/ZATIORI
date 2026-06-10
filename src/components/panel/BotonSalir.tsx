"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BotonSalir() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-crema hover:bg-espresso hover:text-crema"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOut className="h-4 w-4" /> Salir
    </Button>
  );
}
