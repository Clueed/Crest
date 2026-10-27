import type { Route } from './+types/legacy-docs';
import { docsRoute, renamedDocs, siteUrl } from '@/lib/shared';

/** The `docsRoute` address of an article requested at its old `legacyDocsRoute` address. */
function docsPath(splat: string | undefined) {
  const slugs = (splat ?? '').split('/').filter((v) => v.length > 0);
  const renamed = renamedDocs[slugs.join('/')];
  return [docsRoute, ...(renamed ? [renamed] : slugs)].join('/') + '/';
}

export function meta({ params }: Route.MetaArgs) {
  const target = docsPath(params['*']);

  return [
    { title: 'Moved · Crest Help' },
    { name: 'robots', content: 'noindex' },
    { tagName: 'link', rel: 'canonical', href: `${siteUrl}${target}` },
    { httpEquiv: 'refresh', content: `0; url=${target}` },
  ];
}

export default function LegacyDocs({ params }: Route.ComponentProps) {
  const target = docsPath(params['*']);

  return (
    <>
      {/* Runs while the static page parses, before the refresh, and keeps the #section. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `location.replace(${JSON.stringify(target)} + location.hash);`,
        }}
      />
      <p>
        This page moved to <a href={target}>crestbrowser.com{target}</a>.
      </p>
    </>
  );
}
