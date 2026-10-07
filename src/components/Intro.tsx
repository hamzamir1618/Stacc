import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../lib/motion';

interface Props {
  /** Called as the sheet starts lifting, so the hero can begin assembling underneath. */
  onReveal: () => void;
  /** Called once the sheet is off screen. */
  onGone: () => void;
}

// The logo is inked stroke by stroke, fills in, then the whole sheet lifts away like paper.
export function Intro({ onReveal, onGone }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const finished = useRef(false);
  const tl = useRef<gsap.core.Timeline | null>(null);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    tl.current?.kill();
    gsap.timeline({ onComplete: onGone })
      .to(ref.current, { yPercent: -100, duration: 0.7, ease: 'power3.inOut' })
      .add(onReveal, 0.25);
  };

  useGSAP(() => {
    let cancelled = false;
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    Promise.race([fontsReady, new Promise(r => setTimeout(r, 1500))]).then(() => {
      if (cancelled || finished.current) return;
      const txt = ref.current!.querySelector('text');
      tl.current = gsap.timeline({ onComplete: finish })
        .to(txt, { strokeDashoffset: 0, duration: 1.3, ease: 'power1.inOut' })
        .to(txt, { fill: '#111', duration: 0.3 }, '-=.2')
        .to(txt, { scale: 1.06, rotate: -2, transformOrigin: '50% 50%', duration: 0.25, ease: 'back.out(3)' })
        .to({}, { duration: 0.2 });
    });
    return () => { cancelled = true; };
  }, { scope: ref });

  return (
    <div className="intro" ref={ref} onClick={finish} role="presentation">
      <svg viewBox="0 0 900 200" aria-hidden="true">
        <text x="450" y="140" textAnchor="middle">STACC DELI</text>
      </svg>
      <div className="skip">CLICK TO SKIP</div>
    </div>
  );
}
