import { type ReactNode } from 'react';

export function EmptyState({
  title = 'No data',
  description,
  children,
}: {
  title?: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-center">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
