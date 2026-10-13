// Menu items. Prices are in Pakistani rupees.
export type Category = 'sandwich' | 'pizza' | 'drinks';
export type ItemId = 'verde' | 'salvo' | 'capone' | 'vela' | 'latte';

export interface MenuItem {
  id: ItemId;
  name: string;
  /** One line, for cards. */
  desc: string;
  /** A few sentences, for the item page. */
  blurb: string;
  ingredients: string[];
  pairs: ItemId[];
  price: number;
  img: string;
  width: number;
  height: number;
  category: Category;
  tag: string;
  tagColor: '' | 'red' | 'gold' | 'green';
}

export const ITEMS: Record<ItemId, MenuItem> = {
  verde: {
    id: 'verde', name: 'THE BIG STACC', price: 1450, category: 'sandwich', tag: 'BEST', tagColor: 'red',
    desc: 'Brisket, romesco mayo, tomato confit, endive.',
    blurb: 'Brisket smoked in-house and sliced thick, piled on focaccia with romesco mayo, slow tomato confit, caramelized onion and crisp endive.',
    ingredients: ['Smoked brisket', 'Romesco mayo', 'Tomato confit', 'Caramelized onion', 'Endive', 'Focaccia'],
    pairs: ['latte', 'capone'],
    img: '/img/verde.webp', width: 610, height: 352,
  },
  salvo: {
    id: 'salvo', name: 'PEP SQUAD', price: 1350, category: 'sandwich', tag: 'NEW', tagColor: 'gold',
    desc: 'Triple cheese, marinara, brisket, pepperoni.',
    blurb: 'Three cheeses melted together with marinara, brisket and a lot of pepperoni, pressed into hot focaccia.',
    ingredients: ['Mozzarella', 'Feta', 'Cheddar', 'Marinara', 'Brisket', 'Pepperoni', 'Focaccia'],
    pairs: ['latte', 'verde'],
    img: '/img/salvo.webp', width: 550, height: 265,
  },
  capone: {
    id: 'capone', name: 'MEAT LOCKER', price: 1250, category: 'pizza', tag: 'HOT', tagColor: 'red',
    desc: 'Sausage, meatball, pepperoni, mozzarella.',
    blurb: 'A thick square of focaccia pizza loaded with smoked sausage, meatball and pepperoni under bubbling mozzarella.',
    ingredients: ['Smoked sausage', 'Meatball', 'Pepperoni', 'Mozzarella', 'Tomato sauce', 'Focaccia'],
    pairs: ['latte', 'vela'],
    img: '/img/capone.webp', width: 486, height: 252,
  },
  vela: {
    id: 'vela', name: 'SMOKE SHOW', price: 1550, category: 'pizza', tag: 'SMOKY', tagColor: '',
    desc: 'Smoked salmon, dill sour cream, feta.',
    blurb: 'Focaccia pizza with dill sour cream, feta and mozzarella, finished with ribbons of smoked salmon.',
    ingredients: ['Smoked salmon', 'Dill sour cream', 'Feta', 'Mozzarella', 'Focaccia'],
    pairs: ['latte', 'capone'],
    img: '/img/vela.webp', width: 470, height: 205,
  },
  latte: {
    id: 'latte', name: 'PALM LATTE SLUSH', price: 650, category: 'drinks', tag: 'COLD', tagColor: 'green',
    desc: 'Iced latte with palm sugar, blended.',
    blurb: 'Espresso, milk and palm sugar blended with ice until it is somewhere between a latte and a slushie.',
    ingredients: ['Espresso', 'Milk', 'Palm sugar', 'Ice'],
    pairs: ['verde', 'salvo'],
    img: '/img/latte.webp', width: 317, height: 346,
  },
};

export const CATEGORY_TITLE: Record<Category, string> = {
  sandwich: 'Sandwiches',
  pizza: 'Focaccia Pizza',
  drinks: 'Slushes',
};

export const CATEGORY_TAB: Record<Category, string> = {
  sandwich: 'Sandwiches',
  pizza: 'Pizza',
  drinks: 'Drinks',
};

export const CATEGORY_SINGULAR: Record<Category, string> = {
  sandwich: 'Focaccia sandwich',
  pizza: 'Focaccia pizza',
  drinks: 'Slush',
};

export const isItemId = (s: string | undefined): s is ItemId => !!s && s in ITEMS;

export const itemsIn = (c: Category) => Object.values(ITEMS).filter(i => i.category === c);

/** 1450 -> "1,450" */
export const num = (n: number) => Math.round(n).toLocaleString('en-US');
/** 1450 -> "Rs 1,450" */
export const money = (n: number) => `Rs ${num(n)}`;
