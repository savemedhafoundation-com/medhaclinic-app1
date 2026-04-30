export function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="panel p-5">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">{value}</p>
      {helper ? <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{helper}</p> : null}
    </div>
  );
}
