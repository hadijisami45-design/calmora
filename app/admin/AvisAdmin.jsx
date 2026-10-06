"use client";
import { useCallback, useEffect, useState } from "react";
import { Trash2, Eye, EyeOff } from "lucide-react";
import { STATUTS_AVIS } from "@/lib/config";
import { Etoiles } from "@/components/Avis";

const dateHeure = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Tunis" });
const statutDe = (id) => STATUTS_AVIS.find((s) => s.id === id) || STATUTS_AVIS[0];

// Validation des avis clients : rien n'apparaît sur le site sans votre accord.
export default function AvisAdmin() {
  const [avis, setAvis] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [occupe, setOccupe] = useState(null);

  const charger = useCallback(async () => {
    setChargement(true); setErreur("");
    try {
      const r = await fetch("/api/admin/reviews", { cache: "no-store" });
      if (r.status === 401) return;
      const j = await r.json();
      if (!r.ok) throw new Error(j.erreur);
      setAvis(j.avis);
    } catch (e) {
      setErreur(e.message || "Les avis n'ont pas pu être chargés.");
    }
    setChargement(false);
  }, []);
  useEffect(() => { charger(); }, [charger]);

  async function changer(a, status) {
    setOccupe(a.id); setErreur("");
    try {
      const r = await fetch(`/api/admin/reviews/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erreur);
      setAvis((l) => l.map((x) => (x.id === a.id ? { ...x, status } : x)));
    } catch (e) {
      setErreur(e.message || "L'avis n'a pas pu être modifié.");
    }
    setOccupe(null);
  }

  async function supprimer(a) {
    if (!window.confirm(`Supprimer définitivement l'avis de ${a.first_name} ${a.last_name} (commande ${a.order_number}) ?`)) return;
    setOccupe(a.id); setErreur("");
    try {
      const r = await fetch(`/api/admin/reviews/${a.id}`, { method: "DELETE" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erreur);
      setAvis((l) => l.filter((x) => x.id !== a.id));
    } catch (e) {
      setErreur(e.message || "L'avis n'a pas pu être supprimé.");
    }
    setOccupe(null);
  }

  const attente = avis.filter((a) => a.status === "en_attente").length;
  return (
    <section className="mx-auto max-w-[1500px] px-4 pb-10 sm:px-6" aria-labelledby="titre-avis">
      <h2 id="titre-avis" className="text-2xl font-bold">
        Avis clients {attente > 0 && <span className="ml-2 rounded-full bg-amber-200 px-2.5 py-0.5 align-middle font-texte text-sm font-semibold text-amber-950">{attente} à valider</span>}
      </h2>
      <p className="mt-1 text-sm text-stone-600">Un avis n'apparaît sur le site qu'après avoir été publié ici. Le texte et la note du client ne sont pas modifiables.</p>
      {erreur && <p role="alert" className="mt-3 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-promo ring-1 ring-red-200">{erreur}</p>}
      {!chargement && !erreur && avis.length === 0 && (
        <p className="mt-3 rounded-lg bg-white p-6 text-center text-stone-600 ring-1 ring-stone-200">Aucun avis pour l'instant.</p>
      )}
      <ul className="mt-3 grid gap-3 lg:grid-cols-2">
        {avis.map((a) => {
          const s = statutDe(a.status);
          return (
            <li key={a.id} className="rounded-lg bg-white p-4 ring-1 ring-stone-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Etoiles note={a.rating} />
                  <p className="mt-1.5 text-sm font-semibold">{a.first_name} {a.last_name}, {a.city}</p>
                  <p className="text-xs text-stone-500">Commande {a.order_number}, {dateHeure.format(new Date(a.created_at))}</p>
                </div>
                <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${s.classe}`}>{s.label}</span>
              </div>
              <p className="mt-3 whitespace-pre-line text-[15px] [overflow-wrap:anywhere]">{a.comment || <span className="text-stone-500">Note sans commentaire.</span>}</p>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-stone-100 pt-3">
                {a.status !== "publie" && (
                  <button type="button" disabled={occupe === a.id} onClick={() => changer(a, "publie")} className="inline-flex items-center gap-1.5 rounded-md bg-foret px-3 py-1.5 text-sm font-semibold text-white hover:bg-foret-sombre disabled:opacity-60">
                    <Eye className="h-4 w-4" aria-hidden="true" /> Publier
                  </button>
                )}
                {a.status !== "masque" && (
                  <button type="button" disabled={occupe === a.id} onClick={() => changer(a, "masque")} className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-stone-50 disabled:opacity-60">
                    <EyeOff className="h-4 w-4" aria-hidden="true" /> Masquer
                  </button>
                )}
                <button type="button" disabled={occupe === a.id} onClick={() => supprimer(a)} className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Supprimer
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
