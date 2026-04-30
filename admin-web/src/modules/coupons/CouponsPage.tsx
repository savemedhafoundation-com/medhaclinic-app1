import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Badge } from '../../components/Badge';
import { DataTable } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { useToast } from '../../components/Toast';
import { couponSchema, type CouponFormInput, type CouponFormValues } from '../../schemas/catalog';
import { adminApi } from '../../services/adminApi';
import type { Coupon } from '../../services/types';
import { date, paise } from '../../utils/format';

function toForm(coupon?: Coupon): CouponFormInput {
  return {
    code: coupon?.code ?? '',
    discountType: coupon?.discountType ?? 'PERCENTAGE',
    discountValue: coupon?.discountValue ?? 10,
    minSubtotal: (coupon?.minSubtotalPaise ?? 0) / 100,
    maxDiscount: coupon?.maxDiscountPaise ? coupon.maxDiscountPaise / 100 : undefined,
    usageLimit: coupon?.usageLimit ?? undefined,
    expiresAt: coupon?.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
    active: coupon?.active ?? true,
  };
}

function CouponForm({ coupon, onClose }: { coupon?: Coupon; onClose: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const form = useForm<CouponFormInput, unknown, CouponFormValues>({
    resolver: zodResolver(couponSchema),
    values: toForm(coupon),
  });
  const save = useMutation({
    mutationFn: (values: CouponFormValues) =>
      coupon
        ? adminApi.updateCoupon(coupon.id, { ...values, expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null })
        : adminApi.createCoupon({ ...values, expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null }),
    onSuccess: () => {
      toast.show('Coupon saved.', 'success');
      void queryClient.invalidateQueries({ queryKey: ['coupons'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/40 p-4">
      <form className="panel w-full max-w-2xl p-6" onSubmit={form.handleSubmit(values => save.mutate(values))}>
        <div className="flex justify-between gap-3">
          <h2 className="text-xl font-semibold">{coupon ? 'Edit coupon' : 'New coupon'}</h2>
          <button className="button-secondary" onClick={onClose} type="button">Close</button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">Code<input className="input mt-1" {...form.register('code')} /></label>
          <label className="text-sm font-medium">
            Type
            <select className="input mt-1" {...form.register('discountType')}>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FLAT">Flat</option>
            </select>
          </label>
          <label className="text-sm font-medium">Value<input className="input mt-1" {...form.register('discountValue')} /></label>
          <label className="text-sm font-medium">Min subtotal<input className="input mt-1" {...form.register('minSubtotal')} /></label>
          <label className="text-sm font-medium">Max discount<input className="input mt-1" {...form.register('maxDiscount')} /></label>
          <label className="text-sm font-medium">Usage limit<input className="input mt-1" {...form.register('usageLimit')} /></label>
          <label className="text-sm font-medium">Expiry date<input className="input mt-1" type="date" {...form.register('expiresAt')} /></label>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" {...form.register('active')} /> Active</label>
        </div>
        <button className="button-primary mt-6" disabled={save.isPending} type="submit">Save coupon</button>
      </form>
    </div>
  );
}

export default function CouponsPage() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Coupon | 'new' | null>(null);
  const coupons = useQuery({
    queryKey: ['coupons', page],
    queryFn: () => adminApi.coupons({ page, pageSize: 25 }),
  });
  const columns = useMemo<ColumnDef<Coupon>[]>(
    () => [
      { accessorKey: 'code', header: 'Code' },
      { accessorKey: 'discountType', header: 'Type', cell: info => <Badge value={String(info.getValue())} /> },
      { accessorKey: 'discountValue', header: 'Value' },
      { accessorKey: 'minSubtotalPaise', header: 'Min subtotal', cell: info => paise(Number(info.getValue())) },
      { accessorKey: 'usedCount', header: 'Used' },
      { accessorKey: 'active', header: 'Status', cell: info => <Badge value={info.getValue() ? 'active' : 'inactive'} /> },
      { accessorKey: 'expiresAt', header: 'Expires', cell: info => date(String(info.getValue() ?? '')) },
      { id: 'actions', header: 'Actions', cell: info => <button className="button-secondary min-h-8 px-3 py-1" onClick={() => setEditing(info.row.original)} type="button">Edit</button> },
    ],
    []
  );

  return (
    <div className="space-y-5">
      <PageHeader
        action={<button className="button-primary" onClick={() => setEditing('new')} type="button">New coupon</button>}
        description="Create and manage promo codes, limits, active windows, and discount rules."
        title="Coupons"
      />
      <DataTable columns={columns} data={coupons.data?.items ?? []} loading={coupons.isLoading} />
      <Pagination page={page} pageSize={25} total={coupons.data?.total ?? 0} onPageChange={setPage} />
      {editing ? <CouponForm coupon={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} /> : null}
    </div>
  );
}
