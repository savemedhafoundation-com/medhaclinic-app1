export function EmptyState({ title = 'No records', description }: { title?: string; description?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
      <p className="font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
      {description ? <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{description}</p> : null}
    </div>
  );
}
