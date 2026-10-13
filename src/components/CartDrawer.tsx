import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import { useGSAP } from '@gsap/react';
import { Doodle } from './Doodle';
import { useCart } from '../lib/cart';
import { useRouter, type Point } from '../lib/router';
import { ITEMS, money, type ItemId } from '../data/menu';
import { locationById } from '../data/locations';
import { drawTl, gsap, prime, RM } from '../lib/motion';

const TIMES = ['12:15', '12:30', '12:45', '13:00'];

// The order slides in as a receipt and its lines print one by one.
// Placing it hands over to the confirmation page. Front end only: nothing is sent anywhere.
export function CartDrawer() {
  const { open, setOpen, lines, total, count, change, location, place } = useCart();
  const { go } = useRouter();
  const [shown, setShown] = useState(false);
  const [time, setTime] = useState(TIMES[1]);
  const scope = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const loc = locationById(location);

  useEffect(() => { if (open) setShown(true); }, [open]);

  const { contextSafe } = useGSAP(() => {
    if (!shown) return;
    closeBtn.current?.focus();
    const q = gsap.utils.selector(scope);
    const under = q('.drawer-head .d-under')[0];
    if (RM) { prime(under, true); return; }
    prime(under);
    gsap.timeline()
      .fromTo(q('.drawer-backdrop'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
      .fromTo(q('.drawer'), { xPercent: 105, rotate: 4 }, { xPercent: 0, rotate: 0, duration: 0.7, ease: 'back.out(1.4)' }, 0)
      .add(drawTl(under, 0.4), 0.35)
      .fromTo(q('.receipt'), { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: 'steps(10)' }, 0.4)
      .from(q('.receipt > *, .drawer-empty > *'), { autoAlpha: 0, y: 8, duration: 0.2, stagger: 0.05 }, 0.5);
  }, { scope, dependencies: [shown], revertOnUpdate: true });

  /** Slides the drawer away, then runs `after` (e.g. a page change). */
  const close = contextSafe((after?: () => void) => {
    // `after` runs on a fresh task so a page change it starts is not adopted by this drawer's GSAP context
    const done = () => { setShown(false); setOpen(false); if (after) setTimeout(after, 0); };
    if (RM) { done(); return; }
    const q = gsap.utils.selector(scope);
    gsap.timeline({ onComplete: done })
      .to(q('.drawer'), { xPercent: 105, rotate: 4, duration: 0.45, ease: 'back.in(1.4)' })
      .to(q('.drawer-backdrop'), { autoAlpha: 0, duration: 0.25 }, '-=.2');
  });

  useEffect(() => {
    if (!shown) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shown, close]);

  const goAfterClose = (to: 'menu' | 'locations' | 'confirm', e: React.MouseEvent) => {
    const from: Point = { clientX: e.clientX, clientY: e.clientY };
    close(() => go(to, from));
  };

  const placeOrder = (e: React.MouseEvent) => {
    place(time);
    goAfterClose('confirm', e);
  };

  if (!shown) return null;
  const ids = Object.keys(lines) as ItemId[];

  return (
    <div ref={scope}>
      <div className="drawer-backdrop" onClick={() => close()} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Your order">
        <div className="drawer-head">
          <h2 className="hand rough">your order</h2>
          <Doodle name="under" className="d-under" />
          <button className="close" ref={closeBtn} onClick={() => close()} aria-label="Close order">&times;</button>
        </div>

        {count === 0 ? (
          <div className="drawer-empty">
            <p className="hand">Nothing here yet.</p>
            <p className="mono">Tap + Add on any food to put it in your order.</p>
            <button className="btn fill" onClick={e => goAfterClose('menu', e)}>See the menu</button>
          </div>
        ) : (
          <>
            <div className="receipt">
              <div className="c" style={{ fontWeight: 700, letterSpacing: '.2em' }}>STACC DELI</div>
              <div className="c" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>PICKUP ORDER</div>
              <div className="dash" />
              {ids.map(id => (
                <div className="line" key={id}>
                  <span>{ITEMS[id].name}</span>
                  <span>{money(ITEMS[id].price * (lines[id] ?? 0))}</span>
                  <span className="qty">
                    <button onClick={() => change(id, -1)} aria-label={`One less ${ITEMS[id].name}`}>&minus;</button>
                    {lines[id]}
                    <button onClick={() => change(id, 1)} aria-label={`One more ${ITEMS[id].name}`}>+</button>
                  </span>
                </div>
              ))}
              <div className="dash" />
              <div className="r" style={{ fontWeight: 700, fontSize: 17 }}><span>TOTAL</span><span>{money(total)}</span></div>
              <div className="dash" />
              <div className="r" style={{ fontSize: 12 }}>
                <span>PICKUP FROM</span>
                <button className="inline-link" onClick={e => goAfterClose('locations', e)}>{loc.name} &middot; change</button>
              </div>
              <div style={{ fontSize: 12, margin: '6px 0' }}>PICKUP AT</div>
              <div className="times" role="group" aria-label="Pickup time">
                {TIMES.map(t => (
                  <button key={t} aria-pressed={time === t} onClick={() => setTime(t)}>{t}</button>
                ))}
              </div>
            </div>
            <button className="btn fill" onClick={placeOrder} style={{ justifyContent: 'center' }}>Place order &rarr;</button>
          </>
        )}
        <p className="drawer-note">Pay at the counter when you collect your order.</p>
      </aside>
    </div>
  );
}
