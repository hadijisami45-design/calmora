"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, ShoppingCart, Check, Truck, User, Phone, MapPin, Lock, CheckCircle2, X, LoaderCircle } from "lucide-react";
import { PRODUITS, VILLES, QUANTITE_MAX, BOUTIQUE, reduction } from "@/lib/config";
import { validerCommande } from "@/lib/validation";
import { suivre } from "@/lib/pixel";
import Apparition from "./Apparition";
import { FormulaireAvis, memoriserCommande } from "./Avis";

const borner = (n) => Math.max(0, Math.min(QUANTITE_MAX, n));
const prix = (n) => `${n} ${BOUTIQUE.devise}`;

function nouvelIdentifiant() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  const o = crypto.getRandomValues(new Uint8Array(16));
  o[6] = (o[6] & 0x0f) | 0x40; o[8] = (o[8] & 0x3f) | 0x80;
  const h = [...o].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

// Sélecteur de quantité : boutons − / + ou saisie directe du nombre. 0 = pas dans la commande.
function Quantite({ valeur, onChange, nom }) {
  const [texte, setTexte] = useState(String(valeur));
  useEffect(() => { setTexte(String(valeur)); }, [valeur]);
  const taper = (e) => {
    const t = e.target.value.replace(/\D/g, "").slice(0, 3);
    setTexte(t);
    if (t !== "") onChange(borner(Number(t)));
  };
  return (
    <div className="inline-flex items-stretch overflow-hidden rounded-md border border-stone-300 bg-white">
      <button type="button" className="pas-btn" onClick={() => onChange(borner(valeur - 1))} disabled={valeur <= 0} aria-label={`Diminuer la quantité de ${nom}`}>
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <input type="text" inputMode="numeric" pattern="[0-9]*" value={texte} onChange={taper} onBlur={() => setTexte(String(valeur))} onFocus={(e) => e.target.select()}
        aria-label={`Quantité de ${nom}`} className="w-14 border-x border-stone-300 text-center font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-inset focus:ring-foret/40" />
      <button type="button" className="pas-btn" onClick={() => onChange(borner(valeur + 1))} disabled={valeur >= QUANTITE_MAX} aria-label={`Augmenter la quantité de ${nom}`}>
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function CarteProduit({ produit, quantite, onQuantite, delai }) {
  const [photo, setPhoto] = useState(0);
  const remise = reduction(produit);
  const courante = produit.photos[photo] || produit.photos[0];
  const choisi = quantite > 0;
  return (
    <Apparition as="article" delai={delai} className={`flex flex-col overflow-hidden rounded-lg bg-white shadow-carte ring-1 ${choisi ? "ring-2 ring-foret" : "ring-stone-200"}`}>
      <div className="relative aspect-square bg-sable">
        <img src={courante.src} alt={courante.alt} width={1000} height={1000} loading="lazy" className="h-full w-full object-cover" />
        {remise > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-promo px-3 py-1 text-base font-bold text-white shadow">-{remise}%</span>
        )}
      </div>
      {produit.photos.length > 1 && (
        <div className="flex gap-2 px-4 pt-3">
          {produit.photos.map((ph, i) => (
            <button key={ph.src} type="button" onClick={() => setPhoto(i)} aria-label={`Voir la photo ${i + 1} de ${produit.nom}`} aria-pressed={i === photo}
              className={`h-14 w-14 overflow-hidden rounded ring-2 ${i === photo ? "ring-foret" : "ring-transparent"}`}>
              <img src={ph.src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-1 flex-col items-center px-5 pb-5 pt-4 text-center">
        <h3 className="text-xl font-bold">{produit.nom}</h3>
        <p className="mt-0.5 text-sm text-stone-500">{produit.accroche}</p>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">{produit.description}</p>
        <p className="mt-3 flex items-baseline gap-3 font-titre">
          {produit.ancienPrix > produit.prix && (
            <s className="text-xl text-stone-500"><span className="sr-only">Ancien prix : </span>{prix(produit.ancienPrix)}</s>
          )}
          <span className="text-[2rem] font-bold leading-none text-promo"><span className="sr-only">Prix actuel : </span>{prix(produit.prix)}</span>
        </p>
        <div className="mt-auto w-full pt-4">
          {choisi ? (
            <>
              <Quantite valeur={quantite} onChange={onQuantite} nom={produit.nom} />
              <a href="#commande" className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border-2 border-foret px-5 py-2.5 font-semibold text-foret hover:bg-foret/5">
                <Check className="h-5 w-5" aria-hidden="true" />
                Dans ma commande
              </a>
            </>
          ) : (
            <button type="button" className="btn-vert w-full" onClick={() => onQuantite(1)}>
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              Ajouter à ma commande
            </button>
          )}
        </div>
      </div>
    </Apparition>
  );
}

function Champ({ id, label, erreur, icone: Icone, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label} <span className="text-promo" aria-hidden="true">*</span>
      </label>
      <div className="relative">
        {Icone && <Icone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" aria-hidden="true" />}
        {children}
      </div>
      {erreur && <p id={`${id}-erreur`} className="mt-1 text-sm text-promo">{erreur}</p>}
    </div>
  );
}

function Confirmation({ commande, onFermer }) {
  const bouton = useRef(null);
  useEffect(() => {
    bouton.current?.focus();
    const touche = (e) => e.key === "Escape" && onFermer();
    document.addEventListener("keydown", touche);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", touche); document.body.style.overflow = ""; };
  }, [onFermer]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-cafe/70 p-4 backdrop-blur-sm" onClick={onFermer}>
      <div role="dialog" aria-modal="true" aria-labelledby="titre-confirmation" onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-xl bg-creme p-7 text-center shadow-2xl sm:p-9">
        <button type="button" onClick={onFermer} aria-label="Fermer" className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full text-stone-500 hover:bg-stone-200">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <CheckCircle2 className="mx-auto h-16 w-16 text-foret-clair" strokeWidth={1.5} aria-hidden="true" />
        <h2 id="titre-confirmation" className="mt-4 text-3xl font-bold">Commande confirmée</h2>
        <p className="mt-4 text-sm text-stone-600">Numéro de commande</p>
        <p className="font-titre text-3xl font-bold tracking-wide text-or-sombre">{commande.numero}</p>
        <ul className="mt-3 text-[15px]">
          {commande.lignes.map((l) => <li key={l.nom}>{l.quantite} × {l.nom}</li>)}
        </ul>
        <p className="mt-1 text-[15px]">Total à payer à la livraison : <strong>{prix(commande.total)}</strong></p>
        <p className="mt-5 leading-relaxed">Merci pour votre commande. Notre équipe vous contactera par téléphone pour confirmer la livraison.</p>
        {commande.token && (
          <div className="mt-6 border-t border-stone-300 pt-5">
            <h3 className="text-left text-xl font-bold">Donnez votre avis</h3>
            <p className="mb-3 mt-1 text-left text-sm text-stone-600">Maintenant, ou plus tard depuis la rubrique « Avis clients » sur ce même appareil.</p>
            <FormulaireAvis token={commande.token} compact />
          </div>
        )}
        <button ref={bouton} type="button" onClick={onFermer} className="btn-vert mt-7 w-full">Fermer</button>
      </div>
    </div>
  );
}

const VIDE = { lastName: "", firstName: "", phone: "", address: "", city: "" };
const PANIER_VIDE = Object.fromEntries(PRODUITS.map((p) => [p.id, 0]));

export default function Boutique() {
  const [panier, setPanier] = useState(PANIER_VIDE);     // identifiant de la fontaine -> quantité
  const [client, setClient] = useState(VIDE);
  const [erreurs, setErreurs] = useState({});
  const [message, setMessage] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [formulaireVisible, setFormulaireVisible] = useState(false);
  const identifiant = useRef(null);
  const verrou = useRef(false);        // bloque le double clic avant même le rendu suivant
  const piege = useRef(null);
  const zoneFormulaire = useRef(null);

  const lignes = useMemo(() => PRODUITS.filter((p) => panier[p.id] > 0).map((p) => ({ produit: p, quantite: panier[p.id] })), [panier]);
  const total = lignes.reduce((s, l) => s + l.produit.prix * l.quantite, 0);
  const pieces = lignes.reduce((s, l) => s + l.quantite, 0);

  useEffect(() => {
    identifiant.current = nouvelIdentifiant();
    suivre("ViewContent", { content_type: "product", content_ids: PRODUITS.map((p) => p.id), currency: "TND" });
    if (!("IntersectionObserver" in window) || !zoneFormulaire.current) return;
    const obs = new IntersectionObserver(([e]) => setFormulaireVisible(e.isIntersecting), { threshold: 0.05 });
    obs.observe(zoneFormulaire.current);
    return () => obs.disconnect();
  }, []);

  function changerQuantite(produit, quantite) {
    // Événement Meta : la fontaine entre dans la commande
    if (panier[produit.id] === 0 && quantite > 0)
      suivre("AddToCart", { content_type: "product", content_ids: [produit.id], content_name: produit.nom, value: produit.prix * quantite, currency: "TND" });
    setPanier((p) => ({ ...p, [produit.id]: quantite }));
    if (erreurs.items) setErreurs((x) => ({ ...x, items: undefined }));
  }

  const saisir = (cle) => (e) => {
    setClient((c) => ({ ...c, [cle]: e.target.value }));
    if (erreurs[cle]) setErreurs((x) => ({ ...x, [cle]: undefined }));
  };

  async function envoyer(e) {
    e.preventDefault();
    if (verrou.current) return;
    setMessage("");
    const donnees = {
      items: lignes.map((l) => ({ productId: l.produit.id, quantity: l.quantite })),
      ...client, submissionId: identifiant.current, website: piege.current?.value || "",
    };
    const v = validerCommande(donnees);
    if (!v.ok) {
      setErreurs(v.erreurs);
      if (v.erreurs.items) document.getElementById("mes-fontaines")?.scrollIntoView({ behavior: "smooth", block: "center" });
      else {
        const premier = ["lastName", "firstName", "phone", "address", "city"].find((c) => v.erreurs[c]);
        if (premier) document.getElementById(premier)?.focus();
      }
      return;
    }
    verrou.current = true;
    setEnvoi(true);
    try {
      const r = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(donnees) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (j.erreurs) setErreurs(j.erreurs);
        setMessage(j.erreur || "La commande n'a pas pu être envoyée. Réessayez.");
        return;
      }
      setConfirmation({ numero: j.orderNumber, total: j.total, token: j.reviewToken, lignes: lignes.map((l) => ({ nom: l.produit.nom, quantite: l.quantite })) });
      if (j.reviewToken) { memoriserCommande(j.reviewToken, j.orderNumber); window.dispatchEvent(new Event("calmora:commande")); }
      // Événements Meta après commande
      const infos = { content_type: "product", content_ids: lignes.map((l) => l.produit.id), num_items: pieces, value: j.total, currency: "TND" };
      suivre("Lead", infos);
      suivre("Purchase", infos);
      setClient(VIDE); setErreurs({}); setPanier(PANIER_VIDE);
      identifiant.current = nouvelIdentifiant();
    } catch {
      setMessage("Connexion impossible. Vérifiez votre connexion internet puis réessayez.");
    } finally {
      verrou.current = false;
      setEnvoi(false);
    }
  }

  const attributs = (cle) => ({
    id: cle, name: cle, value: client[cle], onChange: saisir(cle), required: true,
    "aria-invalid": erreurs[cle] ? "true" : undefined,
    "aria-describedby": erreurs[cle] ? `${cle}-erreur` : undefined,
  });
  const classe = (cle, avecIcone) => `champ ${avecIcone ? "pl-9" : ""} ${erreurs[cle] ? "champ-erreur" : ""}`;

  return (
    <section id="fontaines" className="conteneur py-8 lg:py-10">
      <h2 className="sr-only">Nos fontaines</h2>
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {PRODUITS.map((p, i) => (
            <CarteProduit key={p.id} produit={p} quantite={panier[p.id]} delai={i * 90} onQuantite={(q) => changerQuantite(p, q)} />
          ))}
        </div>

        {/* ------------------------- Bloc commande ------------------------- */}
        <div id="commande" ref={zoneFormulaire} className="rounded-lg bg-white p-5 shadow-carte ring-1 ring-stone-200 sm:p-6 lg:sticky lg:top-[84px]">
          <h2 className="flex items-center gap-3 text-[1.45rem] font-bold">
            <Truck className="h-7 w-7 shrink-0" aria-hidden="true" />
            Passer votre commande
          </h2>
          <p className="mt-1 text-sm text-stone-600">Choisissez une ou plusieurs fontaines, puis remplissez vos informations.</p>

          <form onSubmit={envoyer} noValidate className="mt-5 space-y-4">
            {/* Les trois fontaines, chacune avec sa quantité (0 = pas dans la commande) */}
            <fieldset id="mes-fontaines">
              <legend className="mb-2 text-sm font-semibold">Vos fontaines <span className="text-promo" aria-hidden="true">*</span></legend>
              <ul className={`divide-y divide-stone-200 rounded-md border ${erreurs.items ? "border-promo" : "border-stone-200"}`}>
                {PRODUITS.map((p) => (
                  <li key={p.id} className={`flex items-center gap-3 p-2.5 ${panier[p.id] > 0 ? "bg-foret/5" : ""}`}>
                    <img src={p.photos[0].src} alt="" className="h-14 w-14 shrink-0 rounded object-cover ring-1 ring-stone-200" />
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="text-sm font-semibold">{p.nom.replace("Fontaine ", "")}</p>
                      <p className="mt-0.5 text-sm text-stone-600">{prix(p.prix)}</p>
                    </div>
                    <Quantite valeur={panier[p.id]} onChange={(q) => changerQuantite(p, q)} nom={p.nom} />
                  </li>
                ))}
              </ul>
              {erreurs.items && <p role="alert" className="mt-1.5 text-sm text-promo">{erreurs.items}</p>}
            </fieldset>

            <div className="rounded-md bg-sable px-4 py-3" aria-live="polite">
              {lignes.length > 0 && (
                <ul className="mb-2 space-y-1 border-b border-stone-300/70 pb-2 text-sm">
                  {lignes.map((l) => (
                    <li key={l.produit.id} className="flex justify-between gap-3">
                      <span>{l.quantite} × {l.produit.nom}</span>
                      <span className="whitespace-nowrap tabular-nums">{prix(l.produit.prix * l.quantite)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold leading-tight">Total à payer<br />à la livraison</span>
                <span className="whitespace-nowrap font-titre text-2xl font-bold text-promo">{prix(total)}</span>
              </div>
            </div>

            <fieldset className="space-y-4 border-t border-stone-200 pt-4">
              <legend className="float-left mb-3 flex w-full items-center gap-2.5 font-titre text-xl font-bold">
                <User className="h-5 w-5" aria-hidden="true" /> Vos coordonnées
              </legend>
              <div className="clear-both grid grid-cols-2 gap-3">
                <Champ id="lastName" label="Nom" erreur={erreurs.lastName}>
                  <input {...attributs("lastName")} className={classe("lastName")} placeholder="Votre nom" autoComplete="family-name" maxLength={60} />
                </Champ>
                <Champ id="firstName" label="Prénom" erreur={erreurs.firstName}>
                  <input {...attributs("firstName")} className={classe("firstName")} placeholder="Votre prénom" autoComplete="given-name" maxLength={60} />
                </Champ>
              </div>
              <Champ id="phone" label="Numéro de téléphone" erreur={erreurs.phone} icone={Phone}>
                <input {...attributs("phone")} className={classe("phone", true)} type="tel" inputMode="tel" placeholder="Ex. 20 123 456" autoComplete="tel" maxLength={20} />
              </Champ>
              <Champ id="address" label="Adresse domicile" erreur={erreurs.address} icone={MapPin}>
                <input {...attributs("address")} className={classe("address", true)} placeholder="Votre adresse complète" autoComplete="street-address" maxLength={200} />
              </Champ>
              <Champ id="city" label="Ville" erreur={erreurs.city} icone={MapPin}>
                <select {...attributs("city")} className={classe("city", true)} autoComplete="address-level1">
                  <option value="">Sélectionnez votre ville</option>
                  {VILLES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </Champ>
            </fieldset>

            {/* Champ piège anti-robots : invisible pour les clients */}
            <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor="website">Ne pas remplir</label>
              <input ref={piege} id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            {message && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-promo">{message}</p>}

            <button type="submit" disabled={envoi} className="btn-vert w-full bg-foret-clair py-4 text-lg hover:bg-foret">
              {envoi ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
              {envoi ? "Envoi en cours…" : "Confirmer ma commande"}
            </button>
            <p className="flex items-start justify-center gap-2 text-center text-xs text-stone-500">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Vos informations sont uniquement utilisées pour le traitement de votre commande.
            </p>
          </form>
        </div>
      </div>

      {/* Bouton fixe sur mobile, masqué quand le formulaire est à l'écran */}
      {!formulaireVisible && !confirmation && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-creme/95 p-3 backdrop-blur lg:hidden" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
          <a href="#commande" className="btn-vert w-full py-3.5 text-base">
            {pieces > 0
              ? `Ma commande : ${pieces} fontaine${pieces > 1 ? "s" : ""}, ${prix(total)}`
              : `Commander dès ${prix(Math.min(...PRODUITS.map((p) => p.prix)))}`}
          </a>
        </div>
      )}

      {confirmation && <Confirmation commande={confirmation} onFermer={() => setConfirmation(null)} />}
    </section>
  );
}
