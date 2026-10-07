import { createContext, useContext } from 'react';
import type React from 'react';

export type View = 'home' | 'menu' | 'item' | 'story' | 'locations' | 'visit' | 'confirm';
export const VIEWS: View[] = ['home', 'menu', 'item', 'story', 'locations', 'visit', 'confirm'];

export type Transition = 'scribble' | 'burst' | 'tear' | 'zoom' | 'stamp' | 'swarm';

// Every destination has its own wipe.
export const TRANSITION: Record<View, Transition> = {
  home: 'scribble',
  menu: 'scribble',
  item: 'zoom',       // the tapped photo grows into the item page
  story: 'burst',
  locations: 'swarm', // stickers swarm over the screen
  visit: 'tear',
  confirm: 'stamp',   // a rubber stamp slams down
};

export const LABEL: Record<View, string> = {
  home: 'Home!', menu: 'Menu!', item: 'Yum!', story: 'Story!', locations: 'Locations!', visit: 'Visit!', confirm: 'Order in!',
};

/** Which nav link is underlined for each page. */
export const NAV_OF: Record<View, View> = {
  home: 'home', menu: 'menu', item: 'menu', story: 'story', locations: 'locations', visit: 'locations', confirm: 'menu',
};

export interface Route { view: View; param?: string }

/** The click (or tap) that started a navigation. `target` lets the item zoom find the photo that was tapped. */
export interface Point { clientX: number; clientY: number; target?: EventTarget | null }

interface RouterValue {
  route: Route;
  view: View;
  go: (to: View, from?: Point, param?: string) => void;
  /** False while the opening logo animation is still on screen. */
  introDone: boolean;
}

export const RouterContext = createContext<RouterValue>({ route: { view: 'home' }, view: 'home', go: () => {}, introDone: true });
export const useRouter = () => useContext(RouterContext);

export const hashOf = (r: Route) => `#${r.view}${r.param ? `/${r.param}` : ''}`;

export function routeFromHash(): Route {
  const [v, param] = window.location.hash.slice(1).split('/');
  return VIEWS.includes(v as View) ? { view: v as View, param } : { view: 'home' };
}

/** Props that make a food photo open its item page, by click or keyboard. */
export function peekProps(go: RouterValue['go'], id: string, name: string) {
  return {
    role: 'link',
    tabIndex: 0,
    'aria-label': `See ${name}`,
    'data-cursor': 'PEEK!',
    onClick: (e: React.MouseEvent) => go('item', e, id),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      const r = (e.currentTarget as Element).getBoundingClientRect();
      go('item', { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, target: e.currentTarget }, id);
    },
  };
}
