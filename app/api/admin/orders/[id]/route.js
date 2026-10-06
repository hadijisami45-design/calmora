import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { adminConnecte } from "@/lib/session";
import { origineValide } from "@/lib/auth";
import { STATUT_IDS } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function controle(request, params) {
  if (!(await adminConnecte())) return { refus: NextResponse.json({ erreur: "Non autorisé" }, { status: 401 }) };
  if (!origineValide(request)) return { refus: NextResponse.json({ erreur: "Requête refusée." }, { status: 403 }) };
  const { id } = await params;
  if (!UUID.test(id)) return { refus: NextResponse.json({ erreur: "Commande introuvable." }, { status: 404 }) };
  return { id };
}

// Changer le statut
export async function PATCH(request, { params }) {
  const c = await controle(request, params);
  if (c.refus) return c.refus;
  let corps;
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }
  if (!STATUT_IDS.includes(corps?.status)) return NextResponse.json({ erreur: "Statut inconnu." }, { status: 422 });
  try {
    const r = await query("update orders set status = $1 where id = $2 returning id, status, updated_at", [corps.status, c.id]);
    if (!r.rows[0]) return NextResponse.json({ erreur: "Commande introuvable." }, { status: 404 });
    return NextResponse.json({ ok: true, commande: r.rows[0] });
  } catch (e) {
    console.error("Erreur statut :", e.message);
    return NextResponse.json({ erreur: "Le statut n'a pas pu être modifié." }, { status: 500 });
  }
}

// Supprimer définitivement : uniquement une commande « Sans suite »
export async function DELETE(request, { params }) {
  const c = await controle(request, params);
  if (c.refus) return c.refus;
  try {
    const r = await query("delete from orders where id = $1 and status = 'sans_suite' returning id", [c.id]);
    if (!r.rows[0])
      return NextResponse.json({ erreur: "Seules les commandes « Sans suite » peuvent être supprimées." }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Erreur suppression :", e.message);
    return NextResponse.json({ erreur: "La commande n'a pas pu être supprimée." }, { status: 500 });
  }
}
