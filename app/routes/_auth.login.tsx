import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import {
  json,
  type ActionFunctionArgs,
  type MetaFunction,
} from '@remix-run/node';
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react';
import { z } from 'zod';
import { ErrorList } from '~/components/forms';
import { Logo } from '~/components/logo';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { createUserSession, verifyLogin } from '~/utils/auth.server';
import { composeSafeRedirectUrl } from '~/utils/misc';

const LoginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Email is invalid')
    .min(3, 'Email is too short')
    // Users can type the email in any case, but we store it in lowercase
    .transform((arg) => arg.toLowerCase()),
  password: z
    .string({ required_error: 'Password is required' })
    .trim()
    .min(6, 'Password is too short'),
});

export const meta: MetaFunction = () => [{ title: 'Login' }];

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const redirectTo = composeSafeRedirectUrl(url.searchParams.get('redirectTo'));

  const formData = await request.formData();
  const submission = await parseWithZod(formData, {
    schema: LoginSchema.transform(async (arg, ctx) => {
      const user = await verifyLogin(arg.email, arg.password);

      if (!user) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid username or password',
        });

        return z.NEVER;
      }

      return { ...arg, user };
    }),
    async: true,
  });

  if (submission.status !== 'success') {
    return json(
      { result: submission.reply({ hideFields: ['password'] }) },
      { status: submission.status === 'error' ? 400 : 200 },
    );
  }

  const { user } = submission.value;

  return createUserSession({
    request,
    userId: user.id,
    remember: true,
    redirectTo,
  });
}

export default function Component() {
  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    constraint: getZodConstraint(LoginSchema),
    lastResult: actionData?.result,
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: LoginSchema });
    },
  });

  const [searchParams] = useSearchParams();

  return (
    <>
      <div className="mx-auto w-full max-w-[400px]">
        <Logo className="mx-auto h-9 w-auto" />
        <div className="mt-6 text-center">
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="mt-2 text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
      </div>
      <div className="mx-auto mt-6 w-full max-w-[400px]">
        <Form method="post" {...getFormProps(form)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={fields.email.id}>Email</Label>
              <Input
                autoComplete="email"
                placeholder="m@example.com"
                {...getInputProps(fields.email, { type: 'email' })}
              />
              <ErrorList
                id={fields.email.errorId}
                errors={fields.email.errors}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={fields.password.id}>Password</Label>
              <Input
                autoComplete="new-password"
                {...getInputProps(fields.password, { type: 'password' })}
              />
              <ErrorList
                id={fields.password.errorId}
                errors={fields.password.errors}
              />
            </div>
            <ErrorList id={form.errorId} errors={form.errors} />
            <div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </div>
        </Form>
      </div>
      <p className="mt-4 text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link
          to={{ pathname: '/join', search: searchParams.toString() }}
          className="underline"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}
