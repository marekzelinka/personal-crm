import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { LoaderIcon } from "lucide-react";
import { data, Form, Link, useNavigation, useSearchParams } from "react-router";
import { z } from "zod";
import { ErrorList } from "~/components/forms";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createUserSession, verifyLogin } from "~/lib/auth.server";
import { composeSafeRedirectUrl } from "~/lib/utils";
import type { Route } from "./+types/signin";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Sign In | Nexus" },
    {
      name: "description",
      content:
        "Access your account to manage your personal and professional relationships.",
    },
  ];
};

const SigninFormSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Email is invalid")
    .min(3, "Email is too short")
    // Users can type the email in any case, but we store it in lowercase
    .transform((arg) => arg.toLowerCase()),
  password: z
    .string({ required_error: "Password is required" })
    .trim()
    .min(6, "Password is too short"),
});

export async function action({ request }: Route.ActionArgs) {
  const url = new URL(request.url);
  const redirectTo = composeSafeRedirectUrl(url.searchParams.get("redirectTo"));

  const formData = await request.formData();

  const submission = await parseWithZod(formData, {
    schema: SigninFormSchema.transform(async (arg, ctx) => {
      const user = await verifyLogin(arg.email, arg.password);
      if (!user) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid username or password",
        });

        return z.NEVER;
      }

      return { ...arg, user };
    }),
    async: true,
  });
  if (submission.status !== "success") {
    return data(
      { result: submission.reply({ hideFields: ["password"] }) },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { user } = submission.value;

  throw await createUserSession({
    request,
    userId: user.id,
    remember: true,
    redirectTo,
  });
}

export default function Signin({ actionData }: Route.ComponentProps) {
  const [form, fields] = useForm({
    constraint: getZodConstraint(SigninFormSchema),
    lastResult: actionData?.result,
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: SigninFormSchema }),
  });

  const [searchParams] = useSearchParams();

  const navigation = useNavigation();
  const isSubmitting = navigation.formAction === "/signin";

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle asChild className="text-xl">
          <h1>Sign in</h1>
        </CardTitle>
        <CardDescription>
          Enter your details below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="POST" {...getFormProps(form)}>
          <div className="grid gap-6">
            <fieldset disabled={isSubmitting} className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor={fields.email.id}>Email</Label>
                <Input
                  autoComplete="email"
                  placeholder="m@example.com"
                  {...getInputProps(fields.email, { type: "email" })}
                />
                <ErrorList
                  id={fields.email.errorId}
                  errors={fields.email.errors}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor={fields.password.id}>Password</Label>
                  <Link
                    to="/forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  autoComplete="current-password"
                  {...getInputProps(fields.password, { type: "password" })}
                />
                <ErrorList
                  id={fields.password.errorId}
                  errors={fields.password.errors}
                />
              </div>
              <ErrorList id={form.errorId} errors={form.errors} />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="relative w-full"
              >
                {isSubmitting ? (
                  <div className="absolute inset-y-0 left-4 flex items-center">
                    <LoaderIcon className="size-4 animate-spin" aria-hidden />
                  </div>
                ) : null}
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </fieldset>
            <p className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                to={{ pathname: "/signup", search: searchParams.toString() }}
                className="underline underline-offset-4"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
