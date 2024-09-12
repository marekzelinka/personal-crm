import { PlusIcon } from '@radix-ui/react-icons';
import { Form } from '@remix-run/react';
import { EmptyState } from '~/components/empty-state';
import { Button } from '~/components/ui/button';

export default function Component() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <EmptyState
        title="No contact selected"
        description="Select a contact on the left, or create a new contact."
      >
        <Form method="post" action="/contacts">
          <Button type="submit" variant="secondary">
            <PlusIcon className="mr-2" aria-hidden />
            New contact
          </Button>
        </Form>
      </EmptyState>
    </div>
  );
}
