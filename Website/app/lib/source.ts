import { llms, loader } from 'fumadocs-core/source';
import { applyMdxPreset } from 'fumadocs-mdx/config';
import { defineDocs } from 'fumadocs-mdx/macro';
import { remarkAlerts } from './remark-alerts';
import { remarkKbd } from './remark-kbd';
import { docsRoute, getPageMarkdownUrl, siteUrl } from './shared';

// A page's date is its last content edit. Renames are skipped, so moving or
// regrouping help articles does not mark every page as updated. Only the
// build evaluates this, so the Node module never reaches the browser.
function lastContentEdit(filePath: string) {
  const { execFileSync } = process.getBuiltinModule('node:child_process');
  try {
    const date = execFileSync('git', [
      'log', '-1', '--follow', '--diff-filter=AM', '--format=%aI', '--', filePath,
    ], { encoding: 'utf8' }).trim();
    return date ? new Date(date) : undefined;
  } catch {
    return undefined;
  }
}

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    async: true,
    // The macro accepts a date function at build time but types the option as a flag.
    lastModified: lastContentEdit as unknown as true,
    mdxOptions: applyMdxPreset({ remarkPlugins: (plugins) => [remarkAlerts, remarkKbd, ...plugins] }),
    postprocess: {
      // Agents read each article's Markdown; Fumadocs' `[#id]` heading suffixes would only be noise.
      includeProcessedMarkdown: { headingIds: false },
    },
  },
});

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: docsRoute,
});

export const docsLlms = llms(source, {
  renderPage: async (page) =>
    [
      `# ${page.data.title}`,
      page.data.description && `> ${page.data.description}`,
      `Source: ${siteUrl}${page.url}/`,
      await page.data.getText('processed'),
    ]
      .filter(Boolean)
      .join('\n\n'),
});

/** `llms.txt`: the help index, with each article linked to its Markdown at its full address. */
export async function llmsIndex() {
  const markdownUrls = new Map(source.getPages().map((page) => [page.url, getPageMarkdownUrl(page).url]));
  const index = await docsLlms.index();
  return index.replace(/\]\((\/[^)\s]*)\)/g, (_, url: string) => `](${siteUrl}${markdownUrls.get(url) ?? url})`);
}
