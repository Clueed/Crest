import { cn } from '@/lib/cn';

/** A row of tabs in a pill, for picking one of a few views. Light sits on paper, dark on night. */
export function Segmented({
  label,
  items,
  selected,
  onSelect,
  light = false,
  className,
}: {
  label: string;
  items: string[];
  selected: number;
  onSelect: (index: number) => void;
  light?: boolean;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        'mx-auto flex w-max max-w-full flex-wrap justify-center gap-1 rounded-full p-[0.3rem]',
        light ? 'bg-ink/5 shadow-[inset_0_0_0_1px_var(--color-rule)]' : 'bg-white/7 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]',
        className,
      )}
    >
      {items.map((item, i) => (
        <button
          key={item}
          type="button"
          role="tab"
          aria-selected={i === selected}
          onClick={() => onSelect(i)}
          className={cn(
            'cursor-pointer rounded-full px-[0.85rem] py-[0.45rem] text-[0.85rem] font-medium',
            light
              ? 'hover:bg-ink/5 aria-selected:bg-ink aria-selected:text-white'
              : 'hover:bg-white/8 aria-selected:bg-[#f4f1ea] aria-selected:text-ink',
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
