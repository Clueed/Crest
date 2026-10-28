import type { Route } from './+types/docs';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { docs, source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { github } from '@/lib/site-links';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { useMDXComponents } from '@/components/mdx';
import { use } from 'react';
import { getPageImageUrl, getPageMarkdownUrl, gitConfig, siteUrl } from '@/lib/shared';

const appTitle = 'Crest Help';

export async function loader({ params }: Route.LoaderArgs) {
  const slugs = params['*'].split('/').filter((v) => v.length > 0);
  const page = source.getPage(slugs);
  if (!page) throw new Response('Not found', { status: 404 });

  return {
    path: page.path,
    markdownUrl: getPageMarkdownUrl(page).url,
    pageTree: await source.serializePageTree(source.getPageTree()),
    imagePath: getPageImageUrl(page).url,
    canonicalUrl: `${siteUrl}${page.url}/`,
  };
}

function Content({
  path,
  markdownUrl,
  imagePath,
  canonicalUrl,
}: {
  path: string;
  markdownUrl: string;
  imagePath: string;
  canonicalUrl: string;
}) {
  const page = docs.getPage(path);
  if (!page) throw new Error(`unknown page: ${path}`);

  // content is loaded lazily, call `page.preload()` in your loader to avoid suspending
  const { toc } = use(page.load());
  const Mdx = page.body;

  return (
    <DocsPage toc={toc}>
      <title>{page.title === appTitle ? page.title : `${page.title} | ${appTitle}`}</title>
      <link rel="canonical" href={canonicalUrl} />
      <meta name="description" content={page.description} />
      <meta property="og:image" content={`${siteUrl}${imagePath}`} />
      <DocsTitle>{page.title}</DocsTitle>
      <DocsDescription>{page.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b -mt-4 pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`${github}/blob/${gitConfig.branch}/Website/content/docs/${path}`}
        />
      </div>
      <DocsBody>
        <Mdx components={useMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { pageTree, path, markdownUrl, imagePath, canonicalUrl } = useFumadocsLoader(loaderData);

  return (
    <DocsLayout {...baseOptions()} tree={pageTree}>
      <Content
        path={path}
        markdownUrl={markdownUrl}
        imagePath={imagePath}
        canonicalUrl={canonicalUrl}
      />
    </DocsLayout>
  );
}
