import type { Contact } from '@prisma/client';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  StarFilledIcon,
  UpdateIcon,
} from '@radix-ui/react-icons';
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node';
import {
  Form,
  NavLink,
  Outlet,
  useFetcher,
  useLoaderData,
  useNavigation,
  useSearchParams,
  useSubmit,
} from '@remix-run/react';
import { matchSorter } from 'match-sorter';
import type { PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import sortBy from 'sort-by';
import { useSpinDelay } from 'spin-delay';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { ScrollArea } from '~/components/ui/scroll-area';
import { requireUserId } from '~/lib/auth.server';
import { db } from '~/lib/db.server';
import { cx } from '~/lib/utils';

export const meta: MetaFunction = () => [{ title: 'Contacts' }];

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);

  const url = new URL(request.url);
  const q = url.searchParams.get('q');

  let contacts = await db.contact.findMany({
    select: { id: true, first: true, last: true, avatar: true, favorite: true },
    where: { userId },
  });

  if (q) {
    contacts = matchSorter(contacts, q, { keys: ['first', 'last'] });
  }

  contacts = contacts.sort(sortBy('last', 'createdAt'));

  return json({ contacts });
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  const contact = await db.contact.create({
    select: { id: true },
    data: { user: { connect: { id: userId } } },
  });

  return redirect(`/contacts/${contact.id}/edit`);
}

export default function Component() {
  const { contacts } = useLoaderData<typeof loader>();

  return (
    <>
      <main className="pl-96">
        <ContactLoadingOverlay>
          <Outlet />
        </ContactLoadingOverlay>
      </main>
      <aside className="fixed inset-y-0 flex w-96 flex-col border-r">
        <div className="flex gap-4 bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <search role="search" className="flex-1">
            <SearchBar />
          </search>
          <Form method="POST">
            <Button type="submit" aria-label="New contact">
              <PlusIcon className="mr-2" aria-hidden />
              New
            </Button>
          </Form>
        </div>
        <ScrollArea className="flex-1">
          {contacts.length ? (
            <div className="p-4 pt-0">
              {contacts.map((contact) => (
                <NavLink
                  key={contact.id}
                  to={contact.id}
                  prefetch="intent"
                  className={({ isActive, isPending }) =>
                    cx(
                      'group flex items-center gap-2 rounded-md p-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary'
                        : isPending
                          ? 'bg-muted'
                          : 'hover:bg-muted',
                      isActive
                        ? contact.first || contact.last
                          ? 'text-primary-foreground'
                          : 'text-primary-foreground/70'
                        : isPending
                          ? 'text-primary'
                          : contact.first || contact.last
                            ? ''
                            : 'text-muted-foreground',
                    )
                  }
                >
                  {({ isActive, isPending }) => (
                    <>
                      <span className="flex-auto truncate">
                        {contact.first || contact.last ? (
                          <>
                            {contact.first} {contact.last}
                          </>
                        ) : (
                          'No Name'
                        )}
                      </span>
                      <Favorite contact={contact}>
                        <StarFilledIcon
                          className={cx(
                            'flex-none',
                            isActive
                              ? ''
                              : isPending
                                ? 'text-foreground'
                                : 'text-muted-foreground group-hover:text-foreground',
                          )}
                          aria-hidden
                        />
                      </Favorite>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ) : (
            <div className="p-4 pt-0">
              <p className="text-sm text-muted-foreground">No contacts found</p>
            </div>
          )}
        </ScrollArea>
      </aside>
    </>
  );
}

function ContactLoadingOverlay({ children }: PropsWithChildren) {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';
  const isSearching = new URLSearchParams(navigation.location?.search).has('q');
  const shouldShowOverlay = useSpinDelay(isLoading && !isSearching);

  return (
    <div
      className={
        shouldShowOverlay ? 'opacity-50 transition-opacity' : undefined
      }
    >
      {children}
    </div>
  );
}

function SearchBar() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q');

  // Used to submit the form for every keystroke
  const submit = useSubmit();

  const navigation = useNavigation();
  const isSearching = new URLSearchParams(navigation.location?.search).has('q');
  const shouldShowSpinner = useSpinDelay(isSearching);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync search input value with the URL Search Params
  useEffect(() => {
    const searchField = inputRef.current;
    if (searchField) {
      searchField.value = q ?? '';
    }
  }, [q]);

  // Focus input on key press
  const shortcut = '/';
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
            <UpdateIcon
              className="animate-spin text-muted-foreground"
              aria-hidden
            />
          ) : (
            <MagnifyingGlassIcon
              className="text-muted-foreground"
              aria-hidden
            />
          )}
        </div>
        <Input
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
          <kbd className="inline-flex items-center rounded border border-muted px-1 font-mono text-[10px] text-muted-foreground">
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
  contact: Pick<Contact, 'id' | 'favorite'>;
}>) {
  const fetcher = useFetcher({ key: `contact:${contact.id}` });
  const isFavorite = fetcher.formData
    ? fetcher.formData.get('favorite') === 'true'
    : Boolean(contact.favorite);

  if (!isFavorite) {
    return null;
  }

  return children;
}
