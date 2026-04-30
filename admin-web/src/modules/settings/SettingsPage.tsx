import { useQuery } from '@tanstack/react-query';

import { Badge } from '../../components/Badge';
import { PageHeader } from '../../components/PageHeader';
import { adminApi } from '../../services/adminApi';

function HealthCard({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="panel p-4">
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <div className="mt-3 text-lg font-semibold">
        {typeof value === 'boolean' ? <Badge value={value ? 'configured' : 'missing'} /> : String(value ?? '-')}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const health = useQuery({ queryKey: ['admin-health'], queryFn: adminApi.health });
  const config = useQuery({ queryKey: ['admin-config'], queryFn: adminApi.configStatus });

  return (
    <div className="space-y-5">
      <PageHeader description="Live backend health, secret presence, runtime, and configuration indicators." title="Settings & Health" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <HealthCard label="Status" value={health.data?.status ?? 'loading'} />
        <HealthCard label="Database reachable" value={health.data?.databaseReachable ?? false} />
        <HealthCard label="Firebase Admin" value={health.data?.firebaseAdminConfigured ?? false} />
        <HealthCard label="OpenAI" value={health.data?.openaiConfigured ?? false} />
        <HealthCard label="Razorpay" value={health.data?.razorpayConfigured ?? false} />
        <HealthCard label="Environment" value={health.data?.envMode} />
        <HealthCard label="Backend version" value={health.data?.backendVersion} />
        <HealthCard label="Uptime seconds" value={health.data?.uptimeSeconds} />
      </div>

      <section className="panel p-5">
        <h2 className="font-semibold">Configuration Status</h2>
        <pre className="mt-4 overflow-auto rounded-md bg-zinc-950 p-4 text-xs text-zinc-50">
          {JSON.stringify(config.data ?? {}, null, 2)}
        </pre>
      </section>
    </div>
  );
}
