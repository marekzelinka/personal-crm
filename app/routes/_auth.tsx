import { Outlet } from '@remix-run/react';

export default function Component() {
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12">
      <Outlet />
    </div>
  );
}
