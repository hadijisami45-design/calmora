import { cookies } from "next/headers";
import { COOKIE_SESSION, lireSession } from "./auth";

// À appeler dans chaque route admin (en plus du middleware).
export async function adminConnecte() {
  const magasin = await cookies();
  return lireSession(magasin.get(COOKIE_SESSION)?.value);
}
