import EnTete from "@/components/EnTete";
import Bandeau from "@/components/Bandeau";
import Boutique from "@/components/Boutique";
import { Garanties, Avantages, Fonctionnement, Ambiance, Questions, PiedDePage, BoutonWhatsApp } from "@/components/Sections";
import SectionAvis from "@/components/Avis";
import { PRODUITS, BOUTIQUE, SITE_URL } from "@/lib/config";

// Données structurées pour Google (produits et prix)
const donneesStructurees = {
  "@context": "https://schema.org",
  "@graph": PRODUITS.map((p) => ({
    "@type": "Product",
    name: p.nom,
    description: p.description,
    image: `${SITE_URL}${p.photos[0].src}`,
    brand: { "@type": "Brand", name: BOUTIQUE.nom },
    offers: { "@type": "Offer", price: p.prix, priceCurrency: "TND", availability: "https://schema.org/InStock", url: `${SITE_URL}/#commande` },
  })),
};

export default function Accueil() {
  return (
    <>
      <EnTete />
      <main>
        <Bandeau />
        <Boutique />
        <Garanties />
        <Avantages />
        <Fonctionnement />
        <Ambiance />
        <SectionAvis />
        <Questions />
      </main>
      <PiedDePage />
      <BoutonWhatsApp />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(donneesStructurees).replace(/</g, "\\u003c") }} />
    </>
  );
}
