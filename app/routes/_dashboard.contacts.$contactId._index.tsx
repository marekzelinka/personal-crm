import { invariant, invariantResponse } from '@epic-web/invariant';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { format, formatDistanceStrict } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { requireUserId } from '~/lib/auth.server';
import { db } from '~/lib/db.server';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);

  invariant(params.contactId, 'Missing contactId param');
  const contact = await db.contact.findUnique({
    select: {
      bio: true,
      email: true,
      phone: true,
      linkedin: true,
      social: true,
      website: true,
      location: true,
      company: true,
      birthday: true,
    },
    where: { id: params.contactId, userId },
  });
  invariantResponse(
    contact,
    `No contact with the id "${params.contactId}" exists.`,
    { status: 404 },
  );

  return json({ contact });
}

export default function Component() {
  const { contact } = useLoaderData<typeof loader>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <dl className="grid gap-3">
          <div className="grid grid-cols-3">
            <dt className="text-muted-foreground">Bio</dt>
            <dd className="col-span-2">
              {contact.bio ?? (
                <span className="text-muted-foreground/40">N/A</span>
              )}
            </dd>
          </div>
          <div className="grid grid-cols-3">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="col-span-2">
              {contact.email ? (
                <Link to={`mailto:${contact.email}`}>{contact.email}</Link>
              ) : (
                <span className="text-muted-foreground/40">N/A</span>
              )}
            </dd>
          </div>
          <div className="grid grid-cols-3">
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="col-span-2">
              {contact.phone ? (
                <Link to={`tel:${contact.phone}`}>{contact.phone}</Link>
              ) : (
                <span className="text-muted-foreground/40">N/A</span>
              )}
            </dd>
          </div>
          <div className="grid grid-cols-3">
            <dt className="text-muted-foreground">LinkedIn</dt>
            <dd className="col-span-2">
              {contact.linkedin ? (
                <Link to={contact.linkedin} target="_blank" rel="noreferrer">
                  {contact.linkedin}
                </Link>
              ) : (
                <span className="text-muted-foreground/40">N/A</span>
              )}
            </dd>
          </div>
          <div className="grid grid-cols-3">
            <dt className="text-muted-foreground">Social</dt>
            <dd className="col-span-2">
              {contact.social ? (
                <Link to={contact.social} target="_blank" rel="noreferrer">
                  {contact.social}
                </Link>
              ) : (
                <span className="text-muted-foreground/40">N/A</span>
              )}
            </dd>
          </div>
          <div className="grid grid-cols-3">
            <dt className="text-muted-foreground">Website</dt>
            <dd className="col-span-2">
              {contact.website ? (
                <Link to={contact.website} target="_blank" rel="noreferrer">
                  {contact.website}
                </Link>
              ) : (
                <span className="text-muted-foreground/40">N/A</span>
              )}
            </dd>
          </div>
          <div className="grid grid-cols-3">
            <dt className="text-muted-foreground">Location</dt>
            <dd className="col-span-2">
              {contact.location ?? (
                <span className="text-muted-foreground/40">N/A</span>
              )}
            </dd>
          </div>
          <div className="grid grid-cols-3">
            <dt className="text-muted-foreground">Company</dt>
            <dd className="col-span-2">
              {contact.company ?? (
                <span className="text-muted-foreground/40">N/A</span>
              )}
            </dd>
          </div>
          <div className="grid grid-cols-3">
            <dt className="text-muted-foreground">Birthday</dt>
            <dd className="col-span-2">
              {contact.birthday ? (
                `${format(contact.birthday, 'MMMM d, yyyy')} (${formatDistanceStrict(
                  contact.birthday,
                  new Date(),
                  { unit: 'year' },
                )} old)`
              ) : (
                <span className="text-muted-foreground/40">N/A</span>
              )}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
