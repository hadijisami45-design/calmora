import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { validerCommande } from "@/lib/validation";
import { COMMANDES_MAX_PAR_HEURE } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  let corps;
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }

  // Champ piège invisible : seuls les robots le remplissent.
  if (corps?.website) return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });

  const v = validerCommande(corps);
  if (!v.ok) return NextResponse.json({ erreur: "Vérifiez les champs du formulaire.", erreurs: v.erreurs }, { status: 422 });
  const { lignes, lastName, firstName, phone, address, city, submissionId } = v.donnees;

  // Les prix viennent TOUJOURS de la configuration du serveur, jamais du navigateur.
  const articles = lignes.map(({ produit, quantite }) => ({
    product_id: produit.id,
    product_name: produit.nom,
    quantity: quantite,
    unit_price: produit.prix,
    line_total: produit.prix * quantite,
  }));
  const total = articles.reduce((s, a) => s + a.line_total, 0);

  try {
    // Frein anti-abus (réglable dans lib/config.js)
    const recent = await query(
      "select count(*)::int as n from orders where phone = $1 and created_at > now() - interval '1 hour' and submission_id <> $2",
      [phone, submissionId]
    );
    if (recent.rows[0].n >= COMMANDES_MAX_PAR_HEURE)
      return NextResponse.json({ erreur: "Trop de commandes pour ce numéro. Réessayez plus tard ou contactez-nous." }, { status: 429 });

    // Une seule requête : la commande et ses lignes sont enregistrées ensemble, ou pas du tout.
    // submission_id est unique : un double clic ou un renvoi du même formulaire ne crée qu'une commande.
    const insertion = await query(
      `with commande as (
         insert into orders (order_number, submission_id, total_price, first_name, last_name, phone, address, city, status)
         values ('CM-' || nextval('order_number_seq'), $1, $2, $3, $4, $5, $6, $7, 'nouvelle')
         on conflict (submission_id) do nothing
         returning id, order_number, total_price, review_token
       ), lignes as (
         insert into order_items (order_id, product_id, product_name, quantity, unit_price, line_total)
         select commande.id, x.product_id, x.product_name, x.quantity, x.unit_price, x.line_total
           from commande,
                jsonb_to_recordset($8::jsonb) as x(product_id text, product_name text, quantity int, unit_price int, line_total int)
         returning 1
       )
       select order_number, total_price, review_token from commande`,
      [submissionId, total, firstName, lastName, phone, address, city, JSON.stringify(articles)]
    );
    let ligne = insertion.rows[0];
    if (!ligne) {
      const existante = await query("select order_number, total_price, review_token from orders where submission_id = $1", [submissionId]);
      ligne = existante.rows[0];
    }
    return NextResponse.json({ ok: true, orderNumber: ligne.order_number, total: ligne.total_price, reviewToken: ligne.review_token }, { status: 201 });
  } catch (e) {
    console.error("Erreur commande :", e.message);
    return NextResponse.json({ erreur: "La commande n'a pas pu être enregistrée. Réessayez dans un instant." }, { status: 500 });
  }
}
