export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col gap-3 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
      <span>
        Page {page} of {totalPages} · {total} records
      </span>
      <div className="flex gap-2">
        <button className="button-secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)} type="button">
          Previous
        </button>
        <button
          className="button-secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          type="button">
          Next
        </button>
      </div>
    </div>
  );
}
