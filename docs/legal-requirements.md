# Legal pages — required before taking payment

Three pages, each at its own URL, linked from every footer:

- `/legal/privacy/`            — what you collect (email, self-reported answers,
                                  assessment results), where it lives (Supabase),
                                  who else sees it (Kit, Stripe), how to delete it.
- `/legal/terms/`              — terms of use and refund policy. Stripe will ask
                                  for these before it lets you take money.
- `/legal/medical-disclaimer/` — standing disclaimer. A footer line is not enough
                                  for a site that collects self-reported symptoms.

These are the one place where a template is a reasonable starting point, but a
health product collecting symptom data should have them reviewed.
