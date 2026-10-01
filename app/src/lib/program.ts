import 'server-only';
import { cache } from 'react';
import { redirect, notFound } from 'next/navigation';
import { supabaseServer } from './supabase/server';
import { programByRoute, stepPath, type ProgramConfig, type JourneyStep } from '@/programs/registry';

export type Member = {
  id: string;
  email: string;
  roles: string[];
  isStaff: boolean;
  /* Active entitlement keys. Staff see every program for support. */
  access: string[];
};

/* The signed-in member, their roles and what they are entitled to.
   Every value comes back through RLS: a member only ever sees their own. */
export const getMember = cache(async (): Promise<Member | null> => {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const [{ data: roles }, { data: ents }] = await Promise.all([
    supabase.from('user_roles').select('role').eq('user_id', auth.user.id),
    supabase.from('entitlements').select('feature_key, revoked_at, expires_at').eq('user_id', auth.user.id)
  ]);
  const now = Date.now();
  const active = (ents ?? []).filter(e => !e.revoked_at && (!e.expires_at || Date.parse(e.expires_at) > now))
    .map(e => e.feature_key as string);
  const roleList = (roles ?? []).map(r => r.role as string);
  return {
    id: auth.user.id,
    email: auth.user.email ?? '',
    roles: roleList,
    isStaff: roleList.includes('admin') || roleList.includes('owner'),
    access: active
  };
});

export function hasAccess(member: Member, key: string): boolean {
  return member.isStaff || member.access.includes(key);
}

export async function requireMember(): Promise<Member> {
  const m = await getMember();
  if (!m) redirect('/sign-in');
  return m;
}

/* Resolves /app/<route>/… to a known program and checks the member may use
   it. Unknown routes are a 404; signed-in members without the entitlement
   see that program's no-access page. RLS enforces the same rule again. */
export async function requireProgram(route: string): Promise<{ member: Member; program: ProgramConfig }> {
  const program = programByRoute(route);
  if (!program) notFound();
  const member = await requireMember();
  if (!hasAccess(member, program.access)) redirect(`/no-access?program=${program.route}`);
  return { member, program };
}

export async function requireStaff(): Promise<Member> {
  const m = await requireMember();
  if (!m.isStaff) redirect('/');
  return m;
}

export type ResultRow = {
  id: string;
  session_id: string;
  algorithm_version: string;
  safety_review_status: 'no' | 'yes' | 'not_sure';
  safety_route: 'clear' | 'professional_review';
  readiness_index: number;
  readiness_base_route: string;
  readiness_route: 'standard_start' | 'modified_start' | 'professional_review';
  ability_score: number;
  ability_level_calculated: string;
  ability_level: 'foundation' | 'building' | 'performance';
  lens_structure_need: number;
  lens_capacity_need: number;
  lens_function_need: number;
  lens_experience_need: number;
  lens_profile: 'focused' | 'balanced';
  primary_lens: string | null;
  secondary_lens: string | null;
  pillar1_priorities: { ranked: { key: string; name: string; need: number }[]; power_need: number };
  baseline_metrics: string[];
  reason_codes: { ability: string[]; readiness: string[] };
  derived_at: string;
};

export type Journey = {
  programId: string;
  programTitle: string;
  orientation: {
    id: string; completed_at: string | null; safety_review_status: string | null;
    valued_function_goal: string | null; preferred_pace: string | null;
    orientation_reason: string[]; assessment_support_need: string[];
  } | null;
  openSessionId: string | null;
  result: ResultRow | null;
  overrides: { field: string; to_value: string; reason: string; created_at: string }[];
  baseline: { id: string; selected_metrics: string[]; started_at: string } | null;
  measurements: { metric_code: string; value: number; unit: string; measured_at: string }[];
  enrolledOn: string | null;
  next: JourneyStep;
};

/* Everything the member app needs to decide the member's next step. */
export async function getJourney(userId: string, config: ProgramConfig): Promise<Journey> {
  const supabase = await supabaseServer();
  const { data: program } = await supabase.from('programs').select('id, title').eq('slug', config.dbSlug).single();
  if (!program) throw new Error(`Program ${config.dbSlug} is not published`);

  const [orientation, openSession, result, baseline, enrollment] = await Promise.all([
    supabase.from('orientation_sessions')
      .select('id, completed_at, safety_review_status, valued_function_goal, preferred_pace, orientation_reason, assessment_support_need')
      .eq('user_id', userId).eq('program_id', program.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('assessment_sessions').select('id').eq('user_id', userId).eq('status', 'in_progress')
      .eq('program_id', program.id).order('started_at', { ascending: false }).limit(1).maybeSingle(),
    // Scoped to this program through the session, so a member's results in
    // one program never appear in another.
    supabase.from('assessment_results').select('*, assessment_sessions!inner(program_id)').eq('user_id', userId)
      .eq('assessment_sessions.program_id', program.id)
      .order('derived_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('progress_cycles').select('id, selected_metrics, started_at')
      .eq('user_id', userId).eq('program_id', program.id).eq('kind', 'baseline').maybeSingle(),
    supabase.from('program_enrollments').select('started_on').eq('user_id', userId).eq('program_id', program.id)
      .order('started_on', { ascending: true }).limit(1).maybeSingle()
  ]);

  const [measurements, overrides] = await Promise.all([
    baseline.data
      ? supabase.from('progress_measurements').select('metric_code, value, unit, measured_at').eq('cycle_id', baseline.data.id)
      : Promise.resolve({ data: [] as Journey['measurements'] }),
    result.data
      ? supabase.from('result_overrides').select('field, to_value, reason, created_at').eq('result_id', result.data.id).order('created_at')
      : Promise.resolve({ data: [] as Journey['overrides'] })
  ]);

  const o = orientation.data;
  let next: Journey['next'] = 'dashboard';
  if (!o || !o.completed_at) next = 'orientation';
  else if (!o.safety_review_status) next = 'safety';
  else if (!result.data) next = 'readiness';
  else if (!baseline.data) next = 'baseline';

  return {
    programId: program.id,
    programTitle: program.title,
    orientation: o ?? null,
    openSessionId: openSession.data?.id ?? null,
    result: result.data ? stripJoin(result.data) : null,
    overrides: overrides.data ?? [],
    baseline: baseline.data ?? null,
    measurements: (measurements.data ?? []) as Journey['measurements'],
    enrolledOn: enrollment.data?.started_on ?? null,
    next
  };
}

function stripJoin(row: Record<string, unknown>): ResultRow {
  const { assessment_sessions: _joined, ...rest } = row;
  return rest as unknown as ResultRow;
}

/* Where the member should go next inside a program. */
export function nextPath(program: ProgramConfig, j: Journey): string {
  return stepPath(program, j.next);
}

/* Day N of the program, counted from enrollment (day 1 = start day). */
export function programDay(enrolledOn: string | null): number | null {
  if (!enrolledOn) return null;
  const start = Date.parse(enrolledOn + 'T00:00:00Z');
  const days = Math.floor((Date.now() - start) / 86_400_000) + 1;
  return Math.max(1, days);
}
