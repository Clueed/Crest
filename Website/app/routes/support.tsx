import type { Route } from './+types/support';
import type { PageHandle } from '@/root';
import { SiteFooter, SiteHeader, external } from '@/components/site-chrome';
import { productPageMeta, siteIcons, webPageStructuredData } from '@/lib/page-meta';
import siteStylesheet from '@/styles/site.css?url';

export const handle: PageHandle = { bodyClassName: 'privacy-body' };

export function meta(_: Route.MetaArgs) {
  return productPageMeta({
    path: '/support/',
    title: 'Crest Support — Find Your Way Forward',
    description:
      'Get help with Crest setup, Spaces, sync, passwords, imports, and website compatibility, or reach the Crest community for support.',
    shareTitle: 'Crest Support — Find Your Way Forward',
    shareDescription:
      'Practical help for setup, Spaces, sync, passwords, imports, and website compatibility in Crest.',
    type: 'article',
    themeColor: '#101827',
    colorScheme: 'dark light',
  });
}

export const links: Route.LinksFunction = () => [
  { rel: 'stylesheet', href: siteStylesheet },
  ...siteIcons,
];

const structuredData = webPageStructuredData({
  path: '/support/',
  name: 'Crest Support',
  description:
    'Support for setup, Spaces, sync, passwords, imports, and website compatibility in Crest.',
  dateModified: '2026-08-09',
});

export default function Support() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SiteHeader skipTo="support-content" skipLabel="Skip to support" />

      <main id="support-content">
        <section className="privacy-hero" aria-labelledby="support-title">
          <div className="privacy-hero-copy">
            <p className="eyebrow">Support · Crest field desk</p>
            <h1 id="support-title">Find your way<br /><em>forward.</em></h1>
            <p>Start with the shortest path below. If Crest still feels lost, bring the details that help identify the exact device, Space, page, and moment.</p>
          </div>
          <div className="privacy-promises" aria-label="Crest support routes">
            <article><span>01</span><strong>Check the guides</strong><p>Learn the model before changing your data.</p></article>
            <article><span>02</span><strong>Try a focused reset</strong><p>Reload the page or reopen only the affected Space.</p></article>
            <article><span>03</span><strong>Share useful context</strong><p>Device, OS, Crest version, Space, and exact steps.</p></article>
          </div>
        </section>

        <div className="privacy-layout">
          <aside className="privacy-nav" aria-label="Support sections">
            <p>On this page</p>
            <a href="#first-steps">First steps</a>
            <a href="#spaces-sync">Spaces and sync</a>
            <a href="#sites">Website issues</a>
            <a href="#imports-passwords">Imports and passwords</a>
            <a href="#contact">Contact</a>
          </aside>

          <article className="privacy-article">
            <section id="first-steps">
              <p className="eyebrow">Start here</p>
              <h2>Use the smallest reset<br />that fits the problem.</h2>
              <p>Reload the affected page first. If only one Space is involved, switch away and back. If a page remains unresponsive, close that tab and open it again. Relaunch Crest only after those focused steps fail.</p>
              <p>Before clearing history, website data, passwords, or a Space, confirm that the problem is not limited to one page or one signed-in account. Those actions remove useful state and may not address a compatibility issue.</p>
              <a className="privacy-source" href="/docs/">Open the Crest guides <span aria-hidden="true">→</span></a>
            </section>

            <section id="spaces-sync">
              <p className="privacy-index">01</p>
              <h2>Spaces own their data.</h2>
              <p>If a tab, sign-in, password, permission, or history item seems missing, verify the active Space first. Each Space has separate website data, Keychain items, history, permissions, tabs, extensions, and synchronization state. On Mac, Chromium and WebKit keep separate website data, so a site you signed in to in one engine may ask you to sign in again in the other.</p>
              <p>For sync issues, open Settings → Sync on both devices and compare the selected iCloud account, Space list, last sync state, and per-Space password-sync switches. Cookies, website data, downloads, and active page state remain device-only.</p>
            </section>

            <section id="sites">
              <p className="privacy-index">02</p>
              <h2>When one website behaves differently.</h2>
              <p>Reload the page, confirm content blocking and permissions for that site, and try the same page in a new tab inside the same Space. If the issue follows only one Space, compare its content-blocking and extension settings.</p>
              <p>On Mac, try the page in the other engine: choose <strong>Page → Open Page in WebKit</strong> or <strong>Open Page in Chromium</strong>. If it works there, change <strong>Opens in</strong> in Site Controls to keep the website on that engine, and mention both engines in your report. Extensions run only on Chromium pages, and protected video plays in WebKit. Crest on iPhone and iPad uses WebKit.</p>
            </section>

            <section id="imports-passwords">
              <p className="privacy-index">03</p>
              <h2>Review before importing.</h2>
              <p>Mac import is optional. Crest shows supported browsers and a Space-by-Space before-and-after review before adding tabs, bookmarks, folders, profiles or Spaces, and supported passwords.</p>
              <p>Passwords are stored in the system Keychain. If a password is unavailable, confirm the correct Space and device, then check Settings → Passwords and the Space’s iCloud Keychain sync switch. Never post a password, private URL, recovery code, or account token in a public support request.</p>
            </section>

            <section id="contact">
              <p className="privacy-index">04</p>
              <h2>Bring a trail someone else can follow.</h2>
              <p>Include the Apple device model, operating-system version, Crest version, the page’s engine on Mac, active Space, the page or feature involved, exact steps, what you expected, and what happened instead. A screenshot is useful only after removing private tabs, account details, URLs, and messages.</p>
              <div className="privacy-contact">
                <span>Community, questions, and compatibility</span>
                <p>Use <a href="https://www.reddit.com/r/CrestBrowser" target="_blank" rel="noopener noreferrer">r/CrestBrowser</a> for questions, feedback, early ideas, and website or extension compatibility discussion. Reddit is public; do not include passwords, account details, private URLs, browsing history, or other sensitive information.</p>
              </div>
              <div className="privacy-contact">
                <span>Reproducible engineering reports</span>
                <p>Use <a href="https://github.com/pauljoda/Crest/issues/new/choose" target="_blank" rel="noopener noreferrer">GitHub Issues</a> when you can provide a Crest version, Apple platform, repeatable steps, expected result, and actual result. Suspected security vulnerabilities belong in a <a href="https://github.com/pauljoda/Crest/security/advisories/new" target="_blank" rel="noopener noreferrer">private report</a>, never Reddit or a public issue.</p>
              </div>
              <div className="privacy-contact">
                <span>Chat and quick questions</span>
                <p>Join the <a href="https://discord.gg/gjrM5qMB6x" target="_blank" rel="noopener noreferrer">Crest Discord</a> to ask questions, share ideas, and talk with other people using Crest. Discord is for discussion; bugs you can reproduce belong in GitHub Issues so they can be tracked. Do not post passwords, account details, or private URLs.</p>
              </div>
            </section>
          </article>
        </div>
      </main>

      <SiteFooter tagline="Focused troubleshooting for a browser built around clear boundaries.">
        <a href="/privacy/">Privacy</a>
        <a href="https://github.com/pauljoda/Crest/issues/new/choose" {...external}>GitHub Issues</a>
      </SiteFooter>
    </>
  );
}
