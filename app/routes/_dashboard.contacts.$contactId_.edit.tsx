import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { invariant, invariantResponse } from '@epic-web/invariant';
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node';
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
} from '@remix-run/react';
import { z } from 'zod';
import { ErrorList } from '~/components/forms';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';
import { prisma } from '~/utils/db.server';

const EditContactSchema = z.object({
  first: z
    .string()
    .trim()
    .optional()
    .transform((arg) => arg || null),
  last: z
    .string()
    .trim()
    .optional()
    .transform((arg) => arg || null),
  avatar: z
    .string()
    .trim()
    .url('Avatar URL is invalid')
    .optional()
    .transform((arg) => arg || null),
});

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data ? 'Edit contact' : 'No contact found' }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.contactId, 'Missing contactId param');
  const contact = await prisma.contact.findUnique({
    select: { first: true, last: true, avatar: true },
    where: { id: params.contactId },
  });
  invariantResponse(
    contact,
    `No contact with the id "${params.contactId}" exists.`,
    { status: 404 },
  );

  return json({ contact });
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.contactId, 'Missing contactId param');
  const contact = await prisma.contact.findUnique({
    select: { id: true },
    where: { id: params.contactId },
  });
  invariantResponse(
    contact,
    `No contact with the id "${params.contactId}" exists.`,
    { status: 404 },
  );

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: EditContactSchema });

  if (submission.status !== 'success') {
    return json(
      { result: submission.reply() },
      { status: submission.status === 'error' ? 400 : 200 },
    );
  }

  const updates = submission.value;
  await prisma.contact.update({
    select: { id: true },
    data: updates,
    where: { id: params.contactId },
  });

  return redirect(`/contacts/${params.contactId}`);
}

export default function Component() {
  const { contact } = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    defaultValue: contact,
    constraint: getZodConstraint(EditContactSchema),
    lastResult: actionData?.result,
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: EditContactSchema }),
  });

  return (
    <>
      <h1 className="sr-only">Edit Contact</h1>
      <Form method="POST" {...getFormProps(form)}>
        <div className="grid gap-4">
          <div className="grid grid-cols-3 items-start gap-4">
            <Label htmlFor={fields.avatar.id} className="pt-3">
              Avatar URL
            </Label>
            <div className="col-span-2 grid gap-2">
              <Input {...getInputProps(fields.avatar, { type: 'url' })} />
              <ErrorList
                id={fields.avatar.errorId}
                errors={fields.avatar.errors}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 items-start gap-4">
            <Label htmlFor={fields.first.id} className="pt-3">
              First name
            </Label>
            <div className="col-span-2 grid gap-2">
              <Input
                {...getInputProps(fields.first, { type: 'text' })}
                className="max-w-xs"
              />
              <ErrorList
                id={fields.first.errorId}
                errors={fields.first.errors}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 items-start gap-4">
            <Label htmlFor={fields.last.id} className="pt-3">
              Last name
            </Label>
            <div className="col-span-2 grid gap-2">
              <Input
                className="max-w-xs"
                {...getInputProps(fields.last, { type: 'text' })}
              />
              <ErrorList id={fields.last.errorId} errors={fields.last.errors} />
            </div>
          </div>
        </div>
        <Separator className="my-6" />
        <div className="grid grid-cols-3 items-start gap-3">
          <div className="col-span-2 col-start-2 grid gap-2">
            <ErrorList id={form.errorId} errors={form.errors} />
            <div className="flex items-center gap-3">
              <Button type="submit">Save</Button>
              <CancelButton />
            </div>
          </div>
        </div>
      </Form>
    </>
  );
}

function CancelButton() {
  const navigate = useNavigate();

  return (
    <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
      Cancel
    </Button>
  );
}
