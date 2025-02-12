import { parseWithZod } from "@conform-to/zod";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DotsHorizontalIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { compareDesc, format, isToday, isYesterday } from "date-fns";
import { useState } from "react";
import { data, Link, useFetchers } from "react-router";
import { useSpinDelay } from "spin-delay";
import { EmptyState } from "~/components/empty-state";
import { NoteForm, NoteFormSchema } from "~/components/note-form";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useClipboard } from "~/hooks/use-clipboard";
import { requireUserId } from "~/lib/auth.server";
import { db } from "~/lib/db.server";
import type { Route } from "./+types/_dashboard.contacts.$contactId.notes";

type LoaderData = Route.ComponentProps["loaderData"];
type Note = LoaderData["notes"][number];

export async function loader({ params }: Route.LoaderArgs) {
  const notes = await db.note.findMany({
    select: { id: true, text: true, date: true, createdAt: true },
    where: { contactId: params.contactId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return { notes };
}

export async function action({ request, params }: Route.ActionArgs) {
  const userId = await requireUserId(request);

  const contact = await db.contact.findUnique({
    select: { id: true },
    where: { id: params.contactId, userId },
  });
  if (!contact) {
    throw data(`No contact with the id "${params.contactId}" exists.`, {
      status: 404,
    });
  }

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema: NoteFormSchema });
  if (submission.status !== "success") {
    return data(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { text, date } = submission.value;

  await db.note.create({
    select: { id: true },
    data: { text, date, contact: { connect: { id: params.contactId } } },
  });

  return { result: submission.reply({ resetForm: true }) };
}

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { notes } = loaderData;

  return (
    <>
      <NoteForm lastResult={actionData?.result} />
      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>
            <h2>Notes</h2>
          </CardTitle>
          <NoteSavingIndicator />
        </CardHeader>
        <CardContent>
          <NoteList notes={notes} />
        </CardContent>
      </Card>
    </>
  );
}

function NoteSavingIndicator() {
  const optimisticNotes = useOptimisticNotes();

  const shouldShow = useSpinDelay(optimisticNotes.length > 0);
  if (!shouldShow) {
    return null;
  }

  return (
    <UpdateIcon className="text-muted-foreground animate-spin" aria-hidden />
  );
}

function NoteList({ notes }: { notes: Note[] }) {
  const notesById = new Map(notes.map((note) => [note.id, note]));

  const optimisticNotes = useOptimisticNotes();
  // Merge optimistic and existing entries
  for (const optimisticNote of optimisticNotes) {
    const note = notesById.get(optimisticNote.id);
    const merged = note ? { ...note, ...optimisticNote } : optimisticNote;
    notesById.set(optimisticNote.id, merged);
  }

  const notesToShow = [...notesById.values()].sort(
    (a, b) =>
      compareDesc(a.date, b.date) || compareDesc(a.createdAt, b.createdAt),
  );

  return notesToShow.length ? (
    <ul className="grid gap-4">
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
      if (submission.status !== "success") {
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
  return (
    <li key={note.id} className="flex items-start gap-6">
      <div className="flex-1 py-1">
        <NoteText note={note} />
      </div>
      <div className="flex flex-none items-center gap-2">
        <p className="text-muted-foreground text-sm">
          {isToday(note.date)
            ? "today"
            : isYesterday(note.date)
              ? "yesterday"
              : format(note.date, "PP")}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="size-7">
              <DotsHorizontalIcon aria-hidden />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <CopyNoteAction note={note} />
            <DropdownMenuItem asChild>
              <Link to={`${note.id}/edit`} prefetch="intent">
                Edit
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}

const MAX_LENGTH = 255;

function NoteText({ note }: { note: Pick<Note, "text"> }) {
  const shouldClamp = note.text.length > MAX_LENGTH;
  const [isClamped, setIsClamped] = useState(shouldClamp);

  const text = isClamped
    ? note.text.substring(0, MAX_LENGTH).trimEnd() + "…"
    : note.text;

  return (
    <div className="space-y-2">
      <p className="text-sm">{text}</p>
      {shouldClamp ? (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setIsClamped((isClamped) => !isClamped)}
        >
          {isClamped ? (
            <>
              <ChevronDownIcon aria-hidden />
              Show more
            </>
          ) : (
            <>
              <ChevronUpIcon aria-hidden />
              Show less
            </>
          )}
        </Button>
      ) : null}
    </div>
  );
}

function CopyNoteAction({ note }: { note: Pick<Note, "text"> }) {
  const { copy } = useClipboard(note.text);

  return <DropdownMenuItem onClick={copy}>Copy</DropdownMenuItem>;
}
