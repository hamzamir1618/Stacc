import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { Doodle } from '../components/Doodle';
import { peekProps, useRouter } from '../lib/router';
import { ITEMS } from '../data/menu';
import { drawAll, gsap, RM, ScrollTrigger, scrubDoodle } from '../lib/motion';

const item = ITEMS.latte;

// SLUSH grows extra U's the further you scroll; the cup slides in and tips over.
export function Slush() {
  const { go } = useRouter();
  const scope = useRef<HTMLElement>(null);
  const [us, setUs] = useState(RM ? 5 : 2);

  useGSAP(() => {
    if (RM) { drawAll(scope.current); return; }
    const q = gsap.utils.selector(scope);
    ScrollTrigger.create({
      trigger: scope.current, start: 'top 85%', end: 'bottom 30%',
      onUpdate: s => setUs(2 + Math.round(s.progress * 7)),
    });
    gsap.from(q('.sw-a'), { xPercent: -60, autoAlpha: 0, rotate: -10, ease: 'none', scrollTrigger: { trigger: scope.current, start: 'top 90%', end: 'top 45%', scrub: 0.5 } });
    gsap.fromTo(q('.cupwrap'), { x: 260, rotate: 40, autoAlpha: 0 }, { x: 0, rotate: -6, autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: scope.current, start: 'top 90%', end: 'center 55%', scrub: 0.6 } });
    gsap.to(q('.cupwrap img'), { rotate: 14, y: -60, ease: 'none', scrollTrigger: { trigger: scope.current, start: 'center 55%', end: 'bottom top', scrub: 0.6 } });
    scrubDoodle(q('.d-straw')[0], 'top 80%', 'center 50%', scope.current);
  }, { scope });

  const word = `SL${'U'.repeat(us)}SSSH`;

  return (
    <div className="wrap">
      <section className="slush" ref={scope} data-food>
        <h2 className="slush-word" aria-label="Palm latte slush">
          <span className="sw-a">PALM LATTE</span>
          <br />
          <span className="sw-b" aria-hidden="true">
            {Array.from(word).map((c, i) => (
              <span className="ch" key={i} style={{ animationDelay: `${(i * 0.07).toFixed(2)}s` }}>{c}</span>
            ))}
          </span>
        </h2>
        <div className="media" {...peekProps(go, item.id, item.name)}>
          <Doodle name="straw" className="d-straw" />
          <div className="cupwrap">
            <img className="cut" src={item.img} alt="Palm latte slush in a STACC cup" width={item.width} height={item.height} loading="lazy" />
          </div>
        </div>
      </section>
    </div>
  );
}
