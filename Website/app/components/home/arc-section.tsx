import { useEffect, useState, type SyntheticEvent } from 'react';
import { cn } from '@/lib/cn';
import { useHome } from './home-state';
import { Reveal } from './reveal';
import { Section, SectionHead } from './sections';

/** What Arc called each feature, and what it is in Crest. */
const parity: [arc: string, crest: string][] = [
  ['Spaces + Profiles', 'Spaces'],
  ['Sidebar', 'Sidebar'],
  ['Favorites', 'Pinned sites'],
  ['Pinned Tabs', 'Saved tabs'],
  ['Folders', 'Saved folders'],
  ['Command Bar', 'Command palette'],
  ['Air Traffic Control', 'Link Routing'],
  ['Split View', 'Split View'],
  ['Peek', 'Peek'],
  ['Little Arc', 'Quick Window'],
  ['Auto Archive', 'Space cleanup + Archive'],
  ['Recent Tab Switcher', 'Most Recent Tab'],
  ['Custom Keyboard Shortcuts', 'Rebindable shortcuts'],
  ['Developer Mode', 'Developer tools'],
  ['Site Control Center', 'Site Controls'],
  ['Extensions', 'Extensions per Space'],
  ['Incognito', 'Private Spaces'],
  ['Space Themes', 'Crest Studio + gradients'],
  ['Arc Sync', 'iCloud sync'],
  ['Library', 'History, Archive + Downloads'],
  ['Import from Another Browser', 'Import'],
];

function Track({ rows, hidden }: { rows: typeof parity; hidden?: boolean }) {
  return (
    <div aria-hidden={hidden || undefined} className="flex gap-4 pr-4">
      {rows.map(([arc, crest]) => (
        <article
          key={arc}
          className="grid w-[220px] flex-none content-start gap-[0.35rem] rounded-2xl bg-white/4.5 px-[1.1rem] pt-[1.05rem] pb-[1.15rem] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)] max-sm:w-[200px]"
        >
          <small className="text-[0.8rem] text-mist/55">{arc}</small>
          <h3 className="text-xl leading-[1.15] font-normal tracking-[-0.01em] text-white">{crest}</h3>
        </article>
      ))}
    </div>
  );
}

/** Two belts of cards drifting in opposite directions; hovering or focusing holds them. */
function Ticker() {
  const belts = [parity.filter((_, i) => i % 2 === 0), parity.filter((_, i) => i % 2 === 1)];
  return (
    <Reveal
      aria-label="Arc features in Crest"
      className="group/ticker ml-[calc(50%-50vw)] grid w-screen gap-4 overflow-hidden pt-2 pb-6 mask-[linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
    >
      {belts.map((rows, i) => (
        <div key={i} className="overflow-hidden motion-reduce:overflow-x-auto">
          <div
            className={cn(
              'flex w-max animate-belt group-focus-within/ticker:[animation-play-state:paused] group-hover/ticker:[animation-play-state:paused] motion-reduce:animate-none noanim:animate-none',
              i === 1 && '[animation-direction:reverse] [animation-duration:130s]',
            )}
          >
            <Track rows={rows} />
            <Track rows={rows} hidden />
          </div>
        </div>
      ))}
    </Reveal>
  );
}

/** Coming from Arc: the features as a ticker, and the full list in a table. */
export function ArcSection() {
  const { params } = useHome();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (params?.open) setOpen(true);
  }, [params]);

  return (
    <Section id="arc" data-night="" className="bg-night text-mist">
      <div className="page-width">
        <SectionHead title="Coming from Arc?" lede="The features you used, some with new names." />
        <Ticker />
        <Reveal as="details" open={open} onToggle={(e: SyntheticEvent<HTMLDetailsElement>) => setOpen(e.currentTarget.open)} className="mt-10 border-t border-white/14">
          <summary className="flex cursor-pointer list-none items-center justify-between py-[1.2rem] font-semibold after:text-[1.4rem] after:font-light after:text-sky after:content-['+'] in-open:after:content-['–'] [&::-webkit-details-marker]:hidden">
            Full list
          </summary>
          <table className="w-full border-collapse text-[0.95rem]">
            <thead>
              <tr>
                {['Arc', 'Crest'].map((h) => (
                  <th key={h} className="border-b border-white/20 py-[0.6rem] text-left text-[0.76rem] font-semibold tracking-[0.08em] text-sky uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parity.map(([arc, crest]) => (
                <tr key={arc}>
                  <td className="w-1/2 border-b border-white/10 py-[0.8rem] pr-4 align-top text-mist/60">{arc}</td>
                  <td className="border-b border-white/10 py-[0.8rem] pr-4 align-top font-semibold">{crest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </Section>
  );
}
