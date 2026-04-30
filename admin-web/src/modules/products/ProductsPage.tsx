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
import { productSchema, type ProductFormInput, type ProductFormValues } from '../../schemas/catalog';
import { adminApi } from '../../services/adminApi';
import type { Product } from '../../services/types';
import { date, paise } from '../../utils/format';

function toForm(product?: Product): ProductFormInput {
  const variants = product?.variants?.length
    ? product.variants
        .map(variant => `${variant.title}|${variant.pricePaise / 100}|${variant.stock}|${variant.sku ?? ''}|${variant.active}`)
        .join('\n')
    : '';

  return {
    slug: product?.slug ?? '',
    title: product?.title ?? '',
    shortTitle: product?.shortTitle ?? '',
    capacity: product?.capacity ?? 'Standard',
    price: (product?.pricePaise ?? product?.minPricePaise ?? 0) / 100,
    priceType: product?.priceType ?? 'FIXED',
    minPrice: (product?.minPricePaise ?? product?.pricePaise ?? 0) / 100,
    maxPrice: (product?.maxPricePaise ?? product?.pricePaise ?? 0) / 100,
    mrp: (product?.mrpPaise ?? 0) / 100,
    category: product?.category ?? 'BOOSTERS',
    description: product?.description ?? '',
    detailDescription: product?.detailDescription ?? '',
    benefits: product?.benefits ?? '',
    usage: product?.usage ?? product?.howToUse ?? '',
    howToUse: product?.howToUse ?? '',
    subtitle: product?.subtitle ?? '',
    supportLine: product?.supportLine ?? 'Medha Clinic support',
    stock: product?.stock ?? 0,
    sku: product?.sku ?? '',
    imagesText: [
      ...(Array.isArray(product?.images) ? product.images : []),
      ...(product?.gallery?.map(image => image.url) ?? []),
    ].join('\n'),
    tagsText: Array.isArray(product?.tags) ? product.tags.join(', ') : '',
    sortOrder: product?.sortOrder ?? 0,
    featured: product?.featured ?? false,
    hidden: product?.hidden ?? false,
    seoTitle: product?.seoTitle ?? '',
    seoDescription: product?.seoDescription ?? '',
    variantsText: variants,
    active: product?.active ?? true,
  };
}

function parseVariants(text?: string) {
  return (text ?? '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [title, price, stock, sku, active] = line.split('|').map(value => value.trim());
      return {
        title,
        price: Number(price || 0),
        stock: Number(stock || 0),
        sku: sku || null,
        active: active !== 'false',
        sortOrder: index,
      };
    });
}

