import { parseWithZod } from "@conform-to/zod";
import { ChevronLeftIcon, TrashIcon } from "@radix-ui/react-icons";
import { data, Form, Link, redirect, useNavigation } from "react-router";
import { NoteForm, NoteFormSchema } from "~/components/note-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { requireUserId } from "~/lib/auth.server";
import { db } from "~/lib/db.server";
import type { Route } from "./+types/_dashboard.contacts.$contactId.notes_.$noteId.edit";

export async function loader({ params }: Route.LoaderArgs) {
  const note = await db.note.findUnique({
    select: { text: true, date: true },
    where: { id: params.noteId },
  });
  if (!note) {
    throw data(`No note with the id "${params.noteId}" exists.`, {
      status: 404,
    });
  }

  return { note };
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

  const note = await db.note.findUnique({
    select: { id: true },
    where: { id: params.noteId },
  });
  if (!note) {
    throw data(`No note with the id "${params.noteId}" exists.`, {
      status: 404,
    });
  }

  const formData = await request.formData();

  switch (formData.get("intent")) {
    case "editNote": {
      const submission = parseWithZod(formData, { schema: NoteFormSchema });
      if (submission.status !== "success") {
        return data(
          { result: submission.reply() },
          { status: submission.status === "error" ? 400 : 200 },
        );
      }

      const updates = submission.value;
      await db.note.update({
        select: { id: true },
        data: updates,
        where: { id: params.noteId },
      });

      break;
    }
    case "deleteNote": {
      await db.note.delete({
        select: { id: true },
        where: { id: params.noteId },
      });

      break;
    }
  }

  throw redirect(`/contacts/${params.contactId}/notes`);
}

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { note } = loaderData;

  const navigation = useNavigation();
  const isDeleting = navigation.formData?.get("intent") === "deleteNote";

  return (
    <>
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
      <Card className="mt-2">
        <CardHeader>
          <CardTitle>Edit Note</CardTitle>
        </CardHeader>
        <CardContent>
          <NoteForm lastResult={actionData?.result} note={note} />
        </CardContent>
      </Card>
      <Form
        method="POST"
        onSubmit={(event) => {
          const shouldDelete = window.confirm("Are you sure?");
          if (!shouldDelete) {
            event.preventDefault();
          }
        }}
        className="mt-6"
      >
        <Button
          type="submit"
          name="intent"
          value="deleteNote"
          size="sm"
          variant="destructive"
          disabled={isDeleting}
        >
          <TrashIcon aria-hidden />
          {isDeleting ? "Deleting…" : "Delete this note…"}
        </Button>
      </Form>
    </>
  );
}
