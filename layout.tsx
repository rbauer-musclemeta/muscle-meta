import Link from 'next/link';
import { requireStaff } from '@/lib/program';

const LATER = ['Programs', 'Assessments', 'Curriculum', 'Content library', 'Coaching', 'Agent inbox', 'Publishing', 'Analytics', 'Settings'];

/* Staff only. The database enforces the same rule (private.is_staff() in every
   admin policy); this guard just keeps members out of the screens. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  return (
    <div className="app-wrap wide">
      <span className="eyebrow">Admin · {staff.roles.filter(r => r !== 'member').join(', ')}</span>
      <nav className="app-nav-links" aria-label="Admin" style={{ margin: 'var(--s-3) 0 var(--s-2)' }}>
        <Link href="/admin">Members</Link>
        <Link href="/admin/assets">Assets</Link>
      </nav>
      <p className="app-muted">Coming in later milestones: {LATER.join(' · ')}</p>
      {children}
    </div>
  );
}
