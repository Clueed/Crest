import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { useHome } from './home-state';
import { Reveal } from './reveal';
import { Section, SectionHead } from './sections';
import { CrestArt, sidebarWidth, spaceField, templateOrder, templates, windowSize, type TemplateId } from './templates';

/** Favicon colors for a banner's pinned sites, then its tabs. */
const pinDots = ['#e9a43a', '#5b9be0', '#e2665a', '#7cc08a'];
const tabDots = ['#5b9be0', '#e9a43a', '#7cc08a', '#e2665a'];
/** Where each tab's title line ends. */
const tabLineEnds = ['22%', '22%', '34%', '28%'];

const ring =
  "ends:absolute ends:-top-3 ends:z-3 ends:h-3.5 ends:w-[9px] ends:rounded-[5px] ends:border-2 ends:border-[#3a3f47] ends:content-[''] before:left-[20%] after:right-[20%]";

/** One template's sidebar, hung as a banner: its crest, then stubs of pinned sites and tabs. */
function Banner({ id, swinging, onPick }: { id: TemplateId; swinging: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      aria-label={`Use ${templates[id].name}`}
      onClick={onPick}
      className={cn(
        'group relative block origin-top cursor-pointer p-0 drop-shadow-[0_16px_14px_rgb(20_32_44/0.2)] transition-opacity duration-300 [-webkit-tap-highlight-color:transparent] focus-visible:outline-none max-narrow:snap-start',
        ring,
      )}
    >
      <span
        style={{ '--field': spaceField(id, 'diagonal', windowSize.width, windowSize.height, { viewWidth: sidebarWidth }) } as CSSProperties}
        className={cn(
          'flex aspect-[289/860] origin-top flex-col items-center bg-(image:--field) bg-size-[100%_100%] bg-no-repeat px-[10%] pt-[18%] text-white transition-[filter] duration-200 [clip-path:polygon(0_0,100%_0,100%_100%,50%_91%,0_100%)] group-hover:brightness-108 group-focus-visible:outline-3 group-focus-visible:-outline-offset-3 group-focus-visible:outline-ink',
          swinging && 'animate-swing',
        )}
      >
        <CrestArt id={id} className="aspect-square w-[72%]" />
        <span aria-hidden="true" className="mt-[9%] grid w-[86%] grid-cols-2 gap-[7%]">
          {pinDots.map((dot) => (
            <i
              key={dot}
              style={{ '--dot': dot } as CSSProperties}
              className="grid aspect-[1.45] place-items-center rounded-[22%/32%] bg-white/10 after:aspect-square after:w-[26%] after:rounded-[30%] after:bg-(--dot) after:opacity-62 after:content-['']"
            />
          ))}
        </span>
        <span aria-hidden="true" className="mt-[11%] grid w-[86%] gap-[clamp(3px,0.45vw,6px)]">
          {tabDots.map((dot, i) => (
            <i
              key={dot}
              style={{ '--dot': dot, '--line-end': tabLineEnds[i] } as CSSProperties}
              className={cn(
                "relative flex aspect-[5.6] items-center rounded-[clamp(3px,0.4vw,5px)] pl-[9%] before:aspect-square before:h-[44%] before:rounded-[30%] before:bg-(--dot) before:opacity-62 before:content-[''] after:absolute after:top-1/2 after:right-(--line-end) after:left-[30%] after:-mt-[calc(clamp(2px,0.28vw,4px)/2)] after:h-[clamp(2px,0.28vw,4px)] after:rounded-[2px] after:bg-white/30 after:content-['']",
                i === 1 && 'bg-white/13',
              )}
            />
          ))}
        </span>
      </span>
    </button>
  );
}

