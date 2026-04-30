import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { Badge } from '../../components/Badge';
import { DataTable } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { useToast } from '../../components/Toast';
import { adminApi } from '../../services/adminApi';
import type { WeeklyReport } from '../../services/types';
import { date, number } from '../../utils/format';

export default function ReportsPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<WeeklyReport | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();
  const reports = useQuery({
    queryKey: ['reports', page],
    queryFn: () => adminApi.reports({ page, pageSize: 25 }),
  });
  const regenerate = useMutation({
    mutationFn: adminApi.regenerateReport,
    onSuccess: () => {
      toast.show('Report regeneration requested.', 'success');
      void queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
  const columns = useMemo<ColumnDef<WeeklyReport>[]>(
    () => [
      { accessorKey: 'user.email', header: 'Patient', cell: info => info.row.original.user?.email ?? info.row.original.userId },
      { accessorKey: 'overallCurrent', header: 'Current', cell: info => number(Number(info.getValue()), 1) },
      { accessorKey: 'overallDelta', header: 'Delta', cell: info => number(Number(info.getValue() ?? 0), 1) },
      { accessorKey: 'trend', header: 'Trend', cell: info => <Badge value={String(info.getValue())} /> },
      { accessorKey: 'generatedAt', header: 'Generated', cell: info => date(String(info.getValue())) },
      {
        id: 'actions',
        header: 'Actions',
        cell: info => (
          <div className="flex gap-2">
            <button className="button-secondary min-h-8 px-3 py-1" onClick={() => setSelected(info.row.original)} type="button">View JSON</button>
            <button className="button-secondary min-h-8 px-3 py-1" onClick={() => regenerate.mutate(info.row.original.id)} type="button">Regenerate</button>
          </div>
        ),
      },
    ],
    [regenerate]
  );

  return (
    <div className="space-y-5">
      <PageHeader description="Inspect generated weekly wellness reports and trigger safe regeneration when operations need it." title="Weekly Reports" />
      <DataTable columns={columns} data={reports.data?.items ?? []} loading={reports.isLoading} />
      <Pagination page={page} pageSize={25} total={reports.data?.total ?? 0} onPageChange={setPage} />
      {selected ? (
        <div className="fixed inset-0 z-40 bg-zinc-950/40 p-4">
          <div className="panel mx-auto h-full max-w-5xl overflow-auto p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Report payload</h2>
              <button className="button-secondary" onClick={() => setSelected(null)} type="button">Close</button>
            </div>
            <pre className="overflow-auto rounded-md bg-zinc-950 p-4 text-xs text-zinc-50">
              {JSON.stringify(selected.payloadJson, null, 2)}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
