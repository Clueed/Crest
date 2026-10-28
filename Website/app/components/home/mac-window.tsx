import { memo, useLayoutEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useSpaceTemplates } from './home-state';
import { CrestArt, spaceField, windowSize } from './templates';

/*
 * A drawing of Crest's Mac window, 1329×768 points. Inside it `--spacing` is one point, so
 * `h-48` is 48 points and `text-pt-13` is 13 points at any size.
 */

type Space = 'work' | 'personal';

/** A sidebar row: its glyph and title. */
type Row = [glyph: string, title: string];

/** An address: the host, and the path drawn quieter after it. */
type Address = { host: string; path?: string };

/** A description page the window shows for a feature that has no demo page. */
type Description = {
  kicker: string;
  title: string;
  body: string[];
  /** Draw a Quick Window floating over the page. */
  quickWindow?: boolean;
  /** Link Routing rules: URL pattern, match, destination Space. */
  routes?: [pattern: string, match: string, space: Space][];
};

type PageKind = 'desc' | 'northstar' | 'fieldnotes' | 'split' | 'peek' | 'palette' | 'localhost';

/** What the window shows: whose Space, which page, and what the sidebar highlights. */
export type WindowView = {
  space: Space;
  page: PageKind;
  url?: Address;
  /** A tab the sidebar shows open below New Tab. */
  act?: Row;
  /** Highlight the Split View group's second tab. */
  group?: boolean;
  desc?: Description;
};

/* ------------------------------------------------------------------ icons */

