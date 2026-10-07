import { useEffect, useRef, useState } from 'react';
import { gsap, RM } from '../lib/motion';

// A small ink dot that becomes a red "ADD +" sticker over anything marked data-cursor.
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled] = useState(() => !RM && window.matchMedia('(pointer: fine)').matches);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const qx = gsap.quickTo(el, 'x', { duration: 0.25, ease: 'power3' });
    const qy = gsap.quickTo(el, 'y', { duration: 0.25, ease: 'power3' });
    const move = (e: PointerEvent) => { qx(e.clientX); qy(e.clientY); };
    const over = (e: PointerEvent) => {
      const t = (e.target as Element | null)?.closest<HTMLElement>('[data-cursor]');
      el.classList.toggle('big', !!t);
      el.textContent = t ? t.dataset.cursor ?? '' : '';
    };
    window.addEventListener('pointermove', move);
    document.addEventListener('pointerover', over);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
    };
  }, [enabled]);

  return enabled ? <div className="cursor" ref={ref} aria-hidden="true" /> : null;
}
