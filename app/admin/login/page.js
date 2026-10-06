"use client";
import { useState } from "react";
import { LockKeyhole, LoaderCircle } from "lucide-react";

export default function Connexion() {
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function connecter(e) {
    e.preventDefault();
    if (envoi) return;
    setErreur(""); setEnvoi(true);
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: f.get("username"), password: f.get("password") }),
      });
      if (r.ok) { window.location.assign("/admin"); return; }
      const j = await r.json().catch(() => ({}));
      setErreur(j.erreur || "Connexion impossible.");
    } catch {
      setErreur("Connexion impossible. Vérifiez votre connexion internet.");
    }
    setEnvoi(false);
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <form onSubmit={connecter} className="w-full max-w-sm rounded-xl bg-white p-7 shadow-carte ring-1 ring-stone-200">
        <LockKeyhole className="h-9 w-9 text-foret" strokeWidth={1.5} aria-hidden="true" />
        <h1 className="mt-3 text-2xl font-bold">Administration Calmora</h1>
        <p className="mt-1 text-sm text-stone-600">Connectez-vous pour gérer les commandes.</p>
        <label htmlFor="username" className="mb-1.5 mt-6 block text-sm font-semibold">Nom d'utilisateur</label>
        <input id="username" name="username" className="champ" autoComplete="username" autoCapitalize="none" required />
        <label htmlFor="password" className="mb-1.5 mt-4 block text-sm font-semibold">Mot de passe</label>
        <input id="password" name="password" type="password" className="champ" autoComplete="current-password" required />
        {erreur && <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-promo">{erreur}</p>}
        <button type="submit" disabled={envoi} className="btn-vert mt-6 w-full">
          {envoi && <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />}
          Se connecter
        </button>
        <a href="/" className="mt-5 block text-center text-sm text-stone-600 hover:underline">Retour à la boutique</a>
      </form>
    </main>
  );
}
