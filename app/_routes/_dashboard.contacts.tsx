import type { Contact } from "@prisma/client";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  StarFilledIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { matchSorter } from "match-sorter";
import type { PropsWithChildren } from "react";
import { useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Form,
  NavLink,
  Outlet,
  redirect,
  useFetcher,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "react-router";
import sortBy from "sort-by";
import { useSpinDelay } from "spin-delay";
import { LoadingOverlay } from "~/components/loading-overlay";
import { Button } from "~/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
} from "~/components/ui/sidebar";
import { requireUserId } from "~/lib/auth.server";
import { db } from "~/lib/db.server";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/_dashboard.contacts";

export const meta: Route.MetaFunction = () => {
  return [{ title: "Contacts" }];
};

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  const url = new URL(request.url);
  const q = url.searchParams.get("q");

  let contacts = await db.contact.findMany({
    select: { id: true, first: true, last: true, avatar: true, favorite: true },
    where: { userId },
  });

  if (q) {
    contacts = matchSorter(contacts, q, { keys: ["first", "last"] });
  }

  contacts = contacts.sort(sortBy("last", "createdAt"));

  return { contacts };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);

  const contact = await db.contact.create({
    select: { id: true },
    data: { user: { connect: { id: userId } } },
  });

  return redirect(`/contacts/${contact.id}/edit`);
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const { contacts } = loaderData;

  return (
    <>
      <Sidebar collapsible="none" className="flex h-auto border-r">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex gap-2">
            <search role="search" className="flex-1">
              <SearchBar />
            </search>
            <Form method="POST">
              <Button type="submit" size="sm" aria-label="New contact">
                <PlusIcon aria-hidden />
                New
              </Button>
            </Form>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent className="divide-y">
              {contacts.length ? (
                contacts.map((contact) => (
                  <NavLink
                    key={contact.id}
                    to={contact.id}
                    prefetch="intent"
                    className={({ isActive, isPending }) =>
                      cn(
                        "flex items-center gap-2 p-4 leading-tight whitespace-nowrap",
                        isActive || isPending
                          ? "bg-sidebar-accent"
                          : "hover:bg-sidebar-accent",
                        isActive
                          ? "text-sidebar-accent-foreground"
                          : isPending
                            ? "text-sidebar-accent-foreground/ animate-pulse"
                            : contact.first || contact.last
                              ? "hover:text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/70",
                      )
                    }
                  >
                    <span className="flex-1 truncate">
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        "No Name"
                      )}
                    </span>
                    <span className="size-4 flex-none">
                      <Favorite contact={contact}>
                        <StarFilledIcon aria-hidden />
                      </Favorite>
                    </span>
                  </NavLink>
                ))
              ) : (
                <div className="text-muted-foreground px-4 py-2">
                  No contacts found
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="w-full flex-1 p-4">
          <LoadingOverlay>
            <Outlet />
          </LoadingOverlay>
        </div>
      </SidebarInset>
    </>
  );
}

function SearchBar() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q");

  // Used to submit the form for every keystroke
  const submit = useSubmit();

  const navigation = useNavigation();
  const isSearching = new URLSearchParams(navigation.location?.search).has("q");
  const shouldShowSpinner = useSpinDelay(isSearching);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync search input value with the URL Search Params
  useEffect(() => {
    const searchField = inputRef.current;
    if (searchField) {
      searchField.value = q ?? "";
    }
  }, [q]);

  // Focus input on key press
  const shortcut = "/";
  useHotkeys(
    shortcut,
    () => {
      const searchField = inputRef.current;
      if (searchField) {
        searchField.focus();
        searchField.select();
      }
    },
    { preventDefault: true },
  );

  return (
    <Form
      onChange={(event) => {
        const isFirstSearch = q === null;
        submit(event.currentTarget, {
          replace: !isFirstSearch,
        });
      }}
    >
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
          aria-hidden
        >
          {shouldShowSpinner ? (
            <UpdateIcon className="text-muted-foreground animate-spin" />
          ) : (
            <MagnifyingGlassIcon className="text-muted-foreground" />
          )}
        </div>
        <SidebarInput
          ref={inputRef}
          type="search"
          name="q"
          id="q"
          defaultValue={q ?? undefined}
          className="px-8"
          placeholder="Search"
          aria-label="Search contacts"
          aria-keyshortcuts={shortcut}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 flex py-1.5 pr-1.5"
          aria-hidden
        >
          <kbd className="border-muted text-muted-foreground inline-flex items-center rounded border px-1 font-mono text-[10px]">
            {shortcut}
          </kbd>
        </div>
      </div>
    </Form>
  );
}

function Favorite({
  contact,
  children,
}: PropsWithChildren<{
  contact: Pick<Contact, "id" | "favorite">;
}>) {
  const fetcher = useFetcher({ key: `contact:${contact.id}` });

  const isFavorite = fetcher.formData
    ? fetcher.formData.get("favorite") === "true"
    : Boolean(contact.favorite);
  if (!isFavorite) {
    return null;
  }

  return children;
}
