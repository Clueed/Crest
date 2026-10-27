import { useEffect, useRef, useState, type ComponentProps, type ElementType } from 'react';
import { cn } from '@/lib/cn';
import { useHome } from './home-state';

type RevealProps<T extends ElementType> = { as?: T } & ComponentProps<T>;

/** Rises into place the first time it scrolls into view. Still pages show it at once. */
export function Reveal<T extends ElementType = 'div'>({ as, className, ...props }: RevealProps<T>) {
  const Tag: ElementType = as ?? 'div';
  const ref = useRef<HTMLElement>(null);
  const { still } = useHome();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    if (still || !('IntersectionObserver' in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [still, shown]);

  return (
    <Tag
      ref={ref}
      data-shown={shown || undefined}
      className={cn(
        'translate-y-3.5 opacity-0 transition-[opacity,translate] duration-700 ease-soft data-shown:translate-y-0 data-shown:opacity-100 noanim:translate-y-0 noanim:opacity-100',
        className,
      )}
      {...props}
    />
  );
}
