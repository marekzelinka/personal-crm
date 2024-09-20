import { parseWithZod } from '@conform-to/zod';
import { invariant, invariantResponse } from '@epic-web/invariant';
import { DotsHorizontalIcon, UpdateIcon } from '@radix-ui/react-icons';
import {
  unstable_data as data,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type SerializeFrom,
} from '@remix-run/node';
import {
  Link,
  useActionData,
  useFetchers,
  useLoaderData,
} from '@remix-run/react';
import { compareAsc, format, isToday, isYesterday } from 'date-fns';
import { useSpinDelay } from 'spin-delay';
import { EmptyState } from '~/components/empty-state';
import { NoteForm, NoteFormSchema } from '~/components/note-form';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { requireUserId } from '~/lib/auth.server';
import { db } from '~/lib/db.server';
import { useClipboard } from '~/lib/utils';

type LoaderData = SerializeFrom<typeof loader>;
type Note = LoaderData['notes'][number];

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.contactId, 'Missing contactId param');
  const notes = await db.note.findMany({
    select: { id: true, text: true, date: true, createdAt: true },
    where: { contactId: params.contactId },
  });

  return { notes };
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
    return data(
      { result: submission.reply() },
      { status: submission.status === 'error' ? 400 : 200 },
    );
  }

  const { text, date } = submission.value;
  await db.note.create({
    select: { id: true },
    data: { text, date, contact: { connect: { id: params.contactId } } },
  });

  return { result: submission.reply({ resetForm: true }) };
}

export default function Component() {
  const actionData = useActionData<typeof action>();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Notes</CardTitle>
        <NoteSavingIndicator />
      </CardHeader>
      <CardContent className="grid gap-8">
        <NoteForm lastResult={actionData?.result} />
        <NoteList />
      </CardContent>
    </Card>
  );
}

function NoteSavingIndicator() {
  const optimisticNotes = useOptimisticNotes();
  const showShowIndicator = useSpinDelay(optimisticNotes.length > 0);

  if (!showShowIndicator) {
    return null;
  }

  return (
    <UpdateIcon className="animate-spin text-muted-foreground" aria-hidden />
  );
}

function NoteList() {
  const { notes } = useLoaderData<typeof loader>();

  const optimisticNotes = useOptimisticNotes();
  const notesById = new Map(notes.map((note) => [note.id, note]));

  // Merge optimistic and existing entries
  for (const optimisticNote of optimisticNotes) {
    const note = notesById.get(optimisticNote.id);
    const merged = note ? { ...note, ...optimisticNote } : optimisticNote;
    notesById.set(optimisticNote.id, merged);
  }

  const notesToShow = [...notesById.values()].sort(
    (a, b) =>
      compareAsc(b.date, a.date) || compareAsc(b.createdAt, a.createdAt),
  );

  return notesToShow.length ? (
    <ul className="grid gap-8">
      {notesToShow.map((note) => (
        <NoteItem key={note.id} note={note} />
      ))}
    </ul>
  ) : (
    <EmptyState
      title="No notes"
      description="You haven’t saved any notes yet."
    />
  );
}

function useOptimisticNotes() {
  type OptimisticNoteFetcher = ReturnType<typeof useFetchers>[number] & {
    formData: FormData;
  };

  return useFetchers()
    .filter((fetcher): fetcher is OptimisticNoteFetcher => {
      return fetcher.formData !== undefined;
    })
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
        date: new Date(submission.value.date),
        createdAt: new Date(),
      };
    })
    .filter((note) => note !== null);
}

function NoteItem({ note }: { note: Note }) {
  const { copy } = useClipboard(note.text);

  return (
    <li key={note.id} className="flex gap-4">
      <div className="flex-auto py-1 text-sm">{note.text}</div>
      <div className="flex flex-none items-center gap-2">
        <p className="text-sm text-muted-foreground">
          {isToday(note.date)
            ? 'Today'
            : isYesterday(note.date)
              ? 'Yesterday'
              : format(note.date, 'PP')}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              aria-label="Toggle menu"
            >
              <DotsHorizontalIcon aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`${note.id}/edit`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={copy}>Copy</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}
