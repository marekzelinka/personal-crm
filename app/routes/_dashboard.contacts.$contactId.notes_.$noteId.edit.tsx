import { parseWithZod } from '@conform-to/zod';
import { invariant, invariantResponse } from '@epic-web/invariant';
import { ChevronLeftIcon, TrashIcon } from '@radix-ui/react-icons';
import { json, redirect, type ActionFunctionArgs } from '@remix-run/node';
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from '@remix-run/react';
import { NoteForm, NoteFormSchema } from '~/components/note-form';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '~/components/ui/breadcrumb';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { requireUserId } from '~/lib/auth.server';
import { db } from '~/lib/db.server';

export async function loader({ params }: ActionFunctionArgs) {
  invariant(params.noteId, 'Missing noteId param');
  const note = await db.note.findUnique({
    select: { text: true, date: true },
    where: { id: params.noteId },
  });
  invariantResponse(note, `No note with the id "${params.noteId}" exists.`, {
    status: 404,
  });

  return json({ note });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  invariant(params.contactId, 'Missing contactId param');
  const contact = await db.contact.findUnique({
    select: { id: true },
    where: { id: params.contactId, userId },
  });
  invariantResponse(
    contact,
    `No contact with the id "${params.contactId}" exists.`,
    { status: 404 },
  );

  invariant(params.noteId, 'Missing noteId param');
  const note = await db.note.findUnique({
    select: { id: true },
    where: { id: params.noteId },
  });
  invariantResponse(note, `No note with the id "${params.noteId}" exists.`, {
    status: 404,
  });

  const formData = await request.formData();

  if (formData.get('intent') === 'deleteNote') {
    await db.note.delete({
      select: { id: true },
      where: { id: params.noteId },
    });
  } else {
    const submission = parseWithZod(formData, { schema: NoteFormSchema });

    if (submission.status !== 'success') {
      return json(
        { result: submission.reply() },
        { status: submission.status === 'error' ? 400 : 200 },
      );
    }

    const updates = submission.value;
    await db.note.update({
      select: { id: true },
      data: updates,
      where: { id: params.noteId },
    });
  }

  return redirect(`/contacts/${params.contactId}/notes`);
}

export default function Component() {
  const { note } = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();

  const navigation = useNavigation();
  const isDeleting = navigation.formData?.get('intent') === 'deleteNote';

  return (
    <div className="grid gap-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="../notes" className="inline-flex items-center gap-1.5">
                <ChevronLeftIcon aria-hidden />
                <span className="text-foreground">Go back</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle>Edit Note</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-8">
          <NoteForm lastResult={actionData?.result} note={note} />
        </CardContent>
      </Card>
      <Form
        method="POST"
        onSubmit={(event) => {
          const shouldDelete = window.confirm('Are you sure?');

          if (!shouldDelete) {
            event.preventDefault();
          }
        }}
        className="mt-4"
      >
        <input type="hidden" name="intent" value="deleteNote" />
        <Button size="sm" variant="destructive" disabled={isDeleting}>
          <TrashIcon className="mr-2" aria-hidden />
          {isDeleting ? 'Deleting…' : 'Delete this note…'}
        </Button>
      </Form>
    </div>
  );
}
