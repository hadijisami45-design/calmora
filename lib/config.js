// =====================================================================
//  CONFIGURATION DE LA BOUTIQUE
//  Tout ce que vous aurez à modifier se trouve dans ce fichier.
// =====================================================================

export const BOUTIQUE = {
  nom: "Calmora",
  slogan: "Décoration • Bien-être • Sérénité",
  devise: "DT",
};

// ---------------------------------------------------------------------
//  PRIX (en dinars) : modifiez simplement les chiffres ci-dessous.
// ---------------------------------------------------------------------
export const PRIX = {
  "feuilles-dorees": { actuel: 135, ancien: 170 },
  "sphere-zen":      { actuel: 100, ancien: 100 },
  "cascade-moderne": { actuel: 100, ancien: 100 },
  "fontaine-amphore": { actuel: 150, ancien: 150 },
  "fontaine-cascade-grise": { actuel: 190, ancien: 230 },
  "fontaine-tronc-sombre": { actuel: 150, ancien: 150 },
  "fontaine-cascade-ivoire": { actuel: 190, ancien: 230 },
};

export const QUANTITE_MAX = 999;          // quantité maximale par commande (limite technique)

// Frein anti-abus : nombre maximal de commandes par numéro de téléphone et par heure.
export const COMMANDES_MAX_PAR_HEURE = 30;

// ---------------------------------------------------------------------
//  PRODUITS
//  Pour ajouter des photos : déposez-les dans /public/images puis ajoutez
//  une ligne dans "photos". Types prévus : principale, salon, gros-plan, verticale.
// ---------------------------------------------------------------------
export const PRODUITS = [
  {
    id: "feuilles-dorees",
    nom: "Fontaine Feuilles Dorées",
    accroche: "Élégance et modernité",
    description:
      "Bassin rond noir, grand anneau LED lumineux, coupelles dorées en forme de feuilles de lotus, fleur décorative et eau en cascade.",
    photos: [
      { type: "principale", src: "/images/feuilles-dorees.webp", alt: "Fontaine Feuilles Dorées : anneau LED, feuilles de lotus dorées et bassin noir" },
      // { type: "salon",     src: "/images/feuilles-dorees-salon.webp",     alt: "..." },
      // { type: "gros-plan", src: "/images/feuilles-dorees-gros-plan.webp", alt: "..." },
      // { type: "verticale", src: "/images/feuilles-dorees-verticale.webp", alt: "..." },
    ],
  },
  {
    id: "sphere-zen",
    nom: "Fontaine Sphère Zen",
    accroche: "Style naturel et apaisant",
    description:
      "Bassin carré noir effet pierre garni de galets, plateforme supérieure et sphère noire d'où l'eau ruisselle.",
    photos: [
      { type: "principale", src: "/images/sphere-zen.webp", alt: "Fontaine Sphère Zen : sphère noire sur bassin carré effet pierre avec galets" },
    ],
  },
  {
    id: "cascade-moderne",
    nom: "Fontaine Cascade Moderne",
    accroche: "Design minimaliste",
    description:
      "Fontaine noire moderne : l'eau descend de bol en bol jusqu'au bassin garni de galets.",
    photos: [
      { type: "principale", src: "/images/cascade-moderne.webp", alt: "Fontaine Cascade Moderne : bols noirs striés en cascade et galets" },
    ],
  },
  {
    id: "fontaine-amphore",
    nom: "Fontaine Amphore Orientale",
    accroche: "Charme artisanal et douceur",
    description: "Fontaine décorative à amphore inclinée, bassin effet pierre beige et deux petites plantes vertes. L’eau s’écoule dans le bassin.",
    photos: [{ type: "principale", src: "/images/fontaine-amphore.webp", alt: "Fontaine beige avec amphore, plantes vertes et écoulement d’eau dans un décor arabesque" }],
  },
  {
    id: "fontaine-cascade-grise",
    nom: "Fontaine Cascade Grise",
    accroche: "Une cascade au style sculpté",
    description: "Fontaine grise à plusieurs niveaux, aux formes de troncs sculptés, avec jets d’eau et grand bassin inférieur.",
    photos: [{ type: "principale", src: "/images/fontaine-cascade-grise.webp", alt: "Fontaine grise à plusieurs cascades présentée sous une arche orientale" }],
  },
  {
    id: "fontaine-tronc-sombre",
    nom: "Fontaine Tronc Sombre",
    accroche: "Compacte et pleine de caractère",
    description: "Fontaine effet bois sombre, à bassins superposés, relief floral et petite plante décorative.",
    photos: [{ type: "principale", src: "/images/fontaine-tronc-sombre.webp", alt: "Petite fontaine effet tronc sombre avec eau en cascade et lanternes orientales" }],
  },
  {
    id: "fontaine-cascade-ivoire",
    nom: "Fontaine Cascade Ivoire",
    accroche: "L’élégance des matières naturelles",
    description: "Fontaine ivoire à cinq coupes étagées, fleurs décoratives et écoulements d’eau vers le bassin inférieur.",
    photos: [{ type: "principale", src: "/images/fontaine-cascade-ivoire.webp", alt: "Fontaine ivoire à cinq niveaux avec fleurs et cascades dans un décor arabesque" }],
  },
].map((p) => ({ ...p, prix: PRIX[p.id].actuel, ancienPrix: PRIX[p.id].ancien }));

