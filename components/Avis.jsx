"use client";
import { useEffect, useState } from "react";
import { Star, LoaderCircle, CheckCircle2 } from "lucide-react";
import { AVIS_LONGUEUR_MAX } from "@/lib/config";

// Le jeton d'avis reçu à la fin d'une commande est gardé sur l'appareil du client,
// pour qu'il puisse donner son avis plus tard (par exemple après la livraison).
const CLE = "calmora_avis";
export function memoriserCommande(token, numero) {
  try { localStorage.setItem(CLE, JSON.stringify({ token, numero })); } catch {}
}
function lireCommande() {
  try { return JSON.parse(localStorage.getItem(CLE)) || null; } catch { return null; }
}
function oublierCommande() {
  try { localStorage.removeItem(CLE); } catch {}
}

export function Etoiles({ note, taille = "h-5 w-5" }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`Note : ${note} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${taille} ${n <= Math.round(note) ? "fill-or text-or" : "text-stone-300"}`} aria-hidden="true" />
      ))}
    </div>
  );
}

// Formulaire d'avis : utilisé dans la fenêtre de confirmation, dans la section « Avis clients » et sur /avis
export function FormulaireAvis({ token, onEnvoye, compact = false }) {
  const [note, setNote] = useState(0);
  const [survol, setSurvol] = useState(0);
  const [texte, setTexte] = useState("");
  const [etat, setEtat] = useState("saisie");   // saisie | envoi | merci
  const [erreur, setErreur] = useState("");

  async function envoyer(e) {
    e.preventDefault();
    if (etat === "envoi") return;
    if (note < 1) { setErreur("Choisissez une note de 1 à 5 étoiles."); return; }
    setErreur(""); setEtat("envoi");
    try {
      const r = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, rating: note, comment: texte }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok || r.status === 409) {
        oublierCommande();
        if (r.status === 409) { setErreur(j.erreur); setEtat("saisie"); onEnvoye?.(); return; }
        setEtat("merci"); onEnvoye?.();
        return;
      }
      setErreur(j.erreur || "Votre avis n'a pas pu être envoyé. Réessayez.");
    } catch {
      setErreur("Connexion impossible. Vérifiez votre connexion internet puis réessayez.");
    }
    setEtat("saisie");
  }

  if (etat === "merci")
    return (
      <p role="status" className="flex items-start gap-2 rounded-md bg-foret/10 px-4 py-3 text-left text-[15px] font-medium text-foret-sombre">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        Merci pour votre avis. Il apparaîtra sur le site après validation.
      </p>
    );

  return (
    <form onSubmit={envoyer} className="text-left">
      <fieldset>
        <legend className="text-sm font-semibold">Votre note <span className="text-promo" aria-hidden="true">*</span></legend>
        <div className="mt-1 flex gap-1" onMouseLeave={() => setSurvol(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer rounded p-0.5 focus-within:outline focus-within:outline-2 focus-within:outline-or-clair" onMouseEnter={() => setSurvol(n)}>
              <input type="radio" name="note" value={n} checked={note === n} onChange={() => { setNote(n); setErreur(""); }} className="sr-only" />
              <span className="sr-only">{n} étoile{n > 1 ? "s" : ""}</span>
              <Star className={`h-8 w-8 ${n <= (survol || note) ? "fill-or text-or" : "text-stone-300"}`} aria-hidden="true" />
            </label>
          ))}
        </div>
      </fieldset>
      <label htmlFor={`avis-${token}`} className="mb-1.5 mt-3 block text-sm font-semibold">Votre avis (facultatif)</label>
      <textarea id={`avis-${token}`} value={texte} onChange={(e) => setTexte(e.target.value)} maxLength={AVIS_LONGUEUR_MAX} rows={compact ? 2 : 3}
        placeholder="Dites-nous ce que vous en pensez" className="champ resize-y" />
      {erreur && <p role="alert" className="mt-2 text-sm text-promo">{erreur}</p>}
      <button type="submit" disabled={etat === "envoi"} className="btn-or mt-3 w-full sm:w-auto">
        {etat === "envoi" && <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />}
        Envoyer mon avis
      </button>
    </form>
  );
}

const dateCourte = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

// Section « Avis clients » de la page d'accueil
export default function SectionAvis() {
  const [donnees, setDonnees] = useState(null);
  const [commande, setCommande] = useState(null);

  useEffect(() => {
    setCommande(lireCommande());
    fetch("/api/reviews").then((r) => r.json()).then(setDonnees).catch(() => setDonnees({ avis: [], total: 0, moyenne: 0 }));
    // Une commande vient d'être passée sur cette page : proposer l'avis ici aussi
    const maj = () => setCommande(lireCommande());
    window.addEventListener("calmora:commande", maj);
    return () => window.removeEventListener("calmora:commande", maj);
  }, []);

  const avis = donnees?.avis || [];
  return (
    <section id="avis" className="bg-sable">
      <div className="conteneur py-16 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-bold sm:text-4xl">Avis clients</h2>
          {donnees?.total > 0 && (
            <p className="flex items-center gap-3 text-lg">
              <Etoiles note={donnees.moyenne} />
              <span><strong>{String(donnees.moyenne).replace(".", ",")}</strong> sur 5, {donnees.total} avis</span>
            </p>
          )}
        </div>

        {donnees && avis.length === 0 && (
          <p className="mt-6 max-w-2xl text-lg text-stone-700">
            Aucun avis publié pour l'instant. Après votre commande, vous pourrez donner le vôtre : il apparaîtra ici.
          </p>
        )}

        {avis.length > 0 && (
          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {avis.map((a) => (
              <figure key={a.id} className="rounded-lg bg-white p-6 shadow-carte">
                <Etoiles note={a.rating} />
                {a.comment && <blockquote className="mt-4 whitespace-pre-line leading-relaxed [overflow-wrap:anywhere]">{a.comment}</blockquote>}
                <figcaption className="mt-4 text-sm">
                  <span className="font-semibold">{a.first_name}</span>
                  <span className="text-stone-500">, {a.city}. Client ayant commandé, {dateCourte.format(new Date(a.created_at))}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        {commande?.token && (
          <div className="mt-10 max-w-xl rounded-lg bg-white p-6 shadow-carte">
            <h3 className="text-xl font-bold">Donnez votre avis sur votre commande {commande.numero}</h3>
            <div className="mt-4"><FormulaireAvis token={commande.token} /></div>
          </div>
        )}
      </div>
    </section>
  );
}
