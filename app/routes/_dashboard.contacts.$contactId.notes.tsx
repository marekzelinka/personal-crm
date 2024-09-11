import { NoteForm } from '~/components/note-form';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

export default function Component() {
  return (
    <>
      <Card className="mt-6">
        <CardHeader className="gap-2">
          <CardTitle>Create a new note</CardTitle>
          <NoteForm />
        </CardHeader>
        <CardContent className="text-sm">
          <ul className="grid gap-8">
            <li className="grid gap-1">
              <time className="block text-xs text-muted-foreground">
                Oct 22, 2023, 9:00:00 AM
              </time>
              <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Mollitia veritatis repellat nesciunt dolor maiores
                necessitatibus placeat ad fugit qui nostrum delectus ab quaerat
                totam, minus rem incidunt consectetur! Atque, illo!
              </p>
            </li>
            <li className="grid gap-1">
              <time className="block text-xs text-muted-foreground">
                Oct 22, 2023, 9:00:00 AM
              </time>
              <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Mollitia veritatis repellat nesciunt dolor maiores
                necessitatibus placeat ad fugit qui nostrum delectus ab quaerat
                totam, minus rem incidunt consectetur! Atque, illo!
              </p>
            </li>
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
