import {
  Pencil1Icon,
  StarFilledIcon,
  StarIcon,
  TrashIcon,
} from '@radix-ui/react-icons'
import { Form } from '@remix-run/react'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Toggle } from '~/components/ui/toggle'
import { cx } from '~/utils/misc'

export default function Component() {
  const contact = {
    first: 'Your',
    last: 'Name',
    avatar: 'https://robohash.org/you.png?size=200x200',
    favorite: true,
  }

  return (
    <div className="flex items-end">
      <div className="flex flex-none">
        <Avatar key={contact.avatar} className="size-32">
          <AvatarImage src={contact.avatar ?? undefined} alt="" />
          <AvatarFallback>
            <svg
              className="h-full w-full text-muted-foreground"
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
            'text-3xl font-bold tracking-tight',
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
          <Button type="submit" variant="outline">
            <Pencil1Icon className="mr-2 size-4" />
            Edit
          </Button>
        </Form>
        <Form
          method="POST"
          onSubmit={(event) => {
            const shouldDelete = confirm(
              'Please confirm you want to delete this record.',
            )

            if (!shouldDelete) {
              event.preventDefault()
            }
          }}
        >
          <input type="hidden" name="intent" value="delete" />
          <Button type="submit" variant="destructive">
            <TrashIcon className="mr-2 size-4" />
            Delete
          </Button>
        </Form>
      </div>
    </div>
  )
}

function Favorite({ contact }: { contact: { favorite: boolean } }) {
  const favorite = contact.favorite

  return (
    <Form method="POST">
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
    </Form>
  )
}
