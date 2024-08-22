import { MagnifyingGlassIcon, PlusIcon } from '@radix-ui/react-icons'
import type { MetaFunction } from '@remix-run/node'
import { Form, NavLink } from '@remix-run/react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { cx } from '~/utils/misc'

export const meta: MetaFunction = () => [{ title: 'Contacts' }]

export default function Component() {
  return (
    <>
      <aside className="fixed inset-y-0 flex w-96 flex-col border-r">
        <div className="sticky top-0 z-40 flex w-full gap-4 border-b border-border bg-background/90 p-4 backdrop-blur-sm">
          <search role="search" className="flex-1">
            <Form>
              <div className="relative">
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                  aria-hidden
                >
                  <MagnifyingGlassIcon className="size-4 text-muted-foreground" />
                </div>
                <Input
                  type="search"
                  name="q"
                  id="q"
                  className="pl-8"
                  placeholder="Search"
                  aria-label="Search contacts"
                />
              </div>
            </Form>
          </search>
          <Form method="POST">
            <Button type="submit" aria-label="New contact">
              <PlusIcon className="mr-2 size-4" />
              New
            </Button>
          </Form>
        </div>
        <nav className="flex-1 p-4">
          <ul className="-mx-2">
            <li>
              <NavLink
                to={`1`}
                prefetch="intent"
                className={({ isActive, isPending }) =>
                  cx(
                    'group flex items-center gap-2 rounded-md p-2 text-sm transition-all',
                    isPending ? 'text-primary' : '',
                    isActive || isPending ? 'bg-muted' : 'hover:bg-muted',
                  )
                }
              >
                <span className="flex-auto truncate">Your Friend</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`1`}
                prefetch="intent"
                className={({ isActive, isPending }) =>
                  cx(
                    'group flex items-center gap-2 rounded-md p-2 text-sm transition-all',
                    isPending ? 'text-primary' : '',
                    isActive || isPending ? 'bg-muted' : 'hover:bg-muted',
                  )
                }
              >
                <span className="flex-auto truncate">Your Name</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  )
}
