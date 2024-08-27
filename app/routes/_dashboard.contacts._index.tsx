import { PlusIcon } from '@heroicons/react/16/solid';
import { Form } from '@remix-run/react';
import { EmptyState } from '~/components/empty-state';
import { Button } from '~/components/ui/button';

export default function Component() {
  return (
    <EmptyState
      title="No contact selected"
      description="Select a contact on the left, or create a new contact."
    >
      <Form method="post" action="/contacts">
        <Button type="submit" variant="secondary">
          <PlusIcon className="mr-2 size-4" />
          New contact
        </Button>
      </Form>
    </EmptyState>
  );
}
