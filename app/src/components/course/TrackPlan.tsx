'use client';
import { useState } from 'react';
import { TRACKS, TRACK_LABEL, type Track } from '@/course/content';
import { ActionForm, SubmitButton } from '@/components/ActionForm';
import type { StepResult } from '@/components/ActionForm';

/* "Your plan this week": one tab per track. It opens on the member's own
   track; the others can be previewed and chosen. The choice is saved with
   the member's lesson progress and carries to the next lesson. */
export function TrackPlan({ plans, mine, choose }: {
  plans: Record<Track, string[]>;
  mine: Track | null;
  choose: (form: FormData) => Promise<StepResult>;
}) {
  const [tab, setTab] = useState<Track>(mine ?? 'foundation');
  return (
    <div className="cr-tracks">
      <div className="cr-tablist" role="tablist" aria-label="Training tracks">
        {TRACKS.map(t => (
          <button key={t} type="button" role="tab" id={`tab-${t}`} aria-selected={tab === t} aria-controls={`plan-${t}`}
            className={`cr-tab${tab === t ? ' on' : ''}`} onClick={() => setTab(t)}>
            {TRACK_LABEL[t]}{mine === t && <span className="cr-tab-mine">your track</span>}
          </button>
        ))}
      </div>
      {TRACKS.map(t => (
        <div key={t} role="tabpanel" id={`plan-${t}`} aria-labelledby={`tab-${t}`} hidden={tab !== t} className="cr-plan">
          <ol>{plans[t].map((step, i) => <li key={i}>{step}</li>)}</ol>
          {mine !== t && (
            <ActionForm action={choose} className="cr-plan-choose">
              <input type="hidden" name="track" value={t} />
              <SubmitButton className="app-small-btn">Make {TRACK_LABEL[t]} my track</SubmitButton>
            </ActionForm>
          )}
        </div>
      ))}
      {!mine && <p className="app-muted">Your Readiness Check sets your track. Until it is saved here, the plan opens on Foundation.</p>}
    </div>
  );
}
