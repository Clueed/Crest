import { index, layout, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  // Product pages carry their own stylesheets and no Fumadocs chrome.
  index('routes/home.tsx'),
  route('privacy', 'routes/privacy.tsx'),
  route('support', 'routes/support.tsx'),
  route('sitemap.xml', 'routes/sitemap.ts'),

  layout('routes/fumadocs.tsx', [
    route('guides/*', 'routes/docs.tsx'),
    route('*', 'routes/not-found.tsx'),
  ]),
  route('api/search', 'routes/search.ts'),
  route('og/guides/*', 'routes/og.docs.tsx'),

  // LLM integration:
  route('llms.txt', 'llms/index.ts'),
  route('llms-full.txt', 'llms/full.ts'),
  route('llms.mdx/guides/*', 'llms/mdx.ts'),
] satisfies RouteConfig;
