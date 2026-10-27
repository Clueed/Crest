import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';

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
    links: [
      { text: 'Home', url: '/', external: true },
      { text: 'Download for Mac', url: 'https://github.com/pauljoda/Crest/releases/latest', external: true },
      { text: 'Support', url: '/support/', external: true },
    ],
    themeSwitch: { enabled: false },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
