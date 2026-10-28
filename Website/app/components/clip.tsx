'use client';

import { useTheme } from 'fumadocs-ui/provider/base';

/** A help clip, framed on the page background of the current theme. */
export function Clip({ src, dark, label }: { src: string; dark?: string; label: string }) {
  const { resolvedTheme } = useTheme();
  return (
    <video
      src={resolvedTheme === 'dark' && dark ? dark : src}
      aria-label={label}
      className="rounded-lg"
      autoPlay
      muted
      loop
      playsInline
      controls
    />
  );
}
