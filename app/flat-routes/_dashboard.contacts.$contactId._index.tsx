import { Pencil1Icon } from "@radix-ui/react-icons";
import { format, formatDistanceStrict } from "date-fns";
import { data, Form, Link } from "react-router";
import { EmptyState } from "~/components/empty-state";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { requireUserId } from "~/lib/auth.server";
import { db } from "~/lib/db.server";
import type { Route } from "./+types/_dashboard.contacts.$contactId._index";

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

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
  if (!contact) {
    throw data(`No contact with the id "${params.contactId}" exists.`, {
      status: 404,
    });
  }

  return { contact };
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const { contact } = loaderData;

  const isEmpty = Object.values(contact).every((value) => value === null);

  return (
    <Card>
      <CardHeader>
        <CardTitle asChild>
          <h2>Profile</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <EmptyState
            title="Nurture your relationship"
            description="Get started by adding more details."
          >
            <Form action="edit">
              <Button type="submit" size="sm">
                <Pencil1Icon aria-hidden />
                Edit details
              </Button>
            </Form>
          </EmptyState>
        ) : (
          <dl className="grid gap-3 text-sm">
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
                  `${format(contact.birthday, "MMMM d, yyyy")} (${formatDistanceStrict(
                    contact.birthday,
                    new Date(),
                    { unit: "year" },
                  )} old)`
                ) : (
                  <span className="text-muted-foreground/40">N/A</span>
                )}
              </dd>
            </div>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
