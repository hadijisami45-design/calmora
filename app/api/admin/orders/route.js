import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { adminConnecte } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await adminConnecte())) return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  try {
    const r = await query(
      `select o.id, o.order_number, o.total_price, o.first_name, o.last_name, o.phone, o.address, o.city,
              o.status, o.created_at, o.updated_at, o.review_token,
              exists (select 1 from reviews r where r.order_id = o.id) as has_review,
              coalesce(
                json_agg(json_build_object('product_id', i.product_id, 'product_name', i.product_name,
                                           'quantity', i.quantity, 'unit_price', i.unit_price, 'line_total', i.line_total)
                         order by i.product_name) filter (where i.id is not null),
                '[]'::json) as items
         from orders o
         left join order_items i on i.order_id = o.id
        group by o.id
        order by o.created_at desc
        limit 5000`
    );
    return NextResponse.json({ commandes: r.rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("Erreur liste commandes :", e.message);
    return NextResponse.json({ erreur: "Les commandes n'ont pas pu être chargées." }, { status: 500 });
  }
}
