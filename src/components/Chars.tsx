import { Fragment } from 'react';

// Splits text into per-letter spans (.ch) grouped by word (.w) so letters can be animated
// without words breaking mid-line. "\n" becomes a line break. Screen readers get the parent's aria-label.
export function Chars({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, li) => (
        <Fragment key={li}>
          {line.split(/(\s+)/).map((w, wi) => {
            if (!w) return null;
            if (/^\s+$/.test(w)) return <Fragment key={wi}>{w}</Fragment>;
            return (
              <span className="w" aria-hidden="true" key={wi}>
                {Array.from(w).map((c, ci) => (
                  <span className="ch" key={ci}>{c}</span>
                ))}
              </span>
            );
          })}
          {li < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  );
}

export const plain = (text: string) => text.replace(/\s+/g, ' ').trim();