function Personalize({ image, alt, label, title, text, link, linkText, reverse }: { image: string; alt: string; label: string; title: string; text: string; link: string; linkText: string; reverse?: boolean }) {
  return (
    <Reveal
      className={cn(
        'mt-[clamp(3rem,6vw,4.5rem)] grid items-center gap-[clamp(2rem,5vw,4rem)] max-phone:grid-cols-1 max-phone:gap-[1.4rem]',
        reverse ? 'grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]' : 'grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]',
      )}
    >
      <figure className={cn(reverse && 'order-2 max-phone:order-none')}>
        <a href={image} aria-label={label} className="block rounded-xl">
          <img
            src={image}
            width="2800"
            height="1800"
            alt={alt}
            loading="lazy"
            decoding="async"
            className="h-auto w-full rounded-xl shadow-[0_24px_60px_-26px_rgb(20_32_44/0.45),0_0_0_1px_rgb(20_32_44/0.08)]"
          />
        </a>
      </figure>
      <div>
        <h3 className="mb-[0.6rem] text-[clamp(1.6rem,2.8vw,2.1rem)] leading-[1.15] font-normal tracking-[-0.02em]">{title}</h3>
        <p className="mb-4 text-ink-2">{text}</p>
        <Link to={link} className="text-[0.92rem] font-semibold underline underline-offset-4">
          {linkText}
        </Link>
      </div>
    </Reveal>
  );
}

/** The sidebar is the banner: every template hung from a rod, then Crest Studio and Appearance. */
export function BannersSection() {
  const { setTemplate, still } = useHome();
  const [swinging, setSwinging] = useState<TemplateId | null>(null);

  function pick(id: TemplateId) {
    setTemplate(id, 'diagonal');
    setSwinging(null);
    if (!still) requestAnimationFrame(() => setSwinging(id));
  }

  return (
    <Section id="crests" aria-labelledby="crests-title">
      <div className="page-width">
        <SectionHead titleId="crests-title" title="The sidebar is the banner." lede="Start from a template, or make your own." />
        <Reveal className="relative mt-[clamp(2.5rem,5vw,3.5rem)] pt-4 max-narrow:pt-0">
          <div
            aria-hidden="true"
            className="absolute -inset-x-[1.5%] top-1.5 z-2 h-2 rounded-sm bg-linear-to-b from-[#4a4f57] to-[#22262c] shadow-[0_3px_6px_rgb(20_32_44/0.25)] ends:absolute ends:-top-1 ends:size-4 ends:rounded-full ends:bg-[radial-gradient(circle_at_35%_35%,#6b717a,#202429)] ends:content-[''] before:-left-2 after:-right-2 max-narrow:inset-x-1 max-narrow:top-5"
          />
          <div
            role="group"
            aria-label="Crest templates"
            className="relative grid grid-cols-9 gap-[clamp(0.6rem,1.4vw,1.15rem)] max-narrow:auto-cols-[96px] max-narrow:grid-flow-col max-narrow:grid-cols-none max-narrow:snap-x max-narrow:snap-mandatory max-narrow:scroll-px-3.5 max-narrow:gap-3.5 max-narrow:overflow-x-auto max-narrow:px-3.5 max-narrow:pt-[26px] max-narrow:pb-8 max-narrow:mask-[linear-gradient(90deg,transparent,#000_14px,#000_calc(100%-14px),transparent)] max-narrow:[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {templateOrder.map((id) => (
              <Banner key={id} id={id} swinging={swinging === id} onPick={() => pick(id)} />
            ))}
          </div>
        </Reveal>

        <Personalize
          image="/assets/crest-studio-mac.png"
          label="View Crest Studio at full size"
          alt="Crest Studio on Mac with the Personal Space’s Winter crest on its sidebar background, its colors, and the shape step beside the live sidebar"
          title="Crest Studio"
          text="Shape, artwork, trim, and colors, with a live preview."
          link="/docs/customize-spaces/"
          linkText="Customize a Space →"
        />
        <Personalize
          reverse
          image="/assets/crest-look-and-feel-mac.png"
          label="View Appearance settings at full size"
          alt="Appearance settings on Mac with window, accent, tab shape, and pin layout controls"
          title="Appearance"
          text="Sidebar side, tab shape, pins, and address colors."
          link="/docs/settings-reference/#appearance"
          linkText="Appearance settings →"
        />
      </div>
    </Section>
  );
}
