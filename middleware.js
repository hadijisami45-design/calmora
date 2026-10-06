import { NextResponse } from "next/server";
import { COOKIE_SESSION, lireSession } from "./lib/auth";

// Protège /admin et /api/admin : sans session valide, pas d'accès.
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const publique = pathname === "/admin/login" || pathname === "/api/admin/login";
  const session = await lireSession(request.cookies.get(COOKIE_SESSION)?.value);

  if (publique) {
    if (session && pathname === "/admin/login") return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }
  if (!session) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
