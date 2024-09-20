import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
  type SubmissionResult,
} from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import type { Note } from '@prisma/client';
import {} from '@radix-ui/react-icons';
import type { SerializeFrom } from '@remix-run/node';
import { Form, useNavigation, useSubmit } from '@remix-run/react';
import { format } from 'date-fns';
import { useRef } from 'react';
import { z } from 'zod';
import { ErrorList } from './forms';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

export const NoteFormSchema = z.object({
  text: z
    .string({ required_error: 'Note is required' })
    .trim()
    .min(1, 'Note is too short'),
  date: z.coerce
    .date({
      required_error: 'Date is required',
      invalid_type_error: 'Date is invalid.',
    })
    .transform((arg) => arg.toISOString()),
});

export function NoteForm({
  lastResult,
  note,
}: {
  lastResult: SubmissionResult | undefined;
  note?: Pick<SerializeFrom<Note>, 'text' | 'date'>;
}) {
  const editMode = Boolean(note);

  const navigation = useNavigation();
  const isSavingEdits = navigation.formData?.get('intent') === 'editNote';

  const submit = useSubmit();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [form, fields] = useForm({
    defaultValue: {
      ...note,
      date: format(note?.date ?? new Date(), 'yyyy-MM-dd'),
    },
    constraint: getZodConstraint(NoteFormSchema),
    lastResult: lastResult,
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: NoteFormSchema });
    },
    onSubmit: (event, context) => {
      if (editMode) {
        return;
      }

      event.preventDefault();

      const formData = new FormData(event.currentTarget);
      const submission = parseWithZod(formData, { schema: NoteFormSchema });
      if (submission.status !== 'success') {
        return;
      }

      submit(submission.value, {
        method: context.method,
        fetcherKey: window.crypto.randomUUID(),
        navigate: false,
        unstable_flushSync: true,
      });

      if (textareaRef.current) {
        textareaRef.current.value = '';
        textareaRef.current.focus();
      }
    },
  });

  return (
    <Form method="POST" {...getFormProps(form)}>
      {editMode ? <input type="hidden" name="intent" value="editNote" /> : null}
      <fieldset
        disabled={isSavingEdits}
        className="relative disabled:pointer-events-none disabled:opacity-70"
      >
        <div className="overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">
          <Textarea
            ref={textareaRef}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                event.currentTarget.form?.dispatchEvent(
                  new Event('submit', { bubbles: true, cancelable: true }),
                );
              }
            }}
            rows={6}
            className="resize-none border-0 p-3 shadow-none focus-visible:ring-0"
            placeholder="What would you like to add?"
            aria-label="Note"
            {...getTextareaProps(fields.text)}
          />
          {/* Spacer element to match the height of the toolbar below */}
          <div className="h-12" aria-hidden />
        </div>
        <div className="absolute inset-x-px bottom-0">
          <div className="flex items-center px-3 pb-3">
            <Input
              className="max-w-fit"
              aria-label="Date"
              {...getInputProps(fields.date, { type: 'date' })}
            />
            <Button type="submit" size="sm" className="ml-auto">
              {isSavingEdits ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </fieldset>
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
