import type { Rol } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    rol: Rol;
  }
  interface Session {
    user: {
      id: string;
      rol: Rol;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    rol: Rol;
  }
}
