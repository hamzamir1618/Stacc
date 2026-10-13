// STACC Deli shops.
export type LocationId = 'kohsar' | 'gol' | 'bahria';

/** [open, close] in 24h "HH:MM", or null when closed that day. Index 0 = Sunday. */
type Hours = ([string, string] | null)[];

export interface StaccLocation {
  id: LocationId;
  name: string;
  area: string;
  address: string;
  hours: Hours;
  /** Pin position on the hand-drawn map, in its 200 x 150 drawing units. */
  pin: { x: number; y: number };
  tag?: string;
}

const WEEK: Hours = [['11:00', '22:00'], ['09:00', '22:00'], ['09:00', '22:00'], ['09:00', '22:00'], ['09:00', '22:00'], ['09:00', '23:00'], ['10:00', '23:00']];

export const LOCATIONS: StaccLocation[] = [
  { id: 'kohsar', name: 'Kohsar Market', area: 'Islamabad', address: 'Kohsar Market, Street 10, F-6/3, Islamabad', hours: WEEK, pin: { x: 62, y: 34 }, tag: 'NO.1' },
  { id: 'gol', name: 'Gol Market', area: 'Islamabad', address: 'Gol Market, Street 3, F-7/3, Islamabad', hours: [['11:00', '22:00'], ...WEEK.slice(1)], pin: { x: 104, y: 52 } },
  { id: 'bahria', name: 'Bahria Food Street', area: 'Rawalpindi', address: '68 High Street, Bahria Food Street, Bahria Intellectual Village, Rawalpindi', hours: [['12:00', '23:00'], ['12:00', '23:00'], ['12:00', '23:00'], ['12:00', '23:00'], ['12:00', '23:00'], ['12:00', '00:00'], ['12:00', '00:00']], pin: { x: 166, y: 116 }, tag: 'NEW' },
];

export const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

/** Where "you" are on the map. */
export const YOU = { x: 18, y: 132 };

export const isLocationId = (s: string | undefined): s is LocationId => !!s && LOCATIONS.some(l => l.id === s);
export const locationById = (id: LocationId) => LOCATIONS.find(l => l.id === id)!;

const minutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));

export function todaysHours(loc: StaccLocation, now = new Date()) {
  const h = loc.hours[now.getDay()];
  return h ? `${h[0]} – ${h[1]}` : 'Closed today';
}

export function isOpen(loc: StaccLocation, now = new Date()) {
  const h = loc.hours[now.getDay()];
  if (!h) return false;
  const m = now.getHours() * 60 + now.getMinutes();
  const close = h[1] === '00:00' ? 24 * 60 : minutes(h[1]);
  return m >= minutes(h[0]) && m < close;
}

/** A loose hand-drawn route from "you" to a pin, in map units. */
export function routePath(to: { x: number; y: number }) {
  const mx = (YOU.x + to.x) / 2, my = (YOU.y + to.y) / 2;
  return `M${YOU.x} ${YOU.y} C${YOU.x + 20} ${YOU.y - 30} ${mx - 20} ${my + 25} ${mx} ${my} S${to.x - 18} ${to.y + 22} ${to.x} ${to.y}`;
}
