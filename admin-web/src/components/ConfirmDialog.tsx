import type { ReactNode } from 'react';

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/50 p-4">
      <div className="panel w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">{title}</h2>
        {description ? <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{description}</div> : null}
        <div className="mt-6 flex justify-end gap-3">
          <button className="button-secondary" onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="button-danger" onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
