import { api } from './api';
import type {
  AdminMe,
  AiSummary,
  ApiEnvelope,
  AuditLog,
  Coupon,
  DashboardData,
  HealthStatus,
  ImmunitySubmission,
  ListQuery,
  OrderRecord,
  Paginated,
  Product,
  UserDetails,
  UserRecord,
  WeeklyReport,
} from './types';

function params(query?: ListQuery) {
  const search = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });

  return search;
}

async function item<T>(request: Promise<{ data: ApiEnvelope<T> }>) {
  const response = await request;
  return response.data.data;
}

async function list<T>(request: Promise<{ data: Paginated<T> }>) {
  const response = await request;
  return response.data;
}

export const adminApi = {
  me: () => item<AdminMe>(api.get('/me')),
  dashboard: () => item<DashboardData>(api.get('/dashboard')),
  health: () => item<HealthStatus>(api.get('/health')),
  configStatus: () => item<Record<string, unknown>>(api.get('/config-status')),
  users: (query?: ListQuery) => list<UserRecord>(api.get(`/users?${params(query)}`)),
  user: (id: string) => item<UserDetails>(api.get(`/users/${id}`)),
  updateUser: (id: string, payload: unknown) => item<UserRecord>(api.patch(`/users/${id}`, payload)),
  updateUserStatus: (id: string, payload: unknown) =>
    item<UserRecord>(api.patch(`/users/${id}/status`, payload)),
  deleteUser: (id: string) => item<UserRecord>(api.delete(`/users/${id}`)),
  immunitySubmissions: (query?: ListQuery) =>
    list<ImmunitySubmission>(api.get(`/immunity-submissions?${params(query)}`)),
  exportImmunityCsv: async (query?: ListQuery) => {
    const response = await api.get(`/immunity-submissions/export/csv?${params(query)}`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },
  immunitySubmission: (id: string) =>
    item<ImmunitySubmission>(api.get(`/immunity-submissions/${id}`)),
  immunityHistory: (userId: string) =>
    list<ImmunitySubmission>(api.get(`/users/${userId}/immunity-history`)),
  reports: (query?: ListQuery) => list<WeeklyReport>(api.get(`/reports?${params(query)}`)),
  report: (id: string) => item<WeeklyReport>(api.get(`/reports/${id}`)),
  generateReport: (userId: string) => item<unknown>(api.post(`/users/${userId}/reports/generate`)),
  regenerateReport: (id: string) => item<unknown>(api.post(`/reports/${id}/regenerate`)),
  aiSummaries: (query?: ListQuery) => list<AiSummary>(api.get(`/ai-summaries?${params(query)}`)),
  aiSummary: (id: string) => item<AiSummary>(api.get(`/ai-summaries/${id}`)),
  products: (query?: ListQuery) => list<Product>(api.get(`/products?${params(query)}`)),
  product: (id: string) => item<Product>(api.get(`/products/${id}`)),
  createProduct: (payload: unknown) => item<Product>(api.post('/products', payload)),
  updateProduct: (id: string, payload: unknown) => item<Product>(api.put(`/products/${id}`, payload)),
  updateProductStatus: (id: string, payload: unknown) =>
    item<Product>(api.patch(`/products/${id}/status`, payload)),
  deleteProduct: (id: string) => item<Product>(api.delete(`/products/${id}`)),
  bulkImportProducts: (csv: string) => item<{ imported: number }>(api.post('/products/bulk-import', { csv })),
  coupons: (query?: ListQuery) => list<Coupon>(api.get(`/coupons?${params(query)}`)),
  createCoupon: (payload: unknown) => item<Coupon>(api.post('/coupons', payload)),
  updateCoupon: (id: string, payload: unknown) => item<Coupon>(api.put(`/coupons/${id}`, payload)),
  updateCouponStatus: (id: string, payload: unknown) =>
    item<Coupon>(api.patch(`/coupons/${id}/status`, payload)),
  orders: (query?: ListQuery) => list<OrderRecord>(api.get(`/orders?${params(query)}`)),
  order: (id: string) => item<OrderRecord>(api.get(`/orders/${id}`)),
  updateOrderStatus: (id: string, payload: unknown) =>
    item<OrderRecord>(api.patch(`/orders/${id}/status`, payload)),
  updateFulfillment: (id: string, payload: unknown) =>
    item<OrderRecord>(api.patch(`/orders/${id}/fulfillment`, payload)),
  auditLogs: (query?: ListQuery) => list<AuditLog>(api.get(`/audit-logs?${params(query)}`)),
};
