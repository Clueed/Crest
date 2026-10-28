import type { Route } from './+types/docs';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  PageLastUpdate,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { docs, source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { github } from '@/lib/site-links';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { useMDXComponents } from '@/components/mdx';
import { SkipLink } from '@/components/site-chrome';
import { use, ViewTransition } from 'react';
import { helpArticleStructuredData, helpPageMeta } from '@/lib/page-meta';
import { getPageImageUrl, getPageMarkdownUrl, gitConfig, siteUrl } from '@/lib/shared';

const appTitle = 'Crest Help';

export async function loader({ params }: Route.LoaderArgs) {
  const slugs = params['*'].split('/').filter((v) => v.length > 0);
  const page = source.getPage(slugs);
  if (!page) throw new Response('Not found', { status: 404 });

  return {
    path: page.path,
    title: page.data.title === appTitle ? appTitle : `${page.data.title} | ${appTitle}`,
    description: page.data.description,
    markdownUrl: getPageMarkdownUrl(page).url,
    pageTree: await source.serializePageTree(source.getPageTree()),
    imagePath: getPageImageUrl(page).url,
    canonicalUrl: `${siteUrl}${page.url}/`,
  };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [];
  return helpPageMeta({
    url: loaderData.canonicalUrl,
    title: loaderData.title,
    description: loaderData.description,
    image: loaderData.imagePath,
    markdownUrl: loaderData.markdownUrl,
  });
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
  const { toc, lastModified } = use(page.load());
  const Mdx = page.body;
  const structuredData = helpArticleStructuredData({
    url: canonicalUrl,
    title: page.title,
    description: page.description,
    image: imagePath,
    dateModified: lastModified?.toISOString(),
  });

  return (
    // Moving to another article slides the new one in, with its table of contents; the
    // sidebar and header stay put.
    <ViewTransition key={path} enter="article-enter" exit="article-exit" default="none">
      <DocsPage toc={toc}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
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
        {lastModified && <PageLastUpdate date={lastModified} />}
      </DocsPage>
    </ViewTransition>
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { pageTree, path, markdownUrl, imagePath, canonicalUrl } = useFumadocsLoader(loaderData);

  return (
    <>
      <SkipLink target="nd-page" />
      <DocsLayout {...baseOptions()} tree={pageTree} sidebar={{ prefetch: true }}>
        <Content
          path={path}
          markdownUrl={markdownUrl}
          imagePath={imagePath}
          canonicalUrl={canonicalUrl}
        />
      </DocsLayout>
    </>
  );
}
