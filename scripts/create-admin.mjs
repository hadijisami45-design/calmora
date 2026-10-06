// Crée (ou met à jour) un compte administrateur. Usage : npm run create-admin
// Il n'existe aucune inscription admin sur le site : ce script est le seul moyen.
import readline from "node:readline";
import pg from "pg";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL manquant dans .env.local"); process.exit(1); }

const rl = readline.createInterface({ input: process.stdin });
const lignes = rl[Symbol.asyncIterator]();
async function demander(question) {
  process.stdout.write(question);
  const { value } = await lignes.next();
  return value ?? "";
}
const username = (await demander("Nom d'utilisateur admin : ")).trim().toLowerCase();
const password = await demander("Mot de passe (12 caractères minimum) : ");
rl.close();

if (!/^[a-z0-9._-]{3,60}$/.test(username)) {
  console.error("Nom d'utilisateur invalide : 3 à 60 caractères, lettres, chiffres, point, tiret."); process.exit(1);
}
if (password.length < 12) { console.error("Mot de passe trop court : 12 caractères minimum."); process.exit(1); }

const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
const client = new pg.Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
try {
  await client.connect();
  const hash = await bcrypt.hash(password, 12);
  await client.query(
    `insert into admins (username, password_hash) values ($1, $2)
     on conflict (username) do update set password_hash = excluded.password_hash, failed_attempts = 0, locked_until = null`,
    [username, hash]
  );
  console.log(`\nCompte admin « ${username} » enregistré. Connectez-vous sur /admin`);
} catch (e) {
  console.error("Échec :", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
