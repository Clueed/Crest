import type { ComponentProps } from 'react';
import defaultMdxComponents from 'fumadocs-ui/mdx';

/** An article image as `vite.config.ts` builds it: a srcset per format and the fallback. */
export interface ImageVariants {
  sources: Record<string, string>;
  img: { src: string; w: number; h: number };
}

/**
 * An article image, served as AVIF with a WebP fallback at the widths the
 * build made. Captures are Retina, so an image shows at half its pixel width,
 * as large as it looks in the app, and never wider than the column. Images
 * load lazily except the first in an article, which the build marks with a
 * high fetch priority.
 */
export function Picture({ src, ...props }: Omit<ComponentProps<'img'>, 'src'> & { src?: string | ImageVariants }) {
  if (typeof src !== 'object') return <defaultMdxComponents.img src={src} {...props} />;
  const first = props.fetchPriority === 'high';
  const width = Math.round(src.img.w / 2);
  const sizes = `(max-width: 768px) 100vw, (max-width: 1200px) min(70vw, ${width}px), ${Math.min(width, 900)}px`;
  return (
    <picture>
      {Object.entries(src.sources).map(([format, srcSet]) => (
        <source key={format} type={`image/${format}`} srcSet={srcSet} sizes={sizes} />
      ))}
      <img
        src={src.img.src}
        width={width}
        height={Math.round(src.img.h / 2)}
        loading={first ? 'eager' : 'lazy'}
        decoding="async"
        className="mx-auto rounded-lg"
        {...props}
      />
    </picture>
  );
}
