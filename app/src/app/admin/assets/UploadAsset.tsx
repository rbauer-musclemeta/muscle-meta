'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { registerAsset } from '../actions';

type Opt = { id: string; title: string };

/* Uploads straight from the browser to the private bucket (the storage
   policy allows staff only), then records the asset and where it belongs.
   Going direct avoids the serverless request-size limit on large files. */
export default function UploadAsset({ programId, modules, lessons }: {
  programId: string; modules: Opt[]; lessons: (Opt & { module_id: string })[];
}) {
  const [status, setStatus] = useState<{ kind: 'idle' | 'busy' | 'ok' | 'error'; text?: string }>({ kind: 'idle' });
  const [moduleId, setModuleId] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const file = data.get('file') as File | null;
    const title = String(data.get('title') || '').trim();
    if (!file || !file.size || !title) { setStatus({ kind: 'error', text: 'Choose a file and give it a title.' }); return; }
    setStatus({ kind: 'busy', text: 'Uploading…' });
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '');
    const path = `four-lens-30/${Date.now()}-${safe}`;
    const { error } = await supabaseBrowser().storage.from('program-assets').upload(path, file, { contentType: file.type || undefined, upsert: false });
    if (error) { setStatus({ kind: 'error', text: `Upload failed: ${error.message}` }); return; }
    const reg = new FormData();
    reg.set('title', title);
    reg.set('kind', String(data.get('kind') || 'download'));
    reg.set('program_id', programId);
    reg.set('module_id', String(data.get('module_id') || ''));
    reg.set('lesson_id', String(data.get('lesson_id') || ''));
    reg.set('storage_path', path);
    reg.set('mime_type', file.type);
    reg.set('size_bytes', String(file.size));
    const res = await registerAsset(reg);
    if (!res.ok) { setStatus({ kind: 'error', text: `Uploaded, but not recorded: ${res.message}` }); return; }
    form.reset(); setModuleId('');
    setStatus({ kind: 'ok', text: `${title} is uploaded and assigned.` });
  }

  return (
    <form onSubmit={onSubmit} className="app-card">
      <h2>Upload a file</h2>
      <div className="app-field"><label htmlFor="title">Title</label><input id="title" name="title" className="app-input" style={{ maxWidth: 480 }} required /></div>
      <div className="app-field"><label htmlFor="file">File (PDF, image, audio or video, up to 50 MB)</label><input id="file" name="file" type="file" required /></div>
      <div className="app-field">
        <label htmlFor="kind">Type</label>
        <select id="kind" name="kind" className="app-input">
          <option value="handout">Handout</option><option value="worksheet">Worksheet</option><option value="download">Download</option>
          <option value="audio">Audio</option><option value="video">Video</option><option value="image">Image</option>
        </select>
      </div>
      <div className="app-field">
        <label htmlFor="module_id">Assign to</label>
        <select id="module_id" name="module_id" className="app-input" value={moduleId} onChange={e => setModuleId(e.target.value)}>
          <option value="">30-Day Four-Lens Program (whole program)</option>
          {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
      </div>
      {moduleId && lessons.some(l => l.module_id === moduleId) && (
        <div className="app-field">
          <label htmlFor="lesson_id">Lesson (optional)</label>
          <select id="lesson_id" name="lesson_id" className="app-input">
            <option value="">Whole module</option>
            {lessons.filter(l => l.module_id === moduleId).map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </div>
      )}
      {status.text && <p className={`app-note${status.kind === 'error' ? ' error' : ''}`} role="status">{status.text}</p>}
      <div className="app-actions" style={{ marginTop: 'var(--s-5)' }}>
        <button className="mmm-btn mmm-btn-primary" disabled={status.kind === 'busy'}>{status.kind === 'busy' ? 'Uploading…' : 'Upload and assign'}</button>
      </div>
    </form>
  );
}
