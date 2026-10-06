// Crée les tables. Usage : npm run db:init
import { readFileSync } from "node:fs";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL manquant dans .env.local"); process.exit(1); }
const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
const client = new pg.Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query(readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
  console.log("Base de données prête (tables orders, order_items, reviews et admins).");
} catch (e) {
  console.error("Échec :", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
