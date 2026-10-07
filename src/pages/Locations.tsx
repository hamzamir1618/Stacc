import { useMemo, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { PageTitle } from './PageTitle';
import { Doodle } from '../components/Doodle';
import { useCart } from '../lib/cart';
import { useRouter } from '../lib/router';
import { DOODLES } from '../lib/doodles';
import { isOpen, LOCATIONS, routePath, todaysHours, YOU, type LocationId } from '../data/locations';
import { drawAll, drawTl, dropLetters, gsap, prime, rand, RM, slap, undrawTl } from '../lib/motion';

const STREETS = DOODLES.map.slice(0, 4);
const RIVER = 'M0 70 C30 60 50 84 80 76 C110 68 120 92 150 86 C170 82 185 70 200 74';

export function Locations() {
  const { go } = useRouter();
  const { location, setLocation, count, setOpen } = useCart();
  const [hover, setHover] = useState<LocationId | null>(null);
  const now = useMemo(() => new Date(), []);
  const scope = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const selected = LOCATIONS.find(l => l.id === location)!;

  useGSAP(() => {
    const q = gsap.utils.selector(scope);
    const circles = q('.loc-card .d-circle');
    q('.loc-card').forEach((card, i) => prime(circles[i], RM && (card as HTMLElement).dataset.id === location));
    if (RM) { drawAll(q('.map-art')[0]); drawAll(q('.page-title-wrap')[0]); return; }
    const under = q('.page-title-wrap .d-under')[0];
    prime(under);
    prime(q('.map-art')[0]);
    gsap.set(q('.pin'), { autoAlpha: 0 });

    const tl = gsap.timeline();
    tl.add(dropLetters(q('.page-title')[0]))
      .add(drawTl(under, 0.4), '-=.3')
      .from(q('.loc-lead'), { y: 20, autoAlpha: 0, duration: 0.4 }, '-=.2')
      .fromTo(q('.mapwrap'), { scale: 0.6, rotate: -8, autoAlpha: 0 }, { scale: 1, rotate: -1, autoAlpha: 1, duration: 0.8, ease: 'back.out(2)' }, 0.3);
    // streets sketched in, river last
    q('.map-art .street, .map-art .river').forEach((p, i) => tl.to(p, { strokeDashoffset: 0, duration: 0.45, ease: 'power1.inOut' }, 0.8 + i * 0.12));
    tl.to(q('.map-art .you-star'), { strokeDashoffset: 0, duration: 0.4 }, 1.4);
    // pins slap down one by one, then the route runs to your pickup spot
    q('.pin').forEach((pin, i) => tl.add(() => { slap(pin); }, 1.5 + i * 0.18));
    tl.add(drawTl(q('.route-g')[0], 0.9), 2.1);
    // cards dealt onto the table
    tl.fromTo(q('.loc-card'), { x: () => rand(200, 400), y: 120, rotate: () => rand(-40, 40), autoAlpha: 0 }, {
      x: 0, y: 0, rotate: (i: number) => [-2, 1.5, -1][i % 3], autoAlpha: 1, duration: 0.8, stagger: 0.14, ease: 'back.out(1.5)',
    }, 0.6);
    const sel = q(`.loc-card[data-id="${location}"] .d-circle`)[0];
    tl.add(drawTl(sel, 0.6), 2.2);
  }, { scope });

  // picking a shop: its card gets circled, the old circle rubs out, the route redraws to the new pin
  useGSAP(() => {
    if (first.current) { first.current = false; return; }
    const q = gsap.utils.selector(scope);
    q('.loc-card').forEach(card => {
      const c = card.querySelector('.d-circle');
      if ((card as HTMLElement).dataset.id === location) { if (RM) prime(c, true); else drawTl(c, 0.5); }
      else if (RM) prime(c); else undrawTl(c, 0.25);
    });
    const route = q('.route-g')[0];
    if (RM) { prime(route, true); return; }
    prime(route);
    drawTl(route, 0.8);
    slap(q(`.pin[data-id="${location}"]`)[0]);
  }, { scope, dependencies: [location] });

  // hovering a card makes its pin hop, and the other way round
  useGSAP(() => {
    if (!hover || RM) return;
    const q = gsap.utils.selector(scope);
    gsap.fromTo(q(`.pin[data-id="${hover}"]`), { y: 0 }, { y: -14, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' });
    gsap.to(q(`.loc-card[data-id="${hover}"]`), { y: -8, duration: 0.3, ease: 'back.out(3)' });
    gsap.to(q(`.loc-card:not([data-id="${hover}"])`), { y: 0, duration: 0.3 });
  }, { scope, dependencies: [hover] });

  return (
    <div ref={scope}>
      <div className="wrap page-head">
        <PageTitle text="Find a STACC" />
        <p className="mono loc-lead">
          Sample locations. Pick the shop you'll collect from.
          {count > 0 && <> <button className="inline-link" onClick={() => setOpen(true)}>Back to your order ({count})</button></>}
        </p>
      </div>

      <div className="wrap loc-grid" onPointerLeave={() => setHover(null)}>
        <div className="mapwrap">
          <div className="mapbox loc-map" role="img" aria-label={`Hand-drawn map with ${LOCATIONS.length} STACC shops. Route shown to ${selected.name}.`}>
            <svg className="doodle map-art" viewBox="0 0 200 150" aria-hidden="true">
              <path className="river" d={RIVER} />
              {STREETS.map((d, i) => <path className="street" key={i} d={d} />)}
              <path className="you-star" d={`M${YOU.x} ${YOU.y - 7} L${YOU.x + 2} ${YOU.y - 2} L${YOU.x + 7} ${YOU.y - 2} L${YOU.x + 3} ${YOU.y + 1} L${YOU.x + 5} ${YOU.y + 6} L${YOU.x} ${YOU.y + 3} L${YOU.x - 5} ${YOU.y + 6} L${YOU.x - 3} ${YOU.y + 1} L${YOU.x - 7} ${YOU.y - 2} L${YOU.x - 2} ${YOU.y - 2} Z`} />
              <g className="route-g"><path className="route" d={routePath(selected.pin)} /></g>
            </svg>
            {LOCATIONS.map((l, i) => (
              <button
                key={l.id}
                className={`pin sticker${l.id === location ? ' red' : ''}`}
                data-id={l.id}
                style={{ left: `${(l.pin.x / 200) * 100}%`, top: `${(l.pin.y / 150) * 100}%` }}
                onClick={() => setLocation(l.id)}
                onPointerEnter={() => setHover(l.id)}
                aria-label={`Pick ${l.name} for pickup`}
                aria-pressed={l.id === location}
              >
                {i + 1}
              </button>
            ))}
            <span className="you">you</span>
          </div>
        </div>

        <div className="loc-list">
          {LOCATIONS.map((l, i) => {
            const open = isOpen(l, now);
            const picked = l.id === location;
            return (
              <article className="loc-card" key={l.id} data-id={l.id} onPointerEnter={() => setHover(l.id)}>
                <Doodle name="circle" className="d-circle" />
                <div className="tape" />
                <div className={`sticker status ${open ? 'green' : ''}`}>{open ? 'OPEN' : 'CLOSED'}</div>
                <p className="hand loc-num">no. {i + 1}{l.tag && l.tag !== 'NO.1' ? ` · ${l.tag.toLowerCase()}!` : ''}</p>
                <h2 className="marker loc-name rough">{l.name}</h2>
                <p className="hand loc-area">{l.area}</p>
                <p className="mono">{l.address}</p>
                <p className="mono">Today: {todaysHours(l, now)}</p>
                <div className="loc-actions">
                  <button className={`btn${picked ? ' fill' : ''}`} onClick={() => setLocation(l.id)} aria-pressed={picked}>
                    {picked ? '✓ Your pickup spot' : 'Pick up here'}
                  </button>
                  <button className="inline-link" onClick={e => go('visit', e, l.id)}>Hours &amp; map &rarr;</button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
