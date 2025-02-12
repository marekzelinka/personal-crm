import type { Contact } from "@prisma/client";
import {
  Pencil1Icon,
  StarFilledIcon,
  StarIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import {
  data,
  Form,
  NavLink,
  Outlet,
  redirect,
  useFetcher,
  type NavLinkProps,
} from "react-router";
import { GenericErrorBoundary } from "~/components/error-boundary";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Toggle } from "~/components/ui/toggle";
import { requireUserId } from "~/lib/auth.server";
import { db } from "~/lib/db.server";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/_dashboard.contacts.$contactId";

export const meta: Route.MetaFunction = ({ data, error }) => {
  return [
    {
      title: error
        ? "No contact found"
        : data.contact.first || data.contact.last
          ? `${data.contact.first ?? ""} ${data.contact.last ?? ""}`.trim()
          : "No Name",
    },
  ];
};

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  const contact = await db.contact.findUnique({
    select: { id: true, first: true, last: true, avatar: true, favorite: true },
    where: { id: params.contactId, userId },
  });
  if (!contact) {
    throw data(`No contact with the id "${params.contactId}" exists.`, {
      status: 404,
    });
  }

  return { contact };
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

  switch (formData.get("intent")) {
    case "favoriteContact": {
      const favorite = formData.get("favorite");

      await db.contact.update({
        select: { id: true },
        data: { favorite: favorite === "true" },
        where: { id: params.contactId, userId },
      });

      return { ok: true };
    }
    case "deleteContact": {
      await db.contact.delete({
        select: { id: true },
        where: { id: params.contactId, userId },
      });

      return redirect("/contacts");
    }
    default: {
      throw data(`Invalid intent: ${formData.get("intent") ?? "Missing"}`, {
        status: 400,
      });
    }
  }
}

export function ErrorBoundary() {
  return (
    <div className="mx-auto max-w-3xl">
      <GenericErrorBoundary />
    </div>
  );
}

const tabs: { name: string; to: NavLinkProps["to"] }[] = [
  { name: "Profile", to: "." },
  { name: "Notes", to: "notes" },
];

export default function Component({ loaderData }: Route.ComponentProps) {
  const { contact } = loaderData;

  return (
    <>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end">
          <Avatar key={contact.avatar} className="size-32 flex-none">
            <AvatarImage src={contact.avatar ?? undefined} alt="" />
            <AvatarFallback className="">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-muted-foreground"
                aria-hidden
              >
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </AvatarFallback>
          </Avatar>
          <div className="ml-5 flex w-full min-w-0 items-center gap-4 pb-1">
            <h1
              className={cn(
                "truncate text-2xl font-semibold tracking-tight",
                contact.first || contact.last ? "" : "text-muted-foreground",
              )}
            >
              {contact.first || contact.last ? (
                <>
                  {contact.first} {contact.last}
                </>
              ) : (
                "No Name"
              )}
            </h1>
            <Favorite contact={contact} />
          </div>
          <div className="ml-6 flex gap-2 pb-1">
            <Form action="edit">
              <Button type="submit" size="sm" variant="outline">
                <Pencil1Icon aria-hidden />
                Edit
              </Button>
            </Form>
            <Form
              method="POST"
              onSubmit={(event) => {
                const shouldDelete = confirm(
                  "Please confirm you want to delete this record.",
                );
                if (!shouldDelete) {
                  event.preventDefault();
                }
              }}
            >
              <Button
                type="submit"
                name="intent"
                value="deleteContact"
                size="sm"
                variant="outline"
              >
                <TrashIcon aria-hidden />
                Delete
              </Button>
            </Form>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <div className="mx-auto max-w-3xl">
          <nav
            className="bg-muted inline-flex h-9 items-center justify-center rounded-lg p-1"
            aria-label="Tabs"
          >
            {tabs.map((tab) => (
              <NavLink
                key={tab.name}
                to={tab.to}
                end={tab.to === "."}
                preventScrollReset
                prefetch="intent"
                className={({ isActive }) =>
                  cn(
                    "ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
                    isActive
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground",
                  )
                }
              >
                {tab.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      <div className="mt-2">
        <div className="mx-auto max-w-3xl">
          <Outlet />
        </div>
      </div>
    </>
  );
}

function Favorite({ contact }: { contact: Pick<Contact, "id" | "favorite"> }) {
  const fetcher = useFetcher({ key: `contact:${contact.id}` });
  const favorite = fetcher.formData
    ? fetcher.formData.get("favorite") === "true"
    : Boolean(contact.favorite);

  return (
    <fetcher.Form method="POST">
      <input
        type="hidden"
        name="favorite"
        value={favorite ? "false" : "true"}
      />
      <Toggle
        type="submit"
        name="intent"
        value="favoriteContact"
        size="sm"
        variant="outline"
        pressed={favorite}
      >
        {favorite ? <StarFilledIcon aria-hidden /> : <StarIcon aria-hidden />}
        <span className="sr-only">
          {favorite ? "Remove from favorites" : "Add to favorites"}
        </span>
      </Toggle>
    </fetcher.Form>
  );
}
