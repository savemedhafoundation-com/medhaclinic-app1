import { useMutation, useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { Badge } from '../../components/Badge';
import { DataTable } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { adminApi } from '../../services/adminApi';
import type { ImmunitySubmission } from '../../services/types';
import { date, number } from '../../utils/format';

export default function ImmunityPage() {
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState('');
  const [level, setLevel] = useState('');
  const debouncedUser = useDebouncedValue(userId);
  const submissions = useQuery({
    queryKey: ['immunity-submissions', page, debouncedUser, level],
    queryFn: () => adminApi.immunitySubmissions({ page, pageSize: 25, userId: debouncedUser, status: level }),
  });
  const exportCsv = useMutation({
    mutationFn: () => adminApi.exportImmunityCsv({ userId: debouncedUser, status: level }),
    onSuccess: blob => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'immunity-submissions.csv';
      anchor.click();
      URL.revokeObjectURL(url);
    },
  });

  const avg =
    (submissions.data?.items ?? []).reduce((sum, item) => sum + item.immunityScore, 0) /
    Math.max(1, submissions.data?.items.length ?? 0);

  const columns = useMemo<ColumnDef<ImmunitySubmission>[]>(
    () => [
      { accessorKey: 'user.email', header: 'Patient', cell: info => info.row.original.user?.email ?? info.row.original.userId },
      { accessorKey: 'immunityScore', header: 'Score', cell: info => number(Number(info.getValue()), 1) },
      { accessorKey: 'immunityLevel', header: 'Level', cell: info => <Badge value={String(info.getValue())} /> },
      { accessorKey: 'physicalEnergy', header: 'Energy', cell: info => String(info.getValue() ?? '-') },
      { accessorKey: 'digestionComfort', header: 'Digestion', cell: info => String(info.getValue() ?? '-') },
      { accessorKey: 'sleepHours', header: 'Sleep', cell: info => String(info.getValue() ?? '-') },
      { accessorKey: 'submittedAt', header: 'Submitted', cell: info => date(String(info.getValue())) },
    ],
    []
  );

  return (
    <div className="space-y-5">
      <PageHeader
        description="Review daily immunity assessments, symptom scores, levels, and trend inputs used for reports."
        title="Immunity Submissions"
      />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel p-4">
          <p className="text-sm text-zinc-500">Loaded rows</p>
          <p className="mt-2 text-2xl font-semibold">{number(submissions.data?.items.length ?? 0)}</p>
        </div>
        <div className="panel p-4">
          <p className="text-sm text-zinc-500">Average score</p>
          <p className="mt-2 text-2xl font-semibold">{number(avg, 1)}</p>
        </div>
        <button
          className="panel flex items-center justify-between p-4 text-left text-sm font-semibold text-clinic-700"
          onClick={() => exportCsv.mutate()}
          type="button">
          Export CSV <span>Download</span>
        </button>
      </div>

      <div className="panel grid gap-3 p-4 md:grid-cols-2">
        <input className="input" onChange={event => setUserId(event.target.value)} placeholder="Filter by user ID" value={userId} />
        <input className="input" onChange={event => setLevel(event.target.value)} placeholder="Filter by level" value={level} />
      </div>

      <DataTable columns={columns} data={submissions.data?.items ?? []} loading={submissions.isLoading} />
      <Pagination page={page} pageSize={25} total={submissions.data?.total ?? 0} onPageChange={setPage} />
    </div>
  );
}
