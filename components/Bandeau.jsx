import { Leaf, Flower2, VolumeX, Gift } from "lucide-react";

const ATOUTS = [
  [Leaf, "Décoration", "élégante"],
  [Flower2, "Ambiance", "relaxante"],
  [VolumeX, "Fonctionnement", "silencieux"],
  [Gift, "Idée cadeau", "parfaite"],
];

export default function Bandeau() {
  return (
    <section id="accueil" className="relative isolate overflow-hidden bg-cafe text-white">
      {/* Photo : plein cadre sur mobile, moitié droite avec fondu sur ordinateur */}
      <img
        src="/images/feuilles-dorees.webp"
        alt="Fontaine Feuilles Dorées allumée, avec son anneau lumineux et ses feuilles de lotus dorées"
        width={1000}
        height={1000}
        fetchPriority="high"
        className="fondu-gauche absolute inset-0 -z-10 h-full w-full object-cover object-[60%_35%] lg:left-auto lg:right-0 lg:w-[44%] lg:object-[50%_30%]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-cafe via-cafe/80 to-cafe/25 lg:hidden" aria-hidden="true" />

      <div className="conteneur flex min-h-[560px] flex-col justify-end pb-10 pt-40 lg:min-h-[470px] lg:justify-center lg:py-12">
        <div className="max-w-xl lg:max-w-[54%]">
          <h1 className="text-[2.6rem] font-bold leading-[1.08] sm:text-6xl">Apportez la sérénité chez vous</h1>
          <p className="mt-5 max-w-lg font-titre text-xl leading-snug text-white/90 sm:text-2xl">
            Des fontaines décoratives élégantes pour une ambiance zen et relaxante.
          </p>
          <a href="#commande" className="btn-or mt-7 px-7 py-4 text-lg shadow-lg shadow-black/30">
            Commander maintenant
          </a>
          <ul className="mt-9 grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-nowrap sm:gap-x-8 lg:w-[640px]">
            {ATOUTS.map(([Icone, l1, l2]) => (
              <li key={l1} className="flex items-center gap-3 text-sm leading-tight">
                <Icone className="h-8 w-8 shrink-0 text-or-clair" strokeWidth={1.4} aria-hidden="true" />
                <span>{l1}<br />{l2}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
