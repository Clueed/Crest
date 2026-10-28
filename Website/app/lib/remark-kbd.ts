import type { Parent, Root, RootContent } from 'mdast';
import type { MdxJsxTextElement } from 'mdast-util-mdx-jsx';
import { visit } from 'unist-util-visit';

/**
 * Keeps `<kbd>Command-N</kbd>` in plain Markdown articles. MDX reads it as an element already;
 * Markdown parses it as raw HTML, which the site does not render, so this turns it into the
 * same element.
 */
export function remarkKbd() {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (!('children' in node)) return;
      const parent = node as Parent;
      for (let start = 0; start < parent.children.length; start++) {
        if (!isTag(parent.children[start], '<kbd>')) continue;
        const end = parent.children.findIndex((child, index) => index > start && isTag(child, '</kbd>'));
        if (end < 0) break;
        const open = parent.children[start].position;
        const close = parent.children[end].position;
        const element: MdxJsxTextElement = {
          type: 'mdxJsxTextElement',
          name: 'kbd',
          attributes: [],
          children: parent.children.slice(start + 1, end) as MdxJsxTextElement['children'],
          // Agents' Markdown is cut from the source by position, so the element keeps the tags'.
          position: open && close && { start: open.start, end: close.end },
        };
        parent.children.splice(start, end - start + 1, element);
      }
    });
  };
}

function isTag(node: RootContent | undefined, tag: string) {
  return node?.type === 'html' && node.value.trim().toLowerCase() === tag;
}
