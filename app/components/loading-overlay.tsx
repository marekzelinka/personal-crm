import { useNavigation } from '@remix-run/react';
import type { PropsWithChildren } from 'react';

export function LoadingOverlay({ children }: PropsWithChildren) {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  if (isLoading) {
    return <div className="opacity-50 transition-opacity">{children}</div>;
  }

  return children;
}
