import { supabaseServer } from '@/lib/supabase/server';
import Link from 'next/link';
import { PROGRAMS, programByRoute } from '@/programs/registry';
import UploadAsset from './UploadAsset';
import { reassignAsset } from '../actions';

export default async function AdminAssets({ searchParams }: { searchParams: Promise<{ program?: string }> }) {
  const config = programByRoute((await searchParams).program ?? '') ?? PROGRAMS[0];
  const supabase = await supabaseServer();
  const { data: program } = await supabase.from('programs').select('id, title, course_id').eq('slug', config.dbSlug).single();
  const [{ data: modules }, { data: lessons }, { data: assets }] = await Promise.all([
    supabase.from('modules').select('id, title, position').eq('course_id', program?.course_id ?? '').order('position'),
    supabase.from('lessons').select('id, title, module_id, position').order('position'),
    supabase.from('assets').select('id, title, kind, storage_path, module_id, lesson_id, size_bytes, created_at').eq('program_id', program?.id ?? '').order('created_at', { ascending: false })
  ]);
  const moduleName = (id: string | null) => modules?.find(m => m.id === id)?.title ?? 'Whole program';

  return (
    <>
      <h1 className="app-h1">Protected program files</h1>
      <p className="lede">Files here live in a private bucket. Only members with access to the program (and staff) can open them, through links that expire after ten minutes. A guessed file address does not work.</p>
      {PROGRAMS.length > 1 && (
        <p className="app-muted">Program: {PROGRAMS.map(p => p.route === config.route
          ? <strong key={p.route}>{p.title} </strong>
          : <Link key={p.route} href={`/admin/assets?program=${p.route}`}>{p.title} </Link>)}</p>
      )}
      {program && (
        <UploadAsset
          programId={program.id}
          programRoute={config.route}
          modules={(modules ?? []).map(m => ({ id: m.id, title: m.title }))}
          lessons={(lessons ?? []).filter(l => modules?.some(m => m.id === l.module_id)).map(l => ({ id: l.id, title: l.title, module_id: l.module_id }))}
        />
      )}
      <div className="app-card app-scroll">
        <h2>Files in {program?.title}</h2>
        <table className="app-table">
          <thead><tr><th>Title</th><th>Placed in</th><th>Size</th><th>Move to</th></tr></thead>
          <tbody>
            {(assets ?? []).map(a => (
              <tr key={a.id}>
                <td><strong>{a.title}</strong><div className="app-muted">{a.kind} · {a.storage_path}</div></td>
                <td>{moduleName(a.module_id)}</td>
                <td>{a.size_bytes ? `${Math.round(a.size_bytes / 1024)} KB` : ''}</td>
                <td>
                  <form action={reassignAsset} className="app-input-row">
                    <input type="hidden" name="asset_id" value={a.id} />
                    <select name="module_id" className="app-input" defaultValue={a.module_id ?? ''} aria-label="Module" style={{ maxWidth: 260 }}>
                      <option value="">Whole program</option>
                      {(modules ?? []).map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                    </select>
                    <button className="app-small-btn" type="submit">Move</button>
                  </form>
                </td>
              </tr>
            ))}
            {!assets?.length && <tr><td colSpan={4} className="app-muted">No files yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
