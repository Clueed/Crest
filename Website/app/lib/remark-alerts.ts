import type { Blockquote, PhrasingContent, Root } from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import { visit } from 'unist-util-visit';

/** GitHub's alert kinds and the Fumadocs callout each one renders as. */
const calloutTypes: Record<string, string> = {
  note: 'info',
  tip: 'idea',
  important: 'info',
  warning: 'warning',
  caution: 'error',
};

const marker = /^\[!(\w+)\][ \t]*/;

/**
 * Renders GitHub alerts as Fumadocs callouts, so articles stay plain Markdown:
 *
 * ```md
 * > [!WARNING] Optional title
 * > The callout's text.
 * ```
 *
 * Text after the marker, up to the end of its line, is the callout's title.
 */
export function remarkAlerts() {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node) => {
      const [first, ...rest] = node.children;
      const lead = first?.type === 'paragraph' ? first.children[0] : undefined;
      if (first?.type !== 'paragraph' || lead?.type !== 'text') return;
      const match = marker.exec(lead.value);
      const type = match && calloutTypes[match[1].toLowerCase()];
      if (!type) return;

      // Split the first paragraph at its first line break: the title before it, the body after.
      const inline: PhrasingContent[] = [{ ...lead, value: lead.value.slice(match[0].length) }, ...first.children.slice(1)];
      const title: PhrasingContent[] = [];
      const body: PhrasingContent[] = [];
      for (const child of inline) {
        if (body.length > 0 || title.at(-1)?.type === 'break') {
          body.push(child);
        } else if (child.type === 'break') {
          title.push(child);
        } else if (child.type === 'text' && child.value.includes('\n')) {
          const end = child.value.indexOf('\n');
          title.push({ type: 'text', value: child.value.slice(0, end) }, { type: 'break' });
          body.push({ type: 'text', value: child.value.slice(end + 1) });
        } else {
          title.push(child);
        }
      }
      if (title.at(-1)?.type === 'break') title.pop();
      const titled = title.some((child) => child.type !== 'text' || child.value.trim());

      const description: Blockquote['children'] = [
        ...(titled ? [] : [{ type: 'paragraph' as const, children: [...title, ...body] }]),
        ...(titled && body.length > 0 ? [{ type: 'paragraph' as const, children: body }] : []),
        ...rest,
      ];
      const children = [
        ...(titled ? [element('CalloutTitle', title)] : []),
        element('CalloutDescription', description),
      ];

      Object.assign(node, {
        type: 'mdxJsxFlowElement',
        name: 'CalloutContainer',
        attributes: [{ type: 'mdxJsxAttribute', name: 'type', value: type }],
        children,
      } satisfies MdxJsxFlowElement);
    });
  };
}

/** A component element; the title holds inline content, as Fumadocs' own admonitions do. */
function element(name: string, children: (Blockquote['children'][number] | PhrasingContent)[]): MdxJsxFlowElement {
  return { type: 'mdxJsxFlowElement', name, attributes: [], children: children as MdxJsxFlowElement['children'] };
}
