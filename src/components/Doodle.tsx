import type { CSSProperties } from 'react';
import { DOODLES, type DoodleName } from '../lib/doodles';

interface Props {
  name: DoodleName;
  className?: string;
  style?: CSSProperties;
}

// Stars and the map keep their proportions; every other stroke stretches to its box like a quick pen mark.
export function Doodle({ name, className = '', style }: Props) {
  const keepRatio = name === 'star' || name === 'map';
  return (
    <svg
      className={`doodle ${className}`}
      viewBox={name === 'map' ? '0 0 200 150' : '0 0 200 120'}
      preserveAspectRatio={keepRatio ? undefined : 'none'}
      aria-hidden="true"
      style={style}
    >
      {DOODLES[name].map((d, i) => (
        <path key={i} d={d} className={name === 'map' && i === 4 ? 'route' : undefined} />
      ))}
    </svg>
  );
}
