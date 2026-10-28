import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { Clip } from './clip';
import { Picture } from './picture';

// Numbered lists in help articles are procedures, so they render as steps.
function StepList({ className, ...props }: ComponentProps<'ol'>) {
  return (
    <ol
      className={cn('fd-steps list-none *:fd-step *:ps-1 *:min-h-8 *:my-4', className)}
      {...props}
    />
  );
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ol: StepList,
    img: Picture,
    Clip,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
