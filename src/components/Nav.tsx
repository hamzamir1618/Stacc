import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Doodle } from './Doodle';
import { NAV_OF, useRouter, type View } from '../lib/router';
import { useCart } from '../lib/cart';
import { drawTl, gsap, prime, RM, undrawTl } from '../lib/motion';

const LINKS: { view: View; label: string; hideSm?: boolean }[] = [
  { view: 'home', label: 'Home', hideSm: true },
  { view: 'menu', label: 'Menu' },
  { view: 'story', label: 'Story', hideSm: true },
  { view: 'locations', label: 'Locations' },
];

export function Nav() {
  const { view: page, go, introDone } = useRouter();
  const view = NAV_OF[page];
  const { count, setOpen, buttonRef, badgeRef } = useCart();
  const scope = useRef<HTMLElement>(null);
  const primed = useRef(false);
  const entered = useRef(false);

  // the hand-drawn underline follows the current page: old one unwrites, new one writes
  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>('.navlink', scope.current).forEach(link => {
      const svg = link.querySelector('svg');
      const on = link.dataset.go === view;
      if (!primed.current || RM) { prime(svg, RM && on); if (RM) return; }
      if (on) drawTl(svg, 0.4); else undrawTl(svg, 0.2);
    });
    primed.current = true;
  }, { scope, dependencies: [view] });

  // nav items drop in once the intro lifts
  useGSAP(() => {
    if (!introDone || entered.current || RM) return;
    entered.current = true;
    gsap.from(scope.current!.querySelectorAll('.logo, .navlink, .cartbtn'), {
      y: -50, rotate: () => gsap.utils.random(-20, 20), autoAlpha: 0, stagger: 0.06, duration: 0.6, ease: 'back.out(2.5)', delay: 0.2,
    });
  }, { scope, dependencies: [introDone] });

  return (
    <header className="nav" ref={scope}>
      <a href="#home" className="logo rough" onClick={e => { e.preventDefault(); go('home', e); }}>STACC DELI</a>
      <nav className="tabs-nav" aria-label="Main">
        {LINKS.map(l => (
          <button
            key={l.view}
            className={`navlink${l.hideSm ? ' hide-sm' : ''}`}
            data-go={l.view}
            aria-current={view === l.view ? 'page' : undefined}
            onClick={e => go(l.view, e)}
          >
            {l.label}
            <Doodle name="under" />
          </button>
        ))}
        <button
          ref={buttonRef}
          className="btn fill cartbtn"
          onClick={() => setOpen(true)}
          aria-label={`Open your order, ${count} item${count === 1 ? '' : 's'}`}
        >
          <span className="lbl">Order</span>
          <span aria-hidden="true">&#9998;</span>
          <span className="cart-count" ref={badgeRef} aria-hidden="true">{count}</span>
        </button>
      </nav>
    </header>
  );
}
