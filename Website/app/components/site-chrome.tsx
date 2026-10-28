import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { updateEachFrame } from '@/lib/each-frame';
import { footerLinks, isExternal, links, menuLinks, sectionLinks, type SiteLink } from '@/lib/site-links';
import { GitHubIcon } from './icons';

/** Attributes for links that leave the site. */
export const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

/** A link to a page on this site, or to another site in a new tab. */
export function SiteAnchor({ link, children, ...props }: { link: SiteLink } & Omit<ComponentProps<'a'>, 'href'>) {
  if (isExternal(link.url)) {
    return (
      <a href={link.url} {...external} {...props}>
        {children ?? link.text}
      </a>
    );
  }
  return (
    <Link to={link.url} {...props}>
      {children ?? link.text}
    </Link>
  );
}

/** The element a page's header sits over until it scrolls past; the header is light after it. */
export const heroAttribute = { 'data-site-hero': '' } as const;
const heroSelector = '[data-site-hero]';

/** The header's height in pixels; `--spacing-header` in app.css sets it. Change both together. */
export const headerHeight = 64;

/** Whether the page has scrolled at all, and whether it has scrolled past its hero. */
function useHeaderState() {
  const [state, setState] = useState({ stuck: false, light: false });

  useEffect(() => {
    const hero = document.querySelector(heroSelector);
    return updateEachFrame(() => {
      const stuck = window.scrollY > 40;
      const light = hero ? hero.getBoundingClientRect().bottom < headerHeight : true;
      setState((s) => (s.stuck === stuck && s.light === light ? s : { stuck, light }));
    }, ['scroll', 'resize']);
  }, []);

  return state;
}

/** The Links menu: closes on a click outside it, on Escape, and when a link in it is chosen. */
function LinksMenu() {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const menu = ref.current;
      if (menu?.open && !menu.contains(e.target as Node)) menu.open = false;
    }
    function onKey(e: KeyboardEvent) {
      const menu = ref.current;
      if (e.key !== 'Escape' || !menu?.open) return;
      menu.open = false;
      menu.querySelector('summary')?.focus();
    }
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const item =
    'rounded-[9px] px-3 py-2 text-sm hover:bg-white/8 group-data-light:hover:bg-ink/6';

  return (
    <details ref={ref} className="relative">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 opacity-80 select-none hover:opacity-100 in-open:opacity-100 [&::-webkit-details-marker]:hidden">
        Links
        <svg className="size-3 transition-transform in-open:rotate-180" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div
        className="absolute top-[calc(100%+14px)] right-0 grid min-w-48 rounded-[14px] bg-[rgb(18_23_30/0.94)] p-1.5 text-white shadow-[0_20px_40px_-16px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.1)] backdrop-blur-[18px] group-data-light:bg-[rgb(251_248_241/0.97)] group-data-light:text-ink group-data-light:shadow-[0_20px_40px_-16px_rgb(20_32_44/0.3),inset_0_0_0_1px_var(--color-rule)]"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a') && ref.current) ref.current.open = false;
        }}
      >
        <SiteAnchor link={links.help} className={cn(item, 'tablet:hidden')} />
        <SiteAnchor link={links.github} className={cn(item, 'tablet:hidden')} />
        {menuLinks.map((link) => (
          <SiteAnchor key={link.url} link={link} className={item} />
        ))}
      </div>
    </details>
  );
}

/**
 * The header every product page shares. It is clear over the page's dark hero, frosted once
 * the page scrolls, and light after the hero. Pages mark their hero with `heroAttribute` and
 * pull it up under the header with `-mt-header pt-header`.
 */
function SiteHeader() {
  const { stuck, light } = useHeaderState();
  const link = 'inline-flex items-center gap-1.5 opacity-80 hover:opacity-100 max-tablet:hidden';

  return (
    <>
      <a
        href="#main"
        className="absolute -top-16 left-4 z-[99] rounded-md bg-ink px-3.5 py-2.5 text-white focus:top-4"
      >
        Skip to content
      </a>
      <header
        data-light={light || undefined}
        className={cn(
          'group sticky top-0 z-50 border-b border-transparent text-white transition-[background-color,border-color,color] duration-250',
          stuck && 'border-white/8 bg-[rgb(14_19_25/0.72)] backdrop-blur-[16px] backdrop-saturate-[1.2]',
          stuck && light && 'border-rule bg-paper/88 text-ink',
        )}
      >
        <div className="wide-width flex h-header items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-serif text-[1.05rem] leading-none font-semibold tracking-[0.01em]">
            <img src="/assets/crest-logo.svg" alt="" className="size-7.5" />
            Crest
          </Link>
          <nav className="flex items-center gap-5.5 text-sm" aria-label="Site">
            {sectionLinks.map((l) => (
              <SiteAnchor key={l.url} link={l} className={link} />
            ))}
            <span className="h-4 w-px bg-current opacity-30 max-tablet:hidden" />
            <SiteAnchor link={links.help} className={link} />
            <SiteAnchor link={links.github} className={link}>
              <GitHubIcon className="size-[1em]" />
              GitHub
            </SiteAnchor>
            <LinksMenu />
            <SiteAnchor
              link={links.get}
              className="rounded-full border border-current px-4 py-1.5 hover:border-white hover:bg-white hover:text-ink group-data-light:hover:border-ink group-data-light:hover:bg-ink group-data-light:hover:text-white"
            />
          </nav>
        </div>
      </header>
    </>
  );
}

/** The footer every product page shares; a page may lead it with its own line. */
function SiteFooter({ tagline }: { tagline?: ReactNode }) {
  return (
    <footer className="bg-night-2 pt-8 pb-12 text-sm text-mist/66">
      <div className="page-width grid gap-4.5">
        {tagline && <p className="font-serif text-xl text-mist">{tagline}</p>}
        <div className="flex flex-wrap gap-x-5.5 gap-y-1.5">
          {footerLinks.map((link) => (
            <SiteAnchor key={link.url} link={link} className="text-mist/88 hover:text-white" />
          ))}
        </div>
        <p className="max-w-[62rem] [&_a]:underline [&_a]:decoration-mist/35 [&_a]:underline-offset-3">
          Free and open source under the Mozilla Public License 2.0. Not affiliated with Arc. Crest
          Studio artwork by Lorc and Delapouite from{' '}
          <a href="https://game-icons.net" {...external}>game-icons.net</a>,{' '}
          <a href="https://creativecommons.org/licenses/by/3.0/" {...external}>CC BY 3.0</a>. TestFlight,
          Reddit, and Discord are trademarks of their owners.
        </p>
      </div>
    </footer>
  );
}

/** A product page: its structured data, the shared header and footer, and the `main` the skip link targets. */
export function ProductPage({
  structuredData,
  tagline,
  className,
  children,
}: {
  structuredData: object;
  tagline?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <SiteHeader />
      <main id="main" className={className}>
        {children}
      </main>
      <SiteFooter tagline={tagline} />
    </>
  );
}
