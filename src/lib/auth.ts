import { type NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Rol } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!usuario || !usuario.activo) return null;
        const valida = await bcrypt.compare(
          credentials.password,
          usuario.passwordHash
        );
        if (!valida) return null;
        return {
          id: usuario.id,
          name: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = user.rol;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.rol = token.rol as Rol;
      }
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}

/** Devuelve la sesión solo si el rol está permitido; null en caso contrario. */
export async function requireRol(...roles: Rol[]) {
  const session = await auth();
  if (!session?.user || !roles.includes(session.user.rol)) return null;
  return session;
}
