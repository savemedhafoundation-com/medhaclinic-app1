import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { DataTable } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { adminApi } from '../../services/adminApi';
import type { AiSummary } from '../../services/types';
import { date } from '../../utils/format';

export default function AiMonitoringPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AiSummary | null>(null);
  const summaries = useQuery({
    queryKey: ['ai-summaries', page],
    queryFn: () => adminApi.aiSummaries({ page, pageSize: 25 }),
  });
  const columns = useMemo<ColumnDef<AiSummary>[]>(
    () => [
      { accessorKey: 'user.email', header: 'Patient', cell: info => info.row.original.user?.email ?? info.row.original.userId },
      { accessorKey: 'model', header: 'Model' },
      { accessorKey: 'promptPreview', header: 'Prompt Preview', cell: info => <span className="line-clamp-1 max-w-md">{String(info.getValue() ?? '-')}</span> },
      { accessorKey: 'outputPreview', header: 'Output Preview', cell: info => <span className="line-clamp-1 max-w-md">{String(info.getValue() ?? '-')}</span> },
      { accessorKey: 'createdAt', header: 'Created', cell: info => date(String(info.getValue())) },
      { id: 'actions', header: 'Actions', cell: info => <button className="button-secondary min-h-8 px-3 py-1" onClick={() => setSelected(info.row.original)} type="button">Expand</button> },
    ],
    []
  );

  return (
    <div className="space-y-5">
      <PageHeader description="Review AI output logs, linked users, model usage, and redacted prompt metadata." title="AI Monitoring" />
      <DataTable columns={columns} data={summaries.data?.items ?? []} loading={summaries.isLoading} />
      <Pagination page={page} pageSize={25} total={summaries.data?.total ?? 0} onPageChange={setPage} />
      {selected ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/40 p-4">
          <div className="panel max-h-[90vh] w-full max-w-3xl overflow-auto p-5">
            <div className="flex justify-between gap-3">
              <h2 className="font-semibold">AI summary output</h2>
              <button className="button-secondary" onClick={() => setSelected(null)} type="button">Close</button>
            </div>
            <pre className="mt-4 whitespace-pre-wrap rounded-md bg-zinc-950 p-4 text-sm text-zinc-50">{selected.resultText}</pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