function optionalText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function ProductForm({ product, onClose }: { product?: Product; onClose: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = useState('Basic Info');
  const form = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    mode: 'onSubmit',
    values: toForm(product),
  });
  const save = useMutation({
    mutationFn: (values: ProductFormValues) => {
      const images = values.imagesText?.split('\n').map(item => item.trim()).filter(Boolean) ?? [];
      const payload = {
        ...values,
        slug: optionalText(values.slug),
        shortTitle: optionalText(values.shortTitle),
        subtitle: optionalText(values.subtitle),
        supportLine: optionalText(values.supportLine),
        description: optionalText(values.description),
        detailDescription: optionalText(values.detailDescription),
        benefits: optionalText(values.benefits),
        usage: optionalText(values.usage),
        howToUse: optionalText(values.howToUse),
        sku: optionalText(values.sku),
        seoTitle: optionalText(values.seoTitle),
        seoDescription: optionalText(values.seoDescription),
        images,
        tags: values.tagsText?.split(',').map(item => item.trim()).filter(Boolean) ?? [],
        variants: parseVariants(values.variantsText),
      };
      return product ? adminApi.updateProduct(product.id, payload) : adminApi.createProduct(payload);
    },
    onSuccess: () => {
      toast.show('Product saved.', 'success');
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
    onError: error => {
      toast.show(error instanceof Error ? error.message : 'Could not save product.', 'error');
    },
  });
  const tabs = ['Basic Info', 'Pricing', 'Variants', 'Images', 'SEO', 'Inventory'];

  return (
    <div className="fixed inset-0 z-40 bg-zinc-950/40">
      <aside className="ml-auto h-full w-full max-w-5xl overflow-y-auto bg-white p-6 dark:bg-zinc-950">
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold">{product ? 'Edit product' : 'New product'}</h2>
          <button className="button-secondary" onClick={onClose} type="button">Close</button>
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto">
          {tabs.map(item => (
            <button className={item === tab ? 'button-primary' : 'button-secondary'} key={item} onClick={() => setTab(item)} type="button">
              {item}
            </button>
          ))}
        </div>
        <form className="mt-6 space-y-5" onSubmit={form.handleSubmit(values => save.mutate(values))}>
          {Object.keys(form.formState.errors).length > 0 ? (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              Please check the highlighted product fields before saving.
            </div>
          ) : null}
          {tab === 'Basic Info' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field form={form} label="Product name" name="title" />
              <Field form={form} label="Slug" name="slug" />
              <Field form={form} label="Subtitle" name="subtitle" />
              <Field form={form} label="Short title" name="shortTitle" />
              <label className="text-sm font-medium">
                Category
                <select className="input mt-1" {...form.register('category')}>
                  <option value="BOOSTERS">Boosters</option>
                  <option value="SUPPLEMENTS">Supplements</option>
                  <option value="PACKAGES">Packages</option>
                </select>
              </label>
              <Field form={form} label="Support line" name="supportLine" />
              <TextArea form={form} label="Short description" name="description" />
              <TextArea form={form} label="Full description" name="detailDescription" />
              <TextArea form={form} label="Benefits" name="benefits" />
              <TextArea form={form} label="Usage instructions" name="howToUse" />
            </div>
          ) : null}

          {tab === 'Pricing' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium">
                Price type
                <select className="input mt-1" {...form.register('priceType')}>
                  <option value="FIXED">Fixed</option>
                  <option value="RANGE">Range</option>
                </select>
              </label>
              <Field form={form} label="Default price" name="price" />
              <Field form={form} label="Min price" name="minPrice" />
              <Field form={form} label="Max price" name="maxPrice" />
              <Field form={form} label="MRP" name="mrp" />
            </div>
          ) : null}

          {tab === 'Variants' ? (
            <label className="block text-sm font-medium">
              Variants: one per line as title|price|stock|sku|active
              <textarea className="input mt-2 min-h-72 font-mono" {...form.register('variantsText')} />
            </label>
          ) : null}

          {tab === 'Images' ? (
            <label className="block text-sm font-medium">
              Image / gallery URLs: one per line
              <textarea className="input mt-2 min-h-72" {...form.register('imagesText')} />
            </label>
          ) : null}

          {tab === 'SEO' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field form={form} label="SEO title" name="seoTitle" />
              <TextArea form={form} label="SEO description" name="seoDescription" />
              <TextArea form={form} label="Tags, comma separated" name="tagsText" />
            </div>
          ) : null}

          {tab === 'Inventory' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field form={form} label="Stock qty" name="stock" />
              <Field form={form} label="SKU" name="sku" />
              <Field form={form} label="Sort order" name="sortOrder" />
              <Field form={form} label="Capacity fallback" name="capacity" />
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" {...form.register('active')} /> Active</label>
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" {...form.register('featured')} /> Featured</label>
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" {...form.register('hidden')} /> Hidden</label>
            </div>
          ) : null}

          <button className="button-primary" disabled={save.isPending} type="submit">Save product</button>
        </form>
      </aside>
    </div>
  );
}

function Field({ form, name, label }: { form: ReturnType<typeof useForm<ProductFormInput, unknown, ProductFormValues>>; name: keyof ProductFormInput; label: string }) {
  const error = form.formState.errors[name]?.message;

  return (
    <label className="text-sm font-medium">
      {label}
      <input className="input mt-1" {...form.register(name)} />
      {error ? <span className="mt-1 block text-xs text-red-600">{String(error)}</span> : null}
    </label>
  );
}

