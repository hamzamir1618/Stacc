import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../lib/motion';
import { LABEL, type Point, type Transition, type View } from '../lib/router';

export interface OverlayHandle {
  /** Covers the screen. Resolves with the transition actually used (zoom falls back to scribble without a photo). */
  cover: (kind: Transition, to: View, from?: Point) => Promise<Transition>;
  uncover: (kind: Transition) => Promise<void>;
}

// A jagged edge, like paper torn by hand.
function tornEdge(side: 'bottom' | 'top') {
  const pts: string[] = [];
  if (side === 'bottom') {
    pts.push('0% 0%', '100% 0%', '100% 92%');
    for (let x = 100; x >= 0; x -= 2.5) pts.push(`${x}% ${(91 + Math.random() * 9).toFixed(1)}%`);
  } else {
    for (let x = 0; x <= 100; x += 2.5) pts.push(`${x}% ${(Math.random() * 6).toFixed(1)}%`);
    pts.push('100% 100%', '0% 100%');
  }
  return `polygon(${pts.join(',')})`;
}

const SWARM_COLS = 8, SWARM_ROWS = 6;
const SWARM_COLORS = ['var(--ink)', 'var(--ink)', 'var(--tomato)', 'var(--ink)', 'var(--crust)', 'var(--ink)', 'var(--basil)'];

/**
 * Full-screen page wipes:
 * scribble  a fat marker zig-zags over the screen, then unwrites from where it started
 * burst     ink bursts out of the click point, then drains away
 * tear      a torn black sheet drops over the page and keeps falling
 * zoom      the tapped food photo lifts off, grows to the middle of a fresh sheet, then lands in its spot on the new page
 * stamp     a sheet of paper slides up and a rubber stamp slams onto it, then the sheet is torn away
 * swarm     stickers pop over the whole screen from the click point, then peel away
 */
