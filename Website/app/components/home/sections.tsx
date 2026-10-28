import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router';
import { DiscordIcon, GitHubIcon } from '@/components/icons';
import { SiteAnchor } from '@/components/site-chrome';
import { cn } from '@/lib/cn';
import { links, type SiteLink } from '@/lib/site-links';
import { useHome } from './home-state';
import { Reveal } from './reveal';
import { spaceField, windowSize } from './templates';

/** A homepage section: generous vertical padding, and room under the header when linked to. */
export function Section({ className, ...props }: ComponentProps<'section'> & { id: string; 'data-night'?: '' }) {
  return <section className={cn('relative scroll-mt-2 py-[clamp(4.5rem,9vw,7.5rem)]', className)} {...props} />;
}

const sectionTitle = 'text-[clamp(2rem,3.8vw,2.9rem)] leading-[1.1] font-normal tracking-[-0.02em]';

/** A section's headline and lede. */
export function SectionHead({ title, lede, titleId, center }: { title: string; lede?: ReactNode; titleId?: string; center?: boolean }) {
  return (
    <Reveal className={cn('mb-[clamp(2rem,4vw,3.2rem)] grid max-w-[44rem] gap-4', center && 'mx-auto text-center')}>
      <h2 id={titleId} className={sectionTitle}>
        {title}
      </h2>
      {lede && <p className="max-w-[40rem] text-[1.12rem] leading-[1.6] text-ink-2 in-data-night:text-mist/72">{lede}</p>}
    </Reveal>
  );
}

const sources: [string, string][] = [
  ['Arc', 'Spaces, tabs, folders, colors, icons, passwords'],
  ['Zen', 'Spaces, Essentials, pinned tabs, folders, colors'],
  ['Chrome', 'Profiles, bookmarks, open tabs, passwords'],
  ['Safari', 'Bookmarks, windows, open tabs'],
  ['Firefox', 'Windows, open tabs, pinned tabs'],
];

