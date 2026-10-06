import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { COOKIE_SESSION, creerSession, optionsCookie, origineValide, secretPresent } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ESSAIS_MAX = 5;
const BLOCAGE_MINUTES = 15;
// Hash factice : la vérification prend le même temps que l'utilisateur existe ou non.
const HASH_FACTICE = "$2a$12$SX.zFOq0W3dq4qCCmFwmX.t2ywQ0TPrbqS2qEXaKLQ4/onP1U1Vja";

export async function POST(request) {
  if (!origineValide(request)) return NextResponse.json({ erreur: "Requête refusée." }, { status: 403 });
  let corps;
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }
  const username = String(corps?.username ?? "").trim().toLowerCase().slice(0, 60);
  const password = String(corps?.password ?? "").slice(0, 200);
  const refus = () => NextResponse.json({ erreur: "Nom d'utilisateur ou mot de passe incorrect." }, { status: 401 });
  if (!username || !password) return refus();
  if (!secretPresent()) {
    console.error("Connexion admin impossible : SESSION_SECRET est vide ou trop court dans .env.local (32 caractères minimum).");
    return NextResponse.json({ erreur: "Configuration incomplète : SESSION_SECRET manquant dans .env.local." }, { status: 500 });
  }

  try {
    const r = await query("select id, username, password_hash, failed_attempts, locked_until from admins where username = $1", [username]);
    const admin = r.rows[0];

    if (admin?.locked_until && new Date(admin.locked_until) > new Date())
      return NextResponse.json({ erreur: `Trop d'essais. Réessayez dans ${BLOCAGE_MINUTES} minutes.` }, { status: 429 });

    const valide = await bcrypt.compare(password, admin ? admin.password_hash : HASH_FACTICE);
    if (!admin || !valide) {
      if (admin) {
        await query(
          `update admins set
             failed_attempts = case when failed_attempts + 1 >= $2 then 0 else failed_attempts + 1 end,
             locked_until    = case when failed_attempts + 1 >= $2 then now() + ($3 || ' minutes')::interval else null end
           where id = $1`,
          [admin.id, ESSAIS_MAX, String(BLOCAGE_MINUTES)]
        );
      }
      return refus();
    }

    await query("update admins set failed_attempts = 0, locked_until = null where id = $1", [admin.id]);
    const reponse = NextResponse.json({ ok: true });
    reponse.cookies.set(COOKIE_SESSION, await creerSession(admin), optionsCookie(request));
    return reponse;
  } catch (e) {
    console.error("Erreur connexion admin :", e.message);
    return NextResponse.json({ erreur: "Base de données inaccessible : vérifiez DATABASE_URL dans .env.local, puis lancez npm run db:init et npm run create-admin." }, { status: 500 });
  }
}
