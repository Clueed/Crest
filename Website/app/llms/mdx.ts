import type { Route } from './+types/mdx';
import { docsLlms, source } from '@/lib/source';
import { docsRoute } from '@/lib/shared';

export async function loader({ url }: Route.LoaderArgs) {
  // `/docs/link-routing.md` is the Markdown of `/docs/link-routing`.
  const path = url.pathname.slice(docsRoute.length, -'.md'.length);
  const page = source.getPage(path.split('/').filter((v) => v.length > 0));
  if (!page) {
    return new Response('not found', { status: 404 });
  }
  return new Response(await docsLlms.page(page), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
