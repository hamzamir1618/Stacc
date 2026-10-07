import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Chars } from '../components/Chars';
import { Doodle } from '../components/Doodle';
import { useCart } from '../lib/cart';
import { peekProps, useRouter } from '../lib/router';
import type { MenuItem } from '../data/menu';
import { drawAll, gsap, markerIn, popper, RM, scrubDoodle, slapper, typer, writer } from '../lib/motion';

interface Props {
  item: MenuItem;
  /** Hand-lettered section title. "\n" breaks the line. */
  title: string;
  longDesc: string;
  sticker: string;
  stickerColor?: 'red' | 'gold' | 'green';
  flip?: boolean;
}

// A zig-zag row: the title writes itself, the photo pops in and out, the description types,
// a sticker slaps on and the doodles draw with the scroll.
export function SignatureRow({ item, title, longDesc, sticker, stickerColor = 'gold', flip }: Props) {
  const { add } = useCart();
  const { go } = useRouter();
  const scope = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (RM) { drawAll(scope.current); return; }
    const q = gsap.utils.selector(scope);
    const media = q('.media')[0];
    writer(q('.sec-title')[0]);
    scrubDoodle(q('.d-lines')[0], 'top 95%', 'top 60%', q('.sec-title-wrap')[0]);
    markerIn(q('.name')[0]);
    typer(q('.typer')[0]);
    popper(q('.pop')[0], media);
    slapper(q('.sticker')[0], media);
    scrubDoodle(q('.d-circle')[0], 'top 80%', 'center 45%', media);
    scrubDoodle(q('.d-swoosh')[0], 'top 70%', 'bottom 60%', media);
  }, { scope });

  return (
    <section className={`row${flip ? ' flip' : ''}`} ref={scope} data-food>
      <div className="row-text">
        <div className="sec-title-wrap">
          <Doodle name="lines" className="d-lines" />
          <h2 className="hand sec-title rough">{title.split('\n').map((l, i) => <span key={i}>{i > 0 && <br />}{l}</span>)}</h2>
        </div>
        <h3 className="marker name rough" aria-label={item.name}><Chars text={item.name} /></h3>
        <p className="mono typer" aria-label={longDesc}><Chars text={longDesc} /></p>
        <div className="row-cta">
          <span className="price">{item.price}</span>
          <button className="btn" onClick={e => add(item.id, e.currentTarget)}>+ Add</button>
        </div>
      </div>
      <div className="media" {...peekProps(go, item.id, item.name)}>
        <Doodle name="circle" className="d-circle" />
        <div className="par">
          <div className="pop" data-rot="-4">
            <img className="cut" src={item.img} alt={item.name} width={item.width} height={item.height} loading="lazy" style={{ animationDelay: '-2s' }} />
          </div>
        </div>
        <div className={`sticker ${stickerColor}`}>{sticker}</div>
        <Doodle name="swoosh" className="d-swoosh" />
      </div>
    </section>
  );
}
