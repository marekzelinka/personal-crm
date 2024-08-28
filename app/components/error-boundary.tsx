import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { isRouteErrorResponse, useRouteError } from '@remix-run/react';

export function GeneralErrorBoundary() {
  const error = useRouteError();
  const errorMessage = isRouteErrorResponse(error)
    ? error.data
    : getErrorMessage(error);

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive-foreground">
        <ExclamationTriangleIcon className="size-6 text-destructive" />
      </div>
      <h3 className="mt-3 text-2xl font-bold tracking-tight">
        Oops! An error occurred…
      </h3>
      <p className="text-sm text-muted-foreground">{errorMessage}</p>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'string') {
    return error;
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  console.error('Unable to get error message for error', error);

  return 'Unknown Error';
}
