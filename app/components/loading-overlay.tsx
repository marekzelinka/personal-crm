import { useNavigation } from '@remix-run/react';
import type { PropsWithChildren } from 'react';

export function LoadingOverlay({ children }: PropsWithChildren) {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';
  const isSearching = new URLSearchParams(navigation.location?.search).has('q');

  if (isLoading && !isSearching) {
    return <div className="opacity-50 transition-opacity">{children}</div>;
  }

  return children;
}
