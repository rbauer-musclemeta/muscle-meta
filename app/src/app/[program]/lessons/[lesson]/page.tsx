import Link from 'next/link';
import type { Metadata } from 'next';
import { requireProgram } from '@/lib/program';
import { getLesson } from '@/lib/course';
import { lessonPath, programHome } from '@/programs/registry';
import { ActionForm, SubmitButton } from '@/components/ActionForm';
import { LessonBody, OrientationBody } from '@/components/course/LessonView';
import { completeLesson, chooseTrack } from '../actions';

export const metadata: Metadata = { title: 'Lesson' };

export default async function Lesson({ params }: { params: Promise<{ program: string; lesson: string }> }) {
  const { program: route, lesson: slug } = await params;
  const { member, program } = await requireProgram(route);
  const { outline, lesson } = await getLesson(member.id, program, slug);
  const c = lesson.content;
  const code = lesson.module.lessons.find(l => l.id === lesson.id)?.code;
  const label = c.kind === 'orientation' || !code ? 'Start here' : `Lesson ${code}`;

  return (
    <div className="app-wrap">
      <nav className="cr-crumbs" aria-label="Breadcrumb">
        <Link href={programHome(program)}>{outline.title}</Link><span aria-hidden="true">/</span><span>{lesson.module.title}</span>
      </nav>
      <span className="eyebrow">{label}{lesson.est_minutes ? ` · ${lesson.est_minutes} min` : ''}</span>
      <h1 className="app-h1">{lesson.title}</h1>
      {lesson.completed && <p className="app-pill" role="status">Completed</p>}

      {c.kind === 'lesson'
        ? <LessonBody content={c} references={lesson.references} worksheets={lesson.worksheets} track={outline.track} choose={chooseTrack.bind(null, program.route, lesson.slug)} />
        : <OrientationBody content={c} references={lesson.references} worksheets={lesson.worksheets} track={outline.track} />}

      <div className="cr-footer-nav">
        {lesson.prev ? <Link className="mmm-btn mmm-btn-ghost" href={lessonPath(program, lesson.prev.slug)}>Previous</Link> : <span />}
        <ActionForm action={completeLesson.bind(null, program.route, lesson.slug)}>
          {outline.track && <input type="hidden" name="track" value={outline.track} />}
          <SubmitButton>{lesson.completed ? (lesson.next ? 'Next lesson' : 'Back to the course') : (lesson.next ? 'Mark complete and continue' : 'Mark complete')}</SubmitButton>
        </ActionForm>
      </div>
      {program.addOns.length > 0 && (
        <p className="app-footer-note">Want a clinician to check your plan? A 20-minute Personal Session with Randy Bauer, PT, is available at any point in the course.</p>
      )}
    </div>
  );
}
