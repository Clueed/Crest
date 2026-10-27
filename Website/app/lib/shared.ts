import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'Crest';
export const siteUrl = 'https://crestbrowser.com';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';
/** Help articles lived here before they moved to `docsRoute`; each old URL redirects. */
export const legacyDocsRoute = '/guides';
/** Old `legacyDocsRoute` pages whose article now has another name. */
export const renamedDocs: Record<string, string> = {
  'onepassword-coming-soon': 'onepassword',
};

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
