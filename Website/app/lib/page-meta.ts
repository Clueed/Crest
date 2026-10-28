import type { LinkDescriptor, MetaDescriptor } from 'react-router';
import { siteUrl } from './shared';

const ogImage = `${siteUrl}/assets/og-card-brand.jpg`;
const ogImageAlt = 'Crest app icon beside the words Your internet, under your colors';

export const siteIcons: LinkDescriptor[] = [
  { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
  { rel: 'icon', type: 'image/svg+xml', href: '/assets/crest-logo.svg' },
  { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/assets/crest-icon-32.png' },
  { rel: 'apple-touch-icon', sizes: '180x180', href: '/assets/apple-touch-icon.png' },
  { rel: 'mask-icon', href: '/assets/crest-logo.svg', color: '#101827' },
  { rel: 'manifest', href: '/site.webmanifest' },
];

export type ProductPageMeta = {
  path: string;
  title: string;
  description: string;
  shareTitle: string;
  shareDescription: string;
  type: 'website' | 'article';
  themeColor: string;
  colorScheme: string;
  extra?: MetaDescriptor[];
};

/** schema.org WebPage data for a page that sits one level below the homepage. */
export function webPageStructuredData(page: {
  path: string;
  name: string;
  description: string;
  dateModified: string;
}) {
  const url = `${siteUrl}${page.path}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: page.name,
    description: page.description,
    dateModified: page.dateModified,
    inLanguage: 'en-US',
    isPartOf: { '@id': `${siteUrl}/#website` },
    about: { '@id': `${siteUrl}/#software` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Crest', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: page.name.replace(/^Crest /, ''), item: url },
      ],
    },
  };
}

/** The head a Crest Help article needs for search, sharing and agents. */
export function helpPageMeta(page: {
  url: string;
  title: string;
  description?: string;
  image: string;
  markdownUrl: string;
}): MetaDescriptor[] {
  const image = `${siteUrl}${page.image}`;
  const description = page.description ?? '';
  return [
    { title: page.title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: page.url },
    // llms.txt's link relations: this article's Markdown, and the index that covers it.
    { tagName: 'link', rel: 'alternate', type: 'text/markdown', href: `${siteUrl}${page.markdownUrl}` },
    { tagName: 'link', rel: 'describedby', type: 'text/plain', href: `${siteUrl}/llms.txt` },
    { property: 'og:site_name', content: 'Crest' },
    { property: 'og:locale', content: 'en_US' },
    { property: 'og:type', content: 'article' },
    { property: 'og:url', content: page.url },
    { property: 'og:title', content: page.title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: page.title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
  ];
}

/** schema.org data for a Crest Help article, placed under Help in the site's breadcrumbs. */
export function helpArticleStructuredData(page: {
  url: string;
  title: string;
  description?: string;
  image: string;
  dateModified?: string;
}) {
  const helpUrl = `${siteUrl}/docs/`;
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': `${page.url}#article`,
    url: page.url,
    headline: page.title,
    description: page.description,
    image: `${siteUrl}${page.image}`,
    dateModified: page.dateModified,
    inLanguage: 'en-US',
    isPartOf: { '@id': `${siteUrl}/#website` },
    about: { '@id': `${siteUrl}/#software` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Crest', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Help', item: helpUrl },
        ...(page.url === helpUrl ? [] : [{ '@type': 'ListItem', position: 3, name: page.title, item: page.url }]),
      ],
    },
  };
}

/** The head every product page shares: search, social cards and app identity. */
export function productPageMeta(page: ProductPageMeta): MetaDescriptor[] {
  const url = `${siteUrl}${page.path}`;
  return [
    { title: page.title },
    { name: 'theme-color', content: page.themeColor },
    { name: 'color-scheme', content: page.colorScheme },
    { name: 'description', content: page.description },
    { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
    { name: 'author', content: 'Paul Davis' },
    { name: 'application-name', content: 'Crest' },
    { name: 'apple-mobile-web-app-title', content: 'Crest' },
    ...(page.extra ?? []),
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:site_name', content: 'Crest' },
    { property: 'og:locale', content: 'en_US' },
    { property: 'og:type', content: page.type },
    { property: 'og:url', content: url },
    { property: 'og:title', content: page.shareTitle },
    { property: 'og:description', content: page.shareDescription },
    { property: 'og:image', content: ogImage },
    { property: 'og:image:type', content: 'image/jpeg' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: ogImageAlt },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: page.shareTitle },
    { name: 'twitter:description', content: page.shareDescription },
    { name: 'twitter:image', content: ogImage },
    { name: 'twitter:image:alt', content: ogImageAlt },
  ];
}
