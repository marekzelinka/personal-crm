import { invariant, invariantResponse } from '@epic-web/invariant';
import type { Contact } from '@prisma/client';
import {
  ChevronLeftIcon,
  Pencil1Icon,
  StarFilledIcon,
  StarIcon,
  TrashIcon,
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
  Link,
  NavLink,
  Outlet,
  useFetcher,
  useLoaderData,
  type NavLinkProps,
} from '@remix-run/react';
import { GeneralErrorBoundary } from '~/components/error-boundary';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '~/components/ui/breadcrumb';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { Toggle } from '~/components/ui/toggle';
import { requireUserId } from '~/lib/auth.server';
import { db } from '~/lib/db.server';
import { cx } from '~/lib/utils';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: data?.contact
      ? data.contact.first || data.contact.last
        ? `${data.contact.first ?? ''} ${data.contact.last ?? ''}`.trim()
        : 'No Name'
      : 'No contact found',
  },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);

  invariant(params.contactId, 'Missing contactId param');
  const contact = await db.contact.findUnique({
    select: { id: true, first: true, last: true, avatar: true, favorite: true },
    where: { id: params.contactId, userId },
  });
  invariantResponse(
    contact,
    `No contact with the id "${params.contactId}" exists.`,
    { status: 404 },
  );

  return json({ contact });
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

  if (formData.get('intent') === 'favorite') {
    const favorite = formData.get('favorite');

    await db.contact.update({
      select: { id: true },
      data: { favorite: favorite === 'true' },
      where: { id: params.contactId, userId },
    });

    return json({ ok: true });
  }

  if (formData.get('intent') === 'delete') {
    await db.contact.delete({
      select: { id: true },
      where: { id: params.contactId, userId },
    });

    return redirect('/contacts');
  }

  invariantResponse(
    false,
    `Invalid intent: ${formData.get('intent') ?? 'Missing'}`,
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}

const tabs: { name: string; to: NavLinkProps['to'] }[] = [
  { name: 'Profile', to: '.' },
  { name: 'Notes', to: 'notes' },
];

export default function Component() {
  const { contact } = useLoaderData<typeof loader>();

  return (
    <>
      <Breadcrumb>
        <div className="mx-auto flex h-10 max-w-3xl items-center px-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to=".." aria-label="Contacts">
                  <ChevronLeftIcon aria-hidden />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </div>
      </Breadcrumb>
      <Separator />
      <div className="mx-auto max-w-3xl p-6">
        <div className="flex items-end">
          <div className="flex flex-none">
            <Avatar key={contact.avatar} className="size-32">
              <AvatarImage src={contact.avatar ?? undefined} alt="" />
              <AvatarFallback>
                <svg
                  className="h-full w-full text-primary-foreground"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="ml-5 flex w-full min-w-0 items-center gap-3 pb-1">
            <h1
              className={cx(
                'text-2xl font-semibold tracking-tight',
                contact.first || contact.last ? '' : 'text-muted-foreground',
              )}
            >
              {contact.first || contact.last ? (
                <>
                  {contact.first} {contact.last}
                </>
              ) : (
                'No Name'
              )}
            </h1>
            <Favorite contact={contact} />
          </div>
          <div className="ml-6 flex gap-4 pb-1">
            <Form action="edit">
              <Button type="submit" size="sm" variant="outline">
                <Pencil1Icon className="mr-2 size-4" />
                Edit
              </Button>
            </Form>
            <Form
              method="POST"
              onSubmit={(event) => {
                const shouldDelete = confirm(
                  'Please confirm you want to delete this record.',
                );

                if (!shouldDelete) {
                  event.preventDefault();
                }
              }}
            >
              <input type="hidden" name="intent" value="delete" />
              <Button type="submit" size="sm" variant="outline">
                <TrashIcon className="mr-2 size-4" />
                Delete
              </Button>
            </Form>
          </div>
        </div>
        <div className="mt-6">
          <nav
            className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1"
            aria-label="Tabs"
          >
            {tabs.map((tab) => (
              <NavLink
                key={tab.name}
                to={tab.to}
                end={tab.to === '.'}
                preventScrollReset
                prefetch="intent"
                className={({ isActive }) =>
                  cx(
                    'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                    isActive
                      ? 'bg-background text-foreground shadow'
                      : 'text-muted-foreground hover:text-foreground',
                  )
                }
              >
                {tab.name}
              </NavLink>
            ))}
          </nav>
          <div className="mt-2">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

function Favorite({ contact }: { contact: Pick<Contact, 'id' | 'favorite'> }) {
  const fetcher = useFetcher({ key: `contact:${contact.id}` });
  const favorite = fetcher.formData
    ? fetcher.formData.get('favorite') === 'true'
    : Boolean(contact.favorite);

  return (
    <fetcher.Form method="POST">
      <input type="hidden" name="intent" value="favorite" />
      <input
        type="hidden"
        name="favorite"
        value={favorite ? 'false' : 'true'}
      />
      <Toggle
        type="submit"
        size="sm"
        variant="ghost"
        pressed={favorite}
        aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {favorite ? (
          <StarFilledIcon className="size-4" />
        ) : (
          <StarIcon className="size-4" />
        )}
      </Toggle>
    </fetcher.Form>
  );
}
