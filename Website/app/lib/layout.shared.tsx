import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { github, isExternal, links } from './site-links';
import { appName } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <img src="/assets/crest-logo.svg" alt="" width={22} height={22} />
          {appName} Help
        </>
      ),
      url: '/docs',
    },
    links: [links.home, links.macDownload, links.support].map((link) => ({
      text: link.text,
      url: link.url,
      external: isExternal(link.url),
    })),
    githubUrl: github,
  };
}
