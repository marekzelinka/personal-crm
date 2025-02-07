import { Outlet, redirect } from "react-router";
import { getUserId } from "~/lib/auth.server";
import type { Route } from "./+types/_auth";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) {
    throw redirect("/");
  }

  return {};
}

export default function Component() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Outlet />
    </div>
  );
}
