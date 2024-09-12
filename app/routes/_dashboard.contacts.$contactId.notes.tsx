import { parseWithZod } from '@conform-to/zod';
import { invariant, invariantResponse } from '@epic-web/invariant';
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type SerializeFrom,
} from '@remix-run/node';
import { useActionData, useFetchers, useLoaderData } from '@remix-run/react';
import { compareAsc, format, isToday, isYesterday } from 'date-fns';
import { EmptyState } from '~/components/empty-state';
import { NoteForm, NoteFormSchema } from '~/components/note-form';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { requireUserId } from '~/lib/auth.server';
import { db } from '~/lib/db.server';

type LoaderData = SerializeFrom<typeof loader>;
type Note = LoaderData['notes'][number];

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.contactId, 'Missing contactId param');
  const notes = await db.note.findMany({
    select: { id: true, text: true, date: true, createdAt: true },
    where: { contactId: params.contactId },
  });

  return json({ notes });
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

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: NoteFormSchema });

  if (submission.status !== 'success') {
    return json(
      { result: submission.reply() },
      { status: submission.status === 'error' ? 400 : 200 },
    );
  }

  const { text, date } = submission.value;
  await db.note.create({
    select: { id: true },
    data: { text, date, contact: { connect: { id: params.contactId } } },
  });

  return json({ result: submission.reply({ resetForm: true }) });
}

export default function Component() {
  const actionData = useActionData<typeof action>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8">
        <NoteForm lastResult={actionData?.result} />
        <NoteList />
      </CardContent>
    </Card>
  );
}

function NoteList() {
  const { notes } = useLoaderData<typeof loader>();

  const notesById = new Map(notes.map((note) => [note.id, note]));

  // Merge optimistic and existing entries
  const optimisticNotes = useOptimisticNotes();
  for (const optimisticNote of optimisticNotes) {
    const note = notesById.get(optimisticNote.id);
    const merged = note ? { ...note, ...optimisticNote } : optimisticNote;
    notesById.set(optimisticNote.id, merged);
  }

  const notesToShow = [...notesById.values()].sort(
    (a, b) =>
      compareAsc(b.date, a.date) || compareAsc(b.createdAt, a.createdAt),
  );

  if (!notesToShow.length) {
    return (
      <EmptyState
        title="No notes"
        description="You haven’t saved any notes yet."
      />
    );
  }

  return (
    <ul className="grid gap-8">
      {notesToShow.map((note) => (
        <li key={note.id} className="grid gap-1">
          <div className="block text-xs text-muted-foreground">
            {isToday(note.date)
              ? 'today'
              : isYesterday(note.date)
                ? 'yesterday'
                : format(note.date, 'PP')}
          </div>
          <div className="whitespace-pre-wrap text-sm">{note.text}</div>
        </li>
      ))}
    </ul>
  );
}

function useOptimisticNotes() {
  type OptimisticNoteFetcher = ReturnType<typeof useFetchers>[number] & {
    formData: FormData;
  };

  return useFetchers()
    .filter(
      (fetcher): fetcher is OptimisticNoteFetcher =>
        fetcher.formData !== undefined,
    )
    .map((fetcher): Note | null => {
      const submission = parseWithZod(fetcher.formData, {
        schema: NoteFormSchema,
      });
      if (submission.status !== 'success') {
        return null;
      }

      return {
        ...submission.value,
        id: fetcher.key,
        createdAt: new Date().toISOString(),
      };
    })
    .filter((note) => note !== null);
}
