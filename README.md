# STACC Deli

Front end for STACC Deli in the scrapbook style: marker lettering, food cutouts, hand-drawn doodles, and an animation on nearly every scroll and click.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks, then builds to dist/
npm run preview    # serves the production build
```

## Stack

React 18, TypeScript, Vite, GSAP 3 with ScrollTrigger (`@gsap/react` for scoped cleanup). No router library: pages are switched in `App.tsx` so each switch can run its own full-screen wipe. The URL hash deep-links to a page: `#menu`, `#item/verde`, `#story`, `#locations`, `#visit/gol`, `#confirm`.

## Where things live

| Path | What |
| --- | --- |
| `src/App.tsx` | Page switching, wipes, intro, providers |
| `src/lib/motion.ts` | Reusable motions: doodle draw/unwrite, photo pop in/out, sticker slap, typing, writing |
| `src/lib/doodles.ts` | Hand-drawn stroke paths |
| `src/lib/router.tsx` | Pages, which wipe each one uses, hash parsing |
| `src/lib/cart.tsx` | Basket, pickup shop, placed order, and the food-flies-to-cart animation |
| `src/data/menu.ts` | Menu items, prices, ingredients, pairings, photos (sample data) |
| `src/data/locations.ts` | Shops, hours, map pin positions, open-now logic (sample data) |
| `src/sections/` | Home page sections: hero, marquee, signature row, pizza run, slush, menu board |
| `src/pages/` | Home, Menu, Item, Story, Locations, Visit (one shop), Confirm |
| `src/components/` | Nav, intro, page-wipe overlay, cursor, scroll squiggle, cart drawer, footer |
| `src/styles.css` | Theme tokens and all styles |

## Motion inventory

- **Intro:** logo inked stroke by stroke, then the sheet lifts away. Click to skip.
- **Hero:** letters drop and bounce, sandwich springs in, price sticker slaps down, doodles draw. Scrolling away scatters the letters and flings the sandwich; scrolling back rebuilds it. The sandwich leans toward the mouse.
- **Marquee:** two taped bands whose speed and direction follow your scroll.
- **Signature row:** title written in, doodles write on scroll down and unwrite on scroll up, photo pops in and out, description types itself.
- **Pizza run:** section pins and scrolls sideways; slices spin in and get circled.
- **Slush:** SLUSH gains U's as you scroll; cup slides in and tips.
- **Menu tabs:** marker circle moves to the new tab, cards get tossed off, title flips, new cards pop in.
- **Page wipes:** Menu and Home use a marker scribble, Story an ink burst from the click point, Visit a torn paper sheet, Locations a swarm of stickers. Tapping a food photo zooms it onto the item page, and placing an order slams down an ORDER IN! stamp before the sheet tears away.
- **Inner pages:** letters drop in, underline draws. Story deals polaroids; Visit prints that shop's hours as a receipt and draws a route.
- **Item page:** the photo lands from the zoom, the marker circle draws around it, the price sticker slaps on, ingredients get stuck on like labels, the quantity flips as it changes. "Goes well with" photos zoom to their own item page.
- **Locations:** streets and river sketch in, numbered pins slap down, a red route draws to your pickup shop. Picking another shop circles its card and redraws the route; hovering a card makes its pin hop.
- **Order confirmation:** a hand-drawn tracker (ticked box, spinning star, empty box) draws in, the receipt prints with a barcode, a PICKUP stamp lands on it, and doodle confetti falls.
- **Cart:** + Add sends the food arcing into the Order button; the order opens as a receipt that prints in, with the pickup shop and time.
- **Always on:** food bobs and wiggles on hover, a squiggle on the left tracks scroll progress, the cursor becomes a PEEK! sticker over food, buttons fill with ink on hover.

With `prefers-reduced-motion: reduce`, everything renders already drawn and pages swap without wipes.

## Placeholders to replace

- Menu names, descriptions and prices (PKR) in `src/data/menu.ts` are dummy data.
- Photos in `public/img/` are cut from reference images, not STACC's own food. Swap in transparent WebP cutouts at similar sizes.
- Ingredients and allergens per item in `src/data/menu.ts`.
- Shop addresses in `src/data/locations.ts` are real; opening hours are dummy data. The map is a drawing, not a real map.
- Story copy (`src/pages/Story.tsx`) is dummy text.
- Ordering is front-end only. Placing an order sends nothing (the site tells customers to pay at the counter).
