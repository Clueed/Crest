import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { useHome } from './home-state';
import { Reveal } from './reveal';
import { Section, SectionHead } from './sections';
import { Segmented } from './segmented';

/**
 * Each device: its screenshot, where it rests in the stack and how it comes forward. The Mac
 * screenshot is drawn bare; the iPad and iPhone sit in a bezel with these radii.
 */
const devices = [
  {
    id: 'mac',
    name: 'Mac',
    caption: 'Chromium and WebKit, Chrome extensions, and Split View.',
    src: '/assets/crest-work-mac.png',
    alt: 'Crest on Mac with the Lion Work Space first, Winter Personal second, and Audience research open in the Launch Atlas folder',
    width: 2800,
    height: 1800,
    place: 'top-0 left-1/2 z-1 w-[76%] -translate-x-1/2 max-phone:w-[84%]',
    front: 'z-4 -translate-y-[2%]',
    bezel: null,
    image: 'rounded-[1.5%/2.3%] shadow-[0_30px_70px_-24px_rgb(0_0_0/0.55)]',
  },
  {
    id: 'ipad',
    name: 'iPad',
    caption: 'The sidebar beside the page, with resizable Split View.',
    src: '/assets/crest-work-ipad.png',
    alt: 'The same Work Space and Audience research page on iPad',
    width: 2420,
    height: 1668,
    place: 'bottom-0 left-0 z-2 w-[36%] max-phone:w-[46%]',
    front: 'z-4 translate-x-[6%] -translate-y-[6%] scale-105',
    bezel: 'rounded-[5.2%/7.5%] p-[2.6%]',
    image: 'rounded-[2.6%/3.8%]',
  },
  {
    id: 'iphone',
    name: 'iPhone',
    caption: 'Full-screen pages, with the sidebar a swipe away.',
    src: '/assets/crest-work-iphone-sidebar.png',
    alt: 'The same Work Space and Launch Atlas folder in the iPhone sidebar',
    width: 1206,
    height: 2622,
    place: 'right-[3%] bottom-0 z-3 w-[13%] max-phone:w-[20%]',
    front: 'z-4 -translate-x-[12%] -translate-y-[6%] scale-112',
    bezel: 'rounded-[15%/7%] p-[3.2%]',
    image: 'rounded-[12.5%/5.8%]',
  },
] as const;

type DeviceId = (typeof devices)[number]['id'];

const item = 'absolute cursor-pointer transition-[translate,scale,filter] duration-550 ease-soft noanim:transition-none';
const resting = 'brightness-96 saturate-85';
const bezel = 'overflow-hidden bg-[#111317] shadow-[0_30px_70px_-24px_rgb(0_0_0/0.55),inset_0_0_0_2px_#3a3d44]';

/** Mac, iPad and iPhone stacked; the one picked comes forward. */
export function DevicesSection() {
  const { params } = useHome();
  const [device, setDevice] = useState<DeviceId>('mac');

  useEffect(() => {
    const dev = devices.find((d) => d.id === params?.dev);
    if (dev) setDevice(dev.id);
  }, [params]);

  const front = (id: DeviceId) => device === id;

  return (
    <Section id="devices">
      <div className="page-width">
        <SectionHead center title="Mac, iPad, and iPhone." />
        <Reveal className="grid gap-[1.4rem]">
          <div className="relative aspect-[16/8.6] max-h-[70vh] max-phone:aspect-[4/3.6]">
            {devices.map((d) => {
              const image = (
                <img
                  src={d.src}
                  alt={d.alt}
                  width={d.width}
                  height={d.height}
                  loading="lazy"
                  decoding="async"
                  className={cn('block h-auto w-full', d.image)}
                />
              );
              return (
                <div key={d.id} onClick={() => setDevice(d.id)} className={cn(item, d.place, front(d.id) ? d.front : resting)}>
                  {d.bezel ? <div className={cn(bezel, d.bezel)}>{image}</div> : image}
                </div>
              );
            })}
          </div>
          <Segmented
            light
            label="Devices"
            items={devices.map((d) => d.name)}
            selected={devices.findIndex((d) => d.id === device)}
            onSelect={(i) => setDevice(devices[i].id)}
          />
          <div aria-live="polite" className="relative mx-auto min-h-[3.4em] max-w-[44rem] text-center">
            {devices.map((d) => (
              <p
                key={d.id}
                className={cn('absolute inset-0 m-0 text-ink-2 opacity-0 transition-opacity duration-400', front(d.id) && 'relative opacity-100')}
              >
                {d.caption}
              </p>
            ))}
          </div>
        </Reveal>
        <Reveal as="p" className="mx-auto mt-10 max-w-[44rem] border-t border-rule pt-6 text-center text-ink-2">
          Spaces, tabs, and folders sync through iCloud.
        </Reveal>
      </div>
    </Section>
  );
}
