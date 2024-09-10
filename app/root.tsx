import { json, type LoaderFunctionArgs } from '@remix-run/node';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import { TooltipProvider } from './components/ui/tooltip';
import { getUser } from './lib/auth.server';
import './tailwind.css';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);

  return json({ user });
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-background font-sans text-foreground antialiased [font-synthesis:none]">
        <TooltipProvider>{children}</TooltipProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
