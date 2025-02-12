import { HexagonIcon } from "lucide-react";
import { Link, Outlet, redirect } from "react-router";
import { getUserId } from "~/lib/auth.server";
import type { Route } from "./+types/auth";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) {
    throw redirect("/");
  }

  return {};
}

export default function AuthLayout() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <HexagonIcon className="size-4" aria-hidden />
          </div>
          Nexus
        </Link>
        <Outlet />
      </div>
    </div>
  );
}
