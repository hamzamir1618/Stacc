import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { Chars } from '../components/Chars';
import { Doodle } from '../components/Doodle';
import { useCart } from '../lib/cart';
import { peekProps, useRouter } from '../lib/router';
import { CATEGORY_SINGULAR, ITEMS, isItemId, money } from '../data/menu';
import { chars, drawAll, drawTl, gsap, popper, prime, rand, RM, slap, writeIn, writer } from '../lib/motion';

export function Item() {
  const { route, go } = useRouter();
  const { add } = useCart();
  const scope = useRef<HTMLDivElement>(null);
  const [qty, setQty] = useState(1);
  const item = isItemId(route.param) ? ITEMS[route.param] : null;

  useGSAP(() => {
    if (!item) return;
    if (RM) { drawAll(scope.current); return; }
    const q = gsap.utils.selector(scope);
    const photo = q('.detail-photo img.cut')[0];
    const circle = q('.detail-photo .d-circle')[0], arrow = q('.d-inside')[0], under = q('.backlink .d-under')[0];
    [circle, arrow, under].forEach(s => prime(s));
    // arriving by zoom, the flying photo lands in this spot and reveals it; otherwise it pops in
    const zooming = !!document.querySelector('.zoom-flyer');
    if (zooming) gsap.set(photo, { autoAlpha: 0 });
    gsap.set(q('.detail-photo .sticker'), { autoAlpha: 0 });

    const tl = gsap.timeline({ delay: zooming ? 0.45 : 0.1 });
    if (!zooming) tl.fromTo(photo, { scale: 0.3, rotate: -25, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 1, ease: 'elastic.out(1,.55)' }, 0);
    tl.add(writeIn(q('.eyebrow')[0], 0.5), 0)
      .fromTo(chars(q('.detail-name')[0]), { y: -120, rotate: () => rand(-40, 40), autoAlpha: 0 }, { y: 0, rotate: 0, autoAlpha: 1, stagger: 0.035, duration: 0.6, ease: 'back.out(2.2)' }, 0.1)
      .fromTo(chars(q('.blurb')[0]), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, stagger: 0.006 }, 0.5)
      .add(drawTl(circle, 0.6), 0.6)
      .add(() => { slap(q('.detail-photo .sticker')[0]); }, 0.9)
      .add(writeIn(q('.inside-title')[0], 0.5), 0.9)
      .add(drawTl(arrow, 0.35), 1.2)
      // ingredient labels get stuck on one by one
      .fromTo(q('.chip'), { scale: 2.4, rotate: () => rand(-40, 40), autoAlpha: 0 }, { scale: 1, rotate: () => rand(-5, 5), autoAlpha: 1, duration: 0.3, stagger: 0.08, ease: 'power4.in' }, 1.1)
      .fromTo(q('.allergens, .buy > *'), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(3)' }, 1.4)
      .add(drawTl(under, 0.3), 0.2);

    writer(q('.pairs-title')[0]);
    q('.pairs .pop').forEach((el, i) => popper(el, q('.pairs .card')[i]));
  }, { scope });

  const bumpQty = (d: number) => {
    const n = Math.min(20, Math.max(1, qty + d));
    if (n === qty) return;
    setQty(n);
    if (!RM) requestAnimationFrame(() => gsap.fromTo(scope.current!.querySelector('.qty-n'), { y: d > 0 ? 18 : -18, rotate: d * 20, autoAlpha: 0 }, { y: 0, rotate: 0, autoAlpha: 1, duration: 0.4, ease: 'back.out(3)' }));
  };

  if (!item) {
    return (
      <div className="wrap page-head">
        <h1 className="hand page-title">Not on the menu</h1>
        <p className="mono" style={{ marginTop: 20 }}>That item doesn't exist, or it's been taken off the menu.</p>
        <button className="btn fill" style={{ marginTop: 20 }} onClick={e => go('menu', e)}>See the menu</button>
      </div>
    );
  }

  return (
    <div ref={scope}>
      <div className="wrap page-head detail-head">
        <button className="backlink" onClick={e => go('menu', e)}>&larr; back to the menu<Doodle name="under" className="d-under" /></button>
      </div>

      <section className="wrap detail" data-food>
        <div className="detail-photo media">
          <Doodle name="circle" className="d-circle" />
          <img className="cut" src={item.img} alt={item.name} width={item.width} height={item.height} />
          <div className={`sticker ${item.tagColor || 'red'}`}>{item.price}</div>
          <div className="tape" style={{ left: '18%', top: '-4%', transform: 'rotate(-9deg)' }} />
        </div>

        <div className="detail-copy">
          <p className="hand eyebrow rough">{CATEGORY_SINGULAR[item.category]}</p>
          <h1 className="marker detail-name rough" aria-label={item.name}><Chars text={item.name} /></h1>
          <p className="mono blurb" aria-label={item.blurb}><Chars text={item.blurb} /></p>

          <h2 className="hand inside-title rough">what's inside<Doodle name="arrow" className="d-inside" /></h2>
          <ul className="chips" aria-label="Ingredients">
            {item.ingredients.map(i => <li className="chip" key={i}>{i}</li>)}
          </ul>
          <p className="mono allergens">Allergens: to be confirmed. Ask at the counter.</p>

          <div className="buy">
            <div className="stepper" role="group" aria-label="Quantity">
              <button onClick={() => bumpQty(-1)} aria-label="One less" disabled={qty <= 1}>&minus;</button>
              <span className="qty-n" aria-live="polite">{qty}</span>
              <button onClick={() => bumpQty(1)} aria-label="One more">+</button>
            </div>
            <button className="btn fill" onClick={e => { add(item.id, e.currentTarget, qty); setQty(1); }}>
              + Add {qty} &middot; {money(item.price * qty)}
            </button>
          </div>
        </div>
      </section>

      <section className="wrap pairs">
        <h2 className="hand pairs-title rough">goes well with</h2>
        <div className="pairs-grid">
          {item.pairs.map((id, i) => {
            const p = ITEMS[id];
            return (
              <article className="card" key={id} data-food>
                <div className="media" {...peekProps(go, p.id, p.name)}>
                  <div className="pop" data-rot={i % 2 ? 4 : -4}>
                    <img className="cut" src={p.img} alt={p.name} width={p.width} height={p.height} loading="lazy" />
                  </div>
                </div>
                <h3 className="marker name rough">{p.name}</h3>
                <p className="mono">{p.desc}</p>
                <button className="btn" onClick={e => add(p.id, e.currentTarget)}>+ Add &middot; {p.price}</button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
