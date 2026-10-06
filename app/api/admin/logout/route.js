import { NextResponse } from "next/server";
import { COOKIE_SESSION, optionsCookie, origineValide } from "@/lib/auth";

export async function POST(request) {
  if (!origineValide(request)) return NextResponse.json({ erreur: "Requête refusée." }, { status: 403 });
  const reponse = NextResponse.json({ ok: true });
  reponse.cookies.set(COOKIE_SESSION, "", { ...optionsCookie(request), maxAge: 0 });
  return reponse;
}
