import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'Crest';
export const siteUrl = 'https://crestbrowser.com';
export const docsRoute = '/guides';
export const docsImageRoute = '/og/guides';
export const docsContentRoute = '/llms.mdx/guides';

export const gitConfig = {
  user: 'pauljoda',
  repo: 'Crest',
  branch: 'main',
};

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.webp'];

  return { segments, url: getImageUrl(segments, page.locale) };
}
