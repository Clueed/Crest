import { source } from '@/lib/source';
import { siteUrl } from '@/lib/shared';

type Entry = { path: string; changefreq: string; priority: string };

const productPages: Entry[] = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/privacy/', changefreq: 'yearly', priority: '0.6' },
  { path: '/support/', changefreq: 'monthly', priority: '0.7' },
];

export function loader() {
  const guides: Entry[] = source.getPages().map((page) => ({
    path: `${page.url}/`,
    changefreq: 'weekly',
    priority: page.url === '/docs' ? '0.8' : '0.7',
  }));

  const urls = [...productPages, ...guides]
    .map(
      (entry) =>
        `  <url>\n    <loc>${siteUrl}${entry.path}</loc>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`,
    )
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
}
