// Sample locations. Names, addresses, phone numbers and hours are placeholders.
export type LocationId = 'downtown' | 'riverside' | 'market';

/** [open, close] in 24h "HH:MM", or null when closed that day. Index 0 = Sunday. */
type Hours = ([string, string] | null)[];

export interface StaccLocation {
  id: LocationId;
  name: string;
  area: string;
  address: string;
  phone: string;
  hours: Hours;
  /** Pin position on the hand-drawn map, in its 200 x 150 drawing units. */
  pin: { x: number; y: number };
  tag?: string;
}

const WEEK: Hours = [['10:00', '15:00'], ['08:00', '18:00'], ['08:00', '18:00'], ['08:00', '18:00'], ['08:00', '18:00'], ['08:00', '19:00'], ['09:00', '17:00']];

export const LOCATIONS: StaccLocation[] = [
  { id: 'downtown', name: 'Downtown', area: 'The original', address: '[street], [city]', phone: '[phone number]', hours: WEEK, pin: { x: 128, y: 44 }, tag: 'NO.1' },
  { id: 'riverside', name: 'Riverside', area: 'By the water', address: '[street], [city]', phone: '[phone number]', hours: [null, ...WEEK.slice(1)], pin: { x: 58, y: 98 } },
  { id: 'market', name: 'Market Hall', area: 'Stall 14', address: '[street], [city]', phone: '[phone number]', hours: [['09:00', '14:00'], null, ['09:00', '16:00'], ['09:00', '16:00'], ['09:00', '16:00'], ['09:00', '17:00'], ['08:00', '17:00']], pin: { x: 168, y: 112 }, tag: 'NEW' },
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
  return m >= minutes(h[0]) && m < minutes(h[1]);
}

/** A loose hand-drawn route from "you" to a pin, in map units. */
export function routePath(to: { x: number; y: number }) {
  const mx = (YOU.x + to.x) / 2, my = (YOU.y + to.y) / 2;
  return `M${YOU.x} ${YOU.y} C${YOU.x + 20} ${YOU.y - 30} ${mx - 20} ${my + 25} ${mx} ${my} S${to.x - 18} ${to.y + 22} ${to.x} ${to.y}`;
}
