import { ShoppingBag } from "lucide-react";
import Logo from "./Logo";

const LIENS = [
  ["#accueil", "Accueil"],
  ["#fontaines", "Nos Fontaines"],
  ["#pourquoi", "Pourquoi nous ?"],
  ["#avis", "Avis clients"],
];

export default function EnTete() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-creme/95 backdrop-blur">
      <div className="conteneur flex h-[68px] items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Navigation principale" className="hidden items-center gap-8 lg:flex">
          {LIENS.map(([href, texte]) => (
            <a key={href} href={href} className="text-[15px] font-medium text-encre underline-offset-8 hover:underline">
              {texte}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href="#commande" className="btn-or px-4 py-2.5 text-sm sm:px-5">
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span className="sm:hidden">Commander</span>
            <span className="hidden sm:inline">Commandez maintenant</span>
          </a>
        </div>
      </div>
    </header>
  );
}
