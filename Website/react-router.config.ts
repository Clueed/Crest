import type { Config } from '@react-router/dev/config';
import { glob } from 'node:fs/promises';
import { createGetUrl, getSlugs } from 'fumadocs-core/source';
import { docsRoute, getPageImageUrl, getPageMarkdownUrl, legacyDocsRoute, renamedDocs } from './app/lib/shared';

const getUrl = createGetUrl(docsRoute);
const getLegacyUrl = createGetUrl(legacyDocsRoute);

export default {
  ssr: false,
  async prerender({ getStaticPaths }) {
    const paths: string[] = [...getStaticPaths()];

    for await (const entry of glob('**/*.{md,mdx}', { cwd: 'content/docs' })) {
      const slugs = getSlugs(entry);
      paths.push(
        getUrl(slugs),
        // Articles link with a trailing slash. A link followed in the browser loads the
        // article's data from `<url>/_.data` rather than `<url>.data`, so write both.
        `${getUrl(slugs)}/`,
        getLegacyUrl(slugs),
        getPageImageUrl({ slugs }).url,
        getPageMarkdownUrl({ slugs }).url,
      );
    }

    for (const slug of Object.keys(renamedDocs)) {
      paths.push(getLegacyUrl(slug.split('/')));
    }

    return paths;
  },
} satisfies Config;
