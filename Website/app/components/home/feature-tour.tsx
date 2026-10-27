import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { useHome, useMediaQuery } from './home-state';
import { MacWindow, type WindowView } from './mac-window';
import { Segmented } from './segmented';

type TourStep = WindowView & { tab: string; caption?: string };

const steps: TourStep[] = [
  { tab: 'Crest', space: 'work', page: 'northstar', caption: 'A sidebar, Spaces, and the page.' },
  {
    tab: 'Spaces',
    space: 'personal',
    page: 'desc',
    url: { host: 'crestbrowser.com', path: '/docs/spaces-and-isolation/' },
    act: ['◈', 'Spaces'],
    desc: { kicker: 'Spaces', title: 'Each Space is its own browser.', body: ['Separate cookies, history, passwords, and extensions.'] },
  },
  {
    tab: 'Sidebar',
    space: 'work',
    page: 'desc',
    url: { host: 'crestbrowser.com', path: '/docs/organize-tabs-and-folders/' },
    act: ['▤', 'Sidebar'],
    desc: { kicker: 'Sidebar', title: 'Tabs down the side.', body: ['Pinned sites, folders, and tabs, one Space at a time.'] },
  },
  { tab: 'Split View', space: 'personal', page: 'split', group: true, caption: 'Up to four tabs side by side.' },
  {
    tab: 'Peek',
    space: 'personal',
    page: 'peek',
    url: { host: 'localhost:4321', path: '/demos/source/' },
    act: ['☀️', 'Personal Field Guide'],
    caption: 'Preview a link, then close it or keep it.',
  },
  {
    tab: 'Quick Window',
    space: 'personal',
    page: 'desc',
    url: { host: 'crestbrowser.com', path: '/docs/peek-and-quick-window/' },
    act: ['▢', 'Quick Window'],
    desc: { kicker: 'Quick Window', title: 'Links from other apps open small.', body: ['Keep it as a tab, or close it.'], quickWindow: true },
  },
  {
    tab: 'Link Routing',
    space: 'work',
    page: 'desc',
    url: { host: 'crestbrowser.com', path: '/docs/link-routing/' },
    act: ['⇢', 'Link Routing'],
    desc: {
      kicker: 'Link Routing',
      title: 'Links land in the right Space.',
      body: ['Match a URL, pick a Space.'],
      routes: [
        ['github.com', 'Contains', 'work'],
        ['docs.northstar.studio/launch', 'Exact', 'work'],
        ['allrecipes.com', 'Contains', 'personal'],
      ],
    },
  },
  { tab: 'Command palette', space: 'work', page: 'palette', caption: 'Tabs, history, and commands in one field.' },
  {
    tab: 'Developer tools',
    space: 'personal',
    page: 'localhost',
    url: { host: 'localhost:4321', path: '/demos/source/' },
    act: ['✨', 'Personal Field Guide'],
    caption: 'Viewports, Console, and Network.',
  },
];

/** A step's caption: a description page's headline and line, or the tab name and caption. */
function captionOf(step: TourStep): [string, string] {
  return step.desc ? [step.desc.title, step.desc.body[0]] : [step.tab, step.caption ?? ''];
}

const listGap = 18;

