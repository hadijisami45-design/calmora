# Calmora : boutique de fontaines décoratives

Site e-commerce en français, prix en DT, commande avec paiement à la livraison, et espace d'administration des commandes.

## Architecture

| Élément | Choix |
|---|---|
| Site, API et admin | Next.js 15 (App Router), un seul projet |
| Style | Tailwind CSS |
| Base de données | PostgreSQL (Supabase, offre gratuite) |
| Connexion admin | Nom d'utilisateur + mot de passe hashé (bcrypt), session par cookie signé |
| Hébergement conseillé | Netlify (offre gratuite, usage commercial autorisé) |

```
app/
  page.js                    Page d'accueil (boutique)
  layout.js                  Balises SEO, Open Graph, polices, Pixel Meta
  admin/page.js              Tableau des commandes (protégé)
  admin/login/page.js        Connexion administrateur
  api/orders/route.js        Enregistre une commande (validation serveur)
  api/admin/...              Connexion, liste, statut, suppression (protégés)
  api/health/route.js        Test de santé de la base
components/                  En-tête, bandeau, boutique + formulaire, sections
lib/config.js                PRIX, produits, photos, villes, statuts, FAQ  ← à modifier
lib/validation.js            Règles de validation (navigateur et serveur)
lib/db.js, auth.js           Base de données et sessions
db/schema.sql                Tables « orders », « order_items », « reviews » et « admins »
scripts/                     Création des tables et du compte admin
middleware.js                Protection de /admin et /api/admin
public/images/               Photos des fontaines
```

## Installation sur votre ordinateur

Il faut [Node.js](https://nodejs.org) version 20 ou plus.

### 1. Créer la base de données

1. Créez un compte sur https://supabase.com puis un projet (région Europe). Notez le mot de passe de la base.
2. Cliquez sur **Connect** en haut du projet et copiez la chaîne **Transaction pooler** (port 6543). Remplacez `[YOUR-PASSWORD]` par votre mot de passe.

### 2. Configurer

```bash
npm install
cp .env.example .env.local
```

Ouvrez `.env.local` et remplissez :

- `DATABASE_URL` : la chaîne copiée à l'étape 1.
- `SESSION_SECRET` : une longue chaîne aléatoire. Pour en générer une :
  `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

### 3. Créer les tables et le premier compte administrateur

```bash
npm run db:init
npm run create-admin
```

La seconde commande demande un nom d'utilisateur et un mot de passe (12 caractères minimum). Il n'existe aucune inscription admin sur le site : ce script est le seul moyen de créer ou de changer un compte. Relancez-le avec le même nom pour changer le mot de passe.

### 4. Lancer

```bash
npm run dev        # développement : http://localhost:10000
```

ou, comme en production :

```bash
npm run build
npm run start
```

L'administration est sur `http://localhost:10000/admin`.

## Mise en ligne gratuite (Netlify)

1. Créez un dépôt **privé** sur https://github.com et envoyez-y le projet (le fichier `.env.local` n'est pas envoyé, c'est voulu).
2. Sur https://netlify.com : **Add new site > Import an existing project**, choisissez le dépôt. Netlify détecte Next.js tout seul.
3. Dans **Site configuration > Environment variables**, ajoutez les mêmes variables que dans `.env.local` : `DATABASE_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL` (l'adresse de votre site, par exemple `https://calmora.netlify.app`), et si besoin `NEXT_PUBLIC_WHATSAPP_NUMBER` et `NEXT_PUBLIC_META_PIXEL_ID`.
4. Lancez le déploiement. Après chaque changement de variable, relancez un déploiement.

À savoir :

- **Vercel** fonctionne aussi techniquement, mais son offre gratuite est réservée à un usage non commercial.
- **Supabase gratuit met le projet en pause après 7 jours sans activité.** Tant que des clients visitent le site ce n'est pas un problème, mais pour être tranquille, programmez un service de surveillance gratuit (par exemple UptimeRobot) qui appelle `https://votre-site/api/health` chaque jour. Si la base est en pause, les commandes échouent jusqu'à ce que vous la réactiviez depuis Supabase.

## Ce que vous pouvez modifier

Tout est dans `lib/config.js` :

- **Prix** : bloc `PRIX` en haut du fichier (prix actuel et ancien prix de chaque fontaine). La réduction affichée se calcule toute seule.
- **Produits** : noms, textes et photos. Pour ajouter des photos (salon, gros plan, verticale), déposez-les dans `public/images/` et ajoutez une ligne dans `photos`. Les miniatures apparaissent automatiquement sur la fiche.
- **FAQ**, **villes**, **statuts**.

Dans `.env.local` (ou les variables Netlify) :

- **WhatsApp** : `NEXT_PUBLIC_WHATSAPP_NUMBER=21620123456`. Vide = bouton masqué.
- **Pixel Meta** : `NEXT_PUBLIC_META_PIXEL_ID=votre_identifiant`. Vide = pixel désactivé. Événements envoyés : `PageView`, `ViewContent` (ouverture de la boutique), `AddToCart` (choix d'une fontaine), `Lead` et `Purchase` (commande confirmée, avec le montant en TND).

## Administration

- Statistiques : nombre de commandes, confirmées, livrées, chiffre d'affaires des commandes livrées.
- Recherche par téléphone, nom ou numéro de commande ; filtre par statut ; tri par date.
- Le statut se change directement dans la liste.
- Le bouton rouge **Supprimer définitivement** n'apparaît que pour une commande « Sans suite », avec demande de confirmation. Le serveur refuse aussi la suppression de toute autre commande.

## Avis clients

- Seul un client qui a passé commande peut laisser un avis, et un seul par commande.
- Le formulaire d'avis apparaît dans la fenêtre de confirmation, puis dans la rubrique « Avis clients » du site tant que le client utilise le même appareil.
- Dans l'admin, le bouton **Copier le lien d'avis** d'une commande donne un lien personnel à envoyer au client (WhatsApp, SMS), par exemple après la livraison.
- Un avis n'apparaît sur le site qu'après avoir été **publié** dans la partie « Avis clients » de l'admin. Vous pouvez aussi le masquer ou le supprimer, mais pas modifier son texte ni sa note.
- Le site affiche uniquement le prénom et la ville du client.

Après une mise à jour du projet, relancez `npm run db:init` : la commande ajoute les nouvelles tables sans toucher aux commandes existantes.

## Sécurité

- Validation dans le navigateur **et** sur le serveur (téléphone tunisien à 8 chiffres, quantités entières à partir de 1, ville dans la liste).
- Le prix est calculé par le serveur à partir de `lib/config.js` ; un prix envoyé par le navigateur est ignoré.
- Requêtes SQL paramétrées uniquement.
- Anti double commande : bouton verrouillé pendant l'envoi + identifiant unique par formulaire (un renvoi ne crée pas de deuxième commande).
- Limite de 30 commandes par numéro de téléphone et par heure (réglable dans `lib/config.js`), champ piège anti-robots.
- Mot de passe admin hashé avec bcrypt, jamais présent dans le navigateur ; blocage 15 minutes après 5 échecs.
- Session admin dans un cookie `HttpOnly`, `Secure`, `SameSite=Strict`, valable 12 heures.
- `/admin` et `/api/admin` protégés par le middleware et vérifiés à nouveau dans chaque route.
- Tables Supabase fermées à l'API publique (RLS activé sans règle) : seule l'application y accède.
- Secrets dans `.env.local`, jamais dans le code.
