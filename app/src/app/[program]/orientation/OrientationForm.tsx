'use client';
import { useState } from 'react';
import type { OrientationQuestion } from './page';
import { ActionForm, SubmitButton, type StepResult } from '@/components/ActionForm';

export default function OrientationForm({ action, questions, initial }: {
  action: (form: FormData) => Promise<StepResult>;
  questions: OrientationQuestion[];
  initial: Record<string, string[]>;
}) {
  const [values, setValues] = useState<Record<string, string[]>>(initial);
  const toggle = (q: OrientationQuestion, value: string) => {
    setValues(prev => {
      const cur = prev[q.field] ?? [];
      if (q.type === 'single') return { ...prev, [q.field]: [value] };
      if (cur.includes(value)) return { ...prev, [q.field]: cur.filter(v => v !== value) };
      const next = [...cur, value];
      // Keep only the most recent choices when a maximum applies.
      return { ...prev, [q.field]: q.max ? next.slice(-q.max) : next };
    });
  };
  return (
    <ActionForm action={action} className="app-card">
      {questions.map(q => (
        <fieldset key={q.field} className="app-q">
          <legend>{q.title}</legend>
          <p className="hint">{q.hint}</p>
          <div className={`app-options${q.options.length > 4 ? ' cols-2' : ''}`}>
            {q.options.map(o => (
              <label key={o.value} className="app-opt">
                <input
                  type={q.type === 'single' ? 'radio' : 'checkbox'}
                  name={q.field}
                  value={o.value}
                  checked={(values[q.field] ?? []).includes(o.value)}
                  onChange={() => toggle(q, o.value)}
                />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <div className="app-actions">
        <SubmitButton>Continue</SubmitButton>
      </div>
    </ActionForm>
  );
}
