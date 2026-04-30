import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AdminLayout } from './AdminLayout';
import { Providers } from './Providers';
import { LoginPage } from '../modules/auth/LoginPage';
import { ProtectedRoute } from '../modules/auth/ProtectedRoute';
import { UnauthorizedPage } from '../modules/auth/UnauthorizedPage';

const DashboardPage = lazy(() => import('../modules/dashboard/DashboardPage'));
const UsersPage = lazy(() => import('../modules/users/UsersPage'));
const ImmunityPage = lazy(() => import('../modules/immunity/ImmunityPage'));
const ReportsPage = lazy(() => import('../modules/reports/ReportsPage'));
const AiMonitoringPage = lazy(() => import('../modules/ai/AiMonitoringPage'));
const ProductsPage = lazy(() => import('../modules/products/ProductsPage'));
const CouponsPage = lazy(() => import('../modules/coupons/CouponsPage'));
const OrdersPage = lazy(() => import('../modules/orders/OrdersPage'));
const SettingsPage = lazy(() => import('../modules/settings/SettingsPage'));
const AuditLogsPage = lazy(() => import('../modules/audit/AuditLogsPage'));

function LoadingPage() {
  return <div className="p-8 text-zinc-500">Loading workspace...</div>;
}

export function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route element={<LoginPage />} path="/login" />
            <Route element={<UnauthorizedPage />} path="/unauthorized" />
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route element={<DashboardPage />} index />
                <Route element={<UsersPage />} path="users" />
                <Route element={<ImmunityPage />} path="immunity-submissions" />
                <Route element={<ReportsPage />} path="reports" />
                <Route element={<AiMonitoringPage />} path="ai-monitoring" />
                <Route element={<ProductsPage />} path="products" />
                <Route element={<CouponsPage />} path="coupons" />
                <Route element={<OrdersPage />} path="orders" />
                <Route element={<SettingsPage />} path="settings" />
                <Route element={<AuditLogsPage />} path="audit-logs" />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Providers>
  );
}
