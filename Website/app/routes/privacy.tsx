import type { Route } from './+types/privacy';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { ArticleAside, ArticleHero, ArticleLayout, ArticleSection, ContactNote, SourceLink } from '@/components/article-page';
import { productPageMeta, webPageStructuredData } from '@/lib/page-meta';

export function meta(_: Route.MetaArgs) {
  return productPageMeta({
    path: '/privacy/',
    title: 'Crest Privacy — Your Browsing Stays Yours',
    description:
      'Crest has no account, analytics, advertising SDK, or browsing-data backend. Learn what stays on your device, what can sync through iCloud, and when third-party services receive a request.',
    shareTitle: 'Crest Privacy — Your Browsing Stays Yours',
    shareDescription:
      'No Crest account, analytics, advertising SDK, or browsing-data backend. A plain-language guide to local data, iCloud sync, search, and third-party services.',
    type: 'article',
    themeColor: '#101827',
    colorScheme: 'dark light',
  });
}

const structuredData = webPageStructuredData({
  path: '/privacy/',
  name: 'Crest Privacy',
  description:
    'How Crest handles local browsing data, optional iCloud sync, search requests, and third-party services.',
  dateModified: '2026-09-30',
});

export default function Privacy() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SiteHeader />

      <main id="main">
        <ArticleHero
          titleId="privacy-title"
          eyebrow="Privacy · Effective September 30, 2026"
          title={<>Your browsing<br />stays <em>yours.</em></>}
          intro="Crest has no account system, analytics pipeline, advertising SDK, or browsing-data backend. Crest does not collect or receive your browsing history, searches, passwords, cookies, or website data."
          pointsLabel="Crest privacy promises"
          points={[
            { title: 'No Crest account', text: 'There is no profile to build or identity to follow.' },
            { title: 'No analytics or ads', text: 'No tracking SDK, advertising identifier, or behavioral telemetry.' },
            { title: 'No browsing-data server', text: 'Your activity is not sent to Crest or its developer.' },
          ]}
        />

        <ArticleLayout
          navLabel="Privacy policy sections"
          sections={[
            { id: 'short-version', title: 'The short version' },
            { id: 'your-devices', title: 'On your devices' },
            { id: 'icloud', title: 'Optional iCloud sync' },
            { id: 'services', title: 'Sites and services' },
            { id: 'search-attribution', title: 'Search attribution' },
            { id: 'website-beta', title: 'Website and beta' },
            { id: 'control', title: 'Your control' },
          ]}
        >
          <ArticleSection id="short-version" eyebrow="The short version" title={<>Crest is a browser,<br />not a data business.</>}>
            <p>Crest does not sell, rent, profile, or share your personal information because Crest does not collect it. There is no Crest-operated service receiving the pages you visit, the searches you make, or the accounts you use.</p>
            <p>Like every browser, Crest connects directly to the websites and services you choose. Those services receive the requests needed to work and handle them under their own privacy policies. Optional Apple services are covered separately below.</p>
          </ArticleSection>

          <ArticleSection id="your-devices" index="01" title={<>What stays on your devices.</>}>
            <p>Cookies, website storage, service workers, downloads, and active page state stay on the device where you use them. Crest keeps this browsing data isolated by Space so one context does not silently become another.</p>
            <p>Passwords are stored with the system Keychain. Crest does not upload password values to a Crest server. Private Spaces use temporary website storage and do not join ordinary history, restoration, archive, or synchronization.</p>
          </ArticleSection>

          <ArticleSection id="icloud" index="02" title={<>iCloud is optional.</>}>
            <p>If you enable Crest sync, Space identity, pinned and saved tabs, current tabs, history, and archive records can sync through your private CloudKit database. This is an Apple service associated with your iCloud account; Crest does not operate a parallel copy.</p>
            <p>Password values never enter CloudKit. Each Space has a separate switch for syncing those encrypted Keychain items through iCloud Keychain. Cookies, website data, service workers, downloads, and active page state remain device-only.</p>
            <SourceLink href="https://developer.apple.com/documentation/cloudkit/ckcontainer/privateclouddatabase">About private CloudKit databases at Apple</SourceLink>
          </ArticleSection>

          <ArticleSection id="services" index="03" title={<>Requests go where you send them.</>}>
            <p>When you visit a website or search the web, Crest sends the request directly to that website or to your selected search provider. The recipient and the network carrying the request may receive ordinary connection information such as your IP address, browser details, and the page or search you requested. Their policies—not Crest's—govern what they do with it.</p>
            <p>When content blocking is enabled, Crest applies its bundled rules locally to WebKit pages. Crest does not download third-party filter lists; users who want broader blocking, or blocking on Chromium pages, can install a compatible extension.</p>
            <p>On Mac, Crest&rsquo;s Chromium engine is built on ungoogled-chromium, which removes Chromium&rsquo;s Google integrations. When you install an extension from the Chrome Web Store, Crest downloads it from Google&rsquo;s update service, and Chromium later checks Google&rsquo;s service for updates to the extensions you installed. Extensions you add can see and send data according to their own permissions and policies.</p>
            <p>Chromium does not include a site or download reputation service or remote Web Push. Read the <a href="/docs/content-blocking-and-site-permissions/">engine protection and notification details</a> for the controls and limits.</p>
          </ArticleSection>

          <ArticleAside id="search-attribution" label="Footnote" note="Search-source attribution" title={<>A future search may identify Crest—not you.</>}>
              <p><strong>Today, Crest does not add a Crest source or partner parameter to search URLs.</strong> In the future, Crest may add a fixed, app-wide source-attribution parameter so a search provider can recognize that a search came from Crest.</p>
              <p>DuckDuckGo, for example, calls this its <code>t</code> source parameter and documents partner searches with an <code>&amp;t=</code> value for anonymous, aggregate attribution. Any Crest value would identify only the app. It would not identify a person, device, Space, session, or account, and it would not add personal information to the request.</p>
              <p>The selected provider would still receive the search query and that fixed tag directly. Crest would not receive, transmit to its own service, or store a copy of the query.</p>
              <SourceLink href="https://duckduckgo.com/duckduckgo-help-pages/privacy/t">How DuckDuckGo describes its source parameter</SourceLink>
          </ArticleAside>

          <ArticleSection id="website-beta" index="04" title={<>This website and TestFlight.</>}>
            <p>This product site is static. It has no Crest analytics, tracking pixels, advertising, cookies, account forms, or embedded third-party media. It is hosted by GitHub Pages; GitHub says it logs visitor IP addresses for security and may collect ordinary website usage information under its own policy.</p>
            <p>Apple handles TestFlight enrollment and beta delivery. While you use a TestFlight build, Apple may provide Crest's developer with crash reports. Testers can also choose to send screenshots, comments, or other feedback through TestFlight. Crest adds no separate telemetry to those builds.</p>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <SourceLink href="https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages">GitHub Pages privacy notes</SourceLink>
              <SourceLink href="https://developer.apple.com/testflight/">How Apple describes TestFlight</SourceLink>
            </div>
          </ArticleSection>

          <ArticleSection id="control" index="05" title={<>Your data remains under your control.</>}>
            <p>You can clear site data and history, remove saved credentials, delete a Space, disable iCloud sync, or turn off iCloud Keychain syncing for an individual Space. Data kept on your devices remains until you clear it, remove the app and its data, or the operating system removes it. Synced data remains in your iCloud account until it is deleted through Crest or your Apple account.</p>
            <p>If this policy changes, the new version will be posted here with a revised effective date. A future feature that changes what Crest collects would require this policy to change first.</p>
            <ContactNote label="Questions or concerns?">
              <p>Reach the developer through the <a href="https://www.reddit.com/r/CrestBrowser" target="_blank" rel="noopener noreferrer">Crest community on Reddit</a> or the <a href="https://discord.gg/gjrM5qMB6x" target="_blank" rel="noopener noreferrer">Crest Discord</a>. Both are public, so do not include passwords, account details, private URLs, or other sensitive information.</p>
            </ContactNote>
          </ArticleSection>
        </ArticleLayout>
      </main>

      <SiteFooter tagline="No account. No analytics. No browsing-data backend. Just a browser that keeps your internet under your colors." />
    </>
  );
}
