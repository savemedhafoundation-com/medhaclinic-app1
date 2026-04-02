import AddCardOutlinedIcon from '@mui/icons-material/AddCardOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Alert,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';

import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { StatusChip } from '../components/StatusChip';
import { UserDetailsDrawer } from '../components/UserDetailsDrawer';
import { WalletDialog } from '../components/WalletDialog';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useBanUserMutation, useUserDetailsQuery, useUsersQuery, useWalletAdjustmentMutation } from '../hooks/useUsers';
import { formatCurrency, formatDate } from '../lib/formatters';
import type { AdminUser } from '../services/types';

export function UsersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [walletUser, setWalletUser] = useState<AdminUser | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const usersQuery = useUsersQuery({
    search: debouncedSearch || undefined,
    status: status || undefined,
  });
  const userDetailsQuery = useUserDetailsQuery(selectedUser?.id);
  const walletMutation = useWalletAdjustmentMutation();
  const banMutation = useBanUserMutation();

  const columns = useMemo<GridColDef<AdminUser>[]>(
    () => [
      {
        field: 'name',
        flex: 1.2,
        headerName: 'User',
        minWidth: 220,
        renderCell: params => params.row.name ?? params.row.email ?? params.row.id,
      },
      {
        field: 'email',
        flex: 1.2,
        headerName: 'Email',
        minWidth: 220,
        renderCell: params => params.row.email ?? '—',
      },
      {
        field: 'role',
        headerName: 'Role',
        minWidth: 120,
        renderCell: params => <StatusChip label={params.row.role} />,
      },
      {
        field: 'walletBalance',
        headerName: 'Wallet',
        minWidth: 140,
        renderCell: params => formatCurrency(params.row.walletBalance),
      },
      {
        field: 'status',
        headerName: 'Status',
        minWidth: 120,
        renderCell: params => <StatusChip label={params.row.isBanned ? 'banned' : params.row.status ?? 'active'} />,
      },
      {
        field: 'createdAt',
        headerName: 'Created',
        minWidth: 180,
        renderCell: params => formatDate(params.row.createdAt),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        minWidth: 170,
        sortable: false,
        renderCell: params => (
          <Stack direction="row" spacing={0.5}>
            <IconButton color="primary" onClick={() => setSelectedUser(params.row)} size="small">
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton color="primary" onClick={() => setWalletUser(params.row)} size="small">
              <AddCardOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton
              color={params.row.isBanned ? 'success' : 'error'}
              onClick={() =>
                banMutation.mutate({
                  userId: params.row.id,
                  banned: !params.row.isBanned,
                })
              }
              size="small">
              <BlockOutlinedIcon fontSize="small" />
            </IconButton>
          </Stack>
        ),
      },
    ],
    [banMutation]
  );

  return (
    <Stack spacing={3}>
      <PageHeader
        subtitle="Search users, inspect account state, update balances, and ban suspicious accounts."
        title="Users"
      />

      {usersQuery.error ? <Alert severity="error">{usersQuery.error.message}</Alert> : null}

      <SectionCard
        action={
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} width={{ xs: '100%', md: 'auto' }}>
            <TextField
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              label="Search users"
              onChange={event => setSearch(event.target.value)}
              size="small"
              value={search}
            />
            <TextField
              label="Status"
              onChange={event => setStatus(event.target.value)}
              select
              size="small"
              sx={{ minWidth: 160 }}
              value={status}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="banned">Banned</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
        }
        subtitle={`${usersQuery.data?.total ?? 0} users available`}
        title="User Directory">
        <DataGrid
          autoHeight
          columns={columns}
          disableRowSelectionOnClick
          loading={usersQuery.isLoading}
          pageSizeOptions={[10, 25, 50]}
          rows={usersQuery.data?.items ?? []}
        />
      </SectionCard>

      <UserDetailsDrawer
        onClose={() => setSelectedUser(null)}
        open={Boolean(selectedUser)}
        user={userDetailsQuery.data ?? selectedUser}
      />

      <WalletDialog
        onClose={() => setWalletUser(null)}
        onSubmit={payload => {
          if (!walletUser) {
            return;
          }

          walletMutation.mutate(
            {
              userId: walletUser.id,
              payload,
            },
            {
              onSuccess: () => setWalletUser(null),
            }
          );
        }}
        open={Boolean(walletUser)}
        submitting={walletMutation.isPending}
        user={walletUser}
      />
    </Stack>
  );
}
