import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
  type SubmissionResult,
} from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import {} from '@radix-ui/react-icons';
import { Form } from '@remix-run/react';
import { format } from 'date-fns';
import { z } from 'zod';
import { ErrorList } from './forms';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

export const NoteFormSchema = z.object({
  text: z
    .string({ required_error: 'Note is required' })
    .trim()
    .min(1, 'Note is too short')
    .max(255, 'Note is too long'),
  date: z.coerce.date({
    required_error: 'Date is required',
    invalid_type_error: 'Date is invalid.',
  }),
});

export function NoteForm({
  lastResult,
}: {
  lastResult?: SubmissionResult | undefined;
}) {
  const [form, fields] = useForm({
    defaultValue: {
      date: format(new Date(), 'yyyy-MM-dd'),
    },
    constraint: getZodConstraint(NoteFormSchema),
    lastResult: lastResult,
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: NoteFormSchema });
    },
  });

  return (
    <Form method="POST" {...getFormProps(form)}>
      <div className="relative">
        <div className="overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">
          <Textarea
            className="resize-none border-0 p-3 shadow-none focus-visible:ring-0"
            placeholder="Type your message here..."
            aria-label="Note"
            {...getTextareaProps(fields.text)}
          />
          {/* Spacer element to match the height of the toolbar */}
          <div className="h-12" aria-hidden />
        </div>
        <div className="absolute inset-x-px bottom-0">
          <div className="flex items-center px-3 pb-3">
            <Input
              className="max-w-fit"
              {...getInputProps(fields.date, { type: 'date' })}
            />
            <Button type="submit" size="sm" className="ml-auto">
              Save
            </Button>
          </div>
        </div>
      </div>
      <ErrorList
        id={fields.text.errorId}
        errors={fields.text.errors}
        className="mt-2"
      />
      <ErrorList
        id={fields.date.errorId}
        errors={fields.date.errors}
        className="mt-2"
      />
      <ErrorList id={form.errorId} errors={form.errors} className="mt-2" />
    </Form>
  );
}
