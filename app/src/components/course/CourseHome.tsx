import Link from 'next/link';
import { TRACK_LABEL } from '@/course/content';
import type { CourseOutline } from '@/lib/course';
import { lessonPath, type ProgramConfig } from '@/programs/registry';

/* Course home: progress, the next lesson, then every module and lesson.
   Every module and lesson is listed in full; access is to the course as a
   product, never to a part of the framework. */
export function CourseHome({ program, outline, finished }: { program: ProgramConfig; outline: CourseOutline; finished: boolean }) {
  const all = outline.modules.flatMap(m => m.lessons);
  const next = all.find(l => !l.completed) ?? null;
  const pct = outline.total ? Math.round((outline.done / outline.total) * 100) : 0;
  return (
    <div className="app-wrap">
      <span className="eyebrow">Self-directed course</span>
      <h1 className="app-h1">{outline.title}</h1>
      {outline.subtitle && <p className="lede">{outline.subtitle}</p>}
      {finished && <p className="app-note" role="status">You have completed every lesson. Repeat your check-in measures from Lesson 4.3 to see what changed.</p>}

      <div className="app-card">
        <div className="cr-progress-head">
          <span className="app-pill">{outline.done} of {outline.total} lessons</span>
          {outline.track && <span className="app-pill gold">{TRACK_LABEL[outline.track]} track</span>}
        </div>
        <div className="app-bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>
        <div className="app-bar-label"><span>Progress</span><span>{pct}%</span></div>
        {next ? (
          <>
            <h2 style={{ marginTop: 'var(--s-5)' }}>{outline.done === 0 ? 'Start here' : 'Pick up where you left off'}</h2>
            <p>{next.code && next.code !== 'Start' ? `Lesson ${next.code}: ` : ''}{next.title}</p>
            <div className="app-actions" style={{ marginTop: 'var(--s-5)' }}>
              <Link className="mmm-btn mmm-btn-primary" href={lessonPath(program, next.slug)}>{outline.done === 0 ? 'Begin' : 'Continue'}</Link>
            </div>
          </>
        ) : outline.total === 0 ? (
          <p style={{ marginTop: 'var(--s-4)' }}>The lessons are being loaded. You will get an email when Module 1 is ready.</p>
        ) : null}
      </div>

      {outline.modules.filter(m => m.lessons.length > 0).map(m => (
        <section key={m.id} className="app-card cr-module" aria-labelledby={`m-${m.slug}`}>
          <h2 id={`m-${m.slug}`}>{m.title}</h2>
          {m.summary && <p className="app-muted">{m.summary}</p>}
          <ol className="cr-lessons">
            {m.lessons.map(l => (
              <li key={l.id}>
                <Link href={lessonPath(program, l.slug)}>
                  <span className={`cr-dot${l.completed ? ' done' : ''}`} aria-hidden="true" />
                  <span className="cr-lesson-title">{l.code && l.code !== 'Start' ? `${l.code} ` : ''}{l.title}</span>
                  <span className="cr-lesson-meta">{l.completed ? 'Completed' : l.est_minutes ? `${l.est_minutes} min` : ''}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}

      {program.addOns.length > 0 && (
        <div className="app-card">
          <h2>Personal Session</h2>
          <p>A 20-minute one-to-one video session with Randy Bauer, PT, to review your Readiness Check, confirm your track and adjust your plan. Recommended if your Readiness Check showed a high or moderate safety level.</p>
        </div>
      )}
    </div>
  );
}
