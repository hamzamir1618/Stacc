import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Nav } from './components/Nav';
import { Intro } from './components/Intro';
import { TransitionOverlay, type OverlayHandle } from './components/TransitionOverlay';
import { Cursor } from './components/Cursor';
import { ProgressSquiggle } from './components/ProgressSquiggle';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { Item } from './pages/Item';
import { Story } from './pages/Story';
import { Locations } from './pages/Locations';
import { Visit } from './pages/Visit';
import { Confirm } from './pages/Confirm';
import { CartProvider } from './lib/cart';
import { hashOf, RouterContext, routeFromHash, TRANSITION, type Point, type Route, type View } from './lib/router';
import { RM, ScrollTrigger } from './lib/motion';

const PAGES: Record<View, () => JSX.Element> = {
  home: Home, menu: Menu, item: Item, story: Story, locations: Locations, visit: Visit, confirm: Confirm,
};

// Never let a wipe that fails to finish lock up navigation.
const atMost = <T,>(p: Promise<T>, fallback: T, ms = 4000) =>
  Promise.race([p, new Promise<T>(r => setTimeout(() => r(fallback), ms))]);

const same = (a: Route, b: Route) => a.view === b.view && (a.param ?? '') === (b.param ?? '');

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromHash);
  const [introDone, setIntroDone] = useState(RM);
  const [introShown, setIntroShown] = useState(!RM);
  const overlay = useRef<OverlayHandle>(null);
  const current = useRef(route);
  const busy = useRef(false);

  const swap = useCallback((to: Route) => {
    // commit the new page synchronously while the screen is covered, then re-measure scroll triggers
    flushSync(() => setRoute(to));
    current.current = to;
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  }, []);

  const go = useCallback(async (view: View, from?: Point, param?: string) => {
    const to: Route = { view, param };
    if (busy.current) return;
    if (same(to, current.current)) { window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); return; }
    busy.current = true;
    try { history.replaceState(null, '', hashOf(to)); } catch { /* sandboxed frames may refuse */ }
    try {
      if (RM || !overlay.current) { swap(to); return; }
      const used = await atMost(overlay.current.cover(TRANSITION[view], view, from), TRANSITION[view]);
      swap(to);
      await atMost(overlay.current.uncover(used), undefined);
    } finally {
      busy.current = false;
    }
  }, [swap]);

  // browser back/forward between hashes
  useEffect(() => {
    const onHash = () => { const r = routeFromHash(); if (!same(r, current.current)) go(r.view, undefined, r.param); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [go]);

  // late-loading fonts and images shift layout; re-measure once everything is in
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);
    return () => window.removeEventListener('load', refresh);
  }, []);

  const router = useMemo(() => ({ route, view: route.view, go, introDone }), [route, go, introDone]);
  const Page = PAGES[route.view];

  return (
    <RouterContext.Provider value={router}>
      <CartProvider>
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
          <filter id="rough">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={2} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={3.5} />
          </filter>
        </svg>
        {introShown && <Intro onReveal={() => setIntroDone(true)} onGone={() => setIntroShown(false)} />}
        <TransitionOverlay ref={overlay} />
        <Cursor />
        <ProgressSquiggle />
        <Nav />
        <main key={hashOf(route)}>
          <Page />
        </main>
        <Footer />
        <CartDrawer />
      </CartProvider>
    </RouterContext.Provider>
  );
}
