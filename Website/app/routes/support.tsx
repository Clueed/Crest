import type { Route } from './+types/support';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { ArticleAside, ArticleHero, ArticleLayout, ArticleSection, ContactNote, SourceLink } from '@/components/article-page';
import { productPageMeta, webPageStructuredData } from '@/lib/page-meta';

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
      <SiteHeader />

      <main id="main">
        <ArticleHero
          titleId="support-title"
          eyebrow="Support · Crest field desk"
          title={<>Find your way<br /><em>forward.</em></>}
          intro="Start with the shortest path below. If Crest still feels lost, bring the details that help identify the exact device, Space, page, and moment."
          pointsLabel="Crest support routes"
          points={[
            { title: 'Check the guides', text: 'Learn the model before changing your data.' },
            { title: 'Try a focused reset', text: 'Reload the page or reopen only the affected Space.' },
            { title: 'Share useful context', text: 'Device, OS, Crest version, Space, and exact steps.' },
          ]}
        />

        <ArticleLayout
          navLabel="Support sections"
          sections={[
            { id: 'first-steps', title: 'First steps' },
            { id: 'spaces-sync', title: 'Spaces and sync' },
            { id: 'sites', title: 'Website issues' },
            { id: 'imports-passwords', title: 'Imports and passwords' },
            { id: 'contact', title: 'Contact' },
          ]}
        >
          <ArticleSection id="first-steps" eyebrow="Start here" title={<>Use the smallest reset<br />that fits the problem.</>}>
            <p>Reload the affected page first. If only one Space is involved, switch away and back. If a page remains unresponsive, close that tab and open it again. Relaunch Crest only after those focused steps fail.</p>
            <p>Before clearing history, website data, passwords, or a Space, confirm that the problem is not limited to one page or one signed-in account. Those actions remove useful state and may not address a compatibility issue.</p>
            <SourceLink href="/docs/">Open the Crest guides</SourceLink>
          </ArticleSection>

          <ArticleSection id="spaces-sync" index="01" title={<>Spaces own their data.</>}>
            <p>If a tab, sign-in, password, permission, or history item seems missing, verify the active Space first. Each Space has separate website data, Keychain items, history, permissions, tabs, extensions, and synchronization state. On Mac, Chromium and WebKit keep separate website data, so a site you signed in to in one engine may ask you to sign in again in the other.</p>
            <p>For sync issues, open Settings → Sync on both devices and compare the selected iCloud account, Space list, last sync state, and per-Space password-sync switches. Cookies, website data, downloads, and active page state remain device-only.</p>
          </ArticleSection>

          <ArticleSection id="sites" index="02" title={<>When one website behaves differently.</>}>
            <p>Reload the page, confirm content blocking and permissions for that site, and try the same page in a new tab inside the same Space. If the issue follows only one Space, compare its content-blocking and extension settings.</p>
            <p>On Mac, try the page in the other engine: choose <strong>Page → Open Page in WebKit</strong> or <strong>Open Page in Chromium</strong>. If it works there, change <strong>Opens in</strong> in Site Controls to keep the website on that engine, and mention both engines in your report. Extensions run only on Chromium pages, and protected video plays in WebKit. Crest on iPhone and iPad uses WebKit.</p>
          </ArticleSection>

          <ArticleSection id="imports-passwords" index="03" title={<>Review before importing.</>}>
            <p>Mac import is optional. Crest shows supported browsers and a Space-by-Space before-and-after review before adding tabs, bookmarks, folders, profiles or Spaces, and supported passwords.</p>
            <p>Passwords are stored in the system Keychain. If a password is unavailable, confirm the correct Space and device, then check Settings → Passwords and the Space’s iCloud Keychain sync switch. Never post a password, private URL, recovery code, or account token in a public support request.</p>
          </ArticleSection>

          <ArticleSection id="contact" index="04" title={<>Bring a trail someone else can follow.</>}>
            <p>Include the Apple device model, operating-system version, Crest version, the page’s engine on Mac, active Space, the page or feature involved, exact steps, what you expected, and what happened instead. A screenshot is useful only after removing private tabs, account details, URLs, and messages.</p>
            <ContactNote label="Community, questions, and compatibility">
              <p>Use <a href="https://www.reddit.com/r/CrestBrowser" target="_blank" rel="noopener noreferrer">r/CrestBrowser</a> for questions, feedback, early ideas, and website or extension compatibility discussion. Reddit is public; do not include passwords, account details, private URLs, browsing history, or other sensitive information.</p>
            </ContactNote>
            <ContactNote label="Reproducible engineering reports">
              <p>Use <a href="https://github.com/pauljoda/Crest/issues/new/choose" target="_blank" rel="noopener noreferrer">GitHub Issues</a> when you can provide a Crest version, Apple platform, repeatable steps, expected result, and actual result. Suspected security vulnerabilities belong in a <a href="https://github.com/pauljoda/Crest/security/advisories/new" target="_blank" rel="noopener noreferrer">private report</a>, never Reddit or a public issue.</p>
            </ContactNote>
            <ContactNote label="Chat and quick questions">
              <p>Join the <a href="https://discord.gg/gjrM5qMB6x" target="_blank" rel="noopener noreferrer">Crest Discord</a> to ask questions, share ideas, and talk with other people using Crest. Discord is for discussion; bugs you can reproduce belong in GitHub Issues so they can be tracked. Do not post passwords, account details, or private URLs.</p>
            </ContactNote>
          </ArticleSection>
        </ArticleLayout>
      </main>

      <SiteFooter tagline="Focused troubleshooting for a browser built around clear boundaries." />
    </>
  );
}
