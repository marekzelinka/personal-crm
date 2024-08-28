import { MagnifyingGlassIcon, UpdateIcon } from '@radix-ui/react-icons';
import {
  Form,
  useNavigation,
  useSearchParams,
  useSubmit,
} from '@remix-run/react';
import { useEffect, useRef } from 'react';
import { useSpinDelay } from 'spin-delay';
import { Input } from './ui/input';

export function SearchBar() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q');

  // Used to submit the form for every keystroke
  const submit = useSubmit();

  const navigation = useNavigation();
  const isSearching = new URLSearchParams(navigation.location?.search).has('q');
  const shouldShowSpinner = useSpinDelay(isSearching);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync search input value with the URL Search Params
  useEffect(() => {
    const searchField = inputRef.current;
    if (searchField) {
      searchField.value = q ?? '';
    }
  }, [q]);

  return (
    <Form
      onChange={(event) => {
        const isFirstSearch = q === null;
        submit(event.currentTarget, {
          replace: !isFirstSearch,
        });
      }}
    >
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
          aria-hidden
        >
          {shouldShowSpinner ? (
            <UpdateIcon className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <MagnifyingGlassIcon className="size-4 text-muted-foreground" />
          )}
        </div>
        <Input
          ref={inputRef}
          type="search"
          name="q"
          id="q"
          defaultValue={q ?? undefined}
          className="pl-8"
          placeholder="Search"
          aria-label="Search contacts"
        />
      </div>
    </Form>
  );
}
