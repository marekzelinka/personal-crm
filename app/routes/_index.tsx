import type { MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { Logo } from '~/components/logo';
import { buttonVariants } from '~/components/ui/button';
import { useOptionalUser } from '~/lib/user';

export const meta: MetaFunction = () => [{ title: 'Welcome' }];

export default function Component() {
  const user = useOptionalUser();

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-xl">
        <Logo className="mx-auto h-9 w-auto" />
        <div className="mt-6 text-center">
          <h1 className="text-balance text-3xl font-semibold">
            Supercharge your relationships
          </h1>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Finally, manage all your personal and professional relationships.
            Move beyond the CRM—keep in touch with your network.
          </p>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          {user ? (
            <Link to="/contacts" className={buttonVariants()}>
              <span>
                Continue to contacts <span aria-hidden>→</span>
              </span>
            </Link>
          ) : (
            <>
              <Link to="/join" className={buttonVariants()}>
                Get started
              </Link>
              <Link
                to="/login"
                className={buttonVariants({ variant: 'ghost' })}
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
