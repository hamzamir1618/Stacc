import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { PageTitle } from './PageTitle';
import { MenuBoard } from '../sections/MenuBoard';
import { drawAll, drawTl, dropLetters, gsap, prime, RM } from '../lib/motion';

export function Menu() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (RM) { drawAll(scope.current); return; }
    const q = gsap.utils.selector(scope);
    const under = q('.page-title-wrap .d-under')[0];
    prime(under);
    gsap.timeline()
      .add(dropLetters(q('.page-title')[0]))
      .add(drawTl(under, 0.4), '-=.3')
      .from(q('.page-head .mono'), { y: 20, autoAlpha: 0, duration: 0.4 }, '-=.2')
      .from(q('.btab'), { y: -40, scale: 0.5, autoAlpha: 0, stagger: 0.08, duration: 0.5, ease: 'back.out(3)' }, '-=.3');
  }, { scope });

  return (
    <div ref={scope}>
      <div className="wrap page-head">
        <PageTitle text="The Menu" />
        <p className="mono" style={{ marginTop: 22 }}>Pick a category. Tap any food to add it to your order.</p>
      </div>
      <MenuBoard />
    </div>
  );
}
