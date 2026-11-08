-- ============================================================
-- MM™ COMMERCE — Stripe and Kajabi both grant the SAME entitlement.
-- The app never asks "did they buy on Stripe or Kajabi?" It asks
-- "does this user hold feature_key X right now?"
-- ============================================================

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  feature_key text not null,                      -- what owning it unlocks
  stripe_product_id text unique,
  kajabi_offer_id text unique,
  is_subscription boolean not null default false,
  status text not null default 'draft' check (status in ('draft','active','retired')),
  created_at timestamptz not null default now()
);

create table public.prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  stripe_price_id text unique,
  currency text not null default 'usd',
  unit_amount integer not null,                   -- cents
  interval text check (interval in ('month','year')),
  is_default boolean not null default false,
  active boolean not null default true
);

-- The single source of truth for access. Written by webhooks, read by the app.
create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature_key text not null,
  source text not null check (source in ('stripe','kajabi','manual','trial')),
  product_id uuid references public.products(id),
  external_ref text,                              -- stripe subscription id / kajabi grant id
  granted_at timestamptz not null default now(),
  expires_at timestamptz,                         -- null = perpetual
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index entitlements_active_unique
  on public.entitlements (user_id, feature_key, source)
  where revoked_at is null;

-- Raw webhook receipts, kept for reconciliation when a grant looks wrong
create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('stripe','kajabi')),
  event_type text not null,
  external_id text,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  payload jsonb not null,
  processed_at timestamptz,
  error text,
  received_at timestamptz not null default now()
);
create unique index payment_events_provider_external on public.payment_events (provider, external_id) where external_id is not null;

-- ---------- Access helper: one function every gate calls ----------
create or replace function public.has_entitlement(feature text)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.entitlements e
    where e.user_id = (select auth.uid())
      and e.feature_key = feature
      and e.revoked_at is null
      and (e.expires_at is null or e.expires_at > now())
  );
$$;

-- Free content stays open; gated content requires the matching entitlement.
create or replace function public.can_access(access_key text)
returns boolean
language sql stable security definer set search_path = public as $$
  select access_key = 'free' or public.has_entitlement(access_key);
$$;

-- ---------- Tighten content policies to respect entitlements ----------
drop policy if exists "published courses readable" on public.courses;
create policy "courses readable by access" on public.courses
  for select using (status = 'published' and public.can_access(access_key));

drop policy if exists "published programs readable" on public.programs;
create policy "programs readable by access" on public.programs
  for select using (status = 'published' and public.can_access(access_key));

drop policy if exists "published user assessments readable" on public.assessments;
create policy "assessments readable by access" on public.assessments
  for select using (status = 'published' and audience = 'user' and public.can_access(access_key));

-- Preview lessons stay visible inside a gated course so the sales page has something to show
drop policy if exists "lessons of published courses" on public.lessons;
create policy "lessons readable by access" on public.lessons
  for select using (exists (
    select 1 from public.modules m join public.courses c on c.id = m.course_id
    where m.id = lessons.module_id and c.status = 'published'
      and (lessons.is_preview or public.can_access(c.access_key))));

-- ---------- Seed the first two products ----------
insert into public.products (slug, name, description, feature_key, is_subscription, status) values
  ('oxygen-engine-program','The Oxygen Engine training program','Twelve-week cardiorespiratory program for adults 50+','program.oxygen_engine',false,'draft'),
  ('mm-founding-member','Muscle-Meta Founding Member','Full platform access including Balance & Brain Health','pillar.balance_brain',true,'draft');

-- ---------- RLS ----------
alter table public.products      enable row level security;
alter table public.prices        enable row level security;
alter table public.entitlements  enable row level security;
alter table public.payment_events enable row level security;

create policy "active products readable" on public.products for select using (status = 'active');
create policy "active prices readable"   on public.prices   for select using (active = true);
create policy "own entitlements readable" on public.entitlements for select using ((select auth.uid()) = user_id);
-- entitlements are WRITTEN only by the service role (webhooks): no insert/update policy.
-- payment_events: RLS on, no policy at all — service role only.
