import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { adminConnecte } from "@/lib/session";
import { origineValide } from "@/lib/auth";
import { STATUTS_AVIS } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function controle(request, params) {
  if (!(await adminConnecte())) return { refus: NextResponse.json({ erreur: "Non autorisé" }, { status: 401 }) };
  if (!origineValide(request)) return { refus: NextResponse.json({ erreur: "Requête refusée." }, { status: 403 }) };
  const { id } = await params;
  if (!UUID.test(id)) return { refus: NextResponse.json({ erreur: "Avis introuvable." }, { status: 404 }) };
  return { id };
}

// Publier ou masquer un avis. Le texte et la note du client ne sont pas modifiables.
export async function PATCH(request, { params }) {
  const c = await controle(request, params);
  if (c.refus) return c.refus;
  let corps;
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }
  if (!STATUTS_AVIS.some((s) => s.id === corps?.status)) return NextResponse.json({ erreur: "Statut inconnu." }, { status: 422 });
  try {
    const r = await query("update reviews set status = $1 where id = $2 returning id, status", [corps.status, c.id]);
    if (!r.rows[0]) return NextResponse.json({ erreur: "Avis introuvable." }, { status: 404 });
    return NextResponse.json({ ok: true, avis: r.rows[0] });
  } catch (e) {
    console.error("Erreur statut avis :", e.message);
    return NextResponse.json({ erreur: "L'avis n'a pas pu être modifié." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const c = await controle(request, params);
  if (c.refus) return c.refus;
  try {
    const r = await query("delete from reviews where id = $1 returning id", [c.id]);
    if (!r.rows[0]) return NextResponse.json({ erreur: "Avis introuvable." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Erreur suppression avis :", e.message);
    return NextResponse.json({ erreur: "L'avis n'a pas pu être supprimé." }, { status: 500 });
  }
}
