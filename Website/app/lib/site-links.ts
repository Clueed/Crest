import { gitConfig } from './shared';

/** A link in the site's navigation. `url` starting with `/` stays on this site. */
export type SiteLink = { text: string; url: string };

export const github = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

export const links = {
  home: { text: 'Product site', url: '/' },
  features: { text: 'Features', url: '/#tour' },
  crests: { text: 'Crests', url: '/#crests' },
  arc: { text: 'From Arc', url: '/#arc' },
  devices: { text: 'Devices', url: '/#devices' },
  importing: { text: 'Import', url: '/#import' },
  get: { text: 'Download', url: '/#get' },
  help: { text: 'Help & docs', url: '/docs/' },
  support: { text: 'Support', url: '/support/' },
  privacy: { text: 'Privacy', url: '/privacy/' },
  github: { text: 'GitHub', url: github },
  macDownload: { text: 'Download for Mac', url: `${github}/releases/latest` },
  macReleases: { text: 'Mac releases', url: `${github}/releases` },
  issues: { text: 'GitHub Issues', url: `${github}/issues/new/choose` },
  securityReport: { text: 'private report', url: `${github}/security/advisories/new` },
  appStore: { text: 'App Store', url: 'https://apps.apple.com/us/app/crest-browser/id6797335023' },
  testFlight: { text: 'TestFlight', url: 'https://testflight.apple.com/join/vV1CM49Q' },
  reddit: { text: 'Reddit', url: 'https://www.reddit.com/r/CrestBrowser' },
  discord: { text: 'Discord', url: 'https://discord.gg/gjrM5qMB6x' },
  donate: { text: 'Support open source software', url: 'https://ko-fi.com/pauljoda/tiers' },
} satisfies Record<string, SiteLink>;

/** The homepage sections the header lists on wide screens. */
export const sectionLinks: SiteLink[] = [links.features, links.crests, links.arc, links.devices];

/** The header's Links menu. */
export const menuLinks: SiteLink[] = [
  links.macReleases,
  links.reddit,
  links.discord,
  links.support,
  links.privacy,
];

/** Every page's footer. */
export const footerLinks: SiteLink[] = [
  ...sectionLinks,
  links.importing,
  links.help,
  links.support,
  links.privacy,
  links.github,
  links.reddit,
  links.discord,
  links.donate,
];

export function isExternal(url: string) {
  return !url.startsWith('/');
}
