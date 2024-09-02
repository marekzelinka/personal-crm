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
import { createUser, createUserSession } from '~/utils/auth.server';
import { prisma } from '~/utils/db.server';
import { composeSafeRedirectUrl } from '~/utils/misc';

const CreateAccountSchema = z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .min(3, 'Username is too short')
    .max(20, 'Username is too long')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only include letters, numbers, and underscores',
    )
    // Users can type the username in any case, but we store it in lowercase
    .transform((value) => value.toLowerCase()),
  first: z
    .string({ required_error: 'First name is required' })
    .trim()
    .min(3, 'First name is too short')
    .max(40, 'Last name is too long'),
  last: z
    .string({ required_error: 'Last name is required' })
    .trim()
    .min(3, 'Last name is too short')
    .max(40, 'Last name is too long'),
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

export const meta: MetaFunction = () => [{ title: 'Sign up' }];

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const redirectTo = composeSafeRedirectUrl(url.searchParams.get('redirectTo'));

  const formData = await request.formData();
  const submission = await parseWithZod(formData, {
    schema: CreateAccountSchema.superRefine(async (arg, ctx) => {
      const userWithSameEmail = await prisma.user.findUnique({
        select: { id: true },
        where: { email: arg.email },
      });

      if (userWithSameEmail) {
        ctx.addIssue({
          path: ['email'],
          code: z.ZodIssueCode.custom,
          message: 'A user already exists with this email',
        });

        return z.NEVER;
      }

      const userWithSameUsername = await prisma.user.findUnique({
        select: { id: true },
        where: { username: arg.username },
      });

      if (userWithSameUsername) {
        ctx.addIssue({
          path: ['username'],
          code: z.ZodIssueCode.custom,
          message: 'A user already exists with this username',
        });

        return z.NEVER;
      }
    }),
    async: true,
  });

  if (submission.status !== 'success') {
    return json(
      { result: submission.reply({ hideFields: ['password'] }) },
      { status: submission.status === 'error' ? 400 : 200 },
    );
  }

  const { username, first, last, email, password } = submission.value;

  const user = await createUser({ username, first, last, email, password });

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo,
  });
}

export default function Component() {
  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    constraint: getZodConstraint(CreateAccountSchema),
    lastResult: actionData?.result,
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: CreateAccountSchema });
    },
  });

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
        <Form method="post" {...getFormProps(form)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={fields.username.id}>Username</Label>
              <Input
                autoComplete="username"
                placeholder="m_robinson"
                {...getInputProps(fields.username, { type: 'text' })}
              />
              <ErrorList
                id={fields.username.errorId}
                errors={fields.username.errors}
              />
            </div>
            <div className="grid grid-cols-2 items-start gap-4">
              <div className="grid gap-2">
                <Label htmlFor={fields.first.id}>First name</Label>
                <Input
                  autoComplete="given-name"
                  placeholder="Max"
                  {...getInputProps(fields.first, { type: 'text' })}
                />
                <ErrorList
                  id={fields.first.errorId}
                  errors={fields.first.errors}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={fields.last.id}>Last name</Label>
                <Input
                  autoComplete="family-name"
                  placeholder="Robinson"
                  {...getInputProps(fields.last, { type: 'text' })}
                />
                <ErrorList
                  id={fields.last.errorId}
                  errors={fields.last.errors}
                />
              </div>
            </div>
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
