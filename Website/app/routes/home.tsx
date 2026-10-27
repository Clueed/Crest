import { useEffect } from 'react';
import type { Route } from './+types/home';
import { productPageMeta } from '@/lib/page-meta';
import { startHomepage } from '@/lib/homepage.client';
import homeStylesheet from '@/styles/home.css?url';

export function meta(_: Route.MetaArgs) {
  return productPageMeta({
    path: '/',
    title: 'Crest — The browser for life after Arc',
    description:
      'Crest is an independent browser for Mac, iPad, and iPhone, made by an Arc user who wanted Spaces, Peek, and the sidebar to have a future.',
    shareTitle: 'Crest Browser for Mac, iPad, and iPhone',
    shareDescription:
      "An independent browser made with a love for Arc's best ideas, including Spaces, a calm sidebar, and Peek.",
    type: 'website',
    themeColor: '#0f1c2c',
    colorScheme: 'light',
    extra: [
      { name: 'msapplication-TileColor', content: '#101827' },
      { property: 'og:image:secure_url', content: 'https://crestbrowser.com/assets/og-card-brand.jpg' },
    ],
  });
}

export const links: Route.LinksFunction = () => [
  { rel: 'stylesheet', href: homeStylesheet },
];

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://crestbrowser.com/#website',
      url: 'https://crestbrowser.com/',
      name: 'Crest',
      description: 'An independent browser made by an Arc user for Mac, iPad, and iPhone.',
      inLanguage: 'en-US',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://crestbrowser.com/#software',
      name: 'Crest',
      url: 'https://crestbrowser.com/',
      description:
        'An independent browser for Mac, iPad, and iPhone, with isolated Spaces, a calm sidebar, and Peek.',
      applicationCategory: 'BrowserApplication',
      operatingSystem: ['macOS', 'iOS', 'iPadOS'],
      image: 'https://crestbrowser.com/assets/og-card-brand.jpg',
      screenshot: [
        'https://crestbrowser.com/assets/crest-work-mac.png',
        'https://crestbrowser.com/assets/crest-split-view-mac.png',
        'https://crestbrowser.com/assets/crest-work-ipad.png',
        'https://crestbrowser.com/assets/crest-work-iphone-sidebar.png',
        'https://crestbrowser.com/assets/crest-import-browser-selection-mac-2026.png',
        'https://crestbrowser.com/assets/crest-import-space-review-mac-2026.png',
      ],
      isPartOf: { '@id': 'https://crestbrowser.com/#website' },
    },
  ],
};

