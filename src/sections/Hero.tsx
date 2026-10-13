import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Chars } from '../components/Chars';
import { Doodle } from '../components/Doodle';
import { peekProps, useRouter } from '../lib/router';
import { useCart } from '../lib/cart';
import { ITEMS, money, num } from '../data/menu';
import { chars, drawAll, drawTl, gsap, pathLength, prime, rand, RM, slap } from '../lib/motion';

const item = ITEMS.verde;
const DESC = 'Beef brisket smoked in-house, romesco mayo, tomato confit, caramelized onion and endive on focaccia.';

export function Hero() {
  const { introDone, go } = useRouter();
  const { add } = useCart();
  const scope = useRef<HTMLDivElement>(null);

  useGSAP((_ctx, contextSafe) => {
    const q = gsap.utils.selector(scope);
    if (RM) { drawAll(scope.current); return; }

    const tChars = chars(q('.hero-title')[0]), nChars = chars(q('.hero-copy .name')[0]), dChars = chars(q('.hero-copy .typer')[0]);
    const pop = q('.pop')[0], stick = q('.sticker')[0], note = q('.hero-note')[0], ctas = q('.hero-ctas .btn');
    const lines = q('.d-lines')[0], arrow = q('.d-arrow')[0], under = q('.hero-note .d-under')[0];
    [lines, arrow, under].forEach(s => prime(s));
    gsap.set(pop, { scale: 0, rotate: -30, autoAlpha: 0 });
    gsap.set([stick, note, ...ctas, ...tChars, ...nChars, ...dChars], { autoAlpha: 0 });
    if (!introDone) return;

    // headline letters drop and bounce, the sandwich springs in, the price sticker slaps down
    const scrollOut = contextSafe!(() => {
      // scrolling away scatters the headline and flings the sandwich; scrolling back reassembles it
      const st = { trigger: scope.current, start: 'top top', end: 'bottom 30%', scrub: 0.6 };
      gsap.to(tChars, { y: () => -rand(80, 260), x: () => rand(-80, 80), rotate: () => rand(-60, 60), autoAlpha: 0, stagger: 0.01, ease: 'none', scrollTrigger: st });
      gsap.to(q('.par'), { scale: 0.6, rotate: 18, yPercent: -30, xPercent: 20, autoAlpha: 0, ease: 'none', scrollTrigger: { ...st } });
      gsap.to(stick, { rotate: 200, scale: 0, ease: 'none', scrollTrigger: { ...st, end: 'bottom 60%' } });
      gsap.to(q('svg.doodle:not(.float-deco) path'), {
        strokeDashoffset: (_i: number, p: SVGPathElement) => pathLength(p), ease: 'none', scrollTrigger: { ...st, end: 'bottom 50%' },
      });
    });

    gsap.timeline({ delay: 0.1, onComplete: scrollOut })
      .fromTo(tChars, { y: -180, rotate: () => rand(-50, 50), autoAlpha: 0 }, { y: 0, rotate: 0, autoAlpha: 1, duration: 0.8, stagger: 0.035, ease: 'back.out(2)' })
      .add(drawTl(lines, 0.2), '-=.4')
      .to(pop, { scale: 1, rotate: 3, autoAlpha: 1, duration: 1.1, ease: 'elastic.out(1,.55)' }, '-=.5')
      .add(() => { slap(stick); }, '-=.6')
      .fromTo(nChars, { y: 50, rotate: () => rand(-30, 30), autoAlpha: 0 }, { y: 0, rotate: 0, autoAlpha: 1, stagger: 0.03, duration: 0.5, ease: 'back.out(3)' }, '-=.6')
      .to(dChars, { autoAlpha: 1, duration: 0.01, stagger: 0.008 }, '-=.2')
      .add(drawTl(arrow, 0.35), '-=.6')
      .fromTo(ctas, { y: 30, scale: 0.6, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, stagger: 0.1, duration: 0.6, ease: 'back.out(3)' }, '-=.5')
      .fromTo(note, { autoAlpha: 0, scale: 0.4, rotate: -30 }, { autoAlpha: 1, scale: 1, rotate: -6, duration: 0.5, ease: 'back.out(3)' }, '-=.3')
      .add(drawTl(under, 0.3));

    // the sandwich leans toward the mouse
    const par = q('.par')[0];
    const qx = gsap.quickTo(par, 'x', { duration: 0.8, ease: 'power3' });
    const qy = gsap.quickTo(par, 'y', { duration: 0.8, ease: 'power3' });
    const onMove = (e: PointerEvent) => { qx((e.clientX / innerWidth - 0.5) * 40); qy((e.clientY / innerHeight - 0.5) * 30); };
    window.addEventListener('pointermove', onMove);

    // the star drifts at its own speed
    gsap.to(q('.float-deco'), { y: -180, rotate: 120, ease: 'none', scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom top', scrub: true } });

    return () => window.removeEventListener('pointermove', onMove);
  }, { scope, dependencies: [introDone], revertOnUpdate: true });

  return (
    <div className="hero wrap" ref={scope}>
      <div className="hero-title-wrap">
        <Doodle name="lines" className="d-lines" />
        <h1 className="hand hero-title rough" aria-label="The Stacc List!"><Chars text="The Stacc List!" /></h1>
      </div>
      <div className="hero-stage" data-food>
        <div className="hero-copy">
          <h2 className="marker name rough" aria-label={item.name}><Chars text={item.name} /></h2>
          <p className="mono typer" aria-label={DESC}><Chars text={DESC} /></p>
          <div className="hero-ctas">
            <button className="btn fill" onClick={e => add(item.id, e.currentTarget)}>+ Add &middot; {money(item.price)}</button>
            <button className="btn" onClick={e => go('menu', e)}>See the menu</button>
          </div>
          <Doodle name="arrow" className="d-arrow" />
        </div>
        <div className="media" {...peekProps(go, item.id, item.name)}>
          <div className="par">
            <div className="pop" data-rot="3">
              <img className="cut" src={item.img} alt="The Big Stacc: brisket focaccia sandwich" width={item.width} height={item.height} />
            </div>
          </div>
          <div className="sticker red price-tag"><span className="rs">Rs</span>{num(item.price)}</div>
          <div className="hero-note">baked this morning<Doodle name="under" className="d-under" /></div>
        </div>
      </div>
      <Doodle name="star" className="float-deco spin" style={{ right: '4%', top: 120, width: 60, height: 60, strokeWidth: 4 }} />
    </div>
  );
}
