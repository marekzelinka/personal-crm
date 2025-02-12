import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { LoaderIcon } from "lucide-react";
import { data, Form, Link, useNavigation, useSearchParams } from "react-router";
import { z } from "zod";
import { ErrorList } from "~/components/forms";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
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
import { createUser, createUserSession } from "~/lib/auth.server";
import { db } from "~/lib/db.server";
import { EmailSchema, PasswordSchema } from "~/lib/user-validation";
import { composeSafeRedirectUrl } from "~/lib/utils";
import type { Route } from "./+types/signup";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Sign Up | Nexus" },
    {
      name: "description",
      content:
        "Create an account to manage your personal and professional relationships.",
    },
  ];
};

const SignupFormSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const submission = await parseWithZod(formData, {
    schema: SignupFormSchema.superRefine(async (arg, ctx) => {
      const user = await db.user.findUnique({
        select: { id: true },
        where: { email: arg.email },
      });
      if (user) {
        ctx.addIssue({
          path: ["email"],
          code: z.ZodIssueCode.custom,
          message: "A user already exists with this email",
        });

        return z.NEVER;
      }
    }),
    async: true,
  });
  if (submission.status !== "success") {
    return data(
      { result: submission.reply({ hideFields: ["password"] }) },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { email, password } = submission.value;

  const user = await createUser({ email, password });

  const url = new URL(request.url);
  const redirectTo = composeSafeRedirectUrl(url.searchParams.get("redirectTo"));

  throw await createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo,
  });
}

export default function Signup({ actionData }: Route.ComponentProps) {
  const [form, fields] = useForm({
    constraint: getZodConstraint(SignupFormSchema),
    lastResult: actionData?.result,
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: SignupFormSchema }),
  });

  const [searchParams] = useSearchParams();

  const navigation = useNavigation();
  const isSubmitting = navigation.formAction === "/signup";

  return (
    <>
      <Card>
        <CardHeader className="text-center">
          <CardTitle asChild className="text-xl">
            <h1>Sign Up</h1>
          </CardTitle>
          <CardDescription>
            Enter your details below to create an account
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
                    {...getInputProps(fields.email, { type: "email" })}
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
                  {isSubmitting ? "Signing up…" : "Sign up"}
                </Button>
              </fieldset>
              <p className="text-center text-sm">
                Already have an account?{" "}
                <Link
                  to={{ pathname: "/signin", search: searchParams.toString() }}
                  className="underline underline-offset-4"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </Form>
        </CardContent>
      </Card>
      <Accordion type="single" collapsible className="px-6">
        <AccordionItem value="item-1">
          <AccordionTrigger>Terms of Service</AccordionTrigger>
          <AccordionContent>
            This is a demo app, there are no terms of service. Don't be
            surprised if your data dissappears.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Privacy Notice</AccordionTrigger>
          <AccordionContent>
            We won't use your email address for anything other than
            authenticating with this demo application. This app doesn't send
            email anyway, so you can put whatever fake email address you want.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
