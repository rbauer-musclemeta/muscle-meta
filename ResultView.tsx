import type { ResultRow } from '@/lib/program';
import { ROUTE_COPY, ABILITY_COPY, LENS_COPY, REASON_COPY, PILOT_NOTE } from '@/lib/copy';

const LENS_ORDER = ['structure', 'capacity', 'function', 'experience'] as const;

export function lensNeed(r: ResultRow, lens: string): number {
  return Number(r[`lens_${lens}_need` as keyof ResultRow] as number);
}

/* The member-facing result: route, ability, Four Lenses as four separate
   panels (never one combined score, never the pillar radar), Pillar 1
   priorities, and the plain-language reasons. */
export default function ResultView({ result, overrides, lensMetrics }: {
  result: ResultRow;
  overrides: { field: string; to_value: string; reason: string }[];
  lensMetrics?: Record<string, { title: string; value?: string }[]>;
}) {
  const routeOverride = [...overrides].reverse().find(o => o.field === 'readiness_route');
  const levelOverride = [...overrides].reverse().find(o => o.field === 'ability_level');
  const route = (routeOverride?.to_value ?? result.readiness_route) as keyof typeof ROUTE_COPY;
  const level = (levelOverride?.to_value ?? result.ability_level) as keyof typeof ABILITY_COPY;
  const reasons = [...result.reason_codes.readiness, ...result.reason_codes.ability];

  return (
    <>
      <div className={`app-note${route === 'professional_review' ? ' warn' : ''}`} style={{ marginTop: 'var(--s-6)' }}>
        <p><strong>{ROUTE_COPY[route].label}.</strong> {ROUTE_COPY[route].body}</p>
        {routeOverride && <p>Your clinician adjusted this route: {routeOverride.reason}</p>}
      </div>

      <dl className="app-kv">
        <div><dt>Starting route</dt><dd>{ROUTE_COPY[route].label}</dd></div>
        <div><dt>Ability level</dt><dd>{ABILITY_COPY[level].label}</dd></div>
        <div><dt>Readiness index</dt><dd>{Number(result.readiness_index).toFixed(1)}</dd></div>
        <div><dt>Ability score</dt><dd>{Number(result.ability_score).toFixed(1)}</dd></div>
      </dl>
      <p className="app-muted" style={{ marginTop: 'var(--s-3)' }}>{ABILITY_COPY[level].body}</p>

      <div className="app-card">
        <h2>Your Four-Lens profile</h2>
        <p>Each lens is shown on its own. A longer bar means more current need in that area, so it is where the program will focus first. The lenses are never added together into one score.</p>
        {result.lens_profile === 'balanced' && (
          <p className="app-note">No lens stands out: your profile is balanced. Your baseline measures follow the goal you chose.</p>
        )}
        <div className="app-lenses">
          {LENS_ORDER.map(k => {
            const need = lensNeed(result, k);
            const isPrimary = result.primary_lens === k;
            const isSecondary = result.secondary_lens === k;
            return (
              <div key={k} className={`app-lens${isPrimary ? ' primary' : isSecondary ? ' secondary' : ''}`}>
                <span className="tag">{isPrimary ? 'Primary focus' : isSecondary ? 'Secondary focus' : ' '}</span>
                <h3>{LENS_COPY[k].name}</h3>
                <p>{LENS_COPY[k].body}</p>
                <div className={`app-bar${isSecondary ? ' gold' : ''}`} role="img" aria-label={`${LENS_COPY[k].name} need ${need} out of 100`}>
                  <i style={{ width: `${need}%` }} />
                </div>
                <div className="app-bar-label"><span>Current need</span><span>{need.toFixed(1)} / 100</span></div>
                {lensMetrics?.[k]?.length ? (
                  <ul>{lensMetrics[k].map(m => <li key={m.title}>{m.title}{m.value ? `: ${m.value}` : ''}</li>)}</ul>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="app-card">
        <h2>Exercise & Mobility priorities</h2>
        <p>Where your answers point within Pillar 1, highest need first. These are priority signals from ten questions, not your Muscle-Meta Health Score.</p>
        <ol className="app-rank">
          {result.pillar1_priorities.ranked.map((p, i) => (
            <li key={p.key}>
              <span className="n">{i + 1}</span>
              <span>{p.name} <span className="k">{p.key}</span>{p.key === 'P1-C4' && <span className="k"> · includes power: {Number(result.pillar1_priorities.power_need).toFixed(1)}</span>}</span>
              <span>
                <div className="app-bar"><i style={{ width: `${p.need}%` }} /></div>
                <div className="app-bar-label"><span /> <span>{Number(p.need).toFixed(1)}</span></div>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="app-card">
        <h2>Why you got this result</h2>
        <ul>{reasons.map(code => <li key={code}>{REASON_COPY[code] ?? code}</li>)}</ul>
        <p className="app-muted" style={{ marginTop: 'var(--s-4)' }}>{PILOT_NOTE}</p>
        <p className="app-muted">Calculated {new Date(result.derived_at).toLocaleDateString('en-US', { dateStyle: 'medium' })} · algorithm {result.algorithm_version}</p>
      </div>
    </>
  );
}
