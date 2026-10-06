"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, ArrowDownUp, RefreshCw, LogOut, Trash2, Link2, Check } from "lucide-react";
import { STATUTS } from "@/lib/config";

const dateHeure = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Tunis" });
const dt = (n) => `${n} DT`;
const statutDe = (id) => STATUTS.find((s) => s.id === id) || STATUTS[0];
const sansAccent = (s) => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function Badge({ statut }) {
  const s = statutDe(statut);
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${s.classe}`}>{s.label}</span>;
}

// Une ligne par fontaine de la commande, alignées d'une colonne à l'autre
function Lignes({ items, champ }) {
  return (
    <ul className="space-y-1">
      {items.map((i) => (
        <li key={i.product_id} className="whitespace-nowrap">{champ === "unit_price" ? dt(i[champ]) : i[champ]}</li>
      ))}
    </ul>
  );
}

function ChoixStatut({ commande, onChange, occupe }) {
  return (
    <select value={commande.status} disabled={occupe} onChange={(e) => onChange(commande, e.target.value)}
      aria-label={`Statut de la commande ${commande.order_number}`}
      className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm focus:border-foret focus:outline-none focus:ring-2 focus:ring-foret/25">
      {STATUTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
    </select>
  );
}

// Copie le lien à envoyer au client (WhatsApp, SMS) pour qu'il donne son avis après la livraison.
function LienAvis({ commande }) {
  const [copie, setCopie] = useState(false);
  if (commande.status === "sans_suite") return null;
  if (commande.has_review) return <span className="whitespace-nowrap text-xs text-stone-500">Avis reçu</span>;
  async function copier() {
    const lien = `${window.location.origin}/avis?c=${commande.review_token}`;
    try { await navigator.clipboard.writeText(lien); } catch { window.prompt("Copiez ce lien :", lien); }
    setCopie(true); setTimeout(() => setCopie(false), 2000);
  }
  return (
    <button type="button" onClick={copier} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-sm font-medium hover:bg-stone-50">
      {copie ? <Check className="h-4 w-4 text-green-700" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
      {copie ? "Lien copié" : "Copier le lien d'avis"}
    </button>
  );
}

function BoutonSupprimer({ commande, onSupprimer, occupe }) {
  if (commande.status !== "sans_suite") return null;
  return (
    <button type="button" disabled={occupe} onClick={() => onSupprimer(commande)}
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
      <Trash2 className="h-4 w-4" aria-hidden="true" /> Supprimer définitivement
    </button>
  );
}

export default function Tableau({ utilisateur }) {
  const [commandes, setCommandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [filtre, setFiltre] = useState("tous");
  const [recherche, setRecherche] = useState("");
  const [recentDabord, setRecentDabord] = useState(true);
  const [occupe, setOccupe] = useState(null);

  const charger = useCallback(async () => {
    setChargement(true); setErreur("");
    try {
      const r = await fetch("/api/admin/orders", { cache: "no-store" });
      if (r.status === 401) { window.location.assign("/admin/login"); return; }
      const j = await r.json();
      if (!r.ok) throw new Error(j.erreur);
      setCommandes(j.commandes);
    } catch (e) {
      setErreur(e.message || "Les commandes n'ont pas pu être chargées.");
    }
    setChargement(false);
  }, []);
  useEffect(() => { charger(); }, [charger]);

  async function changerStatut(c, status) {
    setOccupe(c.id); setErreur("");
    try {
      const r = await fetch(`/api/admin/orders/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (r.status === 401) { window.location.assign("/admin/login"); return; }
      const j = await r.json();
      if (!r.ok) throw new Error(j.erreur);
      setCommandes((l) => l.map((x) => (x.id === c.id ? { ...x, status: j.commande.status, updated_at: j.commande.updated_at } : x)));
    } catch (e) {
      setErreur(e.message || "Le statut n'a pas pu être modifié.");
    }
    setOccupe(null);
  }

  async function supprimer(c) {
    if (!window.confirm(`Supprimer définitivement la commande ${c.order_number} de ${c.first_name} ${c.last_name} ?\nCette action est irréversible.`)) return;
    setOccupe(c.id); setErreur("");
    try {
      const r = await fetch(`/api/admin/orders/${c.id}`, { method: "DELETE" });
      if (r.status === 401) { window.location.assign("/admin/login"); return; }
      const j = await r.json();
      if (!r.ok) throw new Error(j.erreur);
      setCommandes((l) => l.filter((x) => x.id !== c.id));
    } catch (e) {
      setErreur(e.message || "La commande n'a pas pu être supprimée.");
    }
    setOccupe(null);
  }

  async function deconnecter() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    window.location.assign("/admin/login");
  }

  const stats = useMemo(() => {
    const livrees = commandes.filter((c) => c.status === "livree");
    return [
      ["Commandes", commandes.length],
      ["Confirmées", commandes.filter((c) => c.status === "confirmee").length],
      ["Livrées", livrees.length],
      ["Chiffre d'affaires livré", dt(livrees.reduce((s, c) => s + c.total_price, 0))],
    ];
  }, [commandes]);

  const visibles = useMemo(() => {
    const q = sansAccent(recherche.trim());
    const chiffres = q.replace(/\D/g, "");
    return commandes
      .filter((c) => filtre === "tous" || c.status === filtre)
      .filter((c) => {
        if (!q) return true;
        return (
          sansAccent(`${c.first_name} ${c.last_name} ${c.last_name} ${c.first_name}`).includes(q) ||
          sansAccent(c.order_number).includes(q) ||
          (chiffres.length >= 2 && c.phone.includes(chiffres))
        );
      })
      .sort((a, b) => (recentDabord ? 1 : -1) * (new Date(b.created_at) - new Date(a.created_at)));
  }, [commandes, filtre, recherche, recentDabord]);

  return (
    <main className="mx-auto max-w-[1500px] px-4 pb-4 pt-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Commandes</h1>
          <p className="text-sm text-stone-600">Connecté : {utilisateur}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={charger} className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-stone-50">
            <RefreshCw className={`h-4 w-4 ${chargement ? "animate-spin" : ""}`} aria-hidden="true" /> Actualiser
          </button>
          <button type="button" onClick={deconnecter} className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-stone-50">
            <LogOut className="h-4 w-4" aria-hidden="true" /> Se déconnecter
          </button>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(([libelle, valeur]) => (
          <div key={libelle} className="rounded-lg bg-white p-4 ring-1 ring-stone-200">
            <dt className="text-sm text-stone-600">{libelle}</dt>
            <dd className="mt-1 font-titre text-3xl font-bold tabular-nums">{valeur}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-wrap items-end gap-3 rounded-lg bg-white p-4 ring-1 ring-stone-200">
        <div className="min-w-[220px] flex-1">
          <label htmlFor="recherche" className="mb-1 block text-sm font-semibold">Recherche</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" aria-hidden="true" />
            <input id="recherche" type="search" value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Téléphone, nom ou numéro de commande" className="champ pl-9" />
          </div>
        </div>
        <div>
          <label htmlFor="filtre" className="mb-1 block text-sm font-semibold">Statut</label>
          <select id="filtre" value={filtre} onChange={(e) => setFiltre(e.target.value)} className="champ w-auto">
            <option value="tous">Tous les statuts</option>
            {STATUTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <button type="button" onClick={() => setRecentDabord((v) => !v)} className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-stone-50">
          <ArrowDownUp className="h-4 w-4" aria-hidden="true" />
          {recentDabord ? "Plus récentes d'abord" : "Plus anciennes d'abord"}
        </button>
      </div>

      {erreur && <p role="alert" className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-promo ring-1 ring-red-200">{erreur}</p>}
      <p className="mt-4 text-sm text-stone-600" aria-live="polite">
        {chargement ? "Chargement…" : `${visibles.length} commande${visibles.length > 1 ? "s" : ""} affichée${visibles.length > 1 ? "s" : ""}`}
      </p>

      {!chargement && visibles.length === 0 && (
        <p className="mt-3 rounded-lg bg-white p-8 text-center text-stone-600 ring-1 ring-stone-200">
          {commandes.length === 0 ? "Aucune commande pour l'instant. Elles apparaîtront ici dès qu'un client en passera une." : "Aucune commande ne correspond à ces critères."}
        </p>
      )}

      {/* Tableau (grand écran) */}
      {visibles.length > 0 && (
        <div className="mt-3 hidden overflow-x-auto rounded-lg bg-white ring-1 ring-stone-200 xl:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs text-stone-600">
              <tr>
                {["N° commande", "Date et heure", "Produit", "Qté", "Prix unit.", "Total", "Nom", "Prénom", "Téléphone", "Adresse", "Ville", "Statut", "Actions"].map((t) => (
                  <th key={t} scope="col" className="whitespace-nowrap px-3 py-3 font-semibold">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {visibles.map((c) => (
                <tr key={c.id} className={`align-top ${c.status === "sans_suite" ? "bg-stone-50 text-stone-500" : ""}`}>
                  <td className="whitespace-nowrap px-3 py-3 font-semibold">{c.order_number}</td>
                  <td className="whitespace-nowrap px-3 py-3">{dateHeure.format(new Date(c.created_at))}</td>
                  <td className="px-3 py-3"><Lignes items={c.items} champ="product_name" /></td>
                  <td className="px-3 py-3 tabular-nums"><Lignes items={c.items} champ="quantity" /></td>
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums"><Lignes items={c.items} champ="unit_price" /></td>
                  <td className="whitespace-nowrap px-3 py-3 font-semibold tabular-nums">{dt(c.total_price)}</td>
                  <td className="px-3 py-3">{c.last_name}</td>
                  <td className="px-3 py-3">{c.first_name}</td>
                  <td className="whitespace-nowrap px-3 py-3"><a href={`tel:+216${c.phone}`} className="underline">{c.phone}</a></td>
                  <td className="min-w-[150px] max-w-[220px] px-3 py-3 [overflow-wrap:anywhere]">{c.address}</td>
                  <td className="px-3 py-3">{c.city}</td>
                  <td className="px-3 py-3"><Badge statut={c.status} /></td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col items-start gap-2">
                      <ChoixStatut commande={c} onChange={changerStatut} occupe={occupe === c.id} />
                      <LienAvis commande={c} />
                      <BoutonSupprimer commande={c} onSupprimer={supprimer} occupe={occupe === c.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cartes (mobile et tablette) */}
      <ul className="mt-3 space-y-3 xl:hidden">
        {visibles.map((c) => (
          <li key={c.id} className="rounded-lg bg-white p-4 ring-1 ring-stone-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{c.order_number}</p>
                <p className="text-xs text-stone-500">{dateHeure.format(new Date(c.created_at))}</p>
              </div>
              <Badge statut={c.status} />
            </div>
            <p className="mt-3 font-semibold">{c.first_name} {c.last_name}</p>
            <p><a href={`tel:+216${c.phone}`} className="underline">{c.phone}</a></p>
            <p className="text-sm text-stone-700 [overflow-wrap:anywhere]">{c.address}, {c.city}</p>
            <ul className="mt-3 text-sm">
              {c.items.map((i) => <li key={i.product_id}>{i.quantity} × {i.product_name} à {dt(i.unit_price)}</li>)}
            </ul>
            <p className="font-semibold">Total : {dt(c.total_price)}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3">
              <ChoixStatut commande={c} onChange={changerStatut} occupe={occupe === c.id} />
              <LienAvis commande={c} />
              <BoutonSupprimer commande={c} onSupprimer={supprimer} occupe={occupe === c.id} />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
