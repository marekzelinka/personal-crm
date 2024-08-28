import { useNavigation } from '@remix-run/react';
import type { PropsWithChildren } from 'react';
import { useSpinDelay } from 'spin-delay';

export function LoadingOverlay({ children }: PropsWithChildren) {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';
  const isSearching = new URLSearchParams(navigation.location?.search).has('q');
  const shouldShowOverlay = useSpinDelay(isLoading && !isSearching);

  return (
    <div
      className={
        shouldShowOverlay ? 'opacity-50 transition-opacity' : undefined
      }
    >
      {children}
    </div>
  );
}
