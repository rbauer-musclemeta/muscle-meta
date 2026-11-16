'use client';
import { useActionState } from 'react';
import { importCourseContent, type ImportResult } from './actions';

export default function ImportForm() {
  const [state, action, pending] = useActionState<ImportResult | null, FormData>(importCourseContent, null);
  return (
    <form action={action} className="app-card">
      <h2>1. Import lesson content</h2>
      <p>Choose the bundle file (for example <code>metabolic-health-matrix.content.json</code>). Every lesson is checked for structure, evidence grades, voice rules and PubMed before anything is saved. Importing again updates lessons in place; member progress is kept.</p>
      <div className="app-field"><label htmlFor="bundle">Bundle file</label><input id="bundle" name="bundle" type="file" accept="application/json,.json" required /></div>
      {state && !state.ok && (
        <div className="app-note error" role="alert">
          <strong>Nothing was imported.</strong>
          <ul>{state.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}
      {state?.ok && (
        <div className="app-note" role="status">
          <strong>{state.imported.length} lessons imported.</strong>
          <ul>{state.imported.map(t => <li key={t}>{t}</li>)}</ul>
        </div>
      )}
      {state && state.warnings.length > 0 && (
        <div className="app-note" role="status"><strong>Warnings</strong><ul>{state.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul></div>
      )}
      <div className="app-actions" style={{ marginTop: 'var(--s-5)' }}>
        <button className="mmm-btn mmm-btn-primary" disabled={pending}>{pending ? 'Checking and importing…' : 'Check and import'}</button>
      </div>
    </form>
  );
}
