import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { PageTitle } from './PageTitle';
import { Doodle } from '../components/Doodle';
import { useRouter } from '../lib/router';
import { useCart } from '../lib/cart';
import { DAYS, isLocationId, locationById, LOCATIONS } from '../data/locations';
import { drawAll, drawTl, dropLetters, gsap, prime, RM, slap } from '../lib/motion';

// One shop: its hours print out as a receipt and a route draws to it on a hand-drawn map.
export function Visit() {
  const { route, go } = useRouter();
  const { setLocation, setOpen, location } = useCart();
  const loc = isLocationId(route.param) ? locationById(route.param) : LOCATIONS[0];
  const scope = useRef<HTMLDivElement>(null);
  // Monday first on the receipt
  const week = [1, 2, 3, 4, 5, 6, 0].map(d => [DAYS[d].slice(0, 3), loc.hours[d] ? `${loc.hours[d]![0]} – ${loc.hours[d]![1]}` : 'CLOSED']);

  useGSAP(() => {
    if (RM) { drawAll(scope.current); return; }
    const q = gsap.utils.selector(scope);
    const under = q('.page-title-wrap .d-under')[0];
    const map = q('.mapbox svg')[0];
    prime(under);
    prime(map);
    prime(q('.backlink .d-under')[0]);
    gsap.set(q('.mapbox .pin'), { autoAlpha: 0 });

    const tl = gsap.timeline();
    tl.add(dropLetters(q('.page-title')[0]))
      .add(drawTl(under, 0.4), '-=.3')
      .add(drawTl(q('.backlink .d-under')[0], 0.3), 0.2)
      // the receipt prints out of the slot in jerky steps
      .fromTo(q('.receipt'), { yPercent: -101 }, { yPercent: 0, duration: 1.8, ease: 'steps(14)' }, '-=.2')
      .from(q('.receipt > *'), { autoAlpha: 0, duration: 0.01, stagger: 0.08 }, '<')
      .fromTo(q('.mapbox'), { scale: 0.5, rotate: -10, autoAlpha: 0 }, { scale: 1, rotate: 1.5, autoAlpha: 1, duration: 0.8, ease: 'back.out(2)' }, 0.4)
      .from(q('.visit-actions > *'), { y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.5, ease: 'back.out(3)' }, 1.2);
    // streets sketch in, then the route runs to the shop and the pin slaps down
    map.querySelectorAll('path:not(.route)').forEach((p, i) => tl.to(p, { strokeDashoffset: 0, duration: 0.5, ease: 'power1.inOut' }, 1 + i * 0.15));
    tl.to(map.querySelector('.route'), { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, '>-0.1')
      .add(() => { slap(q('.mapbox .pin')[0]); })
      .from(q('.mapbox .you'), { autoAlpha: 0, x: -30, duration: 0.4 }, '<');
  }, { scope });

  return (
    <div ref={scope}>
      <div className="wrap page-head">
        <button className="backlink" onClick={e => go('locations', e)}>&larr; all locations<Doodle name="under" className="d-under" /></button>
        <PageTitle text="Come hungry" />
      </div>
      <div className="wrap visit-grid">
        <div>
          <div className="printer">
            <div className="slot" />
            <div className="paper">
              <div className="receipt">
                <div className="c" style={{ fontWeight: 700, letterSpacing: '.2em' }}>STACC {loc.name.toUpperCase()}</div>
                <div className="c" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{loc.area.toUpperCase()}</div>
                <div className="dash" />
                {week.map(([d, h]) => <div className="r" key={d}><span>{d}</span><span>{h}</span></div>)}
                <div className="dash" />
                <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>ADDRESS</div>
                <div>{loc.address.toUpperCase()}</div>
                <div className="dash" />
                <div className="c" style={{ fontWeight: 700 }}>THANK YOU, COME HUNGRY</div>
              </div>
            </div>
          </div>
          <div className="visit-actions">
            <button className="btn fill" onClick={() => { setLocation(loc.id); setOpen(true); }}>
              {location === loc.id ? 'Order pickup here' : `Order from ${loc.name}`}
            </button>
          </div>
        </div>
        <div className="mapbox" role="img" aria-label={`Hand-drawn map to STACC ${loc.name}`}>
          <Doodle name="map" />
          <div className="sticker red pin">STACC</div>
          <div className="you">you &rarr;</div>
        </div>
      </div>
    </div>
  );
}
