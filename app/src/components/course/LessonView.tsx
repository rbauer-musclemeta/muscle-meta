import { citeNumbers, formatReference, TRACK_LABEL, type LessonContent, type OrientationContent, type Reference, type Track } from '@/course/content';
import type { StepResult } from '@/components/ActionForm';
import { Rich } from './Rich';
import { TrackPlan } from './TrackPlan';

type Worksheet = { id: string; title: string; url: string | null };

const RISK_CLASS = { high: 'red', moderate: 'gold', low: '' } as const;

/* The body of a lesson. Server-rendered; the only client piece is the track
   tabs. Dropdowns and myth cards are native <details>, so they work with a
   keyboard and without JavaScript. */
export function LessonBody({ content, references, worksheets, track, choose }: {
  content: LessonContent;
  references: Record<string, Reference>;
  worksheets: Worksheet[];
  track: Track | null;
  choose: (form: FormData) => Promise<StepResult>;
}) {
  const nums = citeNumbers(content.refs);
  return (
    <>
      <section className="cr-big" aria-labelledby="big-h">
        <span className="cr-eyebrow" id="big-h">The big idea</span>
        <p className="cr-big-text">{content.big_idea}</p>
        <dl className="cr-big-grid">
          <div><dt>Belief shift</dt><dd>{content.belief}</dd></div>
          <div><dt>By the end of this lesson</dt><dd>{content.outcome}</dd></div>
        </dl>
      </section>

      {content.objectives.length > 0 && (
        <section className="cr-section" aria-labelledby="learn-h">
          <h2 id="learn-h">What you will learn</h2>
          <ul className="cr-objectives">{content.objectives.map((o, i) => <li key={i}>{o}</li>)}</ul>
        </section>
      )}

      <section className="cr-section" aria-labelledby="guide-h">
        <h2 id="guide-h">Lesson guide</h2>
        <p className="app-muted">Open each question. Numbers link to the studies at the end of the lesson.</p>
        <div className="cr-accordion">
          {content.guide.map((g, i) => (
            <details key={i} className="cr-item" open={i === 0}>
              <summary><span className="cr-n">{i + 1}</span>{g.q}</summary>
              <div className="cr-item-body"><p><Rich text={g.a} nums={nums} /></p></div>
            </details>
          ))}
        </div>
        {content.takeaways.length > 0 && (
          <div className="cr-takeaways">
            <h3>Key takeaways</h3>
            <ul>{content.takeaways.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
        )}
      </section>

      <section className="cr-section" aria-labelledby="evidence-h">
        <h2 id="evidence-h">The evidence</h2>
        <p className="app-muted">Every claim is graded: Established (consistent evidence), Promising (good early evidence, limits noted) or Unproven-Bridge (a reasoned link not yet tested directly).</p>
        <div className="cr-cards">
          {content.evidence.map(e => {
            const r = references[e.pmid];
            return (
              <article key={e.pmid} className="cr-card">
                <div className="cr-card-top">
                  <span className="cr-ref-n">Study {nums.get(e.pmid)}</span>
                  <span className={`cr-grade grade-${e.grade.toLowerCase()}`}>{e.grade}</span>
                </div>
                <p className="cr-card-finding">{e.finding}</p>
                <p className="cr-card-who">Who: {e.who}</p>
                {r && <p className="cr-card-cite">{r.authors.split(',')[0]} et al., {r.journal} {r.year} · <a href={`https://pubmed.ncbi.nlm.nih.gov/${e.pmid}/`} rel="noopener" target="_blank">PubMed {e.pmid}</a></p>}
              </article>
            );
          })}
        </div>
        {content.myths.length > 0 && (
          <>
            <h3 className="cr-sub">Myth or fact</h3>
            <div className="cr-cards">
              {content.myths.map((m, i) => (
                <details key={i} className="cr-myth">
                  <summary><span className="cr-eyebrow">Myth</span><span className="cr-myth-text">{m.myth}</span><span className="cr-myth-hint">Tap to see the evidence</span></summary>
                  <p><span className="cr-eyebrow">Fact</span><Rich text={m.truth} nums={nums} /></p>
                </details>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="cr-section" id="plan" aria-labelledby="plan-h">
        <h2 id="plan-h">Your plan this week</h2>
        <TrackPlan plans={content.tracks} mine={track} choose={choose} />
      </section>

      <section className="cr-section" aria-labelledby="safety-h">
        <h2 id="safety-h">Safety</h2>
        <div className="cr-safety">
          <p><strong>If your Readiness Check showed high risk:</strong> {content.safety.high}</p>
          <p><strong>If it showed moderate risk:</strong> {content.safety.moderate}</p>
          <div className="cr-stop">
            <h3>Stop and seek care if you notice</h3>
            <ul>{content.safety.stop_signs.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        </div>
      </section>

      <Worksheets items={worksheets} />

      {content.reflection.length > 0 && (
        <section className="cr-section" aria-labelledby="reflect-h">
          <h2 id="reflect-h">Reflect</h2>
          <ol className="cr-reflect">{content.reflection.map((q, i) => <li key={i}>{q}</li>)}</ol>
        </section>
      )}

      <References refs={content.refs} references={references} />
    </>
  );
}

export function OrientationBody({ content, references, worksheets, track }: {
  content: OrientationContent; references: Record<string, Reference>; worksheets: Worksheet[]; track: Track | null;
}) {
  const nums = citeNumbers(content.refs);
  return (
    <>
      <p className="lede">{content.intro}</p>
      <section className="cr-section" aria-labelledby="how-h">
        <h2 id="how-h">How the check works</h2>
        <div className="cr-accordion">
          {content.parts.map((p, i) => (
            <details key={i} className="cr-item" open={i === 0}>
              <summary><span className="cr-n">{i + 1}</span>{p.title}</summary>
              <div className="cr-item-body"><p><Rich text={p.body} nums={nums} /></p></div>
            </details>
          ))}
        </div>
      </section>
      <section className="cr-section" aria-labelledby="tracks-h">
        <h2 id="tracks-h">Your track</h2>
        <div className="cr-cards">
          {content.tracks.map(t => (
            <article key={t.key} className={`cr-card${track === t.key ? ' mine' : ''}`}>
              <div className="cr-card-top"><h3>{TRACK_LABEL[t.key]}</h3>{track === t.key && <span className="app-pill">Your track</span>}</div>
              <p className="cr-card-who">{t.rule}</p>
              <p className="cr-card-finding">{t.plan}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="cr-section" aria-labelledby="risk-h">
        <h2 id="risk-h">Safety levels</h2>
        <div className="app-scroll">
          <table className="app-table">
            <thead><tr><th>Level</th><th>What sets it</th><th>What it means for your plan</th></tr></thead>
            <tbody>
              {content.risk.map(r => (
                <tr key={r.level}>
                  <td><span className={`app-pill ${RISK_CLASS[r.level]}`}>{r.label}</span></td>
                  <td>{r.rule}</td><td>{r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="app-note warn">{content.disclaimer}</p>
      </section>
      <Worksheets items={worksheets} />
      <References refs={content.refs} references={references} />
    </>
  );
}

function Worksheets({ items }: { items: Worksheet[] }) {
  return (
    <section className="cr-section" aria-labelledby="ws-h">
      <h2 id="ws-h">Worksheet</h2>
      {items.length === 0 && <p className="app-muted">The printable worksheet for this lesson is being added.</p>}
      <ul className="cr-files">
        {items.map(w => (
          <li key={w.id}>
            <span><strong>{w.title}</strong><span className="app-muted">PDF · print it or fill it in on screen</span></span>
            {w.url ? <a className="mmm-btn mmm-btn-ghost" href={w.url}>Download</a> : <span className="app-muted">Not available right now</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function References({ refs, references }: { refs: string[]; references: Record<string, Reference> }) {
  if (!refs.length) return null;
  return (
    <section className="cr-section" aria-labelledby="refs-h">
      <h2 id="refs-h">References and evidence grades</h2>
      <ol className="cr-refs">
        {refs.map(p => {
          const r = references[p];
          if (!r) return null;
          return (
            <li key={p} id={`ref-${p}`}>
              {formatReference(r)}{' '}
              <a href={`https://pubmed.ncbi.nlm.nih.gov/${p}/`} rel="noopener" target="_blank">PMID {p}</a>
              {r.doi && <> · <a href={`https://doi.org/${r.doi}`} rel="noopener" target="_blank">DOI</a></>}
              {' '}<span className={`cr-grade grade-${r.grade.toLowerCase()}`}>{r.grade}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
