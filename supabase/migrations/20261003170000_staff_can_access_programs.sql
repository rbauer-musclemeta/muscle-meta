-- Staff (admin, owner) can open every program, course, lesson and assessment
-- without holding a member entitlement, so they can support members and test
-- journeys. MatrixApp already shows staff every program (lib/program.ts
-- hasAccess); before this, RLS hid the programs row from an owner with no
-- entitlement, getJourney() threw, and /app returned a server error
-- (2026-10-03, first owner sign-in).
--
-- Member access is unchanged: has_entitlement() still decides it, and
-- entitlements still attach to products, never to a pillar or category.
create or replace function public.can_access(access_key text)
returns boolean
language sql
stable
security invoker
set search_path to 'public'
as $$
  select access_key = 'free'
      or public.has_entitlement(access_key)
      or private.is_staff();
$$;
