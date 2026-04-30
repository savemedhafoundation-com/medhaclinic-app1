import { Link } from 'react-router-dom';

import { useAuth } from './AuthProvider';

export function UnauthorizedPage() {
  const { signOut } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
      <div className="panel max-w-lg p-8 text-center">
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">Admin access required</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          This Firebase account is signed in but does not have an admin, support, or viewer custom claim.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button className="button-secondary" onClick={() => void signOut()} type="button">
            Sign out
          </button>
          <Link className="button-primary" to="/login">
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
