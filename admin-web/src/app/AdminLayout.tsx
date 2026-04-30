import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../modules/auth/AuthProvider';
import { useThemeStore } from '../store/theme';

const nav = [
  ['Dashboard', '/'],
  ['Users', '/users'],
  ['Immunity', '/immunity-submissions'],
  ['Reports', '/reports'],
  ['AI Monitoring', '/ai-monitoring'],
  ['Products', '/products'],
  ['Coupons', '/coupons'],
  ['Orders', '/orders'],
  ['Settings', '/settings'],
  ['Audit Logs', '/audit-logs'],
] as const;

export function AdminLayout() {
  const { user, role, signOut } = useAuth();
  const { mode, toggle } = useThemeStore();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 lg:block">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinic-600">Medha Clinic</p>
          <h1 className="mt-2 text-xl font-semibold">Admin Panel</h1>
          <p className="mt-1 text-sm text-zinc-500">Clinic operations workspace</p>
        </div>

        <nav className="mt-8 space-y-1">
          {nav.map(([label, path]) => (
            <NavLink
              className={({ isActive }) =>
                [
                  'block rounded-md px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-clinic-50 text-clinic-700 dark:bg-clinic-950 dark:text-clinic-100'
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900',
                ].join(' ')
              }
              end={path === '/'}
              key={path}
              to={path}>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90 md:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.email}</p>
              <p className="text-xs uppercase tracking-wide text-zinc-500">{role}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="button-secondary" onClick={toggle} type="button">
                {mode === 'dark' ? 'Light' : 'Dark'}
              </button>
              <button className="button-secondary" onClick={() => void signOut()} type="button">
                Sign out
              </button>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
            {nav.map(([label, path]) => (
              <NavLink
                className={({ isActive }) =>
                  [
                    'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium',
                    isActive ? 'bg-clinic-600 text-white' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200',
                  ].join(' ')
                }
                end={path === '/'}
                key={path}
                to={path}>
                {label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