function Glyph({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

const icons = {
  sidebar: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16" /></>,
  back: <path d="m15 6-6 6 6 6" />,
  forward: <path d="m9 6 6 6-6 6" />,
  reload: <path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" />,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  tune: <><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  archive: <><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M10 13h4" /></>,
  link: <path d="M10 14 14 10M8 12l-2 2a3 3 0 0 0 4 4l2-2M16 12l2-2a3 3 0 0 0-4-4l-2 2" />,
  window: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 9h18" /></>,
  camera: <><rect x="3" y="7" width="18" height="13" rx="2" /><circle cx="12" cy="13.5" r="3.5" /></>,
  terminal: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 9 3 3-3 3M13 15h4" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>,
};

function Folder({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="rgb(255 255 255 / 0.55)">
      <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h3.6l2 2h7.4A2.5 2.5 0 0 1 21 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z" />
    </svg>
  );
}

/** The page tools in the web page's bar. */
function PageTools() {
  return (
    <span className="ml-auto flex gap-16 opacity-80">
      {[icons.link, icons.window, icons.camera, icons.terminal, icons.globe, icons.target].map((icon, i) => (
        <Glyph key={i} className="size-14 [stroke-width:1.5]">{icon}</Glyph>
      ))}
    </span>
  );
}

function TrafficLights() {
  return (
    <span className="mr-6 flex gap-8">
      {['bg-[#ff5f57]', 'bg-[#febc2e]', 'bg-[#28c840]'].map((color) => (
        <i key={color} className={cn('size-12 rounded-full shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.2)]', color)} />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ sidebar */

/** The address both Spaces' home pages show. */
const homeUrl: Address = { host: 'data:text/html;…%2Fhtml%3E' };

/** Work mirrors the app's own capture (crest-work-mac.png); Personal is the second Space. */
const spaces: Record<Space, { name: string; tiles: string[]; folder: string; kids: Row[]; open: number; group: Row[] }> = {
  work: {
    name: 'Work',
    tiles: ['🧭', '📐', '📅', '✍️'],
    folder: 'Launch Atlas',
    kids: [['🔬', 'Audience research'], ['🚩', 'Launch plan'], ['🎨', 'Design review']],
    open: 0,
    group: [['✨', 'Monday overview'], ['🗒️', 'Launch notes']],
  },
  personal: {
    name: 'Personal',
    tiles: ['🏠', '🗺️', '☕', '📚'],
    folder: 'Weekend Plans',
    kids: [['🏕️', 'Cabin ideas'], ['🌱', 'Garden notes'], ['📖', 'Sunday reading']],
    open: -1,
    group: [['☀️', 'Personal Field Guide'], ['📓', 'Saturday Trail Note']],
  },
};

const row = 'flex h-32 flex-none items-center gap-9 overflow-hidden rounded-pt-8 px-9 text-pt-12.5 whitespace-nowrap';
const activeRow = 'bg-white/10 font-medium opacity-100 shadow-[inset_0_0_0_var(--spacing)_rgb(255_255_255/0.14)]';
const rowGlyph = 'w-16 flex-none text-center text-pt-13 not-italic';

function Sidebar({ view, onPick }: { view: WindowView; onPick: (space: Space) => void }) {
  const spaceTemplates = useSpaceTemplates();
  const s = spaces[view.space];
  const url = view.url ?? homeUrl;

  return (
    <aside className="relative flex min-w-0 flex-col px-8 pb-6">
      <div className="flex h-48 items-center gap-8 px-5">
        <TrafficLights />
        <span className="ml-auto flex gap-14 pr-4 opacity-62">
          <Glyph className="size-16">{icons.back}</Glyph>
          <Glyph className="size-16">{icons.forward}</Glyph>
          <Glyph className="size-16">{icons.reload}</Glyph>
        </span>
      </div>
      <div className="flex h-36 min-w-0 items-center gap-8 rounded-pt-8 bg-white/8 px-10 text-pt-12">
        <Glyph className="size-13 flex-none opacity-75">{icons.lock}</Glyph>
        <span className="flex-1 overflow-hidden text-pt-11.5 font-semibold text-ellipsis whitespace-nowrap">
          {url.host}
          {url.path && <small className="font-normal opacity-60">{url.path}</small>}
        </span>
        <Glyph className="size-13 flex-none opacity-75">{icons.tune}</Glyph>
      </div>
      <div className="mt-10 mb-12 grid grid-cols-4 gap-7">
        {s.tiles.map((tile) => (
          <i key={tile} className="grid h-46 place-items-center rounded-pt-9 bg-white/8 text-pt-15 not-italic">
            {tile}
          </i>
        ))}
      </div>
      <div className={cn(row, 'h-34 pl-6 font-bold')}>
        <CrestArt id={spaceTemplates[view.space].id} className="size-20" />
        {s.name}
        <span className="ml-auto tracking-[0.08em] opacity-75">···</span>
      </div>
      <div className={row}>
        <span className={rowGlyph}>
          <Folder className="block size-16" />
        </span>
        {s.folder}
        <span className="ml-auto text-pt-10.5 opacity-70">3</span>
      </div>
      {s.kids.map(([glyph, title], i) => {
        const on = !view.act && i === s.open;
        return (
          <div key={title} className={cn(row, 'pl-12 opacity-60', on && activeRow)}>
            <span className={rowGlyph}>{glyph}</span>
            {title}
            {on && <span className="ml-auto opacity-75">–</span>}
          </div>
        );
      })}
      <div className="mx-4 my-8 h-px bg-current opacity-14" />
      <div className={cn(row, 'opacity-70')}>
        <span className={rowGlyph}>+</span>New Tab
      </div>
      {view.act && (
        <div className={cn(row, activeRow)}>
          <span className={rowGlyph}>{view.act[0]}</span>
          {view.act[1]}
          <span className="ml-auto opacity-75">✕</span>
        </div>
      )}
      <div className="mt-8 rounded-pt-10 bg-white/7 pt-2 pb-3">
        <div className={cn(row, 'h-28 text-pt-10.5 font-bold')}>
          <span className={cn(rowGlyph, 'text-pt-11')}>⧉</span>Split View
          <span className="ml-auto tracking-[0.08em] opacity-75">···</span>
        </div>
        {s.group.map(([glyph, title], i) => (
          <div key={title} className={cn(row, view.group && i === 1 && activeRow)}>
            <span className={rowGlyph}>{glyph}</span>
            {title}
          </div>
        ))}
      </div>
      <div className="flex-1" />
      <div className="flex h-40 items-center gap-10 px-6">
        <Glyph className="size-15 opacity-75">{icons.sidebar}</Glyph>
        <span role="group" aria-label="Switch Space" className="ml-48 flex gap-2 rounded-pt-9 bg-white/7 p-3">
          {(['work', 'personal'] as const).map((space) => (
            <button
              key={space}
              type="button"
              aria-pressed={view.space === space}
              aria-label={`${spaces[space].name} Space`}
              onClick={() => onPick(space)}
              className="group/pick grid h-30 w-38 cursor-pointer place-items-center rounded-pt-7 p-0 transition-colors duration-200 focus-visible:outline-[calc(2*var(--spacing))] focus-visible:outline-offset-1 focus-visible:outline-white aria-pressed:bg-white/18 aria-pressed:shadow-[inset_0_0_0_var(--spacing)_rgb(255_255_255/0.12)]"
            >
              <CrestArt
                id={spaceTemplates[space].id}
                className="size-24 opacity-72 transition-opacity duration-200 group-hover/pick:opacity-100 group-aria-pressed/pick:opacity-100"
              />
            </button>
          ))}
        </span>
        <span className="relative ml-auto grid">
          <Glyph className="size-15 opacity-75">{icons.archive}</Glyph>
          <b className="absolute -top-7 -right-7 grid h-12 min-w-12 place-items-center rounded-full bg-[#e9edf2] text-pt-8 text-[#1e2833]">
            2
          </b>
        </span>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ pages */

const northstar = '[--pa:#3b5f94] [--pb:#c99a2e] [--pbg:#f2eee6] [--pink:#172238] [--pmute:#58627a]';
const fieldnotes = '[--pa:#6f8f6b] [--pb:#d9663f] [--pbg:#eef2e8] [--pink:#20372d] [--pmute:#5a6b60]';

/** The web page beside the sidebar, inset like the app's content area. */
function WebPage({ theme, className, children }: { theme?: string; className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'relative m-8 ml-0 min-w-0 overflow-hidden rounded-pt-13 bg-(--pbg) text-(--pink) shadow-[0_0_0_var(--spacing)_rgb(0_0_0/0.2)]',
        theme,
        className,
      )}
    >
      {children}
    </div>
  );
}

const kicker = 'text-pt-9.5 font-extrabold tracking-[0.2em] uppercase';

/** A demo site's opening: kicker, headline, and an optional aside. */
function Demo({ kick, title, sub, titleClassName, children }: { kick: string; title: string; sub?: string; titleClassName?: string; children?: ReactNode }) {
  return (
    <div className="absolute inset-0 px-66 pt-64">
      <div className={kicker}>{kick}</div>
      <h3 className={cn('mt-66 max-w-[10ch] font-serif text-pt-74 leading-[0.9] font-semibold tracking-[-0.055em] text-(--pink)', titleClassName)}>
        {title}
      </h3>
      {sub && (
        <p className="absolute top-250 right-70 w-320 text-pt-15 leading-normal text-(--pmute) @max-[640px]:hidden">{sub}</p>
      )}
      {children}
    </div>
  );
}

/** Four numbered cards under a two-color rule; the `on` card is filled. */
function Cards({ cards, on }: { cards: [title: string, text: string][]; on: number }) {
  return (
    <div className="relative mt-64 grid grid-cols-4 border border-black/14 before:absolute before:-inset-x-px before:-top-8 before:h-8 before:bg-[linear-gradient(90deg,var(--pa)_0_56%,var(--pb)_56%)] before:content-['']">
      {cards.map(([title, text], i) => (
        <div
          key={title}
          className={cn('min-h-160 border-l border-black/14 px-20 pt-24 pb-30 first:border-l-0', i === on && 'bg-(--pa) text-white')}
        >
          <small className="mb-52 block text-pt-8.5 tracking-[0.14em] opacity-85">{String(i + 1).padStart(2, '0')}</small>
          <b className="mb-10 block font-serif text-pt-24 leading-none font-semibold tracking-[-0.02em]">{title}</b>
          <span className="text-pt-10.5 opacity-78">{text}</span>
        </div>
      ))}
    </div>
  );
}

const northstarCards: [string, string][] = [
  ['Today', 'Three decisions, one clear priority'],
  ['Atlas', 'Research is ready for review'],
  ['Launch', 'Milestone check-in at 2:30'],
  ['Notes', 'Seven ideas worth keeping'],
];

/** Padding, headline and text classes for each place a page body is drawn. */
const bodySizes = {
  page: { pad: 'px-110 py-60', title: 'mt-40 mb-20 max-w-[11ch] text-pt-64', text: 'text-pt-15' },
  peek: { pad: 'px-64 py-40', title: 'mt-28 mb-16 max-w-[12ch] text-pt-56', text: 'text-pt-15' },
  quick: { pad: 'px-50 py-44', title: 'mt-34 mb-18 max-w-[11ch] text-pt-52', text: 'text-pt-14' },
};

/** A page's body text, sized for where it is drawn. */
function PageBody({ size, kick, title, text, className, children }: { size: keyof typeof bodySizes; kick: string; title: string; text: string; className?: string; children?: ReactNode }) {
  const sized = bodySizes[size];
  return (
    <div className={cn(sized.pad, className)}>
      <div className={cn(kicker, 'tracking-[0.17em]')}>{kick}</div>
      {/* `leading-*` follows the `text-pt-*` size, or the merge drops it. */}
      <h4 className={cn('font-serif font-semibold tracking-[-0.05em]', sized.title, 'leading-[0.92]')}>{title}</h4>
      <p className={cn('max-w-[34em] text-[#56675e]', sized.text, 'leading-normal')}>{text}</p>
      {children}
    </div>
  );
}

/** The striped bar over a page opened from localhost. */
function LocalBar({ url, className }: { url: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex h-40 items-center gap-10 bg-[repeating-linear-gradient(135deg,#2c3037_0_calc(6*var(--spacing)),#33373f_calc(6*var(--spacing))_calc(12*var(--spacing)))] px-16 font-mono text-pt-12 leading-none text-[#dfe3ea]',
        className,
      )}
    >
      <span className="grid size-12 place-items-center rounded-full border-[1.4px] border-current font-sans text-pt-8 leading-none font-bold">i</span>
      <span>{url}</span>
      <PageTools />
    </div>
  );
}

function PeekPill() {
  return (
    <span className="mt-30 inline-block rounded-full bg-[#1c3b2f] px-20 py-13 text-pt-13 font-semibold text-white">
      Peek at the trail note →
    </span>
  );
}

/** A Quick Window, 720×460 points; inside it `--spacing` is one of its points. */
function QuickWindow() {
  const personal = useSpaceTemplates().personal;

  return (
    <div className="absolute top-120 right-44 w-[48%] @container @max-[720px]:hidden">
      <div
        style={{ '--field': spaceField(personal.id, 'diagonal', 720, 460) } as CSSProperties}
        className="relative aspect-[720/460] w-full overflow-hidden rounded-pt-12 bg-[#3c0e1a] bg-(image:--field) bg-size-[100%_100%] bg-no-repeat font-sans text-pt-13 text-white shadow-[0_calc(30*var(--spacing))_calc(60*var(--spacing))_calc(-20*var(--spacing))_rgb(0_0_0/0.55),0_0_0_1px_rgb(0_0_0/0.3)] [--spacing:calc(100cqw/720)]"
      >
        <div className="relative flex h-56 items-center gap-10 px-14">
          <TrafficLights />
          <span className="flex h-34 items-center gap-7 rounded-pt-8 bg-white/10 pr-12 pl-9 text-pt-12.5 font-semibold">
            <CrestArt id={personal.id} className="size-18" />
            Personal
          </span>
          <span className="flex h-34 flex-1 items-center gap-10 overflow-hidden rounded-pt-8 bg-white/8 px-12 text-pt-12 font-semibold whitespace-nowrap">
            <Glyph className="size-13 flex-none opacity-75">{icons.lock}</Glyph>
            localhost:4321/demos/trail/
          </span>
          <span className="flex h-34 items-center gap-8 rounded-pt-8 bg-white/12 px-12 text-pt-12.5 font-semibold whitespace-nowrap">
            Open in Personal ⌄
          </span>
        </div>
        <div className={cn('absolute inset-x-10 top-64 bottom-10 overflow-hidden rounded-pt-12 bg-(--pbg) text-(--pink)', fieldnotes)}>
          <PageBody size="quick" {...trailNote} text="Opened from another app, in the Personal Space." />
        </div>
      </div>
    </div>
  );
}

const routeRow =
  'grid grid-cols-[1fr_auto_calc(120*var(--spacing))] items-center gap-16 border-t border-black/10 px-16 py-10 text-pt-12.5';

/** A page that describes a feature, with Link Routing's rules or a Quick Window when it has them. */
function DescriptionPage({ desc }: { desc: Description }) {
  const spaceTemplates = useSpaceTemplates();
  const float = desc.quickWindow;

  return (
    <WebPage theme={northstar}>
      <div
        className={cn(
          'absolute inset-0 grid content-start gap-48 px-76 pt-60 @max-[720px]:grid-cols-1 @max-[720px]:px-50 @max-[720px]:pt-40',
          float ? 'grid-cols-2' : 'grid-cols-[1.1fr_0.9fr]',
        )}
      >
        <div className={cn(kicker, 'col-span-full text-(--pmute)')}>{desc.kicker}</div>
        <h3
          className={cn(
            'mt-36 max-w-[12ch] font-serif font-semibold tracking-[-0.045em] text-(--pink)',
            float ? 'col-start-1 text-pt-50 @max-[720px]:col-auto' : 'text-pt-58',
            'leading-[0.94]',
          )}
        >
          {desc.title}
        </h3>
        <div
          className={cn(
            'grid gap-14 self-start text-(--pmute)',
            float ? 'col-start-1 mt-26 text-pt-14.5 @max-[720px]:col-auto' : 'mt-44 text-pt-15.5',
            'leading-normal',
          )}
        >
          {desc.body.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>
        {desc.routes && (
          <div className="col-span-full mt-34 border border-black/14 bg-white/50">
            <div className={cn(routeRow, 'border-t-0 text-pt-10 font-bold tracking-[0.12em] text-(--pmute) uppercase')}>
              <span>URL pattern</span>
              <span>Match</span>
              <span>Space</span>
            </div>
            {desc.routes.map(([pattern, match, space]) => (
              <div key={pattern} className={routeRow}>
                <code className="font-mono text-pt-12">{pattern}</code>
                <em className="rounded-full border border-black/20 px-8 py-2 text-pt-9.5 tracking-[0.06em] not-italic uppercase">{match}</em>
                <span className="inline-flex items-center gap-6 font-semibold">
                  <CrestArt id={spaceTemplates[space].id} className="size-16" />
                  {spaces[space].name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      {float && <QuickWindow />}
    </WebPage>
  );
}

const northstarIntro = { kick: 'Northstar Studio · Audience research', title: 'Make space for the work that matters.' };
const trailNote = { kick: 'Field note · Quick look', title: 'The trail is clear after noon.', text: 'Saturday · 64° · Pack lunch and the green thermos.' };
const fieldGuide = {
  kick: 'Weekend plans · Field guide',
  title: 'Follow a thought without losing your place.',
  text: 'Open the trail note in Peek, decide if it deserves a tab, then come back to where you were.',
};

function Page({ view, peekHidden }: { view: WindowView; peekHidden: boolean }) {
  const spaceTemplates = useSpaceTemplates();

  switch (view.page) {
    case 'desc':
      return <DescriptionPage desc={view.desc!} />;
    case 'northstar':
      return (
        <WebPage theme={northstar}>
          <Demo
            {...northstarIntro}
            sub="A calm command center for launches, decisions, and the people moving them forward."
          >
            <Cards cards={northstarCards} on={1} />
          </Demo>
        </WebPage>
      );
    case 'fieldnotes':
      return (
        <WebPage theme={fieldnotes}>
          <Demo
            kick="Field notes · A slower Saturday"
            title="A slower Saturday starts here."
            sub="Plans for good food, open roads, a little dirt under your nails, and time to read."
          >
            <Cards
              on={0}
              cards={[
                ['Weekend', 'Market, trail, then nowhere to be'],
                ['Trips', 'Cabin map and quiet roads'],
                ['Garden', 'What to plant before the rain'],
                ['Reading', 'Four essays for Sunday morning'],
              ]}
            />
          </Demo>
        </WebPage>
      );
    case 'split':
      return (
        <div className="relative m-8 ml-0 grid min-w-0 grid-cols-2 gap-8">
          {[
            { note: fieldGuide, focus: false },
            { note: trailNote, focus: true },
          ].map(({ note, focus }) => (
            <div
              key={note.title}
              className={cn(
                'relative overflow-hidden rounded-pt-13 bg-(--pbg) text-(--pink)',
                fieldnotes,
                focus
                  ? 'shadow-[0_0_0_calc(2*var(--spacing))_rgb(255_255_255/0.85),0_0_0_calc(3.5*var(--spacing))_rgb(0_0_0/0.12)]'
                  : 'shadow-[0_0_0_var(--spacing)_rgb(0_0_0/0.18)]',
              )}
            >
              <div className="absolute inset-0 px-40 pt-46">
                <div className={kicker}>{note.kick}</div>
                <h3 className="mt-56 max-w-[12ch] font-serif text-pt-46 leading-[0.9] font-semibold tracking-[-0.055em]">{note.title}</h3>
                <p className="mt-22 max-w-[34em] text-pt-14 leading-normal text-[#56675e]">{note.text}</p>
                {!focus && <PeekPill />}
              </div>
            </div>
          ))}
        </div>
      );
    case 'peek':
      return (
        <WebPage theme={fieldnotes}>
          <Demo kick={fieldGuide.kick} title={fieldGuide.title} titleClassName="max-w-[9ch]" />
          <div className="absolute inset-0 bg-[rgb(30_38_50/0.42)]" />
          <div className="absolute top-1/2 left-1/2 grid h-[calc(80%+58*var(--spacing))] w-4/5 -translate-1/2 grid-rows-[calc(48*var(--spacing))_minmax(0,1fr)] gap-10">
            <div className="flex gap-10 justify-self-end">
              {[
                { label: '✕  Close', primary: false },
                { label: 'Open In… ⌄', primary: true },
              ].map(({ label, primary }) => (
                <span
                  key={label}
                  className={cn(
                    'flex h-48 w-206 items-center justify-center gap-8 rounded-full px-16 text-pt-13 font-semibold text-white shadow-[0_calc(6*var(--spacing))_calc(16*var(--spacing))_rgb(0_0_0/0.3)]',
                    primary ? 'bg-[#1a2438]' : 'bg-[#5b6472]',
                  )}
                >
                  {primary && <CrestArt id={spaceTemplates[view.space].id} className="size-18" />}
                  {label}
                </span>
              ))}
            </div>
            <div
              className={cn(
                'relative min-h-0 overflow-hidden rounded-pt-15 bg-(--pbg) text-(--pink) shadow-[0_calc(14*var(--spacing))_calc(28*var(--spacing))_rgb(0_0_0/0.34),0_0_0_var(--spacing)_rgb(0_0_0/0.16)] transition-[translate] duration-550 ease-soft',
                peekHidden && 'animated:translate-y-[105%]',
              )}
            >
              <LocalBar url="http://localhost:4321/demos/trail/" />
              <PageBody size="peek" {...trailNote} />
            </div>
          </div>
        </WebPage>
      );
    case 'palette':
      return (
        <WebPage theme={northstar}>
          <Demo {...northstarIntro}>
            <Cards cards={northstarCards} on={1} />
          </Demo>
          <div className="absolute inset-0 bg-[rgb(150_146_136/0.6)]" />
          <CommandPalette />
        </WebPage>
      );
    case 'localhost':
      return (
        <WebPage theme={fieldnotes}>
          <LocalBar url="http://localhost:4321/demos/source/" className="absolute inset-x-0 top-0" />
          <PageBody size="page" {...fieldGuide} className="absolute inset-x-0 top-40 bottom-0 px-80 py-64">
            <PeekPill />
          </PageBody>
        </WebPage>
      );
  }
}

/** The command palette, in Liquid Glass, over the page. */
function CommandPalette() {
  const rows = [...spaces.work.kids, spaces.work.group[0]];
  const section = 'px-20 pt-14 pb-6 text-pt-10.5 font-semibold text-white/55';
  const item = 'mx-12 mb-8 grid grid-cols-[calc(30*var(--spacing))_1fr_auto] items-center gap-12 rounded-pt-10 bg-white/6 px-12 py-10';
  const action = 'flex items-center gap-8 text-pt-10.5 whitespace-nowrap text-white/62';

  return (
    <div className="absolute top-150 left-52 h-470 w-700 overflow-hidden rounded-pt-18 bg-[linear-gradient(180deg,rgb(74_78_86/0.86),rgb(52_56_64/0.9))] text-[#e9eaee] shadow-[0_calc(40*var(--spacing))_calc(90*var(--spacing))_calc(-20*var(--spacing))_rgb(0_0_0/0.55),inset_0_0_0_1px_rgb(255_255_255/0.16),inset_0_1px_0_rgb(255_255_255/0.22)] backdrop-blur-[calc(30*var(--spacing))] backdrop-saturate-120">
      <div className="flex h-62 items-center gap-12 border-b border-white/10 px-22 text-pt-17 text-white/72">
        <Glyph className="size-17 stroke-white/70 [stroke-width:2]">{icons.search}</Glyph>
        <span className="relative flex-1 before:absolute before:-top-2 before:-left-2 before:h-22 before:w-[1.5px] before:animate-blink before:bg-white before:content-['']">
          Search or Enter URL…
        </span>
      </div>
      <div className={section}>Open Tabs</div>
      {rows.map(([glyph, title], i) => (
        <div
          key={title}
          className={cn(item, i === 0 && 'bg-[rgb(74_104_150/0.62)] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.14)]')}
        >
          <i className="text-center text-pt-17 not-italic">{glyph}</i>
          <div>
            <b className="block text-pt-13.5 font-semibold text-white">{title}</b>
            <small className="block max-w-480 overflow-hidden text-pt-10 text-ellipsis whitespace-nowrap text-white/55">
              data:text/html;charset=utf-8,%3C%21doctype%20html%3E%3Chtml%3E…
            </small>
          </div>
          <span className={action}>Switch to Tab →</span>
        </div>
      ))}
      <div className={section}>Actions</div>
      <div className={item}>
        <i className="text-center text-pt-17 not-italic">▢</i>
        <div>
          <b className="block text-pt-13.5 font-semibold text-white">New Window</b>
        </div>
        <span className={action}>
          <kbd className="font-mono text-pt-10 opacity-80">⌘N</kbd> →
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ window */

/**
 * The Mac window drawing. Picking the other Space in its sidebar switches the window to that
 * Space's home page until the view changes. Peek slides its page up each time it is shown.
 */
export const MacWindow = memo(function MacWindow({ view, className }: { view: WindowView; className?: string }) {
  const spaceTemplates = useSpaceTemplates();
  const [picked, setPicked] = useState<{ over: WindowView; view: WindowView } | null>(null);
  const [peekHidden, setPeekHidden] = useState(view.page === 'peek');

  // A pick lasts until the view changes, even if the view later comes back.
  if (picked && picked.over !== view) setPicked(null);
  const shown = picked?.over === view ? picked.view : view;

  useLayoutEffect(() => {
    if (shown.page !== 'peek') return;
    setPeekHidden(true);
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setPeekHidden(false));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [shown]);

  function pick(space: Space) {
    if (space === shown.space) return;
    setPicked({
      over: view,
      view:
        space === 'work'
          ? { space: 'work', page: 'northstar' }
          : { space: 'personal', page: 'fieldnotes', act: ['☀️', 'A slower Saturday'] },
    });
  }

  const template = spaceTemplates[shown.space];

  return (
    <div className={cn('relative mx-auto w-full @container', className)}>
      <div
        style={{ '--field': spaceField(template.id, template.mode, windowSize.width, windowSize.height) } as CSSProperties}
        className="relative grid aspect-[1329/768] w-full grid-cols-[calc(289*var(--spacing))_1fr] overflow-hidden rounded-pt-13 bg-[#1e2833] bg-(image:--field) bg-size-[100%_100%] bg-no-repeat font-sans text-pt-13 leading-[1.25] text-white shadow-[0_calc(40*var(--spacing))_calc(90*var(--spacing))_calc(-24*var(--spacing))_rgb(0_0_0/0.6),0_0_0_var(--spacing)_rgb(0_0_0/0.4),inset_0_0_0_calc(0.5*var(--spacing))_rgb(255_255_255/0.14)] [--spacing:calc(100cqw/1329)]"
      >
        <Sidebar view={shown} onPick={pick} />
        <Page view={shown} peekHidden={peekHidden} />
      </div>
    </div>
  );
});
