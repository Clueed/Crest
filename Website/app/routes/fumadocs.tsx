import { isRouteErrorResponse, Outlet } from 'react-router';
import NotFound from './not-found';
import { RootProvider } from 'fumadocs-ui/provider/react-router';
import type { Route } from './+types/fumadocs';
import type { PageHandle } from '@/root';
import SearchDialog from '@/components/search';
import { siteIcons } from '@/lib/page-meta';
import appStylesheet from '@/app.css?url';

export const handle: PageHandle = { bodyClassName: 'flex flex-col min-h-screen' };

export const links: Route.LinksFunction = () => [
  { rel: 'stylesheet', href: appStylesheet },
  ...siteIcons,
];

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RootProvider search={{ SearchDialog }} theme={{ enabled: false }}>
      {children}
    </RootProvider>
  );
}

export default function FumadocsLayout() {
  return (
    <Providers>
      <Outlet />
    </Providers>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <Providers>
        <NotFound />
      </Providers>
    );
  }
  throw error;
}
