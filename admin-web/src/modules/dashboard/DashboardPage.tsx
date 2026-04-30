import { useQuery } from '@tanstack/react-query';

import { Badge } from '../../components/Badge';
import { DataTable } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { adminApi } from '../../services/adminApi';
import type { DashboardData } from '../../services/types';
import { currency, date, number } from '../../utils/format';

function BarList({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map(row => row.value));

  return (
    <div className="space-y-3">
      {rows.map(row => (
        <div key={row.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-200">{row.label}</span>
            <span className="text-zinc-500">{number(row.value)}</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className="h-2 rounded-full bg-clinic-600" style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const dashboard = useQuery({
    queryKey: ['dashboard'],
    queryFn: adminApi.dashboard,
  });
  const data = dashboard.data;
  const totals = data?.totals;

  return (
    <div className="space-y-6">
      <PageHeader
        description="Daily command center for patients, wellness tracking, reports, store revenue, and system status."
        title="Dashboard"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={number(totals?.totalUsers ?? 0)} helper={`${number(totals?.activeUsers ?? 0)} active`} />
        <StatCard label="Revenue" value={currency(totals?.revenue ?? 0)} helper={`${number(totals?.paidOrders ?? 0)} paid orders`} />
        <StatCard label="Immunity submissions" value={number(totals?.immunitySubmissions ?? 0)} helper={`Avg latest score ${number(totals?.averageLatestImmunityScore ?? 0, 1)}`} />
        <StatCard label="AI logs" value={number(totals?.aiSummaries ?? 0)} helper={`${number(totals?.reportsGenerated ?? 0)} reports`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="panel p-5 xl:col-span-2">
          <h2 className="font-semibold">Clinic Growth</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <StatCard label="Today" value={number(totals?.newUsersToday ?? 0)} />
            <StatCard label="7 days" value={number(totals?.newUsersWeek ?? 0)} />
            <StatCard label="30 days" value={number(totals?.newUsersMonth ?? 0)} />
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="font-semibold">System Snapshot</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><span>Database</span><Badge value={data?.systemHealth.databaseConfigured ? 'configured' : 'missing'} /></div>
            <div className="flex justify-between"><span>Firebase Admin</span><Badge value={data?.systemHealth.firebaseAdminConfigured ? 'configured' : 'missing'} /></div>
            <div className="flex justify-between"><span>OpenAI</span><Badge value={data?.systemHealth.openaiConfigured ? 'configured' : 'missing'} /></div>
            <div className="flex justify-between"><span>Razorpay</span><Badge value={data?.systemHealth.razorpayConfigured ? 'configured' : 'missing'} /></div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="panel p-5">
          <h2 className="font-semibold">Order Status</h2>
          <div className="mt-5">
            <BarList rows={(data?.orderCountsByStatus ?? []).map(row => ({ label: row.status, value: row.total }))} />
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="font-semibold">Top Products</h2>
          <div className="mt-5">
            <BarList rows={(data?.topProducts ?? []).map(row => ({ label: row.title, value: row.quantity }))} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section>
          <h2 className="mb-3 font-semibold">Latest Orders</h2>
          <DataTable<DashboardData['latestOrders'][number]>
            columns={[
              { accessorKey: 'id', header: 'Order', cell: info => String(info.getValue()).slice(0, 8) },
              { accessorKey: 'userEmail', header: 'Patient' },
              { accessorKey: 'total', header: 'Total', cell: info => currency(Number(info.getValue())) },
              { accessorKey: 'status', header: 'Payment', cell: info => <Badge value={String(info.getValue())} /> },
              { accessorKey: 'createdAt', header: 'Created', cell: info => date(String(info.getValue())) },
            ]}
            data={data?.latestOrders ?? []}
            loading={dashboard.isLoading}
          />
        </section>
        <section>
          <h2 className="mb-3 font-semibold">Latest Users</h2>
          <DataTable<DashboardData['latestUsers'][number]>
            columns={[
              { accessorKey: 'name', header: 'Name', cell: info => String(info.getValue() ?? '-') },
              { accessorKey: 'email', header: 'Email', cell: info => String(info.getValue() ?? '-') },
              { accessorKey: 'disabled', header: 'Status', cell: info => <Badge value={info.getValue() ? 'disabled' : 'active'} /> },
              { accessorKey: 'createdAt', header: 'Joined', cell: info => date(String(info.getValue())) },
            ]}
            data={data?.latestUsers ?? []}
            loading={dashboard.isLoading}
          />
        </section>
      </div>
    </div>
  );
}
