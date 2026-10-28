import { isRouteErrorResponse, Outlet } from 'react-router';
import NotFound from './not-found';
import { RootProvider } from 'fumadocs-ui/provider/react-router';
import type { Route } from './+types/fumadocs';
import type { PageHandle } from '@/root';
import SearchDialog from '@/components/search';

export const handle: PageHandle = { htmlClassName: 'help', bodyClassName: 'flex flex-col min-h-screen' };

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RootProvider search={{ SearchDialog }} theme={{ enableColorScheme: false }}>
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
