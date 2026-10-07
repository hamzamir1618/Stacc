// Reusable motions. Scroll-driven ones are scrubbed or toggled both ways,
// so scrolling back up plays them in reverse (doodles unwrite, photos pop back out).
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger };

export const RM =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const rand = (min: number, max: number) => gsap.utils.random(min, max) as number;

const LEN = new WeakMap<SVGPathElement, number>();

const paths = (svg: Element | null) => (svg ? Array.from(svg.querySelectorAll<SVGPathElement>('path')) : []);
export const chars = (el: Element | null) => (el ? Array.from(el.querySelectorAll<HTMLElement>('.ch')) : []);

/** Hide (or show fully drawn) every stroke in a doodle, ready to be drawn. */
export function prime(svg: Element | null, drawn = false) {
  paths(svg).forEach(p => {
    const L = Math.ceil(p.getTotalLength()) + 4;
    LEN.set(p, L);
    p.style.strokeDasharray = String(L);
    p.style.strokeDashoffset = drawn ? '0' : String(L);
  });
}
export const pathLength = (p: SVGPathElement) => LEN.get(p) ?? 0;

export function drawTl(svg: Element | null, dur = 0.5) {
  const tl = gsap.timeline();
  paths(svg).forEach(p => tl.to(p, { strokeDashoffset: 0, duration: dur, ease: 'power1.inOut' }));
  return tl;
}

export function undrawTl(svg: Element | null, dur = 0.35) {
  const tl = gsap.timeline();
  paths(svg).reverse().forEach(p => tl.to(p, { strokeDashoffset: pathLength(p), duration: dur, ease: 'power1.in' }));
  return tl;
}

/** Write on scroll down, unwrite on scroll up. */
export function scrubDoodle(svg: Element | null, start = 'top 92%', end = 'top 45%', trigger?: Element | null) {
  if (!svg) return;
  prime(svg);
  const tl = gsap.timeline({ scrollTrigger: { trigger: trigger || svg, start, end, scrub: 0.6 } });
  paths(svg).forEach(p => tl.to(p, { strokeDashoffset: 0, ease: 'none' }));
}

export function popIn(el: Element, delay = 0) {
  const rot = Number((el as HTMLElement).dataset.rot || 0);
  return gsap.to(el, { scale: 1, rotate: rot, autoAlpha: 1, y: 0, duration: 0.9, delay, ease: 'back.out(2.2)', overwrite: true });
}

export function popOut(el: Element, dir: 1 | -1) {
  return gsap.to(el, { scale: 0.35, rotate: dir * 28, autoAlpha: 0, y: dir * 90, duration: 0.45, ease: 'back.in(1.7)', overwrite: true });
}

/** Photo pops up when it scrolls in and pops out when it leaves, in both directions. */
export function popper(el: Element | null, trigger?: Element | null) {
  if (!el) return;
  gsap.set(el, { scale: 0.35, rotate: -24, autoAlpha: 0, y: 90 });
  ScrollTrigger.create({
    trigger: trigger || el, start: 'top 85%', end: 'bottom 10%',
    onEnter: () => popIn(el), onEnterBack: () => popIn(el),
    onLeave: () => popOut(el, -1), onLeaveBack: () => popOut(el, 1),
  });
}

export function shake(el: Element | null) {
  if (el) gsap.fromTo(el, { x: -7 }, { x: 0, duration: 0.6, ease: 'elastic.out(1,.18)' });
}

/** Sticker slapped onto the page: drops from big to small and shakes what it lands on. */
export function slap(el: Element | null, delay = 0) {
  if (!el) return gsap.timeline();
  return gsap.fromTo(el, { scale: 3.2, rotate: rand(-60, 60), autoAlpha: 0 }, {
    scale: 1, rotate: rand(-14, 14), autoAlpha: 1, duration: 0.38, delay, ease: 'power4.in', overwrite: true,
    onComplete: () => shake(el.parentElement),
  });
}

export function slapper(el: Element | null, trigger?: Element | null) {
  if (!el) return;
  gsap.set(el, { autoAlpha: 0 });
  ScrollTrigger.create({
    trigger: trigger || el, start: 'top 80%', end: 'bottom 10%',
    onEnter: () => slap(el, 0.35), onEnterBack: () => slap(el, 0.2),
    onLeave: () => gsap.to(el, { scale: 0, rotate: 90, autoAlpha: 0, duration: 0.3, overwrite: true }),
    onLeaveBack: () => gsap.to(el, { scale: 0, rotate: -90, autoAlpha: 0, duration: 0.3, overwrite: true }),
  });
}

/** Monospace text types itself in, and un-types on the way back up. */
export function typer(el: Element | null) {
  const cs = chars(el);
  if (!cs.length) return;
  gsap.set(cs, { autoAlpha: 0 });
  gsap.to(cs, {
    autoAlpha: 1, duration: 0.01, stagger: 0.012, ease: 'none',
    scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
  });
}

/** Hand lettering written left to right, scrubbed with the scroll. */
export function writer(el: Element | null) {
  if (!el) return;
  gsap.set(el, { clipPath: 'inset(-20% 100% -20% -5%)' });
  gsap.to(el, {
    clipPath: 'inset(-20% -5% -20% -5%)', ease: 'none',
    scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 50%', scrub: 0.5 },
  });
}

/** Write a heading in once (not scroll-driven). */
export function writeIn(el: Element | null, duration = 0.8) {
  if (!el) return gsap.timeline();
  return gsap.fromTo(el, { clipPath: 'inset(-20% 100% -20% -5%)' }, { clipPath: 'inset(-20% -5% -20% -5%)', duration, ease: 'power2.inOut' });
}

/** Marker letters bounce in on enter and fall away on leave. */
export function markerIn(el: Element | null) {
  const cs = chars(el);
  if (!cs.length) return;
  gsap.from(cs, {
    y: 60, rotate: () => rand(-30, 30), autoAlpha: 0, stagger: 0.03, duration: 0.6, ease: 'back.out(2.5)',
    scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play reverse play reverse' },
  });
}

/** Letters of a page title drop in from above. */
export function dropLetters(el: Element | null) {
  return gsap.from(chars(el), { y: -140, rotate: () => rand(-40, 40), autoAlpha: 0, stagger: 0.05, duration: 0.7, ease: 'back.out(2)' });
}

/** Draw every doodle fully (reduced motion). */
export function drawAll(root: Element | null) {
  root?.querySelectorAll('svg.doodle').forEach(s => prime(s, true));
}
