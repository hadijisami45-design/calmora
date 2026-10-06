import { BOUTIQUE } from "@/lib/config";

// Logo : étoile à quatre branches dans un cercle cuivré, suivie du nom de la boutique.
export default function Logo({ clair = false }) {
  const cuivre = clair ? "#E0A27C" : "#B5683C";
  return (
    <a href="/" className="flex items-center gap-3" aria-label={`${BOUTIQUE.nom}, accueil`}>
      <svg viewBox="0 0 24 24" className="h-9 w-9 shrink-0" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10.75" stroke={cuivre} strokeWidth="1.3" />
        <path d="M12 6.2c.55 3.5 2.3 5.25 5.8 5.8-3.500.55-5.250 2.300-5.800 5.800-.55-3.500-2.300-5.250-5.800-5.800 3.500-.55 5.250-2.300 5.800-5.800Z" fill={cuivre} />
      </svg>
      <span className={`font-titre text-[28px] font-normal leading-none tracking-[0.01em] ${clair ? "text-white" : "text-encre"}`}>{BOUTIQUE.nom}</span>
    </a>
  );
}
