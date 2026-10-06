import { trouverProduit, PRODUITS, VILLES, QUANTITE_MAX } from "./config";

// Accepte 20 123 456, 20123456, +216 20 123 456, 0021620123456 → renvoie 8 chiffres ou null
export function normaliserTelephone(valeur) {
  const t = String(valeur ?? "").replace(/[\s.\-()]/g, "").replace(/^(\+216|00216)/, "");
  return /^[2-9]\d{7}$/.test(t) ? t : null;
}

const propre = (v) => String(v ?? "").replace(/\s+/g, " ").trim();
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Utilisée à l'identique dans le navigateur ET sur le serveur.
// d.items = [{ productId, quantity }, …] : une à trois fontaines, chacune avec sa quantité.
export function validerCommande(d) {
  const erreurs = {};

  const lignes = [];
  const brutes = Array.isArray(d?.items) ? d.items : [];
  if (brutes.length === 0) erreurs.items = "Choisissez au moins une fontaine.";
  else if (brutes.length > PRODUITS.length) erreurs.items = "Commande invalide.";
  else {
    const vus = new Set();
    for (const l of brutes) {
      const produit = trouverProduit(propre(l?.productId));
      const quantite = typeof l?.quantity === "number" ? l.quantity : Number(propre(l?.quantity));
      if (!produit || vus.has(produit.id)) { erreurs.items = "Commande invalide."; break; }
      if (!Number.isInteger(quantite) || quantite < 1 || quantite > QUANTITE_MAX) {
        erreurs.items = `Chaque quantité doit être comprise entre 1 et ${QUANTITE_MAX}.`; break;
      }
      vus.add(produit.id);
      lignes.push({ produit, quantite });
    }
  }

  const lastName = propre(d?.lastName);
  if (lastName.length < 2 || lastName.length > 60) erreurs.lastName = "Indiquez votre nom.";
  const firstName = propre(d?.firstName);
  if (firstName.length < 2 || firstName.length > 60) erreurs.firstName = "Indiquez votre prénom.";

  const phone = normaliserTelephone(d?.phone);
  if (!phone) erreurs.phone = "Indiquez un numéro tunisien à 8 chiffres, par exemple 20 123 456.";

  const address = propre(d?.address);
  if (address.length < 5 || address.length > 200) erreurs.address = "Indiquez l'adresse complète de votre domicile.";

  const city = propre(d?.city);
  if (!VILLES.includes(city)) erreurs.city = "Sélectionnez votre ville.";

  const submissionId = propre(d?.submissionId);
  if (!UUID.test(submissionId)) erreurs.submissionId = "Rechargez la page puis réessayez.";

  if (Object.keys(erreurs).length) return { ok: false, erreurs };
  return { ok: true, donnees: { lignes, lastName, firstName, phone, address, city, submissionId } };
}

// Avis d'un client : note de 1 à 5, commentaire facultatif.
export function validerAvis(d) {
  const erreurs = {};
  const token = propre(d?.token);
  if (!UUID.test(token)) erreurs.token = "Lien d'avis invalide.";
  const rating = typeof d?.rating === "number" ? d.rating : Number(propre(d?.rating));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) erreurs.rating = "Choisissez une note de 1 à 5 étoiles.";
  const comment = String(d?.comment ?? "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (comment.length > 500) erreurs.comment = "Votre avis ne doit pas dépasser 500 caractères.";
  if (Object.keys(erreurs).length) return { ok: false, erreurs };
  return { ok: true, donnees: { token, rating, comment } };
}
