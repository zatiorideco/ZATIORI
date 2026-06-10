import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Protege todo el panel. El detalle fino por rol se resuelve en cada layout/página.
export default withAuth(
  function middleware(req) {
    const rol = req.nextauth.token?.rol;
    const path = req.nextUrl.pathname;

    // FABRICA solo accede al tablero de fábrica y a la lectura de pedidos
    if (
      rol === "FABRICA" &&
      !path.startsWith("/panel/fabrica") &&
      !path.startsWith("/panel/pedidos") &&
      path !== "/panel"
    ) {
      return NextResponse.redirect(new URL("/panel/fabrica", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/panel/:path*", "/panel"],
};
