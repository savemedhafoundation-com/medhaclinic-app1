import type { ReactNode } from 'react';

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm text-zinc-500 dark:text-zinc-400">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
