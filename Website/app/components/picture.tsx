import type { ComponentProps } from 'react';
import defaultMdxComponents from 'fumadocs-ui/mdx';

/** An article image as `vite.config.ts` builds it: a srcset per format and the fallback. */
export interface ImageVariants {
  sources: Record<string, string>;
  img: { src: string; w: number; h: number };
}

const sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px';

/**
 * An article image, served as AVIF with a WebP fallback at the widths the
 * build made. Images load lazily except the first in an article, which the
 * build marks with a high fetch priority.
 */
export function Picture({ src, ...props }: Omit<ComponentProps<'img'>, 'src'> & { src?: string | ImageVariants }) {
  if (typeof src !== 'object') return <defaultMdxComponents.img src={src} {...props} />;
  const first = props.fetchPriority === 'high';
  return (
    <picture>
      {Object.entries(src.sources).map(([format, srcSet]) => (
        <source key={format} type={`image/${format}`} srcSet={srcSet} sizes={sizes} />
      ))}
      <img
        src={src.img.src}
        width={src.img.w}
        height={src.img.h}
        loading={first ? 'eager' : 'lazy'}
        decoding="async"
        className="rounded-lg"
        {...props}
      />
    </picture>
  );
}
