'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'fumadocs-ui/provider/base';

/** A clip's first frame, as `vite.config.ts` builds it. */
interface Poster {
  src: string;
  w: number;
  h: number;
}

/**
 * A help clip, framed on the page background of the current theme.
 *
 * The prerendered page knows no theme, so the clip picks its video only once
 * it nears the viewport in the browser; a reader downloads one theme's clip,
 * and only when they scroll to it. It plays while in view.
 */
export function Clip({
  src,
  dark,
  poster,
  darkPoster,
  label,
}: {
  src: string;
  dark: string;
  poster: Poster;
  darkPoster: Poster;
  label: string;
}) {
  const { resolvedTheme } = useTheme();
  const video = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const nearing = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        nearing.disconnect();
      },
      { rootMargin: '200px' },
    );
    const showing = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.5 });
    nearing.observe(element);
    showing.observe(element);
    return () => {
      nearing.disconnect();
      showing.disconnect();
    };
  }, []);

  const videoSrc = near ? (isDark ? dark : src) : undefined;
  useEffect(() => {
    const element = video.current;
    if (!element || !videoSrc) return;
    if (inView && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.play().catch(() => {});
    } else {
      element.pause();
    }
  }, [inView, videoSrc]);

  return (
    <video
      ref={video}
      src={videoSrc}
      poster={near ? (isDark ? darkPoster : poster).src : undefined}
      width={poster.w}
      height={poster.h}
      aria-label={label}
      className="rounded-lg"
      preload="auto"
      muted
      loop
      playsInline
      controls
    />
  );
}
