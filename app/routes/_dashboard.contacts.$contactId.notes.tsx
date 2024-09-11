import { invariant } from '@epic-web/invariant';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { format } from 'date-fns';
import { EmptyState } from '~/components/empty-state';
import { NoteForm } from '~/components/note-form';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { db } from '~/lib/db.server';

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.contactId, 'Missing contactId param');
  const notes = await db.note.findMany({
    select: { id: true, text: true, date: true },
    where: { contactId: params.contactId },
    orderBy: { date: 'desc' },
  });

  return json({ notes });
}

export default function Component() {
  return (
    <Card>
      <CardHeader className="gap-2">
        <CardTitle>Create a new note</CardTitle>
        <NoteForm />
      </CardHeader>
      <CardContent className="text-sm">
        <NoteList />
      </CardContent>
    </Card>
  );
}

function NoteList() {
  const { notes } = useLoaderData<typeof loader>();

  if (!notes.length) {
    return (
      <EmptyState
        title="No notes"
        description="You haven’t saved any notes yet."
      />
    );
  }

  return (
    <ul className="grid gap-8">
      {notes.map((note) => (
        <li key={note.id} className="grid gap-1">
          <time
            dateTime={note.date}
            className="block text-xs text-muted-foreground"
          >
            {format(note.date, 'PPpp')}
          </time>
          <p>{note.text}</p>
        </li>
      ))}
    </ul>
  );
}
