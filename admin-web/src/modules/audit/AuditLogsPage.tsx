import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { DataTable } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { adminApi } from '../../services/adminApi';
import type { AuditLog } from '../../services/types';
import { date } from '../../utils/format';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search);
  const logs = useQuery({
    queryKey: ['audit-logs', page, debounced],
    queryFn: () => adminApi.auditLogs({ page, pageSize: 25, search: debounced }),
  });
  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      { accessorKey: 'action', header: 'Action' },
      { accessorKey: 'entity', header: 'Entity' },
      { accessorKey: 'entityId', header: 'Entity ID', cell: info => String(info.getValue() ?? '-').slice(0, 16) },
      { accessorKey: 'actor.email', header: 'Actor', cell: info => info.row.original.actor?.email ?? info.row.original.actorId ?? '-' },
      { accessorKey: 'createdAt', header: 'Created', cell: info => date(String(info.getValue())) },
    ],
    []
  );

  return (
    <div className="space-y-5">
      <PageHeader description="Immutable operational log for edits, deletes, report generation, coupon changes, and fulfillment updates." title="Audit Logs" />
      <div className="panel p-4">
        <input className="input max-w-xl" onChange={event => setSearch(event.target.value)} placeholder="Search action, entity, or entity id" value={search} />
      </div>
      <DataTable columns={columns} data={logs.data?.items ?? []} loading={logs.isLoading} />
      <Pagination page={page} pageSize={25} total={logs.data?.total ?? 0} onPageChange={setPage} />
    </div>
  );
}
