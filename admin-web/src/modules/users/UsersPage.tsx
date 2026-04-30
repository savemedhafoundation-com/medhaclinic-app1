import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { Badge } from '../../components/Badge';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { DataTable } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { useToast } from '../../components/Toast';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useAuth } from '../auth/AuthProvider';
import { adminApi } from '../../services/adminApi';
import type { UserDetails, UserRecord } from '../../services/types';
import { date } from '../../utils/format';

function UserDrawer({
  user,
  onClose,
  onAddNote,
}: {
  user?: UserDetails;
  onClose: () => void;
  onAddNote: (note: string) => void;
}) {
  const [note, setNote] = useState('');

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-zinc-950/40">
      <aside className="ml-auto h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">{user.name ?? user.email ?? 'Patient'}</h2>
            <p className="text-sm text-zinc-500">{user.email}</p>
          </div>
          <button className="button-secondary" onClick={onClose} type="button">Close</button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <Info label="Phone" value={user.phone} />
          <Info label="Joined" value={date(user.createdAt)} />
          <Info label="Age" value={user.profile?.age} />
          <Info label="Gender" value={user.profile?.gender} />
          <Info label="Purpose" value={user.profile?.purpose} wide />
          <Info label="Address" value={user.profile?.address} wide />
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <Info label="Submissions" value={user._count?.submissions ?? 0} />
          <Info label="Reports" value={user._count?.reports ?? 0} />
          <Info label="Orders" value={user._count?.orders ?? 0} />
          <Info label="AI logs" value={user._count?.aiSummaries ?? 0} />
        </div>

        <section className="mt-6">
          <h3 className="font-semibold">Support Notes</h3>
          <div className="mt-3 flex gap-2">
            <input className="input" onChange={event => setNote(event.target.value)} placeholder="Add internal note" value={note} />
            <button
              className="button-primary"
              disabled={!note.trim()}
              onClick={() => {
                onAddNote(note);
                setNote('');
              }}
              type="button">
              Add
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {user.notes?.map(item => (
              <div className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800" key={item.id}>
                <p>{item.note}</p>
                <p className="mt-1 text-xs text-zinc-500">{date(item.createdAt)} · {item.createdBy ?? 'admin'}</p>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

function Info({ label, value, wide }: { label: string; value: unknown; wide?: boolean }) {
  return (
    <div className={`rounded-md bg-zinc-50 p-3 dark:bg-zinc-900 ${wide ? 'md:col-span-2' : ''}`}>
      <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-1 break-words text-sm">{value ? String(value) : '-'}</p>
    </div>
  );
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const queryClient = useQueryClient();
  const toast = useToast();
  const { role } = useAuth();

  const users = useQuery({
    queryKey: ['users', page, debouncedSearch, status],
    queryFn: () => adminApi.users({ page, pageSize: 25, search: debouncedSearch, status }),
  });
  const detail = useQuery({
    queryKey: ['user', selected],
    queryFn: () => adminApi.user(selected!),
    enabled: Boolean(selected),
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, disabled }: { id: string; disabled: boolean }) =>
      adminApi.updateUserStatus(id, { disabled }),
    onSuccess: () => {
      toast.show('User status updated.', 'success');
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      void queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
  const updateUser = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => adminApi.updateUser(id, { note }),
    onSuccess: () => {
      toast.show('Note added.', 'success');
      void queryClient.invalidateQueries({ queryKey: ['user', selected] });
    },
  });
  const deleteUser = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      toast.show('User soft deleted.', 'success');
      setDeleteId(null);
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const columns = useMemo<ColumnDef<UserRecord>[]>(
    () => [
      { accessorKey: 'name', header: 'Patient', cell: info => String(info.getValue() ?? info.row.original.email ?? '-') },
      { accessorKey: 'email', header: 'Email', cell: info => String(info.getValue() ?? '-') },
      { accessorKey: 'phone', header: 'Phone', cell: info => String(info.getValue() ?? '-') },
      { accessorKey: 'disabled', header: 'Status', cell: info => <Badge value={info.getValue() ? 'disabled' : 'active'} /> },
      { accessorKey: 'createdAt', header: 'Joined', cell: info => date(String(info.getValue())) },
      {
        id: 'actions',
        header: 'Actions',
        cell: info => (
          <div className="flex gap-2">
            <button className="button-secondary min-h-8 px-3 py-1" onClick={() => setSelected(info.row.original.id)} type="button">
              View
            </button>
            <button
              className="button-secondary min-h-8 px-3 py-1"
              onClick={() => updateStatus.mutate({ id: info.row.original.id, disabled: !info.row.original.disabled })}
              type="button">
              {info.row.original.disabled ? 'Enable' : 'Disable'}
            </button>
            {role === 'super_admin' ? (
              <button className="button-danger min-h-8 px-3 py-1" onClick={() => setDeleteId(info.row.original.id)} type="button">
                Delete
              </button>
            ) : null}
          </div>
        ),
      },
    ],
    [role, updateStatus]
  );

  return (
    <div className="space-y-5">
      <PageHeader description="Search patients, inspect wellness profiles, support notes, reports, submissions, and order history." title="Users" />

      <div className="panel grid gap-3 p-4 md:grid-cols-[1fr_180px]">
        <input className="input" onChange={event => setSearch(event.target.value)} placeholder="Search by name, email, or phone" value={search} />
        <select className="input" onChange={event => setStatus(event.target.value)} value={status}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      <DataTable columns={columns} data={users.data?.items ?? []} loading={users.isLoading} />
      <Pagination page={page} pageSize={25} total={users.data?.total ?? 0} onPageChange={setPage} />

      <UserDrawer
        onAddNote={note => selected && updateUser.mutate({ id: selected, note })}
        onClose={() => setSelected(null)}
        user={detail.data}
      />
      <ConfirmDialog
        confirmLabel="Soft delete"
        description="The account will be disabled and hidden from normal admin lists. Historical reports and orders remain retained."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteUser.mutate(deleteId)}
        open={Boolean(deleteId)}
        title="Soft delete user?"
      />
    </div>
  );
}
