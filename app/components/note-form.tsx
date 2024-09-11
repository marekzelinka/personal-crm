import {} from '@radix-ui/react-icons';
import { Form } from '@remix-run/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

export function NoteForm() {
  return (
    <Form className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">
      <Textarea
        id="message"
        placeholder="Type your message here..."
        className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
        aria-label="Note"
      />
      <div className="flex items-center px-3 pb-3">
        <Button type="submit" size="sm" className="ml-auto">
          Save
        </Button>
      </div>
    </Form>
  );
}