function TextArea({ form, name, label }: { form: ReturnType<typeof useForm<ProductFormInput, unknown, ProductFormValues>>; name: keyof ProductFormInput; label: string }) {
  const error = form.formState.errors[name]?.message;

  return (
    <label className="text-sm font-medium md:col-span-2">
      {label}
      <textarea className="input mt-1 min-h-24" {...form.register(name)} />
      {error ? <span className="mt-1 block text-xs text-red-600">{String(error)}</span> : null}
    </label>
  );
}

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const [bulkCsv, setBulkCsv] = useState('');
  const queryClient = useQueryClient();
  const toast = useToast();
  const products = useQuery({
    queryKey: ['products', page, status, search, category, featuredFilter, activeFilter, lowStock],
    queryFn: () =>
      adminApi.products({
        page,
        pageSize: 25,
        status,
        search,
        category,
        featured: featuredFilter,
        active: activeFilter,
        lowStock: lowStock ? 'true' : '',
      }),
  });
  const archive = useMutation({
    mutationFn: adminApi.deleteProduct,
    onSuccess: () => {
      toast.show('Product archived.', 'success');
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
  const bulkImport = useMutation({
    mutationFn: adminApi.bulkImportProducts,
    onSuccess: result => {
      toast.show(`Imported ${result.imported} products.`, 'success');
      setBulkCsv('');
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: 'image',
        header: 'Image',
        cell: info => {
          const url = info.row.original.gallery?.[0]?.url ?? (Array.isArray(info.row.original.images) ? info.row.original.images[0] : null);
          return url ? <img alt="" className="h-10 w-10 rounded-md object-cover" src={url} /> : <div className="h-10 w-10 rounded-md bg-zinc-100 dark:bg-zinc-800" />;
        },
      },
      { accessorKey: 'title', header: 'Name' },
      { accessorKey: 'category', header: 'Category', cell: info => <Badge value={String(info.getValue())} /> },
      {
        id: 'price',
        header: 'Price',
        cell: info => {
          const p = info.row.original;
          return p.priceType === 'RANGE'
            ? `${paise(p.minPricePaise ?? p.pricePaise)} - ${paise(p.maxPricePaise ?? p.pricePaise)}`
            : paise(p.pricePaise);
        },
      },
      { accessorKey: 'stock', header: 'Stock' },
      { accessorKey: 'featured', header: 'Featured', cell: info => <Badge value={info.getValue() ? 'yes' : 'no'} /> },
      { accessorKey: 'active', header: 'Active', cell: info => <Badge value={info.getValue() ? 'active' : 'inactive'} /> },
      { accessorKey: 'createdAt', header: 'Created', cell: info => date(String(info.getValue())) },
      {
        id: 'actions',
        header: 'Actions',
        cell: info => (
          <div className="flex gap-2">
            <button className="button-secondary min-h-8 px-3 py-1" onClick={() => setEditing(info.row.original)} type="button">Edit</button>
            <button className="button-secondary min-h-8 px-3 py-1" type="button">Duplicate</button>
            <button className="button-danger min-h-8 px-3 py-1" onClick={() => archive.mutate(info.row.original.id)} type="button">Delete</button>
          </div>
        ),
      },
    ],
    [archive]
  );

  return (
    <div className="space-y-5">
      <PageHeader
        action={<button className="button-primary" onClick={() => setEditing('new')} type="button">New product</button>}
        description="Manage boosters, supplements, packages, variants, pricing, stock, images, SEO, and visibility without touching code."
        title="Products"
      />
      <div className="panel grid gap-3 p-4 md:grid-cols-5">
        <input className="input" onChange={event => setSearch(event.target.value)} placeholder="Search products" value={search} />
        <select className="input" onChange={event => setCategory(event.target.value)} value={category}>
          <option value="">All categories</option>
          <option value="BOOSTERS">Boosters</option>
          <option value="SUPPLEMENTS">Supplements</option>
          <option value="PACKAGES">Packages</option>
        </select>
        <select className="input" onChange={event => setActiveFilter(event.target.value)} value={activeFilter}>
          <option value="">Any active state</option>
          <option value="true">Active only</option>
          <option value="false">Inactive only</option>
        </select>
        <select className="input" onChange={event => setFeaturedFilter(event.target.value)} value={featuredFilter}>
          <option value="">Any featured state</option>
          <option value="true">Featured only</option>
          <option value="false">Not featured</option>
        </select>
        <select className="input" onChange={event => setStatus(event.target.value)} value={status}>
          <option value="">All products</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="featured">Featured</option>
          <option value="hidden">Hidden</option>
          <option value="low-stock">Low stock</option>
          <option value="archived">Archived</option>
        </select>
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
          <input checked={lowStock} onChange={event => setLowStock(event.target.checked)} type="checkbox" />
          Low stock
        </label>
      </div>
      <div className="panel p-4">
        <label className="block text-sm font-medium">
          Bulk import CSV
          <textarea
            className="input mt-2 min-h-24 font-mono"
            onChange={event => setBulkCsv(event.target.value)}
            placeholder="name,category,minPrice,maxPrice,stock,active"
            value={bulkCsv}
          />
        </label>
        <button className="button-secondary mt-3" disabled={!bulkCsv.trim() || bulkImport.isPending} onClick={() => bulkImport.mutate(bulkCsv)} type="button">
          Import CSV
        </button>
      </div>
      <DataTable columns={columns} data={products.data?.items ?? []} loading={products.isLoading} />
      <Pagination page={page} pageSize={25} total={products.data?.total ?? 0} onPageChange={setPage} />
      {editing ? <ProductForm onClose={() => setEditing(null)} product={editing === 'new' ? undefined : editing} /> : null}
    </div>
  );
}
