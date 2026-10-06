import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { adminConnecte } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await adminConnecte())) return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  try {
    const r = await query(
      `select r.id, r.rating, r.comment, r.status, r.created_at,
              o.order_number, o.first_name, o.last_name, o.city, o.status as order_status
         from reviews r join orders o on o.id = r.order_id
        order by r.created_at desc
        limit 2000`
    );
    return NextResponse.json({ avis: r.rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("Erreur liste avis admin :", e.message);
    return NextResponse.json({ erreur: "Les avis n'ont pas pu être chargés. Lancez « npm run db:init » si la base n'a pas été mise à jour." }, { status: 500 });
  }
}
