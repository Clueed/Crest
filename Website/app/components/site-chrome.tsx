import type { ReactNode } from 'react';

/** Attributes for links that leave the site. */
export const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

/** The header the privacy and support pages share. */
export function SiteHeader({ skipTo, skipLabel }: { skipTo: string; skipLabel: string }) {
  return (
    <>
      <a className="skip-link" href={`#${skipTo}`}>{skipLabel}</a>
      <header className="site-header scrolled">
        <a className="wordmark" href="/" aria-label="Crest home"><img className="brand-mark" src="/assets/crest-logo.svg" alt="" aria-hidden="true" /><span>Crest</span></a>
        <nav aria-label="Primary navigation"><a href="/#crests">Spaces</a><a href="/#more">Features</a><a href="/docs/">Help &amp; guides</a><a className="nav-cta" href="/">Product site</a></nav>
      </header>
    </>
  );
}

/** The footer the privacy and support pages share; each page brings its own line and links. */
export function SiteFooter({ tagline, children }: { tagline: string; children: ReactNode }) {
  return (
    <footer>
      <a className="wordmark" href="/"><img className="brand-mark" src="/assets/crest-logo.svg" alt="" aria-hidden="true" /><span>Crest</span></a>
      <p>{tagline}</p>
      <div>
        <a href="/">Product site</a>
        <a href="/docs/">Guides</a>
        {children}
        <a href="https://www.reddit.com/r/CrestBrowser" {...external}>Reddit</a>
        <a href="https://discord.gg/gjrM5qMB6x" {...external}>Discord</a>
        <a href="https://ko-fi.com/pauljoda/tiers" {...external}>Support open source software</a>
      </div>
    </footer>
  );
}
