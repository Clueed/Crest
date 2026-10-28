import { index, layout, route, type RouteConfig } from '@react-router/dev/routes';
import { globSync } from 'node:fs';
import { getSlugs } from 'fumadocs-core/source';
import { getPageMarkdownUrl } from './lib/shared';

// Each article's Markdown sits beside it at `/docs/<article>.md`. A route can't match a
// suffix, so every article gets its own route.
const markdownRoutes = globSync('**/*.{md,mdx}', { cwd: 'content/docs' }).map((file) => {
  const path = getPageMarkdownUrl({ slugs: getSlugs(file) }).url;
  return route(path.slice(1), 'llms/mdx.ts', { id: `markdown${path}` });
});

export default [
  // Product pages have no Fumadocs chrome.
  index('routes/home.tsx'),
  route('privacy', 'routes/privacy.tsx'),
  route('support', 'routes/support.tsx'),
  route('sitemap.xml', 'routes/sitemap.ts'),

  layout('routes/fumadocs.tsx', [
    route('docs/*', 'routes/docs.tsx'),
    route('*', 'routes/not-found.tsx'),
  ]),
  route('guides/*', 'routes/legacy-docs.tsx'),
  route('api/search', 'routes/search.ts'),
  route('og/docs/*', 'routes/og.docs.tsx'),

  // LLM integration:
  route('llms.txt', 'llms/index.ts'),
  route('llms-full.txt', 'llms/full.ts'),
  ...markdownRoutes,
] satisfies RouteConfig;
