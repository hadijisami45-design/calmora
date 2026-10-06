-- Schéma de la base Calmora (PostgreSQL / Supabase)
-- À exécuter avec "npm run db:init" (ou à coller dans Supabase > SQL Editor).
-- Peut être relancé sans risque : il met aussi à jour une base créée avec une version précédente.

create extension if not exists pgcrypto;

create sequence if not exists order_number_seq start 1001;

-- Une commande = un client + une ou plusieurs lignes (table order_items)
create table if not exists orders (
  id            uuid primary key default gen_random_uuid(),
  order_number  text not null unique,
  submission_id uuid not null unique,          -- anti double commande (même formulaire envoyé deux fois)
  total_price   integer not null check (total_price >= 0),  -- en dinars
  first_name    text not null check (char_length(first_name) between 2 and 60),
  last_name     text not null check (char_length(last_name) between 2 and 60),
  phone         text not null check (phone ~ '^[2-9][0-9]{7}$'),
  address       text not null check (char_length(address) between 5 and 200),
  city          text not null check (char_length(city) between 2 and 60),
  status        text not null default 'nouvelle'
                check (status in ('nouvelle','a_confirmer','confirmee','en_livraison','livree','sans_suite')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Les fontaines d'une commande : une ligne par modèle, avec sa quantité
create table if not exists order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  product_id   text not null,
  product_name text not null,
  quantity     integer not null check (quantity between 1 and 999),
  unit_price   integer not null check (unit_price >= 0),   -- en dinars
  line_total   integer not null check (line_total >= 0),   -- en dinars
  unique (order_id, product_id)
);

-- Mise à jour depuis l'ancienne version (une seule fontaine par commande) :
-- les commandes existantes sont conservées et converties en lignes.
do $$
begin
  if exists (select 1 from information_schema.columns
              where table_schema = current_schema() and table_name = 'orders' and column_name = 'product_id') then
    insert into order_items (order_id, product_id, product_name, quantity, unit_price, line_total)
      select id, product_id, product_name, quantity, unit_price, total_price from orders
      on conflict do nothing;
    alter table orders
      drop column product_id, drop column product_name, drop column quantity, drop column unit_price;
  end if;
end $$;

-- Jeton secret remis au client à la fin de sa commande : il lui permet de laisser UN avis.
alter table orders add column if not exists review_token uuid not null default gen_random_uuid();
create unique index if not exists orders_review_token_idx on orders (review_token);

-- Avis clients : un seul par commande, publié après validation dans l'admin.
create table if not exists reviews (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null unique references orders(id) on delete cascade,
  rating     integer not null check (rating between 1 and 5),
  comment    text not null default '' check (char_length(comment) <= 500),
  status     text not null default 'en_attente' check (status in ('en_attente','publie','masque')),
  created_at timestamptz not null default now()
);
create index if not exists reviews_status_idx on reviews (status, created_at desc);

create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists orders_phone_idx on orders (phone);
create index if not exists order_items_order_idx on order_items (order_id);

create table if not exists admins (
  id              uuid primary key default gen_random_uuid(),
  username        text not null unique,
  password_hash   text not null,               -- bcrypt, jamais le mot de passe en clair
  failed_attempts integer not null default 0,
  locked_until    timestamptz,
  created_at      timestamptz not null default now()
);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at before update on orders
  for each row execute function set_updated_at();

-- Supabase expose les tables par une API publique : on la ferme complètement.
-- Avec RLS activé et aucune règle, seule l'application (connexion serveur) peut lire ou écrire.
alter table orders enable row level security;
alter table order_items enable row level security;
alter table admins enable row level security;
alter table reviews enable row level security;
