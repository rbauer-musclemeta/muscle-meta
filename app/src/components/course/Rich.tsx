import { Fragment } from 'react';
import { parseInline } from '@/course/content';

/* Renders imported lesson text. Only **bold** and {{PMID}} marks are honoured;
   everything else is text, so content can never inject markup. A citation is
   a numbered link to the reference at the foot of the lesson. */
export function Rich({ text, nums }: { text: string; nums: Map<string, number> }) {
  return (
    <>
      {parseInline(text).map((p, i) => {
        if (p.t === 'bold') return <strong key={i}>{p.v}</strong>;
        if (p.t === 'cite') {
          const n = nums.get(p.pmid);
          return n
            ? <sup key={i} className="cr-cite"><a href={`#ref-${p.pmid}`} aria-label={`Reference ${n}`}>{n}</a></sup>
            : null;
        }
        return <Fragment key={i}>{p.v}</Fragment>;
      })}
    </>
  );
}
