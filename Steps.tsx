const ORDER = ['orientation', 'safety', 'readiness', 'results', 'baseline'] as const;
const LABEL: Record<(typeof ORDER)[number], string> = {
  orientation: 'Orientation', safety: 'Safety check', readiness: 'Readiness check', results: 'Results', baseline: 'Baseline'
};

/* Progress through the Program 1 start-up sequence. */
export default function Steps({ current }: { current: (typeof ORDER)[number] }) {
  const idx = ORDER.indexOf(current);
  return (
    <div>
      <div className="app-steps" aria-hidden="true">
        {ORDER.map((s, i) => <span key={s} className={i < idx ? 'done' : i === idx ? 'now' : ''} />)}
      </div>
      <p className="app-muted">Step {idx + 1} of {ORDER.length}: {LABEL[current]}</p>
    </div>
  );
}