export function trouverProduit(id) {
  return PRODUITS.find((p) => p.id === id) || null;
}

export function reduction(p) {
  return p.ancienPrix > p.prix ? Math.round((1 - p.prix / p.ancienPrix) * 100) : 0;
}

// ---------------------------------------------------------------------
//  VILLES proposées dans le formulaire (gouvernorats)
// ---------------------------------------------------------------------
export const VILLES = [
  "Tunis", "Ariana", "Ben Arous", "La Manouba", "Nabeul", "Zaghouan", "Bizerte", "Béja",
  "Jendouba", "Le Kef", "Siliana", "Sousse", "Monastir", "Mahdia", "Sfax", "Kairouan",
  "Kasserine", "Sidi Bouzid", "Gabès", "Médenine", "Tataouine", "Gafsa", "Tozeur", "Kébili",
];

// ---------------------------------------------------------------------
//  STATUTS des commandes (admin)
// ---------------------------------------------------------------------
export const STATUTS = [
  { id: "nouvelle",     label: "Nouvelle",               classe: "bg-sky-100 text-sky-900 ring-sky-300" },
  { id: "a_confirmer",  label: "À confirmer",            classe: "bg-amber-100 text-amber-900 ring-amber-300" },
  { id: "confirmee",    label: "Confirmée",              classe: "bg-emerald-100 text-emerald-900 ring-emerald-300" },
  { id: "en_livraison", label: "En cours de livraison",  classe: "bg-violet-100 text-violet-900 ring-violet-300" },
  { id: "livree",       label: "Livrée",                 classe: "bg-green-700 text-white ring-green-800" },
  { id: "sans_suite",   label: "Sans suite",             classe: "bg-stone-200 text-stone-700 ring-stone-400" },
];
export const STATUT_IDS = STATUTS.map((s) => s.id);

// ---------------------------------------------------------------------
//  AVIS CLIENTS
//  Les avis sont écrits par les clients après leur commande (un avis par commande)
//  et apparaissent sur le site une fois validés dans l'admin.
// ---------------------------------------------------------------------
export const AVIS_LONGUEUR_MAX = 500;
export const STATUTS_AVIS = [
  { id: "en_attente", label: "En attente", classe: "bg-amber-100 text-amber-900 ring-amber-300" },
  { id: "publie",     label: "Publié",     classe: "bg-green-700 text-white ring-green-800" },
  { id: "masque",     label: "Masqué",     classe: "bg-stone-200 text-stone-700 ring-stone-400" },
];

// ---------------------------------------------------------------------
//  FAQ : adaptez les réponses à votre fonctionnement réel.
// ---------------------------------------------------------------------
export const FAQ = [
  { q: "Comment passer commande ?", r: "Choisissez votre fontaine et la quantité, remplissez vos coordonnées puis confirmez. Notre équipe vous appelle pour valider la livraison." },
  { q: "Comment se fait le paiement ?", r: "Le paiement se fait à la livraison, en espèces, à la réception de votre fontaine. Aucun paiement en ligne n'est demandé." },
  { q: "Livrez-vous partout en Tunisie ?", r: "Oui, nous livrons à domicile dans tous les gouvernorats. Le délai et les frais de livraison vous sont confirmés par téléphone." },
  { q: "Comment fonctionne la fontaine ?", r: "Remplissez le bassin d'eau, branchez la fontaine et l'eau circule en continu grâce à une petite pompe." },
  { q: "Puis-je commander plusieurs fontaines ?", r: "Oui. Vous pouvez commander un ou plusieurs modèles dans la même commande, chacun avec la quantité de votre choix." },
];

// ---------------------------------------------------------------------
//  WhatsApp et Pixel Meta : réglés dans .env.local (voir .env.example)
// ---------------------------------------------------------------------
export const WHATSAPP_NUMERO = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
export const WHATSAPP_MESSAGE = "Bonjour, je souhaite commander une fontaine.";
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:10000";
