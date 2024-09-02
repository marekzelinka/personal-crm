import { Form, Link, useSearchParams } from '@remix-run/react';
import { Logo } from '~/components/logo';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export default function Component() {
  const [searchParams] = useSearchParams();

  return (
    <>
      <div className="mx-auto w-full max-w-[350px]">
        <Logo className="mx-auto h-9 w-auto" />
        <div className="mt-6 text-center">
          <h1 className="text-3xl font-bold">Sign Up</h1>
          <p className="mt-2 text-balance text-muted-foreground">
            Enter your information to create an account
          </p>
        </div>
      </div>
      <div className="mx-auto mt-6 w-full max-w-[350px]">
        <Form method="post">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                type="text"
                name="username"
                id="username"
                autoComplete="username"
                placeholder="m_robinson"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first">First name</Label>
                <Input
                  type="text"
                  name="first"
                  id="first"
                  autoComplete="given-name"
                  placeholder="Max"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last">Last name</Label>
                <Input
                  type="text"
                  name="last"
                  id="last"
                  autoComplete="family-name"
                  placeholder="Robinson"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                placeholder="m@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                name="password"
                id="password"
                autoComplete="new-password"
              />
            </div>
            <div>
              <Button type="submit" className="w-full">
                Create an account
              </Button>
            </div>
          </div>
        </Form>
      </div>
      <p className="mt-4 text-center text-sm">
        Already have an account?{' '}
        <Link
          to={{ pathname: '/login', search: searchParams.toString() }}
          className="underline"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
