import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { heroAttribute } from '@/components/site-chrome';
import { GitHubIcon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { links } from '@/lib/site-links';
import { FeatureTour } from './feature-tour';
import { bannerModes, useHome } from './home-state';
import { backgroundModes, CrestArt, spaceField, templateOrder, templates, type TemplateId } from './templates';

/** Where each floating banner hangs: x and y as percentages of the hero, scale, tilt, bob period. */
const chipPlacement: Record<TemplateId, [x: number, y: number, scale: number, tilt: number, period: number]> = {
  winter: [9, 20, 1, -7, 7],
  lion: [18, 56, 0.86, 6, 8],
  storm: [5, 80, 0.9, -4, 6.5],
  vigil: [25, 90, 0.7, 7, 9],
  dragon: [91, 18, 0.96, 6, 7.5],
  meadow: [82, 48, 0.8, -5, 8.5],
  iron: [95, 76, 0.86, 4, 6],
  river: [76, 88, 0.72, -7, 9.5],
  sun: [72, 9, 0.66, 8, 7],
};

/** Banners that step off the page as the hero narrows. */
const chipNarrowing: Partial<Record<TemplateId, string>> = {
  sun: 'max-[1180px]:hidden',
  vigil: 'max-[1180px]:hidden',
  meadow: 'max-tablet:hidden',
  river: 'max-tablet:hidden',
};

/** On phones the first three banners hang in a row, fanned out. */
const phoneFan = ['max-phone:[--tilt:-7deg] max-phone:translate-y-2', 'max-phone:[--tilt:0deg] max-phone:-translate-y-2.5', 'max-phone:[--tilt:7deg] max-phone:translate-y-2'];

const clip = '[clip-path:polygon(0_0,100%_0,100%_100%,50%_88%,0_100%)]';
const knob = "before:absolute before:-top-0.5 before:-left-[5px] before:size-2.5 before:rounded-full before:bg-[radial-gradient(circle_at_35%_35%,#f2f4f6,#757c85)] before:content-[''] after:absolute after:-top-0.5 after:-right-[5px] after:size-2.5 after:rounded-full after:bg-[radial-gradient(circle_at_35%_35%,#f2f4f6,#757c85)] after:content-['']";

/** The hero's background: two layers, so a new template fades in over the last. */
function HeroBackground() {
  const { work, mode } = useHome();
  const field = spaceField(work, mode, 1600, 1000, { fit: 'xMidYMid slice' });
  const [layers, setLayers] = useState<{ fields: [string, string]; on: 0 | 1 }>({ fields: [field, ''], on: 0 });

  useEffect(() => {
    setLayers((l) => {
      if (l.fields[l.on] === field) return l;
      const next = (1 - l.on) as 0 | 1;
      const fields: [string, string] = [...l.fields];
      fields[next] = field;
      return { fields, on: next };
    });
  }, [field]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-1 overflow-clip">
      <div className="sticky top-0 h-lvh after:absolute after:inset-0 after:bg-[radial-gradient(56%_420px_at_50%_300px,rgb(8_10_14/0.6),rgb(8_10_14/0.28)_100%),linear-gradient(180deg,rgb(8_10_14/0.42),rgb(8_10_14/0.2)_40%,rgb(8_10_14/0.5))] after:content-['']">
        {layers.fields.map((f, i) => (
          <i
            key={i}
            style={{ '--field': f } as CSSProperties}
            className={cn(
              'absolute inset-0 bg-(image:--field) bg-cover bg-center bg-no-repeat opacity-0 transition-opacity duration-800',
              i === layers.on && 'opacity-100',
            )}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * The template banners floating around the headline. Picking one dresses the page in it. A
 * banner never covers the hero's words or hangs past the hero onto the window below: one that
 * would at this width stays off the page.
 */
function TemplateChips({ heroHead }: { heroHead: RefObject<HTMLDivElement | null> }) {
  const { work, mode, setTemplate } = useHome();
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [crowded, setCrowded] = useState<TemplateId[]>([]);

  useEffect(() => {
    const head = heroHead.current;
    if (!head) return;
    const phone = matchMedia('(max-width: 760px)');

    /** The lines the words fill, not the full-width blocks that centre them. */
    function wordBoxes() {
      const boxes: DOMRect[] = [];
      head!.querySelectorAll('[data-hero-words]').forEach((e) => {
        const range = document.createRange();
        range.selectNodeContents(e);
        boxes.push(...range.getClientRects());
      });
      head!.querySelectorAll('[data-hero-button]').forEach((e) => boxes.push(e.getBoundingClientRect()));
      return boxes.filter((b) => b.width && b.height);
    }

    function clearWords() {
      if (phone.matches) return setCrowded([]);
      const chips = chipRefs.current;
      // A banner already set aside is measured where it would hang.
      const setAside = chips.filter((c) => c?.classList.contains('hidden'));
      setAside.forEach((c) => (c!.style.display = 'block'));
      const m = 14;
      const floor = head!.getBoundingClientRect().bottom;
      const words = wordBoxes();
      const next = templateOrder.filter((id, i) => {
        const chip = chips[i];
        if (!chip) return false;
        const r = chip.getBoundingClientRect();
        if (!r.width) return false;
        return r.bottom > floor || words.some((w) => r.left < w.right + m && r.right > w.left - m && r.top < w.bottom + m && r.bottom > w.top - m);
      });
      setAside.forEach((c) => (c!.style.display = ''));
      setCrowded((prev) => (prev.join() === next.join() ? prev : next));
    }

    clearWords();
    window.addEventListener('resize', clearWords);
    window.addEventListener('load', clearWords);
    document.fonts?.ready.then(clearWords);
    return () => {
      window.removeEventListener('resize', clearWords);
      window.removeEventListener('load', clearWords);
    };
  }, [heroHead]);

  return (
    <div
      id="chips"
      role="group"
      aria-label="Crest templates. Pick one to dress the Work Space below."
      className="absolute inset-0 z-1 max-phone:relative max-phone:inset-auto max-phone:mx-auto max-phone:mb-[2.2rem] max-phone:flex max-phone:h-[150px] max-phone:justify-center max-phone:gap-[34px]"
    >
      {templateOrder.map((id, i) => {
        const [x, y, scale, tilt, period] = chipPlacement[id];
        const chipMode = bannerModes[id];
        return (
          <button
            key={id}
            ref={(el) => {
              chipRefs.current[i] = el;
            }}
            type="button"
            aria-pressed={work === id && mode === chipMode}
            aria-label={`${templates[id].name}, ${backgroundModes[chipMode]} background`}
            onClick={() => setTemplate(id, chipMode)}
            style={
              {
                '--chip-x': `${x}%`,
                '--chip-y': `${y}%`,
                '--chip-scale': scale,
                '--tilt': `${tilt}deg`,
                '--bob-duration': `${period}s`,
                '--bob-delay': `-${(i * 1.3).toFixed(1)}s`,
              } as CSSProperties
            }
            className={cn(
              'group absolute top-(--chip-y) left-(--chip-x) -mt-[76px] -ml-[42px] h-[152px] w-[84px] cursor-pointer border-0 bg-transparent p-0 [-webkit-tap-highlight-color:transparent] [scale:var(--chip-scale)] focus-visible:outline-none',
              'max-[1180px]:[scale:0.84] max-tablet:[scale:0.72] max-phone:relative max-phone:inset-auto max-phone:m-0 max-phone:flex-none max-phone:[scale:none]',
              chipNarrowing[id],
              i > 2 && 'max-phone:hidden',
              crowded.includes(id) && 'hidden',
            )}
          >
            <span
              className={cn(
                'absolute inset-0 block origin-top drop-shadow-[0_20px_18px_rgb(0_0_0/0.5)] transition-[filter] duration-250 [transform:rotate(var(--tilt))] group-hover:brightness-108 group-hover:drop-shadow-[0_24px_20px_rgb(0_0_0/0.6)] animated:animate-bob',
                phoneFan[i],
              )}
            >
              <span
                className={cn(
                  'absolute -inset-x-[2.5px] top-0.5 -bottom-1 bg-white opacity-0 transition-opacity duration-250 group-focus-visible:opacity-100 group-aria-pressed:opacity-90',
                  clip,
                )}
              />
              <span
                style={{ '--field': spaceField(id, chipMode, 84, 149) } as CSSProperties}
                className={cn(
                  'absolute inset-x-0 top-[3px] bottom-0 flex flex-col items-center bg-(image:--field) bg-size-[100%_100%] bg-no-repeat pt-3.5',
                  clip,
                )}
              >
                <CrestArt id={id} className="size-[62px]" />
              </span>
              <span className={cn('absolute -inset-x-2 top-0 z-2 h-1.5 rounded-[3px] bg-linear-to-b from-[#d9dde2] to-[#7b828b]', knob)} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** The device the visitor is on picks which download leads. `?plat=` pins it. */
function usePlatform() {
  const { params } = useHome();
  const [platform, setPlatform] = useState<'mac' | 'ios'>('mac');

  useEffect(() => {
    if (!params) return;
    function detect() {
      if (params?.plat === 'ios' || params?.plat === 'mac') return setPlatform(params.plat);
      const ua = navigator.userAgent || '';
      const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) || innerWidth < 760;
      setPlatform(ios ? 'ios' : 'mac');
    }
    detect();
    window.addEventListener('resize', detect);
    return () => window.removeEventListener('resize', detect);
  }, [params]);

  return platform;
}

const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

function Downloads() {
  const platform = usePlatform();
  const mac = (
    <a key="mac" data-hero-button href={links.macDownload.url} {...external} className={button}>
      <img src="/assets/crest-logo.svg" alt="" className="size-7.5" />
      <span>
        <small className={buttonNote}>Apple silicon Mac</small>
        <b className="block leading-[1.15]">Download for Mac</b>
      </span>
    </a>
  );
  const ios = (
    <a key="ios" data-hero-button href={links.appStore.url} {...external} className={button}>
      <img src="/assets/app-store-official.png" alt="" className="size-7.5" />
      <span>
        <small className={buttonNote}>App Store</small>
        <b className="block leading-[1.15]">Get it for iPhone &amp; iPad</b>
      </span>
    </a>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      {platform === 'mac' ? mac : ios}
      <div className="flex flex-wrap justify-center gap-[0.55rem]">
        {platform === 'mac' ? (
          <a data-hero-button href={links.appStore.url} {...external} className={secondary}>
            <img src="/assets/app-store-official.png" alt="" className="size-5 rounded-[5px]" />
            iPhone &amp; iPad
          </a>
        ) : (
          <a data-hero-button href={links.macDownload.url} {...external} className={secondary}>
            <img src="/assets/crest-logo.svg" alt="" className="size-5 rounded-[5px]" />
            Download for Mac
          </a>
        )}
        <a data-hero-button href={links.github.url} {...external} className={secondary}>
          <GitHubIcon className="size-4.5" />
          Source on GitHub
        </a>
      </div>
    </div>
  );
}

const button =
  'inline-flex min-h-14 items-center gap-[0.7rem] rounded-[14px] bg-paper py-[0.7rem] pr-6 pl-4 font-semibold whitespace-nowrap text-ink shadow-[0_18px_40px_-18px_rgb(0_0_0/0.6)] transition-[translate,background-color] duration-150 hover:-translate-y-px hover:bg-white';
const buttonNote = 'block text-[0.72rem] leading-[1.1] font-medium opacity-70';
const secondary =
  'inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 py-2 pr-[0.9rem] pl-[0.65rem] text-[0.86rem] font-medium text-white transition-colors duration-150 hover:bg-white/12';

/** The dark opening of the homepage: template banners around the headline, then the feature tour. */
export function Hero() {
  const heroHead = useRef<HTMLDivElement>(null);

  return (
    <section
      id="top"
      {...heroAttribute}
      className="relative isolate -mt-16 bg-[color-mix(in_srgb,var(--t0)_74%,#000)] pt-16 pb-[150px] text-white transition-[background-color] duration-600"
    >
      <HeroBackground />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-1 h-30 bg-linear-to-b from-transparent to-paper" />
      <div
        ref={heroHead}
        className="relative mx-auto grid min-h-[clamp(520px,64vh,620px)] w-[min(1240px,calc(100%-2.5rem))] place-items-center pt-10 pb-4 max-phone:block max-phone:min-h-0 max-phone:pt-6"
      >
        <TemplateChips heroHead={heroHead} />
        <div className="relative z-2 grid justify-items-center text-center">
          <h1 data-hero-words className="mb-[1.2rem] max-w-[13ch] text-[clamp(2.9rem,6.6vw,5.4rem)] leading-none font-normal tracking-[-0.03em]">
            The browser for life after Arc.
          </h1>
          <p data-hero-words className="mx-auto mb-8 max-w-[36rem] text-[1.18rem] leading-[1.6] text-balance text-white/78">
            Spaces, a sidebar, Peek, and Split&nbsp;View. Native on Mac, iPad, and&nbsp;iPhone.
          </p>
          <Downloads />
          <p data-hero-words className="mt-[1.1rem] text-[0.85rem] text-white/50">
            Early access. Security not independently audited. MPL 2.0. Not affiliated with Arc.
          </p>
        </div>
      </div>
      <FeatureTour />
    </section>
  );
}
