import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { validerAvis } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Avis publiés (visibles par tout le monde). Seuls le prénom et la ville du client sont montrés.
export async function GET() {
  try {
    const r = await query(
      `select r.id, r.rating, r.comment, r.created_at, o.first_name, o.city
         from reviews r join orders o on o.id = r.order_id
        where r.status = 'publie'
        order by r.created_at desc
        limit 30`
    );
    const stats = await query("select count(*)::int as n, coalesce(round(avg(rating)::numeric, 1), 0)::float as moyenne from reviews where status = 'publie'");
    return NextResponse.json(
      { avis: r.rows, total: stats.rows[0].n, moyenne: stats.rows[0].moyenne },
      { headers: { "Cache-Control": "public, max-age=0, s-maxage=60" } }
    );
  } catch (e) {
    console.error("Erreur liste avis :", e.message);
    return NextResponse.json({ avis: [], total: 0, moyenne: 0 }, { status: 200 });
  }
}

// Dépôt d'un avis : il faut le jeton reçu à la fin d'une commande. Un seul avis par commande.
export async function POST(request) {
  let corps;
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }
  const v = validerAvis(corps);
  if (!v.ok) return NextResponse.json({ erreur: Object.values(v.erreurs)[0], erreurs: v.erreurs }, { status: 422 });
  const { token, rating, comment } = v.donnees;

  try {
    const commande = await query("select id, status from orders where review_token = $1", [token]);
    const c = commande.rows[0];
    if (!c || c.status === "sans_suite")
      return NextResponse.json({ erreur: "Ce lien d'avis n'est pas valide." }, { status: 404 });

    const r = await query(
      "insert into reviews (order_id, rating, comment) values ($1, $2, $3) on conflict (order_id) do nothing returning id",
      [c.id, rating, comment]
    );
    if (!r.rows[0]) return NextResponse.json({ erreur: "Vous avez déjà donné votre avis pour cette commande." }, { status: 409 });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("Erreur dépôt avis :", e.message);
    return NextResponse.json({ erreur: "Votre avis n'a pas pu être enregistré. Réessayez dans un instant." }, { status: 500 });
  }
}
