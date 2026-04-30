export function Badge({ value }: { value?: string | boolean | null }) {
  const text = String(value ?? '-');
  const normalized = text.toLowerCase();
  const tone =
    normalized.includes('paid') ||
    normalized.includes('active') ||
    normalized.includes('delivered') ||
    normalized === 'false'
      ? 'bg-clinic-100 text-clinic-700 dark:bg-clinic-900 dark:text-clinic-100'
      : normalized.includes('failed') ||
          normalized.includes('disabled') ||
          normalized.includes('cancel') ||
          normalized === 'true'
        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-100'
        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200';

  return <span className={`badge ${tone}`}>{text.replace(/_/g, ' ')}</span>;
}