export function ImportSection() {
  return (
    <Section id="import" className="pt-0">
      <div className="page-width">
        <SectionHead title="Bring your browser with you." lede="Import on Mac. Review each Space before anything moves." />
        <Reveal as="figure">
          <img
            src="/assets/crest-import-space-review-mac-2026.png"
            alt="Crest Setup reviewing an Arc Space beside its Crest destination before import"
            width="2350"
            height="1632"
            loading="lazy"
            decoding="async"
            className="h-auto w-full rounded-xl shadow-[0_40px_80px_-30px_rgb(10_16_26/0.5),0_0_0_1px_rgb(0_0_0/0.2)]"
          />
        </Reveal>
        <Reveal className="mt-[2.4rem] max-w-[44rem] border-t border-rule text-[0.92rem]">
          {sources.map(([name, what]) => (
            <div key={name} className="grid grid-cols-[5.5rem_1fr] gap-4 border-b border-rule py-[0.55rem] text-ink-2">
              <b className="font-semibold text-ink">{name}</b>
              <span>{what}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}

/** Feature, Mac-only, line, and the guide that covers it. */
const moreFeatures: { title: string; mac?: boolean; text: string; guide?: string }[] = [
  { title: 'Two engines', mac: true, text: 'Chromium, plus WebKit per site.', guide: '/docs/engines/' },
  { title: 'Extensions', mac: true, text: 'From the Chrome Web Store, per Space.', guide: '/docs/extension-compatibility/' },
  { title: 'Crest Passwords', text: 'In the Keychain, matched per Space.' },
  { title: 'Private Spaces', text: 'Nothing kept. Optional Face ID or Touch ID lock.' },
  { title: 'Content blocking', text: 'uBlock Origin Lite or the built-in list.' },
  { title: 'Site permissions', text: 'Remembered per site and Space.' },
  { title: 'Translation', text: 'Whole pages, on device.' },
  { title: 'Reader', text: 'On iPhone, iPad, and WebKit pages.' },
  { title: 'Media', text: 'Now Playing and Picture in Picture.' },
  { title: 'Organize', text: 'Move tabs and folders together.' },
  { title: 'Developer tools', mac: true, text: 'Viewports, Console, and Network.' },
  { title: 'Shortcuts', mac: true, text: 'Rebind any command.' },
  { title: 'Space cleanup', text: 'Archive tabs after 12 hours to 30 days.' },
  { title: 'Downloads', text: 'Pause and resume on Chromium.' },
  { title: 'Page tools', text: 'PDF, web archive, and Markdown links.' },
  { title: 'Keep Loaded', text: 'Stops a page from unloading.' },
];

export function MoreSection() {
  return (
    <Section id="more" className="pt-0">
      <div className="page-width">
        <SectionHead title="Also in Crest" />
        <Reveal className="grid grid-cols-3 gap-x-[2.4rem] gap-y-6 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
          {moreFeatures.map((f) => (
            <div key={f.title} className="border-t border-rule pt-4">
              <b className="mb-1 block font-semibold">
                {f.title}
                {f.mac && (
                  <span className="ml-[0.45rem] inline-block align-[0.12em] text-[0.68rem] font-semibold tracking-[0.06em] text-ink-3 uppercase">
                    Mac
                  </span>
                )}
              </b>
              <p className="text-[0.94rem] text-ink-2">
                {f.text}
                {f.guide && (
                  <>
                    {' '}
                    <Link to={f.guide} className="underline">
                      More
                    </Link>
                  </>
                )}
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}

type GetLink = { title: string; note: string; action: string; link: SiteLink; icon: ReactNode };

const tile = 'size-10 rounded-[10px]';
const padded = cn(tile, 'bg-white p-[5px]');
const mark = cn(tile, 'grid place-items-center');

const downloads: GetLink[] = [
  { title: 'Mac', note: 'Apple silicon', action: 'Download', link: links.macDownload, icon: <img src="/assets/crest-logo.svg" alt="" className={tile} /> },
  { title: 'iPhone and iPad', note: 'App Store', action: 'Open', link: links.appStore, icon: <img src="/assets/app-store-official.png" alt="" className={padded} /> },
  { title: 'Beta', note: 'TestFlight', action: 'Join', link: links.testFlight, icon: <img src="/assets/testflight-official.png" alt="" className={padded} /> },
];

const community: GetLink[] = [
  {
    title: 'GitHub',
    note: 'Bug reports',
    action: 'Report',
    link: links.issues,
    icon: (
      <span className={cn(mark, 'bg-mist text-ink')}>
        <GitHubIcon className="size-[22px]" />
      </span>
    ),
  },
  { title: 'Reddit', note: 'r/CrestBrowser', action: 'Visit', link: links.reddit, icon: <img src="/assets/reddit-official.png" alt="" className={padded} /> },
  {
    title: 'Discord',
    note: 'Chat and questions',
    action: 'Join',
    link: links.discord,
    icon: (
      <span className={cn(mark, 'bg-[#5865f2] text-white')}>
        <DiscordIcon className="size-[22px]" />
      </span>
    ),
  },
];

function GetList({ label, items }: { label: string; items: GetLink[] }) {
  return (
    <ul aria-label={label} className="border-t border-white/14">
      {items.map((item) => (
        <li key={item.title}>
          <SiteAnchor
            link={item.link}
            className="group grid grid-cols-[40px_1fr_auto] items-center gap-[0.9rem] border-b border-white/14 py-[0.95rem]"
          >
            {item.icon}
            <span>
              <b className="block font-semibold group-hover:underline group-hover:underline-offset-3">{item.title}</b>
              <small className="text-[0.8em] text-mist/62">{item.note}</small>
            </span>
            <span className="text-[0.88rem] text-sky">{item.action} ↗</span>
          </SiteAnchor>
        </li>
      ))}
    </ul>
  );
}

/** Downloads and community, beside a band in the page's template. */
export function GetSection() {
  const { work, mode } = useHome();

  return (
    <Section id="get" data-night="" className="overflow-hidden bg-night text-mist">
      <div
        aria-hidden="true"
        style={{ '--field': spaceField(work, mode, windowSize.width, windowSize.height) } as CSSProperties}
        className="absolute inset-y-0 -right-[4%] w-[26%] bg-(image:--field) bg-size-[100%_100%] bg-no-repeat opacity-90 [clip-path:polygon(18%_0,100%_0,100%_100%,0_100%)] max-[900px]:hidden"
      />
      <div className="relative page-width">
        <h2 className={sectionTitle}>Get Crest</h2>
        <div className="mt-[2.2rem] grid max-w-[min(54rem,70vw)] grid-cols-2 gap-x-12 gap-y-4 max-[900px]:max-w-none max-[900px]:grid-cols-1 max-[900px]:gap-8">
          <GetList label="Download" items={downloads} />
          <GetList label="Community" items={community} />
        </div>
      </div>
    </Section>
  );
}
