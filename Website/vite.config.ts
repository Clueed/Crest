import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { fumadocsMdx } from 'fumadocs-mdx/vite';
import { imagetools } from 'vite-imagetools';

// The docs column is at most 900 CSS pixels wide; most readers have 2x screens.
const imageWidths = [900, 1800];
const imageQuality = '60';

export default defineConfig({
  plugins: [
    fumadocsMdx(),
    // Article images ship as AVIF with a WebP fallback, sized for the column.
    imagetools({
      include: /\/content\/docs\/.+\.png(\?.*)?$/,
      async defaultDirectives(url, metadata) {
        if (url.searchParams.size > 0) return new URLSearchParams();
        // A clip's poster frame: one AVIF the size of the clip.
        if (url.pathname.endsWith('.poster.png')) {
          return new URLSearchParams({ format: 'avif', quality: imageQuality, as: 'img' });
        }
        const { width = imageWidths[0] } = await metadata();
        const widths = [...new Set(imageWidths.map((w) => Math.min(w, width)))];
        return new URLSearchParams({
          w: widths.join(';'),
          format: 'avif;webp',
          quality: imageQuality,
          as: 'docsPicture',
        });
      },
      extendOutputFormats: (builtins) => ({
        ...builtins,
        // The picture output plus `src`, so the processed Markdown that
        // fumadocs builds from `image.src ?? image` still gets a URL.
        docsPicture: (args) => (images) => {
          const picture = builtins.picture(args)(images) as { img: { src: string } };
          return { ...picture, src: picture.img.src };
        },
      }),
    }),
    tailwindcss(),
    reactRouter(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
