import { forwardRef } from 'react';
import { Chars } from '../components/Chars';
import { Doodle } from '../components/Doodle';

// Big hand-lettered page title with an underline that draws in after the letters drop.
export const PageTitle = forwardRef<HTMLDivElement, { text: string }>(function PageTitle({ text }, ref) {
  return (
    <div className="page-title-wrap" ref={ref}>
      <h1 className="hand page-title rough" aria-label={text}><Chars text={text} /></h1>
      <Doodle name="under" className="d-under" />
    </div>
  );
});
