import PageAvis from "./PageAvis";

export const metadata = { title: "Donner mon avis | Calmora", robots: { index: false, follow: false } };

// Page ouverte par le lien d'avis envoyé au client : /avis?c=JETON
export default async function Page({ searchParams }) {
  const { c } = await searchParams;
  return <PageAvis token={typeof c === "string" ? c : ""} />;
}
