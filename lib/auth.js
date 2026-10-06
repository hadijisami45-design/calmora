import { SignJWT, jwtVerify } from "jose";

export const COOKIE_SESSION = "calmora_admin";
const DUREE_HEURES = 12;

function cle() {
  const s = process.env.SESSION_SECRET || "";
  if (s.length < 32) throw new Error("SESSION_SECRET manquant ou trop court (32 caractères minimum)");
  return new TextEncoder().encode(s);
}

export async function creerSession(admin) {
  return new SignJWT({ u: admin.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(admin.id))
    .setIssuedAt()
    .setExpirationTime(`${DUREE_HEURES}h`)
    .sign(cle());
}

export async function lireSession(jeton) {
  if (!jeton || !secretPresent()) return null;
  try {
    const { payload } = await jwtVerify(jeton, cle(), { algorithms: ["HS256"] });
    return { id: payload.sub, username: payload.u };
  } catch {
    return null;
  }
}

// "Secure" uniquement quand le site est servi en https : sinon, en http (test en local,
// adresse IP…), le navigateur refuserait le cookie et la connexion semblerait ne pas marcher.
export function optionsCookie(request) {
  const https = (request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.replace(":", "")) === "https";
  return {
    httpOnly: true,                                 // invisible pour le JavaScript du navigateur
    secure: https,
    sameSite: "strict",
    path: "/",
    maxAge: DUREE_HEURES * 3600,
  };
}

export function secretPresent() {
  return (process.env.SESSION_SECRET || "").length >= 32;
}

// Refuse les requêtes de modification venant d'un autre site.
export function origineValide(request) {
  const origine = request.headers.get("origin");
  if (!origine) return true;
  try {
    return new URL(origine).host === request.headers.get("host");
  } catch {
    return false;
  }
}
