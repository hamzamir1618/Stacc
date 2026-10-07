import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, RM } from '../lib/motion';
import { hashOf, useRouter } from '../lib/router';

const D = 'M13 0 C26 25 0 50 13 75 C26 100 0 125 13 150 C26 175 0 200 13 225 C26 250 0 275 13 300 C26 325 0 350 13 375 L13 400';

// A pencil squiggle down the left edge that draws itself in as you scroll through the page.
export function ProgressSquiggle() {
  const { route } = useRouter();
  const page = hashOf(route);
  const ink = useRef<SVGPathElement>(null);

  useGSAP(() => {
    const p = ink.current!;
    const L = p.getTotalLength();
    gsap.set(p, { strokeDasharray: L, strokeDashoffset: RM ? 0 : L });
    if (RM) return;
    gsap.to(p, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  }, { dependencies: [page], revertOnUpdate: true });

  return (
    <svg className="prog" viewBox="0 0 26 400" preserveAspectRatio="none" aria-hidden="true">
      <path className="track" d={D} />
      <path ref={ink} d={D} />
    </svg>
  );
}
