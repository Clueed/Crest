import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useMediaQuery as useMediaQueryOrNull } from 'fumadocs-core/utils/use-media-query';
import {
  isBackgroundMode,
  isTemplateId,
  templateOrder,
  templates,
  type BackgroundMode,
  type TemplateId,
} from './templates';

/** Each floating banner in the hero shows its template in a different background mode. */
export const bannerModes: Record<TemplateId, BackgroundMode> = {
  winter: 'diagonal',
  lion: 'chevron',
  storm: 'quartered',
  dragon: 'bands',
  meadow: 'lozenges',
  iron: 'stripes',
  river: 'split',
  sun: 'gradient',
  vigil: 'checkered',
};

/**
 * The URL's screenshot hooks. `shot` holds every animation still; `crest` and `mode` pin the
 * template; `step`, `dev`, `open` and `plat` pick the tour step, device, full Arc list and
 * download platform; `y` scrolls the page by that many pixels.
 */
export type ShotParams = {
  shot: boolean;
  crest: TemplateId | null;
  mode: BackgroundMode | null;
  step: number | null;
  dev: string | null;
  open: boolean;
  plat: string | null;
  y: number;
};

function readShotParams(): ShotParams {
  const q = new URLSearchParams(location.search);
  const crest = q.get('crest');
  const mode = q.get('mode');
  return {
    shot: q.has('shot'),
    crest: isTemplateId(crest) ? crest : null,
    mode: isBackgroundMode(mode) ? mode : null,
    step: q.get('step') ? Number(q.get('step')) : null,
    dev: q.get('dev'),
    open: Boolean(q.get('open')),
    plat: q.get('plat'),
    y: Number(q.get('y') || 0),
  };
}

type HomeState = {
  /** The template the Work Space wears, and the background mode it draws in. */
  work: TemplateId;
  mode: BackgroundMode;
  setTemplate: (id: TemplateId, mode: BackgroundMode) => void;
  /** Animations are off for screenshots and reduced motion. */
  still: boolean;
  /** The URL's screenshot hooks, read once the page is running; null before. */
  params: ShotParams | null;
};

const HomeContext = createContext<HomeState | null>(null);

export function useHome() {
  const state = use(HomeContext);
  if (!state) throw new Error('useHome needs a HomeProvider');
  return state;
}

type SpaceTemplate = { id: TemplateId; mode: BackgroundMode };

/** The template each Space wears: Work wears the page's template, Personal a contrasting one. */
export function useSpaceTemplates(): Record<'work' | 'personal', SpaceTemplate> {
  const { work, mode } = useHome();
  return useMemo(
    () => ({ work: { id: work, mode }, personal: { id: work === 'lion' ? 'winter' : 'lion', mode: 'diagonal' } }),
    [work, mode],
  );
}

/**
 * Holds the homepage's template and reads its screenshot hooks after the first render, so the
 * prerendered page always starts from Winter. A different template, in its banner's
 * background, is picked on each load unless `?crest=` pins one.
 */
export function HomeProvider({ children }: { children: ReactNode }) {
  const [template, setTemplateState] = useState<{ work: TemplateId; mode: BackgroundMode }>({
    work: 'winter',
    mode: 'diagonal',
  });
  const [params, setParams] = useState<ShotParams | null>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const p = readShotParams();
    setParams(p);
    if (p.crest) {
      setTemplateState({ work: p.crest, mode: p.mode ?? 'diagonal' });
    } else {
      const pick = templateOrder[Math.floor(Math.random() * templateOrder.length)];
      setTemplateState({ work: pick, mode: bannerModes[pick] });
    }
  }, []);

  const still = Boolean(params?.shot) || reducedMotion;

  useEffect(() => {
    if (!still) return;
    const root = document.documentElement;
    root.classList.add('noanim');
    return () => root.classList.remove('noanim');
  }, [still]);

  useEffect(() => {
    if (!params?.shot) return;
    const root = document.documentElement;
    const y = params.y;
    function place() {
      root.style.scrollBehavior = 'auto';
      document.body.style.marginTop = `${-y}px`;
      scrollTo(0, 0);
    }
    place();
    window.addEventListener('load', place);
    return () => {
      window.removeEventListener('load', place);
      root.style.scrollBehavior = '';
      document.body.style.marginTop = '';
    };
  }, [params]);

  const setTemplate = useCallback((work: TemplateId, mode: BackgroundMode) => {
    setTemplateState({ work, mode });
  }, []);

  const value = useMemo(
    () => ({ ...template, setTemplate, still, params }),
    [template, setTemplate, still, params],
  );

  const [t0, , t2] = templates[template.work].colors;

  return (
    <HomeContext value={value}>
      <div style={{ '--t0': t0, '--t2': t2 } as CSSProperties}>{children}</div>
    </HomeContext>
  );
}

/** Phones: matches `max-phone:`, which `--breakpoint-phone` in app.css sets. Change both together. */
export const phoneQuery = '(max-width: 760px)';

/** Whether a media query matches; false until the page is running. */
export function useMediaQuery(query: string) {
  return useMediaQueryOrNull(query) ?? false;
}