export default function Home() {
  useEffect(() => startHomepage(), []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <a className="skip" href="#main">Skip to content</a>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <symbol id="i-discord" viewBox="0 0 24 24"><path fill="currentColor" d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></symbol>
        <symbol id="i-github" viewBox="0 0 16 16"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></symbol>
      </svg>

      <header className="nav" id="nav">
        <div className="wide">
          <a className="brand" href="#"><img src="/assets/crest-logo.svg" alt="" />Crest</a>
          <nav className="nav-links" aria-label="Site">
            <a href="#tour">Features</a>
            <a href="#crests">Crests</a>
            <a href="#arc">From Arc</a>
            <a href="#devices">Devices</a>
            <span className="sep"></span>
            <a href="/docs/">Help &amp; docs</a>
            <a href="https://github.com/pauljoda/Crest" target="_blank" rel="noopener noreferrer"><svg className="ico" aria-hidden="true"><use href="#i-github"/></svg>GitHub</a>
            <details className="links" id="links">
              <summary>Links<svg className="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></summary>
              <div className="menu">
                <a className="narrow" href="/docs/">Help &amp; docs</a>
                <a className="narrow" href="https://github.com/pauljoda/Crest" target="_blank" rel="noopener noreferrer">GitHub</a>
                <a href="https://github.com/pauljoda/Crest/releases" target="_blank" rel="noopener noreferrer">Mac releases</a>
                <a href="https://www.reddit.com/r/CrestBrowser" target="_blank" rel="noopener noreferrer">Reddit</a>
                <a href="https://discord.gg/gjrM5qMB6x" target="_blank" rel="noopener noreferrer">Discord</a>
                <a href="/support/">Support</a>
                <a href="/privacy/">Privacy</a>
              </div>
            </details>
            <a className="cta" href="#get">Download</a>
          </nav>
        </div>
      </header>

      <main id="main">

      <section className="hero" id="top">
        <div className="hero-bg" aria-hidden="true"><div className="pin"><i className="hb"></i><i className="hb"></i></div></div>
        <div className="hero-fade" aria-hidden="true"></div>
        <div className="hero-head">
          <div className="chips" id="chips" role="group" aria-label="Crest templates. Pick one to dress the Work Space below."></div>
          <div className="hero-copy">
            <h1>The browser for life after Arc.</h1>
            <p className="lede">Spaces, a sidebar, Peek, and Split&nbsp;View. Native on Mac, iPad, and&nbsp;iPhone.</p>
            <div className="cta">
              <a className="btn for-mac" href="https://github.com/pauljoda/Crest/releases/latest" target="_blank" rel="noopener noreferrer"><img src="/assets/crest-logo.svg" alt="" /><span><small>Apple silicon Mac</small><b>Download for Mac</b></span></a>
              <a className="btn for-ios" href="https://apps.apple.com/us/app/crest-browser/id6797335023" target="_blank" rel="noopener noreferrer"><img src="/assets/app-store-official.png" alt="" /><span><small>App Store</small><b>Get it for iPhone &amp; iPad</b></span></a>
              <div className="secondary">
                <a className="sl alt-ios" href="https://apps.apple.com/us/app/crest-browser/id6797335023" target="_blank" rel="noopener noreferrer"><img src="/assets/app-store-official.png" alt="" />iPhone &amp; iPad</a>
                <a className="sl alt-mac" href="https://github.com/pauljoda/Crest/releases/latest" target="_blank" rel="noopener noreferrer"><img src="/assets/crest-logo.svg" alt="" />Download for Mac</a>
                <a className="sl" href="https://github.com/pauljoda/Crest" target="_blank" rel="noopener noreferrer"><svg className="ico" aria-hidden="true"><use href="#i-github"/></svg>Source on GitHub</a>
              </div>
            </div>
            <p className="fine">Early access. Security not independently audited. MPL 2.0. Not affiliated with Arc.</p>
          </div>
        </div>
        <div className="scrolly tour" id="tour">
          <div className="stage">
            <div className="tour-in">
              <div className="mac" id="tour-mac"></div>
              <div className="tour-list" id="tour-list"></div>
              <div className="tour-cap" id="tour-cap" aria-live="polite"><h3></h3><p></p></div>
              <div className="tour-dots" id="tour-dots" aria-hidden="true"></div>
              <div className="segs tour-segs" role="tablist" aria-label="Features" id="tour-segs"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section banners" id="crests" aria-labelledby="crests-title">
        <div className="wrap">
          <div className="head rv">
            <h2 className="h2" id="crests-title">The sidebar is the banner.</h2>
            <p className="lede">Start from a template, or make your own.</p>
          </div>
          <div className="hall rv">
            <div className="rod" aria-hidden="true"></div>
            <div className="flags" id="flags" role="group" aria-label="Crest templates"></div>
          </div>

          <div className="personalize-row rv">
            <figure className="product-shot">
              <a href="/assets/crest-studio-mac.png" aria-label="View Crest Studio at full size"><img src="/assets/crest-studio-mac.png" width="2800" height="1800" alt="Crest Studio on Mac with the Personal Space’s Winter crest on its sidebar background, its colors, and the shape step beside the live sidebar" loading="lazy" decoding="async" /></a>
            </figure>
            <div className="personalize-copy">
              <h3>Crest Studio</h3>
              <p>Shape, artwork, trim, and colors, with a live preview.</p>
              <a className="text-link" href="/docs/customize-spaces/">Customize a Space →</a>
            </div>
          </div>
          <div className="personalize-row reverse rv">
            <figure className="product-shot">
              <a href="/assets/crest-look-and-feel-mac.png" aria-label="View Appearance settings at full size"><img src="/assets/crest-look-and-feel-mac.png" width="2800" height="1800" alt="Appearance settings on Mac with window, accent, tab shape, and pin layout controls" loading="lazy" decoding="async" /></a>
            </figure>
            <div className="personalize-copy">
              <h3>Appearance</h3>
              <p>Sidebar side, tab shape, pins, and address colors.</p>
              <a className="text-link" href="/docs/settings-reference/#appearance">Appearance settings →</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section dark" id="arc">
        <div className="wrap">
          <div className="head rv">
            <h2 className="h2">Coming from Arc?</h2>
            <p className="lede">The features you used, some with new names.</p>
          </div>
          <div className="ticker rv" aria-label="Arc features in Crest" id="ticker"></div>
          <details className="fulllist rv">
            <summary>Full list</summary>
            <table className="parity">
              <thead><tr><th>Arc</th><th>Crest</th></tr></thead>
              <tbody>
                <tr><td>Spaces + Profiles</td><td>Spaces</td></tr>
                <tr><td>Sidebar</td><td>Sidebar</td></tr>
                <tr><td>Favorites</td><td>Pinned sites</td></tr>
                <tr><td>Pinned Tabs</td><td>Saved tabs</td></tr>
                <tr><td>Folders</td><td>Saved folders</td></tr>
                <tr><td>Command Bar</td><td>Command palette</td></tr>
                <tr><td>Air Traffic Control</td><td>Link Routing</td></tr>
                <tr><td>Split View</td><td>Split View</td></tr>
                <tr><td>Peek</td><td>Peek</td></tr>
                <tr><td>Little Arc</td><td>Quick Window</td></tr>
                <tr><td>Auto Archive</td><td>Space cleanup + Archive</td></tr>
                <tr><td>Recent Tab Switcher</td><td>Most Recent Tab</td></tr>
                <tr><td>Custom Keyboard Shortcuts</td><td>Rebindable shortcuts</td></tr>
                <tr><td>Developer Mode</td><td>Developer tools</td></tr>
                <tr><td>Site Control Center</td><td>Site Controls</td></tr>
                <tr><td>Extensions</td><td>Extensions per Space</td></tr>
                <tr><td>Incognito</td><td>Private Spaces</td></tr>
                <tr><td>Space Themes</td><td>Crest Studio + gradients</td></tr>
                <tr><td>Arc Sync</td><td>iCloud sync</td></tr>
                <tr><td>Library</td><td>History, Archive + Downloads</td></tr>
                <tr><td>Import from Another Browser</td><td>Import</td></tr>
              </tbody>
            </table>
          </details>
        </div>
      </section>

      <section className="section" id="devices">
        <div className="wrap">
          <div className="head rv" style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>
            <h2 className="h2">Mac, iPad, and iPhone.</h2>
          </div>
          <div className="devstack rv" id="devstack" data-dev="mac">
            <div className="ds-scene">
              <div className="ds-item ds-mac" data-devitem="mac"><img src="/assets/crest-work-mac.png" alt="Crest on Mac with the Lion Work Space first, Winter Personal second, and Audience research open in the Launch Atlas folder" width="2800" height="1800" loading="lazy" decoding="async" /></div>
              <div className="ds-item ds-ipad" data-devitem="ipad"><div className="bezel ipad-bz"><img src="/assets/crest-work-ipad.png" alt="The same Work Space and Audience research page on iPad" width="2420" height="1668" loading="lazy" decoding="async" /></div></div>
              <div className="ds-item ds-phone" data-devitem="iphone"><div className="bezel phone-bz"><img src="/assets/crest-work-iphone-sidebar.png" alt="The same Work Space and Launch Atlas folder in the iPhone sidebar" width="1206" height="2622" loading="lazy" decoding="async" /></div></div>
            </div>
            <div className="segs light" role="tablist" aria-label="Devices">
              <button role="tab" aria-selected="true" data-dev="mac">Mac</button>
              <button role="tab" aria-selected="false" data-dev="ipad">iPad</button>
              <button role="tab" aria-selected="false" data-dev="iphone">iPhone</button>
            </div>
            <div className="captions" aria-live="polite">
              <p className="cap on" data-devcap="mac">Chromium and WebKit, Chrome extensions, and Split View.</p>
              <p className="cap" data-devcap="ipad">The sidebar beside the page, with resizable Split View.</p>
              <p className="cap" data-devcap="iphone">Full-screen pages, with the sidebar a swipe away.</p>
            </div>
          </div>
          <p className="sync rv">Spaces, tabs, and folders sync through iCloud.</p>
        </div>
      </section>

      <section className="section" id="import" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="head rv">
            <h2 className="h2">Bring your browser with you.</h2>
            <p className="lede">Import on Mac. Review each Space before anything moves.</p>
          </div>
          <figure className="setup rv"><img src="/assets/crest-import-space-review-mac-2026.png" alt="Crest Setup reviewing an Arc Space beside its Crest destination before import" width="2350" height="1632" loading="lazy" decoding="async" /></figure>
          <div className="srcs rv">
            <div><b>Arc</b><span>Spaces, tabs, folders, colors, icons, passwords</span></div>
            <div><b>Zen</b><span>Spaces, Essentials, pinned tabs, folders, colors</span></div>
            <div><b>Chrome</b><span>Profiles, bookmarks, open tabs, passwords</span></div>
            <div><b>Safari</b><span>Bookmarks, windows, open tabs</span></div>
            <div><b>Firefox</b><span>Windows, open tabs, pinned tabs</span></div>
          </div>
        </div>
      </section>

      <section className="section" id="more" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="head rv">
            <h2 className="h2">Also in Crest</h2>
          </div>
          <div className="rest rv">
            <div><b>Two engines<span className="tag">Mac</span></b><p>Chromium, plus WebKit per site. <a href="/docs/engines/">More</a></p></div>
            <div><b>Extensions<span className="tag">Mac</span></b><p>From the Chrome Web Store, per Space. <a href="/docs/extension-compatibility/">More</a></p></div>
            <div><b>Crest Passwords</b><p>In the Keychain, matched per Space.</p></div>
            <div><b>Private Spaces</b><p>Nothing kept. Optional Face ID or Touch ID lock.</p></div>
            <div><b>Content blocking</b><p>uBlock Origin Lite or the built-in list.</p></div>
            <div><b>Site permissions</b><p>Remembered per site and Space.</p></div>
            <div><b>Translation</b><p>Whole pages, on device.</p></div>
            <div><b>Reader</b><p>On iPhone, iPad, and WebKit pages.</p></div>
            <div><b>Media</b><p>Now Playing and Picture in Picture.</p></div>
            <div><b>Organize</b><p>Move tabs and folders together.</p></div>
            <div><b>Developer tools<span className="tag">Mac</span></b><p>Viewports, Console, and Network.</p></div>
            <div><b>Shortcuts<span className="tag">Mac</span></b><p>Rebind any command.</p></div>
            <div><b>Space cleanup</b><p>Archive tabs after 12 hours to 30 days.</p></div>
            <div><b>Downloads</b><p>Pause and resume on Chromium.</p></div>
            <div><b>Page tools</b><p>PDF, web archive, and Markdown links.</p></div>
            <div><b>Keep Loaded</b><p>Stops a page from unloading.</p></div>
          </div>
        </div>
      </section>

      <section className="section dark get" id="get">
        <div className="band" aria-hidden="true"></div>
        <div className="wrap">
          <h2 className="h2">Get Crest</h2>
          <div className="get-grid">
            <ul className="getlist" aria-label="Download">
              <li><a href="https://github.com/pauljoda/Crest/releases/latest" target="_blank" rel="noopener noreferrer"><img src="/assets/crest-logo.svg" alt="" /><span><b>Mac</b><small>Apple silicon</small></span><span className="go">Download ↗</span></a></li>
              <li><a href="https://apps.apple.com/us/app/crest-browser/id6797335023" target="_blank" rel="noopener noreferrer"><img className="pad" src="/assets/app-store-official.png" alt="" /><span><b>iPhone and iPad</b><small>App Store</small></span><span className="go">Open ↗</span></a></li>
              <li><a href="https://testflight.apple.com/join/vV1CM49Q" target="_blank" rel="noopener noreferrer"><img className="pad" src="/assets/testflight-official.png" alt="" /><span><b>Beta</b><small>TestFlight</small></span><span className="go">Join ↗</span></a></li>
            </ul>
            <ul className="getlist" aria-label="Community">
              <li><a href="https://github.com/pauljoda/Crest/issues/new/choose" target="_blank" rel="noopener noreferrer"><span className="mk gh"><svg className="ico" aria-hidden="true"><use href="#i-github"/></svg></span><span><b>GitHub</b><small>Bug reports</small></span><span className="go">Report ↗</span></a></li>
              <li><a href="https://www.reddit.com/r/CrestBrowser" target="_blank" rel="noopener noreferrer"><img className="pad" src="/assets/reddit-official.png" alt="" /><span><b>Reddit</b><small>r/CrestBrowser</small></span><span className="go">Visit ↗</span></a></li>
              <li><a href="https://discord.gg/gjrM5qMB6x" target="_blank" rel="noopener noreferrer"><span className="mk"><svg className="ico" aria-hidden="true"><use href="#i-discord"/></svg></span><span><b>Discord</b><small>Chat and questions</small></span><span className="go">Join ↗</span></a></li>
            </ul>
          </div>
        </div>
      </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="links">
            <a href="#tour">Features</a><a href="#crests">Crests</a><a href="#arc">From Arc</a><a href="#devices">Devices</a><a href="#import">Import</a><a href="/docs/">Help &amp; docs</a><a href="/support/">Support</a><a href="/privacy/">Privacy</a><a href="https://github.com/pauljoda/Crest" target="_blank" rel="noopener noreferrer">GitHub</a><a href="https://www.reddit.com/r/CrestBrowser" target="_blank" rel="noopener noreferrer">Reddit</a><a href="https://discord.gg/gjrM5qMB6x" target="_blank" rel="noopener noreferrer">Discord</a><a href="https://ko-fi.com/pauljoda/tiers" target="_blank" rel="noopener noreferrer">Support open source software</a>
          </div>
          <p>Free and open source under the Mozilla Public License 2.0. Not affiliated with Arc. Crest Studio artwork by Lorc and Delapouite from <a href="https://game-icons.net" target="_blank" rel="noopener noreferrer">game-icons.net</a>, <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener noreferrer">CC BY 3.0</a>. TestFlight, Reddit, and Discord are trademarks of their owners.</p>
        </div>
      </footer>
    </>
  );
}
