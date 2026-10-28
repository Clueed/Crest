import type { Route } from './+types/home';
import { ArcSection } from '@/components/home/arc-section';
import { BannersSection } from '@/components/home/banners';
import { DevicesSection } from '@/components/home/devices';
import { Hero } from '@/components/home/hero';
import { HomeProvider } from '@/components/home/home-state';
import { GetSection, ImportSection, MoreSection } from '@/components/home/sections';
import { ProductPage } from '@/components/site-chrome';
import { productPageMeta } from '@/lib/page-meta';

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
  return (
    <HomeProvider>
      <ProductPage structuredData={structuredData} className="leading-[1.55]">
        <Hero />
        <BannersSection />
        <ArcSection />
        <DevicesSection />
        <ImportSection />
        <MoreSection />
        <GetSection />
      </ProductPage>
    </HomeProvider>
  );
}
