import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'Crest';
export const siteUrl = 'https://crestbrowser.com';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
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

/** An article's Markdown for agents: its address with `.md`, such as `/docs/link-routing.md`. */
export function getPageMarkdownUrl(page: { slugs: string[] }) {
  return { url: `${[docsRoute, ...page.slugs].join('/')}.md` };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.webp'];

  return { segments, url: getImageUrl(segments, page.locale) };
}
