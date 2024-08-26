import { invariant, invariantResponse } from '@epic-web/invariant';
import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node';
import { Form, useLoaderData, useNavigate } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';
import { prisma } from '~/utils/db.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data ? 'Edit contact' : 'No contact found' }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.contactId, 'Missing contactId param');
  const contact = await prisma.contact.findUnique({
    select: {
      first: true,
      last: true,
      avatar: true,
    },
    where: { id: params.contactId },
  });
  invariantResponse(
    contact,
    `No contact with the id "${params.contactId}" exists.`,
    { status: 404 },
  );

  return json({ contact });
}

export default function Component() {
  const { contact } = useLoaderData<typeof loader>();

  return (
    <>
      <h1 className="sr-only">Edit Contact</h1>
      <Form method="post">
        <div className="grid gap-4">
          <div className="grid grid-cols-3 items-start gap-4">
            <Label htmlFor="avatar" className="pt-3">
              Avatar URL
            </Label>
            <div className="col-span-2 grid gap-2">
              <Input
                type="url"
                name="avatar"
                id="avatar"
                defaultValue={contact.avatar ?? undefined}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 items-start gap-4">
            <Label htmlFor="first" className="pt-3">
              First name
            </Label>
            <div className="col-span-2 grid gap-2">
              <Input
                type="text"
                name="first"
                id="first"
                defaultValue={contact.first ?? undefined}
                className="max-w-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 items-start gap-4">
            <Label htmlFor="last" className="pt-3">
              Last name
            </Label>
            <div className="col-span-2 grid gap-2">
              <Input
                type="text"
                name="last"
                id="last"
                defaultValue={contact.last ?? undefined}
                className="max-w-xs"
              />
            </div>
          </div>
        </div>
        <Separator className="my-6" />
        <div className="grid grid-cols-3 items-start gap-3">
          <div className="col-span-2 col-start-2 flex flex-row-reverse items-center justify-end gap-3">
            <CancelButton />
            <Button type="submit">Save</Button>
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
