// Hand-drawn strokes. Every path is drawn with stroke-dashoffset, so order inside an entry is draw order.
export const DOODLES = {
  arrow: ['M10 92 C50 20 130 8 186 48', 'M164 26 L188 50 L160 62'],
  lines: ['M60 20 L130 80', 'M10 98 L110 108', 'M120 4 L156 66'],
  swoosh: ['M190 18 L40 40 L172 64 L22 96'],
  circle: ['M40 64 C46 16 160 6 186 52 C204 96 96 120 42 100 C10 86 14 40 70 22'],
  star: ['M100 8 L114 46 L156 48 L122 72 L136 112 L100 88 L64 112 L78 72 L44 48 L86 46 Z'],
  under: ['M4 14 C60 4 130 22 196 8'],
  squiggle: ['M5 60 C30 20 50 100 75 60 C100 20 120 100 145 60 C170 20 185 90 195 60'],
  straw: ['M60 116 L120 10 L170 18', 'M40 120 C50 108 70 108 80 120'],
  box: ['M14 16 C60 10 140 12 186 14 C190 50 188 80 186 106 C130 110 70 108 16 104 C12 70 14 40 18 18'],
  tick: ['M40 64 L82 98 L168 18'],
  map: [
    'M0 40 C50 30 90 52 200 36',
    'M0 104 C60 96 120 120 200 98',
    'M60 0 C70 50 54 100 66 150',
    'M140 0 C130 60 150 100 136 150',
    'M20 130 C50 120 70 80 100 76 C130 72 140 50 150 40',
  ],
} as const;

export type DoodleName = keyof typeof DOODLES;
