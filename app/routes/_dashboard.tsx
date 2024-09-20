import { ExitIcon } from '@radix-ui/react-icons';
import { Form, Outlet } from '@remix-run/react';
import { Logo } from '~/components/logo';
import { Button } from '~/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip';

export default function Component() {
  return (
    <>
      <nav className="fixed inset-y-0 left-0 z-10 flex w-14 flex-col border-r bg-background">
        <div className="flex flex-col items-center gap-4 px-2 py-4">
          <Logo className="h-9 w-auto flex-none" />
        </div>
        <div className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
          <LogoutForm />
        </div>
      </nav>
      <div className="isolate h-full pl-14">
        <Outlet />
      </div>
    </>
  );
}

function LogoutForm() {
  const label = 'Sign out';

  return (
    <Form method="post" action="/logout">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:bg-background hover:text-foreground"
            aria-label={label}
          >
            <ExitIcon className="size-5" aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    </Form>
  );
}
