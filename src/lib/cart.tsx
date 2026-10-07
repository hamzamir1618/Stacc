import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { ITEMS, type ItemId } from '../data/menu';
import { LOCATIONS, type LocationId } from '../data/locations';
import { gsap, RM } from './motion';

type Lines = Partial<Record<ItemId, number>>;

export interface PlacedOrder {
  number: string;
  lines: Lines;
  total: number;
  time: string;
  location: LocationId;
}

interface CartValue {
  lines: Lines;
  count: number;
  total: number;
  open: boolean;
  setOpen: (o: boolean) => void;
  /** Adds items. Pass the element that was tapped so the food can fly from it to the Order button. */
  add: (id: ItemId, from?: Element | null, qty?: number) => void;
  change: (id: ItemId, delta: number) => void;
  clear: () => void;
  /** The shop the order will be picked up from. */
  location: LocationId;
  setLocation: (id: LocationId) => void;
  /** Turns the basket into a placed order (front end only) and empties the basket. */
  place: (time: string) => PlacedOrder;
  lastOrder: PlacedOrder | null;
  buttonRef: RefObject<HTMLButtonElement>;
  badgeRef: RefObject<HTMLSpanElement>;
}

const CartContext = createContext<CartValue | null>(null);

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error('useCart must be used inside CartProvider');
  return c;
}

function burstSparks(rect: DOMRect) {
  for (let i = 0; i < 9; i++) {
    const s = document.createElement('div');
    s.className = 'spark';
    document.body.appendChild(s);
    const a = (i / 9) * Math.PI * 2;
    gsap.set(s, { left: rect.left + rect.width / 2, top: rect.top + rect.height / 2, rotate: (a * 180) / Math.PI + 90 });
    gsap.to(s, { x: Math.cos(a) * 50, y: Math.sin(a) * 50, autoAlpha: 0, scaleY: 0.3, duration: 0.55, ease: 'power2.out', onComplete: () => s.remove() });
  }
}

const sumOf = (lines: Lines) => (Object.keys(lines) as ItemId[]).reduce((s, id) => s + (lines[id] ?? 0) * ITEMS[id].price, 0);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Lines>({});
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState<LocationId>(LOCATIONS[0].id);
  const [lastOrder, setLastOrder] = useState<PlacedOrder | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);

  const bump = useCallback(() => {
    const btn = buttonRef.current, badge = badgeRef.current;
    if (!btn || RM) return;
    if (badge) gsap.fromTo(badge, { scale: 2.2, rotate: -30 }, { scale: 1, rotate: 0, duration: 0.8, ease: 'elastic.out(1,.35)' });
    gsap.fromTo(btn, { rotate: -6 }, { rotate: 0, duration: 0.6, ease: 'elastic.out(1,.3)' });
    burstSparks(btn.getBoundingClientRect());
  }, []);

  const add = useCallback((id: ItemId, from?: Element | null, qty = 1) => {
    const commit = () => {
      setLines(l => ({ ...l, [id]: (l[id] ?? 0) + qty }));
      requestAnimationFrame(bump);
    };
    const host = from?.closest('[data-food]') ?? from;
    const img = host?.querySelector<HTMLImageElement>('img.cut');
    const btn = buttonRef.current;
    if (!img || !btn || RM) { commit(); return; }

    // the food launches, arcs over and spins down into the Order button
    const a = img.getBoundingClientRect(), b = btn.getBoundingClientRect();
    const f = img.cloneNode() as HTMLImageElement;
    f.className = 'flyer';
    f.removeAttribute('style');
    Object.assign(f.style, { left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px` });
    document.body.appendChild(f);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    gsap.timeline({ onComplete: () => { f.remove(); commit(); } })
      .to(f, { x: dx, duration: 0.8, ease: 'power1.inOut' }, 0)
      .to(f, { y: dy - 120, duration: 0.35, ease: 'power2.out' }, 0)
      .to(f, { y: dy, duration: 0.45, ease: 'power2.in' }, 0.35)
      .to(f, { scale: 0.08, rotate: 540, duration: 0.8, ease: 'power2.in' }, 0);
    gsap.fromTo(img, { scale: 0.85 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1,.4)' });
  }, [bump]);

  const change = useCallback((id: ItemId, delta: number) => {
    setLines(l => {
      const n = (l[id] ?? 0) + delta;
      const next = { ...l };
      if (n <= 0) delete next[id]; else next[id] = n;
      return next;
    });
  }, []);

  const clear = useCallback(() => setLines({}), []);

  const place = useCallback((time: string) => {
    const order: PlacedOrder = {
      number: String(Math.floor(1000 + Math.random() * 9000)),
      lines, total: sumOf(lines), time, location,
    };
    setLastOrder(order);
    setLines({});
    return order;
  }, [lines, location]);

  const value = useMemo<CartValue>(() => ({
    lines, open, setOpen, add, change, clear, location, setLocation, place, lastOrder, buttonRef, badgeRef,
    count: (Object.keys(lines) as ItemId[]).reduce((s, id) => s + (lines[id] ?? 0), 0),
    total: sumOf(lines),
  }), [lines, open, add, change, clear, location, place, lastOrder]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
