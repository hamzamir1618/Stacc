import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Doodle } from '../components/Doodle';
import { useCart } from '../lib/cart';
import { peekProps, useRouter } from '../lib/router';
import { itemsIn, money } from '../data/menu';
import { drawAll, gsap, prime, RM } from '../lib/motion';

const LONG: Record<string, string> = {
  capone: 'Smoked sausage, meatball, pepperoni, mozzarella.',
  vela: 'Smoked salmon, dill sour cream, feta, mozzarella.',
};

// The section pins and scrolls sideways. Each slice spins in and gets circled in marker as it arrives.
export function PizzaRun() {
  const { add } = useCart();
  const { go } = useRouter();
  const scope = useRef<HTMLElement>(null);
  const pizzas = itemsIn('pizza');

  useGSAP(() => {
    if (RM) { drawAll(scope.current); return; }
    const track = scope.current!.querySelector<HTMLElement>('.hz-track')!;
    const dist = () => track.scrollWidth - innerWidth + 40;
    const run = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: scope.current, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.7, invalidateOnRefresh: true, anticipatePin: 1 },
    });
    gsap.utils.toArray<HTMLElement>('.panel', scope.current).forEach(panel => {
      const along = (start: string, end: string) => ({ trigger: panel, containerAnimation: run, start, end, scrub: 0.5 });
      const circle = panel.querySelector('.d-circle');
      if (circle) {
        prime(circle);
        gsap.to(circle.querySelectorAll('path'), { strokeDashoffset: 0, ease: 'none', scrollTrigger: along('left 85%', 'center 50%') });
      }
      const spin = panel.querySelector('.spinwrap');
      if (spin) gsap.fromTo(spin, { rotate: -35, scale: 0.4, autoAlpha: 0 }, { rotate: 0, scale: 1, autoAlpha: 1, ease: 'back.out(1.6)', scrollTrigger: along('left 95%', 'left 35%') });
      const label = panel.querySelector('.label');
      if (label) gsap.from(label, { y: 80, autoAlpha: 0, rotate: -6, ease: 'none', scrollTrigger: along('left 70%', 'left 35%') });
    });
    gsap.from(scope.current!.querySelector('.panel.title .hand'), {
      scale: 0.5, rotate: -20, autoAlpha: 0, duration: 1, ease: 'back.out(2)',
      scrollTrigger: { trigger: scope.current, start: 'top 70%', toggleActions: 'play none none reverse' },
    });
  }, { scope });

  return (
    <section className="hz" ref={scope} aria-label="Focaccia pizza">
      <div className="hz-track">
        <div className="panel title"><h2 className="hand rough">Focaccia<br />&nbsp;&nbsp;Pizza &rarr;</h2></div>
        {pizzas.map((p, i) => (
          <div className="panel" key={p.id} data-food>
            <span className="num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <div className="media" {...peekProps(go, p.id, p.name)}>
              <Doodle name="circle" className="d-circle" />
              <div className="spinwrap">
                <img className="cut" src={p.img} alt={p.name} width={p.width} height={p.height} loading="lazy" style={{ animationDelay: `${-i * 2}s` }} />
              </div>
              {i === 1 && <div className="tape" style={{ left: '40%', top: '-6%', transform: 'rotate(-7deg)' }} />}
            </div>
            <div className="label">
              <h3 className="marker name rough">{p.name}</h3>
              <p className="mono">{LONG[p.id] ?? p.desc} &middot; {money(p.price)}</p>
              <button className="btn" onClick={e => add(p.id, e.currentTarget)} style={{ justifySelf: 'start' }}>+ Add</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
