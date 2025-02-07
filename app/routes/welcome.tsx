import { HexagonIcon } from "lucide-react";
import { Link } from "react-router";
import { Logo } from "~/components/logo";
import { buttonVariants } from "~/components/ui/button";
import { useOptionalUser } from "~/lib/user";
import type { Route } from "./+types/welcome";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Nexus - Be more thoughtful about your network." },
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
      <div className="flex w-full max-w-3xl flex-col gap-4">
        <Link
          to="."
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
          <div className="flex w-full items-center justify-center gap-4 pt-2">
            {user ? (
              <Link to="/contacts" className={buttonVariants()}>
                Continue as {user.email}
              </Link>
            ) : (
              <>
                <Link to="/join" className={buttonVariants()}>
                  Get started
                </Link>
                <Link
                  to="/login"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <div className="mx-auto w-full max-w-xl">
        <Logo className="mx-auto h-11 w-auto" />
        <div className="mt-10 text-center">
          <h1 className="text-4xl leading-[1.1] font-bold tracking-tighter text-balance">
            Supercharge your relationships
          </h1>
          <p className="text-foreground mx-auto max-w-2xl text-lg font-light text-pretty">
            Keep in touch with your personal and professional relationships.
            Move beyond the CRM&mdash;impress with thoughtfulness.
          </p>
        </div>
        <div className="mt-2 flex justify-center gap-2">
          {user ? (
            <Link to="/contacts" className={buttonVariants({ size: "sm" })}>
              <span>
                Continue to contacts <span aria-hidden>→</span>
              </span>
            </Link>
          ) : (
            <>
              <Link to="/join" className={buttonVariants({ size: "sm" })}>
                Get started
              </Link>
              <Link
                to="/login"
                className={buttonVariants({ size: "sm", variant: "ghost" })}
              >
                <span>
                  Log in <span aria-hidden>→</span>
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
