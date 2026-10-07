import { Hero } from '../sections/Hero';
import { Marquee } from '../sections/Marquee';
import { SignatureRow } from '../sections/SignatureRow';
import { PizzaRun } from '../sections/PizzaRun';
import { Slush } from '../sections/Slush';
import { MenuBoard } from '../sections/MenuBoard';
import { ITEMS } from '../data/menu';

export function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <div className="wrap">
        <SignatureRow
          item={ITEMS.salvo}
          title={'Focaccia\n Sandwich'}
          longDesc="Triple cheese (mozzarella, feta, cheddar), marinara, beef brisket and a lot of pepperoni."
          sticker="NEW!"
        />
      </div>
      <PizzaRun />
      <Slush />
      <MenuBoard scrollIn />
    </>
  );
}
