import type { Config } from '@react-router/dev/config';
import { glob } from 'node:fs/promises';
import { createGetUrl, getSlugs } from 'fumadocs-core/source';
import { docsRoute, getPageImageUrl, getPageMarkdownUrl, legacyDocsRoute } from './app/lib/shared';

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
        getLegacyUrl(slugs),
        getPageImageUrl({ slugs }).url,
        getPageMarkdownUrl({ slugs }).url,
      );
    }

    return paths;
  },
} satisfies Config;
