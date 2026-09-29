/* complete-assessment — the only writer of assessment_results.

   POST { "session_id": "<uuid>" } with the member's Supabase access token.

   1. Verifies the caller and that the session is theirs.
   2. Reads the STORED answers and orientation (never answers sent by the
      browser), so a result cannot be forged from the client.
   3. Refuses if the session's pinned algorithm differs from this build's
      engine: a historical session is never scored by a newer algorithm.
   4. Scores with the shared engine (./engine, copied from app/src/engine by
      app/scripts/sync-engine.mjs; a test fails if the copies drift).
   5. Inserts the result once. A retry returns the existing result.

   The service-role key is provided by the Supabase runtime and never leaves
   this function. */

import { createClient } from 'npm:@supabase/supabase-js@2';
import { scoreReadiness, answerFingerprint, ALGORITHM_VERSION } from './engine/scoring.ts';

const ALLOWED_ORIGIN = /^(https:\/\/(app\.muscle-meta\.com|[a-z0-9-]+--[a-z0-9-]+\.netlify\.app|[a-z0-9-]+\.netlify\.app)|http:\/\/localhost:\d+)$/;

function cors(origin: string | null) {
  const allow = origin && ALLOWED_ORIGIN.test(origin) ? origin : 'https://app.muscle-meta.com';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  };
}

Deno.serve(async (req) => {
  const headers = { ...cors(req.headers.get('origin')), 'Content-Type': 'application/json' };
  const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return reply(405, { error: 'method_not_allowed' });

  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) return reply(401, { error: 'not_signed_in' });
  const userId = userData.user.id;

  let sessionId = '';
  try { sessionId = String((await req.json()).session_id || ''); } catch { /* handled below */ }
  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) return reply(400, { error: 'session_id_required' });

  const { data: session } = await admin.from('assessment_sessions')
    .select('id, user_id, status, orientation_session_id, assessment_version_id, assessment_versions(algorithm_version, status)')
    .eq('id', sessionId).maybeSingle();
  if (!session || session.user_id !== userId) return reply(404, { error: 'session_not_found' });

  // Idempotent: a completed session returns its stored result.
  const { data: existing } = await admin.from('assessment_results').select('*').eq('session_id', sessionId).maybeSingle();
  if (existing) return reply(200, { result: existing, replay: true });
  if (session.status !== 'in_progress') return reply(409, { error: 'session_not_open' });

  // deno-lint-ignore no-explicit-any
  const version = (session as any).assessment_versions as { algorithm_version: string };
  if (version.algorithm_version !== ALGORITHM_VERSION) {
    return reply(409, { error: 'algorithm_mismatch', pinned: version.algorithm_version, engine: ALGORITHM_VERSION });
  }

  const { data: orientation } = await admin.from('orientation_sessions')
    .select('user_id, valued_function_goal, safety_review_status')
    .eq('id', session.orientation_session_id ?? '00000000-0000-0000-0000-000000000000').maybeSingle();
  if (!orientation || orientation.user_id !== userId) return reply(422, { error: 'orientation_required' });

  const { data: rows, error: respErr } = await admin.from('assessment_responses')
    .select('question_code, raw_value').eq('session_id', sessionId);
  if (respErr) return reply(500, { error: 'read_failed' });
  const answers = Object.fromEntries((rows ?? []).map(r => [r.question_code, r.raw_value]));

  const input = { answers, safety: orientation.safety_review_status, goal: orientation.valued_function_goal };
  const scored = scoreReadiness(input);
  if (scored.status !== 'complete') return reply(422, { error: 'insufficient_information', missing: scored.missing });

  const row = {
    session_id: sessionId,
    user_id: userId,
    assessment_version_id: session.assessment_version_id,
    algorithm_version: scored.algorithmVersion,
    answer_fingerprint: answerFingerprint(input),
    safety_review_status: orientation.safety_review_status,
    safety_route: scored.safetyRoute,
    readiness_index: scored.readiness.index,
    readiness_base_route: scored.readiness.baseRoute,
    readiness_route: scored.readiness.route,
    ability_score: scored.ability.score,
    ability_level_calculated: scored.ability.calculatedLevel,
    ability_level: scored.ability.level,
    lens_structure_need: scored.lenses.needs.structure,
    lens_capacity_need: scored.lenses.needs.capacity,
    lens_function_need: scored.lenses.needs.function,
    lens_experience_need: scored.lenses.needs.experience,
    lens_profile: scored.lenses.profile,
    primary_lens: scored.lenses.primary,
    secondary_lens: scored.lenses.secondary,
    pillar1_priorities: { ranked: scored.pillar1.ranked, power_need: scored.pillar1.powerNeed },
    baseline_metrics: scored.baselineMetrics,
    reason_codes: { ability: scored.ability.reasons, readiness: scored.readiness.reasons }
  };

  const { data: inserted, error: insErr } = await admin.from('assessment_results')
    .upsert(row, { onConflict: 'session_id', ignoreDuplicates: true }).select('*').maybeSingle();
  let result = inserted;
  if (!result) {
    const { data } = await admin.from('assessment_results').select('*').eq('session_id', sessionId).maybeSingle();
    result = data;
  }
  if (insErr || !result) return reply(500, { error: 'write_failed' });

  // Only after a durable result exists does the session close.
  await admin.from('assessment_sessions')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', sessionId).eq('status', 'in_progress');

  return reply(200, { result, replay: false });
});
