import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, RM, ScrollTrigger } from '../lib/motion';

const A = ['FRESH FOCACCIA ✶', 'STACKED DAILY ✶', 'NO SAD SANDWICHES ✶'];
const B = 'brisket · pepperoni · pesto · slush ·';

// Two taped bands running opposite ways. Their speed and direction follow how fast,
// and which way, you scroll.
export function Marquee() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (RM) return;
    const rows = gsap.utils.toArray<HTMLElement>('.mq-row', scope.current);
    const loops = rows.map((r, i) =>
      gsap.fromTo(r, { xPercent: i ? -50 : 0 }, { xPercent: i ? 0 : -50, duration: i ? 26 : 20, ease: 'none', repeat: -1 }));
    // start far into the loop so it can also run backwards
    loops.forEach(l => l.totalTime(l.duration() * 200));

    let dir = 1, vel = 1;
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: self => {
        dir = self.direction;
        vel = dir * (1 + Math.min(Math.abs(self.getVelocity()) / 250, 7));
      },
    });
    const tick = () => { vel += (dir - vel) * 0.06; loops.forEach(l => l.timeScale(vel)); };
    gsap.ticker.add(tick);

    gsap.from(rows, {
      y: i => (i ? 70 : -70), rotate: i => (i ? 9 : -9), ease: 'none',
      scrollTrigger: { trigger: scope.current, start: 'top bottom', end: 'top 40%', scrub: 0.6 },
    });
    return () => gsap.ticker.remove(tick);
  }, { scope });

  return (
    <div className="marquee" ref={scope} aria-hidden="true">
      <div className="mq-row mq-a">{[...A, ...A].map((t, i) => <span key={i}>{t}</span>)}</div>
      <div className="mq-row mq-b">{[0, 1, 2, 3].map(i => <span key={i}>{B}</span>)}</div>
    </div>
  );
}
