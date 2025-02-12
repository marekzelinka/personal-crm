import { ArrowRightIcon, HexagonIcon } from "lucide-react";
import { Link } from "react-router";
import { buttonVariants } from "~/components/ui/button";
import { useOptionalUser } from "~/lib/user";
import type { Route } from "./+types/welcome";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Nexus - Be more thoughtful with the people in your network." },
    {
      name: "description",
      content:
        "Nexus is a beautiful personal CRM, built to help you manage your personal and professional relationships.",
    },
  ];
};

export default function Welcome() {
  const user = useOptionalUser();

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-3xl flex-col gap-2">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <HexagonIcon className="size-4" aria-hidden />
          </div>
          Nexus
        </Link>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-3xl leading-tight font-bold tracking-tighter md:text-4xl lg:leading-[1.1]">
            Supercharge your relationships
          </h1>
          <p className="text-foreground max-w-2xl text-lg font-light">
            Move beyond the CRM&mdash;Keep in touch with your personal and
            professional relationships and impress with thoughtfulness.
          </p>
          <div className="flex w-full items-center justify-center gap-4 pt-3">
            {user ? (
              <Link to="contacts" className={buttonVariants()}>
                Continue as {user.email} <ArrowRightIcon aria-hidden />
              </Link>
            ) : (
              <>
                <Link to="signup" className={buttonVariants()}>
                  Get started
                </Link>
                <Link
                  to="signin"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
