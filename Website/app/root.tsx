import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
} from 'react-router';
import type { Route } from './+types/root';
import { siteIcons } from '@/lib/page-meta';
import appStylesheet from './app.css?url';

export const links: Route.LinksFunction = () => [
  { rel: 'stylesheet', href: appStylesheet },
  ...siteIcons,
];

/** A route sets `handle.bodyClassName` when its stylesheet styles the body. */
export type PageHandle = { bodyClassName?: string };

function useBodyClassName() {
  const matches = useMatches();
  return matches
    .map((match) => (match.handle as PageHandle | undefined)?.bodyClassName)
    .filter(Boolean)
    .at(-1);
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={useBodyClassName()}>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? 'Not Found' : 'Error';
    details = error.statusText;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="page-width py-16">
      <h1 className="mb-2 text-4xl">{message}</h1>
      <p className="text-ink-2">{details}</p>
      {stack && (
        <pre className="mt-6 w-full overflow-x-auto p-4 text-sm">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