export const TransitionOverlay = forwardRef<OverlayHandle>(function TransitionOverlay(_, ref) {
  const wipe = useRef<SVGPathElement>(null);
  const tear = useRef<HTMLDivElement>(null);
  const burst = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const stampSheet = useRef<HTMLDivElement>(null);
  const swarm = useRef<HTMLDivElement>(null);
  const flyer = useRef<HTMLImageElement | null>(null);
  const edges = useRef({ tear: tornEdge('bottom'), stamp: tornEdge('top') });

  const dots = useMemo(() => Array.from({ length: SWARM_COLS * SWARM_ROWS }, (_, i) => {
    const c = i % SWARM_COLS, r = Math.floor(i / SWARM_COLS);
    return {
      left: `${((c + 0.5) / SWARM_COLS) * 100}%`, top: `${((r + 0.5) / SWARM_ROWS) * 100}%`,
      background: SWARM_COLORS[(i * 5 + r) % SWARM_COLORS.length],
    };
  }), []);

  // The overlay owns its animations. Without this, a wipe started from another component's
  // animation callback would join that component's GSAP context and die when it unmounts.
  const { contextSafe } = useGSAP(() => {
    const L = wipe.current!.getTotalLength();
    gsap.set(wipe.current, { strokeDasharray: L, strokeDashoffset: L });
    gsap.set(tear.current, { yPercent: -110, visibility: 'visible' });
    gsap.set(stampSheet.current, { yPercent: 110, visibility: 'visible' });
    gsap.set(sheet.current, { autoAlpha: 0 });
    gsap.set(swarm.current!.children, { scale: 0 });
  });

  const labelIn = (to: View) => {
    label.current!.textContent = LABEL[to];
    return gsap.fromTo(label.current, { scale: 0.3, rotate: -25, opacity: 0 }, { scale: 1, rotate: -6, opacity: 1, duration: 0.45, ease: 'back.out(3)' });
  };
  const labelOut = () => gsap.to(label.current, { scale: 1.6, rotate: 12, opacity: 0, duration: 0.3, ease: 'power2.in' });

  useImperativeHandle(ref, () => {
  const api: OverlayHandle = {
    async cover(kind, to, from) {
      const tl = gsap.timeline();
      let used: Transition = kind;

      if (kind === 'zoom') {
        const host = (from?.target as Element | null | undefined)?.closest?.('[data-food]');
        const src = host?.querySelector<HTMLImageElement>('img.cut');
        if (!src) used = 'scribble';
        else {
          const r = src.getBoundingClientRect();
          const f = src.cloneNode() as HTMLImageElement;
          f.className = 'zoom-flyer';
          f.removeAttribute('style');
          Object.assign(f.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px` });
          document.body.appendChild(f);
          flyer.current = f;
          gsap.set(src, { autoAlpha: 0 });
          const w = Math.min(innerWidth * 0.7, 760);
          const h = (w * r.height) / r.width;
          tl.to(sheet.current, { autoAlpha: 1, duration: 0.35, ease: 'power1.out' }, 0)
            .to(f, { left: innerWidth / 2 - w / 2, top: innerHeight / 2 - h / 2, width: w, rotate: -6, duration: 0.65, ease: 'power3.inOut' }, 0)
            .to(f, { rotate: 3, duration: 0.3, ease: 'back.out(3)' });
          await tl.then(() => undefined);
          return used;
        }
      }

      if (used === 'scribble') {
        const L = wipe.current!.getTotalLength();
        tl.fromTo(wipe.current, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.75, ease: 'power2.in' });
      } else if (used === 'tear') {
        tl.fromTo(tear.current, { yPercent: -110 }, { yPercent: 0, duration: 0.6, ease: 'power3.in' });
      } else if (used === 'burst') {
        const x = from?.clientX ?? innerWidth / 2, y = from?.clientY ?? innerHeight / 2;
        tl.fromTo(burst.current, { clipPath: `circle(0% at ${x}px ${y}px)` }, { clipPath: `circle(150% at ${x}px ${y}px)`, duration: 0.65, ease: 'power3.in' });
      } else if (used === 'swarm') {
        const fx = (from?.clientX ?? innerWidth / 2) / innerWidth, fy = (from?.clientY ?? innerHeight / 2) / innerHeight;
        tl.fromTo(swarm.current!.children, { scale: 0, rotate: () => gsap.utils.random(-90, 90) }, {
          scale: 1, rotate: 0, duration: 0.4, ease: 'back.out(2)',
          stagger: { grid: [SWARM_ROWS, SWARM_COLS], from: [fx, fy], amount: 0.45 },
        });
      } else if (used === 'stamp') {
        const st = stampSheet.current!.querySelector('.stamp-big');
        tl.fromTo(stampSheet.current, { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: 'power3.in' })
          .fromTo(st, { scale: 3.4, rotate: -40, autoAlpha: 0 }, { scale: 1, rotate: -8, autoAlpha: 1, duration: 0.32, ease: 'power4.in' })
          .fromTo(stampSheet.current, { x: -14 }, { x: 0, duration: 0.6, ease: 'elastic.out(1,.18)' })
          .to({}, { duration: 0.2 });
        await tl.then(() => undefined);
        return used;
      }
      tl.add(labelIn(to), '-=.15').to({}, { duration: 0.25 });
      await tl.then(() => undefined);
      return used;
    },

    async uncover(kind) {
      const tl = gsap.timeline();
      if (kind === 'zoom') {
        const f = flyer.current;
        const target = document.querySelector<HTMLImageElement>('.detail-photo img.cut');
        if (f && target) {
          const t = target.getBoundingClientRect();
          tl.to(f, { left: t.left, top: t.top, width: t.width, rotate: 0, duration: 0.7, ease: 'power3.inOut' }, 0)
            .to(sheet.current, { autoAlpha: 0, duration: 0.5, ease: 'power1.in' }, 0.2)
            .add(() => { gsap.set(target, { autoAlpha: 1 }); f.remove(); });
        } else {
          f?.remove();
          if (target) gsap.set(target, { autoAlpha: 1 });
          tl.to(sheet.current, { autoAlpha: 0, duration: 0.4 });
        }
        flyer.current = null;
        await tl.then(() => undefined);
        return;
      }
      if (kind === 'stamp') {
        tl.to(stampSheet.current, { yPercent: -115, duration: 0.7, ease: 'power3.inOut' })
          .set(stampSheet.current, { yPercent: 110 });
        await tl.then(() => undefined);
        return;
      }
      tl.add(labelOut());
      if (kind === 'scribble') {
        const L = wipe.current!.getTotalLength();
        tl.to(wipe.current, { strokeDashoffset: -L, duration: 0.75, ease: 'power2.out' }, '-=.1');
      } else if (kind === 'tear') {
        tl.to(tear.current, { yPercent: 110, duration: 0.6, ease: 'power3.out' }, '-=.1').set(tear.current, { yPercent: -110 });
      } else if (kind === 'burst') {
        tl.to(burst.current, { clipPath: 'circle(0% at 50% 110%)', duration: 0.6, ease: 'power3.out' }, '-=.1');
      } else if (kind === 'swarm') {
        tl.to(swarm.current!.children, {
          scale: 0, rotate: () => gsap.utils.random(-120, 120), duration: 0.35, ease: 'back.in(2)',
          stagger: { grid: [SWARM_ROWS, SWARM_COLS], from: 'edges', amount: 0.4 },
        }, '-=.1');
      }
      await tl.then(() => undefined);
    },
  };
  return { cover: contextSafe(api.cover), uncover: contextSafe(api.uncover) };
  });

  return (
    <>
      <svg className="wipe" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path ref={wipe} d="M-12 2 L112 10 L-12 22 L112 32 L-12 46 L112 56 L-12 70 L112 80 L-12 94 L112 104" />
      </svg>
      <div className="tear" ref={tear} style={{ clipPath: edges.current.tear }} aria-hidden="true" />
      <div className="burst" ref={burst} aria-hidden="true" />
      <div className="zoom-sheet" ref={sheet} aria-hidden="true" />
      <div className="swarm" ref={swarm} aria-hidden="true">
        {dots.map((d, i) => <span key={i} style={d} />)}
      </div>
      <div className="stamp-sheet" ref={stampSheet} style={{ clipPath: edges.current.stamp }} aria-hidden="true">
        <div className="stamp-big">ORDER IN!</div>
      </div>
      <div className="wlabel" ref={label} aria-hidden="true" />
    </>
  );
});
