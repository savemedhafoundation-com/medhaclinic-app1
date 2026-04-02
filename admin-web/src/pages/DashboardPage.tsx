import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { EmptyState } from '../components/EmptyState';
import { MetricCard } from '../components/MetricCard';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { formatCurrency, formatNumber } from '../lib/formatters';
import { useDashboardData } from '../hooks/useDashboardData';

function suspiciousLabelSuffix(count: number) {
  return count === 1 ? '' : 's';
}

export function DashboardPage() {
  const { metrics, isLoading, healthQuery, gamesQuery, transactionsQuery } = useDashboardData();
  const suspiciousGames = (gamesQuery.data?.items ?? []).filter(item => (item.suspiciousScore ?? 0) >= 0.7);

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="60vh" spacing={2}>
        <CircularProgress />
        <Typography color="text.secondary">Loading admin metrics...</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        subtitle="Daily operational overview for users, money flow, gameplay, and infrastructure."
        title="Dashboard"
      />

      {!healthQuery.data?.databaseReachable || !healthQuery.data?.openaiConfigured ? (
        <Alert severity="warning">
          Some backend systems still need attention. Check the Settings page for live `/health` details.
        </Alert>
      ) : null}

      {suspiciousGames.length ? (
        <Alert severity="error">
          {suspiciousGames.length} active game{suspiciousLabelSuffix(suspiciousGames.length)} flagged as suspicious.
        </Alert>
      ) : null}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <MetricCard
            helperText="Registered platform users"
            icon={<GroupOutlinedIcon />}
            title="Total users"
            value={formatNumber(metrics.totalUsers)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <MetricCard
            helperText="Successful inflow observed"
            icon={<AccountBalanceWalletOutlinedIcon />}
            title="Total revenue"
            value={formatCurrency(metrics.totalRevenue)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <MetricCard
            helperText="Rooms currently in play"
            icon={<SportsEsportsOutlinedIcon />}
            title="Active games"
            value={formatNumber(metrics.activeGames)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <MetricCard
            helperText="Awaiting admin action"
            icon={<PaymentsOutlinedIcon />}
            title="Pending withdrawals"
            value={formatNumber(metrics.pendingWithdrawals)}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard subtitle="Recent transaction inflow trend" title="Revenue Trend">
            {metrics.dailyRevenue.length ? (
              <Box sx={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={metrics.dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line dataKey="value" stroke="#1f8f2e" strokeWidth={3} type="monotone" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <EmptyState
                description="No transaction trend data was returned by the API."
                icon={<AccountBalanceWalletOutlinedIcon />}
                title="No chart data"
              />
            )}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard subtitle="Withdrawal request outcomes" title="Withdrawal Status">
            {metrics.withdrawalTrend.length ? (
              <Box sx={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={metrics.withdrawalTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#3dbb5d" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <EmptyState
                description="No withdrawal history is available yet."
                icon={<PaymentsOutlinedIcon />}
                title="No withdrawal data"
              />
            )}
          </SectionCard>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard subtitle="Operational risk markers" title="Game Monitoring">
            <Stack spacing={1.5}>
              <Typography variant="body2">
                Active monitored rooms: <strong>{formatNumber(metrics.activeGames)}</strong>
              </Typography>
              <Typography variant="body2">
                Suspicious active rooms: <strong>{formatNumber(suspiciousGames.length)}</strong>
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Use the Games page to inspect room-level flags, stake sizes, and suspicious activity scores.
              </Typography>
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard subtitle="Backend and infrastructure health" title="System Snapshot">
            <Stack spacing={1.5}>
              <Typography variant="body2">
                API status: <strong>{healthQuery.data?.status ?? 'unknown'}</strong>
              </Typography>
              <Typography variant="body2">
                Database reachable: <strong>{String(healthQuery.data?.databaseReachable ?? false)}</strong>
              </Typography>
              <Typography variant="body2">
                OpenAI configured: <strong>{String(healthQuery.data?.openaiConfigured ?? false)}</strong>
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Latest transaction rows loaded: {formatNumber(transactionsQuery.data?.items.length ?? 0)}
              </Typography>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  );
}
