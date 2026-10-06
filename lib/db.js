import pg from "pg";

// Une seule réserve de connexions, réutilisée entre les requêtes.
const g = globalThis;

export function getPool() {
  if (!g.__calmoraPool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL manquant dans .env.local");
    const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
    g.__calmoraPool = new pg.Pool({
      connectionString: url,
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 8000,
      ssl: local ? false : { rejectUnauthorized: false },
    });
  }
  return g.__calmoraPool;
}

// Toutes les requêtes passent par ici : SQL paramétré ($1, $2…), jamais de valeurs collées dans le texte.
export function query(text, params = []) {
  return getPool().query(text, params);
}
