// Envoi d'événements au Pixel Meta. Ne fait rien tant que le pixel n'est pas activé.
export function suivre(evenement, donnees = {}) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", evenement, donnees);
  }
}
