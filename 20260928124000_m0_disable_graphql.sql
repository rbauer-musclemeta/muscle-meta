-- M0 · Remove the unused GraphQL endpoint.
-- Nothing on muscle-meta.com or app.muscle-meta.com uses GraphQL; every read
-- goes through the REST API under RLS. pg_graphql exposed the name and shape
-- of every table to anonymous visitors (advisor lints 0026 / 0027). Dropping
-- the extension removes /graphql/v1 entirely. Re-enable only if a future
-- feature truly needs it, and review exposure again then.
drop extension if exists pg_graphql;
