'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { registerWorksheet } from './actions';

export type Expected = { lesson_id: string; lesson: string; title: string; file_name: string; uploaded: boolean };

/* Bulk worksheet upload. Files go straight from the browser to the private
   bucket (staff-only storage policy), matched to lessons by file name. */
export default function WorksheetUpload({ programRoute, programSlug, expected }: { programRoute: string; programSlug: string; expected: Expected[] }) {
  const [log, setLog] = useState<{ name: string; ok: boolean; text: string }[]>([]);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const files = Array.from((e.currentTarget.elements.namedItem('files') as HTMLInputElement).files ?? []);
    if (!files.length) return;
    setBusy(true); setLog([]);
    const out: typeof log = [];
    for (const f of files) {
      const match = expected.find(x => x.file_name.toLowerCase() === f.name.toLowerCase());
      if (!match) { out.push({ name: f.name, ok: false, text: 'No lesson expects this file name. Skipped.' }); setLog([...out]); continue; }
      const path = `${programSlug}/worksheets/${match.file_name.toLowerCase()}`;
      const { error } = await supabaseBrowser().storage.from('program-assets').upload(path, f, { contentType: 'application/pdf', upsert: true });
      if (error) { out.push({ name: f.name, ok: false, text: `Upload failed: ${error.message}` }); setLog([...out]); continue; }
      const reg = new FormData();
      reg.set('program_route', programRoute); reg.set('lesson_id', match.lesson_id);
      reg.set('storage_path', path); reg.set('title', match.title); reg.set('size_bytes', String(f.size));
      const res = await registerWorksheet(reg);
      out.push({ name: f.name, ok: res.ok, text: res.ok ? `${res.message} Attached to ${match.lesson}.` : `Uploaded, but not recorded: ${res.message}` });
      setLog([...out]);
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="app-card">
      <h2>2. Upload worksheets</h2>
      <p>Select all the worksheet PDFs at once. Each file is matched to its lesson by name and stored privately; members open them through links that expire after ten minutes.</p>
      {expected.length === 0
        ? <p className="app-muted">Import the lesson content first.</p>
        : (
          <ul className="cr-admin-list">
            {expected.map(x => <li key={x.lesson_id}><span className={`app-pill${x.uploaded ? '' : ' grey'}`}>{x.uploaded ? 'Uploaded' : 'Waiting'}</span> {x.lesson}: <code>{x.file_name}</code></li>)}
          </ul>
        )}
      <div className="app-field"><label htmlFor="files">Worksheet PDFs</label><input id="files" name="files" type="file" accept="application/pdf" multiple required /></div>
      {log.length > 0 && <ul className="app-note" role="status">{log.map((l, i) => <li key={i} className={l.ok ? '' : 'error'}><strong>{l.name}</strong>: {l.text}</li>)}</ul>}
      <div className="app-actions" style={{ marginTop: 'var(--s-5)' }}>
        <button className="mmm-btn mmm-btn-primary" disabled={busy || expected.length === 0}>{busy ? 'Uploading…' : 'Upload and attach'}</button>
      </div>
    </form>
  );
}
