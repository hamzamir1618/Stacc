import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { Doodle } from '../components/Doodle';
import { useCart } from '../lib/cart';
import { peekProps, useRouter } from '../lib/router';
import { CATEGORY_TAB, CATEGORY_TITLE, itemsIn, money, type Category } from '../data/menu';
import { drawTl, gsap, prime, rand, RM, ScrollTrigger, undrawTl, writeIn } from '../lib/motion';

const CATS: Category[] = ['sandwich', 'pizza', 'drinks'];

const ROT: Record<string, number> = { verde: -3, salvo: 4, capone: -5, vela: 3, latte: -2 };

/**
 * Category tabs over a board of food.
 * Switching tabs moves the marker circle, tosses the current cards off the table,
 * flips the title and pops the new cards in.
 */
export function MenuBoard({ scrollIn = false }: { scrollIn?: boolean }) {
  const { add } = useCart();
  const { go } = useRouter();
  const scope = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Category>('sandwich');   // highlighted tab
  const [shown, setShown] = useState<Category>('sandwich'); // cards on the board
  const swapping = useRef(false);
  const first = useRef(true);

  const q = gsap.utils.selector(scope);
  const popsIn = () => {
    const cards = q('.card');
    gsap.fromTo(cards.map(c => c.querySelector('.pop')), { scale: 0, rotate: () => rand(-40, 40), y: 80, autoAlpha: 0 },
      { scale: 1, rotate: (_i: number, el: HTMLElement) => Number(el.dataset.rot), y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.12, ease: 'back.out(2)' });
    gsap.fromTo(cards.flatMap(c => Array.from(c.querySelectorAll('.name, .mono, .btn, .sticker'))), { y: 30, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.04, ease: 'power2.out', delay: 0.2 });
  };

  // first appearance
  useGSAP(() => {
    q('.btab').forEach(t => prime(t.querySelector('svg'), (t as HTMLElement).dataset.cat === 'sandwich'));
    if (RM) return;
    writeIn(q('.board-title')[0]);
    if (!scrollIn) { popsIn(); return; }
    gsap.set(q('.card .pop, .card .name, .card .mono, .card .btn, .card .sticker'), { autoAlpha: 0 });
    ScrollTrigger.create({
      trigger: q('.board')[0], start: 'top 80%',
      onEnter: popsIn,
      onLeaveBack: () => gsap.to(q('.card .pop'), { scale: 0.3, autoAlpha: 0, rotate: 20, duration: 0.35, stagger: 0.05 }),
    });
  }, { scope });

  // new cards arrive after the old ones were tossed
  useGSAP(() => {
    if (first.current) { first.current = false; return; }
    if (RM) return;
    popsIn();
    gsap.fromTo(q('.board-title'), { rotateX: -90, y: 20, autoAlpha: 0 }, {
      rotateX: 0, y: 0, autoAlpha: 1, duration: 0.6, ease: 'back.out(2.5)',
      onComplete: () => { swapping.current = false; },
    });
  }, { scope, dependencies: [shown] });

  const { contextSafe } = useGSAP({ scope });
  const choose = contextSafe((c: Category) => {
    if (c === tab || swapping.current) return;
    const oldTab = q(`.btab[data-cat="${tab}"] svg`)[0], newTab = q(`.btab[data-cat="${c}"]`)[0];
    setTab(c);
    if (RM) { prime(oldTab); prime(newTab.querySelector('svg'), true); setShown(c); return; }
    swapping.current = true;
    undrawTl(oldTab, 0.25);
    drawTl(newTab.querySelector('svg'), 0.45);
    gsap.fromTo(newTab, { rotate: -8, scale: 1.15 }, { rotate: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1,.35)' });
    gsap.timeline({ onComplete: () => setShown(c) })
      .to(q('.card'), { y: () => rand(220, 420), x: () => rand(-320, 320), rotate: () => rand(-120, 120), autoAlpha: 0, duration: 0.5, stagger: 0.06, ease: 'back.in(1.5)' })
      .to(q('.board-title'), { rotateX: 90, y: -20, autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 0);
  });

  return (
    <div className="wrap boardsec" ref={scope}>
      <div className="board-head">
        <h2 className="hand board-title rough" aria-live="polite">{CATEGORY_TITLE[shown]}</h2>
        <div className="btabs" role="tablist" aria-label="Menu categories">
          {CATS.map(c => (
            <button key={c} className="btab" role="tab" data-cat={c} aria-selected={tab === c} onClick={() => choose(c)}>
              {CATEGORY_TAB[c]}
              <Doodle name="circle" className="d-circle" />
            </button>
          ))}
        </div>
      </div>
      <div className="board" role="tabpanel" key={shown}>
        {itemsIn(shown).map((it, i) => (
          <article className="card" key={it.id} data-food>
            <div className="media" {...peekProps(go, it.id, it.name)}>
              <div className="pop" data-rot={ROT[it.id] ?? 0}>
                <img className="cut" src={it.img} alt={it.name} width={it.width} height={it.height} loading="lazy" style={{ animationDelay: `${-i * 1.7}s` }} />
              </div>
              <div className={`sticker ${it.tagColor}`}>{it.tag}</div>
            </div>
            <h3 className="marker name rough"><button className="namelink" onClick={e => go('item', e, it.id)}>{it.name}</button></h3>
            <p className="mono">{it.desc}</p>
            <button className="btn" onClick={e => add(it.id, e.currentTarget)}>+ Add &middot; {money(it.price)}</button>
          </article>
        ))}
      </div>
    </div>
  );
}
