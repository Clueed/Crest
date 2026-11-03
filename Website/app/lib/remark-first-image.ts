import type { Root } from 'mdast';
import { visit, EXIT } from 'unist-util-visit';

/**
 * Gives an article's first image a high fetch priority so it loads with the
 * page; `Picture` lazy-loads the rest. Runs after fumadocs turns Markdown
 * images into `<img>` elements.
 */
export function remarkFirstImage() {
  return (tree: Root) => {
    visit(tree, ['mdxJsxFlowElement', 'mdxJsxTextElement'], (node) => {
      if (!('name' in node) || node.name !== 'img') return;
      node.attributes.push({ type: 'mdxJsxAttribute', name: 'fetchPriority', value: 'high' });
      return EXIT;
    });
  };
}
