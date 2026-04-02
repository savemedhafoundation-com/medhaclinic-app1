import { useMemo } from 'react';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';
import { queryClient } from './lib/queryClient';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { UsersPage } from './pages/UsersPage';
import { useUiStore } from './store/useUiStore';
import { buildTheme } from './theme';

function AppRoutes() {
  const colorMode = useUiStore(state => state.colorMode);
  const theme = useMemo(() => buildTheme(colorMode), [colorMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route element={<LoginPage />} path="/login" />

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route element={<DashboardPage />} index />
              <Route element={<UsersPage />} path="users" />
              <Route
                element={
                  <PlaceholderPage
                    description="Transaction review tools will live here. The data hooks and API client are already in place, so this page now has a stable route while the table UI is completed."
                    icon={<SwapHorizOutlinedIcon />}
                    title="Transactions"
                  />
                }
                path="transactions"
              />
              <Route
                element={
                  <PlaceholderPage
                    description="Withdrawal moderation is prepared for this route. This placeholder keeps navigation working until the review queue screen is finished."
                    icon={<PaymentsOutlinedIcon />}
                    title="Withdrawals"
                  />
                }
                path="withdrawals"
              />
              <Route
                element={
                  <PlaceholderPage
                    description="Game room monitoring will appear here. The dashboard summaries already pull the underlying game data, and this route is ready for the full table view."
                    icon={<SportsEsportsOutlinedIcon />}
                    title="Games"
                  />
                }
                path="games"
              />
              <Route
                element={
                  <PlaceholderPage
                    description="System health and admin configuration details will surface here. The dashboard health query is already connected, and this route now stays accessible."
                    icon={<SettingsOutlinedIcon />}
                    title="Settings"
                  />
                }
                path="settings"
              />
              <Route
                element={
                  <PlaceholderPage
                    description="The route exists, but nothing is assigned to it yet."
                    icon={<DashboardOutlinedIcon />}
                    title="Coming Soon"
                  />
                }
                path="coming-soon"
              />
              <Route element={<NotFoundPage />} path="*" />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
