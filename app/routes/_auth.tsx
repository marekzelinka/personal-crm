import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { getUserId } from '~/lib/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);

  if (userId) {
    return redirect('/');
  }

  return {};
}

export default function Component() {
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12">
      <Outlet />
    </div>
  );
}
