import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Chars } from '../components/Chars';
import { Doodle } from '../components/Doodle';
import { useCart } from '../lib/cart';
import { useRouter } from '../lib/router';
import { ITEMS, money, type ItemId } from '../data/menu';
import { locationById } from '../data/locations';
import { DOODLES } from '../lib/doodles';
import { chars, drawAll, drawTl, gsap, prime, rand, RM, slap } from '../lib/motion';

const BITS = [DOODLES.star[0], DOODLES.squiggle[0], DOODLES.under[0], DOODLES.tick[0]];
const BIT_COLORS = ['#111111', '#e0412a', '#d98a2b', '#5e9b2e'];

// Doodle confetti: little stars, squiggles and ticks that tumble down the screen once.
function confetti() {
  const made: Element[] = [];
  for (let i = 0; i < 38; i++) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 200 120');
    svg.setAttribute('class', 'confetti');
    svg.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', BITS[i % BITS.length]);
    p.setAttribute('stroke', BIT_COLORS[i % BIT_COLORS.length]);
    svg.appendChild(p);
    document.body.appendChild(svg);
    made.push(svg);
    gsap.fromTo(svg, { x: rand(0, innerWidth), y: -80, rotate: rand(-180, 180), scale: rand(0.5, 1.1) }, {
      y: innerHeight + 120, x: `+=${rand(-160, 160)}`, rotate: `+=${rand(-360, 360)}`,
      duration: rand(1.8, 3.4), delay: rand(0, 0.8), ease: 'power1.in', onComplete: () => svg.remove(),
    });
  }
  return () => made.forEach(m => m.remove());
}

export function Confirm() {
  const { go } = useRouter();
  const { lastOrder } = useCart();
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!lastOrder) return;
    if (RM) { drawAll(scope.current); return; }
    const q = gsap.utils.selector(scope);
    const svgs = q('.step svg, .step-arrow, .page-title-wrap .d-under');
    svgs.forEach(s => prime(s));
    gsap.set(q('.confirm-stamp'), { autoAlpha: 0 });

    const tl = gsap.timeline({ delay: 0.15 });
    tl.from(chars(q('.page-title')[0]), { y: -140, rotate: () => rand(-40, 40), autoAlpha: 0, stagger: 0.05, duration: 0.7, ease: 'back.out(2)' })
      .add(drawTl(q('.page-title-wrap .d-under')[0], 0.4), '-=.3')
      .from(q('.confirm-sub'), { y: 20, autoAlpha: 0, duration: 0.4 }, '-=.2')
      // progress tracker: boxes sketched, first one ticked, arrows drawn between
      .from(q('.step'), { y: 40, autoAlpha: 0, stagger: 0.12, duration: 0.5, ease: 'back.out(2.5)' }, '-=.1');
    q('.step').forEach((step, i) => {
      tl.add(drawTl(step.querySelector('.d-box'), 0.35), 1.3 + i * 0.35);
      const arrow = q('.step-arrow')[i];
      if (arrow) tl.add(drawTl(arrow, 0.3), 1.55 + i * 0.35);
    });
    tl.add(drawTl(q('.d-tick')[0], 0.35), 2.5)
      .add(drawTl(q('.d-spin')[0], 0.6), 2.6)
      // the receipt prints out of the slot, then the pickup stamp lands on it
      .fromTo(q('.receipt'), { yPercent: -101 }, { yPercent: 0, duration: 1.8, ease: 'steps(14)' }, 1)
      .from(q('.receipt > *'), { autoAlpha: 0, duration: 0.01, stagger: 0.08 }, 1)
      .add(() => { slap(q('.confirm-stamp')[0]); }, 2.9)
      .from(q('.confirm-side > *'), { y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.5, ease: 'back.out(2.5)' }, 2.2);
    gsap.to(q('.step.now .d-spin'), { rotate: 360, transformOrigin: '50% 50%', repeat: -1, duration: 6, ease: 'none' });

    const clean = confetti();
    return clean;
  }, { scope });

  if (!lastOrder) {
    return (
      <div className="wrap page-head" ref={scope}>
        <h1 className="hand page-title">No order yet</h1>
        <p className="mono" style={{ marginTop: 20 }}>Add some food, then place your order from the Order button.</p>
        <button className="btn fill" style={{ marginTop: 20 }} onClick={e => go('menu', e)}>See the menu</button>
      </div>
    );
  }

  const loc = locationById(lastOrder.location);
  const ids = Object.keys(lastOrder.lines) as ItemId[];

  return (
    <div ref={scope}>
      <div className="wrap page-head">
        <div className="page-title-wrap">
          <h1 className="hand page-title rough" aria-label="Order in!"><Chars text="Order in!" /></h1>
          <Doodle name="under" className="d-under" />
        </div>
        <p className="mono confirm-sub">Order #{lastOrder.number} &middot; pickup at {lastOrder.time} &middot; STACC {loc.name}</p>
      </div>

      <div className="wrap">
        <ol className="tracker" aria-label="Order progress">
          <li className="step done">
            <span className="step-box"><Doodle name="box" className="d-box" /><Doodle name="tick" className="d-tick" /></span>
            <span className="hand">Got it</span>
            <span className="mono">We have your order</span>
          </li>
          <li className="step-gap" aria-hidden="true"><Doodle name="arrow" className="step-arrow" /></li>
          <li className="step now">
            <span className="step-box"><Doodle name="box" className="d-box" /><Doodle name="star" className="d-spin" /></span>
            <span className="hand">Stacking</span>
            <span className="mono">Starts 15 min before pickup</span>
          </li>
          <li className="step-gap" aria-hidden="true"><Doodle name="arrow" className="step-arrow" /></li>
          <li className="step">
            <span className="step-box"><Doodle name="box" className="d-box" /></span>
            <span className="hand">Ready {lastOrder.time}</span>
            <span className="mono">Grab it at the counter</span>
          </li>
        </ol>
      </div>

      <div className="wrap confirm-grid">
        <div className="printer">
          <div className="slot" />
          <div className="paper">
            <div className="receipt">
              <div className="c" style={{ fontWeight: 700, letterSpacing: '.2em' }}>STACC DELI</div>
              <div className="c" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{loc.name.toUpperCase()} &middot; ORDER #{lastOrder.number}</div>
              <div className="dash" />
              {ids.map(id => (
                <div className="r" key={id}>
                  <span>{lastOrder.lines[id]} &times; {ITEMS[id].name}</span>
                  <span>{money(ITEMS[id].price * (lastOrder.lines[id] ?? 0))}</span>
                </div>
              ))}
              <div className="dash" />
              <div className="r" style={{ fontWeight: 700, fontSize: 17 }}><span>TOTAL</span><span>{money(lastOrder.total)}</span></div>
              <div className="r"><span>PICKUP</span><span>{lastOrder.time}</span></div>
              <div className="dash" />
              <div className="barcode" aria-hidden="true" />
              <div className="c" style={{ fontSize: 12 }}>SHOW THIS AT THE COUNTER</div>
            </div>
          </div>
          <div className="confirm-stamp">PICKUP {lastOrder.time}</div>
        </div>

        <div className="confirm-side">
          <p className="hand confirm-note">see you at {lastOrder.time}!</p>
          <p className="mono">Pay at the counter when you collect. We'll have it hot and stacked.</p>
          <div className="confirm-actions">
            <button className="btn fill" onClick={e => go('visit', e, loc.id)}>Directions to {loc.name}</button>
            <button className="btn" onClick={e => go('menu', e)}>Back to the menu</button>
          </div>
        </div>
      </div>
    </div>
  );
}
