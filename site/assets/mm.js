/* =============================================================================
   mm.js — the shared client for muscle-meta.com
   The only copy of: config, auth, entitlement checks, catalog reads, email
   capture, tier logic and shared chrome behavior.

   Load order in a page:
     <link rel="stylesheet" href="/assets/mm.css">
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>  <!-- only where needed -->
     <script src="/assets/mm.js"></script>

   Both values below are public by design — row-level security is the protection.
   The service role key must NEVER appear in this file.
   ========================================================================== */

const MM_CONFIG = {
  supabaseUrl: 'https://bxpferfuwoiulnqnfqhf.supabase.co',
  supabaseKey: '',            // ← paste the publishable key here
  kitFormId:   '',            // ← Kit (ConvertKit) form id for email capture
  siteUrl:     'https://muscle-meta.com',
  debug:       true           // set false in production to quiet the warnings
};

const MM = (() => {
  let db = null;
  const problems = [];

  /* Colors come from the stylesheet, not from here. One home per token. */
  const cssVar = name => getComputedStyle(document.documentElement)
    .getPropertyValue(name).trim();

  try {
    if (!MM_CONFIG.supabaseKey) {
      problems.push('supabaseKey is empty — sign-in and saved results are disabled.');
    } else if (!window.supabase?.createClient) {
      problems.push('supabase-js did not load — add its script tag before mm.js.');
    } else {
      db = window.supabase.createClient(MM_CONFIG.supabaseUrl, MM_CONFIG.supabaseKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
    }
  } catch (err) {
    problems.push('Supabase client failed to initialise: ' + err.message);
  }
  if (!MM_CONFIG.kitFormId) problems.push('kitFormId is empty — email capture is disabled.');

  /* Degrade gracefully, but never silently: a misconfigured deploy that looks
     fine is how a broken signup form survives for a month. */
  if (problems.length && MM_CONFIG.debug) {
    console.warn('[MM] configuration incomplete:\n  · ' + problems.join('\n  · '));
  }

  /* ---- MM™ five-tier stratification. 0-100, higher is better. The ONLY copy.
     Colors resolve from the stylesheet so a token change reaches JS too. ---- */
  const TIER_DEFS = [
    { min: 85, label: 'Optimized',  varName: '--tier-1', mutedVar: '--tier-1-muted' },
    { min: 70, label: 'Functional', varName: '--tier-2', mutedVar: '--tier-2-muted' },
    { min: 55, label: 'Declining',  varName: '--tier-3', mutedVar: '--tier-3-muted' },
    { min: 40, label: 'At risk',    varName: '--tier-4', mutedVar: '--tier-4-muted' },
    { min: 0,  label: 'Critical',   varName: '--tier-5', mutedVar: '--tier-5-muted' }
  ];
  const tiers = () => TIER_DEFS.map(t => ({ ...t, color: cssVar(t.varName), muted: cssVar(t.mutedVar) }));

  /* Pillar names and counts are framework facts; colors resolve from tokens.
     Category counts are 5-2-3-2 and are not editable here. */
  const PILLAR_DEFS = [
    { id: 1, code: 'E', slug: 'exercise-mobility',    name: 'Exercise & Mobility',    categories: 5, varName: '--teal' },
    { id: 2, code: 'N', slug: 'nutrition-metabolism', name: 'Nutrition & Metabolism', categories: 2, varName: '--gold' },
    { id: 3, code: 'R', slug: 'recovery-stress',      name: 'Recovery & Stress',      categories: 3, varName: '--purple' },
    { id: 4, code: 'B', slug: 'balance-brain-health', name: 'Balance & Brain Health', categories: 2, varName: '--green' }
  ];
  const pillars = () => PILLAR_DEFS.map(p => ({ ...p, color: cssVar(p.varName) }));

  /* Category numbers run 1-12 continuously across the matrix — they do NOT
     restart inside each pillar. `key` (P#-C#) is the stable identifier used by
     the database, URLs and research-tracker rows. Endurance is P1-C5. */
  const CATEGORY_DEFS = [
    { key: 'P1-C1',  n: 1,  pillar: 1, slug: 'joint-health',            name: 'Joint Health' },
    { key: 'P1-C2',  n: 2,  pillar: 1, slug: 'functional-independence', name: 'Functional Independence' },
    { key: 'P1-C3',  n: 3,  pillar: 1, slug: 'mobility',                name: 'Mobility' },
    { key: 'P1-C4',  n: 4,  pillar: 1, slug: 'strength',                name: 'Strength' },
    { key: 'P1-C5',  n: 5,  pillar: 1, slug: 'endurance',               name: 'Endurance' },
    { key: 'P2-C6',  n: 6,  pillar: 2, slug: 'nutrition',               name: 'Nutrition' },
    { key: 'P2-C7',  n: 7,  pillar: 2, slug: 'metabolic-flexibility',   name: 'Metabolic Flexibility' },
    { key: 'P3-C8',  n: 8,  pillar: 3, slug: 'recovery',                name: 'Recovery' },
    { key: 'P3-C9',  n: 9,  pillar: 3, slug: 'lifestyle',               name: 'Lifestyle' },
    { key: 'P3-C10', n: 10, pillar: 3, slug: 'stress-management',       name: 'Stress Management' },
    { key: 'P4-C11', n: 11, pillar: 4, slug: 'balance',                 name: 'Balance' },
    { key: 'P4-C12', n: 12, pillar: 4, slug: 'brain-health',            name: 'Brain Health' }
  ];
  const categories = pillarId => (pillarId
    ? CATEGORY_DEFS.filter(c => c.pillar === pillarId)
    : CATEGORY_DEFS).map(c => ({ ...c, color: cssVar(PILLAR_DEFS[c.pillar - 1].varName) }));

  let authSubscription = null;

  return {
    ready: () => !!db,
    client: () => db,
    problems: () => problems.slice(),
    tiers, pillars, categories,
    tierFor: score => {
      const def = TIER_DEFS.find(t => score >= t.min) || TIER_DEFS[TIER_DEFS.length - 1];
      return { ...def, color: cssVar(def.varName), muted: cssVar(def.mutedVar) };
    },

    /* ---- Identity ---- */
    auth: {
      async user() {
        if (!db) return null;
        try { const { data } = await db.auth.getUser(); return data.user ?? null; }
        catch (err) { console.warn('[MM] getUser failed:', err.message); return null; }
      },
      async signInWithGoogle(redirectTo = window.location.href) {
        if (!db) return { error: 'unavailable' };
        // NOTE: every URL used here must be in Supabase's redirect allow-list,
        // including Netlify deploy-preview URLs, or sign-in fails on previews.
        return db.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
      },
      async signOut() { return db ? db.auth.signOut() : null; },
      onChange(handler) {
        if (!db) return null;
        const { data } = db.auth.onAuthStateChange((_e, s) => handler(s?.user ?? null));
        authSubscription = data?.subscription ?? null;
        return authSubscription;
      },
      stopListening() { authSubscription?.unsubscribe(); authSubscription = null; }
    },

    /* ---- Access. One question, asked the same way everywhere. ---- */
    async can(featureKey) {
      if (!db) return false;
      const { data, error } = await db.rpc('has_entitlement', { feature: featureKey });
      if (error) { console.warn('[MM] entitlement check failed:', error.message); return false; }
      return data === true;
    },

    /* ---- Catalog: the hub reads this, so a new asset is a row ---- */
    async catalog() {
      if (!db) return { courses: [], programs: [], error: 'client unavailable' };
      const [courses, programs] = await Promise.all([
        db.from('courses').select('slug,title,subtitle,pillar_id,access_key').eq('status', 'published').order('position'),
        db.from('programs').select('slug,title,subtitle,pillar_id,access_key').eq('status', 'published')
      ]);
      const error = courses.error?.message || programs.error?.message || null;
      if (error) console.warn('[MM] catalog read failed:', error);
      return { courses: courses.data ?? [], programs: programs.data ?? [], error };
    },

    /* ---- Email capture. Every free asset ends in one of these. ---- */
    async capture(email, { source = document.title, tag = '' } = {}) {
      if (!MM_CONFIG.kitFormId) return { ok: false, reason: 'unconfigured' };
      try {
        const res = await fetch(`https://app.kit.com/forms/${MM_CONFIG.kitFormId}/subscriptions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ email_address: email, fields: { source, tag } })
        });
        if (!res.ok) console.warn('[MM] capture rejected:', res.status);
        return { ok: res.ok, status: res.status };
      } catch (err) { console.warn('[MM] capture failed:', err.message); return { ok: false, reason: 'network' }; }
    },

    /* Wire up any .mm-capture block. The delivery link is offered, not forced —
       the message says to check the inbox, so we do not yank the page away. */
    initCapture() {
      document.querySelectorAll('.mm-capture form').forEach(form => {
        form.addEventListener('submit', async e => {
          e.preventDefault();
          const input = form.querySelector('input[type=email]');
          const status = form.parentElement.querySelector('.status') || form.closest('.mm-capture').querySelector('.status');
          const href = form.dataset.deliver || '';
          if (!input.value || !status) return;
          status.textContent = 'Sending…'; status.className = 'status';
          const res = await MM.capture(input.value, { tag: form.dataset.tag || '' });
          if (res.ok) {
            status.className = 'status ok';
            status.innerHTML = href
              ? 'Check your inbox — it is on the way. <a href="' + href + '">Or open it now.</a>'
              : 'Check your inbox — it is on the way.';
            form.reset();
          } else {
            status.textContent = res.reason === 'unconfigured'
              ? 'Email capture is not connected yet.'
              : 'That did not go through. Try again in a moment.';
          }
        });
      });
    },

    /* ---- Shared chrome ---- */
    initChrome() {
      const nav = document.querySelector('.mm-nav');
      if (nav) window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 12), { passive: true });
      const toggle = document.querySelector('.mm-navtoggle');
      const links = document.querySelector('.mm-navlinks');
      if (toggle && links) {
        toggle.addEventListener('click', () => {
          const open = links.classList.toggle('open');
          toggle.setAttribute('aria-expanded', String(open));
        });
      }
      const reveal = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); }), { threshold: .12 });
      document.querySelectorAll('.mmm-reveal').forEach(el => reveal.observe(el));
    }
  };
})();

document.addEventListener('DOMContentLoaded', () => { MM.initChrome(); MM.initCapture(); });
window.MM = MM;
