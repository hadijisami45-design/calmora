"use client";
import Logo from "@/components/Logo";
import { FormulaireAvis } from "@/components/Avis";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function PageAvis({ token }) {
  return (
    <main className="grid min-h-screen place-items-center bg-sable p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-7 shadow-carte sm:p-9">
        <Logo />
        <h1 className="mt-6 text-3xl font-bold">Votre avis compte</h1>
        {UUID.test(token) ? (
          <>
            <p className="mt-2 text-stone-600">Merci pour votre commande. Dites-nous ce que vous pensez de votre fontaine.</p>
            <div className="mt-6"><FormulaireAvis token={token} /></div>
          </>
        ) : (
          <p className="mt-3 text-stone-700">Ce lien d'avis n'est pas valide. Utilisez le lien reçu après votre commande.</p>
        )}
        <a href="/" className="mt-6 inline-block text-sm text-stone-600 underline">Retour à la boutique</a>
      </div>
    </main>
  );
}
