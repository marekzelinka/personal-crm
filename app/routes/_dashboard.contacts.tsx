import type { Contact } from '@prisma/client';
import { PlusIcon, StarFilledIcon } from '@radix-ui/react-icons';
import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node';
import {
  Form,
  NavLink,
  Outlet,
  useFetcher,
  useLoaderData,
} from '@remix-run/react';
import { matchSorter } from 'match-sorter';
import type { PropsWithChildren } from 'react';
import sortBy from 'sort-by';
import { LoadingOverlay } from '~/components/loading-overlay';
import { SearchBar } from '~/components/search-bar';
import { Button } from '~/components/ui/button';
import { prisma } from '~/utils/db.server';
import { cx } from '~/utils/misc';

export const meta: MetaFunction = () => [{ title: 'Contacts' }];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');

  let contacts = await prisma.contact.findMany({
    select: { id: true, first: true, last: true, avatar: true, favorite: true },
  });

  if (q) {
    contacts = matchSorter(contacts, q, { keys: ['first', 'last'] });
  }

  contacts = contacts.sort(sortBy('last', 'createdAt'));

  return json({ contacts });
}

export async function action() {
  const contact = await prisma.contact.create({
    select: { id: true },
    data: {},
  });

  return redirect(`/contacts/${contact.id}/edit`);
}

export default function Component() {
  const { contacts } = useLoaderData<typeof loader>();

  return (
    <>
      <main className="pl-96">
        <div className="mx-auto max-w-3xl p-6">
          <LoadingOverlay>
            <Outlet />
          </LoadingOverlay>
        </div>
      </main>
      <aside className="fixed inset-y-0 flex w-96 flex-col border-r">
        <div className="sticky top-0 z-40 flex w-full gap-4 border-b border-border bg-background/90 p-4 backdrop-blur-sm">
          <search role="search" className="flex-1">
            <SearchBar />
          </search>
          <Form method="POST">
            <Button type="submit" aria-label="New contact">
              <PlusIcon className="mr-2 size-4" />
              New
            </Button>
          </Form>
        </div>
        <nav className="flex-1 p-4">
          {contacts.length ? (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <NavLink
                    to={contact.id}
                    prefetch="intent"
                    className={({ isActive, isPending }) =>
                      cx(
                        'group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                        isPending
                          ? 'text-primary'
                          : contact.first || contact.last
                            ? ''
                            : 'text-muted-foreground',
                        isActive || isPending ? 'bg-muted' : 'hover:bg-muted',
                      )
                    }
                  >
                    {({ isActive }) => (
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
                              'size-4 flex-none',
                              isActive
                                ? ''
                                : 'text-muted-foreground group-hover:text-foreground',
                            )}
                          />
                        </Favorite>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No contacts</p>
          )}
        </nav>
      </aside>
    </>
  );
}

function Favorite({
  contact,
  children,
}: PropsWithChildren<{
  contact: Pick<Contact, 'id' | 'favorite'>;
}>) {
  const fetcher = useFetcher({ key: `contact:${contact.id}` });
  const favorite = fetcher.formData
    ? fetcher.formData.get('favorite') === 'true'
    : Boolean(contact.favorite);

  if (!favorite) {
    return null;
  }

  return children;
}
