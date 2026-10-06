import "./globals.css";
import MetaPixel from "@/components/MetaPixel";
import { BOUTIQUE, SITE_URL } from "@/lib/config";

const titre = `${BOUTIQUE.nom} | Fontaines décoratives d'intérieur en Tunisie`;
const description =
  "Fontaines décoratives pour une ambiance zen et relaxante. À partir de 120 DT, livraison à domicile partout en Tunisie et paiement à la livraison.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: titre,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: titre,
    description,
    url: "/",
    siteName: BOUTIQUE.nom,
    locale: "fr_TN",
    type: "website",
    images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: "Fontaine décorative Calmora posée sur un meuble de salon" }],
  },
  twitter: { card: "summary_large_image", title: titre, description, images: ["/images/og.jpg"] },
};

export const viewport = { themeColor: "#2A1D14", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=PT+Serif:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <MetaPixel />
      </body>
    </html>
  );
}
