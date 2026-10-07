import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { PageTitle } from './PageTitle';
import { Doodle } from '../components/Doodle';
import { ITEMS } from '../data/menu';
import { drawAll, drawTl, dropLetters, gsap, prime, rand, RM, scrubDoodle } from '../lib/motion';

const POLAROIDS = [
  { img: ITEMS.verde.img, alt: 'Brisket focaccia sandwich', caption: 'the first stack', rot: -6 },
  { img: ITEMS.capone.img, alt: 'Focaccia pizza slice', caption: 'pizza, but focaccia', rot: 4 },
  { img: ITEMS.latte.img, alt: 'Latte slush', caption: "slush o'clock", rot: -3 },
];

export function Story() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (RM) { drawAll(scope.current); return; }
    const q = gsap.utils.selector(scope);
    const under = q('.page-title-wrap .d-under')[0];
    prime(under);
    gsap.timeline().add(dropLetters(q('.page-title')[0])).add(drawTl(under, 0.4), '-=.3');

    // polaroids dealt onto the table like cards
    gsap.fromTo(q('.pola'), { y: () => innerHeight, x: () => rand(-300, 300), rotate: () => rand(-70, 70), autoAlpha: 0 }, {
      y: 0, x: 0, rotate: (_i: number, el: HTMLElement) => Number(el.dataset.rot), autoAlpha: 1, duration: 1, stagger: 0.15, delay: 0.4, ease: 'back.out(1.3)',
    });

    // each paragraph writes itself in, and rubs itself out when you scroll back up
    q('.reveal').forEach(p => gsap.fromTo(p, { clipPath: 'inset(0 100% 0 0)', x: -20 }, {
      clipPath: 'inset(0 0% 0 0)', x: 0, ease: 'none', scrollTrigger: { trigger: p, start: 'top 90%', end: 'top 55%', scrub: 0.5 },
    }));
    scrubDoodle(q('.squig')[0]);
  }, { scope });

  const lift = (el: HTMLElement, on: boolean) => {
    if (RM) return;
    if (on) gsap.to(el, { y: -14, scale: 1.04, rotate: 0, duration: 0.35, ease: 'back.out(3)' });
    else gsap.to(el, { y: 0, scale: 1, rotate: Number(el.dataset.rot), duration: 0.5, ease: 'elastic.out(1,.4)' });
  };

  return (
    <div ref={scope}>
      <div className="wrap page-head">
        <PageTitle text="Our story" />
      </div>
      <div className="wrap">
        <div className="polas">
          {POLAROIDS.map(p => (
            <figure className="pola" key={p.caption} data-rot={p.rot} style={{ transform: `rotate(${p.rot}deg)` }}
              onPointerEnter={e => lift(e.currentTarget, true)} onPointerLeave={e => lift(e.currentTarget, false)}>
              <div className="tape" />
              <div className="ph"><img src={p.img} alt={p.alt} loading="lazy" /></div>
              <figcaption>{p.caption}</figcaption>
            </figure>
          ))}
        </div>
        <div className="story-text">
          <p className="big reveal">We bake focaccia every morning, then stack it as high as it goes.</p>
          <p className="reveal">Sample copy: replace this with the real STACC story. Who started it, where the dough recipe comes from, and what makes a sandwich worth crossing town for.</p>
          <p className="reveal">Short paragraphs work best here. Each one writes itself in as you scroll.</p>
          <Doodle name="squiggle" className="squig" />
        </div>
      </div>
    </div>
  );
}
