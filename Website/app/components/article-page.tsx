import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { isExternal } from '@/lib/site-links';
import { external, heroAttribute } from './site-chrome';

/** The small uppercase line above a heading. */
export function Eyebrow({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn('mb-4 text-[0.67rem] leading-[1.4] font-extrabold tracking-[0.19em] uppercase', className)}
      {...props}
    />
  );
}

/** The dark opening of the privacy and support pages: a headline beside three numbered points. */
export function ArticleHero({
  eyebrow,
  title,
  titleId,
  intro,
  points,
  pointsLabel,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  titleId: string;
  intro: ReactNode;
  points: { title: string; text: string }[];
  pointsLabel: string;
}) {
  return (
    <section
      {...heroAttribute}
      aria-labelledby={titleId}
      className="-mt-header grid min-h-[660px] items-center gap-[clamp(3rem,8vw,8rem)] bg-night px-[max(1.5rem,calc((100vw-1280px)/2))] pt-[calc(var(--spacing-header)+clamp(5rem,8vw,8rem))] pb-[clamp(5rem,8vw,8rem)] text-cream min-[1100px]:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] max-phone:min-h-0 max-phone:gap-12 max-phone:px-4 max-phone:pt-36 max-phone:pb-20"
    >
      <div className="min-w-0">
        <Eyebrow className="text-gold">{eyebrow}</Eyebrow>
        <h1
          id={titleId}
          className="mt-4 mb-8 max-w-[850px] text-[clamp(4.5rem,7.3vw,8rem)] leading-[0.86] font-normal tracking-[-0.055em] max-phone:text-[clamp(3.8rem,17vw,6rem)] max-[520px]:text-[clamp(3.4rem,17vw,4.8rem)] [&_em]:text-gold"
        >
          {title}
        </h1>
        <p className="max-w-[750px] text-[clamp(1rem,1.4vw,1.2rem)] leading-[1.75] text-cream/70">{intro}</p>
      </div>
      <div
        aria-label={pointsLabel}
        className="border-t border-cream/20 max-[1100px]:grid max-[1100px]:grid-cols-3 max-phone:grid-cols-1"
      >
        {points.map((point, i) => (
          <article
            key={point.title}
            className="grid min-h-[150px] grid-cols-[2.8rem_minmax(0,1fr)] content-center gap-x-4.5 gap-y-1.5 border-b border-cream/20 py-6 max-[1100px]:block max-[1100px]:min-h-[170px] max-[1100px]:border-r max-[1100px]:p-6 max-[1100px]:last:border-r-0 max-phone:grid max-phone:min-h-0 max-phone:grid-cols-[2.5rem_minmax(0,1fr)] max-phone:border-r-0 max-phone:px-0 max-phone:py-5"
          >
            <span className="row-span-2 block text-[0.65rem] font-extrabold tracking-[0.12em] text-gold">
              {String(i + 1).padStart(2, '0')}
            </span>
            <strong className="block font-serif text-[1.55rem] leading-none font-normal max-[1100px]:mt-7 max-[1100px]:mb-2 max-phone:m-0">
              {point.title}
            </strong>
            <p className="m-0 block text-[0.78rem] leading-[1.6] text-cream/55">{point.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/** The body of the privacy and support pages: a sticky list of sections beside the article. */
export function ArticleLayout({
  sections,
  navLabel,
  children,
}: {
  sections: { id: string; title: string }[];
  navLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="wide-width grid grid-cols-[220px_minmax(0,820px)] justify-start gap-[clamp(3rem,8vw,8rem)] pt-[clamp(4rem,7vw,7rem)] pb-32 max-phone:grid-cols-1 max-phone:gap-12 max-phone:pt-12">
      <aside
        aria-label={navLabel}
        className="sticky top-28 min-w-0 self-start max-phone:relative max-phone:top-auto max-phone:flex max-phone:flex-wrap max-phone:gap-x-4 max-phone:gap-y-1 max-phone:border-b max-phone:border-rule max-phone:pb-6"
      >
        <p className="mb-4 text-[0.68rem] font-extrabold tracking-[0.14em] uppercase max-phone:w-full">On this page</p>
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="block py-2 text-[0.82rem] text-ink/65 hover:text-coral"
          >
            {section.title}
          </a>
        ))}
      </aside>
      <article className="min-w-0">{children}</article>
    </div>
  );
}

/** Paragraph rhythm shared by the article's sections. */
const prose =
  '[&_p]:mb-4 [&_p]:leading-[1.78] [&_p_a]:underline [&_p_a]:underline-offset-[0.2em] [&_strong]:font-semibold';

/** One numbered section of the article. */
export function ArticleSection({
  id,
  index,
  eyebrow,
  title,
  children,
}: {
  id: string;
  index?: string;
  eyebrow?: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        'relative mb-18 scroll-mt-10 border-b border-rule pb-18 max-[520px]:mb-14 max-[520px]:pb-14 [&_p]:text-ink/72 [&_strong]:text-ink',
        prose,
      )}
    >
      {index && (
        <span className="mb-4 block text-[0.68rem] leading-[1.78] font-extrabold tracking-[0.15em] text-coral">{index}</span>
      )}
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-2.5 mb-6 max-w-[720px] text-[clamp(2.8rem,4.8vw,5rem)] leading-[0.92] font-normal tracking-[-0.042em] max-[520px]:text-[clamp(2.7rem,13vw,4rem)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** A dark aside within the article, set apart from the numbered sections. */
export function ArticleAside({
  id,
  label,
  note,
  title,
  children,
}: {
  id: string;
  label: string;
  note: string;
  title: ReactNode;
  children: ReactNode;
}) {
  const titleId = `${id}-title`;
  return (
    <aside
      id={id}
      aria-labelledby={titleId}
      className={cn(
        'mb-18 grid scroll-mt-10 grid-cols-[170px_minmax(0,1fr)] gap-[clamp(1.5rem,4vw,3.5rem)] border-b-8 border-gold bg-night p-[clamp(1.5rem,3vw,2.5rem)] text-cream max-phone:grid-cols-1 max-[520px]:p-5.5',
        '[&_code]:rounded-sm [&_code]:bg-gold [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.86em] [&_code]:text-ink [&_p]:text-cream/70 [&_strong]:text-cream [&_a:hover]:text-gold',
        prose,
      )}
    >
      <div>
        <span className="mb-2 block text-[0.62rem] font-extrabold tracking-[0.14em] text-gold uppercase">{label}</span>
        <strong className="font-serif text-xl leading-[1.1] font-normal">{note}</strong>
      </div>
      <div>
        <h2 id={titleId} className="mb-6 text-[clamp(2.4rem,4vw,4rem)] leading-[0.92] font-normal tracking-[-0.042em]">
          {title}
        </h2>
        {children}
      </div>
    </aside>
  );
}

/** A link to an outside source, underlined in gold. */
export function SourceLink({ className, children, ...props }: ComponentProps<'a'>) {
  const leaves = isExternal(props.href ?? '');
  return (
    <a
      {...(leaves && external)}
      className={cn(
        'mt-4 inline-flex w-fit max-w-full gap-2 border-b border-gold pb-1 text-[0.72rem] leading-[1.45] font-extrabold tracking-[0.04em] wrap-anywhere text-current hover:text-coral',
        className,
      )}
      {...props}
    >
      {children}
      <span aria-hidden="true">{leaves ? '↗' : '→'}</span>
    </a>
  );
}

/** A boxed note on how to reach someone. */
export function ContactNote({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-9 border border-l-4 border-rule border-l-coral bg-cream p-6 [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-[0.2em] [&_p]:m-0!">
      <span className="mb-2 block text-[0.67rem] font-extrabold tracking-[0.12em] text-ink uppercase">{label}</span>
      {children}
    </div>
  );
}