/** Phones: every step as its own window, two in view, stepping up one at a time. */
function TourList({ step }: { step: number }) {
  const firstCard = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(0);

  useLayoutEffect(() => {
    const card = firstCard.current;
    if (!card) return;
    const measure = () => setCardHeight(card.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const offset = Math.min(step, steps.length - 2);

  return (
    <div
      className="relative overflow-hidden"
      style={cardHeight ? { height: 2 * cardHeight + listGap } : undefined}
    >
      <div
        className="grid gap-[18px] transition-transform duration-600 ease-soft noanim:transition-none"
        style={{ transform: `translateY(${-offset * (cardHeight + listGap)}px)` }}
      >
        {steps.map((s, k) => {
          const [title, text] = captionOf(s);
          return (
            <div
              key={s.tab}
              ref={k === 0 ? firstCard : undefined}
              className={cn('transition-opacity duration-450 noanim:transition-none', (k < offset || k > offset + 1) && 'opacity-0')}
            >
              <MacWindow view={s} />
              <div className="h-[5.4rem] overflow-hidden px-[0.15rem] pt-[0.7rem] text-white">
                <h3 className="mb-[0.2rem] text-xl leading-[1.2] font-normal tracking-[-0.01em]">{title}</h3>
                <p className="text-[0.92rem] leading-[1.4] text-white/75">{text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The feature tour, pinned in the hero while the page scrolls through one step per screenful.
 * The window grows to its full width as the tour starts, and the tabs fade in with it.
 */
export function FeatureTour() {
  const { params, still } = useHome();
  const phone = useMediaQuery('(max-width: 760px)');
  const tourRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const tour = tourRef.current;
    const stage = stageRef.current;
    const inner = innerRef.current;
    if (!tour || !stage || !inner || !params) return;

    if (still) {
      inner.style.setProperty('--grow', params.step != null ? '1' : '0');
      setStep(params.step ?? 0);
      return;
    }

    const n = steps.length;
    function update() {
      const r = tour!.getBoundingClientRect();
      const stageHeight = stage!.offsetHeight;
      const p = Math.min(0.9999, Math.max(0, -r.top / (r.height - stageHeight)));
      inner!.style.setProperty('--grow', Math.min(1, Math.max(0, p * n)).toFixed(3));
      const available = document.documentElement.clientHeight - 64;
      const stick = `${Math.round(64 + Math.max(0, (available - stageHeight) * 0.5))}px`;
      if (stage!.style.getPropertyValue('--stick') !== stick) stage!.style.setProperty('--stick', stick);
      setStep(Math.floor(p * n));
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [params, still]);

  function goTo(i: number) {
    const tour = tourRef.current;
    const stage = stageRef.current;
    if (!tour || !stage) return;
    const total = tour.offsetHeight - stage.offsetHeight;
    const top = tour.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (i + 0.5) * (total / steps.length), behavior: still ? 'auto' : 'smooth' });
  }

  return (
    <div
      ref={tourRef}
      id="tour"
      style={{ '--n': steps.length } as CSSProperties}
      className="relative h-[calc(var(--n)*70svh+100svh)] scroll-mt-[72px] motion-reduce:h-auto"
    >
      <div ref={stageRef} className="sticky top-[var(--stick,64px)] motion-reduce:static">
        <div
          ref={innerRef}
          className="mx-auto grid w-[min(calc(min(1240px,100vw_-_2.5rem)_+_(min(1520px,100vw_-_2rem)_-_min(1240px,100vw_-_2.5rem))_*_var(--grow)),calc((100svh_-_64px_-_6.5rem)_*_1.7305))] gap-[0.9rem] [--grow:0] max-phone:gap-[0.8rem]"
        >
          <MacWindow
            view={steps[step]}
            className="max-h-[calc(100svh-64px-6rem)] animated:animate-rise max-phone:hidden"
          />
          {phone && <TourList step={step} />}
          <div aria-hidden="true" className="absolute top-1/2 right-[0.35rem] hidden -translate-y-1/2 gap-[0.45rem] max-phone:grid">
            {steps.map((s, k) => (
              <i
                key={s.tab}
                className={cn(
                  'block h-[5px] w-[5px] rounded-[3px] bg-white/35 transition-[height,background-color] duration-300',
                  k === step && 'h-[18px] bg-(--t2)',
                )}
              />
            ))}
          </div>
          <Segmented
            label="Features"
            items={steps.map((s) => s.tab)}
            selected={step}
            onSelect={goTo}
            className="text-[#f4f1ea] opacity-(--grow) transition-opacity duration-300 max-phone:hidden"
          />
        </div>
      </div>
    </div>
  );
}
