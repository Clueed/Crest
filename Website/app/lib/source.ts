import { llms, loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';
import { docsRoute } from './shared';

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
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: docsRoute,
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`,
});
