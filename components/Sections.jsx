import { Truck, ShieldCheck, Package, Headset, Sparkles, HeartHandshake, Gift, Wallet, ChevronDown, MessageCircle } from "lucide-react";
import Apparition from "./Apparition";
import Logo from "./Logo";
import { PRODUITS, FAQ, BOUTIQUE, WHATSAPP_NUMERO, WHATSAPP_MESSAGE } from "@/lib/config";

const GARANTIES = [
  [Truck, "Livraison rapide", "Partout en Tunisie"],
  [ShieldCheck, "Paiement à la livraison", "Vous payez à la réception"],
  [Package, "Produits de qualité", "Sélectionnés avec soin"],
  [Headset, "Support client", "À votre écoute"],
];

export function Garanties() {
  return (
    <section aria-label="Nos engagements" className="border-y border-stone-200 bg-white">
      <ul className="conteneur grid grid-cols-2 gap-x-4 gap-y-6 py-7 lg:grid-cols-4 lg:divide-x lg:divide-stone-200">
        {GARANTIES.map(([Icone, titre, texte]) => (
          <li key={titre} className="flex items-center gap-3 lg:justify-center lg:px-4">
            <Icone className="h-9 w-9 shrink-0 text-or" strokeWidth={1.4} aria-hidden="true" />
            <span>
              <span className="block font-titre font-bold leading-tight sm:text-lg">{titre}</span>
              <span className="block text-xs text-stone-600 sm:text-sm">{texte}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const AVANTAGES = [
  [Sparkles, "Une décoration qui change la pièce", "Posée sur un meuble, un bureau ou une table d'entrée, la fontaine devient le point d'attention du salon."],
  [HeartHandshake, "Le son de l'eau pour se détendre", "Le ruissellement de l'eau crée une ambiance calme, idéale après une longue journée."],
  [Gift, "Un cadeau qui fait plaisir", "Mariage, pendaison de crémaillère ou fête des mères : une idée originale et élégante."],
  [Wallet, "Sans risque", "Vous ne payez rien en ligne. Le règlement se fait à la livraison, à la réception du colis."],
];

export function Avantages() {
  return (
    <section id="pourquoi" className="conteneur py-16 lg:py-20">
      <Apparition>
        <h2 className="max-w-2xl text-3xl font-bold sm:text-4xl">Pourquoi choisir une fontaine {BOUTIQUE.nom} ?</h2>
      </Apparition>
      <div className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
        {AVANTAGES.map(([Icone, titre, texte], i) => (
          <Apparition key={titre} delai={i * 80}>
            <Icone className="h-9 w-9 text-foret" strokeWidth={1.4} aria-hidden="true" />
            <h3 className="mt-4 text-xl font-bold leading-snug">{titre}</h3>
            <p className="mt-2 leading-relaxed text-stone-600">{texte}</p>
          </Apparition>
        ))}
      </div>
    </section>
  );
}

const ETAPES = [
  ["Choisissez votre fontaine", "Sélectionnez le modèle et la quantité, puis remplissez vos coordonnées."],
  ["Nous vous appelons", "Notre équipe vous contacte par téléphone pour confirmer la commande et la livraison."],
  ["Recevez et payez", "La fontaine est livrée chez vous. Vous réglez à la réception."],
];

export function Fonctionnement() {
  return (
    <section className="bg-cafe text-white">
      <div className="conteneur py-16 lg:py-20">
        <Apparition><h2 className="text-3xl font-bold sm:text-4xl">Comment ça marche</h2></Apparition>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {ETAPES.map(([titre, texte], i) => (
            <Apparition as="li" key={titre} delai={i * 100} className="border-t border-or-clair/50 pt-5">
              <span className="font-titre text-5xl font-bold text-or-clair">{i + 1}</span>
              <h3 className="mt-3 text-xl font-bold">{titre}</h3>
              <p className="mt-2 leading-relaxed text-white/80">{texte}</p>
            </Apparition>
          ))}
        </ol>
      </div>
    </section>
  );
}

// Photos d'ambiance : reprend la photo principale de chaque fontaine (ou la photo "salon" si elle existe).
export function Ambiance() {
  const photos = PRODUITS.map((p) => ({ produit: p, photo: p.photos.find((x) => x.type === "salon") || p.photos[0] }));
  const ordre = [photos[1], photos[0], photos[2]];
  return (
    <section className="conteneur py-16 lg:py-20">
      <Apparition>
        <h2 className="max-w-2xl text-3xl font-bold sm:text-4xl">Dans votre intérieur</h2>
        <p className="mt-3 max-w-xl text-lg text-stone-600">Sur un meuble TV, un bureau ou une console d'entrée, chaque modèle trouve sa place.</p>
      </Apparition>
      <div className="mt-9 grid gap-4 md:grid-cols-[1.35fr_1fr] md:grid-rows-2">
        {ordre.map(({ produit, photo }, i) => (
          <Apparition as="figure" key={produit.id} delai={i * 90} className={`relative overflow-hidden rounded-lg ${i === 0 ? "md:row-span-2" : ""}`}>
            <img src={photo.src} alt={photo.alt} loading="lazy" width={1000} height={1000} className={`h-full w-full object-cover ${i === 0 ? "aspect-square md:aspect-auto" : "aspect-[16/10]"}`} />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-5 pb-4 pt-12 font-titre text-lg font-bold text-white">
              {produit.nom}
            </figcaption>
          </Apparition>
        ))}
      </div>
    </section>
  );
}

export function Questions() {
  return (
    <section id="faq" className="conteneur max-w-3xl py-16 lg:py-20">
      <Apparition><h2 className="text-3xl font-bold sm:text-4xl">Questions fréquentes</h2></Apparition>
      <div className="mt-8 divide-y divide-stone-200 border-y border-stone-200">
        {FAQ.map((f) => (
          <details key={f.q} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-titre text-lg font-bold [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="pb-5 leading-relaxed text-stone-700">{f.r}</p>
          </details>
        ))}
      </div>
      <div className="mt-10 text-center">
        <a href="#commande" className="btn-or px-8 py-4 text-lg">Commander maintenant</a>
      </div>
    </section>
  );
}

export function PiedDePage() {
  return (
    <footer className="bg-cafe pb-24 text-white/80 lg:pb-0">
      <div className="conteneur flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center">
        <Logo clair />
        <p className="text-sm">Fontaines décoratives d'intérieur. Livraison en Tunisie, paiement à la livraison.</p>
        <p className="text-sm">© {new Date().getFullYear()} {BOUTIQUE.nom}</p>
      </div>
    </footer>
  );
}

// Bouton WhatsApp : affiché seulement si NEXT_PUBLIC_WHATSAPP_NUMBER est rempli.
export function BoutonWhatsApp() {
  if (!/^\d{8,15}$/.test(WHATSAPP_NUMERO)) return null;
  const lien = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  return (
    <a href={lien} target="_blank" rel="noopener noreferrer" aria-label="Nous écrire sur WhatsApp"
      className="fixed bottom-24 right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 lg:bottom-6 lg:right-6">
      <MessageCircle className="h-7 w-7" aria-hidden="true" />
    </a>
  );
}
