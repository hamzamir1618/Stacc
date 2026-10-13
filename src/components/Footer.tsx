import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Doodle } from './Doodle';
import { hashOf, useRouter, type View } from '../lib/router';
import { drawAll, gsap, RM, scrubDoodle, writer } from '../lib/motion';

const FOOT_LINKS: [View, string][] = [['home', 'Home'], ['menu', 'Menu'], ['story', 'Story'], ['locations', 'Locations']];

export function Footer() {
  const { route, go } = useRouter();
  const page = hashOf(route);
  const scope = useRef<HTMLElement>(null);

  // rebuilt on every page change so its triggers sit at the bottom of the new page
  useGSAP(() => {
    if (RM) { drawAll(scope.current); return; }
    const q = gsap.utils.selector(scope);
    writer(q('.hand')[0]);
    q('.d-star').forEach(s => scrubDoodle(s, 'top 100%', 'top 60%'));
    gsap.from(q('.btn'), {
      scale: 0, rotate: -30, ease: 'back.out(3)', duration: 0.6,
      scrollTrigger: { trigger: q('.btn')[0], start: 'top 95%', toggleActions: 'play none none reverse' },
    });
  }, { scope, dependencies: [page], revertOnUpdate: true });

  return (
    <footer className="foot" ref={scope}>
      <Doodle name="star" className="d-star spin" style={{ left: '8%', top: 60 }} />
      <Doodle name="star" className="d-star spin" style={{ right: '9%', bottom: 120, width: 60, height: 60, animationDirection: 'reverse' }} />
      <h2 className="hand rough">See you at lunch!</h2>
      <div style={{ marginTop: 34 }}>
        <button className="btn fill" onClick={e => go('locations', e)}>Find a STACC</button>
      </div>
      <nav className="foot-links" aria-label="Footer">
        {FOOT_LINKS.map(([v, label]) => (
          <button key={v} onClick={e => go(v, e)}>{label}</button>
        ))}
      </nav>
      <div className="meta">
        <span>&copy; {new Date().getFullYear()} STACC Deli</span>
        <span>Islamabad &middot; Rawalpindi</span>
      </div>
    </footer>
  );
}
