import { Outlet } from '@remix-run/react';
import { Logo } from '~/components/logo';

export default function Component() {
  return (
    <div className="bg-background">
      <nav className="fixed inset-y-0 left-0 z-10 border-r bg-background">
        <div className="h-full">
          <div className="flex h-full w-14 flex-col items-center">
            <div className="flex flex-col items-center gap-4 px-2 py-5">
              <div className="flex-none">
                <Logo className="h-9 w-auto" />
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div className="isolate pl-14">
        <Outlet />
      </div>
    </div>
  );
}
