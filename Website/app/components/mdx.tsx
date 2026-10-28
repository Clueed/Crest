import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

// Numbered lists in help articles are procedures, so they render as steps.
function StepList({ className, ...props }: ComponentProps<'ol'>) {
  return (
    <ol
      className={cn('fd-steps list-none *:fd-step *:ps-1 *:min-h-8 *:my-4', className)}
      {...props}
    />
  );
}

// Apple's names for keys, as articles write them, and the symbols on Mac keyboards.
const keySymbols: Record<string, string> = {
  Command: '⌘',
  Option: '⌥',
  Shift: '⇧',
  Control: '⌃',
  Tab: '⇥',
  Return: '↩',
  Delete: '⌫',
  Escape: 'esc',
  Up: '↑',
  Down: '↓',
  Left: '←',
  Right: '→',
};
const modifierPrefix = /^(Command|Option|Shift|Control)-/;

/** The keys of a shortcut written the Apple way, such as `Option-Command-Up Arrow`. */
function shortcutKeys(shortcut: string) {
  const keys: string[] = [];
  let rest = shortcut;
  for (let match = modifierPrefix.exec(rest); match && rest.length > match[0].length; match = modifierPrefix.exec(rest)) {
    keys.push(match[1]);
    rest = rest.slice(match[0].length);
  }
  keys.push(rest);
  return keys.map((key) =>
    key
      .split('/')
      .map((part) => keySymbols[part.replace(/ Arrow$/, '')] ?? part)
      .join('/'),
  );
}

const keyCap =
  'inline-block min-w-[1.75em] rounded-md border border-fd-border bg-fd-card px-1.5 text-center font-sans text-[0.8125em] font-medium leading-[1.6] text-fd-foreground shadow-[inset_0_-1.5px_0_var(--color-fd-border)]';

// `<kbd>Shift-Command-T</kbd>` shows each key as a key cap; screen readers hear the words.
function Kbd({ children, className, ...props }: ComponentProps<'kbd'>) {
  const shortcut = String(children);
  return (
    <kbd className={cn('not-prose inline-flex gap-0.5 whitespace-nowrap align-baseline', className)} {...props}>
      <span className="sr-only">{shortcut}</span>
      {shortcutKeys(shortcut).map((key, index) => (
        <kbd key={index} className={keyCap} aria-hidden>
          {key}
        </kbd>
      ))}
    </kbd>
  );
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ol: StepList,
    kbd: Kbd,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
