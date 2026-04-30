import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Badge } from '../../components/Badge';
import { DataTable } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { useToast } from '../../components/Toast';
import { adminApi } from '../../services/adminApi';
import type { OrderRecord } from '../../services/types';
import { date, paise } from '../../utils/format';

const fulfillmentSchema = z.object({
  shippingStatus: z.enum(['NOT_STARTED', 'PACKING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']),
  courier: z.string().optional(),
  trackingNumber: z.string().optional(),
  adminNotes: z.string().optional(),
});

type FulfillmentForm = z.infer<typeof fulfillmentSchema>;

function OrderDrawer({ order, onClose }: { order?: OrderRecord; onClose: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const form = useForm<FulfillmentForm>({
    resolver: zodResolver(fulfillmentSchema),
    values: {
      shippingStatus: order?.shippingStatus ?? 'NOT_STARTED',
      courier: order?.courier ?? '',
      trackingNumber: order?.trackingNumber ?? '',
      adminNotes: order?.adminNotes ?? '',
    },
  });
  const mutation = useMutation({
    mutationFn: (payload: FulfillmentForm) => adminApi.updateFulfillment(order!.id, payload),
    onSuccess: () => {
      toast.show('Fulfillment updated.', 'success');
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      onClose();
    },
  });

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-40 bg-zinc-950/40">
      <aside className="ml-auto h-full w-full max-w-3xl overflow-y-auto bg-white p-6 shadow-xl dark:bg-zinc-950">
        <div className="flex justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Order {order.id.slice(0, 8)}</h2>
            <p className="text-sm text-zinc-500">{order.user?.email}</p>
          </div>
          <button className="button-secondary" onClick={onClose} type="button">Close</button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Info label="Total" value={paise(order.totalPaise)} />
          <Info label="Payment" value={order.status} />
          <Info label="Shipping" value={order.shippingStatus} />
          <Info label="Razorpay order" value={order.razorpayOrderId} />
          <Info label="Payment ID" value={order.razorpayPaymentId} />
          <Info label="Coupon" value={order.couponCode} />
        </div>

        <section className="mt-6">
          <h3 className="font-semibold">Items</h3>
          <div className="mt-3 space-y-2">
            {order.items.map(item => (
              <div className="flex justify-between rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800" key={item.id}>
                <span>{item.title} · {item.capacity} × {item.quantity}</span>
                <strong>{paise(item.lineTotalPaise)}</strong>
              </div>
            ))}
          </div>
        </section>

        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(values => mutation.mutate(values))}>
          <h3 className="font-semibold">Fulfillment</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium">
              Shipping status
              <select className="input mt-1" {...form.register('shippingStatus')}>
                {['NOT_STARTED', 'PACKING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'].map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Courier
              <input className="input mt-1" {...form.register('courier')} />
            </label>
            <label className="text-sm font-medium">
              Tracking number
              <input className="input mt-1" {...form.register('trackingNumber')} />
            </label>
            <label className="text-sm font-medium">
              Admin notes
              <input className="input mt-1" {...form.register('adminNotes')} />
            </label>
          </div>
          <button className="button-primary" disabled={mutation.isPending} type="submit">Save fulfillment</button>
        </form>
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-900">
      <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-1 break-words text-sm">{value ? String(value) : '-'}</p>
    </div>
  );
}

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<OrderRecord | null>(null);
  const orders = useQuery({
    queryKey: ['orders', page, status],
    queryFn: () => adminApi.orders({ page, pageSize: 25, status }),
  });
  const columns = useMemo<ColumnDef<OrderRecord>[]>(
    () => [
      { accessorKey: 'id', header: 'Order', cell: info => String(info.getValue()).slice(0, 8) },
      { accessorKey: 'user.email', header: 'Patient', cell: info => info.row.original.user?.email ?? info.row.original.userId },
      { accessorKey: 'totalPaise', header: 'Total', cell: info => paise(Number(info.getValue())) },
      { accessorKey: 'status', header: 'Payment', cell: info => <Badge value={String(info.getValue())} /> },
      { accessorKey: 'shippingStatus', header: 'Shipping', cell: info => <Badge value={String(info.getValue())} /> },
      { accessorKey: 'createdAt', header: 'Created', cell: info => date(String(info.getValue())) },
      { id: 'actions', header: 'Actions', cell: info => <button className="button-secondary min-h-8 px-3 py-1" onClick={() => setSelected(info.row.original)} type="button">Open</button> },
    ],
    []
  );

  return (
    <div className="space-y-5">
      <PageHeader description="Track payments, items, delivery address snapshots, and shipment progress." title="Orders & Fulfillment" />
      <div className="panel p-4">
        <select className="input max-w-xs" onChange={event => setStatus(event.target.value)} value={status}>
          <option value="">All payment statuses</option>
          <option value="PAYMENT_PENDING">Payment pending</option>
          <option value="PAID">Paid</option>
          <option value="PAYMENT_FAILED">Payment failed</option>
        </select>
      </div>
      <DataTable columns={columns} data={orders.data?.items ?? []} loading={orders.isLoading} />
      <Pagination page={page} pageSize={25} total={orders.data?.total ?? 0} onPageChange={setPage} />
      <OrderDrawer onClose={() => setSelected(null)} order={selected ?? undefined} />
    </div>
  );
}
