import { cn } from '@/lib/cn';

/** A Space template: field, primary and charge colors, as the app's BrowserSpaceHousePalette has them. */
export type Template = { name: string; colors: [field: string, primary: string, charge: string] };

export const templates = {
  winter: { name: 'Winter', colors: ['#1e2833', '#3e4e5e', '#86adc4'] },
  lion: { name: 'Lion', colors: ['#3c0e1a', '#722030', '#c9a254'] },
  storm: { name: 'Storm', colors: ['#151824', '#313848', '#b08f4a'] },
  dragon: { name: 'Dragon', colors: ['#1a100d', '#7a1e12', '#be4438'] },
  meadow: { name: 'Meadow', colors: ['#152318', '#345738', '#bca766'] },
  iron: { name: 'Iron', colors: ['#0e1a1c', '#2c3a3c', '#9c9781'] },
  river: { name: 'River', colors: ['#0f1e2e', '#22486c', '#a85c41'] },
  sun: { name: 'Sun', colors: ['#35160b', '#8b3d1b', '#d09e65'] },
  vigil: { name: 'Vigil', colors: ['#101112', '#272a2e', '#7b838c'] },
} satisfies Record<string, Template>;

export type TemplateId = keyof typeof templates;

export const templateOrder: TemplateId[] = ['winter', 'lion', 'storm', 'dragon', 'meadow', 'iron', 'river', 'sun', 'vigil'];

/** The background modes a Space can draw its template in. */
export const backgroundModes = {
  diagonal: 'Diagonal',
  chevron: 'Chevron',
  bands: 'Bands',
  split: 'Split',
  quartered: 'Quartered',
  stripes: 'Stripes',
  checkered: 'Checkered',
  lozenges: 'Lozenges',
  gradient: 'Gradient',
} as const;

export type BackgroundMode = keyof typeof backgroundModes;

export function isTemplateId(value: string | null): value is TemplateId {
  return value != null && value in templates;
}

export function isBackgroundMode(value: string | null): value is BackgroundMode {
  return value != null && value in backgroundModes;
}

/** The app's window and its sidebar, in points. */
export const windowSize = { width: 1329, height: 768 };
export const sidebarWidth = 289;

type Point = [number, number];

function polygon(points: Point[], fill: string, opacity?: number) {
  const d = points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L');
  return `<path d="M${d}Z" fill="${fill}"${opacity ? ` fill-opacity="${opacity}"` : ''}/>`;
}

function rect(x: number, y: number, w: number, h: number, fill: string, opacity?: number) {
  return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${fill}"${opacity ? ` fill-opacity="${opacity}"` : ''}/>`;
}

const fieldCache = new Map<string, string>();

/**
 * A Space background (BrowserSpaceBannerField / BrowserSpaceGradientField) drawn over a
 * width×height field and topped with the house look's readability fade, as a CSS `url()`.
 * `viewWidth` crops the field to its left part, the way a sidebar sees the window-wide field.
 */
export function spaceField(
  id: TemplateId,
  mode: BackgroundMode,
  width: number,
  height: number,
  { viewWidth, fit = 'none' }: { viewWidth?: number; fit?: string } = {},
) {
  const key = [id, mode, width, height, viewWidth, fit].join('/');
  const cached = fieldCache.get(key);
  if (cached) return cached;

  const [a, b, c] = templates[id].colors;
  const W = width;
  const H = height;
  let g = '';

  if (mode === 'gradient') {
    g =
      `<defs><linearGradient id="g" x1="0" y1=".5" x2="1" y2=".5"><stop offset="0" stop-color="${a}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>` +
      '<filter id="n" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 2.2 -1.1"/></filter></defs>' +
      `<rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" filter="url(#n)" opacity=".16"/>`;
  } else {
    g = rect(0, 0, W, H, a);
    if (mode === 'split') g += rect(W / 2, 0, W / 2, H, b);
    else if (mode === 'bands') g += rect(0, H / 3, W, H / 3, b) + rect(0, (2 * H) / 3, W, H / 3 + 0.5, c);
    else if (mode === 'diagonal')
      g +=
        polygon([[0, H * 0.5], [W, H * 0.34], [W, H * 0.5], [0, H * 0.68]], b) +
        polygon([[0, H * 0.68], [W, H * 0.5], [W, H], [0, H]], c);
    else if (mode === 'chevron')
      g +=
        polygon([[0, H * 0.42], [W / 2, H * 0.58], [W, H * 0.42], [W, H * 0.62], [W / 2, H * 0.78], [0, H * 0.62]], b) +
        polygon([[0, H * 0.62], [W / 2, H * 0.78], [W, H * 0.62], [W, H], [0, H]], c);
    else if (mode === 'quartered') g += rect(W / 2, 0, W / 2, H / 2, b) + rect(0, H / 2, W / 2, H / 2, c);
    else {
      const cell = Math.max(16, W / 5);
      const rows = Math.min(200, Math.ceil(H / cell) + 1);
      const cols = Math.min(200, Math.ceil(W / cell) + 1);
      for (let r = 0; r < rows; r++)
        for (let k = 0; k < cols; k++) {
          const x = k * cell;
          const y = r * cell;
          if (mode === 'stripes' && k % 2 === 0) g += rect(x, y, cell, cell, b, 0.35);
          else if (mode === 'checkered' && (r + k) % 2 === 0) g += rect(x, y, cell, cell, b, 0.35);
          else if (mode === 'lozenges')
            g += polygon(
              [[x + cell / 2, y], [x + cell, y + cell / 2], [x + cell / 2, y + cell], [x, y + cell / 2]],
              (r + k) % 2 === 0 ? b : c,
              0.35,
            );
        }
    }
  }
  g += `<rect width="${W}" height="${H}" fill-opacity=".2475"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewWidth || W} ${H}" preserveAspectRatio="${fit}">${g}</svg>`;
  const url = `url('data:image/svg+xml,${encodeURIComponent(svg)}')`;
  fieldCache.set(key, url);
  return url;
}

/** A template's crest artwork. The art leaves room for its shadow, so it draws larger than its box. */
export function CrestArt({ id, className }: { id: TemplateId; className?: string }) {
  return <img src={`/assets/crests/${id}.svg`} alt="" className={cn('scale-132', className)} />;
}
